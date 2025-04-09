function initQuestions(currentUser) {
    var contentEl = document.querySelector('.content');
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
            
            html += Object.keys(data).map(key => {
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

            html += `
                    </div>
                </div>
            `;
            
            contentEl.setHTMLUnsafe(html);
        }
    }, function (error) {
        console.log("Something went wrong logging user in: " + error.code);
    });
}

document.addEventListener('DOMContentLoaded', () => {
    
    // display questions whether for whether the user 
    // is looking at their own questions, all, etc.
    initQuestions();
});