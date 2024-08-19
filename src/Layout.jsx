import { Outlet } from "react-router-dom";

import React from "react";
import { Home, Brain, Book, Settings } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import {
  BrowserRouter as Router,
  Route,
  Link,
  Routes,
  useLocation,
} from "react-router-dom";

const NavLink = ({ to, children }) => {
  const location = useLocation();
  const isActive = location.pathname === to;

  return (
    <Link to={to}>
      <Button
        variant="ghost"
        className={cn(
          "w-full h-16 flex flex-col items-center justify-center",
          isActive && "bg-muted",
        )}
      >
        {children}
      </Button>
    </Link>
  );
};

const BottomNavBar = () => {
  const tabs = [
    { id: "home", icon: Home, label: "Home", path: "/home" },
    { id: "memory", icon: Book, label: "Memory", path: "/memory" },
    { id: "practice", icon: Brain, label: "Practice", path: "/practice" },
    // { id: "messages", icon: Mail, label: "Messages", path: "/messages" },
    { id: "settings", icon: Settings, label: "Settings", path: "/settings" },
  ];

  return (
    <div className="fixed bottom-0 left-0 right-0 bg-background border-t">
      <nav className="flex justify-around">
        {tabs.map((tab) => (
          <NavLink key={tab.id} to={tab.path}>
            <tab.icon className="h-5 w-5" />
            <span className="text-xs mt-1">{tab.label}</span>
          </NavLink>
        ))}
      </nav>
    </div>
  );
};

const Layout = () => {
  return (
    <>
      <Outlet />
      <BottomNavBar />
    </>
  );
};

export default Layout;
