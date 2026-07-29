const { contextBridge, ipcRenderer } = require("electron");

contextBridge.exposeInMainWorld("planly", {
  getPlans: () => ipcRenderer.invoke("plans:get"),

  savePlans: (plans) => ipcRenderer.invoke("plans:save", plans),

  snoozePlan: (planId, minutes) =>
    ipcRenderer.invoke("plan:snooze", planId, minutes),

  onReminderTriggered: (callback) => {
    ipcRenderer.on("reminder-triggered", (event, plan) => {
      callback(plan);
    });
  },

  onPlansUpdated: (callback) => {
    ipcRenderer.on("plans-updated", (event, plans) => {
      callback(plans);
    });
  }
});
