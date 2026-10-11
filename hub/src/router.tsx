import { Navigate, type RouteObject } from "react-router";
import { CcarfOnly } from "./components/CcarfOnly";
import { Layout } from "./components/Layout";
import FlashcardsPage from "./pages/FlashcardsPage";
import HomePage from "./pages/HomePage";
import LessonPage from "./pages/LessonPage";
import LessonsPage from "./pages/LessonsPage";
import PlanPage from "./pages/PlanPage";
import PracticePage from "./pages/PracticePage";
import ReferencePage from "./pages/ReferencePage";

export const routes: RouteObject[] = [
  { path: "/", element: <Navigate to="/ccarf" replace /> },
  {
    path: "/:cert",
    element: <Layout />,
    children: [
      { index: true, element: <HomePage /> },
      { path: "plan", element: <CcarfOnly><PlanPage /></CcarfOnly> },
      { path: "lessons", element: <LessonsPage /> },
      { path: "lessons/:slug", element: <LessonPage /> },
      { path: "practice", element: <PracticePage /> },
      { path: "cards", element: <FlashcardsPage /> },
      { path: "reference", element: <CcarfOnly><ReferencePage /></CcarfOnly> },
    ],
  },
  { path: "*", element: <Navigate to="/ccarf" replace /> },
];
