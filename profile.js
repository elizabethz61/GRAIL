function initAccount() {
    var accountFormEl = document.querySelector('.gr-account-form');
    var modeEl = accountFormEl.querySelector('select[name="mode"]');
    var timeZone = accountFormEl.querySelector('select[name="timeZone"]');

    if (!accountFormEl || !modeEl || !timeZone) {
        return;
    }

    if (localStorage.getItem('darkMode') === 'true') {
        modeEl.value = 'dark';
    }

    var currentUser = localStorage.user ? JSON.parse(localStorage.user) : null;

    if (!currentUser) {
        return;
    }

    var currentPassword = null;

    var ref = firebase.database().ref('/users/' + currentUser.username);
    ref.once('value', function (snapshot) {
        const data = snapshot.val();
        if (data) {
            timeZone.value = data.timeZone ? data.timeZone : '';

            currentPassword = data.passkey;
        }
    }, function (error) {
        console.log("Something went wrong loading question: " + error.code);
    });

    accountFormEl.addEventListener('submit', ev => {
        ev.preventDefault();

        // get data from form as object
        const formData = new FormData(ev.target);
        const input = Object.fromEntries(formData.entries());

        // if user is resetting their password
        // make sure it all is correct
        if (input.newPassword || input.confirmPassword || input.currentPassword) {
            var currentPasswordErrorEl = document.querySelector('.gr-error--currentPassword');
            var newPasswordErrorEl = document.querySelector('.gr-error--newPassword');
            var confirmPasswordErrorEl = document.querySelector('.gr-error--confirmPassword');
                
            if (!input.currentPassword) {
                currentPasswordErrorEl.style.display = 'block';
                return;
            } else {
                currentPasswordErrorEl.style.display = 'none';
            }

            if (!input.newPassword) {
                newPasswordErrorEl.style.display = 'block';
                return;
            } else {
                newPasswordErrorEl.style.display = 'none';
            }

            if (!input.confirmPassword) {
                confirmPasswordErrorEl.style.display = 'block';
                return;
            } else {
                confirmPasswordErrorEl.style.display = 'none';
            }

            if (input.newPassword != input.confirmPassword) {
                confirmPasswordErrorEl.innerHTML = `Passwords do not match.`;
                confirmPasswordErrorEl.style.display = 'block';
                return;
            } else {
                confirmPasswordErrorEl.innerHtml = `Please confirm your new password to change your password.`;
                confirmPasswordErrorEl.style.display = 'none';
            }

            if (input.currentPassword != currentPassword) {
                currentPasswordErrorEl.innerHTML = `Password is incorrect.`;
                currentPasswordErrorEl.style.display = 'block';
                return;
            } else {
                currentPasswordErrorEl.innerHTML = `Please fill out your current password to change your password.`;
                currentPasswordErrorEl.style.display = 'none';
            }
        }

        var data = {
            timeZone: input.timeZone
        };

        if (input.newPassword) {
            data.passkey = input.newPassword;
        }
 
        firebase.database().ref('users/' + currentUser.username).update(data, (error) => {
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

    var ref = firebase.database().ref('/users/' + currentUser.username);
    ref.once('value', function (snapshot) {
        const data = snapshot.val();
        if (data) {
            var profileImageEl = profileFormEl.querySelector('.gr-profile__img');
            var usernameEl = profileFormEl.querySelector('input[name="username"]');
            var birthDateEl = profileFormEl.querySelector('input[name="bday"]');
            var firstNameEl = profileFormEl.querySelector('input[name="firstName"]');
            var lastNameEl = profileFormEl.querySelector('input[name="lastName"]');
            var aboutEl = profileFormEl.querySelector('textarea[name="about"]');
            var emailEl = profileFormEl.querySelector('input[name="email"]');

            if (
                !profileImageEl 
                || !usernameEl
                || !birthDateEl
                || !firstNameEl
                || !lastNameEl
                || !aboutEl
                || !emailEl
            ) {
                return;
            }
           
            profileImageEl.innerHTML = data.img ? `
                <img src="${data.img}" alt="${data.username}">
            ` : data.username[0].toUpperCase();

            usernameEl.value = data.username;
            birthDateEl.value = data.bday ? data.bday : null;
            firstNameEl.value = data.firstName ? data.firstName : null;
            lastNameEl.value = data.lastName ? data.lastName : null;
            aboutEl.value = data.about ? data.about : null;
            emailEl.value = data.email ? data.email : null;
        }
    }, function (error) {
        console.log("Something went wrong loading question: " + error.code);
    });

    profileFormEl.addEventListener("submit", ev => {
        ev.preventDefault();

        // get data from form as object
        const formData = new FormData(ev.target);
        const input = Object.fromEntries(formData.entries());

        firebase.database().ref('users/' + currentUser.username).update({
            email: input.email,
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
}

function initModForm() {
    var modFormEl = document.querySelector('.gr-mod-form');
    var currentUser = localStorage.user ? JSON.parse(localStorage.user) : null;

    if (!modFormEl) {
        return;
    }

    modFormEl.addEventListener('submit', ev => {
        ev.preventDefault();

        // get data from form as object
        const formData = new FormData(ev.target);
        const input = Object.fromEntries(formData.entries());

        // if user is resetting their password
        // make sure it all is correct
        if (input.newPassword || input.confirmPassword) {
            var newPasswordErrorEl = document.querySelector('.gr-error--newPassword');
            var confirmPasswordErrorEl = document.querySelector('.gr-error--confirmPassword');

            if (!input.newPassword) {
                newPasswordErrorEl.style.display = 'block';
                return;
            } else {
                newPasswordErrorEl.style.display = 'none';
            }

            if (!input.confirmPassword) {
                confirmPasswordErrorEl.style.display = 'block';
                return;
            } else {
                confirmPasswordErrorEl.style.display = 'none';
            }

            if (input.newPassword != input.confirmPassword) {
                confirmPasswordErrorEl.innerHTML = `Passwords do not match.`;
                confirmPasswordErrorEl.style.display = 'block';
                return;
            } else {
                confirmPasswordErrorEl.innerHtml = `Please confirm your new password to change your password.`;
                confirmPasswordErrorEl.style.display = 'none';
            }
        }

        firebase.database().ref('users/' + currentUser.username).update({
            passkey: input.newPassword
        }, (error) => {
            if (error) {
                // The write failed...
                console.log('Error saving user info: ', error);
            } else {
                console.log('Successfully saved user data.');

                document.querySelector('.gr-form__success').style.display = 'block';

                // clear form
                modFormEl.reset();
            }
        });
    });
}

// fixme - delete account on both pages

document.addEventListener('DOMContentLoaded', () => {
    let params = new URLSearchParams(document.location.search);
    var currentUser = localStorage.user ? JSON.parse(localStorage.user) : null;

    if (params.get('user')) {
        var contentEl = document.querySelector('.gr-content');

        if (!contentEl) {
            return;
        }
        
        var ref = firebase.database().ref('/users/' + params.get('user'));
        ref.once('value', function (snapshot) {
            const data = snapshot.val();
            
            var html = `
                <div class="gr-user">
                    <h1>Profile</h1>
                    <div class="gr-user__header">
                        <div class="gr-user__logo">E</div>
                        <span>${data.username}</span>
                    </div>

                    <div class="gr-user__info">
                        <div class="gr-user__section">
                            <span>Name</span>
                            <span>${data.firstName ?? '---'} ${data.lastName}</span>
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
                    <form class="gr-mod-form">
                        <h2>Moderator Controls</h2>
                        
                        <span>Update Password</span>

                        <div class="gr-form__row">
                            <div class="gr-form__item">
                                <label for="newPassword">New Password</label>
                                
                                <input type="password" name="newPassword">
                                
                                <span class="gr-error gr-error--newPassword" style="display: none;">Please set a new password to change the password.</span>
                            </div>

                            <div class="gr-form__item">
                                <label for="confirmPassword">Confirm Password</label>
                                
                                <input type="password" name="confirmPassword">

                                <span class="gr-error gr-error--confirmPassword" style="display: none;">Please confirm the new password to change the password.</span>
                            </div>
                        </div>

                        <button class="gr-btn gr-primary" type="submit">Save</button>
                        <button class="gr-btn gr-secondary" type="button">Delete Account</button>
                    </form>

                    <div class="gr-form__success" style="display: none; margin-top: 0;">Password reset successfully.</div>
                `;
            }

            contentEl.setHTMLUnsafe(html);

            initModForm();
        }, function (error) {
            console.log("Something went wrong loading user: " + error.code);
        });


    } else { // if current user profile
        var sidebarEl = document.querySelector('.gr-profile__sidebar');

        if (!sidebarEl) {
            return;
        }

        // init sidebar
        sidebarEl.innerHTML =  `
            <a href="profile.html" ${ 
                window.location.href.indexOf('profile.html') > -1
                && !params.get('where') ? `class="selected"` : ''}>Profile</a>
            <a href="profile.html?where=account" ${ 
                window.location.href.indexOf('profile.html') > -1 
                && params.get("where")
                && params.get("where") == 'account' ? `class="selected"` : ''}>Account</a>
            <a href="profile.html?where=notifications"${ 
                window.location.href.indexOf('profile.html') > -1 
                && params.get("where")
                && params.get("where") == 'notifications'
                ? `class="selected"` : ''}>Notifications</a>
        `;


        // if profile page
        if (!params.get('where')) {
            initProfile();
        } else if (params.get('where') == 'account') {
            initAccount();
        }

        // if account page
        if (params.get('where') && params.get('where') == 'account') {
            var accountFormEl = document.querySelector('.gr-account-form');

            accountFormEl.style.display = 'block';
        }

        // if notifs page
        if (params.get('where') && params.get('where') == 'notifications') {
            var notificationsFormEl = document.querySelector('.gr-notifications-form');

            notificationsFormEl.style.display = 'block';
        }
    }
});