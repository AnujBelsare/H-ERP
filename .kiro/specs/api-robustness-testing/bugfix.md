# Bugfix Requirements Document

## Introduction

The Express.js + Drizzle ORM backend has several bugs that prevent routes and services from functioning correctly. These range from routes never being mounted, a broken duplicate-check guard that blocks all patient creation, conflicting schema imports between services, a hardcoded role on signup, a route ordering issue that swallows a dedicated endpoint, and a malformed Bearer token check in the auth middleware. This document captures the defective behaviors, the correct behaviors, and the existing behaviors that must be preserved.

---

## Bug Analysis

### Current Behavior (Defect)

1.1 WHEN any request is made to `/api/assets`, `/api/patients`, `/api/breakdown`, `/api/checklist`, or `/api/maintenance` THEN the system returns 404 because those route modules are never mounted in `server.ts`

1.2 WHEN a `POST /api/patients` request is made with a unique phone number THEN the system throws a 409 Conflict error because `registerPatient` checks `if (existingPatient)` against an array (always truthy) instead of checking `existingPatient.length > 0`

1.3 WHEN `POST /api/auth/signup` is called with a `role` field in the body THEN the system ignores it and always registers the user as `technician` due to a hardcoded value in the controller

1.4 WHEN `POST /api/patients/verify-face` is called THEN the system routes the request to the `getPatientById` handler (treating `"verify-face"` as an `:id` param) because the `/verify-face` route is declared after `/:id` routes

1.5 WHEN a request is made with a valid `Authorization: Bearer <token>` header THEN the system may fail to extract the token correctly because `authHeader.startsWith("Bearer")` matches without requiring the trailing space, making the split unreliable for edge-case headers

1.6 WHEN `POST /api/maintenance/breakdown` is called THEN the system inserts a breakdown record but does NOT update the related asset's status to `"breakdown"` because `maintenance.service.ts` uses a plain insert without the asset-status update transaction that exists in `breakdown.service.ts`

1.7 WHEN `maintenance.service.ts` and `breakdown.service.ts` both define or import a `breakdowns` table THEN the system has two separate Drizzle table object references for the same database table, which can cause query conflicts and unpredictable ORM behavior

### Expected Behavior (Correct)

2.1 WHEN any request is made to `/api/assets`, `/api/patients`, `/api/breakdown`, `/api/checklist`, or `/api/maintenance` THEN the system SHALL route the request to the correct router by mounting all route modules in `server.ts`

2.2 WHEN a `POST /api/patients` request is made with a unique phone number THEN the system SHALL insert the new patient and return 201, because the duplicate check SHALL compare `existingPatient.length > 0`

2.3 WHEN `POST /api/auth/signup` is called with a valid `role` field THEN the system SHALL register the user with the provided role; when no role is provided it SHALL default to `"technician"`

2.4 WHEN `POST /api/patients/verify-face` is called THEN the system SHALL route the request to the `verifyFace` handler because the `/verify-face` route SHALL be declared before the `/:id` wildcard routes

2.5 WHEN a request is made with a valid `Authorization: Bearer <token>` header THEN the system SHALL correctly extract the token by checking `authHeader.startsWith("Bearer ")` (with a trailing space)

2.6 WHEN `POST /api/maintenance/breakdown` is called THEN the system SHALL insert the breakdown record AND update the related asset's status to `"breakdown"` within a single transaction

2.7 WHEN breakdown-related queries are executed THEN the system SHALL use a single authoritative `breakdowns` table import (from `src/drizzle/schema/breakdowns.ts`) across all services to avoid conflicting Drizzle ORM table references

### Unchanged Behavior (Regression Prevention)

3.1 WHEN `POST /api/auth/login` is called with valid credentials THEN the system SHALL CONTINUE TO return a JWT token and user object with 200

3.2 WHEN `POST /api/auth/signup` is called with an already-registered email THEN the system SHALL CONTINUE TO return 409 Conflict

3.3 WHEN a request is made without an `Authorization` header THEN the system SHALL CONTINUE TO return 401 Unauthorized

3.4 WHEN a request is made with an expired or invalid JWT THEN the system SHALL CONTINUE TO return 401 with the appropriate error message

3.5 WHEN a user with insufficient role calls a role-protected endpoint THEN the system SHALL CONTINUE TO return 403 Forbidden

3.6 WHEN a request body fails Zod schema validation THEN the system SHALL CONTINUE TO return 400 with field-level error details

3.7 WHEN `GET /api/assets/qr/:code` is called with a valid QR code THEN the system SHALL CONTINUE TO return the matching asset

3.8 WHEN `GET /api/patients/:id` is called with a valid numeric ID THEN the system SHALL CONTINUE TO return the matching patient record

3.9 WHEN `POST /api/checklist` is called by an authenticated technician with valid data THEN the system SHALL CONTINUE TO insert the checklist and update the asset's `lastMaintenance` timestamp

3.10 WHEN `POST /api/maintenance/assign` is called by an admin THEN the system SHALL CONTINUE TO update the breakdown status to `"assigned"` and create a task record
