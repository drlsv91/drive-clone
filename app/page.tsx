import { Button } from "@/components/ui/button";
import Link from "next/link";

export default function Home() {
  return (
    <div>
      <header className="w-full py-4 px-6 border-b border-gray-200 bg-white">
        <div className="max-w-7xl mx-auto flex justify-between items-center">
          <div className="flex items-center gap-2">
            <span className="font-bold text-xl">DriveClone</span>
          </div>

          <Button asChild>
            <Link href="/signin">Sign In</Link>
          </Button>
        </div>
      </header>
    </div>
  );
}
