import { apiRequest } from "./apiClient";

export function getSubscriptions(params = {}) {
  return apiRequest("/subscriptions", {
    method: "GET",
    params,
  });
}

export function createSubscription(payload) {
  return apiRequest("/subscriptions", {
    method: "POST",
    body: payload,
  });
}

export function updateSubscription({ id, payload }) {
  return apiRequest(`/subscriptions/${id}`, {
    method: "PATCH",
    body: payload,
  });
}

export function deleteSubscription(id) {
  return apiRequest(`/subscriptions/${id}`, {
    method: "DELETE",
  });
}
