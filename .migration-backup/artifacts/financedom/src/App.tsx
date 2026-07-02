import { Switch, Route, Router as WouterRouter, Redirect } from "wouter";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { AuthProvider, useAuth } from "@/hooks/use-auth";
import { AntiScamModal } from "@/components/AntiScamModal";

import VerifyEmail from "@/pages/VerifyEmail";

import Landing from "@/pages/Landing";
import Login from "@/pages/Login";
import ForgotPassword from "@/pages/ForgotPassword";
import ResetPassword from "@/pages/ResetPassword";
import Register from "@/pages/Register";
import Avis from "@/pages/Avis";
import FAQ from "@/pages/FAQ";
import ProcessusDetail from "@/pages/ProcessusDetail";
import UserDashboard from "@/pages/UserDashboard";
import UserDossier from "@/pages/UserDossier";
import UserDocuments from "@/pages/UserDocuments";
import UserSuivi from "@/pages/UserSuivi";
import UserPaiement from "@/pages/UserPaiement";
import AdminDashboard from "@/pages/AdminDashboard";
import AdminDossiers from "@/pages/AdminDossiers";
import AdminFrais from "@/pages/AdminFrais";
import AdminReviews from "@/pages/AdminReviews";
import UserMessages from "@/pages/UserMessages";

const queryClient = new QueryClient();

function ProtectedRoute({ component: Component, adminOnly = false }: { component: any, adminOnly?: boolean }) {
  const { user, isLoading } = useAuth();

  if (isLoading) {
    return <div className="min-h-screen flex items-center justify-center bg-[#F1F4FA]">Chargement...</div>;
  }

  if (!user) {
    return <Redirect to="/login" />;
  }

  if (adminOnly && user.role !== "admin") {
    return <Redirect to="/dashboard" />;
  }

  if (!adminOnly && user.role === "admin") {
    return <Redirect to="/admin" />;
  }

  return <Component />;
}

function Router() {
  const { pendingVerification, onVerified } = useAuth();

  // Global overlay: when a verification is pending, show verify screen
  if (pendingVerification) {
    const endpoint = pendingVerification.type === "email"
      ? "/api/auth/verify-email"
      : "/api/auth/verify-code";

    return (
      <VerifyEmail
        userId={pendingVerification.userId}
        email={pendingVerification.email}
        prenom={pendingVerification.prenom}
        onSuccess={onVerified}
        endpoint={endpoint}
        type={pendingVerification.type}
        message={pendingVerification.message}
      />
    );
  }

  return (
    <Switch>
      <Route path="/" component={Landing} />
      <Route path="/login" component={Login} />
      <Route path="/forgot-password" component={ForgotPassword} />
      <Route path="/reset-password" component={ResetPassword} />
      <Route path="/register" component={Register} />
      <Route path="/avis" component={Avis} />
      <Route path="/faq" component={FAQ} />
      <Route path="/processus" component={ProcessusDetail} />

      <Route path="/dashboard"><ProtectedRoute component={UserDashboard} /></Route>
      <Route path="/dossier"><ProtectedRoute component={UserDossier} /></Route>
      <Route path="/documents"><ProtectedRoute component={UserDocuments} /></Route>
      <Route path="/suivi"><ProtectedRoute component={UserSuivi} /></Route>
      <Route path="/messages"><ProtectedRoute component={UserMessages} /></Route>
      <Route path="/paiement"><ProtectedRoute component={UserPaiement} /></Route>

      <Route path="/admin"><ProtectedRoute component={AdminDashboard} adminOnly /></Route>
      <Route path="/admin/dossiers"><ProtectedRoute component={AdminDossiers} adminOnly /></Route>
      <Route path="/admin/frais"><ProtectedRoute component={AdminFrais} adminOnly /></Route>
      <Route path="/admin/avis"><ProtectedRoute component={AdminReviews} adminOnly /></Route>

      <Route>
        <div className="min-h-screen flex items-center justify-center bg-[#F1F4FA] flex-col">
          <h1 className="text-4xl font-extrabold text-[#0D1F3C] mb-2">404</h1>
          <p className="text-[#5B6580] mb-6">Page introuvable</p>
          <a href="/" className="bg-[#0D1F3C] text-white px-6 py-3 rounded-lg font-bold hover:bg-[#162B52] transition-colors">Retour à l'accueil</a>
        </div>
      </Route>
    </Switch>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <AuthProvider>
          <WouterRouter base={import.meta.env.BASE_URL.replace(/\/$/, "")}>
            <Router />
            <AntiScamModal />
          </WouterRouter>
          <Toaster />
        </AuthProvider>
      </TooltipProvider>
    </QueryClientProvider>
  );
}

export default App;
