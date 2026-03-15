import { describe, it, expect } from 'vitest';
import { generateInviteCode } from '../../apps/api/src/lib/utils';

describe('generateInviteCode', () => {
  it('returns a 6-character uppercase string', () => {
    const code = generateInviteCode();
    expect(code).toHaveLength(6);
    expect(code).toBe(code.toUpperCase());
  });

  it('generates unique codes', () => {
    const codes = new Set(Array.from({ length: 100 }, () => generateInviteCode()));
    expect(codes.size).toBeGreaterThan(90);
  });
});
