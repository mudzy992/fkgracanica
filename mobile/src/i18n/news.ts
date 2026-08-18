export const newsBs = {
  relatedMatches: 'Povezane utakmice',
  relatedPlayers: 'Povezani igrači',
  newsGallery: 'Galerija uz vijest',
  watchVideo: 'Pogledaj video',
  shareNews: 'Podijeli vijest',
  downloadPhoto: 'Preuzmi',
  sharePhoto: 'Podijeli sliku',
  photoSaved: 'Fotografija je sačuvana u galeriju.',
  shareFailed: 'Dijeljenje nije uspjelo.',
  downloadFailed: 'Spremanje nije uspjelo.',
} as const;

export const newsEn: Record<keyof typeof newsBs, string> = {
  relatedMatches: 'Related matches',
  relatedPlayers: 'Related players',
  newsGallery: 'Article gallery',
  watchVideo: 'Watch video',
  shareNews: 'Share article',
  downloadPhoto: 'Download',
  sharePhoto: 'Share photo',
  photoSaved: 'Photo saved to your gallery.',
  shareFailed: 'Sharing failed.',
  downloadFailed: 'Could not save the photo.',
};
