import { Inter } from "next/font/google";
import "./globals.css";

const inter = Inter({
    subsets: ["latin"],
    variable: "--font-inter",
});

export const metadata = {
    title: "Fish Farming Guide",
    description: "Professional aquaculture management platform",
};

import MainLayout from "@/components/layout/MainLayout";

export default function RootLayout({ children }) {
    return (
        <html lang="en">
            <body
                className={`${inter.variable} font-sans antialiased`}
            >
                <MainLayout>
                    {children}
                </MainLayout>
            </body>
        </html>
    );
}
