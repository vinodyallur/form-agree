# Form Agree

A tiny Chrome extension that selects a chosen option (e.g. **"Agree"**) on every
multiple-choice question in the Google Form you have open, and optionally
clicks **Next** or **Submit** for you.

Useful for end-of-semester course feedback forms with dozens of identical
Likert-scale questions.

![popup](docs/popup.png)

## Features

- Works on any Google Form (`docs.google.com/forms/*`).
- Pick any option label: `Agree`, `Strongly agree`, `Disagree`, or anything
  custom.
- Three actions:
  - **Fill this page** — only selects the option, doesn't navigate.
  - **Fill & Next** — fills, then clicks the Next button.
  - **Fill & Submit** — fills, then clicks the Submit button.
- Skips questions that are already answered.
- Remembers your last chosen option (synced across your Chrome profile).
- No background process, no analytics, no network calls. The extension only
  runs when you click a button in the popup.

## Install (load unpacked)

1. Download or clone this repo.
2. Open `chrome://extensions` in Chrome / Edge / Brave.
3. Toggle **Developer mode** on (top right).
4. Click **Load unpacked** and pick the `form-agree-extension` folder.
5. Pin the extension to your toolbar.

## Usage

1. Open a Google Form in a tab.
2. Click the **Form Agree** icon in the toolbar.
3. Pick the option you want (default: `Agree`).
4. Click **Fill this page** to select it on every visible question.
5. Click **Fill & Next** to also advance to the next page.
6. On the last page, click **Fill & Submit** when you're ready.

If a question requires a different answer (e.g. a free-text USN field), the
extension will leave it alone — fill it manually before submitting.

## Permissions

| Permission | Why it's needed |
| --- | --- |
| `activeTab` | Run the fill action on the form you're currently viewing. |
| `scripting` | Inject the content script into Google Forms tabs that were already open before installing. |
| `storage` | Remember the last option you picked. |
| `host_permissions: docs.google.com/forms/*` | Limit the content script to Google Forms only — no other sites. |

The extension does **not** make any network requests or read any data outside
the form on the active tab.

## Development

```
form-agree-extension/
├── manifest.json
├── popup/
│   ├── popup.html
│   ├── popup.css
│   └── popup.js
├── content/
│   └── content.js
├── icons/
│   ├── icon16.png
│   ├── icon48.png
│   └── icon128.png
├── scripts/
│   └── make_icons.py   # regenerate icons (requires Pillow)
└── README.md
```

The popup sends a message (`FILL`, `FILL_AND_NEXT`, or `FILL_AND_SUBMIT`) to
the content script, which scans the form for `div[role="radiogroup"]` elements
and clicks the matching `div[role="radio"]`.

To rebuild icons after editing `scripts/make_icons.py`:

```
pip install pillow
python scripts/make_icons.py
```

## License

[MIT](LICENSE)

## Disclaimer

Use responsibly. Submit only forms you're authorized to submit, and only with
answers you actually agree with — automated honest feedback is still your
responsibility.
