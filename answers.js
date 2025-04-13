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
                    <div class="question-entry">
                        <div class="question-entry__info">
                            <h4 class="question-entry__title">${data[key].title || 'Untitled'}</h4>

                            <span class="question-entry__content">${data[key].content}</span>
                        </div>
                        
                        <div class="question-entry__actions">
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
        }
    }, function (error) {
        console.log("Something went wrong loading questions: " + error.code);
    });
}

document.addEventListener('DOMContentLoaded', () => {    
    initAnswers();
});