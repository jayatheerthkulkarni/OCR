import express from "express";
import cors from "cors";
import multer from "multer";
import { performOCR } from "./ocr_engine.js";
import * as storage from "./storage.js";

const app = express();
const PORT = 8000;

// Middleware
app.use(
	cors({
		origin: "*",
		methods: ["*"],
		allowedHeaders: ["*"],
	}),
);

// Parse JSON bodies (increased limit for base64 images in SaveRequest)
app.use(express.json({ limit: "50mb" }));

// Multer setup for file uploads (stores in memory as Buffer)
const upload = multer({ storage: multer.memoryStorage() });

// --- Routes ---

app.get("/", (req, res) => {
	res.json({ status: "ok", service: "OCR Backend (Ollama JS)" });
});

/* * POST /process-crop
 * Expects 'multipart/form-data' with a field named 'file'
 */
app.post("/process-crop", upload.single("file"), async (req, res) => {
	if (!req.file) {
		return res.status(400).json({ detail: "No file uploaded" });
	}

	const start = Date.now();
	try {
		const imageBuffer = req.file.buffer;

		// Use the optimized engine
		const text = await performOCR(imageBuffer);

		const duration = (Date.now() - start) / 1000;
		console.log(
			`Processed '${req.file.originalname}' in ${duration.toFixed(2)}s | Result: ${text.substring(0, 30)}...`,
		);

		res.json({ text: text });
	} catch (e) {
		console.error(`Error processing crop: ${e.message}`);
		res.status(500).json({ detail: e.message });
	}
});

/* * POST /save-batch
 * Expects JSON body: { crops: [ { id, text, image_base64, serial } ] }
 */
app.post("/save-batch", async (req, res) => {
	const request = req.body;

	// Basic validation (replacing Pydantic)
	if (!request.crops || !Array.isArray(request.crops)) {
		return res
			.status(422)
			.json({ detail: "Invalid data: 'crops' array required." });
	}

	console.log(`Saving batch of ${request.crops.length} crops...`);

	try {
		const jsonPath = await storage.saveCropData(request.crops);
		console.log(`Batch saved to: ${jsonPath}`);
		res.json({ status: "success", file: jsonPath });
	} catch (e) {
		console.error(`Error saving batch: ${e.message}`);
		res.status(500).json({ detail: e.message });
	}
});

// Start Server
app.listen(PORT, () => {
	console.log(`Server running at http://localhost:${PORT}`);
});
