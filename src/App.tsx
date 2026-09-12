import React, { useState, useEffect } from 'react';
import { Customer, Vendor, Product, Quotation } from './types';
import { storage } from './utils/storage';
import { CustomerManager } from './components/CustomerManager';
import { VendorManager } from './components/VendorManager';
import { ProductManager } from './components/ProductManager';
import { QuoteManager } from './components/QuoteManager';
import { AcceptanceCriteriaView } from './components/AcceptanceCriteriaView';
import { LocalTestingModal } from './components/LocalTestingModal';
import {
  Building2,
  Truck,
  Package,
  FileText,
  ShieldCheck,
  RotateCcw,
  Receipt,
  TrendingUp,
  Users,
  Briefcase,
  Laptop
} from 'lucide-react';

type TabType = 'customers' | 'vendors' | 'products' | 'quotes' | 'acceptance';

export default function App() {
  const [activeTab, setActiveTab] = useState<TabType>('quotes');

  // Core Data States with localStorage persistence
  const [customers, setCustomers] = useState<Customer[]>(() => storage.getCustomers());
  const [vendors, setVendors] = useState<Vendor[]>(() => storage.getVendors());
  const [products, setProducts] = useState<Product[]>(() => storage.getProducts());
  const [quotations, setQuotations] = useState<Quotation[]>(() => storage.getQuotations());

  // Inter-module jump state (e.g. from customer click "開立此客戶報價單")
  const [targetCustomerIdForQuote, setTargetCustomerIdForQuote] = useState<string | null>(null);

  // Local testing guide modal state
  const [isTestingModalOpen, setIsTestingModalOpen] = useState<boolean>(false);

  const handleDataRestored = () => {
    setCustomers(storage.getCustomers());
    setVendors(storage.getVendors());
    setProducts(storage.getProducts());
    setQuotations(storage.getQuotations());
  };

  // Sync back to storage on state change
  useEffect(() => {
    storage.saveCustomers(customers);
  }, [customers]);

  useEffect(() => {
    storage.saveVendors(vendors);
  }, [vendors]);

  useEffect(() => {
    storage.saveProducts(products);
  }, [products]);

  useEffect(() => {
    storage.saveQuotations(quotations);
  }, [quotations]);

  // Customer Actions
  const handleAddCustomer = (data: Omit<Customer, 'id' | 'createdAt' | 'updatedAt'>) => {
    const newCust: Customer = {
      ...data,
      id: 'cust-' + Date.now(),
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    setCustomers((prev) => [newCust, ...prev]);
  };

  const handleUpdateCustomer = (customer: Customer) => {
    setCustomers((prev) => prev.map((c) => (c.id === customer.id ? customer : c)));
  };

  const handleDeleteCustomer = (id: string) => {
    setCustomers((prev) => prev.filter((c) => c.id !== id));
  };

  const handleCreateQuoteForCustomer = (customer: Customer) => {
    setTargetCustomerIdForQuote(customer.id);
    setActiveTab('quotes');
  };

  // Vendor Actions
  const handleAddVendor = (data: Omit<Vendor, 'id' | 'createdAt' | 'updatedAt'>) => {
    const newVend: Vendor = {
      ...data,
      id: 'vend-' + Date.now(),
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    setVendors((prev) => [newVend, ...prev]);
  };

  const handleUpdateVendor = (vendor: Vendor) => {
    setVendors((prev) => prev.map((v) => (v.id === vendor.id ? vendor : v)));
  };

  const handleDeleteVendor = (id: string) => {
    setVendors((prev) => prev.filter((v) => v.id !== id));
  };

  // Product Actions
  const handleAddProduct = (data: Omit<Product, 'id' | 'createdAt' | 'updatedAt'>) => {
    const newProd: Product = {
      ...data,
      id: 'prod-' + Date.now(),
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    setProducts((prev) => [newProd, ...prev]);
  };

  const handleUpdateProduct = (product: Product) => {
    setProducts((prev) => prev.map((p) => (p.id === product.id ? product : p)));
  };

  const handleDeleteProduct = (id: string) => {
    setProducts((prev) => prev.filter((p) => p.id !== id));
  };

  // Quotation Actions
  const handleAddQuotation = (data: Omit<Quotation, 'id' | 'createdAt' | 'updatedAt'>) => {
    const newQuote: Quotation = {
      ...data,
      id: 'quote-' + Date.now(),
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    setQuotations((prev) => [newQuote, ...prev]);
  };

  const handleUpdateQuotation = (quotation: Quotation) => {
    setQuotations((prev) => prev.map((q) => (q.id === quotation.id ? quotation : q)));
  };

  const handleDeleteQuotation = (id: string) => {
    setQuotations((prev) => prev.filter((q) => q.id !== id));
  };

  // Reset demo data
  const handleResetData = () => {
    if (window.confirm('確定將所有客戶、廠商、產品與報價單重置為初始示範資料？')) {
      storage.resetAllToDefault();
      setCustomers(storage.getCustomers());
      setVendors(storage.getVendors());
      setProducts(storage.getProducts());
      setQuotations(storage.getQuotations());
    }
  };

  // Stats calculations
  const totalQuoteAmount = quotations.reduce((acc, q) => acc + q.totalAmount, 0);
  const pendingQuotesCount = quotations.filter((q) => q.status === 'draft' || q.status === 'sent').length;

  return (
    <div className="min-h-screen bg-slate-100 flex flex-col text-slate-800">
      {/* Top Main Navigation Header */}
      <header className="no-print bg-white border-b border-slate-200 sticky top-0 z-30 shadow-2xs">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            {/* Logo and System Title */}
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-indigo-600 text-white flex items-center justify-center shadow-xs">
                <Receipt className="w-6 h-6" />
              </div>
              <div>
                <h1 className="text-lg font-bold text-slate-900 tracking-tight flex items-center gap-2">
                  報價管理系統
                  <span className="text-[11px] font-semibold px-2 py-0.5 rounded-full bg-indigo-50 text-indigo-700 border border-indigo-200">
                    企業版 ERP
                  </span>
                </h1>
                <p className="text-xs text-slate-500 hidden sm:block">
                  客戶管理 ｜ 廠商管理 ｜ 產品管理 ｜ 報價單連動管理
                </p>
              </div>
            </div>

            {/* Header Right Actions */}
            <div className="flex items-center gap-2">
              <button
                id="btn-local-testing-guide"
                onClick={() => setIsTestingModalOpen(true)}
                title="本地端單機測試指南與資料備份"
                className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-indigo-700 bg-indigo-50 hover:bg-indigo-100 rounded-lg transition border border-indigo-200 shadow-2xs"
              >
                <Laptop className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">單機測試指引 / 備份</span>
                <span className="sm:hidden">單機指引</span>
              </button>

              <button
                id="btn-reset-demo-data"
                onClick={handleResetData}
                title="重置為初始示範資料"
                className="flex items-center gap-1 px-3 py-1.5 text-xs font-medium text-slate-600 hover:text-slate-900 hover:bg-slate-100 rounded-lg transition border border-slate-200"
              >
                <RotateCcw className="w-3.5 h-3.5" />
                <span className="hidden md:inline">重置示範資料</span>
              </button>
            </div>
          </div>

          {/* Module Tabs Navigation */}
          <div className="flex space-x-1 border-t border-slate-100 py-1 overflow-x-auto">
            <button
              id="tab-quotes"
              onClick={() => setActiveTab('quotes')}
              className={`flex items-center gap-2 px-4 py-2.5 rounded-lg text-sm font-semibold transition whitespace-nowrap ${
                activeTab === 'quotes'
                  ? 'bg-indigo-600 text-white shadow-xs'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
              }`}
            >
              <FileText className="w-4 h-4" />
              報價單管理
              <span
                className={`text-xs px-2 py-0.2 rounded-full ${
                  activeTab === 'quotes' ? 'bg-indigo-700 text-white' : 'bg-slate-200 text-slate-700'
                }`}
              >
                {quotations.length}
              </span>
            </button>

            <button
              id="tab-customers"
              onClick={() => setActiveTab('customers')}
              className={`flex items-center gap-2 px-4 py-2.5 rounded-lg text-sm font-semibold transition whitespace-nowrap ${
                activeTab === 'customers'
                  ? 'bg-indigo-600 text-white shadow-xs'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
              }`}
            >
              <Building2 className="w-4 h-4" />
              客戶管理
              <span
                className={`text-xs px-2 py-0.2 rounded-full ${
                  activeTab === 'customers' ? 'bg-indigo-700 text-white' : 'bg-slate-200 text-slate-700'
                }`}
              >
                {customers.length}
              </span>
            </button>

            <button
              id="tab-vendors"
              onClick={() => setActiveTab('vendors')}
              className={`flex items-center gap-2 px-4 py-2.5 rounded-lg text-sm font-semibold transition whitespace-nowrap ${
                activeTab === 'vendors'
                  ? 'bg-indigo-600 text-white shadow-xs'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
              }`}
            >
              <Truck className="w-4 h-4" />
              廠商管理
              <span
                className={`text-xs px-2 py-0.2 rounded-full ${
                  activeTab === 'vendors' ? 'bg-indigo-700 text-white' : 'bg-slate-200 text-slate-700'
                }`}
              >
                {vendors.length}
              </span>
            </button>

            <button
              id="tab-products"
              onClick={() => setActiveTab('products')}
              className={`flex items-center gap-2 px-4 py-2.5 rounded-lg text-sm font-semibold transition whitespace-nowrap ${
                activeTab === 'products'
                  ? 'bg-indigo-600 text-white shadow-xs'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
              }`}
            >
              <Package className="w-4 h-4" />
              產品管理
              <span
                className={`text-xs px-2 py-0.2 rounded-full ${
                  activeTab === 'products' ? 'bg-indigo-700 text-white' : 'bg-slate-200 text-slate-700'
                }`}
              >
                {products.length}
              </span>
            </button>

            <button
              id="tab-acceptance"
              onClick={() => setActiveTab('acceptance')}
              className={`flex items-center gap-2 px-4 py-2.5 rounded-lg text-sm font-semibold transition whitespace-nowrap ${
                activeTab === 'acceptance'
                  ? 'bg-emerald-600 text-white shadow-xs'
                  : 'text-emerald-700 bg-emerald-50 hover:bg-emerald-100'
              }`}
            >
              <ShieldCheck className="w-4 h-4" />
              驗收條件測試專區
              <span className="text-[10px] px-1.5 py-0.5 rounded bg-emerald-700 text-white uppercase tracking-wider">
                5項指標
              </span>
            </button>
          </div>
        </div>
      </header>

      {/* Overview Metric Cards (Hidden during Print) */}
      <div className="no-print max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-6 w-full">
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-2xs">
            <div className="flex items-center justify-between">
              <span className="text-xs font-medium text-slate-500">已登記客戶</span>
              <Building2 className="w-4 h-4 text-indigo-500" />
            </div>
            <div className="mt-2 flex items-baseline gap-1">
              <span className="text-2xl font-bold text-slate-900">{customers.length}</span>
              <span className="text-xs text-slate-400">家企業</span>
            </div>
          </div>

          <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-2xs">
            <div className="flex items-center justify-between">
              <span className="text-xs font-medium text-slate-500">供應商廠商</span>
              <Truck className="w-4 h-4 text-teal-500" />
            </div>
            <div className="mt-2 flex items-baseline gap-1">
              <span className="text-2xl font-bold text-slate-900">{vendors.length}</span>
              <span className="text-xs text-slate-400">家夥伴</span>
            </div>
          </div>

          <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-2xs">
            <div className="flex items-center justify-between">
              <span className="text-xs font-medium text-slate-500">在庫產品品項</span>
              <Package className="w-4 h-4 text-amber-500" />
            </div>
            <div className="mt-2 flex items-baseline gap-1">
              <span className="text-2xl font-bold text-slate-900">{products.length}</span>
              <span className="text-xs text-slate-400">種品項</span>
            </div>
          </div>

          <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-2xs">
            <div className="flex items-center justify-between">
              <span className="text-xs font-medium text-slate-500">累計報價總額</span>
              <TrendingUp className="w-4 h-4 text-emerald-500" />
            </div>
            <div className="mt-2 flex items-baseline gap-1">
              <span className="text-2xl font-bold font-mono text-indigo-700">
                ${totalQuoteAmount.toLocaleString()}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content Area */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 flex-1 w-full">
        {activeTab === 'customers' && (
          <CustomerManager
            customers={customers}
            onAddCustomer={handleAddCustomer}
            onUpdateCustomer={handleUpdateCustomer}
            onDeleteCustomer={handleDeleteCustomer}
            onCreateQuoteForCustomer={handleCreateQuoteForCustomer}
          />
        )}

        {activeTab === 'vendors' && (
          <VendorManager
            vendors={vendors}
            onAddVendor={handleAddVendor}
            onUpdateVendor={handleUpdateVendor}
            onDeleteVendor={handleDeleteVendor}
          />
        )}

        {activeTab === 'products' && (
          <ProductManager
            products={products}
            onAddProduct={handleAddProduct}
            onUpdateProduct={handleUpdateProduct}
            onDeleteProduct={handleDeleteProduct}
          />
        )}

        {activeTab === 'quotes' && (
          <QuoteManager
            quotations={quotations}
            customers={customers}
            products={products}
            onAddQuotation={handleAddQuotation}
            onUpdateQuotation={handleUpdateQuotation}
            onDeleteQuotation={handleDeleteQuotation}
            preselectedCustomerId={targetCustomerIdForQuote}
            onClearPreselectedCustomer={() => setTargetCustomerIdForQuote(null)}
          />
        )}

        {activeTab === 'acceptance' && (
          <AcceptanceCriteriaView
            customers={customers}
            products={products}
            quotations={quotations}
          />
        )}
      </main>

      {/* Footer */}
      <footer className="no-print bg-white border-t border-slate-200 py-4 mt-auto">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-2 text-xs text-slate-500">
          <div>
            報價管理系統 ｜ 客戶管理 · 廠商管理 · 產品管理 · 報價單連動管理
          </div>
          <div className="flex items-center gap-3">
            <span>支援客戶與產品選單即時連動</span>
            <span>·</span>
            <span>自動計算複價與營業稅</span>
            <span>·</span>
            <button
              onClick={() => setActiveTab('acceptance')}
              className="text-indigo-600 hover:underline font-medium"
            >
              查看驗收測試指標
            </button>
          </div>
        </div>
      </footer>
      {/* Local Testing Guide & Backup Modal */}
      <LocalTestingModal
        isOpen={isTestingModalOpen}
        onClose={() => setIsTestingModalOpen(false)}
        onDataRestored={handleDataRestored}
      />
    </div>
  );
}
