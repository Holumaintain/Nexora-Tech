/*======================================
            FADE IN ANIMATIONS
======================================*/

document.addEventListener("DOMContentLoaded", () => {

    const elements = document.querySelectorAll(".fade-in");

    if (!elements.length) return;

    const observer = new IntersectionObserver((entries) => {

        entries.forEach(entry => {

            if (entry.isIntersecting) {

                entry.target.classList.add("show");
                observer.unobserve(entry.target);

            }

        });

    }, {
        threshold: 0.15
    });

    elements.forEach(element => {
        observer.observe(element);
    });

});