"use client";

import { MoonStars } from "@phosphor-icons/react";
import { motion, useReducedMotion } from "motion/react";
import { useState } from "react";
import { average, fmtHM, fmtTime, splitHM } from "@/lib/format";
import { STAGES, usePalette } from "@/lib/palette";
import type { SleepNight, SleepSegment } from "@/lib/types";
import { Card, EmptyState, Eyebrow, Figure, useElementWidth } from "./primitives";

const ROW = 30; // px per stage row
const LEVEL: Record<SleepSegment["type"], number> = { awake: 0, rem: 1, light: 2, deep: 3 };

function Hypnogram({ night }: { night: SleepNight }) {
  const c = usePalette();
  const reduce = useReducedMotion();
  const [ref, width] = useElementWidth<HTMLDivElement>();
  const [hover, setHover] = useState<{ x: number; seg: SleepSegment } | null>(null);

  const t0 = Date.parse(night.start);
  const t1 = Date.parse(night.end);
  const span = Math.max(1, t1 - t0);
  const x = (iso: string) => ((Date.parse(iso) - t0) / span) * width;
  const height = ROW * 4;

  // Hour ticks between bedtime and wake.
  const ticks: number[] = [];
  const first = new Date(t0);
  first.setMinutes(0, 0, 0);
  for (let t = first.getTime() + 3_600_000; t < t1 - 20 * 60_000; t += 3_600_000) ticks.push(t);

  const onMove = (e: React.PointerEvent<SVGSVGElement>) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const px = e.clientX - rect.left;
    const t = t0 + (px / rect.width) * span;
    const seg = night.segments.find((s) => Date.parse(s.start) <= t && t < Date.parse(s.end));
    setHover(seg ? { x: px, seg } : null);
  };

  return (
    <div className="grid grid-cols-[44px_1fr] gap-x-3">
      <ul className="flex flex-col text-[11px] text-muted" aria-hidden>
        {STAGES.map((s) => (
          <li key={s.key} className="flex items-center" style={{ height: ROW }}>
            {s.label}
          </li>
        ))}
      </ul>

      <div ref={ref} className="relative min-w-0">
        {width > 0 && (
          <svg
            width={width}
            height={height}
            className="block touch-none overflow-visible"
            onPointerMove={onMove}
            onPointerLeave={() => setHover(null)}
            role="img"
            aria-label={`Sleep stages from ${fmtTime(night.start)} to ${fmtTime(night.end)}`}
          >
            <defs>
              <clipPath id="hypno-reveal">
                <motion.rect
                  x={0}
                  y={-4}
                  height={height + 8}
                  initial={{ width: reduce ? width : 0 }}
                  animate={{ width }}
                  transition={{ duration: 1.1, ease: [0.16, 1, 0.3, 1], delay: 0.2 }}
                />
              </clipPath>
            </defs>

            {[1, 2, 3].map((i) => (
              <line key={i} x1={0} x2={width} y1={i * ROW} y2={i * ROW} stroke={c.grid} />
            ))}
            {ticks.map((t) => (
              <line
                key={t}
                x1={((t - t0) / span) * width}
                x2={((t - t0) / span) * width}
                y1={0}
                y2={height}
                stroke={c.grid}
              />
            ))}

            <g clipPath="url(#hypno-reveal)">
              {/* Connectors between consecutive stages. */}
              {night.segments.slice(1).map((s, i) => {
                const prev = night.segments[i];
                const y1 = LEVEL[prev.type] * ROW + ROW / 2;
                const y2 = LEVEL[s.type] * ROW + ROW / 2;
                if (y1 === y2) return null;
                return (
                  <line
                    key={`c-${s.start}`}
                    x1={x(s.start)}
                    x2={x(s.start)}
                    y1={Math.min(y1, y2)}
                    y2={Math.max(y1, y2)}
                    stroke={c.axis}
                    strokeOpacity={0.35}
                    strokeWidth={1}
                  />
                );
              })}
              {night.segments.map((s) => {
                const sx = x(s.start);
                const w = Math.max(2, x(s.end) - sx);
                const dim = hover && hover.seg !== s;
                return (
                  <rect
                    key={s.start}
                    x={sx}
                    y={LEVEL[s.type] * ROW + 7}
                    width={w}
                    height={ROW - 14}
                    rx={Math.min(4, w / 2)}
                    fill={c[s.type]}
                    opacity={dim ? 0.45 : 1}
                    style={{ transition: "opacity 160ms ease" }}
                  />
                );
              })}
            </g>
            {hover && <line x1={hover.x} x2={hover.x} y1={0} y2={height} stroke={c.axis} strokeWidth={1} />}
          </svg>
        )}

        <div className="relative mt-2 h-4 text-[11px] text-muted tabular">
          <span className="absolute left-0">{fmtTime(night.start)}</span>
          {width > 0 &&
            ticks.map((t) => {
              const left = ((t - t0) / span) * width;
              if (left < 56 || left > width - 56) return null;
              return (
                <span key={t} className="absolute -translate-x-1/2" style={{ left }}>
                  {new Date(t).toLocaleTimeString(undefined, { hour: "numeric" })}
                </span>
              );
            })}
          <span className="absolute right-0">{fmtTime(night.end)}</span>
        </div>

        {hover && (
          <div
            className="pointer-events-none absolute -top-2 z-10 -translate-y-full rounded-xl bg-surface/90 px-3 py-2 text-xs whitespace-nowrap shadow-[0_0_0_1px_var(--line),0_12px_24px_-12px_rgb(0_0_0/0.3)] backdrop-blur-md"
            style={{ left: Math.min(Math.max(hover.x, 70), width - 70), transform: "translate(-50%, -100%)" }}
          >
            <span className="font-medium">{STAGES.find((s) => s.key === hover.seg.type)?.label}</span>
            <span className="text-muted">
              {" "}
              · {fmtTime(hover.seg.start)}–{fmtTime(hover.seg.end)} ·{" "}
              {fmtHM((Date.parse(hover.seg.end) - Date.parse(hover.seg.start)) / 60000)}
            </span>
          </div>
        )}
      </div>
    </div>
  );
}

function Composition({ night }: { night: SleepNight }) {
  const c = usePalette();
  const reduce = useReducedMotion();
  const total = night.deep + night.rem + night.light + night.awake || 1;
  const order = ["deep", "rem", "light", "awake"] as const;
  return (
    <div className="space-y-3">
      <div className="flex h-2 gap-[2px] overflow-hidden rounded-full">
        {order.map((k) => (
          <motion.div
            key={k}
            initial={reduce ? false : { flexGrow: 0 }}
            animate={{ flexGrow: night[k] / total }}
            transition={{ type: "spring", stiffness: 60, damping: 20, delay: 0.35 }}
            style={{ background: c[k], flexBasis: 0 }}
            className="first:rounded-l-full last:rounded-r-full"
          />
        ))}
      </div>
      <dl className="grid grid-cols-4 gap-2">
        {order.map((k) => (
          <div key={k}>
            <dt className="flex items-center gap-1.5 text-xs text-muted">
              <span className="size-2 rounded-full" style={{ background: c[k] }} />
              {STAGES.find((s) => s.key === k)?.label}
            </dt>
            <dd className="tabular mt-0.5 text-sm font-medium">
              {fmtHM(night[k])}
              <span className="ml-1 text-xs font-normal text-muted">{Math.round((night[k] / total) * 100)}%</span>
            </dd>
          </div>
        ))}
      </dl>
    </div>
  );
}

export default function SleepCard({ sleep }: { sleep: SleepNight[] }) {
  const c = usePalette();
  const night = sleep[sleep.length - 1];
  const avg = average(sleep.map((n) => n.minutesAsleep));

  if (!night) {
    return (
      <Card className="p-6 md:p-7 lg:col-span-7">
        <Eyebrow icon={MoonStars} color={c.rem}>
          Last night
        </Eyebrow>
        <EmptyState
          icon={MoonStars}
          title="No sleep recorded yet"
          body="Wear your tracker to bed. Your sleep stages will appear here after the Google Health app syncs in the morning."
        />
      </Card>
    );
  }

  const { h, m } = splitHM(night.minutesAsleep);
  const diff = avg ? night.minutesAsleep - avg : null;

  return (
    <Card className="flex flex-col gap-6 p-6 md:p-7 lg:col-span-7">
      <Eyebrow
        icon={MoonStars}
        color={c.rem}
        right={
          <span className="tabular text-xs text-muted">
            {fmtTime(night.start)} – {fmtTime(night.end)}
          </span>
        }
      >
        Last night
      </Eyebrow>

      <div className="flex flex-wrap items-end justify-between gap-3">
        <Figure parts={[{ value: String(h), unit: "h" }, { value: String(m).padStart(2, "0"), unit: "m" }]} />
        {diff !== null && Math.abs(diff) >= 1 && (
          <span className="text-[13px] text-secondary">
            {fmtHM(Math.abs(diff))} {diff > 0 ? "more" : "less"} than your average
          </span>
        )}
      </div>

      {night.segments.length > 0 && <Hypnogram night={night} />}
      <Composition night={night} />
    </Card>
  );
}
