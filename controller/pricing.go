package controller

import (
	"net/http"
	"sync"
	"time"

	"github.com/QuantumNous/new-api/common"
	"github.com/QuantumNous/new-api/model"
	"github.com/QuantumNous/new-api/service"
	"github.com/QuantumNous/new-api/setting/ratio_setting"

	"github.com/gin-gonic/gin"
)

const (
	pricingResponseVersion = "3f4429f88ed1b7a9c29cc43c9841de6b"
	publicPricingCacheTTL  = time.Minute
)

type publicPricingResponse struct {
	Success        bool                  `json:"success"`
	Data           []publicPricingModel  `json:"data"`
	Vendors        []model.PricingVendor `json:"vendors"`
	GroupRatio     map[string]float64    `json:"group_ratio"`
	PricingVersion string                `json:"pricing_version"`
}

type publicPricingModel struct {
	ModelName       string   `json:"model_name"`
	VendorID        int      `json:"vendor_id,omitempty"`
	QuotaType       int      `json:"quota_type"`
	ModelRatio      float64  `json:"model_ratio"`
	ModelPrice      float64  `json:"model_price"`
	OwnerBy         string   `json:"owner_by,omitempty"`
	CompletionRatio float64  `json:"completion_ratio"`
	CacheRatio      *float64 `json:"cache_ratio,omitempty"`
	EnableGroups    []string `json:"enable_groups,omitempty"`
}

var publicPricingCache = struct {
	sync.RWMutex
	body      []byte
	expiresAt time.Time
}{}

func filterPricingByUsableGroups(pricing []model.Pricing, usableGroup map[string]string) []model.Pricing {
	if len(pricing) == 0 {
		return pricing
	}
	if len(usableGroup) == 0 {
		return []model.Pricing{}
	}

	filtered := make([]model.Pricing, 0, len(pricing))
	for _, item := range pricing {
		if common.StringsContains(item.EnableGroup, "all") {
			filtered = append(filtered, item)
			continue
		}
		for _, group := range item.EnableGroup {
			if _, ok := usableGroup[group]; ok {
				filtered = append(filtered, item)
				break
			}
		}
	}
	return filtered
}

func GetPricing(c *gin.Context) {
	pricing := model.GetPricing()
	userId, exists := c.Get("id")
	usableGroup := map[string]string{}
	groupRatio := map[string]float64{}
	for s, f := range ratio_setting.GetGroupRatioCopy() {
		groupRatio[s] = f
	}
	var group string
	if exists {
		user, err := model.GetUserCache(userId.(int))
		if err == nil {
			group = user.Group
			for g := range groupRatio {
				ratio, ok := ratio_setting.GetGroupGroupRatio(group, g)
				if ok {
					groupRatio[g] = ratio
				}
			}
		}
	}

	usableGroup = service.GetUserUsableGroups(group)
	pricing = filterPricingByUsableGroups(pricing, usableGroup)
	// check groupRatio contains usableGroup
	for group := range ratio_setting.GetGroupRatioCopy() {
		if _, ok := usableGroup[group]; !ok {
			delete(groupRatio, group)
		}
	}

	c.JSON(200, gin.H{
		"success":            true,
		"data":               pricing,
		"vendors":            model.GetVendors(),
		"group_ratio":        groupRatio,
		"usable_group":       usableGroup,
		"supported_endpoint": model.GetSupportedEndpointMap(),
		"auto_groups":        service.GetUserAutoGroup(group),
		"pricing_version":    pricingResponseVersion,
	})
}

func GetPublicPricing(c *gin.Context) {
	now := time.Now()
	if body, ok := getCachedPublicPricing(now); ok {
		c.Header("X-Cache", "HIT")
		c.Data(http.StatusOK, "application/json; charset=utf-8", body)
		return
	}

	body, err := common.Marshal(publicPricingResponse{
		Success:        true,
		Data:           toPublicPricingModels(model.GetPricing()),
		Vendors:        model.GetVendors(),
		GroupRatio:     ratio_setting.GetGroupRatioCopy(),
		PricingVersion: pricingResponseVersion,
	})
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{
			"success": false,
			"message": err.Error(),
		})
		return
	}

	publicPricingCache.Lock()
	publicPricingCache.body = body
	publicPricingCache.expiresAt = now.Add(publicPricingCacheTTL)
	publicPricingCache.Unlock()

	c.Header("X-Cache", "MISS")
	c.Data(http.StatusOK, "application/json; charset=utf-8", body)
}

func getCachedPublicPricing(now time.Time) ([]byte, bool) {
	publicPricingCache.RLock()
	defer publicPricingCache.RUnlock()

	if len(publicPricingCache.body) == 0 || !now.Before(publicPricingCache.expiresAt) {
		return nil, false
	}
	return publicPricingCache.body, true
}

func toPublicPricingModels(pricing []model.Pricing) []publicPricingModel {
	items := make([]publicPricingModel, 0, len(pricing))
	for _, item := range pricing {
		items = append(items, publicPricingModel{
			ModelName:       item.ModelName,
			VendorID:        item.VendorID,
			QuotaType:       item.QuotaType,
			ModelRatio:      item.ModelRatio,
			ModelPrice:      item.ModelPrice,
			OwnerBy:         item.OwnerBy,
			CompletionRatio: item.CompletionRatio,
			CacheRatio:      item.CacheRatio,
			EnableGroups:    item.EnableGroup,
		})
	}
	return items
}

func ResetModelRatio(c *gin.Context) {
	defaultStr := ratio_setting.DefaultModelRatio2JSONString()
	err := model.UpdateOption("ModelRatio", defaultStr)
	if err != nil {
		c.JSON(200, gin.H{
			"success": false,
			"message": err.Error(),
		})
		return
	}
	err = ratio_setting.UpdateModelRatioByJSONString(defaultStr)
	if err != nil {
		c.JSON(200, gin.H{
			"success": false,
			"message": err.Error(),
		})
		return
	}
	c.JSON(200, gin.H{
		"success": true,
		"message": "重置模型倍率成功",
	})
}
