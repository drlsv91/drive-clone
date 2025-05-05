"use client";

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Input } from "@/components/ui/input";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { HelpCircle, LogOut, Menu, Search, Settings, User } from "lucide-react";
import { signOut } from "next-auth/react";
import Link from "next/link";
import { useState } from "react";

export default function Navbar() {
  const session = {
    user: { id: "1", image: "", name: "Oluwaleye Victor", email: "o.oluwaleye93@gmail.com" },
  };
  const [searchQuery, setSearchQuery] = useState("");
  const [isSearchActive, setIsSearchActive] = useState(false);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();

    console.log("Searching for:", searchQuery);
  };

  return (
    <nav className="w-full h-16 bg-white border-b border-gray-200 fixed top-0 left-0 z-30">
      <div className="flex items-center justify-between h-full px-4">
        <div className="flex items-center gap-2">
          <Sheet>
            <SheetTrigger asChild className="lg:hidden">
              <Button variant="ghost" size="icon">
                <Menu className="h-5 w-5" />
              </Button>
            </SheetTrigger>
            <SheetContent side="left" className="w-64">
              <div className="flex flex-col h-full">
                <div className="flex items-center gap-2 py-4">
                  <span className="font-semibold text-lg">DriveClone</span>
                </div>
              </div>
            </SheetContent>
          </Sheet>

          <Link href="/dashboard" className="flex items-center gap-2">
            <span className="font-semibold text-lg hidden sm:inline">DriveClone</span>
          </Link>
        </div>

        <div className="flex-1 max-w-xl mx-4 relative">
          <form onSubmit={handleSearch} className="w-full">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={18} />
              <Input
                type="text"
                placeholder="Search in Drive"
                className={`pl-10 pr-4 py-2 rounded-full bg-gray-100 hover:bg-gray-200 transition-all ${
                  isSearchActive ? "bg-white ring-2 ring-blue-500 hover:bg-white" : ""
                }`}
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                onFocus={() => setIsSearchActive(true)}
                onBlur={() => setIsSearchActive(false)}
              />
            </div>
          </form>
        </div>

        <div className="flex items-center gap-2">
          <Button variant="ghost" size="icon" aria-label="Help">
            <HelpCircle className="h-5 w-5" />
          </Button>

          <Button variant="ghost" size="icon" aria-label="Settings">
            <Settings className="h-5 w-5" />
          </Button>

          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" className="rounded-full" size="icon">
                {session?.user?.image ? (
                  <Avatar>
                    <AvatarImage src={session.user.image} alt={session?.user?.name ?? ""} />
                    <AvatarFallback>{session.user.name?.charAt(0)}</AvatarFallback>
                  </Avatar>
                ) : (
                  <User className="h-5 w-5" />
                )}
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <div className="flex items-center justify-start gap-2 p-2">
                <Avatar>
                  {session?.user?.image ? <AvatarImage src={session.user.image} alt={session.user.name ?? ""} /> : null}
                  <AvatarFallback>{session?.user?.name?.charAt(0) ?? "U"}</AvatarFallback>
                </Avatar>
                <div className="flex flex-col">
                  <span className="font-medium">{session?.user?.name}</span>
                  <span className="text-sm text-gray-500">{session?.user?.email}</span>
                </div>
              </div>
              <DropdownMenuSeparator />
              <DropdownMenuItem asChild>
                <Link href="/dashboard/settings" className="cursor-pointer flex w-full items-center">
                  <Settings className="mr-2 h-4 w-4" />
                  <span>Settings</span>
                </Link>
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => signOut({ callbackUrl: "/" })} className="cursor-pointer">
                <LogOut className="mr-2 h-4 w-4" />
                <span>Sign out</span>
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
    </nav>
  );
}
