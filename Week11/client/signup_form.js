// API 路徑
const API_BASE_URL = 'http://localhost:3001/api/signup';

// --- DOM 元素引用 ---
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

// 清單顯示
const viewListButton = document.getElementById('view-list-btn');
const listDisplay = document.getElementById('list-display');
const listTotalInfo = document.getElementById('list-total-info');

// 分頁 DOM 元素
const paginationControls = document.getElementById('pagination-controls');
const prevBtn = document.getElementById('prev-btn');
const nextBtn = document.getElementById('next-btn');
const currentPageSpan = document.getElementById('current-page-span');
const totalPagesSpan = document.getElementById('total-pages-span');

// Week 11 分頁狀態
let currentPage = 1;
const ITEMS_PER_PAGE = 5;

// 欄位與錯誤訊息連結
const fieldErrorMap = {
    name: document.getElementById('name-error'),
    email: document.getElementById('email-error'),
    phone: document.getElementById('phone-error'),
    password: document.getElementById('password-error'),
    'confirm-password': document.getElementById('confirm-password-error'),
    interests: document.getElementById('interests-error'),
    terms: document.getElementById('terms-error'),
};

// --- LocalStorage ---
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
    if (pwInput) updateStrengthBar(pwInput.value);
}

// 密碼強度
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

    strengthFill.className = `progress-bar ${colors[score - 1] || 'bg-danger'} rounded-lg`;
    strengthFill.style.width = `${(score / 3) * 100}%`;
    strengthFill.textContent = texts[score - 1] || '弱';
}

// --- 驗證 ---
function setError(input, msg) {
    const errEl = fieldErrorMap[input.id];
    input.setCustomValidity(msg);
    if (errEl) errEl.textContent = msg;
    msg ? input.classList.add('is-invalid') : input.classList.remove('is-invalid');
}

function validateInput(input) {
    const value = input.value.trim();
    setError(input, '');

    if (!value && input.type !== 'checkbox' && input.required) {
        setError(input, '此欄位必填');
        return false;
    }

    if (input.id === 'name' && value.length < 2) {
        setError(input, '姓名至少需要 2 個字');
        return false;
    }

    if (input.id === 'email') {
        const pattern = /^[^\s@]+@(gmail\.com|o365\.tku\.edu\.tw)$/;
        if (!pattern.test(value)) {
            setError(input, 'Email 必須為 @gmail.com 或 @o365.tku.edu.tw');
            return false;
        }
    }

    if (input.id === 'phone' && !/^\d{10}$/.test(value)) {
        setError(input, '手機需為 10 碼數字');
        return false;
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
    const ok = Array.from(checkboxes).some(c => c.checked);
    fieldErrorMap.interests.textContent = ok ? '' : '請至少勾選一項興趣';
    return ok;
}

function validateTerms() {
    fieldErrorMap.terms.textContent = termsCheckbox.checked ? '' : '必須同意服務條款';
    return termsCheckbox.checked;
}

// API 訊息
function clearApiMessages() {
    successMessage.classList.add('d-none');
    errorMessage.classList.add('d-none');
    errorMessage.textContent = '';
    Object.values(fieldErrorMap).forEach(el => el.textContent = '');
}

function displayApiError(message, fieldId = null, fieldErrorMessage = null) {
    errorMessage.textContent = message;
    errorMessage.classList.remove('d-none');

    if (fieldId) {
        const input = document.getElementById(fieldId);
        input.classList.add('is-invalid');
        if (fieldErrorMap[fieldId]) fieldErrorMap[fieldId].textContent = fieldErrorMessage;
        input.focus();
    }
}

// --- 表單即時事件 ---
form.addEventListener('blur', e => {
    if (e.target.matches('input') && e.target.type !== 'checkbox') {
        validateInput(e.target);
    }
}, true);

form.addEventListener('input', e => {
    if (e.target.matches('input')) {
        if (e.target.id === 'password' || e.target.id === 'confirm-password') {
            validateInput(e.target);
        }
        saveToLocalStorage();
    }
});

document.getElementById('interests').addEventListener('change', () => {
    validateInterests();
    saveToLocalStorage();
});

termsCheckbox.addEventListener('change', () => {
    validateTerms();
    saveToLocalStorage();
});

// --- 表單送出 ---
form.addEventListener('submit', async e => {
    e.preventDefault();
    clearApiMessages();

    let valid = true;
    inputs.forEach(i => { if (!validateInput(i)) valid = false; });
    if (!validateInterests()) valid = false;
    if (!validateTerms()) valid = false;

    if (!valid) {
        const firstError = Array.from(inputs).find(i => i.classList.contains('is-invalid'));
        if (firstError) firstError.focus();
        return;
    }

    submitBtn.disabled = true;
    submitBtn.textContent = '送出中...';

    const formData = new FormData(form);
    const data = {
        name: formData.get('name'),
        email: formData.get('email'),
        phone: formData.get('phone'),
    };

    try {
        const res = await fetch(API_BASE_URL, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(data)
        });
        const result = await res.json();

        if (res.ok) {
            successMessage.textContent = `報名成功！ID: ${result.id}`;
            successMessage.classList.remove('d-none');
            form.reset();
            localStorage.removeItem('signup_data');
            updateStrengthBar('');
            if (!listDisplay.classList.contains('d-none')) fetchList(1, ITEMS_PER_PAGE);
        }
        else if (res.status === 409) {
            displayApiError('報名失敗：資料重複', 'email', result.error);
        }
        else {
            displayApiError(result.error || '伺服器錯誤，請稍後再試');
        }

    } catch (err) {
        displayApiError('無法連線到伺服器，請確認後端是否啟動');
    } finally {
        submitBtn.disabled = false;
        submitBtn.textContent = '送出';
    }
});

// --- 重設 ---
resetBtn.addEventListener('click', () => {
    form.reset();
    localStorage.removeItem('signup_data');
    strengthBar.classList.add('d-none');
    inputs.forEach(i => setError(i, ''));
    fieldErrorMap.interests.textContent = '';
    fieldErrorMap.terms.textContent = '';
    clearApiMessages();
});

// --- 分頁清單 ---
async function fetchList(page, limit) {
    listDisplay.textContent = '載入中...';
    paginationControls.classList.add('d-none');
    listTotalInfo.classList.add('d-none');

    try {
        const res = await fetch(`${API_BASE_URL}?page=${page}&limit=${limit}`);
        const result = await res.json();

        if (!res.ok) {
            listDisplay.textContent = result.error || '取得清單失敗';
            return;
        }

        const { data, total, totalPages } = result;

        listDisplay.innerHTML = data
            .map(item => `<div class="border rounded p-2 mb-2">姓名：${item.name}<br>Email：${item.email}<br>手機：${item.phone}</div>`)
            .join('');

        listTotalInfo.textContent = `總筆數：${total}`;
        listTotalInfo.classList.remove('d-none');

        currentPage = page;
        currentPageSpan.textContent = page;
        totalPagesSpan.textContent = totalPages;
        paginationControls.classList.remove('d-none');

        prevBtn.disabled = page <= 1;
        nextBtn.disabled = page >= totalPages;

    } catch (err) {
        listDisplay.textContent = '清單載入失敗，請稍後再試';
    }
}

// 分頁事件
prevBtn.addEventListener('click', () => {
    if (currentPage > 1) fetchList(currentPage - 1, ITEMS_PER_PAGE);
});
nextBtn.addEventListener('click', () => {
    fetchList(currentPage + 1, ITEMS_PER_PAGE);
});

// 顯示清單
viewListButton.addEventListener('click', () => {
    listDisplay.classList.remove('d-none');
    fetchList(1, ITEMS_PER_PAGE);
});

// 初始載入 LocalStorage
loadFromLocalStorage();
