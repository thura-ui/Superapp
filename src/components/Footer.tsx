import { Globe } from 'lucide-react';

export default function Footer() {
  return (
    <footer className="bg-[#021a19] border-t border-white/10 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        <div className="grid grid-cols-2 md:grid-cols-5 gap-8">
          <div className="col-span-2 md:col-span-1">
            <div className="flex items-center gap-2 mb-4">
              <div className="w-8 h-8 bg-gradient-to-br from-teal-400 to-cyan-500 rounded-lg flex items-center justify-center">
                <Globe className="w-4 h-4 text-white" />
              </div>
              <span className="text-lg font-black text-white">eSim Connect</span>
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
          <p className="text-white/40 text-xs">2025 by Montserrat, Open Sans. eSim Connect.</p>
        </div>
      </div>
    </footer>
  );
}
