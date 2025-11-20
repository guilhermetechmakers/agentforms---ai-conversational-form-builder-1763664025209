# Design Rules for This Project

## Project Design Pattern: ---

## Visual Style

### Color Palette:
- Primary: Soft white background (#F8F9FB) for main surfaces, providing a clean and airy feel.
- Accent Colors: 
  - Light Blue (#7B8CFF) used for primary buttons, highlights, and active states.
  - Light Orange (#FFD39C) and Deep Orange (#FFA86B) for chart bars, task badges, and timeline events.
  - Soft Yellow (#FFECA7) for chart data and subtle highlights.
  - Pale Pink (#F6AFFF) and Lavender (#E9E4FF) for secondary highlights and event tags.
- Neutrals:
  - Charcoal Black (#23262F) for primary text and dashboard navigation.
  - Medium Gray (#A1A4B2) for secondary text and muted icons.
  - Pale Gray (#ECECEC) for card backgrounds, borders, and dividers.
- Color combinations are used to separate components visually while maintaining harmony, with gradients rarely used—most elements are flat or subtly shaded.

### Typography & Layout:
- Font Family: Rounded, geometric sans-serif (e.g., Inter, Nunito, or similar).
- Weights: Prominent use of Medium and Bold for headings and primary actions, Regular for secondary text and body copy.
- Hierarchy: 
  - Large, bold headings for key metrics or section titles.
  - Medium size for subheadings and widget labels.
  - Small, regular-weight for descriptions, captions, and secondary data.
- Layout: Grid-based with generous padding and spacing between cards (24px–32px gutters), clear grouping of related elements.
- Alignment: Left-aligned text; widgets and cards have consistent alignment and spacing.

### Key Design Elements
#### Card Design:
- Cards feature white backgrounds, soft drop shadows (subtle, 8-16px blur, 10% opacity), and fully rounded corners (16px–24px radius).
- No hard borders; separation is achieved via shadow and spacing.
- Hover states include gentle elevation and a slight increase in shadow opacity.
- Visual hierarchy: Titles at the top, key data prominent and centered, secondary info below or in corners.

#### Navigation:
- Sidebar navigation with pill-shaped active state (filled accent color, e.g., #23262F for active, white for inactive).
- Icons paired with labels, rounded backgrounds for active selection.
- Collapsible sections with subtle indicators; top-level navigation is always visible.
- Minimalist top bar with avatar, user info, and quick actions.

#### Data Visualization:
- Bar charts, progress circles, and timeline bars use accent colors for clarity and differentiation.
- Charts are clean, with thin grid lines or dotted backgrounds for subtle guidance.
- Data points and progress indicators are bold and easy to scan, with color-coding for quick recognition.

#### Interactive Elements:
- Buttons: Rounded, filled with accent colors; primary buttons in blue (#7B8CFF), secondary in white with colored text or icon.
- Form elements: Rounded input fields with soft gray borders (#ECECEC), clear focus states (light blue shadow or border).
- Micro-interactions: Soft hover effects (background shade or slight scale), clear active/focus indicators, and animated transitions for timeline elements and popups.

### Design Philosophy
This interface embodies:
- A modern, minimalist, and highly approachable aesthetic, with a focus on clarity, friendliness, and accessibility.
- Design principles include generous white space, clear visual hierarchy, and intuitive grouping of information.
- The overall experience is professional yet casual, aiming to reduce friction and cognitive load, making navigation and data entry pleasant and efficient.
- Visual strategy centers on lightweight, inviting visuals with strong color cues for action and status, supporting fast comprehension and user engagement.

---

This project follows the "---

## Visual Style

### Color Palette:
- Primary: Soft white background (#F8F9FB) for main surfaces, providing a clean and airy feel.
- Accent Colors: 
  - Light Blue (#7B8CFF) used for primary buttons, highlights, and active states.
  - Light Orange (#FFD39C) and Deep Orange (#FFA86B) for chart bars, task badges, and timeline events.
  - Soft Yellow (#FFECA7) for chart data and subtle highlights.
  - Pale Pink (#F6AFFF) and Lavender (#E9E4FF) for secondary highlights and event tags.
- Neutrals:
  - Charcoal Black (#23262F) for primary text and dashboard navigation.
  - Medium Gray (#A1A4B2) for secondary text and muted icons.
  - Pale Gray (#ECECEC) for card backgrounds, borders, and dividers.
- Color combinations are used to separate components visually while maintaining harmony, with gradients rarely used—most elements are flat or subtly shaded.

### Typography & Layout:
- Font Family: Rounded, geometric sans-serif (e.g., Inter, Nunito, or similar).
- Weights: Prominent use of Medium and Bold for headings and primary actions, Regular for secondary text and body copy.
- Hierarchy: 
  - Large, bold headings for key metrics or section titles.
  - Medium size for subheadings and widget labels.
  - Small, regular-weight for descriptions, captions, and secondary data.
- Layout: Grid-based with generous padding and spacing between cards (24px–32px gutters), clear grouping of related elements.
- Alignment: Left-aligned text; widgets and cards have consistent alignment and spacing.

### Key Design Elements
#### Card Design:
- Cards feature white backgrounds, soft drop shadows (subtle, 8-16px blur, 10% opacity), and fully rounded corners (16px–24px radius).
- No hard borders; separation is achieved via shadow and spacing.
- Hover states include gentle elevation and a slight increase in shadow opacity.
- Visual hierarchy: Titles at the top, key data prominent and centered, secondary info below or in corners.

#### Navigation:
- Sidebar navigation with pill-shaped active state (filled accent color, e.g., #23262F for active, white for inactive).
- Icons paired with labels, rounded backgrounds for active selection.
- Collapsible sections with subtle indicators; top-level navigation is always visible.
- Minimalist top bar with avatar, user info, and quick actions.

#### Data Visualization:
- Bar charts, progress circles, and timeline bars use accent colors for clarity and differentiation.
- Charts are clean, with thin grid lines or dotted backgrounds for subtle guidance.
- Data points and progress indicators are bold and easy to scan, with color-coding for quick recognition.

#### Interactive Elements:
- Buttons: Rounded, filled with accent colors; primary buttons in blue (#7B8CFF), secondary in white with colored text or icon.
- Form elements: Rounded input fields with soft gray borders (#ECECEC), clear focus states (light blue shadow or border).
- Micro-interactions: Soft hover effects (background shade or slight scale), clear active/focus indicators, and animated transitions for timeline elements and popups.

### Design Philosophy
This interface embodies:
- A modern, minimalist, and highly approachable aesthetic, with a focus on clarity, friendliness, and accessibility.
- Design principles include generous white space, clear visual hierarchy, and intuitive grouping of information.
- The overall experience is professional yet casual, aiming to reduce friction and cognitive load, making navigation and data entry pleasant and efficient.
- Visual strategy centers on lightweight, inviting visuals with strong color cues for action and status, supporting fast comprehension and user engagement.

---" design pattern.
All design decisions should align with this pattern's best practices.

## Dashboard Pattern

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
- Color scheme matching design system (works in both themes)
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

---

## General Design Principles

## Color & Visual Design

### Color Palettes
**Create depth with gradients:**
- Primary gradient (not just solid primary color)
- Subtle background gradients
- Gradient text for headings
- Gradient borders on cards
- Dark mode with elevated surfaces

**Color usage:**
- 60-30-10 rule (dominant, secondary, accent)
- Consistent semantic colors (success, warning, error)
- Accessible contrast ratios (WCAG AA minimum)
- Test colors in both light and dark modes

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
- Adjust shadow intensity based on theme (lighter in dark mode)

---

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
- Sufficient color contrast (both themes)
- Respect reduced motion preferences

---

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
9. **Be Themeable** - Support both dark and light modes seamlessly

---

