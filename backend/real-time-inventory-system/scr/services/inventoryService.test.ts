import { PrismaClient } from "@prisma/client";
import * as inventoryService from "./inventoryService";

const prisma = new PrismaClient();

beforeAll(async () => {
    // Clean up test DB before running tests
    await prisma.reservation.deleteMany();
    await prisma.inventory.deleteMany();
    await prisma.product.deleteMany();
});

afterAll(async () => {
    await prisma.reservation.deleteMany();
    await prisma.inventory.deleteMany();
    await prisma.product.deleteMany();
    await prisma.$disconnect();
});

describe("inventoryService", () => {
    let product: any;

    beforeEach(async () => {
        // Clean up before each test
        await prisma.reservation.deleteMany();
        await prisma.inventory.deleteMany();
        await prisma.product.deleteMany();
        product = await inventoryService.createProduct("Test Product");
    });

    describe("createProduct", () => {
        it("should create a product with initialized inventory", async () => {
            expect(product).toHaveProperty("id");
            expect(product).toHaveProperty("name", "Test Product");
            expect(product).toHaveProperty("inventory");
            expect(product.inventory.available).toBe(0);
            expect(product.inventory.reserved).toBe(0);
        });
    });

    describe("addInventory", () => {
        it("should increment available inventory", async () => {
            await inventoryService.addInventory(product.id, 10);
            const inventory = await inventoryService.getInventory(product.id);
            expect(inventory?.available).toBe(10);
            expect(inventory?.reserved).toBe(0);
        });
    });

    describe("reserveInventory", () => {
        it("should reserve inventory if enough is available", async () => {
            await inventoryService.addInventory(product.id, 5);
            const result = await inventoryService.reserveInventory(product.id, 3);
            expect(result).toEqual({ success: true });
            const inventory = await inventoryService.getInventory(product.id);
            expect(inventory?.available).toBe(2);
            expect(inventory?.reserved).toBe(3);
            const reservations = await prisma.reservation.findMany({ where: { productId: product.id } });
            expect(reservations.length).toBe(1);
            expect(reservations[0].quantity).toBe(3);
        });

        it("should throw if not enough available inventory", async () => {
            await expect(
                inventoryService.reserveInventory(product.id, 1)
            ).rejects.toThrow("Insufficient stock");
        });
    });

    describe("releaseReservation", () => {
        it("should release reserved inventory back to available", async () => {
            await inventoryService.addInventory(product.id, 5);
            await inventoryService.reserveInventory(product.id, 4);
            const result = await inventoryService.releaseReservation(product.id, 2);
            expect(result).toEqual({ success: true });
            const inventory = await inventoryService.getInventory(product.id);
            expect(inventory?.available).toBe(3);
            expect(inventory?.reserved).toBe(2);
        });

        it("should throw if not enough reserved inventory", async () => {
            await expect(
                inventoryService.releaseReservation(product.id, 1)
            ).rejects.toThrow("Not enough reserved stock");
        });
    });

    describe("getInventory", () => {
        it("should return inventory for a valid product", async () => {
            const inventory = await inventoryService.getInventory(product.id);
            expect(inventory).not.toBeNull();
            expect(inventory?.available).toBe(0);
            expect(inventory?.reserved).toBe(0);
        });

        it("should return null for non-existent product", async () => {
            const inventory = await inventoryService.getInventory(99999);
            expect(inventory).toBeNull();
        });
    });
});