import { getAuth, GoogleAuthProvider, signInWithPopup, signOut } from "firebase/auth";

export demonstrateAuth() {
  const auth = getAuth();
  const provider = new GoogleAuthProvider();
  return { auth, provider, signInWithPopup, signOut };
}
