"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { motion } from "framer-motion";
import { Home, PlusCircle, SlidersHorizontal, LogOut } from "lucide-react";
import { cn } from "@/lib/utils";
import { clearAccessToken } from "@/lib/apiClient";
import { useRouter } from "next/navigation";

interface SidebarProps {
  onNavigate?: (view: string) => void;
}

export function Sidebar({ onNavigate }: SidebarProps) {
  const pathname = usePathname();
  const router = useRouter();

  const menuItems = [
    { id: "recommendations", label: "Recommendations", icon: Home },
    { id: "post-ad", label: "Find Your Homie", icon: PlusCircle },
    { id: "filters", label: "Filters", icon: SlidersHorizontal },
  ];

  const handleLogout = () => {
    clearAccessToken();
    router.push("/login");
  };

  return (
    <div className="fixed left-0 top-0 h-screen w-64 bg-white dark:bg-black border-r border-gray-200 dark:border-gray-800 flex flex-col">
      {/* Logo */}
      <div className="p-6 border-b border-gray-200 dark:border-gray-800">
        <Link href="/">
          <motion.div
            className="text-xl font-bold text-foreground dark:text-white cursor-pointer"
            whileHover={{ scale: 1.05 }}
          >
            HomieHub
          </motion.div>
        </Link>
      </div>

      {/* Navigation */}
      <nav className="flex-1 p-4">
        <ul className="space-y-2">
          {menuItems.map((item) => (
            <li key={item.id}>
              <motion.button
                onClick={() => onNavigate?.(item.id)}
                className={cn(
                  "w-full flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium transition-colors",
                  "hover:bg-gray-100 dark:hover:bg-gray-900 dark:text-gray-300"
                )}
                whileHover={{ x: 4 }}
                whileTap={{ scale: 0.98 }}
              >
                <item.icon className="w-5 h-5" strokeWidth={1.5} />
                <span>{item.label}</span>
              </motion.button>
            </li>
          ))}
        </ul>
      </nav>
    </div>
  );
}
