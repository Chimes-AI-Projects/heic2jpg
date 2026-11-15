import { Download, ImageIcon, X } from 'lucide-react';
import { useIntl } from 'react-intl';

import { Button } from '@/components/ui/button';
import { TableCell, TableRow } from '@/components/ui/table';
import { formatBytes } from '@/utils';

import { StatusBadge } from './StatusBadge';

import type { IConversionItem } from '@/types';

interface IFileTableRowProps {
  item: IConversionItem;
  isLocked: boolean;
  onDownload: (item: IConversionItem) => void;
  onRemove: (id: string) => void;
}

export function FileTableRow({ item, isLocked, onDownload, onRemove }: IFileTableRowProps) {
  const { formatMessage } = useIntl();
  const fileName = item.file.name;
  const outputBytes = item.resultBlob?.size;

  return (
    <TableRow>
      <TableCell className="hidden w-16 sm:table-cell">
        <div className="flex size-10 items-center justify-center overflow-hidden rounded-md bg-muted text-muted-foreground">
          {item.previewUrl ? (
            <img src={item.previewUrl} alt="" className="size-full object-cover" />
          ) : (
            <ImageIcon aria-hidden="true" className="size-4" />
          )}
        </div>
      </TableCell>
      <TableCell className="max-w-0">
        <p className="truncate font-medium text-foreground" title={fileName}>
          {fileName}
        </p>
        <p className="truncate text-xs text-muted-foreground" title={item.outputPath}>
          {formatMessage({ id: 'converter.table.output' }, { path: item.outputPath })}
        </p>
      </TableCell>
      <TableCell className="hidden w-32 text-muted-foreground tabular-nums sm:table-cell">
        {outputBytes === undefined ? (
          formatBytes(item.file.size)
        ) : (
          <>
            <p className="text-foreground">{formatBytes(outputBytes)}</p>
            <p className="text-xs">
              {formatMessage({ id: 'converter.table.sizeFrom' }, { original: formatBytes(item.file.size) })}
            </p>
          </>
        )}
      </TableCell>
      <TableCell className="w-24 sm:w-28">
        <StatusBadge status={item.status} errorMessage={item.errorMessage} />
      </TableCell>
      <TableCell className="w-20 sm:w-24">
        <div className="flex justify-end gap-1">
          <Button
            variant="ghost"
            size="icon-sm"
            disabled={item.status !== 'done'}
            aria-label={formatMessage({ id: 'converter.table.download' }, { name: fileName })}
            onClick={() => onDownload(item)}
          >
            <Download aria-hidden="true" />
          </Button>
          <Button
            variant="ghost"
            size="icon-sm"
            disabled={isLocked || item.status === 'converting'}
            aria-label={formatMessage({ id: 'converter.table.remove' }, { name: fileName })}
            onClick={() => onRemove(item.id)}
          >
            <X aria-hidden="true" />
          </Button>
        </div>
      </TableCell>
    </TableRow>
  );
}
