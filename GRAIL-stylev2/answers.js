function initAnswers() {
    var contentEl = document.querySelector('.gr-content');

    if (!contentEl) {
        return;
    }

    var currentUser = localStorage.user ? JSON.parse(localStorage.user) : null;

    var ref = firebase.database().ref('/answers').orderByChild('authorID').equalTo(currentUser.username);;

    ref.on('value', function (snapshot) {
        const data = snapshot.val();

        if (data) {
            var html = `
                <div class="gr-answers question-box">
                    <h3>Your Answers</h3>
                    
                    <div class="gr-question__entries question-entries">
            `;
            
            html += Object.keys(data).map(key => {                
                return `
                    <div class="question-entry" data-key="${key}">
                        <div class="question-entry__info">
                            <h4 class="question-entry__title">${data[key].title || 'Untitled'}</h4>

                            <span class="question-entry__content">${data[key].content}</span>
                        </div>
                        
                        <div class="question-entry__actions">
                            ${ currentUser.superuser || data[key].flagged ? `
                                <div class="gr-flag">
                                    <svg xmlns="http://www.w3.org/2000/svg" height="24px" viewBox="0 -960 960 960" width="24px" fill="${data[key].flagged && data[key].flagged == true ? 'red' : '#000000'}">
                                        <path d="M200-120v-680h360l16 80h224v400H520l-16-80H280v280h-80Zm300-440Zm86 160h134v-240H510l-16-80H280v240h290l16 80Z"/>
                                    </svg>
                                    <div class="tooltip">Click to flag the question and hide it from users.</div>
                                </div>
                            ` : ''}
                            <span class="question-entry__duedate">${ new Date(data[key].timestamp).toLocaleString([], {
                                hour: '2-digit',
                                minute: '2-digit',
                                year: "numeric",
                                month: "long",
                                day: "numeric"
                              }) }</span>
                            <a href="/question.html?key=${data[key].questionID}" class="gr-btn gr-secondary gr-answer">View Question</a>
                        </div>
                    </div>
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