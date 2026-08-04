export const photos = {
  hero: {
    uid: "1494976388531-d1058494cdd8",
    alt: "A modern car travelling on an open road",
  },
  inspection: {
    uid: "1503736334956-4c8f8e92946d",
    alt: "A vehicle ready for inspection and sale",
  },
  pickup: {
    uid: "1549317661-bd32c8ce0db2",
    alt: "A car parked and ready for collection",
  },
  suv: {
    uid: "1519641471654-76ce0107ad1b",
    alt: "A four-wheel drive vehicle on the road",
  },
  road: {
    uid: "1533473359331-0135ef1b58bf",
    alt: "A car driving through South East Queensland",
  },
} as const;

export type PhotoKey = keyof typeof photos;

export function photoSrc(key: PhotoKey, width = 2600) {
  return `https://images.unsplash.com/photo-${photos[key].uid}?fm=jpg&q=78&w=${width}&auto=format&fit=crop`;
}
