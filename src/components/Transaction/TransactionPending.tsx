export interface TransactionPendingProps {
  /** Overrides the default awaiting-signature copy. */
  message?: string
}

/** Shown while the connected wallet is asked to sign; pairs with the 60s signing timeout. */
export function TransactionPending({
  message = 'Waiting for your wallet signature…',
}: TransactionPendingProps) {
  return (
    <div role="status" aria-live="polite" style={pendingStyle}>
      <span style={spinnerStyle} aria-hidden="true" />
      <div>
        <p style={messageStyle}>{message}</p>
        <p style={hintStyle}>
          Approve the request in your wallet. It expires after 60 seconds — you can retry after
          that.
        </p>
      </div>
    </div>
  )
}

const pendingStyle: React.CSSProperties = {
  display: 'flex',
  alignItems: 'center',
  gap: 12,
  marginBottom: 18,
  borderRadius: 14,
  padding: '0.8rem 1rem',
  background: 'rgba(50, 214, 165, 0.08)',
  border: '1px solid rgba(50, 214, 165, 0.24)',
}

const spinnerStyle: React.CSSProperties = {
  width: 18,
  height: 18,
  flexShrink: 0,
  borderRadius: '50%',
  border: '2px solid rgba(159, 216, 255, 0.25)',
  borderTopColor: '#32d6a5',
  animation: 'spin 0.8s linear infinite',
}

const messageStyle: React.CSSProperties = {
  margin: 0,
  color: '#f8fbff',
  fontSize: 13,
  fontWeight: 700,
}

const hintStyle: React.CSSProperties = {
  margin: '2px 0 0',
  color: '#8ea0b9',
  fontSize: 12,
}
