'use client';

import React, { useEffect, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import { AnimatePresence, type HTMLMotionProps, motion } from 'motion/react';
import { type ReceivedMessage } from '@livekit/components-react';
import { ChatEntry } from '@/components/livekit/chat-entry';

// Type for tracking images with their position in the chat
interface ImageEntry {
  id: string;
  url: string;
  title: string;
  insertAfterMessageIndex: number;
}

const MotionContainer = motion.create('div');
const MotionChatEntry = motion.create(ChatEntry);
const MotionImage = motion.create('div');
const MotionModal = motion.create('div');

const CONTAINER_MOTION_PROPS = {
  variants: {
    hidden: {
      opacity: 0,
      transition: {
        ease: 'easeOut',
        duration: 0.3,
        staggerChildren: 0.1,
        staggerDirection: -1,
      },
    },
    visible: {
      opacity: 1,
      transition: {
        delay: 0.2,
        ease: 'easeOut',
        duration: 0.3,
        stagerDelay: 0.2,
        staggerChildren: 0.1,
        staggerDirection: 1,
      },
    },
  },
  initial: 'hidden',
  animate: 'visible',
  exit: 'hidden',
};

const MESSAGE_MOTION_PROPS = {
  variants: {
    hidden: {
      opacity: 0,
      translateY: 10,
    },
    visible: {
      opacity: 1,
      translateY: 0,
    },
  },
};

interface ChatTranscriptProps {
  hidden?: boolean;
  messages?: ReceivedMessage[];
  activeImage?: { url: string; title: string } | null;
}

export function ChatTranscript({
  hidden = false,
  messages = [],
  activeImage,
  ...props
}: ChatTranscriptProps & Omit<HTMLMotionProps<'div'>, 'ref'>) {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalImage, setModalImage] = useState<{ url: string; title: string } | null>(null);
  const [imageHistory, setImageHistory] = useState<ImageEntry[]>([]);
  const prevMessageCountRef = useRef(messages.length);

  // Track when a new image is shown and record its position
  useEffect(() => {
    if (activeImage) {
      const imageId = `${activeImage.url}-${Date.now()}`;
      const existingImage = imageHistory.find((img) => img.url === activeImage.url);

      if (!existingImage) {
        // Insert image after the current last message
        setImageHistory((prev) => [
          ...prev,
          {
            id: imageId,
            url: activeImage.url,
            title: activeImage.title,
            insertAfterMessageIndex: messages.length - 1,
          },
        ]);
      }
    }
  }, [activeImage?.url]);

  // Update previous message count ref
  useEffect(() => {
    prevMessageCountRef.current = messages.length;
  }, [messages.length]);

  // Clear image from history when it's closed
  useEffect(() => {
    if (!activeImage && imageHistory.length > 0) {
      // Remove the last image from history when closed
      setImageHistory((prev) => prev.slice(0, -1));
    }
  }, [activeImage]);

  const handleDownload = async (image: { url: string; title: string }) => {
    if (!image) return;

    try {
      const response = await fetch(image.url);
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `${image.title || 'image'}.png`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);
    } catch (error) {
      // Fallback: open in new tab
      window.open(image.url, '_blank');
    }
  };

  const openModal = (image: { url: string; title: string }) => {
    setModalImage(image);
    setIsModalOpen(true);
  };

  // Helper to render an image entry
  const renderImageEntry = (imageEntry: ImageEntry) => (
    <MotionImage
      key={imageEntry.id}
      initial={{ opacity: 0, scale: 0.95, y: 10 }}
      animate={{ opacity: 1, scale: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.95, y: 10 }}
      transition={{ duration: 0.3, ease: 'easeOut' }}
      className="group flex w-full flex-col gap-2"
    >
      <div className="mr-auto max-w-[85%] rounded-2xl border-2 border-[oklch(0.85_0.1_180)] bg-gradient-to-br from-[oklch(0.95_0.03_180)] to-[oklch(0.92_0.05_150)] p-3 shadow-md">
        <div className="mb-2 flex items-center justify-between">
          <span className="flex items-center gap-1.5 text-sm font-semibold text-[oklch(0.4_0.1_200)]">
            🖼️ {imageEntry.title}
          </span>
        </div>
        <img
          src={imageEntry.url}
          alt={imageEntry.title}
          onClick={() => openModal(imageEntry)}
          className="w-full max-w-md cursor-pointer rounded-xl border border-[oklch(0.88_0.08_180)] bg-white object-contain shadow-sm transition-opacity hover:opacity-90"
        />
      </div>
    </MotionImage>
  );

  return (
    <>
      <AnimatePresence>
        {!hidden && (
          <MotionContainer {...CONTAINER_MOTION_PROPS} {...props}>
            {messages.map((receivedMessage, index) => {
              const { id, timestamp, from, message } = receivedMessage;
              const locale = navigator?.language ?? 'en-US';
              const messageOrigin = from?.isLocal ? 'local' : 'remote';
              const hasBeenEdited =
                receivedMessage.type === 'chatMessage' && !!receivedMessage.editTimestamp;

              // Find any images that should be rendered after this message
              const imagesAfterThisMessage = imageHistory.filter(
                (img) => img.insertAfterMessageIndex === index
              );

              return (
                <React.Fragment key={id}>
                  <MotionChatEntry
                    locale={locale}
                    timestamp={timestamp}
                    message={message}
                    messageOrigin={messageOrigin}
                    hasBeenEdited={hasBeenEdited}
                    {...MESSAGE_MOTION_PROPS}
                  />
                  {/* Render images that were shown after this message */}
                  {imagesAfterThisMessage.map((imageEntry) => renderImageEntry(imageEntry))}
                </React.Fragment>
              );
            })}

            {/* Render images that were shown before any messages or when there are no messages */}
            {imageHistory
              .filter(
                (img) =>
                  img.insertAfterMessageIndex < 0 || img.insertAfterMessageIndex >= messages.length
              )
              .map((imageEntry) => renderImageEntry(imageEntry))}
          </MotionContainer>
        )}
      </AnimatePresence>

      {/* Full-size Image Modal - Rendered via Portal */}
      {typeof document !== 'undefined' &&
        createPortal(
          <AnimatePresence>
            {isModalOpen && modalImage && (
              <MotionModal
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
                      🖼️ {modalImage.title}
                    </h3>
                    <div className="flex items-center gap-2">
                      <button
                        type="button"
                        onClick={(e) => {
                          e.preventDefault();
                          e.stopPropagation();
                          handleDownload(modalImage);
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
                      src={modalImage.url}
                      alt={modalImage.title}
                      className="max-h-[calc(90vh-120px)] max-w-full rounded-xl object-contain shadow-lg"
                    />
                  </div>
                </motion.div>
              </MotionModal>
            )}
          </AnimatePresence>,
          document.body
        )}
    </>
  );
}
