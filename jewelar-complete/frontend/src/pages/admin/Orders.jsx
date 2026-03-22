import { useState, useEffect } from "react";
import toast from "react-hot-toast";
import { FiChevronDown, FiFilter, FiPackage, FiLoader, FiSearch } from "react-icons/fi";
import api from "../../utils/axios";
import Spinner from "../../components/common/Spinner";
import { formatPrice, formatDate } from "../../utils/helpers";

const STATUSES = ["placed", "confirmed", "shipped", "delivered", "cancelled"];

export default function AdminOrders() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState("");
  const [updating, setUpdating] = useState(null);

  const fetchOrders = async () => {
    setLoading(true);
    try {
      const params = filter ? `?status=${filter}` : "";
      const r = await api.get(`/orders${params}`);
      setOrders(r.data.orders);
    } catch (err) {
      toast.error("Failed to load orders");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOrders();
  }, [filter]);

  const handleStatusChange = async (orderId, newStatus) => {
    setUpdating(orderId);
    try {
      await api.put(`/orders/${orderId}/status`, { orderStatus: newStatus });
      toast.success(`Order ${newStatus} successfully`);
      setOrders((prev) =>
        prev.map((o) => (o._id === orderId ? { ...o, orderStatus: newStatus } : o))
      );
    } catch (err) {
      toast.error(err.response?.data?.message || "Update failed");
    } finally {
      setUpdating(null);
    }
  };

  // Status Badge Logic
  const getStatusColor = (status) => {
    switch (status) {
      case "delivered": return "bg-emerald-50 text-emerald-700 border-emerald-200";
      case "cancelled": return "bg-rose-50 text-rose-700 border-rose-200";
      case "shipped": return "bg-blue-50 text-blue-700 border-blue-200";
      case "confirmed": return "bg-indigo-50 text-indigo-700 border-indigo-200";
      default: return "bg-amber-50 text-amber-700 border-amber-200";
    }
  };

  return (
    <div className="min-h-screen bg-slate-50/50 pb-20">
      {/* ── Header Section ── */}
      <div className="bg-white border-b border-slate-100 pt-12 pb-10 mb-8">
        <div className="max-w-7xl mx-auto px-6 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div>
            <h1 className="font-serif text-3xl text-slate-900 tracking-tight">Order Management</h1>
            <p className="text-slate-500 font-medium mt-1">
              Currently viewing <span className="text-slate-900 font-bold">{orders.length}</span> transaction records
            </p>
          </div>

          <div className="flex items-center gap-3">
            <div className="relative group">
              <FiFilter className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-indigo-500 transition-colors" />
              <select
                value={filter}
                onChange={(e) => setFilter(e.target.value)}
                className="bg-white border border-slate-200 rounded-2xl py-3 pl-10 pr-10 text-xs font-bold uppercase tracking-widest text-slate-700 appearance-none cursor-pointer focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-500 outline-none transition-all shadow-sm"
              >
                <option value="">All Statuses</option>
                {STATUSES.map((s) => (
                  <option key={s} value={s} className="capitalize">{s}</option>
                ))}
              </select>
              <FiChevronDown className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-6">
        {loading ? (
          <div className="py-20 flex justify-center"><Spinner /></div>
        ) : (
          <div className="bg-white rounded-[2.5rem] shadow-2xl shadow-slate-200/50 border border-slate-100 overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left">
                <thead>
                  <tr className="bg-slate-50/50 border-b border-slate-100">
                    {["Reference", "Customer", "Details", "Revenue", "Payment", "Progress", "Date"].map((h) => (
                      <th key={h} className="px-6 py-5 text-[10px] font-bold text-slate-400 uppercase tracking-[0.2em]">{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-50">
                  {orders.map((o) => (
                    <tr key={o._id} className="group hover:bg-slate-50/50 transition-all">
                      <td className="px-6 py-5">
                        <span className="font-mono text-[11px] font-bold text-indigo-600 bg-indigo-50 px-3 py-1.5 rounded-lg border border-indigo-100">
                          #{o._id.slice(-6).toUpperCase()}
                        </span>
                      </td>
                      <td className="px-6 py-5">
                        <p className="text-sm font-bold text-slate-900">{o.user?.name || "Guest"}</p>
                        <p className="text-[10px] text-slate-400 font-medium truncate max-w-[120px]">{o.user?.email}</p>
                      </td>
                      <td className="px-6 py-5">
                        <p className="text-xs font-medium text-slate-600">
                          {o.items?.length} {o.items?.length === 1 ? "Item" : "Items"}
                        </p>
                      </td>
                      <td className="px-6 py-5">
                        <span className="text-sm font-bold text-slate-900">{formatPrice(o.totalPrice)}</span>
                      </td>
                      <td className="px-6 py-5">
                        <span className={`px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-widest ${
                          o.paymentStatus === "paid" 
                            ? "bg-emerald-50 text-emerald-600" 
                            : "bg-amber-50 text-amber-600"
                        }`}>
                          {o.paymentStatus}
                        </span>
                      </td>
                      <td className="px-6 py-5">
                        <div className="relative inline-block w-full min-w-[130px]">
                          {updating === o._id ? (
                            <div className="flex items-center gap-2 text-indigo-500 font-bold text-[10px] uppercase tracking-widest pl-3">
                              <FiLoader className="animate-spin" /> Updating...
                            </div>
                          ) : (
                            <div className="relative">
                              <select
                                value={o.orderStatus}
                                onChange={(e) => handleStatusChange(o._id, e.target.value)}
                                className={`w-full appearance-none cursor-pointer pl-3 pr-8 py-2 rounded-xl text-[10px] font-bold uppercase tracking-widest border transition-all ${getStatusColor(o.orderStatus)}`}
                              >
                                {STATUSES.map((s) => (
                                  <option key={s} value={s} className="bg-white text-slate-900">{s}</option>
                                ))}
                              </select>
                              <FiChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none opacity-50" />
                            </div>
                          )}
                        </div>
                      </td>
                      <td className="px-6 py-5">
                        <p className="text-[11px] text-slate-400 font-medium italic">{formatDate(o.createdAt)}</p>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {orders.length === 0 && (
              <div className="py-24 text-center">
                <div className="w-20 h-20 bg-slate-50 rounded-full flex items-center justify-center mx-auto mb-4 border border-slate-100">
                  <FiPackage className="text-slate-200 text-3xl" />
                </div>
                <h3 className="text-slate-900 font-bold">No orders found</h3>
                <p className="text-slate-400 text-sm mt-1">Try clearing your filters to see all records.</p>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}