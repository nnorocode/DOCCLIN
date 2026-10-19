import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
const css = readFileSync(new URL('../app/inicio/dark-theme.css', import.meta.url), 'utf8');
const palette = Object.fromEntries([...css.matchAll(/(--gest-[\w-]+)\s*:\s*(#[\da-f]{6})\s*;/gi)].map(([, name, value]) => [name, value]));
const luminance = hex => {
  const rgb = hex.slice(1).match(/../g).map(value => parseInt(value, 16) / 255).map(value => value <= .04045 ? value / 12.92 : ((value + .055) / 1.055) ** 2.4);
  return rgb[0] * .2126 + rgb[1] * .7152 + rgb[2] * .0722;
};
const ratio = (a, b) => (Math.max(luminance(a), luminance(b)) + .05) / (Math.min(luminance(a), luminance(b)) + .05);
for (const [foreground, background] of [
  ['--gest-text', '--gest-surface'], ['--gest-muted', '--gest-surface'],
  ['--gest-text', '--gest-surface-2'], ['--gest-muted', '--gest-surface-2'],
  ['--gest-control-text', '--gest-control-bg'], ['--gest-selected-text', '--gest-selected-bg'],
  ['--gest-positive-text', '--gest-positive-bg'], ['--gest-warning-text', '--gest-warning-bg'],
  ['--gest-danger-text', '--gest-danger-bg'],
]) test(`palette contrast: ${foreground} on ${background}`, () => {
  assert.ok(palette[foreground] && palette[background]);
  const actual = ratio(palette[foreground], palette[background]);
  assert.ok(actual >= 4.5, `contrast ${actual.toFixed(2)} must be at least 4.5`);
});
