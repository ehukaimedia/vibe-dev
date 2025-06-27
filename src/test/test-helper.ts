import { getTerminal } from '../vibe-terminal.js';

export function cleanupAfterTest() {
  const terminal = getTerminal();
  terminal.kill();
}

// Register global cleanup
process.on('beforeExit', () => {
  cleanupAfterTest();
});