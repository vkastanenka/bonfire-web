export const STACK_ITEMS = {
  stretch: "items-stretch",
  center: "items-center",
  start: "items-start",
  end: "items-end",
  baseline: "items-baseline",
} as const;

export const STACK_DIRECTIONS = {
  row: "flex-row",
  col: "flex-col",
  ["row-reverse"]: "flex-row-reverse",
  ["col-reverse"]: "flex-col-reverse",
} as const;

export const STACK_GAPS = {
  0: "gap-0",
  1: "gap-1",
  2: "gap-2",
  3: "gap-3",
  4: "gap-4",
  5: "gap-5",
  6: "gap-6",
  7: "gap-7",
  8: "gap-8",
  9: "gap-9",
  10: "gap-10",
  11: "gap-11",
  12: "gap-12",
  13: "gap-13",
  14: "gap-14",
  15: "gap-15",
  16: "gap-16",
} as const;

export const STACK_JUSTIFY = {
  start: "justify-start",
  end: "justify-end",
  center: "justify-center",
  between: "justify-between",
  around: "justify-around",
  evenly: "justify-evenly",
} as const;
