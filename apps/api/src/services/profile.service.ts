import { prisma } from '../lib/prisma.js';

export async function getProfile(studentId: string) {
  const student = await prisma.student.findUnique({
    where: { clerkId: studentId },
    include: { profile: true },
  });
  return student?.profile ?? null;
}

export async function upsertProfile(
  clerkId: string,
  email: string,
  data: {
    fieldOfStudy?: string;
    university?: string;
    graduationDate?: string;
    targetIndustry?: string;
    visaStatus?: string;
    skills?: string[];
    workExperiences?: unknown;
    certifications?: unknown;
  },
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
    },
    update: {
      ...data,
      graduationDate: data.graduationDate ? new Date(data.graduationDate) : undefined,
      workExperiences: data.workExperiences ?? undefined,
      certifications: data.certifications ?? undefined,
    },
  });

  return profile;
}
