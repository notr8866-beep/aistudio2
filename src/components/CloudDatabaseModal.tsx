import React, { useState, useEffect } from 'react';
import {
  Database,
  Server,
  Cloud,
  CheckCircle2,
  AlertCircle,
  Copy,
  Check,
  X,
  ExternalLink,
  RefreshCw,
  Zap,
  Shield,
  Layers,
  ArrowRight,
  Code
} from 'lucide-react';
import { apiService, DbStatusResponse } from '../services/api';
import { auth, googleAuthProvider, signInWithPopup, signOut, User } from '../lib/firebase';

interface CloudDatabaseModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSyncCompleted: () => void;
  currentUser: User | null;
  setCurrentUser: (user: User | null) => void;
}

export const CloudDatabaseModal: React.FC<CloudDatabaseModalProps> = ({
  isOpen,
  onClose,
  onSyncCompleted,
  currentUser,
  setCurrentUser,
}) => {
  const [dbStatus, setDbStatus] = useState<DbStatusResponse | null>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const [syncing, setSyncing] = useState<boolean>(false);
  const [copiedCode, setCopiedCode] = useState<string | null>(null);
  const [syncMessage, setSyncMessage] = useState<string | null>(null);

  const fetchStatus = async () => {
    setLoading(true);
    try {
      const status = await apiService.checkStatus();
      setDbStatus(status);
    } catch (err: any) {
      setDbStatus({
        connected: false,
        database: '連線中斷',
        error: err.message,
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (isOpen) {
      fetchStatus();
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const copyToClipboard = (text: string, id: string) => {
    navigator.clipboard.writeText(text);
    setCopiedCode(id);
    setTimeout(() => setCopiedCode(null), 2000);
  };

  const handleGoogleSignIn = async () => {
    try {
      const result = await signInWithPopup(auth, googleAuthProvider);
      setCurrentUser(result.user);
      if (result.user.email) {
        await apiService.syncUser(result.user.uid, result.user.email);
      }
      setSyncMessage(`已成功透過 Google 帳號 (${result.user.email}) 驗證！`);
      setTimeout(() => setSyncMessage(null), 4000);
    } catch (err: any) {
      console.error('Google Sign-in failed:', err);
      setSyncMessage('Google 登入失敗：' + (err.message || '請確認授權設定'));
      setTimeout(() => setSyncMessage(null), 4000);
    }
  };

  const handleGoogleSignOut = async () => {
    try {
      await signOut(auth);
      setCurrentUser(null);
      setSyncMessage('已安全登出。');
      setTimeout(() => setSyncMessage(null), 3000);
    } catch (err) {
      console.error('Sign out error:', err);
    }
  };

  const handleSyncToDatabase = async () => {
    setSyncing(true);
    try {
      await apiService.resetAll();
      await fetchStatus();
      onSyncCompleted();
      setSyncMessage('已完成雲端資料庫（PostgreSQL）與本地端資料同步！');
      setTimeout(() => setSyncMessage(null), 4000);
    } catch (err: any) {
      setSyncMessage('同步失敗：' + err.message);
      setTimeout(() => setSyncMessage(null), 4000);
    } finally {
      setSyncing(false);
    }
  };

  const vercelEnvTemplate = `# Neon PostgreSQL 連線字串 (至 console.neon.tech 取得)
DATABASE_URL=postgresql://[user]:[password]@[neon-host]/neondb?sslmode=require
SQL_HOST=ep-xxxx.ap-southeast-1.aws.neon.tech
SQL_DB_NAME=neondb
SQL_USER=neondb_owner
SQL_PASSWORD=your_neon_password
SQL_ADMIN_USER=neondb_owner
SQL_ADMIN_PASSWORD=your_neon_password`;

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl max-w-3xl w-full shadow-2xl border border-slate-200 overflow-hidden animate-in fade-in zoom-in-95 duration-200">
        {/* Header */}
        <div className="bg-gradient-to-r from-blue-900 via-indigo-900 to-slate-900 text-white px-6 py-5 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-blue-500/20 border border-blue-400/30 flex items-center justify-center text-blue-300">
              <Database className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-lg font-bold flex items-center gap-2">
                網路端 Vite + PostgreSQL (Neon / Cloud SQL) 整合狀態
                <span className="px-2 py-0.5 rounded-full text-[11px] font-semibold bg-emerald-500/20 text-emerald-300 border border-emerald-400/30">
                  Drizzle ORM 連線
                </span>
              </h2>
              <p className="text-xs text-blue-200">
                支援正式關聯式資料庫儲存、Vercel 部署與 Neon Serverless PostgreSQL
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
          {syncMessage && (
            <div className="p-3.5 rounded-xl bg-blue-50 border border-blue-200 text-blue-800 text-xs font-medium flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-blue-600 shrink-0" />
              <span>{syncMessage}</span>
            </div>
          )}

          {/* Current Database Live Status */}
          <div className="border border-slate-200 rounded-xl p-4 bg-slate-50/70">
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2">
                <span className="relative flex h-3 w-3">
                  <span className={`animate-ping absolute inline-flex h-full w-full rounded-full ${dbStatus?.connected ? 'bg-emerald-400 opacity-75' : 'bg-amber-400 opacity-75'}`}></span>
                  <span className={`relative inline-flex rounded-full h-3 w-3 ${dbStatus?.connected ? 'bg-emerald-500' : 'bg-amber-500'}`}></span>
                </span>
                <h3 className="text-sm font-bold text-slate-900">目前資料庫連線監控</h3>
              </div>
              <button
                onClick={fetchStatus}
                disabled={loading}
                className="flex items-center gap-1 text-xs text-indigo-600 hover:text-indigo-800 font-medium"
              >
                <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
                重新檢測
              </button>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              <div className="bg-white p-3 rounded-lg border border-slate-200">
                <div className="text-[11px] text-slate-500">客戶表 (customers)</div>
                <div className="text-lg font-bold text-slate-800 mt-1">
                  {dbStatus?.tables ? `${dbStatus.tables.customers} 筆` : '連線中...'}
                </div>
              </div>

              <div className="bg-white p-3 rounded-lg border border-slate-200">
                <div className="text-[11px] text-slate-500">廠商表 (vendors)</div>
                <div className="text-lg font-bold text-slate-800 mt-1">
                  {dbStatus?.tables ? `${dbStatus.tables.vendors} 筆` : '連線中...'}
                </div>
              </div>

              <div className="bg-white p-3 rounded-lg border border-slate-200">
                <div className="text-[11px] text-slate-500">產品表 (products)</div>
                <div className="text-lg font-bold text-slate-800 mt-1">
                  {dbStatus?.tables ? `${dbStatus.tables.products} 筆` : '連線中...'}
                </div>
              </div>

              <div className="bg-white p-3 rounded-lg border border-slate-200">
                <div className="text-[11px] text-slate-500">報價單表 (quotations)</div>
                <div className="text-lg font-bold text-slate-800 mt-1">
                  {dbStatus?.tables ? `${dbStatus.tables.quotations} 筆` : '連線中...'}
                </div>
              </div>
            </div>

            <div className="mt-3 pt-3 border-t border-slate-200 flex flex-wrap items-center justify-between gap-2 text-xs">
              <div className="text-slate-600">
                <strong>後端驅動：</strong> PostgreSQL 16 + Drizzle ORM + Express API
              </div>
              <button
                id="btn-sync-to-db"
                onClick={handleSyncToDatabase}
                disabled={syncing}
                className="flex items-center gap-1.5 px-3 py-1.5 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-semibold shadow-2xs transition disabled:opacity-50"
              >
                <Zap className="w-3.5 h-3.5" />
                {syncing ? '同步中...' : '重新填充/同步資料庫種子'}
              </button>
            </div>
          </div>

          {/* Google Auth Integration Section */}
          <div className="border border-slate-200 rounded-xl p-4 bg-white">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-xs font-bold text-slate-900 flex items-center gap-1.5">
                  <Shield className="w-4 h-4 text-indigo-600" />
                  使用者身分驗證與關聯（Firebase Auth / PostgreSQL Users）
                </h3>
                <p className="text-xs text-slate-500 mt-0.5">
                  登入後自動將使用者 UID 與 Email 同步儲存至 PostgreSQL 的 users 資料表。
                </p>
              </div>

              {currentUser ? (
                <div className="flex items-center gap-2">
                  <div className="text-right">
                    <div className="text-xs font-bold text-slate-800">{currentUser.displayName || currentUser.email}</div>
                    <div className="text-[11px] text-emerald-600">✓ 已驗證登入</div>
                  </div>
                  <button
                    onClick={handleGoogleSignOut}
                    className="px-2.5 py-1 text-xs text-slate-600 hover:text-slate-900 border border-slate-200 rounded-lg hover:bg-slate-50"
                  >
                    登出
                  </button>
                </div>
              ) : (
                <button
                  id="btn-google-login"
                  onClick={handleGoogleSignIn}
                  className="flex items-center gap-1.5 px-3.5 py-1.5 bg-slate-900 hover:bg-slate-800 text-white rounded-lg text-xs font-semibold shadow-2xs transition"
                >
                  <span>Google 登入驗證</span>
                </button>
              )}
            </div>
          </div>

          {/* Vercel + Neon Deployment Guide */}
          <div>
            <h3 className="text-sm font-bold text-slate-900 mb-2 flex items-center gap-2">
              <Cloud className="w-4 h-4 text-blue-600" />
              使用 Vercel + Neon (PostgreSQL) 發布至外網指引
            </h3>
            <p className="text-xs text-slate-600 mb-3">
              若您希望將此系統獨立發布至 Vercel，搭配 Neon Serverless PostgreSQL，只需以下 3 步：
            </p>

            <div className="space-y-3 text-xs">
              {/* Step 1 */}
              <div className="border border-slate-200 rounded-xl p-3.5 bg-slate-50">
                <div className="font-bold text-slate-800 flex items-center justify-between">
                  <span>1. 於 Neon (neon.tech) 建立免費 PostgreSQL 資料庫</span>
                  <a
                    href="https://console.neon.tech"
                    target="_blank"
                    rel="noreferrer"
                    className="text-blue-600 hover:underline inline-flex items-center gap-1 text-[11px]"
                  >
                    開啟 Neon 主控台 <ExternalLink className="w-3 h-3" />
                  </a>
                </div>
                <p className="text-slate-600 mt-1">
                  註冊後建立一個新 Project，複製其提供的連線字串（Connection String）。
                </p>
                <div className="mt-2 flex items-center justify-between bg-white border border-slate-200 rounded-lg p-2">
                  <span className="text-slate-500 font-mono text-[11px]">執行專案內的 scripts/neon-schema.sql 即可快速建表</span>
                  <button
                    onClick={() => copyToClipboard('scripts/neon-schema.sql', 'neon-script')}
                    className="text-indigo-600 hover:text-indigo-800 font-medium inline-flex items-center gap-1"
                  >
                    {copiedCode === 'neon-script' ? <Check className="w-3 h-3 text-emerald-600" /> : <Copy className="w-3 h-3" />}
                    複製檔案路徑
                  </button>
                </div>
              </div>

              {/* Step 2 */}
              <div className="border border-slate-200 rounded-xl p-3.5 bg-slate-50">
                <div className="font-bold text-slate-800 flex items-center justify-between">
                  <span>2. 於 Vercel 配置環境變數 (Environment Variables)</span>
                  <a
                    href="https://vercel.com"
                    target="_blank"
                    rel="noreferrer"
                    className="text-blue-600 hover:underline inline-flex items-center gap-1 text-[11px]"
                  >
                    開啟 Vercel <ExternalLink className="w-3 h-3" />
                  </a>
                </div>
                <p className="text-slate-600 mt-1">
                  將本專案匯入 Vercel，並在專案 Settings &gt; Environment Variables 加入連線設定：
                </p>
                <div className="mt-2 bg-slate-900 text-slate-200 p-2.5 rounded-lg font-mono text-[11px] relative">
                  <button
                    onClick={() => copyToClipboard(vercelEnvTemplate, 'vercel-env')}
                    className="absolute top-2 right-2 text-slate-400 hover:text-white"
                  >
                    {copiedCode === 'vercel-env' ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                  </button>
                  <pre className="overflow-x-auto whitespace-pre">{vercelEnvTemplate}</pre>
                </div>
              </div>

              {/* Step 3 */}
              <div className="border border-slate-200 rounded-xl p-3.5 bg-slate-50">
                <div className="font-bold text-slate-800">3. Vercel 1-Click 發布</div>
                <p className="text-slate-600 mt-1">
                  專案已內建 <code className="bg-slate-200 px-1 py-0.5 rounded text-slate-800">vercel.json</code>，Vercel 偵測到後將自動執行 <code className="bg-slate-200 px-1 py-0.5 rounded text-slate-800">vite build</code> 並啟用全球 CDN 靜態與 API 加速！
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="bg-slate-50 border-t border-slate-200 px-6 py-3 flex items-center justify-between">
          <span className="text-xs text-slate-500 font-mono">
            狀態：PostgreSQL 運作中 · Drizzle ORM
          </span>
          <button
            onClick={onClose}
            className="px-4 py-1.5 rounded-lg bg-slate-800 text-white hover:bg-slate-900 text-xs font-medium transition shadow-2xs"
          >
            關閉
          </button>
        </div>
      </div>
    </div>
  );
};
