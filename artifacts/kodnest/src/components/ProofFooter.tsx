import { useState } from "react";

interface ChecklistItem {
  id: string;
  label: string;
  proofLabel: string;
}

const CHECKLIST: ChecklistItem[] = [
  { id: "ui", label: "UI Built", proofLabel: "Add screenshot or link" },
  { id: "logic", label: "Logic Working", proofLabel: "Describe how it works" },
  { id: "test", label: "Test Passed", proofLabel: "Paste test output" },
  { id: "deployed", label: "Deployed", proofLabel: "Add deploy URL" },
];

export function ProofFooter() {
  const [checked, setChecked] = useState<Record<string, boolean>>({});
  const [proofs, setProofs] = useState<Record<string, string>>({});
  const [active, setActive] = useState<string | null>(null);

  const toggle = (id: string) => {
    setChecked((prev) => ({ ...prev, [id]: !prev[id] }));
    if (!checked[id]) setActive(id);
    else setActive(null);
  };

  return (
    <footer
      className="w-full border-t border-border bg-card"
      style={{ padding: "24px 40px" }}
    >
      <p
        className="font-sans font-semibold text-foreground"
        style={{ fontSize: 12, letterSpacing: "0.08em", textTransform: "uppercase", marginBottom: 16 }}
      >
        Proof Checklist
      </p>

      <div className="flex flex-wrap gap-[16px]">
        {CHECKLIST.map((item) => (
          <div
            key={item.id}
            className="flex-1"
            style={{ minWidth: 160 }}
          >
            <button
              className="flex items-center gap-[8px] w-full text-left transition-all duration-150 ease-in-out"
              onClick={() => toggle(item.id)}
            >
              <span
                className="flex items-center justify-center rounded border transition-all duration-150 ease-in-out"
                style={{
                  width: 18,
                  height: 18,
                  borderColor: checked[item.id]
                    ? "hsl(0 100% 27%)"
                    : "hsl(40 8% 78%)",
                  backgroundColor: checked[item.id]
                    ? "hsl(0 100% 27%)"
                    : "transparent",
                  flexShrink: 0,
                }}
              >
                {checked[item.id] && (
                  <svg width="10" height="8" viewBox="0 0 10 8" fill="none">
                    <path
                      d="M1 4L3.5 6.5L9 1"
                      stroke="white"
                      strokeWidth="1.5"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                  </svg>
                )}
              </span>
              <span
                className="font-sans transition-colors duration-150"
                style={{
                  fontSize: 14,
                  color: checked[item.id]
                    ? "hsl(0 0% 7%)"
                    : "hsl(0 0% 42%)",
                  textDecoration: checked[item.id] ? "line-through" : "none",
                  textDecorationColor: "hsl(0 100% 27% / 0.5)",
                }}
              >
                {item.label}
              </span>
            </button>

            {active === item.id && (
              <div className="mt-[8px] ml-[26px]">
                <input
                  type="text"
                  placeholder={item.proofLabel}
                  value={proofs[item.id] || ""}
                  onChange={(e) =>
                    setProofs((prev) => ({ ...prev, [item.id]: e.target.value }))
                  }
                  className="w-full font-sans bg-background border border-border rounded text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-primary transition-all duration-150"
                  style={{ fontSize: 13, padding: "6px 10px" }}
                />
              </div>
            )}
          </div>
        ))}
      </div>
    </footer>
  );
}
