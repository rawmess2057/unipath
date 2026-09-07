import { prisma } from '../lib/prisma.js';

export async function getProfile(studentId: string) {
  return prisma.profile.findFirst({
    where: { student: { clerkId: studentId } },
    include: { student: { select: { email: true } } },
  });
}

export interface ProfileUpsertInput {
  fieldOfStudy?: string;
  university?: string;
  graduationDate?: string;
  targetIndustry?: string;
  visaStatus?: string;
  skills?: string[];
  workExperiences?: unknown;
  certifications?: unknown;
  avatarImageUrl?: string;
  websiteUrl?: string;
  portfolioUrl?: string;
  githubUrl?: string;
  linkedinUrl?: string;
  extraLinks?: unknown;
}

export async function upsertProfile(
  clerkId: string,
  email: string,
  data: ProfileUpsertInput,
) {
  const student = await prisma.student.upsert({
    where: { clerkId },
    create: { clerkId, email },
    update: {},
  });

  const profile = await prisma.profile.upsert({
    where: { studentId: student.id },
    create: {
      studentId: student.id,
      ...data,
      graduationDate: data.graduationDate ? new Date(data.graduationDate) : null,
      workExperiences: data.workExperiences ?? [],
      certifications: data.certifications ?? [],
      extraLinks: data.extraLinks ?? [],
    },
    update: {
      ...data,
      graduationDate: data.graduationDate ? new Date(data.graduationDate) : undefined,
      workExperiences: data.workExperiences ?? undefined,
      certifications: data.certifications ?? undefined,
      extraLinks: data.extraLinks ?? undefined,
    },
  });

  return profile;
}
