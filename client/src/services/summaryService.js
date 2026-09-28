import { apiRequest } from "./apiClient";
import { getSpendings } from "./spendingsService";
import { getSubscriptions } from "./subscriptionsService";

export function getSummary() {
  return apiRequest("/summary", {
    method: "GET",
  });
}

export async function getBreakdown({ startDate, endDate }) {
  try {
    const params = new URLSearchParams();
    if (startDate) params.set("start_date", startDate);
    if (endDate) params.set("end_date", endDate);
    const qs = params.toString();
    return await apiRequest(`/summary/breakdown${qs ? `?${qs}` : ""}`, {
      method: "GET",
    });
  } catch {
    const [spendingsRes, subscriptionsRes] = await Promise.all([
      getSpendings({
        start_date: startDate,
        end_date: endDate,
        limit: 100,
        page: 1,
      }),
      getSubscriptions({
        limit: 100,
        page: 1,
      }),
    ]);

    return {
      status: "success",
      data: {
        spendings: spendingsRes?.data?.spendings || [],
        subscriptions: subscriptionsRes?.data?.subscriptions || [],
      },
    };
  }
}
