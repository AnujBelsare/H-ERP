# Implementation Plan

- [x] 1. Write bug condition exploration tests
  - **Property 1: Bug Condition** - Seven API Bugs (B1–B7)
  - **CRITICAL**: These tests MUST FAIL on unfixed code — failure confirms each bug exists
  - **DO NOT attempt to fix the tests or the code when they fail**
  - **NOTE**: These tests encode the expected behavior — they will validate the fixes when they pass after implementation
  - **GOAL**: Surface counterexamples that demonstrate each bug exists
  - **Scoped PBT Approach**: For deterministic bugs, scope each property to the concrete failing case(s) to ensure reproducibility
  - B1 — Send `GET /api/assets` and assert response is NOT 404 (unmounted routes)
  - B2 — Call `registerPatient` with a unique phone number and assert it returns 201, not 409 (array truthiness)
  - B3 — Call `POST /api/auth/signup` with `role: "admin"` and assert stored role is `"admin"`, not `"technician"` (hardcoded role)
  - B4 — Send `POST /api/patients/verify-face` and assert the `verifyFace` handler is invoked, not `getPatientById` (route ordering)
  - B5 — Call `authGuard` with header `"BearereyJhbGc..."` (no space) and assert it returns 401 (missing space in Bearer check)
  - B6 — Call `POST /api/maintenance/breakdown` and assert asset status is updated to `"breakdown"` (missing asset update)
  - B7 — Assert that `breakdownsTableRef` in `maintenance.service` and `breakdown.service` are the same object reference (duplicate table def)
  - Run all tests on UNFIXED code
  - **EXPECTED OUTCOME**: All tests FAIL (this is correct — it proves each bug exists)
  - Document counterexamples found to understand root cause
  - Mark task complete when tests are written, run, and failures are documented
  - _Requirements: 1.1, 1.2, 1.3, 1.4, 1.5, 1.6, 1.7_

- [x] 2. Write preservation property tests (BEFORE implementing fix)
  - **Property 2: Preservation** - Existing Auth and Route Behaviors Unchanged
  - **IMPORTANT**: Follow observation-first methodology
  - Observe: `POST /api/auth/login` with valid credentials returns 200 + JWT on unfixed code
  - Observe: `POST /api/auth/signup` with duplicate email returns 409 on unfixed code
  - Observe: Requests without `Authorization` header return 401 on unfixed code
  - Observe: Requests with expired/invalid JWT return 401 on unfixed code
  - Observe: Insufficient-role requests return 403 on unfixed code
  - Observe: Invalid Zod bodies return 400 with field errors on unfixed code
  - Write property-based tests capturing all observed behaviors from Preservation Requirements in design
  - Property-based testing generates many test cases for stronger guarantees across the full input domain
  - Run tests on UNFIXED code
  - **EXPECTED OUTCOME**: Tests PASS (this confirms baseline behavior to preserve)
  - Mark task complete when tests are written, run, and passing on unfixed code
  - _Requirements: 3.1, 3.2, 3.3, 3.4, 3.5, 3.6, 3.7, 3.8, 3.9, 3.10_

- [x] 3. Fix all seven API bugs

  - [x] 3.1 Bug 1 — Mount missing routes in server.ts
    - Import `assetRoutes`, `patientRoutes`, `breakdownRoutes`, `checklistRoutes`, `maintenanceRoutes` from their respective route files
    - Add `app.use("/api/assets", assetRoutes)`, `app.use("/api/patients", patientRoutes)`, `app.use("/api/breakdown", breakdownRoutes)`, `app.use("/api/checklist", checklistRoutes)`, `app.use("/api/maintenance", maintenanceRoutes)` in `src/server.ts`
    - _Bug_Condition: isBugCondition_B1(request) — request.path starts with any unmounted prefix_
    - _Expected_Behavior: request routes to correct handler, does not return 404_
    - _Preservation: auth routes and error middleware behavior unchanged_
    - _Requirements: 2.1_

  - [x] 3.2 Bug 2 — Fix false duplicate patient rejection
    - In `src/services/patient.service.ts`, function `registerPatient`
    - Replace `if (existingPatinet)` with `if (existingPatinet.length > 0)`
    - _Bug_Condition: isBugCondition_B2(request) — phone not in DB, existingPatient array is empty_
    - _Expected_Behavior: patient inserted, 201 returned_
    - _Preservation: duplicate phone still returns 409_
    - _Requirements: 2.2_

  - [x] 3.3 Bug 3 — Pass role from request body on signup
    - In `src/controller/auth.controller.ts`, function `signup`
    - Destructure `role` from `req.body`
    - Replace hardcoded `role: 'technician'` with `role: role ?? 'technician'`
    - _Bug_Condition: isBugCondition_B3(request) — request.body.role present and != 'technician'_
    - _Expected_Behavior: user registered with provided role_
    - _Preservation: no role in body still defaults to 'technician'; duplicate email still returns 409_
    - _Requirements: 2.3_

  - [x] 3.4 Bug 4 — Reorder patient routes so /verify-face precedes /:id
    - In `src/routes/patient.routes.ts`
    - Move `router.post("/verify-face", ...)` declaration above all `/:id` wildcard routes
    - _Bug_Condition: isBugCondition_B4(request) — POST /api/patients/verify-face_
    - _Expected_Behavior: verifyFace handler invoked, not getPatientById_
    - _Preservation: GET/PATCH/DELETE /:id with valid numeric IDs still work correctly_
    - _Requirements: 2.4_

  - [x] 3.5 Bug 5 — Add trailing space to Bearer token check
    - In `src/middleware/auth.middleware.ts`, function `authGuard`
    - Replace `authHeader.startsWith("Bearer")` with `authHeader.startsWith("Bearer ")`
    - _Bug_Condition: isBugCondition_B5(authHeader) — starts with "Bearer" but not "Bearer "_
    - _Expected_Behavior: malformed Bearer headers rejected with 401_
    - _Preservation: valid "Bearer <token>" headers still extract token correctly_
    - _Requirements: 2.5_

  - [x] 3.6 Bug 6 — Add asset status update to maintenance createBreakdown
    - In `src/services/maintenance.service.ts`, function `createBreakdown`
    - Import `assets` from `../drizzle/schema/assets`
    - Wrap the breakdown insert in `db.transaction(async (tx) => { ... })`
    - Add `await tx.update(assets).set({ status: 'breakdown' }).where(eq(assets.id, data.assetId))` inside the transaction
    - _Bug_Condition: isBugCondition_B6(request) — POST /api/maintenance/breakdown, asset status unchanged after call_
    - _Expected_Behavior: breakdown row inserted AND asset status set to 'breakdown' atomically_
    - _Preservation: maintenance assign endpoint behavior unchanged_
    - _Requirements: 2.6_

  - [x] 3.7 Bug 7 — Remove duplicate breakdowns table definition
    - In `src/drizzle/schema/maintenance.ts`, remove the `breakdowns` table declaration
    - Add `import { breakdowns } from './breakdowns'` so the `tasks` foreign key reference still resolves
    - In `src/services/maintenance.service.ts`, update import to use `{ breakdowns } from '../drizzle/schema/breakdowns'` (keep `{ tasks }` from `../drizzle/schema/maintenance`)
    - _Bug_Condition: isBugCondition_B7(serviceModule) — two distinct JS objects for same DB table_
    - _Expected_Behavior: both services reference the same canonical breakdowns table object_
    - _Preservation: all breakdown and task queries continue to function correctly_
    - _Requirements: 2.7_

  - [x] 3.8 Verify bug condition exploration tests now pass
    - **Property 1: Expected Behavior** - Seven API Bugs (B1–B7)
    - **IMPORTANT**: Re-run the SAME tests from task 1 — do NOT write new tests
    - The tests from task 1 encode the expected behavior for all seven bugs
    - When these tests pass, it confirms all expected behaviors are satisfied
    - Run all bug condition exploration tests from step 1
    - **EXPECTED OUTCOME**: All tests PASS (confirms all bugs are fixed)
    - _Requirements: 2.1, 2.2, 2.3, 2.4, 2.5, 2.6, 2.7_

  - [x] 3.9 Verify preservation tests still pass
    - **Property 2: Preservation** - Existing Auth and Route Behaviors Unchanged
    - **IMPORTANT**: Re-run the SAME tests from task 2 — do NOT write new tests
    - Run all preservation property tests from step 2
    - **EXPECTED OUTCOME**: Tests PASS (confirms no regressions)
    - Confirm all tests still pass after fixes (no regressions)

- [x] 4. Checkpoint — Ensure all tests pass
  - Ensure all tests pass; ask the user if questions arise
