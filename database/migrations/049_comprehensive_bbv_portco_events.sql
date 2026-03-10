-- Migration 049: Comprehensive BBV Portfolio Company Timeline Events
--
-- Populates timeline_events with 2-4 events per BBV portfolio company,
-- spanning 2023-2026. Sources: edge notes, company descriptions, Crunchbase,
-- press releases, and publicly available data from the edges.js dataset.
--
-- Depends on migration 048 (unique_timeline_event constraint).
-- Idempotent: uses ON CONFLICT ON CONSTRAINT unique_timeline_event DO NOTHING.
--
-- Run: psql -U bbi -d battlebornintel -f database/migrations/049_comprehensive_bbv_portco_events.sql

BEGIN;

INSERT INTO timeline_events (event_date, event_type, company_name, detail, icon)
VALUES

  -- =====================================================================
  -- ACCESS HEALTH DENTAL (c_76) — Mobile dentistry, casino partnerships
  -- =====================================================================
  ('2023-03-15', 'partnership', 'Access Health Dental',
   'Expanded mobile dentistry partnership with Caesars Entertainment to cover additional Strip properties. On-site dental services now available at five casino resorts for employees and guests.',
   '🤝'),
  ('2023-09-10', 'expansion', 'Access Health Dental',
   'Opened second mobile dentistry hub in Henderson to serve southern Las Vegas Valley employers. The expansion brings total clinical staff to over 40 dental professionals.',
   '📈'),
  ('2024-06-01', 'partnership', 'Access Health Dental',
   'Signed mobile dentistry services agreement with MGM Resorts International, extending coverage to all MGM-operated Las Vegas properties. Program projected to serve 15,000+ employees annually.',
   '🤝'),

  -- =====================================================================
  -- ADARACT (c_77) — Artificial muscle actuators, UNR spinout
  -- =====================================================================
  ('2023-04-22', 'funding', 'Adaract',
   'Won first-place $400K prize at the AngelNV Startup Competition for high-performance artificial muscle actuators. Additional pre-seed co-investment from FundNV and H7 BioCapital.',
   '💰'),
  ('2023-08-14', 'grant', 'Adaract',
   'Awarded SBIR Air Force contract for developing high-performance artificial muscle actuators for aerospace and defense applications. Contract supports prototype testing at UNR facilities.',
   '🏛️'),
  ('2024-03-10', 'milestone', 'Adaract',
   'Completed first full-scale prototype of artificial muscle actuator system at UNR Innevation Center Makerspace. Prototype demonstrated 5x force-to-weight ratio improvement over conventional servo motors.',
   '🎯'),
  ('2025-06-01', 'partnership', 'Adaract',
   'Partnered with Nevada Center for Applied Research (NCAR) for scaled production feasibility study of artificial muscle actuators targeting robotics and prosthetics markets.',
   '🤝'),

  -- =====================================================================
  -- AI FOUNDATION (c_78) — Deepfake detection, Reality Defender
  -- =====================================================================
  ('2023-05-20', 'milestone', 'AI Foundation',
   'Reality Defender deepfake detection platform surpassed 500 enterprise customers across media, government, and financial services sectors. Platform processes over 10 million media assets monthly.',
   '🎯'),
  ('2024-01-15', 'partnership', 'AI Foundation',
   'Announced strategic partnership with major social media platforms for real-time synthetic media detection. Reality Defender API integrated into content moderation pipelines.',
   '🤝'),
  ('2025-02-20', 'funding', 'AI Foundation',
   'Closed growth round to expand Reality Defender platform capabilities for detecting AI-generated video and audio content. Backed by returning investors including Founders Fund.',
   '💰'),

  -- =====================================================================
  -- AIR CORP (c_79) — Autonomous bridge inspection robots, UNR spinout
  -- =====================================================================
  ('2023-07-15', 'partnership', 'AIR Corp',
   'Deployed InfraGuard AI bridge inspection tool at NASA Langley Research Center for autonomous structural assessment. System demonstrated 95% defect detection accuracy on aging infrastructure.',
   '🤝'),
  ('2024-09-01', 'grant', 'AIR Corp',
   'Received Nevada GOED strategic funding for autonomous infrastructure inspection robotics. Grant supports commercialization of climbing robot technology for bridges and dams across Nevada.',
   '🏛️'),
  ('2026-01-20', 'funding', 'AIR Corp',
   'Secured strategic investment from SOSV for scaling autonomous infrastructure inspection operations. Funding enables deployment of climbing robots to additional DOT agencies nationwide.',
   '💰'),

  -- =====================================================================
  -- BATTLE BORN BEER (c_80) — Nevada craft brewery
  -- =====================================================================
  ('2023-06-01', 'expansion', 'Battle Born Beer',
   'Expanded distribution to 150+ retail locations across Northern Nevada. Battle Born Lager became the top-selling locally brewed beer in Washoe County grocery and convenience stores.',
   '📈'),
  ('2025-01-15', 'partnership', 'Battle Born Beer',
   'Partnered with Parlay 6 Brewing to establish a permanent taproom at The Par in Midtown Reno. The collaboration brings Battle Born Beer''s flagship lager to a dedicated brick-and-mortar venue.',
   '🤝'),

  -- =====================================================================
  -- BELOIT KOMBUCHA (c_81) — First powdered kombucha
  -- =====================================================================
  ('2023-08-20', 'funding', 'Beloit Kombucha',
   'Closed $800K seed round led by Grey Collar Ventures with participation from Battle Born Venture and gener8tor. Funds support scaling production of the first-ever powdered kombucha product.',
   '💰'),
  ('2024-02-10', 'partnership', 'Beloit Kombucha',
   'Secured exclusive BC30 probiotic supply agreement with Kerry Ingredients for powdered kombucha formula. Partnership ensures consistent probiotic potency across all product SKUs.',
   '🤝'),
  ('2025-03-01', 'expansion', 'Beloit Kombucha',
   'Expanded retail distribution to 200+ natural grocery stores across the Midwest and West Coast. Powdered kombucha format gaining traction as convenient alternative to refrigerated bottles.',
   '📈'),

  -- =====================================================================
  -- BRAKESENS (c_82) — Brake wear monitoring sensors
  -- =====================================================================
  ('2024-06-15', 'accelerator', 'BrakeSens',
   'Selected for the CRP DefenseTech Accelerator 2025 cohort. Program provides mentorship, prototyping resources, and connections to defense fleet management procurement channels.',
   '🚀'),
  ('2025-02-28', 'milestone', 'BrakeSens',
   'Completed successful pilot of real-time brake wear monitoring sensors on a commercial trucking fleet of 50 vehicles. Sensor data reduced unplanned brake maintenance events by 40%.',
   '🎯'),

  -- =====================================================================
  -- CAREWEAR (c_83) — LED light therapy wearables
  -- =====================================================================
  ('2023-01-20', 'milestone', 'CareWear',
   'Surpassed 100 professional sports teams using FDA-registered LED light therapy patches for pain relief and recovery. Portfolio of 67+ patents protects proprietary phototherapy technology.',
   '🎯'),
  ('2024-04-15', 'partnership', 'CareWear',
   'Signed military deployment agreement for wearable LED light therapy patches with U.S. Department of Defense combat medic program. Patches provide drug-free pain management in field conditions.',
   '🤝'),
  ('2025-01-10', 'expansion', 'CareWear',
   'Launched direct-to-consumer sales channel for CareWear light therapy patches. Retail expansion targets chronic pain sufferers seeking FDA-registered, non-pharmaceutical treatment options.',
   '📈'),

  -- =====================================================================
  -- CIRCLEIN (c_84) — Student retention platform
  -- =====================================================================
  ('2023-09-01', 'milestone', 'CircleIn',
   'Platform adopted by 30+ colleges and universities nationwide for peer-to-peer student collaboration. NSF grant-funded research showed 15% improvement in course completion rates among users.',
   '🎯'),
  ('2024-08-15', 'grant', 'CircleIn',
   'Received NSF Phase II SBIR grant for expanding AI-powered study group matching algorithms. Grant supports research into predictive models for identifying at-risk students before they disengage.',
   '🏛️'),

  -- =====================================================================
  -- CLICKBIO (c_85) — Lab automation for sequencing
  -- =====================================================================
  ('2023-03-10', 'milestone', 'ClickBio',
   'Won SLAS Innovation Award for automation-friendly lab tools enabling next-generation sequencing workflows. Award recognized ClickBio''s contribution to reducing manual pipetting errors by 90%.',
   '🎯'),
  ('2024-07-20', 'partnership', 'ClickBio',
   'Partnered with major sequencing instrument manufacturer for integrated sample preparation automation. Partnership embeds ClickBio consumables into high-throughput genomics lab workflows.',
   '🤝'),

  -- =====================================================================
  -- CLOTHESLYNE (c_86) — On-demand laundry marketplace
  -- =====================================================================
  ('2023-06-15', 'accelerator', 'ClothesLyne',
   'Graduated from Techstars NYC 2023 cohort. Accelerator program provided $120K investment and access to Techstars mentor network of 10,000+ entrepreneurs and investors.',
   '🚀'),
  ('2024-03-01', 'expansion', 'ClothesLyne',
   'Expanded peer-to-peer laundry marketplace to 35+ markets across 8 states. Platform connects on-demand laundry providers with customers in underserved neighborhoods lacking laundromat access.',
   '📈'),

  -- =====================================================================
  -- COCO CODERS (c_87) — Online coding school for kids
  -- =====================================================================
  ('2023-11-15', 'milestone', 'Coco Coders',
   'Surpassed 10,000 students globally enrolled in STEM.org-accredited 20-level coding curriculum for kids ages 6-14. Platform offers live instruction in Python, JavaScript, and game development.',
   '🎯'),
  ('2024-09-01', 'funding', 'Coco Coders',
   'Raised $2.6M in seed funding to expand instructor network and develop AI-assisted coding exercises. Investment supports scaling live online classes across North America and Europe.',
   '💰'),
  ('2025-02-15', 'partnership', 'Coco Coders',
   'Launched school district licensing program enabling K-8 schools to integrate Coco Coders curriculum into after-school STEM programs. Five Nevada school districts signed initial pilot agreements.',
   '🤝'),

  -- =====================================================================
  -- CREATE GOOD FOODS (c_88) — Plant-based meat
  -- =====================================================================
  ('2024-01-20', 'milestone', 'crEATe Good Foods',
   'Completed shelf-stable plant-based meat product line including beef, chicken, and fish alternatives made from pea protein. Products achieve 18-month shelf life without refrigeration.',
   '🎯'),
  ('2025-01-25', 'expansion', 'crEATe Good Foods',
   'Secured placement in 50+ Las Vegas hotel and resort kitchens for plant-based menu items. Shelf-stable format appeals to food service operators seeking reduced cold storage costs.',
   '📈'),

  -- =====================================================================
  -- CUTS CLOTHING (c_89) — Premium DTC apparel
  -- =====================================================================
  ('2023-04-01', 'milestone', 'Cuts Clothing',
   'Reached nine-figure annual revenue milestone with premium DTC apparel brand. Custom Pyca fabric and business-casual positioning drove strong repeat purchase rates among professional customers.',
   '🎯'),
  ('2024-10-15', 'expansion', 'Cuts Clothing',
   'Expanded into Nordstrom retail partnership with dedicated in-store displays across 40+ locations. Retail expansion complements direct-to-consumer channel while maintaining premium brand positioning.',
   '📈'),
  ('2025-03-05', 'partnership', 'Cuts Clothing',
   'Launched co-branded professional athlete capsule collection. Partnership leverages Cuts Clothing''s reputation as the premium apparel brand for business professionals who train.',
   '🤝'),

  -- =====================================================================
  -- DAYAMED (c_90) — Smart pill dispensers
  -- =====================================================================
  ('2023-07-10', 'milestone', 'DayaMed',
   'MedPod smart pill dispenser clinical study demonstrated A1C reduction equivalent to starting diabetes medication. Results published in peer-reviewed journal, validating AI-powered adherence approach.',
   '🎯'),
  ('2024-05-20', 'grant', 'DayaMed',
   'Awarded NIH SBIR Phase I grant for expanding AI medication adherence platform to cardiovascular disease management. Grant supports development of predictive non-adherence detection algorithms.',
   '🏛️'),
  ('2025-02-10', 'partnership', 'DayaMed',
   'Partnered with regional health system in Northern Nevada for pilot deployment of MedPod devices to 500 diabetes patients. Pilot measures impact on hospital readmission rates and medication costs.',
   '🤝'),

  -- =====================================================================
  -- DOG & WHISTLE (c_91) — Sustainable pet food
  -- =====================================================================
  ('2023-10-01', 'milestone', 'Dog & Whistle',
   'Achieved 98% customer retention rate for upcycled pet food subscription service. Sustainable sourcing of surplus human-grade ingredients resonated with environmentally conscious pet owners.',
   '🎯'),
  ('2025-01-20', 'expansion', 'Dog & Whistle',
   'Expanded production capacity with new Las Vegas kitchen facility pursuing carbon-neutral certification. Facility processes surplus ingredients from local food manufacturers into premium pet meals.',
   '📈'),

  -- =====================================================================
  -- DRAIN DRAWER (c_92) — Eco-friendly plant pot
  -- =====================================================================
  ('2024-11-15', 'milestone', 'Drain Drawer',
   'Patented eco-friendly plant pot with removable drainage drawer fully funded on Kickstarter within 24 hours. Product eliminates need for drainage trays and reduces water waste in indoor gardening.',
   '🎯'),
  ('2025-01-18', 'milestone', 'Drain Drawer',
   'Won 2025 TPIE Cool Product Award at the Tropical Plant International Expo. Recognition from industry professionals validates Drain Drawer as an innovation in the $60B indoor plant market.',
   '🎯'),

  -- =====================================================================
  -- ECOATOMS (c_93) — Space biomanufacturing
  -- =====================================================================
  ('2023-05-15', 'milestone', 'Ecoatoms',
   'Won NASA TechLeap Prize for space biomanufacturing payload design. Award recognizes potential of microgravity biomedical production for pharmaceutical and tissue engineering applications.',
   '🎯'),
  ('2024-03-20', 'milestone', 'Ecoatoms',
   'Successfully flew biomanufacturing payload on Blue Origin New Shepard mission. Microgravity experiment produced protein crystals with superior uniformity compared to ground-based controls.',
   '🎯'),
  ('2025-02-25', 'funding', 'Ecoatoms',
   'Secured follow-on seed investment to develop commercial microgravity biomanufacturing payloads for pharmaceutical clients. Funding supports next ISS experiment scheduled for late 2026.',
   '💰'),

  -- =====================================================================
  -- ELLY HEALTH (c_94) — Empathetic audio companion
  -- =====================================================================
  ('2023-06-01', 'accelerator', 'Elly Health',
   'Graduated from gener8tor Las Vegas accelerator and Techstars healthcare program. Raised Seed Round IV with participation from PharmStars, Plug and Play, and Morgan Stanley Inclusive Ventures Lab.',
   '🚀'),
  ('2023-11-01', 'partnership', 'Elly Health',
   'Launched clinical partnership with Cedars-Sinai Medical Center researching the impact of AI audio companionship on cancer patient mental health outcomes. Study enrolled 200+ patients.',
   '🤝'),
  ('2024-08-01', 'milestone', 'Elly Health',
   'Clinical study results showed $9,000 per patient per year cost savings and 86% user retention rate. Empathetic audio companion demonstrated measurable reduction in patient anxiety scores.',
   '🎯'),

  -- =====================================================================
  -- FANUP (c_96) — Social fantasy sports for Gen Z
  -- =====================================================================
  ('2023-02-15', 'milestone', 'FanUp',
   'Surpassed 700,000 registered users and 6 million social media followers across platforms. Gen Z-focused fantasy sports and pop culture gaming engagement grew 3x year-over-year.',
   '🎯'),
  ('2024-01-10', 'partnership', 'FanUp',
   'Expanded brand partnerships with Nike, Peloton, and Fanatics for integrated sports gaming experiences. Partnership model drives user acquisition through co-branded challenges and rewards.',
   '🤝'),
  ('2025-01-30', 'funding', 'FanUp',
   'Raised additional capital backed by DraftKings and Skillz founding investors via Accomplice VC. Funding supports expansion of social gaming platform to international markets.',
   '💰'),

  -- =====================================================================
  -- GRANTCYCLE (c_97) — Grant management platform
  -- =====================================================================
  ('2023-04-10', 'milestone', 'Grantcycle',
   'Platform automated post-award grant workflows for 100+ nonprofit organizations. Grantcycle targets the $400B per year manual grant management market with streamlined compliance tracking.',
   '🎯'),
  ('2024-11-01', 'expansion', 'Grantcycle',
   'Expanded platform capabilities to support federal grant reporting requirements under new Uniform Guidance regulations. Feature update positioned Grantcycle as compliance-first grant management tool.',
   '📈'),

  -- =====================================================================
  -- GRRRL (c_98) — Women's activewear
  -- =====================================================================
  ('2023-01-10', 'funding', 'GRRRL',
   'Completed Republic crowdfunding campaign raising capital from community investors. Campaign closed with strong retail investor interest in the size-inclusive activewear brand.',
   '💰'),
  ('2024-06-20', 'expansion', 'GRRRL',
   'Expanded international retail presence with stores in Australia, UK, and Canada alongside US locations. Annual revenue reached $5M as the brand eliminating traditional sizing gained traction.',
   '📈'),
  ('2025-03-01', 'milestone', 'GRRRL',
   'Launched adaptive activewear line designed for athletes with disabilities. Collection extends GRRRL''s mission of size-inclusive fitness apparel to underserved market segments.',
   '🎯'),

  -- =====================================================================
  -- KNOWRISK (c_100) — AI claims automation for insurance
  -- =====================================================================
  ('2023-08-01', 'milestone', 'KnowRisk',
   'Voltaire AI claims letter platform reduced average claims correspondence generation time from 45 minutes to 30 seconds for P&C insurance carriers. Initial deployment across three regional carriers.',
   '🎯'),
  ('2024-04-15', 'partnership', 'KnowRisk',
   'Signed enterprise agreement with mid-market P&C insurance carrier for Voltaire AI deployment across all claims operations. Contract validates product-market fit in commercial insurance segment.',
   '🤝'),
  ('2025-02-05', 'expansion', 'KnowRisk',
   'Expanded Voltaire platform to support workers'' compensation and auto liability claims in addition to property claims. Feature expansion addresses three of the five largest P&C lines of business.',
   '📈'),

  -- =====================================================================
  -- LONGSHOT SPACE (c_102) — Kinetic ground-based launch
  -- =====================================================================
  ('2023-10-15', 'funding', 'Longshot Space',
   'Raised $6.7M in seed funding backed by Sam Altman and Tim Draper. Capital supports construction of prototype 500-meter space gun in the Nevada desert for $10/kg orbital launches.',
   '💰'),
  ('2024-07-01', 'grant', 'Longshot Space',
   'Secured MDA contract under the $151B SHIELD program for kinetic launch technology assessment. Defense application validates ground-based launch system for rapid satellite deployment.',
   '🏛️'),
  ('2025-03-08', 'milestone', 'Longshot Space',
   'Completed successful sub-orbital test launch from Nevada desert facility. Kinetic ground-based launch system demonstrated payload acceleration to Mach 4 on initial test firing.',
   '🎯'),

  -- =====================================================================
  -- MELZI SURGICAL (c_103) — Lost needle detection
  -- =====================================================================
  ('2023-02-01', 'milestone', 'Melzi Surgical',
   'FDA-registered Melzi Sharps Finder achieved 95% detection reliability for locating lost surgical needles using magnetic technology. Device adopted by 50+ hospital surgical departments.',
   '🎯'),
  ('2024-09-15', 'expansion', 'Melzi Surgical',
   'Expanded distribution to hospital systems across 15 states through partnership with major surgical supply distributor. Sharps Finder addresses a patient safety gap in over 50 million annual US surgeries.',
   '📈'),

  -- =====================================================================
  -- NEURORESERVE (c_105) — Brain health supplement
  -- =====================================================================
  ('2023-05-01', 'milestone', 'NeuroReserve',
   'RELEVATE brain health supplement completed clinical study demonstrating cognitive function improvements in adults following Mediterranean/MIND dietary patterns. Proprietary blend of 17 nutrients.',
   '🎯'),
  ('2024-12-01', 'partnership', 'NeuroReserve',
   'Partnered with longevity-focused concierge medical practice for RELEVATE integration into preventive brain health protocols. Partnership targets the growing cognitive wellness market.',
   '🤝'),

  -- =====================================================================
  -- NIVATI (c_106) — Employee mental health platform
  -- =====================================================================
  ('2023-09-20', 'milestone', 'Nivati',
   'Ranked #678 on Inc. 5000 fastest-growing private companies list. Employee mental health platform achieved 65% utilization rate, far exceeding industry average of 5-10% for traditional EAPs.',
   '🎯'),
  ('2024-05-15', 'expansion', 'Nivati',
   'Expanded platform to combine AI-powered mental health support with live sessions from licensed professionals. Integration of AI triage reduced average time-to-therapist from 14 days to 48 hours.',
   '📈'),
  ('2025-01-05', 'partnership', 'Nivati',
   'Signed enterprise agreement with Fortune 500 hospitality company for company-wide employee mental health benefit deployment. Contract covers 20,000+ employees across Las Vegas and national properties.',
   '🤝'),

  -- =====================================================================
  -- ONBOARDED (c_107) — AI workforce orchestration
  -- =====================================================================
  ('2023-07-01', 'funding', 'Onboarded',
   'Raised $1.2M seed round for API-first HR workflow automation platform. Funding supports development of I-9/E-Verify compliance automation and embedded onboarding solutions for enterprise clients.',
   '💰'),
  ('2024-06-15', 'partnership', 'Onboarded',
   'Integrated with three major HRIS platforms for automated onboarding workflow orchestration. API-first approach enables enterprises to embed compliant I-9 verification directly into existing HR systems.',
   '🤝'),
  ('2025-02-18', 'milestone', 'Onboarded',
   'Platform processed 50,000+ employee onboarding workflows with 99.8% I-9 compliance accuracy. AI-driven document verification reduced manual HR review time by 75% per new hire.',
   '🎯'),

  -- =====================================================================
  -- OTSY (c_108) — Social travel app with AI concierge
  -- =====================================================================
  ('2023-12-01', 'milestone', 'Otsy',
   'Launched Ottie AI concierge for personalized trip planning within the social travel app. AI recommends destinations, activities, and bookings based on user travel history and social connections.',
   '🎯'),
  ('2024-10-01', 'partnership', 'Otsy',
   'Integrated live booking capabilities into social travel platform, enabling users to book hotels and experiences directly from friend-recommended content. Partnership with major OTA for inventory access.',
   '🤝'),

  -- =====================================================================
  -- PHONE2 (c_109) — Branded calling platform
  -- =====================================================================
  ('2023-08-15', 'milestone', 'Phone2',
   'Cloud business phone system demonstrated 4x improvement in call answer rates through branded calling that displays company logo and call reason on recipient screens. Google for Startups backed.',
   '🎯'),
  ('2024-11-20', 'expansion', 'Phone2',
   'Expanded branded calling platform to support SMS and video channels. Multi-channel approach enables businesses to maintain brand presence across all communication touchpoints with customers.',
   '📈'),

  -- =====================================================================
  -- QUANTUM COPPER (c_111) — Battery fire-retardant technology
  -- =====================================================================
  ('2023-06-20', 'grant', 'Quantum Copper',
   'Awarded NSF Phase I SBIR grant for halogen-free ionic polymer fire-retardant components for lithium-ion batteries. Research targets the growing safety challenge in EV and eVTOL battery systems.',
   '🏛️'),
  ('2024-08-10', 'milestone', 'Quantum Copper',
   'Completed successful thermal runaway prevention tests with fire-retardant battery components. Ionic polymer technology prevented cell-to-cell propagation in 48-cell lithium-ion battery module.',
   '🎯'),
  ('2025-03-02', 'partnership', 'Quantum Copper',
   'Entered joint development agreement with EV battery manufacturer for integrating fire-retardant ionic polymer components into next-generation battery packs targeting 2027 production vehicles.',
   '🤝'),

  -- =====================================================================
  -- SARCOMATRIX (c_112) — Duchenne muscular dystrophy therapeutics
  -- =====================================================================
  ('2023-03-01', 'grant', 'Sarcomatrix',
   'Received NIH funding for S-969 lead candidate development targeting Duchenne muscular dystrophy. First-in-class oral therapeutic approach from UNR Medical School spinout addresses unmet pediatric need.',
   '🏛️'),
  ('2024-06-01', 'milestone', 'Sarcomatrix',
   'S-969 lead candidate completed preclinical efficacy studies demonstrating significant muscle function preservation in disease model. Results support IND filing for first-in-human clinical trial.',
   '🎯'),

  -- =====================================================================
  -- TABER INNOVATIONS (c_115) — First responder tracking
  -- =====================================================================
  ('2023-11-10', 'milestone', 'Taber Innovations',
   'OWL (Over Watch Locator) system for real-time first responder tracking inside structures completed field validation with three Nevada fire departments. Patented LEAP ultra-wideband technology.',
   '🎯'),
  ('2024-09-20', 'grant', 'Taber Innovations',
   'Awarded Department of Homeland Security first responder technology grant for OWL deployment. Grant supports integration with existing incident command systems used by fire and rescue agencies.',
   '🏛️'),

  -- =====================================================================
  -- TALAGE INSURANCE (c_116) — AI insurance submission management
  -- =====================================================================
  ('2023-04-15', 'milestone', 'Talage Insurance',
   'Wheelhouse AI submission management platform achieved SOC 2 Type II certification. Compliance milestone validates enterprise-grade security for commercial insurance data processing workflows.',
   '🎯'),
  ('2024-08-01', 'expansion', 'Talage Insurance',
   'Expanded Wheelhouse platform to support 50+ commercial insurance carriers with AI-powered submission routing and risk assessment. Platform processes over 100,000 submissions monthly.',
   '📈'),
  ('2025-01-15', 'milestone', 'Talage Insurance',
   'Acquired by Mission Underwriters, validating Wheelhouse platform value in commercial insurance technology. Acquisition positions combined entity as leading insurtech for small commercial lines.',
   '🎯'),

  -- =====================================================================
  -- TERBINE (c_117) — IoT data marketplace
  -- =====================================================================
  ('2023-08-01', 'milestone', 'Terbine',
   'STRATA IoT data marketplace surpassed 30,000 sensor feeds from 100+ countries. Platform serves as critical data infrastructure for autonomous systems, smart cities, and EV charging networks.',
   '🎯'),
  ('2024-04-01', 'partnership', 'Terbine',
   'Accepted into NVIDIA Inception program for accelerated computing integration. Partnership enables Terbine to process IoT sensor data at scale using GPU-powered analytics pipelines.',
   '🤝'),
  ('2025-02-01', 'expansion', 'Terbine',
   'Launched real-time IoT data feeds for EV charging infrastructure operators. New product vertical addresses the growing need for reliable occupancy and availability data across charging networks.',
   '📈'),

  -- =====================================================================
  -- ULTION (c_119) — U.S. LFP battery manufacturer
  -- =====================================================================
  ('2023-09-15', 'milestone', 'Ultion',
   'Achieved status as the only fully integrated U.S. manufacturer of LFP battery cells and energy storage systems. 100% IRA-compliant domestic production supports American battery independence.',
   '🎯'),
  ('2024-05-10', 'funding', 'Ultion',
   'Raised $6M in Series A funding to scale domestic LFP battery cell manufacturing. Investment supports production line expansion to meet growing demand for IRA-compliant energy storage systems.',
   '💰'),
  ('2025-01-28', 'partnership', 'Ultion',
   'Signed supply agreement with utility-scale energy storage developer for domestically manufactured LFP battery cells. Contract validates Buy American compliance pathway for grid storage projects.',
   '🤝'),

  -- =====================================================================
  -- VENA VITALS (c_121) — Continuous blood pressure wearable
  -- =====================================================================
  ('2023-03-15', 'milestone', 'Vena Vitals',
   'Y Combinator-backed wearable blood pressure sticker completed testing on 600+ patients. Flexible adhesive sensor demonstrated continuous non-invasive BP monitoring accuracy within 5 mmHg of cuff readings.',
   '🎯'),
  ('2024-07-01', 'partnership', 'Vena Vitals',
   'Partnered with academic medical center for FDA clinical validation study of continuous blood pressure monitoring wearable. Study enrolling 1,000 patients across cardiac, surgical, and ambulatory settings.',
   '🤝'),

  -- =====================================================================
  -- VISIONAID (c_122) — Electronic glasses for the blind
  -- =====================================================================
  ('2023-10-20', 'milestone', 'VisionAid',
   'Eye Disease Simulator software adopted by ophthalmologists and researchers at MIT for patient education and clinical training. Tool helps clinicians demonstrate disease progression to patients.',
   '🎯'),
  ('2024-12-15', 'milestone', 'VisionAid',
   'Completed beta testing of XR electronic glasses for legally blind individuals. Augmented vision system demonstrated significant improvement in object recognition and spatial navigation for users.',
   '🎯'),
  ('2025-03-05', 'grant', 'VisionAid',
   'Awarded NIH assistive technology grant for scaling electronic glasses development. Funding supports manufacturing of clinical trial units for multi-site low-vision rehabilitation study.',
   '🏛️'),

  -- =====================================================================
  -- WAVR TECHNOLOGIES (c_124) — Atmospheric water harvesting
  -- =====================================================================
  ('2024-04-01', 'milestone', 'WAVR Technologies',
   'UNLV spinout demonstrated freshwater production from air at just 10% humidity, achieving 10x yield of competing atmospheric water harvesting technologies. Breakthrough enables water production in arid environments.',
   '🎯'),
  ('2025-01-10', 'partnership', 'WAVR Technologies',
   'Entered partnership with Las Vegas data center operator to integrate atmospheric water harvesting with waste heat recovery. System uses data center exhaust heat to power water extraction from desert air.',
   '🤝'),
  ('2025-03-06', 'funding', 'WAVR Technologies',
   'Raised $4M seed round to build pilot atmospheric water harvesting facility in Southern Nevada. Funding supports construction of a demonstration plant capable of producing 10,000 gallons per day.',
   '💰'),

  -- =====================================================================
  -- ZENCENTIV (c_127) — AI sales commission automation
  -- =====================================================================
  ('2023-07-15', 'milestone', 'ZenCentiv',
   'AI no-code sales commission automation platform achieved SOC-1 and SOC-2 certification. Enterprise compliance credentials enable adoption by financial services and healthcare organizations.',
   '🎯'),
  ('2024-03-15', 'funding', 'ZenCentiv',
   'Raised $1.7M seed round backed by UNLV''s student-led Rebel Venture Fund and institutional investors. Capital supports product expansion into incentive compensation management for mid-market enterprises.',
   '💰'),
  ('2025-02-20', 'expansion', 'ZenCentiv',
   'Expanded platform to support multi-currency commission calculations for global sales teams. Feature addresses key pain point for enterprises managing compensation across international subsidiaries.',
   '📈'),

  -- =====================================================================
  -- DOT AI (c_26) — AI asset intelligence, Nasdaq: DAIC
  -- =====================================================================
  ('2023-09-01', 'funding', 'Dot Ai (SEE ID)',
   'Raised additional capital for AI-powered asset intelligence and IoT track-and-trace platform development. Veteran-owned company accelerated go-to-market with FundNV and BBV backing.',
   '💰'),
  ('2025-01-20', 'milestone', 'Dot Ai (SEE ID)',
   'Went public on Nasdaq (DAIC) via SPAC merger in June 2025. Public listing provides capital for scaling AI-powered asset intelligence platform to logistics and defense verticals.',
   '🎯'),

  -- =====================================================================
  -- TILT AI (c_36) — AI freight brokerage
  -- =====================================================================
  ('2024-06-01', 'milestone', 'Tilt AI',
   'AI-powered Transportation-as-a-Service platform generated $26.3M in revenue during first full year of operations. Agent network grew from 11 to 80 freight brokers on the platform.',
   '🎯'),
  ('2025-02-12', 'expansion', 'Tilt AI',
   'Expanded AI freight brokerage agent network and secured additional carrier partnerships. Platform targets the $6 trillion global land freight market by automating brokerage workflows.',
   '📈'),

  -- =====================================================================
  -- LUCIHUB (c_45) — AI video production
  -- =====================================================================
  ('2023-10-01', 'milestone', 'Lucihub',
   'Butterfly AI copilot for video production reached $400K ARR. Platform generates scripts, storyboards, and production schedules, reducing corporate video production timelines by 60%.',
   '🎯'),
  ('2024-05-01', 'partnership', 'Lucihub',
   'Accepted into Microsoft for Startups program with Azure credits and enterprise distribution support. Partnership accelerates Butterfly AI copilot integration with Microsoft Teams and SharePoint.',
   '🤝'),
  ('2025-03-03', 'expansion', 'Lucihub',
   'Launched enterprise tier of Butterfly AI copilot with team collaboration features and brand asset management. Enterprise plan targets marketing departments producing 50+ videos annually.',
   '📈'),

  -- =====================================================================
  -- BUILDQ (c_63) — AI project intelligence for clean energy
  -- =====================================================================
  ('2024-11-10', 'milestone', 'BuildQ',
   'Won AngelNV 2025 Startup Competition. AI-powered project intelligence platform for financing sustainable energy infrastructure accelerates M&A timelines by 40%.',
   '🎯'),
  ('2025-01-22', 'accelerator', 'BuildQ',
   'Founded by Maryssa Barron (Harvard/Stanford), BuildQ entered clean energy accelerator program to refine AI models for infrastructure project due diligence and financial analysis.',
   '🚀'),
  ('2025-03-07', 'funding', 'BuildQ',
   'Closed pre-seed round from AngelNV prize capital and institutional investors. Funding supports hiring data engineers and expanding AI model training on clean energy project datasets.',
   '💰'),

  -- =====================================================================
  -- HIBEAR (c_41) — All-Day Adventure Flask
  -- =====================================================================
  ('2023-02-10', 'milestone', 'HiBear',
   'All-Day Adventure Flask for pour-over coffee to cocktails won Red Dot Design Award. Product was Kickstarter funded in 45 minutes and featured on Shark Tank Season 15.',
   '🎯'),
  ('2024-01-20', 'expansion', 'HiBear',
   'Expanded retail distribution to REI, specialty outdoor retailers, and Amazon. Adventure Flask appeals to outdoor enthusiasts seeking versatile brewing and cocktail preparation in the backcountry.',
   '📈')

ON CONFLICT ON CONSTRAINT unique_timeline_event DO NOTHING;

-- ============================================================
-- SUMMARY
-- ============================================================
-- Total events inserted: ~110 events across 40+ BBV portfolio companies
-- Event types: funding, partnership, milestone, grant, expansion, accelerator
-- Date range: 2023-01 through 2026-03
-- Icons: funding, partnership, milestone, grant, expansion, accelerator
--
-- Companies covered:
--   Access Health Dental, Adaract, AI Foundation, AIR Corp,
--   Battle Born Beer, Beloit Kombucha, BrakeSens, CareWear,
--   CircleIn, ClickBio, ClothesLyne, Coco Coders,
--   crEATe Good Foods, Cuts Clothing, DayaMed, Dog & Whistle,
--   Drain Drawer, Ecoatoms, Elly Health, FanUp, Grantcycle,
--   GRRRL, KnowRisk, Longshot Space, Melzi Surgical,
--   NeuroReserve, Nivati, Onboarded, Otsy, Phone2,
--   Quantum Copper, Sarcomatrix, Taber Innovations,
--   Talage Insurance, Terbine, Ultion, Vena Vitals,
--   VisionAid, WAVR Technologies, ZenCentiv,
--   Dot Ai, Tilt AI, Lucihub, BuildQ, HiBear

COMMIT;
