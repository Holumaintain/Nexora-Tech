/*==================================================
                NEXORA CONTACT FORM
==================================================*/

document.addEventListener("DOMContentLoaded", () => {
  const form = document.getElementById("contact-form");

  if (!form) {
    return;
  }

  const errorMessage = document.getElementById("contact-form-error");
  const successMessage = document.getElementById("contact-form-success");
  const submitButton = form.querySelector('button[type="submit"]');

  const nameInput = document.getElementById("contact-name");
  const emailInput = document.getElementById("contact-email");
  const companyInput = document.getElementById("contact-company");
  const subjectInput = document.getElementById("contact-subject");
  const messageInput = document.getElementById("contact-message");

  function clearMessages() {
    if (errorMessage) {
      errorMessage.textContent = "";
      errorMessage.hidden = true;
    }

    if (successMessage) {
      successMessage.textContent = "";
      successMessage.hidden = true;
    }
  }

  function showError(message) {
    if (!errorMessage) {
      return;
    }

    errorMessage.textContent = message;
    errorMessage.hidden = false;

    if (successMessage) {
      successMessage.textContent = "";
      successMessage.hidden = true;
    }
  }

  function showSuccess(message) {
    if (!successMessage) {
      return;
    }

    successMessage.textContent = message;
    successMessage.hidden = false;

    if (errorMessage) {
      errorMessage.textContent = "";
      errorMessage.hidden = true;
    }
  }

  function isValidEmail(email) {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
  }

  form.addEventListener("submit", async (event) => {
    event.preventDefault();

    clearMessages();

    const name = nameInput?.value.trim() || "";
    const email = emailInput?.value.trim() || "";
    const company = companyInput?.value.trim() || "";
    const subject = subjectInput?.value.trim() || "";
    const message = messageInput?.value.trim() || "";

    if (!name) {
      showError("Please enter your name.");
      nameInput?.focus();
      return;
    }

    if (!email || !isValidEmail(email)) {
      showError("Please enter a valid email address.");
      emailInput?.focus();
      return;
    }

    if (!subject) {
      showError("Please select a topic.");
      subjectInput?.focus();
      return;
    }

    if (!message) {
      showError("Please enter your message.");
      messageInput?.focus();
      return;
    }

    const originalButtonHTML = submitButton?.innerHTML;

    if (submitButton) {
      submitButton.disabled = true;
      submitButton.innerHTML = `
        <span class="contact-submit-text">Sending...</span>
        <i class="fa-solid fa-spinner fa-spin" aria-hidden="true"></i>
      `;
    }

    try {
      const result = await NexoraAPI.post("/contact", {
        name,
        email,
        company,
        subject,
        message,
      });

      showSuccess(
        result.message ||
          "Your message has been sent successfully. We'll get back to you soon.",
      );

      form.reset();
    } catch (error) {
      console.error("Nexora contact form error:", error);

      showError(
        error.message ||
          "We couldn't send your message. Please try again.",
      );
    } finally {
      if (submitButton) {
        submitButton.disabled = false;
        submitButton.innerHTML = originalButtonHTML;
      }
    }
  });
});