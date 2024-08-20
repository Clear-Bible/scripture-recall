import React from "react";
import { Outlet, Link, useLocation } from "react-router-dom";
import { Home, Brain, Book, Settings } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { ThemeProvider } from "@/ThemeProvider";
import ModeToggle from "@/components/ModeToggle";

const NavLink = ({ to, children, isVertical }) => {
  const location = useLocation();
  const isActive = location.pathname === to;

  return (
    <Link to={to} className={cn(isVertical ? "w-full" : "flex-1")}>
      <Button
        variant="ghost"
        className={cn(
          "w-full flex items-center justify-center",
          isVertical
            ? "flex-row h-12 justify-start rounded-none p-6"
            : "flex-col h-16",
          isActive && "bg-muted",
        )}
      >
        {children}
      </Button>
    </Link>
  );
};

const NavBar = ({ isVertical }) => {
  const tabs = [
    { id: "home", icon: Home, label: "Home", path: "/home" },
    { id: "memory", icon: Book, label: "Memory", path: "/memory" },
    { id: "practice", icon: Brain, label: "Practice", path: "/practice" },
    { id: "settings", icon: Settings, label: "Settings", path: "/settings" },
  ];

  return (
    <nav
      className={cn(
        "bg-background",
        isVertical
          ? "flex flex-col border-r h-full justify-between"
          : "flex-0 flex-row border-t w-full justify-center flex-grow",
      )}
    >
      <div
        className={cn(
          "flex",
          "justify-center",
          isVertical ? "flex-col" : "flex-row",
        )}
      >
        {tabs.map((tab) => (
          <NavLink key={tab.id} to={tab.path} isVertical={isVertical}>
            <tab.icon className={cn("h-5 w-5", isVertical ? "mr-2" : "mb-1")} />
            <span className={cn("text-xs", isVertical ? "" : "mt-1")}>
              {tab.label}
            </span>
          </NavLink>
        ))}
      </div>
      <div>
        {isVertical && (
          <div className="mt-auto border-t w-full py-4 flex justify-center">
            <ModeToggle />
          </div>
        )}
      </div>
    </nav>
  );
};

const Layout = () => {
  return (
    <ThemeProvider defaultTheme="dark" storageKey="vite-ui-theme">
      <div className="flex flex-col md:flex-row h-screen w-screen">
        <div className="hidden md:flex md:max-w-32 md:flex-shrink-0">
          <NavBar isVertical={true} />
        </div>
        <div className="flex-grow">
          <div className="w-full max-w-4xl mx-auto px-4 py-4 md:px-6 lg:px-8">
            <Outlet />
          </div>
        </div>
        <div className="md:hidden">
          <NavBar isVertical={false} />
        </div>
      </div>
    </ThemeProvider>
  );
};

export default Layout;
