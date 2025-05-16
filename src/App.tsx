import { useState, useEffect } from "react";
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

// Componente para rutas protegidas
function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const { token, loading } = useSelector((state: RootState) => state.user);
  const location = useLocation();

  if (loading) {
    return (
      <div className="min-h-screen bg-[#1A1A1A] text-white flex flex-col items-center justify-center">
        <Loader />
      </div>
    );
  }

  if (!token) {
    // Redirigir a /login y guardar la ruta original para volver después de autenticarse
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  return <>{children}</>;
}

function AppInitializer({ children }: { children: React.ReactNode }) {
  const dispatch: AppDispatch = useDispatch();
  const navigate = useNavigate();
  const location = useLocation();
  const { loading, token, user } = useSelector((state: RootState) => state.user);
  const selectedRoutine = useSelector((state: RootState) => state.routine.selectedRoutineId);
  const [isInitialLoad, setIsInitialLoad] = useState(true);
  const [isRouteChanging, setIsRouteChanging] = useState(false);

  // Verificar usuario al cargar la app
  useEffect(() => {
    dispatch(verifyUser()).finally(() => setIsInitialLoad(false));
  }, [dispatch]);

  // Redirigir según el estado del token
  useEffect(() => {
    if (isInitialLoad) return;
    if (!token && location.pathname.startsWith("/")) {
      navigate("/login", { replace: true });
    } else if (token && location.pathname === "/login") {
      navigate("/routine", { replace: true });
    }
  }, [token, location.pathname, isInitialLoad, navigate]);

  // Detectar cambios de ruta
  useEffect(() => {
    const handleRouteChangeStart = () => setIsRouteChanging(true);
    const handleRouteChangeComplete = () => setIsRouteChanging(false);

    handleRouteChangeStart();
    const timer = setTimeout(handleRouteChangeComplete, 300);
    return () => clearTimeout(timer);
  }, [location]);

  const showNavbar = token && location.pathname.startsWith("/");
  const isLoading = isInitialLoad || loading || isRouteChanging;

  if (isLoading) {
    return (
      <AnimatePresence>
        {isLoading && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.3 }}
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
          onMyRoutine={() => navigate("/routine")}
          onNewRoutine={() => navigate("/routine-form")}
          onProgress={() => navigate("/progress")}
          onLogout={() => {
            dispatch(logout());
            navigate("/login");
          }}
          onGenerateRoutine={() => navigate("/routine-AI")}
          onEditRoutine={
            location.pathname === "/routine" &&
            selectedRoutine !== null
              ? () => navigate(`/routine-edit/${selectedRoutine}`)
              : undefined
          }
        />
      )}
      {user ? <Layout>{children}</Layout> : children}
    </>
  );
}

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
            {/* Rutas públicas */}
            <Route path="/login" element={<Login />} />
            <Route path="/forgot-password" element={<ForgotPassword />} />
            <Route path="/reset-password" element={<ResetPassword />} />
            {/* Rutas protegidas */}
            <Route 
              path="/" 
              element={
                <ProtectedRoute>
                  <Home />
                </ProtectedRoute>
              }
            />
            <Route
              path="/routine"
              element={
                <ProtectedRoute>
                  <Routine />
                </ProtectedRoute>
              }
            />
            <Route
              path="/routine-AI"
              element={
                <ProtectedRoute>
                  <RoutineAI />
                </ProtectedRoute>
              }
            />
            <Route
              path="/routine-form"
              element={
                <ProtectedRoute>
                  <RoutineForm />
                </ProtectedRoute>
              }
            />
            <Route
              path="/progress"
              element={
                <ProtectedRoute>
                  <Progress />
                </ProtectedRoute>
              }
            />
            <Route
              path="/routine-edit/:routineId"
              element={
                <ProtectedRoute>
                  <RoutineEdit />
                </ProtectedRoute>
              }
            />
            <Route
              path="/routine-edit/:routineId/videos/:dayIndex/:exerciseIndex"
              element={
                <ProtectedRoute>
                  <ExerciseVideos />
                </ProtectedRoute>
              }
            />
            <Route
              path="/coaches/*"
              element={
                <ProtectedRoute>
                  <CoachesDashboard />
                </ProtectedRoute>
              }
            />
            <Route path="/coach/*" 
              element={
                <ProtectedRoute>
                  <CoachDashboard />
                </ProtectedRoute>
              }
            />
          </Routes>
        </AppInitializer>
      </Router>
    </Provider>
  );
}

export default App;