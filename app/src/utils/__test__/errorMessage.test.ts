import { describe, expect, it } from 'vitest';

import { getErrorMessage } from '../errorMessage';

describe('getErrorMessage', () => {
  it('reads Error.message', () => {
    expect(getErrorMessage(new Error('boom'))).toBe('boom');
  });
  it('passes through strings', () => {
    expect(getErrorMessage('bad')).toBe('bad');
  });
  it('falls back for unknown values', () => {
    expect(getErrorMessage(null)).toBe('Unknown error');
    expect(getErrorMessage(new Error(''))).toBe('Unknown error');
  });
});
