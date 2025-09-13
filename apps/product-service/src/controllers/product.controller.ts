import {
  AuthError,
  NotFoundError,
  ValidationError,
} from '@packages/error-handler';
import { imagekit } from '@packages/libs/imageKit';
import prisma from '@packages/libs/prisma';
import { NextFunction, Response, Request } from 'express';

export const getCategories = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const config = await prisma.site_config.findFirst();
    if (!config) {
      return res.status(404).json({ message: 'Categories not found' });
    }

    return res.status(200).json({
      categories: config.categories,
      subCategories: config.subCategories,
    });
  } catch (error) {
    return next(error);
  }
};

export const createDiscountCodes = async (
  req: any,
  res: Response,
  next: NextFunction
) => {
  try {
    const { public_name, discountType, discountValue, discountCode } = req.body;
    const isDiscountCodeExist = await prisma.discount_codes.findUnique({
      where: {
        discountCode,
      },
    });

    if (isDiscountCodeExist) {
      return next(new ValidationError('Discount code already exist'));
    }

    const discount_code = await prisma.discount_codes.create({
      data: {
        public_name,
        discountType,
        discountValue,
        discountCode,
        sellerId: req.seller.id,
      },
    });

    res.status(201).json({ discount_code, success: true });
  } catch (err) {
    next(err);
  }
};

export const getDiscountCodes = async (
  req: any,
  res: Response,
  next: NextFunction
) => {
  try {
    const discount_codes = await prisma.discount_codes.findMany({
      where: {
        sellerId: req.seller.id,
      },
    });

    res.status(200).json({ discount_codes, success: true });
  } catch (error) {
    return next(error);
  }
};

export const deleteDiscountCodes = async (
  req: any,
  res: Response,
  next: NextFunction
) => {
  try {
    const { id } = req.params;
    console.log(id, 'id');
    const sellerId = req.seller?.id;
    const discountCode = await prisma.discount_codes.findUnique({
      where: { id },
      select: { id: true, sellerId: true },
    });

    if (!discountCode) {
      return next(new NotFoundError('Discount code not found'));
    }

    if (discountCode.sellerId !== sellerId) {
      return next(new ValidationError('Unauthorized Access!'));
    }

    await prisma.discount_codes.delete({
      where: { id },
    });
    return res
      .status(200)
      .json({ message: 'Discount code successfully deleted' });
  } catch (error) {
    next(error);
  }
};

// upload product Images
export const uploadProductImage = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { fileName } = req.body;
    console.log(fileName, 'fileName');
    const response = await imagekit.upload({
      file: fileName,
      fileName: `product-${Date.now()}.jpg`,
      folder: '/products',
    });

    res.status(201).json({ file_url: response.url, fileId: response.fileId });
  } catch (error) {
    console.log(error, 'upload error');
    next(error);
  }
};

export const deleteProductImage = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { fileId } = req.body;
    const response = await imagekit.deleteFile(fileId);
    res
      .status(200)
      .json({ success: true, message: 'Image deleted successfully' });
  } catch (error) {
    console.log(error, 'delete error');
    next(error);
  }
};

export const createProduct = async (
  req: any,
  res: Response,
  next: NextFunction
) => {
  try {
    const {
      title,
      short_description,
      detailed_description,
      warranty,
      custom_specifications,
      slug,
      tags,
      cashOnDelivery,
      brand,
      video_url,
      category,
      colors = [],
      sizes = [],
      discount_codes,
      stock,
      sale_price,
      regular_price,
      images = [],
      subCategory,
      CustomProperties = {},
    } = req.body;

    if (
      !title ||
      !slug ||
      !short_description ||
      !category ||
      !subCategory ||
      !sale_price ||
      !images ||
      !tags ||
      !stock ||
      !regular_price ||
      !stock
    ) {
      return next(new ValidationError('All fields are required'));
    }

    if (!req.seller.id) {
      return next(new AuthError('Only Seller can create a product'));
    }

    const slugchecking = await prisma.products.findUnique({
      where: { slug },
    });

    if (slugchecking) {
      return next(
        new ValidationError('Slug already in use. Please choose another one.')
      );
    }
    console.log(images, 'images', discount_codes);
    const newProduct = await prisma.products.create({
      data: {
        title,
        short_description,
        detailed_description,
        warranty,
        cashOnDelivery: cashOnDelivery,
        slug,
        shopId: req.seller.shop?.id!,
        tags: Array.isArray(tags) ? tags : tags.split(','),
        video_url,
        category,
        subCategory,
        colors: colors || [],
        discount_codes: discount_codes?.map((codeId: string) => codeId) || [],
        sizes: sizes || [],
        stock: parseInt(stock),
        sale_price: parseFloat(sale_price),
        regular_price: parseFloat(regular_price),
        custom_properties: CustomProperties || {},
        custom_specifications: custom_specifications || {},
        brand,
        images: {
          create: images
            ?.filter((item: any) => item && item.fileId && item.file_url)
            .map((image: any) => ({
              file_id: image.fileId,
              url: image.file_url,
            })),
        },
      },
      include: { images: true },
    });

    res.status(201).json({ newProduct, success: true });
  } catch (error) {
    console.log(error, 'create error');
    next(error);
  }
};

export const getShopProducts = async (
  req: any,
  res: Response,
  next: NextFunction
) => {
  try {
    const products = await prisma.products.findMany({
      where: { shopId: req.seller?.shop?.id! },
      include: { images: true },
    });
    res.status(201).json({ products, success: true });
  } catch (error) {
    console.log(error, 'get shop products error');
    next(error);
  }
};
