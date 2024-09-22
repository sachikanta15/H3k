import "dotenv/config";
import express from "express";
import cors from "cors"; // Import the cors package
import app from "./app";

// const server = express();

// Enable CORS for all routes
// server.use(cors());


const port = process.env.PORT || 3000; // Fallback to 3000 if PORT is not defined

app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});
