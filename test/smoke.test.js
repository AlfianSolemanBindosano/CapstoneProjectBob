// Minimal smoke check: loads src/app.js in a stubbed DOM and asserts generator output.
const test = require('node:test');
const assert = require('node:assert');
const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');

const src = fs.readFileSync(path.join(__dirname, '..', 'src', 'app.js'), 'utf8');

function stubEl() {
  return {
    value: '', textContent: '', innerHTML: '', style: {},
    classList: { add() {}, remove() {}, contains: () => false },
    addEventListener() {}, focus() {}, scrollIntoView() {}
  };
}

const ctx = {
  document: {
    getElementById: stubEl,
    querySelectorAll: () => [],
    querySelector: stubEl,
    createElement: stubEl,
    body: { appendChild() {}, removeChild() {} }
  },
  navigator: { clipboard: { writeText: () => Promise.resolve() } },
  Blob: function () {},
  URL: { createObjectURL: () => 'blob:', revokeObjectURL() {} },
  setTimeout, clearTimeout
};
ctx.window = ctx;
vm.createContext(ctx);
vm.runInContext(src, ctx);

const params = {
  module: 'Authentication', story: 'As a user I want to log in',
  fields: ['Email', 'Password'], endpoint: '/login',
  minPass: 8, maxPass: 64, maxAtt: 5
};

test('generates full suite of cases', () => {
  const cases = ctx.generateTestCases(params);
  assert.strictEqual(cases.length, 16);
  assert.strictEqual(new Set(cases.map(c => c.id)).size, 16, 'IDs unique');
  const byType = t => cases.filter(c => c.type === t).length;
  assert.deepStrictEqual(
    { positive: byType('positive'), negative: byType('negative'), bva: byType('bva'), security: byType('security') },
    { positive: 3, negative: 7, bva: 4, security: 2 }
  );
});

test('BVA boundaries use configured min/max', () => {
  const cases = ctx.generateTestCases({ ...params, minPass: 10, maxPass: 20 });
  const titles = cases.map(c => c.title);
  assert.ok(titles.some(t => t.includes('9 chars')), 'min-1 present');
  assert.ok(titles.some(t => t.includes('10 chars')), 'min present');
  assert.ok(titles.some(t => t.includes('20 chars')), 'max present');
  assert.ok(titles.some(t => t.includes('21 chars')), 'max+1 present');
});

test('fields without password skip BVA cases', () => {
  const cases = ctx.generateTestCases({ ...params, fields: ['Email', 'Name'] });
  assert.strictEqual(cases.filter(c => c.type === 'bva').length, 0);
});

test('esc neutralizes HTML', () => {
  assert.strictEqual(ctx.esc('<b>"x"&</b>'), '&lt;b&gt;&quot;x&quot;&amp;&lt;/b&gt;');
});