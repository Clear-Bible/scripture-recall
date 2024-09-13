import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import App from "./App.jsx";
// import './index.css'
import "../app/globals.css";
import {
  createBrowserRouter,
  RouterProvider,
  Navigate,
} from "react-router-dom";

import Layout from "@/Layout";
import Home from "@/routes/Home";
import Practice from "@/routes/Practice";
import Discover from "@/routes/Discover";
import Settings from "@/routes/Settings";

import VoiceChat from "@/components/VoiceChat";
import TextChat from "@/components/TextChat";

const router = createBrowserRouter([
  {
    path: "/",
    element: <Layout />,
    children: [
      {
        index: true,
        element: <Navigate to="/home" replace />,
      },
      {
        path: "home",
        element: <Home />,
      },
      {
        path: "practice",
        element: <Practice />,
      },
      {
        path: "practice/voice/:snippetId",
        element: <VoiceChat />,
      },
      {
        path: "practice/text/:snippetId",
        element: <TextChat />,
      },
      {
        path: "discover",
        element: <Discover />,
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
