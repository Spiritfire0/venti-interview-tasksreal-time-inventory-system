import * as grpc from '@grpc/grpc-js';
import * as protoLoader from '@grpc/proto-loader';
import { PrismaClient } from '@prisma/client';

// Initialize Prisma client for database access
const prisma = new PrismaClient();

// Load the gRPC proto definition for inventory service
const packageDef = protoLoader.loadSync(
  __dirname + '/../../Proto/inventory.proto'
);
const proto = grpc.loadPackageDefinition(packageDef) as any;

// Create a new gRPC server instance
const server = new grpc.Server();

// Register the InventoryService with its methods
server.addService(proto.inventory.InventoryService.service, {
  // Add stock to inventory for a product
  AddStock: async (call: any, callback: any) => {
    const { productId, quantity } = call.request;
    await prisma.inventory.update({
      where: { productId },
      data: { available: { increment: quantity } },
    });
    callback(null, { success: true, message: "Stock added" });
  },

  // Reserve stock for a product (decrement available, increment reserved)
  ReserveStock: async (call: any, callback: any) => {
    const { productId, quantity } = call.request;
    try {
      await prisma.$transaction(async tx => {
        // Find current inventory for the product
        const inv = await tx.inventory.findUnique({ where: { productId } });
        if (!inv || inv.available < quantity)
          throw new Error("Not enough stock");

        // Update inventory: decrement available, increment reserved
        await tx.inventory.update({
          where: { productId },
          data: {
            available: { decrement: quantity },
            reserved: { increment: quantity },
          },
        });
      });
      callback(null, { success: true, message: "Reserved" });
    } catch (e) {
      // Handle errors (e.g., not enough stock)
      const message = e instanceof Error ? e.message : String(e);
      callback(null, { success: false, message });
    }
  },

  // Release reserved stock back to available
  ReleaseStock: async (call: any, callback: any) => {
    const { productId, quantity } = call.request;
    await prisma.inventory.update({
      where: { productId },
      data: {
        reserved: { decrement: quantity },
        available: { increment: quantity },
      },
    });
    callback(null, { success: true, message: "Released" });
  },

  // Get inventory details for a product
  GetInventory: async (call: any, callback: any) => {
    const { productId } = call.request;
    const inv = await prisma.inventory.findUnique({ where: { productId } });
    callback(null, {
      available: inv?.available || 0,
      reserved: inv?.reserved || 0,
      total: (inv?.available || 0) + (inv?.reserved || 0),
    });
  }
});

// Function to start the gRPC server
export default function startGrpcServer() {
  server.bindAsync("0.0.0.0:50051", grpc.ServerCredentials.createInsecure(), () => {
    console.log("Inventory gRPC server running on port 50051");
    server.start();
  });
}