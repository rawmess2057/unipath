-- CreateTable
CREATE TABLE "Opportunity" (
    "id" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "company" TEXT NOT NULL,
    "location" TEXT NOT NULL,
    "employmentType" TEXT NOT NULL,
    "industry" TEXT NOT NULL,
    "salaryRange" TEXT,
    "description" TEXT NOT NULL,
    "requirements" JSONB,
    "applicationUrl" TEXT,
    "deadline" TIMESTAMP(3),
    "visaSuitable" BOOLEAN NOT NULL DEFAULT true,
    "sponsorshipNote" TEXT,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Opportunity_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "StudentOpportunity" (
    "id" TEXT NOT NULL,
    "studentId" TEXT NOT NULL,
    "opportunityId" TEXT NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'saved',
    "appliedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "StudentOpportunity_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "Opportunity_industry_idx" ON "Opportunity"("industry");

-- CreateIndex
CREATE INDEX "Opportunity_employmentType_idx" ON "Opportunity"("employmentType");

-- CreateIndex
CREATE INDEX "Opportunity_isActive_idx" ON "Opportunity"("isActive");

-- CreateIndex
CREATE INDEX "StudentOpportunity_studentId_idx" ON "StudentOpportunity"("studentId");

-- CreateIndex
CREATE INDEX "StudentOpportunity_opportunityId_idx" ON "StudentOpportunity"("opportunityId");

-- CreateIndex
CREATE UNIQUE INDEX "StudentOpportunity_studentId_opportunityId_key" ON "StudentOpportunity"("studentId", "opportunityId");

-- AddForeignKey
ALTER TABLE "StudentOpportunity" ADD CONSTRAINT "StudentOpportunity_studentId_fkey" FOREIGN KEY ("studentId") REFERENCES "Student"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "StudentOpportunity" ADD CONSTRAINT "StudentOpportunity_opportunityId_fkey" FOREIGN KEY ("opportunityId") REFERENCES "Opportunity"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- Seed curated opportunities
INSERT INTO "Opportunity" ("id", "title", "company", "location", "employmentType", "industry", "salaryRange", "description", "requirements", "applicationUrl", "deadline", "visaSuitable", "sponsorshipNote", "isActive", "createdAt", "updatedAt") VALUES
('9f1c0001-0001-4000-8000-000000000001', 'Software Engineering Intern', 'London Tech Scale-up', 'London (hybrid)', 'internship', 'technology', '£26,000 pro rata', 'Six-week to ten-week engineering internship working within a product squad. You will ship real features, pair with senior engineers and take part in weekly demos.', '["Currently studying towards a Computer Science or related degree", "Comfortable with at least one programming language (e.g. JavaScript, Python, Java)", "Strong written English"]', NULL, '2026-10-31 23:59:59', true, 'Open to students on a Student visa for the internship period.', true, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
('9f1c0001-0001-4000-8000-000000000002', 'Graduate Software Developer', 'UK Digital Bank', 'Manchester (hybrid)', 'graduate', 'technology', '£38,000–£44,000', 'Twelve-month graduate programme rotating across backend, frontend and platform teams, followed by placement into a permanent role.', '["Final-year STEM degree", "Graduate Route eligibility by start date", "Solid fundamentals in at least two programming languages"]', NULL, '2026-12-01 23:59:59', true, 'Sponsorship considered after Graduate Route expires; not guaranteed.', true, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
('9f1c0001-0001-4000-8000-000000000003', 'Data Analyst Placement', 'Consumer Analytics Agency', 'Bristol', 'placement', 'technology', '£24,000 pro rata', 'Twelve-month industrial placement supporting client analytics engagements, building dashboards in SQL and Python and presenting findings to account teams.', '["Second-year degree students completing a year in industry", "SQL experience required; Python desirable", "Analytical mindset"]', NULL, '2026-11-15 23:59:59', true, NULL, true, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
('9f1c0001-0001-4000-8000-000000000004', 'Cyber Security Graduate Scheme', 'Defence & Cyber Consultancy', 'Cheltenham', 'graduate', 'technology', '£30,000–£36,000', 'Graduate scheme across security operations, penetration testing and compliance. Candidates requiring UK Security Clearance are ineligible at this stage.', '["STEM degree highly desirable", "Must already hold or be eligible for UK Security Clearance (note: restricts international eligibility)", "Strong analytical and communication skills"]', NULL, '2026-11-30 23:59:59', false, 'Requires UK Security Clearance — generally not available to international students at entry.', true, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
('9f1c0001-0001-4000-8000-000000000005', 'Graduate Analyst', 'Tier-1 Investment Bank', 'London', 'graduate', 'finance', '£55,000–£65,000 plus bonus', 'Two-year analyst programme across markets, investment banking and risk. Structured training, mentoring and a path to a full-time analyst role.', '["Strong academic record (2:1 or equivalent predicted)", "Graduate Route or Skilled Worker sponsorship required", "Excellent numerical reasoning"]', NULL, '2026-11-20 23:59:59', true, 'Sponsorship considered for high-performance candidates.', true, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
('9f1c0001-0001-4000-8000-000000000006', 'Finance Summer Internship', 'Asset Management Firm', 'Edinburgh', 'internship', 'finance', '£32,000 pro rata', 'Ten-week summer internship across portfolio management, research and client services. Strong conversion rate to the graduate programme.', '["Penultimate or final year undergraduates", "Finance, economics or numerical discipline preferred", "Strong Excel skills"]', NULL, '2026-10-15 23:59:59', true, NULL, true, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
('9f1c0001-0001-4000-8000-000000000007', 'Audit Trainee (Graduate)', 'Big-4 Accountancy Firm', 'Birmingham', 'graduate', 'finance', '£29,000–£33,000', 'Graduate audit trainee role sponsoring ACA/ACCA study alongside client-facing audit work across a diverse portfolio.', '["Degree in any discipline", "Graduate Route or right to work required", "Strong attention to detail and teamwork"]', NULL, '2026-12-10 23:59:59', true, 'Sponsorship rarely required for this role; Graduate Route expected.', true, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
('9f1c0001-0001-4000-8000-000000000008', 'Consulting Analyst (Graduate)', 'Big-4 Consultancy', 'London (hybrid)', 'graduate', 'consulting', '£45,000–£50,000', 'Graduate consulting analyst role supporting strategy and transformation projects for UK clients, with structured training and international secondment options.', '["Strong academic record and problem-solving ability", "Extra-curricular leadership desirable", "Graduate Route eligible"]', NULL, '2026-11-25 23:59:59', true, 'Sponsorship considered on a case-by-case basis.', true, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
('9f1c0001-0001-4000-8000-000000000009', 'Strategy Internship', 'Mid-Size Management Consultancy', 'Leeds', 'internship', 'consulting', '£28,000 pro rata', 'Eight-week summer internship producing market analysis and client-ready deliverables alongside engagement managers.', '["Penultimate-year students", "Strong PowerPoint and Excel skills", "Interest in consulting"]', NULL, '2026-10-31 23:59:59', true, NULL, true, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
('9f1c0001-0001-4000-8000-000000000010', 'Graduate Civil Engineer', 'Regional Engineering Group', 'Sheffield', 'graduate', 'engineering', '£31,000–£36,000', 'Graduate civil engineer role across highways and infrastructure projects, with ICE-accredited training and chartership support.', '["MEng or accredited BEng Civil Engineering", "Graduate Route or right to work", "Valid UK driving licence desirable"]', NULL, '2026-12-05 23:59:59', true, NULL, true, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
('9f1c0001-0001-4000-8000-000000000011', 'Mechanical Engineering Placement', 'Automotive Manufacturer', 'Coventry', 'placement', 'engineering', '£23,000 pro rata', 'Twelve-month industrial placement within powertrain or chassis engineering, with hands-on CAD, validation and test-rig work.', '["Second-year MEng/BEng Mechanical Engineering", "CAD experience (SolidWorks or similar) beneficial", "Strong practical aptitude"]', NULL, '2026-11-10 23:59:59', true, 'Placement counts toward degree; not eligible for full-time sponsorship during placement.', true, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
('9f1c0001-0001-4000-8000-000000000012', 'Digital Marketing Executive (Graduate)', 'E-commerce Brand', 'London', 'graduate', 'marketing', '£28,000–£32,000', 'Graduate marketing role owning paid-social, email and content campaigns for a fast-growing UK e-commerce brand.', '["Marketing, business or communications degree", "Understanding of major digital ad platforms", "Creative and numerate"]', NULL, '2026-11-30 23:59:59', true, NULL, true, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
('9f1c0001-0001-4000-8000-000000000013', 'Marketing Internship', 'FMCG Consumer Goods Co', 'Reading', 'internship', 'marketing', '£25,000 pro rata', 'Nine-week internship across brand management and research, ending with a presentation to the leadership team. Strong pipeline into the graduate programme.', '["Penultimate-year students", "Commercial awareness", "Strong presentation skills"]', NULL, '2026-10-31 23:59:59', true, NULL, true, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
('9f1c0001-0001-4000-8000-000000000014', 'Junior Data Scientist (Graduate)', 'Insurance Group', 'Cardiff', 'graduate', 'technology', '£36,000–£42,000', 'Graduate data scientist building pricing and customer models in Python, with exposure to MLOps and cloud tooling.', '["Degree in a quantitative discipline", "Python and statistics fundamentals", "Graduate Route or sponsorship required"]', NULL, '2026-12-15 23:59:59', true, 'Skilled Worker sponsorship available for strong candidates.', true, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
('9f1c0001-0001-4000-8000-000000000015', 'NHS Graduate Management Trainee', 'NHS Trust', 'London', 'graduate', 'healthcare', '£31,000–£35,000', 'Two-year NHS graduate management training scheme rotating across operations, finance and transformation in a large London trust.', '["Degree in any discipline", "Graduate Route eligibility required", "Commitment to public service values"]', NULL, '2026-11-30 23:59:59', true, 'Graduate Route expected; sponsorship not typically offered.', true, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
('9f1c0001-0001-4000-8000-000000000016', 'Health Data Analyst Apprentice', 'Public Health Agency', 'Glasgow', 'graduate', 'healthcare', '£28,000–£31,000', 'Graduate scheme analysing population health data and supporting public-health reporting with SQL, Python and R.', '["Degree in a quantitative or health discipline", "Data visualisation skills preferred", "Eligibility to work in the UK"]', NULL, '2026-12-01 23:59:59', true, NULL, true, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
('9f1c0001-0001-4000-8000-000000000017', 'Software Engineering Placement', 'SaaS Scale-up', 'Cambridge', 'placement', 'technology', '£25,000 pro rata', 'Twelve-month placement within an agile product team building a B2B SaaS platform, covering web development and testing.', '["Second-year Computer Science students", "JavaScript/TypeScript basics required", "Portfolio or side projects beneficial"]', NULL, '2026-11-15 23:59:59', true, NULL, true, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
('9f1c0001-0001-4000-8000-000000000018', 'Operations Associate (Graduate)', 'Logistics Tech Co', 'Northampton', 'graduate', 'other', '£27,000–£31,000', 'Graduate operations role optimising fulfilment and transport networks for a logistics technology company.', '["Degree in any discipline", "Strong data literacy and Excel", "Graduate Route or right to work"]', NULL, '2026-11-20 23:59:59', true, NULL, true, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP);