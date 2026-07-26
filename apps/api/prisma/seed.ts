import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

const visaContent = [
  {
    visaType: 'student_visa',
    stage: 'foundation',
    snippet:
      'Your Student visa typically allows you to work up to 20 hours per week during term time. Check your visa vignette or BRP for specific conditions.',
    disclaimer:
      'This information is for guidance only. Always consult official UKVI guidance or an immigration advisor for your specific situation.',
  },
  {
    visaType: 'student_visa',
    stage: 'preparation',
    snippet:
      'Under the Student visa, you can start applying for graduate roles up to 3 months before your course end date. Many large employers open applications in September for the following year.',
    disclaimer:
      'Visa conditions vary. Verify your specific entitlements on the official UKVI website.',
  },
  {
    visaType: 'student_visa',
    stage: 'application',
    snippet:
      'If you graduate and have a valid Student visa, you may be eligible to switch to the Graduate visa. This route allows you to stay in the UK for 2 years (or 18 months for PhD graduates) to work at any skill level.',
    disclaimer: 'This information may become outdated. Check the latest UKVI guidance before making decisions.',
  },
  {
    visaType: 'graduate_route',
    stage: 'foundation',
    snippet:
      'The Graduate Route allows you to work or look for work in the UK for up to 2 years after completing your course (subject to policy changes). No sponsorship is required.',
    disclaimer:
      'The Graduate Route is subject to change. Always verify current terms on the official UKVI website.',
  },
  {
    visaType: 'graduate_route',
    stage: 'preparation',
    snippet:
      'Time on the Graduate Route counts toward your UK work experience but does not automatically lead to settlement. Use this time to secure a job that offers visa sponsorship (Skilled Worker visa).',
    disclaimer: 'This does not constitute immigration advice. Consult a regulated advisor for settlement queries.',
  },
  {
    visaType: 'graduate_route',
    stage: 'application',
    snippet:
      'Employers may ask about your right to work. You can prove your Graduate Route permission using the online right-to-work checking service. No physical BRP is needed from 2025.',
    disclaimer: 'Right-to-work processes may change. Always check current UKVI guidance.',
  },
];

async function seed() {
  console.log('Seeding visa content...');

  for (const vc of visaContent) {
    await prisma.visaContent.upsert({
      where: {
        id: `${vc.visaType}_${vc.stage}`,
      },
      update: vc,
      create: {
        id: `${vc.visaType}_${vc.stage}`,
        ...vc,
      },
    });
  }

  console.log('Seed complete.');
}

seed()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
