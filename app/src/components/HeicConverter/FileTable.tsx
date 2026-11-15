import { useIntl } from 'react-intl';

import { Table, TableBody, TableHead, TableHeader, TableRow } from '@/components/ui/table';

import { FileTableRow } from './FileTableRow';

import type { IConversionItem } from '@/types';

interface IFileTableProps {
  items: readonly IConversionItem[];
  isLocked: boolean;
  onDownload: (item: IConversionItem) => void;
  onRemove: (id: string) => void;
}

export function FileTable({ items, isLocked, onDownload, onRemove }: IFileTableProps) {
  const { formatMessage } = useIntl();

  return (
    <div className="overflow-hidden rounded-xl border border-border bg-card">
      <Table className="table-fixed">
        <TableHeader>
          <TableRow>
            <TableHead className="hidden w-16 sm:table-cell">{formatMessage({ id: 'converter.table.preview' })}</TableHead>
            <TableHead>{formatMessage({ id: 'converter.table.name' })}</TableHead>
            <TableHead className="hidden w-32 sm:table-cell">
              {formatMessage({ id: 'converter.table.size' })}
            </TableHead>
            <TableHead className="w-24 sm:w-28">{formatMessage({ id: 'converter.table.status' })}</TableHead>
            <TableHead className="w-20 text-right sm:w-24">
              {formatMessage({ id: 'converter.table.actions' })}
            </TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {items.map(item => (
            <FileTableRow
              key={item.id}
              item={item}
              isLocked={isLocked}
              onDownload={onDownload}
              onRemove={onRemove}
            />
          ))}
        </TableBody>
      </Table>
    </div>
  );
}
