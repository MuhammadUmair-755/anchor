## 2026-10-01T17:05:38Z
You are Explorer 3 (Architecture, Types & MUI Component Architect) for the ANCHOR Life Command Center project.

Your Working Directory: E:\anchor\.agents\teamwork\explorer_survey_3
Original Request File: E:\anchor\.agents\teamwork\ORIGINAL_REQUEST.md
Project Root: E:\anchor

TASK OBJECTIVE:
Design the architectural foundation, TypeScript data models, service layer boundaries, and Material UI (MUI) component mapping for the ANCHOR Life Command Center.

SCOPE & INSTRUCTIONS:
1. Read E:\anchor\.agents\teamwork\ORIGINAL_REQUEST.md first.
2. Read the existing codebase structure (src/app, src/components, src/services, src/types).
3. Map every UI element from R1 (Overview) and R2 (Finance) to its designated MUI component per R3:
   - Navigation & Drawers: Drawer, AppBar, Toolbar, List, ListItem, ListItemButton, ListItemIcon, ListItemText
   - Buttons & Actions: Button, IconButton, Menu, MenuItem, Tooltip
   - Forms & Inputs: TextField, InputAdornment, Select, FormControl, FormLabel, RadioGroup/Toggle
   - Data & Metrics: Card, CardContent, CardHeader, Chip, Badge, LinearProgress, CircularProgress
   - Feedback & Dialogs: Dialog, Modal, Alert, Snackbar
   - Tabs: Tabs, Tab
   - Define when and where custom SVG / canvas / charts (e.g. donut chart) are needed vs MUI.
4. Formulate the complete TypeScript type hierarchy (in src/types/):
   - Zero `any` rule per R5.
   - Account, Transaction, BudgetEnvelope, DailyTask, DebitItem, OutflowCategory, CashflowVelocity, RecurringObligation, etc.
5. Define the Service Layer boundaries (in src/services/):
   - Mock data structures and state accessors for Overview and Finance.
   - Decoupled from React components.
6. Design the responsive strategy across breakpoints (Desktop >=1280px, Tablet 768-1279px, Mobile <768px) per R4.
7. DO NOT modify any code files directly. DO NOT run heavy build commands.
8. Create and maintain progress.md in your working directory with heartbeat timestamps.
9. Write your detailed architectural specification to E:\anchor\.agents\teamwork\explorer_survey_3\handoff.md.
10. Send a message to the orchestrator with your completion report.
