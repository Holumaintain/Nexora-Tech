/*======================================
FORMS
======================================*/

document.addEventListener("DOMContentLoaded", () => {
  const forms = document.querySelectorAll("form");

  if (!forms.length) return;

  forms.forEach((form) => {
    form.addEventListener("submit", (e) => {
      e.preventDefault();

      /*======================================
                EMAIL VALIDATION
        ======================================*/

      const email = form.querySelector('input[type="email"]');

      if (email) {
        const pattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

        if (!pattern.test(email.value.trim())) {
          alert("Please enter a valid email address.");

          email.focus();

          return;
        }
      }

      /*======================================
                SUBMIT BUTTON
        ======================================*/

      const submitButton = form.querySelector('button[type="submit"]');

      if (submitButton) {
        const originalText = submitButton.innerHTML;

        submitButton.disabled = true;

        submitButton.innerHTML = "Please wait...";

        setTimeout(() => {
          submitButton.disabled = false;

          submitButton.innerHTML = originalText;

          alert("Form submitted successfully!");

          form.reset();
        }, 1200);
      }
    });
  });
});
