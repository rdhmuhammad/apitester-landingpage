import React, { useEffect, useRef } from 'react';

export type ReactBitsVariant = 'squares' | 'aurora' | 'dots';

interface ReactBitsBackgroundProps {
  variant: ReactBitsVariant;
  isDark: boolean;
}

/**
 * Interactive ReactBits-inspired animated background for the Hero section.
 * Supports 3 signature ReactBits presets in the Indigo & White palette:
 * - 'squares': ReactBits Interactive Grid Squares with cursor hover illumination
 * - 'aurora': ReactBits Indigo Aurora Silk Mesh waves
 * - 'dots': ReactBits Interactive Dot Matrix with proximity glow
 */
export const ReactBitsBackground: React.FC<ReactBitsBackgroundProps> = ({
  variant,
  isDark,
}) => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const mouseRef = useRef<{ x: number; y: number; active: boolean }>({
    x: -1000,
    y: -1000,
    active: false,
  });

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let animationFrameId = 0;
    let width = (canvas.width = canvas.parentElement?.clientWidth || window.innerWidth);
    let height = (canvas.height = canvas.parentElement?.clientHeight || 800);

    const prefersReducedMotion =
      typeof window !== 'undefined' &&
      window.matchMedia?.('(prefers-reduced-motion: reduce)').matches;

    const handleResize = () => {
      if (!canvas) return;
      width = canvas.width = canvas.parentElement?.clientWidth || window.innerWidth;
      height = canvas.height = canvas.parentElement?.clientHeight || 800;
    };

    const handleMouseMove = (e: MouseEvent) => {
      const rect = canvas.getBoundingClientRect();
      mouseRef.current = {
        x: e.clientX - rect.left,
        y: e.clientY - rect.top,
        active:
          e.clientX >= rect.left &&
          e.clientX <= rect.right &&
          e.clientY >= rect.top &&
          e.clientY <= rect.bottom,
      };
    };

    const handleMouseLeave = () => {
      mouseRef.current.active = false;
    };

    window.addEventListener('resize', handleResize);
    window.addEventListener('mousemove', handleMouseMove, { passive: true });
    window.addEventListener('mouseleave', handleMouseLeave);

    let tick = 0;

    const render = () => {
      tick += prefersReducedMotion ? 0 : 0.35;
      ctx.clearRect(0, 0, width, height);

      if (variant === 'squares') {
        const gridSize = 44;
        const offsetX = (tick * 0.6) % gridSize;
        const offsetY = (tick * 0.4) % gridSize;

        ctx.lineWidth = 1;
        ctx.strokeStyle = isDark
          ? 'rgba(99, 102, 241, 0.13)'
          : 'rgba(79, 70, 229, 0.08)';

        const cols = Math.ceil(width / gridSize) + 2;
        const rows = Math.ceil(height / gridSize) + 2;

        for (let r = -1; r < rows; r++) {
          for (let c = -1; c < cols; c++) {
            const x = c * gridSize - offsetX;
            const y = r * gridSize - offsetY;

            // Subtle ambient pulse on deterministic cells
            const cellHash = Math.sin(c * 12.9898 + r * 78.233) * 43758.5453;
            const pulse = Math.sin(tick * 0.04 + (cellHash % 6.28));
            if (pulse > 0.92) {
              ctx.fillStyle = isDark
                ? `rgba(99, 102, 241, ${(pulse - 0.92) * 1.4})`
                : `rgba(79, 70, 229, ${(pulse - 0.92) * 0.85})`;
              ctx.fillRect(x, y, gridSize, gridSize);
            }

            // Cursor proximity highlight
            if (mouseRef.current.active) {
              const dx = mouseRef.current.x - (x + gridSize / 2);
              const dy = mouseRef.current.y - (y + gridSize / 2);
              const dist = Math.sqrt(dx * dx + dy * dy);
              if (dist < 140) {
                const alpha = (1 - dist / 140) * (isDark ? 0.28 : 0.16);
                ctx.fillStyle = isDark
                  ? `rgba(129, 140, 248, ${alpha})`
                  : `rgba(79, 70, 229, ${alpha})`;
                ctx.fillRect(x + 1, y + 1, gridSize - 2, gridSize - 2);
              }
            }

            ctx.strokeRect(x, y, gridSize, gridSize);
          }
        }
      } else if (variant === 'aurora') {
        // ReactBits-inspired Indigo Aurora Silk ribbons
        for (let i = 0; i < 3; i++) {
          ctx.beginPath();
          const baseY = height * (0.22 + i * 0.18);
          ctx.moveTo(0, baseY);
          for (let x = 0; x <= width; x += 24) {
            const wave1 = Math.sin(x * 0.003 + tick * 0.03 + i * 1.4) * 55;
            const wave2 = Math.cos(x * 0.006 - tick * 0.02 + i) * 30;
            ctx.lineTo(x, baseY + wave1 + wave2);
          }
          ctx.lineTo(width, height);
          ctx.lineTo(0, height);
          ctx.closePath();

          const grad = ctx.createLinearGradient(0, baseY - 80, width, baseY + 180);
          if (isDark) {
            grad.addColorStop(0, `rgba(79, 70, 229, ${0.14 - i * 0.03})`);
            grad.addColorStop(0.5, `rgba(129, 140, 248, ${0.1 - i * 0.02})`);
            grad.addColorStop(1, 'rgba(15, 23, 42, 0)');
          } else {
            grad.addColorStop(0, `rgba(79, 70, 229, ${0.09 - i * 0.02})`);
            grad.addColorStop(0.5, `rgba(99, 102, 241, ${0.06 - i * 0.015})`);
            grad.addColorStop(1, 'rgba(255, 255, 255, 0)');
          }
          ctx.fillStyle = grad;
          ctx.fill();
        }
      } else {
        // ReactBits-inspired Dot Matrix
        const spacing = 28;
        const cols = Math.ceil(width / spacing);
        const rows = Math.ceil(height / spacing);

        for (let r = 0; r < rows; r++) {
          for (let c = 0; c < cols; c++) {
            const x = c * spacing + spacing / 2;
            const y = r * spacing + spacing / 2;
            const wave = Math.sin(c * 0.35 + r * 0.25 + tick * 0.05);
            let radius = 1.3 + (wave > 0.6 ? (wave - 0.6) * 2.2 : 0);
            let alpha = isDark ? 0.22 : 0.16;

            if (mouseRef.current.active) {
              const dx = mouseRef.current.x - x;
              const dy = mouseRef.current.y - y;
              const dist = Math.sqrt(dx * dx + dy * dy);
              if (dist < 130) {
                const factor = 1 - dist / 130;
                radius += factor * 2.4;
                alpha = Math.min(0.75, alpha + factor * 0.45);
              }
            }

            ctx.beginPath();
            ctx.arc(x, y, radius, 0, Math.PI * 2);
            ctx.fillStyle = isDark
              ? `rgba(129, 140, 248, ${alpha})`
              : `rgba(79, 70, 229, ${alpha})`;
            ctx.fill();
          }
        }
      }

      if (!prefersReducedMotion) {
        animationFrameId = window.requestAnimationFrame(render);
      }
    };

    render();

    return () => {
      window.cancelAnimationFrame(animationFrameId);
      window.removeEventListener('resize', handleResize);
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mouseleave', handleMouseLeave);
    };
  }, [variant, isDark]);

  return (
    <div
      className="pointer-events-none absolute inset-0 overflow-hidden"
      aria-hidden="true"
    >
      <canvas ref={canvasRef} className="h-full w-full block" />
      <div
        className={`
          absolute inset-0
          ${
            isDark
              ? 'bg-gradient-to-b from-slate-950/10 via-transparent to-slate-950'
              : 'bg-gradient-to-b from-white/10 via-transparent to-white'
          }
        `}
      />
    </div>
  );
};
