import React, { useState } from 'react';
import Cropper from './components/Cropper';
import ReviewList from './components/ReviewList';
import { processCrop, saveBatch } from './api';

function App() {
	const [imageSrc, setImageSrc] = useState(null);
	const [crops, setCrops] = useState([]);
	const [isProcessing, setIsProcessing] = useState(false);
	const [serialCounter, setSerialCounter] = useState(1);
	const [isSaving, setIsSaving] = useState(false);

	const handleImageUpload = (e) => {
		if (e.target.files && e.target.files.length > 0) {
			const reader = new FileReader();
			reader.addEventListener('load', () => setImageSrc(reader.result));
			reader.readAsDataURL(e.target.files[0]);
			// Reset state on new upload
			setCrops([]);
			setSerialCounter(1);
		}
	};

	const handleCropComplete = async (blob, cropData) => {
		// Optimistic UI or wait? Let's wait for OCR but show spinner if needed.
		// User wants "extract images in order of crop... then send to OCR".
		// We can show the crop immediately while OCR runs?
		// Let's keep it simple: Show crop with "Processing..." text, then update.

		// Create local preview URL
		const imageUrl = URL.createObjectURL(blob);

		// Convert blob to base64 for saving later (we need to send it to backend eventually)
		// Actually our api.processCrop sends formData.
		// But for api.saveBatch we need base64 or something. 
		// Let's helper:
		const reader = new FileReader();
		reader.readAsDataURL(blob);
		reader.onloadend = async () => {
			const base64data = reader.result;

			const newCrop = {
				id: Date.now(),
				serial: serialCounter,
				imageUrl: imageUrl,
				image_base64: base64data,
				text: "Processing...",
				cropData: cropData
			};

			setSerialCounter(prev => prev + 1);
			setCrops(prev => [...prev, newCrop]);

			try {
				const result = await processCrop(blob);
				setCrops(prev => prev.map(c =>
					c.id === newCrop.id ? { ...c, text: result.text } : c
				));
			} catch (err) {
				console.error(err);
				setCrops(prev => prev.map(c =>
					c.id === newCrop.id ? { ...c, text: "Error extracting text" } : c
				));
			}
		}
	};

	const handleUpdateText = (id, newText) => {
		setCrops(prev => prev.map(c => (c.id === id ? { ...c, text: newText } : c)));
	};

	const handleRemove = (id) => {
		setCrops(prev => prev.filter(c => c.id !== id));
	}

	const handleSave = async () => {
		setIsSaving(true);
		try {
			await saveBatch(crops);
			alert('Batch saved successfully to output folder!');
		} catch (err) {
			console.error(err);
			alert('Failed to save batch.');
		} finally {
			setIsSaving(false);
		}
	};

	return (
		<div className="min-h-screen bg-white text-black font-sans">
			<header className="border-b-2 border-black p-4 mb-4">
				<div className="container mx-auto flex justify-between items-center">
					<h1 className="text-2xl font-bold uppercase tracking-wider">OCR Cropper</h1>
					<div className="flex gap-4 items-center">
						<input
							type="file"
							accept="image/*"
							onChange={handleImageUpload}
							className="file:mr-4 file:py-2 file:px-4 file:border-2 file:border-black file:text-sm file:font-bold file:bg-white file:text-black hover:file:bg-black hover:file:text-white transition-colors cursor-pointer"
						/>
						<button
							onClick={handleSave}
							disabled={crops.length === 0 || isSaving}
							className="px-6 py-2 bg-black text-white border-2 border-black font-bold hover:bg-white hover:text-black transition-colors disabled:opacity-50 disabled:cursor-not-allowed uppercase text-sm tracking-wide"
						>
							{isSaving ? 'Saving...' : 'Save Batch'}
						</button>
					</div>
				</div>
			</header>

			<main className="container mx-auto px-4 flex gap-6 h-[calc(100vh-100px)]">
				{/* Left: Cropper */}
				<div className="w-2/3 h-full flex flex-col border-2 border-black rounded-none">
					<div className="p-3 border-b-2 border-black font-bold text-lg uppercase bg-white">Image Source</div>
					<div className="flex-grow overflow-auto p-4 flex items-center justify-center bg-gray-50">
						{imageSrc ? (
							<Cropper imageSrc={imageSrc} onCrop={handleCropComplete} />
						) : (
							<div className="text-gray-400 font-mono">UPLOAD AN IMAGE TO START</div>
						)}
					</div>
				</div>

				{/* Right: Review List */}
				<div className="w-1/3 h-full flex flex-col border-2 border-black rounded-none">
					<div className="p-3 border-b-2 border-black font-bold text-lg uppercase bg-white">Extracted Crops ({crops.length})</div>
					<div className="flex-grow overflow-hidden bg-white">
						<ReviewList crops={crops} onUpdateText={handleUpdateText} onRemove={handleRemove} />
					</div>
				</div>
			</main>
		</div>
	);
}

export default App;
