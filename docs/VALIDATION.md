# Validation strategy

Validation happens in three layers. Each catches a different kind of problem.

| Layer | Tool | Catches |
|-------|------|---------|
| Compile time | TypeScript (`strict: true`) | Wrong types in our own code. |
| Form input | `src/utils/validation.ts` rules (`required`, `isNumber`, `positive`, `min`, `max`, `pattern`, ...) | Bad values typed by a person. Returns a message per field. |
| Runtime props and data | Guards in `src/utils/validation.ts` (`isFiniteNumber`, `isRecord`, `arrayOf`, `optionalProp`, `findInvalidProps`, `reportInvalidProps`) | Data from API responses, persisted state or other code paths that the types do not cover. |

## Runtime guards

Guards are plain functions, so there is no runtime dependency. A guard returns `true` when the value has the expected shape.

```ts
import { arrayOf, findInvalidProps, isFiniteNumber, isRecord, reportInvalidProps } from '@utils/validation'

const isOrderLike = (v: unknown) =>
  isRecord(v) && isFiniteNumber(v.price) && isFiniteNumber(v.amount) && isFiniteNumber(v.total)

const schema = { bids: arrayOf(isOrderLike), asks: arrayOf(isOrderLike) }

useEffect(() => {
  reportInvalidProps('OrderBook', findInvalidProps({ bids, asks }, schema))
}, [bids, asks])
```

`OrderBook` (`src/components/Marketplace/OrderBook.tsx`) is the first component to use this pattern.

## What happens when a prop is invalid

- **Development:** `reportInvalidProps` logs a `console.warn` naming the component and the invalid props.
- **Production:** it sends an `Error` to `captureError` with the same details. The UI keeps rendering, so one bad value does not crash the page.

Reports run in an effect keyed on the checked props, so each change is reported once rather than on every render.

## Adding a guard

1. Write a guard that takes `unknown` and returns `boolean`. Use the existing type-guard helpers where they fit.
2. Build a schema that maps each prop name to a guard.
3. Call `reportInvalidProps` from an effect.
4. Add a unit test next to `src/utils/__tests__/validation.test.ts`.

Schemas are not checked against the component's TypeScript props. Keep them in sync when the props change.
