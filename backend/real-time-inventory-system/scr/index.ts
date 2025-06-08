// Import the express framework
import express from "express";
// Import body-parser middleware to parse JSON request bodies
import bodyParser from "body-parser";
// Import inventory-related routes
import inventoryRoutes from "./routes/inventory";

// Create an instance of the express application
const app = express();

// Use body-parser middleware to parse incoming JSON requests
app.use(bodyParser.json());

// Mount inventory routes under the "/api" path
app.use("/api", inventoryRoutes);

// Set the port from environment variable or default to 3000
const PORT = process.env.PORT || 3000;

// Start the server and log the port it's running on
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));