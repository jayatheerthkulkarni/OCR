import React, { useState, useRef, useEffect } from 'react';
import ReactCrop from 'react-image-crop';
import 'react-image-crop/dist/ReactCrop.css';
import { getCroppedImg } from '../canvasUtils';

export default function Cropper({ imageSrc, onCrop }) {
	const [crop, setCrop] = useState();
	const [completedCrop, setCompletedCrop] = useState();
	const imgRef = useRef(null);

	useEffect(() => {
		const handleKeyDown = async (e) => {
			if (e.key === 'Enter' && completedCrop && imgRef.current) {
				// Prevent default simply to avoid any side effects
				e.preventDefault();

				if (completedCrop.width && completedCrop.height) {
					const blob = await getCroppedImg(imgRef.current, completedCrop, 'crop.png');
					onCrop(blob, completedCrop);
					setCrop(undefined);
					setCompletedCrop(undefined);
				}
			}
		};
		window.addEventListener('keydown', handleKeyDown);
		return () => window.removeEventListener('keydown', handleKeyDown);
	}, [completedCrop, onCrop]);

	return (
		<div className="flex flex-col items-center justify-center p-4 bg-white overflow-auto max-h-[70vh] border border-gray-200 border-dashed">
			<h2 className="text-sm font-bold uppercase tracking-wide text-black mb-4 bg-white border border-black px-3 py-1 shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]">
				Select region & press <span className="bg-black text-white px-1">ENTER</span> to crop
			</h2>
			<ReactCrop
				crop={crop}
				onChange={(_, percentCrop) => setCrop(percentCrop)}
				onComplete={(c) => setCompletedCrop(c)}
				className="border-2 border-black"
			>
				<img ref={imgRef} src={imageSrc} alt="Crop source" className="max-w-full" />
			</ReactCrop>
		</div>
	);
}
