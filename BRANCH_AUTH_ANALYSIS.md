# Branch Authorization Analysis

## 1. Intended Authorization Model

The codebase appears to model branch authorization with two separate user/branch entities:

- `UserRecord`
  - File: `src/main/java/com/sahayogmultistate/it/kyc/model/UserRecord.java`
  - Fields:
    - `userName`
    - `branchName`
    - `userType`
    - `userIdStatus`
- `BranchAccess`
  - File: `src/main/java/com/sahayogmultistate/it/kyc/model/BranchAccess.java`
  - Fields:
    - `userName`
    - `branchNameList`
    - `userType`
    - `userIdStatus`
    - `branchName`

Inferred intended model:

- `UserRecord.branchName` is the user's home branch.
- `BranchAccess.branchName` also stores a branch for the user, likely home branch.
- `BranchAccess.branchNameList` stores branches the user may access.
- Historical/commented KYC services contain methods named `getAllKycForUserBranches(String userName)` that load a user's `BranchAccess`, iterate `branchNameList`, and query KYC records by branch.

No active backend code implements the additional maker-checker rule: a COP may review only branches in `branchNameList` and may not review their own home branch.

## 2. Actual Authorization Model

The active backend authorization model is role-only for mutation methods:

- BOM can save KYC.
- BOM can update KYC.
- BOM can submit KYC.
- COP can approve KYC.
- COP can reject KYC.

Files and methods:

- `src/main/java/com/sahayogmultistate/it/kyc/service/KycSavingAndCurrentService.java`
  - `add(KycRequest)` at lines 45-46: `@PreAuthorize("hasRole('BOM')")`
  - `update(long, KycRequest)` at lines 73-74: `@PreAuthorize("hasRole('BOM')")`
  - `submit(long)` at lines 112-113: `@PreAuthorize("hasRole('BOM')")`
  - `approve(long)` at lines 137-138: `@PreAuthorize("hasRole('COP')")`
  - `reject(long, String)` at lines 166-167: `@PreAuthorize("hasRole('COP')")`
  - `delete(long)` at lines 204-205: `@PreAuthorize("hasRole('BOM')")`

Global method security is enabled:

- `src/main/java/com/sahayogmultistate/it/kyc/config/SecurityConfig.java`
  - Line 19: `@EnableGlobalMethodSecurity(prePostEnabled = true)`

HTTP-level authorization only requires authentication for `/kyc/**`:

- `src/main/java/com/sahayogmultistate/it/kyc/config/SecurityConfig.java`
  - Line 42: `.antMatchers("/kyc/**").authenticated()`
  - Line 43: `.anyRequest().authenticated()`

There is no backend branch authorization decision in the active KYC controller or service.

## 3. How User Branch Permissions Are Loaded

### Authentication user load

Login/JWT user loading uses `CustomUserDetailsService`.

File: `src/main/java/com/sahayogmultistate/it/kyc/security/CustomUserDetailsService.java`

Method: `loadUserByUsername(String username)`

- Line 23: loads `UserRecord` by username through `userRecordService.getUser(username)`.
- Lines 33-37: builds Spring Security `UserDetails` with username, password, and authority `ROLE_` + `userRecord.getUserType()`.

The authenticated principal contains role and username. It does not contain home branch or branch list.

### UserRecord branch data

File: `src/main/java/com/sahayogmultistate/it/kyc/model/UserRecord.java`

- Line 31: `userName`
- Line 34: `branchName`
- Line 35: `userType`
- Line 36: `userIdStatus`

File: `src/main/java/com/sahayogmultistate/it/kyc/service/UserRecordService.java`

- `add(...)`
  - Lines 40-42: receives `branchName`, `userType`, and `userIdStatus`.
  - Lines 45-50: stores them on `UserRecord`.
- `update(...)`
  - Lines 57-58: receives `branchName`, `userType`, and `userIdStatus`.
  - Lines 62-67: stores them on `UserRecord`.
  - Lines 68-76: updates or creates matching `BranchAccess`.

### BranchAccess load path

File: `src/main/java/com/sahayogmultistate/it/kyc/model/BranchAccess.java`

- Line 31: `userName`
- Lines 32-34: `branchNameList`
- Line 35: `userType`
- Line 36: `userIdStatus`
- Line 37: `branchName`

File: `src/main/java/com/sahayogmultistate/it/kyc/controller/BranchAccessController.java`

- `GET /branch/user/{username}`
  - Lines 71-78
  - Calls `service.getUser(username)` and returns `BranchAccessResponse`.

File: `src/main/java/com/sahayogmultistate/it/kyc/service/BranchAccessService.java`

- `getUser(String username)`
  - Lines 66-74
  - Calls `repository.findAll()`, loops through all branch-access rows, and returns the first record whose `userName` equals the supplied username.

File: `src/main/java/com/sahayogmultistate/it/kyc/repository/IBranchAccessRepository.java`

- Extends `JpaRepository<BranchAccess, Integer>` at line 20.
- Username-specific repository methods are commented out at lines 22-26.

Important: this branch access load path is not used by the active KYC authorization methods. It is exposed as a separate authenticated endpoint and used by static JavaScript, but not enforced by `/kyc` service methods.

## 4. How KYC Visibility Is Controlled

### Active list endpoint

File: `src/main/java/com/sahayogmultistate/it/kyc/controller/KycSavingAndCurrentController.java`

Method: `getAll()`

- Lines 145-148:
  - `GET /kyc`
  - Returns `service.getAllKycRecords()`.

File: `src/main/java/com/sahayogmultistate/it/kyc/service/KycSavingAndCurrentService.java`

Method: `getAllKycRecords()`

- Lines 195-197:
  - Returns `repository.findAll()`.

Result: any authenticated user can call `GET /kyc` and receive all `KycSavingAndCurrent` records. There is no role check and no branch filtering.

### Active fetch-by-id endpoint

File: `src/main/java/com/sahayogmultistate/it/kyc/controller/KycSavingAndCurrentController.java`

Method: `get(long id)`

- Lines 139-142:
  - `GET /kyc/{id}`
  - Returns `service.getKycRecordById(id)`.

File: `src/main/java/com/sahayogmultistate/it/kyc/service/KycSavingAndCurrentService.java`

Method: `getKycRecordById(long id)`

- Lines 199-201:
  - Returns `repository.findById(id).orElse(null)`.

Result: any authenticated user can fetch any KYC record by id. There is no role check and no branch filtering.

### Repository branch methods

File: `src/main/java/com/sahayogmultistate/it/kyc/repository/KycSavingAndCurrentRepository.java`

- Line 23: `countByBranchName(String branchName)`
- Lines 28-29: `findAllByBranchName(String branchName)`

`findAllByBranchName(...)` exists but is not used by active KYC listing or authorization code.

Other inactive/commented account-type repositories also define `findAllByBranchName(...)`:

- `KycJointSavingRepository.java`
- `KycPartnershipRepository.java`
- `KycPubPvtRepository.java`
- `KycSoleProprietorshipRepository.java`
- `KycTascRepository.java`

Their related controllers/services are commented out in the current source.

## 5. How KYC Approval Is Controlled

### Endpoint

File: `src/main/java/com/sahayogmultistate/it/kyc/controller/KycSavingAndCurrentController.java`

Method: `approve(long id)`

- Lines 124-127:
  - `POST /kyc/{id}/approve`
  - Calls `service.approve(id)`.

### Service flow

File: `src/main/java/com/sahayogmultistate/it/kyc/service/KycSavingAndCurrentService.java`

Method: `approve(long id)`

- Line 137: `@PreAuthorize("hasRole('COP')")`
- Line 140: gets username from `SecurityContextHolder` via `getCurrentUsername()`.
- Line 142: loads KYC by id using `getKycRecordById(id)`.
- Lines 144-145: rejects missing record.
- Lines 147-148: rejects if already approved.
- Lines 150-151: requires status `VERIFIED`.
- Lines 153-156: sets status to `APPROVED`, stores `approvedBy`, clears rejection fields.
- Line 158: saves record.
- Line 160: logs audit.

Method: `getCurrentUsername()`

- Lines 334-340:
  - Reads `SecurityContextHolder.getContext().getAuthentication()`.
  - Returns `auth.getName()`.

Approval checks implemented:

- User must have role `COP`.
- KYC must exist.
- KYC must not already be approved.
- KYC must be `VERIFIED`.

Approval checks not implemented:

- No lookup of COP `UserRecord`.
- No lookup of COP `BranchAccess`.
- No check that record branch is in COP `branchNameList`.
- No check that record branch differs from COP home branch.
- No check that the COP did not originate/upload the record.

## 6. How KYC Rejection Is Controlled

### Endpoint

File: `src/main/java/com/sahayogmultistate/it/kyc/controller/KycSavingAndCurrentController.java`

Method: `reject(long id, String reason)`

- Lines 130-136:
  - `POST /kyc/{id}/reject`
  - Requires request parameter `reason`.
  - Calls `service.reject(id, reason)`.

### Service flow

File: `src/main/java/com/sahayogmultistate/it/kyc/service/KycSavingAndCurrentService.java`

Method: `reject(long id, String reason)`

- Line 166: `@PreAuthorize("hasRole('COP')")`
- Line 169: gets username from `SecurityContextHolder` via `getCurrentUsername()`.
- Line 171: loads KYC by id using `getKycRecordById(id)`.
- Lines 173-174: rejects missing record.
- Lines 176-177: rejects already approved KYC.
- Lines 179-180: requires status `VERIFIED`.
- Lines 182-185: sets status to `REJECTED`, stores reason and `rejectedBy`, clears `approvedBy`.
- Line 187: saves record.
- Line 189: logs audit.

Rejection checks implemented:

- User must have role `COP`.
- KYC must exist.
- KYC must not already be approved.
- KYC must be `VERIFIED`.

Rejection checks not implemented:

- No lookup of COP `UserRecord`.
- No lookup of COP `BranchAccess`.
- No check that record branch is in COP `branchNameList`.
- No check that record branch differs from COP home branch.
- No check that the COP did not originate/upload the record.

## 7. Missing Enforcement Points

Missing backend branch enforcement:

- `GET /kyc`
  - Should filter visible records by current user's allowed branches, but currently returns `repository.findAll()`.
- `GET /kyc/{id}`
  - Should verify the current user can access the record's branch, but currently returns by id only.
- `POST /kyc/{id}/approve`
  - Should verify COP branch authorization before approving, but currently checks only role and status.
- `POST /kyc/{id}/reject`
  - Should verify COP branch authorization before rejecting, but currently checks only role and status.
- `PUT /kyc/update/{id}`
  - Should verify BOM owns or may update the record's branch, but currently checks only role and status.
- `POST /kyc/{id}/submit`
  - Should verify BOM may submit the record's branch, but currently checks only role and status.
- `DELETE /kyc/{id}`
  - Should verify BOM may delete the record's branch, but currently checks only role and status.
- `BranchAccessController`
  - All `/branch` endpoints are authenticated by `SecurityConfig.anyRequest().authenticated()`, but there are no method-level role checks in the controller.

Missing maker-checker segregation:

- No backend check prevents a COP from approving or rejecting a KYC record from their own home branch.
- No backend check prevents a COP from approving or rejecting a record outside their `branchNameList`.

## 8. Security Findings

### Finding 1: Branch authorization is not enforced for KYC listing

Any authenticated user can call `GET /kyc` and receive all active `KycSavingAndCurrent` rows, regardless of branch.

Evidence:

- `KycSavingAndCurrentController.getAll()` lines 145-148.
- `KycSavingAndCurrentService.getAllKycRecords()` lines 195-197.

### Finding 2: Branch authorization is not enforced for fetch-by-id

Any authenticated user can call `GET /kyc/{id}` and retrieve a KYC record by id regardless of branch.

Evidence:

- `KycSavingAndCurrentController.get(...)` lines 139-142.
- `KycSavingAndCurrentService.getKycRecordById(...)` lines 199-201.

### Finding 3: Approval is role-only, not branch-aware

Any authenticated user with `ROLE_COP` can approve any `VERIFIED` KYC record by id, including records from their own home branch or branches outside their `branchNameList`.

Evidence:

- `KycSavingAndCurrentService.approve(...)` lines 137-162.
- The method never references `BranchAccessService`, `UserRecordService`, `branchNameList`, or `UserRecord.branchName`.

### Finding 4: Rejection is role-only, not branch-aware

Any authenticated user with `ROLE_COP` can reject any `VERIFIED` KYC record by id, including records from their own home branch or branches outside their `branchNameList`.

Evidence:

- `KycSavingAndCurrentService.reject(...)` lines 166-191.
- The method never references `BranchAccessService`, `UserRecordService`, `branchNameList`, or `UserRecord.branchName`.

### Finding 5: BranchAccess exists but is not part of active KYC authorization

`BranchAccess` and `branchNameList` are modeled and exposed, but not used in active KYC authorization.

Evidence:

- `BranchAccess` entity lines 31-37.
- `BranchAccessService.getUser(...)` lines 66-74.
- `BranchAccessController.getUserRecord(...)` lines 71-78.
- Active KYC service does not inject `BranchAccessService`.

### Finding 6: Historical branch-filter code is commented out

Several older services contain commented-out methods that load `BranchAccess`, iterate `branchNameList`, and call `findAllByBranchName(...)`. These methods are not active.

Examples:

- `KycJointSavingService.java`: commented `getAllKycForUserBranches(...)`.
- `KycPartnershipService.java`: commented `getAllKycForUserBranches(...)`.
- `KycPubPvtService.java`: commented `getAllKycForUserBranches(...)`.
- `KycSoleProprietorshipService.java`: commented `getAllKycForUserBranches(...)`.
- `KycTascService.java`: commented `getAllKycForUserBranches(...)`.

Those comments show the intended direction, but they do not enforce authorization in the running backend.

## 9. Recommended Implementation Location For Branch Authorization

Do not rely on front-end filtering or separate `/branch/user/{username}` calls for authorization.

The most appropriate backend enforcement points are:

- `KycSavingAndCurrentService.getAllKycRecords()`
  - Apply branch-scoped listing for the current authenticated user.
- `KycSavingAndCurrentService.getKycRecordById(long id)`
  - Enforce record-level branch access before returning a record.
- `KycSavingAndCurrentService.approve(long id)`
  - Enforce COP branch authorization and own-home-branch exclusion before state change.
- `KycSavingAndCurrentService.reject(long id, String reason)`
  - Enforce the same COP branch authorization and own-home-branch exclusion before state change.
- Shared helper/service
  - Centralize current-user branch resolution and branch authorization checks so listing, get-by-id, approve, reject, submit, update, and delete cannot diverge.

Current state: backend maker-checker role segregation is partially enforced by `@PreAuthorize`, but backend branch authorization and own-branch checker exclusion are not enforced.
