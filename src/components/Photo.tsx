import Image from "next/image";
import { photoSrc, photos, type PhotoKey } from "@/data/photos";

export function Photo({
  name,
  alt,
  className = "",
  preload = false,
  sizes = "100vw",
}: {
  name: PhotoKey;
  alt?: string;
  className?: string;
  preload?: boolean;
  sizes?: string;
}) {
  return (
    <Image
      src={photoSrc(name)}
      alt={alt ?? photos[name].alt}
      fill
      preload={preload}
      sizes={sizes}
      className={`object-cover ${className}`}
    />
  );
}
