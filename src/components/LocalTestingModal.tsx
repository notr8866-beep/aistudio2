import React, { useState, useRef } from 'react';
import {
  Laptop,
  Terminal,
  Download,
  Upload,
  CheckCircle2,
  Copy,
  Check,
  X,
  Database,
  ExternalLink,
  ShieldCheck,
  FileCode2,
  Server
} from 'lucide-react';
import { storage } from '../utils/storage';

interface LocalTestingModalProps {
  isOpen: boolean;
  onClose: () => void;
  onDataRestored: () => void;
}

export const LocalTestingModal: React.FC<LocalTestingModalProps> = ({
  isOpen,
  onClose,
  onDataRestored,
}) => {
  const [copiedCmd, setCopiedCmd] = useState<string | null>(null);
  const [importStatus, setImportStatus] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  if (!isOpen) return null;

  const copyToClipboard = (text: string, id: string) => {
    navigator.clipboard.writeText(text);
    setCopiedCmd(id);
    setTimeout(() => setCopiedCmd(null), 2000);
  };

  const handleExportData = () => {
    const jsonStr = storage.exportBackup();
    const blob = new Blob([jsonStr], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `quotation-system-backup-${new Date().toISOString().slice(0, 10)}.json`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const content = event.target?.result as string;
      const success = storage.importBackup(content);
      if (success) {
        setImportStatus('備份資料匯入成功！已重新整理所有資料。');
        onDataRestored();
        setTimeout(() => setImportStatus(null), 4000);
      } else {
        setImportStatus('匯入失敗：檔案格式不正確，請確認是有效的 JSON 備份檔。');
        setTimeout(() => setImportStatus(null), 4000);
      }
    };
    reader.readAsText(file);
    // reset input
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl max-w-3xl w-full shadow-2xl border border-slate-200 overflow-hidden animate-in fade-in zoom-in-95 duration-200">
        {/* Header */}
        <div className="bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 text-white px-6 py-5 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-indigo-500/20 border border-indigo-400/30 flex items-center justify-center text-indigo-300">
              <Laptop className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-lg font-bold flex items-center gap-2">
                本地端 Vite 單機測試環境指南
                <span className="px-2 py-0.5 rounded-full text-[11px] font-semibold bg-emerald-500/20 text-emerald-300 border border-emerald-400/30">
                  純前端獨立離線架構
                </span>
              </h2>
              <p className="text-xs text-slate-300">
                本系統採 React 19 + Vite 6 + Tailwind CSS v4，可 100% 在個人電腦獨立運作
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-white p-1 rounded-lg hover:bg-white/10 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-6 space-y-6 max-h-[75vh] overflow-y-auto">
          {/* Status Alert if import executed */}
          {importStatus && (
            <div className="p-3.5 rounded-xl bg-indigo-50 border border-indigo-200 text-indigo-800 text-xs font-medium flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-indigo-600 shrink-0" />
              <span>{importStatus}</span>
            </div>
          )}

          {/* Quick Steps */}
          <div>
            <h3 className="text-sm font-bold text-slate-900 mb-3 flex items-center gap-2">
              <Terminal className="w-4 h-4 text-indigo-600" />
              單機 3 步驟快速啟動
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
              <div className="bg-slate-50 border border-slate-200 rounded-xl p-3.5">
                <div className="text-xs font-bold text-indigo-600 mb-1">步驟 1. 取得專案代碼</div>
                <p className="text-xs text-slate-600 leading-relaxed">
                  點擊 AI Studio 右上方選單或透過 GitHub 下載專案 ZIP 檔並解壓縮至本機資料夾。
                </p>
              </div>

              <div className="bg-slate-50 border border-slate-200 rounded-xl p-3.5">
                <div className="text-xs font-bold text-indigo-600 mb-1">步驟 2. 安裝相依套件</div>
                <div className="flex items-center justify-between bg-slate-900 text-slate-100 rounded-md px-2.5 py-1.5 font-mono text-[11px] my-1">
                  <code>npm install</code>
                  <button
                    onClick={() => copyToClipboard('npm install', 'cmd-install')}
                    className="text-slate-400 hover:text-white"
                  >
                    {copiedCmd === 'cmd-install' ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                  </button>
                </div>
                <p className="text-[11px] text-slate-500">電腦需安裝 Node.js 18+ (LTS)</p>
              </div>

              <div className="bg-slate-50 border border-slate-200 rounded-xl p-3.5">
                <div className="text-xs font-bold text-indigo-600 mb-1">步驟 3. 啟動單機伺服器</div>
                <div className="flex items-center justify-between bg-slate-900 text-slate-100 rounded-md px-2.5 py-1.5 font-mono text-[11px] my-1">
                  <code>npm run dev</code>
                  <button
                    onClick={() => copyToClipboard('npm run dev', 'cmd-dev')}
                    className="text-slate-400 hover:text-white"
                  >
                    {copiedCmd === 'cmd-dev' ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                  </button>
                </div>
                <p className="text-[11px] text-slate-500">瀏覽器開啟: http://localhost:3000</p>
              </div>
            </div>
          </div>

          {/* Available Commands Table */}
          <div>
            <h3 className="text-sm font-bold text-slate-900 mb-3 flex items-center gap-2">
              <FileCode2 className="w-4 h-4 text-indigo-600" />
              本地端常用 npm 腳本清單
            </h3>
            <div className="overflow-hidden border border-slate-200 rounded-xl">
              <table className="min-w-full text-xs divide-y divide-slate-200">
                <thead className="bg-slate-50 text-slate-700 font-semibold">
                  <tr>
                    <th className="px-3.5 py-2 text-left">指令</th>
                    <th className="px-3.5 py-2 text-left">執行說明</th>
                    <th className="px-3.5 py-2 text-right">複製</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 font-normal text-slate-600">
                  <tr className="hover:bg-slate-50/60">
                    <td className="px-3.5 py-2 font-mono font-bold text-indigo-700">npm run dev</td>
                    <td className="px-3.5 py-2">啟動 Vite 單機開發環境 (Port 3000, 支援局域網與本機)</td>
                    <td className="px-3.5 py-2 text-right">
                      <button
                        onClick={() => copyToClipboard('npm run dev', 'c-dev')}
                        className="text-slate-400 hover:text-indigo-600 inline-flex items-center"
                      >
                        {copiedCmd === 'c-dev' ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
                      </button>
                    </td>
                  </tr>
                  <tr className="hover:bg-slate-50/60">
                    <td className="px-3.5 py-2 font-mono font-bold text-indigo-700">npm run dev:local</td>
                    <td className="px-3.5 py-2">啟動 Vite 並自動為您在預設瀏覽器開啟分頁</td>
                    <td className="px-3.5 py-2 text-right">
                      <button
                        onClick={() => copyToClipboard('npm run dev:local', 'c-devlocal')}
                        className="text-slate-400 hover:text-indigo-600 inline-flex items-center"
                      >
                        {copiedCmd === 'c-devlocal' ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
                      </button>
                    </td>
                  </tr>
                  <tr className="hover:bg-slate-50/60">
                    <td className="px-3.5 py-2 font-mono font-bold text-indigo-700">npm run build</td>
                    <td className="px-3.5 py-2">編譯建置正式發布版靜態檔案至 dist/ 目錄</td>
                    <td className="px-3.5 py-2 text-right">
                      <button
                        onClick={() => copyToClipboard('npm run build', 'c-build')}
                        className="text-slate-400 hover:text-indigo-600 inline-flex items-center"
                      >
                        {copiedCmd === 'c-build' ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
                      </button>
                    </td>
                  </tr>
                  <tr className="hover:bg-slate-50/60">
                    <td className="px-3.5 py-2 font-mono font-bold text-indigo-700">npm run preview</td>
                    <td className="px-3.5 py-2">本地預覽剛編譯完成的正式發布版</td>
                    <td className="px-3.5 py-2 text-right">
                      <button
                        onClick={() => copyToClipboard('npm run preview', 'c-prev')}
                        className="text-slate-400 hover:text-indigo-600 inline-flex items-center"
                      >
                        {copiedCmd === 'c-prev' ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
                      </button>
                    </td>
                  </tr>
                  <tr className="hover:bg-slate-50/60">
                    <td className="px-3.5 py-2 font-mono font-bold text-indigo-700">npm run test / lint</td>
                    <td className="px-3.5 py-2">執行 TypeScript 靜態語法安全檢查</td>
                    <td className="px-3.5 py-2 text-right">
                      <button
                        onClick={() => copyToClipboard('npm run lint', 'c-lint')}
                        className="text-slate-400 hover:text-indigo-600 inline-flex items-center"
                      >
                        {copiedCmd === 'c-lint' ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
                      </button>
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>

          {/* Architecture Benefits */}
          <div className="bg-indigo-50/60 border border-indigo-100 rounded-xl p-4">
            <h4 className="text-xs font-bold text-indigo-900 mb-2 flex items-center gap-1.5">
              <ShieldCheck className="w-4 h-4 text-indigo-600" />
              單機環境架構與優勢
            </h4>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs text-indigo-950">
              <div className="flex items-start gap-2">
                <span className="text-emerald-600 font-bold">✓</span>
                <span><strong>零資料庫負擔：</strong>不需安裝 PostgreSQL / MySQL，無連線或授權配置問題。</span>
              </div>
              <div className="flex items-start gap-2">
                <span className="text-emerald-600 font-bold">✓</span>
                <span><strong>100% 離線可用：</strong>本機 LocalStorage 儲存，即使無網際網路連線也能順暢測試。</span>
              </div>
              <div className="flex items-start gap-2">
                <span className="text-emerald-600 font-bold">✓</span>
                <span><strong>毫秒級熱重載 (HMR)：</strong>本機執行自動啟用 Vite 快速熱重載，改 code 即刻刷新。</span>
              </div>
              <div className="flex items-start gap-2">
                <span className="text-emerald-600 font-bold">✓</span>
                <span><strong>商業列印支援：</strong>支援直接呼叫本機瀏覽器列印，完美匯出 A4 報價單 PDF。</span>
              </div>
            </div>
          </div>

          {/* Local Data Backup and Migration */}
          <div className="border border-slate-200 rounded-xl p-4 bg-slate-50">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div>
                <h4 className="text-xs font-bold text-slate-900 flex items-center gap-1.5">
                  <Database className="w-4 h-4 text-slate-700" />
                  本機測試資料遷移與備份 (JSON)
                </h4>
                <p className="text-xs text-slate-500 mt-0.5">
                  可將目前瀏覽器建立的所有客戶、廠商、產品與報價單匯出為單一 JSON 檔案，或從外部匯入測試資料。
                </p>
              </div>
              <div className="flex items-center gap-2 shrink-0">
                <button
                  id="btn-export-backup-json"
                  onClick={handleExportData}
                  className="flex items-center gap-1.5 px-3 py-1.5 bg-white hover:bg-slate-100 border border-slate-300 text-slate-700 rounded-lg text-xs font-semibold shadow-2xs transition"
                >
                  <Download className="w-3.5 h-3.5 text-indigo-600" />
                  匯出 JSON 備份
                </button>

                <input
                  ref={fileInputRef}
                  type="file"
                  accept=".json"
                  onChange={handleFileSelect}
                  className="hidden"
                />

                <button
                  id="btn-import-backup-json"
                  onClick={() => fileInputRef.current?.click()}
                  className="flex items-center gap-1.5 px-3 py-1.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg text-xs font-semibold shadow-2xs transition"
                >
                  <Upload className="w-3.5 h-3.5" />
                  匯入 JSON 檔案
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="bg-slate-50 border-t border-slate-200 px-6 py-3 flex items-center justify-between">
          <span className="text-xs text-slate-500 font-mono">Vite 6 + React 19 + TypeScript</span>
          <button
            onClick={onClose}
            className="px-4 py-1.5 rounded-lg bg-slate-800 text-white hover:bg-slate-900 text-xs font-medium transition shadow-2xs"
          >
            了解並關閉
          </button>
        </div>
      </div>
    </div>
  );
};
