import { useState, useEffect, useCallback, memo } from "react";
import { Provider, useDispatch, useSelector } from "react-redux";
import { BrowserRouter as Router, Routes, Route, useNavigate, useLocation, Navigate } from "react-router-dom";
import { store, RootState, AppDispatch } from "./store";
import { verifyUser, logout } from "./store/userSlice";
import { motion, AnimatePresence } from "framer-motion";
import Navbar from "./components/Navbar";
import Loader from "./components/Loader";
import Layout from "./components/layout";
import Home from "./pages/Home";
import Login from "./pages/Login";
import ForgotPassword from "./pages/ForgotPassword";
import ResetPassword from "./pages/ResetPassword";
import Routine from "./pages/Routine";
import RoutineAI from "./pages/RoutineAI";
import RoutineForm from "./pages/RoutineForm";
import Progress from "./pages/Progress";
import RoutineEdit from "./pages/RoutineEdit";
import { Helmet } from "react-helmet";
import ExerciseVideos from "./pages/ExerciseVideos";
import OfflineNotice from "./components/OfflineNotice";
import CoachesDashboard from "./pages/CoachesDashboard";
import CoachDashboard from "./pages/CoachDashboard";
import ClientProfile from "./pages/ClientProfile";
import EditProfile from "./pages/EditProfile";

interface ProtectedRouteProps {
  children: React.ReactNode;
}

interface AppInitializerProps {
  children: React.ReactNode;
}

interface RouteConfig {
  path: string;
  element: React.ReactNode;
  protected: boolean;
}

const ProtectedRoute = memo(function ProtectedRoute({ children }: ProtectedRouteProps) {
  const { token, loading } = useSelector((state: RootState) => state.user);
  const location = useLocation();

  if (loading) {
    return (
      <div className="min-h-screen bg-[#1A1A1A] text-[#E0E0E0] flex flex-col items-center justify-center">
        <Loader />
      </div>
    );
  }

  if (!token) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  return <>{children}</>;
});

const AppInitializer = memo(function AppInitializer({ children }: AppInitializerProps) {
  const dispatch = useDispatch<AppDispatch>();
  const navigate = useNavigate();
  const location = useLocation();
  const { loading, token, user } = useSelector((state: RootState) => state.user);
  const selectedRoutine = useSelector((state: RootState) => state.routine.selectedRoutineId);
  const [isInitialLoad, setIsInitialLoad] = useState<boolean>(true);
  const [isRouteChanging, setIsRouteChanging] = useState<boolean>(false);

  useEffect(() => {
    dispatch(verifyUser()).finally(() => setIsInitialLoad(false));
  }, [dispatch]);

  useEffect(() => {
    if (isInitialLoad) return;
    if (!token && location.pathname !== "/login") {
      navigate("/login", { replace: true });
    } else if (token && location.pathname === "/login") {
      navigate("/routine", { replace: true });
    }
  }, [token, location.pathname, isInitialLoad, navigate]);

  useEffect(() => {
    setIsRouteChanging(true);
    const timer = setTimeout(() => setIsRouteChanging(false), 300);
    return () => clearTimeout(timer);
  }, [location]);

  const showNavbar = token && location.pathname !== "/login";
  const isLoading = isInitialLoad || loading || isRouteChanging;

  const onMyRoutine = useCallback(() => navigate("/routine"), [navigate]);
  const onNewRoutine = useCallback(() => navigate("/routine-form"), [navigate]);
  const onProgress = useCallback(() => navigate("/progress"), [navigate]);
  const onLogout = useCallback(() => {
    dispatch(logout());
    navigate("/login");
  }, [dispatch, navigate]);
  const onGenerateRoutine = useCallback(() => navigate("/routine-AI"), [navigate]);
  const onEditRoutine = useCallback(
    () =>
      location.pathname === "/routine" && selectedRoutine !== null
        ? navigate(`/routine-edit/${selectedRoutine}`)
        : undefined,
    [navigate, location.pathname, selectedRoutine]
  );

  if (isLoading) {
    return (
      <AnimatePresence>
        {isLoading && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.3 }}
            className="min-h-screen bg-[#1A1A1A] text-[#E0E0E0] flex flex-col items-center justify-center"
          >
            <Loader />
          </motion.div>
        )}
      </AnimatePresence>
    );
  }

  return (
    <>
      {showNavbar && (
        <Navbar
          onMyRoutine={onMyRoutine}
          onNewRoutine={onNewRoutine}
          onProgress={onProgress}
          onLogout={onLogout}
          onGenerateRoutine={onGenerateRoutine}
          onEditRoutine={onEditRoutine}
        />
      )}
      {user ? <Layout>{children}</Layout> : children}
    </>
  );
});

const routes: RouteConfig[] = [
  { path: "/login", element: <Login />, protected: false },
  { path: "/forgot-password", element: <ForgotPassword />, protected: false },
  { path: "/reset-password", element: <ResetPassword />, protected: false },
  { path: "/", element: <Home />, protected: true },
  { path: "/routine", element: <Routine />, protected: true },
  { path: "/routine-AI", element: <RoutineAI />, protected: true },
  { path: "/routine-form", element: <RoutineForm />, protected: true },
  { path: "/progress", element: <Progress />, protected: true },
  { path: "/routine-edit/:routineId", element: <RoutineEdit />, protected: true },
  {
    path: "/routine-edit/:routineId/videos/:dayIndex/:exerciseIndex",
    element: <ExerciseVideos />,
    protected: true,
  },
  { path: "/coaches/*", element: <CoachesDashboard />, protected: true },
  { path: "/coach/*", element: <CoachDashboard />, protected: true },
  { path: "/coach/client/:clientId", element: <ClientProfile />, protected: true },
  { path: "/profile/edit", element: <EditProfile />, protected: true },
];

function App() {
  return (
    <Provider store={store}>
      <Helmet>
        <link rel="icon" href="/favicon.ico" />
        <link rel="apple-touch-icon" sizes="180x180" href="/apple-touch-icon.png" />
        <link rel="icon" type="image/png" sizes="32x32" href="/favicon-32x32.png" />
        <link rel="icon" type="image/png" sizes="16x16" href="/favicon-16x16.png" />
        <link rel="manifest" href="/site.webmanifest" />
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-status-bar-style" content="black-translucent" />
        <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no" />
        <title>My Voice</title>
      </Helmet>
      <OfflineNotice />
      <Router>
        <AppInitializer>
          <Routes>
            {routes.map(({ path, element, protected: isProtected }, index) => (
              <Route
                key={index}
                path={path}
                element={isProtected ? <ProtectedRoute>{element}</ProtectedRoute> : element}
              />
            ))}
          </Routes>
        </AppInitializer>
      </Router>
    </Provider>
  );
}

export default App;