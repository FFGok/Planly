let plans = [];

let activeView = "today";
let activeReminderPlan = null;

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
  document.getElementById("completeReminderButton");

const navItems =
  document.querySelectorAll(".nav-item");

function getTodayString() {
  const date = new Date();

  const year = date.getFullYear();

  const month =
    String(date.getMonth() + 1)
      .padStart(2, "0");

  const day =
    String(date.getDate())
      .padStart(2, "0");

  return `${year}-${month}-${day}`;
}

function formatDate(dateString) {
  if (!dateString) {
    return "";
  }

  const date =
    new Date(`${dateString}T00:00:00`);

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

async function loadPlans() {
  plans =
    await window.planly.getPlans();

  if (!Array.isArray(plans)) {
    plans = [];
  }

  render();
}

async function savePlans() {
  await window.planly.savePlans(plans);
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

  if (activeView === "completed") {
    return plans.filter(
      (plan) => plan.completed
    );
  }

  return plans;
}

function sortPlans(items) {
  return [...items].sort(
    (a, b) => {
      const aTime =
        new Date(
          `${a.date}T${a.time}`
        ).getTime();

      const bTime =
        new Date(
          `${b.date}T${b.time}`
        ).getTime();

      return aTime - bTime;
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
      "Önündeki planları tarih sırasıyla görüntüle.";

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
    sortPlans(getFilteredPlans());

  plansList.innerHTML = "";

  if (filtered.length === 0) {
    emptyState.classList.remove(
      "hidden"
    );

    return;
  }

  emptyState.classList.add("hidden");

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
          <path d="m6 12 4 4 8-9" />
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
            <path d="M4 7h16" />
            <path d="M9 7V4h6v3" />
            <path d="M7 7l1 13h8l1-13" />
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

  const now =
    new Date(
      Date.now() +
      30 * 60 * 1000
    );

  const hours =
    String(now.getHours())
      .padStart(2, "0");

  const minutes =
    String(now.getMinutes())
      .padStart(2, "0");

  planTime.value =
    `${hours}:${minutes}`;

  planReminder.checked = true;

  modalOverlay.classList.add(
    "visible"
  );

  setTimeout(() => {
    planTitle.focus();
  }, 50);
}

function closePlanModal() {
  modalOverlay.classList.remove(
    "visible"
  );
}

function playAlarm() {
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

    oscillator.frequency.value = 880;

    gain.gain.value = 0.14;

    oscillator.connect(gain);
    gain.connect(context.destination);

    oscillator.start();

    setTimeout(() => {
      oscillator.stop();
      context.close();
    }, 900);

    setTimeout(() => {
      playSecondTone();
    }, 1050);
  } catch (error) {
    console.error(
      "Alarm sesi oynatılamadı:",
      error
    );
  }
}

function playSecondTone() {
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

    oscillator.frequency.value = 1040;

    gain.gain.value = 0.12;

    oscillator.connect(gain);
    gain.connect(context.destination);

    oscillator.start();

    setTimeout(() => {
      oscillator.stop();
      context.close();
    }, 700);
  } catch (error) {
    console.error(error);
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
}

async function toggleComplete(planId) {
  const plan =
    plans.find(
      (item) => item.id === planId
    );

  if (!plan) {
    return;
  }

  plan.completed =
    !plan.completed;

  await savePlans();

  render();
}

async function deletePlan(planId) {
  plans =
    plans.filter(
      (plan) => plan.id !== planId
    );

  await savePlans();

  render();
}

addPlanButton.addEventListener(
  "click",
  openPlanModal
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
    if (event.target === modalOverlay) {
      closePlanModal();
    }
  }
);

planForm.addEventListener(
  "submit",
  async (event) => {
    event.preventDefault();

    const title =
      planTitle.value.trim();

    const date =
      planDate.value;

    const time =
      planTime.value;

    if (!title || !date || !time) {
      return;
    }

    const newPlan = {
      id:
        crypto.randomUUID(),

      title,
      date,
      time,

      reminder:
        planReminder.checked,

      reminderTriggered: false,

      completed: false,

      createdAt:
        new Date().toISOString()
    };

    plans.push(newPlan);

    await savePlans();

    closePlanModal();

    render();
  }
);

navItems.forEach((button) => {
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
});

plansList.addEventListener(
  "click",
  async (event) => {
    const button =
      event.target.closest(
        "[data-action]"
      );

    if (!button) {
      return;
    }

    const action =
      button.dataset.action;

    const planId =
      button.dataset.id;

    if (action === "complete") {
      await toggleComplete(planId);
    }

    if (action === "delete") {
      await deletePlan(planId);
    }
  }
);

snoozeButton.addEventListener(
  "click",
  async () => {
    if (!activeReminderPlan) {
      return;
    }

    plans =
      await window.planly.snoozePlan(
        activeReminderPlan.id,
        10
      );

    activeReminderPlan = null;

    reminderOverlay.classList.remove(
      "visible"
    );

    render();
  }
);

completeReminderButton.addEventListener(
  "click",
  async () => {
    if (!activeReminderPlan) {
      return;
    }

    const plan =
      plans.find(
        (item) =>
          item.id ===
          activeReminderPlan.id
      );

    if (plan) {
      plan.completed = true;

      await savePlans();
    }

    activeReminderPlan = null;

    reminderOverlay.classList.remove(
      "visible"
    );

    render();
  }
);

window.planly.onReminderTriggered(
  (plan) => {
    showReminder(plan);
  }
);

window.planly.onPlansUpdated(
  (updatedPlans) => {
    plans = updatedPlans;
    render();
  }
);

document.addEventListener(
  "keydown",
  (event) => {
    if (
      event.key === "Escape" &&
      modalOverlay.classList.contains(
        "visible"
      )
    ) {
      closePlanModal();
    }
  }
);

loadPlans();
