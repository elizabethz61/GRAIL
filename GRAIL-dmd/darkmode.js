document.addEventListener('DOMContentLoaded', function() {
    console.log("DOM loaded, checking for dark mode toggle...");
    
    // Try to find the button
    const darkModeToggle = document.getElementById('darkModeToggle');
    
    if (!darkModeToggle) {
        console.error('Dark mode toggle button not found!');
        // Create the button if it doesn't exist
        const headerActions = document.querySelector('.header__actions');
        
        if (headerActions) {
            console.log('Creating dark mode toggle button');
            const newToggle = document.createElement('button');
            newToggle.id = 'darkModeToggle';
            newToggle.className = 'dark-mode-toggle';
            newToggle.setAttribute('aria-label', 'Toggle Dark Mode');
            
            const icon = document.createElement('span');
            icon.className = 'dark-mode-toggle__icon';
            icon.textContent = '🌙';
            
            newToggle.appendChild(icon);
            headerActions.appendChild(newToggle);
            
            setupDarkModeToggle(newToggle);
        } else {
            console.error('Header actions container not found!');
        }
    } else {
        console.log('Dark mode toggle button found:', darkModeToggle);
        setupDarkModeToggle(darkModeToggle);
    }
    
    function setupDarkModeToggle(toggle) {
        const body = document.body;
        
        // Check for saved preference
        if (localStorage.getItem('darkMode') === 'true') {
            body.classList.add('dark-mode');
            const icon = toggle.querySelector('.dark-mode-toggle__icon');
            if (icon) {
                icon.textContent = '☀️';
            }
        }
        
        // Toggle dark mode on click
        toggle.addEventListener('click', function() {
            console.log('Dark mode toggle clicked');
            body.classList.toggle('dark-mode');
            
            // Save preference
            localStorage.setItem('darkMode', body.classList.contains('dark-mode'));
            
            // Update icon
            const icon = toggle.querySelector('.dark-mode-toggle__icon');
            if (icon) {
                if (body.classList.contains('dark-mode')) {
                    icon.textContent = '☀️';
                } else {
                    icon.textContent = '🌙';
                }
            }
        });
    }
});