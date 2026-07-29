const STORAGE_KEY = "planly_plans_v1";

let plans = [];
let activeView = "today";
let activeReminderPlan = null;
let alarmInterval = null;

const addPlanButton =
  document.getElementById("addPlanButton");

const modalOverlay =
  document.getElementById("modalOverlay");

const closeModalButton =
  document.getElementById("closeModalButton");

const cancelPlanButton =
  document.getElementById("cancelPlanButton");

const planForm =
  document.getElementById("planForm");

const planTitle =
  document.getElementById("planTitle");

const planDate =
  document.getElementById("planDate");

const planTime =
  document.getElementById("planTime");

const planReminder =
  document.getElementById("planReminder");

const plansList =
  document.getElementById("plansList");

const emptyState =
  document.getElementById("emptyState");

const todayCount =
  document.getElementById("todayCount");

const upcomingCount =
  document.getElementById("upcomingCount");

const completedCount =
  document.getElementById("completedCount");

const pageTitle =
  document.getElementById("pageTitle");

const pageDescription =
  document.getElementById("pageDescription");

const listTitle =
  document.getElementById("listTitle");

const listSubtitle =
  document.getElementById("listSubtitle");

const reminderOverlay =
  document.getElementById("reminderOverlay");

const reminderTitle =
  document.getElementById("reminderTitle");

const reminderTime =
  document.getElementById("reminderTime");

const snoozeButton =
  document.getElementById("snoozeButton");

const completeReminderButton =
  document.getElementById(
    "completeReminderButton"
  );

const navItems =
  document.querySelectorAll(".nav-item");

function loadPlans() {
  try {
    const saved =
      localStorage.getItem(STORAGE_KEY);

    plans = saved
      ? JSON.parse(saved)
      : [];

    if (!Array.isArray(plans)) {
      plans = [];
    }
  } catch {
    plans = [];
  }

  render();
}

function savePlans() {
  localStorage.setItem(
    STORAGE_KEY,
    JSON.stringify(plans)
  );
}

function getTodayString() {
  const date = new Date();

  const year =
    date.getFullYear();

  const month =
    String(date.getMonth() + 1)
      .padStart(2, "0");

  const day =
    String(date.getDate())
      .padStart(2, "0");

  return `${year}-${month}-${day}`;
}

function formatDate(dateString) {
  const date =
    new Date(
      `${dateString}T00:00:00`
    );

  return new Intl.DateTimeFormat(
    "tr-TR",
    {
      day: "numeric",
      month: "long",
      year: "numeric"
    }
  ).format(date);
}

function escapeHTML(value) {
  return value
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");
}

function getFilteredPlans() {
  const today =
    getTodayString();

  if (activeView === "today") {
    return plans.filter(
      (plan) =>
        plan.date === today &&
        !plan.completed
    );
  }

  if (activeView === "upcoming") {
    return plans.filter(
      (plan) =>
        plan.date >= today &&
        !plan.completed
    );
  }

  return plans.filter(
    (plan) => plan.completed
  );
}

function sortPlans(items) {
  return [...items].sort(
    (a, b) => {
      return (
        new Date(
          `${a.date}T${a.time}`
        ).getTime()
        -
        new Date(
          `${b.date}T${b.time}`
        ).getTime()
      );
    }
  );
}

function renderStats() {
  const today =
    getTodayString();

  todayCount.textContent =
    plans.filter(
      (plan) =>
        plan.date === today &&
        !plan.completed
    ).length;

  upcomingCount.textContent =
    plans.filter(
      (plan) =>
        plan.date >= today &&
        !plan.completed
    ).length;

  completedCount.textContent =
    plans.filter(
      (plan) => plan.completed
    ).length;
}

function updateHeadings() {
  if (activeView === "today") {
    pageTitle.textContent = "Bugün";
    pageDescription.textContent =
      "Bugünkü planlarını görüntüle.";

    listTitle.textContent =
      "Bugünkü planların";

    listSubtitle.textContent =
      "Bugün yapman gerekenler.";

    return;
  }

  if (activeView === "upcoming") {
    pageTitle.textContent =
      "Yaklaşan";

    pageDescription.textContent =
      "Yaklaşan planlarını görüntüle.";

    listTitle.textContent =
      "Yaklaşan planlar";

    listSubtitle.textContent =
      "Planlarını tarih sırasıyla görüntüle.";

    return;
  }

  pageTitle.textContent =
    "Tamamlanan";

  pageDescription.textContent =
    "Tamamladığın planları görüntüle.";

  listTitle.textContent =
    "Tamamlanan planlar";

  listSubtitle.textContent =
    "Bitirdiğin planların geçmişi.";
}

function renderPlans() {
  const filtered =
    sortPlans(
      getFilteredPlans()
    );

  plansList.innerHTML = "";

  if (!filtered.length) {
    emptyState.classList.remove(
      "hidden"
    );

    return;
  }

  emptyState.classList.add(
    "hidden"
  );

  filtered.forEach((plan) => {
    const item =
      document.createElement("div");

    item.className =
      `plan-item ${
        plan.completed
          ? "completed"
          : ""
      }`;

    item.innerHTML = `
      <button
        class="plan-check"
        data-action="complete"
        data-id="${plan.id}"
        aria-label="Tamamlandı"
      >
        <svg
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          stroke-width="2.2"
        >
          <path d="m6 12 4 4 8-9"/>
        </svg>
      </button>

      <div class="plan-info">

        <div class="plan-title">
          ${escapeHTML(plan.title)}
        </div>

        <div class="plan-meta">

          <span>
            ${formatDate(plan.date)}
          </span>

          <span>
            ${plan.time}
          </span>

          ${
            plan.reminder
              ? "<span>Hatırlatma açık</span>"
              : ""
          }

        </div>

      </div>

      <div class="plan-actions">

        <button
          class="plan-action delete"
          data-action="delete"
          data-id="${plan.id}"
          aria-label="Sil"
        >

          <svg
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            stroke-width="1.8"
          >
            <path d="M4 7h16"/>
            <path d="M9 7V4h6v3"/>
            <path d="M7 7l1 13h8l1-13"/>
          </svg>

        </button>

      </div>
    `;

    plansList.appendChild(item);
  });
}

function render() {
  renderStats();
  updateHeadings();
  renderPlans();
}

function openPlanModal() {
  planForm.reset();

  planDate.value =
    getTodayString();

  const nextTime =
    new Date(
      Date.now() +
      30 * 60 * 1000
    );

  planTime.value =
    `${String(
      nextTime.getHours()
    ).padStart(2, "0")}:${String(
      nextTime.getMinutes()
    ).padStart(2, "0")}`;

  planReminder.checked = true;

  modalOverlay.classList.add(
    "visible"
  );

  setTimeout(
    () => planTitle.focus(),
    50
  );
}

function closePlanModal() {
  modalOverlay.classList.remove(
    "visible"
  );
}

async function requestNotifications() {
  if (
    !("Notification" in window)
  ) {
    return;
  }

  if (
    Notification.permission ===
    "default"
  ) {
    try {
      await Notification
        .requestPermission();
    } catch {
      // Bildirim izni alınamazsa
      // Planly içi alarm devam eder.
    }
  }
}

function sendNotification(plan) {
  if (
    !("Notification" in window)
  ) {
    return;
  }

  if (
    Notification.permission !==
    "granted"
  ) {
    return;
  }

  const notification =
    new Notification(
      "Planly",
      {
        body:
          `${plan.title} - Planının zamanı geldi.`
      }
    );

  notification.onclick = () => {
    window.focus();
  };
}

function playTone(
  frequency,
  duration
) {
  try {
    const AudioContextClass =
      window.AudioContext ||
      window.webkitAudioContext;

    const context =
      new AudioContextClass();

    const oscillator =
      context.createOscillator();

    const gain =
      context.createGain();

    oscillator.type = "sine";
    oscillator.frequency.value =
      frequency;

    gain.gain.value = 0.16;

    oscillator.connect(gain);
    gain.connect(
      context.destination
    );

    oscillator.start();

    setTimeout(() => {
      oscillator.stop();
      context.close();
    }, duration);
  } catch (error) {
    console.error(
      "Alarm sesi başlatılamadı.",
      error
    );
  }
}

function playAlarm() {
  stopAlarm();

  let tone = false;

  playTone(880, 450);

  alarmInterval =
    setInterval(() => {
      tone = !tone;

      playTone(
        tone ? 880 : 1040,
        450
      );
    }, 650);
}

function stopAlarm() {
  if (alarmInterval) {
    clearInterval(
      alarmInterval
    );

    alarmInterval = null;
  }
}

function showReminder(plan) {
  activeReminderPlan = plan;

  reminderTitle.textContent =
    plan.title;

  reminderTime.textContent =
    `${formatDate(plan.date)} • ${plan.time}`;

  reminderOverlay.classList.add(
    "visible"
  );

  playAlarm();
  sendNotification(plan);
}

function checkReminders() {
  const now = Date.now();

  let changed = false;

  for (const plan of plans) {
    if (
      plan.completed ||
      !plan.reminder ||
      plan.reminderTriggered
    ) {
      continue;
    }

    const target =
      new Date(
        `${plan.date}T${plan.time}`
      ).getTime();

    if (
      !Number.isNaN(target) &&
      now >= target
    ) {
      plan.reminderTriggered = true;

      changed = true;

      showReminder(plan);

      break;
    }
  }

  if (changed) {
    savePlans();
    render();
  }
}

function toggleComplete(planId) {
  const plan =
    plans.find(
      (item) =>
        item.id === planId
    );

  if (!plan) {
    return;
  }

  plan.completed =
    !plan.completed;

  savePlans();
  render();
}

function deletePlan(planId) {
  plans =
    plans.filter(
      (plan) =>
        plan.id !== planId
    );

  savePlans();
  render();
}

addPlanButton.addEventListener(
  "click",
  () => {
    requestNotifications();
    openPlanModal();
  }
);

closeModalButton.addEventListener(
  "click",
  closePlanModal
);

cancelPlanButton.addEventListener(
  "click",
  closePlanModal
);

modalOverlay.addEventListener(
  "click",
  (event) => {
    if (
      event.target ===
      modalOverlay
    ) {
      closePlanModal();
    }
  }
);

planForm.addEventListener(
  "submit",
  (event) => {
    event.preventDefault();

    const title =
      planTitle.value.trim();

    const date =
      planDate.value;

    const time =
      planTime.value;

    if (
      !title ||
      !date ||
      !time
    ) {
      return;
    }

    plans.push({
      id:
        crypto.randomUUID(),

      title,
      date,
      time,

      reminder:
        planReminder.checked,

      reminderTriggered:
        false,

      completed:
        false,

      createdAt:
        new Date()
          .toISOString()
    });

    savePlans();

    closePlanModal();

    render();
  }
);

plansList.addEventListener(
  "click",
  (event) => {
    const button =
      event.target.closest(
        "[data-action]"
      );

    if (!button) {
      return;
    }

    const id =
      button.dataset.id;

    if (
      button.dataset.action ===
      "complete"
    ) {
      toggleComplete(id);
    }

    if (
      button.dataset.action ===
      "delete"
    ) {
      deletePlan(id);
    }
  }
);

navItems.forEach(
  (button) => {
    button.addEventListener(
      "click",
      () => {
        navItems.forEach(
          (item) =>
            item.classList.remove(
              "active"
            )
        );

        button.classList.add(
          "active"
        );

        activeView =
          button.dataset.view;

        render();
      }
    );
  }
);

snoozeButton.addEventListener(
  "click",
  () => {
    if (!activeReminderPlan) {
      return;
    }

    const newTime =
      new Date(
        Date.now() +
        10 * 60 * 1000
      );

    activeReminderPlan.date =
      `${newTime.getFullYear()}-${String(
        newTime.getMonth() + 1
      ).padStart(2, "0")}-${String(
        newTime.getDate()
      ).padStart(2, "0")}`;

    activeReminderPlan.time =
      `${String(
        newTime.getHours()
      ).padStart(2, "0")}:${String(
        newTime.getMinutes()
      ).padStart(2, "0")}`;

    activeReminderPlan
      .reminderTriggered = false;

    stopAlarm();

    reminderOverlay.classList.remove(
      "visible"
    );

    activeReminderPlan = null;

    savePlans();
    render();
  }
);

completeReminderButton
  .addEventListener(
    "click",
    () => {
      if (!activeReminderPlan) {
        return;
      }

      activeReminderPlan.completed =
        true;

      stopAlarm();

      reminderOverlay
        .classList.remove(
          "visible"
        );

      activeReminderPlan = null;

      savePlans();
      render();
    }
  );

document.addEventListener(
  "keydown",
  (event) => {
    if (
      event.key === "Escape" &&
      modalOverlay.classList
        .contains("visible")
    ) {
      closePlanModal();
    }
  }
);

document.addEventListener(
  "visibilitychange",
  () => {
    if (!document.hidden) {
      checkReminders();
    }
  }
);

setInterval(
  checkReminders,
  1000
);

loadPlans();
checkReminders();
