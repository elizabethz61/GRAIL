function initHeader() {
    // load header in js so we dont need to add the same html to each page

    // if there is a user logged in, display log out menu item instead of log in and regsiter
    var currentUser = localStorage.user ? JSON.parse(localStorage.user) : null;

    var headerHtml = `
        <div class="header__container">
            <div class="header__content">
                <div class="logo">
                    <a href="index.html">
                        <img src="images/placeholder-logo.png" alt="GRAIL Logo">
                    </a>
                </div>
                <div class="header__search-container">
                    <input type="text" class="header__search" placeholder="Search questions...">
                </div>
                <div class="header__actions">
                    <nav>
                        <ul>
                            ${ 
                                !currentUser 
                                || !currentUser.username 
                                ? '<li><a href="login.html">Login</a></li><li><a href="register.html">Register</a></li>' 
                                : '<li><span class="gr-logout">Logout</span></li>' 
                            }
                            <li><a href="about.html">About</a></li>
                        </ul>
                    </nav>
                    <button id="darkModeToggle" class="dark-mode-toggle" aria-label="Toggle Dark Mode">
                        <span class="dark-mode-toggle__icon">🌙</span>
                    </button>
                </div>
            </div>
        </div>
    `;

    var headerEl = document.querySelector('header');

    if (headerEl) {
        headerEl.innerHTML = headerHtml;
    }

    var logoutEl = document.querySelector(".gr-logout");

    if (logoutEl) {        
        logoutEl.addEventListener('click', ev => {
            localStorage.removeItem('user');

            window.location.href = '/login.html';
        });
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
            && (
                !params.get("where")
                || params.get("where") == 'all'
            ) ? `class="selected"` : ''}>All</a>
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

                var currentUser = JSON.parse(localStorage.user);
                
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
                    status: 'Unsolved',
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

function initDarkMode() {
    var js = document.createElement("script");
    
    js.src = 'darkmode.js';

    document.body.appendChild(js);
}


function initLogin() {
    var loginEl = document.querySelector('#login-form');

    if (!loginEl) {
        return;
    }

    loginEl.addEventListener('submit', ev => {
        ev.preventDefault();

        if (!loginEl.checkValidity()) {
            loginEl.reportValidity();
            return;
        }

        // get form data
        const formData = new FormData(loginEl);
        const input = Object.fromEntries(formData.entries());

        var ref = firebase.database().ref('/users/' + input.username);            
        ref.on('value', function (snapshot) {
            const data = snapshot.val();

            // if user does exist
            // if creds are legit, redirect to index and store user in session storage
            if (data && input.username == data.username && input.password == data.passkey) {
                localStorage.setItem('user', JSON.stringify(data));

                window.location.href = '/index.html';
            } else { // if user doesn't exist - show error
                document.querySelector('.gr-form__error').style.display = 'block';
            }
        }, function (error) {
            console.log("Something went wrong logging user in: " + error.code);
        });
    });
}

function initRegister() {
    var registerEl = document.querySelector('#register-form');
    var passwordEl = document.querySelector('#password');
    var confirmPasswordEl = document.querySelector('#confirm-password');
    var usernameEl = document.querySelector('#username');

    if (!registerEl || !confirmPasswordEl || !passwordEl || !usernameEl) {
        return;
    }

    confirmPasswordEl.addEventListener('change', ev => {
        if (confirmPasswordEl.value != passwordEl.value) {
            confirmPasswordEl.setCustomValidity('Password does not match.');
            confirmPasswordEl.reportValidity();
        } else {
            confirmPasswordEl.setCustomValidity('');
        }
    });

    usernameEl.addEventListener('input', ev => {
        if (/[^A-Za-z0-9 ]/.test(usernameEl.value)) {
            console.log('confirmPasswordEl.value ', usernameEl.value);

            usernameEl.setCustomValidity('Username must not contain special characters.');
            usernameEl.reportValidity();
        } else {
            usernameEl.setCustomValidity('');
        }
    });
    
    registerEl.addEventListener('submit', ev => {
        ev.preventDefault();

        // get data from form as object
        const formData = new FormData(registerEl);
        const input = Object.fromEntries(formData.entries());

        var first = true;

        // check if username already exists in firebase
        var ref = firebase.database().ref('/users/' + input.username);            
        ref.once('value', function (snapshot) {
            const data = snapshot.val();

            console.log('data', data);

            // if user does exist
            if (first) {
                if (data && input.username == data.username) {
                    document.querySelector('.gr-form__error').style.display = 'block';
                    document.querySelector('.gr-form__success').style.display = 'none';
                } else {
                    document.querySelector('.gr-form__error').style.display = 'none';

                    firebase.database().ref('users/' + input.username).set({
                        username: input.username,
                        email: input.email,
                        name: null, // will be able to set later in profile or sum
                        role: 'student', // student by default, can add mod flow later
                        passkey: input.password
                    }, (error) => {
                        if (error) {
                            // The write failed...
                            console.log('Error registering user: ', error);
                        } else {
                            document.querySelector('.gr-form__success').style.display = 'block';
                        }
                    });
                }
            }

            first = false;
        }, function (error) {
            console.log("Something went wrong registering user: " + error.code);
        });
    });
}

function initQuestions() {
    var questionBoxEl = document.querySelector('.qr-questions');
    var questionEntriesEl = document.querySelector('.gr-question__entries');

    if (!questionBoxEl || !questionEntriesEl) {
        return;
    }

    // get 3 latest questions
    var ref = firebase.database().ref('/posts').orderByChild('timestamp').limitToLast(3);
    ref.on('value', function (snapshot) {
        const data = snapshot.val();

        if (data) {
            questionEntriesEl.innerHTML = Object.keys(data).map(key => {
                var date = 'N/A';

                // format the date nicely for user display
                if (data[key].dueDate) {
                    var dateSplits = data[key].dueDate.split('-');

                    switch(dateSplits[1]) {
                        case '01':
                            date = 'January';
                            break;
                        case '02':
                            date = 'February';
                            break;
                        case '03':
                            date = 'March';
                            break;
                        case '04':
                            date = 'April';
                            break;
                        case '05':
                            date = 'May';
                            break;
                        case '06':
                            date = 'June';
                            break;
                        case '07':
                            date = 'July';
                            break;
                        case '08':
                            date = 'August';
                            break;
                        case '09':
                            date = 'September';
                            break;
                        case '10':
                            date = 'October';
                            break;
                        case '11':
                            date = 'November';
                            break;
                        case '12':
                            date = 'December';
                            break;
                    }

                    date += ' ' + dateSplits[2] + ', ';

                    date += dateSplits[0];
                }
                
                return `
                    <div class="question-entry">
                        <div class="question-entry__info">
                            <h4 class="question-entry__title">${data[key].title || 'Untitled'}</h4>
                            <span class="question-entry__subject">${data[key].subject}</span>
                        </div>
                        
                        <div class="question-entry__actions">
                            <span class="question-entry__duedate">Due: ${date}</span>
                            <a href="/question.html?key=${key}" class="gr-btn gr-secondary gr-answer">Answer</a>
                        </div>
                    </div>
                `
            }).join('');

            questionBoxEl.style.display = 'block';
        }
    }, function (error) {
        console.log("Something went wrong logging user in: " + error.code);
    });
}

document.addEventListener('DOMContentLoaded', () => {

    // get current user from session
    var currentUser = null;

    if (localStorage.getItem('user')) {
        currentUser = JSON.parse(localStorage.user);
    }

    // if there is no current user, redirect them to the login screen
    if (!currentUser && window.location.href.indexOf('login.html') == -1) {
        console.log("wut");
        if (window.location.href.indexOf('register.html') == -1) {
            console.log("wut 2");
            window.location.href = '/login.html';
        }
    }

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

    // load header in js so we dont need to add the same html to each page
    initHeader();

    initQuestionBoxes();

    initSidebar();

    if (window.location.href.indexOf('login.html') > -1) {
        initLogin();
    }

    if (window.location.href.indexOf('register.html') > -1) {
        initRegister();
    }

    // only for the index page
    // init recent questions box
    if (window.location.href.indexOf('index.html') > -1) {
        initQuestions();
    }

    // add dark mode to every page without having to manually include script on every page
    // also takes care of issue when dark mode tries to load before the header menu exists
    initDarkMode();
});