/* ═══════════════════════════════════════════════════════════
   Test Case Generator — IT Track QA Automation
   app.js — Pure Vanilla JS, no dependencies
═══════════════════════════════════════════════════════════ */

'use strict';

// ── DOM refs ────────────────────────────────────────────────
const $ = id => document.getElementById(id);

const moduleInput    = $('moduleInput');
const storyInput     = $('storyInput');
const fieldsInput    = $('fieldsInput');
const endpointInput  = $('endpointInput');
const minPassInput   = $('minPassInput');
const maxPassInput   = $('maxPassInput');
const maxAttempts    = $('maxAttemptsInput');
const generateBtn    = $('generateBtn');
const clearBtn       = $('clearBtn');
const outputPanel    = $('outputPanel');
const summaryBar     = $('summaryBar');
const tableOutput    = $('tableOutput');
const gherkinOutput  = $('gherkinOutput');
const markdownOutput = $('markdownOutput');
const copyMdBtn      = $('copyMdBtn');
const downloadBtn    = $('downloadBtn');
const toast          = $('toast');

// ── Tab switching ────────────────────────────────────────────
document.querySelectorAll('.tab').forEach(btn => {
  btn.addEventListener('click', () => {
    document.querySelectorAll('.tab').forEach(t => t.classList.remove('active'));
    document.querySelectorAll('.tab-content').forEach(c => c.classList.add('hidden'));
    btn.classList.add('active');
    $('tab' + btn.dataset.tab.charAt(0).toUpperCase() + btn.dataset.tab.slice(1)).classList.remove('hidden');
  });
});

// ── Clear ────────────────────────────────────────────────────
clearBtn.addEventListener('click', () => {
  moduleInput.value    = '';
  storyInput.value     = '';
  fieldsInput.value    = '';
  endpointInput.value  = '';
  minPassInput.value   = '8';
  maxPassInput.value   = '64';
  maxAttempts.value    = '5';
  outputPanel.style.display = 'none';
});

// ── Generate ─────────────────────────────────────────────────
generateBtn.addEventListener('click', () => {
  const module   = moduleInput.value.trim()   || 'Feature';
  const story    = storyInput.value.trim()    || '';
  const fields   = fieldsInput.value.trim()
                    ? fieldsInput.value.split(',').map(f => f.trim()).filter(Boolean)
                    : ['Email', 'Password'];
  const endpoint = endpointInput.value.trim() || '/page';
  const minPass  = parseInt(minPassInput.value) || 8;
  const maxPass  = parseInt(maxPassInput.value) || 64;
  const maxAtt   = parseInt(maxAttempts.value)  || 5;

  if (!story) {
    showToast('⚠ Please enter a User Story first.');
    storyInput.focus();
    return;
  }

  const testCases = generateTestCases({ module, story, fields, endpoint, minPass, maxPass, maxAtt });

  renderSummary(testCases);
  renderTable(testCases);
  renderGherkin(testCases, { module, story, fields, endpoint, minPass, maxPass, maxAtt });
  renderMarkdown(testCases, { module, story, fields, endpoint, minPass, maxPass, maxAtt });

  outputPanel.style.display = 'block';
  outputPanel.scrollIntoView({ behavior: 'smooth', block: 'start' });

  // Reset to first tab
  document.querySelectorAll('.tab').forEach(t => t.classList.remove('active'));
  document.querySelectorAll('.tab-content').forEach(c => c.classList.add('hidden'));
  document.querySelector('.tab[data-tab="table"]').classList.add('active');
  $('tabTable').classList.remove('hidden');
});

/* ════════════════════════════════════════════════════════════
   TEST CASE GENERATOR ENGINE
════════════════════════════════════════════════════════════ */

function generateTestCases({ module, story, fields, endpoint, minPass, maxPass, maxAtt }) {
  const mod   = module;
  const f1    = fields[0] || 'Field1';
  const f2    = fields[1] || 'Field2';
  const hasPass = fields.some(f => /password|pass|pwd/i.test(f));
  const hasEmail = fields.some(f => /email|mail/i.test(f));
  const prefix = mod.replace(/\s+/g, '-').toUpperCase().slice(0, 10);

  let tcNum = 1;
  const id = () => `TC-${prefix}-${String(tcNum++).padStart(3, '0')}`;

  const cases = [];

  // ── POSITIVE ────────────────────────────────────────────────
  cases.push({
    id: id(), type: 'positive', module: mod,
    title: `Successful operation with valid ${f1} and ${f2}`,
    precondition: `Valid account exists; ${endpoint} page is open; Internet connected`,
    steps: [
      `Navigate to "${endpoint}"`,
      `Enter a valid ${f1}`,
      `Enter a valid ${f2}`,
      `Click the Submit / Confirm button`
    ],
    expected: `Operation succeeds; User is redirected to the next page; Success message is displayed; Session/token is created if applicable`,
    status: 'Not Executed'
  });

  cases.push({
    id: id(), type: 'positive', module: mod,
    title: `Redirect to target page after successful operation`,
    precondition: `Valid credentials exist; ${endpoint} is accessible`,
    steps: [
      `Complete ${endpoint} flow with valid inputs`,
      `Observe the browser URL and page content`
    ],
    expected: `Browser redirects to the designated target page; Page content loads correctly`,
    status: 'Not Executed'
  });

  if (hasPass) {
    cases.push({
      id: id(), type: 'positive', module: mod,
      title: `Successful flow with password at minimum valid length (${minPass} chars)`,
      precondition: `Account with ${minPass}-char password exists; ${endpoint} is open`,
      steps: [
        `Navigate to "${endpoint}"`,
        `Enter valid ${hasEmail ? 'email' : f1}`,
        `Enter password with exactly ${minPass} characters`,
        `Submit the form`
      ],
      expected: `Operation succeeds; User is directed to the target page`,
      status: 'Not Executed'
    });
  }

  // ── NEGATIVE ────────────────────────────────────────────────
  cases.push({
    id: id(), type: 'negative', module: mod,
    title: `Failure with wrong ${f2}`,
    precondition: `Valid account exists; ${endpoint} is open`,
    steps: [
      `Navigate to "${endpoint}"`,
      `Enter a valid ${f1}`,
      `Enter an incorrect ${f2}`,
      `Click Submit`
    ],
    expected: `Error message displayed; User remains on ${endpoint}; No redirect occurs`,
    status: 'Not Executed'
  });

  cases.push({
    id: id(), type: 'negative', module: mod,
    title: `Failure with unregistered / unknown ${f1}`,
    precondition: `${endpoint} is open`,
    steps: [
      `Navigate to "${endpoint}"`,
      `Enter an unregistered / unknown ${f1}`,
      `Enter any ${f2}`,
      `Click Submit`
    ],
    expected: `Generic error message displayed (no information leakage); User stays on ${endpoint}`,
    status: 'Not Executed'
  });

  cases.push({
    id: id(), type: 'negative', module: mod,
    title: `Failure when ${f1} field is empty`,
    precondition: `${endpoint} is open`,
    steps: [
      `Navigate to "${endpoint}"`,
      `Leave the ${f1} field empty`,
      `Enter a valid ${f2}`,
      `Click Submit`
    ],
    expected: `Inline validation: "${f1} cannot be empty"; Form is not submitted`,
    status: 'Not Executed'
  });

  cases.push({
    id: id(), type: 'negative', module: mod,
    title: `Failure when ${f2} field is empty`,
    precondition: `${endpoint} is open`,
    steps: [
      `Navigate to "${endpoint}"`,
      `Enter a valid ${f1}`,
      `Leave the ${f2} field empty`,
      `Click Submit`
    ],
    expected: `Inline validation: "${f2} cannot be empty"; Form is not submitted`,
    status: 'Not Executed'
  });

  cases.push({
    id: id(), type: 'negative', module: mod,
    title: `Failure when all fields are empty`,
    precondition: `${endpoint} is open`,
    steps: [
      `Navigate to "${endpoint}"`,
      `Leave all fields empty`,
      `Click Submit`
    ],
    expected: `Inline validation messages shown for each required field; Form is not submitted`,
    status: 'Not Executed'
  });

  if (hasEmail) {
    cases.push({
      id: id(), type: 'negative', module: mod,
      title: `Failure with invalid email format (missing @)`,
      precondition: `${endpoint} is open`,
      steps: [
        `Navigate to "${endpoint}"`,
        `Enter email without "@" symbol (e.g. "userdomain.com")`,
        `Enter a valid password`,
        `Click Submit`
      ],
      expected: `Inline validation: "Invalid email format"; Form is not submitted`,
      status: 'Not Executed'
    });
  }

  if (maxAtt > 0) {
    cases.push({
      id: id(), type: 'negative', module: mod,
      title: `Account locked after ${maxAtt} consecutive failed attempts`,
      precondition: `Valid account exists; ${endpoint} is open`,
      steps: [
        `Attempt to submit with wrong ${f2} ${maxAtt} times in a row`,
        `Observe warning after attempt ${maxAtt}`,
        `Make one more attempt (attempt ${maxAtt + 1})`
      ],
      expected: `After attempt ${maxAtt}: warning message shown (e.g. "1 attempt remaining"); After attempt ${maxAtt + 1}: account locked, user cannot proceed, lockout message displayed`,
      status: 'Not Executed'
    });
  }

  // ── BVA ─────────────────────────────────────────────────────
  if (hasPass) {
    cases.push({
      id: id(), type: 'bva', module: mod,
      title: `BVA — Password below minimum length (${minPass - 1} chars — invalid)`,
      precondition: `${endpoint} is open`,
      steps: [
        `Navigate to "${endpoint}"`,
        `Enter a password with ${minPass - 1} characters`,
        `Submit the form`
      ],
      expected: `Validation error: "Password must be at least ${minPass} characters"`,
      status: 'Not Executed'
    });

    cases.push({
      id: id(), type: 'bva', module: mod,
      title: `BVA — Password at minimum length (${minPass} chars — valid boundary)`,
      precondition: `Account with ${minPass}-char password exists; ${endpoint} is open`,
      steps: [
        `Navigate to "${endpoint}"`,
        `Enter a password with exactly ${minPass} characters`,
        `Submit the form`
      ],
      expected: `Operation succeeds; Minimum boundary accepted`,
      status: 'Not Executed'
    });

    cases.push({
      id: id(), type: 'bva', module: mod,
      title: `BVA — Password at maximum length (${maxPass} chars — valid boundary)`,
      precondition: `Account with ${maxPass}-char password exists; ${endpoint} is open`,
      steps: [
        `Navigate to "${endpoint}"`,
        `Enter a password with exactly ${maxPass} characters`,
        `Submit the form`
      ],
      expected: `Operation succeeds; Maximum boundary accepted`,
      status: 'Not Executed'
    });

    cases.push({
      id: id(), type: 'bva', module: mod,
      title: `BVA — Password exceeds maximum length (${maxPass + 1} chars — invalid)`,
      precondition: `${endpoint} is open`,
      steps: [
        `Navigate to "${endpoint}"`,
        `Enter a password with ${maxPass + 1} characters`,
        `Submit the form`
      ],
      expected: `Validation error: "Password must not exceed ${maxPass} characters"; Or field rejects input beyond limit`,
      status: 'Not Executed'
    });
  }

  // ── SECURITY ─────────────────────────────────────────────────
  cases.push({
    id: id(), type: 'security', module: mod,
    title: `Security — SQL Injection attempt on ${f1} field`,
    precondition: `${endpoint} is open`,
    steps: [
      `Navigate to "${endpoint}"`,
      `Enter SQL injection payload in ${f1}: \`' OR '1'='1' --\``,
      `Enter any value for ${f2}`,
      `Click Submit`
    ],
    expected: `Operation fails; No authentication bypass occurs; No database error exposed in response; Generic error message shown`,
    status: 'Not Executed'
  });

  cases.push({
    id: id(), type: 'security', module: mod,
    title: `Security — XSS attempt on ${f2} field`,
    precondition: `${endpoint} is open`,
    steps: [
      `Navigate to "${endpoint}"`,
      `Enter a valid ${f1}`,
      `Enter XSS payload in ${f2}: \`<script>alert('XSS')</script>\``,
      `Click Submit`
    ],
    expected: `Operation fails; No JavaScript alert is triggered; Script is not rendered in page; Input is sanitized`,
    status: 'Not Executed'
  });

  return cases;
}

/* ════════════════════════════════════════════════════════════
   RENDERERS
════════════════════════════════════════════════════════════ */

// ── Summary Bar ──────────────────────────────────────────────
function renderSummary(cases) {
  const count = t => cases.filter(c => c.type === t).length;
  summaryBar.innerHTML = `
    <span class="summary-chip chip-total">📋 Total: ${cases.length}</span>
    <span class="summary-chip chip-pos">✅ Positive: ${count('positive')}</span>
    <span class="summary-chip chip-neg">❌ Negative: ${count('negative')}</span>
    <span class="summary-chip chip-bva">⚠ BVA: ${count('bva')}</span>
    <span class="summary-chip chip-sec">🔒 Security: ${count('security')}</span>
  `;
}

// ── Table ────────────────────────────────────────────────────
function renderTable(cases) {
  const typeLabel = { positive: 'Positive', negative: 'Negative', bva: 'BVA', security: 'Security' };
  const typeClass = { positive: 'type-pos', negative: 'type-neg', bva: 'type-bva', security: 'type-sec' };

  const rows = cases.map(tc => `
    <tr>
      <td>${tc.id}</td>
      <td>${esc(tc.module)}</td>
      <td>
        <span class="tc-type ${typeClass[tc.type]}">${typeLabel[tc.type]}</span><br/>
        <span style="font-size:.85rem;font-weight:500;margin-top:.3rem;display:block">${esc(tc.title)}</span>
      </td>
      <td>${esc(tc.precondition)}</td>
      <td><ol>${tc.steps.map(s => `<li>${esc(s)}</li>`).join('')}</ol></td>
      <td>${esc(tc.expected)}</td>
      <td><span class="status-chip">⬜ ${esc(tc.status)}</span></td>
    </tr>
  `).join('');

  tableOutput.innerHTML = `
    <table class="tc-table">
      <thead>
        <tr>
          <th>TC-ID</th>
          <th>Module</th>
          <th>Type / Title</th>
          <th>Pre-condition</th>
          <th>Test Steps</th>
          <th>Expected Result</th>
          <th>Status</th>
        </tr>
      </thead>
      <tbody>${rows}</tbody>
    </table>
  `;
}

// ── Gherkin BDD ──────────────────────────────────────────────
function renderGherkin(cases, { module, story, fields, endpoint, minPass, maxPass, maxAtt }) {
  const f1 = fields[0] || 'Field1';
  const f2 = fields[1] || 'Field2';
  const hasPass = fields.some(f => /password|pass|pwd/i.test(f));

  const kw   = s => `<span class="gherkin-keyword">${s}</span>`;
  const tag  = s => `<span class="gherkin-tag">${s}</span>`;
  const cmt  = s => `<span class="gherkin-comment">${s}</span>`;
  const str  = s => `<span class="gherkin-string">"${s}"</span>`;

  const lines = [];
  const L = line => lines.push(line);

  L(`${kw('Feature')}: ${module}`);
  if (story) {
    story.split('\n').forEach(l => L(`  ${cmt('# ' + l.trim())}`));
  }
  L('');
  L(`  ${kw('Background')}:`);
  L(`    ${kw('Given')} the user is on the page ${str(endpoint)}`);
  L(`    ${kw('And')} the system is available`);
  L('');

  // Positive smoke
  const posCase = cases.find(c => c.type === 'positive');
  if (posCase) {
    L(`  ${tag('@positive')} ${tag('@smoke')}`);
    L(`  ${kw('Scenario')}: ${posCase.id} — ${posCase.title}`);
    L(`    ${kw('Given')} a valid account with correct ${f1} and ${f2}`);
    L(`    ${kw('When')} the user enters a valid ${f1}`);
    L(`    ${kw('And')} the user enters a valid ${f2}`);
    L(`    ${kw('And')} the user submits the form`);
    L(`    ${kw('Then')} the operation should succeed`);
    L(`    ${kw('And')} the user should be redirected to the target page`);
    L(`    ${kw('And')} a success message should be displayed`);
    L('');
  }

  // Wrong f2 negative
  const negWrong = cases.find(c => c.type === 'negative' && c.title.includes(`wrong ${f2}`));
  if (negWrong) {
    L(`  ${tag('@negative')} ${tag('@regression')}`);
    L(`  ${kw('Scenario')}: ${negWrong.id} — ${negWrong.title}`);
    L(`    ${kw('Given')} a valid account exists`);
    L(`    ${kw('When')} the user enters a valid ${f1}`);
    L(`    ${kw('And')} the user enters an incorrect ${f2}`);
    L(`    ${kw('And')} the user submits the form`);
    L(`    ${kw('Then')} an error message should be displayed`);
    L(`    ${kw('And')} the user should remain on the ${endpoint} page`);
    L('');
  }

  // Empty fields
  const negEmpty1 = cases.find(c => c.type === 'negative' && c.title.includes(`${f1} field is empty`));
  if (negEmpty1) {
    L(`  ${tag('@negative')} ${tag('@validation')}`);
    L(`  ${kw('Scenario')}: ${negEmpty1.id} — ${negEmpty1.title}`);
    L(`    ${kw('When')} the user leaves the ${f1} field empty`);
    L(`    ${kw('And')} enters a valid ${f2}`);
    L(`    ${kw('And')} submits the form`);
    L(`    ${kw('Then')} an inline validation ${str(`${f1} cannot be empty`)} should appear`);
    L(`    ${kw('And')} the form should not be submitted`);
    L('');
  }

  // Lockout
  const lockout = cases.find(c => c.type === 'negative' && c.title.includes('locked'));
  if (lockout) {
    L(`  ${tag('@negative')} ${tag('@security')}`);
    L(`  ${kw('Scenario')}: ${lockout.id} — Account locked after ${maxAtt} failed attempts`);
    L(`    ${kw('Given')} a valid account exists`);
    L(`    ${kw('When')} the user submits wrong ${f2} ${maxAtt} times`);
    L(`    ${kw('Then')} a warning message should appear after attempt ${maxAtt}`);
    L(`    ${kw('When')} the user makes one more failed attempt`);
    L(`    ${kw('Then')} the account should be locked`);
    L(`    ${kw('And')} a lockout message should be displayed`);
    L('');
  }

  // BVA password
  if (hasPass) {
    const bvaMin = cases.find(c => c.type === 'bva' && c.title.includes(`${minPass - 1} chars`));
    if (bvaMin) {
      L(`  ${tag('@bva')} ${tag('@negative')}`);
      L(`  ${kw('Scenario')}: ${bvaMin.id} — Password below minimum length`);
      L(`    ${kw('When')} the user enters a password with ${minPass - 1} characters`);
      L(`    ${kw('And')} submits the form`);
      L(`    ${kw('Then')} validation message ${str(`Password must be at least ${minPass} characters`)} should appear`);
      L('');
    }

    const bvaMax = cases.find(c => c.type === 'bva' && c.title.includes(`${maxPass + 1} chars`));
    if (bvaMax) {
      L(`  ${tag('@bva')} ${tag('@negative')}`);
      L(`  ${kw('Scenario')}: ${bvaMax.id} — Password exceeds maximum length`);
      L(`    ${kw('When')} the user enters a password with ${maxPass + 1} characters`);
      L(`    ${kw('And')} submits the form`);
      L(`    ${kw('Then')} validation message ${str(`Password must not exceed ${maxPass} characters`)} should appear`);
      L('');
    }
  }

  // Security
  const sqlInj = cases.find(c => c.type === 'security' && c.title.includes('SQL'));
  if (sqlInj) {
    L(`  ${tag('@security')} ${tag('@negative')}`);
    L(`  ${kw('Scenario')}: ${sqlInj.id} — SQL Injection on ${f1} field`);
    L(`    ${kw('When')} the user enters SQL injection payload in the ${f1} field`);
    L(`    ${kw('And')} submits the form`);
    L(`    ${kw('Then')} the operation should fail`);
    L(`    ${kw('And')} no authentication bypass should occur`);
    L(`    ${kw('And')} no database error should be exposed`);
    L('');
  }

  const xss = cases.find(c => c.type === 'security' && c.title.includes('XSS'));
  if (xss) {
    L(`  ${tag('@security')} ${tag('@negative')}`);
    L(`  ${kw('Scenario')}: ${xss.id} — XSS on ${f2} field`);
    L(`    ${kw('When')} the user enters an XSS script payload in the ${f2} field`);
    L(`    ${kw('And')} submits the form`);
    L(`    ${kw('Then')} the operation should fail`);
    L(`    ${kw('And')} no JavaScript alert should be triggered`);
    L(`    ${kw('And')} the script should not be rendered in the page`);
    L('');
  }

  gherkinOutput.innerHTML = lines.join('\n');
}

// ── Markdown ─────────────────────────────────────────────────
function renderMarkdown(cases, { module, story, endpoint }) {
  const typeLabel = { positive: 'Positive', negative: 'Negative', bva: 'BVA', security: 'Security' };
  const lines = [];
  const L = l => lines.push(l);

  L(`# Test Case Document — ${module}`);
  L('');
  L(`> **Module:** ${module}  `);
  L(`> **Endpoint:** \`${endpoint}\`  `);
  L(`> **Generated:** ${new Date().toISOString().split('T')[0]}  `);
  L(`> **Total Test Cases:** ${cases.length}`);
  L('');
  if (story) { L(`## User Story\n\n> ${story}\n`); }

  L('## Summary');
  L('');
  const count = t => cases.filter(c => c.type === t).length;
  L(`| Category | Count |`);
  L(`|----------|-------|`);
  L(`| ✅ Positive | ${count('positive')} |`);
  L(`| ❌ Negative | ${count('negative')} |`);
  L(`| ⚠ BVA | ${count('bva')} |`);
  L(`| 🔒 Security | ${count('security')} |`);
  L(`| **Total** | **${cases.length}** |`);
  L('');
  L('## Test Cases');
  L('');
  L('| TC-ID | Module | Type | Scenario / Title | Pre-condition | Test Steps | Expected Result | Status |');
  L('|-------|--------|------|-----------------|---------------|------------|-----------------|--------|');

  cases.forEach(tc => {
    const steps = tc.steps.map((s, i) => `${i + 1}. ${s}`).join(' ');
    L(`| ${tc.id} | ${tc.module} | ${typeLabel[tc.type]} | ${tc.title} | ${tc.precondition} | ${steps} | ${tc.expected} | ⬜ ${tc.status} |`);
  });

  L('');
  L('---');
  L('');
  L('## Status Legend');
  L('');
  L('| Icon | Status |');
  L('|------|--------|');
  L('| ✅ | Pass |');
  L('| ❌ | Fail |');
  L('| ⚠️ | Blocked |');
  L('| ⬜ | Not Executed |');
  L('| 🔄 | In Progress |');
  L('');
  L('---');
  L(`*Generated by Test Case Generator — IT Track QA Automation*`);

  const md = lines.join('\n');
  markdownOutput.textContent = md;
  markdownOutput._raw = md;
}

/* ════════════════════════════════════════════════════════════
   EXPORT ACTIONS
════════════════════════════════════════════════════════════ */

copyMdBtn.addEventListener('click', () => {
  const raw = markdownOutput._raw || markdownOutput.textContent;
  navigator.clipboard.writeText(raw).then(() => {
    showToast('✅ Markdown copied to clipboard!');
  }).catch(() => {
    showToast('⚠ Could not access clipboard.');
  });
});

downloadBtn.addEventListener('click', () => {
  const raw = markdownOutput._raw || markdownOutput.textContent;
  const mod = moduleInput.value.trim().replace(/\s+/g, '_') || 'TestCases';
  const filename = `TC_${mod}_${new Date().toISOString().split('T')[0]}.md`;
  const blob = new Blob([raw], { type: 'text/markdown;charset=utf-8' });
  const url  = URL.createObjectURL(blob);
  const a    = document.createElement('a');
  a.href = url; a.download = filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
  showToast(`⬇ Downloaded: ${filename}`);
});

/* ════════════════════════════════════════════════════════════
   UTILS
════════════════════════════════════════════════════════════ */

function esc(str) {
  return String(str)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

let toastTimer;
function showToast(msg) {
  toast.textContent = msg;
  toast.classList.remove('hidden');
  clearTimeout(toastTimer);
  toastTimer = setTimeout(() => toast.classList.add('hidden'), 3000);
}
