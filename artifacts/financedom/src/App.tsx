import { Switch, Route, Router as WouterRouter, Redirect, useLocation } from "wouter";
import { QueryClient, QueryClientProvider, QueryCache, MutationCache } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { AuthProvider, useAuth } from "@/hooks/use-auth";
import { LangContext } from "@/contexts/LangContext";
import { isValidLang, getDetectedLang } from "@/lib/lang";
import type { LangCode } from "@/lib/lang";
import { useCallback, useEffect } from "react";
import i18n from "@/i18n";

import VerifyEmail from "@/pages/VerifyEmail";
import VerifyTotp from "@/pages/VerifyTotp";

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
import AdminVirements from "@/pages/AdminVirements";
import AdminUsers from "@/pages/AdminUsers";
import AdminGuide from "@/pages/AdminGuide";
import AdminParametres from "@/pages/AdminParametres";
import UserMessages from "@/pages/UserMessages";
import UserTransfert from "@/pages/UserTransfert";
import UserParametres from "@/pages/UserParametres";
import DocumentPreview from "@/pages/DocumentPreview";
import UserDocumentPreview from "@/pages/UserDocumentPreview";
import EligibilityDemo from "@/pages/EligibilityDemo";
import MissionContractDemo from "@/pages/MissionContractDemo";
import AcknowledgementDemo from "@/pages/AcknowledgementDemo";
import InformationFormDemo from "@/pages/InformationFormDemo";
import FundingAwardDemo from "@/pages/FundingAwardDemo";
import InvoiceDemo from "@/pages/InvoiceDemo";

const CAP_KICK_MSG_KEY = "cap_kick_msg";
const CAP_KICK_TYPE_KEY = "cap_kick_type";

function handleGlobalAuthError(error: unknown): void {
  const data = (error as any)?.data;
  if (!data || typeof data !== "object") return;
  const loginPath = (() => {
    const parts = window.location.pathname.split("/");
    const lang = parts[1]?.length === 2 ? parts[1] : "fr";
    return `/${lang}/login`;
  })();
  if (data.accountSuspended) {
    sessionStorage.setItem(CAP_KICK_MSG_KEY, "Your account has been suspended by an administrator. Please contact support.");
    sessionStorage.setItem(CAP_KICK_TYPE_KEY, "suspended");
    window.location.href = loginPath;
  } else if (data.accountDeleted) {
    sessionStorage.setItem(CAP_KICK_MSG_KEY, "Your session is no longer valid. This account no longer exists.");
    sessionStorage.setItem(CAP_KICK_TYPE_KEY, "deleted");
    window.location.href = loginPath;
  }
}

const queryClient = new QueryClient({
  queryCache: new QueryCache({ onError: handleGlobalAuthError }),
  mutationCache: new MutationCache({ onError: handleGlobalAuthError }),
});

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

  if (pendingVerification) {
    const apiBase = import.meta.env.VITE_API_URL ?? "";

    if (pendingVerification.type === "totp") {
      return (
        <VerifyTotp
          userId={pendingVerification.userId}
          email={pendingVerification.email}
          message={pendingVerification.message}
          onSuccess={onVerified}
        />
      );
    }

    const endpoint = pendingVerification.type === "email"
      ? `${apiBase}/api/auth/verify-email`
      : `${apiBase}/api/auth/verify-code`;

    return (
      <VerifyEmail
        userId={pendingVerification.userId}
        email={pendingVerification.email}
        prenom={pendingVerification.prenom}
        onSuccess={onVerified}
        endpoint={endpoint}
        type={pendingVerification.type}
        message={pendingVerification.message}
        expiresAt={pendingVerification.expiresAt}
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
      <Route path="/transfert"><ProtectedRoute component={UserTransfert} /></Route>
      <Route path="/parametres"><ProtectedRoute component={UserParametres} /></Route>

      <Route path="/admin"><ProtectedRoute component={AdminDashboard} adminOnly /></Route>
      <Route path="/admin/dossiers"><ProtectedRoute component={AdminDossiers} adminOnly /></Route>
      <Route path="/admin/frais"><ProtectedRoute component={AdminFrais} adminOnly /></Route>
      <Route path="/admin/avis"><ProtectedRoute component={AdminReviews} adminOnly /></Route>
      <Route path="/admin/virements"><ProtectedRoute component={AdminVirements} adminOnly /></Route>
      <Route path="/admin/users"><ProtectedRoute component={AdminUsers} adminOnly /></Route>
      <Route path="/admin/guide"><ProtectedRoute component={AdminGuide} adminOnly /></Route>
      <Route path="/admin/parametres"><ProtectedRoute component={AdminParametres} adminOnly /></Route>

      <Route path="/apercu/:type/:id"><ProtectedRoute component={UserDocumentPreview} /></Route>
      <Route path="/admin/preview/:type/:id"><ProtectedRoute component={DocumentPreview} adminOnly /></Route>
      <Route path="/demo/eligibility" component={EligibilityDemo} />
      <Route path="/demo/mission-contract" component={MissionContractDemo} />
      <Route path="/demo/acknowledgement" component={AcknowledgementDemo} />
      <Route path="/demo/information-form" component={InformationFormDemo} />
      <Route path="/demo/funding-award" component={FundingAwardDemo} />
      <Route path="/demo/invoice" component={InvoiceDemo} />

      <Route>
        <div className="min-h-screen flex items-center justify-center bg-[#F1F4FA] flex-col">
          <h1 className="text-4xl font-extrabold text-[#0D1F3C] mb-2">404</h1>
          <p className="text-[#5B6580] mb-6">Page introuvable</p>
          <a href="/" className="bg-[#0D1F3C] text-white px-6 py-3 rounded-lg font-bold hover:bg-[#162B52] transition-colors">Retour à l&apos;accueil</a>
        </div>
      </Route>
    </Switch>
  );
}

function LangBootstrap() {
  const [location, navigate] = useLocation();

  const firstSeg = location.split("/").filter(Boolean)[0] ?? "";
  const lang = isValidLang(firstSeg) ? (firstSeg as LangCode) : null;

  const pathInLang = lang
    ? location.slice(lang.length + 1) || "/"
    : location;

  const switchLang = useCallback(
    (newLang: LangCode) => {
      i18n.changeLanguage(newLang);
      localStorage.setItem("fede_lang", newLang);
      const dest = `/${newLang}${pathInLang === "/" ? "" : pathInLang}`;
      navigate(dest);
    },
    [navigate, pathInLang],
  );

  useEffect(() => {
    if (lang) {
      i18n.changeLanguage(lang);
      localStorage.setItem("fede_lang", lang);
    }
  }, [lang]);

  if (!lang) {
    const detected = getDetectedLang();
    const tail = location === "/" ? "" : location;
    return <Redirect to={`/${detected}${tail}`} />;
  }

  return (
    <LangContext.Provider value={{ lang, switchLang }}>
      <AuthProvider>
        <WouterRouter base={`/${lang}`}>
          <Router />
        </WouterRouter>
      </AuthProvider>
    </LangContext.Provider>
  );
}

function App() {
  useEffect(() => {
    const ping = () => fetch("/api/healthz", { method: "GET" }).catch(() => {});
    ping();
    const id = setInterval(ping, 14 * 60 * 1000);
    return () => clearInterval(id);
  }, []);

  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <WouterRouter base={import.meta.env.BASE_URL.replace(/\/$/, "")}>
          <LangBootstrap />
        </WouterRouter>
        <Toaster />
      </TooltipProvider>
    </QueryClientProvider>
  );
}

export default App;
