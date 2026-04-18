document.addEventListener('DOMContentLoaded', () => {

    // --- 1. LANGUAGE & TRANSLATIONS ---
    let currentLang = window.defaultLang || 'es';
    const dict = window.translations || {};

    const btnIt = document.getElementById('lang-it');
    const btnEs = document.getElementById('lang-es');

    const updateTranslations = (lang) => {
        if (!dict[lang]) return;

        // Update simple text elements
        const elements = document.querySelectorAll('[data-i18n]');
        elements.forEach(el => {
            const key = el.getAttribute('data-i18n');
            if (dict[lang][key]) {
                el.innerHTML = dict[lang][key];
            }
        });

        // Update placeholders
        const placeholders = document.querySelectorAll('[data-placeholder-i18n]');
        placeholders.forEach(el => {
            const key = el.getAttribute('data-placeholder-i18n');
            if (dict[lang][key]) {
                el.placeholder = dict[lang][key];
            }
        });

        // Update countdown labels manually since they are redrawn
        updateCountdownLabels();
    };

    const setLanguage = (lang) => {
        currentLang = lang;
        if (lang === 'it') {
            btnIt.classList.add('active');
            btnEs.classList.remove('active');
        } else {
            btnEs.classList.add('active');
            btnIt.classList.remove('active');
        }
        updateTranslations(lang);
    };

    btnIt.addEventListener('click', () => setLanguage('it'));
    btnEs.addEventListener('click', () => setLanguage('es'));

    // --- 2. MOBILE NAVIGATION ---
    const mobileMenu = document.getElementById('mobile-menu');
    const navLinks = document.querySelector('.nav-links');
    const links = document.querySelectorAll('.nav-links a');

    mobileMenu.addEventListener('click', () => {
        navLinks.classList.toggle('active');
    });

    links.forEach(link => {
        link.addEventListener('click', () => {
            navLinks.classList.remove('active');
        });
    });

    // Navbar Scrolled State
    const navbar = document.getElementById('navbar');
    window.addEventListener('scroll', () => {
        if (window.scrollY > 50) {
            navbar.classList.add('scrolled');
        } else {
            navbar.classList.remove('scrolled');
        }
    });


    // --- 3. COUNTDOWN TIMER ---
    // Target date: August 22, 2026, 13:00
    const targetDate = new Date('2026-08-22T13:00:00+02:00').getTime();
    const countdownEl = document.getElementById('countdown');

    let currentLabels = {
        days: 'Giorni',
        hours: 'Ore',
        minutes: 'Min.',
        seconds: 'Sec.'
    };

    function updateCountdownLabels() {
        if (!dict[currentLang]) return;
        currentLabels = {
            days: dict[currentLang].countdownDays,
            hours: dict[currentLang].countdownHours,
            minutes: dict[currentLang].countdownMinutes,
            seconds: dict[currentLang].countdownSeconds
        };
        // Re-render currently displayed values with new labels
        renderCountdown(lastTimes.d, lastTimes.h, lastTimes.m, lastTimes.s);
    }

    let lastTimes = { d: 0, h: 0, m: 0, s: 0 };

    function renderCountdown(days, hours, minutes, seconds) {
        if (!countdownEl) return;
        countdownEl.innerHTML = `
            <div class="cd-item">
                <span class="cd-number">${days}</span>
                <span class="cd-label">${currentLabels.days}</span>
            </div>
            <div class="cd-item">
                <span class="cd-number">${hours.toString().padStart(2, '0')}</span>
                <span class="cd-label">${currentLabels.hours}</span>
            </div>
            <div class="cd-item">
                <span class="cd-number">${minutes.toString().padStart(2, '0')}</span>
                <span class="cd-label">${currentLabels.minutes}</span>
            </div>
            <div class="cd-item">
                <span class="cd-number">${seconds.toString().padStart(2, '0')}</span>
                <span class="cd-label">${currentLabels.seconds}</span>
            </div>
        `;
    }

    const updateTimer = setInterval(() => {
        const now = new Date().getTime();
        const distance = targetDate - now;

        if (distance < 0) {
            clearInterval(updateTimer);
            if (countdownEl) countdownEl.innerHTML = `<h3>Oggi ci si sposa!</h3>`;
            return;
        }

        lastTimes.d = Math.floor(distance / (1000 * 60 * 60 * 24));
        lastTimes.h = Math.floor((distance % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
        lastTimes.m = Math.floor((distance % (1000 * 60 * 60)) / (1000 * 60));
        lastTimes.s = Math.floor((distance % (1000 * 60)) / 1000);

        renderCountdown(lastTimes.d, lastTimes.h, lastTimes.m, lastTimes.s);
    }, 1000);


    // --- 4. ANIMATIONS ON SCROLL (Intersection Observer) ---
    const fadeElements = document.querySelectorAll('.fade-in-up');

    const observerOptions = {
        root: null,
        rootMargin: '0px',
        threshold: 0.15
    };

    const observer = new IntersectionObserver((entries, obs) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('visible');
                obs.unobserve(entry.target); // Animate only once
            }
        });
    }, observerOptions);

    fadeElements.forEach(el => observer.observe(el));


    // --- 5. BUS SEATS TOGGLE ---
    const busCheckbox = document.getElementById('bus-transfer');
    const busExtrasGroup = document.getElementById('bus-extras-group');

    if (busCheckbox && busExtrasGroup) {
        busCheckbox.addEventListener('change', () => {
            if (busCheckbox.checked) {
                busExtrasGroup.classList.remove('hidden');
            } else {
                busExtrasGroup.classList.add('hidden');
            }
        });
    }

    // --- 6. RSVP FORM SUBMISSION (GOOGLE SHEETS) ---
    const form = document.getElementById('rsvp-form');
    const formMessage = document.getElementById('form-message');

    if (form) {
        form.addEventListener('submit', async (e) => {
            e.preventDefault();

            // --- CONFIGURAZIONE GOOGLE SCRIPT ---
            // Incolla qui l'URL che ottieni dopo aver pubblicato lo script su Google
            const GOOGLE_SCRIPT_URL = "https://script.google.com/macros/s/AKfycbyoyRRQ77VdlhQHCprsnqoJYoKFkGXSsh063q1G5vZ7DuFLSgtlDkBGOzYhTUmRITjX/exec";

            const btn = form.querySelector('button[type="submit"]');
            const btnSpan = btn.querySelector('span');
            const originalBtnText = btnSpan ? btnSpan.innerText : 'Invia';

            // Stato di caricamento
            btn.disabled = true;
            btn.style.opacity = '0.7';
            if (btnSpan) btnSpan.innerText = '...';

            // Prepariamo i dati per Google (URL-encoded)
            const formData = new FormData(form);
            const data = {};
            formData.forEach((value, key) => { data[key] = value });

            if (data['presenza'] === 'no' || !data['usa_bus']) {
                data['bus_tragitto'] = '';
                data['bus_partenza'] = '';
                data['bus_posti'] = '';
            }

            // Per GAS è spesso più semplice inviare come una stringa di parametri
            const params = new URLSearchParams(data).toString();

            try {
                const response = await fetch(GOOGLE_SCRIPT_URL, {
                    method: 'POST',
                    body: params,
                    headers: {
                        'Content-Type': 'application/x-www-form-urlencoded'
                    }
                });

                const result = await response.json();

                if (result.status === "success") {
                    // Celebration effect if they said SI
                    if (data.presenza === 'si' && typeof confetti === 'function') {
                        launchPetals();
                    }

                    form.reset();
                    if (busExtrasGroup) busExtrasGroup.classList.add('hidden');
                    formMessage.classList.remove('hidden');
                    formMessage.style.color = "var(--clr-eucalyptus)";
                    formMessage.innerHTML = `<span data-i18n="rsvpSuccess">${dict[currentLang].rsvpSuccess}</span>`;
                } else {
                    throw new Error(result.message || "Server Error");
                }

            } catch (error) {
                console.error("Errore RSVP:", error);
                formMessage.classList.remove('hidden');
                formMessage.style.color = "#d9534f"; // Red for error
                formMessage.innerHTML = `<span data-i18n="rsvpError">${dict[currentLang].rsvpError}</span>`;
            } finally {
                btn.disabled = false;
                btn.style.opacity = '1';
                if (btnSpan) btnSpan.innerText = originalBtnText;
            }
        });
    }

    // --- 7. PETAL EFFECT ---
    function launchPetals() {
        const count = 200;
        const defaults = {
            origin: { y: 0.7 },
            colors: ['#bdcbb8', '#fcf6f5', '#82947b', '#f4efea'],
            shapes: ['circle'],
            gravity: 0.8,
            scalar: 0.75,
            drift: 0.5,
        };

        function fire(particleRatio, opts) {
            confetti({
                ...defaults,
                ...opts,
                particleCount: Math.floor(count * particleRatio)
            });
        }

        fire(0.25, { spread: 26, startVelocity: 55 });
        fire(0.2, { spread: 60 });
        fire(0.35, { spread: 100, decay: 0.91, scalar: 0.8 });
        fire(0.1, { spread: 120, startVelocity: 25, decay: 0.92, scalar: 1.2 });
        fire(0.1, { spread: 120, startVelocity: 45 });
    }

    // --- 8. LIGHTBOX / TOURISM BUBBLES ---
    const bubbles = document.querySelectorAll('.bubble');
    const lightbox = document.getElementById('lightbox-overlay');
    const lightboxImg = document.getElementById('lightbox-img');
    const closeBtn = document.querySelector('.close-lightbox');

    if (bubbles && lightbox) {
        bubbles.forEach(bubble => {
            bubble.addEventListener('click', () => {
                const img = bubble.querySelector('img');
                if (img) {
                    // Convertiamo l'URL Unsplash in alta risoluzione per il lightbox
                    const hiResUrl = img.src.replace('w=400', 'w=1200');
                    lightboxImg.src = hiResUrl;
                    lightbox.style.display = 'flex';
                    setTimeout(() => lightbox.classList.add('active'), 10);
                }
            });
        });

        const closeLightbox = () => {
            lightbox.classList.remove('active');
            setTimeout(() => lightbox.style.display = 'none', 400);
        };

        closeBtn?.addEventListener('click', closeLightbox);
        // Chiudi se clicchi fuori dall'immagine
        lightbox.addEventListener('click', (e) => {
            if (e.target === lightbox) closeLightbox();
        });
    }

    // Initialize translations at the end so all DOM elements are declared
    setLanguage(currentLang);
});
