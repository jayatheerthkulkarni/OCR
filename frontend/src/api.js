const API_URL = "http://localhost:8000";

export const processCrop = async (cropBlob) => {
	const formData = new FormData();
	formData.append('file', cropBlob, 'crop.png');

	const response = await fetch(`${API_URL}/process-crop`, {
		method: 'POST',
		body: formData,
	});

	if (!response.ok) {
		throw new Error('OCR failed');
	}

	return await response.json();
};

export const saveBatch = async (crops) => {
	// crops structure: { id, text, image_base64, serial }
	const response = await fetch(`${API_URL}/save-batch`, {
		method: 'POST',
		headers: {
			'Content-Type': 'application/json',
		},
		body: JSON.stringify({ crops }),
	});

	if (!response.ok) {
		throw new Error('Save failed');
	}

	return await response.json();
};
