import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useTranslation } from 'react-i18next';
import { sceneTransitions } from '@/lib/video/animations';

export function Scene1() {
  const { t } = useTranslation();
  const [phase, setPhase] = useState(0);

  useEffect(() => {
    const timers = [
      setTimeout(() => setPhase(1), 200),
      setTimeout(() => setPhase(2), 900),
      setTimeout(() => setPhase(3), 2000),
      setTimeout(() => setPhase(4), 3500),
    ];
    return () => timers.forEach(timer => clearTimeout(timer));
  }, []);

  return (
    <motion.div
      className="absolute inset-0 flex flex-col items-center justify-center overflow-hidden"
      style={{ background: 'linear-gradient(135deg, #F1F4FA 0%, #E8EEF8 100%)' }}
      initial={{ clipPath: 'inset(0 0 100% 0)' }}
      animate={{ clipPath: 'inset(0 0 0% 0)' }}
      exit={{ clipPath: 'inset(100% 0 0 0)', transition: { duration: 0.7, ease: [0.4, 0, 0.2, 1] } }}
      transition={{ duration: 0.7, ease: [0.4, 0, 0.2, 1] }}
    >
      {/* Animated background blobs */}
      <motion.div
        className="absolute w-[40vw] h-[40vw] rounded-full blur-3xl pointer-events-none"
        style={{ background: 'radial-gradient(circle, rgba(181,135,42,0.12) 0%, transparent 70%)', top: '-10vw', right: '-10vw' }}
        animate={{ scale: [1, 1.15, 1], x: [0, 20, 0] }}
        transition={{ duration: 10, repeat: Infinity, ease: 'easeInOut' }}
      />
      <motion.div
        className="absolute w-[30vw] h-[30vw] rounded-full blur-3xl pointer-events-none"
        style={{ background: 'radial-gradient(circle, rgba(13,31,60,0.08) 0%, transparent 70%)', bottom: '-5vw', left: '-5vw' }}
        animate={{ scale: [1, 1.1, 1], y: [0, -15, 0] }}
        transition={{ duration: 12, repeat: Infinity, ease: 'easeInOut' }}
      />

      {/* Floating chaos words — French administrative pain points (intentionally in FR) */}
      {[
        { label: 'CERFA', x: '15vw', y: '20vh', delay: 0.3 },
        { label: 'DOSSIERS', x: '65vw', y: '15vh', delay: 0.5 },
        { label: 'DÉLAIS', x: '75vw', y: '55vh', delay: 0.7 },
        { label: 'FORMULAIRES', x: '8vw', y: '65vh', delay: 0.9 },
        { label: 'REFUS', x: '45vw', y: '72vh', delay: 1.1 },
      ].map((item, i) => (
        <motion.span
          key={i}
          className="absolute text-[1.4vw] font-bold tracking-widest pointer-events-none"
          style={{ left: item.x, top: item.y, color: 'rgba(13,31,60,0.18)' }}
          initial={{ opacity: 0, y: 20 }}
          animate={phase >= 1 ? { opacity: 1, y: [0, -6, 0] } : { opacity: 0, y: 20 }}
          transition={{ delay: item.delay, y: { duration: 4 + i, repeat: Infinity, ease: 'easeInOut' } }}
        >
          {item.label}
        </motion.span>
      ))}

      {/* Main content */}
      <div className="z-10 flex flex-col items-center text-center px-[10vw]">
        <motion.p
          className="text-[1.6vw] font-semibold uppercase tracking-[0.3em] mb-4"
          style={{ color: '#B5872A', fontFamily: 'var(--font-display)' }}
          initial={{ opacity: 0, y: -10 }}
          animate={phase >= 1 ? { opacity: 1, y: 0 } : { opacity: 0, y: -10 }}
          transition={{ duration: 0.6, ease: 'circOut' }}
        >
          {t("scene1.label")}
        </motion.p>

        <motion.h1
          className="text-[5.5vw] font-black leading-[1.1] mb-6"
          style={{ color: '#0D1F3C', fontFamily: 'var(--font-display)', whiteSpace: 'pre-line' }}
          initial={{ opacity: 0, scale: 0.92, filter: 'blur(8px)' }}
          animate={phase >= 2 ? { opacity: 1, scale: 1, filter: 'blur(0px)' } : { opacity: 0, scale: 0.92, filter: 'blur(8px)' }}
          transition={{ duration: 0.9, ease: [0.16, 1, 0.3, 1] }}
        >
          {t("scene1.title")}
        </motion.h1>

        <motion.p
          className="text-[2vw] max-w-[55vw] leading-relaxed"
          style={{ color: 'rgba(13,31,60,0.6)', fontFamily: 'var(--font-body)', whiteSpace: 'pre-line' }}
          initial={{ opacity: 0 }}
          animate={phase >= 3 ? { opacity: 1 } : { opacity: 0 }}
          transition={{ duration: 0.7 }}
        >
          {t("scene1.desc")}
        </motion.p>

        {/* Territory tags — proper nouns, stay unchanged */}
        <motion.div
          className="mt-8 flex gap-4"
          initial={{ opacity: 0, y: 15 }}
          animate={phase >= 4 ? { opacity: 1, y: 0 } : { opacity: 0, y: 15 }}
          transition={{ duration: 0.5, ease: 'circOut' }}
        >
          {['France', 'Allemagne', 'Espagne', 'Italie', 'Pologne'].map((territory, i) => (
            <span
              key={i}
              className="px-4 py-2 rounded-full text-[1.1vw] font-semibold border"
              style={{ borderColor: 'rgba(181,135,42,0.4)', color: '#B5872A', background: 'rgba(181,135,42,0.06)' }}
            >
              {territory}
            </span>
          ))}
        </motion.div>
      </div>

      {/* Decorative accent line */}
      <motion.div
        className="absolute bottom-[15vh] left-0 h-[2px]"
        style={{ background: 'linear-gradient(90deg, transparent, #B5872A, transparent)' }}
        initial={{ width: 0, left: '50%' }}
        animate={phase >= 2 ? { width: '60%', left: '20%' } : { width: 0, left: '50%' }}
        transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
      />
    </motion.div>
  );
}
