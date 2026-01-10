import React, { useState } from 'react';
import { Upload, Check } from 'lucide-react';
import { updateBoard } from '../../services/boardApi';
import api from '../../services/api';

const COLORS = [
  '#F8FAFC', 
  '#E11D48', 
  '#2563EB', 
  '#16A34A', 
  '#D97706', 
  '#7C3AED',
  '#0F172A', 
  '#334155', 
  '#0891B2', 
  '#DB2777', 
  '#b727dbff', 
  '#27bddbff', 
];
const PRESETS = Array.from({ length: 27 }, (_, i) => {
  const fileName = `bg-${String(i + 1).padStart(2, '0')}.jpg`;
  return {
    thumbnail: `/images/background/thumbnails/${fileName}`,
    full: `/images/background/${fileName}`,
  };
});

const BackgroundPicker = ({boardId, currentBackground, onUpdateBackground, onClose }) => {
  const handleApply = async (value) => { 
    onUpdateBackground(value);
    try {
      await updateBoard(boardId, { background: value }); 
    } catch (err) { 
      console.error(err); 
    }
  };

  return (
  <>
    {/* Overlay */}
    <div
      className="fixed inset-0 z-40 bg-black/20 sm:hidden"
      onClick={onClose}

    />

    <div className="fixed z-[9999] top-16 right-6 w-[320px] bg-white rounded-xl max-h-[calc(100vh-6rem)] flex flex-col">

      {/* Header */}
        <div className="p-4 border-b flex justify-between items-center sticky top-0 bg-white z-10">
          <h3 className="text-sm font-bold">Giao diện bảng</h3>

          <button
            className="sm:hidden text-gray-400"
            onClick={onClose}
          >
            ✕
          </button>
        </div>

      {/* Content */}
      <div className="overflow-y-auto p-4 space-y-6 custom-scrollbar">
        
        {/* Màu sắc */}
        <section>
          <p className="text-[10px] uppercase font-bold tracking-widest text-gray-400 mb-3 sticky top-0 bg-white dark:bg-gray-800">
            Màu sắc
          </p>

          <div className="grid grid-cols-5 sm:grid-cols-6 gap-3">
            {COLORS.map(c => (
              <button
                key={c}
                onClick={() => handleApply(c)}
                className={`
                  h-10 rounded-lg border transition-all
                  ${currentBackground === c
                    ? 'ring-2 ring-blue-500 ring-offset-2 dark:ring-offset-gray-800'
                    : 'border-black/5 dark:border-white/10'}
                  active:scale-95
                `}
                style={{ backgroundColor: c }}
              />
            ))}
          </div>
        </section>

        {/* Hình nền */}
        <section>
          <p className="text-[10px] uppercase font-bold tracking-widest text-gray-400 mb-3 sticky top-0 bg-white dark:bg-gray-800">
            Hình nền
          </p>

          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
            {PRESETS.map((preset) => (
              <div key={preset.full} className="relative aspect-video">
                <img
                  src={preset.thumbnail}
                  onClick={() => handleApply(preset.full)}                
                  loading="lazy"
                  alt="Background preset"
                  className={`
                    w-full h-full object-cover rounded-lg cursor-pointer
                    transition-all active:scale-95
                    ${currentBackground === preset.full
                      ? 'ring-2 ring-blue-500 ring-offset-2'
                      : 'hover:brightness-90'}
                  `}
                />

                {currentBackground === preset.full && (
                  <div className="absolute inset-0 bg-black/20 flex items-center justify-center rounded-lg">
                    <div className="bg-blue-500 p-1 rounded-full">
                      <Check size={14} className="text-white" />
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        </section>
      </div>
    </div>
  </>
);
};

export default BackgroundPicker;