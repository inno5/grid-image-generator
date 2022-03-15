import {
  getAuth,
  signInWithPopup,
  TwitterAuthProvider,
  signOut,
  User,
} from "firebase/auth";

import * as firebase from "firebase/app";
import { Analytics, getAnalytics, logEvent } from "firebase/analytics";
import { Env } from "@/env/env";
import { FirebaseApp } from "firebase/app";

const LS_KEY_USER_ACCESS_TOKEN = "LS_KEY_USER_ACCESS_TOKEN";
const LS_KEY_USER_ACCESS_SECRET = "LS_KEY_USER_ACCESS_SECRET";
const LS_KEY_USER_ID = "LS_KEY_USER_ID";

class AuthService {
  firebaseApp?: FirebaseApp;
  analytics?: Analytics;
  userToken = "";
  userSecret = "";
  userId = "";
  userInfo: User | null = null; // uidを使う

  initFirebase(): void {
    this.firebaseApp = firebase.initializeApp(Env.FIREBASE_CONFIG);
    if (Env.NAME == "prod") {
      this.analytics = getAnalytics(this.firebaseApp);
    }
  }

  logPageView(pageTitle: string): void {
    if (Env.NAME == "prod" && this.analytics) {
      logEvent(this.analytics, "page_view", { page_title: pageTitle });
    }
  }

  setTokenSecret(token: string, secret: string, id: string): void {
    this.userToken = token;
    this.userSecret = secret;
    this.userId = id;
    localStorage.setItem(LS_KEY_USER_ACCESS_TOKEN, token);
    localStorage.setItem(LS_KEY_USER_ACCESS_SECRET, secret);
    localStorage.setItem(LS_KEY_USER_ID, id);
  }

  restoreTokenSecret(): void {
    this.userToken = localStorage.getItem(LS_KEY_USER_ACCESS_TOKEN) ?? "";
    this.userSecret = localStorage.getItem(LS_KEY_USER_ACCESS_SECRET) ?? "";
    this.userId = localStorage.getItem(LS_KEY_USER_ID) ?? "";
  }

  clearUserTokenSecret(): void {
    this.userToken = "";
    this.userSecret = "";
    this.userId = "";
    this.userInfo = null;
    localStorage.removeItem(LS_KEY_USER_ACCESS_TOKEN);
    localStorage.removeItem(LS_KEY_USER_ACCESS_SECRET);
    localStorage.removeItem(LS_KEY_USER_ID);
  }

  /**
   * ログアウト
   */
  async logoutTwitter() {
    const auth = getAuth();
    await signOut(auth);
    this.clearUserTokenSecret();
  }

  /**
   * ログイン
   */
  loginTwitter(
    successCallback: () => void,
    errorCallback: (error: any) => void
  ): void {
    const auth = getAuth();
    const provider = new TwitterAuthProvider();
    signInWithPopup(auth, provider)
      .then((result) => {
        const credential = TwitterAuthProvider.credentialFromResult(result);
        const token = credential?.accessToken ?? "";
        const secret = credential?.secret ?? "";
        const user = result.user;
        this.userInfo = user;
        this.setTokenSecret(token, secret, user.providerData[0].uid);
        successCallback();
      })
      .catch((err) => {
        const errorCode = err.code;
        const errorMessage = err.message;
        TwitterAuthProvider.credentialFromError(err);
        console.log("------------------------------------------------");
        console.log("login error");
        console.log("errorCode: ", errorCode);
        console.log("errorMessage: ", errorMessage);
        console.log("------------------------------------------------");
        errorCallback(err);
      });
  }
}

export const authService = new AuthService();
