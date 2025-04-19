function initAccount() {
    var accountFormEl = document.querySelector('.gr-account-form');
    var modeEl = accountFormEl.querySelector('select[name="mode"]');
    var timeZone = accountFormEl.querySelector('select[name="timeZone"]');
    var deleteAccountEl = document.querySelector('.gr-delete-account');

    if (!accountFormEl || !modeEl || !timeZone || !deleteAccountEl) {
        return;
    }

    if (localStorage.getItem('darkMode') === 'true') {
        modeEl.value = 'dark';
    }

    var currentUser = localStorage.user ? JSON.parse(localStorage.user) : null;

    var ref = firebase.database().ref('/users/' + currentUser.uid);
    ref.once('value', function (snapshot) {
        const data = snapshot.val();
        if (data) {
            timeZone.value = data.timeZone ? data.timeZone : '';
        }
    }, function (error) {
        console.log("Something went wrong loading question: " + error.code);
    });

    accountFormEl.addEventListener('submit', ev => {
        ev.preventDefault();

        // get data from form as object
        const formData = new FormData(ev.target);
        const input = Object.fromEntries(formData.entries());

        // // if user is resetting their password
        // // make sure it all is correct
        // if (input.newPassword || input.confirmPassword || input.currentPassword) {
        //     var currentPasswordErrorEl = document.querySelector('.gr-error--currentPassword');
        //     var newPasswordErrorEl = document.querySelector('.gr-error--newPassword');
        //     var confirmPasswordErrorEl = document.querySelector('.gr-error--confirmPassword');
                
        //     if (!input.currentPassword) {
        //         currentPasswordErrorEl.style.display = 'block';
        //         return;
        //     } else {
        //         currentPasswordErrorEl.style.display = 'none';
        //     }

        //     if (!input.newPassword) {
        //         newPasswordErrorEl.style.display = 'block';
        //         return;
        //     } else {
        //         newPasswordErrorEl.style.display = 'none';
        //     }

        //     if (!input.confirmPassword) {
        //         confirmPasswordErrorEl.style.display = 'block';
        //         return;
        //     } else {
        //         confirmPasswordErrorEl.style.display = 'none';
        //     }

        //     if (input.newPassword != input.confirmPassword) {
        //         confirmPasswordErrorEl.innerHTML = `Passwords do not match.`;
        //         confirmPasswordErrorEl.style.display = 'block';
        //         return;
        //     } else {
        //         confirmPasswordErrorEl.innerHtml = `Please confirm your new password to change your password.`;
        //         confirmPasswordErrorEl.style.display = 'none';
        //     }

        //     if (input.currentPassword != currentPassword) {
        //         currentPasswordErrorEl.innerHTML = `Password is incorrect.`;
        //         currentPasswordErrorEl.style.display = 'block';
        //         return;
        //     } else {
        //         currentPasswordErrorEl.innerHTML = `Please fill out your current password to change your password.`;
        //         currentPasswordErrorEl.style.display = 'none';
        //     }
        // }
 
        firebase.database().ref('users/' + currentUser.uid).update({
            timeZone: input.timeZone
        }, (error) => {
            if (error) {
                // The write failed...
                console.log('Error saving user info: ', error);
            } else {
                console.log('Successfully saved user data.');

                location.reload();
            }
        });
    });

    modeEl.addEventListener('change', ev => {
        localStorage.setItem('darkMode', ev.target.value == 'dark' ? 'true' : 'false');
    });

    // delete account flow
    deleteAccountEl.addEventListener('click', ev => {
        ev.preventDefault();

        const modal = document.createElement('div');
        modal.classList.add('gr-modal');

        // Create modal content
        const modalContent = document.createElement('div');
        modalContent.classList.add('gr-modal__content');

        // Add content text
        modalContent.innerHTML = `
            <p>Are you sure you want to delete your account? You won't be able to get any of your information back!</p>
            <button id="delete" class="gr-btn gr-secondary">Delete</button>
            <button id="cancel" class="gr-btn gr-primary">Cancel</button>
        `;

        // Append content to modal and modal to body
        modal.appendChild(modalContent);
        document.body.appendChild(modal);

        // Close button logic
        document.querySelector('.gr-modal #cancel').onclick = () => {
            modal.remove();
        };

        // delete account logic
        document.querySelector('.gr-modal #delete').onclick = () => {
            
            firebase.database().ref('users/' + currentUser.uid)
                .remove()
                .then(() => {                        
                    localStorage.removeItem('user');
                    window.location.href = 'login';
                })
                .catch((error) => {
                    console.error("Error deleting item:", error);
                });
        };
    });
}

function initProfile() {
    var profileFormEl = document.querySelector('.gr-profile-form');

    if (!profileFormEl) {
        return;
    }

    profileFormEl.style.display = 'block';

    var currentUser = localStorage.user ? JSON.parse(localStorage.user) : null;

    if (!currentUser) {
        return;
    }

    var ref = firebase.database().ref('/users/' + currentUser.uid);
    ref.once('value', function (snapshot) {
        const data = snapshot.val();
        if (data) {
            var usernameEl = profileFormEl.querySelector('input[name="username"]');
            var birthDateEl = profileFormEl.querySelector('input[name="bday"]');
            var firstNameEl = profileFormEl.querySelector('input[name="firstName"]');
            var lastNameEl = profileFormEl.querySelector('input[name="lastName"]');
            var aboutEl = profileFormEl.querySelector('textarea[name="about"]');
            var emailEl = profileFormEl.querySelector('input[name="email"]');

            if (
                !usernameEl
                || !birthDateEl
                || !firstNameEl
                || !lastNameEl
                || !aboutEl
                || !emailEl
            ) {
                return;
            }

            usernameEl.value = data.username;
            birthDateEl.value = data.bday ? data.bday : null;
            firstNameEl.value = data.firstName ? data.firstName : null;
            lastNameEl.value = data.lastName ? data.lastName : null;
            aboutEl.value = data.about ? data.about : null;
            emailEl.value = currentUser.email;
        }
    }, function (error) {
        console.log("Something went wrong loading question: " + error.code);
    });

    profileFormEl.addEventListener("submit", ev => {
        ev.preventDefault();

        // get data from form as object
        const formData = new FormData(ev.target);
        const input = Object.fromEntries(formData.entries());

        firebase.database().ref('users/' + currentUser.uid).update({
            // email: input.email,
            firstName: input.firstName,
            lastName: input.lastName,
            bday: input.bday,
            about: input.about
        }, (error) => {
            if (error) {
                // The write failed...
                console.log('Error saving user info: ', error);
            } else {
                location.reload();
            }
        });

    });

    initProfilePic();
}

function initModForm() {
    var banAccountEl = document.querySelector('.gr-ban');
    var modEl = document.querySelector('.gr-mod');
    var userEl = document.querySelector('.gr-user');

    if (!modEl || !banAccountEl || !userEl) {
        return;
    }

    banAccountEl.addEventListener('click', ev => {
        ev.preventDefault();

        var userIsBanned = banAccountEl.innerHTML == 'Activate Account';

        firebase.database().ref('users/' + userEl.dataset.key).update({
            banned: !userIsBanned
        }, (error) => {
            if (error) {
                // The write failed...
                console.log('Error banning/activating user: ', error);
            } else {
                banAccountEl.innerHTML = userIsBanned ? 'Ban Account' : 'Activate Account';
            }
        });
    });

    modEl.addEventListener('click', ev => {
        ev.preventDefault();

        var userIsMod = modEl.innerHTML == 'Dismiss Moderator';

        firebase.database().ref('users/' + userEl.dataset.key).update({
            superuser: !userIsMod
        }, (error) => {
            if (error) {
                // The write failed...
                console.log('Error appointing/dismissing moderator: ', error);
            } else {
                modEl.innerHTML = !userIsMod ? 'Dismiss Moderator' : 'Appoint Moderator';
            }
        });
    });
}

function initProfilePic() {
    var profileChangeBtnEl = document.querySelector('.gr-profile__change');
    var profileChangeInputEl = document.querySelector('input[name="imageInput"]');
    var profileDeleteBtnEl = document.querySelector('.gr-profile__delete');
    var profileImageEl = document.querySelector('.gr-profile__img');

    if (!profileChangeInputEl || !profileDeleteBtnEl || !profileChangeBtnEl || !profileImageEl) {
        return;
    }

    var currentUser = localStorage.user ? JSON.parse(localStorage.user) : null;

    profileChangeBtnEl.addEventListener('click', ev => {
        profileChangeInputEl.click();
    });

    // update flow
    profileChangeInputEl.addEventListener('change', function() {
        if (this.files.length > 0 && this.files[0]) {

            // read base64 string
            new Promise((resolve, reject) => {
                const reader = new FileReader();
                
                reader.readAsDataURL(this.files[0]);
                reader.onloadend = () => resolve(reader.result);
                reader.onerror = reject;
            })
            .then(base64String => {

                // display image to user
                profileImageEl.innerHTML = `
                    <img src="${base64String}" alt="Profile Pic">
                `;

                // save to firebase
                // Add additional profile info to firebase
                firebase.database().ref('images/' + currentUser.username).set({
                    src: base64String
                }, (error) => {
                    if (error) {
                        console.log('Error saving profile pic > ', error);
                    }
                });

                localStorage.setItem('profilePic', JSON.stringify({src: base64String}));
            });
        }
    });

    // delete flow
    profileDeleteBtnEl.addEventListener('click', function() {
        // remove from database
        firebase.database().ref('images/' + currentUser.username).remove()
            .then(() => {
                profileImageEl.innerHTML = currentUser.username[0].toUpperCase();
            })
            .catch((error) => {
                console.error("error deleting profile pic > ", error);
            });

        localStorage.removeItem('profilePic');
    });
      
    if (currentUser && currentUser.username) {
        var imageRef = firebase.database().ref('/images/' + currentUser.username);
        imageRef.once('value', function (snapshot) {
            const data = snapshot.val();

            if (data && data.src) {
                
                // display image to user
                profileImageEl.innerHTML = `
                    <img src="${data.src}" alt="Profile Pic">
                `;

            } else {
                profileImageEl.innerHTML = currentUser.username[0].toUpperCase();
            }
        }, function (error) {
            console.log("Something went wrong loading profile pic: " + error.code);
        });
    }
}

function initUserAccount() {
    var contentEl = document.querySelector('.gr-content');

    if (!contentEl) {
        return;
    }

    var currentUser = localStorage.user ? JSON.parse(localStorage.user) : null;
    let params = new URLSearchParams(document.location.search);
    
    var ref = firebase.database().ref('/users/' + params.get('user'));
    ref.once('value', function (snapshot) {
        const data = snapshot.val();
        
        var html = `
            <div class="gr-user" data-key="${params.get('user')}">
                <h1>Profile</h1>
                <div class="gr-user__header">
                    <div class="gr-user__logo">${data.username[0].toUpperCase()}</div>
                    <span>${data.username}</span>
                </div>

                <div class="gr-user__info">
                    <div class="gr-user__section">
                        <span>Name</span>
                        <span>${data.firstName ?? '---'} ${data.lastName ?? '---'}</span>
                    </div>
                    
                    <div class="gr-user__section">
                        <span>Email</span>
                        <span>${data.email ?? '---'}</span>
                    </div>

                    <div class="gr-user__section">
                        <span>Birthday</span>
                        <span>${data.bday ?? '---'}</span>
                    </div>

                    <div class="gr-user__section">
                        <span>Time Zone</span>
                        <span>${data.timeZone ?? '---'}</span>
                    </div>

                    <div class="gr-user__section">
                        <span>User</span>
                        <span>${data.superuser && data.superuser == true ? 'Moderator' : 'Student'}</span>
                    </div>

                    <div class="gr-user__section">
                        <span>About</span>
                        <span>${data.about ?? '---'}</span>
                    </div>
                </div>
            </div>
        `;
        
        if (currentUser.superuser) {
            html += `
                <button class="gr-btn gr-secondary gr-ban" type="button">${ data.banned ? 'Activate' : 'Ban' } Account</button>
                <button class="gr-btn gr-secondary gr-mod" type="button">${ data.superuser ? 'Dismiss' : 'Appoint' } Moderator</button>
            `;
        }

        contentEl.setHTMLUnsafe(html);

        initModForm();

        return data;
    }, function (error) {
        console.log("Something went wrong loading user: " + error.code);
    }).then(data => {
        var questionUser = data.val();

        var pfpEl = document.querySelector('.gr-user__logo');

        if (currentUser.username == questionUser.username) {
            var profilePic = null;

            if (localStorage.getItem('profilePic')) {
                profilePic = JSON.parse(localStorage.getItem('profilePic')).src;
            }

            pfpEl.innerHTML = `
                ${profilePic ? `<img src="${profilePic}" alt="Profile Pic">` : currentUser.username[0].toUpperCase()}
            `;

            return;
        }

        return questionUser;
    }).then(questionUser => {
        if (!questionUser) {
            return;
        }

        var pfpEl = document.querySelector('.gr-user__logo');

        var imageRef = firebase.database().ref('/images/' + questionUser.username);
        imageRef.once('value', function (snapshot) {
            const data = snapshot.val();

            pfpEl.innerHTML = `
                ${data && data.src ? `<img src="${data.src}" alt="Profile Pic">` : questionUser.username[0].toUpperCase()}
            `;
        }, function (error) {
            console.log("Something went wrong loading profile pic: " + error.code);
        });
    });
}

document.addEventListener('DOMContentLoaded', () => {
    let params = new URLSearchParams(document.location.search);

    if (params.get('user')) {
        initUserAccount();
    } else { // if current user profile
        var sidebarEl = document.querySelector('.gr-profile__sidebar');

        if (!sidebarEl) {
            return;
        }

        // init sidebar
        sidebarEl.innerHTML =  `
            <a href="profile" ${ 
                window.location.href.indexOf('profile') > -1
                && !params.get('where') ? `class="selected"` : ''}>Profile</a>
            <a href="profile?where=account" ${ 
                window.location.href.indexOf('profile') > -1 
                && params.get("where")
                && params.get("where") == 'account' ? `class="selected"` : ''}>Account</a>
            <a href="profile?where=notifications"${ 
                window.location.href.indexOf('profile') > -1 
                && params.get("where")
                && params.get("where") == 'notifications'
                ? `class="selected"` : ''}>Notifications</a>
        `;


        // if profile page
        if (!params.get('where')) {
            initProfile();
        } else if (params.get('where') && params.get('where') == 'account') {
            initAccount();

            var accountFormEl = document.querySelector('.gr-account-form');

            accountFormEl.style.display = 'block';
        } else if (params.get('where') && params.get('where') == 'notifications') {
            var notificationsFormEl = document.querySelector('.gr-notifications-form');

            notificationsFormEl.style.display = 'block';
        }
    }
});