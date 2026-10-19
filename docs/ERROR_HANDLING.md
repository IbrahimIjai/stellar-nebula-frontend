# Error handling

## Error boundaries

`src/components/ErrorBoundary/ErrorBoundary.tsx` wraps the app. When a child throws while rendering it:

1. Logs the error to the console and sends it to `captureError` with the component stack.
2. Records an `error_reported` analytics event, noting whether an automatic retry is scheduled.
3. Calls the optional `onError(error, errorInfo)` prop.
4. Renders the `fallback` prop if given, otherwise a default `role="alert"` panel with the message, a **Try Again** button and a **Reload App** button.

Errors whose message looks transient (network, fetch, timeout, loading, resource, socket, abort) are retried automatically up to 2 times, 750 ms apart per attempt. Other errors wait for the user.

`FeatureErrorBoundary` does the same for a single panel so one broken feature does not take down the page.

## Testing

Tests live in `src/__tests__/ErrorBoundary.test.tsx` and `src/components/ErrorBoundary/__tests__/`. Use the helpers in `src/test/helpers/error-helpers.ts`:

- `createThrowingComponent(message)` returns a component that throws until `control.shouldThrow` is set to `false`, which makes recovery easy to test.
- `silenceConsoleError()` hides React's expected error output and returns a restore function.

Mock `services/errorTracking` and `services/analytics` to assert on reporting.

## User-facing error messages

Technical error text (stack traces, RPC messages, contract codes) is not shown to people by default.

- `src/utils/error-messages.ts` maps any thrown value to a `FriendlyError` with a `title`, a `message` and an `action`. It matches common wallet, balance, network and contract failures and falls back to a generic message.
- `src/components/ErrorDisplay.tsx` renders that message in a `role="alert"` panel with an optional **Try again** button. It sends the raw error to `captureError` for debugging.
- The raw error text appears only in a collapsed "Technical details" section in development builds.

```tsx
<ErrorDisplay error={error} onRetry={refetch} />
```

Add a new pattern by appending to `PATTERNS` in `error-messages.ts` and adding a test in `src/utils/__tests__/error-messages.test.ts`.
