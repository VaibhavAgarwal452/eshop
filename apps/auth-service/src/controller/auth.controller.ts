import { refreshToken } from './auth.controller';
import { NextFunction, Request, Response } from 'express';
import {
  checkOtpRestrictions,
  handleForgotPassword,
  sendOtp,
  trackOtpRequests,
  validateRegistrationData,
  verifyForgotPasswordOtp,
  verifyOtp,
} from '../utils/auth.helper';
import prisma from '@packages/libs/prisma';
import { AuthError, ValidationError } from '@packages/error-handler';
import bcrypt from 'bcryptjs';
import jwt, { JsonWebTokenError } from 'jsonwebtoken';
import { setCookie } from '../utils/cookies/setCookie';
import Stripe from 'stripe';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: '2025-06-30.basil',
});

export const userRegistration = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    validateRegistrationData(req.body, 'user');
    const { name, email } = req.body;
    const existingUser = await prisma.users.findUnique({ where: { email } });

    if (existingUser) {
      return next(new ValidationError('User already exists with this email'));
    }

    await checkOtpRestrictions(email, next);
    await trackOtpRequests(email, next);
    await sendOtp(name, email, 'user-activation-mail');

    res.status(200).json({
      message: 'Otp send to email, Please verify your account',
    });
  } catch (error) {
    return next(error);
  }
};

// verify USer with otp

export const verifyUser = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { email, otp, name, password } = req.body;
    if (!email || !otp || !name || !password) {
      return next(new ValidationError('All Fields are required'));
    }
    const existingUser = await prisma.users.findUnique({ where: { email } });

    if (existingUser) {
      return next(new ValidationError('User already exists with this email'));
    }

    await verifyOtp(email, otp, next);
    const hashedPassword = await bcrypt.hash(password, 10);
    await prisma.users.create({
      data: {
        name,
        email,
        password: hashedPassword,
      },
    });

    res.status(200).json({
      success: true,
      message: 'User registered successfully',
    });
  } catch (err) {
    console.log(err, 'err');
  }
};

export const loginUser = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) {
      return next(new ValidationError('Email and password are required'));
    }

    const user = await prisma.users.findUnique({
      where: {
        email,
      },
    });

    if (!user) return next(new ValidationError("User doesn't exists"));

    const isMatch = await bcrypt.compare(password, user.password!);
    if (!isMatch) {
      return next(new AuthError('Invalid Email or password'));
    }

    res.clearCookie('seller-access-token');
    res.clearCookie('seller-refresh-token');
    const accessToken = jwt.sign(
      { id: user.id, role: 'user' },
      process.env.ACCESS_TOKEN_SECRET as string,
      {
        expiresIn: '15m',
      }
    );

    const refreshToken = jwt.sign(
      { id: user.id, role: 'user' },
      process.env.REFRESH_TOKEN_SECRET as string,
      {
        expiresIn: '7d',
      }
    );

    setCookie(res, 'refreshToken', refreshToken);
    setCookie(res, 'accessToken', accessToken);

    res.status(200).json({
      message: 'Login Successful!',
      user: { id: user.id, email: user.email, name: user.name },
    });
  } catch (err) {}
};

// refresh Token
export const refreshToken = async (
  req: any,
  res: Response,
  next: NextFunction
) => {
  try {
    const refreshToken =
      req.cookies['refreshToken'] ||
      req.cookies['seller-refresh-token'] ||
      req.headers.authorization?.split(' ')[1];

    console.log(refreshToken, 'refreshToken');
    if (!refreshToken) {
      return new ValidationError('Unauthorized! no refresh token');
    }
    const decoded = jwt.verify(
      refreshToken,
      process.env.REFRESH_TOKEN_SECRET as string
    ) as { id: string; role: string };
    if (!decoded || !decoded.id || !decoded.role) {
      return new JsonWebTokenError('Forbidden! Invalid refresh Token');
    }
    let account;
    if (decoded.role === 'user') {
      account = await prisma.users.findUnique({ where: { id: decoded.id } });
    } else if (decoded.role === 'seller') {
      account = await prisma.sellers.findUnique({
        where: { id: decoded.id },
        include: { shop: true },
      });
    }

    if (!account) {
      return new AuthError('Forbidden! User/Seller not found');
    }

    const newAccessToken = jwt.sign(
      { id: decoded.id, role: decoded.role },
      process.env.ACCESS_TOKEN_SECRET as string,
      { expiresIn: '15m' }
    );

    if (decoded.role === 'user') {
      setCookie(res, 'accessToken', newAccessToken);
    } else if (decoded.role === 'seller') {
      setCookie(res, 'seller-access-token', newAccessToken);
    }

    req.role = decoded.role;

    return res.status(201).json({ success: true });
  } catch (err) {
    console.log(err, 'err');
    return next(err);
  }
};

export const getUser = async (req: any, res: Response, next: NextFunction) => {
  try {
    const user = req.user;
    res.status(200).json({ success: true, user });
  } catch (err) {
    next(err);
  }
};

export const userForgotPassword = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  await handleForgotPassword(req, res, next, 'user');
};

//verify forgot password otp
export const verifyUserForgotPasswordOtp = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  await verifyForgotPasswordOtp(req, res, next);
};

//reset user password

export const resetUserPassword = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { email, newPassword } = req.body;
    if (!email || !newPassword) {
      return next(new ValidationError('EMail and password are required'));
    }

    const user = await prisma.users.findUnique({ where: { email } });
    if (!user) return next(new ValidationError('User not found'));

    const isSamePassword = await bcrypt.compare(newPassword, user.password!);

    if (isSamePassword) {
      return next(
        new ValidationError('new Password cannot be same as the old Password!')
      );
    }

    //hash the new Password
    const hashedPassword = await bcrypt.hash(newPassword, 10);

    await prisma.users.update({
      where: { email },
      data: {
        password: hashedPassword,
      },
    });

    res.status(200).json({ message: 'Password rest Successfully' });
  } catch (err) {
    next(err);
  }
};

//register a new seller

export const registerSeller = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    validateRegistrationData(req.body, 'seller');
    const { name, email } = req.body;

    const existingSeller = await prisma.sellers.findUnique({
      where: { email },
    });
    if (existingSeller) {
      throw new ValidationError('Seller already exists with this email');
    }

    await checkOtpRestrictions(email, next);
    await trackOtpRequests(email, next);
    await sendOtp(name, email, 'seller-activation');

    res
      .status(200)
      .json({ message: 'Otp send to email, Please verify your account' });
  } catch (err) {
    next(err);
  }
};

export const verifySeller = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { email, otp, name, password, phone_number, country } = req.body;
    if (!email || !otp || !name || !password || !phone_number || !country) {
      return next(new ValidationError('All Fields are required'));
    }
    const existingSeller = await prisma.sellers.findUnique({
      where: { email },
    });
    if (existingSeller) {
      return next(new ValidationError('Seller already exists with this email'));
    }
    await verifyOtp(email, otp, next);
    const hashedPassword = await bcrypt.hash(password, 10);
    const seller = await prisma.sellers.create({
      data: {
        name,
        email,
        password: hashedPassword,
        phone_number,
        country,
      },
    });
    res.status(200).json({ seller, message: 'Seller registered successfully' });
  } catch (err) {}
};

// Create a new shop

export const createShop = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { name, bio, address, opening_hours, website, category, sellerId } =
      req.body;
    if (!name || !bio || !address || !sellerId || !opening_hours || !category) {
      return next(new ValidationError('All Fields are Required'));
    }

    const shopsData: any = {
      name,
      bio,
      address,
      opening_hours,
      category,
      sellerId,
    };

    if (website && website.trim() !== '') {
      shopsData.website = website;
    }

    const shop = await prisma.shops.create({
      data: shopsData,
    });

    res.status(201).json({
      success: true,
      shop,
    });
  } catch (err) {}
};

// create stripe connect link

export const createStripeConnectLink = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { sellerId } = req.body;
    if (!sellerId) return next(new ValidationError('Seller Id is required'));

    const seller = await prisma.sellers.findUnique({
      where: {
        id: sellerId,
      },
    });

    if (!seller)
      return next(new ValidationError('Seller is not available with this id'));
    const account = await stripe.accounts.create({
      type: 'express',
      email: seller?.email,
      country: 'IN',
      capabilities: {
        card_payments: { requested: true },
        transfer: { required: true },
      },
    });

    await prisma.sellers.update({
      where: {
        id: sellerId,
      },
      data: {
        stripeId: account.id,
      },
    });

    const accountLink = await stripe.accountLinks.create({
      account: account.id,
      refresh_url: 'http://localhost:3000/success',
      return_url: 'http://localhost:3000/success',
      type: 'account_onboarding',
    });

    res.json({ url: accountLink.url });
  } catch (err) {
    console.error(err, 'Stripe Connection error');
  }
};

//login seller

export const loginSeller = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return next(new ValidationError('Email and password are required'));
    }

    const seller = await prisma.sellers.findUnique({
      where: {
        email,
      },
    });

    if (!seller) return next(new ValidationError("Seller doesn't exists"));

    const isMatch = await bcrypt.compare(password, seller.password!);

    if (!isMatch) return next(new ValidationError("Password doesn't match"));

    res.clearCookie('accessToken');
    res.clearCookie('refreshToken');
    const accessToken = jwt.sign(
      { id: seller.id, role: 'seller' },
      process.env.ACCESS_TOKEN_SECRET as string,
      { expiresIn: '15m' }
    );

    const refreshToken = jwt.sign(
      { id: seller.id, role: 'seller' },
      process.env.REFRESH_TOKEN_SECRET as string,
      { expiresIn: '7d' }
    );

    setCookie(res, 'seller-refresh-token', refreshToken);
    setCookie(res, 'seller-access-token', accessToken);

    res.status(200).json({
      message: 'Login Successful!',
      seller: { id: seller.id, email: seller.email, name: seller.name },
    });
  } catch (err) {
    next(err);
  }
};

export const getSeller = async (
  req: any,
  res: Response,
  next: NextFunction
) => {
  try {
    const seller = req.seller;
    res.status(200).json({ success: true, seller });
  } catch (err) {
    next(err);
  }
};
