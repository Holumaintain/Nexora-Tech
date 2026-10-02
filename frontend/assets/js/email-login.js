/* =========================================================
   NEXORA TECHNOLOGIES
   EMAIL LOGIN CONTROLLER
   =========================================================

   Handles:
   - Email/password validation
   - POST /api/auth/login
   - JWT storage
   - Authenticated user retrieval
   - Login errors
   - Loading state
   ========================================================= */

document.addEventListener("DOMContentLoaded", () => {
  const form = document.getElementById("emailLoginForm");

  if (!form) {
    return;
  }

  const emailInput = document.getElementById("email");
  const passwordInput = document.getElementById("password");
  const rememberMe = document.getElementById("rememberMe");

  const submitButton = document.getElementById("emailSubmitButton");
  const submitText = form.querySelector(".login-button-text");

  /* =========================================================
     VALIDATION HELPERS
     ========================================================= */

  function isValidEmail(email) {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
  }

  function showError(message) {
    /*
     * Keep this simple for now because the existing
     * login page does not currently contain a dedicated
     * error-message element.
     */

    alert(message);
  }

  /* =========================================================
     SUBMIT LOGIN FORM
     ========================================================= */

  form.addEventListener("submit", async (event) => {
    event.preventDefault();

    const email = emailInput?.value.trim() || "";
    const password = passwordInput?.value || "";
    const shouldRemember = rememberMe?.checked || false;

    /* -------------------------------------------------------
       VALIDATE EMAIL
       ------------------------------------------------------- */

    if (!email || !isValidEmail(email)) {
      showError("Please enter a valid email address.");
      emailInput?.focus();
      return;
    }

    /* -------------------------------------------------------
       VALIDATE PASSWORD
       ------------------------------------------------------- */

    if (!password) {
      showError("Please enter your password.");
      passwordInput?.focus();
      return;
    }

    if (password.length < 8) {
      showError("Password must be at least 8 characters.");
      passwordInput?.focus();
      return;
    }

    /* -------------------------------------------------------
       LOADING STATE
       ------------------------------------------------------- */

    const originalText =
      submitText?.textContent || "Log in";

    if (submitButton) {
      submitButton.disabled = true;
      submitButton.setAttribute("aria-busy", "true");
    }

    if (submitText) {
      submitText.textContent = "Logging in...";
    }

    try {
      /* -----------------------------------------------------
         LOGIN REQUEST
         ----------------------------------------------------- */

      const result = await NexoraAPI.post("/auth/login", {
        email,
        password,
      });

      /* -----------------------------------------------------
         VERIFY RESPONSE
         ----------------------------------------------------- */

      if (!result.success) {
        throw new Error(
          result.message || "Unable to log in."
        );
      }

      const token = result?.data?.token;

      if (!token) {
        throw new Error(
          "Login succeeded, but no authentication token was returned."
        );
      }

      /* -----------------------------------------------------
         SAVE JWT
         ----------------------------------------------------- */

      localStorage.setItem("nexora_token", token);

      /*
       * The current frontend uses localStorage for the JWT.
       *
       * Remember Me can later be expanded to use a more
       * persistent authentication strategy. For now,
       * the token remains in localStorage.
       */

      if (shouldRemember) {
        localStorage.setItem(
          "nexora_remember_me",
          "true"
        );
      } else {
        localStorage.removeItem(
          "nexora_remember_me"
        );
      }

      /* -----------------------------------------------------
         VERIFY AUTHENTICATED USER
         ----------------------------------------------------- */

      const me = await NexoraAPI.get("/auth/me");

      if (!me.success) {
        throw new Error(
          me.message || "Unable to verify your account."
        );
      }

      /*
       * Save the returned user information so other
       * frontend pages can use it without immediately
       * requesting it again.
       */

      if (me.data?.user) {
        localStorage.setItem(
          "nexora_user",
          JSON.stringify(me.data.user)
        );
      }

      /* -----------------------------------------------------
         SUCCESS
         ----------------------------------------------------- */

      window.location.href = "../index.html";
    } catch (error) {
      console.error(
        "Nexora email login error:",
        error
      );

      /*
       * If login failed, do not leave an invalid token
       * in localStorage.
       */

      localStorage.removeItem("nexora_token");
      localStorage.removeItem("nexora_user");

      showError(
        error?.message ||
          "Unable to log in. Please check your email and password."
      );
    } finally {
      if (submitButton) {
        submitButton.disabled = false;
        submitButton.removeAttribute("aria-busy");
      }

      if (submitText) {
        submitText.textContent = originalText;
      }
    }
  });
});