'use client';

import React, { useMemo } from 'react';
import { parseMultiScript } from 'proshno-shared';

interface MultiScriptTextProps {
  text?: string | null;
  className?: string;
  as?: 'span' | 'div' | 'p' | 'h1' | 'h2' | 'h3' | 'h4';
}

export const MultiScriptText: React.FC<MultiScriptTextProps> = ({
  text,
  className = '',
  as: Component = 'span',
}) => {
  const segments = useMemo(() => {
    if (!text) return [];
    const parts = text.split(/(<u>[\s\S]*?<\/u>)/gi);
    return parts
      .filter((p) => p.length > 0)
      .map((part) => {
        const match = part.match(/^<u>([\s\S]*?)<\/u>$/i);
        if (match) {
          return {
            underlined: true,
            tokens: parseMultiScript(match[1]),
          };
        }
        return {
          underlined: false,
          tokens: parseMultiScript(part),
        };
      });
  }, [text]);

  if (!text) return null;

  return (
    <Component className={className}>
      {segments.map((seg, sIdx) => {
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
