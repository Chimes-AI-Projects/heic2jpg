import { encodeBitmapToJpeg } from './encodeBitmapToJpeg';

/** HEIC 解碼成點陣圖 → 縮到長邊 2048 → 輸出品質 85 的 JPG */
export async function convertHeicToJpg(file: Blob): Promise<Blob> {
  // heic-to 內含約 3.2MB 的 libheif WASM，延遲到第一次轉檔時才載入
  const { heicTo } = await import('heic-to');
  const bitmap = await heicTo({ blob: file, type: 'bitmap' });
  return encodeBitmapToJpeg(bitmap);
}
