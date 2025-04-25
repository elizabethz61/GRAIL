var courses = {
    'ITEC2260': 'ITEC 2260 - Intro to Computer Programming',
    'ITEC2270': 'ITEC 2270 - Application Development',
    'ITEC3155': 'ITEC 3155 - Systems Analysis and Design',
    'ITEC3235': 'ITEC 3235 - Human Computer Interaction',
    'ITEC4261': 'ITEC 4261 - Intro to JAVA Programming',
    'ITEC4264': 'ITEC 4264 - Data Structures'
}

function initFlags() {
    var flagEls = document.querySelectorAll('.question-entry .question-entry__actions svg');

    if (!flagEls) {
        return;
    }

    flagEls.forEach(flagEl => {
        flagEl.addEventListener('click', ev => {
            ev.preventDefault();
            ev.stopPropagation();
            
            var questionEl = ev.target.closest('.question-entry');

            var isFlagged = flagEl.getAttribute('fill') == 'red' ? true : false;
    
            firebase.database().ref('posts/' + questionEl.dataset.key).update({
                flagged: !isFlagged
            }, (error) => {
                if (error) {
                    // The write failed...
                    console.log('Error flagging post: ', error);
                } else {
                    flagEl.setAttribute('fill', isFlagged ? 'black' : 'red');
                }
            });
        });
    });
}

function initSolveFlags() {
    var solveEls = document.querySelectorAll('.gr-flags .gr-solve svg');

    if (!solveEls || !solveEls.length) {
        return;
    }

    solveEls.forEach(solveEl => {
        if (solveEl.closest('.gr-solve').dataset.myQuestion != 'true') {
            return;
        }

        solveEl.addEventListener('click', ev => {
            ev.stopPropagation();
            ev.preventDefault();

            if (solveEl.closest('.gr-solve').dataset.myQuestion != 'true') {
                return;
            }

            var questionEl = ev.target.closest('.question-entry');

            var isSolved = solveEl.getAttribute('fill') == 'green' ? true : false;
    
            firebase.database().ref('posts/' + questionEl.dataset.key).update({
                status: isSolved ? 'Unsolved' : 'Solved'
            }, (error) => {
                if (error) {
                    // The write failed...
                    console.log('Error setting post as solved: ', error);
                } else {
                    solveEl.setAttribute('fill', isSolved ? 'green' : 'black');
                }
            });
        });
    });
}

function initHeader() {
    // load header in js so we dont need to add the same html to each page

    // if there is a user logged in, display log out menu item instead of log in and regsiter
    var currentUser = localStorage.user ? JSON.parse(localStorage.user) : null;
    var profilePic = null;

    if (localStorage.getItem('profilePic')) {
        profilePic = JSON.parse(localStorage.getItem('profilePic')).src;
    }

    var headerHtml = `
        <div class="header__container">
            <div class="header__content">
                <div class="logo">
                    <a href="index">
                        <img src="images/placeholder-logo.png" alt="GRAIL Logo">
                    </a>
                </div>
                <div class="header__search-container">
                    <input type="text" class="header__search" placeholder="Search questions...">
                    <div class="search__results" style="display: none;"></div>
                </div>
                <div class="header__actions">
                    <nav>
                        <ul>
                            ${ 
                                !currentUser 
                                || !currentUser.username 
                                ? '<li><a href="login">Login</a></li><li><a href="register">Register</a></li>' 
                                : '<li><span class="gr-logout">Logout</span></li>' 
                            }
                            <li><a href="about">About</a></li>
                        </ul>
                    </nav>
                    <button id="darkModeToggle" class="dark-mode-toggle" aria-label="Toggle Dark Mode">
                        <span class="dark-mode-toggle__icon">🌙</span>
                    </button>
                    ${ currentUser 
                        ? `<a class="gr-profile" href="profile">${profilePic ? `<img src="${profilePic}" alt="Profile Pic">` : currentUser.username[0].toUpperCase()}</a>` 
                        : ''
                    }
                </div>
            </div>
        </div>
    `;

    var headerEl = document.querySelector('header');

    if (headerEl) {
        headerEl.innerHTML = headerHtml;
    }

    // profile pic
    // get user profile pic if it exists
    // if already added to cache, skip
    if (!localStorage.getItem('profilePic') && currentUser && currentUser.username) {
        var imageRef = firebase.database().ref('/images/' + currentUser.username);
        imageRef.once('value', function (snapshot) {
            const imageData = snapshot.val();

            if (imageData && imageData.src) {
                localStorage.setItem('profilePic', JSON.stringify(imageData));

                var profileImgEl = headerEl.querySelector('.gr-profile');

                if (profileImgEl) {
                    profileImgEl.innerHTML = `<img src="${imageData.src}" alt="Profile Pic">`;
                }
            }
        }, function (error) {
            console.log("Something went wrong fetching pfp: " + error.code);
        });
    }

    var logoutEl = document.querySelector(".gr-logout");

    if (logoutEl) {        
        logoutEl.addEventListener('click', ev => {
            firebase.auth().signOut()
                .then(() => {
                    console.log("User signed out.");
                    // Optionally redirect or show a message
                    localStorage.removeItem('user');
                    window.location.href = "/login.html"; // or wherever you want
                })
                .catch((error) => {
                    console.error("Error signing out:", error);
                });
        });
    }

    var allPosts = {};

    //get all posts for search input
    var ref = firebase.database().ref('/posts');
    ref.once('value', function (snapshot) {
        const data = snapshot.val();
        if (data) {
            allPosts = data;
        }
    }, function (error) {
        console.log("Something went wrong loading question: " + error.code);
    });

    // init search
    // doing js search for now, because current db solution only has equalTo search
    // basically this is proof of concept, and if mga wants to adopt it, then can add actual search
    var searchInputEl = document.querySelector('.header__search');
    var searchResultsEl = document.querySelector('.search__results');

    searchInputEl.value = '';

    let debounceTimer;

    searchInputEl.addEventListener('input', ev => {
        clearTimeout(debounceTimer); // Reset the timer

        debounceTimer = setTimeout(() => {
            var searchResults = Object.keys(allPosts).filter(key => {
                // if search query matches a title, return the item
                if (allPosts[key].title && allPosts[key].title.toLowerCase().indexOf(searchInputEl.value.toLowerCase()) > -1) {
                    return key;
                }

                if (allPosts[key].subject && allPosts[key].subject.toLowerCase().indexOf(searchInputEl.value.toLowerCase()) > -1) {
                    return key;
                }

                if (allPosts[key].course && allPosts[key].course.toLowerCase().indexOf(searchInputEl.value.toLowerCase()) > -1) {
                    return key;
                }
            });
            
            if (searchResults.length > 0) {
                searchResultsEl.innerHTML = searchResults.map(key => `
                    <a href="/question?key=${key}" class="search__result">
                        <span class="search__title">${allPosts[key].title}</span>
                        <span class="search__subject">${allPosts[key].subject}</span>
                        <span class="search__course">${allPosts[key].course}</span>
                    </a>
                `).join('');
            } else {
                searchResultsEl.innerHTML = `
                    <div class="search__result">
                        No Results
                    </div>
                `;
            }

            searchResultsEl.style.display = 'block';
        }, 500);

    });

    // hide results if user clicks out
    document.addEventListener('click', (event) => {
        // Check if the click was outside both the input and results
        if (!searchInputEl.contains(event.target) && !searchInputEl.contains(event.target)) {
            searchResultsEl.style.display = 'none';
            searchInputEl.value = '';
        }
    });
}

function initSidebar() {
    let params = new URLSearchParams(document.location.search);

    // when initializing sidebar, I was thinking we could use the same page "questions"
    // for all the question pages
    // becuase when we get the data from firebase
    // its pretty much the same data just filtered on
    // only the current users questions or only the unsolved questions, etc
    var sidebarHtml =  `
        <a href="index" ${ 
            (!!window.location.href 
            && window.location.href.indexOf('index') > -1)
            || (window.location.pathname == '/')
            ? `class="selected"` : ''}>Home</a>
        <a href="questions?where=myquestions" ${ 
            !!window.location.href 
            && window.location.href.indexOf('questions') > -1 
            && params.get("where")
            && params.get("where") == 'myquestions' ? `class="selected"` : ''}>Questions</a>
        <a href="answers"${ 
            !!window.location.href 
            && window.location.href.indexOf('answers') > -1 ? `class="selected"` : ''}>Participation</a>
        <a href="questions?where=unsolved"${ 
            !!window.location.href 
            && window.location.href.indexOf('questions') > -1 
            && params.get("where")
            && params.get("where") == 'unsolved' ? `class="selected"` : ''}>Unsolved</a>
        <a href="questions?where=solved"${ 
            !!window.location.href 
            && window.location.href.indexOf('questions') > -1 
            && params.get("where")
            && params.get("where") == 'solved' ? `class="selected"` : ''}>Solved</a>
        <a href="questions?where=all"${ 
            !!window.location.href 
            && window.location.href.indexOf('questions') > -1 
            && (
                !params.get("where")
                || params.get("where") == 'all'
            ) ? `class="selected"` : ''}>All</a>
    `;

    var sidebarEl = document.querySelector('.gr-sidebar');

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
            var filesEl = form.querySelector('input[name="files"]');
            var fileListEl = form.querySelector('ul');
            var filesInputLabelEl = form.querySelector('#labelForFiles');

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

            // logic for file selecting
            var selectedFiles = [];

            function renderFileList() {
                fileListEl.innerHTML = '';
                
                selectedFiles.forEach((file, index) => {
                    const li = document.createElement('li');
                    li.className = 'file-item';

                    const span = document.createElement('span');
                    span.className = 'file-name';
                    span.textContent = file.name;

                    const removeIcon = document.createElementNS("http://www.w3.org/2000/svg", "svg");
                    removeIcon.setAttribute("viewBox", "0 0 24 24");
                    removeIcon.classList.add('remove-icon');
                    removeIcon.innerHTML = `<path d="M18 6L6 18M6 6l12 12" stroke="currentColor" stroke-width="2" stroke-linecap="round"/>`;
            
                    removeIcon.addEventListener('click', () => {
                        selectedFiles.splice(index, 1);
                        renderFileList();
                    });

                    li.appendChild(span);
                    li.appendChild(removeIcon);
                    fileListEl.appendChild(li);
                });
            }

            filesInputLabelEl.addEventListener('click', ev => filesEl.click());

            filesEl.addEventListener('change', ev => {
                const files = Array.from(ev.target.files);
                selectedFiles = selectedFiles.concat(files);

                // clear file input to allow reselecting same file
                filesEl.value = '';

                renderFileList();

                fileListEl.style.display = 'block';
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
                    author: currentUser.username,
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

                // save files in questions object
                if (selectedFiles && selectedFiles.length > 0) {

                    // compile all base64 strings 
                    var filePromises = [];
                    selectedFiles.forEach(file => {
                        var promise = new Promise((resolve, reject) => {
                            const reader = new FileReader();
                            
                            reader.readAsDataURL(file);
                            reader.onloadend = () => resolve({
                                name: file.name,
                                base64: reader.result,
                                key: questionKey
                            });
                            reader.onerror = reject;
                        });

                        filePromises.push(promise);
                    });

                    Promise.all(filePromises)
                        .then(base64Files => {
                            var index = 0;
                            base64Files.forEach(file => {
                                firebase.database().ref('files/' + questionKey + '-' + index).set(file, (error) => {
                                    if (error) {
                                        console.log('Error uploading file for question > ', questionKey, error);
                                    }
                                });
                                index++;
                            });
                        });

                    // reset selected files after done
                    selectedFiles = [];
                    renderFileList();
                }
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
    var errorEl = document.querySelector('.gr-form__error');

    if (!loginEl || !errorEl) {
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

        // fix - some security issues
        firebase.auth().signInWithEmailAndPassword(input.email, input.password)
            .then((userCredential) => {
                // Signed in
                var user = userCredential.user;

                var ref = firebase.database().ref('/users/' + user.uid);
                ref.once('value', function (snapshot) {
                    const data = snapshot.val();
                    if (data) {
                        if (!user.emailVerified || user.disabled || (data.banned && data.banned == true)) {
                            errorEl.innerHTML = !user.emailVerified 
                                ? `Error: Your email address has not been verified. Please verify your email address to continue.` 
                                : `Error: Your account has been disabled, please contact <a href="mailto:helpdesk@mga.edu">helpdesk@mga.edu</a> for further information.`;
                            errorEl.style.display = 'block';
                        } else {
                            window.location.href = 'index';
                        }
                    }
                }, function (error) {
                    console.log("Something went wrong loading question: " + error.code);
                });
            })
            .catch((error) => {
                var errorMessage = JSON.parse(error.message);

                errorEl.innerHTML = errorMessage && errorMessage.error && errorMessage.error.message ? `Error: ${errorMessage.error.message}` : `Something went wrong, please try again or contact <a href="mailto:helpdesk@mga.edu">helpdesk@mga.edu</a>`;
                errorEl.style.display = 'block';
            });
    });
}

function initRegister() {
    var registerEl = document.querySelector('#register-form');
    var passwordEl = document.querySelector('#password');
    var confirmPasswordEl = document.querySelector('#confirm-password');
    var usernameEl = document.querySelector('#username');
    var emailEl = document.querySelector('#email');
    var successEl = document.querySelector('.gr-form__success');
    var errorEl = document.querySelector('.gr-form__error');

    if (!registerEl || !confirmPasswordEl || !passwordEl || !usernameEl || !emailEl || !errorEl) {
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

    emailEl.addEventListener('change', ev => {
        if (!emailEl.value.endsWith('@mga.edu')) {
            emailEl.setCustomValidity('Email must be an @mga.edu email address.');
            emailEl.reportValidity();
        } else {
            emailEl.setCustomValidity('');
        }
    });
    
    registerEl.addEventListener('submit', ev => {
        ev.preventDefault();

        if (!ev.target.checkValidity()) {
            ev.target.reportValidity();
            return;
        }

        // get data from form as object
        const formData = new FormData(registerEl);
        const input = Object.fromEntries(formData.entries());

        if (!input.email.endsWith('@mga.edu')) {
            emailEl.setCustomValidity('Email must be an @mga.edu email address.');
            emailEl.reportValidity();
        } else {
            emailEl.setCustomValidity('');
        }

        firebase.auth().createUserWithEmailAndPassword(input.email, input.password)
            .then((userCredential) => {
                const user = userCredential.user;

                // Add additional profile info to firebase
                firebase.database().ref('users/' + user.uid).set({
                    email: user.email,
                    username: input.username,
                    timestamp: Date.now(),
                    superuser: false,
                    uid: user.uid
                }, (error) => {
                    if (error) {
                        console.log('Error saving answer > ', error);
                    } else {
                        console.log('added additional profile info');
                    }
                });
            
                // Send email verification
                user.sendEmailVerification()
                    .then(() => {
                        console.log("Verification email sent to:", user, user.email);

                        errorEl.style.display = 'none';

                        successEl.innerHTML = `Verification email sent to: ` + user.email + `. Once verified, navigate to the <a href="login">login page</a> to sign in.`;
                        successEl.style.display = 'block';
                    })
                    .catch((error) => {
                        console.error("Error sending verification email:", error, error.message);

                        successEl.style.display = 'none';

                        errorEl.innerHTML = `Error sending verification email: ` + error.message;
                        errorEl.style.display = 'block';
                    });
            
                })
            .catch((error) => {
                console.error("Registration error:", error, error.message);
                
                successEl.style.display = 'none';

                errorEl.innerHTML = `Registration error: ` + error.message;
                errorEl.style.display = 'block';
            });
    });
}

function initQuestions() {
    var questionBoxEl = document.querySelector('.qr-questions');
    var questionEntriesEl = document.querySelector('.gr-question__entries');

    if (!questionBoxEl || !questionEntriesEl) {
        return;
    }

    var currentUser = JSON.parse(localStorage.getItem('user'));

    // get 3 latest questions
    var ref = firebase.database().ref('/posts').orderByChild('timestamp').limitToLast(3);
    ref.on('value', function (snapshot) {
        const data = snapshot.val();

        if (data) {
            questionEntriesEl.innerHTML = Object.keys(data)
                .filter(key => {
                    if (currentUser.superuser) {
                        return key;
                    } else {
                        if (!data[key].flagged || data[key].author == currentUser.username) {
                            return key;
                        }
                    }
                })
                .map(key => {
                    var date = null;

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
                        <a href="/question?key=${key}" class="question-entry" data-key="${key}">
                            <div class="question-entry__info">
                                <h4 class="question-entry__title">${data[key].title || 'Untitled'}</h4>
                                <span class="question-entry__subject">${data[key].subject}</span>
                                <span style="margin-top: 6px;" class="question-entry__subject">${courses[data[key].course]}</span>
                            </div>
                            
                            <div class="question-entry__actions">
                             <div class="gr-flags">
                                    ${ data[key].author == currentUser.username || data[key].status == 'Solved' ? `
                                        <div class="gr-solve" data-my-question="${data[key].author == currentUser.username}">
                                            <svg 
                                                xmlns="http://www.w3.org/2000/svg" 
                                                height="24px" viewBox="0 -960 960 960" width="24px" 
                                                fill="${data[key].status && data[key].status == 'Solved' ? 'green' : 'black'}"
                                            >
                                                <path d="M480-80q-83 0-156-31.5T197-197q-54-54-85.5-127T80-480q0-83 31.5-156T197-763q54-54 127-85.5T480-880q65 0 123 19t107 53l-58 59q-38-24-81-37.5T480-800q-133 0-226.5 93.5T160-480q0 133 93.5 226.5T480-160q133 0 226.5-93.5T800-480q0-18-2-36t-6-35l65-65q11 32 17 66t6 70q0 83-31.5 156T763-197q-54 54-127 85.5T480-80Zm-56-216L254-466l56-56 114 114 400-401 56 56-456 457Z"/>
                                            </svg>

                                            <div class="tooltip">
                                                ${data[key].author == currentUser.username ? 'Click to set your question as solved.' : data[key].status == 'Solved' ? 'This question is solved' : ''}
                                            </div>
                                        </div>
                                    ` : ''}
                                    
                                    ${ currentUser.superuser || (data[key].author == currentUser.username && data[key].flagged) ? `
                                        <div class="gr-flag">
                                            <svg xmlns="http://www.w3.org/2000/svg" height="24px" viewBox="0 -960 960 960" width="24px" fill="${data[key].flagged && data[key].flagged == true ? 'red' : '#000000'}">
                                                <path d="M200-120v-680h360l16 80h224v400H520l-16-80H280v280h-80Zm300-440Zm86 160h134v-240H510l-16-80H280v240h290l16 80Z"/>
                                            </svg>
                                            ${ currentUser.superuser ? '<div class="tooltip">Click to flag the question and hide it from users.</div>' : '' }
                                        </div>
                                    ` : ''}
                                </div>
                                ${date ? `<span class="question-entry__duedate">Due: ${date}</span>` : ''}
                                <button class="gr-btn gr-secondary gr-answer">View</button>
                            </div>
                        </a>
                    `
                })
                .join('');

            questionBoxEl.style.display = 'block';

            // allow moderator users to flag questions
            if (currentUser.superuser) {
                initFlags();
            }

            initSolveFlags();
        }
    }, function (error) {
        console.log("Something went wrong logging user in: " + error.code);
    });
}

document.addEventListener('DOMContentLoaded', () => {

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

    // Initialize Firebase Authentication and get a reference to the service
    const auth = firebase.auth();

    // get the database
    var database = firebase.database();

    // load header in js so we dont need to add the same html to each page
    initHeader();

    // load sidebar in js so we dont need to add the same html to each page
    initSidebar();

    // if login page, initialize login form
    if (window.location.href.indexOf('login') > -1) {
        initLogin();
    }

    // if register page, initialize login form
    if (window.location.href.indexOf('register') > -1) {
        initRegister();
    }

    // add dark mode to every page without having to manually include script on every page
    // also takes care of issue when dark mode tries to load before the header menu exists
    initDarkMode();

    // check user status
    firebase.auth().onAuthStateChanged((user) => {
        if (user) {
            var userInfo = {};
            // User is signed in
            console.log("User is signed in:", user.email);

            userInfo.email = user.email;
            userInfo.uid = user.uid;

            // set user in local storage so can pull info easily
            var ref = firebase.database().ref('/users/' + userInfo.uid);
            ref.once('value', function (snapshot) {
                const data = snapshot.val();
                if (data) {
                    userInfo.superuser = data.superuser;
                    userInfo.username = data.username;
                    userInfo.timestamp = data.timestamp;
                }

                localStorage.setItem('user', JSON.stringify(userInfo));
            }, function (error) {
                console.log("Something went wrong loading user: " + error.code);
            });

        } else {
            // No user is signed in
            console.log("Redirecting to login...");
            
            if (
                window.location.href.indexOf('login') == -1 
                && window.location.href.indexOf('register') == -1
                && window.location.href.indexOf('terms') == -1
                && window.location.href.indexOf('acceptableUse') == -1
                && window.location.href.indexOf('about') == -1
            ) {
                window.location.href = "/login"; // or wherever your login page is
            }
        }
    });

    if (window.location.href.indexOf('profile') == -1) {
        initQuestionBoxes();
    }

    // only for the index page
    // init recent questions box
    if (window.location.href.indexOf('index') > -1) {
        initQuestions();
    }
});