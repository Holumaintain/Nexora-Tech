/*======================================
        NAVBAR
======================================*/

let navbarInitialized = false;

function initNavbar() {

    if (navbarInitialized) return;

    const navbar = document.querySelector(".navbar");
    const nav = document.querySelector(".nav");
    const mobileToggle = document.querySelector(".mobile-toggle");
    const dropdowns = document.querySelectorAll(".dropdown");

    if (!navbar || !nav || !mobileToggle) {
        return;
    }

    navbarInitialized = true;

    /*======================================
            MOBILE MENU
    ======================================*/

    mobileToggle.addEventListener("click", function () {

        mobileToggle.classList.toggle("active");

        nav.classList.toggle("active");

        mobileToggle.setAttribute(
            "aria-expanded",
            mobileToggle.classList.contains("active")
        );

    });

    /*======================================
            MOBILE DROPDOWNS
    ======================================*/

    dropdowns.forEach(dropdown => {

        const trigger = dropdown.querySelector(".dropdown-trigger");

        if (!trigger) return;

        trigger.addEventListener("click", function (e) {

            if (window.innerWidth > 992) return;

            e.preventDefault();

            dropdowns.forEach(item => {

                if (item !== dropdown) {

                    item.classList.remove("open");

                    const btn = item.querySelector(".dropdown-trigger");

                    if (btn) {
                        btn.setAttribute("aria-expanded", "false");
                    }

                }

            });

            dropdown.classList.toggle("open");

            trigger.setAttribute(
                "aria-expanded",
                dropdown.classList.contains("open")
            );

        });

    });

    /*======================================
            CLOSE WHEN CLICK OUTSIDE
    ======================================*/

    document.addEventListener("click", function (e) {

        if (e.target.closest(".navbar")) return;

        nav.classList.remove("active");

        mobileToggle.classList.remove("active");

        mobileToggle.setAttribute("aria-expanded", "false");

        dropdowns.forEach(dropdown => {

            dropdown.classList.remove("open");

            const trigger = dropdown.querySelector(".dropdown-trigger");

            if (trigger) {
                trigger.setAttribute("aria-expanded", "false");
            }

        });

    });

    /*======================================
            DESKTOP RESET
    ======================================*/

    window.addEventListener("resize", function () {

        if (window.innerWidth <= 992) return;

        nav.classList.remove("active");

        mobileToggle.classList.remove("active");

        mobileToggle.setAttribute("aria-expanded", "false");

        dropdowns.forEach(dropdown => {

            dropdown.classList.remove("open");

            const trigger = dropdown.querySelector(".dropdown-trigger");

            if (trigger) {
                trigger.setAttribute("aria-expanded", "false");
            }

        });

    });

    /*======================================
            SCROLL EFFECT
    ======================================*/

    function updateNavbar() {

        if (window.scrollY > 20) {
            navbar.classList.add("scrolled");
        } else {
            navbar.classList.remove("scrolled");
        }

    }

    updateNavbar();

    window.addEventListener("scroll", updateNavbar);

}