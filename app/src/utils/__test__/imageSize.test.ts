import { describe, expect, it } from 'vitest';

import { fitWithinMaxEdge } from '../imageSize';

describe('fitWithinMaxEdge', () => {
  it('scales a large landscape image so the long edge equals the limit', () => {
    expect(fitWithinMaxEdge({ width: 4032, height: 3024 }, 2048)).toEqual({ width: 2048, height: 1536 });
  });
  it('scales a portrait image by its height', () => {
    expect(fitWithinMaxEdge({ width: 3024, height: 4032 }, 2048)).toEqual({ width: 1536, height: 2048 });
  });
  it('keeps images that already fit (no upscaling)', () => {
    expect(fitWithinMaxEdge({ width: 1730, height: 909 }, 2048)).toEqual({ width: 1730, height: 909 });
    expect(fitWithinMaxEdge({ width: 2048, height: 2048 }, 2048)).toEqual({ width: 2048, height: 2048 });
  });
  it('never returns a zero dimension for extreme aspect ratios', () => {
    expect(fitWithinMaxEdge({ width: 10000, height: 1 }, 2048)).toEqual({ width: 2048, height: 1 });
  });
  it('rejects invalid sizes', () => {
    expect(() => fitWithinMaxEdge({ width: 0, height: 10 }, 2048)).toThrow('Invalid image size');
  });
});
