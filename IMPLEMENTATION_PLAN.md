# High Impact, High Effort Features - Implementation Plan

## Overview
This document outlines the implementation strategy for four major features that will significantly enhance the Medical LLM Attack Taxonomy application.

---

## 1. Network Graph Visualization 🕸️

### Goal
Create an interactive network graph showing relationships between attacks, modalities, attack types, and research papers.

### Technical Approach
**Library Choice: React Flow** (preferred over D3.js for React integration)
- Better React integration than raw D3
- Built-in zoom, pan, and interaction
- Easier to maintain and extend

**Alternative: D3.js Force-Directed Graph**
- More control over visualization
- Steeper learning curve
- Already familiar from TaxonomyTree

### Implementation Steps

#### Phase 1: Data Modeling (2-3 hours)
1. Create graph data structure:
   ```javascript
   {
     nodes: [
       { id: 'attack-1', type: 'attack', label: 'Jailbreak', severity: 'critical' },
       { id: 'mod-image', type: 'modality', label: 'Image' },
       { id: 'paper-2024', type: 'paper', label: 'Author 2024' }
     ],
     edges: [
       { source: 'attack-1', target: 'mod-image', type: 'uses' },
       { source: 'attack-1', target: 'paper-2024', type: 'documented-in' }
     ]
   }
   ```

2. Build graph from attack data:
   - Extract all unique entities (attacks, modalities, attack types, papers)
   - Create edges based on relationships
   - Calculate node importance (degree centrality)

#### Phase 2: Visualization Component (4-6 hours)
1. Create `NetworkGraph.jsx`:
   - Node rendering with custom styling
   - Edge rendering with labels
   - Color coding by node type
   - Size based on importance

2. Interaction features:
   - Click node → Filter to related attacks
   - Hover → Show tooltip with details
   - Drag nodes to reposition
   - Zoom and pan controls

#### Phase 3: Integration (1-2 hours)
1. Add new tab to Dashboard: "Network"
2. Add filter controls:
   - Show/hide node types
   - Minimum connections filter
   - Severity filter
3. Performance optimization:
   - Limit nodes to top N (configurable)
   - Lazy loading for large graphs

### Dependencies
```bash
npm install reactflow
# or
npm install @visx/network @visx/drag
```

### Estimated Time: 8-12 hours

---

## 2. Virtual Scrolling 📜

### Goal
Improve performance when rendering large lists (100+ attacks) by only rendering visible items.

### Technical Approach
**Library: react-window**
- Lightweight (2kb)
- Easy to integrate
- Works with grid and list layouts

### Implementation Steps

#### Phase 1: AttackTable Virtualization (2-3 hours)
1. Install dependencies:
   ```bash
   npm install react-window react-window-infinite-loader
   ```

2. Replace table rendering with `FixedSizeList`:
   ```jsx
   <FixedSizeList
     height={600}
     itemCount={filteredAttacks.length}
     itemSize={80}
     width="100%"
   >
     {({ index, style }) => (
       <AttackRow
         attack={filteredAttacks[index]}
         style={style}
       />
     )}
   </FixedSizeList>
   ```

3. Add scroll-to-top on filter change

#### Phase 2: Explorer Grid Virtualization (3-4 hours)
1. Use `VariableSizeGrid` for card layout:
   ```jsx
   <VariableSizeGrid
     columnCount={3}
     rowCount={Math.ceil(filteredAttacks.length / 3)}
     columnWidth={() => 350}
     rowHeight={() => 300}
     width={window.innerWidth}
     height={600}
   >
     {({ columnIndex, rowIndex, style }) => {
       const index = rowIndex * 3 + columnIndex;
       return <AttackCard attack={filteredAttacks[index]} style={style} />;
     }}
   </VariableSizeGrid>
   ```

2. Handle responsive columns (1, 2, or 3 based on screen width)
3. Preserve scroll position on filter changes

#### Phase 3: Performance Measurement (1 hour)
1. Add performance monitoring:
   - Measure initial render time
   - Measure filter update time
   - Compare before/after metrics

2. Document improvements in README

### Benefits
- **Initial Render**: 100+ items in ~16ms (instead of ~200ms)
- **Smooth Scrolling**: 60 FPS even with 1000+ items
- **Memory Usage**: Reduced by 80-90%

### Estimated Time: 6-8 hours

---

## 3. Advanced Comparison 🔍

### Goal
Enhance attack comparison with side-by-side analysis, visual diff, and export capabilities.

### Current State
- Basic comparison: Select up to 3 attacks
- Simple side-by-side display

### Enhancement Plan

#### Phase 1: Comparison Matrix (3-4 hours)
1. Create `ComparisonMatrix.jsx`:
   ```
   +------------------+----------+----------+----------+
   | Feature          | Attack 1 | Attack 2 | Attack 3 |
   +------------------+----------+----------+----------+
   | Severity         | Critical | High     | Medium   |
   | Success Rate     | 98.5%    | 87.2%    | 65.0%    |
   | Modalities       | Image    | Text     | Both     |
   | Attack Types     | Jailbreak| Poison   | Adversarial |
   | First Discovered | 2024     | 2023     | 2022     |
   | References       | 3 papers | 5 papers | 2 papers |
   +------------------+----------+----------+----------+
   ```

2. Visual diff highlighting:
   - Highlight best/worst values
   - Color-code differences
   - Show delta percentages

#### Phase 2: Comparison Analytics (2-3 hours)
1. Add similarity score:
   - Jaccard similarity for modalities/attack types
   - Severity distance
   - Success rate difference
   - Overall similarity percentage

2. Recommendations:
   - "These attacks are 85% similar"
   - "Attack 1 is more effective than Attack 2"
   - "Consider combining these attack vectors"

#### Phase 3: Export & History (2-3 hours)
1. Export comparison as:
   - Markdown table
   - CSV file
   - PDF report (optional)

2. Comparison history:
   - Save recent comparisons to localStorage
   - Quick access to previous comparisons
   - Share comparison via URL params

#### Phase 4: Advanced Filtering (2 hours)
1. Filter by similarity:
   - "Show attacks similar to selected ones"
   - Similarity threshold slider

2. Differential filtering:
   - "Show only attacks that differ in severity"
   - "Show only attacks with higher success rates"

### Dependencies
```bash
npm install jspdf jspdf-autotable  # For PDF export (optional)
```

### Estimated Time: 9-12 hours

---

## 4. TypeScript Migration 💙

### Goal
Convert the entire codebase to TypeScript for better type safety, IDE support, and maintainability.

### Migration Strategy
**Incremental Approach** (recommended for minimal disruption)
- Migrate one file at a time
- Start with utilities, then components, then pages
- Use `// @ts-expect-error` for temporary workarounds

### Implementation Steps

#### Phase 1: Setup (1-2 hours)
1. Install TypeScript and types:
   ```bash
   npm install -D typescript @types/react @types/react-dom @types/node
   npm install -D @types/lodash @types/d3
   ```

2. Create `tsconfig.json`:
   ```json
   {
     "compilerOptions": {
       "target": "ES2020",
       "lib": ["ES2020", "DOM", "DOM.Iterable"],
       "jsx": "react-jsx",
       "module": "ESNext",
       "moduleResolution": "bundler",
       "resolveJsonModule": true,
       "allowJs": true,
       "checkJs": false,
       "strict": true,
       "esModuleInterop": true,
       "skipLibCheck": true,
       "forceConsistentCasingInFileNames": true,
       "paths": {
         "@/*": ["./src/*"]
       }
     },
     "include": ["src"],
     "exclude": ["node_modules"]
   }
   ```

3. Update `vite.config.js` → `vite.config.ts`

#### Phase 2: Type Definitions (2-3 hours)
1. Create `src/types/` directory:
   - `attack.ts`: Attack, Reference, Taxonomy types
   - `filters.ts`: Filter state types
   - `store.ts`: Zustand store types
   - `components.ts`: Component prop types

2. Example types:
   ```typescript
   // src/types/attack.ts
   export interface Reference {
     authors: string;
     year: number;
     url: string;
   }

   export interface Attack {
     id: string;
     item: string;
     category: string;
     description: string;
     modalities: string[];
     attackTypes: string[];
     severity: 'critical' | 'high' | 'medium' | 'low';
     successRate: number | null;
     tags: string[];
     reference: Reference;
   }

   export interface FilterState {
     categories: string[];
     intents: string[];
     modalities: string[];
     attackTypes: string[];
     severities: string[];
     searchQuery: string;
     yearRange: [number, number];
     tags: string[];
   }
   ```

#### Phase 3: Migrate Utilities (2-3 hours)
Convert in order:
1. `src/lib/utils.js` → `utils.ts`
2. `src/utils/exportUtils.js` → `exportUtils.ts`
3. `src/utils/citationUtils.js` → `citationUtils.ts`
4. `src/data/dataProcessor.js` → `dataProcessor.ts`

#### Phase 4: Migrate Store (1-2 hours)
1. `src/store/filterStore.js` → `filterStore.ts`
2. Add proper typing for Zustand store:
   ```typescript
   import { create } from 'zustand';
   import type { Attack, FilterState } from '../types/attack';

   interface FilterStore {
     allAttacks: Attack[];
     filteredAttacks: Attack[];
     filters: FilterState;
     loading: boolean;
     error: string | null;
     setFilter: (key: keyof FilterState, value: any) => void;
     // ... other methods
   }

   export const useFilterStore = create<FilterStore>((set, get) => ({
     // ... implementation
   }));
   ```

#### Phase 5: Migrate Hooks (2-3 hours)
Convert all custom hooks:
1. `src/hooks/useTheme.js` → `useTheme.ts`
2. `src/hooks/useKeyboardShortcuts.js` → `useKeyboardShortcuts.ts`
3. `src/hooks/useURLFilters.js` → `useURLFilters.ts`

#### Phase 6: Migrate Components (6-8 hours)
Convert in order:
1. UI components (`src/components/ui/*.jsx` → `*.tsx`)
2. Filter components
3. Dashboard components
4. Visualization components
5. Layout components

Example component with types:
```typescript
// src/components/dashboard/AttackCard.tsx
import React from 'react';
import type { Attack } from '@/types/attack';

interface AttackCardProps {
  attack: Attack;
  isSelected?: boolean;
  onViewDetails: (attack: Attack) => void;
  onCompare: (attack: Attack) => void;
}

export default function AttackCard({
  attack,
  isSelected = false,
  onViewDetails,
  onCompare
}: AttackCardProps) {
  // ... implementation
}
```

#### Phase 7: Migrate Pages (3-4 hours)
1. `src/pages/Dashboard.jsx` → `Dashboard.tsx`
2. `src/pages/Explorer.jsx` → `Explorer.tsx`
3. `src/pages/References.jsx` → `References.tsx`

#### Phase 8: Strict Mode & Cleanup (2-3 hours)
1. Enable strict TypeScript settings
2. Fix all type errors
3. Remove `// @ts-expect-error` comments
4. Add JSDoc comments with types
5. Update README with TypeScript info

### Migration Checklist
- [ ] All `.js` files converted to `.ts`
- [ ] All `.jsx` files converted to `.tsx`
- [ ] No `any` types (except for external libraries)
- [ ] All props have proper interfaces
- [ ] Store properly typed
- [ ] No type errors in strict mode
- [ ] Tests updated (if any)

### Benefits of TypeScript
- **IntelliSense**: Better autocomplete in VS Code
- **Type Safety**: Catch errors at compile time
- **Refactoring**: Safer code changes
- **Documentation**: Types serve as documentation
- **Team Collaboration**: Clearer contracts between components

### Estimated Time: 20-30 hours

---

## Implementation Order Recommendation

### Option A: User Value First
1. **Virtual Scrolling** (6-8h) - Immediate performance boost
2. **Network Graph** (8-12h) - New visualization capability
3. **Advanced Comparison** (9-12h) - Enhanced analysis
4. **TypeScript** (20-30h) - Code quality improvement

**Total: 43-62 hours (~1-2 weeks)**

### Option B: Foundation First
1. **TypeScript** (20-30h) - Better foundation for other features
2. **Virtual Scrolling** (6-8h) - Performance (easier in TS)
3. **Network Graph** (8-12h) - New feature (with types)
4. **Advanced Comparison** (9-12h) - Advanced feature (with types)

**Total: 43-62 hours (~1-2 weeks)**

### Option C: Incremental Value
1. **Virtual Scrolling** (6-8h) - Quick win
2. **Network Graph** (8-12h) - High visibility
3. **TypeScript** (20-30h) - Long-term investment
4. **Advanced Comparison** (9-12h) - Polish

**Total: 43-62 hours (~1-2 weeks)**

---

## Recommended Approach: **Option A - User Value First**

### Reasoning:
1. Virtual scrolling provides immediate, measurable performance improvements
2. Network graph is a "wow" feature that adds significant value
3. Advanced comparison enhances existing functionality
4. TypeScript migration can happen incrementally without blocking features
5. Users see value quickly, TypeScript benefits team long-term

### Milestones:
- **Week 1, Day 1-2**: Virtual Scrolling ✅
- **Week 1, Day 3-5**: Network Graph ✅
- **Week 2, Day 1-3**: Advanced Comparison ✅
- **Week 2-3**: TypeScript Migration (incremental) ✅

---

## Risk Mitigation

### Virtual Scrolling Risks
- **Risk**: Breaking existing layouts
- **Mitigation**: Implement feature flag, test thoroughly, keep original as fallback

### Network Graph Risks
- **Risk**: Performance with large graphs (1000+ nodes)
- **Mitigation**: Implement node limit, lazy loading, level-of-detail rendering

### Advanced Comparison Risks
- **Risk**: Complexity creep
- **Mitigation**: Start with MVP, iterate based on user feedback

### TypeScript Risks
- **Risk**: Breaking changes during migration
- **Mitigation**: Incremental migration, keep JavaScript files working, extensive testing

---

## Success Metrics

### Virtual Scrolling
- Initial render time < 50ms (currently ~200ms)
- Smooth scrolling at 60 FPS
- Memory usage reduced by 80%

### Network Graph
- Load time < 1s for 100 nodes
- Interactive at 60 FPS
- Users spend 5+ minutes exploring graph

### Advanced Comparison
- 50% of users try comparison feature
- Average 3+ attacks compared per session
- 20% of users export comparisons

### TypeScript
- Zero type errors in strict mode
- 100% type coverage
- Improved IDE autocomplete
- Reduced bug reports by 30%

---

## Questions for User

Before starting implementation, please confirm:

1. **Which option do you prefer?**
   - A: User Value First (Virtual → Network → Comparison → TypeScript)
   - B: Foundation First (TypeScript → Virtual → Network → Comparison)
   - C: Incremental Value (Virtual → Network → TypeScript → Comparison)
   - D: Custom order

2. **Priority features:**
   - Which features are most important to you?
   - Any features we should skip or defer?

3. **TypeScript:**
   - Is TypeScript migration a hard requirement?
   - Or can we defer it for later?

4. **Timeline:**
   - How quickly do you need these features?
   - Working full-time or part-time on this?

5. **Testing:**
   - Do you want automated tests added?
   - Or manual testing is sufficient?

---

Ready to start implementation once you provide feedback!
