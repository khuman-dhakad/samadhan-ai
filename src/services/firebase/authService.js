import {
  GoogleAuthProvider,
  signInWithPopup,
  signOut,
  onAuthStateChanged,
} from "firebase/auth";
import { auth } from "./firebaseConfig";

const googleProvider = new GoogleAuthProvider();

export const signInWithGoogle = async () => {
  try {
    const result = await signInWithPopup(auth, googleProvider);
    return result.user;
  } catch (error) {
    // Avoid alarming console errors if user simply closes the popup
    if (error.code === "auth/popup-closed-by-user" || error.code === "auth/cancelled-popup-request") {
      console.warn("Sign-in popup closed before completion");
    } else {
      console.error("Firebase Auth Sign-In Error:", error);
    }
    return null;
  }
};

export const logoutUser = async () => {
  try {
    await signOut(auth);
  } catch (error) {
    console.error("Firebase Auth Logout Error:", error);
    throw error;
  }
};

export const listenForAuthChanges = (callback) => {
  return onAuthStateChanged(auth, callback);
};

export { auth };