const {
  app,
  BrowserWindow,
  ipcMain,
  Notification
} = require("electron");

const path = require("path");
const fs = require("fs");

let mainWindow = null;
let reminderInterval = null;

function getPlansFilePath() {
  return path.join(app.getPath("userData"), "plans.json");
}

function readPlans() {
  try {
    const filePath = getPlansFilePath();

    if (!fs.existsSync(filePath)) {
      fs.writeFileSync(filePath, "[]", "utf8");
      return [];
    }

    const content = fs.readFileSync(filePath, "utf8");
    const parsed = JSON.parse(content);

    return Array.isArray(parsed) ? parsed : [];
  } catch (error) {
    console.error("Planlar okunamadı:", error);
    return [];
  }
}

function savePlans(plans) {
  try {
    fs.writeFileSync(
      getPlansFilePath(),
      JSON.stringify(plans, null, 2),
      "utf8"
    );

    return true;
  } catch (error) {
    console.error("Planlar kaydedilemedi:", error);
    return false;
  }
}

function createWindow() {
  mainWindow = new BrowserWindow({
    width: 1180,
    height: 760,
    minWidth: 900,
    minHeight: 620,
    backgroundColor: "#0b0d12",
    title: "Planly",
    autoHideMenuBar: true,
    show: false,

    webPreferences: {
      preload: path.join(__dirname, "preload.js"),
      contextIsolation: true,
      nodeIntegration: false
    }
  });

  mainWindow.loadFile("index.html");

  mainWindow.once("ready-to-show", () => {
    mainWindow.show();
  });

  mainWindow.on("close", (event) => {
    if (!app.isQuitting) {
      event.preventDefault();
      mainWindow.minimize();
    }
  });

  mainWindow.on("closed", () => {
    mainWindow = null;
  });
}

function showReminder(plan) {
  if (Notification.isSupported()) {
    const notification = new Notification({
      title: "Planly",
      body: `${plan.title}\nPlanının zamanı geldi.`,
      silent: true
    });

    notification.on("click", () => {
      if (!mainWindow) {
        createWindow();
      }

      if (mainWindow.isMinimized()) {
        mainWindow.restore();
      }

      mainWindow.show();
      mainWindow.focus();
    });

    notification.show();
  }

  if (mainWindow) {
    if (mainWindow.isMinimized()) {
      mainWindow.restore();
    }

    mainWindow.show();
    mainWindow.focus();

    mainWindow.webContents.send("reminder-triggered", plan);
  }
}

function checkReminders() {
  const plans = readPlans();
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

    const planDate = new Date(`${plan.date}T${plan.time}`);
    const planTime = planDate.getTime();

    if (Number.isNaN(planTime)) {
      continue;
    }

    if (now >= planTime) {
      plan.reminderTriggered = true;
      changed = true;

      showReminder(plan);
    }
  }

  if (changed) {
    savePlans(plans);

    if (mainWindow) {
      mainWindow.webContents.send("plans-updated", plans);
    }
  }
}

ipcMain.handle("plans:get", () => {
  return readPlans();
});

ipcMain.handle("plans:save", (event, plans) => {
  if (!Array.isArray(plans)) {
    return false;
  }

  return savePlans(plans);
});

ipcMain.handle("plan:snooze", (event, planId, minutes = 10) => {
  const plans = readPlans();

  const plan = plans.find((item) => item.id === planId);

  if (!plan) {
    return false;
  }

  const newTime = new Date(Date.now() + minutes * 60 * 1000);

  const year = newTime.getFullYear();
  const month = String(newTime.getMonth() + 1).padStart(2, "0");
  const day = String(newTime.getDate()).padStart(2, "0");
  const hours = String(newTime.getHours()).padStart(2, "0");
  const minutesValue = String(newTime.getMinutes()).padStart(2, "0");

  plan.date = `${year}-${month}-${day}`;
  plan.time = `${hours}:${minutesValue}`;
  plan.reminderTriggered = false;

  savePlans(plans);

  return plans;
});

app.whenReady().then(() => {
  createWindow();

  reminderInterval = setInterval(checkReminders, 1000);

  app.on("activate", () => {
    if (!mainWindow) {
      createWindow();
    } else {
      mainWindow.show();
    }
  });
});

app.on("before-quit", () => {
  app.isQuitting = true;

  if (reminderInterval) {
    clearInterval(reminderInterval);
  }
});

app.on("window-all-closed", () => {
  if (process.platform !== "darwin") {
    // Planly arka planda hatırlatmaları kontrol etmeye devam eder.
  }
});
