// ================= COMPONENT =================
function loadComponent(name, targetId) {

    return fetch(`components/${name}.html`)
        .then(r => r.ok ? r.text() : Promise.reject(r.status))
        .then(html => {

            const el = document.getElementById(targetId);
            if (!el) return;

            el.innerHTML = html;

            if (name === 'header') {
              
            }
        })
        .catch(console.error);
}

function adjustBodyPadding() {
    const header = document.querySelector('.header');
    if (!header) return;
    document.body.style.paddingTop = header.offsetHeight + 'px';
}

function observeHeaderHeight() {
    const header = document.querySelector('.header');
    if (!header) return;
    new ResizeObserver(adjustBodyPadding).observe(header);
}

// ================= HEADER =================
function initHeaderScroll() {
    const header = document.querySelector('.header');
    if (!header) return;

    const toggle = () => {
        header.classList.toggle('scrolled', window.scrollY > 50);
    };

    toggle();
    window.addEventListener('scroll', toggle);
}
function initMobileMenu() {

    const toggle = document.querySelector(".menu-toggle");
    const menu = document.querySelector(".mobile-menu");
    const overlay = document.querySelector(".mobile-overlay");

    console.log('menu init:', toggle, menu, overlay);

    if (!toggle || !menu || !overlay) return;

    function closeMenu() {
        toggle.classList.remove("active");
        menu.classList.remove("active");
        overlay.classList.remove("active");
    }

    toggle.addEventListener("click", () => {
        console.log("clicked");
        toggle.classList.toggle("active");
        menu.classList.toggle("active");
        overlay.classList.toggle("active");
    });

    overlay.addEventListener("click", closeMenu);

    menu.querySelectorAll("a").forEach(link => {
        link.addEventListener("click", closeMenu);
    });
}

// ================= PRODUCT CAROUSEL (FINAL) =================
function initProductCarousel() {

    const mainImage = document.getElementById('mainImage');
    const dataEl = document.getElementById('imageData');

    if (!mainImage || !dataEl) return;

    let images = [];

    try {
        images = JSON.parse(dataEl.dataset.images || '[]');
    } catch (e) {
        console.error('image parse error');
        return;
    }

    if (!images.length) return;

    let index = 0;

    const counter = document.getElementById('imageCounter');
    const prevBtn = document.getElementById('prevBtn');
    const nextBtn = document.getElementById('nextBtn');
    const numbersWrap = document.getElementById('imageNumbers');

    // ===== auto build numbers =====
    if (numbersWrap) {
        numbersWrap.innerHTML = images.map((_, i) => `
            <span class="num ${i === 0 ? 'active' : ''}" data-index="${i}">
                ${String(i + 1).padStart(2, '0')}
            </span>
        `).join('');
    }

    const nums = document.querySelectorAll('.image-numbers .num');

    function render(i) {
        index = (i + images.length) % images.length;

        mainImage.src = images[index];

        if (counter) {
            counter.textContent = `${index + 1} / ${images.length}`;
        }

        nums.forEach((n, i) => n.classList.toggle('active', i === index));
    }

    prevBtn?.addEventListener('click', () => render(index - 1));
    nextBtn?.addEventListener('click', () => render(index + 1));

    nums.forEach(n => {
        n.addEventListener('click', () => render(+n.dataset.index));
    });

    render(0);
}
// ================= HORIZONTAL SLIDER =================
function initHorizontalSlider() {

    const track = document.querySelector(".horizontal-track");
    const cards = document.querySelectorAll(".horizontal-track .card");
    const prev = document.querySelector(".scroll-btn.left");
    const next = document.querySelector(".scroll-btn.right");

    if (!track || !cards.length || !prev || !next) return;

    let index = 0;

    function getVisibleCount() {

        if (window.innerWidth < 768) return 1;
        if (window.innerWidth < 1024) return 2;

        return 4;

    }

    function updateSlider() {

        const visible = getVisibleCount();

        const gap = 30;

        const cardWidth = cards[0].offsetWidth + gap;

        const maxIndex = cards.length - visible;

        if(index > maxIndex){
            index = maxIndex;
        }

        if(index < 0){
            index = 0;
        }

        track.style.transform =
            `translateX(-${index * cardWidth}px)`;

    }

    next.addEventListener("click", () => {

        const maxIndex = cards.length - getVisibleCount();

        if(index < maxIndex){
            index++;
            updateSlider();
        }

    });

    prev.addEventListener("click", () => {

        if(index > 0){
            index--;
            updateSlider();
        }

    });

    window.addEventListener("resize", updateSlider);

    updateSlider();

}
// ================= SCROLL TOP =================
function initScrollTop() {
    const btn = document.querySelector('.scroll-top');
    if (!btn) return;

    window.addEventListener('scroll', () => {
        btn.style.opacity = window.scrollY > 300 ? 1 : 0;
    });

    btn.addEventListener('click', () => {
        window.scrollTo({ top: 0, behavior: 'smooth' });
    });
}

// ================= INIT =================
document.addEventListener('DOMContentLoaded', async () => {

    await loadComponent('header', 'header-container');
    await loadComponent('footer', 'footer-container');

    // ⭐关键：等 DOM 真正插入后再初始化 header
    initHeaderScroll();
    initMobileMenu();
    adjustBodyPadding();
    observeHeaderHeight();

    initHorizontalSlider();
    initProductCarousel();
    initScrollTop();
});
