import React from 'react';

export default function ReviewList({ crops, onUpdateText, onRemove }) {
	if (crops.length === 0) {
		return <div className="text-gray-400 text-center py-4">No crops yet. Start cropping!</div>;
	}

	return (
		<div className="space-y-4 mt-4 h-full overflow-y-auto pr-2 px-2">
			{crops.map((crop) => (
				<div key={crop.id} className="flex gap-4 p-4 bg-white border-2 border-black rounded-none">
					<div className="w-1/3 flex-shrink-0">
						<div className="text-xs font-mono font-bold text-black mb-1 border-b border-black inline-block">#{crop.serial}</div>
						<img src={crop.imageUrl} alt={`Crop ${crop.serial}`} className="w-full h-auto border border-black" />
					</div>
					<div className="flex-grow flex flex-col">
						<label className="text-xs font-bold text-black uppercase mb-1">Extracted Text</label>
						<textarea
							className="w-full flex-grow p-2 border-2 border-black rounded-none resize-none focus:ring-0 focus:outline-none focus:bg-gray-50 font-mono text-sm"
							value={crop.text}
							onChange={(e) => onUpdateText(crop.id, e.target.value)}
							rows={3}
						/>
						<button
							onClick={() => onRemove(crop.id)}
							className="self-end mt-2 text-black text-xs hover:bg-black hover:text-white px-2 py-1 border border-black uppercase font-bold transition-colors"
						>
							Remove
						</button>
					</div>
				</div>
			))}
		</div>
	);
}
