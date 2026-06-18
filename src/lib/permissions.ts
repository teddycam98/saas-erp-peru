import { Rol } from "@prisma/client";

export const PERMISSIONS = {
  VIEW_DASHBOARD: [Rol.OWNER, Rol.ADMIN, Rol.VENDEDOR, Rol.ALMACEN, Rol.CONTADOR],
  
  // Usuarios
  MANAGE_USERS: [Rol.OWNER, Rol.ADMIN],
  
  // Configuracion Empresa
  MANAGE_SETTINGS: [Rol.OWNER],
  MANAGE_SUBSCRIPTION: [Rol.OWNER],
  
  // Productos e Inventario
  MANAGE_PRODUCTS: [Rol.OWNER, Rol.ADMIN, Rol.ALMACEN],
  VIEW_PRODUCTS: [Rol.OWNER, Rol.ADMIN, Rol.VENDEDOR, Rol.ALMACEN, Rol.CONTADOR],
  MANAGE_INVENTORY: [Rol.OWNER, Rol.ADMIN, Rol.ALMACEN],
  
  // Ventas y POS
  MANAGE_SALES: [Rol.OWNER, Rol.ADMIN, Rol.VENDEDOR],
  ISSUE_INVOICES: [Rol.OWNER, Rol.ADMIN, Rol.VENDEDOR],
  
  // Compras y Proveedores
  MANAGE_PURCHASES: [Rol.OWNER, Rol.ADMIN, Rol.ALMACEN],
  
  // Reportes y Analitica (IA)
  VIEW_REPORTS: [Rol.OWNER, Rol.ADMIN, Rol.CONTADOR],
  
  // CRM
  MANAGE_CRM: [Rol.OWNER, Rol.ADMIN, Rol.VENDEDOR],
} as const;

export type Permission = keyof typeof PERMISSIONS;

export function hasPermission(userRole: Rol, permission: Permission): boolean {
  return PERMISSIONS[permission].includes(userRole);
}

export function assertPermission(userRole: Rol, permission: Permission) {
  if (!hasPermission(userRole, permission)) {
    throw new Error(`Unauthorized: Role ${userRole} lacks permission ${permission}`);
  }
}
