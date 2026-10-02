"use client";

import {
  Barbell,
  Basketball,
  Bicycle,
  BoxingGlove,
  CaretDown,
  Mountains,
  PersonSimpleRun,
  PersonSimpleTaiChi,
  PersonSimpleWalk,
  SoccerBall,
  SwimmingPool,
  Timer,
  type Icon,
} from "@phosphor-icons/react";
import { AnimatePresence, motion } from "motion/react";
import { useState } from "react";
import { fmtHM, fmtNum, fmtTime } from "@/lib/format";
import type { Workout } from "@/lib/types";
import { Card, EmptyState, spring } from "./primitives";

const ICONS: [RegExp, Icon][] = [
  [/weight|strength|lift|gym|bodyweight/i, Barbell],
  [/run|jog/i, PersonSimpleRun],
  [/walk/i, PersonSimpleWalk],
  [/bike|cycl|biking/i, Bicycle],
  [/swim|pool/i, SwimmingPool],
  [/soccer|football/i, SoccerBall],
  [/basket/i, Basketball],
  [/hike|climb/i, Mountains],
  [/martial|box|wrestl|kick|mma/i, BoxingGlove],
  [/yoga|pilates|stretch|tai/i, PersonSimpleTaiChi],
];

const iconFor = (name: string) => ICONS.find(([re]) => re.test(name))?.[1] ?? Timer;

const COLLAPSED = 8;

export default function Workouts({ workouts }: { workouts: Workout[] }) {
  const [expanded, setExpanded] = useState(false);
  const shown = expanded ? workouts : workouts.slice(0, COLLAPSED);
  const totalMin = workouts.reduce((s, w) => s + w.durationMinutes, 0);
  const totalKcal = workouts.reduce((s, w) => s + (w.calories ?? 0), 0);

  return (
    <Card className="p-6 md:p-7 lg:col-span-12">
      <header className="flex flex-wrap items-end justify-between gap-4">
        <div className="space-y-1">
          <h3 className="text-[13px] font-medium text-secondary">Workouts</h3>
          <div className="tabular text-2xl font-semibold tracking-tight">
            {workouts.length} <span className="text-sm font-normal text-muted">sessions</span>
          </div>
        </div>
        {workouts.length > 0 && (
          <dl className="tabular flex gap-8 text-right">
            <div>
              <dt className="text-xs text-muted">Time</dt>
              <dd className="text-lg font-semibold tracking-tight">{fmtHM(totalMin)}</dd>
            </div>
            <div>
              <dt className="text-xs text-muted">Energy</dt>
              <dd className="text-lg font-semibold tracking-tight">
                {fmtNum(totalKcal)}
                <span className="ml-0.5 text-xs font-normal text-muted">kcal</span>
              </dd>
            </div>
          </dl>
        )}
      </header>

      {workouts.length === 0 ? (
        <EmptyState
          icon={Timer}
          title="No workouts in this period"
          body="Start an exercise on your tracker, or let auto-detection pick up walks and runs."
        />
      ) : (
        <>
          <ul className="mt-5 grid gap-x-8 md:grid-cols-2">
            <AnimatePresence initial={false}>
              {shown.map((w, i) => {
                const I = iconFor(w.name);
                return (
                  <motion.li
                    key={w.id}
                    layout
                    initial={{ opacity: 0, y: 8 }}
                    animate={{ opacity: 1, y: 0, transition: { ...spring, delay: i >= COLLAPSED ? (i - COLLAPSED) * 0.03 : 0 } }}
                    exit={{ opacity: 0 }}
                    className="flex items-center gap-4 border-t border-line py-3.5"
                  >
                    <span className="grid size-11 shrink-0 place-items-center rounded-2xl bg-surface-2 text-primary">
                      <I size={20} />
                    </span>
                    <div className="min-w-0 flex-1">
                      <p className="truncate font-medium">{w.name}</p>
                      <p className="text-xs text-muted">
                        {new Date(w.start).toLocaleDateString(undefined, { weekday: "short", month: "short", day: "numeric" })} ·{" "}
                        {fmtTime(w.start)}
                      </p>
                    </div>
                    <dl className="tabular grid grid-cols-3 gap-4 text-right text-sm">
                      <div>
                        <dt className="sr-only">Duration</dt>
                        <dd className="font-medium">{fmtHM(w.durationMinutes)}</dd>
                      </div>
                      <div>
                        <dt className="sr-only">Calories</dt>
                        <dd className="text-secondary">{w.calories ? `${fmtNum(w.calories)}` : "–"}<span className="text-xs text-muted"> kcal</span></dd>
                      </div>
                      <div>
                        <dt className="sr-only">Average heart rate</dt>
                        <dd className="text-secondary">{w.avgHeartRate ?? "–"}<span className="text-xs text-muted"> bpm</span></dd>
                      </div>
                    </dl>
                  </motion.li>
                );
              })}
            </AnimatePresence>
          </ul>
          {workouts.length > COLLAPSED && (
            <button
              onClick={() => setExpanded((e) => !e)}
              className="mt-3 flex items-center gap-1.5 rounded-full px-3 py-1.5 text-[13px] font-medium text-secondary transition hover:bg-surface-2 hover:text-primary active:scale-[0.97]"
            >
              {expanded ? "Show less" : `Show all ${workouts.length}`}
              <CaretDown size={14} className={`transition-transform ${expanded ? "rotate-180" : ""}`} />
            </button>
          )}
        </>
      )}
    </Card>
  );
}
