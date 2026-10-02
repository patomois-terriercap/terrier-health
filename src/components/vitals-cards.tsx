"use client";

import { CheckCircle, Heartbeat, Lightning } from "@phosphor-icons/react";
import { motion, useReducedMotion } from "motion/react";
import { Area, AreaChart, ResponsiveContainer, Tooltip, YAxis } from "recharts";
import { average, fmtDay, fmtWeekday } from "@/lib/format";
import { usePalette } from "@/lib/palette";
import { useSettings } from "@/lib/settings";
import type { DailyActivity } from "@/lib/types";
import { Card, EmptyState, Eyebrow, Figure, TooltipBox } from "./primitives";

export function HeartCard({ days }: { days: DailyActivity[] }) {
  const c = usePalette();
  const reduce = useReducedMotion();
  const logged = days.filter((d) => d.restingHeartRate !== null);
  const latest = logged[logged.length - 1];
  const avg = average(logged.map((d) => d.restingHeartRate));
  const min = logged.length ? Math.min(...logged.map((d) => d.restingHeartRate!)) : 0;
  const max = logged.length ? Math.max(...logged.map((d) => d.restingHeartRate!)) : 0;
  const diff = latest && avg ? latest.restingHeartRate! - avg : null;

  return (
    <Card className="flex flex-col gap-4 p-6 md:p-7 lg:col-span-4">
      <Eyebrow icon={Heartbeat} color={c.heart}>
        Resting heart rate
      </Eyebrow>
      {!latest ? (
        <EmptyState icon={Heartbeat} title="No readings yet" body="Resting heart rate is calculated after a full day of wear." />
      ) : (
        <>
          <div className="flex items-end justify-between gap-3">
            <Figure parts={[{ value: String(latest.restingHeartRate), unit: "bpm" }]} />
            <div className="text-right text-xs text-muted tabular">
              <div>
                {min}–{max} range
              </div>
              {diff !== null && (
                <div className={Math.abs(diff) < 0.5 ? "" : diff < 0 ? "text-good" : "text-bad"}>
                  {Math.abs(diff) < 0.5 ? "At your average" : `${Math.abs(diff).toFixed(1)} ${diff < 0 ? "below" : "above"} avg`}
                </div>
              )}
            </div>
          </div>
          <div className="-mx-2 mt-auto h-24">
            <ResponsiveContainer>
              <AreaChart data={days} margin={{ top: 6, right: 8, left: 8, bottom: 4 }}>
                <defs>
                  <linearGradient id="hr-wash" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor={c.heart} stopOpacity={0.22} />
                    <stop offset="100%" stopColor={c.heart} stopOpacity={0} />
                  </linearGradient>
                </defs>
                <YAxis hide domain={[min - 2, max + 2]} />
                <Tooltip
                  cursor={{ stroke: c.axis, strokeWidth: 1 }}
                  content={({ active, payload }) =>
                    active && payload?.length ? (
                      <TooltipBox
                        title={fmtDay(payload[0].payload.date)}
                        rows={[{ color: c.heart, label: "Resting HR", value: payload[0].payload.restingHeartRate ? `${payload[0].payload.restingHeartRate} bpm` : "–" }]}
                      />
                    ) : null
                  }
                />
                <Area
                  dataKey="restingHeartRate"
                  type="monotone"
                  stroke={c.heart}
                  strokeWidth={2}
                  fill="url(#hr-wash)"
                  connectNulls
                  dot={false}
                  activeDot={{ r: 4.5, fill: c.heart, stroke: c.surface, strokeWidth: 2 }}
                  isAnimationActive={!reduce} animationDuration={900}
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </>
      )}
    </Card>
  );
}

export function ZoneCard({ days }: { days: DailyActivity[] }) {
  const c = usePalette();
  const { weeklyZoneGoal: WEEKLY_ZONE_GOAL } = useSettings();
  const week = days.slice(-7);
  const total = week.reduce((s, d) => s + (d.activeZoneMinutes ?? 0), 0);
  const peak = Math.max(1, ...week.map((d) => d.activeZoneMinutes ?? 0));
  const reached = total >= WEEKLY_ZONE_GOAL;

  return (
    <Card className="flex flex-col gap-4 p-6 md:p-7 lg:col-span-3">
      <Eyebrow
        icon={Lightning}
        color={c.zone}
        right={reached && <CheckCircle size={18} weight="fill" className="text-good" aria-label="Weekly goal reached" />}
      >
        Zone minutes
      </Eyebrow>
      <div>
        <Figure parts={[{ value: String(total), unit: `/ ${WEEKLY_ZONE_GOAL}` }]} />
        <p className="mt-2 text-xs text-muted">Last 7 days</p>
      </div>
      <div className="mt-auto flex h-20 items-end gap-1.5" role="img" aria-label="Zone minutes per day this week">
        {week.map((d, i) => {
          const v = d.activeZoneMinutes ?? 0;
          return (
            <div key={d.date} className="flex flex-1 flex-col items-center gap-1.5" title={`${fmtDay(d.date)}: ${v} min`}>
              <div className="flex h-14 w-full items-end">
                <motion.div
                  className="w-full rounded-[5px]"
                  style={{ background: v ? c.zone : c.grid, originY: 1 }}
                  initial={{ scaleY: 0 }}
                  animate={{ scaleY: 1 }}
                  transition={{ type: "spring", stiffness: 100, damping: 20, delay: 0.2 + i * 0.04 }}
                >
                  <div style={{ height: `${Math.max(6, (v / peak) * 56)}px` }} />
                </motion.div>
              </div>
              <span className="text-[10px] text-muted">{fmtWeekday(d.date)}</span>
            </div>
          );
        })}
      </div>
    </Card>
  );
}
