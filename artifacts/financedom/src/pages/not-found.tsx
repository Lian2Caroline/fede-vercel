import { Link } from "wouter";
import { useTranslation } from "react-i18next";
import { AlertCircle } from "lucide-react";

export default function NotFound() {
  const { t } = useTranslation();
  return (
    <div className="min-h-screen bg-[#F1F4FA] flex items-center justify-center p-6 font-sans">
      <div className="w-full max-w-md text-center">
        <div className="w-20 h-20 rounded-2xl bg-[#0D1F3C]/5 border-2 border-[#DDE2EC] flex items-center justify-center mx-auto mb-6">
          <AlertCircle className="w-10 h-10 text-[#FFD500]" />
        </div>
        <div className="text-7xl font-extrabold text-[#0D1F3C]/10 mb-2">404</div>
        <h1 className="text-2xl font-extrabold text-[#0D1F3C] mb-3">{t("not_found.title")}</h1>
        <p className="text-[#6B7896] text-sm mb-8">{t("not_found.sub")}</p>
        <Link href="/" className="inline-flex items-center gap-2 bg-[#0D1F3C] hover:bg-[#162B52] text-white font-bold px-6 py-3 rounded-xl transition-all shadow-md text-sm">
          {t("not_found.btn")}
        </Link>
      </div>
    </div>
  );
}
