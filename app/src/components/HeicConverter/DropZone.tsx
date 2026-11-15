import { useEffect, useRef, useState } from 'react';
import { FolderOpen, ImageUp, Upload } from 'lucide-react';
import { useIntl } from 'react-intl';

import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { collectDroppedFiles } from '@/utils';

import type { ChangeEvent, DragEvent } from 'react';

interface IDropZoneProps {
  isCompact: boolean;
  isDisabled: boolean;
  onFiles: (files: File[]) => void;
}

export function DropZone({ isCompact, isDisabled, onFiles }: IDropZoneProps) {
  const { formatMessage } = useIntl();
  const [isDragging, setIsDragging] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const folderInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    // webkitdirectory 不在 React 的屬性型別內，改用 DOM 設定
    folderInputRef.current?.setAttribute('webkitdirectory', '');
  }, []);

  const handleDragOver = (event: DragEvent<HTMLDivElement>): void => {
    event.preventDefault();
    if (!isDisabled) setIsDragging(true);
  };

  const handleDragLeave = (event: DragEvent<HTMLDivElement>): void => {
    if (!event.currentTarget.contains(event.relatedTarget as Node | null)) setIsDragging(false);
  };

  const handleDrop = async (event: DragEvent<HTMLDivElement>): Promise<void> => {
    event.preventDefault();
    setIsDragging(false);
    if (isDisabled) return;
    onFiles(await collectDroppedFiles(Array.from(event.dataTransfer.items)));
  };

  const handleInputChange = (event: ChangeEvent<HTMLInputElement>): void => {
    onFiles(Array.from(event.target.files ?? []));
    event.target.value = '';
  };

  const pickerButtons = (
    <div className="flex flex-wrap items-center justify-center gap-2">
      <Button size={isCompact ? 'sm' : 'default'} disabled={isDisabled} onClick={() => fileInputRef.current?.click()}>
        <Upload aria-hidden="true" />
        {formatMessage({ id: isCompact ? 'converter.toolbar.addMore' : 'converter.dropzone.selectFiles' })}
      </Button>
      <Button
        variant="outline"
        size={isCompact ? 'sm' : 'default'}
        disabled={isDisabled}
        onClick={() => folderInputRef.current?.click()}
      >
        <FolderOpen aria-hidden="true" />
        {formatMessage({ id: 'converter.dropzone.selectFolder' })}
      </Button>
    </div>
  );

  return (
    <div
      onDragOver={handleDragOver}
      onDragLeave={handleDragLeave}
      onDrop={handleDrop}
      className={cn(
        'rounded-xl border-2 border-dashed border-border bg-card transition-colors',
        isDragging && 'border-primary bg-primary/5',
        isCompact
          ? 'flex flex-col items-center justify-between gap-3 px-4 py-3 sm:flex-row'
          : 'flex flex-col items-center justify-center gap-3 px-4 py-14 text-center sm:py-20'
      )}
    >
      <div className={cn('flex items-center gap-3', !isCompact && 'flex-col')}>
        <div
          className={cn(
            'flex items-center justify-center rounded-full bg-primary/10 text-primary',
            isCompact ? 'size-9' : 'size-14'
          )}
        >
          <ImageUp aria-hidden="true" className={isCompact ? 'size-4' : 'size-6'} />
        </div>
        <div className={cn(!isCompact && 'space-y-1')}>
          <p className="text-sm font-medium text-foreground">
            {formatMessage({
              id: isDragging ? 'converter.dropzone.active' : 'converter.dropzone.title'
            })}
          </p>
          <p className="text-xs text-muted-foreground">
            {formatMessage({ id: 'converter.dropzone.description' })}
          </p>
        </div>
      </div>
      {pickerButtons}
      <input
        ref={fileInputRef}
        type="file"
        accept=".heic,.heif,image/heic,image/heif"
        multiple
        hidden
        onChange={handleInputChange}
      />
      <input ref={folderInputRef} type="file" multiple hidden onChange={handleInputChange} />
    </div>
  );
}
