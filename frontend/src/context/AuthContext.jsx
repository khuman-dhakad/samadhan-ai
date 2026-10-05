import { createContext, useState, useEffect, useCallback, useMemo } from "react";
import {
    getCurrentUser,
    loginWithEmail,
    logoutUser,
    registerAccount,
} from "../services/auth/authService";
import {
    getAccessToken,
    getStoredUser,
    setAccessToken,
} from "../services/api/apiClient";
import AuthDialog from "../components/AuthDialog/AuthDialog";

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
    const [user, setUser] = useState(getStoredUser);
    const [authLoaded, setAuthLoaded] = useState(() => !getAccessToken());
    const [isSigningIn, setIsSigningIn] = useState(false);
    const [authError, setAuthError] = useState(null);
    const [isAuthDialogOpen, setIsAuthDialogOpen] = useState(false);

    useEffect(() => {
        if (!getAccessToken()) {
            return;
        }
        let active = true;
        getCurrentUser()
            .then((currentUser) => {
                if (active) setUser(currentUser);
            })
            .catch((error) => {
                if (error.status === 401) {
                    setAccessToken(null);
                    if (active) setUser(null);
                } else {
                    console.error("Unable to refresh the saved session:", error);
                }
            })
            .finally(() => {
                if (active) setAuthLoaded(true);
            });
        return () => {
            active = false;
        };
    }, []);

    const openAuthDialog = useCallback(() => {
        setAuthError(null);
        setIsAuthDialogOpen(true);
    }, []);

    const closeAuthDialog = useCallback(() => {
        setIsAuthDialogOpen(false);
        setAuthError(null);
    }, []);

    const login = useCallback(async (email, password) => {
        setIsSigningIn(true);
        setAuthError(null);
        try {
            const signedInUser = await loginWithEmail(email, password);
            setUser(signedInUser);
            setIsAuthDialogOpen(false);
            return signedInUser;
        } catch (error) {
            setAuthError(error.message || "Sign in failed");
            throw error;
        } finally {
            setIsSigningIn(false);
        }
    }, []);

    const register = useCallback(async (displayName, email, password) => {
        setIsSigningIn(true);
        setAuthError(null);
        try {
            const registeredUser = await registerAccount(displayName, email, password);
            setUser(registeredUser);
            setIsAuthDialogOpen(false);
            return registeredUser;
        } catch (error) {
            setAuthError(error.message || "Account registration failed");
            throw error;
        } finally {
            setIsSigningIn(false);
        }
    }, []);

    const logout = useCallback(() => {
        logoutUser();
        setUser(null);
    }, []);

    const refreshUser = useCallback(async () => {
        const currentUser = await getCurrentUser();
        setUser(currentUser);
        return currentUser;
    }, []);

    const value = useMemo(() => ({
        user,
        authLoaded,
        isAdmin: user?.role === "ADMIN",
        hasAdminRole: user?.role === "ADMIN",
        isSigningIn,
        authError,
        isAuthDialogOpen,
        openAuthDialog,
        closeAuthDialog,
        login,
        register,
        logout,
        refreshUser,
    }), [
        user,
        authLoaded,
        isSigningIn,
        authError,
        isAuthDialogOpen,
        openAuthDialog,
        closeAuthDialog,
        login,
        register,
        logout,
        refreshUser,
    ]);

    return (
        <AuthContext.Provider value={value}>
            {children}
            <AuthDialog />
        </AuthContext.Provider>
    );
}

export default AuthContext;
