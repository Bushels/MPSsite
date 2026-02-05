import { useEffect, useRef, useCallback } from 'react';
import styles from './ParticleCanvas.module.css';

interface Particle {
  x: number;
  y: number;
  vx: number;
  vy: number;
  size: number;
  opacity: number;
  hue: number;
}

interface ParticleCanvasProps {
  particleCount?: number;
  speed?: number;
  color?: 'blue' | 'cyan' | 'mixed';
}

export const ParticleCanvas = ({
  particleCount = 80,
  speed = 0.5,
  color = 'mixed',
}: ParticleCanvasProps) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const particlesRef = useRef<Particle[]>([]);
  const mouseRef = useRef({ x: 0, y: 0 });
  const frameRef = useRef<number>();
  const scrollVelocityRef = useRef(0);
  const lastScrollRef = useRef(0);

  const getHue = useCallback(() => {
    switch (color) {
      case 'blue': return 220;
      case 'cyan': return 200;
      case 'mixed': return 200 + Math.random() * 40;
    }
  }, [color]);

  const initParticles = useCallback((width: number, height: number) => {
    particlesRef.current = Array.from({ length: particleCount }, () => ({
      x: Math.random() * width,
      y: Math.random() * height,
      vx: (Math.random() - 0.5) * speed,
      vy: (Math.random() - 0.5) * speed + 0.2, // Slight downward drift
      size: Math.random() * 3 + 1,
      opacity: Math.random() * 0.5 + 0.2,
      hue: getHue(),
    }));
  }, [particleCount, speed, getHue]);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const resize = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
      if (particlesRef.current.length === 0) {
        initParticles(canvas.width, canvas.height);
      }
    };

    const handleMouseMove = (e: MouseEvent) => {
      mouseRef.current = { x: e.clientX, y: e.clientY };
    };

    const handleScroll = () => {
      const currentScroll = window.scrollY;
      scrollVelocityRef.current = (currentScroll - lastScrollRef.current) * 0.1;
      lastScrollRef.current = currentScroll;
    };

    resize();
    window.addEventListener('resize', resize);
    window.addEventListener('mousemove', handleMouseMove);
    window.addEventListener('scroll', handleScroll, { passive: true });

    const animate = () => {
      const { width, height } = canvas;
      
      // Clear with fade effect for trails
      ctx.fillStyle = 'rgba(2, 4, 8, 0.15)';
      ctx.fillRect(0, 0, width, height);

      const mouse = mouseRef.current;
      const scrollVel = scrollVelocityRef.current;
      
      // Decay scroll velocity
      scrollVelocityRef.current *= 0.95;

      particlesRef.current.forEach((p) => {
        // Mouse influence
        const dx = mouse.x - p.x;
        const dy = mouse.y - p.y;
        const dist = Math.sqrt(dx * dx + dy * dy);
        
        if (dist < 200) {
          const force = (200 - dist) / 200;
          p.vx += (dx / dist) * force * 0.02;
          p.vy += (dy / dist) * force * 0.02;
        }

        // Scroll influence - particles move opposite to scroll
        p.vy -= scrollVel * 0.05;

        // Flow field influence (Perlin-like noise approximation)
        const angle = Math.sin(p.x * 0.01) * Math.cos(p.y * 0.01) * Math.PI;
        p.vx += Math.cos(angle) * 0.01;
        p.vy += Math.sin(angle) * 0.01;

        // Apply velocity with damping
        p.x += p.vx;
        p.y += p.vy;
        p.vx *= 0.99;
        p.vy *= 0.99;

        // Wrap around edges
        if (p.x < 0) p.x = width;
        if (p.x > width) p.x = 0;
        if (p.y < 0) p.y = height;
        if (p.y > height) p.y = 0;

        // Draw particle with glow
        const gradient = ctx.createRadialGradient(p.x, p.y, 0, p.x, p.y, p.size * 3);
        gradient.addColorStop(0, `hsla(${p.hue}, 80%, 60%, ${p.opacity})`);
        gradient.addColorStop(0.5, `hsla(${p.hue}, 70%, 50%, ${p.opacity * 0.5})`);
        gradient.addColorStop(1, 'transparent');

        ctx.beginPath();
        ctx.arc(p.x, p.y, p.size * 3, 0, Math.PI * 2);
        ctx.fillStyle = gradient;
        ctx.fill();

        // Draw connections to nearby particles
        particlesRef.current.forEach((p2) => {
          if (p === p2) return;
          const dx = p2.x - p.x;
          const dy = p2.y - p.y;
          const dist = Math.sqrt(dx * dx + dy * dy);
          
          if (dist < 100) {
            ctx.beginPath();
            ctx.moveTo(p.x, p.y);
            ctx.lineTo(p2.x, p2.y);
            ctx.strokeStyle = `hsla(215, 70%, 50%, ${(1 - dist / 100) * 0.15})`;
            ctx.lineWidth = 0.5;
            ctx.stroke();
          }
        });
      });

      frameRef.current = requestAnimationFrame(animate);
    };

    animate();

    return () => {
      window.removeEventListener('resize', resize);
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('scroll', handleScroll);
      if (frameRef.current) cancelAnimationFrame(frameRef.current);
    };
  }, [initParticles]);

  return <canvas ref={canvasRef} className={styles.canvas} />;
};
