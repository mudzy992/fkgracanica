export const ticketsBs = {
  soldOut: 'Rasprodano',
  soldOutBody: 'Kapacitet je popunjen — ulaznice za ovu utakmicu su rasprodane.',
  ticketStepBrowse: 'Pregled',
  ticketStepReserve: 'Rezervacija',
  ticketStepTicket: 'Ulaznica',
} as const;

export const ticketsEn: Record<keyof typeof ticketsBs, string> = {
  soldOut: 'Sold out',
  soldOutBody: 'Capacity is full — tickets for this match are sold out.',
  ticketStepBrowse: 'Browse',
  ticketStepReserve: 'Reserve',
  ticketStepTicket: 'Ticket',
};
