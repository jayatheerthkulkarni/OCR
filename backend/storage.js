import fs from "fs/promises";
import path from "path";

const STORAGE_DIR = "./data";

// Ensure directory exists on startup
await fs
	.mkdir(STORAGE_DIR, { recursive: true })
	.catch((err) => console.error(err));

export const saveCropData = async (cropsData) => {
	const timestamp = Date.now();
	const filename = `batch_${timestamp}.json`;
	const filepath = path.join(STORAGE_DIR, filename);

	// Save pretty-printed JSON
	await fs.writeFile(filepath, JSON.stringify(cropsData, null, 2));

	// Return absolute path or relative path depending on preference
	return path.resolve(filepath);
};
