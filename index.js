document.addEventListener('DOMContentLoaded', () => {
    initAnnouncements();
});

function initAnnouncements() {
    var grailSlide = document.querySelector('.gr-announcement--grail ');
    var helpSlide = document.querySelector('.gr-announcement--help');

    if (!grailSlide || !helpSlide) {
        return;
    }

    // keep track whether to hide/display grail vs help slide
    var reverse = false;

    function flipSlides() {
        grailSlide.style.left = !reverse ? '-100%' : '0';
        helpSlide.style.right = !reverse ? '0' : '-100%';

        reverse = !reverse;
    }

    // flip the slides every 5 sec.
    setInterval(() => {
        flipSlides();
    }, 5000);
}