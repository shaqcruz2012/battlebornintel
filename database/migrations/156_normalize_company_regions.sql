-- Migration 156: Normalize company region values
--
-- Audit found 3 Henderson-city companies incorrectly assigned region='las_vegas'.
-- The frontend Header filter and api/src/utils/regionMapping.js expect:
--   las_vegas  -> Las Vegas metro (las_vegas, las_vegas_metro, north_las_vegas, summerlin, boulder_city)
--   reno       -> Reno-Sparks metro (reno, sparks, washoe, northern_nevada, carson_city, tahoe, elko)
--   henderson  -> Henderson
--
-- Companies with city='Henderson' should have region='henderson' so they appear
-- under the Henderson filter. Currently 3 are mis-tagged as 'las_vegas':
--   id=130  P-1 AI            (city=Henderson, was las_vegas)
--   slug=c_neonshield         NeonShield Cyber  (city=Henderson, was las_vegas)
--   slug=c_desertsentinel     DesertSentinel    (city=Henderson, was las_vegas)
--
-- Also adds a safety catch-all: any company with city='Henderson' and
-- region != 'henderson' gets corrected.
--
-- Idempotent: uses WHERE guards so re-running is safe.

BEGIN;

-- Fix all Henderson-city companies that have the wrong region
UPDATE companies
SET    region = 'henderson'
WHERE  city = 'Henderson'
  AND  region <> 'henderson';

-- Safety net: any future companies with NULL or empty region default to las_vegas
-- (the region column is NOT NULL, but guard against empty strings)
UPDATE companies
SET    region = 'las_vegas'
WHERE  region = ''
  AND  city NOT IN ('Henderson', 'Reno', 'Sparks', 'Carson City', 'Incline Village',
                    'Virginia City', 'Minden', 'Elko', 'Fernley', 'Fallon');

UPDATE companies
SET    region = 'reno'
WHERE  region = ''
  AND  city IN ('Reno', 'Sparks', 'Carson City', 'Incline Village',
                'Virginia City', 'Minden', 'Elko', 'Fernley', 'Fallon');

UPDATE companies
SET    region = 'henderson'
WHERE  region = ''
  AND  city = 'Henderson';

COMMIT;
