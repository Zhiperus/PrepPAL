import { NextFunction, Request, Response } from 'express';

import { handleInternalError } from '../errors/index.js';
import AuthRepository from '../repositories/auth.repository.js';
import AdminService from '../services/admin.service.js';
// [Fixed] Removed unused LguService import
import UserService from '../services/user.service.js';

export default class AdminController {
  private adminService = new AdminService();
  private userService = new UserService();
  private authRepo = new AuthRepository();

  /**
   * Get dashboard statistics
   */
  getDashboardStats = async (
    _req: Request, // [Fixed] Renamed to _req to suppress 'unused variable' error
    res: Response,
    next: NextFunction,
  ) => {
    try {
      const stats = await this.adminService.getDashboardStats();
      res.status(200).json({ success: true, data: stats });
    } catch (err) {
      handleInternalError(err, next);
    }
  };

  /**
   * Get formatted lgu list
   * (Actually fetches "LGU Admin Users")
   */
  async getLgus(req: Request, res: Response, next: NextFunction) {
    try {
      const { search, page = 1, limit = 10 } = req.query;
      const pageNum = parseInt(page as string, 10);
      const limitNum = parseInt(limit as string, 10);

      const query: Record<string, any> = { role: 'lgu' };
      if (search) {
        query.$or = [
          { householdName: { $regex: search, $options: 'i' } },
          { email: { $regex: search, $options: 'i' } },
          { 'location.city': { $regex: search, $options: 'i' } },
        ];
      }

      // Assuming userService has a count method, or use UserModel directly
      const total = await this.userService.countLguAccounts(query);

      // 2. Get Paginated Data
      const lguAccounts = await this.userService.findLguAccounts(
        query,
        pageNum,
        limitNum,
      );

      const formattedLgus = await Promise.all(
        lguAccounts.map(async (lgu) => {
          const code = lgu.location?.barangayCode;
          if (!code) return null;

          const citizenCount =
            await this.userService.getCitizenCountByLgu(code);

          return {
            id: code,
            userId: lgu._id,
            name: lgu.householdName,
            adminEmail: lgu.email,
            status: 'active',
            region: lgu.location?.region,
            province: lgu.location?.province,
            city: lgu.location?.city,
            barangay: lgu.location?.barangay,
            registeredUsers: citizenCount,
          };
        }),
      );

      // 3. Return Wrapped Response
      return res.status(200).json({
        data: formattedLgus.filter(Boolean),
        meta: {
          total,
          page: pageNum,
          limit: limitNum,
          totalPages: Math.ceil(total / limitNum),
        },
      });
    } catch (error) {
      next(error);
    }
  }
  /**
   * Create new LGU (Creates an Admin User)
   */
  async createLgu(req: Request, res: Response, next: NextFunction) {
    try {
      const {
        name, // "Barangay X Admin"
        adminEmail,
        password,
        region,
        province,
        city,
        barangay,
        cityCode,
        barangayCode,
      } = req.body;

      if (!barangayCode || !cityCode) {
        return res
          .status(400)
          .json({ error: 'City and Barangay Codes are required.' });
      }

      // 1. Check for Duplicate Email
      const existingUser = await this.userService.findByEmail({
        email: adminEmail,
      });
      if (existingUser) {
        return res.status(400).json({ error: 'Email already registered' });
      }

      // 2. Check if an Admin for this Barangay ALREADY exists
      // (Optional: Enforce 1 Admin per Barangay)
      // [Fixed] This method now exists in UserService
      const existingAdmin =
        await this.userService.findLguAdminByCode(barangayCode);
      if (existingAdmin) {
        return res
          .status(400)
          .json({ error: 'An admin for this Barangay already exists.' });
      }

      // 3. Hash Password
      const hashedPassword = await this.authRepo.hashPassword(password);

      // 4. Create the User
      const newUser = await this.userService.createLguAccount({
        email: adminEmail,
        password: hashedPassword,
        householdName: name, // This acts as the LGU Name
        role: 'lgu',
        location: {
          region,
          province,
          city,
          barangay,
          cityCode,
          barangayCode,
        },
        isEmailVerified: true,
        onboardingCompleted: true,
      });

      return res.status(201).json({
        success: true,
        data: {
          id: newUser._id,
          email: newUser.email,
          role: newUser.role,
          location: newUser.location,
        },
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * Update LGU (Updates the Admin User)
   */
  async updateLgu(req: Request, res: Response, next: NextFunction) {
    try {
      // url: /admin/lgus/:barangayCode
      const { barangayCode } = req.params;
      const data = req.body;

      // Find the user responsible for this code
      // [Fixed] This method now exists in UserService
      const adminUser = await this.userService.findLguAdminByCode(barangayCode);

      if (!adminUser) {
        return res
          .status(404)
          .json({ error: 'LGU Admin not found for this code' });
      }

      // Update that user
      // [Fixed] This method now exists in UserService
      const updatedUser = await this.userService.updateUser(
        adminUser._id.toString(),
        {
          householdName: data.name, // Update display name
          email: data.adminEmail,
          // ... map other fields as needed
        },
      );

      return res.status(200).json(updatedUser);
    } catch (error) {
      next(error);
    }
  }
}
