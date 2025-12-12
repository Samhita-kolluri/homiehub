"use client";

import Link from "next/link";
import Image from "next/image";
import { usePathname, useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { useState, useEffect, useRef } from "react";
import { isAuthenticated, clearAccessToken } from "@/lib/apiClient";
import { cn } from "@/lib/utils";
import { User, LogOut, Moon, Sun, SlidersHorizontal } from "lucide-react";
import { useTheme } from "@/contexts/ThemeContext";
import { UserPreferencesModal } from "@/components/modals/UserPreferencesModal";

export function Navbar() {
  const pathname = usePathname();
  const router = useRouter();
  const [isScrolled, setIsScrolled] = useState(false);
  const [isAuth, setIsAuth] = useState(false);
  const [isMounted, setIsMounted] = useState(false);
  const [showProfileMenu, setShowProfileMenu] = useState(false);
  const [userEmail, setUserEmail] = useState("");
  const profileRef = useRef<HTMLDivElement>(null);
  const [lastScrollY, setLastScrollY] = useState(0);
  const [showNavbar, setShowNavbar] = useState(true);
  const [showPreferences, setShowPreferences] = useState(false);
  
  // Use theme only after component is mounted
  let theme = "light";
  let toggleTheme = () => {};
  try {
    const themeContext = useTheme();
    theme = themeContext.theme;
    toggleTheme = themeContext.toggleTheme;
  } catch (e) {
    // ThemeProvider not available yet
  }

  useEffect(() => {
    setIsMounted(true);
    const authenticated = isAuthenticated();
    setIsAuth(authenticated);
    if (authenticated && typeof window !== 'undefined') {
      const email = sessionStorage.getItem('user_email') || 'user@example.com';
      setUserEmail(email);
    }
  }, []);

  useEffect(() => {
    setIsAuth(isAuthenticated());
  }, [pathname]);

  useEffect(() => {
    const handleScroll = () => {
      const currentScrollY = window.scrollY;
      setIsScrolled(currentScrollY > 50);
      
      // Hide navbar when scrolling down, show when scrolling up
      if (currentScrollY > lastScrollY && currentScrollY > 100) {
        setShowNavbar(false);
      } else {
        setShowNavbar(true);
      }
      
      setLastScrollY(currentScrollY);
    };
    
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, [lastScrollY]);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (profileRef.current && !profileRef.current.contains(event.target as Node)) {
        setShowProfileMenu(false);
      }
    };
    
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleSignOut = () => {
    clearAccessToken();
    sessionStorage.removeItem('user_email');
    setIsAuth(false);
    setShowProfileMenu(false);
    router.push('/');
  };

  const handleDarkMode = () => {
    toggleTheme();
  };

  const isAppPage = pathname.startsWith("/app");

  return (
    <>
      <nav
        className={cn(
          "fixed top-0 left-0 right-0 z-50 transition-all duration-300",
          isScrolled ? "bg-white/95 dark:bg-[#0f172a]/95 backdrop-blur-md shadow-sm" : "bg-white/80 dark:bg-[#0f172a]/80 backdrop-blur-sm",
          showNavbar ? "translate-y-0" : "-translate-y-full",
          "border-b border-gray-200 dark:border-gray-700"
        )}
      >
      <div className="w-full px-4 py-4">
        <div className="flex items-center justify-between">
          <Link href="/" className="flex items-center space-x-2">
            <div className="flex items-center gap-2">
              <Image
                src="/logohomiehub3.png"
                alt="HomieHub logo"
                width={32}
                height={32}
                className="rounded-md"
                priority
              />
              <span className="text-2xl font-bold text-foreground dark:text-white">
                HomieHub
              </span>
            </div>
          </Link>

          <div className="hidden md:flex items-center space-x-8">
            <Link
              href="/"
              className={cn(
                "text-sm font-medium transition-colors hover:text-accent",
                pathname === "/" ? "text-accent" : "text-foreground/80 dark:text-gray-300"
              )}
            >
              Home
            </Link>
            {isMounted && !isAuth && (
              <>
                <Link
                  href="/login"
                  className={cn(
                    "text-sm font-medium transition-colors hover:text-accent",
                    pathname === "/login" ? "text-accent" : "text-foreground/80 dark:text-gray-300"
                  )}
                >
                  Login
                </Link>
                <Link
                  href="/signup"
                  className={cn(
                    "text-sm font-medium transition-colors hover:text-accent",
                    pathname === "/signup" ? "text-accent" : "text-foreground/80 dark:text-gray-300"
                  )}
                >
                  Sign Up
                </Link>
              </>
            )}
            {isMounted && (
              <button
                onClick={handleDarkMode}
                className="p-2 text-foreground/80 dark:text-gray-300 hover:text-accent transition-colors rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700"
                title={theme === "dark" ? "Switch to Light Mode" : "Switch to Dark Mode"}
              >
                {theme === "dark" ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
              </button>
            )}
            {isMounted && isAuth ? (
              <div className="flex items-center space-x-4">
                <div className="relative" ref={profileRef}>
                  <button
                    onClick={() => setShowProfileMenu(!showProfileMenu)}
                    className="flex items-center space-x-2 text-sm font-medium text-foreground/80 dark:text-gray-300 hover:text-accent transition-colors"
                  >
                    <User className="w-5 h-5" />
                    <span>Profile</span>
                  </button>
                  {showProfileMenu && (
                    <div className="absolute right-0 mt-2 w-64 bg-white dark:bg-black rounded-lg shadow-lg border border-gray-200 dark:border-gray-700 py-2 z-50">
                      <div className="px-4 py-3 border-b border-gray-200 dark:border-gray-700">
                        <p className="text-sm text-gray-500 dark:text-gray-400">Signed in as</p>
                        <p className="text-sm font-medium text-foreground dark:text-white truncate">{userEmail}</p>
                      </div>
                      <button
                        onClick={() => {
                          setShowProfileMenu(false);
                          setShowPreferences(true);
                        }}
                        className="w-full px-4 py-2 text-left text-sm text-foreground dark:text-gray-200 hover:bg-gray-50 dark:hover:bg-gray-800 flex items-center space-x-2"
                      >
                        <SlidersHorizontal className="w-4 h-4" />
                        <span>Preferences</span>
                      </button>
                      <button
                        onClick={handleSignOut}
                        className="w-full px-4 py-2 text-left text-sm text-red-600 dark:text-red-400 hover:bg-gray-50 dark:hover:bg-gray-800 flex items-center space-x-2 border-t border-gray-200 dark:border-gray-700 mt-1"
                      >
                        <LogOut className="w-4 h-4" />
                        <span>Sign Out</span>
                      </button>
                    </div>
                  )}
                </div>
              </div>
            ) : null}
            <Link href={isAuth ? "/app" : "/signup"}>
              <button className="btn-primary">
                Find Your Hub
              </button>
            </Link>
          </div>

          {/* Mobile menu button */}
          <div className="md:hidden">
            <Link href={isAuth ? "/app" : "/signup"}>
              <button className="btn-primary text-xs px-4 py-2">
                Find Your Hub
              </button>
            </Link>
          </div>
        </div>
      </div>
      </nav>
      {showPreferences && (
        <UserPreferencesModal onClose={() => setShowPreferences(false)} />
      )}
    </>
  );
}
