import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

export async function createProduct(name: string) {
  return prisma.product.create({
    data: {
      name,
      inventory: { create: { available: 0, reserved: 0 } },
    },
    include: { inventory: true },
  });
}

export async function addInventory(productId: number, amount: number) {
  return prisma.inventory.update({
    where: { productId },
    data: {
      available: { increment: amount },
    },
  });
}

export async function reserveInventory(productId: number, amount: number) {
  return prisma.$transaction(async (tx) => {
    const inventory = await tx.inventory.findUnique({ where: { productId } });

    if (!inventory || inventory.available < amount) {
      throw new Error("Insufficient stock");
    }

    await tx.inventory.update({
      where: { productId },
      data: {
        available: { decrement: amount },
        reserved: { increment: amount },
      },
    });

    await tx.reservation.create({
      data: { productId, quantity: amount },
    });

    return { success: true };
  });
}

export async function releaseReservation(productId: number, amount: number) {
  return prisma.$transaction(async (tx) => {
    const inventory = await tx.inventory.findUnique({ where: { productId } });

    if (!inventory || inventory.reserved < amount) {
      throw new Error("Not enough reserved stock");
    }

    await tx.inventory.update({
      where: { productId },
      data: {
        reserved: { decrement: amount },
        available: { increment: amount },
      },
    });

    return { success: true };
  });
}

export async function getInventory(productId: number) {
  return prisma.inventory.findUnique({ where: { productId } });
}