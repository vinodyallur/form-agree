// Content script for Google Forms.
// Receives messages from the popup and performs the requested action on the page.

const SUBMIT_RE = /^\s*Submit\s*$/i;
const NEXT_RE = /^\s*Next\s*$/i;

function fillRadios(label) {
  const target = (label || "Agree").trim().toLowerCase();
  let clicks = 0;
  let totalGroups = 0;

  // Each radiogroup is one question.
  document.querySelectorAll('div[role="radiogroup"]').forEach((group) => {
    totalGroups += 1;

    // Already answered? skip.
    const checked = group.querySelector('div[role="radio"][aria-checked="true"]');
    if (checked) return;

    const radios = group.querySelectorAll('div[role="radio"]');
    let match = null;
    for (const r of radios) {
      const v = (r.getAttribute("data-value") || r.getAttribute("aria-label") || "").trim().toLowerCase();
      if (v === target) {
        match = r;
        break;
      }
    }
    if (match) {
      match.click();
      clicks += 1;
    }
  });

  // Some forms render radios outside of role=radiogroup.
  // Fallback: scan loose role=radio elements that haven't been clicked.
  if (clicks === 0) {
    document.querySelectorAll('div[role="radio"]').forEach((r) => {
      const v = (r.getAttribute("data-value") || r.getAttribute("aria-label") || "").trim().toLowerCase();
      if (v === target && r.getAttribute("aria-checked") !== "true") {
        r.click();
        clicks += 1;
      }
    });
  }

  return { clicks, totalGroups };
}

function findActionButton(regex) {
  const buttons = document.querySelectorAll('div[role="button"]');
  for (const b of buttons) {
    const text = (b.innerText || b.getAttribute("aria-label") || "").trim();
    if (regex.test(text)) return b;
  }
  return null;
}

function clickNextOrSubmit(preferSubmit) {
  // Submit takes priority on the last page; otherwise click Next.
  const submit = findActionButton(SUBMIT_RE);
  const next = findActionButton(NEXT_RE);

  if (preferSubmit && submit) {
    submit.scrollIntoView({ block: "center" });
    submit.click();
    return "submit";
  }
  if (next) {
    next.scrollIntoView({ block: "center" });
    next.click();
    return "next";
  }
  if (submit) {
    submit.scrollIntoView({ block: "center" });
    submit.click();
    return "submit";
  }
  return "none";
}

chrome.runtime.onMessage.addListener((msg, _sender, sendResponse) => {
  try {
    if (msg && msg.type === "FILL") {
      const result = fillRadios(msg.label);
      sendResponse({ ok: true, ...result });
      return true;
    }
    if (msg && msg.type === "FILL_AND_NEXT") {
      const result = fillRadios(msg.label);
      const action = clickNextOrSubmit(false);
      sendResponse({ ok: true, ...result, action });
      return true;
    }
    if (msg && msg.type === "FILL_AND_SUBMIT") {
      const result = fillRadios(msg.label);
      const action = clickNextOrSubmit(true);
      sendResponse({ ok: true, ...result, action });
      return true;
    }
    if (msg && msg.type === "PING") {
      sendResponse({ ok: true });
      return true;
    }
  } catch (e) {
    sendResponse({ ok: false, error: String(e) });
    return true;
  }
});
