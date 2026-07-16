document.addEventListener('DOMContentLoaded', () => {
    /* ==========================================================================
       Custom Sleek Cursor
       ========================================================================== */
    const dot = document.querySelector('.cursor-dot');
    const outline = document.querySelector('.cursor-outline');
    const magnetics = document.querySelectorAll('.magnetic');

    let mouseX = 0, mouseY = 0;
    let outlineX = 0, outlineY = 0;

    window.addEventListener('mousemove', (e) => {
        mouseX = e.clientX;
        mouseY = e.clientY;
        
        // Dot follows instantly
        dot.style.left = `${mouseX}px`;
        dot.style.top = `${mouseY}px`;
    });

    function animateCursor() {
        // Smooth follow for outline
        let distX = mouseX - outlineX;
        let distY = mouseY - outlineY;
        
        outlineX = outlineX + (distX * 0.15);
        outlineY = outlineY + (distY * 0.15);
        
        outline.style.left = `${outlineX}px`;
        outline.style.top = `${outlineY}px`;
        
        requestAnimationFrame(animateCursor);
    }
    animateCursor();

    // Magnetic buttons logic
    magnetics.forEach(btn => {
        btn.addEventListener('mousemove', function(e) {
            const pos = this.getBoundingClientRect();
            const strength = this.getAttribute('data-strength') || 20;
            const mx = e.clientX - pos.left - pos.width/2;
            const my = e.clientY - pos.top - pos.height/2;
            
            this.style.transform = `translate(${mx * (strength/100)}px, ${my * (strength/100)}px)`;
            outline.classList.add('hover');
        });
        
        btn.addEventListener('mouseleave', function() {
            this.style.transform = 'translate(0px, 0px)';
            outline.classList.remove('hover');
        });
    });

    // Make cursor grow over clickable things
    document.querySelectorAll('a, button, input, select, .menu-card').forEach(el => {
        if(!el.classList.contains('magnetic')){
            el.addEventListener('mouseenter', () => outline.classList.add('hover'));
            el.addEventListener('mouseleave', () => outline.classList.remove('hover'));
        }
    });

    /* ==========================================================================
       Loader & Glitch
       ========================================================================== */
    const loader = document.getElementById('loader');
    setTimeout(() => {
        loader.style.opacity = '0';
        loader.style.visibility = 'hidden';
    }, 2000);

    /* ==========================================================================
       Scroll Progress & Header & Parallax
       ========================================================================== */
    const progressBar = document.querySelector('.scroll-progress');
    const header = document.getElementById('header');
    let lastScroll = 0;
    const parallaxElements = document.querySelectorAll('.parallax-element');

    window.addEventListener('scroll', () => {
        let scrollTop = window.scrollY;
        let docHeight = document.body.offsetHeight;
        let winHeight = window.innerHeight;
        let scrollPercent = scrollTop / (docHeight - winHeight);
        
        progressBar.style.width = scrollPercent * 100 + "%";

        // Hide header on scroll down, show on up
        if (scrollTop > lastScroll && scrollTop > 100) {
            header.classList.add('hide');
        } else {
            header.classList.remove('hide');
        }
        lastScroll = scrollTop;
    });

    /* ==========================================================================
       Accordion Gallery Logic
       ========================================================================== */
    const panels = document.querySelectorAll('.accordion-panel');
    panels.forEach(panel => {
        panel.addEventListener('click', () => {
            // Remove active from all
            panels.forEach(p => p.classList.remove('active'));
            // Add active to clicked
            panel.classList.add('active');
        });
        // We also want the cursor to expand over these panels!
        panel.addEventListener('mouseenter', () => outline.classList.add('hover'));
        panel.addEventListener('mouseleave', () => outline.classList.remove('hover'));
    });

    /* ==========================================================================
       Theme Toggle
       ========================================================================== */
    const themeBtn = document.getElementById('theme-toggle');
    const themeIcon = themeBtn.querySelector('i');
    
    const savedTheme = localStorage.getItem('midnight-theme');
    if(savedTheme) {
        document.body.setAttribute('data-theme', savedTheme);
        themeIcon.className = savedTheme === 'dark' ? 'fas fa-sun' : 'fas fa-moon';
    }

    themeBtn.addEventListener('click', () => {
        let current = document.body.getAttribute('data-theme');
        let next = current === 'dark' ? 'light' : 'dark';
        
        document.body.setAttribute('data-theme', next);
        localStorage.setItem('midnight-theme', next);
        themeIcon.className = next === 'dark' ? 'fas fa-sun' : 'fas fa-moon';
    });

    /* ==========================================================================
       Menu Rendering & 3D Tilt
       ========================================================================== */
    const menuContainer = document.getElementById('menu-container');
    const searchInput = document.getElementById('menu-search');
    const tabs = document.querySelectorAll('.tab-pill');
    let favorites = JSON.parse(localStorage.getItem('midnight-favs')) || [];

    function renderMenu(items) {
        menuContainer.innerHTML = '';
        items.forEach(item => {
            const isFav = favorites.includes(item.id);
            const html = `
                <div class="menu-card" data-id="${item.id}">
                    <div class="card-img-wrap">
                        <img src="${item.image}" alt="${item.title}">
                    </div>
                    <button class="like-btn ${isFav ? 'liked' : ''}">
                        <i class="fas fa-heart"></i>
                    </button>
                    <div class="card-info">
                        <div class="card-header">
                            <h3>${item.title}</h3>
                            <span class="price">${item.price}</span>
                        </div>
                        <p class="card-desc">${item.description}</p>
                    </div>
                </div>
            `;
            menuContainer.insertAdjacentHTML('beforeend', html);
        });

        initTilt();
        initLikes();
    }

    function initTilt() {
        const cards = document.querySelectorAll('.menu-card');
        cards.forEach(card => {
            card.addEventListener('mousemove', e => {
                const rect = card.getBoundingClientRect();
                const x = e.clientX - rect.left;
                const y = e.clientY - rect.top;
                const centerX = rect.width / 2;
                const centerY = rect.height / 2;
                
                const rotateX = ((y - centerY) / centerY) * -10; 
                const rotateY = ((x - centerX) / centerX) * 10;
                
                card.style.transform = `perspective(1000px) rotateX(${rotateX}deg) rotateY(${rotateY}deg) scale3d(1.02, 1.02, 1.02)`;
            });
            
            card.addEventListener('mouseleave', () => {
                card.style.transform = `perspective(1000px) rotateX(0) rotateY(0) scale3d(1, 1, 1)`;
            });
        });
    }

    function initLikes() {
        document.querySelectorAll('.like-btn').forEach(btn => {
            btn.addEventListener('click', function(e) {
                e.stopPropagation(); // stop bubbling
                
                const id = parseInt(this.closest('.menu-card').dataset.id);
                if(favorites.includes(id)){
                    favorites = favorites.filter(f => f !== id);
                    this.classList.remove('liked');
                } else {
                    favorites.push(id);
                    this.classList.add('liked');
                }
                localStorage.setItem('midnight-favs', JSON.stringify(favorites));
            });
        });
    }

    // Filters
    let currentCat = 'all';
    
    function updateFilters() {
        const term = searchInput.value.toLowerCase();
        const filtered = menuData.filter(item => {
            const matchCat = currentCat === 'all' || item.category === currentCat;
            const matchSearch = item.title.toLowerCase().includes(term) || item.description.toLowerCase().includes(term);
            return matchCat && matchSearch;
        });
        renderMenu(filtered);
    }

    tabs.forEach(tab => {
        tab.addEventListener('click', function() {
            tabs.forEach(t => t.classList.remove('active'));
            this.classList.add('active');
            currentCat = this.dataset.category;
            updateFilters();
        });
    });

    searchInput.addEventListener('input', updateFilters);
    renderMenu(menuData);

    /* ==========================================================================
       Booking Modal & Validation
       ========================================================================== */
    const modal = document.getElementById('booking-modal');
    const openBtn = document.getElementById('open-booking-btn');
    const closeBtn = document.querySelector('.close-btn');
    const form = document.getElementById('booking-form');

    openBtn.addEventListener('click', (e) => {
        e.preventDefault();
        modal.classList.add('active');
    });

    closeBtn.addEventListener('click', () => {
        modal.classList.remove('active');
        setTimeout(() => form.reset(), 400);
    });

    form.addEventListener('submit', (e) => {
        e.preventDefault();
        let valid = true;
        
        const name = document.getElementById('name');
        if(name.value.trim().length < 3) {
            name.parentElement.classList.add('invalid');
            valid = false;
        } else { name.parentElement.classList.remove('invalid'); }

        const email = document.getElementById('email');
        if(!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.value)) {
            email.parentElement.classList.add('invalid');
            valid = false;
        } else { email.parentElement.classList.remove('invalid'); }

        const date = document.getElementById('date');
        if(!date.value || new Date(date.value) < new Date(new Date().setHours(0,0,0,0))) {
            date.parentElement.classList.add('invalid');
            valid = false;
        } else { date.parentElement.classList.remove('invalid'); }
        
        const time = document.getElementById('time');
        if(!time.value) {
            time.parentElement.classList.add('invalid');
            valid = false;
        } else { time.parentElement.classList.remove('invalid'); }

        if(valid) {
            form.style.opacity = 0;
            setTimeout(() => {
                form.classList.add('hidden');
                document.getElementById('form-success').classList.remove('hidden');
            }, 300);
        }
    });

    form.querySelectorAll('input, select').forEach(input => {
        input.addEventListener('input', function() {
            this.parentElement.classList.remove('invalid');
        });
    });
});
