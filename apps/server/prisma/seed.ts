import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  const indore = await prisma.city.upsert({
    where: {
      name_state: {
        name: 'Indore',
        state: 'Madhya Pradesh',
      },
    },
    update: {},
    create: {
      name: 'Indore',
      state: 'Madhya Pradesh',
      country: 'India',
    },
  });

  const bhopal = await prisma.city.upsert({
    where: {
      name_state: {
        name: 'Bhopal',
        state: 'Madhya Pradesh',
      },
    },
    update: {},
    create: {
      name: 'Bhopal',
      state: 'Madhya Pradesh',
      country: 'India',
    },
  });

  await prisma.serviceArea.createMany({
    data: [
      {
        cityId: indore.id,
        name: 'Vijay Nagar',
        pincode: '452010',
      },
      {
        cityId: indore.id,
        name: 'Palasia',
        pincode: '452001',
      },
      {
        cityId: bhopal.id,
        name: 'MP Nagar',
        pincode: '462011',
      },
      {
        cityId: bhopal.id,
        name: 'Arera Colony',
        pincode: '462016',
      },
    ],
    skipDuplicates: true,
  });
}

main()
  .then(async () => {
    await prisma.$disconnect();
  })
  .catch(async (error) => {
    console.error(error);
    await prisma.$disconnect();
    process.exit(1);
  });