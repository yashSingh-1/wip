import express, { Request, Response } from "express";
import cors from "cors";
import dotenv from "dotenv";
import axios from "axios";

// Load environment variables
dotenv.config();

const app = express();
const PORT = 3001;

// Middleware
app.use(cors()); // Enable CORS
app.use(express.json());

// X API Endpoint
const TWITTER_API_URL = "https://api.x.com/2/users/personalized_trends";

// Fetch Twitter Trends Route
app.get("/trends", async (req: Request, res: Response) => {
  try {
    const response = await axios.get(TWITTER_API_URL, {
      headers: {
        Authorization: `Bearer ${process.env.TWITTER_BEARER_TOKEN}`,
        "Content-Type": "application/json",
      },
    });

    res.json(response.data); // Send back the trends data
  } catch (error: any) {
    console.error("Error fetching trends:", error.response?.data || error.message);
    res.status(500).json({ error: "Failed to fetch Twitter trends" });
  }
});

// Start Server
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
