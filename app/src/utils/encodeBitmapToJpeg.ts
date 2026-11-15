import { JPEG_BACKGROUND, JPEG_QUALITY, OUTPUT_MAX_EDGE, OUTPUT_MIME_TYPE } from '@/constants';

import { fitWithinMaxEdge } from './imageSize';

type TCanvas = OffscreenCanvas | HTMLCanvasElement;

const createCanvas = (width: number, height: number): TCanvas =>
  typeof OffscreenCanvas !== 'undefined'
    ? new OffscreenCanvas(width, height)
    : Object.assign(document.createElement('canvas'), { width, height });

const canvasToJpeg = (canvas: TCanvas): Promise<Blob> => {
  if (canvas instanceof HTMLCanvasElement) {
    return new Promise((resolve, reject) =>
      canvas.toBlob(
        blob => (blob ? resolve(blob) : reject(new Error('JPEG encoding failed'))),
        OUTPUT_MIME_TYPE,
        JPEG_QUALITY
      )
    );
  }
  return canvas.convertToBlob({ type: OUTPUT_MIME_TYPE, quality: JPEG_QUALITY });
};

/** 縮到長邊上限後用瀏覽器原生編碼器輸出 JPG（透明處補白底） */
export async function encodeBitmapToJpeg(bitmap: ImageBitmap): Promise<Blob> {
  try {
    const { width, height } = fitWithinMaxEdge(bitmap, OUTPUT_MAX_EDGE);
    const canvas = createCanvas(width, height);
    const context = canvas.getContext('2d') as
      | OffscreenCanvasRenderingContext2D
      | CanvasRenderingContext2D
      | null;
    if (!context) throw new Error('Canvas 2D context unavailable');
    context.fillStyle = JPEG_BACKGROUND;
    context.fillRect(0, 0, width, height);
    context.imageSmoothingEnabled = true;
    context.imageSmoothingQuality = 'high';
    context.drawImage(bitmap, 0, 0, width, height);
    return await canvasToJpeg(canvas);
  } finally {
    bitmap.close();
  }
}
