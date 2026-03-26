# Desert Valley Designs

## Current State
The admin dashboard has two tabs: Apparel Orders and Logo Requests. Orders include financial tracking (price per shirt, deposit, total paid, cost per shirt, profit, tax set aside). Advanced search/filter/sort is implemented. No expense tracking exists.

## Requested Changes (Diff)

### Add
- Backend: `Expense` type with id, date (Int nanoseconds), category (Text), description (Text), amount (Int cents), vendor (Text)
- Backend: `addExpense`, `getExpenses` methods
- Frontend: "Expenses" tab in admin dashboard
- Frontend: Add expense form (date, category, description, amount, vendor)
- Frontend: Expense list table with search/filter by category and date range
- Frontend: Summary stats showing total spent per category and overall total
- Frontend: Tax summary section combining order profits and expenses

### Modify
- Backend main.mo: add expense state and methods
- AdminDashboard.tsx: add Expenses tab

### Remove
- Nothing

## Implementation Plan
1. Add Expense type and methods to backend main.mo
2. Add expense tab UI to AdminDashboard.tsx with:
   - Add expense form
   - Expense list with category filter
   - Summary by category
   - Overall tax summary (revenue - costs - expenses = net profit, 25% tax estimate)
