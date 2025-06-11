import { Request, Response, NextFunction } from "express";

/**
 * Middleware to authorize users based on their role
 * @param roles - Array of allowed roles
 */
export const authorize = (roles: string[]) => {
  return (req: Request, res: Response, next: NextFunction): void => {
    try {
      // Check if user exists in request (set by authenticate middleware)
      const user = (req as any).user;

      console.log(
        `[Auth Debug] authorize middleware - path: ${req.method} ${req.path}`
      );
      console.log(`[Auth Debug] User from request:`, JSON.stringify(user));
      console.log(`[Auth Debug] Required roles:`, roles);

      if (!user) {
        console.log(
          "[Auth Debug] No user in request - authentication required"
        );
        res.status(401).json({ error: "Authentication required" });
        return;
      }

      // Make case-insensitive comparison for role
      const userRole = user.role?.toLowerCase();
      const allowedRoles = roles.map((r) => r.toLowerCase());

      console.log(
        `[Auth Debug] User role: ${userRole}, Allowed roles: ${allowedRoles}`
      );

      if (!userRole || !allowedRoles.includes(userRole)) {
        console.log(
          `[Auth Debug] Role '${userRole}' not in allowed roles: [${allowedRoles.join(
            ", "
          )}]`
        );
        res
          .status(403)
          .json({ error: "Unauthorized: Insufficient permissions" });
        return;
      }

      console.log(
        `[Auth Debug] Authorization successful for ${user.id} with role ${userRole}`
      );
      next();
    } catch (error) {
      console.error("[Auth Debug] Authorization error:", error);
      res.status(500).json({ error: "Authorization error" });
    }
  };
};

/**
 * Middleware to check if user is the owner of a resource or an admin
 * @param getUserIdFromResource - Function that extracts the user ID from the resource
 */
export const authorizeResourceAccess = (
  getUserIdFromResource: (req: Request) => Promise<string | null>
) => {
  return async (
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> => {
    try {
      // Check if user exists in request (set by authenticate middleware)
      const user = (req as any).user;

      if (!user) {
        res.status(401).json({ error: "Authentication required" });
        return;
      }

      // If user is admin, allow access
      if (user.role === "admin") {
        next();
        return;
      }

      // Get resource owner ID
      const resourceOwnerId = await getUserIdFromResource(req);

      // If resource not found
      if (resourceOwnerId === null) {
        res.status(404).json({ error: "Resource not found" });
        return;
      }

      // Check if user is the owner
      if (user.id !== resourceOwnerId) {
        res.status(403).json({
          error:
            "Unauthorized: You do not have permission to access this resource",
        });
        return;
      }

      next();
    } catch (error) {
      res.status(500).json({ error: "Authorization error" });
    }
  };
};
