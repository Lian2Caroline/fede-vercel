import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useTranslation } from 'react-i18next';

export function Scene2() {
  const { t } = useTranslation();
  const [phase, setPhase] = useState(0);

  useEffect(() => {
    const timers = [
      setTimeout(() => setPhase(1), 300),
      setTimeout(() => setPhase(2), 1100),
      setTimeout(() => setPhase(3), 2200),
      setTimeout(() => setPhase(4), 3500),
    ];
    return () => timers.forEach(timer => clearTimeout(timer));
  }, []);

  return (
    <motion.div
      className="absolute inset-0 flex items-center justify-center overflow-hidden"
      style={{ background: '#0D1F3C' }}
      initial={{ clipPath: 'circle(0% at 50% 50%)' }}
      animate={{ clipPath: 'circle(120% at 50% 50%)' }}
      exit={{ clipPath: 'circle(0% at 110% 110%)', transition: { duration: 0.8, ease: [0.4, 0, 0.2, 1] } }}
      transition={{ duration: 0.9, ease: [0.16, 1, 0.3, 1] }}
    >
      {/* Animated background pattern */}
      <motion.div
        className="absolute inset-0 pointer-events-none"
        style={{ backgroundImage: 'radial-gradient(circle at 70% 30%, rgba(181,135,42,0.15) 0%, transparent 50%), radial-gradient(circle at 20% 80%, rgba(181,135,42,0.08) 0%, transparent 40%)' }}
        animate={{ opacity: [0.6, 1, 0.6] }}
        transition={{ duration: 6, repeat: Infinity, ease: 'easeInOut' }}
      />

      {/* Grid lines */}
      <div className="absolute inset-0 pointer-events-none" style={{ backgroundImage: 'linear-gradient(rgba(181,135,42,0.05) 1px, transparent 1px), linear-gradient(90deg, rgba(181,135,42,0.05) 1px, transparent 1px)', backgroundSize: '80px 80px' }} />

      <div className="z-10 flex flex-col items-center text-center">
        {/* CS Logo */}
        <motion.div
          className="relative mb-10"
          initial={{ scale: 0, rotate: -90 }}
          animate={phase >= 1 ? { scale: 1, rotate: 0 } : { scale: 0, rotate: -90 }}
          transition={{ type: 'spring', stiffness: 200, damping: 20 }}
        >
          <div
            className="w-[14vw] h-[14vw] rounded-full flex items-center justify-center"
            style={{ border: '3px solid #B5872A', background: 'rgba(181,135,42,0.08)' }}
          >
            <span className="text-[5vw] font-black" style={{ color: '#B5872A', fontFamily: 'var(--font-display)' }}>CS</span>
          </div>
          {/* 5 stars orbiting */}
          {[...Array(5)].map((_, i) => (
            <motion.div
              key={i}
              className="absolute w-[2vw] h-[2vw] flex items-center justify-center"
              style={{
                top: `${50 - Math.cos((i * 72 - 90) * Math.PI / 180) * 58}%`,
                left: `${50 + Math.sin((i * 72 - 90) * Math.PI / 180) * 58}%`,
                transform: 'translate(-50%, -50%)',
                color: '#B5872A',
                fontSize: '1.5vw',
              }}
              initial={{ opacity: 0, scale: 0 }}
              animate={phase >= 2 ? { opacity: 1, scale: 1 } : { opacity: 0, scale: 0 }}
              transition={{ delay: 0.1 * i, type: 'spring', stiffness: 300, damping: 15 }}
            >
              ★
            </motion.div>
          ))}
        </motion.div>

        {/* Brand name — proper noun, stays unchanged */}
        <motion.h1
          className="text-[4.5vw] font-black text-white leading-tight mb-4"
          style={{ fontFamily: 'var(--font-display)' }}
          initial={{ opacity: 0, y: 30 }}
          animate={phase >= 2 ? { opacity: 1, y: 0 } : { opacity: 0, y: 30 }}
          transition={{ duration: 0.7, ease: [0.16, 1, 0.3, 1] }}
        >
          FEDE
        </motion.h1>

        <motion.p
          className="text-[2vw] max-w-[50vw] leading-relaxed"
          style={{ color: 'rgba(255,255,255,0.7)', fontFamily: 'var(--font-body)', whiteSpace: 'pre-line' }}
          initial={{ opacity: 0 }}
          animate={phase >= 3 ? { opacity: 1 } : { opacity: 0 }}
          transition={{ duration: 0.8 }}
        >
          {t("scene2.tagline")}
        </motion.p>

        {/* Separator */}
        <motion.div
          className="mt-8 h-[1px] bg-gradient-to-r from-transparent via-[#B5872A] to-transparent"
          initial={{ width: 0 }}
          animate={phase >= 4 ? { width: '30vw' } : { width: 0 }}
          transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
        />
        {/* Legal reference — stays in French as it is a French legal citation */}
        <motion.p
          className="mt-4 text-[1.3vw] uppercase tracking-[0.2em]"
          style={{ color: 'rgba(181,135,42,0.8)', fontFamily: 'var(--font-display)' }}
          initial={{ opacity: 0 }}
          animate={phase >= 4 ? { opacity: 1 } : { opacity: 0 }}
          transition={{ duration: 0.6 }}
        >
          Article L1611-2 du CGCT
        </motion.p>
      </div>
    </motion.div>
  );
}
