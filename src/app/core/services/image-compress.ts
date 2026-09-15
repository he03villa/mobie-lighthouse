import { Injectable } from '@angular/core';

const MAX_WIDTH = 1920;
const MAX_HEIGHT = 1920;
const QUALITY = 0.8;

@Injectable({ providedIn: 'root' })
export class ImageCompressService {
  async compress(file: File): Promise<File> {
    if (!file.type.startsWith('image/')) {
      return file;
    }

    return new Promise((resolve) => {
      const reader = new FileReader();
      reader.onload = (e) => {
        const img = new Image();
        img.onload = () => {
          let { width, height } = img;

          if (width > MAX_WIDTH || height > MAX_HEIGHT) {
            const ratio = Math.min(MAX_WIDTH / width, MAX_HEIGHT / height);
            width = Math.round(width * ratio);
            height = Math.round(height * ratio);
          }

          const canvas = document.createElement('canvas');
          canvas.width = width;
          canvas.height = height;

          const ctx = canvas.getContext('2d');
          if (!ctx) {
            resolve(file);
            return;
          }

          ctx.drawImage(img, 0, 0, width, height);

          canvas.toBlob(
            (blob) => {
              if (!blob) {
                resolve(file);
                return;
              }
              const compressed = new File([blob], file.name, {
                type: 'image/jpeg',
                lastModified: Date.now(),
              });
              resolve(compressed);
            },
            'image/jpeg',
            QUALITY,
          );
        };
        img.src = e.target?.result as string;
      };
      reader.readAsDataURL(file);
    });
  }
}
