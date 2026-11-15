import { describe, expect, it } from 'vitest';

import { collectDroppedFiles } from '../collectDroppedFiles';

import type { TDroppedItem } from '../collectDroppedFiles';

type TEntry = NonNullable<ReturnType<NonNullable<TDroppedItem['webkitGetAsEntry']>>>;

const fileEntry = (fullPath: string): TEntry => ({
  isFile: true,
  isDirectory: false,
  fullPath,
  file: onSuccess => onSuccess(new File(['x'], fullPath.split('/').pop() ?? ''))
});

const dirEntry = (fullPath: string, children: TEntry[]): TEntry => {
  const batches = [children, []];
  return {
    isFile: false,
    isDirectory: true,
    fullPath,
    createReader: () => ({ readEntries: onSuccess => onSuccess(batches.shift() ?? []) })
  };
};

const asItem = (entry: TEntry | null, file: File | null = null): TDroppedItem => ({
  kind: 'file',
  getAsFile: () => file,
  webkitGetAsEntry: () => entry
});

describe('collectDroppedFiles', () => {
  it('returns an empty list for no items', async () => {
    expect(await collectDroppedFiles([])).toEqual([]);
  });

  it('reads plain files', async () => {
    const files = await collectDroppedFiles([asItem(fileEntry('/a.heic'))]);
    expect(files.map(f => f.webkitRelativePath)).toEqual(['a.heic']);
  });

  it('walks folders recursively and keeps relative paths', async () => {
    const tree = dirEntry('/trip', [
      fileEntry('/trip/a.heic'),
      dirEntry('/trip/day2', [fileEntry('/trip/day2/b.heic')])
    ]);
    const files = await collectDroppedFiles([asItem(tree)]);
    expect(files.map(f => f.webkitRelativePath).sort()).toEqual(['trip/a.heic', 'trip/day2/b.heic']);
  });

  it('falls back to getAsFile when entries are unavailable', async () => {
    const file = new File(['x'], 'c.heic');
    expect(await collectDroppedFiles([asItem(null, file)])).toEqual([file]);
  });

  it('ignores non-file items and failed reads', async () => {
    const broken: TEntry = {
      isFile: true,
      isDirectory: false,
      fullPath: '/bad.heic',
      file: (_onSuccess, onError) => onError(new Error('denied'))
    };
    const textItem: TDroppedItem = { kind: 'string', getAsFile: () => null };
    expect(await collectDroppedFiles([textItem, asItem(broken)])).toEqual([]);
  });
});
