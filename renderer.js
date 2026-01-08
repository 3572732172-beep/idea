const plannerText = document.getElementById('planner-text');
const savePlanButton = document.getElementById('save-plan');
const saveStatus = document.getElementById('save-status');
const taskInput = document.getElementById('task-input');
const addTaskButton = document.getElementById('add-task');
const taskList = document.getElementById('task-list');
const autostartToggle = document.getElementById('autostart-toggle');

const timerLabel = document.getElementById('timer-label');
const timerTime = document.getElementById('timer-time');
const progressBar = document.getElementById('progress-bar');
const startButton = document.getElementById('start-timer');
const pauseButton = document.getElementById('pause-timer');
const resetButton = document.getElementById('reset-timer');
const focusLengthInput = document.getElementById('focus-length');
const breakLengthInput = document.getElementById('break-length');

let timerInterval = null;
let isFocus = true;
let remainingSeconds = 25 * 60;
let totalSeconds = 25 * 60;

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

const startTimer = () => {
  if (timerInterval) {
    return;
  }
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
  }, 1000);
};

const pauseTimer = () => {
  if (timerInterval) {
    clearInterval(timerInterval);
    timerInterval = null;
  }
};

const resetTimer = () => {
  pauseTimer();
  isFocus = true;
  totalSeconds = Number(focusLengthInput.value) * 60;
  remainingSeconds = totalSeconds;
  updateTimerUI();
};

const savePlan = () => {
  localStorage.setItem('dailyPlan', plannerText.value);
  saveStatus.textContent = '已保存';
  setTimeout(() => {
    saveStatus.textContent = '自动保存已开启';
  }, 1500);
};

const loadPlan = () => {
  const saved = localStorage.getItem('dailyPlan');
  if (saved) {
    plannerText.value = saved;
  }
};

const saveTasks = (tasks) => {
  localStorage.setItem('dailyTasks', JSON.stringify(tasks));
};

const renderTasks = (tasks) => {
  taskList.innerHTML = '';
  tasks.forEach((task, index) => {
    const item = document.createElement('li');
    item.className = 'task-item';

    const text = document.createElement('span');
    text.textContent = task;

    const removeButton = document.createElement('button');
    removeButton.className = 'ghost';
    removeButton.textContent = '完成';
    removeButton.addEventListener('click', () => {
      const updated = tasks.filter((_, taskIndex) => taskIndex !== index);
      saveTasks(updated);
      renderTasks(updated);
    });

    item.append(text, removeButton);
    taskList.append(item);
  });
};

const loadTasks = () => {
  const saved = localStorage.getItem('dailyTasks');
  if (!saved) {
    return [];
  }
  try {
    const tasks = JSON.parse(saved);
    return Array.isArray(tasks) ? tasks : [];
  } catch (error) {
    return [];
  }
};

savePlanButton.addEventListener('click', savePlan);
plannerText.addEventListener('input', () => {
  localStorage.setItem('dailyPlan', plannerText.value);
});

addTaskButton.addEventListener('click', () => {
  const value = taskInput.value.trim();
  if (!value) {
    return;
  }
  const tasks = loadTasks();
  tasks.unshift(value);
  saveTasks(tasks);
  renderTasks(tasks);
  taskInput.value = '';
});

taskInput.addEventListener('keydown', (event) => {
  if (event.key === 'Enter') {
    addTaskButton.click();
  }
});

startButton.addEventListener('click', startTimer);

pauseButton.addEventListener('click', pauseTimer);

resetButton.addEventListener('click', resetTimer);

focusLengthInput.addEventListener('change', () => {
  if (isFocus) {
    resetTimer();
  }
});

breakLengthInput.addEventListener('change', () => {
  if (!isFocus) {
    resetTimer();
  }
});

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

loadPlan();
renderTasks(loadTasks());
resetTimer();
initAutostart();
