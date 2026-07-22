(function () {
    var collage = document.querySelector('.collage-gallery');
    var itineraryImages = document.querySelectorAll('.itinerary-item > img');

    if (!collage && !itineraryImages.length) return;

    var slides = [];
    var current = 0;

    var lightbox = document.createElement('div');
    lightbox.className = 'gallery-lightbox';
    lightbox.setAttribute('role', 'dialog');
    lightbox.setAttribute('aria-modal', 'true');
    lightbox.setAttribute('aria-label', 'Image gallery');
    lightbox.innerHTML =
        '<button type="button" class="gallery-lightbox-close" aria-label="Close">&times;</button>' +
        '<button type="button" class="gallery-lightbox-prev" aria-label="Previous image">' +
            '<svg fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 19l-7-7 7-7"/></svg>' +
        '</button>' +
        '<button type="button" class="gallery-lightbox-next" aria-label="Next image">' +
            '<svg fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7"/></svg>' +
        '</button>' +
        '<div class="gallery-lightbox-inner">' +
            '<img src="" alt="">' +
            '<p class="gallery-lightbox-caption"></p>' +
        '</div>';

    document.body.appendChild(lightbox);

    var lbImg = lightbox.querySelector('img');
    var lbCaption = lightbox.querySelector('.gallery-lightbox-caption');
    var btnClose = lightbox.querySelector('.gallery-lightbox-close');
    var btnPrev = lightbox.querySelector('.gallery-lightbox-prev');
    var btnNext = lightbox.querySelector('.gallery-lightbox-next');

    function slideFromImg(img) {
        return {
            src: img.getAttribute('src') || '',
            alt: img.getAttribute('alt') || ''
        };
    }

    function show(index) {
        if (!slides.length) return;
        current = (index + slides.length) % slides.length;
        var slide = slides[current];
        lbImg.src = slide.src;
        lbImg.alt = slide.alt;
        lbCaption.textContent = slide.alt;
        lbCaption.style.display = slide.alt ? 'block' : 'none';
        var multi = slides.length > 1;
        btnPrev.style.display = multi ? 'flex' : 'none';
        btnNext.style.display = multi ? 'flex' : 'none';
    }

    function open(slideSet, index) {
        slides = slideSet;
        show(index);
        lightbox.classList.add('is-open');
        document.body.style.overflow = 'hidden';
        btnClose.focus();
    }

    function close() {
        lightbox.classList.remove('is-open');
        document.body.style.overflow = '';
        lbImg.src = '';
        slides = [];
    }

    function bindTriggers(triggers, slideSet) {
        triggers.forEach(function (trigger, index) {
            trigger.setAttribute('role', 'button');
            trigger.setAttribute('tabindex', '0');
            trigger.setAttribute('aria-label', 'View larger image');

            trigger.addEventListener('click', function () {
                open(slideSet, index);
            });

            trigger.addEventListener('keydown', function (e) {
                if (e.key === 'Enter' || e.key === ' ') {
                    e.preventDefault();
                    open(slideSet, index);
                }
            });
        });
    }

    if (collage) {
        var collageItems = Array.prototype.slice.call(collage.querySelectorAll(':scope > div'));
        var collageSlides = collageItems.map(function (item) {
            return slideFromImg(item.querySelector('img'));
        }).filter(function (s) { return s.src; });

        if (collageSlides.length) {
            bindTriggers(collageItems, collageSlides);
        }
    }

    if (itineraryImages.length) {
        var itineraryList = Array.prototype.slice.call(itineraryImages);
        var itinerarySlides = itineraryList.map(slideFromImg).filter(function (s) { return s.src; });

        if (itinerarySlides.length) {
            bindTriggers(itineraryList, itinerarySlides);
        }
    }

    btnClose.addEventListener('click', close);
    btnPrev.addEventListener('click', function () { show(current - 1); });
    btnNext.addEventListener('click', function () { show(current + 1); });

    lightbox.addEventListener('click', function (e) {
        if (e.target === lightbox) close();
    });

    document.addEventListener('keydown', function (e) {
        if (!lightbox.classList.contains('is-open')) return;
        if (e.key === 'Escape') close();
        if (e.key === 'ArrowLeft') show(current - 1);
        if (e.key === 'ArrowRight') show(current + 1);
    });
})();
