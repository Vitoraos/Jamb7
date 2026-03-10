import express from "express";
import dotenv from "dotenv";
import cors from "cors";
import chatRoutes from "./routes/chatRoutes.js";

dotenv.config();
const app = express();
app.use(cors());
app.use(express.json());

app.use("/api", chatRoutes);

const PORT = process.env.PORT || 4000;
app.listen(PORT, () => console.log(`🚀 Backend running on port ${PORT}`));
