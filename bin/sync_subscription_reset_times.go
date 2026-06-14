package main

import (
	"flag"
	"fmt"
	"os"

	"github.com/QuantumNous/new-api/model"
)

func main() {
	userId := flag.Int("user-id", 0, "sync a single user's active subscriptions")
	planId := flag.Int("plan-id", 0, "sync active subscriptions under one plan")
	flag.Parse()

	if err := model.InitDB(); err != nil {
		fmt.Fprintf(os.Stderr, "init database failed: %v\n", err)
		os.Exit(1)
	}
	if err := model.InitLogDB(); err != nil {
		fmt.Fprintf(os.Stderr, "init log database failed: %v\n", err)
		os.Exit(1)
	}
	defer func() {
		if err := model.CloseDB(); err != nil {
			fmt.Fprintf(os.Stderr, "close database failed: %v\n", err)
		}
	}()

	now := model.GetDBTimestamp()
	userIds := make([]int, 0)
	query := model.DB.Model(&model.UserSubscription{}).
		Where("status = ? AND end_time > ?", "active", now)
	if *userId > 0 {
		query = query.Where("user_id = ?", *userId)
	}
	if *planId > 0 {
		query = query.Where("plan_id = ?", *planId)
	}
	if err := query.Distinct("user_id").Pluck("user_id", &userIds).Error; err != nil {
		fmt.Fprintf(os.Stderr, "list users failed: %v\n", err)
		os.Exit(1)
	}

	for _, id := range userIds {
		if err := model.SyncActiveUserSubscriptionResetTimesForUser(id); err != nil {
			fmt.Fprintf(os.Stderr, "sync user %d failed: %v\n", id, err)
			os.Exit(1)
		}
	}

	fmt.Printf("synced subscription reset times for %d user(s)\n", len(userIds))
}
