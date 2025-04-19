var courses = {
    'ITEC2260': 'ITEC 2260 - Intro to Computer Programming',
    'ITEC2270': 'ITEC 2270 - Application Development',
    'ITEC3155': 'ITEC 3155 - Systems Analysis and Design',
    'ITEC3235': 'ITEC 3235 - Human Computer Interaction',
    'ITEC4261': 'ITEC 4261 - Intro to JAVA Programming',
    'ITEC4264': 'ITEC 4264 - Data Structures'
}

function initQuestionsPage(currentUser) {
    var contentEl = document.querySelector('.gr-content');
    let params = new URLSearchParams(document.location.search);

    var currentUser = localStorage.user ? JSON.parse(localStorage.user) : null;

    if (!contentEl) {
        return;
    }

    var ref = null;

    if (params.get('where') && params.get('where') == 'myquestions') {
        ref = firebase.database().ref('/posts').orderByChild('author').equalTo(currentUser.username);
    } else if (params.get('where') && params.get('where') == 'participation') {
        isQuestion = false;
        // todo

        return;
    } else if (params.get('where') && params.get('where') == 'unsolved') {
        ref = firebase.database().ref('/posts').orderByChild('status').equalTo('Unsolved');
    } else if (params.get('where') && params.get('where') == 'solved') {
        ref = firebase.database().ref('/posts').orderByChild('status').equalTo('Solved');
    } else {
        ref = firebase.database().ref('/posts');
    }

    ref.on('value', function (snapshot) {
        const data = snapshot.val();

        var title = 'All Questions';

        if (params.get('where')) {
            switch(params.get('where')) {
                case 'myquestions':
                    title = 'My Questions';
                    break;
                case 'participation':
                    title = 'My Participation';
                    break;
                case 'unsolved':
                    title = 'Unsolved Questions';
                    break;
                case 'solved':
                    title = 'Solved Questions';
                    break;
                default:
                    title = 'All Questions';
                    break;
            }
        }

        if (data) {
            var html = `
                <div class="qr-questions question-box">
                    <h3>${title}</h3>
                    
                    <div class="gr-question__entries question-entries">
            `;
            
            html += Object.keys(data)
                .filter(key => {
                    if (currentUser.superuser) {
                        return key;
                    } else {
                        if (!data[key].flagged || currentUser.uid == data[key].author) {
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
                                <button type="button" class="gr-btn gr-secondary gr-answer">View</button>
                            </div>
                        </a>
                    `
                })
                .join('');

            html += `
                    </div>
                </div>
            `;
            
            contentEl.setHTMLUnsafe(html);

            // allow moderator users to flag questions
            if (currentUser.superuser) {
                initQuestionFlags();
            }

            initQuestionSolvedFlags();
        } else {
            contentEl.innerHTML = `
                <div class="qr-questions question-box">
                    <h3>${title}</h3>

                    <p>${title.indexOf('Solved') > -1 ? 'No solved questions yet, go ahead and <a href="/questions">solve one!</a>' : 'No questions yet, go ahead and <a href="/index">ask one!</a>'}</p>
                </div>
            `;
        }
    }, function (error) {
        console.log("Something went wrong loading questions: " + error.code);
    });
}

function initSingleQuestion() {
    var contentEl = document.querySelector('.gr-content');
    var contentQuestionEl = document.querySelector('.content__question');
    var contentAnswersEl = document.querySelector('.content__answers');
    
    let params = new URLSearchParams(document.location.search);
    var currentUser = localStorage.user ? JSON.parse(localStorage.user) : null;

    if (!contentEl || !contentQuestionEl || !contentAnswersEl) {
        return;
    }

    contentQuestionEl.dataset.key = params.get('key');

    var questionTitle = 'Untitled';

    // display current question info to user
    // todo - display status and make status updateable only to author
    var ref = firebase.database().ref('/posts/' + params.get('key'));
    ref.once('value', function (snapshot) {
        const data = snapshot.val();

        if (data) {
            // get difference between timestamp and current date
            // and calculate difference in days
            const diffTime = Math.abs(new Date() - new Date(Number(data.timestamp)));
            const diffDays = Math.round(diffTime / (1000 * 60 * 60 * 24));

            questionTitle = data.title;

            contentQuestionEl.innerHTML = `
                <div class="gr-flags">
                    ${ data.author == currentUser.username || data.status == 'Solved' ? `
                        <div class="gr-solve" data-my-question="${data.author == currentUser.username}">
                            <svg 
                                xmlns="http://www.w3.org/2000/svg" 
                                height="24px" viewBox="0 -960 960 960" width="24px" 
                                fill="${data.status && data.status == 'Solved' ? 'green' : 'black'}"
                            >
                                <path d="M480-80q-83 0-156-31.5T197-197q-54-54-85.5-127T80-480q0-83 31.5-156T197-763q54-54 127-85.5T480-880q65 0 123 19t107 53l-58 59q-38-24-81-37.5T480-800q-133 0-226.5 93.5T160-480q0 133 93.5 226.5T480-160q133 0 226.5-93.5T800-480q0-18-2-36t-6-35l65-65q11 32 17 66t6 70q0 83-31.5 156T763-197q-54 54-127 85.5T480-80Zm-56-216L254-466l56-56 114 114 400-401 56 56-456 457Z"/>
                            </svg>

                            <div class="tooltip">
                                ${data.author == currentUser.username ? 'Click to set your question as solved.' : data.status == 'Solved' ? 'This question is solved' : ''}
                            </div>
                        </div>
                    ` : ''}
                    
                    ${ currentUser.superuser || (data.author == currentUser.username && data.flagged) ? `
                        <div class="gr-flag">
                            <svg xmlns="http://www.w3.org/2000/svg" height="24px" viewBox="0 -960 960 960" width="24px" fill="${data.flagged && data.flagged == true ? 'red' : '#000000'}">
                                <path d="M200-120v-680h360l16 80h224v400H520l-16-80H280v280h-80Zm300-440Zm86 160h134v-240H510l-16-80H280v240h290l16 80Z"/>
                            </svg>
                            ${ currentUser.superuser ? '<div class="tooltip">Click to flag the question and hide it from users.</div>' : '' }
                        </div>
                    ` : ''}
                </div>
                
                <div class="content__question-title">
                    <h1>${data.title || 'Untitled'}</h1>
                </div>

                <div class="content__question-user">
                    <div class="user__info">
                        <div class="user__name-date">
                            <span>${diffDays > 1 ? diffDays + ' days ago' : diffDays == 1 ? diffDays + ' day ago' : 'Today'}</span>
                        </div>
                    </div>
                </div>

                <div class="content__question-content">${data.content}</div>
            `;

            var userEl = contentEl.querySelector('.content__question-user');
            var userInfoEl = contentEl.querySelector('.user__name-date');

            // get the question's user from db
            var userRef = firebase.database().ref('/users').orderByChild('username').equalTo(data.author); // fixme - if user doesn't exist?
            userRef.once('value', function (userSnapshot) {
                var questionUser = userSnapshot.val();
                                 
                // get/set name for user info
                userInfoEl.insertAdjacentHTML('afterbegin', `
                    <span>
                        ${ data.author }
                    </span>
                `);

                return questionUser[0];
            }, function (error) {
                console.log("Something went wrong fetching question user: " + error.code);
            }).then(res => {
                var questionUser = Object.values(res.val())[0];

                if (questionUser.username == currentUser.username) {
                    var profilePic = null;

                    if (localStorage.getItem('profilePic')) {
                        profilePic = JSON.parse(localStorage.getItem('profilePic')).src;
                    }
                    
                    // get/set logo for current user info
                    userEl.insertAdjacentHTML('afterbegin', `
                        <a href="user?user=${currentUser.uid}"><div class="user__logo">
                            ${profilePic 
                                ? `<img src="${profilePic}" alt="Profile Pic">` 
                                : currentUser.username[0].toUpperCase()}
                            </div>
                        </a>
                    `);

                    return;
                }

                return questionUser;
            }).then(questionUser => {
                if (!questionUser) {
                    return;
                }

                var imageRef = firebase.database().ref('/images/' + questionUser.username);
                imageRef.once('value', function (snapshot) {
                    const imageData = snapshot.val();

                    // display pfp to user
                    userEl.insertAdjacentHTML('afterbegin', `
                        <a href="user?user=${questionUser.uid}"><div class="user__logo">
                            ${imageData && imageData.src 
                                ? `<img src="${imageData && imageData.src}" alt="Profile Pic">` 
                                : questionUser.username[0].toUpperCase()}
                            </div>
                        </a>
                    `);
                }, function (error) {
                    console.log("Something went wrong loading profile pic: " + error.code);
                });
            });

            initQuestionSolvedFlags();
            initQuestionFlags();
        }
    }, function (error) {
        console.log("Something went wrong loading question: " + error.code);
    });

    // todo sort by created desc or asc?
    var answersRef = firebase.database().ref('/answers').orderByChild('questionID').equalTo(params.get('key'));
    answersRef.once('value', function (snapshot) {
        const data = snapshot.val();

        var html = ``;
        
        if (data && Object.keys(data) && Object.keys(data).length > 0) {
            // display how many answers exist currently
                html += `
                <h3>${Object.keys(data).length > 1 ? Object.keys(data).length + ' Answers' : Object.keys(data).length + ' Answer'}</h3>
            `;
        }

        // add form for user to submit their own answer
        html += `
            <form class="content__answer content__answer-form">
                <h4 class="content__answer-title">
                    Reply
                </h4>

                <textarea name="content" rows="4" required></textarea>

                <button class="gr-btn gr-primary" type="button">Answer</button>

                <span class="gr-form__error" style="display: none;">Please enter your answer</span>
                <span class="gr-form__success" style="display: none;">Success! Please refresh the page to see your answer.</span>
            </form>
        `;

        if (data && Object.keys(data) && Object.keys(data).length > 0) {
            // display all the answers to the current question
            // sort in timestamp desc order
            html += Object.keys(data)
                .filter(key => { // filter out flagged answers if not moderator or author user
                    if (currentUser.superuser) {
                        return key;
                    } else {
                        if (!data[key].flagged || currentUser.username == data[key].author) {
                            return key;
                        }
                    }
                })
                .sort((a, b) => Number(data[b].timestamp) - Number(data[a].timestamp))
                .map(key => {
                const diffTime = Math.abs(new Date() - new Date(Number(data[key].timestamp)));
                const diffDays = Math.round(diffTime / (1000 * 60 * 60 * 24));

                return `
                    <div class="content__answer" data-key="${key}">
                        <div class="user__info">
                            <div class="user__name-date">
                                <span>${ data[key].author }</span>
                                <span>${diffDays > 1 ? diffDays + ' days ago' : diffDays == 1 ? diffDays + ' day ago' : 'Today'}</span>
                            </div>

                            <div class="gr-flag">
                                <svg xmlns="http://www.w3.org/2000/svg" height="24px" viewBox="0 -960 960 960" width="24px" fill="${data[key].flagged && data[key].flagged == true ? 'red' : '#000000'}">
                                    <path d="M200-120v-680h360l16 80h224v400H520l-16-80H280v280h-80Zm300-440Zm86 160h134v-240H510l-16-80H280v240h290l16 80Z"/>
                                </svg>
                                ${ currentUser.superuser  ? '<div class="tooltip">Click to flag the question and hide it from users.</div>' : '' }
                            </div>
                        </div>

                        <div class="content__question-content">${data[key].content}</div>
                    </div>
                `;
            }).join('');
        }

        contentAnswersEl.setHTMLUnsafe(html);

        // allow moderator users to flag questions
        if (currentUser.superuser) {
            initAnswerFlags();
        }

        // add event listener to add answer to firebase on data submit
        var formEl = contentAnswersEl.querySelector('.content__answer-form');
        var formSubmitEl = contentAnswersEl.querySelector('.content__answer-form button');

        formSubmitEl.addEventListener('click', ev => {
            if (!formEl.checkValidity()) {
                formEl.reportValidity();
                return;
            }

            // create random key for each answer
            var answerKey = Math.random().toString(36).substring(2,7);

            // get data from form as object
            const formData = new FormData(formEl);
            const input = Object.fromEntries(formData.entries());

            firebase.database().ref('answers/' + answerKey).set({
                content: input['content'],
                author: currentUser.username,
                questionID: params.get('key'),
                timestamp: Date.now(),
                answerID: answerKey,
                title: questionTitle,
            }, (error) => {
                if (error) {
                    console.log('Error saving answer > ', error);

                    // make sure the success message is hidden
                    formEl.querySelector('.gr-form__success').style.display = 'none';

                    // display error message
                    formEl.querySelector('.gr-form__error').style.display = 'block';
                } else {
                    // clear the form for the user
                    formEl.reset();
                    
                    // make sure the error message is hidden
                    formEl.querySelector('.gr-form__error').style.display = 'none';

                    // display success message
                    formEl.querySelector('.gr-form__success').style.display = 'block';
                }
            });
        });
    });
}

function initAnswerFlags() {
    var flagEls = document.querySelectorAll('.content__answers .gr-flags .gr-flag svg');

    if (!flagEls) {
        return;
    }

    flagEls.forEach(flagEl => {
        flagEl.addEventListener('click', ev => {
            ev.stopPropagation();
            ev.preventDefault();

            var answerEl = ev.target.closest('.content__answer');

            var isFlagged = flagEl.getAttribute('fill') == 'red' ? true : false;
    
            firebase.database().ref('answers/' + answerEl.dataset.key).update({
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

function initQuestionSolvedFlags() {
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
                    solveEl.setAttribute('fill', isSolved ? 'black' : 'green');
                }
            });
        });
    });
}

function initQuestionFlags() {
    var flagEls = document.querySelectorAll('.question-entry .gr-flag svg');

    if (!flagEls) {
        return;
    }

    flagEls.forEach(flagEl => {
        flagEl.addEventListener('click', ev => {
            ev.stopPropagation();
            ev.preventDefault();
            
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

document.addEventListener('DOMContentLoaded', () => {    
    // one script file for both question and questions html files


    let params = new URLSearchParams(document.location.search);

    if (window.location.href.indexOf('question') && params.get('key')) {
        // question html logic here

        initSingleQuestion();
    } else {

        // display questions whether for whether the user 
        // is looking at their own questions, all, etc.
        initQuestionsPage();
    }
});