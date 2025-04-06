document.addEventListener('DOMContentLoaded', () => {

    // will need to hookup to getting user when they log in
    var currentUser = 'elizabeth.zakula@mga.edu';

    // mimic getting data from firebase
    var questionData = [
        {
            id: 1,
            author: 'elizabeth.zakula@mga.edu',
            content: 'some really long question here...',
            title: 'Title 1',
            status: 'unsolved',
            type: 'question'
        },
        {
            id: 2,
            author: 'elizabeth.zakula@mga.edu',
            content: '1 some really long question here...',
            status: 'unsolved',
            title: 'Title 2',
            type: 'question'
        },
        {
            id: 3,
            author: 'jane.doe@mga.edu',
            content: '2 some really long question here...',
            status: 'solved',
            title: 'Title 3',
            type: 'answer' // ? diff type of data for question vs answer?
        }
    ];

    // not sure how to store question vs answer data
    // for the my participation screen, we'll need to be able to get the current users answers/questions that they've responded on

    // I was thinking
    //   1. either have answers array on question object
    //   2. or have diff object for answer with type=answer and linked to the question by a questionID attribute?


    var contentEl = document.querySelector('.content');
    let params = new URLSearchParams(document.location.search);

    // defensive conding
    if (!contentEl) {
        return;
    }

    var displayData = [];

    if (params.get('where') && params.get('where') == 'myquestions') {
        displayData = questionData.filter(el => el.author == currentUser);
    } else if (params.get('where') && params.get('where') == 'participation') {
        // todo
    } else if (params.get('where') && params.get('where') == 'unsolved') {
        displayData = questionData.filter(el => el.status == 'unsolved');
    } else if (params.get('where') && params.get('where') == 'solved') {
        displayData = questionData.filter(el => el.status == 'solved');
    } else {
        displayData = questionData;
    }// else all questions unsolved or solved should display


    contentEl.innerHTML = displayData.map(data => `
        <div class="question-box">
            <h6>${data.author}</h6>
            <h3>${data.title ?? 'Untitled'}</h3>
            <p>${data.content}</p>
            <button type="button" class="gr-btn gr-secondary gr-answer">Answer</button>
        </div>
    `).join('');

});