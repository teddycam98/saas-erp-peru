import "dotenv/config";
import { prisma } from "../src/lib/prisma";

async function main() {
  console.log("Iniciando Seed de la Base de Datos...");

  // 1. Crear Planes SaaS
  const planes = [
    { nombre: 'Básico', precioMensual: 49.00, precioAnual: 490.00, limiteUsuarios: 3, limiteSucursales: 1, limiteComprobantes: 500 },
    { nombre: 'Profesional', precioMensual: 99.00, precioAnual: 990.00, limiteUsuarios: 10, limiteSucursales: 3, limiteComprobantes: 2000 },
    { nombre: 'Empresarial', precioMensual: 199.00, precioAnual: 1990.00, limiteUsuarios: 50, limiteSucursales: 10, limiteComprobantes: 999999 }
  ];

  for (const plan of planes) {
    await prisma.planSaaS.upsert({
      where: { nombre: plan.nombre },
      update: {},
      create: plan,
    });
  }
  console.log("✅ Planes SaaS creados.");

  // 2. Crear Permisos Base del Sistema
  const permisos = [
    { codigo: 'VENTAS_CREAR', descripcion: 'Permite emitir comprobantes' },
    { codigo: 'INVENTARIO_VER', descripcion: 'Permite visualizar stock' },
    { codigo: 'INVENTARIO_EDITAR', descripcion: 'Permite hacer transferencias y ajustes' },
    { codigo: 'DASHBOARD_VER', descripcion: 'Permite ver los KPIs financieros' },
    { codigo: 'CONFIG_EMPRESA', descripcion: 'Acceso a certificados y ajustes' }
  ];

  for (const p of permisos) {
    await prisma.permiso.upsert({
      where: { codigo: p.codigo },
      update: {},
      create: p,
    });
  }
  console.log("✅ Permisos base inyectados.");

  // 3. Crear Empresa "Plantilla" para Roles Base
  // Debido a que los Roles son Multi-Tenant (dependen del empresaId),
  // creamos una Empresa plantilla de la cual se clonarán los roles al registrar nuevos clientes.
  const empresaPlantilla = await prisma.empresa.upsert({
    where: { ruc: '00000000000' },
    update: {},
    create: {
      subdominio: 'template',
      ruc: '00000000000',
      razonSocial: 'SISTEMA TEMPLATE SAAS',
    }
  });

  const roles = ['OWNER', 'ADMIN', 'VENDEDOR', 'ALMACEN', 'CONTADOR'];
  
  for (const nombre of roles) {
    await prisma.rol.upsert({
      where: { empresaId_nombre: { empresaId: empresaPlantilla.id, nombre } },
      update: {},
      create: { empresaId: empresaPlantilla.id, nombre, descripcion: `Rol base de ${nombre}` }
    });
  }
  console.log("✅ Roles Base creados en la Empresa Plantilla.");

  console.log("Seed completado exitosamente.");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
