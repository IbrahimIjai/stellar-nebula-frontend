# React 19 migration notes

The app runs on React 19 (`react` and `react-dom` `^19.2.0`) and renders through `createRoot` in `src/main.tsx`.

## Audit results

| Pattern | Status | Where / action |
|---------|--------|----------------|
| `ReactDOM.render`, `hydrate`, `unmountComponentAtNode` | Not used | Entry point already uses `createRoot`. |
| `propTypes`, `defaultProps` on function components | Not used | Runtime checks live in `src/utils/validation.ts` (see [VALIDATION.md](VALIDATION.md)). |
| String refs, `findDOMNode`, legacy context | Not used | None found. |
| `forwardRef` | Migrated | `src/components/Button.tsx` now takes `ref` as a normal prop. |
| `React.FC` with implicit `children` | Review | `React.FC` is still valid. Components that render `children` declare it explicitly. |

## Button

`Button` is a plain function component. `ref` is part of `ButtonProps` and is forwarded to the `<button>`. The public API is unchanged, so callers do not need edits.

```tsx
const inputRef = useRef<HTMLButtonElement>(null)
<Button ref={inputRef}>Save</Button>
```

## Keeping it that way

- Do not add `forwardRef`, `propTypes` or `defaultProps` to new components.
- Pass `ref` as a prop. Use `useRef` and `useImperativeHandle` for imperative handles.
- Review new `React.FC` usages when upgrading `@types/react`, since its typings change between majors.

A CI check that fails on these patterns is not in place yet. An ESLint rule (for example `react/no-deprecated`) would be the next step, but it needs a dependency change, so it is out of scope here.
