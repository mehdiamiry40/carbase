export const photos = {
  hero: {
    uid: "1770068512276-cf8c2275f766",
    alt: "Old and wrecked cars in an automotive recycling yard",
  },
  damaged: {
    uid: "1764241650507-85ebbf3f539d",
    alt: "An old rusty car with a broken windscreen",
  },
  pickup: {
    uid: "1712103059174-6d830d2cb0a4",
    alt: "An old broken-down car ready for removal",
  },
  junkyard: {
    uid: "1770068511812-f61fae05c0f7",
    alt: "Damaged and unwanted cars stored in a junkyard",
  },
  abandoned: {
    uid: "1768665675579-d77e7902fe08",
    alt: "Old abandoned cars overgrown with grass",
  },
} as const;

export type PhotoKey = keyof typeof photos;

export function photoSrc(key: PhotoKey, width = 2600) {
  return `https://images.unsplash.com/photo-${photos[key].uid}?fm=jpg&q=78&w=${width}&auto=format&fit=crop`;
}
