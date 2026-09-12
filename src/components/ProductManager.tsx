import React, { useState, useRef } from 'react';
import { Product } from '../types';
import { Plus, Search, Edit2, Trash2, Package, Image as ImageIcon, TrendingUp, AlertTriangle, CheckCircle2, AlertCircle, X, Upload } from 'lucide-react';

interface ProductManagerProps {
  products: Product[];
  onAddProduct: (product: Omit<Product, 'id' | 'createdAt' | 'updatedAt'>) => void;
  onUpdateProduct: (product: Product) => void;
  onDeleteProduct: (id: string) => void;
}

export const ProductManager: React.FC<ProductManagerProps> = ({
  products,
  onAddProduct,
  onUpdateProduct,
  onDeleteProduct,
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [deleteConfirmId, setDeleteConfirmId] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Form State
  const [formData, setFormData] = useState({
    name: '',
    cost: '',
    price: '',
    image: '',
    spec: '',
    stock: '',
  });

  const [formErrors, setFormErrors] = useState<Record<string, string>>({});

  const filteredProducts = products.filter(
    (p) =>
      p.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (p.spec && p.spec.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  const openAddModal = () => {
    setEditingProduct(null);
    setFormData({
      name: '',
      cost: '',
      price: '',
      image: '',
      spec: '',
      stock: '10',
    });
    setFormErrors({});
    setIsModalOpen(true);
  };

  const openEditModal = (product: Product) => {
    setEditingProduct(product);
    setFormData({
      name: product.name,
      cost: product.cost.toString(),
      price: product.price.toString(),
      image: product.image || '',
      spec: product.spec || '',
      stock: product.stock.toString(),
    });
    setFormErrors({});
    setIsModalOpen(true);
  };

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setFormData((prev) => ({ ...prev, image: reader.result as string }));
      };
      reader.readAsDataURL(file);
    }
  };

  const validateForm = () => {
    const errors: Record<string, string> = {};
    if (!formData.name.trim()) {
      errors.name = '請輸入產品名稱 (必填)';
    }

    const costNum = Number(formData.cost);
    if (formData.cost === '' || isNaN(costNum) || costNum < 0) {
      errors.cost = '請輸入有效的成本金額 (必填，需為大於等於0之數字)';
    }

    const priceNum = Number(formData.price);
    if (formData.price === '' || isNaN(priceNum) || priceNum < 0) {
      errors.price = '請輸入有效的售價金額 (必填，需為大於等於0之數字)';
    } else if (costNum > priceNum) {
      // warning or error notice
    }

    const stockNum = Number(formData.stock);
    if (formData.stock !== '' && (isNaN(stockNum) || stockNum < 0)) {
      errors.stock = '庫存數量需為非負整數';
    }

    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateForm()) return;

    const parsedData = {
      name: formData.name.trim(),
      cost: Number(formData.cost),
      price: Number(formData.price),
      image: formData.image.trim() || undefined,
      spec: formData.spec.trim() || undefined,
      stock: formData.stock === '' ? 0 : Math.floor(Number(formData.stock)),
    };

    if (editingProduct) {
      onUpdateProduct({
        ...editingProduct,
        ...parsedData,
        updatedAt: new Date().toISOString(),
      });
    } else {
      onAddProduct(parsedData);
    }
    setIsModalOpen(false);
  };

  const calculateMargin = (cost: number, price: number) => {
    if (price <= 0) return 0;
    return (((price - cost) / price) * 100).toFixed(1);
  };

  return (
    <div className="space-y-6">
      {/* Top Action Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-5 rounded-xl border border-slate-200 shadow-xs">
        <div>
          <h2 className="text-xl font-bold text-slate-800 flex items-center gap-2">
            <Package className="w-6 h-6 text-amber-600" />
            產品管理
          </h2>
          <p className="text-sm text-slate-500 mt-1">
            管理產品品項、定價、成本與庫存規格（標示 <span className="text-rose-500 font-semibold">＊</span> 為必填欄位）
          </p>
        </div>
        <div className="flex items-center gap-3">
          <div className="relative">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              id="product-search-input"
              type="text"
              placeholder="搜尋產品名稱、規格細節..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-9 pr-4 py-2 border border-slate-300 rounded-lg text-sm focus:outline-hidden focus:ring-2 focus:ring-amber-500 focus:border-amber-500 w-64 bg-slate-50"
            />
          </div>
          <button
            id="btn-add-product"
            onClick={openAddModal}
            className="flex items-center gap-2 px-4 py-2 bg-amber-600 hover:bg-amber-700 text-white text-sm font-medium rounded-lg transition shadow-xs"
          >
            <Plus className="w-4 h-4" />
            新增產品
          </button>
        </div>
      </div>

      {/* Products Grid / Table */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="bg-slate-50 text-slate-600 border-b border-slate-200 font-semibold text-xs uppercase tracking-wider">
              <tr>
                <th className="px-5 py-3.5">產品品項</th>
                <th className="px-5 py-3.5">規格說明</th>
                <th className="px-5 py-3.5 text-right">成本 (NT$)</th>
                <th className="px-5 py-3.5 text-right">預設售價 (NT$)</th>
                <th className="px-5 py-3.5 text-center">毛利率</th>
                <th className="px-5 py-3.5 text-center">庫存數量</th>
                <th className="px-5 py-3.5 text-right">操作</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredProducts.length === 0 ? (
                <tr>
                  <td colSpan={7} className="text-center py-12 text-slate-400">
                    <Package className="w-10 h-10 mx-auto mb-2 opacity-40" />
                    查無符合之產品資料
                  </td>
                </tr>
              ) : (
                filteredProducts.map((product) => {
                  const margin = calculateMargin(product.cost, product.price);
                  const isLowStock = product.stock > 0 && product.stock <= 10;
                  const isOutOfStock = product.stock === 0;

                  return (
                    <tr key={product.id} className="hover:bg-slate-50/70 transition">
                      <td className="px-5 py-4">
                        <div className="flex items-center gap-3">
                          <div className="w-12 h-12 rounded-lg bg-slate-100 border border-slate-200 overflow-hidden shrink-0 flex items-center justify-center">
                            {product.image ? (
                              <img
                                src={product.image}
                                alt={product.name}
                                className="w-full h-full object-cover"
                                onError={(e) => {
                                  // Fallback to icon if broken link
                                  (e.target as HTMLElement).style.display = 'none';
                                }}
                              />
                            ) : (
                              <ImageIcon className="w-5 h-5 text-slate-400" />
                            )}
                          </div>
                          <div>
                            <div className="font-semibold text-slate-800">{product.name}</div>
                            <div className="text-xs text-slate-400">ID: {product.id}</div>
                          </div>
                        </div>
                      </td>
                      <td className="px-5 py-4 text-xs text-slate-600 max-w-[220px]">
                        {product.spec ? (
                          <span className="line-clamp-2" title={product.spec}>
                            {product.spec}
                          </span>
                        ) : (
                          <span className="text-slate-400 italic">標準品 (無特殊規格)</span>
                        )}
                      </td>
                      <td className="px-5 py-4 text-right font-mono text-slate-600 text-sm">
                        ${product.cost.toLocaleString()}
                      </td>
                      <td className="px-5 py-4 text-right font-mono font-semibold text-slate-900 text-sm">
                        ${product.price.toLocaleString()}
                      </td>
                      <td className="px-5 py-4 text-center">
                        <span
                          className={`inline-flex items-center gap-1 text-xs font-semibold px-2 py-0.5 rounded-full ${
                            Number(margin) >= 30
                              ? 'bg-emerald-50 text-emerald-700 border border-emerald-200/60'
                              : Number(margin) > 0
                              ? 'bg-amber-50 text-amber-700 border border-amber-200/60'
                              : 'bg-rose-50 text-rose-700 border border-rose-200/60'
                          }`}
                        >
                          <TrendingUp className="w-3 h-3" />
                          {margin}%
                        </span>
                      </td>
                      <td className="px-5 py-4 text-center">
                        <span
                          className={`inline-block px-2.5 py-0.5 text-xs font-medium rounded-full ${
                            isOutOfStock
                              ? 'bg-rose-100 text-rose-700'
                              : isLowStock
                              ? 'bg-amber-100 text-amber-800 font-semibold'
                              : 'bg-slate-100 text-slate-700'
                          }`}
                        >
                          {product.stock} 件
                          {isOutOfStock && ' (缺貨)'}
                          {isLowStock && ' (即將售罄)'}
                        </span>
                      </td>
                      <td className="px-5 py-4 text-right">
                        <div className="flex items-center justify-end gap-1.5">
                          <button
                            id={`btn-edit-prod-${product.id}`}
                            onClick={() => openEditModal(product)}
                            title="編輯產品"
                            className="p-1.5 text-slate-500 hover:text-amber-600 hover:bg-slate-100 rounded-md transition"
                          >
                            <Edit2 className="w-4 h-4" />
                          </button>
                          <button
                            id={`btn-del-prod-${product.id}`}
                            onClick={() => setDeleteConfirmId(product.id)}
                            title="刪除產品"
                            className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-md transition"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Delete Confirmation Modal */}
      {deleteConfirmId && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-xs p-4">
          <div className="bg-white rounded-xl max-w-sm w-full p-6 shadow-xl border border-slate-200">
            <h3 className="text-lg font-bold text-slate-800">確定刪除此項產品？</h3>
            <p className="text-sm text-slate-600 mt-2">
              刪除後將無法從報價單下拉選單中選擇此產品。
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
                  onDeleteProduct(deleteConfirmId);
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
                <Package className="w-5 h-5 text-amber-600" />
                {editingProduct ? '編輯產品資料' : '新增產品'}
              </h3>
              <button
                onClick={() => setIsModalOpen(false)}
                className="p-1.5 text-slate-400 hover:text-slate-600 rounded-lg hover:bg-slate-100 transition"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4 mt-4">
              {/* 產品名稱* */}
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  產品名稱 <span className="text-rose-500">＊必填</span>
                </label>
                <input
                  id="prod-input-name"
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  placeholder="例: 27吋 4K IPS 專業創作者顯示器"
                  className={`w-full px-3 py-2 border rounded-lg text-sm focus:outline-hidden focus:ring-2 ${
                    formErrors.name
                      ? 'border-rose-300 ring-1 ring-rose-300 focus:ring-rose-500'
                      : 'border-slate-300 focus:ring-amber-500'
                  }`}
                />
                {formErrors.name && (
                  <p className="text-xs text-rose-600 mt-1 flex items-center gap-1">
                    <AlertCircle className="w-3.5 h-3.5" />
                    {formErrors.name}
                  </p>
                )}
              </div>

              {/* 成本* 與 售價* */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    成本金額 (NT$) <span className="text-rose-500">＊必填</span>
                  </label>
                  <input
                    id="prod-input-cost"
                    type="number"
                    min="0"
                    step="1"
                    value={formData.cost}
                    onChange={(e) => setFormData({ ...formData, cost: e.target.value })}
                    placeholder="例: 11500"
                    className={`w-full px-3 py-2 border rounded-lg text-sm font-mono focus:outline-hidden focus:ring-2 ${
                      formErrors.cost
                        ? 'border-rose-300 ring-1 ring-rose-300 focus:ring-rose-500'
                        : 'border-slate-300 focus:ring-amber-500'
                    }`}
                  />
                  {formErrors.cost && (
                    <p className="text-xs text-rose-600 mt-1 flex items-center gap-1">
                      <AlertCircle className="w-3.5 h-3.5" />
                      {formErrors.cost}
                    </p>
                  )}
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    建議售價 (NT$) <span className="text-rose-500">＊必填</span>
                  </label>
                  <input
                    id="prod-input-price"
                    type="number"
                    min="0"
                    step="1"
                    value={formData.price}
                    onChange={(e) => setFormData({ ...formData, price: e.target.value })}
                    placeholder="例: 16800"
                    className={`w-full px-3 py-2 border rounded-lg text-sm font-mono focus:outline-hidden focus:ring-2 ${
                      formErrors.price
                        ? 'border-rose-300 ring-1 ring-rose-300 focus:ring-rose-500'
                        : 'border-slate-300 focus:ring-amber-500'
                    }`}
                  />
                  {formErrors.price && (
                    <p className="text-xs text-rose-600 mt-1 flex items-center gap-1">
                      <AlertCircle className="w-3.5 h-3.5" />
                      {formErrors.price}
                    </p>
                  )}
                </div>
              </div>

              {/* Profit Preview Widget */}
              {Number(formData.price) > 0 && Number(formData.cost) >= 0 && (
                <div className="bg-amber-50/70 border border-amber-200/80 rounded-lg p-3 text-xs flex items-center justify-between text-amber-900">
                  <span>單件毛利：NT$ {(Number(formData.price) - Number(formData.cost)).toLocaleString()}</span>
                  <span className="font-semibold">
                    預估毛利率：{calculateMargin(Number(formData.cost), Number(formData.price))}%
                  </span>
                </div>
              )}

              {/* 庫存數量 與 規格 */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-medium text-slate-700 mb-1">
                    庫存數量 (件)
                  </label>
                  <input
                    id="prod-input-stock"
                    type="number"
                    min="0"
                    step="1"
                    value={formData.stock}
                    onChange={(e) => setFormData({ ...formData, stock: e.target.value })}
                    placeholder="例: 25"
                    className={`w-full px-3 py-2 border rounded-lg text-sm font-mono focus:outline-hidden focus:ring-2 ${
                      formErrors.stock
                        ? 'border-rose-300 ring-1 ring-rose-300 focus:ring-rose-500'
                        : 'border-slate-300 focus:ring-amber-500'
                    }`}
                  />
                  {formErrors.stock && (
                    <p className="text-xs text-rose-600 mt-1 flex items-center gap-1">
                      <AlertCircle className="w-3.5 h-3.5" />
                      {formErrors.stock}
                    </p>
                  )}
                </div>

                <div>
                  <label className="block text-xs font-medium text-slate-700 mb-1">
                    規格說明
                  </label>
                  <input
                    id="prod-input-spec"
                    type="text"
                    value={formData.spec}
                    onChange={(e) => setFormData({ ...formData, spec: e.target.value })}
                    placeholder="例: 3840x2160 / 99% DCI-P3"
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:outline-hidden focus:ring-2 focus:ring-amber-500"
                  />
                </div>
              </div>

              {/* 圖片 (URL / 檔案上傳預覽) */}
              <div>
                <label className="block text-xs font-medium text-slate-700 mb-1">
                  產品圖片 (網址或上傳本機圖檔)
                </label>
                <div className="flex gap-2">
                  <input
                    id="prod-input-image"
                    type="text"
                    value={formData.image}
                    onChange={(e) => setFormData({ ...formData, image: e.target.value })}
                    placeholder="輸入圖片 URL (https://...)"
                    className="flex-1 px-3 py-2 border border-slate-300 rounded-lg text-sm focus:outline-hidden focus:ring-2 focus:ring-amber-500"
                  />
                  <input
                    type="file"
                    ref={fileInputRef}
                    onChange={handleImageUpload}
                    accept="image/*"
                    className="hidden"
                  />
                  <button
                    type="button"
                    onClick={() => fileInputRef.current?.click()}
                    className="px-3 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg text-xs font-medium flex items-center gap-1 border border-slate-300"
                  >
                    <Upload className="w-3.5 h-3.5" />
                    上傳
                  </button>
                </div>

                {formData.image && (
                  <div className="mt-2 flex items-center gap-3 p-2 bg-slate-50 border border-slate-200 rounded-lg">
                    <img
                      src={formData.image}
                      alt="預覽"
                      className="w-14 h-14 object-cover rounded border border-slate-200"
                    />
                    <div className="text-xs text-slate-500">
                      <p className="font-medium text-slate-700">圖片預覽成功</p>
                      <button
                        type="button"
                        onClick={() => setFormData({ ...formData, image: '' })}
                        className="text-rose-600 hover:underline mt-0.5"
                      >
                        移除圖片
                      </button>
                    </div>
                  </div>
                )}
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
                  id="btn-submit-product-form"
                  type="submit"
                  className="flex items-center gap-2 px-5 py-2 bg-amber-600 hover:bg-amber-700 text-white text-sm font-medium rounded-lg shadow-xs transition"
                >
                  <CheckCircle2 className="w-4 h-4" />
                  {editingProduct ? '更新產品' : '儲存產品'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
