export type TConversionStatus = 'pending' | 'converting' | 'done' | 'error';

export interface IConversionItem {
  id: string;
  file: File;
  /** 輸出檔的相對路徑（含子資料夾），例如 trip/IMG_0001.jpg */
  outputPath: string;
  status: TConversionStatus;
  resultBlob?: Blob;
  previewUrl?: string;
  errorMessage?: string;
}

export type THeicConverter = (file: Blob) => Promise<Blob>;
