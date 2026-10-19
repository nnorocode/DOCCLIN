import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import vm from 'node:vm';
import ts from 'typescript';
const source = readFileSync(new URL('../app/inicio/theme-scope.ts', import.meta.url), 'utf8');
const compiled = ts.transpileModule(source, { compilerOptions: { module: ts.ModuleKind.CommonJS } }).outputText;
const context = { exports: {} };
vm.runInNewContext(compiled, context);
const apply = context.exports.applyDocumentTheme;
test('theme reaches document portals and does not leave a dark theme after unmount', () => {
  const root = { dataset: { unrelated: 'preserved' } };
  const restore = apply(root, true);
  assert.equal(root.dataset.docclinTheme, 'dark');
  restore();
  assert.deepEqual(root.dataset, { unrelated: 'preserved' });
});
test('switching dark to light updates document theme and restores the original host preference', () => {
  const root = { dataset: { docclinTheme: 'host' } };
  const clearDark = apply(root, true);
  clearDark();
  const clearLight = apply(root, false);
  assert.equal(root.dataset.docclinTheme, 'light');
  clearLight();
  assert.equal(root.dataset.docclinTheme, 'host');
});
