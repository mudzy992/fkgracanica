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

  it('prati checkbox stanje', () => {
    const root = mount('<input type="checkbox" name="c" /><input type="file" name="f" />');
    const initial = snapshotForm(root);
    (root.querySelector('input[type="checkbox"]') as HTMLInputElement).checked = true;
    expect(isFormDirty(root, initial)).toBe(true);
    expect(snapshotForm(root)).toContain('f=[]');
  });

  it('prati file izbor, rich-text i višestruki select', () => {
    const root = mount('<input type="file" name="f" /><div contenteditable="true">Prije</div><select name="s" multiple><option value="a" selected>A</option><option value="b">B</option></select>');
    const initial = snapshotForm(root);
    const editor = root.querySelector('[contenteditable]') as HTMLElement;
    editor.innerHTML = '<b>Poslije</b>';
    expect(isFormDirty(root, initial)).toBe(true);
    editor.innerHTML = 'Prije';
    const options = root.querySelectorAll('option');
    options[1].selected = true;
    expect(isFormDirty(root, initial)).toBe(true);
    options[1].selected = false;
    const input = root.querySelector('input') as HTMLInputElement;
    Object.defineProperty(input, 'files', { configurable: true, value: [new File(['x'], 'test.txt', { type: 'text/plain', lastModified: 1 })] });
    expect(isFormDirty(root, initial)).toBe(true);
  });

  it('detektuje dinamički dodana polja nakon praznog inicijalnog snapshota', () => {
    const root = mount('');
    const initial = snapshotForm(root);
    root.innerHTML = '<input value="novo" />';
    expect(isFormDirty(root, initial)).toBe(true);
  });

  it('ignoriše prikaz jedne strane kada skriveno polje prati obje postave', () => {
    const root = mount('<input type="hidden" value="obje postave" /><div data-dirty-ignore><select><option>A</option><option>B</option></select></div>');
    const initial = snapshotForm(root);
    (root.querySelector('select') as HTMLSelectElement).value = 'B';
    expect(isFormDirty(root, initial)).toBe(false);
    (root.querySelector('input') as HTMLInputElement).value = 'izmijenjena postava';
    expect(isFormDirty(root, initial)).toBe(true);
  });

  it('bez snimljenog stanja nikad nije dirty (dijalog se još montira)', () => {
    const root = mount('<input name="a" value="x" />');
    expect(isFormDirty(root, '')).toBe(false);
    expect(isFormDirty(null, 'a=1')).toBe(false);
  });
});
