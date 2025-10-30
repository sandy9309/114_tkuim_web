// practice6_dynamic_fields.js
// 動態新增報名欄位並整合事件委派、即時驗證與送出攔截

const form = document.getElementById('dynamic-form');
const list = document.getElementById('participant-list');
const addBtn = document.getElementById('add-participant');
const submitBtn = document.getElementById('submit-btn');
const resetBtn = document.getElementById('reset-btn');
const countLabel = document.getElementById('count');

const exportBtn = document.createElement('button');
exportBtn.type = 'button';
exportBtn.textContent = '匯出名單';
exportBtn.className = 'btn btn-outline-success';
form.querySelector('.d-flex').appendChild(exportBtn);

const maxParticipants = 5;
let participantIndex = 0;

function saveToLocalStorage() {
  const data = Array.from(list.children).map(card => {
    const name = card.querySelector('input[type="text"]').value.trim();
    const email = card.querySelector('input[type="email"]').value.trim();
    return { name, email };
  });
  localStorage.setItem('participants', JSON.stringify(data));
}

function loadFromLocalStorage() {
  const data = JSON.parse(localStorage.getItem('participants') || '[]');
  if (data.length) {
    data.forEach(item => handleAddParticipant(item));
  } else {
    handleAddParticipant();
  }
}

function createParticipantCard(data = {}) {
  const index = participantIndex++;
  const wrapper = document.createElement('div');
  wrapper.className = 'participant card border-0 shadow-sm';
  wrapper.dataset.index = index;
  wrapper.innerHTML = `
    <div class="card-body">
      <div class="d-flex justify-content-between align-items-start mb-3">
        <h5 class="card-title mb-0">參與者 ${index + 1}</h5>
        <button type="button" class="btn btn-sm btn-outline-danger" data-action="remove">移除</button>
      </div>
      <div class="mb-3">
        <label class="form-label" for="name-${index}">姓名</label>
        <input id="name-${index}" name="name-${index}" class="form-control" type="text" required aria-describedby="name-${index}-error">
        <p id="name-${index}-error" class="text-danger small mb-0" aria-live="polite"></p>
      </div>
      <div class="mb-0">
        <label class="form-label" for="email-${index}">Email</label>
        <input id="email-${index}" name="email-${index}" class="form-control" type="email" required aria-describedby="email-${index}-error" inputmode="email">
        <p id="email-${index}-error" class="text-danger small mb-0" aria-live="polite"></p>
      </div>
    </div>
  `;
  return wrapper;
}

function updateCount() {
  countLabel.textContent = list.children.length;
  addBtn.disabled = list.children.length >= maxParticipants;
  saveToLocalStorage();
}

function setError(input, message) {
  const error = document.getElementById(`${input.id}-error`);
  input.setCustomValidity(message);
  error.textContent = message;
  if (message) {
    input.classList.add('is-invalid');
  } else {
    input.classList.remove('is-invalid');
  }
}

function validateInput(input) {
  const value = input.value.trim();
  if (!value) {
    setError(input, '此欄位必填');
    return false;
  }
  if (input.type === 'email') {
    const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailPattern.test(value)) {
      setError(input, 'Email 格式不正確');
      return false;
    }
  }
  setError(input, '');
  return true;
}

function handleAddParticipant(data = {}) {
  if (list.children.length >= maxParticipants) {
    return;
  }
  const participant = createParticipantCard();
  list.appendChild(participant);
  updateCount();
  participant.querySelector('input').focus();
}

addBtn.addEventListener('click', handleAddParticipant);

list.addEventListener('click', (event) => {
  const button = event.target.closest('[data-action="remove"]');
  if (!button) {
    return;
  }
  const participant = button.closest('.participant');
  participant?.remove();
  updateCount();
});

list.addEventListener('blur', (event) => {
  if (event.target.matches('input')) {
    validateInput(event.target);
  }
}, true);

list.addEventListener('input', (event) => {
  if (event.target.matches('input')) {
    const wasInvalid = event.target.validationMessage;
    if (wasInvalid) {
      validateInput(event.target);
    }
  }
});

form.addEventListener('submit', async (event) => {
  event.preventDefault();
  if (list.children.length === 0) {
    alert('請至少新增一位參與者');
    handleAddParticipant();
    return;
  }

  let firstInvalid = null;
  list.querySelectorAll('input').forEach((input) => {
    const valid = validateInput(input);
    if (!valid && !firstInvalid) {
      firstInvalid = input;
    }
  });

  if (firstInvalid) {
    firstInvalid.focus();
    return;
  }

  submitBtn.disabled = true;
  submitBtn.textContent = '送出中...';
  await new Promise((resolve) => setTimeout(resolve, 1000));
  const participantsData = Array.from(list.children).map(card => {
    const name = card.querySelector('input[type="text"]').value.trim();
    const email = card.querySelector('input[type="email"]').value.trim();
    return { name, email };
  });
  console.log('匯出參與者名單：', JSON.stringify(participantsData, null, 2));
  alert('表單已送出！');
  form.reset();
  list.innerHTML = '';
  participantIndex = 0;
  updateCount();
  submitBtn.disabled = false;
  submitBtn.textContent = '送出';
  localStorage.removeItem('participants');
});

resetBtn.addEventListener('click', () => {
  form.reset();
  list.innerHTML = '';
  participantIndex = 0;
  updateCount();
  localStorage.removeItem('participants');
});

exportBtn.addEventListener('click', () => {
  const participantsData = Array.from(list.children).map(card => {
    const name = card.querySelector('input[type="text"]').value.trim();
    const email = card.querySelector('input[type="email"]').value.trim();
    return { name, email };
  });
  if (participantsData.length === 0) {
    alert('目前沒有參與者可以匯出');
    return;
  }

  const blob = new Blob([JSON.stringify(participantsData, null, 2)], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = 'participants.json';
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
});

// 預設新增一筆，方便學生立即觀察互動
loadFromLocalStorage();
