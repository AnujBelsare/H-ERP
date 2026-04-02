# API Robustness Bugfix Design

## Overview

Seven bugs in the Express.js + Drizzle ORM backend prevent routes from being reachable, cause false duplicate-patient rejections, ignore the signup role field, misroute a dedicated endpoint, allow malformed Bearer tokens to slip through, skip an asset-status update in a transaction, and create conflicting Drizzle ORM table references. Each fix is minimal and surgical. The strategy is to confirm each bug with an exploratory test on unfixed code, apply the fix, then verify both fix-checking and preservation-checking pass.

---

## Glossary

- **Bug_Condition (C)**: The set of inputs or states that trigger a defective behavior
- **Property (P)**: The correct behavior that must hold for all inputs satisfying C
- **Preservation**: Existing correct behaviors that must remain unchanged after the fix
- **`server.ts`**: The Express app entry point in `src/server.ts` — responsible for mounting all route modules
- **`registerPatient`**: The function in `src/services/patient.service.ts` that inserts a new patient after a duplicate-phone check
- **`authGuard`**: The middleware in `src/middleware/auth.middleware.ts` that validates JWT Bearer tokens
- **`createBreakdown` (maintenance)**: The function in `src/services/maintenance.service.ts` that reports a breakdown — currently missing the asset-status update
- **`createBreakdown` (breakdown)**: The function in `src/services/breakdown.service.ts` that correctly wraps the insert + asset update in a transaction
- **`breakdowns` (duplicate)**: Two separate Drizzle table objects both mapping to the `breakdowns` DB table — one in `src/drizzle/schema/breakdowns.ts` (canonical) and one in `src/drizzle/schema/maintenance.ts` (duplicate)
- **`existingPatient`**: The Drizzle `.select()` result array in `registerPatient` — always truthy even when empty

---

## Bug Details

### Bug 1 — Routes Not Mounted

The bug manifests when any request is made to `/api/assets`, `/api/patients`, `/api/breakdown`, `/api/checklist`, or `/api/maintenance`. Express has no registered handler for these paths because `server.ts` only mounts `authRoutes`.

**Formal Specification:**
```
FUNCTION isBugCondition_B1(request)
  INPUT: request of type HttpRequest
  OUTPUT: boolean

  RETURN request.path STARTS_WITH ANY_OF [
           '/api/assets', '/api/patients', '/api/breakdown',
           '/api/checklist', '/api/maintenance'
         ]
END FUNCTION
```

**Examples:**
- `GET /api/assets` → 404 (expected: 200 with asset list)
- `POST /api/patients` → 404 (expected: 201 or 409)
- `POST /api/maintenance/breakdown` → 404 (expected: 201)

---

### Bug 2 — False Duplicate Patient Rejection

The bug manifests on every `POST /api/patients` call with a unique phone number. `registerPatient` checks `if (existingPatient)` where `existingPatient` is a Drizzle result array — arrays are always truthy, so the 409 is always thrown.

**Formal Specification:**
```
FUNCTION isBugCondition_B2(request)
  INPUT: request of type HttpRequest (POST /api/patients)
  OUTPUT: boolean

  existingCount := db.select().from(patients)
                     .where(eq(patients.phone, request.body.phone))
                     .limit(1).length

  RETURN existingCount == 0   // unique phone — should succeed, but bug throws 409
END FUNCTION
```

**Examples:**
- `POST /api/patients` with phone `"0501234567"` (not in DB) → 409 Conflict (expected: 201)
- `POST /api/patients` with phone `"0501234567"` (already in DB) → 409 Conflict (correct, preserved)

---

### Bug 3 — Hardcoded Role on Signup

The bug manifests when `POST /api/auth/signup` is called with a `role` field. The controller ignores `req.body.role` and always passes `role: 'technician'` to `registerUser`.

**Formal Specification:**
```
FUNCTION isBugCondition_B3(request)
  INPUT: request of type HttpRequest (POST /api/auth/signup)
  OUTPUT: boolean

  RETURN request.body.role IS_PRESENT
         AND request.body.role != 'technician'
END FUNCTION
```

**Examples:**
- `POST /api/auth/signup` with `role: "admin"` → stored role is `"technician"` (expected: `"admin"`)
- `POST /api/auth/signup` with no `role` field → stored role is `"technician"` (correct default, preserved)

---

### Bug 4 — Route Ordering Swallows `/verify-face`

The bug manifests when `POST /api/patients/verify-face` is called. Express matches the `/:id` wildcard before reaching the `/verify-face` route, so `getPatientById` is called with `id = "verify-face"`.

**Formal Specification:**
```
FUNCTION isBugCondition_B4(request)
  INPUT: request of type HttpRequest
  OUTPUT: boolean

  RETURN request.method == 'POST'
         AND request.path == '/api/patients/verify-face'
END FUNCTION
```

**Examples:**
- `POST /api/patients/verify-face` with a face descriptor → calls `getPatientById("verify-face")` → likely 404 or NaN error (expected: face search result)

---

### Bug 5 — Bearer Token Check Missing Trailing Space

The bug manifests when an `Authorization` header starts with `"Bearer"` but the split on `" "` is unreliable because the check `startsWith("Bearer")` does not require the space separator.

**Formal Specification:**
```
FUNCTION isBugCondition_B5(authHeader)
  INPUT: authHeader of type string
  OUTPUT: boolean

  RETURN authHeader.startsWith("Bearer")
         AND NOT authHeader.startsWith("Bearer ")
         // e.g., "BearerXXX" passes the guard but split(" ")[1] is undefined
END FUNCTION
```

**Examples:**
- Header `"Bearer eyJhbGc..."` → works correctly (preserved)
- Header `"BearereyJhbGc..."` → passes the guard, `split(" ")[1]` is `undefined`, JWT verify throws (expected: 401)

---

### Bug 6 — `createBreakdown` Missing Asset Status Update

The bug manifests when `POST /api/maintenance/breakdown` is called. `maintenance.service.ts::createBreakdown` only inserts the breakdown row; it never updates the asset's `status` to `"breakdown"` as `breakdown.service.ts` does inside a transaction.

**Formal Specification:**
```
FUNCTION isBugCondition_B6(request)
  INPUT: request of type HttpRequest (POST /api/maintenance/breakdown)
  OUTPUT: boolean

  assetStatusAfter := db.select(assets.status)
                        .where(eq(assets.id, request.body.assetId))

  RETURN assetStatusAfter != 'breakdown'
         // asset status unchanged after the call
END FUNCTION
```

**Examples:**
- `POST /api/maintenance/breakdown` with `assetId: 5` → breakdown row created, asset 5 status remains `"active"` (expected: `"breakdown"`)

---

### Bug 7 — Duplicate `breakdowns` Table Definition

The bug manifests when both `maintenance.service.ts` and `breakdown.service.ts` execute queries. Each imports a different Drizzle table object (`breakdowns`) that maps to the same DB table, which can cause Drizzle ORM to generate conflicting query metadata.

**Formal Specification:**
```
FUNCTION isBugCondition_B7(serviceModule)
  INPUT: serviceModule — either maintenance.service or breakdown.service
  OUTPUT: boolean

  RETURN breakdownsTableRef(maintenance.service)
         !== breakdownsTableRef(breakdown.service)
         // two distinct object references for the same DB table
END FUNCTION
```

**Examples:**
- `maintenance.service.ts` imports `breakdowns` from `../drizzle/schema/maintenance`
- `breakdown.service.ts` imports `breakdowns` from `../drizzle/schema/breakdowns`
- Both map to the `"breakdowns"` table but are different JS objects → potential ORM conflicts

---

## Expected Behavior

### Preservation Requirements

**Unchanged Behaviors:**
- `POST /api/auth/login` with valid credentials continues to return 200 + JWT
- `POST /api/auth/signup` with a duplicate email continues to return 409 Conflict
- Requests without an `Authorization` header continue to return 401
- Requests with expired or invalid JWTs continue to return 401
- Role-protected endpoints continue to return 403 for insufficient roles
- Zod validation failures continue to return 400 with field-level errors
- `GET /api/assets/qr/:code` continues to return the matching asset
- `GET /api/patients/:id` with a valid numeric ID continues to return the patient record
- `POST /api/checklist` by an authenticated technician continues to insert and update `lastMaintenance`
- `POST /api/maintenance/assign` by an admin continues to update breakdown status and create a task

**Scope:**
All inputs that do NOT satisfy any of the seven bug conditions above must be completely unaffected by these fixes.

---

## Hypothesized Root Cause

1. **Missing route mounts (B1)**: `server.ts` was partially written — only `authRoutes` was added. The remaining five route files exist but were never imported or mounted.

2. **Array truthiness confusion (B2)**: The developer likely intended to check whether a record was found but forgot that Drizzle returns an array. `if (existingPatient)` is always `true`; the correct check is `if (existingPatient.length > 0)`.

3. **Hardcoded role (B3)**: The controller was written with a hardcoded `role: 'technician'` object literal. The `signupSchema` already accepts an optional `role` enum, but the controller never reads it from `req.body`.

4. **Route ordering (B4)**: Express matches routes in declaration order. `/:id` was declared before `/verify-face`, so `"verify-face"` is captured as the `:id` param. Moving `/verify-face` above `/:id` routes fixes this.

5. **Missing space in Bearer check (B5)**: `startsWith("Bearer")` without a trailing space is a common typo. It allows headers like `"BearerXXX"` to pass the guard, after which `split(" ")[1]` returns `undefined` and JWT verification throws an unexpected error.

6. **Missing transaction in maintenance service (B6)**: `maintenance.service.ts::createBreakdown` was written independently of `breakdown.service.ts`. The asset-status update step was omitted. The fix is to replicate the transaction pattern from `breakdown.service.ts`.

7. **Duplicate schema definition (B7)**: `src/drizzle/schema/maintenance.ts` re-declares the `breakdowns` table instead of importing it from `src/drizzle/schema/breakdowns.ts`. This creates two distinct Drizzle table objects for the same DB table. The fix is to remove the duplicate declaration and import the canonical one.

---

## Correctness Properties

Property 1: Bug Condition — Unmounted Routes Return Non-404

_For any_ HTTP request whose path starts with `/api/assets`, `/api/patients`, `/api/breakdown`, `/api/checklist`, or `/api/maintenance`, the fixed server SHALL route the request to the correct handler and SHALL NOT return 404 due to a missing route mount.

**Validates: Requirements 2.1**

Property 2: Bug Condition — Unique Phone Allows Patient Creation

_For any_ `POST /api/patients` request where the phone number does not already exist in the database, the fixed `registerPatient` function SHALL insert the patient and return 201, because the duplicate check SHALL use `existingPatient.length > 0`.

**Validates: Requirements 2.2**

Property 3: Bug Condition — Signup Respects Provided Role

_For any_ `POST /api/auth/signup` request that includes a valid `role` field, the fixed controller SHALL register the user with that role; when no role is provided it SHALL default to `"technician"`.

**Validates: Requirements 2.3**

Property 4: Bug Condition — `/verify-face` Routes to Correct Handler

_For any_ `POST /api/patients/verify-face` request, the fixed router SHALL invoke the `verifyFace` controller handler and SHALL NOT treat `"verify-face"` as an `:id` parameter.

**Validates: Requirements 2.4**

Property 5: Bug Condition — Bearer Token Extraction Is Reliable

_For any_ `Authorization` header of the form `"Bearer <token>"`, the fixed `authGuard` SHALL correctly extract the token. Headers that do not contain a space after `"Bearer"` SHALL be rejected with 401.

**Validates: Requirements 2.5**

Property 6: Bug Condition — Breakdown Creation Updates Asset Status

_For any_ call to `POST /api/maintenance/breakdown`, the fixed `createBreakdown` in `maintenance.service.ts` SHALL insert the breakdown record AND update the related asset's `status` to `"breakdown"` within a single transaction.

**Validates: Requirements 2.6**

Property 7: Bug Condition — Single Canonical `breakdowns` Table Reference

_For any_ breakdown-related query executed by either `maintenance.service.ts` or `breakdown.service.ts`, both services SHALL reference the same Drizzle table object imported from `src/drizzle/schema/breakdowns.ts`.

**Validates: Requirements 2.7**

Property 8: Preservation — Existing Auth and Route Behaviors Unchanged

_For any_ input that does NOT satisfy any of the seven bug conditions (C1–C7), the fixed codebase SHALL produce exactly the same behavior as the original codebase, preserving all login, signup-duplicate, 401/403 enforcement, Zod validation, asset QR lookup, patient lookup, checklist insert, and maintenance-assign behaviors.

**Validates: Requirements 3.1, 3.2, 3.3, 3.4, 3.5, 3.6, 3.7, 3.8, 3.9, 3.10**

---

## Fix Implementation

### Bug 1 — Mount Missing Routes

**File**: `src/server.ts`

**Changes**:
1. Import `assetRoutes`, `patientRoutes`, `breakdownRoutes`, `checklistRoutes`, `maintenanceRoutes`
2. Add `app.use("/api/assets", assetRoutes)`, `app.use("/api/patients", patientRoutes)`, `app.use("/api/breakdown", breakdownRoutes)`, `app.use("/api/checklist", checklistRoutes)`, `app.use("/api/maintenance", maintenanceRoutes)`

---

### Bug 2 — Fix Duplicate Patient Check

**File**: `src/services/patient.service.ts`

**Function**: `registerPatient`

**Change**: Replace `if (existingPatinet)` with `if (existingPatinet.length > 0)`

---

### Bug 3 — Pass Role from Request Body

**File**: `src/controller/auth.controller.ts`

**Function**: `signup`

**Change**: Replace `role: 'technician'` with `role: role ?? 'technician'` and destructure `role` from `req.body`

---

### Bug 4 — Reorder Patient Routes

**File**: `src/routes/patient.routes.ts`

**Change**: Move `router.post("/verify-face", ...)` to be declared before `router.get("/:id", ...)`, `router.patch("/:id", ...)`, and `router.delete("/:id", ...)`

---

### Bug 5 — Add Trailing Space to Bearer Check

**File**: `src/middleware/auth.middleware.ts`

**Function**: `authGuard`

**Change**: Replace `authHeader.startsWith("Bearer")` with `authHeader.startsWith("Bearer ")`

---

### Bug 6 — Add Asset Status Update to Maintenance createBreakdown

**File**: `src/services/maintenance.service.ts`

**Function**: `createBreakdown`

**Changes**:
1. Import `assets` from `../drizzle/schema/assets`
2. Wrap the insert in `db.transaction(async (tx) => { ... })` 
3. Add `tx.update(assets).set({ status: 'breakdown' }).where(eq(assets.id, data.assetId))` inside the transaction

---

### Bug 7 — Remove Duplicate `breakdowns` Table Definition

**File**: `src/drizzle/schema/maintenance.ts`

**Changes**:
1. Remove the `breakdowns` table declaration from this file
2. Add `import { breakdowns } from './breakdowns'` so `tasks` foreign key reference still resolves
3. Update `src/services/maintenance.service.ts` import to use `{ breakdowns } from '../drizzle/schema/breakdowns'` (and keep `{ tasks }` from `../drizzle/schema/maintenance`)

---

## Testing Strategy

### Validation Approach

The testing strategy follows a two-phase approach: first, surface counterexamples that demonstrate each bug on unfixed code, then verify the fix works correctly and preserves existing behavior.

---

### Exploratory Bug Condition Checking

**Goal**: Surface counterexamples that demonstrate each bug BEFORE implementing the fix. Confirm or refute the root cause analysis.

**Test Plan**: Write integration/unit tests that exercise each bug condition against the unfixed code and assert the defective behavior is observable.

**Test Cases**:
1. **B1 — Unmounted Routes**: Send `GET /api/assets` and assert 404 (will fail after fix)
2. **B2 — False Duplicate**: Call `registerPatient` with a unique phone and assert it throws 409 (will fail after fix)
3. **B3 — Hardcoded Role**: Call `signup` with `role: "admin"` and assert stored role is `"technician"` (will fail after fix)
4. **B4 — Route Ordering**: Send `POST /api/patients/verify-face` and assert the `verifyFace` handler is NOT called (will fail after fix)
5. **B5 — Bearer Space**: Call `authGuard` with header `"BearerXXX"` and assert it does not correctly reject (will fail after fix)
6. **B6 — Missing Asset Update**: Call `createBreakdown` in maintenance service and assert asset status is NOT `"breakdown"` (will fail after fix)
7. **B7 — Duplicate Table Ref**: Assert `breakdownsRef(maintenance.service) !== breakdownsRef(breakdown.service)` (will fail after fix)

**Expected Counterexamples**:
- Routes return 404 for all non-auth paths
- `registerPatient` always throws 409 regardless of phone uniqueness
- Stored user role is always `"technician"` regardless of input
- `"verify-face"` is treated as an `:id` param
- Malformed Bearer headers pass the guard
- Asset status unchanged after breakdown creation
- Two distinct JS objects for the same DB table

---

### Fix Checking

**Goal**: Verify that for all inputs where each bug condition holds, the fixed code produces the expected behavior.

**Pseudocode:**
```
FOR ALL request WHERE isBugCondition_Bn(request) DO
  result := fixedHandler(request)
  ASSERT expectedBehavior_n(result)
END FOR
```

---

### Preservation Checking

**Goal**: Verify that for all inputs where no bug condition holds, the fixed code produces the same result as the original code.

**Pseudocode:**
```
FOR ALL input WHERE NOT ANY isBugCondition_Bn(input) DO
  ASSERT originalHandler(input) = fixedHandler(input)
END FOR
```

**Testing Approach**: Property-based testing is recommended for preservation checking because it generates many test cases automatically, catches edge cases manual tests miss, and provides strong guarantees across the full input domain.

**Test Cases**:
1. **Login Preservation**: Valid credentials still return 200 + JWT after all fixes
2. **Duplicate Email Preservation**: Signup with existing email still returns 409
3. **401 Preservation**: Missing/expired/invalid tokens still return 401
4. **403 Preservation**: Insufficient role still returns 403
5. **Zod Validation Preservation**: Invalid bodies still return 400 with field errors
6. **Asset QR Lookup Preservation**: `GET /api/assets/qr/:code` still returns the asset
7. **Patient Lookup Preservation**: `GET /api/patients/:id` still returns the patient
8. **Checklist Insert Preservation**: `POST /api/checklist` still inserts and updates `lastMaintenance`
9. **Maintenance Assign Preservation**: `POST /api/maintenance/assign` still creates task and updates breakdown status

---

### Unit Tests

- Test `registerPatient` with unique phone → expect 201, not 409
- Test `registerPatient` with duplicate phone → expect 409 (preserved)
- Test `authGuard` with `"Bearer <token>"` → expect token extracted correctly
- Test `authGuard` with `"BearerXXX"` → expect 401
- Test `authGuard` with no header → expect 401 (preserved)
- Test `signup` controller with `role: "admin"` → expect stored role `"admin"`
- Test `signup` controller with no role → expect stored role `"technician"` (preserved)

### Property-Based Tests

- Generate random valid phone numbers not in DB → `registerPatient` always returns 201
- Generate random `Authorization` headers not matching `"Bearer <token>"` pattern → `authGuard` always returns 401
- Generate random valid `Bearer <token>` headers → `authGuard` always extracts token correctly
- Generate random signup payloads with valid roles → stored role always matches input role
- Generate random signup payloads without role → stored role always defaults to `"technician"`

### Integration Tests

- Full flow: mount all routes → `GET /api/assets` returns non-404
- Full flow: `POST /api/patients/verify-face` reaches `verifyFace` handler
- Full flow: `POST /api/maintenance/breakdown` → breakdown row created AND asset status updated to `"breakdown"`
- Full flow: both services query `breakdowns` table without ORM conflicts
- Regression: login → get token → call protected route → 200
- Regression: call protected route without token → 401
