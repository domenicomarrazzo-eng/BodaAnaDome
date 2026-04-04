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

    // --- 6. RSVP FORM SUBMISSION (FORMSPREE) ---
    const form = document.getElementById('rsvp-form');
    const formMessage = document.getElementById('form-message');

    if (form) {
        form.addEventListener('submit', async (e) => {
            e.preventDefault();
            
            // --- CONFIGURAZIONE FORMSPREE ---
            // Sostituisci 'TUO_ID_FORMSPREE' con il codice che ti darà Formspree
            const FORMSPREE_ENDPOINT = "https://formspree.io/f/mreoogaz";
            
            const btn = form.querySelector('button[type="submit"]');
            const btnSpan = btn.querySelector('span');
            const originalBtnText = btnSpan ? btnSpan.innerText : 'Invia';

            // Stato di caricamento
            btn.disabled = true;
            btn.style.opacity = '0.7';
            if (btnSpan) btnSpan.innerText = '...';

            const formData = new FormData(form);

            try {
                const response = await fetch(FORMSPREE_ENDPOINT, {
                    method: 'POST',
                    body: formData,
                    headers: {
                        'Accept': 'application/json'
                    }
                });

                if (response.ok) {
                    form.reset();
                    if (busExtrasGroup) busExtrasGroup.classList.add('hidden');
                    formMessage.classList.remove('hidden');
                    formMessage.style.color = "var(--clr-eucalyptus)";
                    formMessage.innerHTML = `<span data-i18n="rsvpSuccess">${dict[currentLang].rsvpSuccess}</span>`;
                } else {
                    const data = await response.json();
                    throw new Error(data.error || 'Errore durante l\'invio');
                }
            } catch (error) {
                console.error("Errore RSVP:", error);
                formMessage.classList.remove('hidden');
                formMessage.style.color = "red";
                formMessage.innerText = currentLang === 'it' 
                    ? "Ops! C'è stato un errore. Riprova più tardi." 
                    : "¡Ops! Hubo un error. Por favor, inténtalo más tarde.";
            } finally {
                btn.disabled = false;
                btn.style.opacity = '1';
                if (btnSpan) btnSpan.innerText = originalBtnText;
            }
        });
    }

    // Initialize translations at the end so all DOM elements are declared
    setLanguage(currentLang);
});
