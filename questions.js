function initQuestionsPage(currentUser) {
    var contentEl = document.querySelector('.gr-content');
    let params = new URLSearchParams(document.location.search);

    var currentUser = localStorage.user ? JSON.parse(localStorage.user) : null;

    if (!contentEl) {
        return;
    }

    var isQuestion = true;

    var ref = null;

    if (params.get('where') && params.get('where') == 'myquestions') {
        ref = firebase.database().ref('/posts').orderByChild('authorID').equalTo(currentUser.username);
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

        if (data) {
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
                        if (!data[key].flagged || currentUser.username == data[key].authorID) {
                            return key;
                        }
                    }
                })
                .map(key => {
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
                        <div class="question-entry" data-key="${key}">
                            <div class="question-entry__info">
                                <h4 class="question-entry__title">${data[key].title || 'Untitled'}</h4>
                                <span class="question-entry__subject">${data[key].subject}</span>
                            </div>
                            
                            <div class="question-entry__actions">
                                ${ currentUser.superuser || (data[key].authorID == currentUser.username && data[key].flagged) ? `
                                    <div class="gr-flag">
                                        <svg xmlns="http://www.w3.org/2000/svg" height="24px" viewBox="0 -960 960 960" width="24px" fill="${data[key].flagged && data[key].flagged == true ? 'red' : '#000000'}">
                                            <path d="M200-120v-680h360l16 80h224v400H520l-16-80H280v280h-80Zm300-440Zm86 160h134v-240H510l-16-80H280v240h290l16 80Z"/>
                                        </svg>
                                        ${ currentUser.superuser ? '<div class="tooltip">Click to flag the question and hide it from users.</div>' : '' }
                                    </div>
                                ` : ''}
                                <span class="question-entry__duedate">Due: ${date}</span>
                                <a href="/question.html?key=${key}" class="gr-btn gr-secondary gr-answer">Answer</a>
                            </div>
                        </div>
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
            var userRef = firebase.database().ref('/users/' + data.authorID); // fixme - if user doesn't exist?
            userRef.once('value', function (userSnapshot) {
                var questionUser = userSnapshot.val();

                // get/set logo for user info
                userEl.insertAdjacentHTML('afterbegin', `
                    <a href="user.html?user=${data.authorID}"><div class="user__logo">${data.img ? `<img src="${data.img}" alt="User">` : data.authorID[0].toUpperCase()}</div></a>
                `);
                                 
                // get/set name for user info
                userInfoEl.insertAdjacentHTML('afterbegin', `
                    <span>
                        ${
                            questionUser 
                            && questionUser.firstName 
                            && questionUser.lastName 
                            ? questionUser.firstName + ' ' + questionUser.lastName 
                            : questionUser ? questionUser.email : data.authorID
                        }
                    </span>
                `);
            }, function (error) {
                console.log("Something went wrong fetching question user: " + error.code);
            });
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
                        if (!data[key].flagged || currentUser.username == data[key].authorID) {
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
                                <span>${ String(data[key].authorID).charAt(0).toUpperCase() + String(data[key].authorID).slice(1) }</span>
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
                authorID: currentUser.username,
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
    var flagEls = document.querySelectorAll('.content__answer .gr-flag svg');

    if (!flagEls) {
        return;
    }

    flagEls.forEach(flagEl => {
        flagEl.addEventListener('click', ev => {
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

function initQuestionFlags() {
    var flagEls = document.querySelectorAll('.question-entry .gr-flag svg');

    if (!flagEls) {
        return;
    }

    flagEls.forEach(flagEl => {
        flagEl.addEventListener('click', ev => {
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

    if (window.location.href.indexOf('question.html') && params.get('key')) {
        // question html logic here

        initSingleQuestion();
    } else {

        // display questions whether for whether the user 
        // is looking at their own questions, all, etc.
        initQuestionsPage();
    }
});