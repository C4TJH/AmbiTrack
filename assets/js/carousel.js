let currentSlide = 0;
const slides = document.querySelectorAll(".carousel-slide");

function showSlide(index) {
    slides.forEach(sl => sl.classList.remove("active"));
    slides[index].classList.add("active");
}

function moveSlide(direction) {
    currentSlide = (currentSlide + direction + slides.length) % slides.length;
    showSlide(currentSlide);
}

// Carrusel automático cada 6 segundos
setInterval(() => moveSlide(1), 6000);
