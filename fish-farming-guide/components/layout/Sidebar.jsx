"use client";
import { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
    Calendar,
    Droplet,
    Fish,
    Utensils,
    FlaskConical,
    HomeIcon,
    DollarSign,
    BookOpen,
    Package,
    ShieldCheck,
    HeartPulse,
    LogOut,
    BarChart3,
    X,
    Users,
    LayoutList,
    Map,
    ShoppingCart,
    MessageSquare,
    BellRing,
    Settings2
} from "lucide-react";

const Sidebar = ({ isOpen, onClose }) => {
    const pathname = usePathname();
    const [user, setUser] = useState(null);

    useEffect(() => {
        if (typeof window !== "undefined") {
            const saved = localStorage.getItem("user");
            if (saved) setUser(JSON.parse(saved));
        }
    }, []);

    const menuItems = [
        { name: "Dashboard", icon: HomeIcon, href: "/dashboard", roles: ['user'] },
        { name: "Species Approvals", icon: Fish, href: "/admin/approvals", roles: ['admin'] },
        { name: "All Species", icon: LayoutList, href: "/admin/species", roles: ['admin'] },
        { name: "Farm Overview", icon: Map, href: "/admin/farms", roles: ['admin'] },
        { name: "Marketplace Moderation", icon: ShoppingCart, href: "/admin/marketplace", roles: ['admin'] },
        { name: "Disease Catalog", icon: HeartPulse, href: "/admin/diseases", roles: ['admin'] },
        { name: "Support Tickets", icon: MessageSquare, href: "/admin/tickets", roles: ['admin'] },
        { name: "Announcements", icon: BellRing, href: "/admin/announcements", roles: ['admin'] },
        { name: "Rules Management", icon: Settings2, href: "/admin/rules", roles: ['admin'] },
        { name: "Knowledge Manager", icon: BookOpen, href: "/admin/knowledge", roles: ['admin'] },
        { name: "User Management", icon: Users, href: "/admin/users", roles: ['admin'] },
        { name: "Farm Planner", icon: Calendar, href: "/planner", roles: ['user'] },
        { name: "Stock Management", icon: Package, href: "/stock", roles: ['user'] },
        { name: "Fish Species", icon: Fish, href: "/species", roles: ['user'] },
        { name: "Feeding Guide", icon: Utensils, href: "/feeding", roles: ['user'] },
        { name: "Fertilization", icon: FlaskConical, href: "/fertilization", roles: ['user'] },
        { name: "Water Quality", icon: Droplet, href: "/water", roles: ['user'] },
       // { name: "Fish Health", icon: HeartPulse, href: "/health", roles: ['user'] },
        { name: "Budget and Expense", icon: DollarSign, href: "/budget", roles: ['user'] },
        { name: "Farm Reports", icon: BarChart3, href: "/reports", roles: ['user'] },
        { name: "Information", icon: BookOpen, href: "/info", roles: ['user'] },
        { name: "Support", icon: MessageSquare, href: "/support", roles: ['user'] },
    ];

    const handleLogout = () => {
        localStorage.removeItem("token");
        localStorage.removeItem("user");
        window.location.href = "/";
    };

    const currentRole = user?.role || 'user';
    const filteredItems = menuItems.filter(item => item.roles.includes(currentRole));

    return (
        <>
            {/* Mobile Overlay */}
            {isOpen && (
                <div
                    className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[90] lg:hidden transition-opacity duration-300"
                    onClick={onClose}
                />
            )}

            <aside className={`
                w-64 bg-white border-r h-screen fixed left-0 top-0 flex flex-col z-[100] transition-transform duration-300 ease-in-out
                ${isOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0"}
            `}>
                {/* User Profile Section */}
                <div className="p-6 border-b flex items-center justify-between bg-gray-50/50">
                    <div className="flex items-center gap-3">
                        <div className={`h-10 w-10 ${currentRole === 'admin' ? 'bg-amber-600' : 'bg-blue-600'} rounded-full flex items-center justify-center text-white font-black shadow-lg shadow-blue-100`}>
                            {currentRole === 'admin' ? 'A' : 'U'}
                        </div>
                        <div>
                            <h3 className="text-sm font-bold text-gray-900 leading-tight">
                                {currentRole === 'admin' ? 'Administrator' : ' Dashboard'}
                            </h3>
                            <p className="text-[10px] text-gray-500 font-bold uppercase tracking-wider mt-0.5">
                                {currentRole === 'admin' ? 'System Management' : 'Fish Farming Guide'}
                            </p>
                        </div>
                    </div>
                    {/* Mobile Close Button */}
                    <button
                        onClick={onClose}
                        className="lg:hidden p-2 text-gray-400 hover:text-gray-600 rounded-lg hover:bg-gray-100 transition-colors"
                    >
                        <X size={20} />
                    </button>
                </div>

                {/* Navigation */}
                <nav className="flex-1 p-4 space-y-1 overflow-y-auto mt-2">
                    {filteredItems.map((item) => {
                        const isActive = pathname === item.href;

                        return (
                            <Link
                                key={item.name}
                                href={item.href}
                                onClick={() => { if (window.innerWidth < 1024) onClose(); }}
                                className={`flex items-center gap-3 px-4 py-3.5 text-sm font-bold rounded-xl transition-all duration-200 ${isActive
                                    ? currentRole === 'admin'
                                        ? "bg-amber-50 text-amber-700 shadow-sm shadow-amber-100"
                                        : "bg-blue-50 text-blue-700 shadow-sm shadow-blue-100"
                                    : "text-gray-500 hover:bg-gray-50 hover:text-gray-900"
                                    }`}
                            >
                                <item.icon className={`h-5 w-5 ${isActive ? "" : "opacity-70"}`} strokeWidth={isActive ? 2.5 : 2} />
                                {item.name}
                            </Link>
                        );
                    })}
                </nav>

                {/* Logout Section */}
                <div className="p-4 border-t border-gray-100">
                    <button
                        onClick={handleLogout}
                        className="w-full flex items-center gap-3 px-4 py-3.5 text-sm font-bold text-red-500 hover:bg-red-50 rounded-xl transition-all duration-200 group"
                    >
                        <LogOut className="h-5 w-5 opacity-70 group-hover:opacity-100" strokeWidth={2.5} />
                        Logout Session
                    </button>
                </div>
            </aside>
        </>
    );
};

export default Sidebar;
