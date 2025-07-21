// import { PrismaClient } from '@prisma/client';
import { PrismaClient } from '../../../../generated/prisma';
const prisma = new PrismaClient();

const initializeConfig = async () => {
  try {
    const existingConfig = await prisma.site_config.findFirst();
    if (!existingConfig) {
      await prisma.site_config.create({
        data: {
          categories: [
            'Electronics',
            'Fashion',
            'Home & Kitchen',
            'Sports & Fitness',
          ],
          subCategories: {
            Electronics: ['Laptops', 'Mobiles', 'Tablets'],
            Fashion: ['Mens', 'Women', "Kid's"],
            'Home & Kitchen': ['Furniture', 'Appliances'],
            'Sports & Fitness': ['Sports', 'Fitness'],
          },
        },
      });
    }
  } catch (err) {
    console.error('Error initializing site config: ', err);
  }
};

export default initializeConfig;
