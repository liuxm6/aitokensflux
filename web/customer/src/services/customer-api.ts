import { apiRequest, buildQueryFromValues } from "./api";
import type {
  CustomerLogStats,
  CustomerStatus,
  ATFSwitchConnectData,
  CustomerUser,
  PageData,
  SelfSubscriptionData,
  SubscriptionPaymentData,
  SubscriptionPaymentResponse,
  SubscriptionPlanRecord,
  TopupInfo,
  TopupPaymentData,
  TopupPaymentOption,
  TopupPaymentProvider,
  TopupPaymentResponse,
  TopupRecord,
  UsageLog,
} from "../types";

export async function fetchCustomerSelf() {
  return apiRequest<CustomerUser>("/api/user/self", { method: "GET" });
}

export async function fetchCustomerStatus() {
  return apiRequest<CustomerStatus>("/api/status", { method: "GET" });
}

export async function connectATFSwitch(
  app: string,
  client = "atf-switch",
  identity?: string,
) {
  return apiRequest<ATFSwitchConnectData>(
    `/api/atf-switch/connect${buildQueryFromValues({ app, client, identity })}`,
    { method: "GET" },
  );
}

export async function fetchUserLogStats(
  startTimestamp?: number,
  endTimestamp?: number,
  filters?: {
    type?: number;
    modelName?: string;
    tokenName?: string;
    group?: string;
  },
) {
  return apiRequest<CustomerLogStats>(
    `/api/log/self/stat${buildQueryFromValues({
      type: filters?.type ?? 2,
      start_timestamp: startTimestamp,
      end_timestamp: endTimestamp,
      model_name: filters?.modelName,
      token_name: filters?.tokenName,
      group: filters?.group,
    })}`,
    { method: "GET" },
  );
}

export async function fetchUserLogs(params: {
  page?: number;
  pageSize?: number;
  type?: number;
  startTimestamp?: number;
  endTimestamp?: number;
  modelName?: string;
  tokenName?: string;
  group?: string;
  requestId?: string;
  upstreamRequestId?: string;
}) {
  return apiRequest<PageData<UsageLog>>(
    `/api/log/self${buildQueryFromValues({
      p: params.page ?? 1,
      page_size: params.pageSize ?? 20,
      type: params.type,
      start_timestamp: params.startTimestamp,
      end_timestamp: params.endTimestamp,
      model_name: params.modelName,
      token_name: params.tokenName,
      group: params.group,
      request_id: params.requestId,
      upstream_request_id: params.upstreamRequestId,
    })}`,
    { method: "GET" },
  );
}

export async function fetchUserTopups(page = 1, pageSize = 20) {
  return apiRequest<PageData<TopupRecord>>(
    `/api/user/topup/self${buildQueryFromValues({
      p: page,
      page_size: pageSize,
    })}`,
    { method: "GET" },
  );
}

export async function fetchTopupInfo() {
  return apiRequest<TopupInfo>("/api/user/topup/info", { method: "GET" });
}

export async function redeemTopupCode(key: string) {
  return apiRequest<number>("/api/user/topup", {
    method: "POST",
    body: JSON.stringify({ key }),
  });
}

export async function calculateTopupAmount(
  amount: number,
  provider: TopupPaymentProvider,
) {
  const endpoint =
    provider === "stripe"
      ? "/api/user/stripe/amount"
      : provider === "waffo"
        ? "/api/user/waffo/amount"
        : provider === "waffoPancake"
          ? "/api/user/waffo-pancake/amount"
          : "/api/user/amount";
  return apiRequest<string | number>(endpoint, {
    method: "POST",
    body: JSON.stringify({ amount }),
  });
}

export async function requestTopupPayment(
  amount: number,
  option: TopupPaymentOption,
) {
  if (option.provider === "stripe") {
    return apiRequest<TopupPaymentData>("/api/user/stripe/pay", {
      method: "POST",
      body: JSON.stringify({ amount, payment_method: "stripe" }),
    }) as Promise<TopupPaymentResponse>;
  }
  if (option.provider === "waffo") {
    const body: Record<string, unknown> = { amount };
    if (option.waffoIndex !== undefined)
      body.pay_method_index = option.waffoIndex;
    return apiRequest<TopupPaymentData>("/api/user/waffo/pay", {
      method: "POST",
      body: JSON.stringify(body),
    }) as Promise<TopupPaymentResponse>;
  }
  if (option.provider === "waffoPancake") {
    return apiRequest<TopupPaymentData>("/api/user/waffo-pancake/pay", {
      method: "POST",
      body: JSON.stringify({ amount }),
    }) as Promise<TopupPaymentResponse>;
  }
  return apiRequest<TopupPaymentData>("/api/user/pay", {
    method: "POST",
    body: JSON.stringify({
      amount,
      payment_method: option.paymentMethod || option.id,
    }),
  }) as Promise<TopupPaymentResponse>;
}

export async function requestCreemTopupPayment(productId: string) {
  return apiRequest<TopupPaymentData>("/api/user/creem/pay", {
    method: "POST",
    body: JSON.stringify({
      product_id: productId,
      payment_method: "creem",
    }),
  }) as Promise<TopupPaymentResponse>;
}

export async function fetchPublicPlans() {
  return apiRequest<SubscriptionPlanRecord[]>("/api/subscription/plans", {
    method: "GET",
  });
}

export async function fetchSelfSubscription() {
  return apiRequest<SelfSubscriptionData>("/api/subscription/self", {
    method: "GET",
  });
}

export async function buySubscriptionWithBalance(planId: number) {
  return apiRequest<null>("/api/subscription/balance/pay", {
    method: "POST",
    body: JSON.stringify({ plan_id: planId }),
  });
}

export async function buySubscriptionWithStripe(planId: number) {
  return apiRequest<SubscriptionPaymentData>("/api/subscription/stripe/pay", {
    method: "POST",
    body: JSON.stringify({ plan_id: planId }),
  }) as Promise<SubscriptionPaymentResponse>;
}

export async function buySubscriptionWithCreem(planId: number) {
  return apiRequest<SubscriptionPaymentData>("/api/subscription/creem/pay", {
    method: "POST",
    body: JSON.stringify({ plan_id: planId }),
  }) as Promise<SubscriptionPaymentResponse>;
}

export async function buySubscriptionWithWaffoPancake(planId: number) {
  return apiRequest<SubscriptionPaymentData>(
    "/api/subscription/waffo-pancake/pay",
    {
      method: "POST",
      body: JSON.stringify({ plan_id: planId }),
    },
  ) as Promise<SubscriptionPaymentResponse>;
}

export async function buySubscriptionWithEpay(
  planId: number,
  paymentMethod: string,
) {
  return apiRequest<SubscriptionPaymentData>("/api/subscription/epay/pay", {
    method: "POST",
    body: JSON.stringify({ plan_id: planId, payment_method: paymentMethod }),
  }) as Promise<SubscriptionPaymentResponse>;
}
