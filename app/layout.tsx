// import type { Metadata } from "next";
// import { Geist, Geist_Mono } from "next/font/google";
// import "./globals.css";

// const geistSans = Geist({
//   variable: "--font-geist-sans",
//   subsets: ["latin"],
// });

// const geistMono = Geist_Mono({
//   variable: "--font-geist-mono",
//   subsets: ["latin"],
// });

// export const metadata: Metadata = {
//   title: "FixItNow",
//   description: "FixItNow is a web application that connects customers with skilled technicians for efficient and reliable repair services. Our platform allows users to easily book appointments, track service progress, and communicate with technicians, ensuring a seamless experience for all parties involved.",
// };

// export default function RootLayout({ children }: LayoutProps<"/">) {
//   return (
//     <html
//       lang="en"
//       className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
//       suppressHydrationWarning
//     >
//       <body suppressHydrationWarning className="min-h-full flex flex-col">
//         {children}
//       </body>
//     </html>
//   );
// }


import type { Metadata } from "next";
import "./globals.css";
import Navbar from "@/components/shared/Navbar";
import Footer from "@/components/shared/Footer";
import Providers from "./providers";

export const metadata: Metadata = {
  title: "FixItNow — Your Trusted Home Service Platform",
  description: "Book qualified technicians for plumbing, electrical, cleaning, painting and more.",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html suppressHydrationWarning lang="en">
      <body suppressHydrationWarning className="flex min-h-screen flex-col antialiased">
        <Providers>
          <Navbar />
          <main className="flex-1">{children}</main>
          <Footer />
        </Providers>
      </body>
    </html>
  );
}
