import express from "express";
import {
  createProduct,
  addInventory,
  reserveInventory,
  releaseReservation,
  getInventory,
} from "../services/inventoryService";

const router = express.Router();

router.post("/product", async (req, res) => {
  const { name } = req.body;
  const product = await createProduct(name);
  res.json(product);
});

router.post("/inventory/add", async (req, res) => {
  const { productId, amount } = req.body;
  const result = await addInventory(productId, amount);
  res.json(result);
});

router.post("/inventory/reserve", async (req, res) => {
  try {
    const { productId, amount } = req.body;
    const result = await reserveInventory(productId, amount);
    res.json(result);
  } catch (e) {
    res.status(400).json({ error: (e as Error).message });
  }
});

router.post("/inventory/release", async (req, res) => {
  try {
    const { productId, amount } = req.body;
    const result = await releaseReservation(productId, amount);
    res.json(result);
  } catch (e) {
    res.status(400).json({ error: (e as Error).message });
  }
});

router.get("/inventory/:productId", async (req, res) => {
  const productId = parseInt(req.params.productId);
  const inventory = await getInventory(productId);
  res.json(inventory);
});

export default router;