import React, { useState } from 'react';
import { Customer } from '../types';
import { Plus, Search, Edit2, Trash2, Building2, Phone, Mail, MapPin, FileText, CheckCircle2, AlertCircle, X } from 'lucide-react';

interface CustomerManagerProps {
  customers: Customer[];
  onAddCustomer: (customer: Omit<Customer, 'id' | 'createdAt' | 'updatedAt'>) => void;
  onUpdateCustomer: (customer: Customer) => void;
  onDeleteCustomer: (id: string) => void;
  onCreateQuoteForCustomer: (customer: Customer) => void;
}

export const CustomerManager: React.FC<CustomerManagerProps> = ({
  customers,
  onAddCustomer,
  onUpdateCustomer,
  onDeleteCustomer,
  onCreateQuoteForCustomer,
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingCustomer, setEditingCustomer] = useState<Customer | null>(null);
  const [deleteConfirmId, setDeleteConfirmId] = useState<string | null>(null);

  // Form State
  const [formData, setFormData] = useState({
    companyName: '',
    contactPerson: '',
    englishName: '',
    department: '',
    phone: '',
    email: '',
    address: '',
    paymentTerms: '月結30天',
    notes: '',
  });

  const [formErrors, setFormErrors] = useState<Record<string, string>>({});

  const filteredCustomers = customers.filter(
    (c) =>
      c.companyName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      c.contactPerson.toLowerCase().includes(searchTerm.toLowerCase()) ||
      c.phone.includes(searchTerm) ||
      (c.englishName && c.englishName.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  const openAddModal = () => {
    setEditingCustomer(null);
    setFormData({
      companyName: '',
      contactPerson: '',
      englishName: '',
      department: '',
      phone: '',
      email: '',
      address: '',
      paymentTerms: '月結30天',
      notes: '',
    });
    setFormErrors({});
    setIsModalOpen(true);
  };

  const openEditModal = (customer: Customer) => {
    setEditingCustomer(customer);
    setFormData({
      companyName: customer.companyName,
      contactPerson: customer.contactPerson,
      englishName: customer.englishName || '',
      department: customer.department || '',
      phone: customer.phone,
      email: customer.email,
      address: customer.address,
      paymentTerms: customer.paymentTerms || '',
      notes: customer.notes || '',
    });
    setFormErrors({});
    setIsModalOpen(true);
  };

  const validateForm = () => {
    const errors: Record<string, string> = {};
    if (!formData.companyName.trim()) {
      errors.companyName = '請填寫公司名稱 (必填)';
    }
    if (!formData.contactPerson.trim()) {
      errors.contactPerson = '請填寫聯絡窗口 (必填)';
    }
    if (!formData.phone.trim()) {
      errors.phone = '請填寫聯絡電話 (必填)';
    }
    if (!formData.email.trim()) {
      errors.email = '請填寫電子郵件 (必填)';
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      errors.email = '請輸入有效格式的電子郵件 (需包含 @ 與網域)';
    }
    if (!formData.address.trim()) {
      errors.address = '請填寫公司地址 (必填)';
    }

    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateForm()) return;

    if (editingCustomer) {
      onUpdateCustomer({
        ...editingCustomer,
        ...formData,
        updatedAt: new Date().toISOString(),
      });
    } else {
      onAddCustomer(formData);
    }
    setIsModalOpen(false);
  };

  return (
    <div className="space-y-6">
      {/* Top Action Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-5 rounded-xl border border-slate-200 shadow-xs">
        <div>
          <h2 className="text-xl font-bold text-slate-800 flex items-center gap-2">
            <Building2 className="w-6 h-6 text-indigo-600" />
            客戶管理
          </h2>
          <p className="text-sm text-slate-500 mt-1">
            維護客戶資料與報價單連結資訊（標示 <span className="text-rose-500 font-semibold">＊</span> 為必填欄位）
          </p>
        </div>
        <div className="flex items-center gap-3">
          <div className="relative">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              id="customer-search-input"
              type="text"
              placeholder="搜尋公司、窗口、電話..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-9 pr-4 py-2 border border-slate-300 rounded-lg text-sm focus:outline-hidden focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 w-64 bg-slate-50"
            />
          </div>
          <button
            id="btn-add-customer"
            onClick={openAddModal}
            className="flex items-center gap-2 px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-medium rounded-lg transition shadow-xs"
          >
            <Plus className="w-4 h-4" />
            新增客戶
          </button>
        </div>
      </div>

      {/* Customers Table / Cards */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="bg-slate-50 text-slate-600 border-b border-slate-200 font-semibold text-xs uppercase tracking-wider">
              <tr>
                <th className="px-5 py-3.5">公司名稱 / 英文名</th>
                <th className="px-5 py-3.5">聯絡窗口 / 部門</th>
                <th className="px-5 py-3.5">電話 / Email</th>
                <th className="px-5 py-3.5">地址</th>
                <th className="px-5 py-3.5">付款條件</th>
                <th className="px-5 py-3.5 text-right">操作</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredCustomers.length === 0 ? (
                <tr>
                  <td colSpan={6} className="text-center py-12 text-slate-400">
                    <Building2 className="w-10 h-10 mx-auto mb-2 opacity-40" />
                    查無符合條件之客戶資料
                  </td>
                </tr>
              ) : (
                filteredCustomers.map((customer) => (
                  <tr key={customer.id} className="hover:bg-slate-50/70 transition">
                    <td className="px-5 py-4">
                      <div className="font-semibold text-slate-800">{customer.companyName}</div>
                      {customer.englishName && (
                        <div className="text-xs text-slate-500">{customer.englishName}</div>
                      )}
                    </td>
                    <td className="px-5 py-4">
                      <div className="font-medium text-slate-700">{customer.contactPerson}</div>
                      {customer.department && (
                        <span className="inline-block mt-0.5 px-2 py-0.5 text-xs bg-slate-100 text-slate-600 rounded">
                          {customer.department}
                        </span>
                      )}
                    </td>
                    <td className="px-5 py-4 text-slate-600">
                      <div className="flex items-center gap-1.5 text-xs">
                        <Phone className="w-3.5 h-3.5 text-slate-400" />
                        <span>{customer.phone}</span>
                      </div>
                      <div className="flex items-center gap-1.5 text-xs mt-1">
                        <Mail className="w-3.5 h-3.5 text-slate-400" />
                        <span className="text-indigo-600 truncate max-w-[160px]">{customer.email}</span>
                      </div>
                    </td>
                    <td className="px-5 py-4 text-slate-600 text-xs max-w-[200px] truncate" title={customer.address}>
                      <div className="flex items-center gap-1.5">
                        <MapPin className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                        <span className="truncate">{customer.address}</span>
                      </div>
                    </td>
                    <td className="px-5 py-4 text-xs text-slate-600">
                      <span className="px-2.5 py-1 rounded-full bg-emerald-50 text-emerald-700 font-medium border border-emerald-200/60">
                        {customer.paymentTerms || '一般條款'}
                      </span>
                    </td>
                    <td className="px-5 py-4 text-right">
                      <div className="flex items-center justify-end gap-1.5">
                        <button
                          id={`btn-quote-cust-${customer.id}`}
                          onClick={() => onCreateQuoteForCustomer(customer)}
                          title="為此客戶開立報價單"
                          className="flex items-center gap-1 px-2.5 py-1 text-xs font-medium text-indigo-600 hover:bg-indigo-50 rounded-md transition"
                        >
                          <FileText className="w-3.5 h-3.5" />
                          開報價單
                        </button>
                        <button
                          id={`btn-edit-cust-${customer.id}`}
                          onClick={() => openEditModal(customer)}
                          title="編輯資料"
                          className="p-1.5 text-slate-500 hover:text-indigo-600 hover:bg-slate-100 rounded-md transition"
                        >
                          <Edit2 className="w-4 h-4" />
                        </button>
                        <button
                          id={`btn-del-cust-${customer.id}`}
                          onClick={() => setDeleteConfirmId(customer.id)}
                          title="刪除客戶"
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
            <h3 className="text-lg font-bold text-slate-800">確定刪除客戶資料？</h3>
            <p className="text-sm text-slate-600 mt-2">
              刪除後將無法恢復。請確認該客戶未有進行中的重要報價單。
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
                  onDeleteCustomer(deleteConfirmId);
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

      {/* Add / Edit Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-xs p-4 overflow-y-auto">
          <div className="bg-white rounded-2xl max-w-xl w-full p-6 shadow-2xl border border-slate-200 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between pb-4 border-b border-slate-200">
              <h3 className="text-lg font-bold text-slate-800 flex items-center gap-2">
                <Building2 className="w-5 h-5 text-indigo-600" />
                {editingCustomer ? '編輯客戶資料' : '新增客戶資料'}
              </h3>
              <button
                onClick={() => setIsModalOpen(false)}
                className="p-1.5 text-slate-400 hover:text-slate-600 rounded-lg hover:bg-slate-100 transition"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4 mt-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {/* 公司名稱＊ */}
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    公司名稱 <span className="text-rose-500">＊必填</span>
                  </label>
                  <input
                    id="cust-input-companyName"
                    type="text"
                    value={formData.companyName}
                    onChange={(e) => setFormData({ ...formData, companyName: e.target.value })}
                    placeholder="例: 台積創新科技股份有限公司"
                    className={`w-full px-3 py-2 border rounded-lg text-sm focus:outline-hidden focus:ring-2 ${
                      formErrors.companyName
                        ? 'border-rose-300 ring-1 ring-rose-300 focus:ring-rose-500'
                        : 'border-slate-300 focus:ring-indigo-500'
                    }`}
                  />
                  {formErrors.companyName && (
                    <p className="text-xs text-rose-600 mt-1 flex items-center gap-1">
                      <AlertCircle className="w-3.5 h-3.5" />
                      {formErrors.companyName}
                    </p>
                  )}
                </div>

                {/* 聯絡窗口＊ */}
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    聯絡窗口 <span className="text-rose-500">＊必填</span>
                  </label>
                  <input
                    id="cust-input-contactPerson"
                    type="text"
                    value={formData.contactPerson}
                    onChange={(e) => setFormData({ ...formData, contactPerson: e.target.value })}
                    placeholder="例: 林怡君"
                    className={`w-full px-3 py-2 border rounded-lg text-sm focus:outline-hidden focus:ring-2 ${
                      formErrors.contactPerson
                        ? 'border-rose-300 ring-1 ring-rose-300 focus:ring-rose-500'
                        : 'border-slate-300 focus:ring-indigo-500'
                    }`}
                  />
                  {formErrors.contactPerson && (
                    <p className="text-xs text-rose-600 mt-1 flex items-center gap-1">
                      <AlertCircle className="w-3.5 h-3.5" />
                      {formErrors.contactPerson}
                    </p>
                  )}
                </div>

                {/* 英文名 */}
                <div>
                  <label className="block text-xs font-medium text-slate-600 mb-1">
                    英文名
                  </label>
                  <input
                    id="cust-input-englishName"
                    type="text"
                    value={formData.englishName}
                    onChange={(e) => setFormData({ ...formData, englishName: e.target.value })}
                    placeholder="例: TSMC Innovation Tech Ltd."
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:outline-hidden focus:ring-2 focus:ring-indigo-500"
                  />
                </div>

                {/* 部門 */}
                <div>
                  <label className="block text-xs font-medium text-slate-600 mb-1">
                    部門
                  </label>
                  <input
                    id="cust-input-department"
                    type="text"
                    value={formData.department}
                    onChange={(e) => setFormData({ ...formData, department: e.target.value })}
                    placeholder="例: 資訊採購部"
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:outline-hidden focus:ring-2 focus:ring-indigo-500"
                  />
                </div>

                {/* 電話＊ */}
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    電話 <span className="text-rose-500">＊必填</span>
                  </label>
                  <input
                    id="cust-input-phone"
                    type="text"
                    value={formData.phone}
                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                    placeholder="例: 02-2789-5566"
                    className={`w-full px-3 py-2 border rounded-lg text-sm focus:outline-hidden focus:ring-2 ${
                      formErrors.phone
                        ? 'border-rose-300 ring-1 ring-rose-300 focus:ring-rose-500'
                        : 'border-slate-300 focus:ring-indigo-500'
                    }`}
                  />
                  {formErrors.phone && (
                    <p className="text-xs text-rose-600 mt-1 flex items-center gap-1">
                      <AlertCircle className="w-3.5 h-3.5" />
                      {formErrors.phone}
                    </p>
                  )}
                </div>

                {/* email* */}
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Email <span className="text-rose-500">＊必填</span>
                  </label>
                  <input
                    id="cust-input-email"
                    type="email"
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    placeholder="例: yijun.lin@tsmc-innov.com.tw"
                    className={`w-full px-3 py-2 border rounded-lg text-sm focus:outline-hidden focus:ring-2 ${
                      formErrors.email
                        ? 'border-rose-300 ring-1 ring-rose-300 focus:ring-rose-500'
                        : 'border-slate-300 focus:ring-indigo-500'
                    }`}
                  />
                  {formErrors.email && (
                    <p className="text-xs text-rose-600 mt-1 flex items-center gap-1">
                      <AlertCircle className="w-3.5 h-3.5" />
                      {formErrors.email}
                    </p>
                  )}
                </div>
              </div>

              {/* 地址* */}
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  地址 <span className="text-rose-500">＊必填</span>
                </label>
                <input
                  id="cust-input-address"
                  type="text"
                  value={formData.address}
                  onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                  placeholder="例: 台北市南港區園區街3號9樓"
                  className={`w-full px-3 py-2 border rounded-lg text-sm focus:outline-hidden focus:ring-2 ${
                    formErrors.address
                      ? 'border-rose-300 ring-1 ring-rose-300 focus:ring-rose-500'
                      : 'border-slate-300 focus:ring-indigo-500'
                  }`}
                />
                {formErrors.address && (
                  <p className="text-xs text-rose-600 mt-1 flex items-center gap-1">
                    <AlertCircle className="w-3.5 h-3.5" />
                    {formErrors.address}
                  </p>
                )}
              </div>

              {/* 付款條件 */}
              <div>
                <label className="block text-xs font-medium text-slate-600 mb-1">
                  付款條件
                </label>
                <input
                  id="cust-input-paymentTerms"
                  type="text"
                  value={formData.paymentTerms}
                  onChange={(e) => setFormData({ ...formData, paymentTerms: e.target.value })}
                  placeholder="例: 月結30天電匯 / 簽約30%驗收70%"
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:outline-hidden focus:ring-2 focus:ring-indigo-500"
                />
              </div>

              {/* 備註 */}
              <div>
                <label className="block text-xs font-medium text-slate-600 mb-1">
                  備註
                </label>
                <textarea
                  id="cust-input-notes"
                  rows={2}
                  value={formData.notes}
                  onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                  placeholder="客戶特殊需求、交期偏好或折扣慣例..."
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:outline-hidden focus:ring-2 focus:ring-indigo-500"
                />
              </div>

              <div className="flex justify-end gap-3 pt-3 border-t border-slate-200">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 border border-slate-300 text-slate-700 text-sm font-medium rounded-lg hover:bg-slate-50 transition"
                >
                  取消
                </button>
                <button
                  id="btn-submit-customer-form"
                  type="submit"
                  className="flex items-center gap-2 px-5 py-2 bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-medium rounded-lg shadow-xs transition"
                >
                  <CheckCircle2 className="w-4 h-4" />
                  {editingCustomer ? '更新資料' : '儲存客戶'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
