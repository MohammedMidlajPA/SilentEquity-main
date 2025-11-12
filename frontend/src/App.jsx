import React, { useState, useEffect } from 'react';
import { Routes, Route, Link, Outlet, useNavigate } from "react-router-dom";

import WebinarPayment from './pages/WebinarPayment';



/* Utilities */
const isReduced = () =>
  typeof window !== "undefined" &&
  window.matchMedia &&
  window.matchMedia("(prefers-reduced-motion: reduce)").matches;

function useMediaQuery(query) {
  const [matches, setMatches] = React.useState(false);
  React.useEffect(() => {
    let mql = window.matchMedia(query);
    const onChange = (e) => setMatches(e.matches);
    setMatches(mql.matches);
    mql.addEventListener?.("change", onChange, { passive: true });
    return () => mql.removeEventListener?.("change", onChange);
  }, [query]);
  return matches;
}

const FORM_URL =
  "https://docs.google.com/forms/d/e/1FAIpQLSeCuCsPOq0O-npNmHzcfkZ6O_rZvSxNIof9zznbvr426cUm0g/viewform?usp=header";



/* Hamburger menu */


/* Webinar panel */
function WebinarPanel() {
  const navigate = useNavigate();
  const [state, setState] = useState("entering");
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    const t = window.setTimeout(() => setState("open"), 560);
    const onKey = (e) => {
      if (e.key === "Escape") setState("closed");
    };
    window.addEventListener("keydown", onKey, { passive: true });
    return () => {
      clearTimeout(t);
      window.removeEventListener("keydown", onKey);
    };
  }, []);

  const open = () => {
    setState("entering");
    window.setTimeout(() => setState("open"), 560);
  };
  
  const close = () => setState("closed");

  const handleReserveSlot = async () => {
    if (isLoading) return; // Prevent double clicks
    
    setIsLoading(true);
    try {
      // Directly create checkout session and redirect to Stripe
      // No form needed - Stripe will collect user details
      const API_BASE_URL = 'http://localhost:5001/api'; // Hardcode to avoid env issues
      
      console.log('🔄 Creating checkout session...', API_BASE_URL);
      
      const response = await fetch(`${API_BASE_URL}/payment/create-checkout-session`, {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'Accept': 'application/json'
        },
        body: JSON.stringify({})
      });

      console.log('📡 Response status:', response.status, response.statusText);

      if (!response.ok) {
        const errorText = await response.text();
        console.error('❌ Response error:', errorText);
        let errorData;
        try {
          errorData = JSON.parse(errorText);
        } catch {
          errorData = { message: `Server error: ${response.status} ${response.statusText}` };
        }
        console.error('❌ API Error:', errorData);
        alert('Failed to start payment: ' + (errorData.message || `Error ${response.status}. Please try again.`));
        setIsLoading(false);
        return;
      }

      const data = await response.json();
      console.log('✅ Checkout session created:', data);
      
      if (data.success && data.checkoutUrl) {
        // Redirect directly to Stripe Checkout
        console.log('🔗 Redirecting to Stripe:', data.checkoutUrl);
        window.location.href = data.checkoutUrl;
      } else {
        console.error('❌ Invalid response:', data);
        alert('Failed to create payment session. Response: ' + JSON.stringify(data));
        setIsLoading(false);
      }
    } catch (error) {
      console.error('❌ Error creating checkout session:', error);
      console.error('❌ Error details:', {
        name: error.name,
        message: error.message,
        stack: error.stack
      });
      alert('Connection error: ' + error.message + '\n\nMake sure backend is running on port 5001');
      setIsLoading(false);
    }
  };

  return (
    <>
      <button
        aria-label="Open webinar panel"
        className={`webinar-tab ${state !== "closed" ? "hide" : ""}`}
        onClick={open}
      >
        Join the webinar
      </button>

      <aside
        className={`webinar ${state}`}
        role="dialog"
        aria-modal="true"
        aria-labelledby="webinar-title"
        style={{ pointerEvents: state === "open" ? "auto" : "none" }}
      >
        <div className="webinar-inner">
          <h3 id="webinar-title" className="webinar-title">
            Join The Webinar
          </h3>

          <p className="webinar-copy">
            Join us for an exclusive, registration-only webinar designed to bring our community together. This session will feature key product insights, addresses from our founders, and a deeper look into our mission and vision. Be part of an inspiring experience filled with valuable ideas and meaningful discussions.
          </p>
          
          <p>
            If the current slot is full, join the waitlist to get early access to the next sessions.
          </p>

          <button 
            className="webinar-cta" 
            onClick={handleReserveSlot}
            disabled={isLoading}
            style={{ 
              opacity: isLoading ? 0.7 : 1,
              cursor: isLoading ? 'wait' : 'pointer',
              position: 'relative'
            }}
          >
            {isLoading ? 'Redirecting to payment...' : 'Reserve your slot'}
          </button>

          <button 
            className="webinar-close" 
            aria-label="Close" 
            onClick={close}
          >
            ✕
          </button>
        </div>
      </aside>
    </>
  );
}

/* Particle field optimized */
function ParticleField({ count = 180, mobileCount = 90 }) {
  useEffect(() => {
    if (isReduced()) return;

    const root = document.querySelector(".particles");
    if (!root) return;

    const isMobile = window.matchMedia("(max-width: 768px)").matches;
    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    const vw = Math.max(document.documentElement.clientWidth, window.innerWidth || 0);
    const vh = Math.max(document.documentElement.clientHeight, window.innerHeight || 0);

    const area = (vw * vh) / 100000;
    const cap = Math.min(220, Math.floor(area * (isMobile ? 5 : 8)));
    const COUNT = Math.min(cap, Math.round((isMobile ? mobileCount : count) * (dpr > 1 ? 0.8 : 1)));

    if (root.dataset.seeded === "1") return;

    const frag = document.createDocumentFragment();
    for (let i = 0; i < COUNT; i++) {
      const d = document.createElement("span");
      d.className = "dot";
      d.style.left = (Math.random() * 100).toFixed(2) + "vw";
      d.style.top = (Math.random() * 100).toFixed(2) + "vh";
      const size = (1 + Math.random() * 2).toFixed(2);
      d.style.width = size + "px";
      d.style.height = size + "px";
      d.style.animationDelay = (Math.random() * 8).toFixed(2) + "s";
      d.style.animationDuration = (7 + Math.random() * 8).toFixed(2) + "s";
      d.style.opacity = (0.55 + Math.random() * 0.35).toFixed(2);
      if (Math.random() < 0.4) d.dataset.alt = "1";
      frag.appendChild(d);
    }
    root.appendChild(frag);
    root.dataset.seeded = "1";

    let raf = 0;
    let t0 = performance.now();
    const drift = () => {
      raf = requestAnimationFrame(drift);
      const t = performance.now() - t0;
      if (t > 300) {
        t0 = performance.now();
        const dots = root.querySelectorAll(".dot");
        for (let i = 0; i < dots.length; i += 12) {
          const el = dots[i];
          const o = 0.55 + Math.random() * 0.35;
          el.style.opacity = o.toFixed(2);
        }
      }
    };
    raf = requestAnimationFrame(drift);

    return () => {
      cancelAnimationFrame(raf);
    };
  }, [count, mobileCount]);

  return null;
}

/* Shared IO */
const sharedIO = (() => {
  let ioReveal, ioLine;
  return {
    reveal(cb) {
      if (!ioReveal) {
        ioReveal = new IntersectionObserver(
          (entries, obs) => {
            for (const e of entries) {
              if (e.isIntersecting) {
                cb(e.target);
                obs.unobserve(e.target);
              }
            }
          },
          { rootMargin: "0px 0px -10% 0px", threshold: 0.1 }
        );
      }
      return ioReveal;
    },
    line(cb) {
      if (!ioLine) {
        ioLine = new IntersectionObserver(
          (entries, obs) => {
            for (const e of entries) {
              if (e.isIntersecting) {
                cb(e.target);
                obs.unobserve(e.target);
              }
            }
          },
          { rootMargin: "0px 0px -10% 0px", threshold: 0.1 }
        );
      }
      return ioLine;
    },
  };
})();

/* Reveals */
function useFadeInOnScroll() {
  useEffect(() => {
    const els = document.querySelectorAll(".reveal");
    if (!els.length) return;
    const io = sharedIO.reveal((el) => el.classList.add("in"));
    const id = requestAnimationFrame(() => {
      els.forEach((el) => io.observe(el));
    });
    return () => cancelAnimationFrame(id);
  }, []);
}
function useFadeOnce() {
  useEffect(() => {
    const lines = document.querySelectorAll(".reveal-line");
    if (!lines.length) return;
    const io = sharedIO.line((el) => el.classList.add("in"));
    const idle = window.requestIdleCallback || ((fn) => setTimeout(fn, 1));
    const cancel = idle(() => {
      lines.forEach((el) => io.observe(el));
    });
    return () => {
      if (typeof cancel === "number") clearTimeout(cancel);
    };
  }, []);
}





/* Footer */
function SiteFooter() {
  const isMobile = useMediaQuery("(max-width: 720px)");

  const rowStyle = React.useMemo(() => ({
    display: "flex",
    alignItems: "center",
    justifyContent: isMobile ? "center" : "space-between",
    gap: isMobile ? 12 : 16,
    padding: isMobile ? "12px 14px" : "14px 16px",
    maxWidth: 1100,
    margin: "0 auto",
    flexWrap: "wrap",
  }), [isMobile]);

  return (
    <footer className="footer">
      <div className="footer-inner" role="contentinfo" aria-label="Site footer" style={rowStyle}>
        {isMobile ? (
          <>
            <div style={{ width: "100%", display: "flex", justifyContent: "center" }}>
              <div className="footer-brand">
                <img
                  src="https://iili.io/Kh7cDHG.png"
                  alt="Silent Equity"
                  className="footer-logo"
                  width="160"
                  height="40"
                  loading="lazy"
                  decoding="async"
                  fetchpriority="low"
                />
              </div>
            </div>

            <nav className="footer-social" aria-label="Social links" style={{ display: "flex", gap: 10 }}>
              <a
                href="https://x.com/silent_equity?s=21"
                target="_blank"
                rel="noopener noreferrer"
                aria-label="Follow on X"
                className="social-btn"
              >
                <svg viewBox="0 0 16 16" aria-hidden="true" className="social-ico">
                  <path
                    fill="currentColor"
                    d="M12.6.75h2.454l-5.36 6.142L16 15.25h-4.937l-3.867-5.07-4.425 5.07H.316l5.733-6.57L0 .75h5.063l3.495 4.633L12.601.75Zm-.86 13.028h1.36L4.323 2.145H2.865z"
                  />
                </svg>
              </a>

              <a
                href="https://www.instagram.com/thesilentequity?igsh=MW15eGZ6NWZqanNpdA%3D%3D"
                target="_blank"
                rel="noopener noreferrer"
                aria-label="Follow on Instagram"
                className="social-btn"
              >
                <svg viewBox="0 0 24 24" aria-hidden="true" className="social-ico">
                  <path
                    fill="currentColor"
                    d="M7 2h10a5 5 0 0 1 5 5v10a5 5 0 0 1-5 5H7a5 5 0 0 1-5-5V7a5 5 0 0 1 5-5zm5 3.5a5.5 5.5 0 1 1 0 11 5.5 5.5 0 0 1 0-11zm6 1a1 1 0 1 1 0 2 1 1 0 0 1 0-2z"
                  />
                </svg>
              </a>

              <a
                href="https://www.youtube.com/@SilentEquity10"
                target="_blank"
                rel="noopener noreferrer"
                aria-label="Subscribe on YouTube"
                className="social-btn"
              >
                <svg viewBox="0 0 24 24" aria-hidden="true" className="social-ico">
                  <path
                    fill="currentColor"
                    d="M23.5 7.2a4 4 0 0 0-2.8-2.8C18.9 4 12 4 12 4s-6.9 0-8.7.4a4 4 0 0 0 .5 7.2 41 41 0 0 0 0 12a41 41 0 0 0 .5 4.8 4 4 0 0 0 2.8 2.8C5.1 20 12 20 12 20s6.9 0 8.7-.4a4 4 0 0 0 2.8-2.8A41 41 0 0 0 24 12a41 41 0 0 0-.5-4.8zM9.8 15.3V8.7L15.6 12l-5.8 3.3z"
                  />
                </svg>
              </a>
            </nav>
          </>
        ) : (
          <>
            <address className="footer-address" aria-label="Address" style={{ minWidth: 220, textAlign: "left" }}>
              <div>11 Regent Street</div>
              <div>Leeds, United Kingdom</div>
            </address>

            <div className="footer-brand" style={{ flex: 1, display: "flex", justifyContent: "center" }}>
            <img
              src="https://iili.io/Kh7cDHG.png"
              alt="Silent Equity"
              className="footer-logo"
              width="160"
              height="40"
              loading="lazy"
              decoding="async"
              fetchpriority="low"
            />
            </div>

            <nav className="footer-social" aria-label="Social links" style={{ display: "flex", gap: 10 }}>
              <a
                href="https://x.com/silent_equity?s=21"
                target="_blank"
                rel="noopener noreferrer"
                aria-label="Follow on X"
                className="social-btn"
              >
                <svg viewBox="0 0 16 16" aria-hidden="true" className="social-ico">
                  <path
                    fill="currentColor"
                    d="M12.6.75h2.454l-5.36 6.142L16 15.25h-4.937l-3.867-5.07-4.425 5.07H.316l5.733-6.57L0 .75h5.063l3.495 4.633L12.601.75Zm-.86 13.028h1.36L4.323 2.145H2.865z"
                  />
                </svg>
              </a>

              <a
                href="https://www.instagram.com/thesilentequity?igsh=MW15eGZ6NWZqanNpdA%3D%3D"
                target="_blank"
                rel="noopener noreferrer"
                aria-label="Follow on Instagram"
                className="social-btn"
              >
                <svg viewBox="0 0 24 24" aria-hidden="true" className="social-ico">
                  <path
                    fill="currentColor"
                    d="M7 2h10a5 5 0 0 1 5 5v10a5 5 0 0 1-5 5H7a5 5 0 0 1-5-5V7a5 5 0 0 1 5-5zm5 3.5a5.5 5.5 0 1 1 0 11 5.5 5.5 0 0 1 0-11zm6 1a1 1 0 1 1 0 2 1 1 0 0 1 0-2z"
                  />
                </svg>
              </a>

              <a
                href="https://www.youtube.com/@SilentEquity10"
                target="_blank"
                rel="noopener noreferrer"
                aria-label="Subscribe on YouTube"
                className="social-btn"
              >
                <svg viewBox="0 0 24 24" aria-hidden="true" className="social-ico">
                  <path
                    fill="currentColor"
                    d="M23.5 7.2a4 4 0 0 0-2.8-2.8C18.9 4 12 4 12 4s-6.9 0-8.7.4a4 4 0 0 0 .5 7.2 41 41 0 0 0 0 12a41 41 0 0 0 .5 4.8 4 4 0 0 0 2.8 2.8C5.1 20 12 20 12 20s6.9 0 8.7-.4a4 4 0 0 0 2.8-2.8A41 41 0 0 0 24 12a41 41 0 0 0-.5-4.8zM9.8 15.3V8.7L15.6 12l-5.8 3.3z"
                  />
                </svg>
              </a>
            </nav>
          </>
        )}
      </div>

      <div className="footer-bottom">
        © {new Date().getFullYear()} Silent Equity
      </div>
    </footer>
  );
}

/* Root layout */
function RootLayout() {
  return (
    <main className="page">
      <div className="particles" aria-hidden="true" style={{ pointerEvents: "none" }} />
      <ParticleField count={200} mobileCount={90} />

      <header className="nav" role="banner">
        <div className="brand">
          <Link to="/" aria-label="Go to home" style={{ display: "inline-block" }}>
            <img
              src="https://iili.io/Kh7cDHG.png"
              alt="Silent Equity logo"
              className="brand-logo"
              width="120"
              height="32"
              loading="eager"
              decoding="async"
              fetchpriority="high"
            />
          </Link>
        </div>
      </header>

      
      
     
      <WebinarPanel />

      <Outlet />

      <SiteFooter />
    </main>
  );
}

/* Pages */
function HomePage() {
  useEffect(() => {
    document.documentElement.style.scrollBehavior = "smooth";
  }, []);
  const handleJoin = () => window.open(FORM_URL, "_blank", "noopener,noreferrer");
  return (
    <>
      <section className="hero" role="region" aria-label="Hero">
        <h1 className="title gymbrand">
          NO FAKE HYPE <br /> NO GUESSING
        </h1>
        <button className="cta" onClick={handleJoin}>JOIN THE WAITLIST</button>
        <p className="subtext">Programs launching soon. Get early access updates.</p>
      </section>
      
      
    </>
  );
}

function ProductsPage() {
  return (
    <>
      <section className="hero" role="region" aria-label="Products">
        <h1 className="title">Products</h1>
        <p className="subtext">Upcoming programs and tools.</p>
      </section>
    </>
  );
}

function ContactPage() {
  return (
    <>
      <section className="hero" role="region" aria-label="Contact">
        <h1 className="title">Contact Us</h1>
        <p className="subtext">Write to the team for access and support.</p>
      </section>
    </>
  );
}

/* Routes */
export default function App() {
  return (
    <Routes>
      <Route element={<RootLayout />}>
        <Route index element={<HomePage />} />
        
        <Route path="/payment" element={<WebinarPayment />} />
        
      </Route>
    </Routes>
  );
}
