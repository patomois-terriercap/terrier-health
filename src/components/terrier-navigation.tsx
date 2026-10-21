"use client";

import { useEffect, useId, useRef, useState } from "react";
import styles from "./terrier-navigation.module.css";

type Area = "portal" | "health" | "investments";
const investments = "https://inversiones.terriercapital.cl";
const sections = [
  { href: "/home", label: "Home" },
  { href: "/cuentas", label: "Cuentas" },
  { href: "/transacciones", label: "Transacciones" },
];

export default function TerrierNavigation({ area, currentPath = "/" }: { area: Area; currentPath?: string }) {
  const [open, setOpen] = useState(false);
  const [expanded, setExpanded] = useState(area === "investments");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const root = useRef<HTMLDivElement>(null);
  const trigger = useRef<HTMLButtonElement>(null);
  const id = useId();

  useEffect(() => {
    if (!open) return;
    const outside = (event: PointerEvent) => {
      if (event.target instanceof Node && !root.current?.contains(event.target)) setOpen(false);
    };
    const escape = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        setOpen(false);
        trigger.current?.focus();
      }
    };
    document.addEventListener("pointerdown", outside);
    document.addEventListener("keydown", escape);
    return () => {
      document.removeEventListener("pointerdown", outside);
      document.removeEventListener("keydown", escape);
    };
  }, [open]);

  async function signOut() {
    if (busy) return;
    setBusy(true);
    setError("");
    try {
      const endpoint = area === "investments" ? "/api/auth/logout" : "/api/portal/logout";
      const response = await fetch(endpoint, { method: "POST", credentials: "same-origin" });
      if (!response.ok) throw new Error("No se pudo cerrar la sesión. Intenta nuevamente.");
      window.location.assign("https://terriercapital.cl/ingresar");
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : "No se pudo cerrar la sesión.");
      setBusy(false);
    }
  }

  return (
    <header className={styles.header}>
      <div ref={root} className={styles.navigation} onBlur={(event) => {
        if (event.relatedTarget instanceof Node && !event.currentTarget.contains(event.relatedTarget)) setOpen(false);
      }}>
        <a href="https://terriercapital.cl/menu" className={styles.brand} aria-label="Terrier Capital, portal principal">
          Terrier <span>Capital</span>
        </a>
        <nav aria-label="Aplicaciones" className={styles.nav}>
          <button ref={trigger} type="button" className={styles.trigger}
            aria-label={open ? "Cerrar menú de aplicaciones" : "Abrir menú de aplicaciones"}
            aria-expanded={open} aria-controls={`${id}-menu`} onClick={() => setOpen(!open)}>
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" aria-hidden="true">
              <path d="M4 6h16M4 12h16M4 18h16" />
            </svg>
          </button>
          <div id={`${id}-menu`} className={`${styles.panel} ${!open ? styles.panelClosed : ""}`}>
              <a href={area === "health" ? "/" : "https://salud.terriercapital.cl"}
                className={`${styles.item} ${area === "health" ? styles.active : ""}`}
                aria-current={area === "health" ? "page" : undefined} onClick={() => setOpen(false)}>
                Salud
              </a>
              <button type="button" className={`${styles.item} ${styles.disclosure}`}
                aria-expanded={expanded} aria-controls={`${id}-investments`} onClick={() => setExpanded(!expanded)}>
                <span>Inversiones</span>
                <svg className={expanded ? styles.chevronOpen : styles.chevron} width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" aria-hidden="true">
                  <path d="m9 5 7 7-7 7" />
                </svg>
              </button>
              {expanded && (
                <div id={`${id}-investments`} className={styles.submenu}>
                  {sections.map((section) => {
                    const active = area === "investments" && (currentPath === section.href || (section.href === "/home" && currentPath === "/"));
                    return (
                      <a key={section.href} href={area === "investments" ? section.href : `${investments}${section.href}`}
                        className={`${styles.item} ${active ? styles.active : ""}`} aria-current={active ? "page" : undefined}
                        onClick={() => setOpen(false)}>{section.label}</a>
                    );
                  })}
                  <button type="button" disabled className={`${styles.item} ${styles.unavailable}`}>
                    <span>P&amp;L</span><span className={styles.soon}>Próximamente</span>
                  </button>
                </div>
              )}
              <div className={styles.divider} />
              <button type="button" className={`${styles.item} ${styles.logout}`} disabled={busy} onClick={() => { void signOut(); }}>
                {busy ? "Cerrando sesión…" : "Cerrar sesión"}
              </button>
              {error && <p role="alert" className={styles.error}>{error}</p>}
            </div>
        </nav>
      </div>
    </header>
  );
}
