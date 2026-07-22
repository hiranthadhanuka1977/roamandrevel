(function () {
    var header = document.getElementById('header') || document.querySelector('.site-header');
    var navToggle = document.querySelector('.nav-toggle');
    var mainNav = document.querySelector('.main-nav');

    if (header) {
        var solid = function () {
            header.classList.toggle('is-solid', window.scrollY > 60);
        };
        solid();
        window.addEventListener('scroll', solid, { passive: true });
    }

    if (navToggle && mainNav) {
        navToggle.addEventListener('click', function () {
            var open = mainNav.classList.toggle('open');
            navToggle.setAttribute('aria-expanded', open);
        });
        mainNav.querySelectorAll('a').forEach(function (link) {
            link.addEventListener('click', function () {
                mainNav.classList.remove('open');
                navToggle.setAttribute('aria-expanded', 'false');
            });
        });
    }

    document.querySelectorAll('a[href*="#"]').forEach(function (anchor) {
        anchor.addEventListener('click', function (e) {
            var href = anchor.getAttribute('href');
            if (!href || href === '#') return;
            var i = href.indexOf('#');
            if (i === -1) return;
            var hash = href.substring(i);
            if (hash.length <= 1) return;
            var page = href.substring(0, i) || window.location.pathname.split('/').pop();
            var current = window.location.pathname.split('/').pop() || 'index.html';
            if (page && page !== current && page !== '') return;
            var target = document.querySelector(hash);
            if (!target) return;
            e.preventDefault();
            window.scrollTo({
                top: target.getBoundingClientRect().top + window.scrollY - 80,
                behavior: 'smooth'
            });
        });
    });

    document.querySelectorAll('.copyright-year').forEach(function (el) {
        el.textContent = new Date().getFullYear();
    });
})();
