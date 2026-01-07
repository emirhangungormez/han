// Scroll GSAP Code
gsap.registerPlugin(ScrollTrigger);

const lenis = new Lenis({
    duration: 1.2,
    easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)), // Smooth expo easing
    smooth: true,
    direction: 'vertical'
});

function raf(time) {
    lenis.raf(time);
    requestAnimationFrame(raf);
}

requestAnimationFrame(raf);

document.addEventListener('DOMContentLoaded', () => {
    // Lightbox
    const lightbox = document.getElementById('lightbox');
    const lightboxImg = document.getElementById('lightbox-img');
    const closeBtn = document.querySelector('.lightbox .close-btn'); // Re-added this
    // Lightbox using event delegation for dynamic images
    const gallery = document.querySelector('.photo-gallery');
    if (gallery) {
        gallery.addEventListener('click', (e) => {
            if (e.target.tagName === 'IMG') {
                const img = e.target;
                lightbox.classList.add('active');
                lightboxImg.src = img.src;
                lenis.stop();
            }
        });
    }

    const closeLightbox = () => {
        lightbox.classList.remove('active');
        lenis.start();
    };

    if (closeBtn) closeBtn.addEventListener('click', closeLightbox);
    if (lightbox) {
        lightbox.addEventListener('click', (e) => {
            if (e.target === lightbox) closeLightbox();
        });
    }

    // Auto-scroll gallery logic
    if (gallery) {
        let isHovering = false;
        const scrollSpeed = 0.5;

        // Note: With Steam dynamic loading, we need to clone AFTER images are loaded.
        // For now, we'll keep the existing logic but wrap it in an observer if needed.
        // Actually, the steam-assets.js will handle the initial render.

        const setupClones = () => {
            // Removing old clones if any
            const existingImages = Array.from(gallery.querySelectorAll('img:not(.clone)'));
            gallery.innerHTML = '';
            existingImages.forEach(img => gallery.appendChild(img));

            existingImages.forEach(item => {
                const clone = item.cloneNode(true);
                clone.classList.add('clone');
                gallery.appendChild(clone);
            });
        };

        const autoScroll = () => {
            if (!isHovering && gallery.children.length > 0) {
                gallery.scrollLeft += scrollSpeed;
                if (gallery.scrollLeft >= gallery.scrollWidth / 2) {
                    gallery.scrollLeft = 0;
                }
            }
            requestAnimationFrame(autoScroll);
        };

        gallery.addEventListener('mouseenter', () => isHovering = true);
        gallery.addEventListener('mouseleave', () => isHovering = false);

        // Listen for custom event when steam assets are loaded
        document.addEventListener('steamAssetsLoaded', () => {
            setupClones();
        });

        // If no steam assets (fallback), setup clones anyway
        setTimeout(() => {
            if (gallery.querySelectorAll('img').length > 0 && gallery.querySelectorAll('.clone').length === 0) {
                setupClones();
            }
        }, 2000);

        autoScroll();
    }

    // Anchor Link Smooth Scroll
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function (e) {
            e.preventDefault();
            const targetId = this.getAttribute('href');
            const target = document.querySelector(targetId);
            if (target) {
                lenis.scrollTo(target, {
                    duration: 1.5
                });
            }
        });
    });

    // Fade-in animations for About section
    gsap.from(".about-container h1, .about-container h2", {
        scrollTrigger: {
            trigger: ".about-container",
            start: "top 80%",
        },
        y: 40,
        opacity: 0,
        duration: 1,
        stagger: 0.2,
        ease: "power3.out"
    });

    gsap.from(".about-description", {
        scrollTrigger: {
            trigger: ".about-container",
            start: "top 70%",
        },
        y: 30,
        opacity: 0,
        duration: 1,
        ease: "power3.out"
    });

    if (document.querySelector(".footer-col")) {
        gsap.from(".footer-col", {
            scrollTrigger: {
                trigger: ".minimal-footer",
                start: "top 90%",
            },
            y: 20,
            opacity: 0,
            duration: 0.8,
            stagger: 0.1,
            ease: "power2.out"
        });
    }

    // Custom Video Controls
    const video = document.querySelector('.main-video');
    const playBtn = document.getElementById('playBtn');
    const muteBtn = document.getElementById('muteBtn');
    const iconPlay = document.querySelector('.icon-play');
    const iconPause = document.querySelector('.icon-pause');
    const iconUnmute = document.querySelector('.icon-unmute');
    const iconMute = document.querySelector('.icon-mute');

    if (video && playBtn && muteBtn) {
        playBtn.addEventListener('click', (e) => {
            e.stopPropagation(); // Prevents double toggling if we add listener to container
            if (video.paused) {
                video.play();
                iconPlay.style.display = 'none';
                iconPause.style.display = 'block';
            } else {
                video.pause();
                iconPlay.style.display = 'block';
                iconPause.style.display = 'none';
            }
        });

        muteBtn.addEventListener('click', (e) => {
            e.stopPropagation();
            video.muted = !video.muted;
            if (video.muted) {
                iconUnmute.style.display = 'none';
                iconMute.style.display = 'block';
            } else {
                iconUnmute.style.display = 'block';
                iconMute.style.display = 'none';
            }
        });

        // Initialize icon state
        if (video.autoplay) {
            iconPlay.style.display = 'none';
            iconPause.style.display = 'block';
        }
        if (video.muted) {
            iconUnmute.style.display = 'none';
            iconMute.style.display = 'block';
        }

        // Video Debugger - Neden açılmadığını kesin olarak bulur
        video.addEventListener('error', function (e) {
            const error = video.error;
            if (!error) return;

            let message = 'Bilinmeyen Hata';
            switch (error.code) {
                case error.MEDIA_ERR_ABORTED: message = 'Yükleme kullanıcı tarafından durduruldu.'; break;
                case error.MEDIA_ERR_NETWORK: message = 'Ağ hatası: Video indirilemedi.'; break;
                case error.MEDIA_ERR_DECODE: message = 'Dosya bozuk veya format desteklenmiyor.'; break;
                case error.MEDIA_ERR_SRC_NOT_SUPPORTED: message = 'Video dosyası bulunamadı veya format yanlış.'; break;
            }
            console.error('VIDEO ERROR DETECTED:', message, error);
        }, true);
    }
});