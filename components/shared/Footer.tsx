import Link from "next/link";
import { Wrench } from "lucide-react";

export default function Footer() {
  return (
    <footer className="border-t border-gray-200 bg-gray-50">
      <div className="mx-auto max-w-6xl px-4 py-8 text-sm text-gray-500">
        <div className="flex flex-col items-center justify-between gap-4 md:flex-row">
          <div className="flex items-center gap-2 font-semibold text-gray-800">
            <Wrench className="h-4 w-4 text-primary-600" />
            FixItNow
          </div>
          <p>
            © {new Date().getFullYear()} FixItNow. Your trusted home service
            platform.
          </p>
          <div className="flex gap-4">
            <Link href="/services" className="hover:text-primary-600">
              Services
            </Link>
            <Link href="/about" className="hover:text-primary-600">
              About Us
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
