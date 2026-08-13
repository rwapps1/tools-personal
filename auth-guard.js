// auth-guard.js
// -----------------------------------------------------------------------
// Drop this file in the ROOT of any repo you want to lock, then add this
// ONE line near the top of the <head> of every page in that repo:
//
//   <script type="module" src="/auth-guard.js"></script>
//
// (If a page lives in a subfolder, adjust the path so it still points at
// this file, e.g. src="../auth-guard.js")
//
// How it works: the page is hidden the instant it loads. Firebase checks
// whether you're signed in. If not, a sign-in box appears. Once you sign
// in with the one account you created, the real page appears and stays
// signed in on future visits (until you sign out or clear cookies).
// -----------------------------------------------------------------------

import { initializeApp } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-app.js";
import {
  getAuth,
  onAuthStateChanged,
  signInWithEmailAndPassword,
  sendPasswordResetEmail,
  signOut
} from "https://www.gstatic.com/firebasejs/10.12.2/firebase-auth.js";

const firebaseConfig = {
  apiKey: "AIzaSyAYf97LVA839hP-jUpbwQJ7JgftMvdwKLQ",
  authDomain: "rwapps1-hub.firebaseapp.com",
  projectId: "rwapps1-hub",
  storageBucket: "rwapps1-hub.firebasestorage.app",
  messagingSenderId: "605178772138",
  appId: "1:605178772138:web:0508b89695ce7588936ed3"
};

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);

// Hide the real page immediately so nothing flashes on screen before we
// know whether the visitor is signed in.
document.documentElement.style.visibility = "hidden";

const overlay = document.createElement("div");
overlay.id = "auth-guard-overlay";
overlay.innerHTML = `
  <style>
    #auth-guard-overlay {
      position: fixed; inset: 0; z-index: 999999;
      background: #eef3fb;
      display: flex; align-items: center; justify-content: center;
      font-family: -apple-system, "Segoe UI", Roboto, Helvetica, Arial, sans-serif;
      padding: 20px; box-sizing: border-box;
    }
    #auth-guard-overlay .box {
      background: #ffffff; padding: 34px 28px 28px; border-radius: 24px;
      width: 280px; text-align: center;
      box-shadow: 0 8px 26px rgba(30, 60, 110, 0.14);
    }
    #auth-guard-overlay h2 {
      color: #212b3d; margin: 0 0 20px; font-size: 1.15rem; font-weight: 800;
    }
    #auth-guard-overlay input {
      width: 100%; padding: 11px 12px; margin-bottom: 10px; border-radius: 12px;
      border: 1px solid #dce9f9; background: #f7faff; color: #212b3d;
      font-size: 0.95rem; box-sizing: border-box;
    }
    #auth-guard-overlay input:focus {
      outline: 2px solid #4a76ad; outline-offset: 1px; background: #fff;
    }
    #auth-guard-overlay button {
      width: 100%; padding: 11px; border-radius: 12px; border: none;
      background: #4a76ad; color: #fff; font-size: 0.95rem; font-weight: 600;
      cursor: pointer; margin-top: 6px;
    }
    #auth-guard-overlay button:hover { background: #3f6693; }
    #auth-guard-overlay .err {
      color: #b0645a; font-size: 0.85rem; margin-top: 12px; min-height: 1em;
    }
    #auth-guard-overlay .msg {
      color: #2f7a6e; font-size: 0.85rem; margin-top: 12px; min-height: 1em;
    }
    #auth-guard-overlay .forgot {
      display: inline-block; margin-top: 14px; font-size: 0.82rem;
      color: #8593a8; text-decoration: none; cursor: pointer;
    }
    #auth-guard-overlay .forgot:hover { color: #4a76ad; text-decoration: underline; }
  </style>
  <div class="box">
    <h2>Sign in required</h2>
    <input type="email" id="auth-guard-email" placeholder="Email" autocomplete="username" />
    <input type="password" id="auth-guard-pass" placeholder="Password" autocomplete="current-password" />
    <button id="auth-guard-btn">Sign in</button>
    <div class="err" id="auth-guard-err"></div>
    <div class="msg" id="auth-guard-msg"></div>
    <a class="forgot" id="auth-guard-forgot">Forgot password?</a>
  </div>
`;

const signOutButton = document.createElement("div");
signOutButton.id = "auth-guard-signout";
signOutButton.innerHTML = `
  <style>
    #auth-guard-signout {
      position: fixed; bottom: 14px; right: 16px; z-index: 999998;
      font-family: -apple-system, "Segoe UI", Roboto, Helvetica, Arial, sans-serif;
      font-size: 0.78rem; color: #8593a8; opacity: 0.55;
      background: #ffffffcc; padding: 5px 10px; border-radius: 10px;
      cursor: pointer; transition: opacity 0.15s ease;
    }
    #auth-guard-signout:hover { opacity: 1; color: #4a76ad; }
  </style>
  Sign out
`;

function showOverlay() {
  if (!document.body.contains(overlay)) {
    document.body.appendChild(overlay);
  }
  document.documentElement.style.visibility = "visible";
  // Stop the real page from scrolling while locked, so there's nothing
  // underneath for a scroll-related rendering glitch to expose.
  document.documentElement.style.overflow = "hidden";
  document.body.style.overflow = "hidden";

  const emailInput = document.getElementById("auth-guard-email");
  const passInput  = document.getElementById("auth-guard-pass");
  const btn        = document.getElementById("auth-guard-btn");
  const err        = document.getElementById("auth-guard-err");
  const msg        = document.getElementById("auth-guard-msg");
  const forgot     = document.getElementById("auth-guard-forgot");

  function attemptSignIn() {
    err.textContent = "";
    msg.textContent = "";
    signInWithEmailAndPassword(auth, emailInput.value.trim(), passInput.value)
      .catch(() => { err.textContent = "Wrong email or password."; });
  }

  function attemptReset() {
    err.textContent = "";
    msg.textContent = "";
    const email = emailInput.value.trim();
    if (!email) {
      err.textContent = "Enter your email above first, then tap this link.";
      return;
    }
    sendPasswordResetEmail(auth, email)
      .then(() => { msg.textContent = "Reset email sent — check your inbox."; })
      .catch(() => { err.textContent = "Couldn't send reset email. Check the address."; });
  }

  btn.addEventListener("click", attemptSignIn);
  forgot.addEventListener("click", attemptReset);
  passInput.addEventListener("keydown", (e) => {
    if (e.key === "Enter") attemptSignIn();
  });
}

function hideOverlay() {
  if (document.body.contains(overlay)) overlay.remove();
  document.documentElement.style.visibility = "visible";
  document.documentElement.style.overflow = "";
  document.body.style.overflow = "";

  if (!document.body.contains(signOutButton)) {
    document.body.appendChild(signOutButton);
    signOutButton.addEventListener("click", () => signOut(auth));
  }
}

// --- The actual gate: runs every time the page loads, and again whenever
// sign-in state changes ---
onAuthStateChanged(auth, (user) => {
  if (user) {
    hideOverlay();
  } else {
    if (document.body.contains(signOutButton)) signOutButton.remove();
    showOverlay();
  }
});
