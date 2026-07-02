import { useEffect, useState } from 'react';
import { AnimatePresence } from 'framer-motion';
import { Volume2 } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { useVideoPlayer } from '@/lib/video';
import { startMusic, stopNarration, setMuted, onPlayingChange } from '@/lib/video/narration';
import { Scene1 } from './video_scenes/Scene1';
import { Scene2 } from './video_scenes/Scene2';
import { Scene3 } from './video_scenes/Scene3';
import { Scene4 } from './video_scenes/Scene4';
import { Scene5 } from './video_scenes/Scene5';
import { Scene6 } from './video_scenes/Scene6';

export const SCENE_DURATIONS: Record<string, number> = {
  problem: 6000,
  solution: 5000,
  tracking: 7000,
  documents: 6000,
  payment: 6000,
  outro: 5000,
};

const SCENE_COMPONENTS: Record<string, React.ComponentType> = {
  problem: Scene1,
  solution: Scene2,
  tracking: Scene3,
  documents: Scene4,
  payment: Scene5,
  outro: Scene6,
};

export default function VideoTemplate({
  durations = SCENE_DURATIONS,
  loop = true,
  muted = false,
  onSceneChange,
}: {
  durations?: Record<string, number>;
  loop?: boolean;
  muted?: boolean;
  onSceneChange?: (sceneKey: string) => void;
} = {}) {
  const { t } = useTranslation();
  const { currentSceneKey } = useVideoPlayer({ durations, loop });
  const [audioPlaying, setAudioPlaying] = useState(false);
  useEffect(() => onPlayingChange(setAudioPlaying), []);
  const showAudioHint = !muted && !audioPlaying;

  useEffect(() => {
    onSceneChange?.(currentSceneKey);
  }, [currentSceneKey, onSceneChange]);

  // Start music once on first user interaction (required by browsers).
  // Listen on both window and document to cover iframe / touch contexts.
  useEffect(() => {
    let done = false;
    const handleInteraction = () => {
      if (done) return;
      done = true;
      if (!muted) { void startMusic(); }
      cleanup();
    };
    const cleanup = () => {
      window.removeEventListener('click', handleInteraction);
      window.removeEventListener('keydown', handleInteraction);
      window.removeEventListener('pointerdown', handleInteraction);
      window.removeEventListener('touchstart', handleInteraction);
      document.removeEventListener('click', handleInteraction);
      document.removeEventListener('pointerdown', handleInteraction);
      document.removeEventListener('touchstart', handleInteraction);
    };
    const opts = { passive: true } as AddEventListenerOptions;
    window.addEventListener('click', handleInteraction);
    window.addEventListener('keydown', handleInteraction);
    window.addEventListener('pointerdown', handleInteraction, opts);
    window.addEventListener('touchstart', handleInteraction, opts);
    document.addEventListener('click', handleInteraction);
    document.addEventListener('pointerdown', handleInteraction, opts);
    document.addEventListener('touchstart', handleInteraction, opts);
    return () => { cleanup(); stopNarration(); };
  }, [muted]);

  // React to mute toggle
  useEffect(() => {
    setMuted(muted);
  }, [muted]);

  const baseSceneKey = currentSceneKey.replace(/_r[12]$/, '') as keyof typeof SCENE_DURATIONS;
  const SceneComponent = SCENE_COMPONENTS[baseSceneKey];

  return (
    <div
      className="w-full h-screen overflow-hidden relative"
      style={{ backgroundColor: 'var(--color-bg-light)' }}
    >
      <AnimatePresence mode="popLayout">
        {SceneComponent && <SceneComponent key={currentSceneKey} />}
      </AnimatePresence>
      {showAudioHint && (
        <button
          type="button"
          onClick={() => { void startMusic(); }}
          className="absolute top-4 right-4 z-40 flex items-center gap-2 px-3 py-1.5 rounded-full bg-black/55 hover:bg-black/75 text-white text-xs font-medium backdrop-blur-sm shadow-lg transition-colors animate-pulse"
          aria-label={t("video.enable_audio")}
        >
          <Volume2 className="w-3.5 h-3.5" />
          {t("video.click_audio")}
        </button>
      )}
    </div>
  );
}
