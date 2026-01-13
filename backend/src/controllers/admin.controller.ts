import { NextFunction, Request, Response } from 'express';
import { Types } from 'mongoose';

import { handleInternalError } from '../errors/index.js';
import LguModel from '../models/lgu.model.js';
import UserModel from '../models/user.model.js';
import AuthRepository from '../repositories/auth.repository.js';
import AdminService from '../services/admin.service.js';
import LguService from '../services/lgu.service.js';
import UserService from '../services/user.service.js';

export default class AdminController {
  private adminService = new AdminService();
  private userService = new UserService();
  private lguService = new LguService();
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

  /**
   * Get formatted lgu info for admin panel
   * Path: GET /admin/lgus
   * Access: Protected - super_admin only
   */

  async getLgus(req: Request, res: Response, next: NextFunction) {
    try {
      const { search, page = 1, limit = 10 } = req.query;

      const query: any = { role: 'lgu' };
      if (search) {
        query.$or = [
          { householdName: { $regex: search, $options: 'i' } },
          { email: { $regex: search, $options: 'i' } },
          { 'location.city': { $regex: search, $options: 'i' } },
        ];
      }

      const lguAccounts = await this.userService.findLguAccounts(
        query,
        parseInt(page as string, 10),
        parseInt(limit as string, 10),
      );

      const formattedLgus = await Promise.all(
        lguAccounts.map(async (lgu) => {
          const lguId = lgu.lguId?.toString() || lgu._id.toString();
          const citizenCount = await this.userService.getCitizenCountByLgu(
            lguId,
          );
          const lguInfo = await this.lguService.getLguCompleteInfo(lguId);
          return {
            id: lgu.lguId,
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

  /**
   * Update lgu data
   * Path: PATCH /admin/lgus/:lguId
   * Access: Protected - super_admin only
   */
  async createLgu(req: Request, res: Response, next: NextFunction) {
    try {
      const {
        name, // LGU Name
        adminEmail,
        password,
        region,
        province,
        city,
        barangay,
      } = req.body;

      // 1. VALIDATION: Check for existing LGU Name OR Email
      const existingLgu = await this.lguService.findByName({ name });
      if (existingLgu) {
        return res.status(400).json({ error: 'LGU name already registered' });
      }

      const existingUser = await this.userService.findByEmail({
        email: adminEmail,
      });
      if (existingUser) {
        return res.status(400).json({ error: 'Email already registered' });
      }

      // 2. CREATE LGU DOCUMENT
      // This holds the location data, so we don't need to duplicate it in the User
      const newLgu = await this.lguService.createLgu({
        name,
        region,
        province,
        city,
        barangay,
      });

      // 3. HASH PASSWORD
      const hashedPassword = await this.authRepo.hashPassword(password);

      // 4. CREATE USER DOCUMENT (Admin)
      const newUser = await this.userService.createLguAccount({
        email: adminEmail,
        password: hashedPassword,
        householdName: name,
        role: 'lgu',
        lguId: newLgu.id,
        isEmailVerified: true,
        onboardingCompleted: true,
      });

      // 5. Return success
      return res.status(201).json({
        lgu: newLgu,
        admin: {
          id: newUser._id,
          email: newUser.email,
          role: newUser.role,
        },
      });
    } catch (error) {
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

      const updatedLgu = await this.lguService.updateLguData(lguId, data);

      if (!updatedLgu) {
        return res.status(404).json({ error: 'LGU not found' });
      }

      return res.status(200).json(updatedLgu);
    } catch (error) {
      next(error);
    }
  }
}
