"use client";

import { Flame, Footprints, Lightning, Path } from "@phosphor-icons/react";
import { motion, useReducedMotion } from "motion/react";
import { fmtNum } from "@/lib/format";
import { usePalette } from "@/lib/palette";
import { useDistance, useSettings } from "@/lib/settings";
import type { DailyActivity } from "@/lib/types";
import { Card, Eyebrow } from "./primitives";

function Ring({
  r,
  progress,
  color,
  track,
  width,
  delay,
}: {
  r: number;
  progress: number;
  color: string;
  track: string;
  width: number;
  delay: number;
}) {
  const reduce = useReducedMotion();
  const p = Math.min(progress, 1);
  return (
    <g>
      <circle cx="100" cy="100" r={r} fill="none" stroke={track} strokeWidth={width} />
      {p > 0 && (
        <motion.circle
          cx="100"
          cy="100"
          r={r}
          fill="none"
          stroke={color}
          strokeWidth={width}
          strokeLinecap="round"
          transform="rotate(-90 100 100)"
          initial={{ pathLength: reduce ? p : 0 }}
          animate={{ pathLength: p }}
          transition={{ type: "spring", stiffness: 40, damping: 18, delay }}
        />
      )}
    </g>
  );
}

export default function TodayCard({ today, avgSteps }: { today?: DailyActivity; avgSteps: number | null }) {
  const c = usePalette();
  const { stepGoal: STEP_GOAL, weeklyZoneGoal } = useSettings();
  const DAILY_ZONE_GOAL = Math.round(weeklyZoneGoal / 7);
  const dist = useDistance();
  const steps = today?.steps ?? 0;
  const zone = today?.activeZoneMinutes ?? 0;
  const pct = Math.round((steps / STEP_GOAL) * 100);
  const vsAvg = avgSteps ? steps - avgSteps : null;

  return (
    <Card className="flex flex-col gap-6 p-6 md:p-7">
      <Eyebrow icon={Footprints} color={c.move}>
        Today
      </Eyebrow>

      <div className="flex flex-1 flex-col justify-center gap-6">
      <div className="relative mx-auto aspect-square w-full max-w-[320px]">
        <svg viewBox="0 0 200 200" className="size-full" role="img" aria-label={`${fmtNum(steps)} of ${fmtNum(STEP_GOAL)} steps, ${zone} of ${DAILY_ZONE_GOAL} Active Zone Minutes`}>
          <Ring r={88} width={14} progress={steps / STEP_GOAL} color={c.move} track={c.moveSoft} delay={0.15} />
          <Ring r={68} width={14} progress={zone / DAILY_ZONE_GOAL} color={c.zone} track={c.zoneSoft} delay={0.3} />
        </svg>
        <div className="absolute inset-0 grid place-items-center text-center">
          <div>
            <div className="tabular text-5xl font-semibold leading-none tracking-tighter md:text-6xl">{fmtNum(steps)}</div>
            <div className="mt-1.5 text-[13px] text-muted">of {fmtNum(STEP_GOAL)} steps</div>
          </div>
        </div>
      </div>

      <div className="flex items-center justify-center gap-4 text-xs text-secondary">
        <span className="flex items-center gap-1.5">
          <span className="size-2 rounded-full" style={{ background: c.move }} />
          Steps {pct}%
        </span>
        <span className="flex items-center gap-1.5">
          <span className="size-2 rounded-full" style={{ background: c.zone }} />
          Zone minutes {zone}/{DAILY_ZONE_GOAL}
        </span>
      </div>
      </div>

      <dl className="grid grid-cols-3 divide-x divide-line rounded-2xl bg-surface-2 py-4">
        {[
          { icon: Path, label: "Distance", value: dist.value(today?.distanceKm), unit: dist.unit },
          { icon: Flame, label: "Calories", value: fmtNum(today?.calories), unit: "kcal" },
          { icon: Lightning, label: "Vs. average", value: vsAvg === null ? "–" : `${vsAvg >= 0 ? "+" : "−"}${fmtNum(Math.abs(vsAvg))}`, unit: "steps" },
        ].map((s) => (
          <div key={s.label} className="flex flex-col items-center gap-1 px-2 text-center">
            <dt className="flex items-center gap-1 text-xs text-muted">
              <s.icon size={13} />
              {s.label}
            </dt>
            <dd className="tabular text-lg font-semibold tracking-tight">
              {s.value}
              <span className="ml-0.5 text-xs font-normal text-muted">{s.unit}</span>
            </dd>
          </div>
        ))}
      </dl>
    </Card>
  );
}
