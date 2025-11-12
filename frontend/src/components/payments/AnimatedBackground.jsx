import React, { useEffect } from "react";

const AnimatedBackground = () => {
  useEffect(() => {
    const container = document.querySelector(".payment-particles");
    if (!container || container.dataset.ready === "true") return;

    // Reduce particles on mobile for better performance
    const isMobile = window.innerWidth <= 768;
    const total = isMobile ? 15 : 30; // Fewer particles on mobile
    const fragment = document.createDocumentFragment();

    // Use requestAnimationFrame for smoother performance
    const createParticles = () => {
      for (let i = 0; i < total; i++) {
        const dot = document.createElement("span");
        dot.className = "particle";
        dot.style.left = `${Math.random() * 100}vw`;
        dot.style.top = `${Math.random() * 100}vh`;
        const size = 1 + Math.random() * 3;
        dot.style.width = `${size}px`;
        dot.style.height = `${size}px`;
        dot.style.animationDelay = `${Math.random() * 10}s`;
        dot.style.animationDuration = `${6 + Math.random() * 6}s`;
        dot.style.willChange = 'transform, opacity';
        fragment.appendChild(dot);
      }
      container.appendChild(fragment);
      container.dataset.ready = "true";
    };

    requestAnimationFrame(createParticles);

    return () => {
      if (container) {
        container.innerHTML = "";
        delete container.dataset.ready;
      }
    };
  }, []);

  return (
    <>
      <div className="payment-particles" aria-hidden="true" />
      <style>{`
        .payment-particles {
          position: fixed;
          inset: 0;
          overflow: hidden;
          z-index: 0;
          pointer-events: none;
        }

        .particle {
          position: absolute;
          border-radius: 50%;
          background: rgba(0, 255, 222, 0.8);
          box-shadow: 0 0 8px rgba(0, 255, 222, 0.4);
          opacity: 0.6;
          animation: floatUp linear infinite, flicker ease-in-out infinite;
          will-change: transform, opacity;
          transform: translateZ(0); /* GPU acceleration */
          backface-visibility: hidden;
        }

        @media (prefers-reduced-motion: reduce) {
          .particle {
            animation: none;
            opacity: 0.4;
          }
        }

        @media (max-width: 768px) {
          .particle {
            box-shadow: 0 0 4px rgba(0, 255, 222, 0.3);
          }
        }

        @keyframes floatUp {
          0% {
            transform: translateY(0) translateX(0);
          }
          50% {
            transform: translateY(-20vh) translateX(2vw);
          }
          100% {
            transform: translateY(-40vh) translateX(-2vw);
          }
        }

        @keyframes flicker {
          0%, 100% { opacity: 0.6; }
          50% { opacity: 0.9; }
        }

        @media (prefers-reduced-motion: reduce) {
          .particle { animation: none; }
        }
      `}</style>
    </>
  );
};

export default AnimatedBackground;
