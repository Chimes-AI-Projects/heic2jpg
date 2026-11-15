import { act, renderHook } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';

import { useConversionStore } from '@/store';
import { buildZip, downloadBlob } from '@/utils';

import { useZipDownload } from '../useZipDownload';

vi.mock('@/utils', async importOriginal => ({
  ...(await importOriginal<typeof import('@/utils')>()),
  buildZip: vi.fn(),
  downloadBlob: vi.fn()
}));

const mockBuildZip = vi.mocked(buildZip);
const mockDownloadBlob = vi.mocked(downloadBlob);

describe('useZipDownload', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    act(() => useConversionStore.getState().reset());
  });

  it('is idle initially', () => {
    const { result } = renderHook(() => useZipDownload());
    expect(result.current.isZipping).toBe(false);
  });

  it('returns 0 and does nothing when no items are done', async () => {
    act(() => {
      useConversionStore.getState().addFiles([new File(['x'], 'a.heic')]);
    });
    const { result } = renderHook(() => useZipDownload());
    let count = -1;
    await act(async () => {
      count = await result.current.downloadZip();
    });
    expect(count).toBe(0);
    expect(mockBuildZip).not.toHaveBeenCalled();
  });

  it('zips done items and triggers download', async () => {
    const zipBlob = new Blob(['zip']);
    mockBuildZip.mockResolvedValue(zipBlob);
    act(() => {
      useConversionStore.getState().addFiles([new File(['x'], 'a.heic'), new File(['y'], 'b.heic')]);
    });
    const [first] = useConversionStore.getState().items;
    act(() =>
      useConversionStore.getState().updateItem(first.id, { status: 'done', resultBlob: new Blob(['p']) })
    );

    const { result } = renderHook(() => useZipDownload());
    let count = 0;
    await act(async () => {
      count = await result.current.downloadZip();
    });

    expect(count).toBe(1);
    expect(mockBuildZip).toHaveBeenCalledWith([expect.objectContaining({ id: first.id })]);
    expect(mockDownloadBlob).toHaveBeenCalledWith(zipBlob, 'heic2jpg.zip');
    expect(result.current.isZipping).toBe(false);
  });

  it('resets isZipping and rethrows when zipping fails', async () => {
    mockBuildZip.mockRejectedValue(new Error('zip failed'));
    act(() => {
      useConversionStore.getState().addFiles([new File(['x'], 'a.heic')]);
    });
    const [item] = useConversionStore.getState().items;
    act(() =>
      useConversionStore.getState().updateItem(item.id, { status: 'done', resultBlob: new Blob(['p']) })
    );
    const { result } = renderHook(() => useZipDownload());
    await act(async () => {
      await expect(result.current.downloadZip()).rejects.toThrow('zip failed');
    });
    expect(result.current.isZipping).toBe(false);
    expect(mockDownloadBlob).not.toHaveBeenCalled();
  });
});
