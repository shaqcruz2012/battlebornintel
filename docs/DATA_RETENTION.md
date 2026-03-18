# Data Retention Policy

**System**: Battle Born Intelligence (BBI) Platform
**Version**: 1.0
**Effective Date**: March 18, 2026
**Review Date**: September 18, 2026 (6-month review cycle)
**Owner**: BBI Security Lead
**Classification**: Internal

---

## Table of Contents

1. [Purpose](#1-purpose)
2. [Scope](#2-scope)
3. [Data Classification and Retention Periods](#3-data-classification-and-retention-periods)
4. [Detailed Retention Schedules](#4-detailed-retention-schedules)
5. [Disposal Procedures](#5-disposal-procedures)
6. [Legal Hold](#6-legal-hold)
7. [Backup Retention](#7-backup-retention)
8. [Responsibilities](#8-responsibilities)
9. [Exceptions](#9-exceptions)
10. [Compliance and Audit](#10-compliance-and-audit)

---

## 1. Purpose

This Data Retention Policy defines the retention periods for all data categories within the Battle Born Intelligence (BBI) platform. It ensures that data is retained for the minimum period necessary to meet operational, legal, and regulatory requirements, and is securely disposed of when no longer needed.

This policy supports compliance with:

- SOC 2 Trust Service Criteria (Security, Availability, Confidentiality, Privacy)
- Applicable state privacy laws
- Internal data governance standards

---

## 2. Scope

This policy covers all data stored, processed, or transmitted by the BBI platform, including:

- Application databases (PostgreSQL)
- Database backups
- Application logs and audit trails
- User account data
- Cached and derived data
- Infrastructure and operational data

---

## 3. Data Classification and Retention Periods

### Summary Table

| Data Category | Classification | Retention Period | Storage Location | Disposal Method |
|---|---|---|---|---|
| Audit logs | Restricted | 1 year minimum | `audit_log` table | Secure deletion (database) |
| User accounts (active) | Restricted | Retained while active | `users` table | N/A |
| User accounts (deactivated) | Restricted | 30 days after deactivation | `users` table | Secure deletion (database) |
| Graph data (entities, edges) | Public / Internal | Indefinite | `companies`, `funds`, `graph_edges`, etc. | N/A (public ecosystem data) |
| Analysis results | Internal | 90 days | `analysis_results` table | Secure deletion (database) |
| Computed scores | Internal | Until next recomputation | `computed_scores` table | Overwritten on recomputation |
| Timeline events | Public | Indefinite | `timeline_events` table | N/A (public ecosystem data) |
| Stakeholder activities | Public | Indefinite | `stakeholder_activities` table | N/A (public ecosystem data) |
| Agent run logs | Internal | 6 months | `agent_runs` table | Secure deletion (database) |
| Cache data | Transient | TTL-based (60s-600s) | In-memory | Automatic expiry |
| Database backups | Restricted | 90 days | Offsite storage | Secure deletion (encrypted) |
| Application error logs | Internal | 6 months | Server logs | Log rotation and deletion |
| Metric snapshots | Internal | 1 year | `metric_snapshots` table | Secure deletion (database) |
| Scenario results | Internal | 6 months | `scenario_results` table | Secure deletion (database) |

---

## 4. Detailed Retention Schedules

### 4.1 Audit Logs

**Table**: `audit_log`
**Retention**: 1 year minimum from creation date
**Legal basis**: SOC 2 compliance requirement; security incident investigation capability
**Fields retained**: user_id, action (HTTP method), resource (URL), IP address, user agent, timestamp

**Implementation**:
```sql
-- Monthly cleanup of audit logs older than 1 year
DELETE FROM audit_log WHERE created_at < NOW() - INTERVAL '1 year';
```

**Considerations**:
- Audit logs may be retained longer if subject to a legal hold (see Section 6).
- Audit logs containing evidence of security incidents should be preserved for the duration of any investigation plus 3 years.
- IP addresses in audit logs are considered PII and are subject to this retention schedule.

**Evidence**: `database/migrations/103_auth_users.sql` (lines 16-29)

### 4.2 User Accounts

**Table**: `users`
**Fields**: id, email, password_hash, name, role, organization, is_active, last_login, created_at, updated_at

#### Active Accounts

**Retention**: Retained for the duration of the user's active relationship with the organization.
**Review**: Accounts with no login activity for 90 days should be flagged for review per the Access Review Schedule in `docs/SECURITY_POLICY.md`.

#### Deactivated Accounts

**Retention**: 30 days after deactivation (`is_active` set to `false`).
**Process**:
1. Admin sets `is_active = false` on the user account.
2. User is immediately blocked from login.
3. After 30 days, the account record and all associated audit logs are eligible for deletion.
4. If the user requests reactivation within 30 days, the admin may set `is_active = true`.

**Implementation**:
```sql
-- Monthly cleanup of deactivated accounts older than 30 days
DELETE FROM audit_log WHERE user_id IN (
  SELECT id FROM users WHERE is_active = false AND updated_at < NOW() - INTERVAL '30 days'
);
DELETE FROM users WHERE is_active = false AND updated_at < NOW() - INTERVAL '30 days';
```

#### Right to Erasure

Upon receiving a valid data subject access request (DSAR) for account deletion:
1. Verify the identity of the requester.
2. Delete the user record and all associated PII within 30 days.
3. Anonymize (rather than delete) audit log entries to preserve security trail integrity: replace `user_id` with NULL, retain action/resource/timestamp.
4. Confirm deletion to the data subject in writing.

**Evidence**: `database/migrations/103_auth_users.sql` (lines 2-13), `api/src/routes/auth.js` (lines 91-93)

### 4.3 Graph Data (Ecosystem Entities)

**Tables**: `companies`, `funds`, `graph_edges`, `people`, `externals`, `accelerators`, `ecosystem_orgs`, `graph_funds`, `listings`, `constants`
**Retention**: Indefinite
**Justification**: This data represents the public venture ecosystem in Nevada. It is sourced from public records, press releases, government filings, and other publicly available information. There is no PII in these tables, and the data retains ongoing analytical value.

**Exceptions**:
- Records flagged with `verified = false` and `confidence < 0.3` that are older than 1 year should be reviewed for deletion or archival.
- The `agent_runs` table tracking data ingestion provenance follows the 6-month schedule below.

### 4.4 Analysis Results

**Table**: `analysis_results`
**Retention**: 90 days from creation
**Justification**: Analysis results are point-in-time assessments that lose relevance as underlying data changes. Retaining 90 days provides sufficient history for trend analysis and auditing.

**Implementation**:
```sql
-- Weekly cleanup of analysis results older than 90 days
DELETE FROM analysis_results WHERE created_at < NOW() - INTERVAL '90 days';
```

### 4.5 Computed Scores

**Table**: `computed_scores`
**Retention**: Until next recomputation cycle
**Justification**: Computed scores are fully reproducible from source data and the deterministic scoring algorithm (`api/src/engine/scoring.js`). The `recomputeAllScores()` function in `api/src/services/scoringService.js` deletes and recreates all scores in a single transaction.

**Note**: For audit purposes, consider retaining a history of score changes by implementing a `computed_scores_history` table before overwriting (not yet implemented).

**Evidence**: `api/src/services/scoringService.js` (lines 49-74)

### 4.6 Agent Run Logs

**Table**: `agent_runs`
**Retention**: 6 months from creation
**Justification**: Agent run logs provide data provenance for automated ingestion. Six months provides sufficient history for debugging data quality issues and auditing agent behavior.

**Implementation**:
```sql
-- Monthly cleanup of agent run logs older than 6 months
DELETE FROM agent_runs WHERE created_at < NOW() - INTERVAL '6 months';
```

### 4.7 Cache Data

**Location**: In-memory (Node.js process)
**Retention**: TTL-based automatic expiry

| Cache Category | TTL | Cache-Control Header |
|---|---|---|
| Activity feed, analysis, risks | 60 seconds | `private, max-age=60` |
| Timeline, KPI sectors | 120 seconds | `public, max-age=120` |
| Companies, funds, graph, constants, opportunities | 300 seconds | `public, max-age=3600` |
| Analytics (all engines) | 300 seconds | `public, max-age=300` |
| Constants | 600 seconds | `public, max-age=3600` |

Cache data is automatically purged on process restart. No persistent cache storage exists.

**Evidence**: `api/src/index.js` (lines 96-118)

### 4.8 Metric Snapshots

**Table**: `metric_snapshots`
**Retention**: 1 year from creation
**Justification**: Metric snapshots provide historical trend data for KPI dashboards and year-over-year analysis.

**Implementation**:
```sql
-- Monthly cleanup of metric snapshots older than 1 year
DELETE FROM metric_snapshots WHERE created_at < NOW() - INTERVAL '1 year';
```

### 4.9 Scenario Results

**Table**: `scenario_results`
**Retention**: 6 months from creation
**Justification**: Scenario modeling results are exploratory analyses that become stale as underlying assumptions change.

**Implementation**:
```sql
-- Monthly cleanup of scenario results older than 6 months
DELETE FROM scenario_results WHERE created_at < NOW() - INTERVAL '6 months';
```

### 4.10 Application Error Logs

**Location**: Standard output (console) / log aggregation service
**Retention**: 6 months
**Justification**: Error logs support debugging and incident response. Six months provides sufficient lookback for investigating intermittent issues.

**Considerations**:
- Error logs may contain request paths and error messages but should not contain request bodies or PII.
- The production error handler (`api/src/middleware/errorHandler.js`) returns generic messages to clients; detailed errors are logged server-side only.

---

## 5. Disposal Procedures

### 5.1 Database Records

| Method | Application |
|---|---|
| **DELETE statement** | Standard disposal for records past retention period |
| **TRUNCATE** | Bulk disposal when entire table contents are expired |
| **Anonymization** | For audit records where the event must be preserved but PII must be removed |

All disposal operations must:
1. Be executed in a database transaction with rollback capability.
2. Be logged (the disposal action itself) in the audit trail before execution.
3. Be verified by querying record counts before and after disposal.

### 5.2 Database Backups

- Expired backups (older than 90 days) must be securely deleted from all storage locations.
- If backups are encrypted, key material may be destroyed as an alternative to file deletion.
- For cloud storage (S3, GCS, Azure Blob), configure lifecycle policies for automatic expiry.
- For local storage, use secure deletion tools (`shred` on Linux, secure empty trash on managed services).

### 5.3 In-Memory Data

- Cache data is automatically disposed via TTL expiry.
- Application restart clears all in-memory data.
- No special disposal procedure is required for cache data.

### 5.4 Log Files

- Configure log rotation with automatic deletion of files older than the retention period.
- Centralized log aggregation services should be configured with retention policies matching this document.

---

## 6. Legal Hold

### 6.1 Definition

A legal hold suspends the normal retention schedule for specified data when the organization has a reasonable expectation of litigation, regulatory investigation, or audit.

### 6.2 Procedure

1. **Initiation**: Legal counsel or the Security Lead issues a written legal hold notice specifying the scope of data to be preserved (date range, data types, affected users).
2. **Preservation**: All automated disposal processes for in-scope data are suspended immediately.
3. **Notification**: Relevant data custodians (database administrators, engineering leads) are notified and must acknowledge the hold.
4. **Documentation**: The legal hold register records: hold ID, date issued, scope, issuing authority, and affected retention schedules.
5. **Release**: Legal counsel issues a written release notice. Normal retention schedules resume for the previously held data.

### 6.3 Impact on Automated Disposal

All automated disposal scripts (SQL DELETE statements in Section 4) must check the legal hold register before execution. Data under active legal hold must be excluded from disposal, regardless of its retention period.

---

## 7. Backup Retention

### 7.1 Backup Schedule

| Backup Type | Frequency | Retention | Storage |
|---|---|---|---|
| Full database dump (`pg_dump`) | Daily | 90 days | Offsite encrypted storage |
| WAL archives (point-in-time recovery) | Continuous | 30 days | Offsite encrypted storage |
| Configuration backups (env, docker-compose) | Per change | Indefinite | Version control (secrets excluded) |
| Migration files | Indefinite | Indefinite | Version control |

### 7.2 Backup Verification

- Test backup restoration quarterly on a non-production environment.
- Document restoration test results (date, duration, success/failure, data integrity verification).
- Maintain a backup restoration runbook with step-by-step procedures.

### 7.3 Backup Security

- All backups containing PII (database dumps) must be encrypted using AES-256 or equivalent.
- Backup encryption keys must be stored separately from the backup media.
- Access to backup storage is restricted to authorized infrastructure personnel.
- Backup transfer uses encrypted channels (TLS, SSH, or equivalent).

---

## 8. Responsibilities

| Role | Responsibility |
|---|---|
| **Security Lead** | Policy ownership; review and approval of retention schedules; legal hold management |
| **Engineering Lead** | Implementation of automated disposal procedures; backup management; disposal verification |
| **Database Administrator** | Execution of disposal queries; backup restoration testing; storage capacity monitoring |
| **All Personnel** | Compliance with retention policy; reporting of data stored outside defined systems |

---

## 9. Exceptions

### 9.1 Exception Process

Exceptions to this retention policy require:

1. Written justification documenting the business need for extended or shortened retention.
2. Assessment of privacy and security impact.
3. Approval from the Security Lead.
4. Documentation in the exceptions register with review date (maximum 1 year).

### 9.2 Standing Exceptions

| Exception | Data Category | Modified Retention | Justification | Review Date |
|---|---|---|---|---|
| None at this time | | | | |

---

## 10. Compliance and Audit

### 10.1 Monitoring

- Automated disposal scripts should be scheduled via cron or equivalent and monitored for successful execution.
- Failed disposal runs must generate alerts to the Engineering Lead.
- Monthly reporting on data volume by category and age distribution.

### 10.2 Audit

- This policy is subject to annual internal audit.
- Auditors may request evidence of disposal execution (before/after record counts, execution timestamps).
- Audit findings related to data retention are tracked in the remediation roadmap (`docs/SOC2_CONTROLS.md`, Section 7).

### 10.3 Policy Review

This policy is reviewed:
- Semi-annually (every 6 months) as a scheduled review.
- When new data categories are introduced to the system.
- When legal or regulatory requirements change.
- After any data breach or security incident involving data retention.

---

## Revision History

| Version | Date | Author | Changes |
|---|---|---|---|
| 1.0 | 2026-03-18 | BBI Security Team | Initial policy creation |

---

*This document is classified as Internal. Distribution is limited to BBI personnel and authorized auditors.*
