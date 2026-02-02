import React, { useState, useEffect } from 'react';
import { createPageUrl } from '@/utils';
import { Link, useLocation } from 'react-router-dom';
import { Menu, X, ChevronDown, User as UserIcon, LogOut, Settings } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate } from "react-router-dom";
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import LanguageSwitcher from './LanguageSwitcher';

// import Login from "@/components/pages/Login";

export default function StickyNavbar() {
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [language, setLanguage] = useState(() => localStorage.getItem('madha_tv_language') || 'english');
  // const { contentMap, user } = useGlobalData();
  const location = useLocation();
  const [user, setUser] = useState(null);
  const navigate = useNavigate();



  const isHomePage = location.pathname === createPageUrl('Home');

  // useEffect(() => {
  //   const isLoggedIn = localStorage.getItem("isLoggedIn") === "true";

  //   if (isLoggedIn) {
  //     setUser({
  //       full_name: localStorage.getItem("user_name"),
  //       email: localStorage.getItem("user_email"),
  //     });
  //   } else {
  //     setUser(null);
  //   }
  // }, []);

  useEffect(() => {
    const syncUser = () => {
      const isLoggedIn = localStorage.getItem("isLoggedIn") === "true";

      if (isLoggedIn) {
        setUser({
          full_name: localStorage.getItem("user_name"),
          email: localStorage.getItem("user_email"),
          role: localStorage.getItem("role"),
        });
      } else {
        setUser(null);
      }
    };

    syncUser();

    window.addEventListener("storage", syncUser);
    window.addEventListener("authChanged", syncUser);

    return () => {
      window.removeEventListener("storage", syncUser);
      window.removeEventListener("authChanged", syncUser);
    };
  }, []);


  useEffect(() => {
    const handleLanguageChange = () => {
      setLanguage(localStorage.getItem('madha_tv_language') || 'english');
    };

    const handleScroll = () => {
      setIsScrolled(window.scrollY > 10);
    };

    window.addEventListener('scroll', handleScroll);
    window.addEventListener('storage', handleLanguageChange);
    window.addEventListener('languageChanged', handleLanguageChange);
    handleScroll();

    return () => {
      window.removeEventListener('scroll', handleScroll);
      window.removeEventListener('storage', handleLanguageChange);
      window.removeEventListener('languageChanged', handleLanguageChange);
    };
  }, []);

  const handleLogout = () => {
    // localStorage.removeItem("isLoggedIn");
    // localStorage.removeItem("user_name");
    // localStorage.removeItem("user_email");

    // setUser(null);

    localStorage.clear(); // 🔥 safest

  setUser(null);
  window.dispatchEvent(new Event("authChanged"));

  // navigate(createPageUrl("Home"));
    navigate(createPageUrl('Home'));
  };

  const getText = (english, tamil) => {
    return language === 'tamil' ? tamil : english;
  };

  const navLinks = [
    { title: 'Schedule', title_tamil: 'கால அட்டவணை', url: createPageUrl('Schedule') },
    { title: 'Service', title_tamil: 'சேவைகள்', url: createPageUrl('BookService') },
    { title: 'Prayer Request', title_tamil: 'செப உதவி', url: createPageUrl('PrayerRequest') },
    { title: 'Shows', title_tamil: 'நிகழ்ச்சிகள்', url: createPageUrl('Shows') },
    { title: 'Donation', title_tamil: 'நன்கொடை', url: "https://santhomecom.org/otp/", external: true },
    // { title: 'Madha Mart', title_tamil: 'மாதா அங்காடி', url: createPageUrl('BuyBooks') },
    { title: 'Madha Mart', title_tamil: 'மாதா அங்காடி', url:"https://secure.madhatv.in/index.php/admin-v2/booksindia", external: true },

    { title: 'Photo Gallery', title_tamil: 'நிழற்பட அரங்கம்', url: createPageUrl('Gallery') },
  ];

  // const logoUrl = contentMap.navigation?.logo_url?.value;
  const logoUrl = '/logo.png';


  const navbarClasses = isScrolled || !isHomePage
    ? 'bg-gradient-to-r from-[#8B0000] to-[#B71C1C] backdrop-blur-md shadow-lg text-white'
    : 'bg-transparent text-white';

  const UserMenu = () => (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" className="flex items-center gap-1 text-white hover:text-red-300 px-2 py-2 text-sm font-semibold">
          <UserIcon className="h-5 w-5" />
          <span className="hidden sm:inline">{user ? user.full_name : getText('Login', 'உள்நுழை')}</span>
          <ChevronDown className="h-4 w-4" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-56 bg-white">
        {user ? (
          <>
            <DropdownMenuLabel>{getText('My Account', 'என் கணக்கு')}</DropdownMenuLabel>
            <DropdownMenuSeparator />
            {/* <DropdownMenuItem asChild>
              <Link to={createPageUrl('UserDashboard')} className="flex items-center cursor-pointer">
                <Settings className="mr-2 h-4 w-4" />
                <span>{getText('Dashboard', 'டாஷ்போர்டு')}</span>
              </Link>
            </DropdownMenuItem> */}
            {/* {user.role === 'admin' && (
              <DropdownMenuItem asChild>
                <Link to={createPageUrl('Dashboard')} className="flex items-center cursor-pointer">
                  <Settings className="mr-2 h-4 w-4" />
                  <span>{getText('Admin Panel', 'நிர்வாக குழு')}</span>
                </Link>
              </DropdownMenuItem>
            )} */}
<DropdownMenuItem asChild>
  <Link
    to={
      user.role === "admin"
        ? createPageUrl("Dashboard")      // Admin
        : createPageUrl("UserDashboard")  // Normal User
    }
    className="flex items-center cursor-pointer"
  >
    <Settings className="mr-2 h-4 w-4" />
    <span>
      {user.role === "admin"
        ? getText("Admin Panel", "நிர்வாக குழு")
        : getText("Dashboard", "டாஷ்போர்டு")}
    </span>
  </Link>
</DropdownMenuItem>



            <DropdownMenuSeparator />
            <DropdownMenuItem onClick={handleLogout} className="text-red-500 focus:bg-red-50 focus:text-red-600 cursor-pointer">
              <LogOut className="mr-2 h-4 w-4" />
              <span>{getText('Logout', 'வெளியேறு')}</span>
            </DropdownMenuItem>
          </>
        ) : (
          <DropdownMenuItem asChild>
            <Link to={createPageUrl('Login')} className="flex items-center cursor-pointer hover:text-red-600">
              <UserIcon className="mr-2 h-4 w-4" />
              <span>{getText('Login / Register', 'உள்நுழைய / பதிவு செய்க')}</span>
            </Link>
          </DropdownMenuItem>
        )}
      </DropdownMenuContent>
    </DropdownMenu>
  );

  return (
    <nav style={{ border: "2px solid transparent", width: "100%", height: "70px", backgroundColor: "black" }} className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${navbarClasses}`}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-20">
          {/* Logo */}
          <div className="flex-shrink-0">
            <Link to={createPageUrl('Home')}>
              {logoUrl ? (
                <img className="h-12 w-auto" src={logoUrl} alt="Madha TV" />
              ) : (
                <span className="text-2xl font-bold">Madha TV</span>
              )}
            </Link>
          </div>

          {/* Desktop Nav & Right side items */}
          <div className="hidden md:flex items-center gap-6">
            {navLinks.map((link) => {
              const isActive = location.pathname === link.url;
              return link.external ? (
                <a
                  key={link.title}
                  href={link.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-sm font-medium hover:text-yellow-300 transition-colors duration-200"
                >
                  {getText(link.title, link.title_tamil)}
                </a>
              ) : (
                <Link
                  key={link.title}
                  to={link.url}
                  className={`text-sm font-medium hover:text-yellow-300 transition-colors duration-200 ${isActive ? 'text-yellow-300 font-bold' : ''
                    }`}
                >
                  {getText(link.title, link.title_tamil)}
                </Link>
              );
            })}
            <LanguageSwitcher />
            <UserMenu />
          </div>

          {/* Mobile Menu Button */}
          <div className="md:hidden">
            <button
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className="inline-flex items-center justify-center p-2 rounded-md text-white hover:bg-white/10 focus:outline-none focus:ring-2 focus:ring-inset focus:ring-white"
            >
              {isMobileMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Menu */}
      <AnimatePresence>
        {isMobileMenuOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.2 }}
            className="md:hidden bg-black/95"
          >
            <div className="px-2 pt-2 pb-3 space-y-1 sm:px-3">
              {navLinks.map((link) => {
                const isActive = location.pathname === link.url;
                return link.external ? (
                  <a
                    key={link.title}
                    href={link.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="block px-3 py-2 rounded-md text-base font-medium text-gray-300 hover:text-white hover:bg-white/10"
                    onClick={() => setIsMobileMenuOpen(false)}
                  >
                    {getText(link.title, link.title_tamil)}
                  </a>
                ) : (
                  <Link
                    key={link.title}
                    to={link.url}
                    className={`block px-3 py-2 rounded-md text-base font-medium hover:text-white hover:bg-white/10 ${isActive ? 'text-yellow-300 font-bold bg-white/10' : 'text-gray-300'
                      }`}
                    onClick={() => setIsMobileMenuOpen(false)}
                  >
                    {getText(link.title, link.title_tamil)}
                  </Link>
                );
              })}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </nav>
  );
}