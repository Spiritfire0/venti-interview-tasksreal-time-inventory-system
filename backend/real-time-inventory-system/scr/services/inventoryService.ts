import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

/**
 * Creates a new product with the specified name and initializes its inventory.
 *
 * @param name - The name of the product to create.
 * @returns A promise that resolves to the created product, including its associated inventory.
 */
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

/**
 * Attempts to reserve a specified amount of inventory for a given product.
 *
 * This function performs the following steps within a database transaction:
 * 1. Checks if the inventory for the specified product exists and has enough available stock.
 * 2. If sufficient stock is available, decrements the available inventory and increments the reserved inventory.
 * 3. Creates a reservation record for the specified product and quantity.
 *
 * @param productId - The unique identifier of the product to reserve inventory for.
 * @param amount - The quantity of inventory to reserve.
 * @returns An object indicating the success of the reservation operation.
 * @throws {Error} If the inventory does not exist or there is insufficient stock to fulfill the reservation.
 */
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

/**
 * Releases a specified amount of reserved inventory for a given product,
 * moving it back to available inventory.
 *
 * This function performs the following steps within a database transaction:
 * 1. Checks if the inventory for the specified product exists and has enough reserved stock.
 * 2. If sufficient reserved stock is available, decrements the reserved inventory and increments the available inventory.
 *
 * @param productId - The unique identifier of the product to release reservation for.
 * @param amount - The quantity of reserved inventory to release.
 * @returns An object indicating the success of the release operation.
 * @throws {Error} If the inventory does not exist or there is not enough reserved stock.
 */
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

/**
 * Retrieves the inventory record for a given product.
 *
 * @param productId - The unique identifier of the product.
 * @returns The inventory record for the specified product, or null if not found.
 */
export async function getInventory(productId: number) {
    return prisma.inventory.findUnique({ where: { productId } });
}