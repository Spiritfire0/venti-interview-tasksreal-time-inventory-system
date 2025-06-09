import express from "express";
import bodyParser from "body-parser";
import inventoryRoutes from "../../Inventory-Service/inventory";
import startGrpcServer  from "./inventoryService"; // Export a startGrpcServer() from inventoryService.ts

const app = express();
app.use(bodyParser.json());
app.use("/api", inventoryRoutes);

/**
 * The port number on which the server will listen for incoming connections.
 * 
 * @remarks
 * - If the `PORT` environment variable is set, its value will be used.
 * - If not set, the default port `3000` will be used.
 * 
 * @example
 * // To run the server on port 4000:
 * // In the terminal, set the environment variable before starting the server:
 * // $ PORT=4000 node dist/index.js
 */
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`REST server running on port ${PORT}`));

// Start gRPC server
startGrpcServer();