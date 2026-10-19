# Multi-Signature Transaction Support

This document describes the multi-signature transaction support in Stellar Nebula, allowing secure transaction execution requiring approval from multiple signers.

## Overview

Multi-signature (multi-sig) transactions require approval from multiple parties before execution. This is useful for:

- High-value transactions requiring multiple approvals
- Organizational governance decisions
- Shared account management
- Enhanced security for sensitive operations

## Components

### MultiSigTransaction Type

```typescript
interface MultiSigTransaction {
  xdr: string                    // The transaction XDR
  threshold: number              // Number of required signatures
  signers: string[]              // Authorized signer addresses
  signatures: MultiSigSignature[] // Collected signatures
  createdAt: number              // Timestamp of creation
}
```

### Utilities (`src/utils/multisig-utils.ts`)

- `createMultiSigTransaction()` - Initialize a new multi-sig transaction
- `addSignature()` - Add a signature from a signer
- `canExecuteTransaction()` - Check if threshold is met
- `getSignatureProgress()` - Get current progress toward threshold
- `validateSignerAddress()` - Validate Stellar address format
- `serializeMultiSigTransaction()` - Export transaction to JSON
- `deserializeMultiSigTransaction()` - Import transaction from JSON

### Hook (`src/hooks/useMultiSig.ts`)

```typescript
const {
  transaction,              // Current multi-sig transaction
  error,                   // Error messages
  isLoading,               // Loading state
  initializeTransaction,   // Start new transaction
  addSignature,            // Add signer's signature
  isReady,                // Check if ready to execute
  getProgress,            // Get signature progress
  getRemainingCount,      // Remaining signatures needed
  exportTransaction,      // Export for sharing
  importTransaction,      // Import from JSON
  resetTransaction,       // Clear current transaction
} = useMultiSig()
```

### Component (`src/components/MultiSigBuilder.tsx`)

A UI component for building and managing multi-signature transactions:

- Initialize transactions with threshold and signers
- Collect signatures from multiple parties
- Track signature progress with visual indicator
- Export completed transactions for execution
- Validate all inputs

## Usage

### Basic Flow

```typescript
import { useMultiSig } from '@/hooks/useMultiSig'

function MyComponent() {
  const { initializeTransaction, addSignature, isReady } = useMultiSig()

  // Step 1: Initialize with transaction, threshold, and signers
  initializeTransaction(transactionXdr, 2, [
    'GBNZILSTVQSERGV3QWCYXL7HBMZZ3HQQNJ54Y3BJLNVKXYWMPD2LRHR',
    'GB7BDSOOQCFFBX3XVSOLXAUJSD4Harqum7QYV5NE2TWFLTDDQSTDVY2',
    'GCZST3XVCDTUJ76ZAV2HA72KYZSZ242Z3RLY7CQCFZEHKQR7ECWLBW3',
  ])

  // Step 2: Collect signatures
  addSignature('GBNZILSTVQSERGV3QWCYXL7HBMZZ3HQQNJ54Y3BJLNVKXYWMPD2LRHR', signature1)
  addSignature('GB7BDSOOQCFFBX3XVSOLXAUJSD4HAQUQM7QYV5NE2TWFLTDDQSTDVY2', signature2)

  // Step 3: Execute when ready
  if (isReady()) {
    // Submit transaction with collected signatures
    submitTransaction()
  }
}
```

### Using the Builder Component

```typescript
import { MultiSigBuilder } from '@/components/MultiSigBuilder'

export default function TransactionPage() {
  return <MultiSigBuilder />
}
```

## Security Considerations

- Signatures are validated before acceptance
- Transaction threshold validation prevents invalid configurations
- All signer addresses are validated against Stellar address format
- Transactions can be exported for secure sharing and offline signing
- Sensitive data in exported files should be handled securely

## Best Practices

1. **Validate Signers** - Ensure all signer addresses are correct before initializing
2. **Secure Transport** - Share transactions and signatures over secure channels
3. **Timeout Handling** - Implement timeout logic for incomplete transactions
4. **Audit Logging** - Log all signature collection events for accountability
5. **User Confirmation** - Always confirm transaction details before signing

## Error Handling

All functions provide clear error messages:

```typescript
try {
  initializeTransaction(xdr, 2, signers)
} catch (error) {
  // Handle errors like invalid threshold or duplicate signers
  console.error(error.message)
}
```

## Serialization

Transactions can be serialized and deserialized for sharing:

```typescript
// Export
const json = serializeMultiSigTransaction(transaction)

// Import
const restored = deserializeMultiSigTransaction(json)
```

## Integration with Wallet Signing

Multi-sig transactions work with Stellar's transaction signing:

1. Create transaction with `TransactionBuilder`
2. Convert to XDR with `toEnvelope().toXDR()`
3. Create multi-sig wrapper with threshold and signers
4. Collect signatures through wallet adapters
5. Submit signed transaction to Stellar network

## Future Enhancements

- Signature expiration timestamps
- Weighted threshold support
- Time-locked signatures
- Signature cancellation mechanism
- Batch transaction support
