/* =========================================================
   NEXORA FORMS
   ========================================================= */

/* =========================================================
   CONTACT FORM
   ========================================================= */

document.addEventListener("DOMContentLoaded", () => {
  const form = document.getElementById("contact-form");

  if (!form) {
    return;
  }

  const errorElement = document.getElementById("contact-form-error");

  const successElement = document.getElementById("contact-form-success");

  const submitButton = form.querySelector('button[type="submit"]');

  const submitText = form.querySelector(".contact-submit-text");

  function showError(message) {
    if (!errorElement) {
      return;
    }

    errorElement.textContent = message;
    errorElement.classList.add("show");

    if (successElement) {
      successElement.textContent = "";
      successElement.classList.remove("show");
    }
  }

  function showSuccess(message) {
    if (!successElement) {
      return;
    }

    successElement.textContent = message;
    successElement.classList.add("show");

    if (errorElement) {
      errorElement.textContent = "";
      errorElement.classList.remove("show");
    }
  }

  function clearMessages() {
    if (errorElement) {
      errorElement.textContent = "";
      errorElement.classList.remove("show");
    }

    if (successElement) {
      successElement.textContent = "";
      successElement.classList.remove("show");
    }
  }

  form.addEventListener("submit", async (event) => {
    event.preventDefault();

    clearMessages();

    const formData = new FormData(form);

    const name = String(formData.get("name") || "").trim();

    const email = String(formData.get("email") || "").trim();

    const company = String(formData.get("company") || "").trim();

    const subject = String(formData.get("subject") || "").trim();

    const message = String(formData.get("message") || "").trim();

    if (!name || name.length < 2) {
      showError("Please enter your name.");
      return;
    }

    if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      showError("Please enter a valid email address.");
      return;
    }

    if (!subject) {
      showError("Please select a topic.");
      return;
    }

    if (!message || message.length < 5) {
      showError("Please enter a message.");
      return;
    }

    if (submitButton) {
      submitButton.disabled = true;
    }

    if (submitText) {
      submitText.textContent = "Sending...";
    }

    try {
      const result = await NexoraAPI.post("/contact", {
        name,
        email,
        company: company || undefined,
        subject,
        message,
      });

      if (!result.success) {
        throw new Error(result.message || "Unable to send your message.");
      }

      showSuccess(
        "Your message has been sent successfully. We'll get back to you soon."
      );

      form.reset();
    } catch (error) {
      console.error("Nexora contact form error:", error);

      showError(
        error.message || "Unable to send your message. Please try again."
      );
    } finally {
      if (submitButton) {
        submitButton.disabled = false;
      }

      if (submitText) {
        submitText.textContent = "Send message";
      }
    }
  });
});

/* =========================================================
   NEWSLETTER FORM
   ========================================================= */

document.addEventListener("DOMContentLoaded", () => {
  const form = document.getElementById("newsletter-form");

  if (!form) {
    return;
  }

  const emailInput = form.querySelector('input[type="email"]');

  const submitButton = form.querySelector('button[type="submit"]');

  form.addEventListener("submit", async (event) => {
    event.preventDefault();

    const email = emailInput?.value.trim() || "";

    if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      alert("Please enter a valid email address.");
      emailInput?.focus();
      return;
    }

    const originalText = submitButton?.textContent || "Subscribe";

    if (submitButton) {
      submitButton.disabled = true;
      submitButton.textContent = "Subscribing...";
    }

    try {
      const result = await NexoraAPI.post("/newsletter/subscribe", {
        email,
      });

      if (!result.success) {
        throw new Error(result.message || "Unable to subscribe.");
      }

      alert(
        result.alreadySubscribed
          ? "You're already subscribed to the Nexora newsletter."
          : "You're now subscribed to the Nexora newsletter."
      );

      form.reset();
    } catch (error) {
      console.error("Nexora newsletter error:", error);

      alert(error.message || "Unable to subscribe. Please try again.");
    } finally {
      if (submitButton) {
        submitButton.disabled = false;
        submitButton.textContent = originalText;
      }
    }
  });
});
