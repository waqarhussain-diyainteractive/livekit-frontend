import React, { useEffect, useMemo, useState } from 'react';
import { createPortal } from 'react-dom';
import { Track } from 'livekit-client';
import { AnimatePresence, motion } from 'motion/react';
import {
  BarVisualizer,
  type TrackReference,
  VideoTrack,
  useLocalParticipant,
  useTracks,
  useVoiceAssistant,
} from '@livekit/components-react';
import { cn } from '@/lib/utils';

const MotionContainer = motion.create('div');

const ANIMATION_TRANSITION = {
  type: 'spring',
  stiffness: 675,
  damping: 75,
  mass: 1,
};

const classNames = {
  // GRID
  // 2 Columns x 3 Rows
  grid: [
    'h-full w-full',
    'grid gap-x-2 place-content-center',
    'grid-cols-[1fr_1fr] grid-rows-[90px_1fr_90px]',
  ],
  // Agent
  // chatOpen: true,
  // hasSecondTile: true
  // layout: Column 1 / Row 1
  // align: x-end y-center
  agentChatOpenWithSecondTile: ['col-start-1 row-start-1', 'self-center justify-self-end'],
  // Agent
  // chatOpen: true,
  // hasSecondTile: false
  // layout: Column 1 / Row 1 / Column-Span 2
  // align: x-center y-center
  agentChatOpenWithoutSecondTile: ['col-start-1 row-start-1', 'col-span-2', 'place-content-center'],
  // Agent
  // chatOpen: false
  // layout: Column 1 / Row 1 / Column-Span 2 / Row-Span 3
  // align: x-center y-center
  agentChatClosed: ['col-start-1 row-start-1', 'col-span-2 row-span-3', 'place-content-center'],
  // Second tile
  // chatOpen: true,
  // hasSecondTile: true
  // layout: Column 2 / Row 1
  // align: x-start y-center
  secondTileChatOpen: ['col-start-2 row-start-1', 'self-center justify-self-start'],
  // Second tile
  // chatOpen: false,
  // hasSecondTile: false
  // layout: Column 2 / Row 2
  // align: x-end y-end
  secondTileChatClosed: ['col-start-2 row-start-3', 'place-content-end'],
};

export function useLocalTrackRef(source: Track.Source) {
  const { localParticipant } = useLocalParticipant();
  const publication = localParticipant.getTrackPublication(source);
  const trackRef = useMemo<TrackReference | undefined>(
    () => (publication ? { source, participant: localParticipant, publication } : undefined),
    [source, publication, localParticipant]
  );
  return trackRef;
}

interface TileLayoutProps {
  chatOpen: boolean;
  activeImage?: { url: string; title: string } | null;
}

export function TileLayout({ chatOpen, activeImage }: TileLayoutProps) {
  const {
    state: agentState,
    audioTrack: agentAudioTrack,
    videoTrack: agentVideoTrack,
  } = useVoiceAssistant();
  const [screenShareTrack] = useTracks([Track.Source.ScreenShare]);
  const cameraTrack: TrackReference | undefined = useLocalTrackRef(Track.Source.Camera);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  const [isWaveformImageHidden, setIsWaveformImageHidden] = useState(false);

  // Detect mobile screen size
  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768);
    };

    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  // Reset hidden state when a new image is shown
  useEffect(() => {
    if (activeImage) {
      setIsWaveformImageHidden(false);
    }
  }, [activeImage?.url]);

  const isCameraEnabled = cameraTrack && !cameraTrack.publication.isMuted;
  const isScreenShareEnabled = screenShareTrack && !screenShareTrack.publication.isMuted;
  const hasSecondTile = isCameraEnabled || isScreenShareEnabled;

  const animationDelay = chatOpen ? 0 : 0.15;
  const isAvatar = agentVideoTrack !== undefined;
  const videoWidth = agentVideoTrack?.publication.dimensions?.width ?? 0;
  const videoHeight = agentVideoTrack?.publication.dimensions?.height ?? 0;

  // Responsive scale: smaller on mobile, larger on desktop
  const waveformScale = chatOpen ? 1 : isMobile ? 2.5 : 5;

  const handleDownload = async () => {
    if (!activeImage) return;

    try {
      const response = await fetch(activeImage.url);
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `${activeImage.title || 'image'}.png`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);
    } catch (error) {
      window.open(activeImage.url, '_blank');
    }
  };

  return (
    <div className="pointer-events-none fixed inset-x-0 top-8 bottom-32 z-50 md:top-12 md:bottom-40">
      <div className="relative mx-auto h-full max-w-2xl px-4 md:px-0">
        <div className={cn(classNames.grid)}>
          {/* Agent */}
          <div
            className={cn([
              'grid',
              !chatOpen && classNames.agentChatClosed,
              chatOpen && hasSecondTile && classNames.agentChatOpenWithSecondTile,
              chatOpen && !hasSecondTile && classNames.agentChatOpenWithoutSecondTile,
            ])}
          >
            <AnimatePresence mode="popLayout">
              {!isAvatar && (
                // Audio Agent
                <MotionContainer
                  key="agent"
                  layoutId="agent"
                  initial={{
                    opacity: 0,
                    scale: 0,
                  }}
                  animate={{
                    opacity: 1,
                    scale: waveformScale,
                  }}
                  transition={{
                    ...ANIMATION_TRANSITION,
                    delay: animationDelay,
                  }}
                  className={cn(
                    'aspect-square h-[90px] rounded-2xl transition-[border,drop-shadow]',
                    'bg-gradient-to-br from-[oklch(0.95_0.05_280)] via-[oklch(0.92_0.08_200)] to-[oklch(0.95_0.05_150)]',
                    'border-2 border-transparent',
                    chatOpen &&
                      'border-[oklch(0.85_0.12_280)] shadow-lg shadow-[oklch(0.7_0.2_280/0.2)] delay-200'
                  )}
                >
                  <BarVisualizer
                    barCount={5}
                    state={agentState}
                    options={{ minHeight: 5 }}
                    trackRef={agentAudioTrack}
                    className={cn('flex h-full items-center justify-center gap-1.5')}
                  >
                    <span
                      className={cn([
                        'min-h-3 w-3 rounded-full',
                        'bg-[oklch(0.85_0.1_280)]',
                        'origin-center transition-colors duration-250 ease-linear',
                        'data-[lk-highlighted=true]:bg-gradient-to-t data-[lk-highlighted=true]:from-[oklch(0.65_0.25_280)] data-[lk-highlighted=true]:to-[oklch(0.75_0.2_300)]',
                        'data-[lk-muted=true]:bg-[oklch(0.9_0.05_280)]',
                      ])}
                    />
                  </BarVisualizer>
                </MotionContainer>
              )}

              {isAvatar && (
                // Avatar Agent
                <MotionContainer
                  key="avatar"
                  layoutId="avatar"
                  initial={{
                    scale: 1,
                    opacity: 1,
                    maskImage:
                      'radial-gradient(circle, rgba(0, 0, 0, 1) 0, rgba(0, 0, 0, 1) 20px, transparent 20px)',
                    filter: 'blur(20px)',
                  }}
                  animate={{
                    maskImage:
                      'radial-gradient(circle, rgba(0, 0, 0, 1) 0, rgba(0, 0, 0, 1) 500px, transparent 500px)',
                    filter: 'blur(0px)',
                    borderRadius: chatOpen ? 16 : 24,
                  }}
                  transition={{
                    ...ANIMATION_TRANSITION,
                    delay: animationDelay,
                    maskImage: {
                      duration: 1,
                    },
                    filter: {
                      duration: 1,
                    },
                  }}
                  className={cn(
                    'overflow-hidden shadow-xl shadow-[oklch(0.7_0.2_280/0.25)]',
                    'bg-gradient-to-br from-[oklch(0.95_0.05_280)] to-[oklch(0.9_0.08_200)]',
                    'border-2 border-[oklch(0.85_0.12_280)]',
                    chatOpen ? 'h-[90px]' : 'h-auto w-full'
                  )}
                >
                  <VideoTrack
                    width={videoWidth}
                    height={videoHeight}
                    trackRef={agentVideoTrack}
                    className={cn(chatOpen && 'size-[90px] object-cover')}
                  />
                </MotionContainer>
              )}
            </AnimatePresence>
          </div>

          <div
            className={cn([
              'grid',
              chatOpen && classNames.secondTileChatOpen,
              !chatOpen && classNames.secondTileChatClosed,
            ])}
          >
            {/* Camera & Screen Share */}
            <AnimatePresence>
              {((cameraTrack && isCameraEnabled) || (screenShareTrack && isScreenShareEnabled)) && (
                <MotionContainer
                  key="camera"
                  layout="position"
                  layoutId="camera"
                  initial={{
                    opacity: 0,
                    scale: 0,
                  }}
                  animate={{
                    opacity: 1,
                    scale: 1,
                  }}
                  exit={{
                    opacity: 0,
                    scale: 0,
                  }}
                  transition={{
                    ...ANIMATION_TRANSITION,
                    delay: animationDelay,
                  }}
                  className="overflow-hidden rounded-2xl border-2 border-[oklch(0.85_0.12_280)] shadow-lg shadow-[oklch(0.7_0.2_280/0.2)]"
                >
                  <VideoTrack
                    trackRef={cameraTrack || screenShareTrack}
                    width={(cameraTrack || screenShareTrack)?.publication.dimensions?.width ?? 0}
                    height={(cameraTrack || screenShareTrack)?.publication.dimensions?.height ?? 0}
                    className="aspect-square w-[90px] rounded-xl bg-gradient-to-br from-[oklch(0.95_0.05_280)] to-[oklch(0.9_0.08_200)] object-cover"
                  />
                </MotionContainer>
              )}
            </AnimatePresence>
          </div>
        </div>
      </div>

      {/* Image Display for Voice Waveform Screen (when chat is closed) */}
      <AnimatePresence>
        {!chatOpen && activeImage && !isWaveformImageHidden && (
          <MotionContainer
            key="waveform-image"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: 20 }}
            transition={{ duration: 0.3, ease: 'easeOut' }}
            className={cn(
              'pointer-events-auto absolute px-4',
              // Mobile: centered at bottom
              'inset-x-0 bottom-4 flex justify-center',
              // Desktop: right side, vertically centered
              'md:inset-x-auto md:top-1/2 md:right-4 md:bottom-auto md:-translate-y-1/2'
            )}
          >
            <div className="w-full max-w-[280px] md:max-w-[400px]">
              <div className="relative rounded-2xl border-2 border-[oklch(0.88_0.08_180)] bg-gradient-to-br from-[oklch(0.98_0.02_180)] to-[oklch(0.95_0.04_150)] p-3 shadow-xl backdrop-blur-sm">
                {/* Close Button */}

                <div className="mb-2 flex items-center justify-between">
                  <span className="flex items-center gap-1.5 truncate text-xs font-semibold text-[oklch(0.4_0.1_200)] md:text-sm">
                    🖼️ {activeImage.title}
                  </span>
                </div>
                <img
                  src={activeImage.url}
                  alt={activeImage.title}
                  onClick={() => setIsModalOpen(true)}
                  className="max-h-[20vh] w-full cursor-pointer rounded-xl border border-[oklch(0.9_0.06_180)] bg-white object-contain shadow-sm transition-opacity hover:opacity-90 md:max-h-[40vh]"
                />
                <div className="mt-3 flex items-center justify-between gap-2">
                  <button
                    onClick={() => setIsModalOpen(true)}
                    className="flex flex-1 cursor-pointer items-center justify-center gap-1.5 rounded-full bg-[oklch(0.65_0.2_280)] px-3 py-2 text-xs font-medium text-white shadow-md transition-colors hover:bg-[oklch(0.6_0.22_280)] md:text-sm"
                  >
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      width="14"
                      height="14"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    >
                      <path d="M15 3h6v6M9 21H3v-6M21 3l-7 7M3 21l7-7" />
                    </svg>
                    View Image
                  </button>
                  <button
                    onClick={() => setIsWaveformImageHidden(true)}
                    className="flex cursor-pointer items-center justify-center gap-1.5 rounded-full bg-[oklch(0.92_0.05_280)] px-3 py-2 text-xs font-medium text-[oklch(0.4_0.1_280)] transition-colors hover:bg-[oklch(0.88_0.08_280)] md:text-sm"
                  >
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      width="14"
                      height="14"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    >
                      <line x1="18" y1="6" x2="6" y2="18"></line>
                      <line x1="6" y1="6" x2="18" y2="18"></line>
                    </svg>
                    Close
                  </button>
                </div>
              </div>
            </div>
          </MotionContainer>
        )}
      </AnimatePresence>

      {/* Full-size Image Modal */}
      {typeof document !== 'undefined' &&
        createPortal(
          <AnimatePresence>
            {isModalOpen && activeImage && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.2 }}
                className="pointer-events-auto fixed inset-0 z-[9999] flex items-center justify-center bg-black/70 p-4 backdrop-blur-sm"
                onClick={() => setIsModalOpen(false)}
              >
                <motion.div
                  initial={{ scale: 0.9, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  exit={{ scale: 0.9, opacity: 0 }}
                  transition={{ duration: 0.2, ease: 'easeOut' }}
                  className="pointer-events-auto relative max-h-[90vh] w-full max-w-4xl overflow-hidden rounded-2xl bg-white shadow-2xl"
                  onClick={(e) => e.stopPropagation()}
                >
                  {/* Modal Header */}
                  <div className="flex items-center justify-between border-b border-[oklch(0.9_0.05_280)] p-4">
                    <h3 className="text-md flex items-center gap-2 font-semibold text-[oklch(0.3_0.1_280)] lg:text-lg">
                      🖼️ {activeImage.title}
                    </h3>
                    <div className="flex items-center gap-2">
                      <button
                        type="button"
                        onClick={(e) => {
                          e.preventDefault();
                          e.stopPropagation();
                          handleDownload();
                        }}
                        className="flex cursor-pointer items-center justify-center gap-1.5 rounded-full bg-gradient-to-r from-[oklch(0.75_0.15_150)] to-[oklch(0.7_0.18_180)] px-2 py-2 text-sm font-medium text-white shadow-md transition-all hover:from-[oklch(0.7_0.17_150)] hover:to-[oklch(0.65_0.2_180)] md:px-4"
                      >
                        <svg
                          xmlns="http://www.w3.org/2000/svg"
                          width="16"
                          height="16"
                          viewBox="0 0 24 24"
                          fill="none"
                          stroke="currentColor"
                          strokeWidth="2"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                        >
                          <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
                          <polyline points="7 10 12 15 17 10" />
                          <line x1="12" y1="15" x2="12" y2="3" />
                        </svg>
                        <span className="hidden md:inline">Download</span>
                      </button>
                      <button
                        type="button"
                        onClick={(e) => {
                          e.preventDefault();
                          e.stopPropagation();
                          setIsModalOpen(false);
                        }}
                        className="flex cursor-pointer items-center justify-center gap-1.5 rounded-full bg-[oklch(0.92_0.05_280)] px-2 py-2 text-sm font-medium text-[oklch(0.4_0.1_280)] transition-colors hover:bg-[oklch(0.88_0.08_280)] md:px-4"
                      >
                        <svg
                          xmlns="http://www.w3.org/2000/svg"
                          width="16"
                          height="16"
                          viewBox="0 0 24 24"
                          fill="none"
                          stroke="currentColor"
                          strokeWidth="2"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                        >
                          <line x1="18" y1="6" x2="6" y2="18"></line>
                          <line x1="6" y1="6" x2="18" y2="18"></line>
                        </svg>
                        <span className="hidden md:inline">Close</span>
                      </button>
                    </div>
                  </div>

                  {/* Modal Image */}
                  <div className="flex max-h-[calc(90vh-80px)] items-center justify-center overflow-auto bg-[oklch(0.98_0.02_280)] p-4">
                    <img
                      src={activeImage.url}
                      alt={activeImage.title}
                      className="max-h-[calc(90vh-120px)] max-w-full rounded-xl object-contain shadow-lg"
                    />
                  </div>
                </motion.div>
              </motion.div>
            )}
          </AnimatePresence>,
          document.body
        )}
    </div>
  );
}
