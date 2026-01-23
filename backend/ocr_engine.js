import ollama from "ollama";

// Configuration
const OLLAMA_MODEL = "qwen2.5vl:7b";

class OCREngine {
	constructor() {
		if (OCREngine.instance) {
			return OCREngine.instance;
		}
		OCREngine.instance = this;
		this.warmup();
	}

	async warmup() {
		console.log(`[OCR-LLM] Connecting to Ollama (${OLLAMA_MODEL})...`);
		try {
			// Check if model is available
			await ollama.show({ model: OLLAMA_MODEL });
			console.log("[OCR-LLM] Ollama connection successful.");
		} catch (error) {
			console.error(
				`[OCR-LLM] Ollama Error: Is Ollama running? ${error.message}`,
			);
		}
	}

	/**
	 * Sends image buffer to Ollama for OCR.
	 * @param {Buffer} imageBuffer
	 * @returns {Promise<string>}
	 */
	async processImage(imageBuffer) {
		try {
			const startTime = Date.now();

			const response = await ollama.chat({
				model: OLLAMA_MODEL,
				messages: [
					{
						role: "user",
						content:
							"The image is a doctor's handwriting(If the image is unclear print the closest medicine/word that makes sense). Output ONLY the text, no conversational filler.",
						images: [imageBuffer], // ollama-js handles Buffer objects directly
					},
				],
			});

			const text = response.message.content.trim();
			const duration = (Date.now() - startTime) / 1000;

			console.log(
				`[OCR-LLM] LLM OCR finished in ${duration.toFixed(2)}s`,
			);
			return text;
		} catch (error) {
			console.error(`[OCR-LLM] Inference Failed: ${error.message}`);
			throw new Error("Could not extract text via Ollama.");
		}
	}
}

// Singleton instance export
const engine = new OCREngine();
export const performOCR = (imageBuffer) => engine.processImage(imageBuffer);
