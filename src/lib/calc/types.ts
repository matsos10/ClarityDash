export type DayPnl = { day: string; pnl: number; trades: number };

export type TradeLite = {
  id: string;
  pnl: number;
  entryAt: Date;
  rMultiple?: number | null;
  copyGroupId?: string | null;
  setup?: string | null;
  emotion?: string | null;
};

export const round2 = (n: number) => Math.round(n * 100) / 100;
export const sum = (xs: number[]) => xs.reduce((a, b) => a + b, 0);
