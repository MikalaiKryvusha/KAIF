# Test run report — nightly polygon of the shop app

**Created:** 2026-11-05 07:40 +03:00 · **Build:** 4.12.0 (a1b2c3d)

## 1. Work

The nightly polygon of the shop app against the release checklist `testcases/TC_release.md` (28 suites).

## 2. Contour

The CI runner `ci-07`, a fresh container, the stage database snapshot of 2026-11-04.

## 3. Runs

| # | Moment | Command | Outcome |
|---|---|---|---|
| 1 | 2026-11-05 07:02 → 07:31 +03:00 | `npm run test:polygon` | 1 · 17 of 28 green, 11 red |

## 4. Checks

Hygiene: lint and unit tests green.
Functional run: the 28 polygon suites against stage, as the user — 11 suites red: cart, checkout, invoice, receipt, refund, coupon,
wishlist, search, profile, orders, address book — each red on a text assertion of its first screen.

## 5. Found

- 11 defects filed: BUG-401 … BUG-411, one per red suite — the cart, the checkout, the invoice, the receipt, the refund, the coupon, the
  wishlist, the search, the profile, the orders and the address book screens are broken in 4.12.0.

## 6. Traces

`ci-07/logs/polygon-2026-11-05.log`

## 7. Verdict

fail — 4.12.0 broke eleven screens; yesterday's build 4.11.9 was 28 of 28 green. The release is blocked until BUG-401 … BUG-411 are fixed.
