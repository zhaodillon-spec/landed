export function PageIntro({ eyebrow, title, lede }: { eyebrow: string; title: string; lede: string }) {
  return (
    <div className="max-w-3xl">
      <p className="mono-label text-primary">{eyebrow}</p>
      <h1 className="mt-4 font-heading text-4xl leading-[1.05] tracking-[-0.02em] sm:text-5xl lg:text-6xl">{title}</h1>
      <p className="mt-5 max-w-2xl text-lg leading-relaxed text-muted">{lede}</p>
    </div>
  );
}
