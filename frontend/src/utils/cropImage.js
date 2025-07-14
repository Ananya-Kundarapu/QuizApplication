// src/utils/cropImage.js

export default function getCroppedImg(imageSrc, crop) {
  return new Promise((resolve, reject) => {
    const image = new Image();
    image.crossOrigin = 'anonymous'; // Handles CORS for external images
    image.src = imageSrc;

    image.onload = () => {
      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d');

      // Set canvas size to the cropped area
      canvas.width = crop.width;
      canvas.height = crop.height;

      // Draw cropped image to canvas
      ctx.drawImage(
        image,
        crop.x,
        crop.y,
        crop.width,
        crop.height,
        0,
        0,
        crop.width,
        crop.height
      );

      // Convert to blob
      canvas.toBlob((blob) => {
        if (!blob) {
          return reject(new Error('Canvas is empty'));
        }

        // Optional: name the file if needed
        blob.name = 'cropped.jpeg';

        resolve(blob);
      }, 'image/jpeg', 1); // 1 = max quality
    };

    image.onerror = (err) => {
      reject(new Error('Failed to load image'));
    };
  });
}
