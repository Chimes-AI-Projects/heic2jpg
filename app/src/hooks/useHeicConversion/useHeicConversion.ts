import { useCallback, useMemo, useState } from 'react';

import { CONVERSION_CONCURRENCY } from '@/constants';
import { useConversionStore } from '@/store';
import { convertHeicToJpg, getErrorMessage } from '@/utils';

import type { IConversionItem, THeicConverter } from '@/types';

export interface IConversionSummary {
  successCount: number;
  failureCount: number;
}

interface IUseHeicConversionResult {
  isConverting: boolean;
  totalCount: number;
  finishedCount: number;
  doneCount: number;
  errorCount: number;
  /** 已完成項目的原始 HEIC 總大小與輸出 JPG 總大小（bytes） */
  originalBytes: number;
  outputBytes: number;
  convertAll: () => Promise<IConversionSummary>;
}

export function useHeicConversion(
  converter: THeicConverter = convertHeicToJpg,
  concurrency: number = CONVERSION_CONCURRENCY
): IUseHeicConversionResult {
  const items = useConversionStore(state => state.items);
  const updateItem = useConversionStore(state => state.updateItem);
  const [isConverting, setIsConverting] = useState(false);

  const counts = useMemo(() => {
    const doneItems = items.filter(item => item.status === 'done');
    const errorCount = items.filter(item => item.status === 'error').length;
    return {
      doneCount: doneItems.length,
      errorCount,
      finishedCount: doneItems.length + errorCount,
      originalBytes: doneItems.reduce((sum, item) => sum + item.file.size, 0),
      outputBytes: doneItems.reduce((sum, item) => sum + (item.resultBlob?.size ?? 0), 0)
    };
  }, [items]);

  const convertOne = useCallback(
    async (item: IConversionItem): Promise<boolean> => {
      updateItem(item.id, { status: 'converting', errorMessage: undefined });
      try {
        const resultBlob = await converter(item.file);
        const isStillQueued = useConversionStore.getState().items.some(i => i.id === item.id);
        if (!isStillQueued) return true;
        updateItem(item.id, {
          status: 'done',
          resultBlob,
          previewUrl: URL.createObjectURL(resultBlob)
        });
        return true;
      } catch (error: unknown) {
        updateItem(item.id, { status: 'error', errorMessage: getErrorMessage(error) });
        return false;
      }
    },
    [converter, updateItem]
  );

  const convertAll = useCallback(async (): Promise<IConversionSummary> => {
    const queue = useConversionStore
      .getState()
      .items.filter(item => item.status === 'pending' || item.status === 'error');
    if (queue.length === 0) return { successCount: 0, failureCount: 0 };

    setIsConverting(true);
    let cursor = 0;
    let successCount = 0;
    const worker = async (): Promise<void> => {
      while (cursor < queue.length) {
        const next = queue[cursor];
        cursor += 1;
        if (await convertOne(next)) successCount += 1;
      }
    };
    const workerCount = Math.max(1, Math.min(concurrency, queue.length));
    await Promise.all(Array.from({ length: workerCount }, worker));
    setIsConverting(false);
    return { successCount, failureCount: queue.length - successCount };
  }, [concurrency, convertOne]);

  return { isConverting, totalCount: items.length, ...counts, convertAll };
}
