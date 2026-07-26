-- CreateTable
CREATE TABLE "Student" (
    "id" TEXT NOT NULL,
    "clerkId" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "name" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Student_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Profile" (
    "id" TEXT NOT NULL,
    "studentId" TEXT NOT NULL,
    "fieldOfStudy" TEXT,
    "university" TEXT,
    "graduationDate" TIMESTAMP(3),
    "targetIndustry" TEXT,
    "visaStatus" TEXT,
    "skills" TEXT[],
    "workExperiences" JSONB,
    "certifications" JSONB,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Profile_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "CvAnalysis" (
    "id" TEXT NOT NULL,
    "studentId" TEXT NOT NULL,
    "fileHash" TEXT NOT NULL,
    "originalFileName" TEXT,
    "overallSummary" TEXT,
    "strengths" TEXT[],
    "priorityImprovements" TEXT[],
    "structureScore" INTEGER,
    "keywordsScore" INTEGER,
    "clarityScore" INTEGER,
    "ukConventionsScore" INTEGER,
    "cvQualityScore" INTEGER,
    "confidence" TEXT,
    "complianceChecklist" JSONB,
    "rawResponse" JSONB,
    "isFallback" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "CvAnalysis_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Roadmap" (
    "id" TEXT NOT NULL,
    "studentId" TEXT NOT NULL,
    "generationMetadata" JSONB,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Roadmap_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "RoadmapTask" (
    "id" TEXT NOT NULL,
    "roadmapId" TEXT NOT NULL,
    "phase" TEXT NOT NULL,
    "order" INTEGER NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "category" TEXT NOT NULL,
    "estimatedEffort" TEXT NOT NULL,
    "pointsValue" INTEGER NOT NULL,
    "isVisaRelated" BOOLEAN NOT NULL DEFAULT false,
    "prerequisites" TEXT[],
    "resources" JSONB,
    "completed" BOOLEAN NOT NULL DEFAULT false,
    "completedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "RoadmapTask_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "VisaContent" (
    "id" TEXT NOT NULL,
    "visaType" TEXT NOT NULL,
    "stage" TEXT NOT NULL,
    "snippet" TEXT NOT NULL,
    "disclaimer" TEXT NOT NULL,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "VisaContent_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ScoreSnapshot" (
    "id" TEXT NOT NULL,
    "studentId" TEXT NOT NULL,
    "totalScore" INTEGER NOT NULL,
    "cvQuality" DOUBLE PRECISION NOT NULL,
    "skillsMatch" DOUBLE PRECISION NOT NULL,
    "workExperience" DOUBLE PRECISION NOT NULL,
    "certifications" DOUBLE PRECISION NOT NULL,
    "platformActivity" DOUBLE PRECISION NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "ScoreSnapshot_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ScoreRubric" (
    "id" TEXT NOT NULL,
    "data" JSONB NOT NULL,
    "version" INTEGER NOT NULL DEFAULT 1,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "ScoreRubric_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Student_clerkId_key" ON "Student"("clerkId");

-- CreateIndex
CREATE UNIQUE INDEX "Profile_studentId_key" ON "Profile"("studentId");

-- CreateIndex
CREATE INDEX "CvAnalysis_studentId_idx" ON "CvAnalysis"("studentId");

-- CreateIndex
CREATE INDEX "CvAnalysis_fileHash_idx" ON "CvAnalysis"("fileHash");

-- CreateIndex
CREATE INDEX "Roadmap_studentId_idx" ON "Roadmap"("studentId");

-- CreateIndex
CREATE INDEX "RoadmapTask_roadmapId_idx" ON "RoadmapTask"("roadmapId");

-- CreateIndex
CREATE INDEX "VisaContent_visaType_stage_idx" ON "VisaContent"("visaType", "stage");

-- CreateIndex
CREATE INDEX "ScoreSnapshot_studentId_idx" ON "ScoreSnapshot"("studentId");

-- AddForeignKey
ALTER TABLE "Profile" ADD CONSTRAINT "Profile_studentId_fkey" FOREIGN KEY ("studentId") REFERENCES "Student"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CvAnalysis" ADD CONSTRAINT "CvAnalysis_studentId_fkey" FOREIGN KEY ("studentId") REFERENCES "Student"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Roadmap" ADD CONSTRAINT "Roadmap_studentId_fkey" FOREIGN KEY ("studentId") REFERENCES "Student"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "RoadmapTask" ADD CONSTRAINT "RoadmapTask_roadmapId_fkey" FOREIGN KEY ("roadmapId") REFERENCES "Roadmap"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ScoreSnapshot" ADD CONSTRAINT "ScoreSnapshot_studentId_fkey" FOREIGN KEY ("studentId") REFERENCES "Student"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
