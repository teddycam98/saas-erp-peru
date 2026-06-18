const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();
async function main() {
  try {
    const prods = await prisma.producto.findMany({ include: { inventarios: true } });
    console.log("Productos:", JSON.stringify(prods, null, 2));
  } catch (e) {
    console.error(e);
  }
}
main();
