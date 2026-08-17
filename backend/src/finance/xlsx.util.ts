import { zipStore } from './zip-store.util';

function esc(value: string) {
  return value
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

function colLetter(index: number) {
  return String.fromCharCode(65 + index);
}

function sheetXml(rows: string[][]) {
  const body = rows
    .map((row, rIdx) => {
      const r = rIdx + 1;
      const cells = row
        .map((value, cIdx) => {
          const ref = `${colLetter(cIdx)}${r}`;
          return `<c r="${ref}" t="inlineStr"><is><t>${esc(value)}</t></is></c>`;
        })
        .join('');
      return `<row r="${r}">${cells}</row>`;
    })
    .join('');
  return (
    `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>` +
    `<worksheet xmlns="http://schemas.openxmlformats.org/spreadsheetml/2006/main">` +
    `<sheetData>${body}</sheetData></worksheet>`
  );
}

const CONTENT_TYPES = `<?xml version="1.0" encoding="UTF-8"?>
<Types xmlns="http://schemas.openxmlformats.org/package/2006/content-types">
<Default Extension="rels" ContentType="application/vnd.openxmlformats-package.relationships+xml"/>
<Default Extension="xml" ContentType="application/xml"/>
<Override PartName="/xl/workbook.xml" ContentType="application/vnd.openxmlformats-officedocument.spreadsheetml.sheet.main+xml"/>
<Override PartName="/xl/worksheets/sheet1.xml" ContentType="application/vnd.openxmlformats-officedocument.spreadsheetml.worksheet+xml"/>
<Override PartName="/xl/worksheets/sheet2.xml" ContentType="application/vnd.openxmlformats-officedocument.spreadsheetml.worksheet+xml"/>
</Types>`;

const ROOT_RELS = `<?xml version="1.0" encoding="UTF-8"?>
<Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships">
<Relationship Id="rId1" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/officeDocument" Target="xl/workbook.xml"/>
</Relationships>`;

const WB_RELS = `<?xml version="1.0" encoding="UTF-8"?>
<Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships">
<Relationship Id="rId1" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/worksheet" Target="worksheets/sheet1.xml"/>
<Relationship Id="rId2" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/worksheet" Target="worksheets/sheet2.xml"/>
</Relationships>`;

const WORKBOOK = `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<workbook xmlns="http://schemas.openxmlformats.org/spreadsheetml/2006/main"
 xmlns:r="http://schemas.openxmlformats.org/officeDocument/2006/relationships">
<sheets>
<sheet name="Ulaznice" sheetId="1" r:id="rId1"/>
<sheet name="Clanstvo" sheetId="2" r:id="rId2"/>
</sheets>
</workbook>`;

export function buildFinanceXlsx(tickets: string[][], membership: string[][]): Buffer {
  const utf8 = (xml: string) => Buffer.from(xml, 'utf8');
  return zipStore([
    { name: '[Content_Types].xml', data: utf8(CONTENT_TYPES) },
    { name: '_rels/.rels', data: utf8(ROOT_RELS) },
    { name: 'xl/workbook.xml', data: utf8(WORKBOOK) },
    { name: 'xl/_rels/workbook.xml.rels', data: utf8(WB_RELS) },
    { name: 'xl/worksheets/sheet1.xml', data: utf8(sheetXml(tickets)) },
    { name: 'xl/worksheets/sheet2.xml', data: utf8(sheetXml(membership)) },
  ]);
}
