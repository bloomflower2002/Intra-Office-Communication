import { Navigate, Outlet, useLocation } from 'react-router-dom';
import { useAppSelector } from '../app/hooks';
import type { Role } from '../types';

export function RequireAuth() {
  const status = useAppSelector((s) => s.auth.status);
  const location = useLocation();
  if (status !== 'authenticated') {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }
  return <Outlet />;
}

export function RequireRole({ roles }: { roles: Role[] }) {
  const role = useAppSelector((s) => s.auth.user?.role);
  if (!role || !roles.includes(role)) {
    return <Navigate to="/dashboard" replace />;
  }
  return <Outlet />;
}

import { hasRolePermission } from '../utils/rolePermissions';
import type { Permission } from '../utils/rolePermissions';

export function RequirePermission({ permission, fallbackRoles }: { permission: Permission | string; fallbackRoles?: Role[] }) {
  const role = useAppSelector((s) => s.auth.user?.role);
  if (!role) {
    return <Navigate to="/login" replace />;
  }
  const permitted = hasRolePermission(role, permission) || (fallbackRoles && fallbackRoles.includes(role));
  if (!permitted) {
    return <Navigate to="/dashboard" replace />;
  }
  return <Outlet />;
}
