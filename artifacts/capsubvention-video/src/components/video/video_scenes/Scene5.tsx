import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useTranslation } from 'react-i18next';

// Scene 5: Payment / success model
export function Scene5() {
  const { t } = useTranslation();
  const [phase, setPhase] = useState(0);

  useEffect(() => {
    const timers = [
      setTimeout(() => setPhase(1), 300),
      setTimeout(() => setPhase(2), 1200),
      setTimeout(() => setPhase(3), 2400),
      setTimeout(() => setPhase(4), 3800),
    ];
    return () => timers.forEach(timer => clearTimeout(timer));
  }, []);

  return (
    <motion.div
      className="absolute inset-0 flex items-center overflow-hidden"
      style={{ background: 'linear-gradient(160deg, #F1F4FA 0%, #E4EBF5 100%)' }}
      initial={{ clipPath: 'inset(0 0 100% 0)' }}
      animate={{ clipPath: 'inset(0 0 0% 0)' }}
      exit={{ clipPath: 'inset(0 100% 0 0)', transition: { duration: 0.7, ease: [0.4, 0, 0.2, 1] } }}
      transition={{ duration: 0.7, ease: [0.16, 1, 0.3, 1] }}
    >
      {/* Gold orb */}
      <motion.div
        className="absolute pointer-events-none rounded-full blur-3xl"
        style={{ width: '50vw', height: '50vw', background: 'radial-gradient(circle, rgba(181,135,42,0.15) 0%, transparent 60%)', right: '-10vw', bottom: '-10vw' }}
        animate={{ scale: [1, 1.08, 1] }}
        transition={{ duration: 8, repeat: Infinity, ease: 'easeInOut' }}
      />

      <div className="z-10 w-full px-[8vw] flex gap-[6vw] items-center">
        {/* Left: Copy */}
        <div className="flex-1">
          <motion.p
            className="text-[1.5vw] font-semibold uppercase tracking-[0.25em] mb-4"
            style={{ color: '#B5872A', fontFamily: 'var(--font-display)' }}
            initial={{ opacity: 0, x: -20 }}
            animate={phase >= 1 ? { opacity: 1, x: 0 } : { opacity: 0, x: -20 }}
            transition={{ duration: 0.5, ease: 'circOut' }}
          >
            {t("scene5.label")}
          </motion.p>

          <motion.h2
            className="text-[4.5vw] font-black leading-[1.1] mb-6"
            style={{ color: '#0D1F3C', fontFamily: 'var(--font-display)' }}
            initial={{ opacity: 0, y: 20 }}
            animate={phase >= 1 ? { opacity: 1, y: 0 } : { opacity: 0, y: 20 }}
            transition={{ duration: 0.7, ease: [0.16, 1, 0.3, 1], delay: 0.1 }}
          >
            {t("scene5.title_1")}<br />{t("scene5.title_2")}<br />{t("scene5.title_3")}{t("scene5.title_3") ? ' ' : ''}
            <span style={{ color: '#B5872A' }}>{t("scene5.title_accent")}</span>
          </motion.h2>

          <motion.p
            className="text-[1.6vw] leading-relaxed"
            style={{ color: 'rgba(13,31,60,0.6)', fontFamily: 'var(--font-body)', whiteSpace: 'pre-line' }}
            initial={{ opacity: 0 }}
            animate={phase >= 2 ? { opacity: 1 } : { opacity: 0 }}
            transition={{ duration: 0.6 }}
          >
            {t("scene5.desc")}
          </motion.p>
        </div>

        {/* Right: Payment confirmation UI */}
        <div className="flex-1 max-w-[42vw]">
          <motion.div
            className="rounded-2xl overflow-hidden shadow-2xl"
            style={{ background: 'white', border: '1px solid rgba(13,31,60,0.08)' }}
            initial={{ opacity: 0, x: 40, scale: 0.97 }}
            animate={phase >= 2 ? { opacity: 1, x: 0, scale: 1 } : { opacity: 0, x: 40, scale: 0.97 }}
            transition={{ duration: 0.7, ease: [0.16, 1, 0.3, 1] }}
          >
            {/* Payment notification banner */}
            <motion.div
              className="px-6 py-5 flex items-center gap-4"
              style={{ background: 'linear-gradient(135deg, #0D1F3C, #1a3360)' }}
            >
              <div
                className="w-12 h-12 rounded-full flex items-center justify-center shrink-0 text-[1.8vw]"
                style={{ background: 'rgba(181,135,42,0.15)', border: '2px solid rgba(181,135,42,0.4)' }}
              >
                🏆
              </div>
              <div>
                <p className="text-white font-black text-[1.3vw]" style={{ fontFamily: 'var(--font-display)' }}>
                  {t("scene5.banner_title")}
                </p>
                <p className="text-[1vw]" style={{ color: 'rgba(255,255,255,0.6)' }}>
                  {t("scene5.banner_sub")}
                </p>
              </div>
            </motion.div>

            <div className="p-6 space-y-5">
              {/* Amount */}
              <motion.div
                className="flex justify-between items-center py-3 rounded-xl px-4"
                style={{ background: 'rgba(181,135,42,0.06)', border: '1px solid rgba(181,135,42,0.15)' }}
                initial={{ opacity: 0, y: 10 }}
                animate={phase >= 3 ? { opacity: 1, y: 0 } : { opacity: 0, y: 10 }}
                transition={{ duration: 0.5 }}
              >
                <span className="text-[1.2vw] font-medium" style={{ color: 'rgba(13,31,60,0.6)', fontFamily: 'var(--font-body)' }}>
                  {t("scene5.fee_label")}
                </span>
                <span className="text-[1.6vw] font-black" style={{ color: '#0D1F3C', fontFamily: 'var(--font-display)' }}>
                  456 € TTC
                </span>
              </motion.div>

              {/* Payment status */}
              <motion.div
                className="rounded-xl p-4"
                style={{ background: 'rgba(16,185,129,0.06)', border: '1px solid rgba(16,185,129,0.2)' }}
                initial={{ opacity: 0, y: 10 }}
                animate={phase >= 3 ? { opacity: 1, y: 0 } : { opacity: 0, y: 10 }}
                transition={{ duration: 0.5, delay: 0.1 }}
              >
                <div className="flex items-center gap-3">
                  <div
                    className="w-8 h-8 rounded-full flex items-center justify-center"
                    style={{ background: 'rgba(16,185,129,0.15)' }}
                  >
                    <motion.span
                      animate={{ scale: [1, 1.1, 1] }}
                      transition={{ duration: 2, repeat: Infinity }}
                    >
                      ✓
                    </motion.span>
                  </div>
                  <div>
                    <p className="text-[1.1vw] font-bold" style={{ color: 'rgb(16,185,129)', fontFamily: 'var(--font-display)' }}>
                      {t("scene5.payment_title")}
                    </p>
                    <p className="text-[0.9vw]" style={{ color: 'rgba(13,31,60,0.5)' }}>
                      {t("scene5.payment_methods")}
                    </p>
                  </div>
                </div>
              </motion.div>

              {/* Subvention amount */}
              <motion.div
                className="rounded-xl px-4 py-4 text-center"
                style={{ background: '#0D1F3C' }}
                initial={{ opacity: 0, scale: 0.95 }}
                animate={phase >= 4 ? { opacity: 1, scale: 1 } : { opacity: 0, scale: 0.95 }}
                transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
              >
                <p className="text-[1vw] uppercase tracking-widest mb-1" style={{ color: 'rgba(181,135,42,0.8)', fontFamily: 'var(--font-display)' }}>
                  {t("scene5.grant_label")}
                </p>
                <motion.p
                  className="text-[2.5vw] font-black"
                  style={{ color: '#B5872A', fontFamily: 'var(--font-display)' }}
                  initial={{ opacity: 0 }}
                  animate={phase >= 4 ? { opacity: 1 } : { opacity: 0 }}
                  transition={{ duration: 0.4, delay: 0.2 }}
                >
                  80 000 €
                </motion.p>
                {/* Proper noun / reference — stays unchanged */}
                <p className="text-[0.9vw]" style={{ color: 'rgba(255,255,255,0.4)' }}>
                  FEDER · France 2024
                </p>
              </motion.div>
            </div>
          </motion.div>
        </div>
      </div>
    </motion.div>
  );
}
