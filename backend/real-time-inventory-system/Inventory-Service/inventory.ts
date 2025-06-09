import express from "express";
import { PrismaClient } from "@prisma/client";

const router = express.Router();
const prisma = new PrismaClient();

// Create a product with an associated inventory record
router.post("/products", async (req, res) => {
  try {
    const { name } = req.body;
    // Create product and initialize inventory with 0 available and reserved
    const product = await prisma.product.create({
      data: { name, inventory: { create: { available: 0, reserved: 0 } } },
      include: { inventory: true }
    });
    res.json(product);
  } catch (e) {
    const message = e instanceof Error ? e.message : String(e);
    res.status(400).json({ error: message });
  }
});

// Add stock to a product's inventory
router.post("/inventory/add", async (req, res) => {
  try {
    const { productId, quantity } = req.body;
    // Increment available stock for the given product
    await prisma.inventory.update({
      where: { productId },
      data: { available: { increment: quantity } }
    });
    res.json({ success: true });
  } catch (e) {
    const message = e instanceof Error ? e.message : String(e);
    res.status(400).json({ error: message });
  }
});

// Reserve stock for a product (move from available to reserved)
router.post("/inventory/reserve", async (req, res) => {
  const { productId, quantity } = req.body;
  try {
    // Use a transaction to ensure atomicity
    await prisma.$transaction(async (tx) => {
      // Check if enough stock is available
      const inv = await tx.inventory.findUnique({ where: { productId } });
      if (!inv || inv.available < quantity) throw new Error("Not enough stock");
      // Move stock from available to reserved
      await tx.inventory.update({
        where: { productId },
        data: {
          available: { decrement: quantity },
          reserved: { increment: quantity }
        }
      });
    });
    res.json({ success: true });
  } catch (e) {
    const message = e instanceof Error ? e.message : String(e);
    res.status(400).json({ error: message });
  }
});

// Release reserved stock back to available
router.post("/inventory/release", async (req, res) => {
  const { productId, quantity } = req.body;
  try {
    // Move stock from reserved back to available
    await prisma.inventory.update({
      where: { productId },
      data: {
        reserved: { decrement: quantity },
        available: { increment: quantity }
      }
    });
    res.json({ success: true });
  } catch (e) {
    const message = e instanceof Error ? e.message : String(e);
    res.status(400).json({ error: message });
  }
});

// Get inventory status for a product
router.get("/inventory/:productId", async (req, res) => {
  const productId = Number(req.params.productId);
  try {
    // Fetch inventory record for the product
    const inv = await prisma.inventory.findUnique({ where: { productId } });
    res.json({
      available: inv?.available || 0,
      reserved: inv?.reserved || 0,
      total: (inv?.available || 0) + (inv?.reserved || 0)
    });
  } catch (e) {
    const message = e instanceof Error ? e.message : String(e);
    res.status(400).json({ error: message });
  }
});

export default router;