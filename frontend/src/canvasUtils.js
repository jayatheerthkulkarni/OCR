export function getCroppedImg(image, crop, fileName) {
	const canvas = document.createElement('canvas');
	const scaleX = image.naturalWidth / image.width;
	const scaleY = image.naturalHeight / image.height;
	canvas.width = crop.width * scaleX;
	canvas.height = crop.height * scaleY;
	const ctx = canvas.getContext('2d');

	if (!ctx) {
		throw new Error('No 2d context');
	}

	ctx.drawImage(
		image,
		crop.x * scaleX,
		crop.y * scaleY,
		crop.width * scaleX,
		crop.height * scaleY,
		0,
		0,
		crop.width * scaleX,
		crop.height * scaleY
	);

	return new Promise((resolve) => {
		canvas.toBlob((blob) => {
			if (!blob) {
				console.error('Canvas is empty');
				return;
			}
			blob.name = fileName;
			resolve(blob);
		}, 'image/png');
	});
}
