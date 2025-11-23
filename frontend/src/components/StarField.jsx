import React, { useEffect, useRef } from 'react';
import usePrefersReducedMotion from '../hooks/usePrefersReducedMotion';

const STAR_COUNT = 140;

function createStar(bounds) {
  return {
    x: Math.random() * bounds.width,
    y: Math.random() * bounds.height,
    size: Math.random() * 1.2 + 0.2,
    velocity: Math.random() * 0.15 + 0.05,
    alpha: Math.random() * 0.6 + 0.2,
  };
}

export default function StarField() {
  const canvasRef = useRef(null);
  const prefersReducedMotion = usePrefersReducedMotion();

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas || typeof window === 'undefined' || prefersReducedMotion) {
      if (canvas) {
        canvas.style.display = 'none';
      }
      return undefined;
    }

    const ctx = canvas.getContext('2d');
    const bounds = { width: window.innerWidth, height: window.innerHeight };
    let animationFrame;
    let stars = Array.from({ length: STAR_COUNT }, () => createStar(bounds));

    const resize = () => {
      bounds.width = window.innerWidth;
      bounds.height = window.innerHeight;
      canvas.width = bounds.width;
      canvas.height = bounds.height;
      stars = stars.map((star) => ({
        ...star,
        x: Math.random() * bounds.width,
        y: Math.random() * bounds.height,
      }));
    };

    canvas.width = bounds.width;
    canvas.height = bounds.height;
    window.addEventListener('resize', resize, { passive: true });

    const render = () => {
      ctx.clearRect(0, 0, bounds.width, bounds.height);
      ctx.fillStyle = '#0ff';

      stars.forEach((star) => {
        star.y -= star.velocity;
        if (star.y < -2) {
          star.y = bounds.height + 2;
          star.x = Math.random() * bounds.width;
        }

        ctx.globalAlpha = star.alpha;
        ctx.beginPath();
        ctx.arc(star.x, star.y, star.size, 0, Math.PI * 2);
        ctx.fill();
      });

      ctx.globalAlpha = 1;
      animationFrame = requestAnimationFrame(render);
    };

    animationFrame = requestAnimationFrame(render);

    const handleVisibilityChange = () => {
      if (document.hidden) {
        cancelAnimationFrame(animationFrame);
      } else {
        animationFrame = requestAnimationFrame(render);
      }
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);

    return () => {
      cancelAnimationFrame(animationFrame);
      window.removeEventListener('resize', resize);
      document.removeEventListener('visibilitychange', handleVisibilityChange);
    };
  }, [prefersReducedMotion]);

  return <canvas ref={canvasRef} className="starfield" aria-hidden="true" />;
}










