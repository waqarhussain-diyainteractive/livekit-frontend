'use client';

import React, { useEffect, useRef, useState } from 'react';
import { motion } from 'motion/react';
import { useDataChannel, useSessionContext, useSessionMessages } from '@livekit/components-react';
import type { AppConfig } from '@/app-config';
import { ChatTranscript } from '@/components/app/chat-transcript';
import { PreConnectMessage } from '@/components/app/preconnect-message';
import { TileLayout } from '@/components/app/tile-layout';
import {
  AgentControlBar,
  type ControlBarControls,
} from '@/components/livekit/agent-control-bar/agent-control-bar';
import { cn } from '@/lib/utils';
import { ScrollArea } from '../livekit/scroll-area/scroll-area';

const MotionBottom = motion.create('div');

const BOTTOM_VIEW_MOTION_PROPS = {
  variants: {
    visible: { opacity: 1, translateY: '0%' },
    hidden: { opacity: 0, translateY: '100%' },
  },
  initial: 'hidden',
  animate: 'visible',
  exit: 'hidden',
  transition: { duration: 0.3, delay: 0.5, ease: 'easeOut' },
};

interface FadeProps {
  top?: boolean;
  bottom?: boolean;
  className?: string;
}

export function Fade({ top = false, bottom = false, className }: FadeProps) {
  return (
    <div
      className={cn(
        'from-background/90 pointer-events-none h-4 bg-linear-to-b to-transparent',
        top && 'bg-linear-to-b from-[oklch(0.98_0.01_280/0.95)]',
        bottom && 'bg-linear-to-t from-[oklch(0.98_0.01_280/0.95)]',
        className
      )}
    />
  );
}

interface SessionViewProps {
  appConfig: AppConfig;
}

export const SessionView = ({ appConfig, ...props }: React.ComponentProps<'section'> & SessionViewProps) => {
  const session = useSessionContext();
  const { messages } = useSessionMessages(session);
  const [chatOpen, setChatOpen] = useState(false);
  const scrollAreaRef = useRef<HTMLDivElement>(null);
  
  // --- UI STATE DEFINITIONS ---
  const [activeImage, setActiveImage] = useState<{ url: string; title: string } | null>(null);
  // NEW: Added the missing state definitions for the Clinic UI!
  const [activeSlots, setActiveSlots] = useState<any[] | null>(null);
  const [activeTicket, setActiveTicket] = useState<any | null>(null);

  const controls: ControlBarControls = {
    leave: true,
    microphone: true,
    chat: appConfig.supportsChatInput,
    camera: appConfig.supportsVideoInput,
    screenShare: appConfig.supportsVideoInput,
  };

  useDataChannel((message) => {
    try {
      const data = JSON.parse(new TextDecoder().decode(message.payload));

      if (data.type === 'show_image') {
        setActiveImage({ url: data.url, title: data.title });
      }
      if (data.type === 'close_image') {
        setActiveImage(null);
      }
      // NEW HANDLERS FOR CLINIC ASSISTANT
      if (data.type === 'show_slots') {
        setActiveSlots(data.slots);
      }
      if (data.type === 'show_ticket') {
        setActiveTicket(data.ticket);
      }
    } catch (e) {
      console.error("Error parsing DataChannel message:", e);
    }
  });

  useEffect(() => {
    const lastMessage = messages.at(-1);
    const lastMessageIsLocal = lastMessage?.from?.isLocal === true;

    if (scrollAreaRef.current && lastMessageIsLocal) {
      scrollAreaRef.current.scrollTop = scrollAreaRef.current.scrollHeight;
    }
  }, [messages]);

  // Handle User Interactions from ChatTranscript (Optional: send back to Agent)
  const handleSlotClick = (slot: any) => {
    // We can send a message back to the LiveKit agent pretending the user typed it
    const msg = `I want to book the ${slot.start_time || slot.time} slot on ${slot.day}.`;
    session.chat?.send(msg);
    // Clear slots after selection so they don't stay on screen permanently
    setActiveSlots(null); 
  };

  const handleConfirmBooking = (ticket: any) => {
    session.chat?.send(`Please confirm my booking for ${ticket.day} at ${ticket.time}.`);
    setActiveTicket(null);
  };

  const handleCancelBooking = (ticket: any) => {
    session.chat?.send(`I would like to cancel this booking.`);
    setActiveTicket(null);
  };

  return (
    <section
      className="relative z-10 h-full w-full overflow-hidden bg-gradient-to-br from-[oklch(0.98_0.02_280)] via-[oklch(0.97_0.03_200)] to-[oklch(0.98_0.02_150)]"
      {...props}
    >
      {/* Chat Transcript */}
      <div className={cn('fixed inset-0 grid grid-cols-1 grid-rows-1', !chatOpen && 'pointer-events-none')}>
        <Fade top className="absolute inset-x-4 top-0 h-40" />
        <ScrollArea ref={scrollAreaRef} className="px-4 pt-40 pb-[150px] md:px-6 md:pb-[200px]">
          <ChatTranscript
            hidden={!chatOpen}
            messages={messages}
            activeImage={activeImage}
            activeSlots={activeSlots}
            activeTicket={activeTicket}
            onSlotClick={handleSlotClick}
            onConfirmBooking={handleConfirmBooking}
            onCancelBooking={handleCancelBooking}
            className="mx-auto max-w-2xl space-y-4 transition-opacity duration-300 ease-out"
          />
        </ScrollArea>
      </div>

      {/* Tile Layout */}
      <TileLayout chatOpen={chatOpen} activeImage={activeImage} />

      {/* Bottom */}
      <MotionBottom {...BOTTOM_VIEW_MOTION_PROPS} className="fixed inset-x-3 bottom-0 z-50 md:inset-x-12">
        {appConfig.isPreConnectBufferEnabled && (
          <PreConnectMessage messages={messages} className="pb-4" />
        )}
        <div className="relative mx-auto max-w-2xl pb-3 md:pb-12">
          <Fade bottom className="absolute inset-x-0 top-0 h-4 -translate-y-full" />
          <AgentControlBar
            controls={controls}
            isConnected={session.isConnected}
            onDisconnect={session.end}
            onChatOpenChange={setChatOpen}
          />
        </div>
      </MotionBottom>
    </section>
  );
};