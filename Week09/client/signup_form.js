// API 路徑
const API_BASE_URL = 'http://localhost:3001/api/signup';

const form = document.getElementById('signup-form');
const inputs = form.querySelectorAll('input');
const submitBtn = document.getElementById('submit-btn');
const resetBtn = document.getElementById('reset-btn');
const termsCheckbox = document.getElementById('terms');

// 密碼強度
const strengthBar = document.getElementById('strength-bar');
const strengthFill = strengthBar ? strengthBar.querySelector('.progress-bar') : null;

// 顯示 API 成功/錯誤訊息
const successMessage = document.getElementById('success-message');
const errorMessage = document.getElementById('error-message');
const viewListButton = document.getElementById('view-list-btn');
const listDisplay = document.getElementById('list-display');

// 欄位與錯誤訊息連結（前端顯示用）
const fieldErrorMap = {
    name: document.getElementById('name-error'),
    email: document.getElementById('email-error'),
    phone: document.getElementById('phone-error'),
    password: document.getElementById('password-error'),
    'confirm-password': document.getElementById('confirm-password-error'),
    interests: document.getElementById('interests-error'),
    terms: document.getElementById('terms-error'),
};

function saveToLocalStorage() {
    const data = {};
    
    inputs.forEach(input => {
        data[input.id] = (input.type === 'checkbox') ? input.checked : input.value;
    });
    document.querySelectorAll('#interests input[type="checkbox"]').forEach(cb => {
        data[cb.id] = cb.checked;
    });

    localStorage.setItem('signup_data', JSON.stringify(data));
}

function loadFromLocalStorage() {
    const saved = JSON.parse(localStorage.getItem('signup_data') || '{}');

    Object.entries(saved).forEach(([key, value]) => {
        const el = document.getElementById(key);
        if (!el) return;
        el.type === 'checkbox' ? el.checked = value : el.value = value;
    });

    const pwInput = document.getElementById('password');
    if (pwInput) validateInput(pwInput);
}



function checkPasswordStrength(pw) {
    let score = 0;
    if (pw.length >= 8) score++;
    if (/[A-Za-z]/.test(pw) && /[0-9]/.test(pw)) score++;
    if (/[^A-Za-z0-9]/.test(pw)) score++;
    return score;
}

function updateStrengthBar(pw) {
    if (!strengthBar || !strengthFill) return;

    if (!pw) {
        strengthBar.classList.add('d-none');
        return;
    }

    strengthBar.classList.remove('d-none');

    const score = checkPasswordStrength(pw);
    const colors = ['bg-danger', 'bg-warning', 'bg-success'];
    const texts = ['弱', '中', '強'];

    strengthFill.className = `progress-bar ${colors[score - 1] || 'bg-danger'}`;
    strengthFill.style.width = `${(score / 3) * 100}%`;
    strengthFill.textContent = texts[score - 1] || '弱';
}

//  前端錯誤處理

function setError(input, msg) {
    const errEl = fieldErrorMap[input.id] || document.getElementById(`${input.id}-error`);
    input.setCustomValidity(msg);

    if (errEl) errEl.textContent = msg;
    msg ? input.classList.add('is-invalid') : input.classList.remove('is-invalid');
}

//  前端欄位驗證

function validateInput(input) {
    const value = input.value.trim();

    // 清空錯誤
    setError(input, '');

    if (!value && input.type !== 'checkbox') {
        setError(input, '此欄位必填');
        return false;
    }

    if (input.id === 'email') {
        const pattern = /^[^\s@]+@(gmail\.com|o365\.tku\.edu\.tw)$/;
        if (!pattern.test(value)) {
            setError(input, 'Email 必須為 @gmail.com 或 @o365.tku.edu.tw');
            return false;
        }
    }

    if (input.id === 'phone') {
        if (!/^\d{10}$/.test(value)) {
            setError(input, '手機需為 10 碼數字');
            return false;
        }
    }

    if (input.id === 'password') {
        if (value.length < 8 || !/[A-Za-z]/.test(value) || !/[0-9]/.test(value)) {
            setError(input, '密碼需至少 8 碼且英數混合');
            return false;
        }
        updateStrengthBar(value);
    }

    if (input.id === 'confirm-password') {
        if (value !== document.getElementById('password').value) {
            setError(input, '兩次密碼不一致');
            return false;
        }
    }

    return true;
}

function validateInterests() {
    const checkboxes = document.querySelectorAll('#interests input[type="checkbox"]');
    const isChecked = Array.from(checkboxes).some(c => c.checked);

    const error = fieldErrorMap.interests;
    error.textContent = isChecked ? '' : '請至少勾選一項興趣';

    return isChecked;
}

function validateTerms() {
    const error = fieldErrorMap.terms;
    error.textContent = termsCheckbox.checked ? '' : '必須同意服務條款';
    return termsCheckbox.checked;
}

//  API 錯誤處理

function clearApiMessages() {
    if (successMessage) successMessage.classList.add('d-none');
    if (errorMessage) {
        errorMessage.classList.add('d-none');
        errorMessage.textContent = '';
    }

    Object.values(fieldErrorMap).forEach(el => {
        if (el) el.textContent = '';
    });
}

function displayBackendErrors(errors) {
    errorMessage.textContent = '資料驗證失敗，請修正以下欄位：';
    errorMessage.classList.remove('d-none');

    errors.forEach(err => {
        const field = err.param === 'confirmPassword' ? 'confirm-password' : err.param;
        const errEl = fieldErrorMap[field];

        if (errEl) {
            errEl.textContent = `* ${err.msg}`;
            const input = document.getElementById(field);
            if (input) input.classList.add('is-invalid');
        }
    });
}

//  事件監聽：欄位即時驗證

form.addEventListener('blur', e => {
    if (e.target.matches('input') && e.target.type !== 'checkbox') {
        validateInput(e.target);
    }
}, true);

form.addEventListener('input', e => {
    if (e.target.matches('input')) {
        validateInput(e.target);
        saveToLocalStorage();
    }
});

document.getElementById('interests').addEventListener('change', () => {
    validateInterests();
    saveToLocalStorage();
});


//  表單送出（API POST）

form.addEventListener('submit', async e => {
    e.preventDefault();
    clearApiMessages();

    // 1. 前端驗證
    let valid = true;
    inputs.forEach(i => {
        if (!validateInput(i)) valid = false;
    });

    if (!validateInterests()) valid = false;
    if (!validateTerms()) valid = false;

    if (!valid) {
        const firstError = Array.from(inputs).find(i => i.classList.contains('is-invalid'));
        if (firstError) firstError.focus();
        return;
    }

    // 2. 送出 API
    submitBtn.disabled = true;
    submitBtn.textContent = '送出中...';

    
    const formData = new FormData(form);
    const selectedInterests = Array.from(document.querySelectorAll('#interests input[type="checkbox"]:checked'))
        .map(cb => cb.value);

    const data = {
        name: formData.get('name'),
        email: formData.get('email'),
        phone: formData.get('phone'),
        password: formData.get('password'),
        confirmPassword: formData.get('confirm-password'), 
        interests: selectedInterests,
        terms: termsCheckbox.checked
    };

    try {
        const res = await fetch(API_BASE_URL, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(data)
        });

        const result = await res.json();

        if (res.ok) {
            successMessage.textContent = result.message || '報名成功！';
            successMessage.classList.remove('d-none');

            form.reset();
            localStorage.removeItem('signup_data');
            updateStrengthBar('');
            inputs.forEach(i => setError(i, ''));
        }
        else if (res.status === 400 && result.errors) {
            displayBackendErrors(result.errors);
        }
        else if (res.status === 409) {
            errorMessage.textContent = result.message || '此信箱已註冊';
            errorMessage.classList.remove('d-none');
        }
        else {
            errorMessage.textContent = result.message || '伺服器錯誤，請稍後再試';
            errorMessage.classList.remove('d-none');
        }

    } catch (err) {
        errorMessage.textContent = '無法連線到伺服器，請確認後端是否啟動。';
        errorMessage.classList.remove('d-none');

    } finally {
        submitBtn.disabled = false;
        submitBtn.textContent = '送出';
    }
});


//  清空表單

resetBtn.addEventListener('click', () => {
    form.reset();
    localStorage.removeItem('signup_data');

    if (strengthBar) strengthBar.classList.add('d-none');

    inputs.forEach(i => setError(i, ''));
    fieldErrorMap.interests.textContent = '';
    fieldErrorMap.terms.textContent = '';

    clearApiMessages();
});


//  查看報名清單（GET /api/signup）

if (viewListButton && listDisplay) {
    viewListButton.addEventListener('click', async () => {

        const willShow = listDisplay.classList.contains('d-none');

        listDisplay.classList.toggle('d-none', !willShow);
        viewListButton.textContent = willShow ? '隱藏報名清單' : '查看報名清單';

        if (willShow) {
            listDisplay.textContent = '載入中...';

            try {
                const res = await fetch(API_BASE_URL);
                const result = await res.json();

                if (res.ok) {
                    listDisplay.textContent =
                        `總報名人數：${result.total}\n\n` +
                        JSON.stringify(result.data, null, 2);
                } else {
                    listDisplay.textContent = '無法載入清單';
                }

            } catch {
                listDisplay.textContent = '連線錯誤，請稍後重試。';
            }
        }
    });
}

loadFromLocalStorage();
