// src/pages/Products.jsx
import React, { useEffect, useRef } from "react";
import { Link } from "react-router-dom";
import p5 from "p5";                                  // npm i p5
import TRUNK from "vanta/dist/vanta.trunk.min.js";    // npm i vanta

const BUY_URL = "/buy/silent-edge"; // replace with your real checkout path

export default function Products() {
  const vantaRef = useRef(null);
  const vantaEffect = useRef(null);

  useEffect(() => {
    document.title = "Products — Silent Equity";
  }, []);

  // Hide shared ParticleField on this route (use Vanta instead)
  useEffect(() => {
    const particles = document.querySelector(".particles");
    if (!particles) return;
    const prev = particles.style.display;
    particles.style.display = "none";
    return () => {
      particles.style.display = prev;
    };
  }, []);

  // Init Vanta TRUNK (p5-based)
  useEffect(() => {
    if (!vantaEffect.current && vantaRef.current) {
      const root = getComputedStyle(document.documentElement);
      const cssTeal = root.getPropertyValue("--particle-color").trim(); // e.g. #00ffe0
      const toHexNum = (c) => {
        if (!c) return 0x00ffe0;
        const h = c.startsWith("#") ? c.slice(1) : c;
        const full = h.length === 3 ? h.split("").map(x => x + x).join("") : h;
        const num = parseInt(full, 16);
        return Number.isNaN(num) ? 0x00ffe0 : num;
      };
      const trunkColor = toHexNum(cssTeal);

      vantaEffect.current = TRUNK({
        el: vantaRef.current,
        p5,
        mouseControls: true,
        touchControls: true,
        gyroControls: false,
        minHeight: 200.0,
        minWidth: 200.0,
        scale: 1.0,
        scaleMobile: 1.0,
        color: trunkColor,
        backgroundColor: 0x000000,
        chaos: 10.0
      });
    }
    return () => {
      if (vantaEffect.current) {
        vantaEffect.current.destroy();
        vantaEffect.current = null;
      }
    };
  }, []);

  const Card = ({ title, status, desc, cta }) => {
    const isLive = status === "live";
    return (
      <article
        style={{
          background: "rgba(6,20,22,0.85)",
          border: "1px solid rgba(0,255,222,0.18)",
          borderRadius: 14,
          padding: 18,
          boxShadow: "0 18px 45px rgba(0,0,0,0.35), 0 8px 24px rgba(0,255,222,0.10) inset",
          display: "flex",
          flexDirection: "column",
          gap: 10,
        }}
      >
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 10 }}>
          <h3 style={{ margin: 0, color: "#ccfff7", fontSize: 22 }}>{title}</h3>
          <span
            style={{
              fontSize: 12,
              color: isLive ? "#022c26" : "#9fece2",
              background: isLive ? "rgba(0,255,222,0.9)" : "rgba(159,236,226,0.15)",
              border: isLive ? "1px solid rgba(0,255,222,0.6)" : "1px solid rgba(159,236,226,0.25)",
              padding: "6px 10px",
              borderRadius: 999,
              letterSpacing: 0.3,
            }}
          >
            {isLive ? "LIVE" : "UPCOMING"}
          </span>
        </div>

        <p style={{ margin: 0, color: "#a6f3e7", lineHeight: 1.65 }}>{desc}</p>

        <div style={{ marginTop: "auto" }}>
          {isLive ? (
            <a
              className="cta"
              href={BUY_URL}
              style={{ display: "inline-block", textDecoration: "none" }}
            >
              BUY NOW
            </a>
          ) : (
            <button
              className="cta"
              disabled
              title="Coming soon"
              style={{
                opacity: 0.6,
                cursor: "not-allowed",
                filter: "grayscale(0.3)",
              }}
            >
              {cta || "COMING SOON"}
            </button>
          )}
        </div>
      </article>
    );
  };

  return (
    <main
      className="page"
      style={{
        position: "relative",
        zIndex: 0,
        background: "transparent",
        isolation: "isolate",
        paddingTop: "64px" // keep logo/header visible like main page
      }}
    >
      {/* TRUNK canvas, behind everything */}
      <div
        ref={vantaRef}
        aria-hidden="true"
        style={{
          position: "fixed",
          inset: 0,
          zIndex: -2,
          pointerEvents: "none",
          filter: "blur(1.2px)",
          opacity: 0.9
        }}
      />

      {/* Protective masks to keep logo and footer crisp (same outcome as main page) */}
      <div
        aria-hidden="true"
        style={{
          position: "fixed",
          top: 0,
          left: 0,
          right: 0,
          height: "84px",                       // cover header/logo zone
          zIndex: -1,                           // above TRUNK, below content
          pointerEvents: "none",
          background: "linear-gradient(180deg, rgba(0,0,0,0.70), rgba(0,0,0,0.00))"
        }}
      />
      <div
        aria-hidden="true"
        style={{
          position: "fixed",
          left: 0,
          right: 0,
          bottom: 0,
          height: "96px",                       // cover footer/address zone
          zIndex: -1,
          pointerEvents: "none",
          background: "linear-gradient(0deg, rgba(0,0,0,0.70), rgba(0,0,0,0.00))"
        }}
      />

      {/* Hero */}
      <section role="region" aria-label="Products hero" style={{ padding: "24px 16px 19px", textAlign: "center" }}>
        <h1 className="title gymbrand h-hero" style={{ margin: "0 0 4px" }}>
          Programs
        </h1>
        <p className="subtext" style={{ color: "#9fece2", margin: "0 0 2px" }}>
          Practical systems for consistent execution—no noise, no drama.
        </p>
      </section>

      {/* Grid */}
      <section style={{ maxWidth: 1100, margin: "0 auto", padding: "4px 16px 44px" }}>
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(240px, 1fr))",
            gap: 16,
          }}
        >
          <Card
            title="SILENT EDGE"
            status="live"
            desc="Your execution system: structure, timing, and risk logic distilled into a repeatable workflow."
          />
          <Card
            title="Code Of Consistency"
            status="upcoming"
            desc="Rule‑based habits and playbooks for stable decision‑making under pressure."
            cta="UPCOMING"
          />
          <Card
            title="Prop Firm Pro"
            status="upcoming"
            desc="Evaluation‑oriented routines and risk frameworks tuned for prop conditions."
            cta="UPCOMING"
          />
          <Card
            title="AI School"
            status="upcoming"
            desc="Operator‑level AI tooling for research, journaling, and automation in trading workflows."
            cta="UPCOMING"
          />
        </div>
      </section>
    </main>
  );
}