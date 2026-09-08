import { PartnerAvailability, PartnerStatus, PrismaClient, UserRole, UserStatus } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {

  const superAdmin = await prisma.user.upsert({
    where: {
      phone: '9876598765',
    },
    update: {
      role: 'ADMIN',
    },
    create: {
      phone: '9876598765',
      role: 'ADMIN',
      status: 'ACTIVE',
      isVerified: true,
    },
  });


  // ===============================
  // Development Users
  // ===============================

  const customer = await prisma.user.upsert({
    where: {
      phone: '9999999001',
    },
    update: {
      role: UserRole.CUSTOMER,
      status: UserStatus.ACTIVE,
      isVerified: true,
    },
    create: {
      phone: '9999999001',
      role: UserRole.CUSTOMER,
      status: UserStatus.ACTIVE,
      isVerified: true,
    },
  });

  const partnerUser = await prisma.user.upsert({
    where: {
      phone: '9999999002',
    },
    update: {
      role: UserRole.PARTNER,
      status: UserStatus.ACTIVE,
      isVerified: true,
    },
    create: {
      phone: '9999999002',
      role: UserRole.PARTNER,
      status: UserStatus.ACTIVE,
      isVerified: true,
    },
  });

  const admin = await prisma.user.upsert({
    where: {
      phone: '9999999003',
    },
    update: {
      role: UserRole.ADMIN,
      status: UserStatus.ACTIVE,
      isVerified: true,
    },
    create: {
      phone: '9999999003',
      role: UserRole.ADMIN,
      status: UserStatus.ACTIVE,
      isVerified: true,
    },
  });

  console.log('Development users ready');
  console.log({
    customer: customer.phone,
    partner: partnerUser.phone,
    admin: admin.phone,
  });
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

  const vijayNagar = await prisma.serviceArea.upsert({
    where: {
      cityId_name: {
        cityId: indore.id,
        name: 'Vijay Nagar',
      },
    },
    update: {
      pincode: '452010',
    },
    create: {
      cityId: indore.id,
      name: 'Vijay Nagar',
      pincode: '452010',
    },
  });

  const palasia = await prisma.serviceArea.upsert({
    where: {
      cityId_name: {
        cityId: indore.id,
        name: 'Palasia',
      },
    },
    update: {
      pincode: '452001',
    },
    create: {
      cityId: indore.id,
      name: 'Palasia',
      pincode: '452001',
    },
  });

  const mpNagar = await prisma.serviceArea.upsert({
    where: {
      cityId_name: {
        cityId: bhopal.id,
        name: 'MP Nagar',
      },
    },
    update: {
      pincode: '462011',
    },
    create: {
      cityId: bhopal.id,
      name: 'MP Nagar',
      pincode: '462011',
    },
  });

  const areraColony = await prisma.serviceArea.upsert({
    where: {
      cityId_name: {
        cityId: bhopal.id,
        name: 'Arera Colony',
      },
    },
    update: {
      pincode: '462016',
    },
    create: {
      cityId: bhopal.id,
      name: 'Arera Colony',
      pincode: '462016',
    },
  });

  const cleaning = await prisma.serviceCategory.upsert({
    where: {
      slug: 'cleaning',
    },
    update: {
      name: 'Cleaning',
    },
    create: {
      name: 'Cleaning',
      slug: 'cleaning',
      icon: 'cleaning.png',
      sortOrder: 1,
    },
  });

  const plumbing = await prisma.serviceCategory.upsert({
    where: {
      slug: 'plumbing',
    },
    update: {
      name: 'Plumbing',
    },
    create: {
      name: 'Plumbing',
      slug: 'plumbing',
      icon: 'plumbing.png',
      sortOrder: 2,
    },
  });

  const electrical = await prisma.serviceCategory.upsert({
    where: {
      slug: 'electrical',
    },
    update: {
      name: 'Electrical',
    },
    create: {
      name: 'Electrical',
      slug: 'electrical',
      icon: 'electrical.png',
      sortOrder: 3,
    },
  });

  const homeCleaning = await prisma.service.upsert({
    where: {
      slug: 'home-cleaning',
    },
    update: {
      categoryId: cleaning.id,
      name: 'Home Cleaning',
      basePrice: 599,
      duration: 180,
    },
    create: {
      categoryId: cleaning.id,
      name: 'Home Cleaning',
      slug: 'home-cleaning',
      basePrice: 599,
      duration: 180,
    },
  });

  const kitchenCleaning = await prisma.service.upsert({
    where: {
      slug: 'kitchen-cleaning',
    },
    update: {
      categoryId: cleaning.id,
      name: 'Kitchen Cleaning',
      basePrice: 799,
      duration: 120,
    },
    create: {
      categoryId: cleaning.id,
      name: 'Kitchen Cleaning',
      slug: 'kitchen-cleaning',
      basePrice: 799,
      duration: 120,
    },
  });

  const tapRepair = await prisma.service.upsert({
    where: {
      slug: 'tap-repair',
    },
    update: {
      categoryId: plumbing.id,
      name: 'Tap Repair',
      basePrice: 299,
      duration: 45,
    },
    create: {
      categoryId: plumbing.id,
      name: 'Tap Repair',
      slug: 'tap-repair',
      basePrice: 299,
      duration: 45,
    },
  });

  const fanInstallation = await prisma.service.upsert({
    where: {
      slug: 'fan-installation',
    },
    update: {
      categoryId: electrical.id,
      name: 'Fan Installation',
      basePrice: 499,
      duration: 60,
    },
    create: {
      categoryId: electrical.id,
      name: 'Fan Installation',
      slug: 'fan-installation',
      basePrice: 499,
      duration: 60,
    },
  });



  // ===============================
  // Development Partner
  // ===============================
  

  const devPartner = await prisma.partner.upsert({
    where: {
      userId: partnerUser.id,
    },
    update: {
      cityId: indore.id,
      serviceAreaId: vijayNagar.id,
      experience: 3,
      status: PartnerStatus.ACTIVE,
      availability: PartnerAvailability.AVAILABLE,
      isVerified: true,
    },
    create: {
      userId: partnerUser.id,
      cityId: indore.id,
      serviceAreaId: vijayNagar.id,
      experience: 3,
      status: PartnerStatus.ACTIVE,
      availability: PartnerAvailability.AVAILABLE,
      isVerified: true,
    },
  });
  await prisma.partnerService.upsert({
    where: {
      partnerId_serviceId: {
        partnerId: devPartner.id,
        serviceId: homeCleaning.id,
      },
    },
    update: {},
    create: {
      partnerId: devPartner.id,
      serviceId: homeCleaning.id,
    },
  });

  await prisma.partnerService.upsert({
    where: {
      partnerId_serviceId: {
        partnerId: devPartner.id,
        serviceId: tapRepair.id,
      },
    },
    update: {},
    create: {
      partnerId: devPartner.id,
      serviceId: tapRepair.id,
    },
  });

  console.log('Development partner ready:', devPartner.id);

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