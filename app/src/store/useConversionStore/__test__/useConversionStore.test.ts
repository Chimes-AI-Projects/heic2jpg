import { act } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';

import { useConversionStore } from '../useConversionStore';

const heic = (name: string, content = 'x', lastModified = 1): File =>
  new File([content], name, { lastModified });

describe('useConversionStore', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    act(() => useConversionStore.getState().reset());
  });

  it('starts empty', () => {
    expect(useConversionStore.getState().items).toEqual([]);
  });

  it('adds only HEIC files as pending with jpg output paths', () => {
    let result = { addedCount: 0, skippedCount: 0 };
    act(() => {
      result = useConversionStore.getState().addFiles([heic('a.HEIC'), heic('b.jpg')]);
    });
    const { items } = useConversionStore.getState();
    expect(result).toEqual({ addedCount: 1, skippedCount: 1 });
    expect(items).toHaveLength(1);
    expect(items[0]).toMatchObject({ status: 'pending', outputPath: 'a.jpg' });
  });

  it('skips duplicates of the same file', () => {
    act(() => {
      useConversionStore.getState().addFiles([heic('a.heic')]);
    });
    let result = { addedCount: 0, skippedCount: 0 };
    act(() => {
      result = useConversionStore.getState().addFiles([heic('a.heic')]);
    });
    expect(result).toEqual({ addedCount: 0, skippedCount: 1 });
    expect(useConversionStore.getState().items).toHaveLength(1);
  });

  it('gives different files with the same name unique output paths', () => {
    act(() => {
      useConversionStore.getState().addFiles([heic('a.heic', 'one'), heic('a.heic', 'two!')]);
    });
    expect(useConversionStore.getState().items.map(i => i.outputPath)).toEqual([
      'a.jpg',
      'a (1).jpg'
    ]);
  });

  it('updates an item immutably', () => {
    act(() => {
      useConversionStore.getState().addFiles([heic('a.heic')]);
    });
    const before = useConversionStore.getState().items[0];
    act(() => useConversionStore.getState().updateItem(before.id, { status: 'done' }));
    const after = useConversionStore.getState().items[0];
    expect(after.status).toBe('done');
    expect(before.status).toBe('pending');
    expect(after).not.toBe(before);
  });

  it('ignores updates for unknown ids', () => {
    act(() => {
      useConversionStore.getState().addFiles([heic('a.heic')]);
    });
    act(() => useConversionStore.getState().updateItem('missing', { status: 'done' }));
    expect(useConversionStore.getState().items[0].status).toBe('pending');
  });

  it('removes an item and revokes its preview url', () => {
    const revokeSpy = vi.spyOn(URL, 'revokeObjectURL').mockImplementation(() => undefined);
    act(() => {
      useConversionStore.getState().addFiles([heic('a.heic')]);
    });
    const { id } = useConversionStore.getState().items[0];
    act(() => useConversionStore.getState().updateItem(id, { previewUrl: 'blob:preview' }));
    act(() => useConversionStore.getState().removeItem(id));
    expect(useConversionStore.getState().items).toEqual([]);
    expect(revokeSpy).toHaveBeenCalledWith('blob:preview');
  });

  it('reset clears everything', () => {
    act(() => {
      useConversionStore.getState().addFiles([heic('a.heic'), heic('b.heic')]);
    });
    act(() => useConversionStore.getState().reset());
    expect(useConversionStore.getState().items).toEqual([]);
  });
});
