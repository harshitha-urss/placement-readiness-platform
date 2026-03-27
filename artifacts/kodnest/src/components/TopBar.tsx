interface TopBarProps {
  projectName: string;
  currentStep: number;
  totalSteps: number;
  status: "Not Started" | "In Progress" | "Shipped";
}

const statusColors: Record<TopBarProps["status"], string> = {
  "Not Started": "bg-muted text-muted-foreground border border-border",
  "In Progress": "bg-warning/10 text-warning-foreground border border-warning/30",
  "Shipped": "bg-success/10 text-success border border-success/30",
};

export function TopBar({ projectName, currentStep, totalSteps, status }: TopBarProps) {
  return (
    <header
      className="w-full border-b border-border bg-card"
      style={{ height: 56 }}
    >
      <div className="flex items-center justify-between h-full px-[40px]">
        <span className="heading-serif font-bold text-[15px] text-foreground tracking-tight">
          {projectName}
        </span>

        <div className="flex items-center gap-[8px]">
          {Array.from({ length: totalSteps }).map((_, i) => (
            <div
              key={i}
              className="rounded-full transition-all duration-200 ease-in-out"
              style={{
                width: i < currentStep ? 24 : 8,
                height: 8,
                backgroundColor:
                  i < currentStep
                    ? "hsl(0 100% 27%)"
                    : i === currentStep
                    ? "hsl(0 100% 27% / 0.4)"
                    : "hsl(40 8% 85%)",
              }}
            />
          ))}
          <span className="ml-[8px] text-[13px] text-muted-foreground font-sans">
            Step {currentStep} / {totalSteps}
          </span>
        </div>

        <span
          className={`text-[12px] font-medium font-sans px-[16px] py-[6px] rounded-full ${statusColors[status]}`}
        >
          {status}
        </span>
      </div>
    </header>
  );
}
