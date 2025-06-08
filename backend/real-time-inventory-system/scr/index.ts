import express from "express";
import bodyParser from "body-parser";
import inventoryRoutes from "./routes/inventory";

const app = express();
app.use(bodyParser.json());

app.use("/api", inventoryRoutes);

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));