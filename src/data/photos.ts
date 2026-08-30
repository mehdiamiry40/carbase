export const photos = {
  hero: {
    src: "/images/carbase-cash-handover-hero.webp",
    alt: "A Carbase representative handing payment to a car owner beside their vehicle",
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
  const photo = photos[key];

  if ("src" in photo) return photo.src;

  return `https://images.unsplash.com/photo-${photo.uid}?fm=jpg&q=78&w=${width}&auto=format&fit=crop`;
}
