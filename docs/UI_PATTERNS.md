# UI patterns: loading states

Use one of three loading patterns so the app feels consistent. Pick by where the waiting happens.

| Situation | Component | Example |
|-----------|-----------|---------|
| Whole page or app bootstrap | `LoadingScreen` (`src/components/Loading/LoadingScreen.tsx`) | Initial load with progress. |
| Content area loading (cards, lists, tables) | `LoadingSkeleton` | Placeholder lines while data arrives. |
| A person's action in progress | `Loading` (spinner) or `Button` with `isLoading` | Saving, submitting a transaction, reconnecting. |

Route-level and page-specific skeletons (`SkeletonDashboard`, `SkeletonMarketplace`, and others) already exist in `src/components/Loading/`. Use them when the layout matches.

## Usage

```tsx
import { Loading, LoadingSkeleton } from '@components/Loading'

// Content that is still loading
if (isLoading) return <LoadingSkeleton lines={4} label="Loading your ships" />

// An action in progress
<Button isLoading={isSubmitting} loadingText="Saving…">Save</Button>

// A standalone spinner
<Loading size="sm" label="Reconnecting wallet" />
```

## Rules

- Every loading indicator announces its state. `Loading` and `LoadingSkeleton` use `role="status"`, and the label is read by screen readers.
- Skeletons are placeholders only. They must not keep the person waiting without a way to act, so pair long waits with a message or a cancel option.
- Do not mix a spinner and a skeleton for the same region.

## Status

The shared components exist. Existing screens have not all been moved to them yet. Migrate one screen at a time when touching it, and check the rendered output in both light and dark themes.
