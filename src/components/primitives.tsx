"use client";

import { motion, type Variants } from "motion/react";
import { useEffect, useRef, useState, type ReactNode } from "react";
import type { Icon } from "@phosphor-icons/react";

export const spring = { type: "spring", stiffness: 100, damping: 20 } as const;

export const staggerParent: Variants = {
  hidden: {},
  show: { transition: { staggerChildren: 0.06, delayChildren: 0.04 } },
};

export const riseChild: Variants = {
  hidden: { opacity: 0, y: 14 },
  show: { opacity: 1, y: 0, transition: spring },
};

export function Card({
  children,
  className = "",
  as = "section",
}: {
  children: ReactNode;
  className?: string;
  as?: "section" | "article" | "div";
}) {
  const Tag = motion[as];
  return (
    <Tag variants={riseChild} className={`card min-w-0 ${className}`}>
      {children}
    </Tag>
  );
}

export function Eyebrow({
  icon: IconCmp,
  color,
  children,
  right,
}: {
  icon: Icon;
  color: string;
  children: ReactNode;
  right?: ReactNode;
}) {
  return (
    <div className="flex items-center justify-between gap-3">
      <div className="flex items-center gap-2.5">
        <span
          className="grid size-7 place-items-center rounded-full"
          style={{ background: `color-mix(in oklab, ${color} 14%, transparent)`, color }}
        >
          <IconCmp size={15} weight="bold" />
        </span>
        <span className="text-[13px] font-medium text-secondary">{children}</span>
      </div>
      {right}
    </div>
  );
}

/** Large figure with a quieter unit, e.g. "50 bpm" or "5h 16m". */
export function Figure({
  parts,
  size = "lg",
}: {
  parts: { value: string; unit?: string }[];
  size?: "md" | "lg" | "xl";
}) {
  const valueClass =
    size === "xl"
      ? "text-5xl md:text-6xl"
      : size === "lg"
        ? "text-4xl md:text-[44px]"
        : "text-3xl";
  return (
    <div className="tabular flex items-baseline gap-1.5 leading-none tracking-tighter">
      {parts.map((p, i) => (
        <span key={i} className="flex items-baseline gap-1">
          <span className={`${valueClass} font-semibold`}>{p.value}</span>
          {p.unit && <span className="text-base font-medium tracking-tight text-muted">{p.unit}</span>}
        </span>
      ))}
    </div>
  );
}

export function Segmented<T extends string | number>({
  options,
  value,
  onChange,
  label,
  format = (v) => String(v),
}: {
  options: readonly T[];
  value: T;
  onChange: (v: T) => void;
  label: string;
  format?: (v: T) => string;
}) {
  return (
    <div role="group" aria-label={label} className="card flex gap-0.5 !rounded-full p-1">
      {options.map((o) => (
        <button
          key={o}
          onClick={() => onChange(o)}
          aria-pressed={o === value}
          className={`relative rounded-full px-3.5 py-1.5 text-[13px] font-medium transition-colors active:scale-[0.97] ${
            o === value ? "text-ink-contrast" : "text-secondary hover:text-primary"
          }`}
        >
          {o === value && (
            <motion.span
              layoutId={`seg-${label}`}
              transition={spring}
              className="absolute inset-0 rounded-full bg-ink"
            />
          )}
          <span className="relative">{format(o)}</span>
        </button>
      ))}
    </div>
  );
}

export function LegendKey({ items }: { items: { color: string; label: string; value?: string }[] }) {
  return (
    <ul className="flex flex-wrap gap-x-4 gap-y-1.5 text-xs text-secondary">
      {items.map((i) => (
        <li key={i.label} className="flex items-center gap-1.5">
          <span className="inline-block size-2 rounded-full" style={{ background: i.color }} />
          {i.label}
          {i.value && <span className="tabular text-muted">{i.value}</span>}
        </li>
      ))}
    </ul>
  );
}

export function TooltipBox({
  title,
  rows,
}: {
  title: string;
  rows: { color?: string; label: string; value: string }[];
}) {
  return (
    <div className="min-w-40 rounded-2xl bg-surface/90 px-3.5 py-2.5 text-[13px] shadow-[0_0_0_1px_var(--line),0_16px_32px_-12px_rgb(0_0_0/0.25)] backdrop-blur-md">
      <div className="mb-1.5 text-xs text-muted">{title}</div>
      <div className="space-y-1">
        {rows.map((r) => (
          <div key={r.label} className="flex items-center gap-2">
            <span
              className="inline-block size-2 rounded-full"
              style={{ background: r.color ?? "transparent" }}
            />
            <span className="text-secondary">{r.label}</span>
            <span className="tabular ml-auto pl-4 font-medium">{r.value}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

/** Tracks an element's content width so hand-drawn SVGs stay crisp at any size. */
export function useElementWidth<T extends HTMLElement>() {
  const ref = useRef<T>(null);
  const [width, setWidth] = useState(0);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const ro = new ResizeObserver(([entry]) => setWidth(entry.contentRect.width));
    ro.observe(el);
    return () => ro.disconnect();
  }, []);
  return [ref, width] as const;
}

export function EmptyState({ icon: IconCmp, title, body }: { icon: Icon; title: string; body: string }) {
  return (
    <div className="flex h-full flex-col items-start justify-center gap-2 py-6">
      <span className="grid size-10 place-items-center rounded-2xl bg-surface-2 text-muted">
        <IconCmp size={20} />
      </span>
      <p className="font-medium">{title}</p>
      <p className="max-w-[40ch] text-sm leading-relaxed text-secondary">{body}</p>
    </div>
  );
}
