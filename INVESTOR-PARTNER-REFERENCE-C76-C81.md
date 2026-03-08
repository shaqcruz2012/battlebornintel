# Battle Born Venture Portfolio (Companies 76-81)
## Complete Investor & Partner Reference Guide

**Research Completed:** March 7, 2026
**Status:** Ready for Integration into Graph Database

---

## INVESTOR SUMMARY TABLE

### VC Firms & Venture Funds

| Investor ID | Investor Name | Type | Companies Invested | Rounds | Years | Notes |
|------------|---------------|------|-------------------|--------|-------|-------|
| i_founders_fund | Founders Fund | Tier-1 VC | c_78 (AI Foundation) | Series B | 2020 | Top-tier Silicon Valley VC. Led $17M Series B. |
| i_brandtech_group | Brandtech Group | VC Firm | c_78 (AI Foundation) | Series B | 2020 | Led AI Foundation Series B $17M |
| i_alpha_edison | Alpha Edison | VC Firm | c_78 (AI Foundation) | Series B | 2020 | Series B co-investor |
| i_grey_collar_ventures | Grey Collar Ventures | VC Firm | c_81 (Beloit Kombucha) | Seed | 2023 | Led $800K seed round |
| a_gener8tor | gener8tor | Accelerator/VC | c_81 (Beloit Kombucha) | Seed | 2023 | Joe Kirgues co-founder. Co-investor $800K seed. |
| i_h7_biocapital | H7 BioCapital | VC Firm | c_77 (Adaract) | Early | 2023 | Healthcare/biotech venture capital |
| i_sosv | SOSV | Innovation Fund | c_79 (AIR Corp) | Strategic | 2026 | Deep-tech focused venture fund. Strategic investment Jan 2026. |

### Angel & Early-Stage Investors

| Investor ID | Investor Name | Type | Companies Invested | Rounds | Years | Notes |
|------------|---------------|------|-------------------|--------|-------|-------|
| a_angelnv | AngelNV | Angel Program | c_77 (Adaract) | Competition | 2023 | $400K first-place prize winner Adaract competition 2023 |
| i_you_and_mr_jones | You & Mr Jones | Angel/Corporate | c_78 (AI Foundation) | Early | 2019 | Founder David Jones backing AI digital humans |
| i_endeavor | Endeavor | VC Firm | c_78 (AI Foundation) | Early | 2019 | Early-stage investor |
| i_biz_stone | Biz Stone | Angel Investor | c_78 (AI Foundation) | Early | 2019 | Twitter co-founder personal investment |

### Private Equity Firms

| Investor ID | Investor Name | Type | Companies Invested | Rounds | Years | Notes |
|------------|---------------|------|-------------------|--------|-------|-------|
| i_apg_partners | APG Partners | Healthcare PE | c_76 (Access Health) | Strategic | 2022+ | DSO specialist. Andy Graham (40 yrs fin svc, 15 yrs healthcare) |

### Government & State Funding

| Fund ID | Fund Name | Type | Companies Invested | Years | Notes |
|---------|-----------|------|-------------------|-------|-------|
| f_bbv | Battle Born Venture | SSBCI Fund | c_76, c_77, c_78, c_79, c_80, c_81 | 2022+ | Primary investor in all 6 portfolio companies |
| f_fundnv | FundNV | SSBCI Pre-Seed | c_77 (Adaract) | 2023 | Nevada pre-seed fund |
| e_goed | Nevada GOED | Government | c_79 (AIR Corp) | 2026 | Strategic funding Jan 23, 2026 |

### Research Institutions (Universities)

| Institution ID | Institution | Companies Spinouts | Connection Type | Notes |
|----------------|-------------|-------------------|------------------|-------|
| x_unr | University of Nevada, Reno | c_77 (Adaract), c_79 (AIR Corp) | Spinout/Incubation | UNR Innevation Center. Mechanical Engineering & Robotics Labs |

---

## CORPORATE PARTNERS & STRATEGIC INVESTORS

### Hospitality & Gaming

| Partner | Type | Company | Relationship | Year | Details |
|---------|------|---------|--------------|------|---------|
| x_caesars | Casino Operator | c_76 (Access Health Dental) | Mobile dentistry customer | 2020+ | Healthcare services for casino operations |
| x_mgm | Casino Operator | c_76 (Access Health Dental) | Mobile dentistry customer | 2020+ | Employee health services |

### Food & Beverage Supply Chain

| Partner | Type | Company | Relationship | Year | Details |
|---------|------|---------|--------------|------|---------|
| x_kerry | Food Ingredients | c_81 (Beloit Kombucha) | Exclusive supplier | 2020+ | Kerry Ingredients provides exclusive BC30 patented probiotic |

### Beverage & Hospitality Partnerships

| Partner | Type | Company | Relationship | Year | Details |
|---------|------|---------|--------------|------|---------|
| x_parlay6 | Brewery | c_80 (Battle Born Beer) | Strategic partnership | 2025 | Award-winning brew team. The Par (Midtown) permanent home |

### Government & Research Partnerships

| Partner | Type | Company | Relationship | Year | Details |
|---------|------|---------|--------------|------|---------|
| x_nasa | Government Agency | c_79 (AIR Corp) | Product deployment | 2023+ | InfraGuard AI tool at NASA Langley |
| x_doe | Government Department | c_79 (AIR Corp) | Potential research | 2024+ | Alignment with DOE infrastructure modernization |
| x_usaf | Government | c_77 (Adaract) | SBIR contract | 2023+ | Small Business Innovation Research contract |

---

## MISSING ENTITY IDs (Require Addition to graph-entities.js)

### Investors to Add

```javascript
{id:"i_apg_partners",name:"APG Partners",etype:"Private Equity",note:"Healthcare DSO investor. Led by Andy Graham (40 yrs financial services, 15 yrs healthcare focus). Manages portfolio of dental support organizations."},

{id:"i_h7_biocapital",name:"H7 BioCapital",etype:"VC Firm",note:"Healthcare/biotech focused venture capital. Early investor in medical device/biotech companies."},

{id:"i_founders_fund",name:"Founders Fund",etype:"VC Firm",note:"Tier-1 Silicon Valley VC. Portfolio: Stripe, SpaceX, Lyft. Led AI Foundation Series B $17M."},

{id:"i_brandtech_group",name:"Brandtech Group",etype:"VC Firm",note:"AI and technology investor. Led AI Foundation Series B $17M (2020)."},

{id:"i_alpha_edison",name:"Alpha Edison",etype:"VC Firm",note:"Venture capital firm. Series B co-investor in AI Foundation."},

{id:"i_you_and_mr_jones",name:"You & Mr Jones",etype:"Angel Investor",note:"Founder David Jones backing AI Foundation. One Young World organizer."},

{id:"i_endeavor",name:"Endeavor",etype:"VC Firm",note:"Venture capital firm providing early-stage funding to AI Foundation."},

{id:"i_biz_stone",name:"Biz Stone",etype:"Angel Investor",note:"Twitter co-founder. Angel investor in AI Foundation digital humans platform."},

{id:"i_grey_collar_ventures",name:"Grey Collar Ventures",etype:"VC Firm",note:"Venture capital firm. Led Beloit Kombucha $800K seed round (Aug 2023)."},

{id:"i_sosv",name:"SOSV",etype:"VC Fund",note:"Deep-tech venture fund with global reach. Strategic investor in AIR Corp autonomous robotics (Jan 2026)."},
```

### Corporate Partners to Add

```javascript
{id:"x_parlay6",name:"Parlay 6 Brewing",etype:"Corporation",note:"Award-winning brewery in Nevada. Strategic partner with Battle Born Beer. The Par brewpub in Midtown is permanent home for Battle Born operations (2025)."},

{id:"x_kerry",name:"Kerry Ingredients",etype:"Corporation",note:"Global food ingredients company. Exclusive supplier of patented BC30 probiotic to Beloit Kombucha for powdered kombucha product."},
```

---

## INVESTMENT ROUNDS SUMMARY

### Seed/Early Stage Rounds

| Company | Round | Amount | Lead Investor | Year | Other Investors |
|---------|-------|--------|----------------|------|-----------------|
| c_77 (Adaract) | Competition Prize | $400,000 | AngelNV | 2023 | FundNV, BBV, H7 BioCapital, StartUpNV |
| c_81 (Beloit Kombucha) | Seed | $800,000 | Grey Collar Ventures | 2023 | BBV, gener8tor |

### Institutional Rounds

| Company | Round | Amount | Lead Investor | Year | Other Investors |
|---------|-------|--------|----------------|------|-----------------|
| c_78 (AI Foundation) | Series B | $17,000,000 | Founders Fund | 2020 | Brandtech Group, Alpha Edison |

### Strategic/Government Funding

| Company | Type | Source | Year | Amount | Details |
|---------|------|--------|------|--------|---------|
| c_79 (AIR Corp) | Strategic | SOSV + GOED | 2026 | Undisclosed | Announced Jan 23, 2026 |
| c_77 (Adaract) | SBIR/STTR | US Air Force | 2023+ | Undisclosed | Defense technology contract |

---

## KEY INVESTOR PROFILES

### Founders Fund
- **Type:** Tier-1 Silicon Valley Venture Capital
- **Notable Exits:** Stripe, SpaceX, Lyft, Figma
- **Investment in Portfolio:** c_78 (AI Foundation) - Series B $17M lead (2020)
- **Thesis:** AI/software/deeptech
- **Relevance:** Elite-tier VC backing indicates high quality AI Foundation platform

### SOSV (Seed Stage Venture Fund)
- **Type:** Global innovation fund focused on deep-tech
- **Recent Investment:** c_79 (AIR Corp) - Strategic investment (Jan 2026)
- **Focus Areas:** AI, robotics, infrastructure, hardware
- **Relevance:** Signals strong market confidence in autonomous infrastructure inspection technology

### gener8tor
- **Type:** Accelerator + Venture Investor
- **Leadership:** Joe Kirgues (Co-Founder)
- **Investment:** c_81 (Beloit Kombucha) - Seed $800K co-investor (2023)
- **Operations:** Multi-city accelerator with SSBCI funding in Nevada
- **Relevance:** Multi-stage support for early-stage companies

### APG Partners
- **Type:** Private Equity focused on Healthcare (DSO)
- **Leadership:** Andy Graham - 40 years financial services, 15 years healthcare DSO focus
- **Investment:** c_76 (Access Health Dental) - Strategic co-investor
- **Portfolio Focus:** Dental Support Organizations
- **Relevance:** Specialized healthcare PE with deep dental industry expertise

---

## GOVERNMENT FUNDING SOURCES

### SBIR/STTR (Small Business Innovation Research)
- **Agency:** US Air Force
- **Company:** c_77 (Adaract)
- **Award Type:** Defense technology development
- **Focus:** Artificial muscle actuators for aerospace/defense
- **Status:** Active contract

### SSBCI (State Small Business Credit Initiative)
- **Administrator:** Nevada GOED
- **Programs:** FundNV, BBV, SSBCI general matching
- **Companies:** c_77 (Adaract), c_80 (Battle Born Beer), c_81 (Beloit Kombucha)

### GOED Strategic Funding
- **Program:** Nevada Governor's Office of Economic Development
- **Company:** c_79 (AIR Corp)
- **Amount:** Undisclosed
- **Announcement:** January 23, 2026
- **Focus:** Autonomous infrastructure inspection innovation

---

## RESEARCH PARTNERSHIPS & DEPLOYMENT

### University Spinouts

| Company | University | Faculty Lead | Department | Program |
|---------|-----------|--------------|-----------|---------|
| c_77 (Adaract) | UNR | Multiple (Joe Hill, Francis Budu-Manuel) | Mechanical Engineering | Capstone Project |
| c_79 (AIR Corp) | UNR | Dr. Hung M. La | Computer Science & Engineering | Advanced Robotics & Automation Lab |

### Government Research Partnerships

| Company | Agency | Program | Product | Status |
|---------|--------|---------|---------|--------|
| c_79 (AIR Corp) | NASA | Space Research | InfraGuard AI 3D Bridge Inspection | Active Deployment (NASA Langley) |
| c_79 (AIR Corp) | NSF | Research Grants | AI Infrastructure Inspection | Ongoing |
| c_79 (AIR Corp) | US DOT | Transportation Research | Bridge Safety Assessment | Alignment |

### Commercial Research Grants

| Company | Source | Award Type | Year |
|---------|--------|-----------|------|
| c_77 (Adaract) | SBIR/STTR | Air Force Defense Contract | 2023+ |

---

## INDUSTRY SECTOR CLASSIFICATION

### By Sector

| Sector | Companies | Stage | Key Characteristics |
|--------|-----------|-------|-------------------|
| HealthTech | c_76 (Access Health Dental) | Growth | B2B2C healthcare services, casino partnerships |
| DeepTech/Hardware | c_77 (Adaract), c_79 (AIR Corp) | Pre-Seed/Seed | University spinouts, government R&D, manufacturing |
| AI/DeepTech | c_78 (AI Foundation) | Series B | Synthetic media, deepfake detection, established VC |
| Consumer/FoodTech | c_80 (Battle Born Beer), c_81 (Beloit Kombucha) | Seed | Beverages, consumer products, startup ecosystem |

### By Geography

| Region | Companies | Notes |
|--------|-----------|-------|
| Nevada (Reno) | c_77 (Adaract), c_79 (AIR Corp), c_80 (Battle Born Beer) | UNR spinouts, strong ecosystem support |
| Nevada (Las Vegas) | c_76 (Access Health Dental) | Casino-focused services |
| Non-Nevada | c_78 (AI Foundation-SF), c_81 (Beloit Kombucha-WI) | BBV diversified geographic portfolio |

---

## DATA INTEGRATION CHECKLIST

- [x] Investor identification and verification
- [x] Investment round details (amounts, dates, leads)
- [x] Corporate partner relationships
- [x] University spinout verification
- [x] Government funding programs
- [x] Research partnerships and deployments
- [x] Edge data formatted for graph database
- [ ] Missing entity IDs added to graph-entities.js
- [ ] Edge data appended to VERIFIED_EDGES array in edges.js
- [ ] Network visualization test (interactive graph)
- [ ] Documentation updated with new investor profiles

---

## RESEARCH METHODOLOGY

**Scope:** Web-based research of public sources including:
- Company websites and press releases
- PitchBook and Crunchbase profiles
- News articles and business publications
- University press releases and tech transfer offices
- Government databases (SBIR, NASA, NSF)
- Investor websites and portfolio lists
- Industry publications and startup databases

**Verification Strategy:**
- Cross-reference multiple sources for key facts
- Prioritize official company announcements
- Use institutional sources (universities, government) for spinout and grant information
- Note data confidence levels where uncertainty exists

**Gaps & Limitations:**
- Some funding amounts remain confidential (particularly PE investments)
- APG Partners specific dollar amounts not disclosed
- SOSV/GOED funding amounts for AIR Corp not yet public
- Some corporate partnerships may be under NDA

---

## Next Steps for Data Enhancement

1. **Investor Outreach:** Contact investors directly for:
   - Specific investment amounts for confidential rounds
   - Follow-on funding plans
   - Board representation details
   - Strategic value alignment

2. **Company Interviews:** Direct outreach for:
   - University IP licensing details
   - Government contract specifics (SBIR phases, amounts)
   - Customer/partner agreement terms
   - Future fundraising plans

3. **Academic Records:** UNR/UNLV:
   - Tech transfer agreements
   - Licensing terms for spinout technology
   - Research funding from government agencies
   - Faculty involvement timeline

4. **Government Records:**
   - USAspending.gov for SBIR contract details
   - NASA contract databases for AIR Corp work
   - GOED press releases and funding announcements

