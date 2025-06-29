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
  const parts = operation.split('.');
  const category = parts[0] as keyof typeof PERFORMANCE_BASELINES;
  const metric = parts[1];
  
  if (!PERFORMANCE_BASELINES[category] || !PERFORMANCE_BASELINES[category][metric as keyof typeof PERFORMANCE_BASELINES[typeof category]]) {
    throw new Error(`No baseline for operation: ${operation}`);
  }
  
  const baseline = PERFORMANCE_BASELINES[category][metric as keyof typeof PERFORMANCE_BASELINES[typeof category]] as number;
  const maxAllowed = baseline * tolerance;
  if (duration > maxAllowed) {
    throw new Error(
      `Performance regression: ${operation} took ${duration}ms ` +
      `(baseline: ${baseline}ms, max: ${maxAllowed}ms)`
    );
  }
}