-- AddColumn
ALTER TABLE "events" ADD COLUMN "images" JSONB;

-- Create new enum types with updated values
CREATE TYPE "Industry_new" AS ENUM ('LEAGUES_AND_FEDERATIONS', 'TEAM', 'BROADCASTERS_AND_OTT_PLATFORMS', 'PUBLISHERS', 'GAMING_OPERATORS');
CREATE TYPE "Solution_new" AS ENUM ('GAMING_AND_FAN_LOYALTY', 'DIGITAL_PLATFORMS', 'VIDEO_TECHNOLOGY_AND_AUTOMATED_CONTENT_CREATION', 'FAN_DATA_AND_CRM_CONSULTING', 'MARKETING_AND_COMMUNITY_MANAGEMENT', 'DESIGN_AND_VIDEO_PRODUCTION', 'SPORTS_DATA_SOLUTIONS');

-- Update existing customer stories with mapped values
-- For Industry: Map old values to new ones where appropriate
UPDATE "customer_stories" SET 
  industry = CASE 
    WHEN industry = 'TEAM' THEN 'TEAM'::Industry_new
    WHEN industry = 'BROADCASTERS_AND_OTT_PLATFORMS' THEN 'BROADCASTERS_AND_OTT_PLATFORMS'::Industry_new
    WHEN industry = 'PUBLISHERS' THEN 'PUBLISHERS'::Industry_new
    WHEN industry = 'GAMING_OPERATORS' THEN 'GAMING_OPERATORS'::Industry_new
    ELSE 'TEAM'::Industry_new  -- Default fallback for unmapped values
  END::text::Industry_new;

-- For Solutions: Map old values to new ones where appropriate
UPDATE "customer_stories" SET 
  solutions = array(
    SELECT CASE 
      WHEN solution = 'GAMING_AND_FAN_LOYALTY' THEN 'GAMING_AND_FAN_LOYALTY'::Solution_new
      WHEN solution = 'DIGITAL_PLATFORMS' THEN 'DIGITAL_PLATFORMS'::Solution_new
      WHEN solution = 'VIDEO_TECHNOLOGY_AND_AUTOMATED_CONTENT_CREATION' THEN 'VIDEO_TECHNOLOGY_AND_AUTOMATED_CONTENT_CREATION'::Solution_new
      WHEN solution = 'FAN_DATA_AND_CRM_CONSULTING' THEN 'FAN_DATA_AND_CRM_CONSULTING'::Solution_new
      WHEN solution = 'MARKETING_AND_COMMUNITY' THEN 'MARKETING_AND_COMMUNITY_MANAGEMENT'::Solution_new
      WHEN solution = 'VIDEO_PRODUCTION' THEN 'DESIGN_AND_VIDEO_PRODUCTION'::Solution_new
      WHEN solution = 'SPORTS_DATA_SOLUTIONS' THEN 'SPORTS_DATA_SOLUTIONS'::Solution_new
      ELSE NULL -- Remove unmapped solutions
    END::Solution_new
    FROM unnest(solutions) AS solution
    WHERE CASE 
      WHEN solution = 'GAMING_AND_FAN_LOYALTY' THEN TRUE
      WHEN solution = 'DIGITAL_PLATFORMS' THEN TRUE
      WHEN solution = 'VIDEO_TECHNOLOGY_AND_AUTOMATED_CONTENT_CREATION' THEN TRUE
      WHEN solution = 'FAN_DATA_AND_CRM_CONSULTING' THEN TRUE
      WHEN solution = 'MARKETING_AND_COMMUNITY' THEN TRUE
      WHEN solution = 'VIDEO_PRODUCTION' THEN TRUE
      WHEN solution = 'SPORTS_DATA_SOLUTIONS' THEN TRUE
      ELSE FALSE
    END
  );

-- Drop the old column constraints
ALTER TABLE "customer_stories" ALTER COLUMN "industry" TYPE text;
ALTER TABLE "customer_stories" ALTER COLUMN "solutions" TYPE text[];

-- Drop old enum types
DROP TYPE "Industry";
DROP TYPE "Solution";

-- Rename new enum types
ALTER TYPE "Industry_new" RENAME TO "Industry";
ALTER TYPE "Solution_new" RENAME TO "Solution";

-- Update column types to use new enums
ALTER TABLE "customer_stories" ALTER COLUMN "industry" TYPE "Industry" USING "industry"::text::"Industry";
ALTER TABLE "customer_stories" ALTER COLUMN "solutions" TYPE "Solution"[] USING "solutions"::text[]::"Solution"[]; 