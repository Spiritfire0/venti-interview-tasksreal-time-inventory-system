import grpc from '@grpc/grpc-js';
import protoLoader from '@grpc/proto-loader';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();
const packageDef = protoLoader.loadSync('../Proto/inventory.proto');
const proto = grpc.loadPackageDefinition(packageDef) as any;

const server = new grpc.Server();

server.addService(proto.inventory.InventoryService.service, {
  AddStock: async (call: any, callback: any) => {
    const { productId, quantity } = call.request;
    await prisma.inventory.update({
      where: { productId },
      data: { available: { increment: quantity } },
    });
    callback(null, { success: true, message: "Stock added" });
  },

  ReserveStock: async (call: any, callback: any) => {
    const { productId, quantity } = call.request;
    try {
      await prisma.$transaction(async tx => {
        const inv = await tx.inventory.findUnique({ where: { productId } });
        if (!inv || inv.available < quantity)
          throw new Error("Not enough stock");

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
      callback(null, { success: false, message: e.message });
    }
  },

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

server.bindAsync("0.0.0.0:50051", grpc.ServerCredentials.createInsecure(), () => {
  console.log("Inventory gRPC server running on port 50051");
  server.start();
});

export default function startGrpcServer() {
  server.bindAsync("0.0.0.0:50051", grpc.ServerCredentials.createInsecure(), () => {
    console.log("Inventory gRPC server running on port 50051");
    server.start();
  });
}