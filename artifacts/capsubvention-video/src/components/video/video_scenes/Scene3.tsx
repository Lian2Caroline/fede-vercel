import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useTranslation } from 'react-i18next';

// Scene 3: Dossier tracking & status updates
export function Scene3() {
  const { t } = useTranslation();
  const [phase, setPhase] = useState(0);

  useEffect(() => {
    const timers = [
      setTimeout(() => setPhase(1), 300),
      setTimeout(() => setPhase(2), 900),
      setTimeout(() => setPhase(3), 1800),
      setTimeout(() => setPhase(4), 3000),
      setTimeout(() => setPhase(5), 4500),
    ];
    return () => timers.forEach(timer => clearTimeout(timer));
  }, []);

  const statuses = [
    { label: t("scene3.status_submitted"), color: '#B5872A', done: true },
    { label: t("scene3.status_eligible"), color: '#B5872A', done: true },
    { label: t("scene3.status_processing"), color: '#0D1F3C', active: true },
    { label: t("scene3.status_awaiting"), color: 'rgba(13,31,60,0.3)', done: false },
    { label: t("scene3.status_notified"), color: 'rgba(13,31,60,0.3)', done: false },
  ];

  return (
    <motion.div
      className="absolute inset-0 flex items-center overflow-hidden"
      style={{ background: 'linear-gradient(135deg, #F1F4FA 0%, #E8EEF8 100%)' }}
      initial={{ clipPath: 'inset(0 100% 0 0)' }}
      animate={{ clipPath: 'inset(0 0% 0 0)' }}
      exit={{ clipPath: 'inset(0 0 0 100%)', transition: { duration: 0.7, ease: [0.4, 0, 0.2, 1] } }}
      transition={{ duration: 0.7, ease: [0.16, 1, 0.3, 1] }}
    >
      {/* Background accent */}
      <motion.div
        className="absolute pointer-events-none"
        style={{ width: '35vw', height: '35vw', borderRadius: '50%', background: 'radial-gradient(circle, rgba(13,31,60,0.04) 0%, transparent 70%)', right: '-5vw', top: '10vh' }}
        animate={{ scale: [1, 1.1, 1] }}
        transition={{ duration: 8, repeat: Infinity, ease: 'easeInOut' }}
      />

      <div className="z-10 w-full px-[8vw] flex gap-[6vw] items-center">
        {/* Left: Headline */}
        <div className="flex-1">
          <motion.p
            className="text-[1.5vw] font-semibold uppercase tracking-[0.25em] mb-4"
            style={{ color: '#B5872A', fontFamily: 'var(--font-display)' }}
            initial={{ opacity: 0, x: -20 }}
            animate={phase >= 1 ? { opacity: 1, x: 0 } : { opacity: 0, x: -20 }}
            transition={{ duration: 0.5, ease: 'circOut' }}
          >
            {t("scene3.label")}
          </motion.p>

          <motion.h2
            className="text-[4.5vw] font-black leading-[1.1] mb-6"
            style={{ color: '#0D1F3C', fontFamily: 'var(--font-display)', whiteSpace: 'pre-line' }}
            initial={{ opacity: 0, y: 20 }}
            animate={phase >= 1 ? { opacity: 1, y: 0 } : { opacity: 0, y: 20 }}
            transition={{ duration: 0.7, ease: [0.16, 1, 0.3, 1], delay: 0.1 }}
          >
            {t("scene3.title")}
          </motion.h2>

          <motion.p
            className="text-[1.6vw] leading-relaxed"
            style={{ color: 'rgba(13,31,60,0.6)', fontFamily: 'var(--font-body)', whiteSpace: 'pre-line' }}
            initial={{ opacity: 0 }}
            animate={phase >= 2 ? { opacity: 1 } : { opacity: 0 }}
            transition={{ duration: 0.6 }}
          >
            {t("scene3.desc")}
          </motion.p>

          {/* Notification card */}
          <motion.div
            className="mt-6 rounded-2xl p-4 flex items-center gap-4"
            style={{ background: 'rgba(181,135,42,0.08)', border: '1px solid rgba(181,135,42,0.25)' }}
            initial={{ opacity: 0, scale: 0.95, y: 10 }}
            animate={phase >= 4 ? { opacity: 1, scale: 1, y: 0 } : { opacity: 0, scale: 0.95, y: 10 }}
            transition={{ duration: 0.5, ease: 'circOut' }}
          >
            <div
              className="w-10 h-10 rounded-full flex items-center justify-center shrink-0 text-[1.5vw]"
              style={{ background: '#B5872A' }}
            >
              🔔
            </div>
            <div>
              <p className="text-[1.2vw] font-bold" style={{ color: '#0D1F3C', fontFamily: 'var(--font-display)' }}>
                {t("scene3.notif_title")}
              </p>
              <p className="text-[1vw]" style={{ color: 'rgba(13,31,60,0.6)', fontFamily: 'var(--font-body)' }}>
                {t("scene3.notif_body")}
              </p>
            </div>
          </motion.div>
        </div>

        {/* Right: Status tracker UI */}
        <div className="flex-1 max-w-[38vw]">
          <motion.div
            className="rounded-2xl overflow-hidden shadow-2xl"
            style={{ background: 'white', border: '1px solid rgba(13,31,60,0.08)' }}
            initial={{ opacity: 0, x: 40, scale: 0.97 }}
            animate={phase >= 2 ? { opacity: 1, x: 0, scale: 1 } : { opacity: 0, x: 40, scale: 0.97 }}
            transition={{ duration: 0.7, ease: [0.16, 1, 0.3, 1] }}
          >
            {/* Header — demo identifier stays as-is */}
            <div className="px-6 py-4 flex items-center gap-3" style={{ background: '#0D1F3C' }}>
              <div className="w-3 h-3 rounded-full" style={{ background: '#B5872A' }} />
              <span className="text-[1.2vw] font-bold text-white" style={{ fontFamily: 'var(--font-display)' }}>
                Dossier #2024-0847
              </span>
            </div>

            {/* Status steps */}
            <div className="p-6 space-y-4">
              {statuses.map((s, i) => (
                <motion.div
                  key={i}
                  className="flex items-center gap-4"
                  initial={{ opacity: 0, x: 20 }}
                  animate={phase >= 3 ? { opacity: 1, x: 0 } : { opacity: 0, x: 20 }}
                  transition={{ delay: 0.12 * i, duration: 0.4, ease: 'circOut' }}
                >
                  <div
                    className="w-6 h-6 rounded-full flex items-center justify-center shrink-0 text-[0.8vw] font-bold"
                    style={{
                      background: s.done ? '#B5872A' : s.active ? '#0D1F3C' : 'rgba(13,31,60,0.08)',
                      color: (s.done || s.active) ? 'white' : 'rgba(13,31,60,0.3)',
                    }}
                  >
                    {s.done ? '✓' : i + 1}
                  </div>
                  <span
                    className="text-[1.2vw] font-medium"
                    style={{ fontFamily: 'var(--font-body)', color: s.color }}
                  >
                    {s.label}
                  </span>
                  {s.active && (
                    <motion.div
                      className="ml-auto px-3 py-1 rounded-full text-[0.9vw] font-bold"
                      style={{ background: 'rgba(13,31,60,0.08)', color: '#0D1F3C', fontFamily: 'var(--font-display)' }}
                      animate={{ opacity: [1, 0.5, 1] }}
                      transition={{ duration: 1.5, repeat: Infinity }}
                    >
                      {t("scene3.active_badge")}
                    </motion.div>
                  )}
                </motion.div>
              ))}
            </div>

            {/* Progress bar */}
            <motion.div
              className="mx-6 mb-6 h-2 rounded-full overflow-hidden"
              style={{ background: 'rgba(13,31,60,0.08)' }}
              initial={{ opacity: 0 }}
              animate={phase >= 4 ? { opacity: 1 } : { opacity: 0 }}
              transition={{ duration: 0.5 }}
            >
              <motion.div
                className="h-full rounded-full"
                style={{ background: 'linear-gradient(90deg, #B5872A, #0D1F3C)' }}
                initial={{ width: 0 }}
                animate={phase >= 4 ? { width: '55%' } : { width: 0 }}
                transition={{ duration: 1, ease: [0.16, 1, 0.3, 1] }}
              />
            </motion.div>
          </motion.div>
        </div>
      </div>
    </motion.div>
  );
}
