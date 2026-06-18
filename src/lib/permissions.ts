type RoleType = "OWNER" | "ADMIN" | "VENDEDOR" | "ALMACEN" | "CONTADOR";

export const PERMISSIONS = {
  VIEW_DASHBOARD: ["OWNER", "ADMIN", "VENDEDOR", "ALMACEN", "CONTADOR"],
  
  // Usuarios
  MANAGE_USERS: ["OWNER", "ADMIN"],
  
  // Configuracion Empresa
  MANAGE_SETTINGS: ["OWNER"],
  MANAGE_SUBSCRIPTION: ["OWNER"],
  
  // Productos e Inventario
  MANAGE_PRODUCTS: ["OWNER", "ADMIN", "ALMACEN"],
  VIEW_PRODUCTS: ["OWNER", "ADMIN", "VENDEDOR", "ALMACEN", "CONTADOR"],
  MANAGE_INVENTORY: ["OWNER", "ADMIN", "ALMACEN"],
  
  // Ventas y POS
  MANAGE_SALES: ["OWNER", "ADMIN", "VENDEDOR"],
  ISSUE_INVOICES: ["OWNER", "ADMIN", "VENDEDOR"],
  
  // Compras y Proveedores
  MANAGE_PURCHASES: ["OWNER", "ADMIN", "ALMACEN"],
  
  // Reportes y Analitica (IA)
  VIEW_REPORTS: ["OWNER", "ADMIN", "CONTADOR"],
  
  // CRM
  MANAGE_CRM: ["OWNER", "ADMIN", "VENDEDOR"],
} as const;

export type Permission = keyof typeof PERMISSIONS;

export function hasPermission(userRole: string | any, permission: Permission): boolean {
  if (!userRole || typeof userRole !== "string") return false;
  return (PERMISSIONS[permission] as readonly string[]).includes(userRole);
}

export function assertPermission(userRole: string | any, permission: Permission) {
  if (!hasPermission(userRole, permission)) {
    throw new Error(`Unauthorized: Role ${userRole} lacks permission ${permission}`);
  }
}
