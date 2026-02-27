/**
 * @typedef {Object} Company
 * @property {number} id
 * @property {string} name
 * @property {"pre_seed"|"seed"|"series_a"|"series_b"|"series_c_plus"|"growth"} stage
 * @property {string[]} sector
 * @property {string} city
 * @property {string} region
 * @property {number} funding - Total raised in $M
 * @property {number} momentum - 0-100 composite score
 * @property {number} employees
 * @property {number} founded - Year
 * @property {string} description
 * @property {string[]} eligible - Fund IDs this company is eligible for
 * @property {number} lat
 * @property {number} lng
 * @property {number} [capacityMW] - Enterprise: generation capacity
 * @property {number} [storageMWh] - Enterprise: storage capacity
 * @property {number} [acreage] - Enterprise: land area
 * @property {string} [developer] - Enterprise: project developer
 * @property {string} [epc] - Enterprise: EPC contractor
 * @property {string} [estimatedCOD] - Enterprise: estimated commercial operation date
 * @property {string[]} [docketIds] - Enterprise: linked docket IDs
 * @property {string[]} [queueIds] - Enterprise: linked queue entry IDs
 * @property {string[]} [ppaIds] - Enterprise: linked PPA IDs
 * @property {KeyMilestone[]} [keyMilestones] - Enterprise: regulatory milestones
 * @property {string[]} [riskFactors] - Enterprise: risk factor tags
 * @property {number} [permittingScore] - Enterprise: 0-100 permitting progress
 */

/**
 * @typedef {Object} Fund
 * @property {string} id
 * @property {string} name
 * @property {string} type
 * @property {number|null} allocated - $M
 * @property {number} deployed - $M
 * @property {number|null} leverage
 * @property {number} companies
 * @property {string} thesis
 */

/**
 * @typedef {Object} TimelineEvent
 * @property {string} date - YYYY-MM-DD
 * @property {"funding"|"partnership"|"hiring"|"launch"|"momentum"|"grant"|"patent"|"award"} type
 * @property {string} company
 * @property {string} detail
 * @property {string} icon
 */

/**
 * @typedef {Object} GraphFund
 * @property {string} id
 * @property {string} name
 * @property {string} type
 */

/**
 * @typedef {Object} Person
 * @property {string} id
 * @property {string} name
 * @property {string} role
 * @property {number|null} companyId
 * @property {string} note
 */

/**
 * @typedef {Object} External
 * @property {string} id
 * @property {string} name
 * @property {string} etype
 * @property {string} note
 */

/**
 * @typedef {Object} Accelerator
 * @property {string} id
 * @property {string} name
 * @property {string} atype
 * @property {string} city
 * @property {string} region
 * @property {number} founded
 * @property {string} note
 */

/**
 * @typedef {Object} EcosystemOrg
 * @property {string} id
 * @property {string} name
 * @property {string} etype
 * @property {string} city
 * @property {string} region
 * @property {string} note
 */

/**
 * @typedef {Object} Listing
 * @property {number} companyId
 * @property {string} exchange
 * @property {string} ticker
 */

/**
 * @typedef {Object} Edge
 * @property {string} source
 * @property {string} target
 * @property {string} rel
 * @property {string} [note]
 * @property {number} [y] - Year
 */

/**
 * @typedef {Object} Docket
 * @property {string} id
 * @property {string} title
 * @property {string} agency - PUCN, BLM, FERC, etc.
 * @property {"open"|"comment_period"|"hearing"|"decided"|"remanded"} status
 * @property {string} openDate - YYYY-MM-DD
 * @property {string} [lastActivity] - YYYY-MM-DD
 * @property {string} [nextDeadline] - YYYY-MM-DD
 * @property {number[]} projects - Company IDs
 * @property {DocketFiling[]} filings
 * @property {string} impact
 * @property {string} [url]
 */

/**
 * @typedef {Object} DocketFiling
 * @property {string} date - YYYY-MM-DD
 * @property {string} filer
 * @property {string} type
 * @property {string} summary
 */

/**
 * @typedef {Object} PPA
 * @property {string} id
 * @property {string} project
 * @property {number} [projectId] - Company ID
 * @property {string} buyer
 * @property {string} technology
 * @property {number} [capacityMW]
 * @property {number} [storageMWh]
 * @property {number|null} [pricePerMWh]
 * @property {number} [termYears]
 * @property {string} [executionDate] - YYYY-MM-DD
 * @property {string} [codDate] - YYYY-MM-DD
 * @property {string} [docketRef]
 * @property {string} [notes]
 */

/**
 * @typedef {Object} QueueEntry
 * @property {string} id
 * @property {number} [projectId] - Company ID
 * @property {string} projectName
 * @property {string} utility
 * @property {number} requestMW
 * @property {string} type - Solar, BESS, Solar+BESS, Wind, etc.
 * @property {string} substation
 * @property {"feasibility_study"|"system_impact"|"facilities_study"|"ia_executed"|"withdrawn"} status
 * @property {string} [applicationDate] - YYYY-MM-DD
 * @property {string} [studyCompleteDate] - YYYY-MM-DD
 * @property {string} [estimatedCOD] - YYYY-MM-DD
 * @property {string} county
 * @property {string} [notes]
 */

/**
 * @typedef {Object} KeyMilestone
 * @property {string} date - YYYY-MM-DD
 * @property {string} event
 * @property {"complete"|"in_progress"|"pending"} status
 */

/**
 * @typedef {Object} DataPackage
 * @property {Company[]} companies
 * @property {Fund[]} funds
 * @property {TimelineEvent[]} timeline
 * @property {GraphFund[]} graphFunds
 * @property {Person[]} people
 * @property {External[]} externals
 * @property {Accelerator[]} accelerators
 * @property {EcosystemOrg[]} ecosystemOrgs
 * @property {Listing[]} listings
 * @property {Edge[]} verifiedEdges
 * @property {Docket[]} [dockets] - Enterprise: regulatory dockets
 * @property {PPA[]} [ppa] - Enterprise: power purchase agreements
 * @property {QueueEntry[]} [queue] - Enterprise: interconnection queue
 * @property {Object} [benchmarks] - Enterprise: stage duration benchmarks
 * @property {Object} [riskMultipliers] - Enterprise: risk multiplier config
 */

/**
 * @typedef {Object} PlatformConfig
 * @property {string} id
 * @property {string} name
 * @property {string} subtitle
 * @property {Object} branding
 * @property {Array<{id:string, label:string, icon:string}>} views
 * @property {Object<string, number>} sectorHeat
 * @property {Array<{id:string, label:string}>} regions
 * @property {Object} features
 */

export default {};
