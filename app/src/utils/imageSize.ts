export interface IImageSize {
  width: number;
  height: number;
}

/** 等比例縮小到長邊不超過 maxEdge；本來就比較小的圖維持原尺寸（不放大） */
export function fitWithinMaxEdge({ width, height }: IImageSize, maxEdge: number): IImageSize {
  if (width <= 0 || height <= 0) throw new Error('Invalid image size');
  const longEdge = Math.max(width, height);
  if (longEdge <= maxEdge) return { width, height };
  const scale = maxEdge / longEdge;
  return {
    width: Math.max(1, Math.round(width * scale)),
    height: Math.max(1, Math.round(height * scale))
  };
}
