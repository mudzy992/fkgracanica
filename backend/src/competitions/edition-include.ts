export const editionInclude = {
  competition: true,
  season: true,
  participants: {
    include: { club: { select: { id: true, name: true, slug: true } } },
    orderBy: { club: { name: 'asc' as const } },
  },
};

export const calendarSeasonInclude = {
  competitions: { include: editionInclude },
};
