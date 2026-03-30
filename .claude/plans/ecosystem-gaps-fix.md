# Plan: Fix Ecosystem Gaps Page

## Current Problems
1. Two disconnected views - ResourceMatrix (68 hardcoded orgs) vs EcosystemGaps (API structural analysis)
2. ResourceMatrix is static - not synced with graph DB (741+ entities)
3. Policy gaps hardcoded with manual coordinates
4. No action workflows
5. Three parallel ecosystem views with no unified story

## Phase 1: Unify Data Source
- Replace ecosystemOrgs.js with API endpoint GET /api/ecosystem/map
- Query entity_registry for accelerators, ecosystem_orgs, programs, funds
- Compute x/y coordinates from entity attributes
- Merge policy gaps with structural analysis into one view

## Phase 2: Cross-View Integration
- Click bubble -> navigate to graph node
- Gap-to-Action workflow with Propose Bridge button
- Unify GoedView as a lens on the same page
- Track gap interventions in new table

## Phase 3: Intelligence Features
- Validate gap severity against real company counts
- Gap closure tracking over time with trends
- Export as PNG/CSV

## Files
Backend: ecosystem.js route + queries, structural-holes engine, migration 129
Frontend: ResourceMatrix.jsx (API-driven), EcosystemGaps.jsx (merged), client.js, hooks.js
