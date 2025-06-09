import express from "express";
import bodyParser from "body-parser";
import inventoryRoutes from "../../Inventory-Service/inventory";
import startGrpcServer  from "./inventoryService"; // Export a startGrpcServer() from inventoryService.ts

const app = express();
app.use(bodyParser.json());
app.use("/api", inventoryRoutes);

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`REST server running on port ${PORT}`));

// Start gRPC server
startGrpcServer();