// ===== Smooth Scroll =====
document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function (e) {
        e.preventDefault();
        const target = document.querySelector(this.getAttribute('href'));
        if (target) {
            target.scrollIntoView({
                behavior: 'smooth',
                block: 'start'
            });
        }
    });
});

// ===== Active Menu Link on Scroll =====
const sections = document.querySelectorAll('section[id]');
const navLinks = document.querySelectorAll('.header__link');

function changeLinkState() {
    let index = sections.length;

    while(--index && window.scrollY + 200 < sections[index].offsetTop) {}
    
    navLinks.forEach((link) => link.classList.remove('header__link--active'));
    if (navLinks[index]) {
        navLinks[index].classList.add('header__link--active');
    }
}

changeLinkState();
window.addEventListener('scroll', changeLinkState);

// ===== Reviews Slider =====
class ReviewsSlider {
    constructor() {
        this.currentSlide = 0;
        // 14 отзывов для слайдера
        this.slides = [
            {
                title: "Команда Drupal Coder вызвала только положительные впечатления!",
                author: "Нуреев Александр, менеджер проекта Winamp Russian Community",
                avatar: "images/review-avatar.png"
            },
            {
                title: "Профессиональная команда с большим опытом работы",
                author: "Иванов Иван, директор ООО «Рога и копыта»",
                avatar: "images/review-avatar.png"
            },
            {
                title: "Рекомендую! Отличная поддержка и быстрое решение проблем",
                author: "Петрова Мария, CEO StartUp Inc.",
                avatar: "images/review-avatar.png"
            },
            {
                title: "Благодаря Drupal Coder мы успели запуститься в срок без авралов",
                author: "Смирнов Алексей, руководитель проекта MediaCorp",
                avatar: "images/review-avatar.png"
            },
            {
                title: "Грамотно консультируют и предлагают оптимальные решения",
                author: "Кузнецова Ольга, маркетолог OnlineShop",
                avatar: "images/review-avatar.png"
            },
            {
                title: "Отлаженные процессы и понятная отчетность по часам",
                author: "Сидоров Дмитрий, владелец интернет‑портала",
                avatar: "images/review-avatar.png"
            },
            {
                title: "Команда быстро вникла в сложный наследованный код",
                author: "Анна Фролова, продукт‑менеджер FinTech сервиса",
                avatar: "images/review-avatar.png"
            },
            {
                title: "Надежный подрядчик, с которым спокойно работать долгосрочно",
                author: "Грачёв Николай, CTO B2B‑платформы",
                avatar: "images/review-avatar.png"
            },
            {
                title: "Помогли мигрировать сайт на новую версию Drupal без простоя",
                author: "Екатерина Лебедева, руководитель digital‑направления",
                avatar: "images/review-avatar.png"
            },
            {
                title: "Четко соблюдают договоренности по срокам и бюджету",
                author: "Васильев Пётр, владелец онлайн‑сервиса",
                avatar: "images/review-avatar.png"
            },
            {
                title: "С Drupal Coder мы уверены в стабильности корпоративного портала",
                author: "Мария Климова, HR‑директор",
                avatar: "images/review-avatar.png"
            },
            {
                title: "Удобно, что все задачи ведутся через Helpdesk и ничего не теряется",
                author: "Сергей Орлов, менеджер по развитию",
                avatar: "images/review-avatar.png"
            },
            {
                title: "Отдельное спасибо за советы по SEO и оптимизации скорости",
                author: "Дарья Белова, специалист по веб‑маркетингу",
                avatar: "images/review-avatar.png"
            },
            {
                title: "Если нужен стабильный Drupal‑подрядчик — смело рекомендую Drupal Coder",
                author: "Андрей Павлов, владелец контент‑проекта",
                avatar: "images/review-avatar.png"
            }
        ];
        
        this.init();
    }
    
    init() {
        const prevBtn = document.querySelector('.review-card__arrow--prev');
        const nextBtn = document.querySelector('.review-card__arrow--next');
        
        if (prevBtn && nextBtn) {
            prevBtn.addEventListener('click', () => this.prevSlide());
            nextBtn.addEventListener('click', () => this.nextSlide());
        }
        
        this.updateSlide();
    }
    
    prevSlide() {
        this.currentSlide = this.currentSlide === 0 
            ? this.slides.length - 1 
            : this.currentSlide - 1;
        this.updateSlide();
    }
    
    nextSlide() {
        this.currentSlide = this.currentSlide === this.slides.length - 1 
            ? 0 
            : this.currentSlide + 1;
        this.updateSlide();
    }
    
    updateSlide() {
        const slide = this.slides[this.currentSlide];
        const card = document.querySelector('.review-card');
        
        if (card) {
            const title = card.querySelector('.review-card__title');
            const author = card.querySelector('.review-card__author');
            const counter = card.querySelector('.review-card__counter');
            const avatar = card.querySelector('.review-card__avatar img');
            
            if (title) title.textContent = slide.title;
            if (author) author.textContent = slide.author;
            if (avatar) avatar.src = slide.avatar;
            if (counter) {
                counter.textContent = `${String(this.currentSlide + 1).padStart(2, '0')} / ${String(this.slides.length).padStart(2, '0')}`;
            }
        }
    }
}

// Initialize slider
new ReviewsSlider();

// ===== Form Validation & Submission =====
const form = document.querySelector('.webform__form');

if (form) {
    form.addEventListener('submit', function(e) {
        e.preventDefault();
        
        const name = form.querySelector('input[type="text"]').value;
        const phone = form.querySelector('input[type="tel"]').value;
        const email = form.querySelector('input[type="email"]').value;
        const comment = form.querySelector('textarea').value;
        const checkbox = form.querySelector('input[type="checkbox"]').checked;
        
        // Basic validation
        if (!name || !phone || !email) {
            alert('Пожалуйста, заполните все обязательные поля');
            return;
        }
        
        if (!checkbox) {
            alert('Необходимо согласие на обработку персональных данных');
            return;
        }
        
        // Email validation
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(email)) {
            alert('Пожалуйста, введите корректный email');
            return;
        }
        
        // Phone validation (basic)
        const phoneRegex = /^[\d\s\+\-\(\)]+$/;
        if (!phoneRegex.test(phone)) {
            alert('Пожалуйста, введите корректный номер телефона');
            return;
        }
        
        // Simulate form submission
        alert('Спасибо за заявку! Мы свяжемся с вами в ближайшее время.');
        form.reset();
    });
}

// ===== Animated Numbers on Scroll =====
function animateValue(element, start, end, duration) {
    let startTimestamp = null;
    const step = (timestamp) => {
        if (!startTimestamp) startTimestamp = timestamp;
        const progress = Math.min((timestamp - startTimestamp) / duration, 1);
        const value = Math.floor(progress * (end - start) + start);
        element.textContent = value + (element.dataset.suffix || '');
        if (progress < 1) {
            window.requestAnimationFrame(step);
        }
    };
    window.requestAnimationFrame(step);
}

// Intersection Observer for stats animation
const statsObserver = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
        if (entry.isIntersecting && !entry.target.classList.contains('animated')) {
            entry.target.classList.add('animated');
            const value = entry.target.textContent.replace(/\D/g, '');
            if (value) {
                const suffix = entry.target.textContent.replace(/[\d\s]/g, '');
                entry.target.dataset.suffix = suffix;
                animateValue(entry.target, 0, parseInt(value), 2000);
            }
        }
    });
}, { threshold: 0.5 });

document.querySelectorAll('.header__stat-value').forEach(stat => {
    statsObserver.observe(stat);
});

// ===== Header Background Change on Scroll =====
const header = document.querySelector('.header');
let lastScroll = 0;

window.addEventListener('scroll', () => {
    const currentScroll = window.pageYOffset;
    
    if (currentScroll > 100) {
        header.style.background = 'rgba(57, 64, 71, 0.95)';
        header.style.boxShadow = '0 2px 10px rgba(0, 0, 0, 0.1)';
    } else {
        header.style.background = 'linear-gradient(233deg, rgba(255, 255, 255, 1) 0%, rgba(255, 255, 255, 0) 100%), #394047';
        header.style.boxShadow = 'none';
    }
    
    lastScroll = currentScroll;
});

// ===== Mobile Menu Toggle =====
function createMobileMenu() {
    const header = document.querySelector('.header__content');
    const nav = document.querySelector('.header__nav');
    
    if (window.innerWidth <= 992 && nav && !document.querySelector('.mobile-menu-btn')) {
        // Create hamburger button
        const menuBtn = document.createElement('button');
        menuBtn.className = 'mobile-menu-btn';
        menuBtn.innerHTML = '<span></span><span></span><span></span>';
        menuBtn.style.cssText = `
            display: flex;
            flex-direction: column;
            gap: 5px;
            background: none;
            border: none;
            cursor: pointer;
            padding: 10px;
        `;
        
        menuBtn.querySelectorAll('span').forEach(span => {
            span.style.cssText = `
                display: block;
                width: 25px;
                height: 3px;
                background: white;
                transition: all 0.3s ease;
            `;
        });
        
        // Add button to header
        const logo = document.querySelector('.header__logo');
        logo.after(menuBtn);
        
        // Toggle menu on click
        menuBtn.addEventListener('click', () => {
            nav.classList.toggle('nav--open');
            menuBtn.classList.toggle('active');
            
            if (nav.classList.contains('nav--open')) {
                nav.style.cssText = `
                    display: flex;
                    position: absolute;
                    top: 100%;
                    left: 0;
                    right: 0;
                    background: rgba(57, 64, 71, 0.98);
                    flex-direction: column;
                    padding: 20px;
                    box-shadow: 0 4px 20px rgba(0, 0, 0, 0.2);
                `;
                
                const spans = menuBtn.querySelectorAll('span');
                spans[0].style.transform = 'rotate(45deg) translate(7px, 7px)';
                spans[1].style.opacity = '0';
                spans[2].style.transform = 'rotate(-45deg) translate(7px, -7px)';
            } else {
                nav.style.display = 'none';
                
                const spans = menuBtn.querySelectorAll('span');
                spans[0].style.transform = 'none';
                spans[1].style.opacity = '1';
                spans[2].style.transform = 'none';
            }
        });
        
        // Close menu on link click
        nav.querySelectorAll('a').forEach(link => {
            link.addEventListener('click', () => {
                nav.classList.remove('nav--open');
                nav.style.display = 'none';
                menuBtn.classList.remove('active');
                
                const spans = menuBtn.querySelectorAll('span');
                spans[0].style.transform = 'none';
                spans[1].style.opacity = '1';
                spans[2].style.transform = 'none';
            });
        });
    }
}

// Initialize mobile menu
createMobileMenu();
window.addEventListener('resize', createMobileMenu);

// ===== Lazy Loading Images =====
if ('IntersectionObserver' in window) {
    const imageObserver = new IntersectionObserver((entries, observer) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                const img = entry.target;
                img.src = img.dataset.src || img.src;
                img.classList.add('loaded');
                observer.unobserve(img);
            }
        });
    });
    
    document.querySelectorAll('img').forEach(img => {
        imageObserver.observe(img);
    });
}

// ===== Scroll to Top Button =====
function createScrollToTop() {
    const btn = document.createElement('button');
    btn.className = 'scroll-to-top';
    btn.innerHTML = '↑';
    btn.style.cssText = `
        position: fixed;
        bottom: 30px;
        right: 30px;
        width: 50px;
        height: 50px;
        border-radius: 50%;
        background: var(--color-primary);
        color: white;
        border: none;
        font-size: 24px;
        cursor: pointer;
        opacity: 0;
        visibility: hidden;
        transition: all 0.3s ease;
        z-index: 1000;
        box-shadow: 0 4px 12px rgba(241, 77, 52, 0.3);
    `;
    
    document.body.appendChild(btn);
    
    window.addEventListener('scroll', () => {
        if (window.pageYOffset > 500) {
            btn.style.opacity = '1';
            btn.style.visibility = 'visible';
        } else {
            btn.style.opacity = '0';
            btn.style.visibility = 'hidden';
        }
    });
    
    btn.addEventListener('click', () => {
        window.scrollTo({
            top: 0,
            behavior: 'smooth'
        });
    });
    
    btn.addEventListener('mouseenter', () => {
        btn.style.transform = 'translateY(-5px)';
    });
    
    btn.addEventListener('mouseleave', () => {
        btn.style.transform = 'translateY(0)';
    });
}

createScrollToTop();

// ===== Console Info =====
console.log('%c Drupal-coder Website ', 'background: #F14D34; color: white; font-size: 16px; padding: 10px;');
console.log('%c Developed with ❤️ ', 'color: #F14D34; font-size: 14px;');

