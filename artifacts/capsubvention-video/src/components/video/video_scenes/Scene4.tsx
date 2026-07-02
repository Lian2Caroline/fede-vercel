import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useTranslation } from 'react-i18next';

// Scene 4: Document upload
export function Scene4() {
  const { t } = useTranslation();
  const [phase, setPhase] = useState(0);

  useEffect(() => {
    const timers = [
      setTimeout(() => setPhase(1), 400),
      setTimeout(() => setPhase(2), 1000),
      setTimeout(() => setPhase(3), 2000),
      setTimeout(() => setPhase(4), 3200),
    ];
    return () => timers.forEach(timer => clearTimeout(timer));
  }, []);

  const docs = [
    { name: t("scene4.doc_id"), size: '2.4 MB', status: 'done' },
    { name: t("scene4.doc_plan"), size: '1.8 MB', status: 'done' },
    { name: t("scene4.doc_statuts"), size: '3.1 MB', status: 'uploading' },
    { name: t("scene4.doc_rib"), size: '0.5 MB', status: 'pending' },
  ];

  return (
    <motion.div
      className="absolute inset-0 flex items-center overflow-hidden"
      style={{ background: '#0D1F3C' }}
      initial={{ clipPath: 'polygon(100% 0%, 100% 0%, 100% 100%, 100% 100%)' }}
      animate={{ clipPath: 'polygon(0% 0%, 100% 0%, 100% 100%, 0% 100%)' }}
      exit={{ clipPath: 'polygon(0% 0%, 0% 0%, 0% 100%, 0% 100%)', transition: { duration: 0.7, ease: [0.4, 0, 0.2, 1] } }}
      transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
    >
      {/* Background texture */}
      <div className="absolute inset-0 pointer-events-none" style={{ backgroundImage: 'radial-gradient(circle at 80% 20%, rgba(181,135,42,0.12) 0%, transparent 40%), radial-gradient(circle at 10% 70%, rgba(181,135,42,0.08) 0%, transparent 35%)' }} />
      <div className="absolute inset-0 pointer-events-none" style={{ backgroundImage: 'linear-gradient(rgba(181,135,42,0.04) 1px, transparent 1px), linear-gradient(90deg, rgba(181,135,42,0.04) 1px, transparent 1px)', backgroundSize: '60px 60px' }} />

      <div className="z-10 w-full px-[8vw] flex gap-[6vw] items-center">
        {/* Left: Document upload UI */}
        <div className="flex-1 max-w-[42vw]">
          <motion.div
            className="rounded-2xl overflow-hidden shadow-2xl"
            style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(181,135,42,0.2)', backdropFilter: 'blur(10px)' }}
            initial={{ opacity: 0, x: -40 }}
            animate={phase >= 2 ? { opacity: 1, x: 0 } : { opacity: 0, x: -40 }}
            transition={{ duration: 0.7, ease: [0.16, 1, 0.3, 1] }}
          >
            <div className="px-6 py-4 flex items-center gap-3" style={{ borderBottom: '1px solid rgba(181,135,42,0.15)' }}>
              <div className="text-[1.5vw]">📁</div>
              <span className="text-[1.2vw] font-bold text-white" style={{ fontFamily: 'var(--font-display)' }}>
                {t("scene4.header")}
              </span>
            </div>

            <div className="p-5 space-y-3">
              {docs.map((doc, i) => (
                <motion.div
                  key={i}
                  className="flex items-center gap-4 rounded-xl px-4 py-3"
                  style={{ background: doc.status === 'uploading' ? 'rgba(181,135,42,0.12)' : 'rgba(255,255,255,0.04)', border: doc.status === 'uploading' ? '1px solid rgba(181,135,42,0.3)' : '1px solid rgba(255,255,255,0.06)' }}
                  initial={{ opacity: 0, y: 10 }}
                  animate={phase >= 3 ? { opacity: 1, y: 0 } : { opacity: 0, y: 10 }}
                  transition={{ delay: 0.1 * i, duration: 0.4, ease: 'circOut' }}
                >
                  <div className="text-[1.4vw] shrink-0">
                    {doc.status === 'done' ? '✅' : doc.status === 'uploading' ? '⏳' : '📄'}
                  </div>
                  <div className="flex-1">
                    <p className="text-[1.1vw] font-medium text-white" style={{ fontFamily: 'var(--font-body)' }}>{doc.name}</p>
                    <p className="text-[0.9vw]" style={{ color: 'rgba(255,255,255,0.4)' }}>{doc.size}</p>
                  </div>
                  {doc.status === 'done' && (
                    <span className="text-[0.9vw] font-bold" style={{ color: '#B5872A' }}>{t("scene4.status_done")}</span>
                  )}
                  {doc.status === 'uploading' && (
                    <motion.div
                      className="w-20 h-1.5 rounded-full overflow-hidden"
                      style={{ background: 'rgba(181,135,42,0.2)' }}
                    >
                      <motion.div
                        className="h-full rounded-full"
                        style={{ background: '#B5872A' }}
                        animate={{ width: ['0%', '65%'] }}
                        transition={{ duration: 1.5, ease: 'easeInOut', repeat: Infinity, repeatType: 'reverse' }}
                      />
                    </motion.div>
                  )}
                  {doc.status === 'pending' && (
                    <span className="text-[0.9vw]" style={{ color: 'rgba(255,255,255,0.3)' }}>{t("scene4.status_pending")}</span>
                  )}
                </motion.div>
              ))}
            </div>

            {/* Secure badge */}
            <motion.div
              className="mx-5 mb-5 flex items-center gap-3 rounded-xl px-4 py-3"
              style={{ background: 'rgba(181,135,42,0.08)', border: '1px solid rgba(181,135,42,0.2)' }}
              initial={{ opacity: 0 }}
              animate={phase >= 4 ? { opacity: 1 } : { opacity: 0 }}
              transition={{ duration: 0.5 }}
            >
              <span className="text-[1.2vw]">🔒</span>
              <span className="text-[1vw]" style={{ color: 'rgba(181,135,42,0.9)', fontFamily: 'var(--font-body)' }}>
                {t("scene4.secure_badge")}
              </span>
            </motion.div>
          </motion.div>
        </div>

        {/* Right: Copy */}
        <div className="flex-1">
          <motion.p
            className="text-[1.5vw] font-semibold uppercase tracking-[0.25em] mb-4"
            style={{ color: '#B5872A', fontFamily: 'var(--font-display)' }}
            initial={{ opacity: 0, x: 20 }}
            animate={phase >= 1 ? { opacity: 1, x: 0 } : { opacity: 0, x: 20 }}
            transition={{ duration: 0.5, ease: 'circOut' }}
          >
            {t("scene4.label")}
          </motion.p>

          <motion.h2
            className="text-[4.5vw] font-black leading-[1.1] mb-6 text-white"
            style={{ fontFamily: 'var(--font-display)', whiteSpace: 'pre-line' }}
            initial={{ opacity: 0, y: 20 }}
            animate={phase >= 1 ? { opacity: 1, y: 0 } : { opacity: 0, y: 20 }}
            transition={{ duration: 0.7, ease: [0.16, 1, 0.3, 1], delay: 0.1 }}
          >
            {t("scene4.title")}
          </motion.h2>

          <motion.p
            className="text-[1.6vw] leading-relaxed"
            style={{ color: 'rgba(255,255,255,0.6)', fontFamily: 'var(--font-body)', whiteSpace: 'pre-line' }}
            initial={{ opacity: 0 }}
            animate={phase >= 2 ? { opacity: 1 } : { opacity: 0 }}
            transition={{ duration: 0.6 }}
          >
            {t("scene4.desc")}
          </motion.p>
        </div>
      </div>
    </motion.div>
  );
}
