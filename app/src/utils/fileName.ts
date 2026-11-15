import { OUTPUT_EXTENSION, SUPPORTED_FILE_EXTENSIONS, SUPPORTED_MIME_TYPES } from '@/constants';

const BYTE_UNITS = ['B', 'KB', 'MB', 'GB'] as const;

export function isHeicFile(file: Pick<File, 'name' | 'type'>): boolean {
  const lowerName = file.name.toLowerCase();
  const hasHeicExtension = SUPPORTED_FILE_EXTENSIONS.some(ext => lowerName.endsWith(ext));
  const hasHeicMime = (SUPPORTED_MIME_TYPES as readonly string[]).includes(file.type);
  return hasHeicExtension || hasHeicMime;
}

/** 把 HEIC 路徑換成輸出副檔名（.jpg）；沒有副檔名時直接補上 */
export function toOutputPath(path: string): string {
  const lastSlash = path.lastIndexOf('/');
  const lastDot = path.lastIndexOf('.');
  const hasExtension = lastDot > lastSlash + 1;
  return `${hasExtension ? path.slice(0, lastDot) : path}${OUTPUT_EXTENSION}`;
}

/** 取得檔案相對路徑：選資料夾時用 webkitRelativePath，否則用檔名 */
export function getRelativePath(file: File): string {
  return file.webkitRelativePath || file.name;
}

/** 若路徑已被使用，加上 (1)、(2)… 避免 ZIP 內同名檔互相覆蓋 */
export function makeUniquePath(path: string, usedPaths: ReadonlySet<string>): string {
  if (!usedPaths.has(path)) return path;
  const lastDot = path.lastIndexOf('.');
  const base = lastDot > 0 ? path.slice(0, lastDot) : path;
  const extension = lastDot > 0 ? path.slice(lastDot) : '';
  let counter = 1;
  while (usedPaths.has(`${base} (${counter})${extension}`)) counter += 1;
  return `${base} (${counter})${extension}`;
}

export function formatBytes(bytes: number): string {
  if (!Number.isFinite(bytes) || bytes <= 0) return '0 B';
  const exponent = Math.min(Math.floor(Math.log(bytes) / Math.log(1024)), BYTE_UNITS.length - 1);
  const value = bytes / 1024 ** exponent;
  return `${exponent === 0 ? value : value.toFixed(1)} ${BYTE_UNITS[exponent]}`;
}
