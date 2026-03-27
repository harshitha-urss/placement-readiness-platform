interface ContextHeaderProps {
  headline: string;
  subtext: string;
}

export function ContextHeader({ headline, subtext }: ContextHeaderProps) {
  return (
    <div
      className="border-b border-border bg-card"
      style={{ padding: "40px 40px 32px 40px" }}
    >
      <h1
        className="heading-serif text-foreground"
        style={{ fontSize: 36, fontWeight: 700, marginBottom: 8 }}
      >
        {headline}
      </h1>
      <p
        className="font-sans text-muted-foreground"
        style={{ fontSize: 17, lineHeight: 1.6, maxWidth: 720 }}
      >
        {subtext}
      </p>
    </div>
  );
}
