import React, { useState } from 'react';
import { Vendor } from '../types';
import { Plus, Search, Edit2, Trash2, Truck, Phone, Mail, MapPin, Hash, CheckCircle2, AlertCircle, X } from 'lucide-react';

interface VendorManagerProps {
  vendors: Vendor[];
  onAddVendor: (vendor: Omit<Vendor, 'id' | 'createdAt' | 'updatedAt'>) => void;
  onUpdateVendor: (vendor: Vendor) => void;
  onDeleteVendor: (id: string) => void;
}

export const VendorManager: React.FC<VendorManagerProps> = ({
  vendors,
  onAddVendor,
  onUpdateVendor,
  onDeleteVendor,
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingVendor, setEditingVendor] = useState<Vendor | null>(null);
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
    taxId: '',
    paymentTerms: '月結30天',
    notes: '',
  });

  const [formErrors, setFormErrors] = useState<Record<string, string>>({});

  const filteredVendors = vendors.filter(
    (v) =>
      v.companyName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      v.contactPerson.toLowerCase().includes(searchTerm.toLowerCase()) ||
      v.phone.includes(searchTerm) ||
      (v.taxId && v.taxId.includes(searchTerm)) ||
      (v.englishName && v.englishName.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  const openAddModal = () => {
    setEditingVendor(null);
    setFormData({
      companyName: '',
      contactPerson: '',
      englishName: '',
      department: '',
      phone: '',
      email: '',
      address: '',
      taxId: '',
      paymentTerms: '月結30天',
      notes: '',
    });
    setFormErrors({});
    setIsModalOpen(true);
  };

  const openEditModal = (vendor: Vendor) => {
    setEditingVendor(vendor);
    setFormData({
      companyName: vendor.companyName,
      contactPerson: vendor.contactPerson,
      englishName: vendor.englishName || '',
      department: vendor.department || '',
      phone: vendor.phone,
      email: vendor.email,
      address: vendor.address,
      taxId: vendor.taxId || '',
      paymentTerms: vendor.paymentTerms || '',
      notes: vendor.notes || '',
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
      errors.address = '請填寫廠商地址 (必填)';
    }
    if (formData.taxId.trim() && !/^\d{8}$/.test(formData.taxId.trim())) {
      errors.taxId = '統一編號須為 8 碼數字';
    }

    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateForm()) return;

    if (editingVendor) {
      onUpdateVendor({
        ...editingVendor,
        ...formData,
        updatedAt: new Date().toISOString(),
      });
    } else {
      onAddVendor(formData);
    }
    setIsModalOpen(false);
  };

  return (
    <div className="space-y-6">
      {/* Top Action Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-5 rounded-xl border border-slate-200 shadow-xs">
        <div>
          <h2 className="text-xl font-bold text-slate-800 flex items-center gap-2">
            <Truck className="w-6 h-6 text-teal-600" />
            廠商管理
          </h2>
          <p className="text-sm text-slate-500 mt-1">
            維護進貨供應鏈廠商、統編與付款條件（標示 <span className="text-rose-500 font-semibold">＊</span> 為必填欄位）
          </p>
        </div>
        <div className="flex items-center gap-3">
          <div className="relative">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              id="vendor-search-input"
              type="text"
              placeholder="搜尋廠商、統編、窗口..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-9 pr-4 py-2 border border-slate-300 rounded-lg text-sm focus:outline-hidden focus:ring-2 focus:ring-teal-500 focus:border-teal-500 w-64 bg-slate-50"
            />
          </div>
          <button
            id="btn-add-vendor"
            onClick={openAddModal}
            className="flex items-center gap-2 px-4 py-2 bg-teal-600 hover:bg-teal-700 text-white text-sm font-medium rounded-lg transition shadow-xs"
          >
            <Plus className="w-4 h-4" />
            新增廠商
          </button>
        </div>
      </div>

      {/* Vendors Table */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="bg-slate-50 text-slate-600 border-b border-slate-200 font-semibold text-xs uppercase tracking-wider">
              <tr>
                <th className="px-5 py-3.5">廠商公司 / 英文名</th>
                <th className="px-5 py-3.5">統一編號</th>
                <th className="px-5 py-3.5">聯絡窗口 / 部門</th>
                <th className="px-5 py-3.5">電話 / Email</th>
                <th className="px-5 py-3.5">地址</th>
                <th className="px-5 py-3.5">付款條件</th>
                <th className="px-5 py-3.5 text-right">操作</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredVendors.length === 0 ? (
                <tr>
                  <td colSpan={7} className="text-center py-12 text-slate-400">
                    <Truck className="w-10 h-10 mx-auto mb-2 opacity-40" />
                    查無符合條件之廠商資料
                  </td>
                </tr>
              ) : (
                filteredVendors.map((vendor) => (
                  <tr key={vendor.id} className="hover:bg-slate-50/70 transition">
                    <td className="px-5 py-4">
                      <div className="font-semibold text-slate-800">{vendor.companyName}</div>
                      {vendor.englishName && (
                        <div className="text-xs text-slate-500">{vendor.englishName}</div>
                      )}
                    </td>
                    <td className="px-5 py-4">
                      {vendor.taxId ? (
                        <span className="inline-flex items-center gap-1 font-mono text-xs px-2 py-0.5 bg-slate-100 text-slate-700 rounded border border-slate-200">
                          <Hash className="w-3 h-3 text-slate-400" />
                          {vendor.taxId}
                        </span>
                      ) : (
                        <span className="text-xs text-slate-400">未提供</span>
                      )}
                    </td>
                    <td className="px-5 py-4">
                      <div className="font-medium text-slate-700">{vendor.contactPerson}</div>
                      {vendor.department && (
                        <span className="inline-block mt-0.5 px-2 py-0.5 text-xs bg-slate-100 text-slate-600 rounded">
                          {vendor.department}
                        </span>
                      )}
                    </td>
                    <td className="px-5 py-4 text-slate-600">
                      <div className="flex items-center gap-1.5 text-xs">
                        <Phone className="w-3.5 h-3.5 text-slate-400" />
                        <span>{vendor.phone}</span>
                      </div>
                      <div className="flex items-center gap-1.5 text-xs mt-1">
                        <Mail className="w-3.5 h-3.5 text-slate-400" />
                        <span className="text-teal-700 truncate max-w-[160px]">{vendor.email}</span>
                      </div>
                    </td>
                    <td className="px-5 py-4 text-slate-600 text-xs max-w-[200px] truncate" title={vendor.address}>
                      <div className="flex items-center gap-1.5">
                        <MapPin className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                        <span className="truncate">{vendor.address}</span>
                      </div>
                    </td>
                    <td className="px-5 py-4 text-xs text-slate-600">
                      <span className="px-2.5 py-1 rounded-full bg-teal-50 text-teal-800 font-medium border border-teal-200/60">
                        {vendor.paymentTerms || '月結30天'}
                      </span>
                    </td>
                    <td className="px-5 py-4 text-right">
                      <div className="flex items-center justify-end gap-1.5">
                        <button
                          id={`btn-edit-vend-${vendor.id}`}
                          onClick={() => openEditModal(vendor)}
                          title="編輯廠商"
                          className="p-1.5 text-slate-500 hover:text-teal-600 hover:bg-slate-100 rounded-md transition"
                        >
                          <Edit2 className="w-4 h-4" />
                        </button>
                        <button
                          id={`btn-del-vend-${vendor.id}`}
                          onClick={() => setDeleteConfirmId(vendor.id)}
                          title="刪除廠商"
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
            <h3 className="text-lg font-bold text-slate-800">確定刪除廠商資料？</h3>
            <p className="text-sm text-slate-600 mt-2">
              刪除後將無法恢復。請確認不再需要該廠商之供應鏈與採購紀錄。
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
                  onDeleteVendor(deleteConfirmId);
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
                <Truck className="w-5 h-5 text-teal-600" />
                {editingVendor ? '編輯廠商資料' : '新增廠商資料'}
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
                    id="vend-input-companyName"
                    type="text"
                    value={formData.companyName}
                    onChange={(e) => setFormData({ ...formData, companyName: e.target.value })}
                    placeholder="例: 聯強國際物流經銷商"
                    className={`w-full px-3 py-2 border rounded-lg text-sm focus:outline-hidden focus:ring-2 ${
                      formErrors.companyName
                        ? 'border-rose-300 ring-1 ring-rose-300 focus:ring-rose-500'
                        : 'border-slate-300 focus:ring-teal-500'
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
                    id="vend-input-contactPerson"
                    type="text"
                    value={formData.contactPerson}
                    onChange={(e) => setFormData({ ...formData, contactPerson: e.target.value })}
                    placeholder="例: 黃信義"
                    className={`w-full px-3 py-2 border rounded-lg text-sm focus:outline-hidden focus:ring-2 ${
                      formErrors.contactPerson
                        ? 'border-rose-300 ring-1 ring-rose-300 focus:ring-rose-500'
                        : 'border-slate-300 focus:ring-teal-500'
                    }`}
                  />
                  {formErrors.contactPerson && (
                    <p className="text-xs text-rose-600 mt-1 flex items-center gap-1">
                      <AlertCircle className="w-3.5 h-3.5" />
                      {formErrors.contactPerson}
                    </p>
                  )}
                </div>

                {/* 統一編號 */}
                <div>
                  <label className="block text-xs font-medium text-slate-600 mb-1">
                    統一編號 (8碼數字)
                  </label>
                  <input
                    id="vend-input-taxId"
                    type="text"
                    maxLength={8}
                    value={formData.taxId}
                    onChange={(e) => setFormData({ ...formData, taxId: e.target.value })}
                    placeholder="例: 23528809"
                    className={`w-full px-3 py-2 border rounded-lg text-sm font-mono focus:outline-hidden focus:ring-2 ${
                      formErrors.taxId
                        ? 'border-rose-300 ring-1 ring-rose-300 focus:ring-rose-500'
                        : 'border-slate-300 focus:ring-teal-500'
                    }`}
                  />
                  {formErrors.taxId && (
                    <p className="text-xs text-rose-600 mt-1 flex items-center gap-1">
                      <AlertCircle className="w-3.5 h-3.5" />
                      {formErrors.taxId}
                    </p>
                  )}
                </div>

                {/* 英文名 */}
                <div>
                  <label className="block text-xs font-medium text-slate-600 mb-1">
                    英文名
                  </label>
                  <input
                    id="vend-input-englishName"
                    type="text"
                    value={formData.englishName}
                    onChange={(e) => setFormData({ ...formData, englishName: e.target.value })}
                    placeholder="例: Synnex Logistics Inc."
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:outline-hidden focus:ring-2 focus:ring-teal-500"
                  />
                </div>

                {/* 部門 */}
                <div>
                  <label className="block text-xs font-medium text-slate-600 mb-1">
                    部門
                  </label>
                  <input
                    id="vend-input-department"
                    type="text"
                    value={formData.department}
                    onChange={(e) => setFormData({ ...formData, department: e.target.value })}
                    placeholder="例: 業務二部"
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:outline-hidden focus:ring-2 focus:ring-teal-500"
                  />
                </div>

                {/* 電話＊ */}
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    電話 <span className="text-rose-500">＊必填</span>
                  </label>
                  <input
                    id="vend-input-phone"
                    type="text"
                    value={formData.phone}
                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                    placeholder="例: 02-2506-3320"
                    className={`w-full px-3 py-2 border rounded-lg text-sm focus:outline-hidden focus:ring-2 ${
                      formErrors.phone
                        ? 'border-rose-300 ring-1 ring-rose-300 focus:ring-rose-500'
                        : 'border-slate-300 focus:ring-teal-500'
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
                    id="vend-input-email"
                    type="email"
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    placeholder="例: service@tw.synnex-grp.com"
                    className={`w-full px-3 py-2 border rounded-lg text-sm focus:outline-hidden focus:ring-2 ${
                      formErrors.email
                        ? 'border-rose-300 ring-1 ring-rose-300 focus:ring-rose-500'
                        : 'border-slate-300 focus:ring-teal-500'
                    }`}
                  />
                  {formErrors.email && (
                    <p className="text-xs text-rose-600 mt-1 flex items-center gap-1">
                      <AlertCircle className="w-3.5 h-3.5" />
                      {formErrors.email}
                    </p>
                  )}
                </div>

                {/* 付款條件 */}
                <div>
                  <label className="block text-xs font-medium text-slate-600 mb-1">
                    付款條件
                  </label>
                  <input
                    id="vend-input-paymentTerms"
                    type="text"
                    value={formData.paymentTerms}
                    onChange={(e) => setFormData({ ...formData, paymentTerms: e.target.value })}
                    placeholder="例: 月結45天 / 訂金50%"
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:outline-hidden focus:ring-2 focus:ring-teal-500"
                  />
                </div>
              </div>

              {/* 地址* */}
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  地址 <span className="text-rose-500">＊必填</span>
                </label>
                <input
                  id="vend-input-address"
                  type="text"
                  value={formData.address}
                  onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                  placeholder="例: 台北市中山區民生東路三段75號"
                  className={`w-full px-3 py-2 border rounded-lg text-sm focus:outline-hidden focus:ring-2 ${
                    formErrors.address
                      ? 'border-rose-300 ring-1 ring-rose-300 focus:ring-rose-500'
                      : 'border-slate-300 focus:ring-teal-500'
                  }`}
                />
                {formErrors.address && (
                  <p className="text-xs text-rose-600 mt-1 flex items-center gap-1">
                    <AlertCircle className="w-3.5 h-3.5" />
                    {formErrors.address}
                  </p>
                )}
              </div>

              {/* 備註 */}
              <div>
                <label className="block text-xs font-medium text-slate-600 mb-1">
                  備註
                </label>
                <textarea
                  id="vend-input-notes"
                  rows={2}
                  value={formData.notes}
                  onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                  placeholder="進貨交期、退換貨規範、合作窗口備案..."
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:outline-hidden focus:ring-2 focus:ring-teal-500"
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
                  id="btn-submit-vendor-form"
                  type="submit"
                  className="flex items-center gap-2 px-5 py-2 bg-teal-600 hover:bg-teal-700 text-white text-sm font-medium rounded-lg shadow-xs transition"
                >
                  <CheckCircle2 className="w-4 h-4" />
                  {editingVendor ? '更新廠商' : '儲存廠商'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
