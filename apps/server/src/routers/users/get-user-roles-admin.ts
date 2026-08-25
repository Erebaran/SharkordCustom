import { Permission } from '@sharkord/shared';
import { eq } from 'drizzle-orm';
import { z } from 'zod';
import { db } from '../../db';
import { roles, userRoles } from '../../db/schema';
import { protectedProcedure } from '../../utils/trpc';

const getUserRolesAdminRoute = protectedProcedure
  .input(
    z.object({
      userId: z.number()
    })
  )
  .query(async ({ ctx, input }) => {
    await ctx.needsPermission(Permission.MANAGE_USERS);

    const [allRoles, assignedRows] = await Promise.all([
      db.select().from(roles),
      db
        .select({
          roleId: userRoles.roleId
        })
        .from(userRoles)
        .where(eq(userRoles.userId, input.userId))
    ]);

    return {
      roles: allRoles,
      userRoleIds: assignedRows.map((row) => row.roleId)
    };
  });

export { getUserRolesAdminRoute };
