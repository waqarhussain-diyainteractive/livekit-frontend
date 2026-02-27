'use client';

import React, { useEffect, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import { AnimatePresence, type HTMLMotionProps, motion } from 'motion/react';
import { type ReceivedMessage } from '@livekit/components-react';
import { ChatEntry } from '@/components/livekit/chat-entry';

// Type for tracking UI elements with their position in the chat
interface UIElementEntry {
  id: string;
  type: 'image' | 'slots' | 'ticket';
  data: any;
  insertAfterMessageIndex: number;
}

const MotionContainer = motion.create('div');
const MotionChatEntry = motion.create(ChatEntry);
const MotionUIElement = motion.create('div');
const MotionModal = motion.create('div');

const CONTAINER_MOTION_PROPS = {
  variants: {
    hidden: { opacity: 0, transition: { ease: 'easeOut', duration: 0.3, staggerChildren: 0.1, staggerDirection: -1 } },
    visible: { opacity: 1, transition: { delay: 0.2, ease: 'easeOut', duration: 0.3, staggerChildren: 0.1, staggerDirection: 1 } },
  },
  initial: 'hidden',
  animate: 'visible',
  exit: 'hidden',
};

const MESSAGE_MOTION_PROPS = {
  variants: {
    hidden: { opacity: 0, translateY: 10 },
    visible: { opacity: 1, translateY: 0 },
  },
};

interface ChatTranscriptProps {
  hidden?: boolean;
  messages?: ReceivedMessage[];
  activeImage?: { url: string; title: string } | null;
  activeSlots?: any[] | null;
  activeTicket?: any | null;
  onSlotClick?: (slot: any) => void;
  onConfirmBooking?: (ticket: any) => void;
  onCancelBooking?: (ticket: any) => void;
}

export function ChatTranscript({
  hidden = false,
  messages = [],
  activeImage,
  activeSlots,
  activeTicket,
  onSlotClick,
  onConfirmBooking,
  onCancelBooking,
  ...props
}: ChatTranscriptProps & Omit<HTMLMotionProps<'div'>, 'ref'>) {
  
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalImage, setModalImage] = useState<{ url: string; title: string } | null>(null);
  const [uiHistory, setUiHistory] = useState<UIElementEntry[]>([]);
  const prevMessageCountRef = useRef(messages.length);

  // --- TRACK INCOMING UI ELEMENTS (Images, Slots, Tickets) ---
  useEffect(() => {
    if (activeImage) {
      const id = `img-${activeImage.url}-${Date.now()}`;
      if (!uiHistory.find((item) => item.type === 'image' && item.data.url === activeImage.url)) {
        setUiHistory((prev) => [...prev, { id, type: 'image', data: activeImage, insertAfterMessageIndex: messages.length - 1 }]);
      }
    }
  }, [activeImage?.url]);

  useEffect(() => {
    if (activeSlots && activeSlots.length > 0) {
      const id = `slots-${Date.now()}`;
      setUiHistory((prev) => [...prev, { id, type: 'slots', data: activeSlots, insertAfterMessageIndex: messages.length - 1 }]);
    }
  }, [activeSlots]);

  useEffect(() => {
    if (activeTicket) {
      const id = `ticket-${Date.now()}`;
      setUiHistory((prev) => [...prev, { id, type: 'ticket', data: activeTicket, insertAfterMessageIndex: messages.length - 1 }]);
    }
  }, [activeTicket]);

  useEffect(() => { prevMessageCountRef.current = messages.length; }, [messages.length]);

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
      window.open(image.url, '_blank');
    }
  };

  const openModal = (image: { url: string; title: string }) => {
    setModalImage(image);
    setIsModalOpen(true);
  };

  // --- RENDERERS FOR CUSTOM UI ELEMENTS ---
  const renderUIElement = (entry: UIElementEntry) => {
    if (entry.type === 'image') {
      return (
        <MotionUIElement
          key={entry.id}
          initial={{ opacity: 0, scale: 0.95, y: 10 }} animate={{ opacity: 1, scale: 1, y: 0 }} exit={{ opacity: 0, scale: 0.95, y: 10 }}
          transition={{ duration: 0.3, ease: 'easeOut' }}
          className="group flex w-full flex-col gap-2 my-2"
        >
          <div className="mr-auto max-w-[85%] rounded-2xl border border-gray-200 bg-white p-3 shadow-sm">
            <div className="mb-2 flex items-center justify-between">
              <span className="flex items-center gap-1.5 text-sm font-bold text-[#183a59]">
                📍 {entry.data.title}
              </span>
            </div>
            <img
              src={entry.data.url}
              alt={entry.data.title}
              onClick={() => openModal(entry.data)}
              className="w-full max-w-md cursor-pointer rounded-xl border border-gray-100 object-contain transition-opacity hover:opacity-90"
            />
          </div>
        </MotionUIElement>
      );
    }

    if (entry.type === 'slots') {
      return (
        <MotionUIElement key={entry.id} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="flex w-full justify-start my-1">
          <div className="flex flex-wrap gap-2 max-w-[85%]">
            {entry.data.map((slot: any, i: number) => (
              <button 
                key={i} 
                onClick={() => onSlotClick && onSlotClick(slot)}
                className="bg-white border border-[#183a59]/30 text-[#183a59] hover:bg-[#183a59] hover:text-white px-4 py-2 rounded-xl text-sm font-semibold transition-all shadow-sm flex flex-col items-center justify-center min-w-[75px]"
              >
                <span>{slot.start_time || slot.time}</span>
                {slot.day && <span className="text-[10px] font-bold uppercase mt-0.5 opacity-70 tracking-wider">{slot.day.slice(0,3)}</span>}
              </button>
            ))}
          </div>
        </MotionUIElement>
      );
    }

    if (entry.type === 'ticket') {
      const ticket = entry.data;
      return (
        <MotionUIElement key={entry.id} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="flex w-full justify-start my-2">
          <div className="bg-white border border-gray-200 rounded-2xl shadow-lg overflow-hidden flex flex-col w-full max-w-[85%]">
            <div className="bg-[#edf5fa] border-b border-dashed border-gray-300 p-3 px-4 flex items-center justify-between">
              <span className="text-[11px] font-bold text-[#183a59] uppercase tracking-wider flex items-center gap-1.5">
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-3.5 h-3.5"><path fillRule="evenodd" d="M6.75 2.25A.75.75 0 017.5 3v1.5h9V3A.75.75 0 0118 3v1.5h.75a3 3 0 013 3v11.25a3 3 0 01-3 3H5.25a3 3 0 01-3-3V7.5a3 3 0 013-3H6V3a.75.75 0 01.75-.75zm13.5 9a1.5 1.5 0 00-1.5-1.5H5.25a1.5 1.5 0 00-1.5 1.5v7.5a1.5 1.5 0 001.5 1.5h13.5a1.5 1.5 0 001.5-1.5v-7.5z" clipRule="evenodd" /></svg>
                Appointment Ticket
              </span>
              <span className="flex h-2 w-2 relative">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
              </span>
            </div>
            <div className="p-4 flex flex-col gap-4">
              <div>
                <p className="text-[10px] text-gray-400 uppercase font-bold tracking-wider mb-0.5">Patient Details</p>
                <p className="text-sm font-bold text-gray-800 flex items-center gap-1.5">
                    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-4 h-4 text-gray-400"><path fillRule="evenodd" d="M7.5 6a4.5 4.5 0 119 0 4.5 4.5 0 01-9 0zM3.751 20.105a8.25 8.25 0 0116.498 0 .75.75 0 01-.437.695A18.683 18.683 0 0112 22.5c-2.786 0-5.433-.608-7.812-1.7a.75.75 0 01-.437-.695z" clipRule="evenodd" /></svg>
                    {ticket.patient_name} <span className="text-gray-400 font-medium ml-1 text-xs">({ticket.phone_number})</span>
                </p>
              </div>
              <div className="grid grid-cols-2 gap-4 bg-gray-50 p-3 rounded-xl border border-gray-100">
                <div>
                  <p className="text-[10px] text-gray-400 uppercase font-bold tracking-wider mb-0.5">Date & Time</p>
                  <p className="text-[13px] font-bold text-[#183a59]">{ticket.day}, {ticket.time || ticket.start_time}</p>
                </div>
                <div>
                  <p className="text-[10px] text-gray-400 uppercase font-bold tracking-wider mb-0.5">Location</p>
                  <p className="text-[13px] font-bold text-gray-800 line-clamp-2">{ticket.clinic_name}</p>
                </div>
              </div>
            </div>
            <div className="p-3 bg-white border-t border-gray-100 flex gap-2">
              <button onClick={() => onConfirmBooking && onConfirmBooking(ticket)} className="flex-1 bg-[#183a59] text-white py-2.5 rounded-xl text-sm font-bold hover:bg-[#112940] transition-colors shadow-sm">Confirm</button>
              <button onClick={() => onCancelBooking && onCancelBooking(ticket)} className="flex-1 bg-white border border-gray-200 text-gray-600 py-2.5 rounded-xl text-sm font-bold hover:bg-gray-50 transition-colors">Cancel</button>
            </div>
          </div>
        </MotionUIElement>
      );
    }
    return null;
  };

  return (
    <>
      <AnimatePresence>
        {!hidden && (
          <MotionContainer {...CONTAINER_MOTION_PROPS} {...props}>
            {messages.map((receivedMessage, index) => {
              const { id, timestamp, from, message } = receivedMessage;
              const locale = navigator?.language ?? 'en-US';
              const messageOrigin = from?.isLocal ? 'local' : 'remote';
              const hasBeenEdited = receivedMessage.type === 'chatMessage' && !!receivedMessage.editTimestamp;

              const uiAfterThisMessage = uiHistory.filter((ui) => ui.insertAfterMessageIndex === index);

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
                  {uiAfterThisMessage.map((uiEntry) => renderUIElement(uiEntry))}
                </React.Fragment>
              );
            })}

            {uiHistory.filter((ui) => ui.insertAfterMessageIndex < 0 || ui.insertAfterMessageIndex >= messages.length)
              .map((uiEntry) => renderUIElement(uiEntry))}
          </MotionContainer>
        )}
      </AnimatePresence>

      {/* Full-size Image Modal - Rendered via Portal */}
      {typeof document !== 'undefined' && createPortal(
          <AnimatePresence>
            {isModalOpen && modalImage && (
              <MotionModal
                initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 0.2 }}
                className="pointer-events-auto fixed inset-0 z-[9999] flex items-center justify-center bg-black/70 p-4 backdrop-blur-sm"
                onClick={() => setIsModalOpen(false)}
              >
                <motion.div
                  initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.9, opacity: 0 }} transition={{ duration: 0.2, ease: 'easeOut' }}
                  className="pointer-events-auto relative max-h-[90vh] w-full max-w-4xl overflow-hidden rounded-2xl bg-white shadow-2xl"
                  onClick={(e) => e.stopPropagation()}
                >
                  <div className="flex items-center justify-between border-b border-gray-200 p-4">
                    <h3 className="text-md flex items-center gap-2 font-bold text-[#183a59] lg:text-lg">
                      🖼️ {modalImage.title}
                    </h3>
                    <div className="flex items-center gap-2">
                      <button type="button" onClick={(e) => { e.preventDefault(); e.stopPropagation(); handleDownload(modalImage); }} className="flex cursor-pointer items-center justify-center gap-1.5 rounded-full bg-[#183a59] px-3 py-2 text-sm font-medium text-white shadow-sm hover:bg-[#112940] transition-colors">
                        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" /><polyline points="7 10 12 15 17 10" /><line x1="12" y1="15" x2="12" y2="3" /></svg>
                        <span className="hidden md:inline">Download</span>
                      </button>
                      <button type="button" onClick={(e) => { e.preventDefault(); e.stopPropagation(); setIsModalOpen(false); }} className="flex cursor-pointer items-center justify-center gap-1.5 rounded-full bg-gray-100 px-3 py-2 text-sm font-medium text-gray-700 hover:bg-gray-200 transition-colors">
                        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>
                        <span className="hidden md:inline">Close</span>
                      </button>
                    </div>
                  </div>
                  <div className="flex max-h-[calc(90vh-80px)] items-center justify-center overflow-auto bg-gray-50 p-4">
                    <img src={modalImage.url} alt={modalImage.title} className="max-h-[calc(90vh-120px)] max-w-full rounded-xl object-contain shadow-sm border border-gray-200" />
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