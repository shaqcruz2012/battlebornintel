# Event Sourcing Rules — Battle Born Intelligence

## Golden Rule
**Every event MUST be independently verifiable.** If you can't find a public source confirming the event, it does not go in the database.

## Required Fields
- `source_url`: MANDATORY. Must point to an actual, resolvable URL (news article, press release, SEC filing, official announcement)
- `source`: Name of the publication/source (e.g., "TechCrunch", "PR Newswire", "SEC EDGAR")
- `data_quality`: Must be 'VERIFIED' if source URL exists, 'INFERRED' if derived from public but non-URL sources
- `confidence`: 0.0–1.0 based on source reliability

## Acceptable Sources (Tier 1 — VERIFIED)
- Major tech publications: TechCrunch, VentureBeat, The Information, Crunchbase News
- Wire services: PR Newswire, Business Wire, GlobeNewsWire
- SEC filings: EDGAR, 13F filings, S-1, 8-K
- Government records: SBIR.gov awards, SAM.gov contracts, Treasury SSBCI reports
- Official press releases: Company websites, fund websites
- **Nevada media (PRIORITIZED — local ground truth)**:
  - Las Vegas Review-Journal (reviewjournal.com)
  - Las Vegas Sun (lasvegassun.com)
  - Reno Gazette-Journal (rgj.com)
  - Nevada Independent (thenevadaindependent.com)
  - Vegas Inc / Las Vegas Business Press (vegasinc.lasvegassun.com)
  - Nevada Business Magazine (nevadabusiness.com)
  - Nevada Current (nevadacurrent.com)
  - This Is Reno (thisisreno.com)
  - Reno News & Review
  - KTNV / KLAS / KVVU (local TV news with online articles)
  - Nevada Appeal (nevadaappeal.com)
  - Elko Daily Free Press (elkodaily.com)
- University announcements: UNLV News Center, UNR News, DRI News
- Nevada government: goed.nv.gov, leg.state.nv.us, nvsos.gov (Secretary of State business filings)

## Acceptable Sources (Tier 2 — INFERRED, confidence 0.6-0.8)
- LinkedIn announcements (hiring, promotions, partnerships)
- Crunchbase profiles (funding amounts, investors)
- Glassdoor/Indeed (hiring patterns)
- State business filings (Secretary of State records)
- Conference schedules (CES, AWS re:Invent presenters)

## Unacceptable Sources (DO NOT USE)
- AI-generated content with no underlying source
- Hearsay or rumors
- Extrapolated data (e.g., "probably raised $X based on similar companies")
- Social media posts without corroborating evidence
- Guessed URLs (e.g., constructing a NIH.gov URL hoping it exists)

## Event Types and Required Evidence
| Event Type | Required Evidence |
|-----------|------------------|
| Funding | Press release, SEC filing, or Crunchbase confirmed round |
| Partnership | Press release from either party, or joint announcement |
| Hiring | Job posting, LinkedIn announcement, or company press release |
| Grant | Government award database (SBIR.gov, grants.gov, SAM.gov) |
| Launch | Product launch press release, app store listing, or news coverage |
| Patent | USPTO patent database entry |
| Award | Award organization announcement |
| Expansion | News article or press release about facility/office expansion |
| Acquisition | SEC filing, press release, or confirmed news report |

## Confidence Scoring
| Confidence | Meaning |
|-----------|---------|
| 0.95-1.0 | SEC filing, government database, official press release |
| 0.85-0.94 | Major tech publication with named sources |
| 0.70-0.84 | Local media report, Crunchbase profile |
| 0.50-0.69 | LinkedIn post, conference listing |
| Below 0.50 | DO NOT INSERT — insufficient evidence |

## Review Process
1. All events enter the `ingestion_queue` with status='pending'
2. Human reviewer verifies source_url resolves and matches the event
3. Reviewer approves → event moves to timeline_events/stakeholder_activities
4. Reviewer rejects → event stays in queue with notes explaining why
