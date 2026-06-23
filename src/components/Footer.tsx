export default function Footer() {
  return (
    <footer className="bg-[#021a19] border-t border-white/10 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        <div className="grid grid-cols-2 md:grid-cols-5 gap-8">
          <div className="col-span-2 md:col-span-1">
            <div className="flex items-center gap-2 mb-4">
              <img
                src="/s_i_m_l_e_s_s-removebg copy copy.png"
                alt="SIMLESS Logo"
                className="w-9 h-9 object-contain"
              />
              <span className="text-lg font-black">
                <span className="text-[#1a8cff]">SIMLESS</span>
              </span>
            </div>
            <p className="text-white/50 text-sm">High Speed</p>
            <p className="text-white/50 text-sm">Reliable Support</p>
          </div>

          <div>
            <h4 className="text-white font-bold text-sm mb-3">Account Management</h4>
            <ul className="space-y-2 text-white/50 text-sm">
              <li>Check Status</li>
              <li>Change Plan</li>
              <li>Top-up</li>
            </ul>
          </div>

          <div>
            <h4 className="text-white font-bold text-sm mb-3">Help & Support</h4>
            <ul className="space-y-2 text-white/50 text-sm">
              <li>FAQ</li>
              <li>Contact Us</li>
            </ul>
          </div>

          <div>
            <h4 className="text-white font-bold text-sm mb-3">Data History</h4>
            <ul className="space-y-2 text-white/50 text-sm">
              <li>View previous month</li>
            </ul>
          </div>

          <div>
            <h4 className="text-white font-bold text-sm mb-3">Links</h4>
            <ul className="space-y-2 text-white/50 text-sm">
              <li>About Us</li>
              <li>Payments</li>
              <li>Blog</li>
              <li>Contact Us</li>
            </ul>
          </div>
        </div>

        <div className="mt-10 pt-6 border-t border-white/10 text-center">
          <p className="text-white/40 text-xs">&copy; 2026 by SIMLESS Development, simless-mm.com</p>
        </div>
      </div>
    </footer>
  );
}
