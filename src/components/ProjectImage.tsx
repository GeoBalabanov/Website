import Image from "next/image";
import type { ProjectImage as ProjectImageType } from "@/data/projects";

type Props = {
  image: ProjectImageType;
  sizes: string;
  priority?: boolean;
  className?: string;
};

/** Portrait (3:4) project image. SVG placeholders skip the optimizer; real photos get resized automatically. */
export function ProjectImage({ image, sizes, priority, className = "" }: Props) {
  return (
    <Image
      src={image.src}
      alt={image.alt}
      fill
      sizes={sizes}
      priority={priority}
      unoptimized={image.src.endsWith(".svg")}
      className={`object-cover ${className}`}
    />
  );
}
