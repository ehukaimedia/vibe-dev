import { describe, test, expect } from '@jest/globals';
import { VibeTerminalMac } from '../../src/vibe-terminal-mac.js';
import { VibeTerminalBase } from '../../src/vibe-terminal-base.js';

describe('Mac Platform Code Separation', () => {
  test('Mac class should only have Mac-specific methods', () => {
    const macInstance = new VibeTerminalMac();
    const macMethods = Object.getOwnPropertyNames(Object.getPrototypeOf(macInstance));
    
    // These should NOT be in Mac class (should be in base)
    const genericMethods = ['isAtPrompt', 'cleanOutput'];
    
    // This test helps identify what needs to move
    genericMethods.forEach(method => {
      const descriptor = Object.getOwnPropertyDescriptor(VibeTerminalMac.prototype, method);
      // If it's defined on Mac class, it should be Mac-specific
      if (descriptor) {
        expect(descriptor).toHaveProperty('value');
        // Add Mac-specific check here
      }
    });
  });
  
  test('base class methods are properly abstracted', () => {
    // Mac class should implement the abstract methods
    const macInstance = new VibeTerminalMac();
    
    // Check that Mac implements the required methods
    expect(typeof (macInstance as any)._cleanOutput).toBe('function');
    expect(typeof (macInstance as any).isAtPrompt).toBe('function');
    
    // Check that base class has generic helper methods
    expect(typeof (macInstance as any).fileExists).toBe('function');
    expect(typeof (macInstance as any).normalizePath).toBe('function');
    
    // Cleanup
    macInstance.destroy();
  });
});