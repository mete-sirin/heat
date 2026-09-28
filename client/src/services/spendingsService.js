import { apiRequest } from "./apiClient";

export function getSpendings(params = {}) {
  return apiRequest("/spendings", {
    method: "GET",
    params,
  });
}

export function createSpending(payload) {
  return apiRequest("/spendings", {
    method: "POST",
    body: payload,
  });
}

export function updateSpending({ id, payload }) {
  return apiRequest(`/spendings/${id}`, {
    method: "PATCH",
    body: payload,
  });
}

export function deleteSpending(id) {
  return apiRequest(`/spendings/${id}`, {
    method: "DELETE",
  });
}
