import { NextFunction, Request, Response } from 'express';
import { Types } from 'mongoose';

import { handleInternalError } from '../errors/index.js';
import LguModel from '../models/lgu.model.js';
import UserModel from '../models/user.model.js';
import AuthRepository from '../repositories/auth.repository.js';
import AdminService from '../services/admin.service.js';

export default class AdminController {
  private adminService = new AdminService();
  private authRepo = new AuthRepository();

  /**
   * Get dashboard statistics for admin panel
   * Path: GET /admin/stats
   * Access: Protected - super_admin only
   */
  getDashboardStats = async (
    req: Request,
    res: Response,
    next: NextFunction,
  ) => {
    try {
      const stats = await this.adminService.getDashboardStats();

      res.status(200).json({
        success: true,
        data: stats,
      });
    } catch (err) {
      handleInternalError(err, next);
    }
  };

  async getLgus(req: any, res: any, next: any) {
    try {
      const { search, page = 1, limit = 10 } = req.query;

      // 1. Fetch LGUs
      const query: any = { role: 'lgu' };
      if (search) {
        query.$or = [
          { householdName: { $regex: search, $options: 'i' } },
          { email: { $regex: search, $options: 'i' } },
          { 'location.city': { $regex: search, $options: 'i' } },
        ];
      }

      const lguAccounts = await UserModel.find(query)
        .limit(Number(limit))
        .skip((Number(page) - 1) * Number(limit))
        .sort({ createdAt: -1 });

      // 2. Count with "Double Check" Logic
      const formattedLgus = await Promise.all(
        lguAccounts.map(async (lgu) => {
          const citizenCount = await UserModel.countDocuments({
            $or: [
              { lguId: lgu.lguId }, // Match if stored as ObjectId
            ],
            role: 'citizen',
          });

          const lguInfo = await LguModel.findById(lgu.lguId);

          return {
            id: lgu._id,
            name: lgu.householdName,
            adminEmail: lgu.email,
            status: 'active',
            region: lguInfo?.region,
            province: lguInfo?.province,
            city: lguInfo?.city,
            barangay: lguInfo?.barangay,
            registeredUsers: citizenCount,
          };
        }),
      );

      return res.status(200).json(formattedLgus);
    } catch (error) {
      next(error);
    }
  }

  // POST /admin/lgus
  async createLgu(req: Request, res: Response, next: NextFunction) {
    try {
      const {
        name, // LGU Name (e.g. "Brgy. Batong Malake")
        adminEmail,
        password,
        region,
        province,
        city,
        barangay,
      } = req.body;

      // 1. VALIDATION: Check for existing LGU Name OR Email
      // We check both to prevent data conflicts
      const existingLgu = await LguModel.findOne({ name });
      if (existingLgu) {
        return res.status(400).json({ error: 'LGU name already registered' });
      }

      const existingUser = await UserModel.findOne({ email: adminEmail });
      if (existingUser) {
        return res.status(400).json({ error: 'Email already registered' });
      }

      // 2. CREATE LGU DOCUMENT
      // This holds the location data, so we don't need to duplicate it in the User
      const newLgu = await LguModel.create({
        name,
        region,
        province,
        city,
        barangay,
      });

      // 3. HASH PASSWORD
      const hashedPassword = await this.authRepo.hashPassword(password);

      // 4. CREATE USER DOCUMENT (Admin)
      const newUser = await UserModel.create({
        email: adminEmail,
        password: hashedPassword,

        // Map LGU Name to householdName so it shows up nicely in the UI profile
        householdName: name,

        role: 'lgu', // Important: Set role to LGU
        lguId: newLgu._id, // LINKING: This connects the User to the LGU Model

        // We skip 'location' here because it exists in the LguModel (newLgu)
        location: {},

        // Admin accounts are usually considered verified/onboarded immediately
        isEmailVerified: true,
        onboardingCompleted: true,
      });

      // 5. Return success (usually returning the LGU details is sufficient)
      return res.status(201).json({
        lgu: newLgu,
        admin: {
          id: newUser._id,
          email: newUser.email,
          role: newUser.role,
        },
      });
    } catch (error) {
      // If user creation fails, you might want to cleanup the LguModel created in step 2
      // but for simple apps, standard error handling is often enough.
      next(error);
    }
  }
  // PATCH /admin/lgus/:lguId
  async updateLgu(req: Request, res: Response, next: NextFunction) {
    try {
      const { lguId } = req.params;
      const data = req.body;

      if (!Types.ObjectId.isValid(lguId)) {
        return res.status(400).json({ error: 'Invalid LGU ID' });
      }

      const updatedLgu = await LguModel.findByIdAndUpdate(
        lguId,
        { $set: data },
        { new: true, runValidators: true },
      );

      if (!updatedLgu) {
        return res.status(404).json({ error: 'LGU not found' });
      }

      return res.status(200).json(updatedLgu);
    } catch (error) {
      next(error);
    }
  }
}
