const form = document.getElementById('signup-form');
const inputs = form.querySelectorAll('input');
const submitBtn = document.getElementById('submit-btn');
const resetBtn = document.getElementById('reset-btn');
const strengthBar = document.getElementById('strength-bar');
const strengthBarFill = strengthBar.querySelector('.progress-bar');
const termsCheckbox = document.getElementById('terms');

function saveToLocalStorage() {
  const data = {};
  inputs.forEach(input => {
    if (input.type !== 'checkbox') data[input.id] = input.value;
    else data[input.id] = input.checked;
  });
  localStorage.setItem('signup_data', JSON.stringify(data));
}
/*加分
LocalStorage 暫存欄位
- 即時儲存重整頁面可恢復資料
*/

function loadFromLocalStorage() {
  const data = JSON.parse(localStorage.getItem('signup_data') || '{}');
  Object.entries(data).forEach(([key, value]) => {
    const el = document.getElementById(key);
    if (!el) return;
    if (el.type === 'checkbox') el.checked = value;
    else el.value = value;
  });
}
function checkPasswordStrength(value) {
  let score = 0;
  if (value.length >= 8) score++;
  if (/[A-Za-z]/.test(value) && /[0-9]/.test(value)) score++;
  if (/[^A-Za-z0-9]/.test(value)) score++;
  return score;
}
/*
密碼強度計算
- 長度 >= 8 → +1
- 英文 + 數字混合 → +1
- 含特殊符號 → +1
- score 1~3 對應弱/中/強
*/
function updateStrengthBar(value) {
  if (!value) {
    strengthBar.classList.add('d-none');
    return;
  }
  strengthBar.classList.remove('d-none');
  const score = checkPasswordStrength(value);
  const colors = ['bg-danger', 'bg-warning', 'bg-success'];
  const texts = ['弱', '中', '強'];
  strengthBarFill.className = `progress-bar ${colors[score - 1] || 'bg-danger'}`;
  strengthBarFill.style.width = `${(score / 3) * 100}%`;
  strengthBarFill.textContent = texts[score - 1] || '弱';
}
/*加分
密碼強度條更新
- 根據 score 顯示顏色與文字（弱/中/強）
*/
function setError(input, message) {
  const error = document.getElementById(`${input.id}-error`);
  input.setCustomValidity(message);

  if (error) error.textContent = message;

  if (message) input.classList.add('is-invalid');
  else input.classList.remove('is-invalid');
}
/*
設定錯誤訊息
*/

function validateInput(input) {
  const value = input.value.trim();
  if (!value && input.type !== 'checkbox') {
    setError(input, '此欄位必填');
    return false;
  }
  /*
  空值顯示「此欄位必填」
  */

  if (input.id === 'email') {
    const emailPattern = /^[^\s@]+@(gmail\.com|o365\.tku\.edu\.tw)$/;
    if (!emailPattern.test(value)) {
      setError(input, 'Email 格式須為 @gmail.com 或 @o365.tku.edu.tw');
      return false;
    }
  }
   /*
  Email 格式
  -  @gmail.com 或 @o365.tku.edu.tw
  */

  if (input.id === 'phone') {
    if (!/^\d{10}$/.test(value)) {
      setError(input, '手機號碼需為 10 碼數字');
      return false;
    }
  }
   /*
  手機號碼格式
  - 必須 10 碼數字
  */
  if (input.id === 'password') {
    if (value.length < 8 || !/[A-Za-z]/.test(value) || !/[0-9]/.test(value)) {
      setError(input, '密碼至少 8 碼，且需英數混合');
      return false;
    }
    updateStrengthBar(value);
  }
  /*
  密碼驗證
  - 至少 8 碼
  - 英數混合
  - 同時更新密碼強度條
  */

  if (input.id === 'confirm-password') {
    const pw = document.getElementById('password').value;
    if (value !== pw) {
      setError(input, '兩次密碼不一致');
      return false;
    }
  }
  /*
  確認密碼
  - 必須與密碼一致
  */

  setError(input, '');
  return true;
}

function validateInterests() {
  const interests = document.querySelectorAll('#interests input[type="checkbox"]');
  const checked = Array.from(interests).some(i => i.checked);
  const error = document.getElementById('interests-error');
  if (!checked) {
    error.textContent = '請至少勾選一項興趣';
    return false;
  }
  error.textContent = '';
  return true;
}
/*
興趣驗證
- 至少勾選一項
*/

function validateTerms() {
  const error = document.getElementById('terms-error');
  if (!termsCheckbox.checked) {
    error.textContent = '必須同意服務條款';
    return false;
  }
  error.textContent = '';
  return true;
}
/*
服務條款驗證
- 必須勾選
*/
form.addEventListener('blur', (event) => {
  if (event.target.matches('input') && event.target.type !== 'checkbox') {
    validateInput(event.target);
  }
}, true);

form.addEventListener('input', (event) => {
  if (event.target.matches('input')) {
    validateInput(event.target);
    saveToLocalStorage();
  }
});

document.getElementById('interests').addEventListener('change', () => {
  validateInterests();
  saveToLocalStorage();
});

form.addEventListener('submit', async (event) => {
  event.preventDefault();

  inputs.forEach(input => input.setCustomValidity(''));

  let firstInvalid = null;
  inputs.forEach(input => {
    const valid = validateInput(input);
    if (!valid && !firstInvalid) firstInvalid = input;
  });

  const interestsValid = validateInterests();
  const termsValid = validateTerms();

  if (firstInvalid) { firstInvalid.focus(); return; }
  if (!interestsValid) return;
  if (!termsValid) return;

  submitBtn.disabled = true;
  submitBtn.textContent = '送出中...';

  await new Promise(r => setTimeout(r, 500));
  alert('註冊成功！');

  localStorage.removeItem('signup_data');
  form.reset();
  strengthBar.classList.add('d-none');
  inputs.forEach(i => setError(i, ''));
  document.getElementById('interests-error').textContent = '';
  document.getElementById('terms-error').textContent = '';

  submitBtn.disabled = false;
  submitBtn.textContent = '送出';
});

resetBtn.addEventListener('click', () => {
  form.reset();
  strengthBar.classList.add('d-none');
  localStorage.removeItem('signup_data');
  inputs.forEach(i => setError(i, ''));
  document.getElementById('interests-error').textContent = '';
  document.getElementById('terms-error').textContent = '';
});
/*加分
重設按鈕
- 清空欄位
- 清空錯誤訊息
- 隱藏密碼強度條
- 清除 LocalStorage
*/
loadFromLocalStorage();
