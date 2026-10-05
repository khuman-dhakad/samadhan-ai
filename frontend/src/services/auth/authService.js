import { apiRequest, setAuthSession, setAccessToken } from "../api/apiClient";

export async function loginWithEmail(email, password) {
    const result = await apiRequest("/api/auth/login", {
        method: "POST",
        body: JSON.stringify({ email, password }),
    });
    setAuthSession(result.token, result.user);
    return result.user;
}

export async function registerAccount(displayName, email, password) {
    const result = await apiRequest("/api/auth/register", {
        method: "POST",
        body: JSON.stringify({ displayName, email, password }),
    });
    setAuthSession(result.token, result.user);
    return result.user;
}

export async function getCurrentUser() {
    return apiRequest("/api/auth/me");
}

export function logoutUser() {
    setAccessToken(null);
}
