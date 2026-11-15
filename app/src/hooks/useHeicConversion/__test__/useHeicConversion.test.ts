import { act, renderHook } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';

import { useConversionStore } from '@/store';

import { useHeicConversion } from '../useHeicConversion';

vi.mock('@/utils/convertHeicToJpg', () => ({ convertHeicToJpg: vi.fn() }));

const addHeic = (...names: string[]): void => {
  act(() => {
    useConversionStore.getState().addFiles(names.map(name => new File([name], name)));
  });
};

describe('useHeicConversion', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.spyOn(URL, 'createObjectURL').mockReturnValue('blob:preview');
    vi.spyOn(URL, 'revokeObjectURL').mockImplementation(() => undefined);
    act(() => useConversionStore.getState().reset());
  });

  it('has idle initial state', () => {
    const { result } = renderHook(() => useHeicConversion(vi.fn()));
    expect(result.current).toMatchObject({
      isConverting: false,
      totalCount: 0,
      finishedCount: 0,
      doneCount: 0,
      errorCount: 0,
      originalBytes: 0,
      outputBytes: 0
    });
  });

  it('converts all pending items', async () => {
    const converter = vi.fn().mockResolvedValue(new Blob(['jpg']));
    addHeic('a.heic', 'b.heic', 'c.heic');
    const { result } = renderHook(() => useHeicConversion(converter, 2));

    let summary = { successCount: 0, failureCount: 0 };
    await act(async () => {
      summary = await result.current.convertAll();
    });

    expect(converter).toHaveBeenCalledTimes(3);
    expect(summary).toEqual({ successCount: 3, failureCount: 0 });
    expect(result.current.doneCount).toBe(3);
    expect(result.current.isConverting).toBe(false);
    expect(useConversionStore.getState().items[0].previewUrl).toBe('blob:preview');
  });

  it('totals original and output sizes of done items only', async () => {
    const converter = vi
      .fn()
      .mockResolvedValueOnce(new Blob(['12']))
      .mockRejectedValueOnce(new Error('bad'));
    act(() => {
      useConversionStore
        .getState()
        .addFiles([new File(['123456'], 'a.heic'), new File(['1234'], 'b.heic')]);
    });
    const { result } = renderHook(() => useHeicConversion(converter, 1));
    await act(async () => {
      await result.current.convertAll();
    });
    expect(result.current.originalBytes).toBe(6);
    expect(result.current.outputBytes).toBe(2);
  });

  it('marks failures with an error message and keeps going', async () => {
    const converter = vi
      .fn()
      .mockRejectedValueOnce(new Error('bad file'))
      .mockResolvedValueOnce(new Blob(['jpg']));
    addHeic('a.heic', 'b.heic');
    const { result } = renderHook(() => useHeicConversion(converter, 1));

    let summary = { successCount: 0, failureCount: 0 };
    await act(async () => {
      summary = await result.current.convertAll();
    });

    expect(summary).toEqual({ successCount: 1, failureCount: 1 });
    const failed = useConversionStore.getState().items.find(i => i.status === 'error');
    expect(failed?.errorMessage).toBe('bad file');
    expect(result.current.finishedCount).toBe(2);
  });

  it('retries failed items but skips done ones on the next run', async () => {
    const converter = vi
      .fn()
      .mockRejectedValueOnce(new Error('bad'))
      .mockResolvedValue(new Blob(['jpg']));
    addHeic('a.heic', 'b.heic');
    const { result } = renderHook(() => useHeicConversion(converter, 1));
    await act(async () => {
      await result.current.convertAll();
    });
    await act(async () => {
      await result.current.convertAll();
    });

    expect(converter).toHaveBeenCalledTimes(3);
    expect(result.current.doneCount).toBe(2);
  });

  it('returns zero summary when there is nothing to convert', async () => {
    const converter = vi.fn();
    const { result } = renderHook(() => useHeicConversion(converter));
    let summary = { successCount: -1, failureCount: -1 };
    await act(async () => {
      summary = await result.current.convertAll();
    });
    expect(summary).toEqual({ successCount: 0, failureCount: 0 });
    expect(converter).not.toHaveBeenCalled();
  });
});
