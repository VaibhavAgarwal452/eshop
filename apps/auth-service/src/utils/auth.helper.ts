import { ValidationError } from '@packages/error-handler/index';
import crypto from 'crypto';
import { NextFunction, Request, Response } from 'express';
import redis from '@packages/libs/redis';
import { sendEmail } from './sendMail';
import prisma from '@packages/libs/prisma';

const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export const validateRegistrationData = (
  data: any,
  userType: 'user' | 'seller'
) => {
  const { name, email, password, phone_number, country } = data;

  if (
    !name ||
    !email ||
    !password ||
    (userType === 'seller' && (!phone_number || !country))
  ) {
    throw new ValidationError(`Missing Required Fields`);
  }

  if (!emailRegex.test(email)) {
    throw new ValidationError('Invalid email format');
  }
};

export const checkOtpRestrictions = async (
  email: string,
  next: NextFunction
) => {
  try {
    if (await redis.get(`otp_lock:${email}`)) {
      return next(
        new ValidationError(
          'Account is locked due to multiple failed attemptes, try again after some time'
        )
      );
    }
    if (await redis.get(`otp_spam_lock:${email}`)) {
      return next(
        new ValidationError('Too many OTP Request! Please wait 1 hour')
      );
    }
    if (await redis.get(`otp_cooldown:${email}`)) {
      return next(
        new ValidationError('Please wait 1 minute before requesting a new OTP')
      );
    }
  } catch (error) {
    console.error('Redis error in checkOtpRestrictions:', error);
    // Continue without Redis checks if Redis is unavailable
    // This allows the application to function even when Redis is down
  }
};

export const trackOtpRequests = async (email: string, next: NextFunction) => {
  const otpRequestKey = `otp_request_count:${email}`;
  let otpRequests = parseInt((await redis.get(otpRequestKey)) || '0');

  if (otpRequests >= 2) {
    await redis.set(`otp_spam_lock:${email}`, 'locked', 'EX', 3600);
    return next(
      new ValidationError(
        'Too many Otp requests. Please wait 1 hour before requesting again'
      )
    );
  }

  await redis.set(otpRequestKey, otpRequests + 1, 'EX', 3600);
};

export const sendOtp = async (
  name: string,
  email: string,
  template: string
) => {
  const otp = crypto.randomInt(1000, 9999).toString();
  await sendEmail(email, 'Verify your email', template, { name, otp });
  await redis.set(`otp:${email}`, otp, 'EX', 3000);
  await redis.set(`otp_cooldown:${email}`, 'true', 'EX', 60);
};

export const verifyOtp = async (
  email: string,
  otp: string,
  next: NextFunction
) => {
  const storedOtp = await redis.get(`otp:${email}`);
  if (!storedOtp) {
    return next(new ValidationError('Invalid or expired Otp'));
  }

  const failedAttemptsKey = `otp_attempts:${email}`;
  const failedAttempts = parseInt((await redis.get(failedAttemptsKey)) || '0');

  if (storedOtp !== otp) {
    if (failedAttempts > 2) {
      await redis.set(`otp_lock:${email}`, 'locked', 'EX', 1800);
      await redis.del(`otp:${email}`, failedAttemptsKey);
      return next(new ValidationError('Too many failed Attempts'));
    }

    await redis.set(failedAttemptsKey, failedAttempts + 1, 'EX', 300);
    return next(
      new ValidationError(`Incorrect Otp. ${2 - failedAttempts} attempts left`)
    );
  }
  await redis.del(`otp:${email}`, failedAttemptsKey);
};

export const handleForgotPassword = async (
  req: Request,
  res: Response,
  next: NextFunction,
  userType: 'user' | 'seller'
) => {
  try {
    const { email } = req.body;
    if (!email) return next(new ValidationError('Email is Required'));

    const user =
      userType === 'user'
        ? await prisma.users.findUnique({ where: { email } })
        : await prisma.sellers.findUnique({ where: { email } });

    if (!user) throw new ValidationError(`${userType} not found`);

    await checkOtpRestrictions(email, next);

    await sendOtp(
      user.name,
      email,
      userType === 'user'
        ? 'forgot-password-user-email'
        : 'forgot-password-seller-email'
    );

    res
      .status(200)
      .json({ message: 'Otp sent to email. Please verify your account' });
  } catch (err) {
    next(err);
  }
};

export const verifyForgotPasswordOtp = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { email, otp } = req.body;
    if (!email || !otp)
      throw new ValidationError('Email and otp are required!');

    await verifyOtp(email, otp, next);
    res
      .status(200)
      .json({ message: 'OTP verified. You can now reset your password' });
  } catch (err) {
    next(err);
  }
};
