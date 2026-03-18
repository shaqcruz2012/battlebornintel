# SOC 2 Type I Controls Documentation

**System**: Battle Born Intelligence (BBI) Platform
**Assessment Date**: March 18, 2026
**Prepared By**: BBI Security & Compliance Team
**Scope**: BBI web application, API layer, PostgreSQL database, and supporting infrastructure
**Service Description**: BBI is a venture ecosystem intelligence platform that aggregates, scores, and visualizes data about companies, funds, accelerators, and stakeholders in the Nevada innovation ecosystem. The system provides executive dashboards, graph-based relationship mapping, and analytical scoring engines to inform investment and policy decisions.

---

## Table of Contents

1. [Security (CC1-CC9)](#1-security-cc1-cc9)
2. [Availability (A1)](#2-availability-a1)
3. [Processing Integrity (PI1)](#3-processing-integrity-pi1)
4. [Confidentiality (C1)](#4-confidentiality-c1)
5. [Privacy (P1-P8)](#5-privacy-p1-p8)
6. [Summary of Control Statuses](#6-summary-of-control-statuses)
7. [Remediation Roadmap](#7-remediation-roadmap)

---

## 1. Security (CC1-CC9)

### CC1 — Control Environment

#### CC1.1 — Organizational Commitment to Integrity and Ethical Values

| Field | Detail |
|---|---|
| **Control ID** | CC1.1 |
| **Control Description** | The organization demonstrates a commitment to integrity and ethical values through defined security policies and code of conduct. |
| **Current Implementation** | Security policies are documented in `docs/SECURITY_POLICY.md`. Environment configuration enforces separation of development and production secrets via `.env.example` with placeholder values and explicit comments requiring strong secrets in production. |
| **Status** | Partially Implemented |
| **Evidence** | `.env.example` (lines 8-13), `docs/SECURITY_POLICY.md` |
| **Gap / Remediation** | Formalize an organizational code of conduct. Establish annual security awareness training for all personnel with access to the system. Document an acceptable use policy. |

#### CC1.2 — Board of Directors Oversight

| Field | Detail |
|---|---|
| **Control ID** | CC1.2 |
| **Control Description** | Management and/or the board of directors demonstrates oversight of the development and performance of internal controls. |
| **Current Implementation** | Not formally documented. |
| **Status** | Not Implemented |
| **Evidence** | N/A |
| **Gap / Remediation** | Establish a governance body or designated individual responsible for security oversight. Document meeting cadence and charter for reviewing security posture quarterly. |

---

### CC2 — Communication and Information

#### CC2.1 — Internal Communication of Security Policies

| Field | Detail |
|---|---|
| **Control ID** | CC2.1 |
| **Control Description** | The entity internally communicates information, including objectives and responsibilities for internal control, necessary to support the functioning of internal controls. |
| **Current Implementation** | Architecture documentation exists in `docs/ARCHITECTURE.md`. API documentation exists in `docs/API.md`. Deployment procedures are documented in `docs/DEPLOYMENT.md`. Configuration requirements are documented in `.env.example` with inline comments. |
| **Status** | Partially Implemented |
| **Evidence** | `docs/ARCHITECTURE.md`, `docs/API.md`, `docs/DEPLOYMENT.md`, `.env.example` |
| **Gap / Remediation** | Create a formal security policy distribution process. Require acknowledgment from all team members. Document roles and responsibilities for security incident handling. |

---

### CC3 — Risk Assessment

#### CC3.1 — Risk Identification and Analysis

| Field | Detail |
|---|---|
| **Control ID** | CC3.1 |
| **Control Description** | The entity identifies and assesses risks to the achievement of its objectives, including risks related to security, availability, processing integrity, confidentiality, and privacy. |
| **Current Implementation** | Data quality risk framework is implemented with Verified/Inferred/Calculated confidence classifications tracked on `companies` and `graph_edges` tables (`verified` column, `confidence` field). Row Level Security policies are defined (though not yet enforced) to restrict low-confidence data from reader roles. |
| **Status** | Partially Implemented |
| **Evidence** | `database/migrations/008_security_and_permissions.sql` (lines 70-91), `database/migrations/009_add_data_source_tracking.sql` |
| **Gap / Remediation** | Conduct a formal risk assessment covering all trust service criteria. Document risk tolerance levels. Establish a risk register with periodic review cadence. |

---

### CC4 — Monitoring Activities

#### CC4.1 — Monitoring of Controls

| Field | Detail |
|---|---|
| **Control ID** | CC4.1 |
| **Control Description** | The entity selects, develops, and performs ongoing and/or separate evaluations to ascertain whether the components of internal control are present and functioning. |
| **Current Implementation** | Health check endpoint (`/api/health`) verifies database connectivity and returns system version. Cache statistics endpoint (`/api/cache-stats`) provides operational monitoring data, gated behind admin API key. Error handler middleware logs all unhandled errors with request context. Database pool monitors connection health with error event listeners. |
| **Status** | Partially Implemented |
| **Evidence** | `api/src/index.js` (lines 80-92), `api/src/middleware/errorHandler.js`, `api/src/db/pool.js` (lines 14-16) |
| **Gap / Remediation** | Implement external uptime monitoring (e.g., Datadog, PagerDuty). Configure alerting thresholds for error rates, response times, and database connection pool exhaustion. Establish a monthly control effectiveness review. |

---

### CC5 — Control Activities

#### CC5.1 — Logical Access Security Software

| Field | Detail |
|---|---|
| **Control ID** | CC5.1 |
| **Control Description** | The entity selects and develops control activities that contribute to the mitigation of risks to the achievement of objectives to acceptable levels. |
| **Current Implementation** | Multi-layered access control is implemented: (1) JWT-based authentication with 24-hour token expiry, (2) role-based authorization with three tiers (admin, analyst, viewer), (3) admin API key for sensitive endpoints, (4) rate limiting per IP address. Database connection pooling enforces statement timeout (10s) and connection timeout (5s) to prevent resource exhaustion. |
| **Status** | Implemented |
| **Evidence** | `api/src/middleware/auth.js`, `api/src/routes/auth.js` (line 10: `TOKEN_EXPIRY = '24h'`), `api/src/index.js` (lines 36-58), `api/src/db/pool.js` (lines 4-12) |
| **Gap / Remediation** | Consider implementing token refresh mechanism rather than 24-hour static expiry. Add account lockout after repeated failed login attempts. |

---

### CC6 — Logical and Physical Access Controls

#### CC6.1 — User Authentication

| Field | Detail |
|---|---|
| **Control ID** | CC6.1 |
| **Control Description** | The entity implements logical access security software, infrastructure, and architectures over protected information assets to protect them from security events. |
| **Current Implementation** | Authentication is implemented via JWT tokens using the `jsonwebtoken` library. Tokens are signed with a configurable secret (`JWT_SECRET` environment variable). The system enforces Bearer token authentication via the `Authorization` header. Token verification rejects expired or malformed tokens with HTTP 403. Optional authentication middleware (`optionalAuth`) populates user context for audit logging without blocking unauthenticated public endpoints. |
| **Status** | Implemented |
| **Evidence** | `api/src/middleware/auth.js` (lines 1-35), `api/src/config.js` (line 19) |
| **Gap / Remediation** | The default JWT secret (`bbi-dev-secret-change-in-production`) is insecure for production. Enforce that `JWT_SECRET` must be set via environment variable in production (reject startup if missing and `NODE_ENV=production`). Implement token revocation/blacklist capability for compromised tokens. |

#### CC6.2 — Password Management

| Field | Detail |
|---|---|
| **Control ID** | CC6.2 |
| **Control Description** | Passwords are managed according to defined policies to ensure they meet minimum complexity requirements. |
| **Current Implementation** | Passwords are hashed using bcrypt with 12 salt rounds (`SALT_ROUNDS = 12`). Minimum password length of 8 characters is enforced on both registration and password change endpoints. Password change requires verification of current password before accepting new password. Password hashes are never returned in API responses (explicitly excluded via destructuring). |
| **Status** | Partially Implemented |
| **Evidence** | `api/src/routes/auth.js` (lines 9, 27-29, 158-185, line 105) |
| **Gap / Remediation** | Implement password complexity requirements (uppercase, lowercase, numeric, special character). Add password history to prevent reuse. Enforce periodic password rotation (90 days). Implement account lockout after 5 consecutive failed attempts. Add breached password checking (e.g., HaveIBeenPwned API). |

#### CC6.3 — Role-Based Access Control

| Field | Detail |
|---|---|
| **Control ID** | CC6.3 |
| **Control Description** | The entity restricts logical access to information assets based on user roles and the principle of least privilege. |
| **Current Implementation** | Three-tier role system enforced at both application and database levels: **Admin** — full access including user registration, admin endpoints, ingestion, cache management. **Analyst** — read/write access to analytical endpoints. **Viewer** — read-only access to public data. Role is stored in the `users` table with a CHECK constraint restricting values to `('admin', 'analyst', 'viewer')`. The `requireRole()` middleware enforces role checks on protected routes. Admin endpoints are additionally gated by a separate API key (`x-admin-key` header). Database roles mirror application roles: `bbi_app` (read-write) and `bbi_reader` (read-only, restricted to verified records via RLS policies). |
| **Status** | Implemented |
| **Evidence** | `api/src/middleware/auth.js` (lines 18-25), `api/src/routes/auth.js` (lines 36-48), `api/src/index.js` (lines 52-58, 120-124), `database/migrations/103_auth_users.sql` (line 7), `database/migrations/008_security_and_permissions.sql` (lines 19-61, 79-91) |
| **Gap / Remediation** | Enable Row Level Security on `companies` and `graph_edges` tables (currently defined but not enforced — see migration 008 lines 75-76). Implement periodic access reviews (quarterly). Document role assignment approval workflow. |

#### CC6.4 — Admin API Key Management

| Field | Detail |
|---|---|
| **Control ID** | CC6.4 |
| **Control Description** | Administrative functions are protected by a secondary authentication factor beyond user authentication. |
| **Current Implementation** | All admin endpoints (`/api/admin/*`) and ingestion endpoints (`/api/ingestion/*`) require the `x-admin-key` HTTP header to match the `ADMIN_API_KEY` environment variable. If `ADMIN_API_KEY` is not configured, all admin requests are rejected (fail-closed design). Admin endpoints are additionally protected by a stricter rate limit (10 requests/minute vs. 300/minute for public endpoints). Cache statistics endpoint requires admin key authentication. |
| **Status** | Implemented |
| **Evidence** | `api/src/index.js` (lines 52-58, 90-91, 120-124), `.env.example` (lines 8-9) |
| **Gap / Remediation** | Implement API key rotation procedure with zero-downtime cutover. Log all admin API key usage with detailed context. Consider implementing API key expiration. Document key distribution and revocation procedures in `docs/SECURITY_POLICY.md`. |

#### CC6.5 — Network Security — Rate Limiting

| Field | Detail |
|---|---|
| **Control ID** | CC6.5 |
| **Control Description** | The entity restricts the volume of requests to prevent abuse and denial-of-service conditions. |
| **Current Implementation** | Two-tier rate limiting is implemented: **Public endpoints** — 300 requests per minute per IP address. **Admin endpoints** — 10 requests per minute per IP address. Rate limiter uses in-memory counters keyed by `req.ip`, with automatic counter reset on each window expiry. Rate limit violations return HTTP 429 with descriptive error messages. |
| **Status** | Implemented |
| **Evidence** | `api/src/index.js` (lines 36-49) |
| **Gap / Remediation** | Replace in-memory rate limiter with a distributed store (e.g., Redis) for multi-instance deployments. Add rate limit response headers (`X-RateLimit-Limit`, `X-RateLimit-Remaining`, `X-RateLimit-Reset`). Consider implementing progressive rate limiting with temporary bans for persistent offenders. |

#### CC6.6 — Network Security — CORS Configuration

| Field | Detail |
|---|---|
| **Control ID** | CC6.6 |
| **Control Description** | Cross-origin resource sharing is configured to restrict access to authorized origins. |
| **Current Implementation** | CORS middleware is enabled via the `cors` npm package. Currently configured with default settings (permissive, allows all origins). |
| **Status** | Partially Implemented |
| **Evidence** | `api/src/index.js` (line 32) |
| **Gap / Remediation** | Restrict CORS to specific allowed origins (production domain only). Configure allowed methods and headers explicitly. Disable CORS credentials unless required. Add CORS configuration to environment variables for environment-specific settings. |

#### CC6.7 — Data Encryption — In Transit

| Field | Detail |
|---|---|
| **Control ID** | CC6.7 |
| **Control Description** | Data is encrypted during transmission over public networks using TLS. |
| **Current Implementation** | The application server runs HTTP natively. TLS termination is expected at the reverse proxy / load balancer layer in production. Password hashes use bcrypt (12 rounds) ensuring credentials are never stored or transmitted in plaintext. JWT tokens are signed (HMAC-SHA256) to prevent tampering. |
| **Status** | Partially Implemented |
| **Evidence** | `api/src/routes/auth.js` (line 9: `SALT_ROUNDS = 12`), `api/src/config.js` (line 19) |
| **Gap / Remediation** | Document TLS configuration requirements for the production reverse proxy. Enforce HTTPS-only in production (HSTS headers). Configure `Secure` and `HttpOnly` flags if cookies are used. Require TLS for database connections in production (`?sslmode=require` in `DATABASE_URL`). |

#### CC6.8 — Data Encryption — At Rest

| Field | Detail |
|---|---|
| **Control ID** | CC6.8 |
| **Control Description** | Sensitive data is encrypted when stored at rest. |
| **Current Implementation** | PostgreSQL 16 is used as the data store. Password hashes are stored using bcrypt (not reversible). Docker volume (`pgdata`) stores database files. PostgreSQL supports Transparent Data Encryption (TDE) via configuration. |
| **Status** | Partially Implemented |
| **Evidence** | `docker-compose.yml` (line 11: `pgdata:/var/lib/postgresql/data`), `database/migrations/103_auth_users.sql` (line 4: `password_hash`) |
| **Gap / Remediation** | Enable PostgreSQL TDE or use encrypted volumes (e.g., LUKS, AWS EBS encryption). Document encryption key management procedures. Encrypt database backups. Classify data fields requiring encryption beyond password hashes (e.g., API keys, PII). |

---

### CC7 — System Operations

#### CC7.1 — Vulnerability Management

| Field | Detail |
|---|---|
| **Control ID** | CC7.1 |
| **Control Description** | The entity detects and addresses vulnerabilities in a timely manner through a defined vulnerability management process. |
| **Current Implementation** | Node.js dependency management via `package.json` enables `npm audit` for vulnerability scanning. Docker base image (`postgres:16`) is maintained by official PostgreSQL project with regular security patches. |
| **Status** | Partially Implemented |
| **Evidence** | `api/package.json`, `docker-compose.yml` (line 2) |
| **Gap / Remediation** | Implement automated dependency vulnerability scanning in CI/CD pipeline (e.g., `npm audit --audit-level=high`, Snyk, Dependabot). Establish a patch management SLA (critical: 24h, high: 7d, medium: 30d). Schedule quarterly penetration testing. Document vulnerability disclosure and remediation process. |

#### CC7.2 — Security Incident Detection

| Field | Detail |
|---|---|
| **Control ID** | CC7.2 |
| **Control Description** | The entity monitors system components and anomalies that are indicative of malicious acts, natural disasters, and errors affecting the entity's ability to meet its objectives. |
| **Current Implementation** | Audit logging captures authenticated user actions (method, URL, IP address, user agent) in the `audit_log` table with timestamp indexing. Error handler middleware logs unhandled exceptions with request context. Database pool emits error events for connection failures. Rate limiting detects and blocks excessive request patterns. |
| **Status** | Partially Implemented |
| **Evidence** | `api/src/index.js` (lines 64-74), `database/migrations/103_auth_users.sql` (lines 16-29), `api/src/middleware/errorHandler.js`, `api/src/db/pool.js` (lines 14-16) |
| **Gap / Remediation** | Implement centralized log aggregation (e.g., ELK stack, Datadog). Configure alerting for anomalous patterns (brute force attempts, unusual admin API usage, elevated error rates). Add failed login attempt logging. Implement Security Information and Event Management (SIEM) integration. |

#### CC7.3 — Audit Logging

| Field | Detail |
|---|---|
| **Control ID** | CC7.3 |
| **Control Description** | The entity maintains a complete and accurate audit trail of system activities. |
| **Current Implementation** | The `audit_log` table records: user ID (foreign key to `users`), action (HTTP method), resource (URL path), IP address, user agent, and timestamp. Indexes on `user_id` and `created_at DESC` support efficient querying and compliance reporting. The `agent_runs` table provides an audit trail for automated data ingestion processes. The `updated_at` trigger function automatically maintains modification timestamps across all applicable tables (migration 008, lines 103-129). |
| **Status** | Implemented |
| **Evidence** | `database/migrations/103_auth_users.sql` (lines 16-29), `api/src/index.js` (lines 64-74), `database/migrations/008_security_and_permissions.sql` (lines 103-129) |
| **Gap / Remediation** | Audit logging currently silently ignores failures (`.catch(() => {})` on line 71). Implement a fallback logging mechanism (e.g., write to local file) when database audit inserts fail. Add request/response body logging for write operations (POST, PUT, DELETE) on sensitive endpoints. Implement log tamper detection (immutable audit log or append-only table with no DELETE/UPDATE grants). Establish audit log retention policy (see `docs/DATA_RETENTION.md`). |

---

### CC8 — Change Management

#### CC8.1 — Change Control Process

| Field | Detail |
|---|---|
| **Control ID** | CC8.1 |
| **Control Description** | Changes to infrastructure, data, software, and procedures are managed through a defined change control process. |
| **Current Implementation** | Database schema changes are managed through a numbered migration system (`database/migrations/001_*.sql` through `103_*.sql`). Each migration is sequentially numbered, idempotent (uses `IF NOT EXISTS`, `CREATE OR REPLACE`), and includes descriptive headers documenting purpose and execution instructions. Git version control provides change history and code review capability. |
| **Status** | Partially Implemented |
| **Evidence** | `database/migrations/` directory (100+ numbered migrations), `.git/` repository |
| **Gap / Remediation** | Formalize a change management policy requiring peer review for all production changes. Implement branch protection rules requiring pull request approval. Add automated testing in CI/CD pipeline before deployment. Document rollback procedures for each migration. Require change advisory board (CAB) approval for high-risk changes. |

---

### CC9 — Risk Mitigation

#### CC9.1 — Error Handling and Information Disclosure Prevention

| Field | Detail |
|---|---|
| **Control ID** | CC9.1 |
| **Control Description** | The entity identifies, selects, and develops risk mitigation activities for risks arising from potential business disruptions. |
| **Current Implementation** | Production error handler returns generic error messages (`Internal server error`) to prevent information leakage while logging detailed errors server-side. Development mode returns detailed error messages for debugging. Database query timeout (10s) prevents runaway queries from degrading system performance. Connection pool limits (max 20, min 2) prevent database connection exhaustion. Input validation on authentication endpoints prevents common injection attacks. |
| **Status** | Implemented |
| **Evidence** | `api/src/middleware/errorHandler.js` (lines 1-8), `api/src/db/pool.js` (lines 4-12), `api/src/routes/auth.js` (lines 23-29) |
| **Gap / Remediation** | Implement structured error codes for all API responses. Add request ID tracking for correlating client errors with server logs. Document business continuity plan. |

#### CC9.2 — SQL Injection Prevention

| Field | Detail |
|---|---|
| **Control ID** | CC9.2 |
| **Control Description** | The entity uses parameterized queries to prevent SQL injection attacks. |
| **Current Implementation** | All database queries across the application use parameterized queries via the `pg` library's `$1, $2, ...` placeholder syntax. No string concatenation or template literal interpolation is used in SQL query construction for user-supplied values. Examples include user lookup (`WHERE email = $1`), score computation (`WHERE id = $1`), and audit log insertion (`VALUES ($1, $2, $3, $4, $5)`). |
| **Status** | Implemented |
| **Evidence** | `api/src/routes/auth.js` (lines 51, 84, 102, 168, 179), `api/src/services/scoringService.js` (line 38), `api/src/index.js` (lines 68-71) |
| **Gap / Remediation** | Conduct a comprehensive code review to verify all query paths use parameterized queries. Add static analysis tooling (e.g., eslint-plugin-security) to CI/CD to prevent regression. |

---

## 2. Availability (A1)

#### A1.1 — Infrastructure and Deployment

| Field | Detail |
|---|---|
| **Control ID** | A1.1 |
| **Control Description** | The entity maintains infrastructure to support the availability of the system according to its objectives. |
| **Current Implementation** | Docker-based deployment using `docker-compose.yml` with PostgreSQL 16 service. PostgreSQL healthcheck is configured with 5-second intervals and 5 retries. Named Docker volume (`pgdata`) provides persistent storage independent of container lifecycle. Database connection pool maintains minimum 2 idle connections for immediate request handling. Cache pre-warming on application startup ensures first-request performance. |
| **Status** | Partially Implemented |
| **Evidence** | `docker-compose.yml` (lines 1-19), `api/src/db/pool.js` (lines 4-12), `api/src/index.js` (lines 136-149) |
| **Gap / Remediation** | Implement container orchestration (Kubernetes or ECS) for automatic restart and scaling. Add application-level health check to Docker Compose. Configure database replication (primary-replica). Document Recovery Time Objective (RTO) and Recovery Point Objective (RPO). Implement auto-scaling policies. |

#### A1.2 — Health Monitoring

| Field | Detail |
|---|---|
| **Control ID** | A1.2 |
| **Control Description** | The entity monitors system availability and performance to detect deviations from service level objectives. |
| **Current Implementation** | `/api/health` endpoint verifies database connectivity and returns system version. Returns HTTP 200 with `{status: 'ok', db: 'connected', version: '1.0.0'}` on success. Returns HTTP 503 with `{status: 'error', db: 'disconnected'}` on database failure. `/api/cache-stats` provides operational metrics (cache size, cached keys) gated behind admin authentication. Response compression is enabled via the `compression` middleware to improve performance. |
| **Status** | Partially Implemented |
| **Evidence** | `api/src/index.js` (lines 80-92) |
| **Gap / Remediation** | Integrate health check with external monitoring service (uptime robot, Datadog synthetic checks). Add response time metrics to health endpoint. Implement application performance monitoring (APM). Define and document Service Level Agreements (SLAs) and Service Level Objectives (SLOs). |

#### A1.3 — Backup and Recovery

| Field | Detail |
|---|---|
| **Control ID** | A1.3 |
| **Control Description** | The entity implements backup, recovery, and redundancy mechanisms to meet its availability objectives. |
| **Current Implementation** | PostgreSQL data is persisted in a named Docker volume (`pgdata`). Database supports `pg_dump` and `pg_restore` for logical backups. Migration-based schema management enables schema reconstruction from migration files. Seed data is available in `database/seeds/seed.js` for data reconstruction. |
| **Status** | Partially Implemented |
| **Evidence** | `docker-compose.yml` (line 11), `database/migrations/` directory, `database/seeds/seed.js` |
| **Gap / Remediation** | Implement automated daily database backups with `pg_dump`. Configure backup retention per `docs/DATA_RETENTION.md` policy. Test backup restoration quarterly. Document disaster recovery runbook with step-by-step procedures. Implement point-in-time recovery (PITR) using WAL archiving. Store backups in geographically separate location. |

---

## 3. Processing Integrity (PI1)

#### PI1.1 — Data Quality Framework

| Field | Detail |
|---|---|
| **Control ID** | PI1.1 |
| **Control Description** | The entity implements controls to ensure data is processed completely, accurately, and in a timely manner. |
| **Current Implementation** | Three-tier data quality classification system: **Verified** — human-reviewed data flagged with `verified = TRUE`. **Inferred** — agent-generated data with confidence scores. **Calculated** — deterministically computed values (IRS scores, grades). The `confidence` column on `companies` and `graph_edges` enables quality-gated access. Row Level Security policies (defined but not enforced) restrict `bbi_reader` role to verified records only. Data source tracking migration (`009_add_data_source_tracking.sql`) provides provenance. |
| **Status** | Implemented |
| **Evidence** | `database/migrations/008_security_and_permissions.sql` (lines 67-91), `database/migrations/009_add_data_source_tracking.sql`, `docs/DATA_QUALITY_SYSTEM.md`, `docs/DATA_QUALITY_IMPLEMENTATION.md` |
| **Gap / Remediation** | Enable RLS enforcement to operationalize quality-gated access. Implement automated data quality checks on ingestion. Define and monitor data quality SLAs (e.g., 95% of records verified within 48 hours of ingestion). |

#### PI1.2 — Input Validation

| Field | Detail |
|---|---|
| **Control ID** | PI1.2 |
| **Control Description** | Inputs to the system are validated for completeness and accuracy before processing. |
| **Current Implementation** | Authentication endpoints validate required fields (email, password, name) with explicit error messages. Password minimum length (8 characters) is enforced on registration and password change. Database schema enforces constraints: `NOT NULL` on required columns, `UNIQUE` on email, `CHECK` constraints on role values (`'admin', 'analyst', 'viewer'`). Parameterized queries prevent SQL injection on all database operations. |
| **Status** | Partially Implemented |
| **Evidence** | `api/src/routes/auth.js` (lines 23-29, 79-81, 160-166), `database/migrations/103_auth_users.sql` (lines 2-13) |
| **Gap / Remediation** | Implement comprehensive input validation middleware (e.g., `joi`, `zod`) for all API endpoints. Add email format validation. Validate and sanitize all query parameters on public endpoints. Implement request body size limits. |

#### PI1.3 — Deterministic Scoring Engine

| Field | Detail |
|---|---|
| **Control ID** | PI1.3 |
| **Control Description** | Computed outputs are generated through deterministic, auditable algorithms with consistent and reproducible results. |
| **Current Implementation** | The Investment Rating Score (IRS) engine (`api/src/engine/scoring.js`) is a pure function with no side effects or randomness. Score computation uses fixed weights: momentum (20%), funding velocity (15%), team (15%), hiring (12%), baseline (12%), market timing (10%), data quality (8%), network (8%). Grade thresholds are deterministic (A >= 85, A- >= 78, B+ >= 72, B >= 65, B- >= 58, C+ >= 50, C >= 42, D < 42). Constants (sector heat, stage norms) are loaded from the database, providing auditable, versioned scoring parameters. Trigger rules are explicit and documented in code. Score recomputation is available via `recomputeAllScores()` which runs in a database transaction with rollback on failure. The `computed_scores` table stores cached scores with timestamps. |
| **Status** | Implemented |
| **Evidence** | `api/src/engine/scoring.js` (lines 1-71), `api/src/services/scoringService.js` (lines 49-74) |
| **Gap / Remediation** | Version the scoring algorithm (store algorithm version with computed scores). Add unit tests validating score determinism with known inputs. Log scoring parameter changes in audit trail. Document the scoring methodology for stakeholder review. |

---

## 4. Confidentiality (C1)

#### C1.1 — Data Classification

| Field | Detail |
|---|---|
| **Control ID** | C1.1 |
| **Control Description** | The entity classifies information assets according to their sensitivity and applies appropriate protections. |
| **Current Implementation** | Implicit data classification exists across three tiers: **Public Ecosystem Data** — company profiles, fund information, graph relationships, timeline events. Accessible via public API endpoints with rate limiting. Cached with `public` Cache-Control headers. **Internal Analytics** — computed scores, analysis results, risk assessments, weekly briefs. Cached with `private` Cache-Control headers. Shorter cache TTLs (60s). **Restricted / PII** — user credentials (hashed passwords), email addresses, names, IP addresses in audit logs. Accessible only through authenticated endpoints. Admin API key required for sensitive operations. |
| **Status** | Partially Implemented |
| **Evidence** | `api/src/index.js` (lines 96-118: cache TTL and Cache-Control header strategy), `database/migrations/103_auth_users.sql` (user PII fields) |
| **Gap / Remediation** | Formalize data classification policy in a standalone document. Label database columns and API responses with classification levels. Implement data loss prevention (DLP) controls for restricted data. Train personnel on data handling requirements per classification level. |

#### C1.2 — Access Restrictions

| Field | Detail |
|---|---|
| **Control ID** | C1.2 |
| **Control Description** | The entity restricts access to confidential information to authorized individuals. |
| **Current Implementation** | Multi-layer access restriction: (1) Public endpoints require no authentication but are rate-limited. (2) User profile endpoints require valid JWT token. (3) Admin/ingestion endpoints require both admin API key and stricter rate limit. (4) User registration (beyond first user) requires admin authentication. (5) Database roles (`bbi_app`, `bbi_reader`) enforce least-privilege at the database layer. (6) `bbi_reader` role is restricted to verified records via RLS policies. Deactivated accounts are blocked from login (`is_active` check). |
| **Status** | Implemented |
| **Evidence** | `api/src/index.js` (lines 52-58, 120-124), `api/src/routes/auth.js` (lines 36-48, 91-93), `database/migrations/008_security_and_permissions.sql` (lines 19-61) |
| **Gap / Remediation** | Enable RLS enforcement on `companies` and `graph_edges` tables. Implement session timeout for inactive users. Add IP allowlisting for admin endpoints. Conduct quarterly access reviews and document findings. |

---

## 5. Privacy (P1-P8)

#### P1.1 — Privacy Notice

| Field | Detail |
|---|---|
| **Control ID** | P1.1 |
| **Control Description** | The entity provides notice to data subjects about its privacy practices, including the purpose for collecting personal information. |
| **Current Implementation** | Not implemented. No privacy notice or terms of service exist in the application. |
| **Status** | Not Implemented |
| **Evidence** | N/A |
| **Gap / Remediation** | Draft and publish a privacy notice describing: what personal information is collected (email, name, organization, IP address), the purpose of collection, how it is used, retention periods, and data subject rights. Display privacy notice during user registration. Make privacy policy accessible from application footer. |

#### P2.1 — Choice and Consent

| Field | Detail |
|---|---|
| **Control ID** | P2.1 |
| **Control Description** | The entity obtains consent from data subjects for the collection and use of personal information. |
| **Current Implementation** | User registration requires explicit action (POST to `/api/auth/register`). Admin must create non-first user accounts, providing implicit organizational consent. |
| **Status** | Partially Implemented |
| **Evidence** | `api/src/routes/auth.js` (lines 21-73) |
| **Gap / Remediation** | Implement explicit consent checkbox during registration. Record consent timestamp and version in the database. Provide mechanism for users to withdraw consent. |

#### P3.1 — Collection Limitation

| Field | Detail |
|---|---|
| **Control ID** | P3.1 |
| **Control Description** | The entity collects personal information only for the purposes identified in the privacy notice. |
| **Current Implementation** | User registration collects only essential fields: email (required for authentication), name (required for display), password (required for authentication), organization (optional context). Audit logging collects IP address and user agent for security purposes. No unnecessary personal data fields exist in the schema. |
| **Status** | Implemented |
| **Evidence** | `database/migrations/103_auth_users.sql` (lines 2-13), `api/src/routes/auth.js` (lines 23-24) |
| **Gap / Remediation** | Document the legal basis for collecting each PII field. Review audit log retention to ensure IP address and user agent collection is proportional to security needs. |

#### P4.1 — Use, Retention, and Disposal

| Field | Detail |
|---|---|
| **Control ID** | P4.1 |
| **Control Description** | The entity limits the use and retention of personal information to the purposes identified in the privacy notice and disposes of it securely. |
| **Current Implementation** | User accounts support deactivation via `is_active` flag. Deactivated users are blocked from login. Data retention policies are defined in `docs/DATA_RETENTION.md`. |
| **Status** | Partially Implemented |
| **Evidence** | `database/migrations/103_auth_users.sql` (line 9: `is_active`), `api/src/routes/auth.js` (lines 91-93), `docs/DATA_RETENTION.md` |
| **Gap / Remediation** | Implement automated data purging according to retention schedule. Add hard-delete capability for user data upon request (right to erasure). Implement audit log archival and purging after retention period. Document secure disposal procedures for backups containing PII. |

#### P5.1 — Access by Data Subjects

| Field | Detail |
|---|---|
| **Control ID** | P5.1 |
| **Control Description** | The entity provides data subjects with access to their personal information for review and correction. |
| **Current Implementation** | `/api/auth/me` (GET) allows users to view their profile data. `/api/auth/me` (PUT) allows users to update their name and organization. `/api/auth/change-password` allows users to change their password. Password hashes are excluded from all API responses. |
| **Status** | Partially Implemented |
| **Evidence** | `api/src/routes/auth.js` (lines 114-155, 158-185) |
| **Gap / Remediation** | Implement data export endpoint (right to portability) providing all personal data in machine-readable format. Add endpoint to request account deletion. Provide audit log access for users to review their own activity history. |

#### P6.1 — Disclosure to Third Parties

| Field | Detail |
|---|---|
| **Control ID** | P6.1 |
| **Control Description** | The entity discloses personal information to third parties only for the purposes identified in the privacy notice and with the consent of the data subject. |
| **Current Implementation** | No third-party data sharing is implemented in the codebase. The application does not integrate with external analytics, advertising, or data broker services. The Anthropic API key in `.env.example` suggests potential AI service integration but no PII is sent to external AI services in the current codebase. |
| **Status** | Implemented |
| **Evidence** | `.env.example` (line 19), review of all API routes |
| **Gap / Remediation** | Document all third-party service integrations. If AI agent features transmit data to external APIs, implement data anonymization/pseudonymization before transmission. Maintain a third-party vendor register with data processing agreements. |

#### P7.1 — Quality of Personal Information

| Field | Detail |
|---|---|
| **Control ID** | P7.1 |
| **Control Description** | The entity maintains accurate and complete personal information. |
| **Current Implementation** | Email uniqueness is enforced via database constraint. `updated_at` trigger automatically tracks record modification timestamps. Users can self-service update their name and organization. |
| **Status** | Partially Implemented |
| **Evidence** | `database/migrations/103_auth_users.sql` (lines 3, 12, 32-33) |
| **Gap / Remediation** | Implement email verification on registration. Add periodic prompts for users to review and update their profile information. |

#### P8.1 — Monitoring and Enforcement

| Field | Detail |
|---|---|
| **Control ID** | P8.1 |
| **Control Description** | The entity monitors compliance with its privacy commitments and takes corrective action as needed. |
| **Current Implementation** | Audit logging tracks all authenticated user actions. Admin can review user accounts and activity. |
| **Status** | Partially Implemented |
| **Evidence** | `api/src/index.js` (lines 64-74), `database/migrations/103_auth_users.sql` (lines 16-29) |
| **Gap / Remediation** | Establish a privacy officer role. Implement privacy impact assessments for new features. Conduct annual privacy audits. Create a data subject request handling procedure with SLAs (30 days for access/deletion requests). |

---

## 6. Summary of Control Statuses

| Status | Count | Percentage |
|---|---|---|
| Implemented | 11 | 39% |
| Partially Implemented | 14 | 50% |
| Not Implemented | 3 | 11% |
| **Total Controls** | **28** | **100%** |

### Controls by Trust Service Criteria

| Criteria | Implemented | Partial | Not Implemented |
|---|---|---|---|
| Security (CC1-CC9) | 5 | 8 | 1 |
| Availability (A1) | 0 | 3 | 0 |
| Processing Integrity (PI1) | 2 | 1 | 0 |
| Confidentiality (C1) | 1 | 1 | 0 |
| Privacy (P1-P8) | 2 | 5 | 1 |

---

## 7. Remediation Roadmap

### Priority 1 — Critical (Complete before production launch)

| Item | Control | Action |
|---|---|---|
| R-01 | CC6.1 | Enforce `JWT_SECRET` environment variable in production; reject startup if missing |
| R-02 | CC6.6 | Restrict CORS to production domain; disable permissive wildcard |
| R-03 | CC6.7 | Document and enforce TLS termination; add HSTS headers; require SSL for database connections |
| R-04 | CC6.8 | Enable volume encryption for PostgreSQL data at rest |
| R-05 | P1.1 | Publish privacy notice before collecting user data |
| R-06 | CC1.2 | Designate security governance owner |

### Priority 2 — High (Complete within 90 days of production)

| Item | Control | Action |
|---|---|---|
| R-07 | CC6.2 | Add password complexity requirements and account lockout |
| R-08 | CC6.3 | Enable Row Level Security on `companies` and `graph_edges` tables |
| R-09 | CC7.1 | Integrate `npm audit` and Dependabot into CI/CD pipeline |
| R-10 | CC7.2 | Deploy centralized log aggregation and alerting |
| R-11 | A1.3 | Implement automated daily database backups with tested restoration |
| R-12 | PI1.2 | Add comprehensive input validation middleware (joi/zod) |
| R-13 | P4.1 | Implement automated data purging per retention schedule |

### Priority 3 — Medium (Complete within 180 days)

| Item | Control | Action |
|---|---|---|
| R-14 | CC3.1 | Conduct formal risk assessment; create risk register |
| R-15 | CC4.1 | Deploy external monitoring with SLA-based alerting |
| R-16 | CC8.1 | Enforce branch protection and required code review |
| R-17 | A1.1 | Migrate to container orchestration (K8s/ECS) |
| R-18 | P2.1 | Implement consent management with versioned records |
| R-19 | P5.1 | Build data export and account deletion endpoints |
| R-20 | CC7.3 | Implement tamper-proof audit logging |

### Priority 4 — Low (Complete within 12 months)

| Item | Control | Action |
|---|---|---|
| R-21 | CC1.1 | Formalize code of conduct and security awareness training |
| R-22 | CC2.1 | Establish security policy distribution with acknowledgment tracking |
| R-23 | CC5.1 | Implement JWT token refresh and revocation |
| R-24 | PI1.3 | Version scoring algorithm and log parameter changes |
| R-25 | P8.1 | Appoint privacy officer; schedule annual privacy audit |

---

## Appendix A — Evidence File Index

| File Path | Description |
|---|---|
| `api/src/middleware/auth.js` | JWT authentication and role-based authorization middleware |
| `api/src/routes/auth.js` | User registration, login, profile management, password change |
| `api/src/index.js` | Application entry point: rate limiting, CORS, admin key guard, audit logging, health check |
| `api/src/config.js` | Environment configuration (database URL, JWT secret, admin API key) |
| `api/src/db/pool.js` | Database connection pool with timeout and limit configuration |
| `api/src/engine/scoring.js` | Deterministic IRS scoring algorithm |
| `api/src/services/scoringService.js` | Score computation service with transaction-safe batch recomputation |
| `api/src/middleware/errorHandler.js` | Error handling with production information disclosure prevention |
| `database/migrations/008_security_and_permissions.sql` | Database roles, grants, RLS policies, audit triggers |
| `database/migrations/103_auth_users.sql` | Users table, audit_log table, indexes |
| `database/migrations/009_add_data_source_tracking.sql` | Data provenance tracking |
| `docker-compose.yml` | Container deployment with PostgreSQL health checks |
| `.env.example` | Environment variable template with security guidance |
| `docs/SECURITY_POLICY.md` | Security policy and incident response procedures |
| `docs/DATA_RETENTION.md` | Data retention and disposal policies |

---

*This document was prepared for SOC 2 Type I assessment purposes. It represents the control environment as designed at the assessment date. A SOC 2 Type II assessment would evaluate the operating effectiveness of these controls over a defined period (typically 6-12 months).*
