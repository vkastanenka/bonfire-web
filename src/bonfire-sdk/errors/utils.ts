const durationUnitToMs: Record<string, number> = {
  h: 60 * 60 * 1000,
  m: 60 * 1000,
  s: 1000,
  ms: 1,
  us: 1 / 1000,
  µs: 1 / 1000,
  ns: 1 / 1_000_000,
};

const pluralize = (count: number, unit: string): string =>
  `${count} ${unit}${count === 1 ? "" : "s"}`;

export const parseRetryDelayMs = (delay: string): number | undefined => {
  if (!delay.trim()) return undefined;

  const regex = /([0-9.]+)(h|m(?!s)|ms|s|us|µs|ns)/g;
  let totalMs = 0;
  let found = false;
  let match: RegExpExecArray | null;

  while ((match = regex.exec(delay)) !== null) {
    const value = Number.parseFloat(match[1]);
    const multiplier = durationUnitToMs[match[2]];

    if (!Number.isFinite(value) || multiplier === undefined) {
      continue;
    }

    found = true;
    totalMs += value * multiplier;
  }

  return found ? totalMs : undefined;
};

export const formatRetryDelay = (ms: number): string => {
  if (!Number.isFinite(ms) || ms <= 0) {
    return "1 second";
  }

  const totalSeconds = Math.ceil(ms / 1000);
  if (totalSeconds <= 0) {
    return "1 second";
  }

  const minutes = Math.floor(totalSeconds / 60);
  const seconds = totalSeconds % 60;

  if (minutes > 0) {
    const minStr = pluralize(minutes, "minute");
    return seconds > 0 ? `${minStr} ${pluralize(seconds, "second")}` : minStr;
  }

  return pluralize(totalSeconds, "second");
};
