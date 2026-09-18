import {
  GoogleAuthProvider,
  signInWithPopup,
  signOut,
  onAuthStateChanged,
} from "firebase/auth";
import { auth } from "./firebaseConfig";

import { isFirebaseConfigured } from "./firebaseConfig";

const googleProvider = new GoogleAuthProvider();
googleProvider.setCustomParameters({ prompt: "select_account" });

/**
 * Checks whether a given Firebase user has the admin custom claim.
 * @param {import("firebase/auth").User | null} user
 * @param {boolean} forceRefresh
 * @returns {Promise<boolean>}
 */
export const checkUserIsAdmin = async (user, forceRefresh = false) => {
  if (!user) return false;
  try {
    const idTokenResult = await user.getIdTokenResult(forceRefresh);
    return Boolean(idTokenResult?.claims?.admin);
  } catch (err) {
    console.error("Error inspecting ID token claims:", err);
    return false;
  }
};

/**
 * Formats Firebase auth error codes into friendly user messages.
 */
export const formatAuthErrorMessage = (error) => {
  if (!error) return "Authentication failed. Please try again.";
  switch (error.code) {
    case "auth/popup-blocked":
      return "Sign-in popup was blocked by your browser. Please allow popups for this site and try again.";
    case "auth/popup-closed-by-user":
    case "auth/cancelled-popup-request":
      return "Sign-in was cancelled before completion.";
    case "auth/unauthorized-domain":
      return "This domain is not authorized in Firebase Auth. Add it to Authorized Domains in the Firebase Console.";
    case "auth/network-request-failed":
      return "Network connection error. Please check your internet connection.";
    default:
      return error.message || "An error occurred during authentication.";
  }
};

export const signInWithGoogle = async () => {
  if (!isFirebaseConfigured) {
    throw new Error(
      "Firebase Authentication is not configured. Please supply valid VITE_FIREBASE_* variables in your environment."
    );
  }

  try {
    const result = await signInWithPopup(auth, googleProvider);
    return result.user;
  } catch (error) {
    if (
      error.code === "auth/popup-closed-by-user" ||
      error.code === "auth/cancelled-popup-request"
    ) {
      console.warn("Sign-in popup closed before completion");
      return null;
    }
    console.error("Firebase Auth Sign-In Error:", error);
    throw new Error(formatAuthErrorMessage(error), { cause: error });
  }
};

export const logoutUser = async () => {
  if (!isFirebaseConfigured) return;
  try {
    await signOut(auth);
  } catch (error) {
    console.error("Firebase Auth Logout Error:", error);
    throw error;
  }
};

export const listenForAuthChanges = (callback) => {
  if (!isFirebaseConfigured) {
    callback(null);
    return () => {};
  }
  return onAuthStateChanged(auth, callback);
};

export { auth };