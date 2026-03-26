# Desert Valley Designs

## Current State
Admin dashboard has orders tab with financial tracking, search/filter/sort by name, phone, date, payment method, status, and total. Orders have a status field already used for filtering. Expense Tracker tab exists. Backend has order management with updateOrderStatus function (or similar).

## Requested Changes (Diff)

### Add
- Order status dropdown/selector on each order row in the admin dashboard allowing admin to change status between: New, In Progress, Ready, Delivered
- Visual status badges with distinct colors for each status
- Status update persists to backend

### Modify
- Each order row/card in the Orders tab should show the current status as a colored badge and allow changing it via a dropdown

### Remove
- Nothing

## Implementation Plan
1. Add updateOrderStatus backend call in AdminDashboard if not already wired
2. Add a status dropdown on each order row that calls updateOrderStatus when changed
3. Color-code status badges: New (blue), In Progress (yellow/orange), Ready (green), Delivered (gray)
4. Ensure status change is reflected immediately in UI (optimistic update or refetch)
