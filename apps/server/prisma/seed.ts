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

  const cleaning = await prisma.serviceCategory.create({
    data: {
      name: 'Cleaning',
      slug: 'cleaning',
      icon: 'cleaning.png',
      sortOrder: 1,
    },
  });

  const plumbing = await prisma.serviceCategory.create({
    data: {
      name: 'Plumbing',
      slug: 'plumbing',
      icon: 'plumbing.png',
      sortOrder: 2,
    },
  });

  const electrical = await prisma.serviceCategory.create({
    data: {
      name: 'Electrical',
      slug: 'electrical',
      icon: 'electrical.png',
      sortOrder: 3,
    },
  });

  await prisma.service.createMany({
    data: [
      {
        categoryId: cleaning.id,
        name: 'Home Cleaning',
        slug: 'home-cleaning',
        basePrice: 599,
        duration: 180,
      },
      {
        categoryId: cleaning.id,
        name: 'Kitchen Cleaning',
        slug: 'kitchen-cleaning',
        basePrice: 799,
        duration: 120,
      },
      {
        categoryId: plumbing.id,
        name: 'Tap Repair',
        slug: 'tap-repair',
        basePrice: 299,
        duration: 45,
      },
      {
        categoryId: electrical.id,
        name: 'Fan Installation',
        slug: 'fan-installation',
        basePrice: 499,
        duration: 60,
      },
    ],
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