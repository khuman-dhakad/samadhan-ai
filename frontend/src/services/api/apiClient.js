const API_BASE_URL = (import.meta.env.VITE_API_URL || "").replace(/\/$/, "");
const TOKEN_KEY = "samadhan_access_token";
const USER_KEY = "samadhan_current_user";

export function resolveApiUrl(resourceUrl) {
    if (!resourceUrl || !resourceUrl.startsWith("/")) return resourceUrl;
    const baseUrl = API_BASE_URL || window.location.origin;
    return new URL(resourceUrl, baseUrl).toString();
}

export function getAccessToken() {
    return localStorage.getItem(TOKEN_KEY);
}

export function setAccessToken(token) {
    if (token) {
        localStorage.setItem(TOKEN_KEY, token);
    } else {
        localStorage.removeItem(TOKEN_KEY);
        localStorage.removeItem(USER_KEY);
    }
}

export function setAuthSession(token, user) {
    setAccessToken(token);
    localStorage.setItem(USER_KEY, JSON.stringify(user));
}

export function getStoredUser() {
    try {
        const user = localStorage.getItem(USER_KEY);
        return user ? JSON.parse(user) : null;
    } catch {
        localStorage.removeItem(USER_KEY);
        return null;
    }
}

export async function apiRequest(path, options = {}) {
    const headers = new Headers(options.headers || {});
    const token = getAccessToken();
    if (token) headers.set("Authorization", `Bearer ${token}`);
    if (options.body && !(options.body instanceof FormData) && !headers.has("Content-Type")) {
        headers.set("Content-Type", "application/json");
    }

    let response;
    try {
        response = await fetch(`${API_BASE_URL}${path}`, { ...options, headers });
    } catch (error) {
        if (error.name === "AbortError") throw error;
        throw new Error("Cannot reach the Samadhan API. Start the backend and PostgreSQL, then try again.", {
            cause: error,
        });
    }
    const responseText = await response.text();
    let payload = null;
    if (responseText) {
        try {
            payload = JSON.parse(responseText);
        } catch {
            throw new Error(`API returned an invalid response (HTTP ${response.status})`);
        }
    }
    if (!response.ok) {
        const error = new Error(
            payload?.error || payload?.message || `Request failed (HTTP ${response.status})`
        );
        error.status = response.status;
        throw error;
    }
    return payload;
}
