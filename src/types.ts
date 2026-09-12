export interface Customer {
  id: string;
  companyName: string; // 公司名稱＊ (必填)
  contactPerson: string; // 聯絡窗口＊ (必填)
  englishName?: string; // 英文名
  department?: string; // 部門
  phone: string; // 電話＊ (必填)
  email: string; // email* (必填)
  address: string; // 地址* (必填)
  paymentTerms?: string; // 付款條件 (e.g. 月結30天, 訂金30%尾款70%)
  notes?: string; // 備註
  createdAt: string;
  updatedAt: string;
}

export interface Vendor {
  id: string;
  companyName: string; // 公司名稱＊ (必填)
  contactPerson: string; // 聯絡窗口＊ (必填)
  englishName?: string; // 英文名
  department?: string; // 部門
  phone: string; // 電話＊ (必填)
  email: string; // email* (必填)
  address: string; // 地址* (必填)
  taxId?: string; // 統一編號
  paymentTerms?: string; // 付款條件
  notes?: string; // 備註
  createdAt: string;
  updatedAt: string;
}

export interface Product {
  id: string;
  name: string; // 產品名稱* (必填)
  cost: number; // 成本* (必填)
  price: number; // 售價* (必填)
  image?: string; // 圖片
  spec?: string; // 規格
  stock: number; // 庫存數量
  createdAt: string;
  updatedAt: string;
}

export interface QuoteItem {
  id: string;
  productId: string; // 產品 (來自產品管理下拉)
  productName: string;
  unitPrice: number; // 單價 (來自產品管理下拉)
  quantity: number; // 數量
  subtotal: number; // 複價 (單價 × 數量)
  spec?: string;
  notes?: string;
}

export type QuoteStatus = 'draft' | 'sent' | 'confirmed' | 'rejected' | 'completed';

export interface Quotation {
  id: string;
  quoteNumber: string; // 報價單號 (e.g. QT-202609-001)
  customerId: string; // 客戶ID (來自客戶管理下拉)
  customerName: string; // 客戶名稱
  contactPerson: string;
  contactPhone: string; // 聯絡電話
  email?: string;
  address?: string;
  date: string; // 報價日期
  validUntil: string; // 有效期限
  items: QuoteItem[];
  subtotal: number; // 未稅合計
  taxRate: number; // 營業稅率 (一般為 0.05)
  taxAmount: number; // 稅額
  totalAmount: number; // 總計 (複價總和 + 稅額)
  paymentTerms?: string; // 付款條件
  notes?: string; // 備註
  status: QuoteStatus; // 狀態
  createdAt: string;
  updatedAt: string;
}

export interface AcceptanceCriterion {
  id: string;
  title: string;
  indicator: string;
  description: string;
  testingSteps: string[];
  expectedOutcome: string;
  status: 'pending' | 'running' | 'passed' | 'failed';
  log?: string;
}
