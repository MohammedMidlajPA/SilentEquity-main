// src/pages/Contact.jsx
import React, { useEffect, useLayoutEffect, useRef } from "react";
import p5 from "p5";                                          // npm i p5
import TOPOLOGY from "vanta/dist/vanta.topology.min.js";      // npm i vanta

export default function Contact() {
  const vantaRef = useRef(null);
  const vantaEffect = useRef(null);

  useEffect(() => {
    document.title = "Contact — Silent Equity";
  }, []);

  // Hide shared ParticleField on this route (we use Vanta)
  useEffect(() => {
    const particles = document.querySelector(".particles");
    if (!particles) return;
    const prev = particles.style.display;
    particles.style.display = "none";
    return () => {
      particles.style.display = prev;
    };
  }, []);

  // Init Vanta Topology ASAP (useLayoutEffect reduces visible delay)
  useLayoutEffect(() => {
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
      const topoColor = toHexNum(cssTeal);

      vantaEffect.current = TOPOLOGY({
        el: vantaRef.current,
        p5,
        mouseControls: true,
        touchControls: true,
        gyroControls: false,
        minHeight: 200.0,
        minWidth: 200.0,
        scale: 1.0,
        scaleMobile: 1.0,
        color: topoColor
      });
    }
    return () => {
      if (vantaEffect.current) {
        vantaEffect.current.destroy();
        vantaEffect.current = null;
      }
    };
  }, []);

  const Field = ({ label, children }) => (
    <label style={{ display: "block", marginBottom: 12 }}>
      <div style={{ color: "#ccfff7", fontSize: 14, marginBottom: 6 }}>{label}</div>
      {children}
    </label>
  );

  const Input = (props) => (
    <input
      {...props}
      style={{
        width: "100%",
        padding: "12px 14px",
        borderRadius: 10,
        background: "rgba(0,0,0,0.35)",
        border: "1px solid rgba(0,255,222,0.18)",
        color: "#ccfff7",
        outline: "none",
      }}
    />
  );

  const Select = (props) => (
    <select
      {...props}
      style={{
        width: "100%",
        padding: "12px 14px",
        borderRadius: 10,
        background: "rgba(0,0,0,0.35)",
        border: "1px solid rgba(0,255,222,0.18)",
        color: "#ccfff7",
        outline: "none",
      }}
    />
  );

  const Textarea = (props) => (
    <textarea
      {...props}
      style={{
        width: "100%",
        padding: "12px 14px",
        borderRadius: 10,
        background: "rgba(0,0,0,0.35)",
        border: "1px solid rgba(0,255,222,0.18)",
        color: "#ccfff7",
        outline: "none",
        resize: "vertical",
      }}
    />
  );

  const Card = ({ icon, title, children }) => (
    <div
      style={{
        display: "flex",
        gap: 12,
        alignItems: "flex-start",
        padding: 14,
        borderRadius: 12,
        background: "rgba(6,20,22,0.85)",
        border: "1px solid rgba(0,255,222,0.18)",
        boxShadow: "0 18px 45px rgba(0,0,0,0.35), 0 8px 24px rgba(0,255,222,0.10) inset",
      }}
    >
      <div
        style={{
          width: 44,
          height: 44,
          borderRadius: 10,
          display: "grid",
          placeItems: "center",
          background: "linear-gradient(180deg, rgba(0,255,222,0.20), rgba(0,255,222,0.05))",
          border: "1px solid rgba(0,255,222,0.25)",
          color: "#9fece2",
          fontSize: 22,
        }}
      >
        {icon}
      </div>
      <div>
        <div style={{ color: "#ccfff7", marginBottom: 6, fontWeight: 600 }}>{title}</div>
        <div style={{ color: "#a6f3e7", lineHeight: 1.65 }}>{children}</div>
      </div>
    </div>
  );

  return (
    <main
      className="page"
      style={{
        position: "relative",
        zIndex: 0,
        background: "transparent",
        isolation: "isolate", // keeps negative z-index layers behind content
        paddingTop: "64px"
      }}
    >
      {/* local CSS to force two-column layout like your screenshot */}
      <style>{`
        .contact-grid {
          display: grid;
          grid-template-columns: 1fr 1.35fr; /* info left, form right */
          gap: 16px;
          align-items: stretch;
        }
        @media (max-width: 900px) {
          .contact-grid { grid-template-columns: 1fr; }
        }
      `}</style>

      {/* TOPOLOGY canvas behind everything */}
      <div
        ref={vantaRef}
        aria-hidden="true"
        style={{
          position: "fixed",
          inset: 0,
          zIndex: -2,
          pointerEvents: "none",
          filter: "blur(0.8px)",
          opacity: 0.9
        }}
      />
      {/* Masks to keep header logo and footer crisp */}
      <div
        aria-hidden="true"
        style={{
          position: "fixed",
          top: 0,
          left: 0,
          right: 0,
          height: "84px",
          zIndex: -1,
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
          height: "96px",
          zIndex: -1,
          pointerEvents: "none",
          background: "linear-gradient(0deg, rgba(0,0,0,0.70), rgba(0,0,0,0.00))"
        }}
      />

    

      {/* Hero */}
      <section role="region" aria-label="Contact hero" style={{ padding: "24px 16px 10px", textAlign: "center" }}>
        <h1 className="title gymbrand h-hero" style={{ margin: "0 0 6px" }}>Contact Us</h1>
        <p className="subtext" style={{ color: "#9fece2", margin: 0 }}>
          Have questions? Send a message and the team will respond as soon as possible.
        </p>
      </section>

      {/* Content: two-column layout */}
      <section style={{ maxWidth: 1100, margin: "0 auto", padding: "10px 16px 56px" }}>
        <div className="contact-grid">
          {/* Left info column */}
          <div
            style={{
              background: "rgba(6,20,22,0.85)",
              border: "1px solid rgba(0,255,222,0.18)",
              borderRadius: 14,
              padding: 16,
              boxShadow: "0 18px 45px rgba(0,0,0,0.35), 0 8px 24px rgba(0,255,222,0.10) inset",
            }}
          >
            <div style={{ display: "grid", gap: 12 }}>
              <Card icon="✉️" title="Email">
                unmask@thesilentequity.com
              </Card>
              <Card icon="📍" title="Address">
                11 Regent Street<br />Leeds, United Kingdom
              </Card>
              <Card icon="📞" title="Response Time">
                We typically respond within 24 hours
              </Card>
            </div>
          </div>

          {/* Right form column */}
          <form
            onSubmit={(e) => e.preventDefault()}
            style={{
              background: "rgba(6,20,22,0.85)",
              border: "1px solid rgba(0,255,222,0.18)",
              borderRadius: 14,
              padding: 16,
              boxShadow: "0 18px 45px rgba(0,0,0,0.35), 0 8px 24px rgba(0,255,222,0.10) inset",
            }}
          >
            <div
              style={{
                display: "grid",
                gridTemplateColumns: "repeat(2, minmax(220px, 1fr))",
                gap: 12,
              }}
            >
              <Field label="Full Name *">
                <Input type="text" placeholder="Enter your full name" required />
              </Field>
              <Field label="Email Address *">
                <Input type="email" placeholder="Enter your email" required />
              </Field>
              <Field label="Phone Number">
                <Input type="tel" placeholder="Enter your phone number" />
              </Field>
              <Field label="Subject *">
                <Select defaultValue="">
                  <option value="" disabled>Select a subject</option>
                  <option value="access">Program Access</option>
                  <option value="support">Support</option>
                  <option value="partnership">Partnership</option>
                  <option value="other">Other</option>
                </Select>
              </Field>
              <div style={{ gridColumn: "1 / -1" }}>
                <Field label="Message *">
                  <Textarea rows={6} placeholder="Tell us how we can help you..." required />
                </Field>
              </div>
            </div>

            <div style={{ marginTop: 8 }}>
              <button className="cta" type="submit" style={{ width: "100%" }}>
                ➤ Send Message
              </button>
            </div>
          </form>
        </div>
      </section>
    </main>
  );
}
