import DocsLayout from "@/components/Layouts/DocsLayout";
import Navbar from "@/components/Navbar/Navbar";
import type { Metadata } from "next";
import { Inter } from "next/font/google";
import { PropsWithChildren } from "react";
import "../styles/globals.css";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
    title: "SudoBot Documentation",
    description: "A guide to get you started with SudoBot!",
};

export default function RootLayout({ children }: PropsWithChildren) {
    return (
        <html lang="en" className="dark">
            <body className={inter.className}>
                <Navbar />
                <DocsLayout>{children}</DocsLayout>
            </body>
        </html>
    );
}