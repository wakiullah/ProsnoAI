'use client';

import React, { useRef } from 'react';
import { ImagePlus, Table2, Trash2, Plus, Minus } from 'lucide-react';
import { StimulusImageConfig, StimulusTableConfig } from 'proshno-shared';

interface StimulusMediaEditorProps {
  image?: StimulusImageConfig;
  table?: StimulusTableConfig;
  onChangeImage: (img?: StimulusImageConfig) => void;
  onChangeTable: (tbl?: StimulusTableConfig) => void;
}

function compressImageToDataUrl(file: File, maxWidth = 900): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onerror = () => reject(new Error('Failed to read image'));
    reader.onload = () => {
      const dataUrl = String(reader.result || '');
      if (file.type === 'image/svg+xml') {
        resolve(dataUrl);
        return;
      }
      const img = new Image();
      img.onload = () => {
        if (img.width <= maxWidth) {
          resolve(dataUrl);
          return;
        }
        const scale = maxWidth / img.width;
        const canvas = document.createElement('canvas');
        canvas.width = maxWidth;
        canvas.height = Math.round(img.height * scale);
        const ctx = canvas.getContext('2d');
        if (!ctx) {
          resolve(dataUrl);
          return;
        }
        ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
        const outType = file.type === 'image/png' ? 'image/png' : 'image/jpeg';
        resolve(canvas.toDataURL(outType, 0.85));
      };
      img.onerror = () => resolve(dataUrl);
      img.src = dataUrl;
    };
    reader.readAsDataURL(file);
  });
}

export const StimulusMediaEditor: React.FC<StimulusMediaEditorProps> = ({
  image,
  table,
  onChangeImage,
  onChangeTable,
}) => {
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    try {
      const url = await compressImageToDataUrl(file);
      onChangeImage({
        url,
        widthPct: image?.widthPct ?? 55,
        caption: image?.caption ?? 'চিত্র: ১',
      });
    } catch {
      // ignore
    } finally {
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  };

  const handleAddTable = () => {
    onChangeTable({
      headers: ['শ্রেণিব্যাপ্তি', '৪১–৫০', '৫১–৬০', '৬১–৭০', '৭১–৮০'],
      rows: [['গণসংখ্যা', '৫', '১২', '১৫', '৮']],
    });
  };

  const updateHeader = (colIdx: number, val: string) => {
    if (!table) return;
    const headers = [...(table.headers || [])];
    headers[colIdx] = val;
    onChangeTable({ ...table, headers });
  };

  const updateCell = (rIdx: number, cIdx: number, val: string) => {
    if (!table) return;
    const rows = table.rows.map((r, i) =>
      i === rIdx ? r.map((c, j) => (j === cIdx ? val : c)) : r
    );
    onChangeTable({ ...table, rows });
  };

  const addRow = () => {
    if (!table) return;
    const colCount = table.headers?.length || table.rows[0]?.length || 3;
    onChangeTable({ ...table, rows: [...table.rows, Array(colCount).fill('')] });
  };

  const removeRow = () => {
    if (!table || table.rows.length <= 1) return;
    onChangeTable({ ...table, rows: table.rows.slice(0, -1) });
  };

  const addCol = () => {
    if (!table) return;
    const headers = table.headers ? [...table.headers, 'কলাম'] : undefined;
    const rows = table.rows.map((r) => [...r, '']);
    onChangeTable({ ...table, headers, rows });
  };

  const removeCol = () => {
    if (!table) return;
    const colCount = table.headers?.length || table.rows[0]?.length || 0;
    if (colCount <= 2) return;
    const headers = table.headers ? table.headers.slice(0, -1) : undefined;
    const rows = table.rows.map((r) => r.slice(0, -1));
    onChangeTable({ ...table, headers, rows });
  };

  return (
    <div className="space-y-1.5">
      <div className="flex flex-wrap items-center gap-1.5">
        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          onChange={handleFileChange}
          className="hidden"
        />
        <button
          type="button"
          onClick={() => fileInputRef.current?.click()}
          className="inline-flex items-center gap-1 px-2 py-0.5 text-[11px] font-semibold rounded-md border border-sky-200 bg-sky-50 hover:bg-sky-100 text-sky-800 transition"
        >
          <ImagePlus className="w-3 h-3" />
          {image ? 'চিত্র বদলান' : '+ চিত্র'}
        </button>

        {!table ? (
          <button
            type="button"
            onClick={handleAddTable}
            className="inline-flex items-center gap-1 px-2 py-0.5 text-[11px] font-semibold rounded-md border border-amber-200 bg-amber-50 hover:bg-amber-100 text-amber-800 transition"
          >
            <Table2 className="w-3 h-3" />
            + সারণি
          </button>
        ) : (
          <button
            type="button"
            onClick={() => onChangeTable(undefined)}
            className="inline-flex items-center gap-1 px-2 py-0.5 text-[11px] font-semibold rounded-md border border-rose-200 bg-rose-50 text-rose-700"
          >
            <Trash2 className="w-3 h-3" />
            সারণি মুছুন
          </button>
        )}
      </div>

      {image && (
        <div className="p-2 rounded-lg border border-sky-200 bg-sky-50/40 space-y-1.5">
          <div className="flex flex-wrap items-center gap-1.5">
            <input
              type="text"
              value={image.caption || ''}
              onChange={(e) => onChangeImage({ ...image, caption: e.target.value })}
              placeholder="ক্যাপশন (যেমন: চিত্র: ১)"
              className="flex-1 min-w-[120px] text-xs px-2 py-0.5 rounded border border-slate-200 bg-white outline-none"
            />
            <div className="flex items-center gap-1">
              <span className="text-[10px] font-semibold text-slate-600">{image.widthPct ?? 55}%</span>
              <input
                type="range"
                min={25}
                max={100}
                step={5}
                value={image.widthPct ?? 55}
                onChange={(e) => onChangeImage({ ...image, widthPct: Number(e.target.value) })}
                className="w-16 accent-sky-600"
              />
            </div>
            <button
              type="button"
              onClick={() => onChangeImage(undefined)}
              className="p-1 text-rose-600 hover:bg-rose-100 rounded"
              title="চিত্র মুছুন"
            >
              <Trash2 className="w-3.5 h-3.5" />
            </button>
          </div>
          <div className="flex flex-col items-center bg-white rounded p-1.5 border border-slate-200">
            <img
              src={image.url}
              alt={image.caption || 'Stimulus'}
              style={{ width: `${image.widthPct ?? 55}%` }}
              className="max-h-32 object-contain"
            />
          </div>
        </div>
      )}

      {table && (
        <div className="p-2 rounded-lg border border-amber-200 bg-amber-50/30 space-y-1.5">
          <div className="flex items-center justify-between gap-1 text-[10px]">
            <span className="font-bold text-amber-900">সারণি</span>
            <div className="flex items-center gap-1">
              <button type="button" onClick={addRow} className="px-1.5 py-0.5 bg-white border border-slate-300 rounded font-semibold inline-flex items-center gap-0.5">
                <Plus className="w-2.5 h-2.5" /> সারি
              </button>
              <button type="button" onClick={removeRow} disabled={table.rows.length <= 1} className="px-1.5 py-0.5 bg-white border border-slate-300 rounded disabled:opacity-40 font-semibold inline-flex items-center gap-0.5">
                <Minus className="w-2.5 h-2.5" /> সারি
              </button>
              <button type="button" onClick={addCol} className="px-1.5 py-0.5 bg-white border border-slate-300 rounded font-semibold inline-flex items-center gap-0.5">
                <Plus className="w-2.5 h-2.5" /> কলাম
              </button>
              <button type="button" onClick={removeCol} className="px-1.5 py-0.5 bg-white border border-slate-300 rounded font-semibold inline-flex items-center gap-0.5">
                <Minus className="w-2.5 h-2.5" /> কলাম
              </button>
            </div>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full border-collapse border border-slate-300 text-xs bg-white">
              {table.headers && (
                <thead>
                  <tr className="bg-slate-100">
                    {table.headers.map((h, cIdx) => (
                      <th key={cIdx} className="border border-slate-300 p-0.5">
                        <input
                          type="text"
                          value={h}
                          onChange={(e) => updateHeader(cIdx, e.target.value)}
                          className="w-full min-w-[44px] text-center font-bold bg-transparent outline-none px-0.5 py-0.5 text-[11px]"
                        />
                      </th>
                    ))}
                  </tr>
                </thead>
              )}
              <tbody>
                {table.rows.map((row, rIdx) => (
                  <tr key={rIdx}>
                    {row.map((cell, cIdx) => (
                      <td key={cIdx} className="border border-slate-300 p-0.5">
                        <input
                          type="text"
                          value={cell}
                          onChange={(e) => updateCell(rIdx, cIdx, e.target.value)}
                          className="w-full min-w-[44px] text-center bg-transparent outline-none px-0.5 py-0.5 text-[11px]"
                        />
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
};
