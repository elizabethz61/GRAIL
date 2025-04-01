function initHeader() {
    // load header in js so we dont need to add the same html to each page?
    var headerHtml = `
        <div class="header__container">
            <div class="header__content">
                <div>
                    <img class="header__logo" src="placeholder-logo.png" alt="GRAIL">
                </div>
                
                <nav>
                    <ul>
                        <li><a href="index/index.html">Home</a></li>
                        <li><a href="about.html">About</a></li>
                        <li><a href="#">Resources</a></li>
                        <li><a href="#">Help</a></li>
                    </ul>
                </nav>
                
                <input class="header__search" type="text" placeholder="Search...">
                
                <a href="#">User Info</a>
            </div>
        </div>
    `;

    var headerEl = document.querySelector('header');

    if (headerEl) {
        headerEl.innerHTML = headerHtml;
    }
}

function initSidebar() {
    let params = new URLSearchParams(document.location.search);

    // when initializing sidebar, I was thinking we could use the same page "questions"
    // for all the question pages
    // becuase when we get the data from firebase
    // its pretty much the same data just filtered on
    // only the current users questions or only the unsolved questions, etc
    var sidebarHtml =  `
        <a href="index.html" ${ 
            window.location.pathname 
            && window.location.pathname.indexOf('index.html') > -1 ? `class="selected"` : ''}>Home</a>
        <a href="questions.html?where=myquestions" ${ 
            window.location.pathname 
            && window.location.pathname.indexOf('questions.html') > -1 
            && params.get("where")
            && params.get("where") == 'myquestions' ? `class="selected"` : ''}>My Questions</a>
        <a href="questions.html?where=participation"${ 
            window.location.pathname 
            && window.location.pathname.indexOf('questions.html') > -1 
            && params.get("where")
            && params.get("where") == 'participation' ? `class="selected"` : ''}>My Participation</a>
        <a href="questions.html?where=unsolved"${ 
            window.location.pathname 
            && window.location.pathname.indexOf('questions.html') > -1 
            && params.get("where")
            && params.get("where") == 'unsolved' ? `class="selected"` : ''}>Unsolved</a>
        <a href="questions.html?where=solved"${ 
            window.location.pathname 
            && window.location.pathname.indexOf('questions.html') > -1 
            && params.get("where")
            && params.get("where") == 'solved' ? `class="selected"` : ''}>Solved</a>
        <a href="questions.html?where=all"${ 
            window.location.pathname 
            && window.location.pathname.indexOf('questions.html') > -1 
            && params.get("where")
            && params.get("where") == 'all' ? `class="selected"` : ''}>All</a>
    `;

    var sidebarEl = document.querySelector('.sidebar');

    if (sidebarEl) {
        sidebarEl.innerHTML = sidebarHtml;
    }
}

function initQuestionBoxes() {
    var questionSubmitEls = document.querySelectorAll('.gr-question-submit');

    if (questionSubmitEls && questionSubmitEls.length > 0) {
        questionSubmitEls.forEach(function(questionSubmitEl) {
            questionSubmitEl.addEventListener('click', ev => {
                console.log('submitted!');
            });
        });
    }
}

document.addEventListener('DOMContentLoaded', () => {

        console.log('hello!');

        // load header in js so we dont need to add the same html to each page?
        initHeader();

        initQuestionBoxes();

        initSidebar();
});