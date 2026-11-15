import { useCallback, useState } from 'react';

import { ZIP_FILE_NAME } from '@/constants';
import { useConversionStore } from '@/store';
import { buildZip, downloadBlob } from '@/utils';

interface IUseZipDownloadResult {
  isZipping: boolean;
  /** 回傳打包進 ZIP 的檔案數；0 表示沒有可下載的檔案 */
  downloadZip: () => Promise<number>;
}

export function useZipDownload(): IUseZipDownloadResult {
  const [isZipping, setIsZipping] = useState(false);

  const downloadZip = useCallback(async (): Promise<number> => {
    const doneItems = useConversionStore
      .getState()
      .items.filter(item => item.status === 'done' && item.resultBlob);
    if (doneItems.length === 0) return 0;

    setIsZipping(true);
    try {
      const zipBlob = await buildZip(doneItems);
      downloadBlob(zipBlob, ZIP_FILE_NAME);
      return doneItems.length;
    } finally {
      setIsZipping(false);
    }
  }, []);

  return { isZipping, downloadZip };
}
