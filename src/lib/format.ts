export const fmtNum = (n: number | null | undefined) =>
  n === null || n === undefined ? "–" : Math.round(n).toLocaleString();

export const fmtDay = (iso: string) =>
  new Date(`${iso}T12:00:00`).toLocaleDateString(undefined, { month: "short", day: "numeric" });

export const fmtWeekday = (iso: string) =>
  new Date(`${iso}T12:00:00`).toLocaleDateString(undefined, { weekday: "narrow" });

export const fmtTime = (iso: string) =>
  new Date(iso).toLocaleTimeString(undefined, { hour: "numeric", minute: "2-digit" });

/** Splits minutes into hours/minutes so the UI can style units separately. */
export const splitHM = (minutes: number) => ({
  h: Math.floor(minutes / 60),
  m: Math.round(minutes % 60),
});

export const fmtHM = (minutes: number | null | undefined) => {
  if (minutes === null || minutes === undefined) return "–";
  const { h, m } = splitHM(minutes);
  return h ? `${h}h ${String(m).padStart(2, "0")}m` : `${m}m`;
};

export const average = (values: (number | null | undefined)[]) => {
  const v = values.filter((x): x is number => typeof x === "number");
  return v.length ? v.reduce((a, b) => a + b, 0) / v.length : null;
};
