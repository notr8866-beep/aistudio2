import React, { useState, useEffect } from 'react';
import { Customer, Product, Quotation, QuoteItem, QuoteStatus } from '../types';
import {
  Plus,
  Search,
  FileText,
  Printer,
  Trash2,
  Edit,
  Eye,
  Building2,
  Phone,
  Calendar,
  CheckCircle2,
  Clock,
  Send,
  XCircle,
  AlertCircle,
  X,
  PlusCircle,
  DollarSign
} from 'lucide-react';
import { QuotationPrintModal } from './QuotationPrintModal';

interface QuoteManagerProps {
  quotations: Quotation[];
  customers: Customer[];
  products: Product[];
  onAddQuotation: (quotation: Omit<Quotation, 'id' | 'createdAt' | 'updatedAt'>) => void;
  onUpdateQuotation: (quotation: Quotation) => void;
  onDeleteQuotation: (id: string) => void;
  preselectedCustomerId?: string | null;
  onClearPreselectedCustomer?: () => void;
}

export const QuoteManager: React.FC<QuoteManagerProps> = ({
  quotations,
  customers,
  products,
  onAddQuotation,
  onUpdateQuotation,
  onDeleteQuotation,
  preselectedCustomerId,
  onClearPreselectedCustomer,
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [isEditorOpen, setIsEditorOpen] = useState(false);
  const [editingQuote, setEditingQuote] = useState<Quotation | null>(null);
  const [printQuote, setPrintQuote] = useState<Quotation | null>(null);
  const [deleteConfirmId, setDeleteConfirmId] = useState<string | null>(null);

  // Form State
  const [selectedCustomerId, setSelectedCustomerId] = useState('');
  const [customerPhone, setCustomerPhone] = useState('');
  const [contactPerson, setContactPerson] = useState('');
  const [customerAddress, setCustomerAddress] = useState('');
  const [customerEmail, setCustomerEmail] = useState('');
  const [paymentTerms, setPaymentTerms] = useState('月結30天');
  const [quoteDate, setQuoteDate] = useState(new Date().toISOString().split('T')[0]);
  const [validUntil, setValidUntil] = useState(() => {
    const d = new Date();
    d.setDate(d.getDate() + 30);
    return d.toISOString().split('T')[0];
  });
  const [quoteStatus, setQuoteStatus] = useState<QuoteStatus>('draft');
  const [notes, setNotes] = useState('報價單有效期間30天，若有任何規格需求請隨時與業務窗口聯繫。');
  const [includeTax, setIncludeTax] = useState(true);

  // Items State
  const [items, setItems] = useState<QuoteItem[]>([]);
  const [formErrors, setFormErrors] = useState<Record<string, string>>({});

  // When preselectedCustomerId is provided from CustomerManager
  useEffect(() => {
    if (preselectedCustomerId) {
      openCreateModal(preselectedCustomerId);
      if (onClearPreselectedCustomer) {
        onClearPreselectedCustomer();
      }
    }
  }, [preselectedCustomerId]);

  const openCreateModal = (initCustomerId?: string) => {
    setEditingQuote(null);
    const targetCustId = initCustomerId || (customers.length > 0 ? customers[0].id : '');
    const foundCust = customers.find((c) => c.id === targetCustId);

    setSelectedCustomerId(targetCustId);
    setCustomerPhone(foundCust ? foundCust.phone : '');
    setContactPerson(foundCust ? foundCust.contactPerson : '');
    setCustomerAddress(foundCust ? foundCust.address : '');
    setCustomerEmail(foundCust ? foundCust.email : '');
    setPaymentTerms(foundCust?.paymentTerms || '月結30天');
    setQuoteDate(new Date().toISOString().split('T')[0]);

    const d = new Date();
    d.setDate(d.getDate() + 30);
    setValidUntil(d.toISOString().split('T')[0]);

    setQuoteStatus('draft');
    setNotes('報價單有效期間30天，若有任何規格需求請隨時與業務窗口聯繫。');
    setIncludeTax(true);
    setFormErrors({});

    // Seed with 1 initial line item if products exist
    if (products.length > 0) {
      const p = products[0];
      setItems([
        {
          id: 'item-' + Date.now(),
          productId: p.id,
          productName: p.name,
          unitPrice: p.price,
          quantity: 1,
          subtotal: p.price * 1,
          spec: p.spec,
          notes: '',
        },
      ]);
    } else {
      setItems([]);
    }

    setIsEditorOpen(true);
  };

  const openEditModal = (quote: Quotation) => {
    setEditingQuote(quote);
    setSelectedCustomerId(quote.customerId);
    setCustomerPhone(quote.contactPhone);
    setContactPerson(quote.contactPerson);
    setCustomerAddress(quote.address || '');
    setCustomerEmail(quote.email || '');
    setPaymentTerms(quote.paymentTerms || '月結30天');
    setQuoteDate(quote.date);
    setValidUntil(quote.validUntil);
    setQuoteStatus(quote.status);
    setNotes(quote.notes || '');
    setIncludeTax(quote.taxRate > 0);
    setItems([...quote.items]);
    setFormErrors({});
    setIsEditorOpen(true);
  };

  // When user changes customer dropdown
  const handleCustomerChange = (customerId: string) => {
    setSelectedCustomerId(customerId);
    const found = customers.find((c) => c.id === customerId);
    if (found) {
      setCustomerPhone(found.phone);
      setContactPerson(found.contactPerson);
      setCustomerAddress(found.address);
      setCustomerEmail(found.email);
      if (found.paymentTerms) {
        setPaymentTerms(found.paymentTerms);
      }
    }
  };

  // Add line item
  const handleAddItem = () => {
    const defaultProduct = products.length > 0 ? products[0] : null;
    const newItem: QuoteItem = {
      id: 'item-' + Date.now() + '-' + Math.random().toString(36).substr(2, 4),
      productId: defaultProduct ? defaultProduct.id : '',
      productName: defaultProduct ? defaultProduct.name : '',
      unitPrice: defaultProduct ? defaultProduct.price : 0,
      quantity: 1,
      subtotal: defaultProduct ? defaultProduct.price * 1 : 0,
      spec: defaultProduct?.spec,
      notes: '',
    };
    setItems((prev) => [...prev, newItem]);
  };

  // Remove line item
  const handleRemoveItem = (itemId: string) => {
    setItems((prev) => prev.filter((i) => i.id !== itemId));
  };

  // Handle product selection in line item (Auto-fills unit price & name & spec)
  const handleItemProductChange = (itemId: string, productId: string) => {
    const product = products.find((p) => p.id === productId);
    setItems((prev) =>
      prev.map((item) => {
        if (item.id === itemId) {
          const unitPrice = product ? product.price : item.unitPrice;
          const subtotal = unitPrice * item.quantity;
          return {
            ...item,
            productId,
            productName: product ? product.name : item.productName,
            unitPrice,
            subtotal,
            spec: product ? product.spec : item.spec,
          };
        }
        return item;
      })
    );
  };

  // Handle unit price change
  const handleItemPriceChange = (itemId: string, priceStr: string) => {
    const unitPrice = Number(priceStr) || 0;
    setItems((prev) =>
      prev.map((item) => {
        if (item.id === itemId) {
          return {
            ...item,
            unitPrice,
            subtotal: unitPrice * item.quantity,
          };
        }
        return item;
      })
    );
  };

  // Handle quantity change
  const handleItemQuantityChange = (itemId: string, qtyStr: string) => {
    const quantity = Math.max(1, parseInt(qtyStr, 10) || 1);
    setItems((prev) =>
      prev.map((item) => {
        if (item.id === itemId) {
          return {
            ...item,
            quantity,
            subtotal: item.unitPrice * quantity,
          };
        }
        return item;
      })
    );
  };

  // Handle note change
  const handleItemNoteChange = (itemId: string, notes: string) => {
    setItems((prev) =>
      prev.map((item) => (item.id === itemId ? { ...item, notes } : item))
    );
  };

  // Calculate totals
  const subtotal = items.reduce((acc, curr) => acc + curr.subtotal, 0);
  const taxRate = includeTax ? 0.05 : 0;
  const taxAmount = Math.round(subtotal * taxRate);
  const totalAmount = subtotal + taxAmount;

  // Validation
  const validateForm = () => {
    const errors: Record<string, string> = {};
    if (!selectedCustomerId) {
      errors.customerId = '請選擇報價客戶 (來自客戶管理)';
    }
    if (!customerPhone.trim()) {
      errors.customerPhone = '請填寫聯絡電話';
    }
    if (items.length === 0) {
      errors.items = '報價單至少需包含一項產品明細';
    } else {
      const invalidProduct = items.find((i) => !i.productId || !i.productName);
      if (invalidProduct) {
        errors.items = '請為所有明細選取有效之產品';
      }
    }
    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSaveQuotation = (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateForm()) return;

    const selectedCust = customers.find((c) => c.id === selectedCustomerId);
    const customerName = selectedCust ? selectedCust.companyName : '客戶';

    if (editingQuote) {
      const updated: Quotation = {
        ...editingQuote,
        customerId: selectedCustomerId,
        customerName,
        contactPerson: contactPerson || selectedCust?.contactPerson || '',
        contactPhone: customerPhone,
        email: customerEmail || selectedCust?.email,
        address: customerAddress || selectedCust?.address,
        date: quoteDate,
        validUntil,
        items,
        subtotal,
        taxRate,
        taxAmount,
        totalAmount,
        paymentTerms,
        notes,
        status: quoteStatus,
        updatedAt: new Date().toISOString(),
      };
      onUpdateQuotation(updated);
    } else {
      // Generate unique quote number
      const now = new Date();
      const datePrefix = `QT-${now.getFullYear()}${String(now.getMonth() + 1).padStart(2, '0')}`;
      const randomSeq = String(Math.floor(100 + Math.random() * 900));
      const quoteNumber = `${datePrefix}-${randomSeq}`;

      const newQuote: Omit<Quotation, 'id' | 'createdAt' | 'updatedAt'> = {
        quoteNumber,
        customerId: selectedCustomerId,
        customerName,
        contactPerson: contactPerson || selectedCust?.contactPerson || '',
        contactPhone: customerPhone,
        email: customerEmail || selectedCust?.email,
        address: customerAddress || selectedCust?.address,
        date: quoteDate,
        validUntil,
        items,
        subtotal,
        taxRate,
        taxAmount,
        totalAmount,
        paymentTerms,
        notes,
        status: quoteStatus,
      };
      onAddQuotation(newQuote);
    }

    setIsEditorOpen(false);
  };

  const getStatusBadge = (status: QuoteStatus) => {
    switch (status) {
      case 'draft':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-medium bg-slate-100 text-slate-700 border border-slate-200">
            <Clock className="w-3 h-3 text-slate-500" />
            草稿
          </span>
        );
      case 'sent':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-50 text-blue-700 border border-blue-200">
            <Send className="w-3 h-3 text-blue-500" />
            已發送
          </span>
        );
      case 'confirmed':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-medium bg-emerald-50 text-emerald-700 border border-emerald-200">
            <CheckCircle2 className="w-3 h-3 text-emerald-500" />
            已確認
          </span>
        );
      case 'completed':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-medium bg-purple-50 text-purple-700 border border-purple-200">
            <CheckCircle2 className="w-3 h-3 text-purple-500" />
            已結案
          </span>
        );
      case 'rejected':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-medium bg-rose-50 text-rose-700 border border-rose-200">
            <XCircle className="w-3 h-3 text-rose-500" />
            未成交
          </span>
        );
      default:
        return null;
    }
  };

  const filteredQuotes = quotations.filter((q) => {
    const matchSearch =
      q.quoteNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
      q.customerName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      q.contactPhone.includes(searchTerm);
    const matchStatus = statusFilter === 'all' || q.status === statusFilter;
    return matchSearch && matchStatus;
  });

  return (
    <div className="space-y-6">
      {/* Top Action Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-5 rounded-xl border border-slate-200 shadow-xs">
        <div>
          <h2 className="text-xl font-bold text-slate-800 flex items-center gap-2">
            <FileText className="w-6 h-6 text-indigo-600" />
            報價單管理
          </h2>
          <p className="text-sm text-slate-500 mt-1">
            整合客戶與產品下拉關聯，即時連動單價與自動計算複價與總額
          </p>
        </div>
        <div className="flex items-center gap-3">
          {/* Status Filter */}
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="px-3 py-2 border border-slate-300 rounded-lg text-sm bg-slate-50 text-slate-700 focus:outline-hidden focus:ring-2 focus:ring-indigo-500"
          >
            <option value="all">所有狀態</option>
            <option value="draft">草稿</option>
            <option value="sent">已發送</option>
            <option value="confirmed">已確認</option>
            <option value="completed">已結案</option>
            <option value="rejected">未成交</option>
          </select>

          <div className="relative">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              id="quote-search-input"
              type="text"
              placeholder="搜尋單號、客戶、電話..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-9 pr-4 py-2 border border-slate-300 rounded-lg text-sm focus:outline-hidden focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 w-56 bg-slate-50"
            />
          </div>

          <button
            id="btn-create-quote"
            onClick={() => openCreateModal()}
            className="flex items-center gap-2 px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-medium rounded-lg transition shadow-xs whitespace-nowrap"
          >
            <Plus className="w-4 h-4" />
            開立報價單
          </button>
        </div>
      </div>

      {/* Quotations List */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="bg-slate-50 text-slate-600 border-b border-slate-200 font-semibold text-xs uppercase tracking-wider">
              <tr>
                <th className="px-5 py-3.5">報價單號 / 日期</th>
                <th className="px-5 py-3.5">客戶名稱 (來自客戶管理)</th>
                <th className="px-5 py-3.5">聯絡電話 / 窗口</th>
                <th className="px-5 py-3.5">品項摘要</th>
                <th className="px-5 py-3.5 text-right">報價總計 (含稅)</th>
                <th className="px-5 py-3.5 text-center">狀態</th>
                <th className="px-5 py-3.5 text-right">操作</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredQuotes.length === 0 ? (
                <tr>
                  <td colSpan={7} className="text-center py-12 text-slate-400">
                    <FileText className="w-10 h-10 mx-auto mb-2 opacity-40" />
                    目前無符合條件的報價單紀錄
                  </td>
                </tr>
              ) : (
                filteredQuotes.map((quote) => (
                  <tr key={quote.id} className="hover:bg-slate-50/70 transition">
                    <td className="px-5 py-4">
                      <div className="font-mono font-bold text-slate-900">{quote.quoteNumber}</div>
                      <div className="text-xs text-slate-400 flex items-center gap-1 mt-0.5">
                        <Calendar className="w-3 h-3" />
                        {quote.date}
                      </div>
                    </td>
                    <td className="px-5 py-4">
                      <div className="font-semibold text-slate-800">{quote.customerName}</div>
                      <div className="text-xs text-slate-500">{quote.paymentTerms || '月結30天'}</div>
                    </td>
                    <td className="px-5 py-4 text-xs text-slate-600">
                      <div className="flex items-center gap-1 font-mono text-slate-700">
                        <Phone className="w-3.5 h-3.5 text-slate-400" />
                        {quote.contactPhone}
                      </div>
                      <div className="text-slate-500 mt-0.5">{quote.contactPerson}</div>
                    </td>
                    <td className="px-5 py-4 text-xs text-slate-600 max-w-[200px]">
                      <div className="font-medium text-slate-800 truncate">
                        {quote.items[0]?.productName || '無品項'}
                      </div>
                      {quote.items.length > 1 && (
                        <div className="text-slate-400">
                          另有 {quote.items.length - 1} 項明細品項
                        </div>
                      )}
                    </td>
                    <td className="px-5 py-4 text-right">
                      <div className="font-mono font-bold text-base text-indigo-700">
                        ${quote.totalAmount.toLocaleString()}
                      </div>
                      <div className="text-[11px] text-slate-400 font-mono">
                        未稅 ${quote.subtotal.toLocaleString()}
                      </div>
                    </td>
                    <td className="px-5 py-4 text-center">{getStatusBadge(quote.status)}</td>
                    <td className="px-5 py-4 text-right">
                      <div className="flex items-center justify-end gap-1.5">
                        <button
                          id={`btn-print-quote-${quote.id}`}
                          onClick={() => setPrintQuote(quote)}
                          title="正式報價單列印與預覽"
                          className="flex items-center gap-1 px-2 py-1 text-xs font-medium text-slate-700 hover:text-indigo-600 hover:bg-slate-100 rounded-md transition"
                        >
                          <Printer className="w-3.5 h-3.5" />
                          列印
                        </button>
                        <button
                          id={`btn-edit-quote-${quote.id}`}
                          onClick={() => openEditModal(quote)}
                          title="編輯報價單"
                          className="p-1.5 text-slate-500 hover:text-indigo-600 hover:bg-slate-100 rounded-md transition"
                        >
                          <Edit className="w-4 h-4" />
                        </button>
                        <button
                          id={`btn-del-quote-${quote.id}`}
                          onClick={() => setDeleteConfirmId(quote.id)}
                          title="刪除報價單"
                          className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-md transition"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Delete Confirmation Modal */}
      {deleteConfirmId && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-xs p-4">
          <div className="bg-white rounded-xl max-w-sm w-full p-6 shadow-xl border border-slate-200">
            <h3 className="text-lg font-bold text-slate-800">確定刪除此張報價單？</h3>
            <p className="text-sm text-slate-600 mt-2">
              刪除後將無法恢復。請確認不再需要此報價歷史記錄。
            </p>
            <div className="flex justify-end gap-3 mt-6">
              <button
                onClick={() => setDeleteConfirmId(null)}
                className="px-4 py-2 border border-slate-300 text-slate-700 text-sm font-medium rounded-lg hover:bg-slate-50"
              >
                取消
              </button>
              <button
                onClick={() => {
                  onDeleteQuotation(deleteConfirmId);
                  setDeleteConfirmId(null);
                }}
                className="px-4 py-2 bg-rose-600 text-white text-sm font-medium rounded-lg hover:bg-rose-700"
              >
                確認刪除
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Create / Edit Quotation Modal (Full Editor) */}
      {isEditorOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-xs p-4 overflow-y-auto">
          <div className="bg-white rounded-2xl max-w-4xl w-full p-6 sm:p-8 shadow-2xl border border-slate-200 max-h-[94vh] overflow-y-auto">
            {/* Header */}
            <div className="flex items-center justify-between pb-4 border-b border-slate-200">
              <div>
                <h3 className="text-xl font-bold text-slate-800 flex items-center gap-2">
                  <FileText className="w-6 h-6 text-indigo-600" />
                  {editingQuote ? `編輯報價單 (${editingQuote.quoteNumber})` : '開立新報價單'}
                </h3>
                <p className="text-xs text-slate-500 mt-0.5">
                  自動連動客戶資料庫與產品價格庫存，即時計算複價
                </p>
              </div>
              <button
                onClick={() => setIsEditorOpen(false)}
                className="p-2 text-slate-400 hover:text-slate-600 rounded-lg hover:bg-slate-100 transition"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveQuotation} className="space-y-6 mt-6">
              {/* Section 1: Customer Selection & Details */}
              <div className="bg-slate-50/70 border border-slate-200 rounded-xl p-5">
                <h4 className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-4 flex items-center gap-1.5">
                  <Building2 className="w-4 h-4 text-indigo-600" />
                  客戶資訊（來自客戶管理連動）
                </h4>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  {/* 客戶名稱 (來自客戶管理下拉) */}
                  <div className="sm:col-span-2">
                    <label className="block text-xs font-semibold text-slate-700 mb-1">
                      客戶名稱 (來自客戶管理下拉) <span className="text-rose-500">＊必填</span>
                    </label>
                    <select
                      id="quote-select-customer"
                      value={selectedCustomerId}
                      onChange={(e) => handleCustomerChange(e.target.value)}
                      className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm bg-white focus:outline-hidden focus:ring-2 focus:ring-indigo-500"
                    >
                      <option value="" disabled>
                        -- 請選擇客戶 --
                      </option>
                      {customers.map((c) => (
                        <option key={c.id} value={c.id}>
                          {c.companyName} ({c.contactPerson})
                        </option>
                      ))}
                    </select>
                    {formErrors.customerId && (
                      <p className="text-xs text-rose-600 mt-1 flex items-center gap-1">
                        <AlertCircle className="w-3.5 h-3.5" />
                        {formErrors.customerId}
                      </p>
                    )}
                  </div>

                  {/* 聯絡電話 */}
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">
                      聯絡電話 <span className="text-rose-500">＊必填</span>
                    </label>
                    <div className="relative">
                      <Phone className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                      <input
                        id="quote-input-phone"
                        type="text"
                        value={customerPhone}
                        onChange={(e) => setCustomerPhone(e.target.value)}
                        placeholder="例: 02-2789-5566"
                        className="w-full pl-9 pr-3 py-2 border border-slate-300 rounded-lg text-sm bg-white focus:outline-hidden focus:ring-2 focus:ring-indigo-500"
                      />
                    </div>
                    {formErrors.customerPhone && (
                      <p className="text-xs text-rose-600 mt-1 flex items-center gap-1">
                        <AlertCircle className="w-3.5 h-3.5" />
                        {formErrors.customerPhone}
                      </p>
                    )}
                  </div>

                  {/* 聯絡窗口 */}
                  <div>
                    <label className="block text-xs font-medium text-slate-600 mb-1">
                      聯絡窗口
                    </label>
                    <input
                      id="quote-input-contactPerson"
                      type="text"
                      value={contactPerson}
                      onChange={(e) => setContactPerson(e.target.value)}
                      placeholder="聯絡人"
                      className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm bg-white focus:outline-hidden focus:ring-2 focus:ring-indigo-500"
                    />
                  </div>

                  {/* 電子郵件 */}
                  <div>
                    <label className="block text-xs font-medium text-slate-600 mb-1">
                      電子郵件
                    </label>
                    <input
                      id="quote-input-email"
                      type="email"
                      value={customerEmail}
                      onChange={(e) => setCustomerEmail(e.target.value)}
                      placeholder="email"
                      className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm bg-white focus:outline-hidden focus:ring-2 focus:ring-indigo-500"
                    />
                  </div>

                  {/* 送貨地址 */}
                  <div>
                    <label className="block text-xs font-medium text-slate-600 mb-1">
                      地址
                    </label>
                    <input
                      id="quote-input-address"
                      type="text"
                      value={customerAddress}
                      onChange={(e) => setCustomerAddress(e.target.value)}
                      placeholder="公司送貨地址"
                      className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm bg-white focus:outline-hidden focus:ring-2 focus:ring-indigo-500"
                    />
                  </div>
                </div>
              </div>

              {/* Section 2: Dates, Status & Terms */}
              <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    報價日期
                  </label>
                  <input
                    id="quote-input-date"
                    type="date"
                    value={quoteDate}
                    onChange={(e) => setQuoteDate(e.target.value)}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:outline-hidden focus:ring-2 focus:ring-indigo-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    有效期限至
                  </label>
                  <input
                    id="quote-input-validUntil"
                    type="date"
                    value={validUntil}
                    onChange={(e) => setValidUntil(e.target.value)}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:outline-hidden focus:ring-2 focus:ring-indigo-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    報價單狀態
                  </label>
                  <select
                    id="quote-select-status"
                    value={quoteStatus}
                    onChange={(e) => setQuoteStatus(e.target.value as QuoteStatus)}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm bg-white focus:outline-hidden focus:ring-2 focus:ring-indigo-500"
                  >
                    <option value="draft">草稿</option>
                    <option value="sent">已發送</option>
                    <option value="confirmed">已確認</option>
                    <option value="completed">已結案</option>
                    <option value="rejected">未成交</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    付款條件
                  </label>
                  <input
                    id="quote-input-paymentTerms"
                    type="text"
                    value={paymentTerms}
                    onChange={(e) => setPaymentTerms(e.target.value)}
                    placeholder="例: 月結30天"
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:outline-hidden focus:ring-2 focus:ring-indigo-500"
                  />
                </div>
              </div>

              {/* Section 3: Quote Items Table */}
              <div>
                <div className="flex items-center justify-between mb-2">
                  <h4 className="text-sm font-bold text-slate-800 flex items-center gap-2">
                    <span>報價產品明細</span>
                    <span className="text-xs px-2 py-0.5 rounded-full bg-slate-100 text-slate-600 font-normal">
                      共 {items.length} 項
                    </span>
                  </h4>
                  <button
                    id="btn-add-quote-item"
                    type="button"
                    onClick={handleAddItem}
                    className="flex items-center gap-1.5 px-3 py-1.5 bg-indigo-50 hover:bg-indigo-100 text-indigo-700 text-xs font-semibold rounded-lg transition"
                  >
                    <PlusCircle className="w-4 h-4" />
                    新增品項
                  </button>
                </div>

                {formErrors.items && (
                  <p className="text-xs text-rose-600 mb-3 flex items-center gap-1">
                    <AlertCircle className="w-3.5 h-3.5" />
                    {formErrors.items}
                  </p>
                )}

                <div className="border border-slate-200 rounded-xl overflow-hidden shadow-2xs">
                  <table className="w-full text-left text-xs">
                    <thead className="bg-slate-100 text-slate-700 font-bold border-b border-slate-200">
                      <tr>
                        <th className="p-3 w-1/3">產品 (來自產品管理下拉)</th>
                        <th className="p-3 w-28 text-right">單價 (NT$)</th>
                        <th className="p-3 w-20 text-center">數量</th>
                        <th className="p-3 w-32 text-right">複價 (單價×數量)</th>
                        <th className="p-3">備註 / 規格說明</th>
                        <th className="p-3 w-10 text-center"></th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                      {items.map((item, idx) => (
                        <tr key={item.id} className="hover:bg-slate-50/70">
                          {/* Product Select */}
                          <td className="p-3">
                            <select
                              id={`item-select-product-${idx}`}
                              value={item.productId}
                              onChange={(e) => handleItemProductChange(item.id, e.target.value)}
                              className="w-full px-2.5 py-1.5 border border-slate-300 rounded-lg text-xs bg-white focus:ring-2 focus:ring-indigo-500"
                            >
                              <option value="" disabled>
                                -- 選擇產品 --
                              </option>
                              {products.map((p) => (
                                <option key={p.id} value={p.id}>
                                  {p.name} (定價: ${p.price.toLocaleString()})
                                </option>
                              ))}
                            </select>
                            {item.spec && (
                              <div className="text-[11px] text-slate-400 mt-1 truncate max-w-xs">
                                規格: {item.spec}
                              </div>
                            )}
                          </td>

                          {/* Unit Price */}
                          <td className="p-3 text-right">
                            <input
                              id={`item-input-price-${idx}`}
                              type="number"
                              min="0"
                              value={item.unitPrice}
                              onChange={(e) => handleItemPriceChange(item.id, e.target.value)}
                              className="w-full text-right px-2 py-1.5 border border-slate-300 rounded-lg text-xs font-mono font-medium focus:ring-2 focus:ring-indigo-500"
                            />
                          </td>

                          {/* Quantity */}
                          <td className="p-3 text-center">
                            <input
                              id={`item-input-qty-${idx}`}
                              type="number"
                              min="1"
                              value={item.quantity}
                              onChange={(e) => handleItemQuantityChange(item.id, e.target.value)}
                              className="w-16 text-center px-2 py-1.5 border border-slate-300 rounded-lg text-xs font-mono font-medium focus:ring-2 focus:ring-indigo-500"
                            />
                          </td>

                          {/* Subtotal (複價 = 單價 × 數量) */}
                          <td className="p-3 text-right font-mono font-bold text-slate-900 text-sm">
                            <span id={`item-subtotal-${idx}`}>${item.subtotal.toLocaleString()}</span>
                          </td>

                          {/* Item Note */}
                          <td className="p-3">
                            <input
                              id={`item-input-note-${idx}`}
                              type="text"
                              value={item.notes || ''}
                              onChange={(e) => handleItemNoteChange(item.id, e.target.value)}
                              placeholder="個別品項備註 (選填)"
                              className="w-full px-2.5 py-1.5 border border-slate-300 rounded-lg text-xs focus:ring-2 focus:ring-indigo-500"
                            />
                          </td>

                          {/* Remove button */}
                          <td className="p-3 text-center">
                            {items.length > 1 && (
                              <button
                                type="button"
                                onClick={() => handleRemoveItem(item.id)}
                                className="p-1 text-slate-400 hover:text-rose-600 rounded"
                                title="刪除此項"
                              >
                                <Trash2 className="w-4 h-4" />
                              </button>
                            )}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>

              {/* Section 4: Summary & Totals */}
              <div className="flex flex-col sm:flex-row justify-between items-start gap-6 pt-2">
                <div className="w-full sm:flex-1 space-y-2">
                  <label className="block text-xs font-semibold text-slate-700">
                    全單備註與條款說明
                  </label>
                  <textarea
                    id="quote-input-notes"
                    rows={3}
                    value={notes}
                    onChange={(e) => setNotes(e.target.value)}
                    placeholder="輸入交期、驗收標準或保固說明..."
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg text-xs focus:outline-hidden focus:ring-2 focus:ring-indigo-500"
                  />
                </div>

                <div className="w-full sm:w-80 bg-slate-50 border border-slate-200 rounded-xl p-4 space-y-2 text-xs">
                  <div className="flex justify-between text-slate-600">
                    <span>複價未稅合計：</span>
                    <span id="quote-summary-subtotal" className="font-mono font-semibold">
                      ${subtotal.toLocaleString()}
                    </span>
                  </div>

                  <div className="flex justify-between items-center text-slate-600">
                    <label className="flex items-center gap-1.5 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={includeTax}
                        onChange={(e) => setIncludeTax(e.target.checked)}
                        className="rounded border-slate-300 text-indigo-600 focus:ring-indigo-500"
                      />
                      <span>營業稅 (5% VAT)</span>
                    </label>
                    <span id="quote-summary-tax" className="font-mono font-semibold">
                      ${taxAmount.toLocaleString()}
                    </span>
                  </div>

                  <div className="border-t border-slate-300 pt-2 flex justify-between items-center text-sm font-bold text-slate-900">
                    <span>總計金額 (NT$)：</span>
                    <span id="quote-summary-total" className="font-mono text-xl text-indigo-700">
                      ${totalAmount.toLocaleString()}
                    </span>
                  </div>
                </div>
              </div>

              {/* Actions */}
              <div className="flex justify-end gap-3 pt-4 border-t border-slate-200">
                <button
                  type="button"
                  onClick={() => setIsEditorOpen(false)}
                  className="px-4 py-2 border border-slate-300 text-slate-700 text-sm font-medium rounded-lg hover:bg-slate-50 transition"
                >
                  取消
                </button>
                <button
                  id="btn-save-quotation-form"
                  type="submit"
                  className="flex items-center gap-2 px-6 py-2 bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-medium rounded-lg shadow-xs transition"
                >
                  <CheckCircle2 className="w-4 h-4" />
                  {editingQuote ? '儲存報價單變更' : '建立報價單'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Printable Modal */}
      {printQuote && (
        <QuotationPrintModal
          quotation={printQuote}
          onClose={() => setPrintQuote(null)}
        />
      )}
    </div>
  );
};
