export const SUPPORTED_FILE_EXTENSIONS = ['.heic', '.heif'] as const;
export const SUPPORTED_MIME_TYPES = ['image/heic', 'image/heif'] as const;
/** WASM 解碼很吃記憶體，平行數量不宜過高 */
export const CONVERSION_CONCURRENCY = 2;
export const ZIP_FILE_NAME = 'heic2jpg.zip';
export const THEME_STORAGE_KEY = 'heic2png-theme';
export const DARK_MODE_MEDIA_QUERY = '(prefers-color-scheme: dark)';
/** 輸出 JPG：長邊上限 2048px（4032px 照片約縮到 1/4 大小），品質 85 */
export const OUTPUT_MAX_EDGE = 2048;
export const JPEG_QUALITY = 0.85;
export const OUTPUT_MIME_TYPE = 'image/jpeg';
export const OUTPUT_EXTENSION = '.jpg';
/** JPG 不支援透明，透明區域以白底填滿 */
export const JPEG_BACKGROUND = '#ffffff'; // ds-ignore
