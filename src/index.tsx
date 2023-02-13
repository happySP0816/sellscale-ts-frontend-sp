import React from "react";
import ReactDOM from "react-dom/client";
import "./index.css";
import App from "./components/App";
import * as serviceWorkerRegistration from "./serviceWorkerRegistration";
import reportWebVitals from "./reportWebVitals";
import { QueryClient, QueryClientProvider } from "react-query";
import { createBrowserRouter, RouterProvider } from "react-router-dom";
import ErrorPage from "./components/pages/ErrorPage";
import AboutPage from "./components/pages/AboutPage";
import ProspectPage from "./components/pages/ProspectPage";
import PipelinePage from "./components/pages/PipelinePage";
import MissingPage from "./components/pages/MissingPage";
import { RecoilRoot } from "recoil";
import CampaignPage from "@pages/CampaignPage";
import AuthPage from "@pages/AuthPage";

const queryClient = new QueryClient();

// The DOM router for determining what pages are rendered at which paths
const router = createBrowserRouter([
  {
    path: "/",
    element: <App />,
    errorElement: <ErrorPage />,
    children: [
      {
        path: "",
        element: <AboutPage />,
      },
      {
        path: "authenticate",
        element: <AuthPage />,
      },
      {
        path: "home",
        element: <AboutPage />,
      },
      {
        path: "pipeline",
        element: <PipelinePage />,
      },
      {
        path: "personas",
        element: <ProspectPage />,
      },
      {
        path: "campaigns",
        element: <CampaignPage />,
      },
      {
        path: "*",
        element: <MissingPage />,
      },
    ],
  },
]);

const root = ReactDOM.createRoot(
  document.getElementById("root") as HTMLElement
);
root.render(
  <React.StrictMode>
    <QueryClientProvider client={queryClient}>
      <RecoilRoot>
        <RouterProvider router={router} />
      </RecoilRoot>
    </QueryClientProvider>
  </React.StrictMode>
);

// If you want your app to work offline and load faster, you can change
// unregister() to register() below. Note this comes with some pitfalls.
// Learn more about service workers: https://cra.link/PWA
serviceWorkerRegistration.register();

// If you want to start measuring performance in your app, pass a function
// to log results (for example: reportWebVitals(console.log))
// or send to an analytics endpoint. Learn more: https://bit.ly/CRA-vitals
reportWebVitals();
