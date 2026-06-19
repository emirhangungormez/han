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

    document.querySelectorAll(".game-media-slider").forEach((slider, sliderIndex) => {
        const slides = Array.from(slider.querySelectorAll("img"));
        if (slides.length < 2) return;

        let activeIndex = 0;
        window.setInterval(() => {
            slides[activeIndex].classList.remove("is-active");
            activeIndex = (activeIndex + 1) % slides.length;
            slides[activeIndex].classList.add("is-active");
        }, 3200 + sliderIndex * 600);
    });

});
