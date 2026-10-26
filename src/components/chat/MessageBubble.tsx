import React, { useState } from 'react';
import { motion } from 'framer-motion';
import type { ChatMessage } from '@/types';
import { cn, formatTimestamp } from '@/lib/utils';
import { ExternalLink } from 'lucide-react';

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

// Lightweight Markdown Renderer for clean links, bolding and lists
function FormattedContent({ content }: { content: string }) {
  const lines = content.split('\n');

  return (
    <div className="space-y-1.5 leading-relaxed">
      {lines.map((line, lineIdx) => {
        if (!line.trim()) {
          return <div key={lineIdx} className="h-2" />;
        }

        // Quote
        if (line.startsWith('> ')) {
          return (
            <div
              key={lineIdx}
              className="pl-3 border-l-2 border-[#d4a574]/60 text-xs italic text-white/70 py-0.5"
            >
              {renderInline(line.slice(2))}
            </div>
          );
        }

        // List item
        if (line.startsWith('• ') || line.startsWith('- ') || line.startsWith('* ')) {
          return (
            <div key={lineIdx} className="flex items-start gap-2 text-sm pl-1">
              <span className="text-[#d4a574] font-bold select-none">•</span>
              <span className="flex-1">{renderInline(line.slice(2))}</span>
            </div>
          );
        }

        return (
          <p key={lineIdx} className="text-sm">
            {renderInline(line)}
          </p>
        );
      })}
    </div>
  );
}

function renderInline(text: string): React.ReactNode {
  // Regex to match **bold**, [link](url), and `code`
  const regex = /(\*\*[^*]+\*\*|\[[^\]]+\]\([^)]+\)|`[^`]+`)/g;
  const parts = text.split(regex);

  return parts.map((part, i) => {
    if (part.startsWith('**') && part.endsWith('**')) {
      return (
        <strong key={i} className="font-bold text-white">
          {part.slice(2, -2)}
        </strong>
      );
    }

    if (part.startsWith('`') && part.endsWith('`')) {
      return (
        <code
          key={i}
          className="bg-black/40 text-[#d4a574] font-mono text-xs px-1.5 py-0.5 rounded border border-white/5"
        >
          {part.slice(1, -1)}
        </code>
      );
    }

    const linkMatch = part.match(/^\[([^\]]+)\]\(([^)]+)\)$/);
    if (linkMatch) {
      return (
        <a
          key={i}
          href={linkMatch[2]}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center gap-1 text-[#d4a574] hover:text-[#e0b88a] underline underline-offset-2 transition-colors font-medium"
        >
          <span>{linkMatch[1]}</span>
          <ExternalLink className="w-3 h-3 inline-block opacity-70" />
        </a>
      );
    }

    return part;
  });
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
      className={cn('flex w-full gap-3', isUser ? 'justify-end' : 'justify-start')}
      onMouseEnter={() => setShowTimestamp(true)}
      onMouseLeave={() => setShowTimestamp(false)}
    >
      {/* Assistant avatar */}
      {isAssistant && (
        <div className="flex-shrink-0 mt-1">
          <div className="flex h-8 w-8 items-center justify-center rounded-2xl bg-gradient-to-br from-[#d4a574] to-[#c9956b] shadow-md shadow-[#d4a574]/20 border border-[#d4a574]/30">
            <span className="text-xs font-bold text-[#121212] select-none">AI</span>
          </div>
        </div>
      )}

      {/* Message content wrapper */}
      <div
        className={cn('relative max-w-[85%] sm:max-w-[75%] group', isUser ? 'items-end' : 'items-start')}
      >
        {/* Bubble */}
        <div
          className={cn(
            'rounded-2xl px-4 py-3 text-sm leading-relaxed shadow-lg',
            isUser
              ? 'bg-gradient-to-br from-[#2a2218] to-[#1e1a14] border border-[#d4a574]/20 text-white rounded-br-md'
              : 'bg-[#181818] border border-white/10 text-gray-200 rounded-bl-md'
          )}
        >
          {message.isStreaming && !message.content ? (
            <StreamingDots />
          ) : (
            <FormattedContent content={message.content} />
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
