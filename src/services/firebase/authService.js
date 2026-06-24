import {
  getAuth,
  GoogleAuthProvider,
  signInWithPopup,
  signOut,
} from "firebase/auth";

import { db } from "./firebaseConfig";

const auth = getAuth();

const googleProvider = new GoogleAuthProvider();

export const signInWithGoogle = async () => {
  try {
    const result = await signInWithPopup(
      auth,
      googleProvider
    );

    return result.user;
  } catch (error) {
    console.error(error);
    return null;
  }
};

export const logoutUser = async () => {
  try {
    await signOut(auth);
  } catch (error) {
    console.error(error);
  }
};

export { auth };