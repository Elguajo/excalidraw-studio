import type { Metadata } from "next";
import { Geist } from "next/font/google";
import { CopilotKit } from "@copilotkit/react-core";
import "@copilotkit/react-ui/v2/styles.css";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Excalidraw AI",
  description: "AI-powered diagram generation with Excalidraw",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={`${geistSans.variable} antialiased`}>
        <CopilotKit runtimeUrl="/api/copilotkit" showDevConsole={false}>{children}</CopilotKit>
      </body>
    </html>
  );
}
