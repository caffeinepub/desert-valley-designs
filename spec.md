# Desert Valley Designs

## Current State
All backend state (orders, logo requests, expenses, financials, counters) is stored in non-stable `var` variables. Every canister upgrade (deployment) wipes all data. This is why orders disappear — each new deployment resets the store.

## Requested Changes (Diff)

### Add
- `stable var` backing arrays for all state (ordersV2, orderFinancials, logoRequests, expenses, and ID counters)
- `system func preupgrade()` to serialize in-memory maps to stable arrays before upgrade
- `system func postupgrade()` to restore in-memory maps from stable arrays after upgrade

### Modify
- All `nextOrderId`, `nextLogoRequestId`, `nextExpenseId`, `nextVideoId` counters become stable

### Remove
- Nothing removed

## Implementation Plan
1. Add stable backing arrays for each Map and each counter
2. Add preupgrade hook: copy all map entries + counters into stable arrays
3. Add postupgrade hook: repopulate in-memory maps from stable arrays, restore counters
4. Deploy — existing orders submitted after the fix will survive future deployments
