-- Migration 054: Add missing federal agency external nodes
-- Resolves unresolved x_ and gov_ prefixed node IDs that reference federal agencies,
-- federal programs, and closely related government bodies found in graph_edges.
-- All inserts use ON CONFLICT DO NOTHING so re-runs are safe.

BEGIN;

-- -----------------------------------------------------------------------
-- x_ prefixed federal agency / program IDs
-- -----------------------------------------------------------------------

-- x_army: U.S. Army — HADES surveillance aircraft $991.3M contract 2024
INSERT INTO externals (id, name, entity_type, note)
VALUES (
  'x_army',
  'U.S. Army',
  'Federal Agency',
  'U.S. Department of the Army. HADES surveillance aircraft contract $991.3M 2024.'
)
ON CONFLICT DO NOTHING;

-- x_darpa: DARPA — sensor tech development contract 2004
INSERT INTO externals (id, name, entity_type, note)
VALUES (
  'x_darpa',
  'DARPA',
  'Federal Agency',
  'Defense Advanced Research Projects Agency. Sensor technology development contracts.'
)
ON CONFLICT DO NOTHING;

-- x_diu: Defense Innovation Unit — Unmanned Orbital Outpost contract 2020
INSERT INTO externals (id, name, entity_type, note)
VALUES (
  'x_diu',
  'Defense Innovation Unit',
  'Federal Agency',
  'DoD Defense Innovation Unit. Unmanned Orbital Outpost space station contract 2020.'
)
ON CONFLICT DO NOTHING;

-- x_dod: Department of Defense — MPS sensor contract 2004
INSERT INTO externals (id, name, entity_type, note)
VALUES (
  'x_dod',
  'Department of Defense',
  'Federal Agency',
  'U.S. Department of Defense. MPS sensor development contracts.'
)
ON CONFLICT DO NOTHING;

-- x_usdepartmentofenergy: DOE — ATVM loan $996M Ioneer Jan 2025
-- Note: x_doe already exists as "US Dept of Energy"; this is a duplicate node pointing
-- to the same agency via a different ID used in some edges.
INSERT INTO externals (id, name, entity_type, note)
VALUES (
  'x_usdepartmentofenergy',
  'U.S. Department of Energy',
  'Federal Agency',
  'U.S. Department of Energy. ATVM loan $996M to Ioneer Jan 2025. See also x_doe.'
)
ON CONFLICT DO NOTHING;

-- x_fda_approval: FDA (registration/approval pathway node)
-- Note: x_fda already exists as "FDA"; this node captures a distinct approval-pathway
-- edge used for Melzi Surgical registration 2023.
INSERT INTO externals (id, name, entity_type, note)
VALUES (
  'x_fda_approval',
  'FDA (Approval Pathway)',
  'Federal Agency',
  'FDA registration and 510(k)/PMA approval pathway. Melzi Surgical registration 2023.'
)
ON CONFLICT DO NOTHING;

-- x_hhs_grant: HHS — grants to Vena Vitals 2023
INSERT INTO externals (id, name, entity_type, note)
VALUES (
  'x_hhs_grant',
  'U.S. Department of Health and Human Services',
  'Federal Agency',
  'HHS federal grants. Vena Vitals HHS grant 2023.'
)
ON CONFLICT DO NOTHING;

-- x_nasateampleap: NASA TechLeap Prize — Ecoatoms partnership 2023
-- Note: x_nasa already exists as "NASA"; this node represents a specific prize program.
INSERT INTO externals (id, name, entity_type, note)
VALUES (
  'x_nasateampleap',
  'NASA TechLeap Prize',
  'Federal Program',
  'NASA TechLeap Prize competition program. Ecoatoms partner 2023.'
)
ON CONFLICT DO NOTHING;

-- -----------------------------------------------------------------------
-- gov_ prefixed federal agency / program IDs
-- -----------------------------------------------------------------------

-- gov_DOD: Department of Defense — Army SRR contract $99.8M 2022
INSERT INTO externals (id, name, entity_type, note)
VALUES (
  'gov_DOD',
  'Department of Defense',
  'Federal Agency',
  'U.S. Department of Defense. Army SRR contract $99.8M base 2022.'
)
ON CONFLICT DO NOTHING;

-- gov_army_rdc: U.S. Army Engineer Research & Development Center — AIR Corp contract 2024
INSERT INTO externals (id, name, entity_type, note)
VALUES (
  'gov_army_rdc',
  'U.S. Army Engineer Research and Development Center',
  'Federal Agency',
  'U.S. Army Corps of Engineers Research and Development Center. AIR Corp contract 2024.'
)
ON CONFLICT DO NOTHING;

-- gov_tacfi: U.S. Air Force TACFI — $5M award to AIR Corp 2024
INSERT INTO externals (id, name, entity_type, note)
VALUES (
  'gov_tacfi',
  'U.S. Air Force TACFI Program',
  'Federal Program',
  'USAF Technology Accelerator for Commercially-Funded Innovation (TACFI). AIR Corp $5M award 2024.'
)
ON CONFLICT DO NOTHING;

-- gov_nih_sbir: NIH SBIR — Phase 2 $959K grant 2023
INSERT INTO externals (id, name, entity_type, note)
VALUES (
  'gov_nih_sbir',
  'NIH SBIR Program',
  'Federal Program',
  'National Institutes of Health Small Business Innovation Research program. Phase 2 award $959K 2023.'
)
ON CONFLICT DO NOTHING;

-- gov_nsf_sbir: NSF SBIR — Phase I $274.6K grant 2023
INSERT INTO externals (id, name, entity_type, note)
VALUES (
  'gov_nsf_sbir',
  'NSF SBIR Program',
  'Federal Program',
  'National Science Foundation Small Business Innovation Research program. Phase I award $274.6K 2023.'
)
ON CONFLICT DO NOTHING;

-- gov_nsf_pfi: NSF Partnerships for Innovation — AIR Corp grant 2023
INSERT INTO externals (id, name, entity_type, note)
VALUES (
  'gov_nsf_pfi',
  'NSF Partnerships for Innovation',
  'Federal Program',
  'National Science Foundation Partnerships for Innovation (PFI) grant program. AIR Corp award 2023.'
)
ON CONFLICT DO NOTHING;

-- gov_nsf_grant: NSF grant — CircleIn 2020
INSERT INTO externals (id, name, entity_type, note)
VALUES (
  'gov_nsf_grant',
  'NSF Grant Program',
  'Federal Program',
  'National Science Foundation research grant program. CircleIn NSF grant 2020.'
)
ON CONFLICT DO NOTHING;

-- gov_uscis: USCIS — I-9 E-Verify compliance partner 2022
INSERT INTO externals (id, name, entity_type, note)
VALUES (
  'gov_uscis',
  'U.S. Citizenship and Immigration Services',
  'Federal Agency',
  'USCIS I-9 E-Verify compliance partner 2022.'
)
ON CONFLICT DO NOTHING;

-- gov_STATE_DEPT: U.S. State Department — IDIQ contract $74M 2025
INSERT INTO externals (id, name, entity_type, note)
VALUES (
  'gov_STATE_DEPT',
  'U.S. Department of State',
  'Federal Agency',
  'U.S. Department of State. IDIQ contract $74M 2025.'
)
ON CONFLICT DO NOTHING;

-- gov_CEC: California Energy Commission — V2G contract $7.9M 2020
INSERT INTO externals (id, name, entity_type, note)
VALUES (
  'gov_CEC',
  'California Energy Commission',
  'Gov Agency',
  'California Energy Commission. Vehicle-to-Grid (V2G) contract $7.9M 2020.'
)
ON CONFLICT DO NOTHING;

-- -----------------------------------------------------------------------
-- gov_ prefixed Nevada / local government IDs
-- -----------------------------------------------------------------------

-- gov_NEVADA_GOED: Nevada GOED — tax abatement $2.2M 2024
-- Note: goed-nv already exists; this gov_ alias appears in separate edges.
INSERT INTO externals (id, name, entity_type, note)
VALUES (
  'gov_NEVADA_GOED',
  'Nevada GOED (Gov Alias)',
  'Government',
  'Governor''s Office of Economic Development. Tax abatement $2.2M 2024. See also goed-nv.'
)
ON CONFLICT DO NOTHING;

-- gov_goed_grant: GOED pre-seed grant program — $50K grant 2022
INSERT INTO externals (id, name, entity_type, note)
VALUES (
  'gov_goed_grant',
  'Nevada GOED Pre-Seed Grant',
  'Government',
  'Nevada GOED pre-seed grant program. $50K grant 2022.'
)
ON CONFLICT DO NOTHING;

-- gov_SSBCI: SSBCI — Battle Born Growth match $200K 2025
-- Note: x_ssbci already exists as "NV SSBCI"; this gov_ alias used in separate edges.
INSERT INTO externals (id, name, entity_type, note)
VALUES (
  'gov_SSBCI',
  'State Small Business Credit Initiative (SSBCI)',
  'Federal Program',
  'U.S. Treasury State Small Business Credit Initiative. Battle Born Growth match $200K 2025.'
)
ON CONFLICT DO NOTHING;

-- gov_LASVEGAS_CLARK: Las Vegas / Clark County — JBA advisor contract 2020
INSERT INTO externals (id, name, entity_type, note)
VALUES (
  'gov_LASVEGAS_CLARK',
  'City of Las Vegas / Clark County',
  'Government',
  'Combined Las Vegas city and Clark County government. JBA Consulting advisor contract 2020.'
)
ON CONFLICT DO NOTHING;

-- gov_LVMPD: Las Vegas Metro Police Department — Drone First Responder partnership 2023
INSERT INTO externals (id, name, entity_type, note)
VALUES (
  'gov_LVMPD',
  'Las Vegas Metropolitan Police Department',
  'Government',
  'LVMPD Drone as First Responder (DFR) program partnership 2023.'
)
ON CONFLICT DO NOTHING;

-- gov_NELLIS_AFB: Nellis Air Force Base — 14MW solar installation 2007
INSERT INTO externals (id, name, entity_type, note)
VALUES (
  'gov_NELLIS_AFB',
  'Nellis Air Force Base',
  'Federal Agency',
  'Nellis AFB, Nevada. 14MW solar installation 2007.'
)
ON CONFLICT DO NOTHING;

COMMIT;
