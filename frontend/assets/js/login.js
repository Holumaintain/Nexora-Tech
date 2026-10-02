/* =========================================================
   NEXORA TECHNOLOGIES
   LOGIN CONTROLLER
   =========================================================

   Handles:
   - Google login placeholder
   - Email login navigation
   - SAML SSO placeholder
   - Passkey availability check

   Email/password authentication is handled by
   email-login.js on the dedicated email login page.
   ========================================================= */

document.addEventListener("DOMContentLoaded", () => {
  /* =========================================================
     GET LOGIN BUTTONS
     ========================================================= */

  const googleButton = document.getElementById("googleLoginButton");
  const emailButton = document.getElementById("emailLoginButton");
  const samlButton = document.getElementById("samlLoginButton");
  const passkeyButton = document.getElementById("passkeyLoginButton");

  /* =========================================================
     GOOGLE LOGIN
     ========================================================= */

  if (googleButton) {
    googleButton.addEventListener("click", () => {
      console.log("Nexora: Google login selected.");

      alert(
        "Google authentication is not connected yet. Please continue with email."
      );
    });
  }

  /* =========================================================
     EMAIL LOGIN
     ========================================================= */

  if (emailButton) {
    emailButton.addEventListener("click", () => {
      console.log("Nexora: Email login selected.");

      window.location.href = "email-login.html";
    });
  }

  /* =========================================================
     SAML SSO
     ========================================================= */

  if (samlButton) {
    samlButton.addEventListener("click", () => {
      console.log("Nexora: SAML SSO selected.");

      alert(
        "SAML SSO is not connected yet. Please continue with email."
      );
    });
  }

  /* =========================================================
     PASSKEY LOGIN
     ========================================================= */

  if (passkeyButton) {
    passkeyButton.addEventListener("click", async () => {
      console.log("Nexora: Passkey login selected.");

      /* -------------------------------------------------------
         CHECK BROWSER SUPPORT
         ------------------------------------------------------- */

      if (
        !window.PublicKeyCredential ||
        !navigator.credentials
      ) {
        alert(
          "Passkey authentication is not supported by this browser."
        );

        return;
      }

      /*
       * Real WebAuthn authentication requires:
       *
       * 1. Backend-generated authentication options
       * 2. navigator.credentials.get()
       * 3. Credential verification on the backend
       *
       * That backend flow has not been implemented yet.
       */

      alert(
        "Passkey authentication is not connected yet. Please continue with email."
      );
    });
  }
});