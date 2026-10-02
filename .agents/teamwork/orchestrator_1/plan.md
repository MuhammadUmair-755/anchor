# Orchestration Plan: ANCHOR Life Command Center

## Objectives
Implement and verify the full ANCHOR Life Command Center in Next.js/React per `ORIGINAL_REQUEST.md`, matching the Stitch design project `196342399105692014`.

## Milestones Roadmap

### Phase 0: Survey & Discovery (Active)
- Spawn 3 Explorers in parallel:
  1. **Explorer 1 (Codebase & Mandatory Docs)**: Reads `/docs/RULES.md`, `/docs/DECISIONS.md`, `/docs/PROGRESS.md`, `/docs/CONTEXT.md`, package.json, directory structure, existing layouts/components, theme, MUI setup, Supabase/Clerk setup.
  2. **Explorer 2 (Stitch Design Extraction)**: Inspects Stitch screens via Stitch MCP for project `196342399105692014` (Desktop Overview: `4ecf9343b97b4be38623773ccd440388`, Mobile Overview: `5bc44953af514701bbf80fde4228033e`, Desktop Finance: `280651f0fb354645b93b898c13eeeff4`, Mobile Finance: `1a983f2d68c5459ba5da6af1493ef2e7`), extracts styling tokens, layout structures, content strings, and UI elements.
  3. **Explorer 3 (Architecture, Types & Service Contracts)**: Determines data contracts, mock datasets/services in `src/services/` and `src/types/`, component hierarchy, and integration points for MUI.
- Synthesize findings into `PROJECT.md` at `E:\anchor\.agents\teamwork\PROJECT.md`.

### Phase 1: Milestone 1 - Dashboard Command Center Module (Overview)
- Direct iteration loop:
  - Explorer -> Worker -> Reviewers (2) -> Challengers (2) -> Forensic Auditor.
  - Implement Desktop & Mobile Overview dashboard (`/` or relevant route).
  - Verify MUI component priority, responsive behavior (390px, 768px, 1280px+), zero `any`, and interactive state.

### Phase 2: Milestone 2 - Finance & Accounts Command Center Module
- Direct iteration loop:
  - Explorer -> Worker -> Reviewers (2) -> Challengers (2) -> Forensic Auditor.
  - Implement Desktop & Mobile Finance view (`/finance`).
  - Verify ledger, accounts ribbon, quick entry form, recurring obligations, velocity metrics.

### Phase 3: Milestone 3 - E2E Verification, Visual Polish, & Living Docs Sync
- Verify all acceptance criteria.
- Update `/docs/PROGRESS.md`, `/docs/CONTEXT.md`, and `/docs/DECISIONS.md`.
- Final audit and handoff report back to Sentinel.

## Constraints & Guardrails
- DISPATCH ONLY: Orchestrator writes NO source code.
- NEVER run `npm run build` or heavy commands without explicit user permission.
- Prioritize MUI components wherever possible.
- Zero TypeScript `any`.
- Strict gate criteria (Reviewers APPROVE, Challengers APPROVE, Auditor CLEAN).
