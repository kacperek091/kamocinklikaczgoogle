import { useState } from 'react';
import { ANDROID_KOTLIN_CODE } from '../data/androidKotlinCode';
import { Copy, Check, X, FileCode, Smartphone } from 'lucide-react';

interface AndroidCodeModalProps {
  onClose: () => void;
}

export function AndroidCodeModal({ onClose }: AndroidCodeModalProps) {
  const [copied, setCopied] = useState<boolean>(false);

  const handleCopy = () => {
    navigator.clipboard.writeText(ANDROID_KOTLIN_CODE);
    setCopied(true);
    setTimeout(() => setCopied(false), 2500);
  };

  return (
    <div className="fixed inset-0 bg-slate-900/80 backdrop-blur-md z-50 flex items-center justify-center p-3 sm:p-6 select-none">
      <div className="bg-white border-2 border-emerald-300 rounded-3xl max-w-4xl w-full h-[88vh] shadow-2xl flex flex-col overflow-hidden">
        {/* Modal Header */}
        <div className="bg-gradient-to-r from-emerald-600 to-green-600 text-white px-4 py-3 flex items-center justify-between shadow-md">
          <div className="flex items-center gap-2">
            <span className="p-2 bg-white/20 text-white rounded-xl backdrop-blur-sm">
              <Smartphone size={20} />
            </span>
            <div>
              <h3 className="font-black text-sm sm:text-base text-white flex items-center gap-2">
                <span>MainActivity.kt</span>
                <span className="text-[10px] bg-white/25 text-white px-2 py-0.5 rounded-full font-sans font-semibold">
                  Kotlin + Jetpack Compose
                </span>
              </h3>
              <p className="text-[11px] text-emerald-100">
                Kompletny, 100% działający plik dla Android Studio (package com.example.kamocinclicker)
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handleCopy}
              className="px-3.5 py-1.5 bg-amber-400 hover:bg-amber-300 text-slate-900 font-extrabold text-xs rounded-xl shadow-md transition flex items-center gap-1.5 cursor-pointer active:scale-95"
            >
              {copied ? <Check size={14} className="text-emerald-700" /> : <Copy size={14} />}
              <span>{copied ? 'Skopiowano!' : 'Skopiuj kod'}</span>
            </button>

            <button
              onClick={onClose}
              className="p-1.5 text-white/80 hover:text-white rounded-lg bg-white/10 hover:bg-white/20 cursor-pointer transition"
            >
              <X size={18} />
            </button>
          </div>
        </div>

        {/* Code Content Box */}
        <div className="flex-1 bg-slate-950 p-4 overflow-y-auto font-mono text-[11px] sm:text-xs text-emerald-300 leading-relaxed select-text">
          <pre className="whitespace-pre">{ANDROID_KOTLIN_CODE}</pre>
        </div>

        {/* Footer info */}
        <div className="bg-slate-100 border-t border-slate-200 px-4 py-2.5 flex items-center justify-between text-xs text-slate-600">
          <div className="flex items-center gap-2">
            <FileCode size={14} className="text-emerald-600" />
            <span>Plik zapisany w katalogu głównym: <code className="text-emerald-800 font-bold">/MainActivity.kt</code></span>
          </div>
          <span className="text-[11px] font-bold text-emerald-700">Gotowy do wklejenia w Android Studio</span>
        </div>
      </div>
    </div>
  );
}
