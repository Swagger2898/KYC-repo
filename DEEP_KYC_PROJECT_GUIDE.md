# KYC Project Deep Understanding and Interview Guide

This document reverse-engineers the current KYC project from the implementation. It is written for a developer who needs to understand the system end to end, explain it in interviews, and reason about its design choices, strengths, limitations, and business rules.

Important scope note: the active modern backend lifecycle is implemented through `KycSavingAndCurrentController` at `/kyc` and `KycSavingAndCurrentService`. Several older product-specific controllers and services exist for TASC, sole proprietorship, partnership, public/private company, and joint saving, but many controller classes are commented out. They show earlier product-specific direction, while the active secured lifecycle is centered on saving/current KYC.

## 1. Project Overview

### Business Problem

This project solves branch-level KYC intake and review for a financial institution. Branch users upload customer KYC documents, enter applicant details, submit the case for automated verification, and then a separate reviewer approves or rejects the record. The system is designed around controlled access, maker-checker segregation, branch authorization, auditability, and document retention.

The core business problem is: a bank or cooperative branch needs to open accounts or maintain customer records, but the institution must prove that identity documents were collected, verified, reviewed by an authorized person, and traceably approved or rejected.

Without this system, KYC handling would likely happen through shared folders, spreadsheets, or manual handoffs. That creates risks: unauthorized approvals, missing evidence, unclear ownership, no branch segregation, no reliable audit trail, and weak interview/compliance defensibility.

### Main Actors

`BOM` means Branch Operations Manager. In this implementation, the BOM is the maker. BOM users create KYC records, upload documents, update drafts or rejected records, submit records for verification, view only their own home branch records, and delete non-approved records.

`COP` means centralized operations/checking role. In this implementation, the COP is the checker. COP users view authorized non-home branches, review verified records, approve records, or reject records with a reason. COP users cannot approve their own home branch records.

`ADMIN` manages system configuration such as branch access. Admin users control who has access to which branch list and can access the restricted actuator endpoints.

`Applicant/customer` is the person whose KYC is being captured. The customer does not directly authenticate into the backend. Their identity is represented by applicant name, mobile number, Aadhaar number, account type, branch, and uploaded documents.

`External verification provider` is represented by the Zoop-related service. The real Zoop API path is currently disabled by property and endpoint comments; the active async verification is simulated/randomized.

### Overall Architecture

The application is a Spring Boot monolith. It contains the REST API, security, business logic, persistence, static frontend assets, file storage, and async verification in one deployable JAR.

The layers are:

1. Static frontend assets under `src/main/resources/static`, including HTML and JavaScript pages for user, BOM, COP, and form workflows.
2. REST controllers under `controller`, which map HTTP endpoints to service calls.
3. Security layer under `config` and `security`, which authenticates login requests, validates JWTs, derives roles, and enforces authenticated access.
4. Service layer under `service`, which enforces business rules, state transitions, branch authorization, file handling, async submission, and audit logging.
5. Repository layer under `repository`, using Spring Data JPA to persist entities and query branch/KYC/user/audit data.
6. Model layer under `model`, representing users, branch access, KYC records, audit records, and KYC status.
7. Filesystem storage under `root.path`, defaulting to `./uploads`, where uploaded documents are written outside the database.

### Technology Stack

Visible versions:

| Component | Version or Source |
|---|---|
| Java | 17 |
| Spring Boot | 2.7.18 |
| Spring Web | from Boot parent |
| Spring Security | from Boot parent |
| Spring Data JPA | from Boot parent |
| Spring Validation | from Boot parent |
| PostgreSQL JDBC driver | 42.2.5 |
| JJWT | 0.11.5 |
| Lombok | 1.18.30 |
| Apache POI | 3.9 |
| BCrypt | Spring Security `BCryptPasswordEncoder` |
| Database | PostgreSQL |
| Frontend | static HTML, AngularJS-era JavaScript, Bootstrap assets |

Runtime properties:

| Setting | Value |
|---|---|
| Server port | 9091 |
| Upload max file size | 30MB |
| Upload max request size | 30MB |
| DB URL | `jdbc:postgresql://localhost:5432/kyc_saving_and_current` |
| JPA DDL | `spring.jpa.hibernate.ddl-auto=update` |
| JWT expiration | 86400000 ms, 24 hours |
| File root | `./uploads` |
| Zoop enabled | `false` |
| Tomcat max threads | 100 |
| Hikari max pool size | 30 |
| Actuator exposure | `health,info` only |

Secrets are externalized through environment variables: `JWT_SECRET`, `DB_USERNAME`, and `DB_PASSWORD`.

### Security Architecture at a High Level

Security is stateless. The user logs in with username and password at `/auth/login`. Spring Security authenticates the credentials using `CustomUserDetailsService`, which loads `UserRecord`, blocks inactive users, and maps `userType` to a Spring role. On success, `JwtTokenUtil` issues a signed JWT. Later requests send `Authorization: Bearer <token>`.

`JwtAuthenticationFilter` runs once per request. It extracts the token, validates the signature and expiration, reloads the user, and puts an authenticated principal into `SecurityContextHolder`. From there, both URL authorization and method-level `@PreAuthorize` checks work.

Important current security behavior:

1. Only users with `UserRecord.userIdStatus = Accept` can authenticate.
2. Roles are derived from `UserRecord.userType` as `ROLE_<userType>`.
3. `/actuator/**` requires `ROLE_ADMIN`.
4. Only actuator `health` and `info` are exposed.
5. Branch access endpoints require `ROLE_ADMIN`.
6. KYC service actions are protected by role through `@PreAuthorize`.
7. Audit identity is taken from `SecurityContextHolder`, not client-provided usernames.
8. COP branch authorization is enforced before approve/reject and during branch-filtered reads.

### File Storage Architecture

The application stores uploaded documents on the local filesystem, not as database blobs. The database stores metadata and the document base path. The default root is `./uploads`.

For saving/current records, files are stored by branch, account category, account type, generated code, and document category:

```text
./uploads/{branchName}/CASA/{Saving|Current}/{accountType}/{code}/idProof/id_0
./uploads/{branchName}/CASA/{Saving|Current}/{accountType}/{code}/addressProof/addr_0
./uploads/{branchName}/CASA/{Saving|Current}/{accountType}/{code}/pan/pan_0
./uploads/{branchName}/CASA/{Saving|Current}/{accountType}/{code}/otherDoc/other_0
./uploads/{branchName}/CASA/{Saving|Current}/{accountType}/{code}/clientForm/form_0
```

The current file naming does not preserve original filenames or extensions.

### Async Processing Architecture

Submission starts asynchronous verification using `KycVerificationService.verifyAsync(id)`, executed on the named `kycExecutor`. The executor is configured with:

| Setting | Value |
|---|---|
| Core pool size | 15 |
| Max pool size | 65 |
| Queue capacity | 70 |
| Thread name prefix | `KYC-` |
| Rejection policy | default `AbortPolicy` because `CallerRunsPolicy` is commented out |

Async verification is used so `/kyc/{id}/submit` can return quickly instead of blocking the HTTP request while verification performs slow external or simulated work.

### 2-Minute Interview Explanation

"This project is a Spring Boot KYC workflow system for branch-based banking operations. A branch operations user, the BOM, creates a KYC record for a customer, uploads identity and supporting documents, and submits the case. The system stores the documents on the filesystem and keeps the KYC metadata in PostgreSQL through Spring Data JPA.

Security is stateless with JWT. Login validates a `UserRecord`, blocks inactive users unless their status is `Accept`, maps `userType` to Spring roles like `BOM`, `COP`, or `ADMIN`, and returns a signed token. Every protected request goes through a JWT filter that repopulates the Spring Security context. Business methods use `@PreAuthorize`, so BOMs can create and submit while COPs can approve or reject.

The main business rule is maker-checker segregation. A BOM can prepare and submit a KYC record, but cannot approve it. A COP can approve or reject only after async verification succeeds, and branch authorization prevents them from reviewing their own home branch or unauthorized branches. The branch access model is separate from the user record so user identity and branch-review scope can be managed independently.

After submission, the record moves from `DRAFT` to `PENDING_VERIFICATION`. An async service simulates verification with retries. Success moves the record to `VERIFIED`; after max attempts it becomes `FAILED`. Only `VERIFIED` records can be approved or rejected. Rejections send the record back for rework when the BOM updates it. Every key action writes a KYC audit row with action, performer, role, remark, and timestamp, which gives traceability for compliance and operations."

## 2. Domain Model

### UserRecord

Business concept: a system user account.

Why it exists: the system must know who can authenticate, what password they have, which home branch they belong to, whether the account is active, and what role they have. Without `UserRecord`, all access would be anonymous or hardcoded.

Created and modified by: user administration logic. The code has `UserRecordService` methods for adding, updating, password reset, and status filtering. Admin-oriented frontend assets likely use this flow, although the active user controller is not present in the visible controller list.

Interacts with:

1. `CustomUserDetailsService`, which loads it during login.
2. `BranchAccessService`, which is synchronized during user update.
3. `JwtTokenUtil`, indirectly, because the authenticated user details produce the JWT role and username.

Lifecycle:

1. User is created with username, BCrypt password, branch, type, status, and remark.
2. If status is `Accept`, the user can authenticate.
3. If status is `Pending`, `Reject`, `Terminate`, or `Reset_Password`, login is blocked by `CustomUserDetailsService`.
4. Password reset updates password and marks status as `Reset_Password`.
5. User can be deleted.

Business rule enforced: only approved active users can enter the KYC workflow.

### BranchAccess

Business concept: the branch authorization profile for a user.

Why it exists: a user's home branch is not the same thing as the list of branches they are allowed to view or review. If this were stored only on `UserRecord`, every change in review scope would mix identity data with authorization policy and make COP access harder to manage.

Created and modified by: ADMIN through `/branch` endpoints, and also by `UserRecordService.update` when a user update needs branch access synchronization.

Interacts with:

1. `KycSavingAndCurrentService.getAllKycRecordsForCurrentUser`.
2. `KycSavingAndCurrentService.getKycRecordByIdForCurrentUser`.
3. `KycSavingAndCurrentService.assertCopBranchAuthorized`.
4. `BranchAccessController`, which exposes admin CRUD.

Lifecycle:

1. Admin creates branch access with username, home branch, branch list, user type, and user status.
2. Admin updates branch scope as assignments change.
3. KYC read/review operations consult it on every request.
4. Admin deletes it when the access profile is no longer needed.

Business rule enforced: users can only see or act on branch records inside their configured operational scope.

### KycSavingAndCurrent

Business concept: one KYC case for saving/current account opening or maintenance.

Why it exists: the institution needs a persistent business object representing the applicant, account type, branch, status, verification attempts, approval/rejection information, remarks, generated code, and document storage path.

Created and modified by: BOM creates, updates, submits, and deletes non-approved records. Async verification modifies verification state. COP approves or rejects.

Interacts with:

1. `KycSavingAndCurrentController` endpoints.
2. `KycSavingAndCurrentService` business rules.
3. `KycSavingAndCurrentRepository` persistence.
4. `KycVerificationService` for automated verification.
5. `KycAudit` for action history.
6. Filesystem documents under `./uploads`.

Lifecycle:

1. `DRAFT`: record created and editable.
2. `PENDING_VERIFICATION`: submitted by BOM and queued for async verification.
3. `VERIFIED`: verification succeeded and COP can review.
4. `REJECTED`: COP rejected with reason; BOM can update, which reopens it as `DRAFT`.
5. `APPROVED`: terminal successful state. Cannot be modified, rejected, or deleted.
6. `FAILED`: terminal verification failure in current implementation. No active retry path.

Business rule enforced: a KYC cannot be approved merely because a branch uploaded files; it must pass a verification stage and checker review.

### BaseKycModel

Business concept: shared fields common to KYC record types.

Why it exists: older code has multiple KYC product entities. A base model prevents duplication of fields such as branch, account type, mobile, status, remarks, approver, uploader, code, rejection details, and document base path.

Created and modified by: inherited by KYC entities.

Interacts with: `KycSavingAndCurrent` currently uses it directly.

Lifecycle: not instantiated by itself. It is the common data contract for KYC records.

Business rule enforced: common KYC metadata remains consistent across product types.

### KycStatus

Business concept: the finite state machine for a KYC case.

Why it exists: KYC is a controlled workflow. Without explicit states, approval could happen before verification, rejected records could be ambiguous, and terminal records could be accidentally modified.

Created and modified by: service methods assign enum values during lifecycle transitions.

Interacts with: KYC entity, service validations, async verification, approval/rejection logic.

Lifecycle values: `DRAFT`, `PENDING_VERIFICATION`, `VERIFIED`, `FAILED`, `APPROVED`, `REJECTED`.

Business rule enforced: every action is gated by current state.

### KycAudit

Business concept: immutable action history for a KYC record.

Why it exists: KYC systems need traceability. Auditors need to know who created, updated, submitted, approved, rejected, or deleted a case and when. Application logs alone are not a good compliance record because they rotate, are hard to query by KYC ID, and are not domain data.

Created and modified by: `KycSavingAndCurrentService.logAudit`.

Interacts with:

1. `KycAuditRepository`.
2. `/kyc/{id}/audit`.
3. Lifecycle methods `add`, `update`, `submit`, `approve`, `reject`, `delete`.

Lifecycle:

1. Created when a business action occurs.
2. Read back by KYC ID in timestamp order.
3. Not updated in normal flow.

Business rule enforced: sensitive workflow actions must be traceable.

### Product-Specific KYC Entities

The repo includes `KycTasc`, `KycSoleProprietorship`, `KycPartnership`, `KycPubPvt`, and `KycJointSaving`. Their controllers are commented out, but they represent older or planned support for different account/customer types with different document requirements.

Why they exist: different legal/customer account structures require different supporting documents. For example, partnership accounts need partnership documents; public/private companies need company documents; joint accounts have multiple applicants.

Current tradeoff: the codebase has legacy breadth but the active secured workflow is only clearly implemented for saving/current. In interviews, explain this as an incremental migration from product-specific endpoints toward a consolidated KYC lifecycle.

## 3. Authentication and Authorization

### Complete Security Flow

#### Login

Endpoint: `POST /auth/login`.

Controller: `AuthController.login`.

Input: JSON body validated as `LoginRequest`, containing username and password.

Flow:

1. Controller creates `UsernamePasswordAuthenticationToken`.
2. `AuthenticationManager` delegates to the configured `DaoAuthenticationProvider`.
3. `DaoAuthenticationProvider` calls `CustomUserDetailsService.loadUserByUsername`.
4. `UserRecordService.getUser(username)` loads `UserRecord`.
5. If no user exists, `UsernameNotFoundException` is thrown.
6. If `userIdStatus` is not `Accept`, `DisabledException` is thrown.
7. If active, a Spring Security `User` is built with username, BCrypt password, and one authority: `ROLE_` plus `userType`.
8. Password is checked with `BCryptPasswordEncoder`.
9. On success, `JwtTokenUtil.generateToken` creates a signed JWT.
10. Response returns token, token type `Bearer`, username, and role.

Why this exists: login establishes identity and role. The inactive-user check prevents users in pending, rejected, terminated, or reset-password status from receiving valid tokens.

#### JWT Generation

`JwtTokenUtil.generateToken` places the first authority in a `role` claim and sets the username as the subject. It signs the token with HS256 using `JWT_SECRET` and sets expiration from `jwt.expiration-ms`.

Why this exists: the server can validate later requests without storing server-side session state.

#### Request Arrives with JWT

Protected requests must send:

```text
Authorization: Bearer <jwt>
```

`JwtAuthenticationFilter` runs before `UsernamePasswordAuthenticationFilter`.

#### JWT Validation

The filter:

1. Reads the Authorization header.
2. Extracts the token after `Bearer `.
3. Extracts username from token claims.
4. Reloads the user through `CustomUserDetailsService`.
5. Validates username match and expiration.
6. If valid, creates `UsernamePasswordAuthenticationToken` with authorities.
7. Stores it in `SecurityContextHolder`.

If parsing fails, the context is cleared and the request continues unauthenticated. Protected endpoints then fail at Spring Security authorization.

#### Role Loading

Roles are not trusted only from the JWT claim. The filter reloads the user and builds authorities from the current `UserRecord.userType`. This means if a user's role changes in the database, the next request reflects the new role after token validation reloads the user.

Mapping:

```text
UserRecord.userType = BOM   -> ROLE_BOM
UserRecord.userType = COP   -> ROLE_COP
UserRecord.userType = ADMIN -> ROLE_ADMIN
```

If the database contains `COPs` but code checks `COP`, authorization will fail. The current active service uses `hasRole('COP')`, so role naming must be consistent.

#### SecurityContext Population

The security context holds the authenticated principal for the lifetime of the request thread. Service code uses it to get the performer:

```text
SecurityContextHolder.getContext().getAuthentication().getName()
```

This is important because audit fields are no longer taken from client input. The authenticated token identity is the source of truth.

#### Method-Level Authorization

`@EnableGlobalMethodSecurity(prePostEnabled = true)` enables `@PreAuthorize`.

Examples:

| Method | Rule |
|---|---|
| `KycSavingAndCurrentService.add` | `hasRole('BOM')` |
| `update` | `hasRole('BOM')` |
| `submit` | `hasRole('BOM')` |
| `delete` | `hasRole('BOM')` |
| `approve` | `hasRole('COP')` |
| `reject` | `hasRole('COP')` |
| BranchAccess CRUD | `hasRole('ADMIN')` |
| `/actuator/**` | `hasRole('ADMIN')` |

Why method-level authorization matters: URL checks only say a request is authenticated. Service-level checks protect business operations even if controllers change or additional endpoints call the same service.

### Why JWT over Session-Based Auth

JWT was chosen because the application serves static frontend pages and REST APIs. Stateless authentication makes APIs easy to call from browser JavaScript, avoids server session storage, and supports horizontal scaling without sticky sessions.

Alternatives:

1. Server sessions with cookies.
2. Opaque tokens backed by a token store.
3. OAuth2/OIDC with an external identity provider.

Tradeoff: JWTs are harder to revoke immediately. This implementation reduces some risk by reloading the user on each request, so inactive users are blocked after status change, but a token remains structurally valid until expiry.

### BOM vs COP Separation

BOM owns data creation because the branch is closest to the customer and documents. COP owns approval because a centralized or separate checker reduces fraud and mistakes.

This is maker-checker segregation:

1. Maker creates and submits.
2. Checker verifies business correctness and approves/rejects.
3. Maker cannot approve their own work.
4. Checker cannot review own home branch.

The code enforces this with role checks and branch checks.

### BranchAccess Model

`BranchAccess` stores:

1. `userName`
2. `branchNameList`
3. `userType`
4. `userIdStatus`
5. `branchName` as home branch

It exists separately from `UserRecord` because identity and review scope are different concerns. A user has one account, but their branch-review scope may change based on operational assignment, load balancing, or audit policy.

### Interview Security Answer

"Security uses Spring Security with stateless JWT. Login authenticates against `UserRecord`, where passwords are BCrypt encoded. A user must have status `Accept`; otherwise `CustomUserDetailsService` throws a disabled-account exception. On successful login, we issue a signed JWT with a 24-hour expiration.

Every protected request goes through a JWT filter. The filter validates signature and expiry, reloads the current user from the database, derives roles from `userType`, and populates `SecurityContextHolder`. That context is then used both by Spring's `@PreAuthorize` and by our audit logic.

Authorization is split into role and branch controls. BOM can create, update, submit, and delete non-approved KYCs. COP can approve or reject only verified records. BranchAccess limits what records each user can see or review. COP users cannot approve their own home branch records, which enforces maker-checker independence and prevents self-review."

## 4. Complete KYC Lifecycle

### Step 1: Create

Endpoint: `POST /kyc/save`.

Controller: `KycSavingAndCurrentController.save`.

Service: `KycSavingAndCurrentService.add`.

Authorization: `ROLE_BOM`.

Why this step exists: the branch needs to initiate a KYC case and attach evidence documents before it can be reviewed.

Input is a multipart request:

| Field | Meaning |
|---|---|
| `idProof` | identity proof files |
| `addressProof` | address proof files |
| `pan` | PAN files |
| `otherDoc` | other supporting documents |
| `clientForm` | account/KYC form |
| `accountType` | account product |
| `branchName` | branch that owns the KYC |
| `applicant` | customer/applicant name |
| `mobileNo` | customer mobile number |
| `adharNo` | Aadhaar number |
| `remark` | optional remarks |

Validation:

1. Aadhaar must be present and exactly 12 characters.
2. Applicant name must be non-blank.
3. Mobile number must be present and exactly 10 characters.

Why these validations exist: they enforce minimum identity completeness before the system creates a KYC case.

File operations:

1. Generate code using `CODE_{branchCount + 1}_{branchName}`.
2. Determine folder type: if account type ends with `Saving`, folder is `Saving`, otherwise `Current`.
3. Create directories under `./uploads/{branch}/CASA/{Saving|Current}/{accountType}/{code}`.
4. Save uploaded files into document-category directories.

State transition: new record starts as `DRAFT`.

Audit: `CREATED` with role `BOM`. Current implementation logs `performedBy` as `request.getApplicant()` for create, not the authenticated BOM. This is a remaining audit weakness because create audit identity should be authenticated user, not applicant.

Failure behavior:

1. Validation failure throws runtime exception and no DB save occurs.
2. File write failure throws `IOException` and no DB save occurs.
3. If file write succeeds but DB save fails, files remain as orphans.
4. If audit save fails after DB save, behavior depends on transaction boundaries. Since `add` is not `@Transactional`, the record may remain without audit.

### Step 2: Update

Endpoint: `PUT /kyc/update/{id}`.

Controller: `KycSavingAndCurrentController.update`.

Service: `KycSavingAndCurrentService.update`.

Authorization: `ROLE_BOM`.

Why this step exists: branch users need to correct or complete a draft, and rework rejected records.

Validation and checks:

1. Record must exist.
2. `APPROVED` records cannot be modified.
3. If status is `REJECTED`, update resets status to `DRAFT`, clears rejection reason, and clears rejected-by.
4. Same basic applicant/Aadhaar/mobile validation as create.

Why these checks exist:

1. Approved KYCs are final and should not be changed after checker signoff.
2. Rejected KYCs need a rework path. Updating a rejected record means the branch is addressing the rejection, so it goes back to draft.

File operations: files are rewritten under the existing branch/account/code path. Current file naming overwrites files by index and does not delete old files if fewer files are uploaded later.

State transition:

1. `DRAFT -> DRAFT` for normal edits.
2. `REJECTED -> DRAFT` for rework.
3. `APPROVED -> blocked`.

Audit: `UPDATED` with role `BOM`. Current implementation logs `performedBy` as `request.getApplicant()`, not authenticated user. This is a remaining audit weakness.

Failure behavior:

1. Missing record throws runtime exception.
2. Approved record throws runtime exception.
3. File write failure can leave partial filesystem changes.
4. DB/audit failures can leave inconsistency because the method is not transactional.

### Step 3: Submit

Endpoint: `POST /kyc/{id}/submit`.

Controller: `KycSavingAndCurrentController.submit`.

Service: `KycSavingAndCurrentService.submit`.

Authorization: `ROLE_BOM`.

Why this step exists: submit is the boundary between branch preparation and formal verification. It prevents partial drafts from entering checker review.

Validation and checks:

1. Record must exist.
2. Status must be `DRAFT`.
3. `adharNoFirst` and `applicantFirst` must not be null.

State transition: `DRAFT -> PENDING_VERIFICATION`.

Async operation: calls `kycVerificationService.verifyAsync(saved.getId())`.

Audit: `SUBMITTED` with authenticated username from `SecurityContextHolder`, role `BOM`.

Failure behavior:

1. Non-draft records cannot be submitted.
2. Incomplete record cannot be submitted.
3. If DB save succeeds but async executor rejects the task, the record may remain `PENDING_VERIFICATION` with no verification running.
4. If audit save fails, submit result can be inconsistent because no transaction boundary protects the whole operation.

### Step 4: Automated Verification

Method: `KycVerificationService.verifyAsync`.

Authorization: not user-triggered directly after submit; called by service.

Why this step exists: KYC review should not rely only on manual upload. The system needs an automated identity verification stage before human approval.

Flow:

1. Async method loads the KYC record by ID.
2. If not found, logs warning and returns.
3. While `verificationAttempts < maxVerificationAttempts`:
   1. Calculate next attempt.
   2. Log thread, attempt, and KYC ID.
   3. Run simulated heavy DB query `SELECT 1 FROM pg_sleep(2)`.
   4. Set verification attempt count.
   5. Randomly pass with `Math.random() > 0.3`.
   6. If valid, set status `VERIFIED`, save, and return.
   7. If invalid, log warning and continue.
   8. If exception occurs, increment attempts and continue.
4. After attempts are exhausted, set status `FAILED` and save.

State transition:

1. `PENDING_VERIFICATION -> VERIFIED` on success.
2. `PENDING_VERIFICATION -> FAILED` after max attempts.

Audit: no audit record is written by async verification. This is a gap.

Failure behavior:

1. Record missing: logs and returns.
2. Exceptions during verification increment attempts.
3. Queue saturation can reject the async task before it starts.
4. Concurrent async calls for the same record can race because there is no optimistic lock on `KycSavingAndCurrent`.

### Step 5: Approve

Endpoint: `POST /kyc/{id}/approve`.

Controller: `KycSavingAndCurrentController.approve`.

Service: `KycSavingAndCurrentService.approve`.

Authorization: `ROLE_COP`.

Why this step exists: approval is the final checker signoff that the KYC can be accepted.

Validation and checks:

1. Record must exist.
2. If already `APPROVED`, reject with "Already approved".
3. Status must be `VERIFIED`.
4. COP must have branch access.
5. COP cannot approve own home branch.
6. Record branch must be in COP branch list.

State transition: `VERIFIED -> APPROVED`.

Fields set:

1. `approvedBy = authenticated COP username`.
2. `rejectionReason = null`.
3. `rejectedBy = null`.

Audit: `APPROVED` with authenticated COP username, role `COP`.

Failure behavior:

1. BOM cannot call it because of `@PreAuthorize`.
2. Unauthorized branch throws runtime exception.
3. Own home branch throws runtime exception.
4. Non-verified record throws runtime exception.

### Step 6: Reject

Endpoint: `POST /kyc/{id}/reject?reason=...`.

Controller: `KycSavingAndCurrentController.reject`.

Service: `KycSavingAndCurrentService.reject`.

Authorization: `ROLE_COP`.

Why this step exists: checker needs to send a case back when documents or details are unacceptable.

Validation and checks:

1. Record must exist.
2. Approved KYC cannot be rejected.
3. Status must be `VERIFIED`.
4. COP branch authorization must pass.

State transition: `VERIFIED -> REJECTED`.

Fields set:

1. `rejectionReason = reason`.
2. `rejectedBy = authenticated COP username`.
3. `approvedBy = null`.

Audit: `REJECTED` with authenticated COP username, role `COP`, remark as rejection reason.

Failure behavior:

1. BOM cannot reject.
2. Unverified records cannot be rejected.
3. Authorized role but unauthorized branch cannot reject.

### Step 7: Rework

Endpoint: `PUT /kyc/update/{id}`.

Controller: `KycSavingAndCurrentController.update`.

Service: `KycSavingAndCurrentService.update`.

Authorization: `ROLE_BOM`.

Why this step exists: rejection should not be final if the branch can correct missing or wrong information.

State transition: `REJECTED -> DRAFT`.

Business rule: after rejection, the branch must edit and resubmit; it cannot jump directly to approval.

Audit: `UPDATED`. As noted, current performer value for update is applicant rather than authenticated user.

### Step 8: Resubmit

Endpoint: `POST /kyc/{id}/submit`.

Service: `submit`.

State transition: `DRAFT -> PENDING_VERIFICATION`, then async verification again.

Why this step exists: a corrected KYC must pass verification again before the checker can approve.

### Step 9: Final Approval

Endpoint: `POST /kyc/{id}/approve`.

State transition: `VERIFIED -> APPROVED`.

Why this exists: final terminal acceptance requires COP approval after verification.

### Plain-Text Sequence Diagram

```text
Actor BOM
  -> KycSavingAndCurrentController.save(...)
  -> KycSavingAndCurrentService.add(KycRequest)
     -> validateForSave(request)
     -> generateCode(branchName)
     -> saveFiles(...)
     -> buildEntity(request, code)
     -> KycSavingAndCurrentRepository.save(record)
     -> logAudit(id, CREATED, applicant, BOM, null)
     -> KycAuditRepository.save(audit)
  <- DRAFT KycSavingAndCurrent

Actor BOM
  -> KycSavingAndCurrentController.update(id, ...)
  -> KycSavingAndCurrentService.update(id, request)
     -> getKycRecordById(id)
     -> block if APPROVED
     -> if REJECTED, set DRAFT and clear rejection fields
     -> validateForSave(request)
     -> saveFiles(existing branch/account/code, ...)
     -> updateEntity(record, request)
     -> KycSavingAndCurrentRepository.save(record)
     -> logAudit(id, UPDATED, applicant, BOM, null)
  <- updated KYC

Actor BOM
  -> KycSavingAndCurrentController.submit(id)
  -> KycSavingAndCurrentService.submit(id)
     -> getKycRecordById(id)
     -> require status DRAFT
     -> validateForSubmit(record)
     -> set status PENDING_VERIFICATION
     -> KycSavingAndCurrentRepository.save(record)
     -> KycVerificationService.verifyAsync(id)
     -> getCurrentUsername()
     -> logAudit(id, SUBMITTED, username, BOM, null)
  <- PENDING_VERIFICATION KYC

Async Thread KYC-n
  -> KycVerificationService.verifyAsync(id)
     -> KycSavingAndCurrentRepository.findById(id)
     -> loop attempts while attempts < max
        -> KycSavingAndCurrentRepository.runHeavyQuery()
        -> set verificationAttempts
        -> random validity check
        -> if success:
             set status VERIFIED
             repository.save(record)
             return
     -> set status FAILED
     -> repository.save(record)

Actor COP
  -> KycSavingAndCurrentController.approve(id)
  -> KycSavingAndCurrentService.approve(id)
     -> getCurrentUsername()
     -> getKycRecordById(id)
     -> require status VERIFIED
     -> assertCopBranchAuthorized(username, record.branchName)
        -> BranchAccessService.getUser(username)
        -> block if no list
        -> block if record branch equals COP home branch
        -> block if record branch not in branchNameList
     -> set status APPROVED
     -> set approvedBy username
     -> clear rejection fields
     -> repository.save(record)
     -> logAudit(id, APPROVED, username, COP, null)
  <- APPROVED KYC

Actor COP
  -> KycSavingAndCurrentController.reject(id, reason)
  -> KycSavingAndCurrentService.reject(id, reason)
     -> getCurrentUsername()
     -> getKycRecordById(id)
     -> require status VERIFIED
     -> assertCopBranchAuthorized(username, record.branchName)
     -> set status REJECTED
     -> set rejectedBy username
     -> set rejectionReason reason
     -> clear approvedBy
     -> repository.save(record)
     -> logAudit(id, REJECTED, username, COP, reason)
  <- REJECTED KYC
```

## 5. State Machine

### Status Values

| Status | Meaning |
|---|---|
| `DRAFT` | Branch-created work in progress |
| `PENDING_VERIFICATION` | Submitted and waiting for async verification |
| `VERIFIED` | Automated verification succeeded; ready for COP decision |
| `FAILED` | Automated verification exhausted max attempts |
| `APPROVED` | COP accepted the KYC; terminal success |
| `REJECTED` | COP rejected; can be reworked by BOM |

### Complete Transition Table

| From | To | Trigger Role | Service Method | Why Allowed | Business Rule Protected |
|---|---|---|---|---|---|
| none | `DRAFT` | BOM | `add` | Branch starts a new KYC | Only branch maker creates cases |
| `DRAFT` | `DRAFT` | BOM | `update` | Drafts are editable | Branch can complete/correct before formal submit |
| `REJECTED` | `DRAFT` | BOM | `update` | Rejection requires rework | Checker feedback must be addressed before resubmit |
| `DRAFT` | `PENDING_VERIFICATION` | BOM | `submit` | Complete draft enters verification | Incomplete records cannot go to checker |
| `PENDING_VERIFICATION` | `VERIFIED` | Async system | `verifyAsync` | Verification passed | COP reviews only machine-verified records |
| `PENDING_VERIFICATION` | `FAILED` | Async system | `verifyAsync` | Max attempts exhausted | Repeated verification failure blocks approval |
| `VERIFIED` | `APPROVED` | COP | `approve` | Checker accepts verified record | Maker-checker and branch authorization |
| `VERIFIED` | `REJECTED` | COP | `reject` | Checker finds issue | Enables formal rework path |

### Explicitly Blocked Transitions

| Attempted Transition | Where Blocked | Why |
|---|---|---|
| `APPROVED -> any edit` | `update` | Approved KYC is final |
| `APPROVED -> REJECTED` | `reject` | Final approved records should not be reversed through normal rejection |
| `APPROVED -> deleted` | `delete` | Compliance records should not disappear after approval |
| `DRAFT -> APPROVED` | `approve` requires `VERIFIED` | Prevents bypassing verification |
| `PENDING_VERIFICATION -> APPROVED` | `approve` requires `VERIFIED` | Prevents approval while verification is running |
| `FAILED -> APPROVED` | `approve` requires `VERIFIED` | Failed verification cannot be accepted |
| `FAILED -> submit` | `submit` requires `DRAFT` | No retry path exists |
| `REJECTED -> submit` | `submit` requires `DRAFT` | Must update/rework first |
| `VERIFIED -> submit` | `submit` requires `DRAFT` | Avoid duplicate verification |
| `COP own branch -> APPROVED/REJECTED` | `assertCopBranchAuthorized` | Prevents self-review |
| `BOM -> APPROVED/REJECTED` | `@PreAuthorize("hasRole('COP')")` | Enforces checker role |

### Terminal States

`APPROVED` is terminal because it represents final business acceptance. The code blocks update, reject, and delete after approval.

`FAILED` is effectively terminal in the current active flow because submit only accepts `DRAFT`, update only resets `REJECTED` to `DRAFT`, and there is no method to retry or reopen a failed KYC. Business impact: a verification failure may force users to create a new record rather than fix and retry the existing one. This is defensible if failed verification means high-risk identity mismatch, but it is operationally harsh if failures are caused by provider outage or transient errors.

## 6. File Storage Design

### Multipart Request Flow

The create and update endpoints receive multipart form data. Spring maps file parts to `MultipartFile[]` arrays. The controller wraps inputs in `KycRequest` and passes it to service. The service validates business fields, computes the storage path, creates directories, and writes each file using `FileOutputStream`.

### Directory Structure

Example:

```text
root.path=./uploads
branchName=Mumbai
accountType=Normal Saving
code=CODE_17_Mumbai

./uploads/Mumbai/CASA/Saving/Normal Saving/CODE_17_Mumbai/
  idProof/
    id_0
    id_1
  addressProof/
    addr_0
  pan/
    pan_0
  otherDoc/
    other_0
  clientForm/
    form_0
```

If account type does not end with `Saving`, it is classified as `Current`.

### File Naming Strategy

Files are named by category prefix and index:

| Category | Prefix |
|---|---|
| id proof | `id_` |
| address proof | `addr_` |
| pan | `pan_` |
| other document | `other_` |
| client form | `form_` |

Advantages: simple, deterministic, no filename sanitization issue from original names.

Limitations: original names and extensions are lost, content type is not stored, duplicate/updated files overwrite by index, and there is no checksum.

### Why Filesystem over Database Blobs or S3

Filesystem storage was likely chosen because it is simple, cheap, fast for a small deployment, and easy to inspect manually. Database rows stay smaller, and PostgreSQL does not have to carry large binary payloads.

Alternatives:

1. Database blobs: transactional with metadata but bloats DB, slows backups, and complicates large files.
2. S3/object storage: scalable and durable but needs cloud credentials, bucket policy, lifecycle management, and network dependency.
3. Network attached storage: easier for on-prem but needs mount reliability and backup policy.

### Advantages

1. Easy local deployment.
2. Lower database load.
3. Simple path-based organization by branch/account/code.
4. Easy human inspection during development.

### Risks and Limitations

1. Orphan files if DB save fails after file write.
2. Missing files if filesystem write fails after partial write.
3. No virus scanning.
4. No MIME/type validation.
5. No original filename or extension retention.
6. No checksum/integrity verification.
7. No file-level access control.
8. No cleanup on record delete.
9. Local disk does not scale horizontally without shared storage.
10. Path components are built from request values, so branch/account names need sanitization.

### Orphan File Problem

Create writes files before saving the KYC record. If file writes succeed but `repository.save(record)` fails, the database has no record but the directory remains on disk. This creates orphan files. The fix is to make file writes compensating: track written paths and delete them if DB save fails, or save DB metadata first and finalize files after commit, or use object storage with transactional metadata and cleanup jobs.

## 7. Async Verification

### Step-by-Step `verifyAsync`

1. `submit` sets the record to `PENDING_VERIFICATION` and saves it.
2. `submit` calls `kycVerificationService.verifyAsync(saved.getId())`.
3. Spring sees `@Async("kycExecutor")` and schedules the method on the configured executor.
4. The HTTP request can return without waiting for verification.
5. Worker thread loads the KYC record by ID.
6. If missing, it logs and exits.
7. It loops while attempts are less than max attempts.
8. It logs thread name, attempt, and ID.
9. It runs a simulated slow query `pg_sleep(2)`.
10. It updates attempts.
11. It randomly decides validity with about 70 percent pass probability.
12. On pass, it sets `VERIFIED`, saves, logs success, and exits.
13. On failed attempt, it logs and retries.
14. On exception, it increments attempts and retries.
15. After max attempts, it sets `FAILED`, saves, and logs failure.

### Why Async Exists

Verification can involve slow external APIs, network latency, OTP flows, or expensive matching checks. If it ran synchronously inside `/submit`, the user would wait for the whole verification. Under load, Tomcat request threads would be held by slow verification calls, reducing API responsiveness. Async processing separates "accept submission" from "finish verification."

### Executor Configuration

`corePoolSize=15`: keep up to 15 worker threads ready for KYC tasks.

`maxPoolSize=65`: under pressure, grow up to 65 workers.

`queueCapacity=70`: after core threads are busy, queue up to 70 tasks before growing toward max.

Thread name prefix `KYC-`: makes logs easier to read.

Rejection policy: default `AbortPolicy`, because `CallerRunsPolicy` is commented out. If all max threads are busy and the queue is full, task submission throws `RejectedExecutionException`.

### Success Path

`DRAFT -> PENDING_VERIFICATION` in submit, then async verification sets `VERIFIED`. A COP can then approve or reject.

### Failure Path

If random verification fails repeatedly or exceptions consume all attempts, the record becomes `FAILED`. No audit row is created for failure, and no retry endpoint exists.

### Simulated vs Real Zoop Integration

Current verification is simulated because:

1. `zoop.enabled=false`.
2. `ZoopController` is commented out.
3. `verifyAsync` uses `Math.random()` and `pg_sleep`.

A real Zoop integration would:

1. Validate Aadhaar/PAN format before calling provider.
2. Call Zoop API through `ZoopService`.
3. Store provider request ID/task ID.
4. Store response status, verification reason, and masked identity data.
5. Handle timeouts, retries, rate limits, and provider errors.
6. Avoid random success.
7. Produce audit events for verification success/failure.
8. Separate transient provider failure from identity verification failure.

### SecurityContext in `@Async`

`SecurityContextHolder` is request-thread local by default. Async methods run on different worker threads, so the security context is usually empty unless explicitly propagated with a `DelegatingSecurityContextAsyncTaskExecutor` or similar mechanism.

Implication: async verification should not call `getCurrentUsername()` unless context propagation is configured. This implementation does not write audit in async verification, so it avoids a direct null principal issue, but it also misses audit rows for verification.

### Queue Full Scenario

With default `AbortPolicy`, if the executor is saturated, scheduling `verifyAsync` throws `RejectedExecutionException`. Since submit already saved `PENDING_VERIFICATION` before the async call, the record can become stuck pending if the exception is not handled and no retry scheduler picks it up.

Better options:

1. Catch rejection and set status back to `DRAFT` or `FAILED_VERIFICATION_QUEUE`.
2. Use `CallerRunsPolicy` if acceptable.
3. Use a persistent queue such as RabbitMQ/Kafka.
4. Add a scheduled recovery job for stuck `PENDING_VERIFICATION`.

### Concurrency Considerations

If two async calls run for the same record:

1. Both load the same row.
2. Both see attempt count values independently.
3. Both update status and attempts.
4. Last save wins.

There is no `@Version` optimistic lock on `KycSavingAndCurrent`, so lost updates are possible. There is also no guard in `verifyAsync` that exits if the record is already `APPROVED`, `VERIFIED`, or `FAILED`. If verification runs late after a COP action, it could overwrite state in edge cases.

### Interview-Ready Explanation

"Submit starts async verification because real KYC checks can involve slow external APIs. We do not want the HTTP request thread blocked while waiting for provider calls. The service marks the record `PENDING_VERIFICATION`, saves it, and schedules `verifyAsync` on a named executor.

The executor has 15 core threads, can grow to 65, and queues 70 tasks. The current verification is a simulation: it runs a slow query and randomly passes or fails, retrying up to max attempts. Success sets the record to `VERIFIED`; repeated failure sets it to `FAILED`.

The design is good for a prototype or small monolith because it is simple and responsive. The tradeoff is reliability: tasks are in memory, queue rejection can leave records pending, there is no retry recovery after app restart, and concurrent verification can race. In a production design I would move verification to a durable queue, add idempotency and optimistic locking, and store provider responses and audit entries."

## 8. Audit Trail

### What It Is

An audit trail is a domain-level history of important actions. In KYC, it proves who performed an action, what they did, when they did it, and why.

### Why It Matters in KYC

KYC is compliance-sensitive. A financial institution must defend decisions to accept or reject customer onboarding. Audit trails support:

1. Regulatory traceability.
2. Fraud investigation.
3. Internal accountability.
4. Maker-checker evidence.
5. Operational debugging.
6. Branch and role governance.

### Audit Record Fields

`KycAudit` stores:

| Field | Meaning |
|---|---|
| `id` | audit row ID |
| `kycId` | target KYC record ID |
| `action` | action name such as `CREATED` or `APPROVED` |
| `performedBy` | user or actor recorded as performer |
| `role` | role recorded for performer |
| `remark` | optional reason or comment |
| `timestamp` | action timestamp |

### Actions That Generate Audit

| Lifecycle Step | Audit Action | Current Performer Source | Role |
|---|---|---|---|
| Create | `CREATED` | applicant from request | `BOM` |
| Update | `UPDATED` | applicant from request | `BOM` |
| Submit | `SUBMITTED` | authenticated username | `BOM` |
| Approve | `APPROVED` | authenticated username | `COP` |
| Reject | `REJECTED` | authenticated username | `COP` |
| Delete | `DELETED` | authenticated username | `BOM` |

### Missing Audit Trail Items

1. Create and update should use authenticated BOM username, not applicant name.
2. Async verification success/failure is not audited.
3. File upload details are not audited: filenames, counts, checksum, file categories.
4. Branch authorization denials are not audited.
5. Login success/failure is not audited.
6. Admin branch access changes are not audited.
7. User account status changes are not audited.
8. Audit records are not protected against later modification at the database level.
9. Before/after values are not captured for updates.
10. Delete removes the KYC record but leaves only audit by `kycId`; depending on DB constraints and retention needs, a soft delete may be better.

Risk: the system can prove some workflow actions but not the full compliance story. In interviews, acknowledge that current audit is useful but incomplete for regulated production.

## 9. Branch Authorization Model

### Home Branch

The home branch is the branch the user belongs to operationally. In `BranchAccess`, it is `branchName`.

For BOM, this determines which KYC records they can see: only their home branch.

For COP, this is used as an exclusion: COP cannot review their own home branch.

### Branch List

`branchNameList` is the list of branches a user is allowed to access. For COP, it defines review scope. The code filters this list and removes the home branch for COP read access.

### Why BranchAccess Is Separate from UserRecord

`UserRecord` is identity and account status. `BranchAccess` is authorization scope. Keeping them separate lets admins adjust review assignments without redefining the user account. It also supports a user having a home branch plus a broader review list.

### COP Enforcement in Code

For approve/reject:

1. Get authenticated COP username.
2. Load `BranchAccess`.
3. Ensure branch list exists and is not empty.
4. Block if record branch equals COP home branch.
5. Block if record branch is not in branch list.

For list view:

1. Load current user's `BranchAccess`.
2. If COP, create allowed list from `branchNameList` excluding home branch.
3. Return only records whose `branchName` is in allowed list.

For single record view:

1. Load record.
2. If COP, call same branch authorization method.
3. If BOM, require record branch equals home branch.

### Why COP Cannot Review Own Home Branch

This is a maker-checker conflict rule. If a COP can approve their own home branch, they may be approving work from colleagues, subordinates, or records they influenced. Excluding home branch creates independence between origin branch and reviewer.

### Concrete Example

COP home branch: Delhi.

Allowed branch list: `[Mumbai, Pune]`.

#### 1. Approve a Mumbai KYC Record

1. COP sends `POST /kyc/{id}/approve`.
2. Service requires role `COP`.
3. Record must be `VERIFIED`.
4. `assertCopBranchAuthorized` loads BranchAccess.
5. Record branch `Mumbai` is not home branch `Delhi`.
6. `Mumbai` is in `[Mumbai, Pune]`.
7. Approval succeeds and audit logs `APPROVED`.

#### 2. Approve a Delhi KYC Record

1. Role check passes.
2. Record status check passes if `VERIFIED`.
3. Branch check sees record branch equals home branch.
4. Service throws "COP cannot review records from their own home branch".
5. No approval occurs.

#### 3. Approve a Chennai KYC Record

1. Role check passes.
2. Record status check passes if `VERIFIED`.
3. Branch check sees Chennai is not home branch.
4. Branch check then sees Chennai is not in `[Mumbai, Pune]`.
5. Service throws "COP is not authorized for branch: Chennai".
6. No approval occurs.

#### 4. View All KYC Records

1. COP calls `GET /kyc`.
2. Service loads BranchAccess.
3. Allowed list is branchNameList excluding home branch. It remains `[Mumbai, Pune]`.
4. Repository currently loads all rows and filters in memory.
5. Response contains only Mumbai and Pune records.
6. Delhi and Chennai records are excluded.

## 10. Design Decisions and Tradeoffs

### JWT over Session Auth

Why chosen: stateless REST APIs, simple frontend token storage, no server session store, easier horizontal scaling.

Alternatives: server sessions, opaque tokens, OAuth2/OIDC.

Tradeoffs: token revocation is harder; clients must protect token; JWT secret management matters.

### Spring Security with `@PreAuthorize`

Why chosen: business permissions live close to service methods. Even if controllers change, service methods remain protected.

Alternatives: controller-only checks, custom filters, manual role checks inside every method.

Tradeoffs: requires consistent role naming and proxy-based Spring invocation. Self-invocation can bypass method security if protected methods are called from within same class through `this`.

### Filesystem Storage over DB Blobs or S3

Why chosen: simple local storage and lower database size.

Alternatives: database blobs, S3/object storage, NAS.

Tradeoffs: orphan files, local disk scaling, weaker metadata, no built-in durability across instances.

### In-Process Async Verification over Message Queue

Why chosen: quick to implement inside monolith, no broker dependency, good enough for prototype/small load.

Alternatives: RabbitMQ, Kafka, SQS, database job table, scheduled workers.

Tradeoffs: task loss on restart, queue saturation, weak retry recovery, no durable processing.

### Separate BranchAccess Entity

Why chosen: separates identity from branch authorization scope.

Alternatives: put branch list on `UserRecord`, use role claims only, create many user-branch join rows.

Tradeoffs: possible drift between `UserRecord` and `BranchAccess`, duplicated user type/status fields, LOB serialized list is less queryable than normalized rows.

### Audit Table over Application Logging

Why chosen: domain audit can be queried by KYC ID and retained as business data.

Alternatives: logs only, event store, CDC, append-only audit schema.

Tradeoffs: current table is simple but incomplete, mutable by DB users, and not transactional across all service actions.

### Role-Based Access Control

Why chosen: the business naturally separates BOM, COP, and ADMIN.

Alternatives: attribute-based access control, permission matrix, policy engine.

Tradeoffs: simple but can become rigid if permissions vary by branch, product, or amount.

### `ddl-auto=update` in Production

Why chosen: convenient during development because Hibernate updates schema automatically.

Alternatives: Flyway/Liquibase migrations, manual SQL migrations.

Tradeoffs: risky in production. Hibernate updates can create unexpected schema changes, do not provide controlled rollback, and are not a substitute for reviewed migrations. In interviews, call this technical debt and recommend Flyway/Liquibase.

## 11. Failure Scenarios

### Login with Inactive User Status

`CustomUserDetailsService` checks `userIdStatus`. If it is not `Accept`, it throws `DisabledException`. User does not receive a token. This protects the system from pending, rejected, terminated, or reset-password users.

### JWT Expiry Mid-Session

When a request arrives with an expired token, validation fails. Security context is not populated. Protected endpoints return unauthorized/forbidden depending on Spring Security handling. The client must log in again.

### File Write Succeeds but Database Save Fails

Files remain on disk without a KYC record pointing to them. This is the orphan file problem. There is no cleanup logic today.

### Database Save Succeeds but Audit Save Fails

Because service methods are not consistently transactional, the business record may remain saved while audit is missing. This weakens compliance traceability.

### Async Executor Saturated on Submit

The record is saved as `PENDING_VERIFICATION`, then async scheduling may throw `RejectedExecutionException` if the executor queue and workers are full. There is no recovery job, so the record may become stuck pending.

### `verifyAsync` Runs but Record Is Already APPROVED

Current `verifyAsync` does not check if the record is already terminal. If it loads or saves stale state, it can overwrite status in edge cases. A safer implementation would re-check status before saving and use optimistic locking.

### Two Concurrent Submits on Same Record

Both requests can read `DRAFT` before either saves, both set `PENDING_VERIFICATION`, and both schedule async verification. There is no lock or version field on `KycSavingAndCurrent`. Result: duplicate verification tasks and race conditions.

### COP Tries to Approve Own Home Branch

Role check passes if user is COP, but `assertCopBranchAuthorized` blocks because record branch equals COP home branch. No approval occurs.

### BOM Tries to Approve

`@PreAuthorize("hasRole('COP')")` blocks before method body executes. No approval occurs.

### FAILED Record Has No Retry Path

Business impact: a transient provider failure or random failure can permanently block that record. Users may need to create a new KYC, causing duplicate records and orphaned documents. If `FAILED` means confirmed identity mismatch, no retry is defensible. If it means technical failure, the design needs a retry/reopen path.

## 12. Interview Preparation

### 25 Questions, Ideal Answers, Follow-Ups, and Challenge Areas

1. What problem does this project solve?
Answer: It manages branch KYC intake, document upload, automated verification, checker approval/rejection, branch-level access, and audit trail.
Follow-up: Why not just use spreadsheets?
Challenge: Explain compliance and traceability gaps in spreadsheets.

2. What is the architecture?
Answer: Spring Boot monolith with static frontend assets, REST controllers, service-layer business rules, Spring Security JWT, JPA repositories, PostgreSQL, filesystem document storage, and in-process async verification.
Follow-up: When would you split it into microservices?
Challenge: Avoid claiming microservices are needed before scale demands them.

3. Why use JWT?
Answer: Stateless APIs, no server session store, easy frontend integration, scalable across instances.
Follow-up: How do you revoke JWTs?
Challenge: Acknowledge revocation weakness; this app reloads user status each request but does not maintain a token blacklist.

4. How are roles derived?
Answer: `CustomUserDetailsService` loads `UserRecord.userType` and creates `ROLE_<userType>`.
Follow-up: What happens if DB value is `COPs` but code expects `COP`?
Challenge: Role naming must be consistent.

5. How are inactive users blocked?
Answer: During user details loading, `userIdStatus` must equal `Accept`; otherwise `DisabledException` is thrown.
Follow-up: What if user becomes inactive after login?
Challenge: Since the filter reloads the user on each request, they are blocked on the next request.

6. What is maker-checker?
Answer: Maker creates/submits; checker independently approves/rejects. Here BOM is maker, COP is checker.
Follow-up: How is it enforced?
Challenge: Role checks plus COP home branch exclusion.

7. Why separate BOM and COP?
Answer: Branch owns customer intake; centralized reviewer reduces fraud and mistakes.
Follow-up: Can COP create records?
Challenge: Not in active service; COP only approves/rejects.

8. What is BranchAccess?
Answer: A per-user branch authorization profile containing home branch and allowed branch list.
Follow-up: Why separate from UserRecord?
Challenge: Avoid mixing identity with mutable operational access.

9. How does COP branch authorization work?
Answer: COP can only review records in branchNameList and cannot review their home branch.
Follow-up: Where is it enforced?
Challenge: `assertCopBranchAuthorized`, list filtering, and single-record fetch.

10. Trace create KYC.
Answer: `POST /kyc/save` -> controller creates `KycRequest` -> service validates Aadhaar/applicant/mobile -> generates code -> saves files -> saves `DRAFT` entity -> writes audit.
Follow-up: What can fail?
Challenge: Orphan files if DB save fails.

11. Trace submit.
Answer: `POST /kyc/{id}/submit` -> require BOM and `DRAFT` -> validate completeness -> set `PENDING_VERIFICATION` -> save -> schedule async verification -> audit.
Follow-up: What if executor rejects?
Challenge: Record can be stuck pending.

12. Trace approve.
Answer: `POST /kyc/{id}/approve` -> require COP -> require `VERIFIED` -> branch authorization -> set `APPROVED` and `approvedBy` -> audit.
Follow-up: Can approved records be changed?
Challenge: Update/reject/delete block approved records.

13. Trace reject.
Answer: COP rejects only `VERIFIED` records, records reason and rejectedBy, clears approvedBy, writes audit.
Follow-up: How does rework happen?
Challenge: BOM update changes `REJECTED` to `DRAFT`.

14. What are the KYC states?
Answer: `DRAFT`, `PENDING_VERIFICATION`, `VERIFIED`, `FAILED`, `APPROVED`, `REJECTED`.
Follow-up: Which are terminal?
Challenge: `APPROVED` is intentionally terminal; `FAILED` is terminal by current missing retry path.

15. Why async verification?
Answer: External verification can be slow; async frees HTTP request threads.
Follow-up: What is the executor config?
Challenge: 15 core, 65 max, 70 queue, default abort rejection.

16. What are concurrency risks?
Answer: Concurrent submits and duplicate verify tasks can race; no optimistic locking on active entity.
Follow-up: How to fix?
Challenge: Add `@Version`, state guards, idempotency, durable job table.

17. Why filesystem storage?
Answer: Simpler and keeps DB smaller.
Follow-up: What are the risks?
Challenge: Orphans, scaling, metadata, no checksum, no cleanup.

18. What is stored in audit?
Answer: KYC ID, action, performer, role, remark, timestamp.
Follow-up: What is missing?
Challenge: Async verification, admin changes, file metadata, create/update authenticated actor.

19. How does Spring Security method authorization work?
Answer: `@EnableGlobalMethodSecurity(prePostEnabled=true)` creates proxies that evaluate `@PreAuthorize` expressions before method execution.
Follow-up: Can it be bypassed?
Challenge: Internal self-invocation can bypass proxy checks.

20. How does JWT validation work?
Answer: Extract Bearer token, parse signed claims, check subject and expiry against loaded user, set SecurityContext.
Follow-up: What algorithm?
Challenge: HS256 using secret from environment.

21. What is the database design?
Answer: JPA entities for users, branch access, KYC records, and audit; PostgreSQL persistence through Spring Data repositories.
Follow-up: Is `ddl-auto=update` good?
Challenge: It is acceptable for development but risky for production.

22. Why is `FAILED` not retried?
Answer: Current flow treats exhausted verification as terminal; no service method reopens it.
Follow-up: Is that good?
Challenge: Good only if failure means identity mismatch; bad for transient provider failures.

23. What would a real Zoop integration add?
Answer: Provider calls, request IDs, response storage, timeouts, retries, rate limits, audit entries, and deterministic status mapping.
Follow-up: What about consent?
Challenge: Consent text is present in Zoop service, but production needs stronger consent record.

24. What are the strongest parts of the design?
Answer: Clear maker-checker roles, branch authorization, JWT security, externalized secrets, audit table, async separation, filesystem offloading.
Follow-up: What would you improve first?
Challenge: Transactionality, audit correctness, durable async, file metadata/security.

25. How would you explain this project in one minute?
Answer: It is a Spring Boot KYC workflow where BOM uploads and submits KYC, async verification validates it, COP approves/rejects with branch restrictions, and audit records trace actions. JWT secures the APIs and BranchAccess enforces operational scope.
Follow-up: What is the biggest production concern?
Challenge: In-process async and filesystem consistency under failure/load.

### Weak Areas and How to Discuss Them

1. Create/update audit performer uses applicant, not authenticated user. Acknowledge it and recommend using `getCurrentUsername`.
2. Async verification is simulated. Defend as prototype scaffolding; real provider integration would replace random logic.
3. In-process async is not durable. Defend for small monolith; recommend message queue for production.
4. Filesystem storage is simple but not horizontally scalable. Recommend object storage or shared storage.
5. `ddl-auto=update` is risky. Recommend migrations.
6. No optimistic locking. Recommend `@Version`.
7. No retry path for `FAILED`. Clarify business semantics and add retry if failure can be technical.
8. Branch list as LOB is less queryable. Recommend normalized user-branch mapping for scale.

## 13. Architecture Review

### Strengths

1. Clear maker-checker separation between BOM and COP.
2. Inactive users are blocked during authentication.
3. JWT security is integrated with Spring Security, not manually checked in controllers.
4. Method-level authorization protects service operations.
5. Branch authorization is enforced for COP approve/reject and branch-filtered reads.
6. COP home branch exclusion protects reviewer independence.
7. Audit table exists as domain data.
8. Secrets are externalized.
9. Actuator is restricted to admin and only exposes health/info.
10. Documents are moved out of database blobs, reducing DB payload.
11. Async verification prevents long request blocking.

### Weaknesses

1. Active lifecycle supports saving/current clearly, while other product flows are commented legacy code.
2. Create/update audit performer is not authenticated identity.
3. KYC service methods are not consistently transactional.
4. Filesystem and DB operations are not coordinated.
5. Executor rejection is not handled.
6. `verifyAsync` does not guard against terminal states.
7. No optimistic locking on active KYC entity.
8. Branch filtering loads all records and filters in memory for COP.
9. File naming loses extensions and original filenames.
10. No file validation, scanning, checksum, or cleanup.

### Technical Debt

1. `ddl-auto=update` instead of migrations.
2. Legacy commented controllers and services.
3. Duplicated/obsolete models such as `OldKycRecord` and commented `KYCRecord`.
4. Zoop integration is disabled and controller commented.
5. BranchAccess duplicates user type/status from UserRecord.
6. Branch list stored as serialized LOB rather than normalized relation.
7. Test coverage appears minimal.
8. Hardcoded code generation based on branch count can collide under concurrency.

### Actual Bugs

1. `documentBasePath` in `buildEntity` uses `ROOT_F/{branch}/{accountType}/{code}`, but `saveFiles` writes to `ROOT_F/{branch}/CASA/{Saving|Current}/{accountType}/{code}`. The stored path does not match actual directory structure.
2. Create/update audit performer records applicant instead of authenticated BOM.
3. `generateCode` can generate duplicate codes under concurrent creates for the same branch.
4. Concurrent submits can schedule duplicate async verification.
5. Async verification can overwrite state without checking current status.
6. No cleanup after delete leaves files on disk.
7. Lost file extensions may make downloaded/opened files hard to use.
8. Queue rejection can leave a record stuck in `PENDING_VERIFICATION`.

### Design Tradeoffs

1. Monolith simplifies deployment but concentrates responsibilities.
2. Filesystem storage is simple but weak for scale.
3. JWT is stateless but hard to revoke.
4. In-process async is easy but not durable.
5. RBAC is simple but less flexible than policy-based access.
6. BranchAccess separate entity improves separation but can drift from UserRecord.

### Scalability Concerns

1. COP `getAll` uses `repository.findAll()` and filters in memory.
2. Local filesystem blocks horizontal scaling unless shared.
3. In-process async tasks are lost on restart.
4. Hikari pool max 30 and async max 65 can create pressure if many async tasks hold DB connections during `pg_sleep`.
5. Code generation by count does not scale safely.
6. No pagination on `GET /kyc`.
7. Large multipart uploads can consume memory and disk.

## 14. Teach Me This Project

Think of the system as a controlled file and approval desk for KYC.

At a branch, someone meets the customer and collects identity evidence. That person is the maker, represented by the BOM role. The maker's job is not to approve the KYC; their job is to prepare the case. In code, that is why `add`, `update`, `submit`, and `delete` are BOM methods.

When the BOM creates a record, the system first checks basic identity completeness. Aadhaar must look like a 12-character value, mobile must be 10 characters, and applicant name must exist. These are not complete compliance validations, but they stop obviously incomplete records from entering the system.

Then the system saves documents. The documents are the evidence behind the KYC. Instead of storing them in the database, the code creates a branch/account/code folder tree under `./uploads`. The database record stores the business metadata and a document path. This design keeps database rows lighter, but it means the filesystem and database must stay in sync. If one succeeds and the other fails, the system can have orphan files or records pointing to missing files.

The new KYC starts as `DRAFT`. That means "the branch is still working on it." A draft is not ready for approval. This state matters because it prevents a checker from approving half-finished work.

When the BOM submits, the system says: "This is ready to be formally checked." The code requires the record to be `DRAFT`; otherwise, submit is blocked. This matters because resubmitting already verified, approved, failed, or pending records would create duplicate checks and confusing state.

Submission moves the state to `PENDING_VERIFICATION`. This is the automated gate. The business idea is that a human checker should not approve a record until the system has done basic identity verification. In the current code, verification is simulated with a delay and random pass/fail. In production, this would call Zoop or another provider.

Verification is async because real verification is slow. If the app called a provider synchronously, the user's browser would wait and Tomcat threads would be occupied. Async lets the submit request return while background workers process verification. The cost is reliability: in-memory workers can reject tasks under load or lose work on restart.

If verification succeeds, the state becomes `VERIFIED`. This means "ready for checker decision." It does not mean approved. This distinction is important. Automated checks can say identity data looks valid, but the institution still wants a human/operations checker to approve or reject the case.

The checker is COP. COP can approve or reject, but only after the record is `VERIFIED`. The code enforces that with `approve` and `reject` status checks. A COP cannot approve a draft, pending, failed, rejected, or already approved record.

The branch rule is the second half of checker control. COP users may have a list of branches they can review, but they cannot review their own home branch. The home branch exclusion is the independence rule. It keeps a reviewer from approving work that originates from their own operational branch.

When COP approves, the record becomes `APPROVED`. That is terminal. The code blocks editing, deleting, and rejecting approved records. The business reason is that an approved KYC is a compliance artifact. If changes are needed after approval, the safer design is a new amendment workflow, not silent mutation of the approved record.

When COP rejects, the record becomes `REJECTED` with a reason. Rejection is not terminal. It is feedback. The BOM can update a rejected record, and the code changes it back to `DRAFT`. That means the branch is reworking it. After rework, it must be submitted and verified again. This protects the workflow from "reject then directly approve" without correction.

`FAILED` is different. It is set by async verification after max attempts. The current implementation does not provide a retry path. If this represents true identity mismatch, that is reasonable. If it represents provider failure, it is too strict. A production system should separate "verification failed because identity did not match" from "verification could not be completed because provider/system failed."

Audit is the memory of the system. Every important human lifecycle action should create a row saying who did what and when. The current code audits create, update, submit, approve, reject, and delete. Submit/approve/reject/delete correctly use authenticated identity. Create/update still use applicant as performer, which should be corrected. Also, verification and admin changes should be audited.

Security wraps all of this. Login is not just password checking; it is also account status checking. A user whose status is not `Accept` is blocked. JWT makes the API stateless. The JWT filter repopulates the Spring security context on each request. From that point, the service methods know the current username and Spring can enforce `@PreAuthorize`.

The design decisions are mostly pragmatic:

1. Monolith because it is simpler to build and operate.
2. JWT because the frontend talks to REST endpoints.
3. Filesystem storage because it is simple and avoids DB blobs.
4. Async executor because verification is slow.
5. BranchAccess because review scope is separate from user identity.
6. Audit table because compliance needs queryable action history.

What would break without each key piece:

1. Without `UserRecord.userIdStatus` check, inactive users could log in.
2. Without JWT validation, requests would be anonymous or spoofable.
3. Without `@PreAuthorize`, BOM could approve or COP could create if endpoints were exposed.
4. Without BranchAccess, COP could review any branch.
5. Without home branch exclusion, COP could review their own branch.
6. Without KYC states, records could skip verification or mutate after approval.
7. Without async, submit could block under slow verification.
8. Without audit, there is no reliable proof of who approved or rejected a KYC.
9. Without filesystem storage or another document store, the system has metadata but no evidence.

The simplest mental model is: BOM prepares the file, async verification checks the identity signal, COP independently signs off, branch rules control who can see what, and audit records preserve the trail.

