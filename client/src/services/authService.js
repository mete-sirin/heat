import { apiRequest } from "./apiClient";

export function signup(payload) {
  return apiRequest("/auth/signup", {
    method: "POST",
    body: payload,
  });
}

export function login(payload) {
  return apiRequest("/auth/login", {
    method: "POST",
    body: payload,
  });
}

export function signout() {
  return apiRequest("/auth/signout", {
    method: "POST",
  });
}

export function getCurrentUser() {
  return apiRequest("/auth/me", {
    method: "GET",
  });
}

export function updateUser(payload) {
  return apiRequest("/auth/updateuser", {
    method: "PATCH",
    body: payload,
  });
}

export function changePassword(payload) {
  return apiRequest("/auth/changepassword", {
    method: "POST",
    body: payload,
  });
}

export function verifyEmail(token) {
  return apiRequest("/auth/verifymail", {
    method: "GET",
    params: { token },
  });
}

export function resendVerificationEmail(email) {
  return apiRequest("/auth/resendmail", {
    method: "POST",
    body: { email },
  });
}

export function requestPasswordReset(email) {
  return apiRequest("/auth/resetpassword", {
    method: "POST",
    body: { email },
  });
}

export function resetPasswordWithToken({ token, password, passwordConfirm }) {
  return apiRequest("/auth/resetpassword", {
    method: "PATCH",
    params: { token },
    body: { password, passwordConfirm },
  });
}

export function deleteAccount(payload) {
  return apiRequest("/auth/me", {
    method: "DELETE",
    body: payload,
  });
}
