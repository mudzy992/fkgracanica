export function wrapEmailHtml(title: string, body: string) {
  return `<!DOCTYPE html><html><body style="font-family:sans-serif;line-height:1.5;color:#111">
  <h1 style="font-size:20px">${title}</h1>
  <p>${body}</p>
  <p style="color:#666;font-size:12px">FK Gračanica</p>
  </body></html>`;
}

export function contactAckEmail(name: string) {
  const text = `Poštovani/a ${name}, primili smo vašu poruku i javit ćemo se uskoro.`;
  return {
    subject: 'Primili smo vašu poruku',
    text,
    html: wrapEmailHtml('Kontakt', text),
  };
}

export function membershipConfirmEmail(name: string) {
  const text = `Poštovani/a ${name}, vaše članstvo u FK Gračanica je aktivno.`;
  return {
    subject: 'Članstvo aktivirano',
    text,
    html: wrapEmailHtml('Članstvo', text),
  };
}

export function ticketConfirmEmail(detail: string) {
  const text = `Vaša narudžba ulaznica je potvrđena. ${detail}`;
  return {
    subject: 'Ulaznice — potvrda',
    text,
    html: wrapEmailHtml('Ulaznice', text),
  };
}

export function seasonPassConfirmEmail(label: string) {
  const text = `Vaša ${label} je aktivna. Pokažite QR kod na ulazu na svakoj domaćoj utakmici.`;
  return {
    subject: 'Sezonska karta — potvrda',
    text,
    html: wrapEmailHtml('Sezonska karta', text),
  };
}
