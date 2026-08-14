document.addEventListener("DOMContentLoaded", () => {

    const navbarContainer = document.getElementById("navbar-container");
    const footerContainer = document.getElementById("footer-container");

    /*======================================
            DETERMINE NAVBAR
    ======================================*/

    function getNavbarFile() {

        const path = window.location.pathname;

        if (path.includes("/pages/product/")) {
            return "components/navbar-product.html";
        }

        if (path.includes("/pages/resources/")) {
            return "components/navbar-resources.html";
        }

        if (
            path.includes("/pages/") &&
            !path.includes("/pages/product/") &&
            !path.includes("/pages/resources/")
        ) {
            return "components/navbar-pages.html";
        }

        return "components/navbar-root.html";

    }

    /*======================================
            PROJECT ROOT
    ======================================*/

    function getProjectRoot() {

        const path = window.location.pathname;

        if (
            path.includes("/pages/product/") ||
            path.includes("/pages/resources/")
        ) {
            return "../../";
        }

        if (path.includes("/pages/")) {
            return "../";
        }

        return "";

    }

    /*======================================
            LOAD COMPONENT
    ======================================*/

    async function loadComponent(container, file) {

        if (!container) return;

        try {

            const response = await fetch(
                getProjectRoot() + file
            );

            if (!response.ok) {
                throw new Error(`Unable to load ${file}`);
            }

            container.innerHTML = await response.text();

        } catch (error) {

            console.error("Component error:", error);

        }

    }

    /*======================================
            UPDATE FOOTER LINKS
    ======================================*/

    function updateFooterLinks() {

        if (!footerContainer) return;

        const prefix = getProjectRoot();

        footerContainer.querySelectorAll("a[href]").forEach(link => {

            const href = link.getAttribute("href");

            if (
                !href ||
                href.startsWith("http") ||
                href.startsWith("https") ||
                href.startsWith("#") ||
                href.startsWith("mailto:") ||
                href.startsWith("tel:")
            ) {
                return;
            }

            link.setAttribute("href", prefix + href);

        });

    }

    /*======================================
            LOAD LAYOUT
    ======================================*/

    async function loadLayout() {

        await loadComponent(
            navbarContainer,
            getNavbarFile()
        );

        await loadComponent(
            footerContainer,
            "components/footer.html"
        );

        updateFooterLinks();

        if (typeof initNavbar === "function") {
            initNavbar();
        }

    }

    /*======================================
            START
    ======================================*/

    loadLayout();

});