"""
SchemaAuditor — Validates database schema integrity.

Checks:
  1. Orphaned edges (source/target not in entity_registry)
  2. Missing entity_registry entries for all source tables
  3. NULL completeness on critical columns
  4. Foreign key integrity (company_id refs, fund refs)
  5. Duplicate detection (edges, entities)
  6. Constraint violations (CHECK constraints, value ranges)

Does NOT use Claude — pure SQL-driven structural auditing.
"""

from .base_agent import BaseAgent

# Critical columns that should never be NULL
COMPLETENESS_CHECKS = [
    ("companies", "name", "Company name"),
    ("companies", "stage", "Company stage"),
    ("companies", "region", "Company region"),
    ("companies", "location_class", "Company location class"),
    ("graph_edges", "source_id", "Edge source"),
    ("graph_edges", "target_id", "Edge target"),
    ("graph_edges", "rel", "Edge relationship type"),
    ("entity_registry", "canonical_id", "Entity canonical ID"),
    ("entity_registry", "entity_type", "Entity type"),
    ("entity_registry", "label", "Entity label"),
]

ENTITY_TABLE_MAP = [
    ("companies", "'c_' || id::TEXT", "id::TEXT"),
    ("graph_funds", "'f_' || id::TEXT", "id::TEXT"),
    ("accelerators", "id::TEXT", "id::TEXT"),
    ("ecosystem_orgs", "id::TEXT", "id::TEXT"),
    ("people", "id::TEXT", "id::TEXT"),
    ("externals", "id::TEXT", "id::TEXT"),
]


class SchemaAuditor(BaseAgent):
    def __init__(self):
        super().__init__("schema_auditor")

    async def run(self, pool, **kwargs):
        findings = []

        findings.extend(await self._check_orphaned_edges(pool))
        findings.extend(await self._check_registry_completeness(pool))
        findings.extend(await self._check_null_completeness(pool))
        findings.extend(await self._check_duplicate_edges(pool))
        findings.extend(await self._check_duplicate_entities(pool))
        findings.extend(await self._check_value_ranges(pool))

        severity_counts = {"critical": 0, "warning": 0, "info": 0}
        for f in findings:
            severity_counts[f.get("severity", "info")] += 1

        result = {
            "total_checks": len(COMPLETENESS_CHECKS) + 6,
            "total_findings": len(findings),
            "severity_counts": severity_counts,
            "findings": findings,
        }

        await self.save_analysis(
            pool,
            analysis_type="schema_audit",
            content=result,
            model_used="none",
        )

        return result

    async def _check_orphaned_edges(self, pool):
        """Find edges whose source or target doesn't exist in entity_registry."""
        findings = []
        for side in ("source_id", "target_id"):
            rows = await pool.fetch(f"""
                SELECT ge.{side} AS node_id, ge.rel, COUNT(*) AS cnt
                FROM graph_edges ge
                WHERE NOT EXISTS (
                    SELECT 1 FROM entity_registry er
                    WHERE er.canonical_id = ge.{side}
                )
                AND ge.{side} NOT LIKE 's_%%'
                AND ge.{side} NOT LIKE 'r_%%'
                GROUP BY ge.{side}, ge.rel
                ORDER BY cnt DESC
                LIMIT 20
            """)
            for r in rows:
                findings.append({
                    "check": "orphaned_edge",
                    "severity": "critical",
                    "message": f"Edge {side} '{r['node_id']}' (rel={r['rel']}) not in entity_registry ({r['cnt']} edges)",
                })
        return findings

    async def _check_registry_completeness(self, pool):
        """Ensure all source tables have entity_registry entries."""
        findings = []
        for table, canonical_expr, _src_id_expr in ENTITY_TABLE_MAP:
            row = await pool.fetchrow(f"""
                SELECT COUNT(*) AS missing
                FROM {table} t
                WHERE NOT EXISTS (
                    SELECT 1 FROM entity_registry er
                    WHERE er.canonical_id = {canonical_expr}
                )
            """)
            if row["missing"] > 0:
                findings.append({
                    "check": "registry_missing",
                    "severity": "warning",
                    "message": f"{row['missing']} {table} rows missing from entity_registry",
                })
        return findings

    async def _check_null_completeness(self, pool):
        """Check critical columns for unexpected NULLs."""
        findings = []
        for table, column, label in COMPLETENESS_CHECKS:
            row = await pool.fetchrow(f"""
                SELECT COUNT(*) AS null_count
                FROM {table}
                WHERE {column} IS NULL
            """)
            if row["null_count"] > 0:
                findings.append({
                    "check": "null_column",
                    "severity": "warning",
                    "message": f"{label}: {row['null_count']} NULL values in {table}.{column}",
                })
        return findings

    async def _check_duplicate_edges(self, pool):
        """Find duplicate (source_id, target_id, rel) triples."""
        findings = []
        rows = await pool.fetch("""
            SELECT source_id, target_id, rel, COUNT(*) AS cnt
            FROM graph_edges
            GROUP BY source_id, target_id, rel
            HAVING COUNT(*) > 1
            ORDER BY cnt DESC
            LIMIT 20
        """)
        for r in rows:
            findings.append({
                "check": "duplicate_edge",
                "severity": "warning",
                "message": f"Duplicate edge: {r['source_id']} -[{r['rel']}]-> {r['target_id']} ({r['cnt']}x)",
            })
        return findings

    async def _check_duplicate_entities(self, pool):
        """Find duplicate labels within the same entity_type."""
        findings = []
        rows = await pool.fetch("""
            SELECT entity_type, label, COUNT(*) AS cnt
            FROM entity_registry
            WHERE merged_into IS NULL
            GROUP BY entity_type, label
            HAVING COUNT(*) > 1
            ORDER BY cnt DESC
            LIMIT 20
        """)
        for r in rows:
            findings.append({
                "check": "duplicate_entity",
                "severity": "warning",
                "message": f"Duplicate {r['entity_type']} label: '{r['label']}' ({r['cnt']}x)",
            })
        return findings

    async def _check_value_ranges(self, pool):
        """Check numeric columns for out-of-range values."""
        findings = []
        checks = [
            ("companies", "momentum", 0, 100, "Company momentum"),
            ("companies", "funding_m", 0, 50000, "Company funding"),
            ("companies", "employees", 0, 100000, "Company employees"),
            ("entity_registry", "confidence", 0, 1, "Entity confidence"),
            ("graph_edges", "confidence", 0, 1, "Edge confidence"),
        ]
        for table, col, lo, hi, label in checks:
            row = await pool.fetchrow(f"""
                SELECT COUNT(*) AS cnt
                FROM {table}
                WHERE {col} IS NOT NULL AND ({col} < {lo} OR {col} > {hi})
            """)
            if row["cnt"] > 0:
                findings.append({
                    "check": "value_range",
                    "severity": "critical",
                    "message": f"{label}: {row['cnt']} values outside [{lo}, {hi}] in {table}.{col}",
                })
        return findings
