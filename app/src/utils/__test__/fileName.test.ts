import { describe, expect, it } from 'vitest';

import { formatBytes, getRelativePath, isHeicFile, makeUniquePath, toOutputPath } from '../fileName';

describe('isHeicFile', () => {
  it('accepts .heic / .HEIC / .heif extensions', () => {
    expect(isHeicFile({ name: 'a.heic', type: '' })).toBe(true);
    expect(isHeicFile({ name: 'IMG_0001.HEIC', type: '' })).toBe(true);
    expect(isHeicFile({ name: 'b.heif', type: '' })).toBe(true);
  });
  it('accepts heic mime type even without extension', () => {
    expect(isHeicFile({ name: 'photo', type: 'image/heic' })).toBe(true);
  });
  it('rejects other images and empty names', () => {
    expect(isHeicFile({ name: 'a.jpg', type: 'image/png' })).toBe(false);
    expect(isHeicFile({ name: 'heic.jpg', type: 'image/jpeg' })).toBe(false);
    expect(isHeicFile({ name: '', type: '' })).toBe(false);
  });
});

describe('toOutputPath', () => {
  it('replaces the extension', () => {
    expect(toOutputPath('IMG_0001.HEIC')).toBe('IMG_0001.jpg');
  });
  it('keeps folder structure', () => {
    expect(toOutputPath('trip/day 1/IMG.heic')).toBe('trip/day 1/IMG.jpg');
  });
  it('appends .jpg when there is no extension', () => {
    expect(toOutputPath('photo')).toBe('photo.jpg');
    expect(toOutputPath('dir.v2/photo')).toBe('dir.v2/photo.jpg');
  });
  it('treats dotfiles as having no extension', () => {
    expect(toOutputPath('.heic')).toBe('.heic.jpg');
  });
});

describe('getRelativePath', () => {
  it('prefers webkitRelativePath when present', () => {
    const file = new File(['x'], 'a.heic');
    Object.defineProperty(file, 'webkitRelativePath', { value: 'folder/a.heic' });
    expect(getRelativePath(file)).toBe('folder/a.heic');
  });
  it('falls back to file name', () => {
    expect(getRelativePath(new File(['x'], 'a.heic'))).toBe('a.heic');
  });
});

describe('makeUniquePath', () => {
  it('returns the path unchanged when unused', () => {
    expect(makeUniquePath('a.jpg', new Set())).toBe('a.jpg');
  });
  it('adds an incrementing suffix on collision', () => {
    expect(makeUniquePath('a.jpg', new Set(['a.jpg']))).toBe('a (1).jpg');
    expect(makeUniquePath('a.jpg', new Set(['a.jpg', 'a (1).jpg']))).toBe('a (2).jpg');
  });
  it('handles paths without extension', () => {
    expect(makeUniquePath('a', new Set(['a']))).toBe('a (1)');
  });
});

describe('formatBytes', () => {
  it('returns 0 B for zero, negative and NaN', () => {
    expect(formatBytes(0)).toBe('0 B');
    expect(formatBytes(-5)).toBe('0 B');
    expect(formatBytes(Number.NaN)).toBe('0 B');
  });
  it('converts units', () => {
    expect(formatBytes(512)).toBe('512 B');
    expect(formatBytes(1536)).toBe('1.5 KB');
    expect(formatBytes(3 * 1024 * 1024)).toBe('3.0 MB');
  });
});
