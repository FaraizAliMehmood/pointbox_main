import { useState, useEffect } from "react";
import { Menu, X, Gift, User } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import { customerApi } from "@/services/api";

export const NavBar = () => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [logo, setLogo] = useState<string | null>(null);
  const [logoLoading, setLogoLoading] = useState(true);

  useEffect(() => {
    const fetchLogo = async () => {
      try {
        setLogoLoading(true);
        const response = await customerApi.getWebSettings();
        if (response.success && response.data) {
          setLogo(response.data.logo || response.data.logoUrl || null);
        }
      } catch (error) {
        console.error('Failed to fetch logo:', error);
      } finally {
        setLogoLoading(false);
      }
    };

    fetchLogo();
  }, []);

  const navLinks = [
    { name: "Brands", href: "/brands" },
    { name: "Newsletters", href: "/newsletter" },
    { name: "How it's work", href: "/how_it_works" },
    { name: "FAQs", href: "/faqs" }
  ];

  return (
    <header className="sticky top-0 z-50 bg-white border-b border-gray-200 shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          <Link to="/" className="flex items-center gap-2">
            {logoLoading ? (
              <div className="flex items-center justify-center w-10 h-10 bg-gradient-to-br from-purple-600 to-indigo-600 rounded-xl">
                <Gift className="w-6 h-6 text-white" />
              </div>
            ) : logo ? (
              <div className="relative w-10 h-10">
                <img
                  src={logo}
                  alt="Logo"
                  className="w-full h-full object-contain rounded-xl"
                />
              </div>
            ) : (
              <div className="flex items-center justify-center w-10 h-10 bg-gradient-to-br from-purple-600 to-indigo-600 rounded-xl">
                <Gift className="w-6 h-6 text-white" />
              </div>
            )}
            <div>
              <div className="text-xl text-gray-900">PointBox</div>
              <div className="text-xs text-gray-500 -mt-1">Loyalty Program</div>
            </div>
          </Link>

          <nav className="hidden lg:flex items-center gap-8">
            {navLinks.map((link) => (
              <Link
                key={link.name}
                to={link.href}
                className="text-gray-700 hover:text-purple-600 transition-colors"
              >
                {link.name}
              </Link>
            ))}
          </nav>

          <div className="hidden lg:flex items-center gap-4">
            <Link to="/login">
              <Button variant="outline" className="gap-2">
                <User className="w-4 h-4" />
                Sign In
              </Button>
            </Link>

            <Link to="/signup">
              <Button className="bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700 text-white">
                Join Free
              </Button>
            </Link>
          </div>

          <Button
            className="lg:hidden p-2 bg-gradient-to-r from-purple-600 to-indigo-600"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          >
            {mobileMenuOpen ? (
              <X className="w-6 h-6 text-white" />
            ) : (
              <Menu className="w-6 h-6 text-white" />
            )}
          </Button>
        </div>

        {mobileMenuOpen && (
          <div className="lg:hidden py-4 border-t border-gray-200">
            <nav className="flex flex-col gap-4 mb-4">
              {navLinks.map((link) => (
                <Link
                  key={link.name}
                  to={link.href}
                  className="text-gray-700 hover:text-purple-600 transition-colors py-2"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  {link.name}
                </Link>
              ))}
            </nav>

            <div className="flex flex-col gap-3 pt-4 border-t border-gray-200">
              <Link to="/login" className="w-full" onClick={() => setMobileMenuOpen(false)}>
                <Button variant="outline" className="w-full gap-2 justify-center">
                  <User className="w-4 h-4" />
                  Sign In
                </Button>
              </Link>

              <Link to="/signup" className="w-full" onClick={() => setMobileMenuOpen(false)}>
                <Button className="w-full bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700 text-white">
                  Join Free
                </Button>
              </Link>
            </div>
          </div>
        )}
      </div>
    </header>
  );
};
