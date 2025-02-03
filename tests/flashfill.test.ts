import { describe, it, expect } from 'vitest';
import { FlashFill } from '../src/flashfill';

describe('FlashFill', () => {
  it('should handle basic multi-column transformation', () => {
    const flashFill = new FlashFill();
    
    // Example: Combine first and last name from separate columns
    flashFill.addExample(['John', 'Doe'], 'John Doe');
    flashFill.addExample(['Jane', 'Smith'], 'Jane Smith');
    
    expect(flashFill.predict(['Robert', 'Johnson'])).toBe('Robert Johnson');
  });

  it('should handle no examples', () => {
    const flashFill = new FlashFill();
    expect(flashFill.predict(['test'])).toBe('test');
  });

  it('should validate input column count', () => {
    const flashFill = new FlashFill();
    flashFill.addExample(['First', 'Last'], 'First Last');
    
    expect(() => flashFill.predict(['Single']))
      .toThrow('Input must have 2 columns');
  });

  it('should clear examples', () => {
    const flashFill = new FlashFill();
    flashFill.addExample(['test1', 'test2'], 'result');
    flashFill.clear();
    expect(flashFill.predict(['test'])).toBe('test');
  });
});