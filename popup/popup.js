const $label = document.getElementById("label");
const $custom = document.getElementById("custom");
const $status = document.getElementById("status");

const STORAGE_KEY = "formAgreeSettings";

function getSelectedLabel() {
  if ($label.value === "__custom__") {
    return ($custom.value || "").trim();
  }
  return $label.value;
}

function setStatus(text, kind) {
  $status.textContent = text;
  $status.classList.remove("ok", "err");
  if (kind) $status.classList.add(kind);
}

async function loadSettings() {
  try {
    const data = await chrome.storage.sync.get(STORAGE_KEY);
    const settings = data[STORAGE_KEY] || {};
    if (settings.label) {
      const isPreset = [...$label.options].some(
        (o) => o.value === settings.label
      );
      if (isPreset) {
        $label.value = settings.label;
      } else {
        $label.value = "__custom__";
        $custom.value = settings.label;
      }
    }
  } catch {
    /* ignore */
  }
  $custom.hidden = $label.value !== "__custom__";
}

async function saveSettings() {
  try {
    await chrome.storage.sync.set({
      [STORAGE_KEY]: { label: getSelectedLabel() },
    });
  } catch {
    /* ignore */
  }
}

async function getActiveFormTab() {
  const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
  if (!tab || !tab.id) {
    throw new Error("No active tab");
  }
  if (!/^https:\/\/docs\.google\.com\/forms\//.test(tab.url || "")) {
    throw new Error("Active tab is not a Google Form");
  }
  return tab;
}

function sendMessage(tabId, message) {
  return new Promise((resolve) => {
    chrome.tabs.sendMessage(tabId, message, (response) => {
      const err = chrome.runtime.lastError;
      if (err) {
        resolve({ ok: false, error: err.message });
        return;
      }
      resolve(response || { ok: false, error: "No response" });
    });
  });
}

async function ensureContentScript(tabId) {
  // Try a ping first; if no response, inject content.js manually.
  const ping = await sendMessage(tabId, { type: "PING" });
  if (ping.ok) return;
  try {
    await chrome.scripting.executeScript({
      target: { tabId },
      files: ["content/content.js"],
    });
  } catch (e) {
    throw new Error("Couldn't inject content script: " + e.message);
  }
}

async function run(messageType) {
  const label = getSelectedLabel();
  if (!label) {
    setStatus("Enter a custom option text first.", "err");
    return;
  }
  setStatus("Working…");
  try {
    const tab = await getActiveFormTab();
    await ensureContentScript(tab.id);
    const res = await sendMessage(tab.id, { type: messageType, label });
    if (!res.ok) {
      setStatus(res.error || "Failed", "err");
      return;
    }
    let msg = `Selected '${label}' on ${res.clicks} question(s).`;
    if (res.action === "next") msg += " Clicked Next.";
    else if (res.action === "submit") msg += " Submitted.";
    else if (res.action === "none" && messageType !== "FILL")
      msg += " (No Next/Submit found.)";
    setStatus(msg, "ok");
    await saveSettings();
  } catch (e) {
    setStatus(e.message || String(e), "err");
  }
}

document.getElementById("fill").addEventListener("click", () => run("FILL"));
document
  .getElementById("fillNext")
  .addEventListener("click", () => run("FILL_AND_NEXT"));
document
  .getElementById("fillSubmit")
  .addEventListener("click", () => run("FILL_AND_SUBMIT"));

$label.addEventListener("change", () => {
  $custom.hidden = $label.value !== "__custom__";
  if ($label.value === "__custom__") $custom.focus();
  saveSettings();
});

$custom.addEventListener("input", saveSettings);

loadSettings();
