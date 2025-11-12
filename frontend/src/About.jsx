// src/About.jsx (or src/pages/About.jsx)
import React, { useEffect, useRef } from "react";
import { Link } from "react-router-dom";
import * as THREE from "three";                  // npm: three
import NET from "vanta/dist/vanta.net.min.js";   // npm: vanta

const FORM_URL =
  "https://docs.google.com/forms/d/e/1FAIpQLSeCuCsPOq0O-npNmHzcfkZ6O_rZvSxNIof9zznbvr426cUm0g/viewform?usp=header";

export default function About() {
  const vantaRef = useRef(null);
  const vantaEffect = useRef(null);

  useEffect(() => {
    document.title = "About Us — Silent Equity";
  }, []);

  // Hide shared ParticleField only on this route so Vanta is the sole background
  useEffect(() => {
    const particles = document.querySelector(".particles");
    if (!particles) return;
    const prev = particles.style.display;
    particles.style.display = "none";
    return () => {
      particles.style.display = prev;
    };
  }, []);

  // Init Vanta NET (moderate speed, brand teal, dots visible, lower line and dot opacity)
  useEffect(() => {
    if (!vantaEffect.current && vantaRef.current) {
      // Match brand/particles teal via CSS var if present
      const root = getComputedStyle(document.documentElement);
      const cssTeal = root.getPropertyValue("--particle-color").trim(); // e.g. #00ffe0
      const toHexNum = (c) => {
        if (!c) return 0x00ffe0;
        const h = c.startsWith("#") ? c.slice(1) : c;
        const full = h.length === 3 ? h.split("").map(x => x + x).join("") : h;
        const num = parseInt(full, 16);
        return Number.isNaN(num) ? 0x00ffe0 : num;
      };
      const tealHex = toHexNum(cssTeal);

      vantaEffect.current = NET({
        el: vantaRef.current,
        THREE,
        mouseControls: true,
        touchControls: true,
        gyroControls: false,
        minHeight: 200.0,
        minWidth: 200.0,
        scale: 1.0,
        scaleMobile: 1.0,
        // Tuned motion: a touch faster than default, but not too fast
        speed: 1.2,
        points: 8,
        maxDistance: 20,
        spacing: 20,
        showDots: true,       // dots ON
        color: tealHex,       // line/dot color matches particles teal
        backgroundColor: 0x000000
      });

      // Soften line visibility and dim dot spheres after internals are ready
      const applyTweaks = () => {
        const fx = vantaEffect.current;
        if (!fx) return;

        // Lines
        if (fx.linesMesh?.material) {
          fx.linesMesh.material.opacity = 0.24;    // your requested line alpha
          fx.linesMesh.material.transparent = true;
          fx.linesMesh.material.needsUpdate = true;
        }

        // Dots
        // Vanta stores point meshes in fx.points; reduce each dot's opacity
        if (Array.isArray(fx.points)) {
          fx.points.forEach((p) => {
            if (p?.material) {
              p.material.opacity = 0.75;          // adjust to taste (0.25–0.55)
              p.material.transparent = true;
              p.material.needsUpdate = true;
            }
          });
        }
      };

      const rafId = requestAnimationFrame(applyTweaks);
      return () => cancelAnimationFrame(rafId);
    }

    return () => {
      if (vantaEffect.current) {
        vantaEffect.current.destroy();
        vantaEffect.current = null;
      }
    };
  }, []);

  const Section = ({ title, children }) => (
    <section style={{ maxWidth: 1100, margin: "0 auto", padding: "40px 16px" }}>
      {title ? (
        <h2 style={{ margin: "0 0 12px", color: "#ccfff7", fontSize: 28 }}>{title}</h2>
      ) : null}
      <div style={{ color: "#a6f3e7", lineHeight: 1.7 }}>{children}</div>
    </section>
  );

  const Card = ({ emoji, title, text }) => (
    <article
      style={{
        background: "rgba(6,20,22,0.85)",
        border: "1px solid rgba(0,255,222,0.18)",
        borderRadius: 12,
        padding: 18,
        boxShadow: "0 18px 45px rgba(0,0,0,0.35), 0 8px 24px rgba(0,255,222,0.10) inset",
      }}
    >
      <div style={{ fontSize: 22, marginBottom: 8 }}>{emoji}</div>
      <h4 style={{ margin: "0 0 6px", color: "#ccfff7" }}>{title}</h4>
      <p style={{ margin: 0, color: "#9fece2" }}>{text}</p>
    </article>
  );

  const openForm = () =>
    window.open(FORM_URL, "_blank", "noopener,noreferrer");

  return (
    <main
      className="page"
      // isolation creates a new stacking context; Vanta at z-index:-1 stays behind all content
      style={{ position: "relative", zIndex: 0, background: "transparent", isolation: "isolate" }}
    >
      {/* Vanta background canvas, fixed behind content */}
      <div
        ref={vantaRef}
        aria-hidden="true"
        style={{
          position: "fixed",
          inset: 0,
          zIndex: -1,             // keep background behind page content
          pointerEvents: "none"
        }}
      />

      {/* Hero */}
      <section
        role="region"
        aria-label="About hero"
        style={{ padding: "56px 16px 10px", textAlign: "center", position: "relative", zIndex: 1 }}
      >
        <h1 className="title gymbrand h-hero">About US</h1>
        <p className="subtext" style={{ color: "#9fece2" }}>
          Built for clarity, discipline, and results—no noise, no drama.
        </p>
      </section>

      {/* Mission */}
      <Section title="Mission">
        <p>Silent Equity builds data‑driven systems that make decision‑making consistent and unemotional for traders and teams.</p>
        <p>The focus is practical workflows and measurable outcomes, not theoretical content or hype.</p>
      </Section>

      {/* Principles grid */}
      <section style={{ maxWidth: 1100, margin: "0 auto", padding: "10px 16px 30px", position: "relative", zIndex: 1 }}>
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))",
            gap: 14,
          }}
        >
          <Card emoji="📊" title="Data First" text="Signals over opinions; logs over memory." />
          <Card emoji="⏱️" title="Timing" text="Execution optimized for the moments that matter." />
          <Card emoji="🛡️" title="Risk" text="Capital preservation before growth." />
          <Card emoji="🏗️" title="Systems" text="Repeatable processes over ad‑hoc choices." />
        </div>
      </section>

      {/* Story */}
      <Section title="Story">
        <p>Started by operators who wanted fewer moving parts and more accountability, Silent Equity prioritizes robust tooling and lean execution.</p>
        <p>The programs open in cohorts with limited seats to preserve quality and direct support.</p>
      </Section>

      {/* CTA */}
      <Section title="">
        <div style={{ textAlign: "center" }}>
          <button className="cta" onClick={openForm}>JOIN THE WAITLIST</button>
          <p className="subtext" style={{ marginTop: 10, color: "#9fece2" }}>
            Get notified when the next session opens.
          </p>
        </div>
      </Section>
    </main>
  );
}
