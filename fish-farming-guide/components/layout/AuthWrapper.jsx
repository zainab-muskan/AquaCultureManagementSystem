"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";

export default function AuthWrapper({ children }) {
    const router = useRouter();

    useEffect(() => {
        const savedUser = localStorage.getItem("user");
        const token = localStorage.getItem("token");

        if (!savedUser || !token) {
            router.replace("/");
            return;
        }

        const user = JSON.parse(savedUser);
        const path = window.location.pathname;

        // Admin Isolation: Redirect admins to /admin if they try to access user pages
        if (user.role === 'admin' && (path.startsWith('/dashboard') || path === '/species' || path === '/stock')) {
            router.replace("/admin");
        }

        // User Protection: Redirect users to /dashboard if they try to access admin pages
        if (user.role !== 'admin' && path.startsWith('/admin')) {
            router.replace("/dashboard");
        }
    }, [router]);

    return <>{children}</>; // render children if logged in
}
