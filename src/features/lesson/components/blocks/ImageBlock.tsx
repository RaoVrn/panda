import type { ContentImageBlock } from "@/content/schema";

export function ImageBlock({ block }: { block: ContentImageBlock }) {
  return (
    <figure className="overflow-hidden rounded-2xl border border-border-subtle bg-card shadow-card">
      <img
        src={block.src}
        alt={block.alt}
        loading="lazy"
        className="mx-auto max-h-[360px] w-full object-contain p-4"
      />
      {block.caption && (
        <figcaption className="border-t border-border-subtle px-5 py-3 text-center text-xs text-text-muted">
          {block.caption}
        </figcaption>
      )}
    </figure>
  );
}