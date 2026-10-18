document.addEventListener('DOMContentLoaded', () => {
    // DOM Elements
    const passwordDisplay = document.getElementById('password-display');
    const copyBtn = document.getElementById('copy-btn');
    const lengthInput = document.getElementById('length');
    const lengthValue = document.getElementById('length-value');
    const uppercaseCheck = document.getElementById('uppercase');
    const lowercaseCheck = document.getElementById('lowercase');
    const numbersCheck = document.getElementById('numbers');
    const symbolsCheck = document.getElementById('symbols');
    const noDuplicateCheck = document.getElementById('no-duplicate');
    const generateBtn = document.getElementById('generate-btn');
    const strengthLabel = document.getElementById('strength-label');
    const strengthMeterFill = document.getElementById('strength-meter-fill');
    const toast = document.getElementById('toast');

    // Character Sets
    const charSets = {
        uppercase: 'ABCDEFGHIJKLMNOPQRSTUVWXYZ',
        lowercase: 'abcdefghijklmnopqrstuvwxyz',
        numbers: '0123456789',
        symbols: '!@#$%^&*()_+~`|}{[]\:;?><,./-'
    };

    // Update Length Display
    lengthInput.addEventListener('input', () => {
        lengthValue.textContent = lengthInput.value;
    });

    // Secure Random Int Generation
    function getSecureRandomInt(max) {
        const array = new Uint32Array(1);
        window.crypto.getRandomValues(array);
        return array[0] % max;
    }

    // Shuffle Array (Fisher-Yates) for better randomness
    function shuffleString(str) {
        const arr = str.split('');
        for (let i = arr.length - 1; i > 0; i--) {
            const j = getSecureRandomInt(i + 1);
            [arr[i], arr[j]] = [arr[j], arr[i]];
        }
        return arr.join('');
    }

    // Generate Password Main Function
    function generatePassword() {
        let characterPool = '';
        let guaranteedChars = [];

        // Build pool and ensure at least one of each selected type
        if (uppercaseCheck.checked) {
            characterPool += charSets.uppercase;
            guaranteedChars.push(charSets.uppercase[getSecureRandomInt(charSets.uppercase.length)]);
        }
        if (lowercaseCheck.checked) {
            characterPool += charSets.lowercase;
            guaranteedChars.push(charSets.lowercase[getSecureRandomInt(charSets.lowercase.length)]);
        }
        if (numbersCheck.checked) {
            characterPool += charSets.numbers;
            guaranteedChars.push(charSets.numbers[getSecureRandomInt(charSets.numbers.length)]);
        }
        if (symbolsCheck.checked) {
            characterPool += charSets.symbols;
            guaranteedChars.push(charSets.symbols[getSecureRandomInt(charSets.symbols.length)]);
        }

        if (characterPool === '') {
            passwordDisplay.value = 'Select Options...';
            strengthLabel.textContent = 'Invalid';
            strengthMeterFill.style.width = '0%';
            return;
        }

        const length = parseInt(lengthInput.value);
        const noDuplicates = noDuplicateCheck.checked;

        // Check for duplicate constraint
        if (noDuplicates && length > characterPool.length) {
            alert(`With duplicates disabled, length cannot exceed ${characterPool.length} (total unique characters available).`);
            lengthInput.value = characterPool.length;
            lengthValue.textContent = characterPool.length;
            return;
        }

        let passwordArray = [];
        
        // Use guaranteed characters first to ensure diversity
        passwordArray = [...guaranteedChars];

        // Fill rest of the password
        for (let i = guaranteedChars.length; i < length; i++) {
            let nextChar;
            
            if (noDuplicates) {
                // Keep picking until a new unique char is found
                do {
                    nextChar = characterPool[getSecureRandomInt(characterPool.length)];
                } while (passwordArray.includes(nextChar));
            } else {
                nextChar = characterPool[getSecureRandomInt(characterPool.length)];
            }
            
            passwordArray.push(nextChar);
        }

        // Shuffle the result so guaranteed chars aren't always first
        const finalPassword = shuffleString(passwordArray.join(''));
        passwordDisplay.value = finalPassword;
        
        calculateStrength(finalPassword);
    }

    // Advanced Strength Calculation
    function calculateStrength(password) {
        let score = 0;
        const length = password.length;

        if (length === 0) return setStrength(0, 'Invalid');

        // Length criteria
        if (length >= 12) score += 3;
        else if (length >= 8) score += 2;
        else if (length >= 6) score += 1;

        // Diversity criteria
        let varieties = 0;
        if (/[A-Z]/.test(password)) varieties++;
        if (/[a-z]/.test(password)) varieties++;
        if (/[0-9]/.test(password)) varieties++;
        if (/[^A-Za-z0-9]/.test(password)) varieties++;
        score += varieties;

        // Penalty for very simple passwords even if long
        if (varieties === 1 && length >= 8) score--;

        // Map score to strength
        if (score <= 3) {
            setStrength(33, 'Weak', '#ef4444');
        } else if (score <= 5) {
            setStrength(66, 'Medium', '#f59e0b');
        } else {
            setStrength(100, 'Strong', '#10b981');
        }
    }

    function setStrength(width, text, color) {
        strengthMeterFill.style.width = `${width}%`;
        strengthMeterFill.style.backgroundColor = color;
        strengthLabel.textContent = text;
        strengthLabel.style.color = color;
    }

    // Copy function
    copyBtn.addEventListener('click', () => {
        const password = passwordDisplay.value;
        if (!password || password === 'Select Options...' || password === 'Your Secure Password...') return;

        navigator.clipboard.writeText(password).then(() => {
            toast.classList.add('show');
            setTimeout(() => {
                toast.classList.remove('show');
            }, 2500);
        });
    });

    // Event Listeners
    generateBtn.addEventListener('click', generatePassword);
    
    // Auto-generate on load
    generatePassword();
});