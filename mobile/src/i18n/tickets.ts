export const ticketsBs = {
  soldOut: 'Rasprodano',
  soldOutBody: 'Kapacitet je popunjen — ulaznice za ovu utakmicu su rasprodane.',
  ticketStepBrowse: 'Pregled',
  ticketStepReserve: 'Rezervacija',
  ticketStepTicket: 'Ulaznica',
  payOnline: 'Plati online',
  paymentCancelled: 'Plaćanje je otkazano.',
  paymentFailed: 'Plaćanje nije uspjelo.',
  buySeasonPass: 'Kupi sezonsku kartu',
  seasonPassBoxOffice: 'Dostupno na blagajni',
} as const;

export const ticketsEn: Record<keyof typeof ticketsBs, string> = {
  soldOut: 'Sold out',
  soldOutBody: 'Capacity is full — tickets for this match are sold out.',
  ticketStepBrowse: 'Browse',
  ticketStepReserve: 'Reserve',
  ticketStepTicket: 'Ticket',
  payOnline: 'Pay online',
  paymentCancelled: 'Payment was cancelled.',
  paymentFailed: 'Payment failed.',
  buySeasonPass: 'Buy season pass',
  seasonPassBoxOffice: 'Available at the box office',
};
