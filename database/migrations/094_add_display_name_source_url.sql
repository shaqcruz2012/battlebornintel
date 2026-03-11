-- Migration 094: Add display_name and source_url to stakeholder_activities
-- Resolves: slugs shown instead of formal names in feed, adds clickable source links

-- 1. Add new columns
ALTER TABLE stakeholder_activities
  ADD COLUMN IF NOT EXISTS display_name VARCHAR(120),
  ADD COLUMN IF NOT EXISTS source_url  TEXT;

-- 2. Populate display_name for all unmatched company_ids (not in companies table)
-- These are stakeholders, orgs, funds, and institutions without a companies.slug match.

UPDATE stakeholder_activities SET display_name = 'Nevada SBIR/STTR Program Office'     WHERE company_id = 'nv-sbir-office';
UPDATE stakeholder_activities SET display_name = 'Switch Ventures'                     WHERE company_id = 'switch-ventures';
UPDATE stakeholder_activities SET display_name = 'Desert Research Institute'            WHERE company_id IN ('dri', 'dri-nevada');
UPDATE stakeholder_activities SET display_name = '1864 Capital'                        WHERE company_id = '1864-capital';
UPDATE stakeholder_activities SET display_name = 'AngelNV'                             WHERE company_id IN ('angel-nv', 'angelnv');
UPDATE stakeholder_activities SET display_name = 'Battle Born Ventures'                WHERE company_id IN ('battle-born-ventures', 'bbv');
UPDATE stakeholder_activities SET display_name = 'DCVC (Deep Carbon Venture Capital)'  WHERE company_id = 'dcvc';
UPDATE stakeholder_activities SET display_name = 'Desert Forge Ventures'               WHERE company_id IN ('desert-forge-ventures', 'dfv');
UPDATE stakeholder_activities SET display_name = 'Dot AI'                              WHERE company_id IN ('dot-ai', 'dot-ai--see-id-');
UPDATE stakeholder_activities SET display_name = 'EDAWN'                               WHERE company_id = 'edawn';
UPDATE stakeholder_activities SET display_name = 'FundNV'                              WHERE company_id IN ('fund-nevada', 'fundnv');
UPDATE stakeholder_activities SET display_name = 'Governor''s Office of Economic Development' WHERE company_id IN ('goed', 'goed-nevada', 'goed-nv');
UPDATE stakeholder_activities SET display_name = 'Goldman Sachs Private Strategic Lab'  WHERE company_id = 'goldman-psl';
UPDATE stakeholder_activities SET display_name = 'Henderson Small Business Development' WHERE company_id = 'henderson-small-business-dev';
UPDATE stakeholder_activities SET display_name = 'Intermountain Ventures'              WHERE company_id = 'intermountain-ventures';
UPDATE stakeholder_activities SET display_name = 'JPMorgan Alternatives'               WHERE company_id = 'jpmorgan-alternatives';
UPDATE stakeholder_activities SET display_name = 'Las Vegas Economic Development'      WHERE company_id = 'lv-econ-dev';
UPDATE stakeholder_activities SET display_name = 'MGM Resorts International'           WHERE company_id = 'mgm-resorts';
UPDATE stakeholder_activities SET display_name = 'Nevada Angels'                       WHERE company_id = 'nevada-angels';
UPDATE stakeholder_activities SET display_name = 'Nevada SBDC'                         WHERE company_id = 'nevada-sbdc';
UPDATE stakeholder_activities SET display_name = 'Nevada State University'             WHERE company_id = 'nevada-state';
UPDATE stakeholder_activities SET display_name = 'Governor''s Office'                  WHERE company_id = 'nv-governors-office';
UPDATE stakeholder_activities SET display_name = 'Nevada Legislature'                  WHERE company_id = 'nv-legislature';
UPDATE stakeholder_activities SET display_name = 'Nevada PERS'                         WHERE company_id = 'nv-pers';
UPDATE stakeholder_activities SET display_name = 'State Treasurer''s Office'           WHERE company_id = 'nv-state-treasurer';
UPDATE stakeholder_activities SET display_name = 'PlayStudios'                         WHERE company_id = 'play-studios';
UPDATE stakeholder_activities SET display_name = 'Playa Capital'                       WHERE company_id = 'playa-capital';
UPDATE stakeholder_activities SET display_name = 'Reno Innovation District'            WHERE company_id = 'reno-innovation';
UPDATE stakeholder_activities SET display_name = 'Sierra Angels'                       WHERE company_id IN ('sierra', 'sierra-angels');
UPDATE stakeholder_activities SET display_name = 'Spark Innovation Hub'                WHERE company_id = 'spark-innovation-hub';
UPDATE stakeholder_activities SET display_name = 'StartUpNV'                           WHERE company_id = 'startupnv';
UPDATE stakeholder_activities SET display_name = 'Station Casinos Ventures'            WHERE company_id = 'station-casinos-ventures';
UPDATE stakeholder_activities SET display_name = 'Tesla Gigafactory Nevada'            WHERE company_id = 'tesla-gigafactory-nv';
UPDATE stakeholder_activities SET display_name = 'UNLV'                                WHERE company_id = 'unlv';
UPDATE stakeholder_activities SET display_name = 'UNLV Foundation'                     WHERE company_id = 'unlv-foundation';
UPDATE stakeholder_activities SET display_name = 'UNLV Tech Transfer'                  WHERE company_id = 'unlv-tech-transfer';
UPDATE stakeholder_activities SET display_name = 'University of Nevada, Reno'          WHERE company_id = 'unr';
UPDATE stakeholder_activities SET display_name = 'UNR Tech Transfer'                   WHERE company_id = 'unr-tech-transfer';
UPDATE stakeholder_activities SET display_name = 'Wynn Family Office'                  WHERE company_id = 'wynn-family-office';
UPDATE stakeholder_activities SET display_name = 'Wynn Resorts'                        WHERE company_id = 'wynn-resorts';

-- 3. Extract source_url from existing source column where it contains a URL
UPDATE stakeholder_activities
  SET source_url = source
  WHERE source LIKE 'http%'
    AND source_url IS NULL;

-- 4. Backfill source_url for known organizations
UPDATE stakeholder_activities SET source_url = 'https://nshe.nevada.edu/sbir/'
  WHERE company_id = 'nv-sbir-office' AND source_url IS NULL;

UPDATE stakeholder_activities SET source_url = 'https://goed.nv.gov/'
  WHERE company_id IN ('goed', 'goed-nevada', 'goed-nv') AND source_url IS NULL;

UPDATE stakeholder_activities SET source_url = 'https://www.dri.edu/news/'
  WHERE company_id IN ('dri', 'dri-nevada') AND source_url IS NULL;

UPDATE stakeholder_activities SET source_url = 'https://www.unlv.edu/news/'
  WHERE company_id IN ('unlv', 'unlv-foundation', 'unlv-tech-transfer') AND source_url IS NULL;

UPDATE stakeholder_activities SET source_url = 'https://www.unr.edu/news/'
  WHERE company_id IN ('unr', 'unr-tech-transfer') AND source_url IS NULL;

UPDATE stakeholder_activities SET source_url = 'https://www.angelnv.com/'
  WHERE company_id IN ('angel-nv', 'angelnv') AND source_url IS NULL;

UPDATE stakeholder_activities SET source_url = 'https://www.battlebornventures.com/'
  WHERE company_id IN ('battle-born-ventures', 'bbv') AND source_url IS NULL;

UPDATE stakeholder_activities SET source_url = 'https://www.fundnv.com/'
  WHERE company_id IN ('fund-nevada', 'fundnv') AND source_url IS NULL;

UPDATE stakeholder_activities SET source_url = 'https://www.startupnv.com/'
  WHERE company_id = 'startupnv' AND source_url IS NULL;

UPDATE stakeholder_activities SET source_url = 'https://www.1864capital.com/'
  WHERE company_id = '1864-capital' AND source_url IS NULL;

UPDATE stakeholder_activities SET source_url = 'https://sierraangels.com/'
  WHERE company_id IN ('sierra', 'sierra-angels') AND source_url IS NULL;

UPDATE stakeholder_activities SET source_url = 'https://www.tesla.com/gigafactory'
  WHERE company_id = 'tesla-gigafactory-nv' AND source_url IS NULL;

UPDATE stakeholder_activities SET source_url = 'https://www.mgmresorts.com/'
  WHERE company_id = 'mgm-resorts' AND source_url IS NULL;

UPDATE stakeholder_activities SET source_url = 'https://www.wynnresorts.com/'
  WHERE company_id IN ('wynn-resorts', 'wynn-family-office') AND source_url IS NULL;

UPDATE stakeholder_activities SET source_url = 'https://www.leg.state.nv.us/'
  WHERE company_id = 'nv-legislature' AND source_url IS NULL;

UPDATE stakeholder_activities SET source_url = 'https://gov.nv.gov/'
  WHERE company_id = 'nv-governors-office' AND source_url IS NULL;

UPDATE stakeholder_activities SET source_url = 'https://www.nvpers.org/'
  WHERE company_id = 'nv-pers' AND source_url IS NULL;

UPDATE stakeholder_activities SET source_url = 'https://edawn.org/'
  WHERE company_id = 'edawn' AND source_url IS NULL;

UPDATE stakeholder_activities SET source_url = 'https://www.nsbdc.org/'
  WHERE company_id = 'nevada-sbdc' AND source_url IS NULL;

UPDATE stakeholder_activities SET source_url = 'https://nsu.edu/'
  WHERE company_id = 'nevada-state' AND source_url IS NULL;

UPDATE stakeholder_activities SET source_url = 'https://www.lasvegasnevada.gov/Economic-Development'
  WHERE company_id = 'lv-econ-dev' AND source_url IS NULL;

UPDATE stakeholder_activities SET source_url = 'https://www.cityofhenderson.com/business/economic-development'
  WHERE company_id = 'henderson-small-business-dev' AND source_url IS NULL;

UPDATE stakeholder_activities SET source_url = 'https://www.dcvc.com/'
  WHERE company_id = 'dcvc' AND source_url IS NULL;

UPDATE stakeholder_activities SET source_url = 'https://www.sparkinnohub.com/'
  WHERE company_id = 'spark-innovation-hub' AND source_url IS NULL;

-- 5. Also backfill source_url for timeline_events (add source_url column there too)
ALTER TABLE timeline_events
  ADD COLUMN IF NOT EXISTS source_url TEXT;

-- Verification
SELECT
  'stakeholder_activities' as tbl,
  COUNT(*) FILTER (WHERE display_name IS NOT NULL) as with_display_name,
  COUNT(*) FILTER (WHERE source_url IS NOT NULL) as with_source_url,
  COUNT(*) as total
FROM stakeholder_activities
UNION ALL
SELECT
  'timeline_events',
  0,
  COUNT(*) FILTER (WHERE source_url IS NOT NULL),
  COUNT(*)
FROM timeline_events;
