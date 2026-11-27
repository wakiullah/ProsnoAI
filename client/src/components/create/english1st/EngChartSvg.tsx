'use client';

import React from 'react';
import { EngChartData } from './english1stDefaults';

interface EngChartSvgProps {
  data: EngChartData;
}

export const EngChartSvg: React.FC<EngChartSvgProps> = ({ data }) => {
  const items = (data.items || []).filter((it) => it.label.trim() && Number(it.value) > 0);
  if (items.length === 0) return null;

  const unit = data.unit ?? '%';

  if (data.chartType === 'bar') {
    const maxVal = Math.max(...items.map((i) => Number(i.value) || 0), 1);
    const barWidth = 36;
    const gap = 22;
    const padLeft = 36;
    const padBottom = 34;
    const padTop = 20;
    const chartH = 120;
    const width = Math.max(260, padLeft + items.length * (barWidth + gap) + 20);
    const height = padTop + chartH + padBottom;

    return (
      <div className="flex justify-center my-2">
        <svg
          width={width}
          height={height}
          viewBox={`0 0 ${width} ${height}`}
          className="max-w-full h-auto font-serif"
        >
          {/* Axes */}
          <line
            x1={padLeft}
            y1={padTop}
            x2={padLeft}
            y2={padTop + chartH}
            stroke="#1e293b"
            strokeWidth="1.3"
          />
          <line
            x1={padLeft}
            y1={padTop + chartH}
            x2={width - 10}
            y2={padTop + chartH}
            stroke="#1e293b"
            strokeWidth="1.3"
          />
          {items.map((it, idx) => {
            const h = Math.round(((Number(it.value) || 0) / maxVal) * (chartH - 8));
            const x = padLeft + 14 + idx * (barWidth + gap);
            const y = padTop + chartH - h;
            return (
              <g key={idx}>
                <rect
                  x={x}
                  y={y}
                  width={barWidth}
                  height={h}
                  fill="#e2e8f0"
                  stroke="#1e293b"
                  strokeWidth="1.2"
                />
                <text
                  x={x + barWidth / 2}
                  y={y - 4}
                  textAnchor="middle"
                  fontSize="10"
                  fontWeight="700"
                  fill="#0f172a"
                >
                  {it.value}
                  {unit}
                </text>
                <text
                  x={x + barWidth / 2}
                  y={padTop + chartH + 14}
                  textAnchor="middle"
                  fontSize="10"
                  fill="#0f172a"
                >
                  {it.label}
                </text>
              </g>
            );
          })}
        </svg>
      </div>
    );
  }

  // Board-exam style clean monochrome Pie Chart with callout labels
  const total = items.reduce((s, i) => s + (Number(i.value) || 0), 0) || 1;
  const cx = 180;
  const cy = 92;
  const r = 64;
  let currentAngle = -Math.PI / 2;

  return (
    <div className="flex justify-center my-2">
      <svg width="360" height="190" viewBox="0 0 360 190" className="max-w-full h-auto font-serif">
        <circle cx={cx} cy={cy} r={r} fill="#ffffff" stroke="#0f172a" strokeWidth="1.4" />
        {items.map((it, idx) => {
          const val = Number(it.value) || 0;
          const sliceAngle = (val / total) * Math.PI * 2;
          const startAngle = currentAngle;
          const endAngle = currentAngle + sliceAngle;
          const midAngle = startAngle + sliceAngle / 2;
          currentAngle = endAngle;

          const x1 = cx + r * Math.cos(startAngle);
          const y1 = cy + r * Math.sin(startAngle);
          const x2 = cx + r * Math.cos(endAngle);
          const y2 = cy + r * Math.sin(endAngle);
          const largeArc = sliceAngle > Math.PI ? 1 : 0;

          const isLarge = sliceAngle >= Math.PI * 0.42;
          const innerR = r * 0.56;
          const outerLineStartR = r * 0.88;
          const outerLineEndR = r + 18;

          const lx = cx + innerR * Math.cos(midAngle);
          const ly = cy + innerR * Math.sin(midAngle);

          const ox1 = cx + outerLineStartR * Math.cos(midAngle);
          const oy1 = cy + outerLineStartR * Math.sin(midAngle);
          const ox2 = cx + outerLineEndR * Math.cos(midAngle);
          const oy2 = cy + outerLineEndR * Math.sin(midAngle);
          const onRight = Math.cos(midAngle) >= 0;

          return (
            <g key={idx}>
              <path
                d={`M ${cx} ${cy} L ${x1} ${y1} A ${r} ${r} 0 ${largeArc} 1 ${x2} ${y2} Z`}
                fill="#ffffff"
                stroke="#0f172a"
                strokeWidth="1.2"
              />
              {isLarge ? (
                <text x={lx} y={ly} textAnchor="middle" fontSize="9.5" fill="#0f172a">
                  <tspan x={lx} dy="-2" fontWeight="600">
                    {it.label}
                  </tspan>
                  <tspan x={lx} dy="11">
                    {val}
                    {unit}
                  </tspan>
                </text>
              ) : (
                <>
                  <line x1={ox1} y1={oy1} x2={ox2} y2={oy2} stroke="#0f172a" strokeWidth="0.9" />
                  <text
                    x={ox2 + (onRight ? 4 : -4)}
                    y={oy2}
                    textAnchor={onRight ? 'start' : 'end'}
                    fontSize="9.5"
                    fill="#0f172a"
                  >
                    <tspan x={ox2 + (onRight ? 4 : -4)} dy="-1" fontWeight="600">
                      {it.label}
                    </tspan>
                    <tspan x={ox2 + (onRight ? 4 : -4)} dy="11">
                      {val}
                      {unit}
                    </tspan>
                  </text>
                </>
              )}
            </g>
          );
        })}
      </svg>
    </div>
  );
};
