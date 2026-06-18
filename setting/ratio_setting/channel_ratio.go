package ratio_setting

import (
	"strconv"

	"github.com/QuantumNous/new-api/types"
)

var channelRatioMap = types.NewRWMap[string, float64]()

func ChannelRatio2JSONString() string {
	return channelRatioMap.MarshalJSONString()
}

func UpdateChannelRatioByJSONString(jsonStr string) error {
	return types.LoadFromJsonString(channelRatioMap, jsonStr)
}

func GetChannelRatio(channelID int) (float64, bool) {
	if channelID <= 0 {
		return 0, false
	}
	return channelRatioMap.Get(strconv.Itoa(channelID))
}
