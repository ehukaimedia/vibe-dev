export const PERFORMANCE_BASELINES = {
  vibe_terminal: {
    simple_echo: 100,     // ms
    complex_command: 500, // ms
    rapid_commands: 200,  // ms average
  },
  vibe_recap: {
    small_history: 50,    // ms
    large_history: 200,   // ms
    with_analysis: 500,   // ms
  }
};

export function assertPerformance(
  operation: string, 
  duration: number, 
  tolerance: number = 1.1
): void {
  const baseline = PERFORMANCE_BASELINES[operation];
  if (!baseline) {
    throw new Error(`No baseline for operation: ${operation}`);
  }
  
  const maxAllowed = baseline * tolerance;
  if (duration > maxAllowed) {
    throw new Error(
      `Performance regression: ${operation} took ${duration}ms ` +
      `(baseline: ${baseline}ms, max: ${maxAllowed}ms)`
    );
  }
}