
document.addEventListener('DOMContentLoaded', () => {

    console.log('index js!');

    initAnnouncements();
});

function initAnnouncements() {
    var announcementsEl = document.querySelector('.gr-announcements');

    if (!announcementsEl) {
        return;
    }

    console.log('announcementsEl', announcementsEl);
    
    var announcementEls = announcementsEl.querySelectorAll('.gr-announcement');

    if (!announcementEls) {
        return;
    }

    console.log('announcementEls', announcementEls);

    let currentIndex = 0;

    function flipSlides() {
        // const slideWidth = announcementEls[0].offsetWidth;
        
        // // Slide the whole slider container based on the current index
        // announcementsEl.style.transform = `translateX(-${currentIndex * slideWidth}px)`;

        // // Hide slides that are not the current one
        // announcementEls.forEach((slide, index) => {
        //     if (index === currentIndex) {
        //         slide.classList.remove('hidden');
        //     } else {
        //         slide.classList.add('hidden');
        //     }
        // });
    }

    flipSlides();

    // auto slide the banners
    setInterval(() => {
        currentIndex = (currentIndex + 1) % announcementEls.length;
        
        flipSlides();
    }, 3000);

    // var slides = [
    //     {
    //         title: 'Welcome To GRAIL!',
    //         content: ''
    //     }
    // ]

    // announcementsEl.innerHTML = ``;
}
