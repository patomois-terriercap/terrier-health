"use client";

import { GearSix } from "@phosphor-icons/react";
import { AnimatePresence, motion } from "motion/react";
import { useEffect, useId, useRef, useState } from "react";
import { DEFAULT_SETTINGS, useSettings, type Units } from "@/lib/settings";
import { Segmented, spring } from "./primitives";

function NumberField({
  label,
  help,
  value,
  step,
  min,
  max,
  onChange,
}: {
  label: string;
  help: string;
  value: number;
  step: number;
  min: number;
  max: number;
  onChange: (v: number) => void;
}) {
  const id = useId();
  return (
    <div className="flex flex-col gap-2">
      <label htmlFor={id} className="text-[13px] font-medium">
        {label}
      </label>
      <input
        id={id}
        key={value} // resync if the value changes elsewhere (e.g. reset)
        type="number"
        inputMode="numeric"
        defaultValue={value}
        step={step}
        min={min}
        max={max}
        // Commit on blur/Enter so intermediate keystrokes aren't rejected.
        onBlur={(e) => {
          const v = Math.round(Number(e.target.value));
          if (Number.isFinite(v) && v >= min && v <= max) onChange(v);
          else e.target.value = String(value);
        }}
        onKeyDown={(e) => e.key === "Enter" && e.currentTarget.blur()}
        className="tabular rounded-xl bg-surface-2 px-3 py-2 text-sm shadow-[inset_0_0_0_1px_var(--line)] outline-none focus:shadow-[inset_0_0_0_2px_var(--sleep)]"
      />
      <p className="text-xs text-muted">{help}</p>
    </div>
  );
}

export default function SettingsMenu() {
  const settings = useSettings();
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;
    const onDown = (e: PointerEvent) => !ref.current?.contains(e.target as Node) && setOpen(false);
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && setOpen(false);
    document.addEventListener("pointerdown", onDown);
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("pointerdown", onDown);
      document.removeEventListener("keydown", onKey);
    };
  }, [open]);

  return (
    <div ref={ref} className="relative">
      <button
        onClick={() => setOpen((o) => !o)}
        aria-expanded={open}
        aria-haspopup="dialog"
        aria-label="Settings"
        title="Settings"
        className="card grid size-10 place-items-center !rounded-full text-secondary transition hover:text-primary active:scale-95"
      >
        <GearSix size={16} />
      </button>
      <AnimatePresence>
        {open && (
          <motion.div
            role="dialog"
            aria-label="Settings"
            initial={{ opacity: 0, y: -6, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -6, scale: 0.98 }}
            transition={spring}
            className="card absolute right-0 z-20 mt-2 flex w-72 origin-top-right flex-col gap-5 !rounded-3xl p-5"
          >
            <NumberField
              label="Daily step goal"
              help="Fills the outer ring and colors the steps chart."
              value={settings.stepGoal}
              step={500}
              min={1000}
              max={50000}
              onChange={(stepGoal) => settings.update({ stepGoal })}
            />
            <NumberField
              label="Weekly Zone Minutes goal"
              help="150 is the WHO-recommended weekly minimum."
              value={settings.weeklyZoneGoal}
              step={10}
              min={10}
              max={1000}
              onChange={(weeklyZoneGoal) => settings.update({ weeklyZoneGoal })}
            />
            <div className="flex flex-col gap-2">
              <span className="text-[13px] font-medium">Distance</span>
              <Segmented<Units>
                label="Units"
                options={["metric", "imperial"]}
                value={settings.units}
                onChange={(units) => settings.update({ units })}
                format={(u) => (u === "metric" ? "Kilometers" : "Miles")}
              />
            </div>
            <button
              onClick={() => settings.update(DEFAULT_SETTINGS)}
              className="self-start text-xs text-muted underline-offset-2 hover:text-primary hover:underline"
            >
              Reset to defaults
            </button>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
