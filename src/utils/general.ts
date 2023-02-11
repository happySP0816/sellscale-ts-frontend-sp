
export function temp_delay(ms: number) {
  return new Promise(resolve => setTimeout(resolve, ms));
}