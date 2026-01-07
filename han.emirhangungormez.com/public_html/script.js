/* 
 * By Emirhan Güngörmez
 * Email: info@emirhangungormez.com
 */

document.addEventListener('DOMContentLoaded', function() {
    // Clock functionality
    function updateClock() {
        const now = new Date();
        const hours = String(now.getHours()).padStart(2, '0');
        const minutes = String(now.getMinutes()).padStart(2, '0');
        const seconds = String(now.getSeconds()).padStart(2, '0');
        const clock = document.getElementById('clock');
        if (clock) clock.textContent = `${hours}:${minutes}:${seconds}`;
    }
    updateClock();
    setInterval(updateClock, 1000);

    // Word rotation animation
    const words = document.querySelectorAll('.words .word');
    let currentIndex = 0;
    let isAnimating = false;

    function rotateWords() {
        if (isAnimating || !words.length) return;
        isAnimating = true;

        const currentWord = words[currentIndex];
        currentWord.classList.remove('slide-up-in');
        currentWord.classList.add('slide-up-out');

        const nextIndex = (currentIndex + 1) % words.length;
        const nextWord = words[nextIndex];
        nextWord.classList.remove('slide-up-out');
        nextWord.classList.add('active', 'slide-up-in');
        
        currentWord.addEventListener('animationend', function handler() {
            currentWord.classList.remove('active', 'slide-up-out');
            currentWord.removeEventListener('animationend', handler);
        }, { once: true });

        nextWord.addEventListener('animationend', function handler() {
            nextWord.classList.remove('slide-up-in');
            nextWord.removeEventListener('animationend', handler);
            isAnimating = false;
        }, { once: true });

        currentIndex = nextIndex;
    }

    // Initialize first word
    if (words.length > 0) {
        words[0].classList.add('active');
        setInterval(rotateWords, 2000);
    }

    // Intro başlığında satır satır fade-in animasyonu
    const fadeLines = document.querySelectorAll('.intro .fade-line');
    const contactsDiv = document.querySelector('.intro .contacts');
    let fadeIndex = 0;
    function animateFadeLines() {
        if (fadeIndex < fadeLines.length) {
            fadeLines[fadeIndex].classList.add('fade-in');
            fadeIndex++;
            setTimeout(animateFadeLines, 150);
        } else {
            if (contactsDiv) contactsDiv.classList.add('fade-in');
        }
    }
    if (fadeLines.length > 0) {
        animateFadeLines();
    }

    // Scroll GSAP Code
    gsap.registerPlugin(ScrollTrigger);

    const lenis = new Lenis({
      duration: 0.7, // Scroll süresi
      easing: (t) => t * (2 - t), // Easing fonksiyonu
      smooth: true // Smooth scrolling etkinleştirme
    });

    lenis.on('scroll', (e) => {
      console.log(e);
    });

    function raf(time) {
      lenis.raf(time);
      requestAnimationFrame(raf);
    }

    requestAnimationFrame(raf);


    // Kartlara sıralı fadeInUp animasyonu
    const workCards = document.querySelectorAll('.work-card');
    workCards.forEach((card, i) => {
        setTimeout(() => {
            card.style.animation = 'fadeInUp 0.7s forwards';
        }, 200 * i);
    });
}); 