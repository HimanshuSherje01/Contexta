import "dotenv/config";
import fs from "fs";
import path from "path";
import express from "express";
import cors from "cors";
import mongoose from "mongoose";
import { connectDB } from "./src/config/db.js";
import authRoutes from "./src/routes/authRoutes.js";
import documentRoutes from "./src/routes/documentRoutes.js";
import chatRoutes from "./src/routes/chatRoutes.js";
import { checkOllamaHealth } from "./src/services/llmService.js";
import User from "./src/models/User.js";
import Document from "./src/models/Document.js";
import RagChunk from "./src/models/RagChunk.js";

async function runHttpApiSuite() {
  console.log("==================================================");
  console.log("    HTTP API INTEGRATION VERIFICATION SUITE       ");
  console.log("==================================================\n");

  await connectDB();

  // Create Express App on test port 5055
  const app = express();
  app.use(express.json());
  app.use(cors());

  app.use("/api/auth", authRoutes);
  app.use("/api/documents", documentRoutes);
  app.use("/api", chatRoutes);

  app.get("/api/health", async (req, res) => {
    const mongoStatus = mongoose.connection.readyState === 1 ? "connected" : "disconnected";
    const ollamaHealth = await checkOllamaHealth();
    res.json({
      status: "ok",
      services: {
        database: { status: mongoStatus },
        llm: ollamaHealth,
      },
    });
  });

  const TEST_PORT = 5055;
  const server = app.listen(TEST_PORT);
  const BASE_URL = `http://localhost:${TEST_PORT}/api`;
  console.log(`Test Express server running at ${BASE_URL}\n`);

  try {
    // 1. Health check
    console.log("[HTTP TEST 1] Verifying /api/health endpoint...");
    const healthRes = await fetch(`${BASE_URL}/health`);
    const healthData = await healthRes.json();
    console.log("Health Check:", healthData);
    if (healthData.status !== "ok" || !healthData.services.llm.ok) {
      throw new Error("Health check failed");
    }
    console.log("✓ HTTP TEST 1 PASSED: /api/health returns status ok.\n");

    // 2. User registration
    console.log("[HTTP TEST 2] Registering user via POST /api/auth/register...");
    const userEmail = `http_test_${Date.now()}@example.com`;
    const regRes = await fetch(`${BASE_URL}/auth/register`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        name: "Test Runner",
        email: userEmail,
        password: "securepassword123",
      }),
    });
    const regData = await regRes.json();
    console.log("Registration Response:", { id: regData._id, email: regData.email });
    if (!regData.token) throw new Error("No token returned on registration");
    const token = regData.token;
    console.log("✓ HTTP TEST 2 PASSED: User registration returned valid JWT token.\n");

    // 3. User login
    console.log("[HTTP TEST 3] Logging in via POST /api/auth/login...");
    const loginRes = await fetch(`${BASE_URL}/auth/login`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        email: userEmail,
        password: "securepassword123",
      }),
    });
    const loginData = await loginRes.json();
    if (!loginData.token) throw new Error("Login failed");
    console.log("✓ HTTP TEST 3 PASSED: Login succeeded.\n");

    // 4. Invalid file upload test
    console.log("[HTTP TEST 4] Testing invalid file upload (text file instead of PDF)...");
    const badFormData = new FormData();
    badFormData.append(
      "file",
      new Blob(["this is a plain text file, not a pdf"], { type: "text/plain" }),
      "test.txt"
    );

    const badUploadRes = await fetch(`${BASE_URL}/documents/upload`, {
      method: "POST",
      headers: { Authorization: `Bearer ${token}` },
      body: badFormData,
    });
    const badUploadData = await badUploadRes.json();
    console.log("Bad upload response (HTTP " + badUploadRes.status + "):", badUploadData);
    if (badUploadRes.status !== 400 || !badUploadData.message.includes("Only PDF files")) {
      throw new Error("Invalid file upload was not rejected properly");
    }
    console.log("✓ HTTP TEST 4 PASSED: Non-PDF upload correctly rejected with 400.\n");

    // 5. Valid PDF upload test
    console.log("[HTTP TEST 5] Uploading real PDF via multipart/form-data POST /api/documents/upload...");
    const samplePdfPath = path.join(process.cwd(), "documents", "Operating_System.pdf");
    const pdfBuffer = fs.readFileSync(samplePdfPath);

    const goodFormData = new FormData();
    goodFormData.append(
      "file",
      new Blob([pdfBuffer], { type: "application/pdf" }),
      "Operating_System_HttpTest.pdf"
    );

    const uploadRes = await fetch(`${BASE_URL}/documents/upload`, {
      method: "POST",
      headers: { Authorization: `Bearer ${token}` },
      body: goodFormData,
    });
    const uploadData = await uploadRes.json();
    console.log("Upload Response (HTTP " + uploadRes.status + "):", uploadData);
    if (uploadRes.status !== 201 || !uploadData.documentId) {
      throw new Error("PDF upload failed");
    }
    const documentId = uploadData.documentId;
    console.log(`Document created with ID: ${documentId} (status: ${uploadData.status})`);
    console.log("✓ HTTP TEST 5 PASSED: PDF uploaded and background processing initiated.\n");

    // 6. Polling document status
    console.log("[HTTP TEST 6] Polling GET /api/documents/:id until status is 'ready'...");
    let docStatus = "processing";
    let attempts = 0;
    while (docStatus === "processing" && attempts < 30) {
      attempts++;
      await new Promise((r) => setTimeout(r, 2000));
      const pollRes = await fetch(`${BASE_URL}/documents/${documentId}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const pollData = await pollRes.json();
      docStatus = pollData.status;
      console.log(`[Poll #${attempts}] Status: ${docStatus}, Chunks: ${pollData.chunkCount}`);
      if (docStatus === "ready") break;
      if (docStatus === "failed") {
        throw new Error(`Processing failed: ${pollData.errorMessage}`);
      }
    }

    if (docStatus !== "ready") {
      throw new Error("Document did not reach 'ready' state in time");
    }
    console.log("✓ HTTP TEST 6 PASSED: Document processed to 'ready' status.\n");

    // Wait 3 seconds for Atlas Search index to sync
    console.log("Waiting 3s for Atlas vector index synchronization...");
    await new Promise((r) => setTimeout(r, 3500));

    // 7. Get documents list
    console.log("[HTTP TEST 7] Fetching document list via GET /api/documents...");
    const listRes = await fetch(`${BASE_URL}/documents`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    const listData = await listRes.json();
    console.log(`User has ${listData.length} document(s) in list.`);
    const foundDoc = listData.find((d) => d._id === documentId);
    if (!foundDoc) throw new Error("Uploaded document not in user's document list");
    console.log("✓ HTTP TEST 7 PASSED: Document list returned uploaded document.\n");

    // 8. RAG Chat query via HTTP POST /api/chat
    console.log("[HTTP TEST 8] Sending RAG question via POST /api/chat...");
    const chatRes = await fetch(`${BASE_URL}/chat`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({
        documentId: documentId,
        question: "What is a process in an operating system?",
      }),
    });
    const chatData = await chatRes.json();
    console.log("\n--- HTTP Chat Answer ---");
    console.log(chatData.answer);
    console.log("\n--- HTTP Chat Sources ---");
    console.log(chatData.sources);

    if (!chatData.answer || !chatData.sources || chatData.sources.length === 0) {
      throw new Error("Chat did not return grounded answer or sources");
    }
    console.log("✓ HTTP TEST 8 PASSED: Scoped RAG response generated and returned over HTTP.\n");

    // 9. Document Deletion
    console.log("[HTTP TEST 9] Deleting document via DELETE /api/documents/:id...");
    const delRes = await fetch(`${BASE_URL}/documents/${documentId}`, {
      method: "DELETE",
      headers: { Authorization: `Bearer ${token}` },
    });
    const delData = await delRes.json();
    console.log("Delete Response:", delData);
    if (delRes.status !== 200) throw new Error("Delete failed");

    const remainingChunks = await RagChunk.countDocuments({ documentId });
    if (remainingChunks !== 0) throw new Error("Chunks were not deleted");
    console.log("✓ HTTP TEST 9 PASSED: Document and all chunks deleted cleanly.\n");

    // Cleanup test user
    await User.deleteMany({ email: userEmail });

    console.log("==================================================");
    console.log("  ALL HTTP API VERIFICATION TESTS PASSED!         ");
    console.log("==================================================");
  } finally {
    server.close();
    process.exit(0);
  }
}

runHttpApiSuite().catch((err) => {
  console.error("HTTP API Test suite failed:", err);
  process.exit(1);
});
