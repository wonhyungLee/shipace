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
    const formStatus = document.getElementById('formStatus');
    const mailCopyButtons = document.querySelectorAll('[data-action="copy-email"]');
    const mailComposeButtons = document.querySelectorAll('[data-action="compose-email"]');

    let lastScrollY = window.scrollY;
    let ticking = false;
    let statusTimeoutId = null;

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

    const showStatus = (message, type = 'info', persist = false) => {
        if (!formStatus) {
            if (type === 'error') {
                alert(message);
            } else {
                console.info(message);
            }
            return;
        }

        if (statusTimeoutId) {
            clearTimeout(statusTimeoutId);
            statusTimeoutId = null;
        }

        formStatus.textContent = message;
        formStatus.dataset.status = type;
        formStatus.hidden = !message;

        if (!persist && message) {
            statusTimeoutId = window.setTimeout(() => {
                formStatus.textContent = '';
                formStatus.hidden = true;
            }, 6000);
        }
    };

    const buildMailtoLink = (email, subject, body) => {
        const params = [];
        if (subject) {
            params.push(`subject=${encodeURIComponent(subject)}`);
        }
        if (body) {
            params.push(`body=${encodeURIComponent(body)}`);
        }
        const query = params.length > 0 ? `?${params.join('&')}` : '';
        return `mailto:${email}${query}`;
    };

    const copyToClipboard = async text => {
        if (navigator.clipboard && window.isSecureContext) {
            await navigator.clipboard.writeText(text);
            return;
        }

        return new Promise((resolve, reject) => {
            const textarea = document.createElement('textarea');
            textarea.value = text;
            textarea.style.position = 'fixed';
            textarea.style.left = '-9999px';
            textarea.setAttribute('readonly', '');
            document.body.appendChild(textarea);
            textarea.select();
            try {
                document.execCommand('copy');
                resolve();
            } catch (error) {
                reject(error);
            } finally {
                document.body.removeChild(textarea);
            }
        });
    };

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

            const senderEmail = contactForm.email.value.trim();
            const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
            if (!emailRegex.test(senderEmail)) {
                showStatus('올바른 이메일 주소를 입력해 주세요.', 'error');
                contactForm.email.focus();
                return;
            }

            const name = contactForm.name.value.trim();
            const phone = contactForm.phone.value.trim();
            const subjectRaw = contactForm.subject.value.trim();
            const message = contactForm.message.value.trim();

            const subject = `[SHIPACE] ${subjectRaw || '상담 문의'}`;
            const bodyLines = [
                `이름: ${name || '미기재'}`,
                `회신 이메일: ${senderEmail}`,
                phone ? `연락처: ${phone}` : null,
                '',
                '문의 내용:',
                message,
                '',
                '---',
                '자동 생성된 문의 메일입니다. 전송 전에 자유롭게 수정하실 수 있습니다.'
            ].filter(Boolean);

            const mailtoLink = buildMailtoLink('ceo@shipace.kr', subject, bodyLines.join('\n'));

            showStatus('메일 앱이 열리면 내용을 확인한 뒤 전송해 주세요. 열리지 않는다면 ceo@shipace.kr 로 직접 메일을 보내 주세요.', 'success', true);

            window.setTimeout(() => {
                window.location.href = mailtoLink;
            }, 100);
        });
    }

    if (mailCopyButtons.length > 0) {
        mailCopyButtons.forEach(button => {
            button.addEventListener('click', async () => {
                const email = button.getAttribute('data-email') || 'ceo@shipace.kr';
                try {
                    await copyToClipboard(email);
                    button.classList.add('is-success');
                    showStatus(`이메일 주소 ${email} 을(를) 복사했습니다.`, 'success');
                    window.setTimeout(() => {
                        button.classList.remove('is-success');
                    }, 1500);
                } catch (error) {
                    showStatus('복사에 실패했습니다. 복사 권한을 허용하거나 직접 복사해 주세요.', 'error');
                }
            });
        });
    }

    if (mailComposeButtons.length > 0) {
        const defaultBody = [
            '안녕하세요, 시페이스 담당자님.',
            '',
            '프로젝트 상담을 요청드리고자 합니다.',
            '',
            '회사명/조직:',
            '담당자 연락처:',
            '문의 개요:',
            '',
            '감사합니다.'
        ].join('\n');

        mailComposeButtons.forEach(button => {
            button.addEventListener('click', () => {
                const email = button.getAttribute('data-email') || 'ceo@shipace.kr';
                const subject = button.getAttribute('data-subject') || '[SHIPACE] 상담 문의';
                const body = button.getAttribute('data-body') || defaultBody;
                const mailtoLink = buildMailtoLink(email, subject, body);
                showStatus('메일 앱이 열리면 내용을 확인한 뒤 전송해 주세요.', 'info');
                window.setTimeout(() => {
                    window.location.href = mailtoLink;
                }, 100);
            });
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

    console.log('SHIPACE website initialized with enhanced features.');
});
