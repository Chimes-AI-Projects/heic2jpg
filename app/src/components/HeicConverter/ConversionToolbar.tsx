import { Download, Play, Trash2 } from 'lucide-react';
import { useIntl } from 'react-intl';

import { Button } from '@/components/ui/button';
import { Progress, ProgressLabel, ProgressValue } from '@/components/ui/progress';
import { Spinner } from '@/components/ui/spinner';
import { formatBytes } from '@/utils';

interface IConversionToolbarProps {
  totalCount: number;
  finishedCount: number;
  doneCount: number;
  originalBytes: number;
  outputBytes: number;
  isConverting: boolean;
  isZipping: boolean;
  canConvert: boolean;
  onConvertAll: () => void;
  onDownloadZip: () => void;
  onClear: () => void;
}

export function ConversionToolbar({
  totalCount,
  finishedCount,
  doneCount,
  originalBytes,
  outputBytes,
  isConverting,
  isZipping,
  canConvert,
  onConvertAll,
  onDownloadZip,
  onClear
}: IConversionToolbarProps) {
  const { formatMessage } = useIntl();
  const percent = totalCount === 0 ? 0 : Math.round((finishedCount / totalCount) * 100);

  return (
    <div className="flex flex-col gap-4 rounded-xl border border-border bg-card p-4 md:flex-row md:items-center">
      <Progress value={percent} className="flex-1">
        <ProgressLabel>
          {formatMessage(
            { id: 'converter.progress.label' },
            { finished: finishedCount, total: totalCount }
          )}
        </ProgressLabel>
        <ProgressValue />
        {doneCount > 0 && (
          <p className="w-full text-xs text-muted-foreground">
            {formatMessage(
              { id: 'converter.progress.outputTotal' },
              { original: formatBytes(originalBytes), output: formatBytes(outputBytes) }
            )}
          </p>
        )}
      </Progress>
      <div className="flex flex-wrap gap-2">
        <Button disabled={!canConvert || isConverting} onClick={onConvertAll}>
          {isConverting ? <Spinner size="sm" aria-hidden="true" /> : <Play aria-hidden="true" />}
          {formatMessage({
            id: isConverting ? 'converter.toolbar.converting' : 'converter.toolbar.convertAll'
          })}
        </Button>
        <Button variant="outline" disabled={doneCount === 0 || isZipping} onClick={onDownloadZip}>
          {isZipping ? <Spinner size="sm" aria-hidden="true" /> : <Download aria-hidden="true" />}
          {formatMessage({
            id: isZipping ? 'converter.toolbar.zipping' : 'converter.toolbar.downloadZip'
          })}
        </Button>
        <Button variant="ghost" disabled={isConverting} onClick={onClear}>
          <Trash2 aria-hidden="true" />
          {formatMessage({ id: 'converter.toolbar.clear' })}
        </Button>
      </div>
    </div>
  );
}
