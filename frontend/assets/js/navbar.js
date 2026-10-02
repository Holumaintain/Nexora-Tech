/* =========================================================
   NEXORA TECHNOLOGIES
   NAVBAR CONTROLLER
   =========================================================

   Handles:
   - Mobile navigation
   - Mobile dropdowns
   - Desktop dropdown state
   - Click outside
   - Resize reset
   - Scroll state
   - Accessibility state

   IMPORTANT:
   The CSS uses `.mobile-open` for the mobile navigation
   state, so JavaScript must use the same class.
   ========================================================= */

/* =========================================================
   GLOBAL INITIALIZATION STATE
   ========================================================= */

let navbarInitialized = false;

/* =========================================================
   INITIALIZE NAVBAR
   ========================================================= */

function initNavbar() {
  /* ---------------------------------------------------------
     PREVENT DUPLICATE INITIALIZATION
     --------------------------------------------------------- */

  if (navbarInitialized) {
    return;
  }

  /* ---------------------------------------------------------
     ELEMENTS
     --------------------------------------------------------- */

  const navbar = document.querySelector(".navbar");
  const nav = document.querySelector(".nav");
  const mobileToggle =
    document.querySelector(".mobile-toggle");
  const dropdowns =
    document.querySelectorAll(".dropdown");

  /* ---------------------------------------------------------
     SAFETY CHECK
     --------------------------------------------------------- */

  if (!navbar || !nav || !mobileToggle) {
    return;
  }

  /* ---------------------------------------------------------
     MARK AS INITIALIZED
     --------------------------------------------------------- */

  navbarInitialized = true;

  /* =========================================================
     MOBILE MENU
     ========================================================= */

  function openMobileMenu() {
    nav.classList.add("mobile-open");
    mobileToggle.classList.add("active");

    mobileToggle.setAttribute(
      "aria-expanded",
      "true"
    );
  }

  function closeMobileMenu() {
    nav.classList.remove("mobile-open");
    mobileToggle.classList.remove("active");

    mobileToggle.setAttribute(
      "aria-expanded",
      "false"
    );

    /* Close all mobile dropdowns */
    dropdowns.forEach((dropdown) => {
      dropdown.classList.remove("open");

      const trigger =
        dropdown.querySelector(".dropdown-trigger");

      if (trigger) {
        trigger.setAttribute(
          "aria-expanded",
          "false"
        );
      }
    });
  }

  function toggleMobileMenu() {
    const isOpen =
      nav.classList.contains("mobile-open");

    if (isOpen) {
      closeMobileMenu();
    } else {
      openMobileMenu();
    }
  }

  /* =========================================================
     MOBILE TOGGLE
     ========================================================= */

  mobileToggle.addEventListener(
    "click",
    function (event) {
      event.preventDefault();
      event.stopPropagation();

      toggleMobileMenu();
    }
  );

  /* =========================================================
     DROPDOWNS
     ========================================================= */

  dropdowns.forEach((dropdown) => {
    const trigger =
      dropdown.querySelector(".dropdown-trigger");

    if (!trigger) {
      return;
    }

    trigger.addEventListener(
      "click",
      function (event) {
        /* ---------------------------------------------------
           DESKTOP
           --------------------------------------------------- */

        if (window.innerWidth > 960) {
          return;
        }

        /* ---------------------------------------------------
           MOBILE
           --------------------------------------------------- */

        event.preventDefault();
        event.stopPropagation();

        /* Close other dropdowns */
        dropdowns.forEach((item) => {
          if (item !== dropdown) {
            item.classList.remove("open");

            const otherTrigger =
              item.querySelector(
                ".dropdown-trigger"
              );

            if (otherTrigger) {
              otherTrigger.setAttribute(
                "aria-expanded",
                "false"
              );
            }
          }
        });

        /* Toggle current dropdown */
        const isOpen =
          dropdown.classList.contains("open");

        if (isOpen) {
          dropdown.classList.remove("open");

          trigger.setAttribute(
            "aria-expanded",
            "false"
          );
        } else {
          dropdown.classList.add("open");

          trigger.setAttribute(
            "aria-expanded",
            "true"
          );
        }
      }
    );
  });

  /* =========================================================
     CLOSE WHEN CLICKING OUTSIDE
     ========================================================= */

  document.addEventListener(
    "click",
    function (event) {
      if (
        event.target.closest(".navbar")
      ) {
        return;
      }

      closeMobileMenu();
    }
  );

  /* =========================================================
     ESCAPE KEY
     ========================================================= */

  document.addEventListener(
    "keydown",
    function (event) {
      if (event.key !== "Escape") {
        return;
      }

      closeMobileMenu();
    }
  );

  /* =========================================================
     RESIZE HANDLER
     ========================================================= */

  let resizeTimer;

  window.addEventListener(
    "resize",
    function () {
      clearTimeout(resizeTimer);

      resizeTimer = setTimeout(
        function () {
          if (window.innerWidth > 960) {
            closeMobileMenu();
          }
        },
        100
      );
    }
  );

  /* =========================================================
     SCROLL EFFECT
     ========================================================= */

  function updateNavbar() {
    if (window.scrollY > 20) {
      navbar.classList.add("scrolled");
    } else {
      navbar.classList.remove("scrolled");
    }
  }

  updateNavbar();

  window.addEventListener(
    "scroll",
    updateNavbar,
    {
      passive: true,
    }
  );
}

/* =========================================================
   NORMAL PAGE INITIALIZATION
   ========================================================= */

document.addEventListener(
  "DOMContentLoaded",
  function () {
    initNavbar();
  }
);

/* =========================================================
   DYNAMIC NAVBAR INITIALIZATION
   =========================================================

   app.js injects the navbar using fetch().
   It dispatches this event after injection.
   ========================================================= */

document.addEventListener(
  "nexora:navbar-loaded",
  function () {
    initNavbar();
  }
);