document.addEventListener('DOMContentLoaded', () => {
    const resultEl = document.getElementById('result22');
    const lengthEl = document.getElementById('length');
    const lowercaseEl = document.getElementById('lowercase');
    const uppercaseEl = document.getElementById('uppercase');
    const numbersEl = document.getElementById('numbers');
    const symbolsEl = document.getElementById('symbols');
    const generateEl = document.getElementById('generator');
    const clipboardEl = document.getElementById('clipboard');
    const toggleVisibilityEl = document.getElementById('toggleVisibility');
    const strengthBar = document.getElementById('strength-bar');
    const toast = document.getElementById('toast');
    const darkModeToggle = document.getElementById('darkModeToggle');
    const collapsibles = document.querySelectorAll('.collapsible');
    
    const passwordListEl = document.getElementById('passwordList');
    const historyListEl = document.getElementById('historyList');
    const addPasswordBtn = document.getElementById('addPasswordBtn');

    const historyKey = 'passwordHistory';
    const passwordsKey = 'savedPasswords';

    // Initialize lists from localStorage
    let savedPasswords = JSON.parse(localStorage.getItem(passwordsKey)) || [];
    let history = JSON.parse(localStorage.getItem(historyKey)) || [];

    updatePasswordList();
    updateHistoryList();

    collapsibles.forEach(collapsible => {
        collapsible.addEventListener('click', function() {
            this.classList.toggle('active');
            const content = this.nextElementSibling;
            content.style.display = content.style.display === 'block' ? 'none' : 'block';
        });
    });

    generateEl.addEventListener('click', () => {
        const length = +lengthEl.value;
        const hasLower = lowercaseEl.checked;
        const hasUpper = uppercaseEl.checked;
        const hasNumber = numbersEl.checked;
        const hasSymbol = symbolsEl.checked;

        const password = generatePassword(hasLower, hasUpper, hasNumber, hasSymbol, length);
        resultEl.innerText = password;
        updateStrength(password);
    });

    clipboardEl.addEventListener('click', () => {
        const textarea = document.createElement('textarea');
        const password = resultEl.innerText;

        if (!password) return;

        textarea.value = password;
        document.body.appendChild(textarea);
        textarea.select();
        document.execCommand('copy');
        textarea.remove();
        showToast('Password copied to clipboard');
    });

    toggleVisibilityEl.addEventListener('click', () => {
        if (resultEl.style.webkitTextSecurity === 'disc') {
            resultEl.style.webkitTextSecurity = 'none';
            toggleVisibilityEl.innerHTML = '<i class="far fa-eye-slash"></i>';
        } else {
            resultEl.style.webkitTextSecurity = 'disc';
            toggleVisibilityEl.innerHTML = '<i class="far fa-eye"></i>';
        }
    });

    darkModeToggle.addEventListener('change', () => {
        document.body.classList.toggle('dark-theme', darkModeToggle.checked);
        localStorage.setItem('darkMode', darkModeToggle.checked);
    });

    // Set initial dark mode from localStorage
    if (localStorage.getItem('darkMode') === 'true') {
        darkModeToggle.checked = true;
        document.body.classList.add('dark-theme');
    }

    function generatePassword(lower, upper, number, symbol, length) {
        let generatedPassword = '';
        const typesCount = lower + upper + number + symbol;
        const typesArr = [{ lower }, { upper }, { number }, { symbol }].filter(item => Object.values(item)[0]);

        if (typesCount === 0) return '';

        for (let i = 0; i < length; i += typesCount) {
            typesArr.forEach(type => {
                const funcName = Object.keys(type)[0];
                generatedPassword += randomFunc[funcName]();
            });
        }

        return generatedPassword.slice(0, length);
    }

    function getRandomLowerCase() {
        return String.fromCharCode(Math.floor(Math.random() * 26) + 97);
    }

    function getRandomUpperCase() {
        return String.fromCharCode(Math.floor(Math.random() * 26) + 65);
    }

    function getRandomNumber() {
        return String.fromCharCode(Math.floor(Math.random() * 10) + 48);
    }

    function getRandomSymbol() {
        const symbols = '!@#$%^&*(){}[]=<>/,.';
        return symbols[Math.floor(Math.random() * symbols.length)];
    }

    const randomFunc = {
        lower: getRandomLowerCase,
        upper: getRandomUpperCase,
        number: getRandomNumber,
        symbol: getRandomSymbol
    };

    function updateStrength(password) {
        let strength = 0;
        if (password.length >= 8) strength += 1;
        if (/[a-z]/.test(password)) strength += 1;
        if (/[A-Z]/.test(password)) strength += 1;
        if (/\d/.test(password)) strength += 1;
        if (/[^A-Za-z0-9]/.test(password)) strength += 1;

        const strengthColors = ['#ff0000', '#ff6f00', '#ffeb3b', '#4caf50'];
        strengthBar.style.width = (strength / 4) * 100 + '%';
        strengthBar.style.backgroundColor = strengthColors[strength - 1] || '#ff0000';
    }

    function showToast(message) {
        toast.textContent = message;
        toast.style.display = 'block';
        setTimeout(() => {
            toast.style.display = 'none';
        }, 2000);
    }

    addPasswordBtn.addEventListener('click', () => {
        const password = resultEl.textContent;
        if (password) {
            savedPasswords.push(password);
            history.push({ action: 'Added', password, date: new Date().toLocaleString() });
            localStorage.setItem(passwordsKey, JSON.stringify(savedPasswords));
            localStorage.setItem(historyKey, JSON.stringify(history));
            updatePasswordList();
            updateHistoryList();
        }
    });

    function updatePasswordList() {
        passwordListEl.innerHTML = savedPasswords.map(p => `<li>${p}</li>`).join('');
    }

    function updateHistoryList() {
        historyListEl.innerHTML = history.map(entry => `<li>${entry.date} - ${entry.action}: ${entry.password}</li>`).join('');
    }
});
function calculateStrength(password) {
    let strength = 0;
    let feedback = '';

    const length = password.length;
    if (length >= 8) strength += 1;
    if (/[a-z]/.test(password)) strength += 1;
    if (/[A-Z]/.test(password)) strength += 1;
    if (/\d/.test(password)) strength += 1;
    if (/[!@#$%^&*(){}[\]=<>/,.]/.test(password)) strength += 1;

    const strengthPercentage = (strength / 5) * 100;

    // Debugging info
    console.log('Password:', password);
    console.log('Length:', length);
    console.log('Strength Score:', strength);
    console.log('Strength Percentage:', strengthPercentage);

    strengthBar.style.width = `${strengthPercentage}%`;

    if (strengthPercentage < 40) {
        strengthBar.style.backgroundColor = '#ff4d4d'; // Red
        feedback = 'Weak: Add uppercase letters, symbols, or numbers';
    } else if (strengthPercentage < 60) {
        strengthBar.style.backgroundColor = '#ffcc00'; // Orange
        feedback = 'Medium: Add more symbols or increase length';
    } else {
        strengthBar.style.backgroundColor = '#4caf50'; // Green
        feedback = 'Strong: Good job!';
    }

    strengthFeedback.innerText = feedback;
}

function showToast(message) {
    toast.innerText = message;
    toast.style.display = 'block';
    setTimeout(() => {
        toast.style.display = 'none';
    }, 3000);
}











