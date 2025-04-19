function initAnswers() {
    var contentEl = document.querySelector('.gr-content');

    if (!contentEl) {
        return;
    }

    var currentUser = localStorage.user ? JSON.parse(localStorage.user) : null;

    var ref = firebase.database().ref('/answers').orderByChild('author').equalTo(currentUser.username);

    ref.on('value', function (snapshot) {
        const data = snapshot.val();

        if (data) {
            var html = `
                <div class="gr-answers question-box">
                    <h3>My Answers</h3>
                    
                    <div class="gr-question__entries question-entries">
            `;
            
            html += Object.keys(data).map(key => {                
                return `
                    <a href="/question?key=${data[key].questionID}" class="question-entry" data-key="${key}">
                        <div class="question-entry__info">
                            <h4 class="question-entry__title">${data[key].title || 'Untitled'}</h4>

                            <span class="question-entry__content">${data[key].content}</span>
                        </div>
                        
                        <div class="question-entry__actions">
                            <div class="gr-flags">
                                ${ data[key].status == 'Solved' ? `
                                    <div class="gr-solve">
                                        <svg 
                                            xmlns="http://www.w3.org/2000/svg" 
                                            height="24px" viewBox="0 -960 960 960" width="24px" 
                                            fill="green"
                                        >
                                            <path d="M480-80q-83 0-156-31.5T197-197q-54-54-85.5-127T80-480q0-83 31.5-156T197-763q54-54 127-85.5T480-880q65 0 123 19t107 53l-58 59q-38-24-81-37.5T480-800q-133 0-226.5 93.5T160-480q0 133 93.5 226.5T480-160q133 0 226.5-93.5T800-480q0-18-2-36t-6-35l65-65q11 32 17 66t6 70q0 83-31.5 156T763-197q-54 54-127 85.5T480-80Zm-56-216L254-466l56-56 114 114 400-401 56 56-456 457Z"/>
                                        </svg>

                                        <div class="tooltip">This question is solved</div>
                                    </div>
                                ` : ''}
                                ${ currentUser.superuser || data[key].flagged ? `
                                    <div class="gr-flag">
                                        <svg xmlns="http://www.w3.org/2000/svg" height="24px" viewBox="0 -960 960 960" width="24px" fill="${data[key].flagged && data[key].flagged == true ? 'red' : '#000000'}">
                                            <path d="M200-120v-680h360l16 80h224v400H520l-16-80H280v280h-80Zm300-440Zm86 160h134v-240H510l-16-80H280v240h290l16 80Z"/>
                                        </svg>
                                        ${ currentUser.superuser ? '<div class="tooltip">Click to flag the question and hide it from users.</div>' : '' }
                                    </div>
                                ` : ''}
                            </div>

                            <span class="question-entry__duedate">${ new Date(data[key].timestamp).toLocaleString([], {
                                hour: '2-digit',
                                minute: '2-digit',
                                year: "numeric",
                                month: "long",
                                day: "numeric"
                              }) }</span>
                            <button type="button" class="gr-btn gr-secondary gr-answer">View</button>
                        </div>
                    </a>
                `
            }).join('');

            html += `
                    </div>
                </div>
            `;
            
            contentEl.setHTMLUnsafe(html);

            // allow moderator users to flag questions
            if (currentUser.superuser) {
                initMyAnswerFlags();
            }
        } else {
            contentEl.innerHTML = `
                <div class="gr-answers question-box">
                    <h3>My Answers</h3>

                    <p>No answers yet, go ahead and <a href="/questions">answer some questions!</a></p>
                </div>
            `;
        }
    }, function (error) {
        console.log("Something went wrong loading questions: " + error.code);
    });
}

function initMyAnswerFlags() {
    var flagEls = document.querySelectorAll('.question-entry .gr-flag svg');

    if (!flagEls) {
        return;
    }

    flagEls.forEach(flagEl => {
        flagEl.addEventListener('click', ev => {
            ev.stopPropagation();
            ev.preventDefault();

            var answerEl = ev.target.closest('.question-entry');

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

document.addEventListener('DOMContentLoaded', () => {    
    initAnswers();
});