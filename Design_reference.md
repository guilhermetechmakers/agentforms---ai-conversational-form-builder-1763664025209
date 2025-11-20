# Modern Design Best Practices

## Philosophy

Create unique, memorable experiences while maintaining consistency through modern design principles. Every project should feel distinct yet professional, innovative yet intuitive.

---

## Landing Pages & Marketing Sites

### Hero Sections
**Go beyond static backgrounds:**
- Animated gradients with subtle movement
- Particle systems or geometric shapes floating
- Interactive canvas backgrounds (Three.js, WebGL)
- Video backgrounds with proper fallbacks
- Parallax scrolling effects
- Gradient mesh animations
- Morphing blob animations


### Layout Patterns
**Use modern grid systems:**
- Bento grids (asymmetric card layouts)
- Masonry layouts for varied content
- Feature sections with diagonal cuts or curves
- Overlapping elements with proper z-index
- Split-screen designs with scroll-triggered reveals

**Avoid:** Traditional 3-column equal grids

### Scroll Animations
**Engage users as they scroll:**
- Fade-in and slide-up animations for sections
- Scroll-triggered parallax effects
- Progress indicators for long pages
- Sticky elements that transform on scroll
- Horizontal scroll sections for portfolios
- Text reveal animations (word by word, letter by letter)
- Number counters animating into view

**Avoid:** Static pages with no scroll interaction

### Call-to-Action Areas
**Make CTAs impossible to miss:**
- Gradient buttons with hover effects
- Floating action buttons with micro-interactions
- Animated borders or glowing effects
- Scale/lift on hover
- Interactive elements that respond to mouse position
- Pulsing indicators for primary actions

---

## Dashboard Applications

### Layout Structure
**Always use collapsible side navigation:**
- Sidebar that can collapse to icons only
- Smooth transition animations between states
- Persistent navigation state (remember user preference)
- Mobile: drawer that slides in/out
- Desktop: sidebar with expand/collapse toggle
- Icons visible even when collapsed

**Structure:**
```
/dashboard (layout wrapper with sidebar)
  /dashboard/overview
  /dashboard/analytics
  /dashboard/settings
  /dashboard/users
  /dashboard/projects
```

All dashboard pages should be nested inside the dashboard layout, not separate routes.

### Data Tables
**Modern table design:**
- Sticky headers on scroll
- Row hover states with subtle elevation
- Sortable columns with clear indicators
- Pagination with items-per-page control
- Search/filter with instant feedback
- Selection checkboxes with bulk actions
- Responsive: cards on mobile, table on desktop
- Loading skeletons, not spinners
- Empty states with illustrations or helpful text

**Use modern table libraries:**
- TanStack Table (React Table v8)
- AG Grid for complex data
- Data Grid from MUI (if using MUI)

### Charts & Visualizations
**Use the latest charting libraries:**
- Recharts (for React, simple charts)
- Chart.js v4 (versatile, well-maintained)
- Apache ECharts (advanced, interactive)
- D3.js (custom, complex visualizations)
- Tremor (for dashboards, built on Recharts)

**Chart best practices:**
- Animated transitions when data changes
- Interactive tooltips with detailed info
- Responsive sizing
- Color scheme matching design system
- Legend placement that doesn't obstruct data
- Loading states while fetching data

### Dashboard Cards
**Metric cards should stand out:**
- Gradient backgrounds or colored accents
- Trend indicators (↑ ↓ with color coding)
- Sparkline charts for historical data
- Hover effects revealing more detail
- Icon representing the metric
- Comparison to previous period

---

## Color & Visual Design

### Color Palettes
**Create depth with gradients:**
- Primary gradient (not just solid primary color)
- Subtle background gradients
- Gradient text for headings
- Gradient borders on cards
- Elevated surfaces for depth

**Color usage:**
- 60-30-10 rule (dominant, secondary, accent)
- Consistent semantic colors (success, warning, error)
- Accessible contrast ratios (WCAG AA minimum)

### Typography
**Create hierarchy through contrast:**
- Large, bold headings (48-72px for heroes)
- Clear size differences between levels
- Variable font weights (300, 400, 600, 700)
- Letter spacing for small caps
- Line height 1.5-1.7 for body text
- Inter, Poppins, or DM Sans for modern feel

### Shadows & Depth
**Layer UI elements:**
- Multi-layer shadows for realistic depth
- Colored shadows matching element color
- Elevated states on hover
- Neumorphism for special elements (sparingly)

---

## Interactions & Micro-animations

### Button Interactions
**Every button should react:**
- Scale slightly on hover (1.02-1.05)
- Lift with shadow on hover
- Ripple effect on click
- Loading state with spinner or progress
- Disabled state clearly visible
- Success state with checkmark animation

### Card Interactions
**Make cards feel alive:**
- Lift on hover with increased shadow
- Subtle border glow on hover
- Tilt effect following mouse (3D transform)
- Smooth transitions (200-300ms)
- Click feedback for interactive cards

### Form Interactions
**Guide users through forms:**
- Input focus states with border color change
- Floating labels that animate up
- Real-time validation with inline messages
- Success checkmarks for valid inputs
- Error states with shake animation
- Password strength indicators
- Character count for text areas

### Page Transitions
**Smooth between views:**
- Fade + slide for page changes
- Skeleton loaders during data fetch
- Optimistic UI updates
- Stagger animations for lists
- Route transition animations

---

## Mobile Responsiveness

### Mobile-First Approach
**Design for mobile, enhance for desktop:**
- Touch targets minimum 44x44px
- Generous padding and spacing
- Sticky bottom navigation on mobile
- Collapsible sections for long content
- Swipeable cards and galleries
- Pull-to-refresh where appropriate

### Responsive Patterns
**Adapt layouts intelligently:**
- Hamburger menu → full nav bar
- Card grid → stack on mobile
- Sidebar → drawer
- Multi-column → single column
- Data tables → card list
- Hide/show elements based on viewport

---

## Loading & Empty States

### Loading States
**Never leave users wondering:**
- Skeleton screens matching content layout
- Progress bars for known durations
- Animated placeholders
- Spinners only for short waits (<3s)
- Stagger loading for multiple elements
- Shimmer effects on skeletons

### Empty States
**Make empty states helpful:**
- Illustrations or icons
- Helpful copy explaining why it's empty
- Clear CTA to add first item
- Examples or suggestions
- No "no data" text alone

---

## Unique Elements to Stand Out

### Distinctive Features
**Add personality:**
- Custom cursor effects on landing pages
- Animated page numbers or section indicators
- Unusual hover effects (magnification, distortion)
- Custom scrollbars
- Glassmorphism for overlays
- Animated SVG icons
- Typewriter effects for hero text
- Confetti or celebration animations for actions

### Interactive Elements
**Engage users:**
- Drag-and-drop interfaces
- Sliders and range controls
- Toggle switches with animations
- Progress steps with animations
- Expandable/collapsible sections
- Tabs with slide indicators
- Image comparison sliders
- Interactive demos or playgrounds

---

## Consistency Rules

### Maintain Consistency
**What should stay consistent:**
- Spacing scale (4px, 8px, 16px, 24px, 32px, 48px, 64px)
- Border radius values
- Animation timing (200ms, 300ms, 500ms)
- Color system (primary, secondary, accent, neutrals)
- Typography scale
- Icon style (outline vs filled)
- Button styles across the app
- Form element styles

### What Can Vary
**Project-specific customization:**
- Color palette (different colors, same system)
- Layout creativity (grids, asymmetry)
- Illustration style
- Animation personality
- Feature-specific interactions
- Hero section design
- Card styling variations
- Background patterns or textures

---

## Technical Excellence

### Performance
- Optimize images (WebP, lazy loading)
- Code splitting for faster loads
- Debounce search inputs
- Virtualize long lists
- Minimize re-renders
- Use proper memoization

### Accessibility
- Keyboard navigation throughout
- ARIA labels where needed
- Focus indicators visible
- Screen reader friendly
- Sufficient color contrast
- Respect reduced motion preferences

---

## Key Principles

1. **Be Bold** - Don't be afraid to try unique layouts and interactions
2. **Be Consistent** - Use the same patterns for similar functions
3. **Be Responsive** - Design works beautifully on all devices
4. **Be Fast** - Animations are smooth, loading is quick
5. **Be Accessible** - Everyone can use what you build
6. **Be Modern** - Use current design trends and technologies
7. **Be Unique** - Each project should have its own personality
8. **Be Intuitive** - Users shouldn't need instructions


---

# Project-Specific Customizations

**IMPORTANT: This section contains the specific design requirements for THIS project. The guidelines above are universal best practices - these customizations below take precedence for project-specific decisions.**

## User Design Requirements

# AgentForms — Development Blueprint

AgentForms is an AI Conversational Form Builder that lets creators define “agents” (schema, persona, knowledge, visuals) and publish shareable public chat links. Visitors open a link, start a session where an LLM-driven agent collects structured answers conversationally; all messages, extracted fields, and metadata are stored and viewable in an admin dashboard. The platform supports knowledge injection, webhooks, analytics, access controls, and billing.

## 1. Pages (UI Screens)

- Login / Signup (Unified Auth)
  - Purpose: Authenticate users and onboard new accounts.
  - Key sections/components:
    - Toggle Login / Signup, Email/password form with inline validation, Social OAuth buttons (Google, Microsoft), Remember me checkbox, Terms link, Forgot password link, Submit CTA, Error toasts.

- Email Verification
  - Purpose: Prompt and manage email verification post-signup.
  - Key sections/components:
    - Verification instructions, resend verification button with cooldown, check verification status button, support contact link, progress guidance.

- Password Reset
  - Purpose: Request and perform password resets.
  - Key sections/components:
    - Request form (email input), Tokenized reset form (new password, confirm, strength meter), Submit success confirmation and link to login.

- Dashboard (Agent List)
  - Purpose: Primary workspace listing creators’ agents and quick actions.
  - Key sections/components:
    - Top nav: logo, search, user avatar menu, Create Agent button.
    - Quick stats bar: total agents, active sessions today, leads collected.
    - Agent list: cards/table with agent name, status, public URL, session count, last activity, primary color preview, quick actions (Edit, Open Link, Sessions, Duplicate, Delete).
    - Filters (status, tag, date), pagination/infinite scroll, Empty state CTA.

- Create / Edit Agent (Multi-tab Editor)
  - Purpose: Build and configure agents.
  - Key sections/components:
    - Agent header: name, status toggle, save/publish buttons, autosave indicator, version history link.
    - Tabs: Schema, Persona, Knowledge, Appearance, Advanced.
      - Schema builder: field list, add field modal (label, key, type, required, validation, placeholder), drag-and-drop ordering.
      - Persona: persona/system prompt, tone presets, sample messages, conversation constraints, fallback policy.
      - Knowledge: paste/upload docs, chunking/embedding toggle, indexing status.
      - Appearance: color picker, avatar/logo upload, welcome message (rich text), theme preview.
      - Advanced: publish settings (slug, custom domain, password/CAPTCHA), webhook config, session retention.
    - Publish flow & validation.

- Agent Public Chat (Session Start / Chat Interface)
  - Purpose: Public session chat UI where agent converses and collects data.
  - Key sections/components:
    - Full-screen header: avatar, agent name, info icon, share button.
    - Chat area: message list, typing indicator, system messages, question bubbles.
    - Input controls: free text input, quick replies for selects, file upload, date picker, phone/email recognition.
    - Progress/status bar: collected vs required fields.
    - Footer: privacy notice, link to agent privacy & terms, report abuse button.

- Session Inspector (Conversation View)
  - Purpose: Inspect a single session’s transcript, captured data, and webhook history.
  - Key sections/components:
    - Session header: id, created at, status, public read-only link, export buttons.
    - Transcript pane: chronological messages with role labels, timestamps, metadata (model, tokens), per-message download.
    - Captured Data panel: schema fields, values, validation flags, inline edit capability.
    - Webhook log: attempts, payloads, response status, retry controls.
    - Actions: mark reviewed, forward webhook, export JSON/CSV, delete session.

- Agent Sessions List
  - Purpose: Listing and bulk ops for sessions per agent.
  - Key sections/components:
    - Filter bar: date range, status, search by respondent id/email.
    - Sessions table: id, started at, duration, collected fields count, score, actions (Inspect, Export, Delete).
    - Bulk actions: select, bulk export, bulk delete, bulk webhook resend, pagination/CSV export.

- Settings & Preferences
  - Purpose: Manage account, workspace, security, API keys, billing.
  - Key sections/components:
    - Account: name, email, password change, 2FA toggle, profile.
    - Workspace: name, default agent settings, retention policy.
    - Team & Roles: invite members, role assignments, SSO/SCIM.
    - Billing: plan, usage meter, payment method, invoices.
    - Integrations: Webhooks list, API keys, connected apps.
    - Security: session history, revoke sessions, allowed IPs.

- About & Help (Docs)
  - Purpose: Documentation, FAQs, developer resources.
  - Key sections/components:
    - Searchable docs, categories (Getting Started, Agent Builder, Webhooks/API, Billing, Security), tutorials, FAQ, contact support link, in-app chat widget.

- Admin Dashboard (Workspace Admin)
  - Purpose: Administer workspace, users, and system analytics.
  - Key sections/components:
    - User management: table of users, roles, invite/deactivate.
    - Usage analytics: sessions/day, tokens used, webhook success rate.
    - System alerts, audit logs, billing overview.

- Legal & Compliance Pages
  - Purpose: Provide legal documentation and consent flows.
  - Key sections/components:
    - Privacy, Terms, DPA, Cookie Policy with versioning and effective dates, DPA download, cookie banner component.

- 404 / Error / Maintenance Pages
  - Purpose: Friendly error handling and status pages.
  - Key sections/components:
    - 404 with search and link to landing/dashboard, 500 error with retry/support, maintenance page with ETA/contact.

- Landing Page (Marketing)
  - Purpose: Market product, onboarding CTAs, demo agent.
  - Key sections/components:
    - Hero, demo agent CTA, features grid, pricing teaser, customer logos/testimonials, footer links.

## 2. Features

- User Authentication & Security
  - Technical details:
    - Auth: JWT access + refresh tokens; store refresh token in secure httpOnly cookie; access token short-lived in memory.
    - OAuth2 for Google & Microsoft; standard OIDC flows.
    - Passwords hashed with Argon2 or bcrypt (configurable).
    - Email verification tokens (time-limited), password reset tokens (single-use, time-limited).
    - Optional TOTP 2FA (RFC6238) with backup codes.
    - Session management: device listing, revoke, logout everywhere.
  - Implementation notes:
    - Rate-limit auth endpoints; monitor failed attempts; require email verified for agent publishing.

- Agent Builder & Schema Management
  - Technical details:
    - Agents: CRUD APIs, versioning for configs.
    - Schema fields persisted as ordered lists; support types: text, number, email, select, date, phone, textarea, file.
    - Server-side validation rules and sanitization.
    - Drag-and-drop order persisted; autosave + change history.
  - Implementation notes:
    - Expose preview mode that simulates conversation.
    - Provide validation preview and schema export/import (JSON).

- LLM Orchestration & Conversation Engine
  - Technical details:
    - Orchestrator composes: system prompt (persona) + retrieved knowledge chunks + session conversation.
    - Deterministic next-question selection: server-side logic picks next required field; LLM asked to phrase the question respecting persona and validation.
    - Streaming responses via WebSocket or SSE (WebSocket recommended for real-time typing).
    - Token usage tracking per request and per agent.
    - Safety: system prompt constraints, RAG for knowledge citations, limit of free-text generation for fields with strict validation.
  - Implementation notes:
    - Implement fallback flows: if parse fails, agent asks clarifying questions and stores raw answer.
    - Configurable model per agent; default to cost-effective model with override.

- Knowledge Ingestion & Retrieval
  - Technical details:
    - Ingestion pipeline: extract text from PDFs/MD/TXT, chunk (e.g., 500–1000 tokens), embed via LLM provider, store in vector DB with metadata (agent_id, source, chunk_index).
    - Retrieval API returns top-k relevant chunks with similarity score.
    - Reindexing endpoints and delete-by-agent capabilities.
  - Implementation notes:
    - Display indexing status and errors in UI; allow users to preview matched chunks.

- Session Management & Data Storage
  - Technical details:
    - Postgres for relational data (agents, sessions metadata, schema-state).
    - Append-only messages table containing role, content, timestamp, model, token usage.
    - Attachments stored in S3; DB stores signed URL references and object keys.
    - Session state table maps schema keys to collected values and validation flags.
    - Retention policies enforced by background scheduled jobs (archival/deletion).
  - Implementation notes:
    - Provide export endpoints (CSV/JSON) and bulk export jobs queued via job system.

- Webhook & External Delivery
  - Technical details:
    - Config per agent: URL, method, headers, auth, triggers (on-complete, per-message).
    - Delivery queue with retry/backoff and dead-letter queue (DLQ).
    - HMAC signing of payloads and timestamp header.
    - Store delivery logs with request/response and status.
  - Implementation notes:
    - Provide test webhook UI and manual retry controls in Session Inspector.

- Public Link & Access Controls
  - Technical details:
    - Public routes by slug; optional password protection stored hashed; optional CAPTCHA verification before session creation.
    - Rate limiting per IP and per-agent; detect abuse patterns and throttle or block.
    - Custom domain support with CNAME verification and SSL provisioning (via managed service).
  - Implementation notes:
    - Expose share analytics: clicks vs sessions started for each slug.

- Analytics & Reporting
  - Technical details:
    - Event ingestion pipeline (e.g., Kafka/Cloud PubSub) or lightweight analytics DB for sessions started/completed, tokens, webhook metrics.
    - Pre-aggregated metrics for dashboard; run daily jobs for trends.
    - Exportable reports and scheduled emails.
  - Implementation notes:
    - Surfacing completion rate, average time to completion, tokens per session.

- File Upload & Attachment Handling
  - Technical details:
    - Client-side validation and chunked uploads to S3 via signed URLs.
    - Scan uploaded files with optional virus scanner (ClamAV or 3rd party).
    - Signed, time-limited download URLs for creators.
  - Implementation notes:
    - Enforce file type/size limits per plan and retention rules.

- Billing & Subscription Management
  - Technical details:
    - Integrate Stripe for subscriptions, invoices, usage billing.
    - Meter sessions and token usage; enforce plan quotas.
    - Billing UI showing invoices, payment method, consumption.
  - Implementation notes:
    - Soft limits with overage charges; optional hard limits for freemium.

- Abuse & Bot Protection
  - Technical details:
    - Integrate reCAPTCHA v3 or hCaptcha on public session creation.
    - Rate limiting, IP blacklists, anomaly detection heuristics.
  - Implementation notes:
    - Provide admin alerts for suspicious activity and temporary agent disable.

## 3. User Journeys

- Creator (Product Manager / Marketer / Sales Rep)
  1. Signup or login via unified auth (email or OAuth); verify email if required.
  2. Onboarded with Quick Start modal; create first agent via Create Agent CTA.
  3. In Agent Editor: define schema fields, set required flags and validation, choose persona and tone.
  4. Paste knowledge or upload docs, wait for indexing; select appearance and welcome message.
  5. Set publish settings (slug, CAPTCHA, webhook), save and publish agent.
  6. Obtain public link; share via email, social, or embed as CTA.
  7. Monitor Dashboard: view sessions, quick stats, session list.
  8. Inspect individual sessions in Session Inspector, edit captured data if needed, resend webhook or export leads.
  9. Manage workspace: invite teammates, configure API keys, check usage/billing, adjust retention policies.
  10. Iterate agent configuration based on analytics; duplicate or version agents.

- Respondent / Lead
  1. Click public agent URL (slug); landing opens full-page chat interface.
  2. Session created automatically; agent greets with persona and welcome message.
  3. Respondent answers conversational prompts; quick replies and field-specific inputs aid speed.
  4. Agent validates inputs in-line; requests clarifications when ambiguous.
  5. On completion, respondent sees confirmation and optional CTA (schedule demo, download).
  6. Session stored; respondent optionally receives confirmation email (if email captured) per agent settings.

- Admin (Workspace Admin / Billing Admin)
  1. Login and navigate to Admin Dashboard.
  2. Manage users: invite, role assignment, deactivate accounts.
  3. Monitor usage and system metrics; review audit logs for critical actions.
  4. Address billing: view invoices, change plans, download invoices.
  5. Respond to system alerts (webhook failures, abuse) and take remediation actions.

## 4. UI Guide
(Apply below visual style consistently across all pages and components.)

- Layout & Spacing
  - Grid-based layout with 24–32px gutters; consistent card margins and internal padding.
  - Left-aligned text, prominent headings, consistent use of bold/medium weights.

- Components
  - Buttons:
    - Primary: rounded, filled Light Blue (#7B8CFF), medium/bold label.
    - Secondary: white background, colored text/icon, subtle borderless style.
    - Disabled: muted tone with <50% opacity.
  - Inputs:
    - Rounded fields, pale gray border (#ECECEC), clear focus state with light blue shadow/border.
    - Validation errors in Deep Orange (#FFA86B) with inline messages.
  - Cards:
    - White background (#FFFFFF with overall page #F8F9FB), 16–24px corner radius, soft drop shadow (8–16px blur, 10% opacity).
    - Hover elevates shadow slightly.
  - Sidebar Navigation:
    - Pill-shaped active state (filled #23262F), icons + labels, collapsible sections.
  - Top Bar:
    - Minimalist with avatar, quick actions, search.
  - Chat UI:
    - Agent bubbles: accent colors and avatar; respondent bubbles: neutral background.
    - Typing indicator and subtle micro-interactions.
  - Data Visualization:
    - Use Light Orange / Deep Orange / Soft Yellow / Pale Pink / Lavender accents for charts and timeline elements.
    - Thin grid lines or dotted backgrounds for guidance.

- Accessibility & Interaction
  - Ensure contrast ratios meet WCAG AA.
  - Keyboard navigable forms and chat input.
  - ARIA roles for landmarks, modals, and live regions for streaming chat.

- Micro-interactions
  - Hover: subtle scale or shadow change.
  - Transitions: smooth 120–200ms ease for modals and chat typing.
  - Toasts and inline errors animate in/out.

---

Visual Style (repeat reference)
- Primary surface: #F8F9FB; primary action: #7B8CFF; neutrals and accents as specified above.
- Typography: Inter/Nunito; weights: Regular/Medium/Bold.
- Maintain consistent 24–32px gutters, 16–24px card radii, and component states per guide.

Implementation Notes:
- Use a component-driven approach (React + TypeScript recommended) with a design system enforcing tokens for colors, spacing, and typography.
- Confirm every component/page adheres to the UI Guide and color palette.
- After each development step, refer back to this blueprint for validation.

Instructions to AI Development Tool:
After every development step, verify built pages/features match the blueprint; ensure agent editor, public chat, session lifecycle, webhook plumbing, knowledge indexing, and security flows behave per the specifications. Pay special attention to UI Guide and enforce the design system on all elements.

## Implementation Notes

When implementing this project:

1. **Follow Universal Guidelines**: Use the design best practices documented above as your foundation
2. **Apply Project Customizations**: Implement the specific design requirements stated in the "User Design Requirements" section
3. **Priority Order**: Project-specific requirements override universal guidelines when there's a conflict
4. **Color System**: Extract and implement color values as CSS custom properties in RGB format
5. **Typography**: Define font families, sizes, and weights based on specifications
6. **Spacing**: Establish consistent spacing scale following the design system
7. **Components**: Style all Shadcn components to match the design aesthetic
8. **Animations**: Use Motion library for transitions matching the design personality
9. **Responsive Design**: Ensure mobile-first responsive implementation

## Implementation Checklist

- [ ] Review universal design guidelines above
- [ ] Extract project-specific color palette and define CSS variables
- [ ] Configure Tailwind theme with custom colors
- [ ] Set up typography system (fonts, sizes, weights)
- [ ] Define spacing and sizing scales
- [ ] Create component variants matching design
- [ ] Implement responsive breakpoints
- [ ] Add animations and transitions
- [ ] Ensure accessibility standards
- [ ] Validate against user design requirements

---

**Remember: Always reference this file for design decisions. Do not use generic or placeholder designs.**
