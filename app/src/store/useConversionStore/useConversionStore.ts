import { create } from 'zustand';

import { getRelativePath, isHeicFile, makeUniquePath, toOutputPath } from '@/utils';

import type { IConversionItem } from '@/types';

export interface IAddFilesResult {
  addedCount: number;
  skippedCount: number;
}

interface IConversionStoreState {
  items: IConversionItem[];
  addFiles: (files: readonly File[]) => IAddFilesResult;
  updateItem: (id: string, patch: Partial<Omit<IConversionItem, 'id' | 'file'>>) => void;
  removeItem: (id: string) => void;
  reset: () => void;
}

const fileKey = (file: File): string =>
  `${getRelativePath(file)}|${file.size}|${file.lastModified}`;

const revokePreview = (item: IConversionItem): void => {
  if (item.previewUrl) URL.revokeObjectURL(item.previewUrl);
};

export const useConversionStore = create<IConversionStoreState>((set, get) => ({
  items: [],

  addFiles: files => {
    const existing = get().items;
    const existingKeys = new Set(existing.map(item => fileKey(item.file)));
    const usedPaths = new Set(existing.map(item => item.outputPath));

    const newItems = files.reduce<IConversionItem[]>((acc, file) => {
      const key = fileKey(file);
      if (!isHeicFile(file) || existingKeys.has(key)) return acc;
      existingKeys.add(key);
      const outputPath = makeUniquePath(toOutputPath(getRelativePath(file)), usedPaths);
      usedPaths.add(outputPath);
      return [...acc, { id: crypto.randomUUID(), file, outputPath, status: 'pending' }];
    }, []);

    set({ items: [...existing, ...newItems] });
    return { addedCount: newItems.length, skippedCount: files.length - newItems.length };
  },

  updateItem: (id, patch) =>
    set(state => ({
      items: state.items.map(item => (item.id === id ? { ...item, ...patch } : item))
    })),

  removeItem: id => {
    const target = get().items.find(item => item.id === id);
    if (target) revokePreview(target);
    set(state => ({ items: state.items.filter(item => item.id !== id) }));
  },

  reset: () => {
    get().items.forEach(revokePreview);
    set({ items: [] });
  }
}));
