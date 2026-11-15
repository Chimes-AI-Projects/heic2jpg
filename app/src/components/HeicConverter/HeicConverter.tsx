import { useIntl } from 'react-intl';
import { toast } from 'sonner';

import { useHeicConversion, useZipDownload } from '@/hooks';
import { useConversionStore } from '@/store';
import { downloadBlob } from '@/utils';

import { ConversionToolbar } from './ConversionToolbar';
import { DropZone } from './DropZone';
import { FileTable } from './FileTable';

import type { IConversionItem } from '@/types';

export function HeicConverter() {
  const { formatMessage } = useIntl();
  const items = useConversionStore(state => state.items);
  const addFiles = useConversionStore(state => state.addFiles);
  const removeItem = useConversionStore(state => state.removeItem);
  const reset = useConversionStore(state => state.reset);
  const { isConverting, totalCount, finishedCount, doneCount, originalBytes, outputBytes, convertAll } =
    useHeicConversion();
  const { isZipping, downloadZip } = useZipDownload();

  const hasItems = items.length > 0;
  const canConvert = items.some(item => item.status === 'pending' || item.status === 'error');

  const handleFiles = (files: File[]): void => {
    const { addedCount, skippedCount } = addFiles(files);
    if (addedCount === 0) {
      toast.warning(formatMessage({ id: 'converter.toast.noneAdded' }));
      return;
    }
    toast.success(formatMessage({ id: 'converter.toast.added' }, { count: addedCount }), {
      description:
        skippedCount > 0
          ? formatMessage({ id: 'converter.toast.skipped' }, { count: skippedCount })
          : undefined
    });
  };

  const handleConvertAll = async (): Promise<void> => {
    const { successCount, failureCount } = await convertAll();
    if (failureCount > 0) {
      toast.error(
        formatMessage(
          { id: 'converter.toast.convertPartial' },
          { success: successCount, failure: failureCount }
        )
      );
      return;
    }
    toast.success(formatMessage({ id: 'converter.toast.convertDone' }, { success: successCount }));
  };

  const handleDownloadZip = async (): Promise<void> => {
    try {
      const count = await downloadZip();
      if (count === 0) {
        toast.warning(formatMessage({ id: 'converter.toast.zipEmpty' }));
        return;
      }
      toast.success(formatMessage({ id: 'converter.toast.zipDone' }, { count }));
    } catch {
      toast.error(formatMessage({ id: 'converter.toast.zipError' }));
    }
  };

  const handleDownloadOne = (item: IConversionItem): void => {
    if (!item.resultBlob) return;
    downloadBlob(item.resultBlob, item.outputPath.split('/').pop() ?? item.outputPath);
  };

  return (
    <div className="flex flex-col gap-4">
      <DropZone isCompact={hasItems} isDisabled={isConverting} onFiles={handleFiles} />
      {hasItems && (
        <>
          <ConversionToolbar
            totalCount={totalCount}
            finishedCount={finishedCount}
            doneCount={doneCount}
            originalBytes={originalBytes}
            outputBytes={outputBytes}
            isConverting={isConverting}
            isZipping={isZipping}
            canConvert={canConvert}
            onConvertAll={handleConvertAll}
            onDownloadZip={handleDownloadZip}
            onClear={reset}
          />
          <FileTable
            items={items}
            isLocked={isConverting}
            onDownload={handleDownloadOne}
            onRemove={removeItem}
          />
        </>
      )}
    </div>
  );
}
