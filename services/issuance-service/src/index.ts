import express, { Request, Response } from "express";
import cors from "cors";
import { CredentialDatabase } from "./database";
import { getWorkerId, validateCredential } from "./utils";
import { Credential, IssuanceResponse, ErrorResponse } from "./types";

const app = express();
const PORT = process.env.PORT || 3001;
const workerId = getWorkerId();

// Middleware
app.use(
  cors({
    origin: "*",
    methods: ["GET", "POST", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization"],
  })
);
app.use(express.json());

// Initialize database
const db = new CredentialDatabase();

// Health check endpoint
app.get("/health", (req: Request, res: Response) => {
  res.json({
    status: "healthy",
    service: "issuance-service",
    workerId,
    timestamp: new Date().toISOString(),
  });
});

// Issue credential endpoint
app.post("/api/issue-credential", (req: Request, res: Response) => {
  try {
    const credential: Credential = req.body;
    const timestamp = new Date().toISOString();

    // Validate credential
    const validation = validateCredential(credential);
    if (!validation.valid) {
      const errorResponse: ErrorResponse = {
        success: false,
        error: validation.error || "Invalid credential",
        workerId,
        timestamp,
      };
      return res.status(400).json(errorResponse);
    }

    // Issue credential
    const result = db.issueCredential(credential, workerId);

    if (!result.success) {
      const response: IssuanceResponse = {
        success: false,
        message: result.message,
        workerId,
        timestamp,
      };
      return res.status(409).json(response);
    }

    const response: IssuanceResponse = {
      success: true,
      message: result.message,
      credential,
      workerId,
      timestamp,
    };

    res.status(201).json(response);
  } catch (error) {
    console.error("Error issuing credential:", error);
    const errorResponse: ErrorResponse = {
      success: false,
      error: "Internal server error",
      workerId,
      timestamp: new Date().toISOString(),
    };
    res.status(500).json(errorResponse);
  }
});

// Get all credentials endpoint (for debugging)
app.get("/api/credentials", (req: Request, res: Response) => {
  try {
    const credentials = db.getAllCredentials();
    res.json({
      success: true,
      credentials,
      count: credentials.length,
      workerId,
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    console.error("Error fetching credentials:", error);
    res.status(500).json({
      success: false,
      error: "Internal server error",
      workerId,
      timestamp: new Date().toISOString(),
    });
  }
});

// Get credential by ID
app.get("/api/credentials/:id", (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const credential = db.getCredentialById(id);

    if (!credential) {
      return res.status(404).json({
        success: false,
        error: "Credential not found",
        workerId,
        timestamp: new Date().toISOString(),
      });
    }

    res.json({
      success: true,
      credential,
      workerId,
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    console.error("Error fetching credential:", error);
    res.status(500).json({
      success: false,
      error: "Internal server error",
      workerId,
      timestamp: new Date().toISOString(),
    });
  }
});

// Graceful shutdown
process.on("SIGTERM", () => {
  console.log("SIGTERM signal received: closing HTTP server");
  db.close();
  process.exit(0);
});

process.on("SIGINT", () => {
  console.log("SIGINT signal received: closing HTTP server");
  db.close();
  process.exit(0);
});

// Start server
if (require.main === module) {
  app.listen(PORT, () => {
    console.log(`Issuance Service running on port ${PORT}`);
    console.log(`Worker ID: ${workerId}`);
  });
}

export { app, db };
