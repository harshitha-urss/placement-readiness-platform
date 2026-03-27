import { useState } from "react";
import { TopBar } from "@/components/TopBar";
import { ContextHeader } from "@/components/ContextHeader";
import { SecondaryPanel } from "@/components/SecondaryPanel";
import { ProofFooter } from "@/components/ProofFooter";

const STEPS = [
  {
    headline: "Define Your Product Scope",
    subtext: "Clarify what this product does, who it's for, and what success looks like before writing any code.",
    stepExplanation:
      "Before building, you need a clear and honest definition of the problem. This step ensures you're solving the right thing.",
    prompt: `You are helping me define the scope of a new SaaS product.

Product idea: [describe your idea]

Please help me define:
1. Core problem being solved
2. Target user (role, context, pain point)
3. Three must-have features for the MVP
4. One feature that is explicitly out of scope

Keep answers concise and direct. No marketing language.`,
  },
  {
    headline: "Design the Data Model",
    subtext: "Define the core entities, their relationships, and the fields that matter. Get this right before touching any UI.",
    stepExplanation:
      "A solid data model is the foundation of a maintainable product. Mistakes here are expensive to fix later.",
    prompt: `I'm building a SaaS product with the following scope:

[paste your scope from Step 1]

Design a PostgreSQL data model for this product. Include:
- Table names and column definitions
- Primary keys, foreign keys, and constraints
- Indexes worth adding
- Any junction tables for many-to-many relationships

Output as clean SQL CREATE TABLE statements.`,
  },
  {
    headline: "Build the API Contract",
    subtext: "Write the OpenAPI specification for all endpoints before implementing any backend logic.",
    stepExplanation:
      "The API contract is the single source of truth between your frontend and backend. Define it first.",
    prompt: `Based on this data model:

[paste your data model from Step 2]

Write an OpenAPI 3.1 specification covering:
- CRUD endpoints for each main entity
- Proper request/response schemas
- Authentication headers where needed
- Consistent error responses (400, 401, 403, 404, 500)

Output as valid YAML. Use consistent naming conventions.`,
  },
  {
    headline: "Implement the Backend",
    subtext: "Build API route handlers that match your OpenAPI spec. Validate inputs and outputs against your Zod schemas.",
    stepExplanation:
      "With the spec defined, implementation is straightforward. Follow it strictly — no improvised endpoints.",
    prompt: `I need to implement the following API endpoint:

Endpoint: [paste specific endpoint from your OpenAPI spec]

Using:
- Node.js + Express 5
- Drizzle ORM with PostgreSQL
- Zod for input/output validation

Requirements:
- Validate all inputs using Zod
- Return proper HTTP status codes
- Handle errors explicitly
- No console.log — use structured logging

Provide a complete route handler implementation.`,
  },
  {
    headline: "Build the Frontend",
    subtext: "Implement the UI using your API client. Keep components focused and reuse design system primitives.",
    stepExplanation:
      "Build only what the spec requires. Every component should have a single clear purpose.",
    prompt: `Build a React component for the following feature:

Feature: [describe the feature]
API endpoint: [paste the endpoint]
Design constraints: calm, minimal, no animations

Requirements:
- Use React Query for data fetching
- Handle loading, error, and empty states explicitly
- No inline styles — use Tailwind classes
- Component should be self-contained

Provide complete, working TypeScript code.`,
  },
  {
    headline: "Test and Validate",
    subtext: "Verify that each feature works end-to-end. Document what you tested and what the expected behavior is.",
    stepExplanation:
      "Testing is not optional. Document what you're testing so it can be reproduced and automated later.",
    prompt: `Write a test plan for the following feature:

Feature: [describe the feature]

Include:
- Happy path: expected input → expected output
- Edge cases to test manually
- Error conditions to verify
- What a passing result looks like

Keep it concise. This will be used as a reference for future automation.`,
  },
  {
    headline: "Deploy and Ship",
    subtext: "Configure your deployment, run a final checklist, and ship to production.",
    stepExplanation:
      "Shipping is a discipline. Run the same checklist every time to maintain quality and predictability.",
    prompt: `I'm ready to deploy this feature to production.

Feature: [describe the feature]
Platform: [your deployment platform]

Generate a pre-deployment checklist covering:
- Environment variables to verify
- Database migrations to run
- Smoke tests to run after deploy
- Rollback plan if something breaks

Output as a numbered checklist.`,
  },
];

type Status = "Not Started" | "In Progress" | "Shipped";

export function BuildPage() {
  const [currentStep, setCurrentStep] = useState(1);
  const [status, setStatus] = useState<Status>("In Progress");

  const step = STEPS[currentStep - 1];

  const handleItWorked = () => {
    if (currentStep < STEPS.length) {
      setCurrentStep((s) => s + 1);
    } else {
      setStatus("Shipped");
    }
  };

  const handleError = () => {
    setStatus("In Progress");
  };

  return (
    <div className="flex flex-col min-h-screen bg-background" style={{ fontFamily: "var(--app-font-sans)" }}>
      <TopBar
        projectName="KodNest"
        currentStep={currentStep}
        totalSteps={STEPS.length}
        status={status}
      />

      <ContextHeader
        headline={step.headline}
        subtext={step.subtext}
      />

      <div className="flex flex-1 overflow-hidden">
        <main
          className="flex-1 overflow-y-auto"
          style={{ padding: "40px", width: "70%" }}
        >
          <StepNavigation
            steps={STEPS}
            currentStep={currentStep}
            onSelect={setCurrentStep}
          />

          <div style={{ marginTop: 40 }}>
            <StepWorkspace step={step} stepNumber={currentStep} />
          </div>
        </main>

        <SecondaryPanel
          stepExplanation={step.stepExplanation}
          prompt={step.prompt}
          onItWorked={handleItWorked}
          onError={handleError}
        />
      </div>

      <ProofFooter />
    </div>
  );
}

function StepNavigation({
  steps,
  currentStep,
  onSelect,
}: {
  steps: typeof STEPS;
  currentStep: number;
  onSelect: (n: number) => void;
}) {
  return (
    <nav className="flex flex-wrap gap-[8px]">
      {steps.map((s, i) => {
        const n = i + 1;
        const isActive = n === currentStep;
        const isDone = n < currentStep;
        return (
          <button
            key={n}
            onClick={() => onSelect(n)}
            className="font-sans transition-all duration-150 ease-in-out rounded"
            style={{
              fontSize: 13,
              fontWeight: isActive ? 600 : 400,
              padding: "6px 14px",
              border: isActive
                ? "1px solid hsl(0 100% 27%)"
                : "1px solid hsl(40 8% 88%)",
              color: isActive
                ? "hsl(0 100% 27%)"
                : isDone
                ? "hsl(145 35% 35%)"
                : "hsl(0 0% 42%)",
              backgroundColor: isActive
                ? "hsl(0 100% 27% / 0.06)"
                : isDone
                ? "hsl(145 35% 40% / 0.06)"
                : "transparent",
            }}
          >
            {isDone ? "✓ " : ""}{n}. {s.headline.split(" ").slice(0, 3).join(" ")}…
          </button>
        );
      })}
    </nav>
  );
}

function StepWorkspace({
  step,
  stepNumber,
}: {
  step: typeof STEPS[number];
  stepNumber: number;
}) {
  return (
    <div className="flex flex-col gap-[24px]">
      <InfoCard
        title="What to Build"
        content={`In this step, you will ${step.subtext.toLowerCase()}`}
      />

      <OutputCard stepNumber={stepNumber} />

      <NotesCard stepNumber={stepNumber} />
    </div>
  );
}

function InfoCard({ title, content }: { title: string; content: string }) {
  return (
    <div
      className="border border-border rounded bg-card"
      style={{ padding: 24 }}
    >
      <p
        className="font-sans font-semibold text-foreground"
        style={{ fontSize: 11, letterSpacing: "0.08em", textTransform: "uppercase", marginBottom: 12 }}
      >
        {title}
      </p>
      <p
        className="font-sans text-muted-foreground"
        style={{ fontSize: 15, lineHeight: 1.7, maxWidth: 640 }}
      >
        {content}
      </p>
    </div>
  );
}

function OutputCard({ stepNumber }: { stepNumber: number }) {
  const [value, setValue] = useState("");

  return (
    <div
      className="border border-border rounded bg-card"
      style={{ padding: 24 }}
    >
      <p
        className="font-sans font-semibold text-foreground"
        style={{ fontSize: 11, letterSpacing: "0.08em", textTransform: "uppercase", marginBottom: 12 }}
      >
        Your Output
      </p>
      <p
        className="font-sans text-muted-foreground"
        style={{ fontSize: 14, marginBottom: 16 }}
      >
        Paste the result from your AI tool here. This becomes your proof for Step {stepNumber}.
      </p>
      <textarea
        value={value}
        onChange={(e) => setValue(e.target.value)}
        placeholder="Paste your output here…"
        rows={8}
        className="w-full font-sans bg-background border border-border rounded text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-primary transition-all duration-150 ease-in-out resize-y"
        style={{ fontSize: 14, lineHeight: 1.65, padding: "12px 16px" }}
      />
      {value.length > 0 && (
        <p
          className="font-sans text-muted-foreground text-right"
          style={{ fontSize: 12, marginTop: 8 }}
        >
          {value.length} characters
        </p>
      )}
    </div>
  );
}

function NotesCard({ stepNumber }: { stepNumber: number }) {
  const [notes, setNotes] = useState("");

  return (
    <div
      className="border border-border rounded bg-card"
      style={{ padding: 24 }}
    >
      <p
        className="font-sans font-semibold text-foreground"
        style={{ fontSize: 11, letterSpacing: "0.08em", textTransform: "uppercase", marginBottom: 12 }}
      >
        Notes for Step {stepNumber}
      </p>
      <textarea
        value={notes}
        onChange={(e) => setNotes(e.target.value)}
        placeholder="Any blockers, decisions, or things to revisit…"
        rows={3}
        className="w-full font-sans bg-background border border-border rounded text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-primary transition-all duration-150 ease-in-out resize-y"
        style={{ fontSize: 14, lineHeight: 1.65, padding: "12px 16px" }}
      />
    </div>
  );
}
