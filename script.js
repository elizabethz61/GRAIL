function initHeader() {
    // load header in js so we dont need to add the same html to each page?
    var headerHtml = `
        <div class="header__container">
            <div class="header__content">
                <div>
                    <img class="header__logo" src="images/placeholder-logo.png" alt="GRAIL">
                </div>
                
                <nav>
                    <ul>
                        <li><a href="index.html">Home</a></li>
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
    // get every question box/form on the current page
    var questionSubmitEls = document.querySelectorAll('.gr-question__submit');

    // loop through each and listen for submissions
    if (questionSubmitEls && questionSubmitEls.length > 0) {
        questionSubmitEls.forEach(function(questionSubmitEl) {
            var form = questionSubmitEl.closest('.gr-question');

            var titleEl = form.querySelector("input[name='title']");
            var subjectEl = form.querySelector("select[name='subject']");
            var courseEl = form.querySelector("select[name='course']");
            var contentEl = form.querySelector("textarea[name='content']");

            var formEls = [
                titleEl,
                subjectEl,
                courseEl,
                contentEl
            ];

            formEls.forEach(function(formEl) {
                formEl.addEventListener('change', ev => {
                    formEl.nextElementSibling.style.display = formEl.checkValidity() ? 'none' : 'block';
                });
            });

            questionSubmitEl.addEventListener('click', ev => {
                for (var i = 0; i <= formEls.length - 1; i++) {
                    var formEl = formEls[i];
                    
                    if (!formEl.checkValidity()) {
                        formEl.nextElementSibling.style.display = 'block';
                        return;
                    } else {
                        formEl.nextElementSibling.style.display = 'none';
                    }
                }

                // todo > get current user, for now, hardcoding
                var currentUser = {
                    username: 'eljzakula',
                    email: "eljzakula@gmail.com",
                    superuser: true
                }
                
                // if form is valid, save question to database

                // create random key for each question
                var questionKey = Math.random().toString(36).substring(2,7);

                // get data from form as object
                const formData = new FormData(form);
                const input = Object.fromEntries(formData.entries());

                // save in questions object
                firebase.database().ref('posts/' + questionKey).set({
                    postID: questionKey,
                    title: input['title'],
                    subject: input['subject'],
                    course: input['course'],
                    dueDate: input['dueDate'],
                    content: input['content'],
                    authorID: currentUser.username,
                    timestamp: Date.now()
                }, (error) => {
                    if (error) {
                        console.log('Error saving question > ', error);

                        // make sure the success message is hidden
                        form.querySelector('.gr-form__success').style.display = 'none';

                        // display error message
                        form.querySelector('.gr-form__error').style.display = 'block';
                    } else {
                        // clear the form for the user
                        form.reset();
                        
                        // make sure the error message is hidden
                        form.querySelector('.gr-form__error').style.display = 'none';

                        // display success message
                        form.querySelector('.gr-form__success').style.display = 'block';
                    }
                });
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


        // FIREBASE
        var firebaseConfig = {
            apiKey: "AIzaSyAbFHd3lmb0Z8WYlbFV6elB2YzIQIk-uNI",
            authDomain: "grail-mga.firebaseapp.com",
            projectId: "grail-mga",
            storageBucket: "grail-mga.firebasestorage.app",
            messagingSenderId: "718774857777",
            appId: "1:718774857777:web:f940906435844c3a93a510",
            measurementId: "G-Z1BJ7XQPV2",
            databaseURL: "https://grail-mga-default-rtdb.firebaseio.com"
        };

        // initialize
        firebase.initializeApp(firebaseConfig);

        // get the database
        var database = firebase.database();

        // doc on how to structure data -> https://firebase.google.com/docs/database/web/structure-data

        // so far we'll need three data objects
        // 1. questions
        // 2. answers
        // 3. users

        // will store in flattened data structure like in doc example

        // example user data for now, can add other attributes later
        // this is just to get started
        // {
        //     username: 'eljzakula',
        //     email: 'eljzakula@gmail.com',
        //     superuser: true
        // }

        // each user key will have to be their username

        // doc how to write data to database -> https://firebase.google.com/docs/database/web/read-and-write#web_1

        // note: using set function overrites data if it currently exists
        if (false) { // working example how to set data in database
            firebase.database().ref('users/' + 'eljzakula').set({
                username: 'eljzakula',
                email: 'eljzakula@gmail.com',
                superuser: true
            }, (error) => {
                if (error) {
                    // The write failed...
                    console.log('error setting data', error);
                } else {
                    // Data saved successfully!
                    console.log('data saved');
                }
            });
        }
});