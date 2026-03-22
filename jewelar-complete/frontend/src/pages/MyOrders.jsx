import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { FiPackage, FiChevronRight, FiClock, FiCheckCircle, FiTruck } from "react-icons/fi";
import api from "../utils/axios";
import Spinner from "../components/common/Spinner";
import { formatPrice, formatDate } from "../utils/helpers";

export default function MyOrders() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get("/orders/my")
       .then((r) => setOrders(r.data.orders))
       .catch(console.error)
       .finally(() => setLoading(false));
  }, []);

  // Helper for status styling since we moved away from the old 'badge' class
  const getStatusStyles = (status) => {
    switch (status?.toLowerCase()) {
      case 'delivered': return 'bg-emerald-50 text-emerald-700 border-emerald-100';
      case 'processing': return 'bg-amber-50 text-amber-700 border-amber-100';
      case 'shipped': return 'bg-blue-50 text-blue-700 border-blue-100';
      default: return 'bg-slate-50 text-slate-600 border-slate-100';
    }
  };

  if (loading) return <Spinner fullscreen />;

  return (
    <div className="min-h-screen bg-slate-50/50 py-12 px-6">
      <div className="max-w-4xl mx-auto">
        
        {/* ── Header Section ── */}
        <div className="mb-10 flex flex-col md:flex-row md:items-end justify-between gap-4">
          <div>
            <h1 className="font-serif text-3xl text-slate-900 tracking-tight">Order History</h1>
            <p className="text-slate-500 mt-1 font-medium">
              Track and manage your {orders.length} recent purchase{orders.length !== 1 ? "s" : ""}
            </p>
          </div>
          <Link 
            to="/products" 
            className="text-sm font-bold text-amber-600 hover:text-amber-700 flex items-center gap-2 transition-colors"
          >
            Continue Shopping <FiChevronRight />
          </Link>
        </div>

        {orders.length === 0 ? (
          /* ── Empty State ── */
          <div className="bg-white rounded-[2.5rem] border border-slate-100 p-16 text-center shadow-sm">
            <div className="w-20 h-20 bg-slate-50 rounded-full flex items-center justify-center mx-auto mb-6">
              <FiPackage className="text-slate-300 text-3xl" />
            </div>
            <h3 className="font-serif text-2xl text-slate-900 mb-2">No orders yet</h3>
            <p className="text-slate-500 mb-8 max-w-xs mx-auto">
              Your future treasures will appear here once you've made a purchase.
            </p>
            <Link 
              to="/products" 
              className="inline-flex bg-slate-900 text-white px-8 py-3.5 rounded-full font-bold hover:bg-slate-800 transition-all shadow-lg shadow-slate-900/10"
            >
              Explore Collections
            </Link>
          </div>
        ) : (
          /* ── Orders List ── */
          <div className="space-y-4">
            {orders.map((order) => (
              <Link
                key={order._id}
                to={`/my-orders/${order._id}`} // Points to specific order detail
                className="group bg-white rounded-3xl border border-slate-100 p-6 flex flex-col md:flex-row md:items-center gap-6 hover:shadow-xl hover:shadow-slate-200/50 transition-all duration-300"
              >
                {/* Order Identity */}
                <div className="flex items-center gap-4 flex-shrink-0">
                  <div className="w-14 h-14 bg-amber-50 rounded-2xl flex items-center justify-center text-amber-600 group-hover:bg-amber-500 group-hover:text-white transition-colors duration-300">
                    <FiPackage size={24} />
                  </div>
                  <div>
                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Order ID</p>
                    <p className="font-mono text-sm font-bold text-slate-900">#{order._id.slice(-8).toUpperCase()}</p>
                    <div className="flex items-center gap-1.5 text-slate-400 text-xs mt-0.5">
                      <FiClock size={12} />
                      {formatDate(order.createdAt)}
                    </div>
                  </div>
                </div>

                {/* Product Summary */}
                <div className="flex-1 md:border-l md:border-slate-50 md:pl-8">
                  <div className="flex flex-wrap gap-2 mb-2">
                    {order.items.slice(0, 2).map((item, idx) => (
                      <span key={idx} className="bg-slate-50 text-slate-700 px-3 py-1 rounded-lg text-xs font-medium border border-slate-100">
                        {item.name}
                      </span>
                    ))}
                    {order.items.length > 2 && (
                      <span className="text-slate-400 text-xs font-medium self-center">
                        + {order.items.length - 2} more
                      </span>
                    )}
                  </div>
                  <p className="text-xs text-slate-400">
                    Total items: <span className="font-bold text-slate-600">{order.items.length}</span>
                  </p>
                </div>

                {/* Status and Price */}
                <div className="flex items-center justify-between md:flex-col md:items-end md:justify-center gap-4 flex-shrink-0 md:min-w-[140px]">
                  <p className="text-lg font-bold text-slate-900">{formatPrice(order.totalPrice)}</p>
                  <div className={`px-4 py-1.5 rounded-full text-[10px] font-bold uppercase tracking-wider border ${getStatusStyles(order.orderStatus)}`}>
                    {order.orderStatus}
                  </div>
                </div>

                <div className="hidden md:block text-slate-300 group-hover:text-amber-500 group-hover:translate-x-1 transition-all">
                  <FiChevronRight size={24} />
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}