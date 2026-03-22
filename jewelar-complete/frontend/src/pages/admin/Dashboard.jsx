import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { FiPackage, FiShoppingBag, FiUsers, FiDollarSign, FiArrowRight, FiActivity, FiTrendingUp } from "react-icons/fi";
import api from "../../utils/axios";
import Spinner from "../../components/common/Spinner";
import { formatPrice, formatDate } from "../../utils/helpers";

const StatCard = ({ icon: Icon, label, value, color, delay }) => (
  <div className="bg-white rounded-[2rem] shadow-xl shadow-slate-200/50 p-6 border border-slate-100 flex items-center gap-5 hover:translate-y-[-4px] transition-all duration-300">
    <div className={`w-14 h-14 rounded-2xl flex items-center justify-center flex-shrink-0 shadow-lg ${color}`}>
      <Icon size={24} className="text-white" />
    </div>
    <div>
      <p className="text-[10px] font-bold text-slate-400 uppercase tracking-[0.2em] mb-1">{label}</p>
      <p className="font-serif text-2xl text-slate-900 font-bold">{value}</p>
    </div>
  </div>
);

export default function AdminDashboard() {
  const [stats, setStats] = useState(null);
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [sRes, oRes] = await Promise.all([
          api.get("/orders/stats"),
          api.get("/orders?limit=8"),
        ]);
        setStats(sRes.data.stats);
        setOrders(oRes.data.orders);
      } catch (err) {
        console.error("Dashboard Load Error:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  if (loading) return <Spinner fullscreen />;

  // Helper for status badges in admin view
  const getStatusStyle = (status) => {
    switch (status?.toLowerCase()) {
      case 'delivered': return 'bg-emerald-50 text-emerald-600 border-emerald-100';
      case 'processing': return 'bg-blue-50 text-blue-600 border-blue-100';
      case 'shipped': return 'bg-indigo-50 text-indigo-600 border-indigo-100';
      default: return 'bg-amber-50 text-amber-600 border-amber-100';
    }
  };

  return (
    <div className="min-h-screen bg-slate-50/50 pb-20">
      {/* ── Header ── */}
      <div className="bg-white border-b border-slate-100 pt-12 pb-10 mb-10">
        <div className="max-w-7xl mx-auto px-6 flex flex-col md:flex-row justify-between items-center gap-6">
          <div>
            <div className="flex items-center gap-3 mb-2">
               <span className="bg-indigo-600 text-white text-[10px] font-bold px-2 py-1 rounded-md uppercase tracking-tighter">System Live</span>
               <h1 className="font-serif text-3xl text-slate-900">Executive Overview</h1>
            </div>
            <p className="text-slate-500 font-medium italic">Welcome back, Chief Artisan 💎</p>
          </div>
          
          <div className="flex gap-3">
            <Link to="/admin/products" className="bg-slate-900 text-white px-6 py-3 rounded-2xl font-bold text-xs uppercase tracking-widest flex items-center gap-2 hover:bg-slate-800 transition-all shadow-lg shadow-slate-900/10">
              <FiShoppingBag /> Inventory
            </Link>
            <Link to="/admin/orders" className="bg-white border border-slate-200 text-slate-600 px-6 py-3 rounded-2xl font-bold text-xs uppercase tracking-widest flex items-center gap-2 hover:bg-slate-50 transition-all">
              <FiPackage /> All Orders
            </Link>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-6">
        {/* ── Stats Grid ── */}
        {stats && (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
            <StatCard icon={FiActivity} label="Total Orders" value={stats.totalOrders} color="bg-indigo-500 shadow-indigo-500/20" />
            <StatCard icon={FiDollarSign} label="Net Revenue" value={formatPrice(stats.totalRevenue)} color="bg-emerald-500 shadow-emerald-500/20" />
            <StatCard icon={FiTrendingUp} label="Pending" value={stats.pendingOrders} color="bg-amber-500 shadow-amber-500/20" />
            <StatCard icon={FiPackage} label="Delivered" value={stats.delivered || 0} color="bg-slate-900 shadow-slate-900/20" />
          </div>
        )}

        {/* ── Recent Transactions ── */}
        <div className="bg-white rounded-[2.5rem] shadow-2xl shadow-slate-200/50 border border-slate-100 overflow-hidden">
          <div className="px-8 py-8 border-b border-slate-50 flex items-center justify-between">
            <div>
              <h2 className="font-serif text-xl text-slate-900">Recent Transactions</h2>
              <p className="text-xs text-slate-400 font-bold uppercase tracking-widest mt-1">Live Order Stream</p>
            </div>
            <Link to="/admin/orders" className="text-indigo-600 font-bold text-sm flex items-center gap-1 hover:underline underline-offset-4">
              View Audit Log <FiArrowRight />
            </Link>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-slate-50/50">
                  {["Reference", "Client", "Order Size", "Amount", "Status", "Timestamp"].map((h) => (
                    <th key={h} className="px-8 py-4 text-[10px] font-bold text-slate-400 uppercase tracking-[0.2em]">
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-50">
                {orders.map((o) => (
                  <tr key={o._id} className="group hover:bg-slate-50/80 transition-all">
                    <td className="px-8 py-5">
                      <span className="font-mono text-[11px] font-bold text-indigo-600 bg-indigo-50 px-3 py-1.5 rounded-lg border border-indigo-100">
                        #{o._id.slice(-6).toUpperCase()}
                      </span>
                    </td>
                    <td className="px-8 py-5">
                      <p className="text-sm font-bold text-slate-900">{o.user?.name || "Guest"}</p>
                      <p className="text-[10px] text-slate-400 font-medium">{o.user?.email || "No email"}</p>
                    </td>
                    <td className="px-8 py-5 text-sm font-medium text-slate-600">
                      {o.items?.length} {o.items?.length === 1 ? 'item' : 'items'}
                    </td>
                    <td className="px-8 py-5">
                      <span className="text-sm font-bold text-slate-900">{formatPrice(o.totalPrice)}</span>
                    </td>
                    <td className="px-8 py-5">
                      <span className={`px-4 py-1.5 rounded-full text-[10px] font-bold uppercase tracking-widest border ${getStatusStyle(o.orderStatus)}`}>
                        {o.orderStatus}
                      </span>
                    </td>
                    <td className="px-8 py-5">
                      <p className="text-xs text-slate-400 font-medium">{formatDate(o.createdAt)}</p>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {orders.length === 0 && (
            <div className="text-center py-24">
              <div className="w-16 h-16 bg-slate-50 rounded-full flex items-center justify-center mx-auto mb-4 text-slate-200">
                 <FiPackage size={30} />
              </div>
              <p className="text-slate-400 font-medium italic">No transactions found in the logs.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}