import * as React from 'react';
import { cn } from '@/lib/utils';

export interface ChatEntryProps extends React.HTMLAttributes<HTMLLIElement> {
  /** The locale to use for the timestamp. */
  locale: string;
  /** The timestamp of the message. */
  timestamp: number;
  /** The message to display. */
  message: string;
  /** The origin of the message. */
  messageOrigin: 'local' | 'remote';
  /** The sender's name. */
  name?: string;
  /** Whether the message has been edited. */
  hasBeenEdited?: boolean;
}

export const ChatEntry = ({
  name,
  locale,
  timestamp,
  message,
  messageOrigin,
  hasBeenEdited = false,
  className,
  ...props
}: ChatEntryProps) => {
  const time = new Date(timestamp);
  const title = time.toLocaleTimeString(locale, { timeStyle: 'full' });

  return (
    <li
      title={title}
      data-lk-message-origin={messageOrigin}
      className={cn('group flex w-full flex-col gap-1', className)}
      {...props}
    >
      <header
        className={cn(
          'flex items-center gap-2 text-sm font-medium',
          messageOrigin === 'local'
            ? 'flex-row-reverse text-[oklch(0.55_0.15_280)]'
            : 'text-left text-[oklch(0.5_0.15_180)]'
        )}
      >
        {name && <strong>{name}</strong>}
        <span className="font-mono text-xs text-[oklch(0.5_0.05_280)] opacity-0 transition-opacity ease-linear group-hover:opacity-100">
          {hasBeenEdited && '✏️ '}
          {time.toLocaleTimeString(locale, { timeStyle: 'short' })}
        </span>
      </header>
      <span
        className={cn(
          'max-w-4/5 rounded-2xl px-4 py-2.5 text-[0.95rem] leading-relaxed shadow-sm',
          messageOrigin === 'local'
            ? 'ml-auto rounded-br-md bg-gradient-to-br from-[oklch(0.75_0.2_280)] to-[oklch(0.7_0.22_300)] text-white'
            : 'mr-auto rounded-bl-md border border-[oklch(0.88_0.08_180)] bg-gradient-to-br from-[oklch(0.95_0.03_180)] to-[oklch(0.92_0.05_150)] text-[oklch(0.25_0.05_280)]'
        )}
      >
        {message}
      </span>
    </li>
  );
};
