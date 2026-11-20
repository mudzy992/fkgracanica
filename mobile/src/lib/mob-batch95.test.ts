import { describe, expect, it } from 'vitest';
import { stripHtml, htmlToParagraphs } from './html-text';
import { flattenSearchResponse, groupSearchItems, searchItemHref } from './search-nav';
import { brand, darkColors, colors } from './theme';

describe('mob-batch95 — P-MOB08 html/search/theme (test-only)', () => {
  it('stripHtml handles br and p newlines', () => {
    expect(stripHtml('a<br>b')).toBe('a\nb');
    expect(stripHtml('<p>hi</p>there')).toBe('hi\nthere');
    expect(stripHtml('<p>one</p><p>two</p>')).toBe('one\ntwo');
  });
  it('stripHtml removes other tags', () => {
    expect(stripHtml('<b>bold</b> <i>it</i>')).toBe('bold it');
    expect(stripHtml('<div>hello</div>')).toBe('hello');
  });
  it('stripHtml decodes entities', () => {
    expect(stripHtml('a &amp; b')).toBe('a & b');
    expect(stripHtml('&lt;tag&gt;')).toBe('<tag>');
    expect(stripHtml('&#65;')).toBe('A');
    expect(stripHtml('&#x41;')).toBe('A');
    expect(stripHtml('&nbsp;x')).toBe('x');
  });
  it('stripHtml collapses 3+ newlines and trims', () => {
    expect(stripHtml('a<br><br><br>b')).toBe('a\n\nb');
    expect(stripHtml('  hello  ')).toBe('hello');
    expect(stripHtml('')).toBe('');
  });
  it('stripHtml unknown entity becomes empty', () => {
    expect(stripHtml('&unknown;')).toBe('');
  });
  it('htmlToParagraphs splits and filters', () => {
    expect(htmlToParagraphs('<p>first</p><p>second</p>')).toEqual(['first','second']);
    expect(htmlToParagraphs('a<br>b<br>c')).toEqual(['a','b','c']);
    expect(htmlToParagraphs('')).toEqual([]);
  });
  it('htmlToParagraphs trims lines', () => {
    expect(htmlToParagraphs('<p>  hi  </p>')).toEqual(['hi']);
  });
  it('flattenSearchResponse empty for invalid', () => {
    expect(flattenSearchResponse(null)).toEqual([]);
    expect(flattenSearchResponse({})).toEqual([]);
  });
  it('flattenSearchResponse maps news with slug', () => {
    const data = { news:[{id:'n1',title:'Naslov',slug:'naslov'}] };
    expect(flattenSearchResponse(data)).toEqual([{id:'n1',type:'news',title:'Naslov',slug:'naslov'}]);
  });
  it('flattenSearchResponse fallback title and player full name', () => {
    const data = { players:[{id:'p1',firstName:'Edin',lastName:'Dzeko'}], news:[{id:'n2',name:'Ime'}] } as any;
    const out = flattenSearchResponse(data);
    expect(out.find(o=>o.id==='p1')?.title).toBe('Edin Dzeko');
    expect(out.find(o=>o.id==='n2')?.title).toBe('Ime');
  });
  it('flattenSearchResponse match vs home/away', () => {
    const data = { matches:[{id:'m1',homeClub:{name:'A'},awayClub:{name:'B'}}] } as any;
    expect(flattenSearchResponse(data)[0].title).toBe('A vs B');
  });
  it('flattenSearchResponse skips without id', () => {
    expect(flattenSearchResponse({news:[{title:'NoId'}]} as any)).toEqual([]);
    expect(flattenSearchResponse({news:[{id:''}]} as any)).toEqual([]);
  });
  it('groupSearchItems orders and filters empty', () => {
    const items = [{id:'n1',type:'news',title:'A'},{id:'p1',type:'players',title:'B'},{id:'m1',type:'matches',title:'C'}] as any;
    const groups = groupSearchItems(items);
    expect(groups.map(g=>g.type)).toEqual(['news','players','matches']);
    expect(groupSearchItems([])).toEqual([]);
  });
  it('searchItemHref maps types to paths', () => {
    expect(searchItemHref({id:'n1',type:'news',title:'',slug:'moja'} as any)).toBe('/news/moja');
    expect(searchItemHref({id:'n1',type:'news',title:''} as any)).toBeNull();
    expect(searchItemHref({id:'p1',type:'players',title:''} as any)).toBe('/player/p1');
    expect(searchItemHref({id:'m1',type:'matches',title:''} as any)).toBe('/live/m1');
    expect(searchItemHref({id:'t1',type:'trophies',title:''} as any)).toBe('/heritage');
    expect(searchItemHref({id:'x',type:'unknown',title:''} as any)).toBeNull();
  });
  it('theme brand and darkColors', () => {
    expect(brand.primary).toBe('#1E3A8A');
    expect(darkColors.background).toBe('#050A14');
    expect(colors).toBe(darkColors);
    expect(brand.white).toBe('#FFFFFF');
  });
});
