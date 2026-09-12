import React from 'react';
import { Quotation } from '../types';
import { Printer, X, Check, Building2, Phone, Mail, MapPin } from 'lucide-react';

interface QuotationPrintModalProps {
  quotation: Quotation | null;
  onClose: () => void;
}

// Convert number to Traditional Chinese Currency Words
function numberToChineseCurrency(num: number): string {
  if (num === 0) return '零元整';
  const digits = ['零', '壹', '貳', '參', '肆', '伍', '陸', '柒', '捌', '玖'];
  const units = ['', '拾', '佰', '仟'];
  const bigUnits = ['', '萬', '億'];

  let str = '';
  let n = Math.floor(Math.abs(num));
  let unitIdx = 0;

  while (n > 0) {
    let section = n % 10000;
    if (section > 0) {
      let sectionStr = '';
      for (let i = 0; i < 4 && section > 0; i++) {
        const digit = section % 10;
        if (digit > 0) {
          sectionStr = digits[digit] + units[i] + sectionStr;
        } else if (sectionStr && !sectionStr.startsWith('零')) {
          sectionStr = '零' + sectionStr;
        }
        section = Math.floor(section / 10);
      }
      str = sectionStr + bigUnits[unitIdx] + str;
    }
    n = Math.floor(n / 10000);
    unitIdx++;
  }

  return '新台幣 ' + str + '元整';
}

export const QuotationPrintModal: React.FC<QuotationPrintModalProps> = ({
  quotation,
  onClose,
}) => {
  if (!quotation) return null;

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4 overflow-y-auto">
      <div className="bg-white rounded-2xl max-w-4xl w-full shadow-2xl border border-slate-200 overflow-hidden my-8 flex flex-col max-h-[92vh]">
        {/* Modal Controls (Hidden in Print) */}
        <div className="no-print flex items-center justify-between px-6 py-4 bg-slate-900 text-white shrink-0">
          <div className="flex items-center gap-2">
            <Printer className="w-5 h-5 text-indigo-400" />
            <span className="font-semibold text-sm">正式報價單檢視與列印預覽</span>
            <span className="text-xs px-2 py-0.5 rounded bg-indigo-950 text-indigo-300 border border-indigo-700">
              {quotation.quoteNumber}
            </span>
          </div>
          <div className="flex items-center gap-3">
            <button
              id="btn-trigger-print"
              onClick={handlePrint}
              className="flex items-center gap-2 px-4 py-1.5 bg-indigo-600 hover:bg-indigo-500 text-white text-sm font-medium rounded-lg shadow-sm transition cursor-pointer"
            >
              <Printer className="w-4 h-4" />
              列印 / 另存為 PDF
            </button>
            <button
              onClick={onClose}
              className="p-1.5 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800 transition"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Printable Quotation Document Paper */}
        <div className="p-8 sm:p-12 overflow-y-auto bg-white print:p-0 print:m-0 text-slate-900 flex-1">
          <div className="max-w-3xl mx-auto border border-slate-200 print:border-none p-8 rounded-xl shadow-xs print:shadow-none bg-white">
            {/* Header / Brand */}
            <div className="flex justify-between items-start border-b-2 border-slate-900 pb-6 mb-6">
              <div>
                <h1 className="text-2xl font-bold tracking-tight text-slate-900">
                  聯創資訊系統股份有限公司
                </h1>
                <p className="text-xs text-slate-500 mt-1">
                  Nexus Intelligence Corp. ｜ 統一編號：54896213
                </p>
                <div className="text-xs text-slate-600 mt-2 space-y-0.5">
                  <p>地址：台北市信義區信義路五段7號 (台北101大樓 35樓)</p>
                  <p>電話：(02) 2345-9800 ｜ 傳真：(02) 2345-9801</p>
                  <p>Email：sales@nexus-tech.tw ｜ 網址：www.nexus-tech.tw</p>
                </div>
              </div>

              <div className="text-right">
                <div className="inline-block border-2 border-indigo-700 px-4 py-1.5 rounded-lg bg-indigo-50/50">
                  <span className="text-xl font-black tracking-widest text-indigo-900 block">
                    報 價 單
                  </span>
                  <span className="text-[10px] text-indigo-600 font-mono tracking-wider block">
                    QUOTATION
                  </span>
                </div>
                <div className="mt-3 text-xs space-y-1 text-slate-600">
                  <p>
                    <span className="font-semibold text-slate-800">報價單號：</span>
                    <span className="font-mono font-bold text-slate-900">{quotation.quoteNumber}</span>
                  </p>
                  <p>
                    <span className="font-semibold text-slate-800">報價日期：</span>
                    <span>{quotation.date}</span>
                  </p>
                  <p>
                    <span className="font-semibold text-slate-800">有效期限：</span>
                    <span>{quotation.validUntil}</span>
                  </p>
                </div>
              </div>
            </div>

            {/* Buyer Info Box */}
            <div className="bg-slate-50 border border-slate-200 rounded-lg p-4 mb-6 text-xs text-slate-700 grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block mb-1">
                  買方客戶資訊 (CUSTOMER)
                </span>
                <p className="text-sm font-bold text-slate-900">{quotation.customerName}</p>
                <p className="mt-1">
                  <span className="text-slate-500">聯絡窗口：</span>
                  <span className="font-medium text-slate-800">{quotation.contactPerson}</span>
                </p>
                <p className="mt-0.5">
                  <span className="text-slate-500">聯絡電話：</span>
                  <span className="font-mono text-slate-800">{quotation.contactPhone}</span>
                </p>
              </div>

              <div>
                <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block mb-1">
                  交貨與付款資訊 (TERMS)
                </span>
                {quotation.email && (
                  <p>
                    <span className="text-slate-500">電子郵件：</span>
                    <span className="text-slate-800">{quotation.email}</span>
                  </p>
                )}
                {quotation.address && (
                  <p className="mt-0.5">
                    <span className="text-slate-500">送貨地址：</span>
                    <span className="text-slate-800">{quotation.address}</span>
                  </p>
                )}
                <p className="mt-0.5">
                  <span className="text-slate-500">付款條件：</span>
                  <span className="font-medium text-indigo-700">{quotation.paymentTerms || '月結30天'}</span>
                </p>
              </div>
            </div>

            {/* Items Table */}
            <div className="mb-6">
              <table className="w-full text-left text-xs border border-slate-300">
                <thead className="bg-slate-100 text-slate-800 border-b border-slate-300 font-bold">
                  <tr>
                    <th className="p-2.5 text-center w-12 border-r border-slate-300">項次</th>
                    <th className="p-2.5 border-r border-slate-300">產品名稱 / 規格項目</th>
                    <th className="p-2.5 text-right w-24 border-r border-slate-300">單價 (NT$)</th>
                    <th className="p-2.5 text-center w-16 border-r border-slate-300">數量</th>
                    <th className="p-2.5 text-right w-28">複價 (NT$)</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-200">
                  {quotation.items.map((item, idx) => (
                    <tr key={item.id} className="align-top">
                      <td className="p-2.5 text-center text-slate-500 border-r border-slate-200">
                        {idx + 1}
                      </td>
                      <td className="p-2.5 border-r border-slate-200">
                        <div className="font-bold text-slate-900">{item.productName}</div>
                        {item.spec && (
                          <div className="text-[11px] text-slate-500 mt-0.5">{item.spec}</div>
                        )}
                        {item.notes && (
                          <div className="text-[11px] text-indigo-600 mt-0.5">備註：{item.notes}</div>
                        )}
                      </td>
                      <td className="p-2.5 text-right font-mono text-slate-700 border-r border-slate-200">
                        ${item.unitPrice.toLocaleString()}
                      </td>
                      <td className="p-2.5 text-center font-mono font-medium border-r border-slate-200">
                        {item.quantity}
                      </td>
                      <td className="p-2.5 text-right font-mono font-bold text-slate-900">
                        ${item.subtotal.toLocaleString()}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Financial Summary */}
            <div className="flex flex-col sm:flex-row justify-between items-start gap-4 mb-6 text-xs">
              <div className="sm:max-w-sm w-full space-y-1.5 text-slate-600">
                <p className="font-bold text-slate-800">報價說明與備註：</p>
                <p className="leading-relaxed bg-slate-50 p-2.5 rounded border border-slate-200 text-[11px]">
                  {quotation.notes || '1. 報價單有效期間內確認簽約，價格保證不予變動。\n2. 若遇不可抗力或原物料停產，本公司保有變更等值規格之權利。\n3. 保固期內提供標準原廠到府收送或線上技術支援。'}
                </p>
                <p className="text-[11px] text-slate-500">
                  金額大寫：<span className="font-bold text-slate-900">{numberToChineseCurrency(quotation.totalAmount)}</span>
                </p>
              </div>

              <div className="w-full sm:w-64 space-y-1.5 bg-slate-50 p-3 rounded-lg border border-slate-200">
                <div className="flex justify-between text-slate-600">
                  <span>品項未稅合計 (複價總和)：</span>
                  <span className="font-mono font-medium">${quotation.subtotal.toLocaleString()}</span>
                </div>
                <div className="flex justify-between text-slate-600">
                  <span>營業稅 (5% VAT)：</span>
                  <span className="font-mono font-medium">${quotation.taxAmount.toLocaleString()}</span>
                </div>
                <div className="border-t border-slate-300 pt-1.5 flex justify-between text-sm font-bold text-slate-900">
                  <span>總計金額 (含稅)：</span>
                  <span className="font-mono text-indigo-700 text-base">
                    ${quotation.totalAmount.toLocaleString()}
                  </span>
                </div>
              </div>
            </div>

            {/* Signature & Seal Footer */}
            <div className="grid grid-cols-2 gap-8 border-t border-slate-300 pt-6 text-xs text-slate-700">
              <div className="border border-slate-300 rounded-lg p-4 h-28 flex flex-col justify-between">
                <span className="font-bold text-slate-800">報價公司簽章 (Authorized Signature)：</span>
                <div className="text-[10px] text-slate-400 text-right">
                  聯創資訊系統股份有限公司 專用業務章
                </div>
              </div>
              <div className="border border-slate-300 rounded-lg p-4 h-28 flex flex-col justify-between">
                <span className="font-bold text-slate-800">客戶確認回傳簽章 (Client Confirmation)：</span>
                <div className="text-[10px] text-slate-400 text-right">
                  簽章日期：______ 年 ____ 月 ____ 日
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
