import React from 'react';

/**
 * Clean, safe, production-grade Markdown renderer for Marine AI chat, voice assistant, and advisories.
 * Properly renders:
 * - Bold (**text** or __text__)
 * - Italic (*text* or _text_)
 * - Bold + Italic (***text***)
 * - Inline code (`code`)
 * - Code blocks (```lang ... ```)
 * - Headings (# H1, ## H2, ### H3, #### H4)
 * - Bullet lists (- item, * item, • item)
 * - Numbered lists (1. item, 2. item)
 * - Blockquotes (> quote)
 * - Links ([text](url))
 *
 * Guaranteed White Text for User messages (isUser=true):
 * Employs direct inline style={{ color: '#FFFFFF' }} on every text element
 * to completely eliminate any CSS cascade / prose / theme inheritance issues.
 */
export function renderFormattedMarkdown(text, isUser = false) {
  if (!text || typeof text !== 'string') return null;

  // Split multi-line code blocks first
  const segments = text.split(/(```[\s\S]*?```)/g);

  return segments.map((segment, segIdx) => {
    // Check if this segment is a fenced code block
    if (segment.startsWith('```') && segment.endsWith('```')) {
      const firstNewline = segment.indexOf('\n');
      const lang = firstNewline !== -1 ? segment.slice(3, firstNewline).trim() : '';
      const code = firstNewline !== -1 ? segment.slice(firstNewline + 1, -3) : segment.slice(3, -3);
      return (
        <div 
          key={`code-block-${segIdx}`} 
          className={`my-2 rounded-xl p-3 font-mono text-[11px] overflow-x-auto shadow-sm border ${
            isUser ? 'bg-white/10 text-white border-white/20' : 'bg-slate-900 text-slate-100 border-slate-800'
          }`}
        >
          {lang && (
            <div className={`text-[9px] uppercase tracking-wider font-bold mb-1.5 pb-1 border-b ${
              isUser ? 'text-sky-200 border-white/20' : 'text-slate-400 border-slate-800'
            }`}>
              {lang}
            </div>
          )}
          <pre className="whitespace-pre" style={isUser ? { color: '#FFFFFF' } : undefined}>{code.trim()}</pre>
        </div>
      );
    }

    // Process regular text line by line
    const lines = segment.split('\n');

    return (
      <div key={`seg-${segIdx}`} className="space-y-1">
        {lines.map((line, lineIdx) => {
          const trimmed = line.trim();

          // Empty line -> vertical spacer
          if (!trimmed) {
            return <div key={`spacer-${lineIdx}`} className="h-1.5" />;
          }

          // Headers
          if (trimmed.startsWith('#### ')) {
            return (
              <h5 
                key={`h4-${lineIdx}`} 
                className={`text-xs font-bold mt-2 mb-0.5 tracking-tight ${isUser ? 'text-white' : 'text-slate-900'}`}
                style={isUser ? { color: '#FFFFFF' } : undefined}
              >
                {renderInlineFormatted(trimmed.slice(5), isUser)}
              </h5>
            );
          }
          if (trimmed.startsWith('### ')) {
            return (
              <h4 
                key={`h3-${lineIdx}`} 
                className={`text-xs sm:text-sm font-bold mt-2.5 mb-1 tracking-tight flex items-center gap-1.5 border-b pb-0.5 ${
                  isUser ? 'text-white border-white/20' : 'text-slate-900 border-slate-100'
                }`}
                style={isUser ? { color: '#FFFFFF' } : undefined}
              >
                {renderInlineFormatted(trimmed.slice(4), isUser)}
              </h4>
            );
          }
          if (trimmed.startsWith('## ')) {
            return (
              <h3 
                key={`h2-${lineIdx}`} 
                className={`text-sm font-extrabold mt-3 mb-1.5 tracking-tight ${isUser ? 'text-white' : 'text-[#0B1E36]'}`}
                style={isUser ? { color: '#FFFFFF' } : undefined}
              >
                {renderInlineFormatted(trimmed.slice(3), isUser)}
              </h3>
            );
          }
          if (trimmed.startsWith('# ')) {
            return (
              <h2 
                key={`h1-${lineIdx}`} 
                className={`text-base font-extrabold mt-3 mb-1.5 ${isUser ? 'text-white' : 'text-[#0B1E36]'}`}
                style={isUser ? { color: '#FFFFFF' } : undefined}
              >
                {renderInlineFormatted(trimmed.slice(2), isUser)}
              </h2>
            );
          }

          // Blockquote
          if (trimmed.startsWith('> ')) {
            return (
              <div 
                key={`quote-${lineIdx}`} 
                className={`border-l-3 pl-3 py-1 my-1.5 rounded-r-lg italic text-xs ${
                  isUser ? 'border-sky-300 bg-white/10 text-white' : 'border-[#1D63ED] bg-blue-50/50 text-slate-700'
                }`}
                style={isUser ? { color: '#FFFFFF' } : undefined}
              >
                {renderInlineFormatted(trimmed.slice(2), isUser)}
              </div>
            );
          }

          // Unordered Bullet list
          if (/^([•\-\*]|\d+\))\s/.test(trimmed)) {
            const isBullet = /^[•\-\*]\s/.test(trimmed);
            const content = isBullet ? trimmed.replace(/^[•\-\*]\s+/, '') : trimmed.replace(/^\d+[\.\)]\s+/, '');
            const prefix = isBullet ? '•' : trimmed.match(/^\d+[\.\)]/)?.[0] || '•';

            return (
              <div 
                key={`bullet-${lineIdx}`} 
                className={`text-xs leading-relaxed py-0.5 flex items-start gap-2 pl-1 ${isUser ? 'text-white' : 'text-slate-800'}`}
                style={isUser ? { color: '#FFFFFF' } : undefined}
              >
                <span className={`font-bold shrink-0 mt-0.5 select-none text-[11px] ${isUser ? 'text-sky-300' : 'text-[#1D63ED]'}`}>
                  {prefix}
                </span>
                <span className="flex-1" style={isUser ? { color: '#FFFFFF' } : undefined}>
                  {renderInlineFormatted(content, isUser)}
                </span>
              </div>
            );
          }

          // Numbered list: 1. , 2.
          if (/^\d+\.\s/.test(trimmed)) {
            const num = trimmed.match(/^(\d+)\.\s/)?.[1] || '1';
            const content = trimmed.replace(/^\d+\.\s+/, '');
            return (
              <div 
                key={`num-${lineIdx}`} 
                className={`text-xs leading-relaxed py-0.5 flex items-start gap-2 pl-1 ${isUser ? 'text-white' : 'text-slate-800'}`}
                style={isUser ? { color: '#FFFFFF' } : undefined}
              >
                <span className={`text-xs font-mono font-bold shrink-0 mt-0.5 ${isUser ? 'text-sky-300' : 'text-[#1D63ED]'}`}>
                  {num}.
                </span>
                <span className="flex-1" style={isUser ? { color: '#FFFFFF' } : undefined}>
                  {renderInlineFormatted(content, isUser)}
                </span>
              </div>
            );
          }

          // Standard paragraph
          return (
            <p 
              key={`p-${lineIdx}`} 
              className={`text-xs sm:text-[13px] leading-relaxed my-0.5 ${
                isUser ? 'text-white font-normal' : 'text-slate-800'
              }`}
              style={isUser ? { color: '#FFFFFF' } : undefined}
            >
              {renderInlineFormatted(line, isUser)}
            </p>
          );
        })}
      </div>
    );
  });
}

/**
 * Safely parses inline markdown tokens:
 * - Bold + Italic (***text***)
 * - Bold (**text** or __text__)
 * - Italic (*text* or _text_)
 * - Inline code (`text`)
 * - Links ([label](url))
 */
function renderInlineFormatted(str, isUser = false) {
  if (!str) return null;

  // Regex to split on: links, ***bold italic***, **bold**, __bold__, `code`, *italic*, _italic_
  const tokenRegex = /(\[[^\]]+?\]\([^\)]+?\)|(?:\*\*\*[\s\S]+?\*\*\*|\*\*[\s\S]+?\*\*|__[\s\S]+?__|`[^`]+?`|\*[^\*]+?\*|_[^_]+?_))/g;
  const parts = str.split(tokenRegex);

  return parts.map((part, i) => {
    if (!part) return null;

    // Link: [label](url)
    const linkMatch = part.match(/^\[([^\]]+)\]\(([^\)]+)\)$/);
    if (linkMatch) {
      const [, label, url] = linkMatch;
      return (
        <a 
          key={i} 
          href={url} 
          target="_blank" 
          rel="noopener noreferrer" 
          className={`underline font-semibold transition ${
            isUser ? 'text-sky-300 hover:text-white' : 'text-blue-600 hover:text-blue-800'
          }`}
          style={isUser ? { color: '#7DD3FC' } : undefined}
        >
          {label}
        </a>
      );
    }

    // Bold + Italic: ***text***
    if (part.startsWith('***') && part.endsWith('***') && part.length >= 6) {
      return (
        <strong 
          key={i} 
          className={`font-bold italic ${isUser ? 'text-white' : 'text-slate-900'}`}
          style={isUser ? { color: '#FFFFFF' } : undefined}
        >
          {part.slice(3, -3)}
        </strong>
      );
    }

    // Bold: **text**
    if (part.startsWith('**') && part.endsWith('**') && part.length >= 4) {
      return (
        <strong 
          key={i} 
          className={`font-bold ${isUser ? 'text-white font-extrabold' : 'text-[#0B1E36]'}`}
          style={isUser ? { color: '#FFFFFF' } : undefined}
        >
          {part.slice(2, -2)}
        </strong>
      );
    }

    // Bold: __text__
    if (part.startsWith('__') && part.endsWith('__') && part.length >= 4) {
      return (
        <strong 
          key={i} 
          className={`font-bold ${isUser ? 'text-white font-extrabold' : 'text-[#0B1E36]'}`}
          style={isUser ? { color: '#FFFFFF' } : undefined}
        >
          {part.slice(2, -2)}
        </strong>
      );
    }

    // Inline code: `text`
    if (part.startsWith('`') && part.endsWith('`') && part.length >= 2) {
      return (
        <code 
          key={i} 
          className={`px-1.5 py-0.5 rounded-md font-mono text-[11px] font-semibold ${
            isUser ? 'bg-white/20 text-white border border-white/20' : 'bg-blue-50 border border-blue-200/70 text-[#0284C7]'
          }`}
          style={isUser ? { color: '#FFFFFF' } : undefined}
        >
          {part.slice(1, -1)}
        </code>
      );
    }

    // Italic: *text* (excluding single asterisks)
    if (part.startsWith('*') && part.endsWith('*') && part.length >= 2 && !part.slice(1, -1).includes('*')) {
      return (
        <em 
          key={i} 
          className={`italic ${isUser ? 'text-sky-100' : 'text-slate-700'}`}
          style={isUser ? { color: '#E0F2FE' } : undefined}
        >
          {part.slice(1, -1)}
        </em>
      );
    }

    // Italic: _text_
    if (part.startsWith('_') && part.endsWith('_') && part.length >= 2 && !part.slice(1, -1).includes('_')) {
      return (
        <em 
          key={i} 
          className={`italic ${isUser ? 'text-sky-100' : 'text-slate-700'}`}
          style={isUser ? { color: '#E0F2FE' } : undefined}
        >
          {part.slice(1, -1)}
        </em>
      );
    }

    // Clean any stray unmatched asterisks that might slip through
    const cleaned = part.replace(/\*\*/g, '').replace(/(^|\s)\*(\s|$)/g, '$1•$2');

    return (
      <span key={i} style={isUser ? { color: '#FFFFFF' } : undefined}>
        {cleaned}
      </span>
    );
  });
}

export default renderFormattedMarkdown;
