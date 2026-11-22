# Test Case Generator — IT Track QA Automation

Single-page, dependency-free generator that turns a user story into a QA test suite:
positive / negative / boundary-value (BVA) / security cases, each exportable as a
Gherkin BDD file or a Markdown test document.

## Run

Open `index.html` in a browser (no build step), or serve the folder with Laragon/Apache.

## Test

```bash
npm test        # node --test, requires Node 18+
```

## Structure

| Path | Purpose |
|------|---------|
| `index.html` | Input form, tabbed output |
| `src/app.js` | Generator engine + table / Gherkin / Markdown renderers |
| `src/style.css` | Layout and theming |
| `test/smoke.test.js` | Engine smoke tests via stubbed DOM |