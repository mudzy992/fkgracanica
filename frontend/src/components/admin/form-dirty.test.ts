import { describe, expect, it } from 'vitest';
import { isFormDirty, snapshotForm } from './form-dirty';

function mount(html: string): HTMLElement {
  const root = document.createElement('div');
  root.innerHTML = html;
  document.body.appendChild(root);
  return root;
}

describe('form-dirty (FE-04b)', () => {
  it('nije dirty dok se polja ne promijene', () => {
    const root = mount('<input name="a" value="x" /><textarea name="b"></textarea>');
    const initial = snapshotForm(root);
    expect(isFormDirty(root, initial)).toBe(false);
  });

  it('detektuje promjenu vrijednosti inputa', () => {
    const root = mount('<input name="a" value="x" />');
    const initial = snapshotForm(root);
    (root.querySelector('input') as HTMLInputElement).value = 'y';
    expect(isFormDirty(root, initial)).toBe(true);
  });

  it('detektuje promjenu tekstarea i selecta', () => {
    const root = mount(
      '<textarea name="t"></textarea><select name="s"><option>a</option><option>b</option></select>',
    );
    const initial = snapshotForm(root);
    (root.querySelector('textarea') as HTMLTextAreaElement).value = 'novo';
    expect(isFormDirty(root, initial)).toBe(true);

    (root.querySelector('textarea') as HTMLTextAreaElement).value = '';
    (root.querySelector('select') as HTMLSelectElement).value = 'b';
    expect(isFormDirty(root, initial)).toBe(true);
  });

  it('prati checkbox stanje, a preskače fajl input', () => {
    const root = mount('<input type="checkbox" name="c" /><input type="file" name="f" />');
    const initial = snapshotForm(root);
    (root.querySelector('input[type="checkbox"]') as HTMLInputElement).checked = true;
    expect(isFormDirty(root, initial)).toBe(true);
    expect(snapshotForm(root)).not.toContain('f=');
  });

  it('bez snimljenog stanja nikad nije dirty (dijalog se još montira)', () => {
    const root = mount('<input name="a" value="x" />');
    expect(isFormDirty(root, '')).toBe(false);
    expect(isFormDirty(null, 'a=1')).toBe(false);
  });
});
