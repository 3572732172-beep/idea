const plannerText = document.getElementById('planner-text');
const planTitleInput = document.getElementById('plan-title');
const planNoteInput = document.getElementById('plan-note');
const savePlanButton = document.getElementById('save-plan');
const taskInput = document.getElementById('task-input');
const taskNoteInput = document.getElementById('task-note');
const addTaskButton = document.getElementById('add-task');
const taskList = document.getElementById('task-list');
const autostartToggle = document.getElementById('autostart-toggle');
const themeToggle = document.getElementById('theme-toggle');

const timerLabel = document.getElementById('timer-label');
const timerTime = document.getElementById('timer-time');
const progressBar = document.getElementById('progress-bar');
const startButton = document.getElementById('start-timer');
const pauseButton = document.getElementById('pause-timer');
const resetButton = document.getElementById('reset-timer');
const focusLengthInput = document.getElementById('focus-length');
const breakLengthInput = document.getElementById('break-length');
const focusLengthValue = document.getElementById('focus-length-value');
const breakLengthValue = document.getElementById('break-length-value');
const timerNoteInput = document.getElementById('timer-note');
const logSessionButton = document.getElementById('log-session');
const timerTimeline = document.getElementById('timer-timeline');
const planTimeline = document.getElementById('plan-timeline');

const modal = document.getElementById('detail-modal');
const closeModalButton = document.getElementById('close-modal');
const modalTitle = document.getElementById('modal-title');
const modalDate = document.getElementById('modal-date');
const modalBody = document.getElementById('modal-body');
const modalNote = document.getElementById('modal-note');

const tabs = document.querySelectorAll('.tab');
const panels = document.querySelectorAll('[data-panel]');
const linkButtons = document.querySelectorAll('.link-card');

let timerInterval = null;
let isFocus = true;
let remainingSeconds = 25 * 60;
let totalSeconds = 25 * 60;

const storage = {
  get(key, fallback) {
    const saved = localStorage.getItem(key);
    if (!saved) {
      return fallback;
    }
    try {
      return JSON.parse(saved);
    } catch (error) {
      return fallback;
    }
  },
  set(key, value) {
    localStorage.setItem(key, JSON.stringify(value));
  }
};

const formatTime = (seconds) => {
  const mins = Math.floor(seconds / 60);
  const secs = seconds % 60;
  return `${String(mins).padStart(2, '0')}:${String(secs).padStart(2, '0')}`;
};

const updateTimerUI = () => {
  timerTime.textContent = formatTime(remainingSeconds);
  timerLabel.textContent = isFocus ? '专注中' : '休息中';
  const progress = ((totalSeconds - remainingSeconds) / totalSeconds) * 100;
  progressBar.style.width = `${Math.min(progress, 100)}%`;
};

const playTone = (frequency = 520) => {
  const context = new AudioContext();
  const oscillator = context.createOscillator();
  const gain = context.createGain();

  oscillator.type = 'sine';
  oscillator.frequency.value = frequency;
  gain.gain.value = 0.04;

  oscillator.connect(gain);
  gain.connect(context.destination);

  oscillator.start();
  gain.gain.exponentialRampToValueAtTime(0.0001, context.currentTime + 0.6);
  oscillator.stop(context.currentTime + 0.6);
};

const startTimer = () => {
  if (timerInterval) {
    return;
  }
  playTone(520);
  timerInterval = setInterval(() => {
    if (remainingSeconds > 0) {
      remainingSeconds -= 1;
      updateTimerUI();
      return;
    }
    isFocus = !isFocus;
    totalSeconds = (isFocus ? Number(focusLengthInput.value) : Number(breakLengthInput.value)) * 60;
    remainingSeconds = totalSeconds;
    updateTimerUI();
    playTone(isFocus ? 520 : 420);
  }, 1000);
};

const pauseTimer = () => {
  if (timerInterval) {
    clearInterval(timerInterval);
    timerInterval = null;
    playTone(320);
  }
};

const resetTimer = () => {
  pauseTimer();
  isFocus = true;
  totalSeconds = Number(focusLengthInput.value) * 60;
  remainingSeconds = totalSeconds;
  updateTimerUI();
};

const updateRangeValues = () => {
  focusLengthValue.textContent = focusLengthInput.value;
  breakLengthValue.textContent = breakLengthInput.value;
};

const openModal = ({ title, date, body, note }) => {
  modalTitle.textContent = title;
  modalDate.textContent = date;
  modalBody.textContent = body;
  modalNote.textContent = note ? `备注：${note}` : '';
  modal.hidden = false;
};

const closeModal = () => {
  modal.hidden = true;
};

const renderTimeline = (container, items, type) => {
  container.innerHTML = '';
  items.forEach((item) => {
    const card = document.createElement('div');
    card.className = `timeline-item ${type}`;

    const title = document.createElement('strong');
    title.textContent = item.title;

    const meta = document.createElement('span');
    meta.className = 'hint';
    meta.textContent = item.date;

    const summary = document.createElement('span');
    summary.textContent = item.summary;

    card.append(title, meta, summary);
    card.addEventListener('click', () => openModal(item));
    container.append(card);
  });
};

const addPlan = () => {
  const title = planTitleInput.value.trim() || '未命名计划';
  const body = plannerText.value.trim();
  if (!body) {
    return;
  }
  const note = planNoteInput.value.trim();
  const date = new Date().toLocaleString('zh-CN');
  const plans = storage.get('dailyPlans', []);
  const entry = {
    title,
    date,
    summary: body.slice(0, 40),
    body,
    note
  };
  plans.unshift(entry);
  storage.set('dailyPlans', plans);
  renderTimeline(planTimeline, plans, 'plan');
  plannerText.value = '';
  planTitleInput.value = '';
  planNoteInput.value = '';
};

const addTask = () => {
  const value = taskInput.value.trim();
  if (!value) {
    return;
  }
  const note = taskNoteInput.value.trim();
  const tasks = storage.get('dailyTasks', []);
  tasks.unshift({ text: value, note });
  storage.set('dailyTasks', tasks);
  renderTasks(tasks);
  taskInput.value = '';
  taskNoteInput.value = '';
};

const renderTasks = (tasks) => {
  taskList.innerHTML = '';
  tasks.forEach((task, index) => {
    const item = document.createElement('li');
    item.className = 'task-item';

    const meta = document.createElement('div');
    meta.className = 'task-meta';

    const text = document.createElement('span');
    text.textContent = task.text;

    const note = document.createElement('span');
    note.className = 'hint';
    note.textContent = task.note || '无备注';

    meta.append(text, note);

    const removeButton = document.createElement('button');
    removeButton.className = 'ghost';
    removeButton.textContent = '完成';
    removeButton.addEventListener('click', () => {
      const updated = tasks.filter((_, taskIndex) => taskIndex !== index);
      storage.set('dailyTasks', updated);
      renderTasks(updated);
    });

    item.append(meta, removeButton);
    taskList.append(item);
  });
};

const addTimerSession = () => {
  const note = timerNoteInput.value.trim();
  const date = new Date().toLocaleString('zh-CN');
  const length = isFocus ? focusLengthInput.value : breakLengthInput.value;
  const sessions = storage.get('timerSessions', []);
  const entry = {
    title: isFocus ? `专注 ${length} 分钟` : `休息 ${length} 分钟`,
    date,
    summary: note || '未填写备注',
    body: `时长：${length} 分钟`,
    note
  };
  sessions.unshift(entry);
  storage.set('timerSessions', sessions);
  renderTimeline(timerTimeline, sessions, 'timer');
  timerNoteInput.value = '';
};

const initTheme = () => {
  const savedTheme = localStorage.getItem('themeMode') || 'dark';
  if (savedTheme === 'light') {
    document.documentElement.classList.add('light');
  }
  themeToggle.textContent = savedTheme === 'light' ? '切换夜间' : '切换白天';
};

const toggleTheme = () => {
  const isLight = document.documentElement.classList.toggle('light');
  localStorage.setItem('themeMode', isLight ? 'light' : 'dark');
  themeToggle.textContent = isLight ? '切换夜间' : '切换白天';
};

const initAutostart = async () => {
  if (!window.ideaAPI) {
    return;
  }
  const enabled = await window.ideaAPI.getAutostart();
  autostartToggle.checked = enabled;
};

autostartToggle.addEventListener('change', async (event) => {
  if (!window.ideaAPI) {
    return;
  }
  const enabled = await window.ideaAPI.setAutostart(event.target.checked);
  autostartToggle.checked = enabled;
});

startButton.addEventListener('click', startTimer);
pauseButton.addEventListener('click', pauseTimer);
resetButton.addEventListener('click', resetTimer);

focusLengthInput.addEventListener('input', () => {
  updateRangeValues();
  if (isFocus) {
    resetTimer();
  }
});

breakLengthInput.addEventListener('input', () => {
  updateRangeValues();
  if (!isFocus) {
    resetTimer();
  }
});

logSessionButton.addEventListener('click', addTimerSession);

savePlanButton.addEventListener('click', addPlan);
addTaskButton.addEventListener('click', addTask);

closeModalButton.addEventListener('click', closeModal);
modal.addEventListener('click', (event) => {
  if (event.target === modal) {
    closeModal();
  }
});

themeToggle.addEventListener('click', toggleTheme);

linkButtons.forEach((button) => {
  button.addEventListener('click', async () => {
    if (window.ideaAPI) {
      await window.ideaAPI.openExternal(button.dataset.url);
    }
  });
});

tabs.forEach((tab) => {
  tab.addEventListener('click', () => {
    tabs.forEach((item) => item.classList.remove('active'));
    tab.classList.add('active');
    panels.forEach((panel) => {
      panel.hidden = panel.dataset.panel !== tab.dataset.tab;
    });
  });
});

updateRangeValues();
renderTasks(storage.get('dailyTasks', []));
renderTimeline(planTimeline, storage.get('dailyPlans', []), 'plan');
renderTimeline(timerTimeline, storage.get('timerSessions', []), 'timer');
resetTimer();
initAutostart();
initTheme();
