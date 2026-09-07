-- AlterTable
ALTER TABLE "Profile" ADD COLUMN "avatarImageUrl" TEXT,
ADD COLUMN "websiteUrl" TEXT,
ADD COLUMN "portfolioUrl" TEXT,
ADD COLUMN "githubUrl" TEXT,
ADD COLUMN "linkedinUrl" TEXT,
ADD COLUMN "extraLinks" JSONB;