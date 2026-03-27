import { useState } from "react";

interface SecondaryPanelProps {
  stepExplanation: string;
  prompt: string;
  onItWorked?: () => void;
  onError?: () => void;
}

export function SecondaryPanel({
  stepExplanation,
  prompt,
  onItWorked,
  onError,
}: SecondaryPanelProps) {
  const [copied, setCopied] = useState(false);
  const [screenshot, setScreenshot] = useState<string | null>(null);

  const handleCopy = async () => {
    await navigator.clipboard.writeText(prompt);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleScreenshot = () => {
    const input = document.createElement("input");
    input.type = "file";
    input.accept = "image/*";
    input.onchange = (e) => {
      const file = (e.target as HTMLInputElement).files?.[0];
      if (file) {
        const url = URL.createObjectURL(file);
        setScreenshot(url);
      }
    };
    input.click();
  };

  return (
    <aside
      className="flex flex-col h-full border-l border-border bg-card overflow-y-auto"
      style={{ width: "30%", minWidth: 280, padding: "40px 24px" }}
    >
      <div style={{ marginBottom: 24 }}>
        <p
          className="font-sans font-semibold text-foreground"
          style={{ fontSize: 11, letterSpacing: "0.08em", textTransform: "uppercase", marginBottom: 8 }}
        >
          This Step
        </p>
        <p
          className="font-sans text-muted-foreground"
          style={{ fontSize: 15, lineHeight: 1.65 }}
        >
          {stepExplanation}
        </p>
      </div>

      <div style={{ marginBottom: 24 }}>
        <p
          className="font-sans font-semibold text-foreground"
          style={{ fontSize: 11, letterSpacing: "0.08em", textTransform: "uppercase", marginBottom: 8 }}
        >
          Prompt
        </p>
        <div className="prompt-box text-foreground">{prompt}</div>
      </div>

      <div className="flex flex-col gap-[8px]">
        <button
          onClick={handleCopy}
          className="w-full font-sans font-medium border border-border rounded bg-background text-foreground hover:bg-muted transition-all duration-150 ease-in-out"
          style={{ fontSize: 14, padding: "10px 16px", textAlign: "left" }}
        >
          {copied ? "Copied!" : "Copy Prompt"}
        </button>

        <a
          href="https://lovable.dev"
          target="_blank"
          rel="noopener noreferrer"
          className="w-full font-sans font-medium rounded text-center transition-all duration-150 ease-in-out inline-block"
          style={{
            fontSize: 14,
            padding: "10px 16px",
            backgroundColor: "hsl(0 100% 27%)",
            color: "white",
            textDecoration: "none",
          }}
        >
          Build in Lovable
        </a>

        <button
          onClick={onItWorked}
          className="w-full font-sans font-medium border rounded transition-all duration-150 ease-in-out"
          style={{
            fontSize: 14,
            padding: "10px 16px",
            borderColor: "hsl(145 35% 40% / 0.5)",
            color: "hsl(145 35% 40%)",
            backgroundColor: "hsl(145 35% 40% / 0.06)",
            textAlign: "left",
          }}
        >
          It Worked
        </button>

        <button
          onClick={onError}
          className="w-full font-sans font-medium border rounded transition-all duration-150 ease-in-out"
          style={{
            fontSize: 14,
            padding: "10px 16px",
            borderColor: "hsl(38 70% 50% / 0.4)",
            color: "hsl(38 60% 38%)",
            backgroundColor: "hsl(38 70% 50% / 0.06)",
            textAlign: "left",
          }}
        >
          Error
        </button>

        <button
          onClick={handleScreenshot}
          className="w-full font-sans font-medium border border-border rounded bg-background text-muted-foreground hover:text-foreground hover:bg-muted transition-all duration-150 ease-in-out"
          style={{ fontSize: 14, padding: "10px 16px", textAlign: "left" }}
        >
          Add Screenshot
        </button>

        {screenshot && (
          <div
            className="rounded border border-border overflow-hidden"
            style={{ marginTop: 8 }}
          >
            <img
              src={screenshot}
              alt="Screenshot"
              className="w-full"
              style={{ display: "block" }}
            />
          </div>
        )}
      </div>
    </aside>
  );
}
