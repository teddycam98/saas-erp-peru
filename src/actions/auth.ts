"use server";

import { prisma } from "@/lib/prisma";
import bcrypt from "bcryptjs";
import { z } from "zod";

const RegistroSchema = z.object({
  empresa_ruc: z.string().length(11, "El RUC debe tener 11 dígitos"),
  empresa_razon_social: z.string().min(3, "Mínimo 3 caracteres"),
  subdominio: z.string().min(3).regex(/^[a-z0-9-]+$/, "Solo letras minúsculas, números y guiones"),
  usuario_nombre: z.string().min(2),
  usuario_email: z.string().email("Correo electrónico inválido"),
  usuario_password: z.string().min(6, "La contraseña debe tener mínimo 6 caracteres")
});

export async function registrarEmpresa(formData: FormData) {
  try {
    const rawData = Object.fromEntries(formData.entries());
    const data = RegistroSchema.parse(rawData);

    // Validar si el RUC o subdominio o email ya existen
    const empresaExiste = await prisma.empresa.findFirst({
      where: {
        OR: [
          { ruc: data.empresa_ruc },
          { subdominio: data.subdominio }
        ]
      }
    });

    if (empresaExiste) {
      return { success: false, error: "El RUC o Subdominio ya están registrados." };
    }

    const emailExiste = await prisma.usuario.findFirst({
      where: { email: data.usuario_email }
    });

    if (emailExiste) {
      return { success: false, error: "El correo ya está en uso." };
    }

    const passwordHash = await bcrypt.hash(data.usuario_password, 10);

    // Obtener roles plantilla (la empresa con RUC 00000000000 creada en el seed)
    const empresaPlantilla = await prisma.empresa.findUnique({ where: { ruc: "00000000000" } });
    const rolesPlantilla = empresaPlantilla ? await prisma.rol.findMany({ where: { empresaId: empresaPlantilla.id } }) : [];

    // Crear Empresa, Sucursal Principal, Roles y Usuario Owner en una transacción
    const resultado = await prisma.$transaction(async (tx) => {
      // 1. Crear Empresa
      const empresa = await tx.empresa.create({
        data: {
          ruc: data.empresa_ruc,
          razonSocial: data.empresa_razon_social,
          subdominio: data.subdominio,
        }
      });

      // 2. Crear Sucursal Principal
      const sucursal = await tx.sucursal.create({
        data: {
          empresaId: empresa.id,
          nombre: "Sede Principal",
        }
      });

      // 3. Clonar Roles para esta nueva empresa
      let ownerRolId = "";
      for (const rolTpl of rolesPlantilla) {
        const nuevoRol = await tx.rol.create({
          data: {
            empresaId: empresa.id,
            nombre: rolTpl.nombre,
            descripcion: rolTpl.descripcion,
          }
        });
        if (nuevoRol.nombre === "OWNER") {
          ownerRolId = nuevoRol.id;
        }
      }

      // 4. Crear Usuario Dueño
      const usuario = await tx.usuario.create({
        data: {
          empresaId: empresa.id,
          sucursalId: sucursal.id,
          nombre: data.usuario_nombre,
          email: data.usuario_email,
          passwordHash,
          rolId: ownerRolId, // ID real del rol clonado
        }
      });

      // 5. Crear Caja Principal
      await tx.caja.create({
        data: {
          sucursalId: sucursal.id,
          nombre: "Caja Principal"
        }
      });

      return { empresa, usuario };
    });

    return { success: true, redirectUrl: `/login` };

  } catch (error: any) {
    console.error("====== ERROR COMPLETO AL REGISTRAR ======", error);
    if (error?.name === "ZodError" && error?.issues) {
      return { success: false, error: error.issues[0].message };
    }
    return { success: false, error: "Ocurrió un error interno al crear la cuenta." };
  }
}
