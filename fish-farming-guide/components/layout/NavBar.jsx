"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { LogOut, ChevronDown, Menu, Fish, Bell } from "lucide-react";
import { farmApi } from "@/integration/farmApi";

export default function NavBar({ onMenuClick }) {
    const [showDropdown, setShowDropdown] = useState(false);
    const [showNotifications, setShowNotifications] = useState(false);
    const [userData, setUserData] = useState(null);
    const [notifications, setNotifications] = useState([]);
    const [unreadCount, setUnreadCount] = useState(0);
    const router = useRouter();

    useEffect(() => {
        const storedUser = localStorage.getItem("user");
        if (storedUser) {
            setUserData(JSON.parse(storedUser));
        }
        fetchNotifications();
    }, []);

    const fetchNotifications = async () => {
        try {
            const res = await farmApi.getNotifications();
            if (res.notifications) {
                setNotifications(res.notifications);
                
                // Check unread count
                const lastViewed = localStorage.getItem("lastViewedNotificationId");
                const lastViewedId = lastViewed ? parseInt(lastViewed) : 0;
                const unread = res.notifications.filter(n => n.Id > lastViewedId).length;
                setUnreadCount(unread);
            }
        } catch (err) {
            console.error("Failed to fetch notifications:", err);
        }
    };

    const handleNotificationsClick = () => {
        setShowNotifications(!showNotifications);
        setShowDropdown(false);
        
        if (!showNotifications && notifications.length > 0) {
            // Mark as read
            const latestId = Math.max(...notifications.map(n => n.Id));
            localStorage.setItem("lastViewedNotificationId", latestId.toString());
            setUnreadCount(0);
        }
    };

    const handleLogout = () => {
        localStorage.removeItem("user");
        router.push("/");
    };

    const getInitials = (name) => {
        if (!name) return "U";
        return name.split(" ").map(n => n[0]).join("").toUpperCase().substring(0, 2);
    };

    const typeColor = (type) => {
        if (type === 'Warning') return 'bg-amber-100 text-amber-700';
        if (type === 'Alert') return 'bg-red-100 text-red-700';
        return 'bg-blue-100 text-blue-700';
    };

    return (
        <header className="h-16 bg-white border-b border-gray-100 flex items-center justify-between px-4 sm:px-6 sticky top-0 z-50">

            {/* Left: Menu Toggle (Mobile) + Logo + Title */}
            <div className="flex items-center gap-2 sm:gap-3">
                <button
                    onClick={onMenuClick}
                    className="lg:hidden p-2 text-gray-500 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-colors"
                    aria-label="Toggle Menu"
                >
                    <Menu size={20} />
                </button>

                <div className="bg-[#1b64f2] w-9 h-9 rounded-[10px] flex items-center justify-center shrink-0 shadow-sm">
                    <Fish className="text-white w-5 h-5" strokeWidth={2.5} />
                </div>
                <div>
                    <h1 className="text-sm font-bold text-gray-900 leading-none tracking-tight">
                        FISH FARMING GUIDE
                    </h1>
                    <p className="text-[10px] text-gray-400 mt-1 font-medium uppercase tracking-tighter">
                        Smart Farm Management
                    </p>
                </div>
            </div>

            {/* Right: Notifications + User Info + Dropdown */}
            <div className="flex items-center gap-4 sm:gap-6">
                
                {/* Notifications Bell */}
                <div className="relative">
                    <button 
                        onClick={handleNotificationsClick}
                        className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-full transition-colors relative"
                    >
                        <Bell size={20} />
                        {unreadCount > 0 && (
                            <span className="absolute top-1.5 right-1.5 w-2.5 h-2.5 bg-red-500 rounded-full border-2 border-white shadow-sm"></span>
                        )}
                    </button>

                    {showNotifications && (
                        <>
                            <div className="fixed inset-0 z-10" onClick={() => setShowNotifications(false)} />
                            <div className="absolute top-12 right-0 w-80 sm:w-96 bg-white border border-gray-100 rounded-2xl shadow-xl z-20 overflow-hidden animate-in fade-in zoom-in duration-150">
                                <div className="p-4 border-b border-gray-100 bg-slate-50/50">
                                    <h3 className="font-bold text-slate-900">Notifications</h3>
                                </div>
                                <div className="max-h-[400px] overflow-y-auto">
                                    {notifications.length === 0 ? (
                                        <div className="p-8 text-center text-slate-500 text-sm">
                                            No new announcements.
                                        </div>
                                    ) : (
                                        <div className="divide-y divide-gray-100">
                                            {notifications.map((n) => (
                                                <div key={n.Id} className="p-4 hover:bg-slate-50 transition-colors">
                                                    <div className="flex items-start justify-between gap-2 mb-1">
                                                        <span className={`px-2 py-0.5 text-[9px] font-bold uppercase tracking-wider rounded border ${
                                                            n.Type === 'Warning' ? 'bg-amber-50 border-amber-200 text-amber-700' :
                                                            n.Type === 'Alert' ? 'bg-red-50 border-red-200 text-red-700' :
                                                            'bg-blue-50 border-blue-200 text-blue-700'
                                                        }`}>
                                                            {n.Type}
                                                        </span>
                                                        <span className="text-[10px] text-gray-400">
                                                            {new Date(n.CreatedAt).toLocaleDateString()}
                                                        </span>
                                                    </div>
                                                    <h4 className="text-sm font-bold text-gray-900 mt-1.5 leading-tight">{n.Title}</h4>
                                                    <p className="text-xs text-gray-600 mt-1 line-clamp-3">{n.Message}</p>
                                                </div>
                                            ))}
                                        </div>
                                    )}
                                </div>
                            </div>
                        </>
                    )}
                </div>

                <div className="h-6 w-px bg-gray-200 hidden sm:block"></div>

                <div className="text-right hidden sm:block">
                    <p className="text-sm font-bold text-gray-900 leading-none">
                        {userData?.name || "Farm Owner"}
                    </p>
                    <p className="text-[11px] text-gray-400 mt-1">
                        {userData?.email || "owner@email.com"}
                    </p>
                </div>

                <div className="relative">
                    <button
                        onClick={() => { setShowDropdown(!showDropdown); setShowNotifications(false); }}
                        className="flex items-center gap-2 p-1 rounded-full border border-gray-100 hover:bg-gray-50 transition-all"
                    >
                        <div className="w-8 h-8 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center font-bold text-xs">
                            {userData ? getInitials(userData.name) : "DJ"}
                        </div>
                        <ChevronDown
                            size={14}
                            className={`text-gray-400 mr-1 transition-transform duration-200 ${showDropdown ? "rotate-180" : ""}`}
                        />
                    </button>

                    {showDropdown && (
                        <>
                            {/* Backdrop to close when clicking outside */}
                            <div className="fixed inset-0 z-10" onClick={() => setShowDropdown(false)} />

                            <div className="absolute top-12 right-0 w-44 bg-white border border-gray-100 rounded-xl shadow-xl z-20 py-1 overflow-hidden animate-in fade-in zoom-in duration-150">
                                <button
                                    onClick={handleLogout}
                                    className="w-full flex items-center gap-3 px-4 py-2.5 text-sm text-red-600 hover:bg-red-50 transition-colors font-medium"
                                >
                                    <LogOut size={16} />
                                    Logout
                                </button>
                            </div>
                        </>
                    )}
                </div>
            </div>
        </header>
    );
}
