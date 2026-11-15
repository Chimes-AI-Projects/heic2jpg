/** 只保留需要的 FileSystem API 欄位，方便測試替身 */
interface IFileEntryLike {
  isFile: boolean;
  isDirectory: boolean;
  fullPath: string;
  file?: (onSuccess: (file: File) => void, onError: (error: unknown) => void) => void;
  createReader?: () => {
    readEntries: (
      onSuccess: (entries: IFileEntryLike[]) => void,
      onError: (error: unknown) => void
    ) => void;
  };
}

export type TDroppedItem = Pick<DataTransferItem, 'kind' | 'getAsFile'> & {
  webkitGetAsEntry?: () => IFileEntryLike | null;
};

const withRelativePath = (file: File, relativePath: string): File => {
  Object.defineProperty(file, 'webkitRelativePath', { value: relativePath });
  return file;
};

const readFileEntry = (entry: IFileEntryLike): Promise<File[]> =>
  new Promise(resolve => {
    if (!entry.file) return resolve([]);
    entry.file(
      file => resolve([withRelativePath(file, entry.fullPath.replace(/^\//, ''))]),
      () => resolve([])
    );
  });

const readAllEntries = async (entry: IFileEntryLike): Promise<IFileEntryLike[]> => {
  if (!entry.createReader) return [];
  const reader = entry.createReader();
  const collected: IFileEntryLike[] = [];
  // readEntries 每次最多回傳 100 筆，需要讀到空陣列為止
  for (;;) {
    const batch = await new Promise<IFileEntryLike[]>(resolve =>
      reader.readEntries(resolve, () => resolve([]))
    );
    if (batch.length === 0) return collected;
    collected.push(...batch);
  }
};

const walkEntry = async (entry: IFileEntryLike): Promise<File[]> => {
  if (entry.isFile) return readFileEntry(entry);
  if (!entry.isDirectory) return [];
  const children = await readAllEntries(entry);
  const nested = await Promise.all(children.map(walkEntry));
  return nested.flat();
};

/** 把拖放進來的項目（含資料夾）展開成檔案清單，資料夾內檔案會帶相對路徑 */
export async function collectDroppedFiles(items: readonly TDroppedItem[]): Promise<File[]> {
  const nested = await Promise.all(
    items
      .filter(item => item.kind === 'file')
      .map(item => {
        const entry = item.webkitGetAsEntry?.();
        if (entry) return walkEntry(entry);
        const file = item.getAsFile();
        return Promise.resolve(file ? [file] : []);
      })
  );
  return nested.flat();
}
