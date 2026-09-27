/*======================================
            IMAGE SLIDER
======================================*/

document.addEventListener("DOMContentLoaded", () => {
  const slider = document.querySelector(".slider");

  if (!slider) return;

  const slides = slider.querySelectorAll(".slide");

  if (slides.length === 0) return;

  let current = 0;

  function showSlide(index) {
    slides.forEach((slide, i) => {
      slide.classList.toggle("active", i === index);
    });
  }

  function nextSlide() {
    current++;

    if (current >= slides.length) {
      current = 0;
    }

    showSlide(current);
  }

  showSlide(current);

  setInterval(nextSlide, 5000);
});
