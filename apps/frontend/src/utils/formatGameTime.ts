export function formatGameTimeMs(worldTimeMs: number): string {
  const totalMinutes = Math.floor(worldTimeMs / 60_000);
  const day = Math.floor(totalMinutes / (24 * 60)) + 1;
  const hour = Math.floor((totalMinutes % (24 * 60)) / 60);
  const minute = totalMinutes % 60;
  return `Giorno ${day}, ${String(hour).padStart(2, '0')}:${String(minute).padStart(2, '0')}`;
}
