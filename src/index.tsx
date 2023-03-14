import React from "react";
import ReactDOM from "react-dom/client";
import "./index.css";
import App from "./components/App";
import * as serviceWorkerRegistration from "./serviceWorkerRegistration";
import reportWebVitals from "./reportWebVitals";
import { QueryClient, QueryClientProvider } from "react-query";
import {
  createBrowserRouter,
  createRoutesFromChildren,
  json,
  matchRoutes,
  RouterProvider,
  useLocation,
  useNavigationType,
} from "react-router-dom";
import ErrorPage from "./components/pages/ErrorPage";
import DashboardPage from "./components/pages/DashboardPage";
import PersonaPage from "./components/pages/PersonaPage";
import PipelinePage from "./components/pages/PipelinePage";
import MissingPage from "./components/pages/MissingPage";
import { RecoilRoot } from "recoil";
import CampaignPage from "@pages/CampaignPage";
import AuthPage from "@pages/AuthPage";
import RestrictedRoute from "./auth/RestrictedRoute";
import SettingsPage from "@pages/SettingsPage";
import LoginPage from "@pages/LoginPage";
import * as Sentry from "@sentry/react";
import { BrowserTracing } from "@sentry/tracing";

const queryClient = new QueryClient();

// Set Sentry up and wrap the router
if (process.env.NODE_ENV === "production") {
  Sentry.init({
    dsn:
      "https://562db49ea9174f5c9f9c75921f664755@o4504749544767488.ingest.sentry.io/4504776732901376",
    integrations: [
      new BrowserTracing({
        routingInstrumentation: Sentry.reactRouterV6Instrumentation(
          React.useEffect,
          useLocation,
          useNavigationType,
          createRoutesFromChildren,
          matchRoutes
        ),
      }),
    ],

    // We recommend adjusting this value in production, or using tracesSampler
    // for finer control
    tracesSampleRate: 1.0,
  });
}
const sentryCreateBrowserRouter = Sentry.wrapCreateBrowserRouter(
  createBrowserRouter
);

// The DOM router for determining what pages are rendered at which paths
const router = sentryCreateBrowserRouter([
  {
    path: "/",
    element: <App />,
    errorElement: <ErrorPage />,
    children: [
      {
        path: "",
        element: <RestrictedRoute page={<DashboardPage />} />,
      },
      {
        path: "dashboard",
        element: <RestrictedRoute page={<DashboardPage />} />,
      },
      {
        path: "pipeline/:prospectId?",
        element: <RestrictedRoute page={<PipelinePage />} />,
        loader: async ({ params }: { params: any }) => {
          return { prospectId: params.prospectId };
        },
      },
      {
        path: "personas",
        element: <RestrictedRoute page={<PersonaPage />} />,
      },
      {
        path: "campaigns/:campaignId?",
        element: <RestrictedRoute page={<CampaignPage />} />,
        loader: async ({ params }: { params: any }) => {
          return { campaignId: params.campaignId };
        },
      },
      {
        path: "settings",
        element: <RestrictedRoute page={<SettingsPage />} />,
      },
      {
        path: "authenticate",
        element: <AuthPage />,
      },
      {
        path: "login",
        element: <LoginPage />,
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
        <Sentry.ErrorBoundary
          fallback={<div>An error has occurred</div>}
          showDialog
        >
          <RouterProvider router={router} />
        </Sentry.ErrorBoundary>
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
