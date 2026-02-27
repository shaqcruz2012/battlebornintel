# Research Edges

Research and expand the knowledge graph edges for a vertical. This is the primary data population workflow.

## Context
You have access to the current graph data and should use web search + Axon MCP to find new relationships.

## Workflow
1. **Load current state** — Count existing edges, identify sparse nodes
2. **Identify gaps** — Companies with <3 connections, high-funding but low-degree nodes
3. **Research** — Use web search for each gap: investor relationships, partnerships, board members, government grants
4. **Add edges** — Append to `apps/{vertical}/src/data/graph.js` VERIFIED_EDGES array
5. **Add nodes** — If new people/externals/orgs discovered, add to corresponding arrays
6. **Validate** — Run `/validate {vertical}`
7. **Migrate** — Run `/migrate {vertical}`

## Edge format
```js
{ source: "c_1", target: "x_doe", rel: "grant_from", note: "2024 SBIR Phase II", y: 2024 }
```

## ID conventions
- Companies: `c_{id}` (numeric from companies.js)
- Funds: `f_{fundId}` (string from funds.js)
- People: `p_{slug}` (e.g., `p_john_smith`)
- Externals: `x_{slug}` (e.g., `x_doe`, `x_tesla`)
- Accelerators/EcosystemOrgs: direct string id

## Relationship types
`invested_in`, `eligible_for`, `backed_by`, `partners_with`, `contract_with`, `grant_from`, `regulates`, `alumni_of`, `located_in`, `founded_by`, `advises`, `board_member`, `co_invested`, `acquired_by`, `spun_out_of`
