# Authentication Status Analysis

## Scope

Read-only investigation of whether inactive `UserRecord` accounts can authenticate through the JWT login endpoint:

```text
POST /auth/login
    -> AuthenticationManager
    -> CustomUserDetailsService
    -> password validation
    -> JwtTokenUtil.generateToken(...)
```

No application code was modified.

## Located Files

| Component | File |
|---|---|
| AuthController | `src/main/java/com/sahayogmultistate/it/kyc/controller/AuthController.java` |
| CustomUserDetailsService | `src/main/java/com/sahayogmultistate/it/kyc/security/CustomUserDetailsService.java` |
| UserRecord | `src/main/java/com/sahayogmultistate/it/kyc/model/UserRecord.java` |
| UserRecordService | `src/main/java/com/sahayogmultistate/it/kyc/service/UserRecordService.java` |
| SecurityConfig | `src/main/java/com/sahayogmultistate/it/kyc/config/SecurityConfig.java` |
| JWT generation | `src/main/java/com/sahayogmultistate/it/kyc/security/JwtTokenUtil.java` |
| JWT request filter | `src/main/java/com/sahayogmultistate/it/kyc/security/JwtAuthenticationFilter.java` |
| User repository/status queries | `src/main/java/com/sahayogmultistate/it/kyc/repository/IUserRecordRepository.java` |
| Password encoder | `src/main/java/com/sahayogmultistate/it/kyc/service/AppConfig.java` |

## Authentication Flow

### 1. `POST /auth/login`

File: `src/main/java/com/sahayogmultistate/it/kyc/controller/AuthController.java`

Method: `AuthController.login(LoginRequest)`

Relevant lines:

- Line 19: controller base path is `/auth`.
- Line 28: `@PostMapping("/login")`.
- Lines 31-36: creates `UsernamePasswordAuthenticationToken` from `loginRequest.getUserName()` and `loginRequest.getPassword()`, then calls `authenticationManager.authenticate(...)`.
- Line 38: reads the authenticated principal as `UserDetails`.
- Line 40: generates JWT using `jwtTokenUtil.generateToken(userDetails)`.
- Lines 47-54: returns `AuthResponse` with token, token type, username, and role.

There is no `userIdStatus` check in this controller.

### 2. Security configuration

File: `src/main/java/com/sahayogmultistate/it/kyc/config/SecurityConfig.java`

Methods:

- `securityFilterChain(HttpSecurity)`
- `authenticationProvider()`
- `authenticationManager(AuthenticationConfiguration)`

Relevant lines:

- Line 40: `/auth/login` is explicitly `permitAll()`.
- Lines 49-54: `DaoAuthenticationProvider` is configured with `CustomUserDetailsService` and `PasswordEncoder`.
- Lines 57-60: exposes the `AuthenticationManager`.

There is no `userIdStatus` check in the security configuration.

### 3. UserDetailsService lookup

File: `src/main/java/com/sahayogmultistate/it/kyc/security/CustomUserDetailsService.java`

Method: `loadUserByUsername(String username)`

Relevant lines:

- Line 22: loads `UserRecord` using `userRecordService.getUser(username)`.
- Lines 23-25: rejects only when no user record exists.
- Lines 27-31: builds Spring Security `UserDetails` with username, password, and authority.

Important: `userRecord.getUserIdStatus()` is never read here. Spring Security's `User.builder().build()` creates an enabled, non-expired, non-locked account unless those flags are explicitly changed. This means account status is not part of authentication.

### 4. UserRecord lookup

File: `src/main/java/com/sahayogmultistate/it/kyc/service/UserRecordService.java`

Method: `getUser(String username)`

Relevant lines:

- Lines 143-148: calls `repository.findByUserName(username)` and returns the record if present.

File: `src/main/java/com/sahayogmultistate/it/kyc/repository/IUserRecordRepository.java`

Method: `findByUserName(String userName)`

Relevant line:

- Line 22: `Optional<UserRecord> findByUserName(String userName);`

This lookup is by username only. It does not filter by `userIdStatus = 'Accept'`.

### 5. Password validation

File: `src/main/java/com/sahayogmultistate/it/kyc/config/SecurityConfig.java`

Method: `authenticationProvider()`

Relevant lines:

- Line 52: uses `customUserDetailsService`.
- Line 53: uses the configured `PasswordEncoder`.

File: `src/main/java/com/sahayogmultistate/it/kyc/service/AppConfig.java`

Method: `passwordEncoder()`

Relevant lines:

- Lines 26-29: returns `new BCryptPasswordEncoder()`.

Password validation is performed by Spring Security's `DaoAuthenticationProvider` using the password returned by `CustomUserDetailsService`. The validation checks the password hash, but it does not check `userIdStatus`.

### 6. JWT generation

File: `src/main/java/com/sahayogmultistate/it/kyc/security/JwtTokenUtil.java`

Method: `generateToken(UserDetails userDetails)`

Relevant lines:

- Lines 26-30: creates claims with the user's role and creates a token with the username as subject.

Method: `createToken(Map<String, Object> claims, String subject)`

Relevant lines:

- Lines 46-55: sets claims, subject, issued-at, expiration, signature, and compacts the JWT.

There is no `userIdStatus` claim and no `userIdStatus` validation before token creation.

## Status Field and Status Usage

### Account status field

File: `src/main/java/com/sahayogmultistate/it/kyc/model/UserRecord.java`

- Line 36: `private String userIdStatus;`

This is the account lifecycle/status field relevant to authentication.

File: `src/main/java/com/sahayogmultistate/it/kyc/model/BranchAccess.java`

- Line 36: `private String userIdStatus;`

This mirrors user access metadata for branch access, but the JWT login flow does not read it.

### UserRecordService usages

File: `src/main/java/com/sahayogmultistate/it/kyc/service/UserRecordService.java`

Methods:

- `add(...)`
  - Lines 40-42: receives `userIdStatus`.
  - Line 49: saves `userIdStatus` on new `UserRecord`.
- `update(...)`
  - Lines 57-58: receives `userIdStatus`.
  - Line 66: saves `userIdStatus` on updated `UserRecord`.
  - Lines 72 and 76: propagates `userIdStatus` into `BranchAccessService`.
- `getActiveRecords()`
  - Lines 93-96: delegates to `repository.findActiveRecords()`.
- `getInactiveRecords()`
  - Lines 108-111: delegates to `repository.findInactiveRecords()`.
- `getPendingRecords()`
  - Lines 113-116: delegates to `repository.findPendingRecords()`.
- `getTerminateRecords()`
  - Lines 118-121: delegates to `repository.findTerminateRecords()`.
- `getResetPasswordRecords()`
  - Lines 123-126: delegates to `repository.findResetPasswordRecords()`.
- `getAllRecordsNumberList()`
  - Lines 128-140: counts active, rejected, pending, terminated, and reset-password users.
- `getUser(String username)`
  - Lines 143-148: username-only lookup used by authentication.
- `getUserRstPass(String username, String password)`
  - Lines 150-160: updates password and sets `userIdStatus` to `Reset_Password`.

### Repository status queries

File: `src/main/java/com/sahayogmultistate/it/kyc/repository/IUserRecordRepository.java`

Methods:

- `findActiveRecords()`
  - Lines 24-25: `userIdStatus = 'Accept'` and not `Super User`.
- `findActiveRecordsBOM()`
  - Lines 27-28: `userIdStatus = 'Accept'` and `userType = 'BOM'`.
- `findActiveRecordsCOPs()`
  - Lines 30-31: `userIdStatus = 'Accept'` and `userType = 'COPs'`.
- `findInactiveRecords()`
  - Lines 33-34: `userIdStatus = 'Reject'`.
- `findPendingRecords()`
  - Lines 36-37: `userIdStatus = 'Pending'`.
- `findTerminateRecords()`
  - Lines 39-40: `userIdStatus = 'Terminate'`.
- `findResetPasswordRecords()`
  - Lines 42-43: `userIdStatus = 'Reset_Password'`.

These queries are used for user listing/counting. They are not used by `CustomUserDetailsService.loadUserByUsername(...)`.

### Front-end legacy status checks

File: `src/main/resources/static/js/index.js`

Relevant lines:

- Lines 61-63: sign-up flow sends `"Pending"` to legacy `/user/add/...`.
- Lines 91-98: legacy login calls `/user/login/{userName}/{password}` and compares response data.
- Lines 100-114: allows navigation only when `userRecord.userIdStatus === "Accept"`.
- Lines 116-132: blocks `Pending`, `Reject`, `Terminate`, and `Reset_Password` in the browser.

This is not the JWT login path. Current Java source contains `AuthController` for `/auth/login`; no active Java controller for `/user/login/...` was found under `src/main/java`. Client-side checks cannot secure the server-side JWT endpoint.

### Other `status` usages

There are many `status` fields/usages under KYC workflow models, controllers, services, HTML, and JavaScript. These refer to KYC application/document workflow statuses such as `Pending at COPs`, `Pending at BOM`, and `Approved`, not `UserRecord.userIdStatus`. They are not part of the `/auth/login` authentication decision.

## Status-by-Status Authentication Result

Assumption for each row: the username exists and the supplied password matches the stored BCrypt hash.

| `UserRecord.userIdStatus` | Can authenticate through `POST /auth/login` and receive JWT? | Why |
|---|---:|---|
| `Pending` | Yes | Login path loads by username only, builds enabled `UserDetails`, validates password, and generates JWT. No status check rejects `Pending`. |
| `Accept` | Yes | Accepted users also pass because the username/password are valid. This is the intended active status. |
| `Reject` | Yes | `Reject` is only used by listing/counting queries and legacy browser logic. JWT login does not reject it. |
| `Terminate` | Yes | `Terminate` is only used by listing/counting queries and legacy browser logic. JWT login does not reject it. |
| `Reset_Password` | Yes | Password reset explicitly sets this status, but JWT login still authenticates as long as the new password is correct. |

## Complete Execution Path for Inactive User

Example: user has `userIdStatus = 'Terminate'` and correct password.

1. Request reaches `AuthController.login(...)`.
   - File: `AuthController.java`
   - Lines 28-36
   - The request is accepted because `/auth/login` is `permitAll()`.

2. `AuthenticationManager.authenticate(...)` delegates to `DaoAuthenticationProvider`.
   - File: `SecurityConfig.java`
   - Lines 49-54
   - Provider uses `CustomUserDetailsService` and `PasswordEncoder`.

3. `CustomUserDetailsService.loadUserByUsername(...)` loads the user.
   - File: `CustomUserDetailsService.java`
   - Lines 21-31
   - It calls `UserRecordService.getUser(username)`, checks only for null, and builds `UserDetails`.
   - It does not check `userRecord.getUserIdStatus()`.

4. `UserRecordService.getUser(...)` queries by username only.
   - File: `UserRecordService.java`
   - Lines 143-148
   - File: `IUserRecordRepository.java`
   - Line 22

5. Password validation occurs.
   - File: `SecurityConfig.java`
   - Lines 52-53
   - File: `AppConfig.java`
   - Lines 26-29
   - Password match succeeds because the account status is not part of the check.

6. JWT is generated.
   - File: `AuthController.java`
   - Line 40
   - File: `JwtTokenUtil.java`
   - Lines 26-30 and 46-55
   - The token contains username and role, not account status.

7. Response returns token.
   - File: `AuthController.java`
   - Lines 47-54

The same path applies to `Pending`, `Reject`, `Terminate`, and `Reset_Password`.

## Additional JWT Session Impact

File: `src/main/java/com/sahayogmultistate/it/kyc/security/JwtAuthenticationFilter.java`

Method: `doFilterInternal(...)`

Relevant lines:

- Lines 42-44: extracts username from token, loads current `UserDetails`, then validates token.
- Lines 45-49: places authentication in the security context.

`JwtAuthenticationFilter` also uses `CustomUserDetailsService`, which does not check `userIdStatus`. Therefore:

- A JWT already issued to a user can remain valid after the user is moved to `Reject`, `Terminate`, `Pending`, or `Reset_Password`, until token expiration.
- A terminated/rejected/reset-password user can continue using an unexpired JWT.

## Finding

Bug exists.

Inactive or non-accepted users can authenticate through `POST /auth/login` and obtain JWT tokens if they know the correct password.

## Why the Bug Exists

The system has two separate ideas of login eligibility:

1. User-management/listing code treats only `userIdStatus = 'Accept'` as active.
   - File: `IUserRecordRepository.java`
   - Lines 24-31

2. JWT authentication ignores `userIdStatus`.
   - File: `CustomUserDetailsService.java`
   - Lines 21-31
   - File: `UserRecordService.java`
   - Lines 143-148

The old browser login logic blocks inactive statuses in JavaScript, but the server-side JWT endpoint does not enforce the same rule.

## Security Impact

Users whose accounts are pending approval, rejected, terminated, or reset-password can still obtain valid JWTs by calling `/auth/login` directly with correct credentials.

Impact:

- Pending users may access authenticated APIs before approval.
- Rejected users may retain access despite denial.
- Terminated users may retain access after offboarding.
- Reset-password users may authenticate while the system appears to require super-user reactivation.
- Existing JWTs are not invalidated by status changes because token validation also ignores `userIdStatus`.

## Minimal Fix

Enforce account status in the server-side authentication path, not only in front-end code.

Minimal server-side options:

1. In `CustomUserDetailsService.loadUserByUsername(...)`, after loading `UserRecord`, allow authentication only when `userRecord.getUserIdStatus().equals("Accept")`; otherwise throw a Spring Security authentication exception such as `DisabledException` or return a `UserDetails` with `disabled(true)`.

2. Also enforce the same status check during JWT validation, because already-issued tokens should stop working after an account is rejected, terminated, reset to password-change state, or otherwise made inactive. Since `JwtAuthenticationFilter` already reloads `UserDetails` on each request, putting the status check in `CustomUserDetailsService` would cover both login and token reuse.

The most focused fix is to update `CustomUserDetailsService` so all authentication mechanisms using it consistently reject non-`Accept` users.
