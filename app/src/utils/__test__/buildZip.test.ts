import JSZip from 'jszip';
import { describe, expect, it } from 'vitest';

import { buildZip } from '../buildZip';

import type { IConversionItem } from '@/types';

const createItem = (overrides: Partial<IConversionItem> = {}): IConversionItem => ({
  id: crypto.randomUUID(),
  file: new File(['heic'], 'a.heic'),
  outputPath: 'a.jpg',
  status: 'done',
  resultBlob: new Blob(['jpg']),
  ...overrides
});

const readNames = async (blob: Blob): Promise<string[]> => {
  const zip = await JSZip.loadAsync(await blob.arrayBuffer());
  return Object.values(zip.files)
    .filter(entry => !entry.dir)
    .map(entry => entry.name)
    .sort();
};

describe('buildZip', () => {
  it('includes only done items, keeping folder paths', async () => {
    const blob = await buildZip([
      createItem({ outputPath: 'a.jpg' }),
      createItem({ outputPath: 'sub/b.jpg' }),
      createItem({ outputPath: 'c.jpg', status: 'error', resultBlob: undefined }),
      createItem({ outputPath: 'd.jpg', status: 'pending', resultBlob: undefined })
    ]);
    expect(await readNames(blob)).toEqual(['a.jpg', 'sub/b.jpg']);
  });

  it('produces an empty archive for no items', async () => {
    expect(await readNames(await buildZip([]))).toEqual([]);
  });
});
