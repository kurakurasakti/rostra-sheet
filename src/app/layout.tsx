import type { Metadata } from "next";
import { inter, quicksand } from "@/lib/fonts";
import { ThemeProvider } from "@/providers/theme-provider";
import { MotionProvider } from "@/providers/motion-provider";
import "./globals.css";

export const metadata: Metadata = {
  title: "StatementSheet - Convert Bank Statements to Excel in 10 Seconds",
  description:
    "Privacy-first AI tool that converts PDF bank statements to Excel/CSV with template continuity. No accounts required.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body
        className={`${inter.variable} ${quicksand.variable} font-sans antialiased`}
      >
        <ThemeProvider
          attribute="class"
          defaultTheme="light"
          enableSystem
          disableTransitionOnChange
        >
          <MotionProvider>{children}</MotionProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
