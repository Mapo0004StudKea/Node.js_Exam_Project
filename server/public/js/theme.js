document.addEventListener('DOMContentLoaded', () => {
    const themeToggle = document.getElementById('theme-toggle');
    const body = document.body;

    // Funktion til at indstille temaet
    const setTheme = (theme) => {
        if (theme === 'dark') {
            body.classList.remove('light-mode');
            localStorage.setItem('theme', 'dark');
            themeToggle.textContent = '🌙';
        } else {
            body.classList.add('light-mode');
            localStorage.setItem('theme', 'light');
            themeToggle.textContent = '☀️'; 
        }
    };

    // Tjek localStorage ved indlæsning for at indstille det gemte tema
    const savedTheme = localStorage.getItem('theme');
    if (savedTheme) {
        setTheme(savedTheme);
    } else {
        // Standardtema
        setTheme('dark');
    }

    // Event listener for toggle-knappen
    themeToggle.addEventListener('click', () => {
        if (body.classList.contains('light-mode')) {
            setTheme('dark');
        } else {
            setTheme('light');
        }
    });
});