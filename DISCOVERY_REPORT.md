# Architecture Reconnaissance Report

## Executive Summary

This repository is a legacy Spring Boot KYC and account-opening system for Sahayog Multi-State. Its main purpose is to let branch-side users collect customer KYC data and documents, route records through internal verification and approval, and maintain branch/user access controls around those records.

The codebase is a monolithic Java application with a static AngularJS-style frontend. The active backend is narrower than the frontend suggests: the live controller surface appears centered on authentication, branch access, and one consolidated KYC flow for saving/current accounts. Several older account-type-specific controllers and services remain in the repository but are commented out or partially migrated.

## What Problem Does This System Solve?

The system supports KYC intake and approval for bank/cooperative account opening. It captures applicant identity data, Aadhaar/mobile/account type/branch metadata, uploaded supporting documents, and approval outcomes.

The business problem is operational: branch staff need a way to submit KYC packets, central/back-office staff need a way to verify and approve or reject them, and administrators need to manage users and branch access.

## Main Business Purpose

- Create and track KYC records for account-opening workflows.
- Store customer document packets outside the database while keeping record metadata in PostgreSQL.
- Support role-based review between branch-originating users and approval users.
- Maintain user records, branch access assignments, and user status lifecycle.
- Optionally integrate with Zoop for Aadhaar OTP and PAN verification.

## Major User Journeys

1. Login and role routing
   - User signs in.
   - Role determines workspace: BOM, COPs/COP, or Super User.
   - The newer backend uses JWT authentication; older frontend code still contains legacy local-storage/user endpoint assumptions.

2. BOM KYC intake
   - BOM user selects account type and branch.
   - Applicant details and document files are uploaded.
   - System creates a KYC record in draft state and stores files under the configured upload root.
   - Record receives a branch-based acknowledgement/code.

3. BOM submission for verification
   - Draft KYC is submitted.
   - Status moves to pending verification.
   - Async verification is triggered.
   - Verification outcome moves the record toward verified or failed.

4. COP/COPs approval review
   - Approval user reviews verified KYC records.
   - Record can be approved or rejected.
   - Audit trail records the review action.

5. Rework after rejection
   - A rejected record can be edited by BOM.
   - Edit resets rejection metadata and returns the record to draft.
   - Record can be resubmitted.

6. Super User / administration
   - User records are created, approved, rejected, terminated, reset, or deleted.
   - Branch access lists are maintained per user.
   - This journey is clearly represented in frontend and service code, but no active `UserRecordController` exists in the scanned controller package.

7. External identity check
   - Frontend includes Aadhaar OTP and PAN verification screens.
   - Backend has a Zoop service and disabled Zoop controller.
   - Integration is present but disabled by configuration.

## Core Business Flows

### Active KYC Flow

`DRAFT -> PENDING_VERIFICATION -> VERIFIED -> APPROVED`

Alternative outcomes:

- `PENDING_VERIFICATION -> FAILED`
- `VERIFIED -> REJECTED`
- `REJECTED -> DRAFT` on BOM edit

This is the most explicit and currently active business workflow in the backend.

### Legacy KYC Flow

Older commented code and frontend scripts indicate a previous flow using statuses such as:

- `Pending at COPs`
- `Pending at BOM`
- `Approved`
- document-level `Accept` / `Reject`

This legacy flow appears to support multiple account categories and document-by-document review. It is no longer cleanly aligned with the active backend state model.

### User Administration Flow

User records have lifecycle statuses:

- `Pending`
- `Accept`
- `Reject`
- `Terminate`
- `Reset_Password`

These statuses drive login eligibility and Super User dashboards in the frontend. Backend services and repository queries support the lifecycle, but active controller coverage appears incomplete.

## Services and Modules

### Backend Modules

- Application bootstrap: Spring Boot application entry point.
- Security: JWT token generation, JWT request filter, Spring Security configuration, BCrypt password encoding.
- Authentication: `/auth/login`.
- KYC active workflow: `/kyc` controller and `KycSavingAndCurrentService`.
- Async verification: `KycVerificationService` with a dedicated task executor.
- Audit: `KycAudit` entity and repository.
- Branch access: `/branch` controller and branch access service.
- User records: user service and repository; controller not present in active source.
- Zoop integration: conditional service and commented controller.
- Account-specific KYC modules: saving/current, joint saving, sole proprietorship, partnership, public/private company, TASC. Most account-specific controller/service code is commented or legacy.

### Frontend Modules

- Static HTML pages for login, super user, BOM, COPs, and user forms.
- AngularJS modules/controllers for each KYC form type.
- Client-side report export with XLSX.
- Client-side PDF/image handling helpers.
- Client-side Zoop Aadhaar/PAN verification calls.

## Database Schema and Ownership

The database is PostgreSQL, configured through JPA with `ddl-auto=update`. No migration framework was found.

### Core Tables Inferred from Entities

- `KycSavingAndCurrent`
  - Owned by active KYC workflow.
  - Stores account type, branch, applicant, Aadhaar, mobile, status, remarks, approver/rejector metadata, verification counters, and document base path.

- `KycAudit`
  - Owned by active KYC workflow.
  - Stores action history by KYC ID.

- `UserRecord`
  - Owned by user administration and authentication.
  - Stores username, password hash, branch, role/user type, status, and remark.

- `BranchAccess`
  - Owned by branch access administration.
  - Stores username, branch list, user type, user status, and primary branch.

- `KycJointSaving`, `KycSoleProprietorship`, `KycPartnership`, `KycPubPvt`, `KycTasc`
  - Represent additional account-type-specific KYC tables.
  - Their active backend exposure is unclear because controllers/services are mostly commented out.

### Schema Ownership Pattern

Ownership is entity/service based rather than bounded-context based. Each account type has its own entity/repository, while common lifecycle fields are centralized in `BaseKycModel`.

### Schema Risks Worth Deeper Analysis

- JPA `ddl-auto=update` means schema evolution is implicit.
- No explicit database migration files were found.
- Some table/entity fields reflect old blob storage while active flow now prefers filesystem paths.
- User and branch access records overlap in user type/status/branch fields.

## External Integrations

### PostgreSQL

Primary persistence layer. The configured database name is `kyc_saving_and_current`.

### Zoop

Third-party KYC identity API integration for:

- Aadhaar OTP request.
- Aadhaar OTP verification.
- PAN verification.

The service is conditional on `zoop.enabled=true`; current config has it disabled. Frontend still contains calls to `/api/zoop/...`, while the backend Zoop controller is commented.

### Legacy KYC Service

Commented code references a remote KYC lookup endpoint at `http://10.0.115.6:9096/kyc/getAadhar/`. This appears to support old-record lookup by Aadhaar, but it is not active in the current service code.

## State Machines

### Active KYC State Machine

States:

- `DRAFT`
- `PENDING_VERIFICATION`
- `VERIFIED`
- `FAILED`
- `APPROVED`
- `REJECTED`

Business ownership:

- BOM creates, edits, submits, and deletes non-approved records.
- Async verification moves submitted records to verified or failed.
- COP approves or rejects verified records.

Most business-critical state machine:

- Active KYC lifecycle, because it gates account-opening approval.

### User State Machine

States appear as string values:

- `Pending`
- `Accept`
- `Reject`
- `Terminate`
- `Reset_Password`

Business ownership:

- Super User/admin workflow.
- Affects login eligibility and dashboard grouping.

### Legacy Document Review State Machine

Older frontend and commented services use document status values such as:

- `Accept`
- `Reject`

These statuses appear to determine whether a COPs reviewer can approve or send back records. This may still matter to the frontend, but active backend entities no longer expose the full old document-review contract consistently.

## Scheduled Jobs

No active scheduled jobs were found. There is async processing, but no `@Scheduled` or scheduling configuration was identified.

## Event-Driven Components

No broker-based event architecture was found. There are no active Kafka, RabbitMQ, JMS, SQS, or Spring application event components.

The only asynchronous/event-like component is in-process async verification:

- Trigger: KYC submit.
- Executor: `kycExecutor`.
- Worker: `KycVerificationService.verifyAsync`.
- Outcome: updates status and verification attempts in the database.

## Security Architecture

The active backend security architecture is Spring Security with:

- Stateless JWT authentication.
- `/auth/login` public endpoint.
- Static assets permitted without authentication.
- `/kyc/**` authenticated.
- Method-level role checks for KYC save/update/submit/approve/reject/delete.
- BCrypt password hashing.
- User roles derived from `UserRecord.userType` as `ROLE_<userType>`.

Primary roles inferred:

- `BOM`
- `COP` / `COPs`
- `Super User`

Security areas requiring deeper analysis:

- Role naming mismatch risk between `COP`, `COPs`, and `Super User`.
- Frontend legacy login flow still references MD5 and local-storage user records.
- Branch-level authorization is modeled but not clearly enforced on active `/kyc` read endpoints.
- Actuator exposure is configured as all endpoints.
- JWT secret is present in properties.

## File and Document Storage Architecture

The active KYC flow stores uploaded files on the local filesystem, rooted at:

- `root.path=./uploads`

Files are grouped by:

- Branch.
- CASA category.
- Saving/current folder type.
- Account type.
- Generated KYC code.
- Document category.

Document categories include:

- ID proof.
- Address proof.
- PAN.
- Other documents.
- Client form.

Older code shows additional categories for account-specific entity documents:

- Entity proof.
- Partnership document.
- Company document.
- TASC document.

The active entity stores `documentBasePath`, while old/commented code sometimes stores or reconstructs byte arrays. This indicates an ongoing or incomplete migration from database/blob-style document handling to filesystem-based document storage.

## Workflow Engines

No external workflow engine was found. No Camunda, Flowable, Temporal, Activiti, BPMN, or similar engine is present.

Workflow is implemented directly in service methods and enum/string states.

## Third-Party API Integrations

Identified:

- Zoop Aadhaar OTP and PAN verification API.

Potential/legacy:

- Internal remote legacy KYC lookup service by Aadhaar.

No payment gateways, email/SMS providers, cloud storage APIs, or message brokers were found in active code.

## Which Flow Appears Most Business Critical?

The most business-critical flow is:

`BOM KYC intake -> document upload -> submit -> verification -> COP approval/rejection`

This flow directly determines whether a KYC packet can be accepted for account opening. It also contains the core controls around document capture, status progression, audit history, and role separation.

## Which Parts Contain the Most Complex Logic?

- KYC lifecycle management and state transitions.
- File/document storage path generation and document category handling.
- Async verification and retry behavior.
- Legacy-to-new workflow mismatch across frontend, controllers, and services.
- Branch access scoping and user role/status handling.
- Account-type-specific KYC variants, especially non-individual accounts with additional documents and multiple applicants/signatories.

## Which Parts Are Mostly CRUD?

- Branch access management.
- User record management.
- Basic KYC record retrieval/list/delete operations.
- Audit history retrieval.
- Static frontend pages and form templates.

## Components That Deserve Deep Analysis

1. Active KYC service and controller
   - This is the current business-critical workflow.

2. Frontend/backend API alignment
   - The static frontend contains many calls to routes that do not match active controllers.

3. Security and authorization
   - JWT is active, but role names, branch access, legacy local-storage login, and actuator exposure need review.

4. Document storage
   - Local filesystem storage is central to the system and likely operationally sensitive.

5. KYC state model
   - Active enum states and legacy string states appear to coexist conceptually.

6. Account-type-specific KYC modules
   - They are represented in entities/frontend, but active backend behavior is unclear.

7. User administration
   - Services and frontend exist, but active controller coverage appears missing.

8. Zoop integration
   - Present but disabled/commented; should be analyzed if external verification is business-required.

## Architecture Classification

This is a monolithic web application with:

- Spring Boot backend.
- JPA/PostgreSQL persistence.
- Static AngularJS/jQuery frontend served from the backend.
- Local filesystem document storage.
- In-process async verification.
- Direct REST integration for third-party KYC verification when enabled.

It does not currently present as a microservice architecture, event-driven system, or workflow-engine-backed application.

## Reconnaissance Notes

- The repository contains a substantial amount of commented legacy code.
- The compiled `target` directory is present and contains older built artifacts.
- The current active backend appears partially modernized around JWT and the `/kyc` workflow.
- The frontend appears less modernized and still references older endpoints and status vocabulary.
- The architecture should be analyzed as a legacy monolith in transition rather than a clean greenfield Spring Boot system.
