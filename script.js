document.addEventListener('DOMContentLoaded', () => {
    const navbar = document.getElementById('navbar');
    const heroSection = document.querySelector('.hero');
    const navMenu = document.getElementById('nav-menu');
    const hamburger = document.getElementById('hamburger');
    const navLinks = document.querySelectorAll('.nav-link');
    const sections = Array.from(document.querySelectorAll('main section[id]'));
    const contactForm = document.getElementById('contactForm');
    const statsSection = document.querySelector('.stats');
    const buttons = document.querySelectorAll('.btn');
    const scrollProgress = document.getElementById('scrollProgress');
    const themeToggle = document.getElementById('themeToggle');

    let lastScrollY = window.scrollY;
    let ticking = false;

    // Dark Mode Functionality
    const initTheme = () => {
        const savedTheme = localStorage.getItem('theme') || 'light';
        document.documentElement.setAttribute('data-theme', savedTheme);
    };

    if (themeToggle) {
        themeToggle.addEventListener('click', () => {
            const currentTheme = document.documentElement.getAttribute('data-theme');
            const newTheme = currentTheme === 'dark' ? 'light' : 'dark';
            document.documentElement.setAttribute('data-theme', newTheme);
            localStorage.setItem('theme', newTheme);
        });
    }

    initTheme();

    // Scroll Progress Functionality
    const updateScrollProgress = () => {
        if (!scrollProgress) return;
        const windowHeight = document.documentElement.scrollHeight - document.documentElement.clientHeight;
        const scrolled = (window.scrollY / windowHeight) * 100;
        scrollProgress.style.width = scrolled + '%';
    };

    const setNavbarState = () => {
        if (!navbar) return;
        navbar.classList.toggle('scrolled', lastScrollY > 20);
    };

    const setHeroParallax = () => {
        if (!heroSection) return;
        const parallaxOffset = Math.min(lastScrollY * 0.4, 120);
        heroSection.style.setProperty('--hero-parallax', `${parallaxOffset}px`);
    };

    const setActiveLink = () => {
        if (sections.length === 0) return;
        const navHeight = navbar ? navbar.offsetHeight : 0;
        let currentSection = sections[0].id;

        sections.forEach(section => {
            const sectionTop = section.offsetTop - navHeight - 160;
            if (lastScrollY >= sectionTop) {
                currentSection = section.id;
            }
        });

        navLinks.forEach(link => {
            const targetId = link.getAttribute('href').replace('#', '');
            if (targetId === currentSection) {
                link.classList.add('active');
            } else {
                link.classList.remove('active');
            }
        });
    };

    const onScroll = () => {
        lastScrollY = window.scrollY;

        if (!ticking) {
            window.requestAnimationFrame(() => {
                setNavbarState();
                setHeroParallax();
                setActiveLink();
                updateScrollProgress();
                ticking = false;
            });
            ticking = true;
        }
    };

    window.addEventListener('scroll', onScroll);
    onScroll();

    const closeMobileNav = () => {
        if (!hamburger || !navMenu) return;
        hamburger.classList.remove('is-active');
        hamburger.setAttribute('aria-expanded', 'false');
        navMenu.classList.remove('active');
        document.body.classList.remove('nav-open');
    };

    if (hamburger && navMenu) {
        hamburger.addEventListener('click', () => {
            const expanded = hamburger.getAttribute('aria-expanded') === 'true';
            hamburger.setAttribute('aria-expanded', String(!expanded));
            hamburger.classList.toggle('is-active');
            navMenu.classList.toggle('active');
            document.body.classList.toggle('nav-open', !expanded);
        });
    }

    const smoothScrollTo = target => {
        if (!target) return;
        const navHeight = navbar ? navbar.offsetHeight : 0;
        const offset = navHeight + 12;
        const targetPosition = target.getBoundingClientRect().top + window.pageYOffset - offset;
        window.scrollTo({
            top: targetPosition,
            behavior: 'smooth'
        });
    };

    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', event => {
            const hash = anchor.getAttribute('href');
            if (!hash || hash === '#' || anchor.classList.contains('skip-link')) {
                return;
            }

            const target = document.querySelector(hash);
            if (target) {
                event.preventDefault();
                smoothScrollTo(target);
                closeMobileNav();
            }
        });
    });

    navLinks.forEach(link => {
        link.addEventListener('click', closeMobileNav);
    });

    const animateCounter = element => {
        const target = parseInt(element.getAttribute('data-target'), 10);
        if (Number.isNaN(target)) return;

        const duration = 2000;
        const step = Math.max(Math.floor(target / (duration / 16)), 1);
        let current = 0;

        const update = () => {
            current += step;
            if (current < target) {
                element.textContent = current;
                requestAnimationFrame(update);
            } else {
                element.textContent = target;
            }
        };

        update();
    };

    if (statsSection) {
        const statsObserver = new IntersectionObserver((entries, observer) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    const numbers = entry.target.querySelectorAll('.stat-number');
                    numbers.forEach(number => {
                        if (!number.classList.contains('animated')) {
                            number.classList.add('animated');
                            animateCounter(number);
                        }
                    });
                    observer.unobserve(entry.target);
                }
            });
        }, { threshold: 0.5 });

        statsObserver.observe(statsSection);
    }

    const revealTargets = document.querySelectorAll(
        '.feature-card, .capability-card, .service-card, .portfolio-item, .insight-card, .info-card, .stat-item'
    );

    if (revealTargets.length > 0) {
        const revealObserver = new IntersectionObserver((entries, observer) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    entry.target.classList.add('is-visible');
                    observer.unobserve(entry.target);
                }
            });
        }, {
            threshold: 0.2,
            rootMargin: '0px 0px -80px 0px'
        });

        revealTargets.forEach(target => {
            target.classList.add('reveal-up');
            revealObserver.observe(target);
        });
    }

    if (contactForm) {
        contactForm.addEventListener('submit', event => {
            event.preventDefault();

            if (!contactForm.checkValidity()) {
                contactForm.reportValidity();
                return;
            }

            const email = contactForm.email.value.trim();
            const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
            if (!emailRegex.test(email)) {
                alert('올바른 이메일 주소를 입력해 주세요.');
                return;
            }

            alert('문의가 접수되었습니다. 빠른 시일 내에 연락드리겠습니다.');
            contactForm.reset();
        });
    }

    const createRipple = event => {
        const button = event.currentTarget;
        const rect = button.getBoundingClientRect();
        const size = Math.max(rect.width, rect.height);
        const ripple = document.createElement('span');

        ripple.className = 'ripple';
        ripple.style.width = ripple.style.height = `${size}px`;

        const x = event.clientX !== 0 ? event.clientX : rect.left + rect.width / 2;
        const y = event.clientY !== 0 ? event.clientY : rect.top + rect.height / 2;

        ripple.style.left = `${x - rect.left - size / 2}px`;
        ripple.style.top = `${y - rect.top - size / 2}px`;

        button.appendChild(ripple);
        setTimeout(() => ripple.remove(), 600);
    };

    buttons.forEach(button => {
        button.addEventListener('click', createRipple);
    });

    // Smooth reveal for elements on first load
    const observeOnLoad = () => {
        const elementsToReveal = document.querySelectorAll('.reveal-up:not(.is-visible)');
        elementsToReveal.forEach((el, index) => {
            setTimeout(() => {
                el.classList.add('is-visible');
            }, index * 100);
        });
    };

    // Performance optimization: Lazy load images
    const lazyLoadImages = () => {
        const images = document.querySelectorAll('img[data-src]');
        const imageObserver = new IntersectionObserver((entries, observer) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    const img = entry.target;
                    img.src = img.dataset.src;
                    img.removeAttribute('data-src');
                    observer.unobserve(img);
                }
            });
        });

        images.forEach(img => imageObserver.observe(img));
    };

    // Back to top button functionality
    const createBackToTop = () => {
        const backToTop = document.createElement('button');
        backToTop.className = 'back-to-top';
        backToTop.innerHTML = '↑';
        backToTop.setAttribute('aria-label', '페이지 상단으로');
        backToTop.style.cssText = `
            position: fixed;
            bottom: 5.5rem;
            right: 2rem;
            width: 48px;
            height: 48px;
            border-radius: 50%;
            background: var(--primary-color);
            color: white;
            border: none;
            font-size: 24px;
            cursor: pointer;
            opacity: 0;
            visibility: hidden;
            transition: opacity 0.3s, visibility 0.3s, transform 0.3s;
            z-index: 998;
            box-shadow: var(--shadow-md);
        `;

        backToTop.addEventListener('click', () => {
            window.scrollTo({ top: 0, behavior: 'smooth' });
        });

        document.body.appendChild(backToTop);

        window.addEventListener('scroll', () => {
            if (window.scrollY > 500) {
                backToTop.style.opacity = '1';
                backToTop.style.visibility = 'visible';
            } else {
                backToTop.style.opacity = '0';
                backToTop.style.visibility = 'hidden';
            }
        });
    };

    // Initialize all enhancements
    setTimeout(observeOnLoad, 100);
    lazyLoadImages();
    createBackToTop();

    console.log('SEAFACE website initialized with enhanced features.');
});
