import { NextFunction, Request, Response } from 'express';
import { Types } from 'mongoose';

import { handleInternalError } from '../errors/index.js';
import LguModel from '../models/lgu.model.js';
import UserModel from '../models/user.model.js';
import AdminService from '../services/admin.service.js';

export default class AdminController {
  private adminService = new AdminService();

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

      // 1. Build query to find users who ARE LGUs
      const query: any = { role: 'lgu' };

      if (search) {
        query.$or = [
          { householdName: { $regex: search, $options: 'i' } }, // LGU Name stored in householdName
          { email: { $regex: search, $options: 'i' } },
          { 'location.city': { $regex: search, $options: 'i' } },
        ];
      }

      // 2. Fetch the LGU users
      const lguAccounts = await UserModel.find(query)
        .limit(Number(limit))
        .skip((Number(page) - 1) * Number(limit))
        .sort({ createdAt: -1 });

      // 3. Aggregate citizen counts for each LGU
      const formattedLgus = await Promise.all(
        lguAccounts.map(async (lgu) => {
          // Count citizens that belong to this LGU ID
          const citizenCount = await UserModel.countDocuments({
            lguId: lgu._id,
            role: 'citizen',
          });

          return {
            id: lgu._id,
            name: lgu.householdName, // Mapping householdName to LGU Name
            adminEmail: lgu.email,
            status: 'active', // You can map this to a specific boolean field if needed
            region: lgu.location?.region,
            province: lgu.location?.province,
            city: lgu.location?.city,
            barangay: lgu.location?.barangay,
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
      const { name, adminEmail, region, province, city, barangay } = req.body;

      const existing = await LguModel.findOne({ name });
      if (existing) {
        return res.status(400).json({ error: 'LGU name already registered' });
      }

      const newLgu = await LguModel.create({
        name,
        adminEmail,
        region,
        province,
        city,
        barangay,
        status: 'active',
      });

      return res.status(201).json(newLgu);
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
