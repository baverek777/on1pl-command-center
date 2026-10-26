import { useState } from 'react';
import { motion } from 'framer-motion';
import type { ChatMessage } from '@/types';
import { cn, formatTimestamp } from '@/lib/utils';

interface MessageBubbleProps {
  message: ChatMessage;
}

function StreamingDots() {
  return (
    <span className="inline-flex items-center gap-1 py-1">
      {[0, 1, 2].map((i) => (
        <motion.span
          key={i}
          className="inline-block h-2 w-2 rounded-full bg-[#d4a574]"
          animate={{ opacity: [0.3, 1, 0.3] }}
          transition={{
            duration: 1.2,
            repeat: Infinity,
            delay: i * 0.2,
            ease: 'easeInOut',
          }}
        />
      ))}
    </span>
  );
}

export default function MessageBubble({ message }: MessageBubbleProps) {
  const [showTimestamp, setShowTimestamp] = useState(false);
  const isUser = message.role === 'user';
  const isAssistant = message.role === 'assistant';

  return (
    <motion.div
      initial={{ opacity: 0, y: 12, scale: 0.97 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      transition={{ duration: 0.3, ease: 'easeOut' }}
      className={cn(
        'flex w-full gap-3',
        isUser ? 'justify-end' : 'justify-start'
      )}
      onMouseEnter={() => setShowTimestamp(true)}
      onMouseLeave={() => setShowTimestamp(false)}
    >
      {/* Assistant avatar */}
      {isAssistant && (
        <div className="flex-shrink-0 mt-1">
          <div className="flex h-8 w-8 items-center justify-center rounded-full bg-gradient-to-br from-[#d4a574] to-[#c9956b] shadow-md shadow-[#d4a574]/20">
            <span className="text-xs font-bold text-[#121212] select-none">
              AI
            </span>
          </div>
        </div>
      )}

      {/* Message content wrapper */}
      <div
        className={cn(
          'relative max-w-[75%] group',
          isUser ? 'items-end' : 'items-start'
        )}
      >
        {/* Bubble */}
        <div
          className={cn(
            'rounded-2xl px-4 py-3 text-sm leading-relaxed',
            isUser
              ? 'bg-gradient-to-br from-[#2a2218] to-[#1e1a14] border border-[#d4a574]/20 text-white rounded-br-md'
              : 'bg-[#1e1e1e] border border-white/5 text-gray-200 rounded-bl-md'
          )}
        >
          {message.isStreaming ? (
            <StreamingDots />
          ) : (
            <p className="whitespace-pre-wrap break-words">
              {message.content}
            </p>
          )}
        </div>

        {/* Timestamp tooltip */}
        <motion.div
          initial={false}
          animate={{
            opacity: showTimestamp ? 1 : 0,
            y: showTimestamp ? 0 : 4,
          }}
          transition={{ duration: 0.15 }}
          className={cn(
            'absolute -bottom-6 text-[10px] text-gray-500 pointer-events-none whitespace-nowrap',
            isUser ? 'right-1' : 'left-1'
          )}
        >
          {formatTimestamp(
            message.timestamp instanceof Date
              ? message.timestamp
              : new Date(message.timestamp)
          )}
        </motion.div>
      </div>
    </motion.div>
  );
}
