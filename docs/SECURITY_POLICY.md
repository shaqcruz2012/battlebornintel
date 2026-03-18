# Security Policy

**System**: Battle Born Intelligence (BBI) Platform
**Version**: 1.0
**Effective Date**: March 18, 2026
**Review Date**: September 18, 2026 (6-month review cycle)
**Owner**: BBI Security Lead
**Classification**: Internal

---

## Table of Contents

1. [Purpose and Scope](#1-purpose-and-scope)
2. [Password Policy](#2-password-policy)
3. [Session Management](#3-session-management)
4. [API Key Management](#4-api-key-management)
5. [Access Control](#5-access-control)
6. [Network Security](#6-network-security)
7. [Data Protection](#7-data-protection)
8. [Incident Response Plan](#8-incident-response-plan)
9. [Data Breach Notification Procedure](#9-data-breach-notification-procedure)
10. [Access Review Schedule](#10-access-review-schedule)
11. [Vulnerability Management](#11-vulnerability-management)
12. [Acceptable Use](#12-acceptable-use)
13. [Policy Enforcement](#13-policy-enforcement)

---

## 1. Purpose and Scope

### 1.1 Purpose

This Security Policy establishes the security requirements, controls, and procedures for the Battle Born Intelligence (BBI) platform. It defines the standards that all personnel, contractors, and third-party service providers must follow when accessing or managing the BBI system and its data.

### 1.2 Scope

This policy applies to:

- All BBI application components (API server, frontend, database, infrastructure)
- All personnel with access to BBI systems, data, or infrastructure
- All environments (development, staging, production)
- All data processed, stored, or transmitted by the BBI platform

### 1.3 Definitions

| Term | Definition |
|---|---|
| **PII** | Personally Identifiable Information: data that can identify an individual (email, name, IP address) |
| **Admin** | User with the `admin` role, with full system access including user management |
| **Analyst** | User with the `analyst` role, with read-write access to analytical endpoints |
| **Viewer** | User with the `viewer` role, with read-only access to public data |
| **Admin API Key** | A shared secret (`ADMIN_API_KEY`) that gates access to administrative and ingestion endpoints |

---

## 2. Password Policy

### 2.1 Password Requirements

All user passwords must meet the following minimum requirements:

| Requirement | Current Enforcement | Target |
|---|---|---|
| Minimum length | 8 characters (enforced in `api/src/routes/auth.js`, lines 27-29, 163-165) | 12 characters |
| Uppercase letters | Not enforced | Minimum 1 |
| Lowercase letters | Not enforced | Minimum 1 |
| Numeric characters | Not enforced | Minimum 1 |
| Special characters | Not enforced | Minimum 1 |
| Password history | Not enforced | Prevent reuse of last 5 passwords |
| Dictionary words | Not enforced | Block common passwords (top 10,000 list) |

### 2.2 Password Storage

- Passwords are hashed using **bcrypt** with **12 salt rounds** before storage.
- Plaintext passwords are never stored, logged, or returned in API responses.
- The `password_hash` field is explicitly excluded from all API response payloads.

**Evidence**: `api/src/routes/auth.js` (line 9: `SALT_ROUNDS = 12`, line 105: destructuring exclusion)

### 2.3 Password Change

- Users may change their password via `POST /api/auth/change-password`.
- The current password must be verified before accepting the new password.
- The new password must meet minimum length requirements.
- Password changes are logged in the audit trail via the global audit middleware.

### 2.4 Password Reset

- Self-service password reset is not currently implemented.
- Password resets require admin intervention (account deactivation and re-registration).
- **Planned**: Implement email-based password reset with time-limited tokens (expires in 1 hour).

### 2.5 Account Lockout

- Account lockout after failed login attempts is not currently implemented.
- **Planned**: Lock accounts after 5 consecutive failed login attempts for 30 minutes. Notify admins of lockout events. Allow admin override to unlock accounts.

---

## 3. Session Management

### 3.1 JWT Token Configuration

| Parameter | Value | Evidence |
|---|---|---|
| Token type | JSON Web Token (JWT) | `api/src/middleware/auth.js` |
| Signing algorithm | HMAC-SHA256 (default `jsonwebtoken` behavior) | `jsonwebtoken` library |
| Token expiry | 24 hours | `api/src/routes/auth.js`, line 10: `TOKEN_EXPIRY = '24h'` |
| Token transport | `Authorization: Bearer <token>` header | `api/src/middleware/auth.js`, lines 5-6 |
| Token payload | `{ id, email, role, name }` | `api/src/routes/auth.js`, lines 13-16 |

### 3.2 Token Security Requirements

- The `JWT_SECRET` **must** be set to a cryptographically random value in production (minimum 256 bits / 32 bytes). Generate with: `openssl rand -hex 32`.
- The default development secret (`bbi-dev-secret-change-in-production`) **must never** be used in production.
- Tokens are validated on every authenticated request. Expired or malformed tokens are rejected with HTTP 403.
- Token contents (user ID, email, role, name) should be treated as claims, not authoritative data. The database is the source of truth for user status and permissions.

### 3.3 Session Termination

- Tokens expire automatically after 24 hours.
- There is no server-side session store; tokens are stateless.
- Account deactivation (`is_active = false`) blocks login but does not invalidate existing tokens.
- **Planned**: Implement token revocation list for immediate session termination when accounts are deactivated or compromised. Implement refresh token rotation with shorter access token lifetime (15 minutes) and longer refresh token lifetime (7 days).

### 3.4 Concurrent Sessions

- No limit on concurrent sessions per user.
- **Planned**: Implement maximum concurrent session limit (5 per user). Provide "active sessions" view and remote session termination in user profile.

---

## 4. API Key Management

### 4.1 Admin API Key

The `ADMIN_API_KEY` environment variable protects all administrative endpoints.

| Property | Detail |
|---|---|
| Transport | `x-admin-key` HTTP header |
| Scope | `/api/admin/*`, `/api/ingestion/*`, `/api/cache-stats` |
| Fail behavior | If `ADMIN_API_KEY` is unset, all admin requests are rejected (fail-closed) |
| Rate limit | 10 requests per minute (vs. 300/min for public endpoints) |

**Evidence**: `api/src/index.js` (lines 52-58, 90-91, 120-124)

### 4.2 Key Generation

Admin API keys must be generated using a cryptographically secure random number generator:

```bash
openssl rand -hex 32
```

Minimum key length: 256 bits (64 hex characters).

### 4.3 Key Rotation Procedure

API keys should be rotated on the following schedule and under the following conditions:

| Trigger | Action | Timeline |
|---|---|---|
| Scheduled rotation | Rotate key proactively | Every 90 days |
| Personnel change | Rotate key when anyone with key access leaves the organization | Within 24 hours |
| Suspected compromise | Rotate key immediately | Within 1 hour |
| Security incident | Rotate key as part of incident response | Per incident response plan |

#### Rotation Steps

1. **Generate** a new key: `openssl rand -hex 32`.
2. **Configure** the new key in the target environment's secret store or environment variables.
3. **Update** all authorized systems and scripts that use the key.
4. **Deploy** the configuration change to the application (restart required for environment variable changes).
5. **Verify** that authorized admin operations succeed with the new key.
6. **Revoke** the old key by confirming it is no longer present in any configuration.
7. **Log** the rotation event (date, reason, who performed it) in the key rotation register.

### 4.4 Key Storage

- API keys **must not** be committed to version control.
- API keys **must** be stored in environment variables or a secrets management service (e.g., AWS Secrets Manager, HashiCorp Vault).
- The `.env` file **must not** be deployed to production; use the platform's native secrets injection mechanism.
- The `.env.example` file contains placeholder values only and is safe for version control.

---

## 5. Access Control

### 5.1 Role Definitions

| Role | Application Access | Database Access | User Management |
|---|---|---|---|
| **Admin** | Full access to all endpoints; can register new users, manage ingestion, view cache stats | Maps to `bbi_app` database role (read-write) | Can create users with any role |
| **Analyst** | Read-write access to analytical endpoints; access to graph, timeline, analysis data | Maps to `bbi_app` database role (read-write) | Cannot manage users |
| **Viewer** | Read-only access to public data endpoints | Maps to `bbi_reader` database role (read-only, verified records only) | Cannot manage users |

**Evidence**: `database/migrations/103_auth_users.sql` (line 7: role CHECK constraint), `database/migrations/008_security_and_permissions.sql` (lines 19-61)

### 5.2 Principle of Least Privilege

- New users are assigned the `viewer` role by default.
- Role elevation requires admin action (only admins can register new users or modify roles).
- The first registered user is automatically assigned the `admin` role.
- Database roles are configured with minimum necessary permissions (migration 008).
- Public schema `CREATE` privilege is revoked from the `PUBLIC` role.

### 5.3 Account Lifecycle

| Stage | Procedure |
|---|---|
| **Provisioning** | Admin creates account via `POST /api/auth/register` with assigned role |
| **Modification** | Users self-service name/organization changes; admin required for role changes |
| **Deactivation** | Admin sets `is_active = false`; user is blocked from login |
| **Deletion** | Database-level deletion by admin; must comply with data retention policy |

### 5.4 Service Account Management

- The `bbi_app` database role is the application service account.
- The `bbi_reader` database role is the read-only service account for BI tools.
- Service account passwords **must** be rotated on the same schedule as API keys (90 days).
- Service accounts **must not** be used for interactive human access.

---

## 6. Network Security

### 6.1 Rate Limiting

| Tier | Limit | Scope | Evidence |
|---|---|---|---|
| Public | 300 requests / minute / IP | All `/api/*` endpoints except admin | `api/src/index.js`, line 48 |
| Admin | 10 requests / minute / IP | `/api/admin/*`, `/api/ingestion/*`, `/api/cache-stats` | `api/src/index.js`, line 49 |

Rate limit violations return HTTP 429 with a descriptive error message.

### 6.2 CORS Policy

- **Current state**: CORS is enabled with default settings (all origins allowed).
- **Production requirement**: CORS must be restricted to the production domain only.

```javascript
// Production CORS configuration (required)
app.use(cors({
  origin: process.env.ALLOWED_ORIGIN, // e.g., 'https://app.battlebornintel.com'
  methods: ['GET', 'POST', 'PUT', 'DELETE'],
  allowedHeaders: ['Content-Type', 'Authorization', 'x-admin-key'],
  credentials: true,
  maxAge: 86400
}));
```

### 6.3 TLS Requirements

- All production traffic **must** be encrypted with TLS 1.2 or higher.
- TLS termination is handled at the reverse proxy / load balancer layer.
- HSTS headers **must** be configured with a minimum max-age of 1 year.
- Database connections in production **must** use SSL (`?sslmode=require` in `DATABASE_URL`).
- Self-signed certificates are acceptable only in development and staging environments.

### 6.4 Database Network Security

- PostgreSQL port (5432) **must not** be exposed to the public internet.
- Database access should be restricted to the application server's IP address or VPC security group.
- The Docker Compose configuration maps PostgreSQL to port 5433 on the host; in production, this port should not be publicly accessible.

---

## 7. Data Protection

### 7.1 Encryption Standards

| Context | Method | Standard |
|---|---|---|
| Passwords at rest | bcrypt, 12 salt rounds | OWASP recommended |
| JWT token signing | HMAC-SHA256 | RFC 7519 |
| Data in transit | TLS 1.2+ (production) | NIST SP 800-52 |
| Data at rest | Volume encryption (production) | AES-256 |
| Database backups | Encrypted with GPG or platform-native encryption | AES-256 |

### 7.2 Sensitive Data Handling

The following data elements require elevated protection:

| Data Element | Location | Protection |
|---|---|---|
| Password hashes | `users.password_hash` | bcrypt; never returned in API responses |
| User email | `users.email` | Accessible only via authenticated endpoints |
| IP addresses | `audit_log.ip_address` | Retained per data retention policy; access restricted to admins |
| JWT secret | `JWT_SECRET` env var | Stored in secrets management; never committed to version control |
| Admin API key | `ADMIN_API_KEY` env var | Stored in secrets management; never committed to version control |
| Database password | `DATABASE_URL` env var | Stored in secrets management; never committed to version control |
| Anthropic API key | `ANTHROPIC_API_KEY` env var | Stored in secrets management; never committed to version control |

---

## 8. Incident Response Plan

### 8.1 Incident Severity Levels

| Severity | Definition | Examples | Response Time |
|---|---|---|---|
| **SEV-1 (Critical)** | Active exploitation or imminent threat of data breach | Confirmed unauthorized access to PII; database compromise; credential leak in public repository | Immediate (within 1 hour) |
| **SEV-2 (High)** | Significant security vulnerability or attempted exploitation | Brute force attack in progress; critical dependency vulnerability (CVSS 9+); unauthorized admin API usage | Within 4 hours |
| **SEV-3 (Medium)** | Security weakness identified; no active exploitation | Misconfigured CORS; missing security headers; medium-severity dependency vulnerability | Within 24 hours |
| **SEV-4 (Low)** | Minor security improvement needed | Informational vulnerability scan findings; policy documentation gap | Within 1 week |

### 8.2 Incident Response Team

| Role | Responsibility |
|---|---|
| **Incident Commander** | Overall coordination; communication with stakeholders; decision authority |
| **Security Lead** | Technical investigation; containment and eradication; forensic analysis |
| **Engineering Lead** | System remediation; patch deployment; configuration changes |
| **Communications Lead** | Internal/external communication; breach notification (if required) |

### 8.3 Incident Response Phases

#### Phase 1 — Detection and Identification

1. Monitor audit logs (`audit_log` table) for anomalous activity patterns.
2. Review application error logs for unusual error rates or types.
3. Check rate limiter logs for IP addresses exceeding thresholds.
4. Verify health check endpoint (`/api/health`) status.
5. Classify incident severity per Section 8.1.

#### Phase 2 — Containment

**Immediate containment actions by severity:**

| Action | SEV-1 | SEV-2 | SEV-3 | SEV-4 |
|---|---|---|---|---|
| Rotate compromised credentials | Yes | Yes | As needed | No |
| Block offending IP addresses | Yes | Yes | As needed | No |
| Disable compromised user accounts | Yes | As needed | No | No |
| Take system offline | If needed | No | No | No |
| Rotate Admin API key | If exposed | If exposed | No | No |
| Rotate JWT secret (invalidates all sessions) | If exposed | If exposed | No | No |

#### Phase 3 — Eradication

1. Identify root cause through log analysis and code review.
2. Apply patches or configuration changes to eliminate the vulnerability.
3. Deploy changes through standard change management process (expedited for SEV-1/SEV-2).
4. Verify eradication through testing.

#### Phase 4 — Recovery

1. Restore normal operations.
2. Monitor for recurrence (increased monitoring for 72 hours post-incident).
3. Verify data integrity using database checksums and audit log review.
4. Re-enable any services or accounts that were disabled during containment.

#### Phase 5 — Post-Incident Review

1. Conduct post-mortem within 5 business days of incident closure.
2. Document timeline of events, root cause, impact, and lessons learned.
3. Identify control improvements and add to remediation roadmap.
4. Update this Security Policy if procedures need revision.
5. Retain incident report for a minimum of 3 years.

### 8.4 Incident Log Template

```
INCIDENT ID:       INC-YYYY-NNN
DATE DETECTED:     YYYY-MM-DD HH:MM UTC
DATE RESOLVED:     YYYY-MM-DD HH:MM UTC
SEVERITY:          SEV-1 / SEV-2 / SEV-3 / SEV-4
INCIDENT COMMANDER:
STATUS:            Open / Contained / Resolved / Closed

SUMMARY:
[Brief description of the incident]

TIMELINE:
- YYYY-MM-DD HH:MM — [Event]
- YYYY-MM-DD HH:MM — [Event]

ROOT CAUSE:
[Technical root cause analysis]

IMPACT:
- Systems affected:
- Data affected:
- Users affected:
- Duration of impact:

CONTAINMENT ACTIONS:
1. [Action taken]
2. [Action taken]

REMEDIATION:
1. [Fix applied]
2. [Fix applied]

LESSONS LEARNED:
1. [Lesson]
2. [Lesson]

FOLLOW-UP ACTIONS:
- [ ] [Action item — owner — due date]
- [ ] [Action item — owner — due date]
```

---

## 9. Data Breach Notification Procedure

### 9.1 Definition of a Data Breach

A data breach is any incident in which PII or confidential data is accessed, disclosed, or acquired by an unauthorized individual. This includes:

- Unauthorized access to the `users` table (emails, names, password hashes)
- Unauthorized access to `audit_log` records containing IP addresses
- Exfiltration of database backups containing PII
- Exposure of credentials (JWT secret, API keys, database passwords) in public repositories
- Unauthorized access to user sessions via stolen or forged JWT tokens

### 9.2 Notification Requirements

| Audience | Trigger | Timeline | Method |
|---|---|---|---|
| Internal stakeholders | Any confirmed breach | Within 4 hours of confirmation | Email / Slack to incident response team |
| Affected users | Breach involving their PII | Within 72 hours of confirmation | Email to registered address |
| Regulatory authorities | Breach affecting 500+ individuals (or as required by applicable law) | Within 72 hours of confirmation (GDPR) or per state law | Formal written notification |
| Law enforcement | Breach involving criminal activity | As determined by legal counsel | Per legal counsel guidance |

### 9.3 Breach Notification Template

```
Subject: Security Notice — Battle Born Intelligence Platform

Dear [Name],

We are writing to inform you of a security incident affecting the Battle Born
Intelligence platform that may involve your personal information.

WHAT HAPPENED:
On [date], we detected [brief description of the incident].

WHAT INFORMATION WAS INVOLVED:
The following types of personal information may have been affected:
- [List of affected data types: email address, name, etc.]

WHAT WE ARE DOING:
We have taken the following steps in response to this incident:
1. [Containment action]
2. [Remediation action]
3. [Monitoring enhancement]

WHAT YOU CAN DO:
We recommend the following steps:
1. Change your BBI platform password immediately.
2. If you used the same password on other services, change those as well.
3. Monitor your accounts for suspicious activity.

FOR MORE INFORMATION:
If you have questions or concerns, please contact us at:
[Contact email]
[Contact phone]

This notification is being provided in accordance with [applicable law/regulation].

Sincerely,
BBI Security Team
```

---

## 10. Access Review Schedule

### 10.1 Review Calendar

| Review Type | Frequency | Responsible Party | Scope |
|---|---|---|---|
| User account review | Quarterly | Security Lead | All active user accounts: verify role assignments, deactivate unused accounts, confirm organizational affiliation |
| Admin access review | Monthly | Security Lead + Engineering Lead | All admin-role users: verify continued need for admin access |
| API key audit | Quarterly | Engineering Lead | Verify admin API key is securely stored; confirm key rotation compliance |
| Database role review | Semi-annually | Engineering Lead | Verify `bbi_app` and `bbi_reader` grants match documented permissions |
| Third-party access review | Annually | Security Lead | Review all external service integrations and their access levels |
| Firewall / network rules | Quarterly | Infrastructure Lead | Verify database port restrictions and network segmentation |

### 10.2 Review Procedure

1. **Extract** current user list from the `users` table: `SELECT id, email, name, role, is_active, last_login, created_at FROM users ORDER BY role, last_login`.
2. **Identify** accounts that have not logged in within 90 days.
3. **Verify** each account's role is appropriate for the user's current job function.
4. **Deactivate** accounts for users who have left the organization or no longer require access.
5. **Document** review findings, actions taken, and any exceptions granted.
6. **Archive** review documentation for a minimum of 3 years.

### 10.3 Review Documentation Template

```
ACCESS REVIEW REPORT
Review Date:      YYYY-MM-DD
Reviewer:         [Name]
Review Period:    Q[N] YYYY

TOTAL ACCOUNTS:   [N]
ACTIVE ACCOUNTS:  [N]
INACTIVE ACCOUNTS:[N]

ACTIONS TAKEN:
- Deactivated [N] accounts: [list]
- Downgraded [N] accounts: [list]
- No action required: [N] accounts

EXCEPTIONS:
- [Account] — [Reason for exception] — [Approved by]

NEXT REVIEW DATE: YYYY-MM-DD
```

---

## 11. Vulnerability Management

### 11.1 Dependency Scanning

| Tool | Frequency | Scope | SLA |
|---|---|---|---|
| `npm audit` | Every build / weekly | Node.js dependencies | Critical: 24h, High: 7d, Medium: 30d |
| Dependabot / Snyk | Continuous | All dependencies | Automated PRs for critical/high findings |
| Docker image scan | Weekly | PostgreSQL base image | Critical: 48h, High: 14d |

### 11.2 Patch Management

| Severity | Response Time | Approval Required |
|---|---|---|
| Critical (CVSS 9.0-10.0) | Patch within 24 hours | Emergency change; post-deployment review |
| High (CVSS 7.0-8.9) | Patch within 7 days | Standard change process |
| Medium (CVSS 4.0-6.9) | Patch within 30 days | Standard change process |
| Low (CVSS 0.1-3.9) | Patch within 90 days | Batched with next release |

### 11.3 Security Testing

| Test Type | Frequency | Scope |
|---|---|---|
| Automated vulnerability scan | Weekly | Application endpoints and infrastructure |
| Manual code review | Per pull request | Security-sensitive code changes |
| Penetration test | Annually | Full application stack |
| Dependency audit | Per build + weekly | All npm packages |

---

## 12. Acceptable Use

### 12.1 General Principles

- System access is granted for authorized business purposes only.
- Users must not share credentials, JWT tokens, or API keys with unauthorized individuals.
- Users must not attempt to access data or endpoints beyond their authorized role.
- Users must report suspected security incidents immediately per Section 8.

### 12.2 Prohibited Activities

- Attempting to bypass authentication or authorization controls.
- Sharing or reusing the admin API key outside of authorized systems.
- Storing credentials in unencrypted files, code repositories, or communication channels.
- Using automated tools to scrape or exfiltrate data at volumes exceeding rate limits.
- Attempting to access other users' accounts or data.
- Disabling or circumventing audit logging.

---

## 13. Policy Enforcement

### 13.1 Compliance

All personnel with access to BBI systems must acknowledge this Security Policy upon onboarding and after each major revision. Acknowledgment records are retained for the duration of the individual's access plus 1 year.

### 13.2 Violations

Violations of this policy may result in:

- Immediate revocation of system access.
- Disciplinary action up to and including termination.
- Legal action if violations result in data breach or regulatory non-compliance.

### 13.3 Policy Review

This policy is reviewed and updated:

- Semi-annually (every 6 months) as a scheduled review.
- After any SEV-1 or SEV-2 security incident.
- When significant changes to the system architecture or regulatory landscape occur.

---

## Revision History

| Version | Date | Author | Changes |
|---|---|---|---|
| 1.0 | 2026-03-18 | BBI Security Team | Initial policy creation |

---

*This document is classified as Internal. Distribution is limited to BBI personnel and authorized auditors.*
