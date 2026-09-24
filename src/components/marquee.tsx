import { LeafGlyph } from "@/components/brand";

export function Marquee({
  items,
  className = "border-y border-line bg-surface",
}: {
  items: readonly string[];
  className?: string;
}) {
  const track = (
    <div className="marquee__track" aria-hidden="true">
      {items.map((item, i) => (
        <span
          key={i}
          className="flex shrink-0 items-center gap-2.5 text-[0.8125rem] font-bold whitespace-nowrap text-brand-deep"
        >
          <LeafGlyph className="h-3.5 w-3.5 shrink-0 text-accent" />
          {item}
        </span>
      ))}
    </div>
  );

  return (
    <div className={`marquee py-3.5 ${className}`}>
      {track}
      {track}
      <span className="sr-only">{items.join(". ")}</span>
    </div>
  );
}
