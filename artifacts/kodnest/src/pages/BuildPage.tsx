import { useState, useEffect } from "react";
import {
  RadarChart,
  Radar,
  PolarGrid,
  PolarAngleAxis,
  ResponsiveContainer,
} from "recharts";

/* ─── Color tokens (matching #F7F6F3 / #111111 / #8B0000) ─── */
const C = {
  bg: "#F7F6F3",
  text: "#111111",
  accent: "#8B0000",
  muted: "#6B6860",
  border: "#E0DDD8",
  card: "#FFFFFF",
  successBg: "#EAF3EC",
  successText: "#2D6A3F",
  successBorder: "#B2D4BB",
  warningBg: "#FDF4E7",
  warningText: "#7A5200",
  warningBorder: "#E8C97A",
  mutedBg: "#EDECEA",
};

/* ─── Step data ─── */
const STEPS = [
  {
    headline: "Define Your Product Scope",
    subtext:
      "Clarify what this product does, who it's for, and what success looks like before writing any code.",
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
    subtext:
      "Define the core entities, their relationships, and the fields that matter.",
    stepExplanation:
      "A solid data model is the foundation of a maintainable product. Mistakes here are expensive to fix later.",
    prompt: `I'm building a SaaS product with the following scope:

[paste your scope from Step 1]

Design a PostgreSQL data model for this product. Include:
- Table names and column definitions
- Primary keys, foreign keys, and constraints
- Indexes worth adding
- Junction tables for many-to-many relationships

Output as clean SQL CREATE TABLE statements.`,
  },
  {
    headline: "Build the API Contract",
    subtext:
      "Write the OpenAPI specification for all endpoints before implementing any backend logic.",
    stepExplanation:
      "The API contract is the single source of truth between your frontend and backend. Define it first.",
    prompt: `Based on this data model:

[paste your data model from Step 2]

Write an OpenAPI 3.1 specification covering:
- CRUD endpoints for each main entity
- Proper request/response schemas
- Authentication headers where needed
- Consistent error responses (400, 401, 403, 404, 500)

Output as valid YAML.`,
  },
  {
    headline: "Implement the Backend",
    subtext:
      "Build API route handlers that match your OpenAPI spec. Validate inputs and outputs.",
    stepExplanation:
      "With the spec defined, implementation is straightforward. Follow it strictly — no improvised endpoints.",
    prompt: `I need to implement the following API endpoint:

Endpoint: [paste specific endpoint from your OpenAPI spec]

Using:
- Node.js + Express 5
- Drizzle ORM with PostgreSQL
- Zod for input/output validation

Provide a complete route handler implementation.`,
  },
  {
    headline: "Build the Frontend",
    subtext:
      "Implement the UI using your API client. Keep components focused and reuse design system primitives.",
    stepExplanation:
      "Build only what the spec requires. Every component should have a single clear purpose.",
    prompt: `Build a React component for the following feature:

Feature: [describe the feature]
API endpoint: [paste the endpoint]

Requirements:
- Use React Query for data fetching
- Handle loading, error, and empty states
- No inline styles — use Tailwind classes
- Component should be self-contained

Provide complete TypeScript code.`,
  },
  {
    headline: "Test and Validate",
    subtext:
      "Verify that each feature works end-to-end. Document what you tested.",
    stepExplanation:
      "Testing is not optional. Document what you're testing so it can be reproduced and automated later.",
    prompt: `Write a test plan for the following feature:

Feature: [describe the feature]

Include:
- Happy path: expected input → expected output
- Edge cases to test manually
- Error conditions to verify
- What a passing result looks like`,
  },
  {
    headline: "Deploy and Ship",
    subtext:
      "Configure your deployment, run a final checklist, and ship to production.",
    stepExplanation:
      "Shipping is a discipline. Run the same checklist every time to maintain quality.",
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

/* ══════════════════════════════════════════════════════
   ROOT BUILD PAGE
══════════════════════════════════════════════════════ */
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

  return (
    /* Full viewport, fixed layout — no page scroll */
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        height: "100vh",
        width: "100%",
        backgroundColor: C.bg,
        color: C.text,
        fontFamily: "'Inter', system-ui, sans-serif",
        overflow: "hidden",
      }}
    >
      {/* ① TOP BAR ─ fixed height 56px */}
      <TopBar
        currentStep={currentStep}
        totalSteps={STEPS.length}
        status={status}
      />

      {/* ② CONTEXT HEADER ─ fixed height */}
      <ContextHeader headline={step.headline} subtext={step.subtext} />

      {/* ③ MIDDLE ROW ─ grows to fill remaining space, itself scrollable */}
      <div style={{ display: "flex", flex: 1, overflow: "hidden" }}>
        {/* PRIMARY WORKSPACE — 70% */}
        <main
          style={{
            flex: "0 0 70%",
            overflowY: "auto",
            padding: "40px",
            borderRight: `1px solid ${C.border}`,
          }}
        >
          <StepNavigation
            steps={STEPS}
            currentStep={currentStep}
            onSelect={setCurrentStep}
          />
          <div style={{ height: 32 }} />
          {currentStep === 1 ? (
            <Step1Workspace />
          ) : currentStep === 2 ? (
            <Step2Workspace />
          ) : currentStep === 3 ? (
            <Step3Workspace />
          ) : currentStep === 4 ? (
            <Step4Workspace />
          ) : (
            <WorkspaceCards stepNumber={currentStep} />
          )}
        </main>

        {/* SECONDARY PANEL — 30% */}
        <SecondaryPanel
          stepExplanation={step.stepExplanation}
          prompt={step.prompt}
          onItWorked={handleItWorked}
          onError={() => setStatus("In Progress")}
        />
      </div>

      {/* ④ PROOF FOOTER ─ always visible at bottom */}
      <ProofFooter />
    </div>
  );
}

/* ══════════════════════════════════════════════════════
   TOP BAR
══════════════════════════════════════════════════════ */
function TopBar({
  currentStep,
  totalSteps,
  status,
}: {
  currentStep: number;
  totalSteps: number;
  status: Status;
}) {
  const statusStyle: Record<Status, React.CSSProperties> = {
    "Not Started": { background: C.mutedBg, color: C.muted, border: `1px solid ${C.border}` },
    "In Progress": { background: C.warningBg, color: C.warningText, border: `1px solid ${C.warningBorder}` },
    "Shipped": { background: C.successBg, color: C.successText, border: `1px solid ${C.successBorder}` },
  };

  return (
    <header
      style={{
        height: 56,
        flexShrink: 0,
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        padding: "0 40px",
        backgroundColor: C.card,
        borderBottom: `1px solid ${C.border}`,
      }}
    >
      {/* Left: Project name */}
      <span
        style={{
          fontFamily: "Georgia, serif",
          fontWeight: 700,
          fontSize: 16,
          color: C.text,
          letterSpacing: "-0.02em",
        }}
      >
        KodNest
      </span>

      {/* Center: Progress dots + label */}
      <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
        {Array.from({ length: totalSteps }).map((_, i) => {
          const done = i < currentStep;
          const active = i === currentStep - 1;
          return (
            <div
              key={i}
              style={{
                height: 8,
                width: done ? 24 : 8,
                borderRadius: 4,
                backgroundColor: active
                  ? C.accent
                  : done
                  ? C.accent + "99"
                  : C.border,
                transition: "all 200ms ease-in-out",
              }}
            />
          );
        })}
        <span
          style={{
            marginLeft: 8,
            fontSize: 13,
            color: C.muted,
            fontVariantNumeric: "tabular-nums",
          }}
        >
          Step {currentStep} / {totalSteps}
        </span>
      </div>

      {/* Right: Status badge */}
      <span
        style={{
          fontSize: 12,
          fontWeight: 500,
          padding: "5px 14px",
          borderRadius: 20,
          ...statusStyle[status],
        }}
      >
        {status}
      </span>
    </header>
  );
}

/* ══════════════════════════════════════════════════════
   CONTEXT HEADER
══════════════════════════════════════════════════════ */
function ContextHeader({
  headline,
  subtext,
}: {
  headline: string;
  subtext: string;
}) {
  return (
    <div
      style={{
        flexShrink: 0,
        padding: "32px 40px 28px",
        backgroundColor: C.card,
        borderBottom: `1px solid ${C.border}`,
      }}
    >
      <h1
        style={{
          fontFamily: "Georgia, serif",
          fontSize: 32,
          fontWeight: 700,
          color: C.text,
          margin: "0 0 8px 0",
          letterSpacing: "-0.02em",
          lineHeight: 1.2,
        }}
      >
        {headline}
      </h1>
      <p
        style={{
          fontSize: 16,
          color: C.muted,
          lineHeight: 1.65,
          margin: 0,
          maxWidth: 640,
        }}
      >
        {subtext}
      </p>
    </div>
  );
}

/* ══════════════════════════════════════════════════════
   STEP NAVIGATION
══════════════════════════════════════════════════════ */
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
    <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
      {steps.map((s, i) => {
        const n = i + 1;
        const active = n === currentStep;
        const done = n < currentStep;
        return (
          <button
            key={n}
            onClick={() => onSelect(n)}
            style={{
              fontSize: 13,
              fontWeight: active ? 600 : 400,
              padding: "6px 14px",
              borderRadius: 6,
              border: active
                ? `1px solid ${C.accent}`
                : `1px solid ${C.border}`,
              color: active ? C.accent : done ? C.successText : C.muted,
              backgroundColor: active
                ? "#8B000010"
                : done
                ? C.successBg
                : "transparent",
              cursor: "pointer",
              transition: "all 150ms ease-in-out",
            }}
          >
            {done ? "✓ " : ""}
            {n}. {s.headline.split(" ").slice(0, 3).join(" ")}
            {s.headline.split(" ").length > 3 ? "…" : ""}
          </button>
        );
      })}
    </div>
  );
}

/* ══════════════════════════════════════════════════════
   STEP 1 WORKSPACE — Application Setup
   Only renders when currentStep === 1
══════════════════════════════════════════════════════ */

type AppPage = "landing" | "dashboard" | "practice" | "assessments" | "resources" | "profile";

const NAV_ITEMS: { id: AppPage; label: string }[] = [
  { id: "dashboard", label: "Dashboard" },
  { id: "practice", label: "Practice" },
  { id: "assessments", label: "Assessments" },
  { id: "resources", label: "Resources" },
  { id: "profile", label: "Profile" },
];

function Step1Workspace() {
  const [page, setPage] = useState<AppPage>("landing");

  return (
    <div
      style={{
        border: `1px solid ${C.border}`,
        borderRadius: 8,
        backgroundColor: C.card,
        overflow: "hidden",
        display: "flex",
        flexDirection: "column",
      }}
    >
      {/* ─── Inner App Nav Bar ─── */}
      <nav
        style={{
          display: "flex",
          alignItems: "center",
          gap: 0,
          borderBottom: `1px solid ${C.border}`,
          padding: "0 24px",
          backgroundColor: C.bg,
          height: 48,
        }}
      >
        {/* App brand */}
        <span
          style={{
            fontFamily: "Georgia, serif",
            fontWeight: 700,
            fontSize: 14,
            color: C.text,
            marginRight: 32,
            letterSpacing: "-0.01em",
            cursor: "pointer",
          }}
          onClick={() => setPage("landing")}
        >
          KodNest App
        </span>

        {/* Nav links */}
        {NAV_ITEMS.map((item) => {
          const active = page === item.id;
          return (
            <button
              key={item.id}
              onClick={() => setPage(item.id)}
              style={{
                padding: "0 16px",
                height: 48,
                fontSize: 13,
                fontWeight: active ? 600 : 400,
                color: active ? C.accent : C.muted,
                background: "none",
                border: "none",
                borderBottom: active ? `2px solid ${C.accent}` : "2px solid transparent",
                cursor: "pointer",
                fontFamily: "inherit",
                transition: "all 150ms ease-in-out",
              }}
            >
              {item.label}
            </button>
          );
        })}
      </nav>

      {/* ─── Inner Page Content ─── */}
      <div style={{ padding: 40 }}>
        {page === "landing" && <LandingPage onGetStarted={() => setPage("dashboard")} />}
        {page !== "landing" && <PlaceholderPage label={NAV_ITEMS.find((n) => n.id === page)?.label ?? ""} />}
      </div>
    </div>
  );
}

/* ── Landing Page ── */
function LandingPage({ onGetStarted }: { onGetStarted: () => void }) {
  const features = [
    {
      icon: (
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke={C.accent} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
          <polyline points="16 18 22 12 16 6" />
          <polyline points="8 6 2 12 8 18" />
        </svg>
      ),
      title: "Practice Problems",
      description: "Work through curated coding problems organized by topic and difficulty.",
    },
    {
      icon: (
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke={C.accent} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
          <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
          <circle cx="9" cy="7" r="4" />
          <path d="M23 21v-2a4 4 0 0 0-3-3.87" />
          <path d="M16 3.13a4 4 0 0 1 0 7.75" />
        </svg>
      ),
      title: "Mock Interviews",
      description: "Simulate real interview scenarios with timed sessions and structured feedback.",
    },
    {
      icon: (
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke={C.accent} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
          <line x1="18" y1="20" x2="18" y2="10" />
          <line x1="12" y1="20" x2="12" y2="4" />
          <line x1="6" y1="20" x2="6" y2="14" />
        </svg>
      ),
      title: "Track Progress",
      description: "Monitor your performance over time and identify areas that need more attention.",
    },
  ];

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 40 }}>
      {/* Hero */}
      <div
        style={{
          textAlign: "center",
          padding: "40px 24px",
          borderRadius: 8,
          border: `1px solid ${C.border}`,
          backgroundColor: C.bg,
        }}
      >
        <h2
          style={{
            fontFamily: "Georgia, serif",
            fontSize: 36,
            fontWeight: 700,
            color: C.text,
            margin: "0 0 16px",
            letterSpacing: "-0.02em",
            lineHeight: 1.2,
          }}
        >
          Ace Your Placement
        </h2>
        <p
          style={{
            fontSize: 17,
            color: C.muted,
            lineHeight: 1.65,
            margin: "0 auto 32px",
            maxWidth: 440,
          }}
        >
          Practice, assess, and prepare for your dream job
        </p>
        <button
          onClick={onGetStarted}
          style={{
            backgroundColor: C.accent,
            color: "#FFFFFF",
            border: "none",
            borderRadius: 6,
            padding: "12px 32px",
            fontSize: 15,
            fontWeight: 600,
            fontFamily: "inherit",
            cursor: "pointer",
            transition: "opacity 150ms ease-in-out",
          }}
          onMouseEnter={(e) => (e.currentTarget.style.opacity = "0.85")}
          onMouseLeave={(e) => (e.currentTarget.style.opacity = "1")}
        >
          Get Started
        </button>
      </div>

      {/* Features */}
      <div>
        <p
          style={{
            fontSize: 11,
            fontWeight: 600,
            letterSpacing: "0.08em",
            textTransform: "uppercase",
            color: C.muted,
            margin: "0 0 16px",
          }}
        >
          What's Inside
        </p>
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(3, 1fr)",
            gap: 16,
          }}
        >
          {features.map((f) => (
            <div
              key={f.title}
              style={{
                border: `1px solid ${C.border}`,
                borderRadius: 8,
                padding: 24,
                backgroundColor: C.card,
                display: "flex",
                flexDirection: "column",
                gap: 16,
              }}
            >
              <div
                style={{
                  width: 40,
                  height: 40,
                  borderRadius: 8,
                  border: `1px solid ${C.border}`,
                  backgroundColor: C.bg,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                }}
              >
                {f.icon}
              </div>
              <div>
                <p
                  style={{
                    fontSize: 15,
                    fontWeight: 600,
                    color: C.text,
                    margin: "0 0 8px",
                  }}
                >
                  {f.title}
                </p>
                <p
                  style={{
                    fontSize: 13,
                    color: C.muted,
                    lineHeight: 1.6,
                    margin: 0,
                  }}
                >
                  {f.description}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Footer */}
      <p
        style={{
          fontSize: 13,
          color: C.muted,
          textAlign: "center",
          margin: 0,
          paddingTop: 8,
          borderTop: `1px solid ${C.border}`,
        }}
      >
        Built for students. Designed for results.
      </p>
    </div>
  );
}

/* ── Placeholder pages for nav items ── */
function PlaceholderPage({ label }: { label: string }) {
  return (
    <div
      style={{
        border: `1px dashed ${C.border}`,
        borderRadius: 8,
        padding: 40,
        textAlign: "center",
        backgroundColor: C.bg,
      }}
    >
      <p
        style={{
          fontFamily: "Georgia, serif",
          fontSize: 22,
          fontWeight: 700,
          color: C.text,
          margin: "0 0 8px",
        }}
      >
        {label} Page
      </p>
      <p style={{ fontSize: 14, color: C.muted, margin: 0 }}>
        Placeholder — content will be implemented in a future step.
      </p>
    </div>
  );
}

/* ══════════════════════════════════════════════════════
   STEP 2 WORKSPACE — Dashboard Components
══════════════════════════════════════════════════════ */

const RADAR_DATA = [
  { skill: "DSA", value: 75 },
  { skill: "System Design", value: 60 },
  { skill: "Communication", value: 80 },
  { skill: "Resume", value: 85 },
  { skill: "Aptitude", value: 70 },
];

const DAYS = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];
const COMPLETED_DAYS = [true, true, true, true, false, false, false];

const ASSESSMENTS = [
  { title: "DSA Mock Test", time: "Tomorrow · 10:00 AM" },
  { title: "System Design Review", time: "Wed · 2:00 PM" },
  { title: "HR Interview Prep", time: "Friday · 11:00 AM" },
];

function Step2Workspace() {
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
      {/* Row 1 — Readiness + Skill Breakdown */}
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "1fr 1fr",
          gap: 16,
        }}
      >
        {/* ── Readiness Score ── */}
        <DashCard title="Overall Readiness">
          <div
            style={{
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              gap: 16,
              padding: "8px 0",
            }}
          >
            <ReadinessCircle score={72} />
            <p style={{ fontSize: 13, color: C.muted, margin: 0 }}>
              Your placement readiness score
            </p>
          </div>
        </DashCard>

        {/* ── Skill Breakdown ── */}
        <DashCard title="Skill Breakdown">
          <ResponsiveContainer width="100%" height={180}>
            <RadarChart data={RADAR_DATA} margin={{ top: 8, right: 16, bottom: 8, left: 16 }}>
              <PolarGrid stroke={C.border} />
              <PolarAngleAxis
                dataKey="skill"
                tick={{
                  fontSize: 11,
                  fill: C.muted,
                  fontFamily: "Inter, system-ui, sans-serif",
                }}
              />
              <Radar
                dataKey="value"
                stroke={C.accent}
                fill={C.accent}
                fillOpacity={0.12}
                strokeWidth={1.5}
              />
            </RadarChart>
          </ResponsiveContainer>
        </DashCard>
      </div>

      {/* Row 2 — Continue Practice + Weekly Goals */}
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "1fr 1fr",
          gap: 16,
        }}
      >
        {/* ── Continue Practice ── */}
        <DashCard title="Continue Practice">
          <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
            <div>
              <p style={{ fontSize: 15, fontWeight: 600, color: C.text, margin: "0 0 4px" }}>
                Dynamic Programming
              </p>
              <p style={{ fontSize: 13, color: C.muted, margin: 0 }}>
                3 of 10 problems completed
              </p>
            </div>

            {/* progress bar */}
            <div
              style={{
                height: 6,
                backgroundColor: C.mutedBg,
                borderRadius: 3,
                overflow: "hidden",
              }}
            >
              <div
                style={{
                  width: "30%",
                  height: "100%",
                  backgroundColor: C.accent,
                  borderRadius: 3,
                  transition: "width 300ms ease-in-out",
                }}
              />
            </div>

            <p style={{ fontSize: 12, color: C.muted, margin: 0 }}>3 / 10</p>

            <button
              style={{
                alignSelf: "flex-start",
                backgroundColor: C.accent,
                color: "#FFFFFF",
                border: "none",
                borderRadius: 6,
                padding: "8px 20px",
                fontSize: 13,
                fontWeight: 600,
                fontFamily: "inherit",
                cursor: "pointer",
                transition: "opacity 150ms ease-in-out",
              }}
              onMouseEnter={(e) => (e.currentTarget.style.opacity = "0.85")}
              onMouseLeave={(e) => (e.currentTarget.style.opacity = "1")}
            >
              Continue
            </button>
          </div>
        </DashCard>

        {/* ── Weekly Goals ── */}
        <DashCard title="Weekly Goals">
          <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
            <div>
              <div
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  marginBottom: 8,
                }}
              >
                <p style={{ fontSize: 14, color: C.text, margin: 0 }}>
                  Problems Solved
                </p>
                <p style={{ fontSize: 14, fontWeight: 600, color: C.accent, margin: 0 }}>
                  12 / 20
                </p>
              </div>
              <div
                style={{
                  height: 6,
                  backgroundColor: C.mutedBg,
                  borderRadius: 3,
                  overflow: "hidden",
                }}
              >
                <div
                  style={{
                    width: "60%",
                    height: "100%",
                    backgroundColor: C.accent,
                    borderRadius: 3,
                  }}
                />
              </div>
            </div>

            {/* Day circles */}
            <div>
              <p style={{ fontSize: 11, color: C.muted, margin: "0 0 10px", letterSpacing: "0.06em", textTransform: "uppercase", fontWeight: 600 }}>
                This Week
              </p>
              <div style={{ display: "flex", gap: 8 }}>
                {DAYS.map((day, i) => {
                  const done = COMPLETED_DAYS[i];
                  return (
                    <div
                      key={day}
                      style={{
                        display: "flex",
                        flexDirection: "column",
                        alignItems: "center",
                        gap: 6,
                      }}
                    >
                      <div
                        style={{
                          width: 28,
                          height: 28,
                          borderRadius: "50%",
                          border: `1.5px solid ${done ? C.accent : C.border}`,
                          backgroundColor: done ? C.accent : "transparent",
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                        }}
                      >
                        {done && (
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
                      </div>
                      <span
                        style={{
                          fontSize: 10,
                          color: done ? C.accent : C.muted,
                          fontWeight: done ? 600 : 400,
                        }}
                      >
                        {day}
                      </span>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        </DashCard>
      </div>

      {/* Row 3 — Upcoming Assessments (full width) */}
      <DashCard title="Upcoming Assessments">
        <div style={{ display: "flex", flexDirection: "column", gap: 0 }}>
          {ASSESSMENTS.map((item, i) => (
            <div
              key={item.title}
              style={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                padding: "12px 0",
                borderBottom:
                  i < ASSESSMENTS.length - 1 ? `1px solid ${C.border}` : "none",
              }}
            >
              <div>
                <p style={{ fontSize: 14, fontWeight: 500, color: C.text, margin: "0 0 2px" }}>
                  {item.title}
                </p>
                <p style={{ fontSize: 12, color: C.muted, margin: 0 }}>
                  {item.time}
                </p>
              </div>
              <span
                style={{
                  fontSize: 11,
                  fontWeight: 500,
                  padding: "4px 10px",
                  borderRadius: 20,
                  backgroundColor: C.mutedBg,
                  color: C.muted,
                  border: `1px solid ${C.border}`,
                  whiteSpace: "nowrap",
                }}
              >
                Upcoming
              </span>
            </div>
          ))}
        </div>
      </DashCard>
    </div>
  );
}

/* SVG circular progress */
function ReadinessCircle({ score }: { score: number }) {
  const size = 120;
  const stroke = 8;
  const r = (size - stroke) / 2;
  const circ = 2 * Math.PI * r;
  const offset = circ - (score / 100) * circ;

  return (
    <div style={{ position: "relative", width: size, height: size }}>
      <svg width={size} height={size} style={{ transform: "rotate(-90deg)" }}>
        {/* Track */}
        <circle
          cx={size / 2}
          cy={size / 2}
          r={r}
          fill="none"
          stroke={C.border}
          strokeWidth={stroke}
        />
        {/* Progress */}
        <circle
          cx={size / 2}
          cy={size / 2}
          r={r}
          fill="none"
          stroke={C.accent}
          strokeWidth={stroke}
          strokeDasharray={circ}
          strokeDashoffset={offset}
          strokeLinecap="round"
        />
      </svg>
      {/* Center label */}
      <div
        style={{
          position: "absolute",
          inset: 0,
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        <span style={{ fontSize: 24, fontWeight: 700, color: C.text, lineHeight: 1 }}>
          {score}
        </span>
        <span style={{ fontSize: 10, color: C.muted, marginTop: 2 }}>/ 100</span>
      </div>
    </div>
  );
}

/* Shared card wrapper for dashboard */
function DashCard({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) {
  return (
    <div
      style={{
        border: `1px solid ${C.border}`,
        borderRadius: 8,
        backgroundColor: C.card,
        padding: 24,
      }}
    >
      <p
        style={{
          fontSize: 11,
          fontWeight: 600,
          letterSpacing: "0.08em",
          textTransform: "uppercase",
          color: C.muted,
          margin: "0 0 16px",
        }}
      >
        {title}
      </p>
      {children}
    </div>
  );
}

/* ══════════════════════════════════════════════════════
   STEP 3 WORKSPACE — Analysis Logic
══════════════════════════════════════════════════════ */

/* ── Skill categories & keywords ── */
const SKILL_MAP: Record<string, string[]> = {
  "Core CS":    ["DSA", "OOP", "DBMS", "OS", "Networks"],
  "Languages":  ["Java", "Python", "JavaScript", "TypeScript", "C++", "C#", "Go"],
  "Web":        ["React", "Next.js", "Node.js", "Express", "REST", "GraphQL"],
  "Data":       ["SQL", "MongoDB", "PostgreSQL", "MySQL", "Redis"],
  "Cloud/DevOps": ["AWS", "Azure", "GCP", "Docker", "Kubernetes", "CI/CD", "Linux"],
  "Testing":    ["Selenium", "Cypress", "Playwright", "JUnit", "PyTest"],
};

/* ── Extract skills from JD text ── */
function extractSkills(jd: string): Record<string, string[]> {
  const lower = jd.toLowerCase();
  const found: Record<string, string[]> = {};
  for (const [cat, keywords] of Object.entries(SKILL_MAP)) {
    const hits = keywords.filter((kw) => lower.includes(kw.toLowerCase()));
    if (hits.length > 0) found[cat] = hits;
  }
  return found;
}

/* ── Readiness score ── */
function calcScore(
  skills: Record<string, string[]>,
  company: string,
  role: string,
  jd: string,
): number {
  let score = 35;
  score += Math.min(Object.keys(skills).length * 5, 30);
  if (company.trim().length > 0) score += 10;
  if (role.trim().length > 0) score += 10;
  if (jd.length > 800) score += 10;
  return Math.min(score, 100);
}

/* ── Checklist generator ── */
function genChecklist(skills: Record<string, string[]>): Record<string, string[]> {
  const hasDSA     = !!skills["Core CS"];
  const hasWeb     = !!skills["Web"];
  const hasDB      = !!skills["Data"];
  const hasCloud   = !!skills["Cloud/DevOps"];
  const hasTesting = !!skills["Testing"];

  return {
    "Round 1 — Aptitude": [
      "Quantitative reasoning",
      "Logical puzzles",
      "Verbal ability",
      "Number series",
      "Data interpretation",
    ],
    "Round 2 — DSA + Core": [
      ...(hasDSA ? ["Arrays & Strings", "Linked Lists", "Trees & Graphs", "DP basics"] : ["Data structures overview"]),
      "OOP principles",
      "OS concepts (processes, threads)",
      "DBMS normalization",
    ],
    "Round 3 — Tech Interview": [
      ...(hasWeb  ? ["React component lifecycle", "REST API design", "State management"] : []),
      ...(hasDB   ? ["SQL query optimization", "Indexing strategies"] : []),
      ...(hasCloud? ["Docker containerization", "CI/CD pipeline setup"] : []),
      ...(hasTesting ? ["Test case design", "Unit vs integration testing"] : []),
      "System design basics",
      "Code walkthrough of personal projects",
    ].slice(0, 8),
    "Round 4 — HR": [
      "Tell me about yourself",
      "Strengths and weaknesses",
      "Why this company?",
      "Conflict resolution scenario",
      "5-year career plan",
    ],
  };
}

/* ── 7-day plan generator ── */
function genPlan(skills: Record<string, string[]>): { day: string; topic: string; detail: string }[] {
  const hasWeb   = !!skills["Web"];
  const hasDB    = !!skills["Data"];
  const hasDSA   = !!skills["Core CS"];

  return [
    { day: "Day 1", topic: "Core CS Foundations", detail: hasDSA ? "OS, Networks, OOP deep-dive" : "CS fundamentals review" },
    { day: "Day 2", topic: "DBMS + SQL", detail: hasDB ? "Normalization, joins, query optimization" : "Database basics & relational models" },
    { day: "Day 3", topic: "DSA — Arrays & Trees", detail: "Sorting, searching, BST, recursion" },
    { day: "Day 4", topic: "DSA — DP & Graphs", detail: "Memoization, BFS/DFS, common patterns" },
    { day: "Day 5", topic: "Projects & Tech Stack", detail: hasWeb ? "Frontend build + API integration walkthrough" : "Showcase 2 projects with design decisions" },
    { day: "Day 6", topic: "Mock Interviews", detail: "2 timed coding rounds + 1 system design" },
    { day: "Day 7", topic: "Revision & HR Prep", detail: "Flash-card review + 20 HR question run-through" },
  ];
}

/* ── Interview questions generator ── */
function genQuestions(skills: Record<string, string[]>): string[] {
  const pool: string[] = [
    "Explain the difference between a process and a thread.",
    "What is Big O notation? Analyze a bubble sort.",
    "How does HTTPS work?",
    "Describe a challenging project and how you solved a key problem.",
    "What are SOLID principles in OOP?",
  ];
  if (skills["Web"]) pool.push(
    "How does React's virtual DOM work?",
    "Explain REST vs GraphQL trade-offs.",
    "What is server-side rendering and when would you use it?",
  );
  if (skills["Data"]) pool.push(
    "What is database indexing and when does it hurt performance?",
    "Explain ACID properties in databases.",
  );
  if (skills["Cloud/DevOps"]) pool.push(
    "What problem does Docker solve? How does it differ from a VM?",
    "Describe a CI/CD pipeline you have set up or used.",
  );
  if (skills["Core CS"]) pool.push(
    "Implement LRU Cache.",
    "Find the shortest path in an unweighted graph.",
  );
  if (skills["Testing"]) pool.push(
    "What is the testing pyramid? Where do integration tests fit?",
  );
  return pool.slice(0, 10);
}

/* ── Shared localStorage key (history array) ── */
const LS_KEY = "kodnest_history";

/* ── Storage helpers ── */
function loadHistory(): AnalysisResult[] {
  try {
    const raw = localStorage.getItem(LS_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}
function saveHistory(entries: AnalysisResult[]): void {
  localStorage.setItem(LS_KEY, JSON.stringify(entries));
}

/* ── Types ── */
interface AnalysisResult {
  id: string;
  createdAt: string;
  company: string;
  role: string;
  jdText: string;
  extractedSkills: Record<string, string[]>;
  checklist: Record<string, string[]>;
  plan: { day: string; topic: string; detail: string }[];
  questions: string[];
  readinessScore: number;
}

/* ── Main Step3 component ── */
function Step3Workspace() {
  const [company, setCompany] = useState("");
  const [role, setRole] = useState("");
  const [jd, setJd] = useState("");
  const [result, setResult] = useState<AnalysisResult | null>(() => {
    const hist = loadHistory();
    return hist.length > 0 ? hist[hist.length - 1] : null;
  });

  const handleAnalyze = () => {
    const skills = extractSkills(jd);
    const score  = calcScore(skills, company, role, jd);
    const data: AnalysisResult = {
      id:              crypto.randomUUID(),
      createdAt:       new Date().toISOString(),
      company, role,
      jdText:          jd,
      extractedSkills: skills,
      checklist:       genChecklist(skills),
      plan:            genPlan(skills),
      questions:       genQuestions(skills),
      readinessScore:  score,
    };
    const hist = loadHistory();
    saveHistory([...hist, data]);
    setResult(data);
  };

  const handleReset = () => {
    setResult(null);
    setCompany(""); setRole(""); setJd("");
  };

  return result ? (
    <AnalysisOutput result={result} onReset={handleReset} />
  ) : (
    <AnalysisInput
      company={company} setCompany={setCompany}
      role={role} setRole={setRole}
      jd={jd} setJd={setJd}
      onAnalyze={handleAnalyze}
    />
  );
}

/* ── Input form ── */
function AnalysisInput({
  company, setCompany, role, setRole, jd, setJd, onAnalyze,
}: {
  company: string; setCompany: (v: string) => void;
  role: string; setRole: (v: string) => void;
  jd: string; setJd: (v: string) => void;
  onAnalyze: () => void;
}) {
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
      {/* Company + Role row */}
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }}>
        <div
          style={{
            border: `1px solid ${C.border}`, borderRadius: 8,
            backgroundColor: C.card, padding: 24,
          }}
        >
          <FieldLabel>Company Name</FieldLabel>
          <input
            type="text"
            value={company}
            onChange={(e) => setCompany(e.target.value)}
            placeholder="e.g. Google, Infosys…"
            style={inputStyle()}
            onFocus={(e) => (e.target.style.borderColor = C.accent)}
            onBlur={(e)  => (e.target.style.borderColor = C.border)}
          />
        </div>
        <div
          style={{
            border: `1px solid ${C.border}`, borderRadius: 8,
            backgroundColor: C.card, padding: 24,
          }}
        >
          <FieldLabel>Role</FieldLabel>
          <input
            type="text"
            value={role}
            onChange={(e) => setRole(e.target.value)}
            placeholder="e.g. SDE-1, Frontend Engineer…"
            style={inputStyle()}
            onFocus={(e) => (e.target.style.borderColor = C.accent)}
            onBlur={(e)  => (e.target.style.borderColor = C.border)}
          />
        </div>
      </div>

      {/* JD textarea */}
      <div
        style={{
          border: `1px solid ${C.border}`, borderRadius: 8,
          backgroundColor: C.card, padding: 24,
        }}
      >
        <FieldLabel>Job Description</FieldLabel>
        <p style={{ fontSize: 13, color: C.muted, margin: "0 0 12px" }}>
          Paste the full JD. Skills are extracted automatically.
        </p>
        <textarea
          value={jd}
          onChange={(e) => setJd(e.target.value)}
          placeholder="Paste the job description here…"
          rows={10}
          style={{
            ...inputStyle(),
            resize: "vertical",
            fontFamily: "inherit",
            lineHeight: 1.65,
          }}
          onFocus={(e) => (e.target.style.borderColor = C.accent)}
          onBlur={(e)  => (e.target.style.borderColor = C.border)}
        />
        <div
          style={{
            display: "flex", justifyContent: "space-between",
            alignItems: "center", marginTop: 16,
          }}
        >
          <span style={{ fontSize: 12, color: C.muted }}>
            {jd.length} chars{jd.length > 800 ? " · +10 readiness" : ""}
          </span>
          <button
            onClick={onAnalyze}
            disabled={jd.trim().length < 20}
            style={{
              backgroundColor: jd.trim().length < 20 ? C.mutedBg : C.accent,
              color: jd.trim().length < 20 ? C.muted : "#FFFFFF",
              border: "none",
              borderRadius: 6,
              padding: "10px 28px",
              fontSize: 14,
              fontWeight: 600,
              fontFamily: "inherit",
              cursor: jd.trim().length < 20 ? "not-allowed" : "pointer",
              transition: "all 150ms ease-in-out",
            }}
            onMouseEnter={(e) => { if (jd.trim().length >= 20) e.currentTarget.style.opacity = "0.85"; }}
            onMouseLeave={(e) => (e.currentTarget.style.opacity = "1")}
          >
            Analyze JD
          </button>
        </div>
      </div>
    </div>
  );
}

/* ── Output panels ── */
function AnalysisOutput({ result, onReset }: { result: AnalysisResult; onReset: () => void }) {
  const noSkills = Object.keys(result.extractedSkills).length === 0;

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
      {/* Header row: meta + score + reset */}
      <div
        style={{
          border: `1px solid ${C.border}`, borderRadius: 8,
          backgroundColor: C.card, padding: 24,
          display: "flex", justifyContent: "space-between", alignItems: "center",
        }}
      >
        <div>
          {result.company && (
            <p style={{ fontSize: 16, fontWeight: 600, color: C.text, margin: "0 0 2px" }}>
              {result.company} {result.role ? `— ${result.role}` : ""}
            </p>
          )}
          <p style={{ fontSize: 12, color: C.muted, margin: 0 }}>
            Analyzed {new Date(result.createdAt).toLocaleString()}
          </p>
        </div>

        <div style={{ display: "flex", alignItems: "center", gap: 24 }}>
          {/* Score pill */}
          <div style={{ textAlign: "center" }}>
            <div
              style={{
                fontSize: 28, fontWeight: 700, color: C.accent,
                fontFamily: "Georgia, serif", lineHeight: 1,
              }}
            >
              {result.readinessScore}
            </div>
            <div style={{ fontSize: 10, color: C.muted, marginTop: 2, letterSpacing: "0.06em", textTransform: "uppercase" }}>
              Readiness Score
            </div>
          </div>

          <button
            onClick={onReset}
            style={{
              border: `1px solid ${C.border}`, borderRadius: 6,
              backgroundColor: "transparent", color: C.muted,
              padding: "8px 16px", fontSize: 13, fontFamily: "inherit",
              cursor: "pointer", transition: "all 150ms ease-in-out",
            }}
          >
            Analyze New JD
          </button>
        </div>
      </div>

      {/* Readiness bar */}
      <div
        style={{
          border: `1px solid ${C.border}`, borderRadius: 8,
          backgroundColor: C.card, padding: "16px 24px",
        }}
      >
        <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 8 }}>
          <span style={{ fontSize: 12, fontWeight: 600, color: C.muted, textTransform: "uppercase", letterSpacing: "0.06em" }}>
            Readiness
          </span>
          <span style={{ fontSize: 12, fontWeight: 600, color: C.accent }}>
            {result.readinessScore} / 100
          </span>
        </div>
        <div style={{ height: 8, backgroundColor: C.mutedBg, borderRadius: 4, overflow: "hidden" }}>
          <div
            style={{
              width: `${result.readinessScore}%`, height: "100%",
              backgroundColor: C.accent, borderRadius: 4,
              transition: "width 400ms ease-in-out",
            }}
          />
        </div>
      </div>

      {/* Extracted Skills */}
      <div
        style={{
          border: `1px solid ${C.border}`, borderRadius: 8,
          backgroundColor: C.card, padding: 24,
        }}
      >
        <FieldLabel>Extracted Skills</FieldLabel>
        {noSkills ? (
          <p style={{ fontSize: 14, color: C.muted, margin: 0 }}>
            No specific stack detected — preparing General Fresher Stack.
          </p>
        ) : (
          <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
            {Object.entries(result.extractedSkills).map(([cat, skills]) => (
              <div key={cat}>
                <p style={{ fontSize: 11, color: C.muted, fontWeight: 600, letterSpacing: "0.06em", textTransform: "uppercase", margin: "0 0 8px" }}>
                  {cat}
                </p>
                <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
                  {skills.map((s) => (
                    <span
                      key={s}
                      style={{
                        fontSize: 12, fontWeight: 500,
                        padding: "4px 10px", borderRadius: 20,
                        border: `1px solid ${C.accent}33`,
                        backgroundColor: `${C.accent}0d`, color: C.accent,
                      }}
                    >
                      {s}
                    </span>
                  ))}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* 2-col: Checklist + 7-Day Plan */}
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }}>
        {/* Checklist */}
        <div
          style={{
            border: `1px solid ${C.border}`, borderRadius: 8,
            backgroundColor: C.card, padding: 24,
          }}
        >
          <FieldLabel>Interview Checklist</FieldLabel>
          <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
            {Object.entries(result.checklist).map(([round, items]) => (
              <div key={round}>
                <p style={{ fontSize: 12, fontWeight: 600, color: C.text, margin: "0 0 8px" }}>
                  {round}
                </p>
                <ul style={{ margin: 0, paddingLeft: 18 }}>
                  {items.map((item) => (
                    <li key={item} style={{ fontSize: 13, color: C.muted, lineHeight: 1.8 }}>
                      {item}
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </div>

        {/* 7-Day Plan */}
        <div
          style={{
            border: `1px solid ${C.border}`, borderRadius: 8,
            backgroundColor: C.card, padding: 24,
          }}
        >
          <FieldLabel>7-Day Prep Plan</FieldLabel>
          <div style={{ display: "flex", flexDirection: "column", gap: 0 }}>
            {result.plan.map((row, i) => (
              <div
                key={row.day}
                style={{
                  padding: "10px 0",
                  borderBottom: i < result.plan.length - 1 ? `1px solid ${C.border}` : "none",
                  display: "flex", gap: 12, alignItems: "flex-start",
                }}
              >
                <span
                  style={{
                    fontSize: 11, fontWeight: 600, color: C.accent,
                    minWidth: 42, flexShrink: 0, paddingTop: 1,
                  }}
                >
                  {row.day}
                </span>
                <div>
                  <p style={{ fontSize: 13, fontWeight: 600, color: C.text, margin: "0 0 2px" }}>
                    {row.topic}
                  </p>
                  <p style={{ fontSize: 12, color: C.muted, margin: 0, lineHeight: 1.5 }}>
                    {row.detail}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Interview Questions */}
      <div
        style={{
          border: `1px solid ${C.border}`, borderRadius: 8,
          backgroundColor: C.card, padding: 24,
        }}
      >
        <FieldLabel>Interview Questions ({result.questions.length})</FieldLabel>
        <ol style={{ margin: 0, paddingLeft: 20 }}>
          {result.questions.map((q, i) => (
            <li key={i} style={{ fontSize: 14, color: C.text, lineHeight: 1.8 }}>
              {q}
            </li>
          ))}
        </ol>
      </div>
    </div>
  );
}

/* ── Shared small helpers ── */
function FieldLabel({ children }: { children: React.ReactNode }) {
  return (
    <p
      style={{
        fontSize: 11, fontWeight: 600, letterSpacing: "0.08em",
        textTransform: "uppercase", color: C.muted, margin: "0 0 10px",
      }}
    >
      {children}
    </p>
  );
}

function inputStyle(): React.CSSProperties {
  return {
    width: "100%",
    padding: "10px 12px",
    fontSize: 14,
    border: `1px solid ${C.border}`,
    borderRadius: 6,
    backgroundColor: C.bg,
    color: C.text,
    fontFamily: "inherit",
    outline: "none",
    boxSizing: "border-box",
    transition: "border-color 150ms ease-in-out",
  };
}

/* ══════════════════════════════════════════════════════
   STEP 4 WORKSPACE — History + Results
══════════════════════════════════════════════════════ */

function Step4Workspace() {
  const [history, setHistory] = useState<AnalysisResult[]>(() =>
    [...loadHistory()].reverse()          // newest first
  );
  const [selected, setSelected] = useState<AnalysisResult | null>(
    () => {
      const hist = loadHistory();
      return hist.length > 0 ? hist[hist.length - 1] : null;
    }
  );

  /* Sync with localStorage whenever we navigate here */
  const refresh = () => {
    const hist = [...loadHistory()].reverse();
    setHistory(hist);
    if (!selected && hist.length > 0) setSelected(hist[0]);
  };

  /* Run once on mount to pick up any new analyses from Step 3 */
  useEffect(() => { refresh(); }, []);

  if (history.length === 0) {
    return (
      <div
        style={{
          border: `1px dashed ${C.border}`,
          borderRadius: 8,
          padding: 64,
          textAlign: "center",
          backgroundColor: C.bg,
        }}
      >
        <p
          style={{
            fontFamily: "Georgia, serif",
            fontSize: 20,
            fontWeight: 700,
            color: C.text,
            margin: "0 0 8px",
          }}
        >
          No analysis yet
        </p>
        <p style={{ fontSize: 14, color: C.muted, margin: 0 }}>
          Paste a JD in Step 3 to begin. Your results will appear here.
        </p>
      </div>
    );
  }

  return (
    <div style={{ display: "flex", gap: 16, alignItems: "flex-start" }}>
      {/* ── Left: History list ── */}
      <div
        style={{
          flex: "0 0 260px",
          display: "flex",
          flexDirection: "column",
          gap: 8,
        }}
      >
        <p
          style={{
            fontSize: 11,
            fontWeight: 600,
            letterSpacing: "0.08em",
            textTransform: "uppercase",
            color: C.muted,
            margin: "0 0 8px",
          }}
        >
          History ({history.length})
        </p>

        {history.map((entry) => {
          const isActive = selected?.id === entry.id;
          return (
            <button
              key={entry.id}
              onClick={() => setSelected(entry)}
              style={{
                width: "100%",
                textAlign: "left",
                padding: "12px 16px",
                border: `1px solid ${isActive ? C.accent : C.border}`,
                borderRadius: 8,
                backgroundColor: isActive ? `${C.accent}08` : C.card,
                cursor: "pointer",
                fontFamily: "inherit",
                transition: "all 150ms ease-in-out",
              }}
            >
              {/* Score badge */}
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 6 }}>
                <span
                  style={{
                    fontSize: 11,
                    fontWeight: 600,
                    color: C.muted,
                    lineHeight: 1,
                  }}
                >
                  {new Date(entry.createdAt).toLocaleDateString("en-IN", {
                    day: "numeric", month: "short", year: "numeric",
                  })}
                </span>
                <span
                  style={{
                    fontSize: 12,
                    fontWeight: 700,
                    color: isActive ? C.accent : C.muted,
                    background: isActive ? `${C.accent}12` : C.mutedBg,
                    border: `1px solid ${isActive ? C.accent + "33" : C.border}`,
                    borderRadius: 12,
                    padding: "2px 8px",
                    lineHeight: 1.4,
                  }}
                >
                  {entry.readinessScore}
                </span>
              </div>

              <p style={{ fontSize: 13, fontWeight: 600, color: isActive ? C.accent : C.text, margin: "0 0 2px" }}>
                {entry.company || "Unnamed Company"}
              </p>
              <p style={{ fontSize: 12, color: C.muted, margin: 0 }}>
                {entry.role || "Role not specified"}
              </p>
            </button>
          );
        })}
      </div>

      {/* ── Right: Result detail ── */}
      <div style={{ flex: 1, minWidth: 0 }}>
        {selected ? (
          <HistoryDetail entry={selected} />
        ) : (
          <div
            style={{
              border: `1px dashed ${C.border}`,
              borderRadius: 8,
              padding: 40,
              textAlign: "center",
              backgroundColor: C.bg,
            }}
          >
            <p style={{ fontSize: 14, color: C.muted, margin: 0 }}>
              Select an entry from the list to view details.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}

/* ── Full result detail panel (Step 5: interactive) ── */
function HistoryDetail({ entry }: { entry: AnalysisResult }) {
  const confKey   = `kodnest_skill_conf_${entry.id}`;
  const allSkills = Object.values(entry.extractedSkills).flat();
  const noSkills  = allSkills.length === 0;

  /* ── Skill confidence map ── */
  const [confMap, setConfMap] = useState<Record<string, "know" | "practice">>(() => {
    try {
      const saved   = localStorage.getItem(confKey);
      const parsed  = saved ? JSON.parse(saved) : {};
      const defaults: Record<string, "know" | "practice"> = {};
      allSkills.forEach((s) => { defaults[s] = parsed[s] ?? "practice"; });
      return defaults;
    } catch {
      const defaults: Record<string, "know" | "practice"> = {};
      allSkills.forEach((s) => { defaults[s] = "practice"; });
      return defaults;
    }
  });

  const [copyLabel, setCopyLabel] = useState("");

  /* ── Reset confMap when entry changes ── */
  useEffect(() => {
    try {
      const saved  = localStorage.getItem(confKey);
      const parsed = saved ? JSON.parse(saved) : {};
      const next: Record<string, "know" | "practice"> = {};
      allSkills.forEach((s) => { next[s] = parsed[s] ?? "practice"; });
      setConfMap(next);
    } catch {
      const next: Record<string, "know" | "practice"> = {};
      allSkills.forEach((s) => { next[s] = "practice"; });
      setConfMap(next);
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [entry.id]);

  /* ── Live score ── */
  const knowCount     = Object.values(confMap).filter((v) => v === "know").length;
  const practiceCount = Object.values(confMap).filter((v) => v === "practice").length;
  const liveScore     = Math.max(0, Math.min(100, entry.readinessScore + knowCount * 2 - practiceCount * 2));

  /* ── Top 3 weak skills ── */
  const weakSkills = allSkills.filter((s) => confMap[s] === "practice").slice(0, 3);

  /* ── Toggle handler ── */
  const toggle = (skill: string) => {
    setConfMap((prev) => {
      const next = { ...prev, [skill]: prev[skill] === "know" ? "practice" : "know" } as Record<string, "know" | "practice">;
      localStorage.setItem(confKey, JSON.stringify(next));
      return next;
    });
  };

  /* ── Export helpers ── */
  const flash = (label: string) => {
    setCopyLabel(label);
    setTimeout(() => setCopyLabel(""), 2000);
  };
  const copyText = (text: string, label: string) => {
    navigator.clipboard.writeText(text).then(() => flash(label)).catch(() => flash("Error"));
  };
  const fmtPlan      = () => entry.plan.map((r) => `${r.day}: ${r.topic}\n  ${r.detail}`).join("\n");
  const fmtChecklist = () =>
    Object.entries(entry.checklist)
      .map(([round, items]) => `${round}:\n${items.map((i) => `  - ${i}`).join("\n")}`)
      .join("\n\n");
  const fmtQuestions = () => entry.questions.map((q, i) => `${i + 1}. ${q}`).join("\n");

  const downloadAll = () => {
    const lines = [
      "KodNest Analysis Export",
      "========================",
      `Company : ${entry.company || "—"}`,
      `Role    : ${entry.role || "—"}`,
      `Date    : ${new Date(entry.createdAt).toLocaleString()}`,
      `Score   : ${liveScore} / 100`,
      "",
      "SKILL CONFIDENCE",
      "----------------",
      ...allSkills.map((s) => `${s}: ${confMap[s] === "know" ? "I Know This" : "Need Practice"}`),
      "",
      "7-DAY PREP PLAN",
      "---------------",
      fmtPlan(),
      "",
      "INTERVIEW CHECKLIST",
      "-------------------",
      fmtChecklist(),
      "",
      "INTERVIEW QUESTIONS",
      "-------------------",
      fmtQuestions(),
    ];
    const blob = new Blob([lines.join("\n")], { type: "text/plain" });
    const url  = URL.createObjectURL(blob);
    const a    = document.createElement("a");
    a.href     = url;
    a.download = `kodnest-${(entry.company || "analysis").replace(/\s+/g, "-")}-${entry.id.slice(0, 6)}.txt`;
    a.click();
    URL.revokeObjectURL(url);
  };

  /* ── Shared mini button style ── */
  const exportBtn = (label: string, onClick: () => void, active = false) => (
    <button
      key={label}
      onClick={onClick}
      style={{
        fontSize: 12,
        fontWeight: 600,
        padding: "6px 14px",
        borderRadius: 6,
        border: `1px solid ${active ? C.accent : C.border}`,
        backgroundColor: active ? `${C.accent}12` : C.card,
        color: active ? C.accent : C.text,
        cursor: "pointer",
        fontFamily: "inherit",
        transition: "all 150ms ease-in-out",
        whiteSpace: "nowrap",
      }}
    >
      {active ? "✓ Copied" : label}
    </button>
  );

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>

      {/* ── Header ── */}
      <div
        style={{
          border: `1px solid ${C.border}`,
          borderRadius: 8,
          backgroundColor: C.card,
          padding: 24,
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
        }}
      >
        <div>
          <p style={{ fontSize: 16, fontWeight: 600, color: C.text, margin: "0 0 4px" }}>
            {entry.company || "Unnamed Company"}
            {entry.role ? ` — ${entry.role}` : ""}
          </p>
          <p style={{ fontSize: 12, color: C.muted, margin: 0 }}>
            {new Date(entry.createdAt).toLocaleString("en-IN", {
              day: "numeric", month: "long", year: "numeric",
              hour: "2-digit", minute: "2-digit",
            })}
          </p>
        </div>
        <div style={{ textAlign: "center" }}>
          <div style={{ fontSize: 32, fontWeight: 700, color: C.accent, fontFamily: "Georgia, serif", lineHeight: 1, transition: "all 150ms ease-in-out" }}>
            {liveScore}
          </div>
          <div style={{ fontSize: 10, color: C.muted, marginTop: 2, letterSpacing: "0.06em", textTransform: "uppercase" }}>
            Live Readiness
          </div>
        </div>
      </div>

      {/* ── Live readiness bar ── */}
      <div
        style={{
          border: `1px solid ${C.border}`,
          borderRadius: 8,
          backgroundColor: C.card,
          padding: "14px 24px",
        }}
      >
        <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 8 }}>
          <span style={{ fontSize: 11, fontWeight: 600, color: C.muted, textTransform: "uppercase", letterSpacing: "0.06em" }}>
            Readiness Score (updates as you mark skills)
          </span>
          <span style={{ fontSize: 11, fontWeight: 600, color: C.accent }}>{liveScore} / 100</span>
        </div>
        <div style={{ height: 6, backgroundColor: C.mutedBg, borderRadius: 3, overflow: "hidden" }}>
          <div
            style={{
              width: `${liveScore}%`,
              height: "100%",
              backgroundColor: C.accent,
              borderRadius: 3,
              transition: "width 150ms ease-in-out",
            }}
          />
        </div>
        {!noSkills && (
          <p style={{ fontSize: 11, color: C.muted, margin: "8px 0 0" }}>
            {knowCount} known · {practiceCount} to practice · base {entry.readinessScore}
          </p>
        )}
      </div>

      {/* ── Export buttons ── */}
      <div
        style={{
          border: `1px solid ${C.border}`,
          borderRadius: 8,
          backgroundColor: C.card,
          padding: "16px 24px",
          display: "flex",
          flexWrap: "wrap",
          gap: 8,
          alignItems: "center",
        }}
      >
        <span style={{ fontSize: 11, fontWeight: 600, color: C.muted, textTransform: "uppercase", letterSpacing: "0.06em", marginRight: 4 }}>
          Export
        </span>
        {exportBtn(
          "Copy 7-Day Plan",
          () => copyText(fmtPlan(), "7-Day Plan"),
          copyLabel === "7-Day Plan",
        )}
        {exportBtn(
          "Copy Checklist",
          () => copyText(fmtChecklist(), "Checklist"),
          copyLabel === "Checklist",
        )}
        {exportBtn(
          "Copy Questions",
          () => copyText(fmtQuestions(), "Questions"),
          copyLabel === "Questions",
        )}
        <button
          onClick={downloadAll}
          style={{
            fontSize: 12,
            fontWeight: 600,
            padding: "6px 14px",
            borderRadius: 6,
            border: `1px solid ${C.accent}`,
            backgroundColor: C.accent,
            color: "#fff",
            cursor: "pointer",
            fontFamily: "inherit",
            transition: "all 150ms ease-in-out",
            whiteSpace: "nowrap",
          }}
        >
          Download All (.txt)
        </button>
      </div>

      {/* ── Extracted Skills with toggles ── */}
      <div style={{ border: `1px solid ${C.border}`, borderRadius: 8, backgroundColor: C.card, padding: 24 }}>
        <FieldLabel>Skill Confidence — toggle each skill</FieldLabel>
        {noSkills ? (
          <p style={{ fontSize: 14, color: C.muted, margin: 0 }}>General fresher stack — no specific technologies detected.</p>
        ) : (
          <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
            {Object.entries(entry.extractedSkills).map(([cat, skills]) => (
              <div key={cat}>
                <p style={{ fontSize: 11, color: C.muted, fontWeight: 600, letterSpacing: "0.06em", textTransform: "uppercase", margin: "0 0 10px" }}>
                  {cat}
                </p>
                <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
                  {skills.map((s) => {
                    const isKnow = confMap[s] === "know";
                    return (
                      <button
                        key={s}
                        onClick={() => toggle(s)}
                        title={isKnow ? "Click to mark as Need Practice" : "Click to mark as I Know This"}
                        style={{
                          display: "flex",
                          alignItems: "center",
                          gap: 6,
                          fontSize: 12,
                          fontWeight: 500,
                          padding: "5px 12px",
                          borderRadius: 20,
                          border: `1px solid ${isKnow ? C.successBorder : C.accent + "33"}`,
                          backgroundColor: isKnow ? C.successBg : `${C.accent}0d`,
                          color: isKnow ? C.successText : C.accent,
                          cursor: "pointer",
                          fontFamily: "inherit",
                          transition: "all 150ms ease-in-out",
                        }}
                      >
                        <span style={{ fontSize: 10, lineHeight: 1 }}>{isKnow ? "✓" : "○"}</span>
                        {s}
                        <span style={{ fontSize: 10, color: isKnow ? C.successText : C.muted, lineHeight: 1 }}>
                          {isKnow ? "Know" : "Practice"}
                        </span>
                      </button>
                    );
                  })}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* ── Checklist + Plan — 2 col ── */}
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }}>
        <div style={{ border: `1px solid ${C.border}`, borderRadius: 8, backgroundColor: C.card, padding: 24 }}>
          <FieldLabel>Interview Checklist</FieldLabel>
          <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
            {Object.entries(entry.checklist).map(([round, items]) => (
              <div key={round}>
                <p style={{ fontSize: 12, fontWeight: 600, color: C.text, margin: "0 0 6px" }}>{round}</p>
                <ul style={{ margin: 0, paddingLeft: 18 }}>
                  {items.map((item) => (
                    <li key={item} style={{ fontSize: 12, color: C.muted, lineHeight: 1.8 }}>{item}</li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </div>

        <div style={{ border: `1px solid ${C.border}`, borderRadius: 8, backgroundColor: C.card, padding: 24 }}>
          <FieldLabel>7-Day Prep Plan</FieldLabel>
          <div style={{ display: "flex", flexDirection: "column" }}>
            {entry.plan.map((row, i) => (
              <div
                key={row.day}
                style={{
                  padding: "10px 0",
                  borderBottom: i < entry.plan.length - 1 ? `1px solid ${C.border}` : "none",
                  display: "flex",
                  gap: 12,
                }}
              >
                <span style={{ fontSize: 11, fontWeight: 600, color: C.accent, minWidth: 42, flexShrink: 0, paddingTop: 1 }}>
                  {row.day}
                </span>
                <div>
                  <p style={{ fontSize: 12, fontWeight: 600, color: C.text, margin: "0 0 2px" }}>{row.topic}</p>
                  <p style={{ fontSize: 11, color: C.muted, margin: 0, lineHeight: 1.5 }}>{row.detail}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* ── Interview Questions ── */}
      <div style={{ border: `1px solid ${C.border}`, borderRadius: 8, backgroundColor: C.card, padding: 24 }}>
        <FieldLabel>Interview Questions ({entry.questions.length})</FieldLabel>
        <ol style={{ margin: 0, paddingLeft: 20 }}>
          {entry.questions.map((q, i) => (
            <li key={i} style={{ fontSize: 14, color: C.text, lineHeight: 1.8 }}>{q}</li>
          ))}
        </ol>
      </div>

      {/* ── Action Suggestion ── */}
      {weakSkills.length > 0 && (
        <div
          style={{
            border: `1px solid ${C.warningBorder}`,
            borderRadius: 8,
            backgroundColor: C.warningBg,
            padding: 24,
          }}
        >
          <p
            style={{
              fontSize: 11,
              fontWeight: 600,
              letterSpacing: "0.08em",
              textTransform: "uppercase",
              color: C.warningText,
              margin: "0 0 10px",
            }}
          >
            Focus Areas — Top Skills to Practice
          </p>
          <div style={{ display: "flex", flexWrap: "wrap", gap: 8, marginBottom: 16 }}>
            {weakSkills.map((s) => (
              <span
                key={s}
                style={{
                  fontSize: 12,
                  fontWeight: 600,
                  padding: "4px 12px",
                  borderRadius: 20,
                  border: `1px solid ${C.warningBorder}`,
                  backgroundColor: `${C.warningText}12`,
                  color: C.warningText,
                }}
              >
                {s}
              </span>
            ))}
          </div>
          <button
            onClick={() => copyText(fmtPlan(), "7-Day Plan")}
            style={{
              fontSize: 13,
              fontWeight: 600,
              padding: "8px 20px",
              borderRadius: 6,
              border: `1px solid ${C.warningBorder}`,
              backgroundColor: C.warningText,
              color: "#fff",
              cursor: "pointer",
              fontFamily: "inherit",
              transition: "all 150ms ease-in-out",
            }}
          >
            {copyLabel === "7-Day Plan" ? "✓ Plan Copied!" : "Start Day 1 Plan Now →"}
          </button>
        </div>
      )}
    </div>
  );
}

/* ══════════════════════════════════════════════════════
   GENERIC WORKSPACE CARDS (steps 5–7)
══════════════════════════════════════════════════════ */
function WorkspaceCards({ stepNumber }: { stepNumber: number }) {
  const [output, setOutput] = useState("");
  const [notes, setNotes] = useState("");

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 24 }}>
      {/* What to Build */}
      <Card title="What to Build">
        <p
          style={{
            fontSize: 15,
            color: C.muted,
            lineHeight: 1.7,
            margin: 0,
            maxWidth: 600,
          }}
        >
          Use the prompt in the right panel. Paste the output from your AI tool
          in the field below. When you're satisfied, click "It Worked" to
          advance to the next step.
        </p>
      </Card>

      {/* Output */}
      <Card title={`Your Output — Step ${stepNumber}`}>
        <p style={{ fontSize: 14, color: C.muted, margin: "0 0 12px" }}>
          Paste the result from your AI tool here.
        </p>
        <textarea
          value={output}
          onChange={(e) => setOutput(e.target.value)}
          placeholder="Paste your output here…"
          rows={7}
          style={{
            width: "100%",
            resize: "vertical",
            fontSize: 14,
            lineHeight: 1.65,
            padding: "12px 14px",
            border: `1px solid ${C.border}`,
            borderRadius: 6,
            backgroundColor: C.bg,
            color: C.text,
            fontFamily: "inherit",
            outline: "none",
            boxSizing: "border-box",
          }}
          onFocus={(e) => (e.target.style.borderColor = C.accent)}
          onBlur={(e) => (e.target.style.borderColor = C.border)}
        />
        {output.length > 0 && (
          <p style={{ fontSize: 12, color: C.muted, marginTop: 6, textAlign: "right" }}>
            {output.length} chars
          </p>
        )}
      </Card>

      {/* Notes */}
      <Card title="Notes">
        <textarea
          value={notes}
          onChange={(e) => setNotes(e.target.value)}
          placeholder="Blockers, decisions, things to revisit…"
          rows={3}
          style={{
            width: "100%",
            resize: "vertical",
            fontSize: 14,
            lineHeight: 1.65,
            padding: "12px 14px",
            border: `1px solid ${C.border}`,
            borderRadius: 6,
            backgroundColor: C.bg,
            color: C.text,
            fontFamily: "inherit",
            outline: "none",
            boxSizing: "border-box",
          }}
          onFocus={(e) => (e.target.style.borderColor = C.accent)}
          onBlur={(e) => (e.target.style.borderColor = C.border)}
        />
      </Card>
    </div>
  );
}

function Card({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) {
  return (
    <div
      style={{
        border: `1px solid ${C.border}`,
        borderRadius: 8,
        backgroundColor: C.card,
        padding: 24,
      }}
    >
      <p
        style={{
          fontSize: 11,
          fontWeight: 600,
          letterSpacing: "0.08em",
          textTransform: "uppercase",
          color: C.muted,
          margin: "0 0 14px",
        }}
      >
        {title}
      </p>
      {children}
    </div>
  );
}

/* ══════════════════════════════════════════════════════
   SECONDARY PANEL
══════════════════════════════════════════════════════ */
function SecondaryPanel({
  stepExplanation,
  prompt,
  onItWorked,
  onError,
}: {
  stepExplanation: string;
  prompt: string;
  onItWorked: () => void;
  onError: () => void;
}) {
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
      if (file) setScreenshot(URL.createObjectURL(file));
    };
    input.click();
  };

  return (
    <aside
      style={{
        flex: "0 0 30%",
        overflowY: "auto",
        padding: "32px 24px",
        backgroundColor: C.card,
        display: "flex",
        flexDirection: "column",
        gap: 24,
      }}
    >
      {/* Step explanation */}
      <div>
        <Label>This Step</Label>
        <p style={{ fontSize: 14, color: C.muted, lineHeight: 1.65, margin: 0 }}>
          {stepExplanation}
        </p>
      </div>

      {/* Prompt box */}
      <div>
        <Label>Prompt</Label>
        <textarea
          readOnly
          value={prompt}
          rows={6}
          style={{
            width: "100%",
            resize: "none",
            fontFamily: "Menlo, Monaco, monospace",
            fontSize: 12,
            lineHeight: 1.6,
            padding: "12px 14px",
            border: `1px solid ${C.border}`,
            borderRadius: 6,
            backgroundColor: C.bg,
            color: C.text,
            boxSizing: "border-box",
            outline: "none",
          }}
        />
      </div>

      {/* Action buttons */}
      <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
        <Label>Actions</Label>

        <PanelButton onClick={handleCopy} variant="outline">
          {copied ? "Copied!" : "Copy Prompt"}
        </PanelButton>

        <PanelButton
          onClick={() => window.open("https://lovable.dev", "_blank")}
          variant="primary"
        >
          Build in Lovable
        </PanelButton>

        <PanelButton onClick={onItWorked} variant="success">
          It Worked
        </PanelButton>

        <PanelButton onClick={onError} variant="warning">
          Error
        </PanelButton>

        <PanelButton onClick={handleScreenshot} variant="outline">
          Add Screenshot
        </PanelButton>
      </div>

      {/* Screenshot preview */}
      {screenshot && (
        <div
          style={{
            border: `1px solid ${C.border}`,
            borderRadius: 6,
            overflow: "hidden",
          }}
        >
          <img src={screenshot} alt="Screenshot" style={{ width: "100%", display: "block" }} />
        </div>
      )}
    </aside>
  );
}

function Label({ children }: { children: React.ReactNode }) {
  return (
    <p
      style={{
        fontSize: 11,
        fontWeight: 600,
        letterSpacing: "0.08em",
        textTransform: "uppercase",
        color: C.muted,
        margin: "0 0 10px",
      }}
    >
      {children}
    </p>
  );
}

type BtnVariant = "primary" | "outline" | "success" | "warning";

function PanelButton({
  children,
  onClick,
  variant,
}: {
  children: React.ReactNode;
  onClick: () => void;
  variant: BtnVariant;
}) {
  const styles: Record<BtnVariant, React.CSSProperties> = {
    primary: {
      backgroundColor: C.accent,
      color: "#FFFFFF",
      border: `1px solid ${C.accent}`,
    },
    outline: {
      backgroundColor: "transparent",
      color: C.text,
      border: `1px solid ${C.border}`,
    },
    success: {
      backgroundColor: C.successBg,
      color: C.successText,
      border: `1px solid ${C.successBorder}`,
    },
    warning: {
      backgroundColor: C.warningBg,
      color: C.warningText,
      border: `1px solid ${C.warningBorder}`,
    },
  };

  return (
    <button
      onClick={onClick}
      style={{
        width: "100%",
        padding: "10px 16px",
        borderRadius: 6,
        fontSize: 14,
        fontWeight: 500,
        fontFamily: "inherit",
        textAlign: "left",
        cursor: "pointer",
        transition: "opacity 150ms ease-in-out",
        ...styles[variant],
      }}
      onMouseEnter={(e) => (e.currentTarget.style.opacity = "0.85")}
      onMouseLeave={(e) => (e.currentTarget.style.opacity = "1")}
    >
      {children}
    </button>
  );
}

/* ══════════════════════════════════════════════════════
   PROOF FOOTER
══════════════════════════════════════════════════════ */
const CHECKLIST = [
  { id: "ui", label: "UI Built" },
  { id: "logic", label: "Logic Working" },
  { id: "test", label: "Test Passed" },
  { id: "deployed", label: "Deployed" },
];

function ProofFooter() {
  const [checked, setChecked] = useState<Record<string, boolean>>({});

  const toggle = (id: string) => {
    setChecked((prev) => ({ ...prev, [id]: !prev[id] }));
  };

  const doneCount = Object.values(checked).filter(Boolean).length;
  const total = CHECKLIST.length;

  return (
    <footer
      style={{
        flexShrink: 0,
        borderTop: `1px solid ${C.border}`,
        backgroundColor: C.card,
        padding: "16px 40px",
        display: "flex",
        alignItems: "center",
        gap: 40,
      }}
    >
      {/* Label */}
      <p
        style={{
          fontSize: 11,
          fontWeight: 600,
          letterSpacing: "0.08em",
          textTransform: "uppercase",
          color: C.muted,
          margin: 0,
          flexShrink: 0,
        }}
      >
        Proof Checklist
      </p>

      {/* Checklist items */}
      <div style={{ display: "flex", gap: 24, flex: 1 }}>
        {CHECKLIST.map((item) => {
          const isChecked = !!checked[item.id];
          return (
            <button
              key={item.id}
              onClick={() => toggle(item.id)}
              style={{
                display: "flex",
                alignItems: "center",
                gap: 8,
                background: "none",
                border: "none",
                cursor: "pointer",
                padding: 0,
                fontFamily: "inherit",
              }}
            >
              {/* Checkbox */}
              <span
                style={{
                  width: 18,
                  height: 18,
                  borderRadius: 4,
                  border: `1.5px solid ${isChecked ? C.accent : C.border}`,
                  backgroundColor: isChecked ? C.accent : "transparent",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  flexShrink: 0,
                  transition: "all 150ms ease-in-out",
                }}
              >
                {isChecked && (
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

              {/* Label */}
              <span
                style={{
                  fontSize: 14,
                  color: isChecked ? C.accent : C.muted,
                  fontWeight: isChecked ? 500 : 400,
                  textDecoration: isChecked ? "line-through" : "none",
                  textDecorationColor: C.accent + "66",
                  transition: "all 150ms ease-in-out",
                }}
              >
                {item.label}
              </span>
            </button>
          );
        })}
      </div>

      {/* Progress pill */}
      <span
        style={{
          fontSize: 12,
          fontWeight: 500,
          padding: "4px 12px",
          borderRadius: 20,
          backgroundColor: doneCount === total ? C.successBg : C.mutedBg,
          color: doneCount === total ? C.successText : C.muted,
          border: `1px solid ${doneCount === total ? C.successBorder : C.border}`,
          flexShrink: 0,
        }}
      >
        {doneCount} / {total} done
      </span>
    </footer>
  );
}
