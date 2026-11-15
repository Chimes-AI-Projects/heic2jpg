import JSZip from 'jszip';

import type { IConversionItem } from '@/types';

/** 只打包已完成的項目，保留子資料夾結構 */
export async function buildZip(items: readonly IConversionItem[]): Promise<Blob> {
  const zip = new JSZip();
  items
    .filter(item => item.status === 'done' && item.resultBlob)
    .forEach(item => zip.file(item.outputPath, item.resultBlob as Blob));
  return zip.generateAsync({ type: 'blob' });
}
