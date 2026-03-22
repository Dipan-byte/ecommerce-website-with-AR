import { Link } from "react-router-dom";
import { GiDiamondRing } from "react-icons/gi";
import { FiInstagram, FiTwitter, FiFacebook } from "react-icons/fi";

export default function Footer() {
  return (
    <footer className="bg-slate-900 text-slate-300 border-t border-slate-800">
      <div className="max-w-7xl mx-auto px-6 lg:px-8 py-16">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-12 lg:gap-8">
          
          {/* ── Brand ── */}
          <div className="lg:col-span-1">
            <Link to="/" className="flex items-center gap-2 mb-5">
              <GiDiamondRing className="text-amber-500 text-3xl" />
              <span className="font-serif text-2xl text-white tracking-wide">
                Jewel<span className="text-amber-500">AR</span>
              </span>
            </Link>
            <p className="text-sm text-slate-400 leading-relaxed mb-6">
              Experience jewellery like never before — try before you buy with our AI-powered virtual try-on.
            </p>
            <div className="flex gap-4">
              {[FiInstagram, FiTwitter, FiFacebook].map((Icon, i) => (
                <a 
                  key={i} 
                  href="#" 
                  className="w-10 h-10 rounded-full border border-slate-700 flex items-center justify-center hover:bg-slate-800 hover:border-amber-500 hover:text-amber-500 transition-all duration-300"
                  aria-label="Social Link"
                >
                  <Icon size={18} />
                </a>
              ))}
            </div>
          </div>

          {/* ── Collections ── */}
          <div>
            <h4 className="font-serif text-white text-sm tracking-widest uppercase mb-6">Collections</h4>
            <ul className="space-y-3">
              {["Earrings", "Necklaces", "Rings", "Bracelets", "Nose Pins"].map((c) => (
                <li key={c}>
                  <Link 
                    to={`/products?category=${c.toLowerCase().replace(" ", "-")}`}
                    className="text-sm text-slate-400 hover:text-amber-400 transition-colors block"
                  >
                    {c}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* ── Help ── */}
          <div>
            <h4 className="font-serif text-white text-sm tracking-widest uppercase mb-6">Help</h4>
            <ul className="space-y-3 text-sm">
              {["FAQs", "Shipping Policy", "Returns & Exchange", "Size Guide", "Contact Us"].map((i) => (
                <li key={i}>
                  <a href="#" className="text-slate-400 hover:text-amber-400 transition-colors block">
                    {i}
                  </a>
                </li>
              ))}
            </ul>
          </div>

          {/* ── Try-On CTA ── */}
          <div>
            <h4 className="font-serif text-white text-sm tracking-widest uppercase mb-6">Virtual Try-On</h4>
            <p className="text-sm text-slate-400 mb-6 leading-relaxed">
              Try on earrings, necklaces & more from the comfort of your home. No commitment needed.
            </p>
            <Link 
              to="/try-on" 
              className="inline-block bg-amber-500 hover:bg-amber-400 text-slate-900 font-semibold text-sm py-3 px-6 rounded-full transition-all duration-300 shadow-lg shadow-amber-500/20 hover:shadow-amber-500/40"
            >
              Launch Try-On 🪄
            </Link>
          </div>
          
        </div>

        {/* ── Bottom Bar ── */}
        <div className="border-t border-slate-800 mt-16 pt-8 flex flex-col sm:flex-row items-center justify-between gap-4">
          <p className="text-xs text-slate-500">
            © {new Date().getFullYear()} JewelAR. Made for hackathons & jewellery lovers.
          </p>
          <p className="text-xs text-slate-500 flex items-center gap-1">
            Powered by MediaPipe Face Mesh ✨
          </p>
        </div>
      </div>
    </footer>
  );
}