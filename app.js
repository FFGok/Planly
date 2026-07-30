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


/* =========================
   STORAGE
========================= */

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


/* =========================
   DATE
========================= */

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
    "en-US",
    {
      day: "numeric",
      month: "long",
      year: "numeric"
    }
  ).format(date);
}


/* =========================
   SECURITY
========================= */

function escapeHTML(value) {
  return value
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");
}


/* =========================
   FILTERING
========================= */

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


/* =========================
   STATS
========================= */

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


/* =========================
   HEADINGS
========================= */

function updateHeadings() {
  if (activeView === "today") {
    pageTitle.textContent = "Today";

    pageDescription.textContent =
      "View today's plans.";

    listTitle.textContent =
      "Today's plans";

    listSubtitle.textContent =
      "What you need to do today.";

    return;
  }

  if (activeView === "upcoming") {
    pageTitle.textContent =
      "Upcoming";

    pageDescription.textContent =
      "View your upcoming plans.";

    listTitle.textContent =
      "Upcoming plans";

    listSubtitle.textContent =
      "View your plans in chronological order.";

    return;
  }

  pageTitle.textContent =
    "Completed";

  pageDescription.textContent =
    "View your completed plans.";

  listTitle.textContent =
    "Completed plans";

  listSubtitle.textContent =
    "History of your completed plans.";
}


/* =========================
   PLAN LIST
========================= */

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
        aria-label="Completed"
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
              ? "<span>Reminder on</span>"
              : ""
          }

        </div>

      </div>

      <div class="plan-actions">

        <button
          class="plan-action delete"
          data-action="delete"
          data-id="${plan.id}"
          aria-label="Delete"
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


/* =========================
   ADD PLAN MODAL
========================= */

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


/* =========================
   NOTIFICATIONS
========================= */

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
      // Alarm continues even
      // without notifications.
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
          `${plan.title} - It's time for your plan.`
      }
    );

  notification.onclick = () => {
    window.focus();
  };
}


/* =========================
   PLANLY ALARM
========================= */

function playChime() {
  try {
    const AudioContextClass =
      window.AudioContext ||
      window.webkitAudioContext;

    if (!AudioContextClass) {
      return;
    }

    const context =
      new AudioContextClass();

    const now =
      context.currentTime;

    const masterGain =
      context.createGain();

    masterGain.connect(
      context.destination
    );

    masterGain.gain.setValueAtTime(
      0.82,
      now
    );

    const notes = [
      {
        frequency: 659.25,
        start: 0.00,
        duration: 0.70,
        volume: 0.55
      },

      {
        frequency: 783.99,
        start: 0.18,
        duration: 0.75,
        volume: 0.48
      },

      {
        frequency: 987.77,
        start: 0.36,
        duration: 0.85,
        volume: 0.42
      },

      {
        frequency: 1174.66,
        start: 0.58,
        duration: 0.95,
        volume: 0.36
      },

      {
        frequency: 783.99,
        start: 1.25,
        duration: 0.70,
        volume: 0.50
      },

      {
        frequency: 987.77,
        start: 1.43,
        duration: 0.80,
        volume: 0.44
      },

      {
        frequency: 1318.51,
        start: 1.65,
        duration: 1.05,
        volume: 0.36
      }
    ];

    notes.forEach((note) => {
      const oscillator =
        context.createOscillator();

      const gain =
        context.createGain();

      oscillator.type =
        "sine";

      oscillator.frequency
        .setValueAtTime(
          note.frequency,
          now + note.start
        );

      gain.gain.setValueAtTime(
        0.0001,
        now + note.start
      );

      gain.gain
        .exponentialRampToValueAtTime(
          note.volume,
          now +
            note.start +
            0.035
        );

      gain.gain
        .exponentialRampToValueAtTime(
          0.0001,
          now +
            note.start +
            note.duration
        );

      oscillator.connect(
        gain
      );

      gain.connect(
        masterGain
      );

      oscillator.start(
        now + note.start
      );

      oscillator.stop(
        now +
          note.start +
          note.duration
      );
    });

    setTimeout(() => {
      context.close();
    }, 3000);

  } catch (error) {
    console.error(
      "Could not start Planly alarm sound.",
      error
    );
  }
}


/* =========================
   ALARM LOOP
========================= */

function playAlarm() {
  stopAlarm();

  playChime();

  alarmInterval =
    setInterval(() => {
      playChime();
    }, 3500);
}

function stopAlarm() {
  if (alarmInterval) {
    clearInterval(
      alarmInterval
    );

    alarmInterval = null;
  }
}


/* =========================
   REMINDER
========================= */

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
      plan.reminderTriggered =
        true;

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


/* =========================
   COMPLETE / DELETE
========================= */

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


/* =========================
   ADD PLAN EVENTS
========================= */

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


/* =========================
   CREATE PLAN
========================= */

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


/* =========================
   PLAN ACTIONS
========================= */

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


/* =========================
   NAVIGATION
========================= */

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


/* =========================
   SNOOZE
========================= */

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
      .reminderTriggered =
        false;

    stopAlarm();

    reminderOverlay
      .classList.remove(
        "visible"
      );

    activeReminderPlan =
      null;

    savePlans();

    render();
  }
);


/* =========================
   COMPLETE REMINDER
========================= */

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

      activeReminderPlan =
        null;

      savePlans();

      render();
    }
  );


/* =========================
   KEYBOARD
========================= */

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


/* =========================
   VISIBILITY
========================= */

document.addEventListener(
  "visibilitychange",
  () => {
    if (!document.hidden) {
      checkReminders();
    }
  }
);


/* =========================
   REMINDER LOOP
========================= */

setInterval(
  checkReminders,
  1000
);


/* =========================
   START PLANLY
========================= */

loadPlans();

checkReminders();
