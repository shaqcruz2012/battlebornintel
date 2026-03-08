# Weekly Brief Feature - Quick Start

## What Was Built

A complete weekly timeline view showing Nevada's startup ecosystem activity over 52 weeks, with:
- Vertical timeline with week markers
- Individual week cards with events, metrics, and summaries
- Activity type filtering (funding, partnerships, hiring, etc.)
- MIT REAP framework metrics per week
- Current week highlighting
- Print/PDF export capability
- Responsive design (mobile to desktop)
- Dark mode support

## File Structure

```
frontend/src/
├── components/brief/
│   ├── WeeklyBriefView.jsx          ← Main timeline view component
│   ├── WeeklyBriefView.module.css   ← Timeline & layout styles
│   ├── WeeklyBriefCard.jsx          ← Individual week card component
│   └── WeeklyBriefCard.module.css   ← Card styling
├── hooks/
│   └── useWeeklyBriefs.js           ← Week aggregation logic
├── utils/
│   └── weeks.js                      ← Week utilities (ISO 8601)
└── api/
    ├── client.js                     ← Updated with week methods
    └── hooks.js                      ← Updated with week hooks
```

## Key Components

### `WeeklyBriefView.jsx` (Main Component)
- Loads 52 weeks of data from hook
- Renders timeline with week cards
- Handles filtering by activity type
- Manages scroll-to-top button
- Provides "Jump to Current Week" navigation

### `WeeklyBriefCard.jsx` (Week Card)
- Displays single week data
- Shows summary, metrics, and activities
- Color-coded event types
- REAP framework breakdown (4 metrics)
- Highlights key insights

### `useWeeklyBriefs.js` (Data Hook)
- Aggregates timeline events by week
- Groups events by type
- Generates summary headlines
- Calculates REAP metrics per week
- Returns array of week objects ready for rendering

### `weeks.js` (Utilities)
- `getWeekStart()` - Get Monday of week
- `getWeekEnd()` - Get Sunday of week
- `formatWeekLabel()` - "Week of March 3-9, 2025"
- `getISOWeekNumber()` - ISO 8601 week number
- `getWeekMondays()` - Array of past N weeks
- `isDateInWeek()` - Check if date in week

## How to Use

### In App

The Brief view is already integrated in `App.jsx`:
```javascript
{view === 'brief' && <WeeklyBriefView />}
```

Just click the "Brief" tab to view the timeline.

### Programmatically

```javascript
import { useWeeklyBriefs } from './hooks/useWeeklyBriefs';
import { WeeklyBriefCard } from './components/brief/WeeklyBriefCard';

function MyComponent() {
  const { weeks } = useWeeklyBriefs(52);

  return weeks.map(week => (
    <WeeklyBriefCard key={week.weekStart} week={week} />
  ));
}
```

## Features

### Timeline View
- Vertical axis with dots marking each week
- Cards stacked top→bottom (newest first)
- Week labels with date ranges
- "This Week" badge on current week
- Visual gradient axis for continuity

### Data Per Card
1. **Header**: Week label + date range + current badge
2. **Summary**: AI-generated headline + overview text
3. **REAP Metrics**: 4 KPIs (Inputs, Capacities, Outputs, Impact)
4. **Activities**: Top 10 events with company name and detail
5. **Highlights**: Key metrics/companies mentioned

### Filtering
- Activity Type Chips: "All", "Funding", "Partnerships", etc.
- Dynamic re-filter (no page reload)
- Active filter highlighted
- Updates card counts dynamically

### Navigation
- **Jump to Current**: Takes you to this week
- **Print**: Browser print dialog (optimized for PDF)
- **Scroll to Top**: Floating button after 300px scroll
- Smooth scroll animations

### Responsive
- **Desktop** (1200px+): Full layout with side week numbers
- **Tablet** (768px): Reduced markers, 2-column grids
- **Mobile** (480px): Single column, simplified view

## Styling

All styles use CSS modules with CSS custom properties (dark mode support):

```css
/* Colors */
--accent-primary: #3b82f6 (blue)
--accent-secondary: brighter blue
--bg-card: #0C1014 (dark gray)
--bg-elevated: #131820 (lighter gray)
--text-primary: white
--text-secondary: gray
--border-subtle: subtle border color

/* Spacing */
--space-sm: 4px
--space-md: 8px
--space-lg: 16px
--space-xl: 24px

/* Typography */
--text-h1: 28px
--text-h2: 24px
--text-h3: 20px
--text-body: 14px
--text-small: 12px
```

## Data Flow

```
Timeline Events (timeline.js)
         ↓
useWeeklyBriefs Hook (aggregates by week)
         ↓
Week Objects {
  weekStart, weekEnd, label, eventCount,
  events: [...], eventsByType: {...},
  summary: {headline, summary, highlights},
  reap: {inputs, capacities, outputs, impact}
}
         ↓
WeeklyBriefView (renders timeline + filtering)
         ↓
WeeklyBriefCard (renders individual week)
         ↓
HTML (styled with CSS modules)
```

## Next Steps: Backend Integration

To connect to a real backend API:

1. **Create API Endpoints**:
```
GET /api/analysis/brief
  → Returns weeks for date range
GET /api/analysis/brief/:weekStart
  → Returns specific week data
```

2. **Update Hook to Use API**:
```javascript
// Replace TIMELINE_EVENTS with API call
const response = await api.getWeeklyBrief({
  weekStart: '2024-W01',
  weekEnd: '2025-W52'
});
```

3. **Add Claude API Integration**:
```python
# In backend weekly_brief agent
summary = claude_api.call(
  system=SYSTEM_PROMPT,
  user=f"Generate brief for week {week_start}"
)
```

## Testing

To verify the feature works:

1. Navigate to the "Brief" tab in the app
2. Verify timeline axis is visible on left
3. Click activity type chips to filter
4. Scroll down - "Scroll to Top" button appears
5. Click "Print" - PDF preview opens
6. Resize browser - responsive layout adjusts
7. Dark mode - verify colors are visible

## Performance Notes

- 52 weeks × ~5 events per week = ~260 events in memory
- Hook aggregation is O(n) where n = total events
- No pagination needed (all 52 weeks fit in viewport)
- Can extend with virtual scrolling if needed later

## Customization

### Change Number of Weeks
```javascript
<WeeklyBriefView weeksBack={104} /> // 2 years instead of 1
```

### Change Event Colors
```javascript
// In WeeklyBriefCard.jsx
const EVENT_COLORS = {
  funding: '#10b981', // Edit these hex codes
  partnership: '#3b82f6',
  // ...
}
```

### Add New Event Types
```javascript
// In weeks.js aggregateWeekData()
// Add new type to eventsByType grouping

// In WeeklyBriefCard.jsx
// Add to EVENT_COLORS and EVENT_ICONS
```

## Known Limitations & Future Work

1. **Summaries are rule-based** - Will use Claude API in phase 2
2. **No database persistence** - Currently uses frontend data only
3. **No risk aggregation** - Risk signals stored separately (future)
4. **No stakeholder filtering** - Will add REAP lens filtering later
5. **Static data** - Will connect to live timeline API

## Questions?

See the full documentation in `WEEKLY_BRIEF_IMPLEMENTATION.md` for:
- Detailed architecture
- API integration details
- Testing checklist
- Accessibility info
- Browser support
