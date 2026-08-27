"use strict";

(() => {
    const path = window.location.pathname.replace(/\/+$/, "/");
    const isEnglishPage = path.includes("/en/");
    const isRootEntry = !isEnglishPage && (path === "/" || path.endsWith("/index.html"));
    const params = new URLSearchParams(window.location.search);
    const requestedLanguage = params.get("lang");

    if (requestedLanguage === "tr" || requestedLanguage === "en") {
        localStorage.setItem("han-lang-manual", requestedLanguage);
        return;
    }

    if (!isRootEntry || localStorage.getItem("han-lang-manual")) return;

    const timezone = Intl.DateTimeFormat().resolvedOptions().timeZone || "";
    const browserLanguage = (navigator.languages?.[0] || navigator.language || "").toLowerCase();
    const looksTurkish = timezone === "Europe/Istanbul" || browserLanguage.startsWith("tr");

    if (!looksTurkish) {
        const target = new URL("en/index.html", window.location.href);
        target.search = window.location.search;
        target.hash = window.location.hash;
        window.location.replace(target);
    }
})();

document.addEventListener("DOMContentLoaded", () => {
    const toggle = document.querySelector(".theme-toggle");
    const label = document.querySelector("[data-theme-label]");
    const sunIcon = document.querySelector(".theme-toggle-sun");
    const moonIcon = document.querySelector(".theme-toggle-moon");
    const themeMeta = document.querySelector('meta[name="theme-color"]');
    const storedTheme = localStorage.getItem("han-theme");
    const themes = ["gray", "white", "night"];
    const initialTheme = themes.includes(storedTheme) ? storedTheme : "gray";
    const isTurkish = document.documentElement.lang.toLowerCase().startsWith("tr");
    const labels = isTurkish
        ? {
            gray: "Gece modu",
            white: "Gece modu",
            night: "Gunduz modu"
        }
        : {
            gray: "Night mode",
            white: "Night mode",
            night: "Day mode"
        };
    const themeColors = {
        gray: "#efefec",
        white: "#ffffff",
        night: "#141416"
    };

    function applyTheme(theme) {
        document.body.dataset.theme = theme;
        toggle?.setAttribute("aria-pressed", String(theme === "night"));
        toggle?.setAttribute("aria-label", `Switch to ${labels[theme]}`);
        toggle?.setAttribute("data-theme-state", theme);
        toggle?.classList.toggle("is-night", theme === "night");
        toggle?.classList.toggle("is-light", theme !== "night");
        if (sunIcon && moonIcon) {
            sunIcon.style.opacity = theme === "night" ? "1" : "0";
            sunIcon.style.transform = theme === "night" ? "scale(1)" : "scale(0.84)";
            moonIcon.style.opacity = theme === "night" ? "0" : "1";
            moonIcon.style.transform = theme === "night" ? "scale(0.84)" : "scale(1)";
        }
        if (label) label.textContent = labels[theme];
        if (themeMeta) themeMeta.setAttribute("content", themeColors[theme]);
    }

    applyTheme(initialTheme);

    toggle?.addEventListener("click", () => {
        const nextTheme = document.body.dataset.theme === "night" ? "gray" : "night";
        localStorage.setItem("han-theme", nextTheme);
        applyTheme(nextTheme);
    });

    document.querySelectorAll(".interactive-game-card").forEach((card, cardIndex) => {
        const slider = card.querySelector(".game-media-slider");
        if (!slider) return;
        const slides = Array.from(slider.querySelectorAll("img"));
        if (slides.length < 2) return;

        let activeIndex = 0;
        let intervalId = null;

        function nextSlide() {
            slides[activeIndex].classList.remove("is-active");
            activeIndex = (activeIndex + 1) % slides.length;
            slides[activeIndex].classList.add("is-active");
        }

        function startNormalLoop() {
            stopLoop();
            intervalId = window.setInterval(nextSlide, 3600 + cardIndex * 800);
        }

        function startHoverLoop() {
            stopLoop();
            nextSlide();
            intervalId = window.setInterval(nextSlide, 1600);
        }

        function stopLoop() {
            if (intervalId) {
                window.clearInterval(intervalId);
                intervalId = null;
            }
        }

        startNormalLoop();

        card.addEventListener("mouseenter", startHoverLoop);
        card.addEventListener("mouseleave", startNormalLoop);
    });

    // Apple Tarzı Oyun Vitrini Yatay Gezinme Kontrolleri
    const showcaseTrack = document.getElementById("showcase-scroll-track");
    const prevBtn = document.getElementById("showcase-prev-btn");
    const nextBtn = document.getElementById("showcase-next-btn");

    if (showcaseTrack && prevBtn && nextBtn) {
        const getScrollStep = () => {
            const card = showcaseTrack.querySelector(".origin-game-card, .apple-game-card");
            return card ? card.offsetWidth + 24 : 500;
        };

        prevBtn.addEventListener("click", () => {
            showcaseTrack.scrollBy({ left: -getScrollStep(), behavior: "smooth" });
        });

        nextBtn.addEventListener("click", () => {
            showcaseTrack.scrollBy({ left: getScrollStep(), behavior: "smooth" });
        });

        // Mouse ile tutup sürükleme (Desktop drag scroll)
        let isDown = false;
        let startX = 0;
        let scrollLeftPos = 0;

        showcaseTrack.addEventListener("mousedown", (e) => {
            // Butonlara ve linklere tıklanırken sürüklemeyi tetikleme
            if (e.target.closest("a, button")) return;
            isDown = true;
            showcaseTrack.style.cursor = "grabbing";
            showcaseTrack.style.userSelect = "none";
            startX = e.pageX - showcaseTrack.offsetLeft;
            scrollLeftPos = showcaseTrack.scrollLeft;
        });

        const stopDragging = () => {
            if (!isDown) return;
            isDown = false;
            showcaseTrack.style.cursor = "default";
            showcaseTrack.style.removeProperty("user-select");
        };

        window.addEventListener("mouseup", stopDragging);
        showcaseTrack.addEventListener("mouseleave", stopDragging);

        showcaseTrack.addEventListener("mousemove", (e) => {
            if (!isDown) return;
            e.preventDefault();
            const x = e.pageX - showcaseTrack.offsetLeft;
            const walk = (x - startX) * 1.4;
            showcaseTrack.scrollLeft = scrollLeftPos - walk;
        });
    }
});
