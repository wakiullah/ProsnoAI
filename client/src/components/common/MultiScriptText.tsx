'use client';

import React, { useMemo } from 'react';
import katex from 'katex';
import { parseMultiScript } from 'proshno-shared';

interface MultiScriptTextProps {
  text?: string | null;
  className?: string;
  as?: 'span' | 'div' | 'p' | 'h1' | 'h2' | 'h3' | 'h4';
}

type Segment =
  | { kind: 'math'; latex: string; displayMode: boolean }
  | { kind: 'text'; underlined: boolean; tokens: ReturnType<typeof parseMultiScript> };

/**
 * Splits text into math segments ($$...$$ or $...$) and multi-script text segments
 * (preserving <u>...</u> underline markup and BiDi isolation for Bengali/Arabic/English).
 */
function parseRichSegments(input: string): Segment[] {
  const result: Segment[] = [];
  // Match $$...$$ (display math) or $...$ (inline math, non-empty, no leading/trailing space mismatch)
  const mathRegex = /(\$\$[\s\S]+?\$\$|\$(?!\s)(?:\\.|[^$\n])+?(?<!\s)\$)/g;
  let lastIndex = 0;
  let match: RegExpExecArray | null;

  const pushTextChunk = (chunk: string) => {
    if (!chunk) return;
    const parts = chunk.split(/(<u>[\s\S]*?<\/u>)/gi);
    parts.forEach((part) => {
      if (!part) return;
      const uMatch = part.match(/^<u>([\s\S]*?)<\/u>$/i);
      if (uMatch) {
        result.push({
          kind: 'text',
          underlined: true,
          tokens: parseMultiScript(uMatch[1]),
        });
      } else {
        result.push({
          kind: 'text',
          underlined: false,
          tokens: parseMultiScript(part),
        });
      }
    });
  };

  while ((match = mathRegex.exec(input)) !== null) {
    if (match.index > lastIndex) {
      pushTextChunk(input.slice(lastIndex, match.index));
    }
    const raw = match[0];
    if (raw.startsWith('$$') && raw.endsWith('$$')) {
      result.push({
        kind: 'math',
        latex: raw.slice(2, -2).trim(),
        displayMode: true,
      });
    } else {
      result.push({
        kind: 'math',
        latex: raw.slice(1, -1),
        displayMode: false,
      });
    }
    lastIndex = match.index + raw.length;
  }

  if (lastIndex < input.length) {
    pushTextChunk(input.slice(lastIndex));
  }

  return result;
}

export const MultiScriptText: React.FC<MultiScriptTextProps> = ({
  text,
  className = '',
  as: Component = 'span',
}) => {
  const segments = useMemo(() => {
    if (!text) return [];
    return parseRichSegments(text);
  }, [text]);

  if (!text) return null;

  return (
    <Component className={className}>
      {segments.map((seg, sIdx) => {
        if (seg.kind === 'math') {
          let html = '';
          try {
            html = katex.renderToString(seg.latex, {
              displayMode: seg.displayMode,
              throwOnError: false,
              strict: false,
            });
          } catch {
            html = seg.latex;
          }
          if (seg.displayMode) {
            return (
              <span
                key={`m-${sIdx}`}
                className="block my-1 text-center"
                dir="ltr"
                style={{ unicodeBidi: 'isolate' }}
                dangerouslySetInnerHTML={{ __html: html }}
              />
            );
          }
          return (
            <span
              key={`m-${sIdx}`}
              className="inline-block align-baseline mx-[1px]"
              dir="ltr"
              style={{ unicodeBidi: 'isolate' }}
              dangerouslySetInnerHTML={{ __html: html }}
            />
          );
        }

        const inner = seg.tokens.map((token, idx) => (
          <span
            key={`${sIdx}-${idx}-${token.script}`}
            className={token.className}
            dir={token.dir}
            style={{ unicodeBidi: 'isolate' }}
          >
            {token.text}
          </span>
        ));

        if (seg.underlined) {
          return (
            <u
              key={`u-${sIdx}`}
              style={{ textUnderlineOffset: '3px', textDecorationThickness: '1.2px' }}
            >
              {inner}
            </u>
          );
        }

        return <React.Fragment key={`seg-${sIdx}`}>{inner}</React.Fragment>;
      })}
    </Component>
  );
};
