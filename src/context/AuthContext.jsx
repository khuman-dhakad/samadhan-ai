import { createContext, useState, useEffect, useCallback, useMemo } from "react";
import {
  listenForAuthChanges,
  signInWithGoogle,
  logoutUser,
  checkUserIsAdmin,
} from "../services/firebase/authService";
import { isFirebaseConfigured } from "../services/firebase/firebaseConfig";

const AuthContext = createContext({
  user: null,
  authLoaded: false,
  isAdmin: false,
  hasAdminClaim: false,
  isSigningIn: false,
  authError: null,
  isFirebaseConfigured: false,
  loginWithGoogle: async () => {},
  logout: async () => {},
  refreshClaims: async () => {},
  clearAuthError: () => {},
});

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [authLoaded, setAuthLoaded] = useState(() => !isFirebaseConfigured);
  const [hasAdminClaim, setHasAdminClaim] = useState(false);
  const [isSigningIn, setIsSigningIn] = useState(false);
  const [authError, setAuthError] = useState(null);

  // Configured admin emails list for dev convenience / fallback display
  const adminEmails = useMemo(() => {
    const raw = import.meta.env.VITE_ADMIN_EMAILS || "";
    return raw
      .split(",")
      .map((e) => e.trim().toLowerCase())
      .filter(Boolean);
  }, []);

  // Evaluates admin status: verified custom claim takes priority;
  // if no custom claim, check if user email is explicitly listed in VITE_ADMIN_EMAILS (dev simulation)
  const isAdmin = useMemo(() => {
    if (!user) return false;
    if (hasAdminClaim) return true;
    if (adminEmails.length > 0 && user.email) {
      return adminEmails.includes(user.email.toLowerCase());
    }
    return false;
  }, [user, hasAdminClaim, adminEmails]);

  const verifyClaims = useCallback(async (currentUser, forceRefresh = false) => {
    if (!currentUser) {
      setHasAdminClaim(false);
      return;
    }
    const admin = await checkUserIsAdmin(currentUser, forceRefresh);
    setHasAdminClaim(admin);
  }, []);

  useEffect(() => {
    if (!isFirebaseConfigured) return;

    const unsubscribe = listenForAuthChanges(async (currentUser) => {
      setUser(currentUser);
      if (currentUser) {
        await verifyClaims(currentUser);
      } else {
        setHasAdminClaim(false);
      }
      setAuthLoaded(true);
    });

    return () => unsubscribe();
  }, [verifyClaims]);

  const loginWithGoogle = useCallback(async () => {
    setIsSigningIn(true);
    setAuthError(null);
    try {
      const loggedUser = await signInWithGoogle();
      if (loggedUser) {
        setUser(loggedUser);
        await verifyClaims(loggedUser, true);
      }
      return loggedUser;
    } catch (err) {
      const message = err?.message || "Google sign-in failed";
      setAuthError(message);
      throw err;
    } finally {
      setIsSigningIn(false);
    }
  }, [verifyClaims]);

  const logout = useCallback(async () => {
    setAuthError(null);
    try {
      await logoutUser();
      setUser(null);
      setHasAdminClaim(false);
    } catch (err) {
      setAuthError(err?.message || "Failed to log out");
      throw err;
    }
  }, []);

  const refreshClaims = useCallback(async () => {
    if (user) {
      await verifyClaims(user, true);
    }
  }, [user, verifyClaims]);

  const clearAuthError = useCallback(() => {
    setAuthError(null);
  }, []);

  const value = useMemo(
    () => ({
      user,
      authLoaded,
      isAdmin,
      hasAdminClaim,
      isSigningIn,
      authError,
      isFirebaseConfigured,
      loginWithGoogle,
      logout,
      refreshClaims,
      clearAuthError,
    }),
    [
      user,
      authLoaded,
      isAdmin,
      hasAdminClaim,
      isSigningIn,
      authError,
      loginWithGoogle,
      logout,
      refreshClaims,
      clearAuthError,
    ]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export default AuthContext;
