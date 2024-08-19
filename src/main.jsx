import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import App from "./App.jsx";
// import './index.css'
//
import { createBrowserRouter, RouterProvider } from "react-router-dom";

import Layout from "@/Layout";
import Home from "@/routes/Home";
import Memory from "@/routes/Memory";
import Chat from "@/routes/Chat";
import Settings from "@/routes/Settings";

const router = createBrowserRouter([
  {
    path: "/",
    element: <Layout />,
    children: [
      {
        path: "home",
        element: <Home />,
      },
      {
        path: "memory",
        element: <Memory />,
      },
  {
        path: "chat",
        element: <Chat />,
      },


      {
        path: "settings",
        element: <Settings />,
      },
        ],
  },
]);

createRoot(document.getElementById("root")).render(
  <StrictMode>
    <RouterProvider router={router} />
  </StrictMode>,
);
