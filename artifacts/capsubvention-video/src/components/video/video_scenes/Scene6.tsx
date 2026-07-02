import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useTranslation } from 'react-i18next';

// Scene 6: Outro
export function Scene6() {
  const { t } = useTranslation();
  const [phase, setPhase] = useState(0);

  useEffect(() => {
    const timers = [
      setTimeout(() => setPhase(1), 400),
      setTimeout(() => setPhase(2), 1200),
      setTimeout(() => setPhase(3), 2200),
      setTimeout(() => setPhase(4), 3500),
    ];
    return () => timers.forEach(timer => clearTimeout(timer));
  }, []);

  return (
    <motion.div
      className="absolute inset-0 flex flex-col items-center justify-center overflow-hidden"
      style={{ background: '#0D1F3C' }}
      initial={{ clipPath: 'circle(0% at 50% 50%)' }}
      animate={{ clipPath: 'circle(120% at 50% 50%)' }}
      exit={{ scale: 1.05, opacity: 0, transition: { duration: 0.8, ease: 'easeInOut' } }}
      transition={{ duration: 1, ease: [0.16, 1, 0.3, 1] }}
    >
      {/* Radial gold glow */}
      <motion.div
        className="absolute inset-0 pointer-events-none"
        style={{ background: 'radial-gradient(circle at 50% 50%, rgba(181,135,42,0.18) 0%, transparent 60%)' }}
        animate={{ opacity: [0.6, 1, 0.6], scale: [1, 1.05, 1] }}
        transition={{ duration: 5, repeat: Infinity, ease: 'easeInOut' }}
      />

      {/* Grid */}
      <div className="absolute inset-0 pointer-events-none" style={{ backgroundImage: 'linear-gradient(rgba(181,135,42,0.04) 1px, transparent 1px), linear-gradient(90deg, rgba(181,135,42,0.04) 1px, transparent 1px)', backgroundSize: '80px 80px' }} />

      {/* Logo */}
      <motion.div
        className="relative mb-8"
        initial={{ scale: 0, opacity: 0 }}
        animate={phase >= 1 ? { scale: 1, opacity: 1 } : { scale: 0, opacity: 0 }}
        transition={{ type: 'spring', stiffness: 180, damping: 18 }}
      >
        <div
          className="w-[18vw] h-[18vw] rounded-full flex items-center justify-center"
          style={{ border: '3px solid #B5872A', background: 'rgba(181,135,42,0.08)' }}
        >
          <span className="text-[6vw] font-black" style={{ color: '#B5872A', fontFamily: 'var(--font-display)' }}>CS</span>
        </div>

        {/* 5 territory stars */}
        {[...Array(5)].map((_, i) => {
          const angle = (i * 72 - 90) * Math.PI / 180;
          return (
            <motion.div
              key={i}
              className="absolute flex items-center justify-center"
              style={{
                width: '2.5vw',
                height: '2.5vw',
                top: `${50 - Math.cos(angle) * 58}%`,
                left: `${50 + Math.sin(angle) * 58}%`,
                transform: 'translate(-50%, -50%)',
                color: '#B5872A',
                fontSize: '1.8vw',
              }}
              initial={{ scale: 0, opacity: 0 }}
              animate={phase >= 2 ? { scale: 1, opacity: 1 } : { scale: 0, opacity: 0 }}
              transition={{ delay: 0.1 * i, type: 'spring', stiffness: 300, damping: 15 }}
            >
              ★
            </motion.div>
          );
        })}
      </motion.div>

      {/* Brand name — proper noun */}
      <motion.h1
        className="text-[5vw] font-black text-white tracking-tight"
        style={{ fontFamily: 'var(--font-display)' }}
        initial={{ opacity: 0, y: 20 }}
        animate={phase >= 2 ? { opacity: 1, y: 0 } : { opacity: 0, y: 20 }}
        transition={{ duration: 0.7, ease: [0.16, 1, 0.3, 1] }}
      >
        FEDE
      </motion.h1>

      <motion.div
        className="mt-4 h-[1px] bg-gradient-to-r from-transparent via-[#B5872A] to-transparent"
        initial={{ width: 0 }}
        animate={phase >= 3 ? { width: '35vw' } : { width: 0 }}
        transition={{ duration: 0.7, ease: [0.16, 1, 0.3, 1] }}
      />

      <motion.p
        className="mt-4 text-[1.8vw] text-center"
        style={{ color: 'rgba(255,255,255,0.6)', fontFamily: 'var(--font-body)' }}
        initial={{ opacity: 0 }}
        animate={phase >= 3 ? { opacity: 1 } : { opacity: 0 }}
        transition={{ duration: 0.7 }}
      >
        {t("scene6.tagline")}
      </motion.p>

      {/* Territory tags — proper nouns */}
      <motion.div
        className="mt-8 flex flex-wrap gap-3 justify-center max-w-[60vw]"
        initial={{ opacity: 0, y: 15 }}
        animate={phase >= 4 ? { opacity: 1, y: 0 } : { opacity: 0, y: 15 }}
        transition={{ duration: 0.6, ease: 'circOut' }}
      >
        {['France', 'Allemagne', 'Espagne', 'Italie', 'Belgique', 'Pays-Bas', 'Portugal'].map((territory, i) => (
          <span
            key={i}
            className="px-4 py-2 rounded-full text-[1.1vw] font-semibold"
            style={{ border: '1px solid rgba(181,135,42,0.35)', color: 'rgba(181,135,42,0.85)', background: 'rgba(181,135,42,0.06)', fontFamily: 'var(--font-body)' }}
          >
            {territory}
          </span>
        ))}
      </motion.div>

      {/* Pulsing glow ring */}
      <motion.div
        className="absolute pointer-events-none rounded-full"
        style={{ width: '18vw', height: '18vw', border: '1px solid rgba(181,135,42,0.3)' }}
        animate={{ scale: [1, 1.3, 1.6], opacity: [0.4, 0.2, 0] }}
        transition={{ duration: 3, repeat: Infinity, ease: 'easeOut', repeatDelay: 1 }}
      />
    </motion.div>
  );
}
