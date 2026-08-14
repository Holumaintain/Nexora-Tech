/*======================================
            COUNTER
======================================*/

document.addEventListener("DOMContentLoaded", () => {

    const counters = document.querySelectorAll(".counter");

    if (!counters.length) return;

    const observer = new IntersectionObserver((entries) => {

        entries.forEach(entry => {

            if (!entry.isIntersecting) return;

            const counter = entry.target;

            const target = Number(counter.dataset.target) || Number(counter.textContent);

            let current = 0;

            const increment = Math.ceil(target / 100);

            const updateCounter = () => {

                current += increment;

                if (current >= target) {

                    counter.textContent = target;

                } else {

                    counter.textContent = current;

                    requestAnimationFrame(updateCounter);

                }

            };

            updateCounter();

            observer.unobserve(counter);

        });

    }, {
        threshold: 0.3
    });

    counters.forEach(counter => {
        observer.observe(counter);
    });

});