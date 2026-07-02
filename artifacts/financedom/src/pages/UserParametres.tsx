import { useRef, useState } from "react";
import { UserLayout } from "@/components/layout/UserLayout";
import { useAuth } from "@/hooks/use-auth";
import { useToast } from "@/hooks/use-toast";
import { useQueryClient } from "@tanstack/react-query";
import { useTranslation } from "react-i18next";
import {
  Camera, Trash2, Save, X, Mail, Phone, Briefcase, MapPin, BadgeCheck,
  ShieldAlert, MessageSquare, FileText, Info, Loader2,
} from "lucide-react";

const BASE = import.meta.env.VITE_API_URL ?? "";

class ApiError extends Error {
  code: number;
  constructor(msg: string, code: number) { super(msg); this.code = code; }
}

async function apiFetch(path: string, opts?: RequestInit) {
  const res = await fetch(`${BASE}/api${path}`, {
    credentials: "include",
    headers: { "Content-Type": "application/json" },
    ...opts,
  });
  const text = await res.text();
  let body: any = null;
  if (text) {
    try { body = JSON.parse(text); } catch { body = { _raw: text }; }
  }
  if (!res.ok) {
    throw new ApiError(body?.error ?? "", res.status);
  }
  return body ?? {};
}

const AVATAR_MAX_DATAURL = 200 * 1024;
async function resizeToDataUrl(file: File, maxSize = 256): Promise<string> {
  const bitmap = await createImageBitmap(file);
  const ratio = Math.min(maxSize / bitmap.width, maxSize / bitmap.height, 1);
  const w = Math.round(bitmap.width * ratio);
  const h = Math.round(bitmap.height * ratio);
  const canvas = document.createElement("canvas");
  canvas.width = w;
  canvas.height = h;
  const ctx = canvas.getContext("2d");
  if (!ctx) throw Object.assign(new Error("err_canvas"), { code: "err_canvas" });
  ctx.drawImage(bitmap, 0, 0, w, h);
  bitmap.close?.();
  for (const q of [0.75, 0.6, 0.45, 0.3]) {
    const url = canvas.toDataURL("image/jpeg", q);
    if (url.length <= AVATAR_MAX_DATAURL) return url;
  }
  throw Object.assign(new Error("err_compress"), { code: "err_compress" });
}

export default function UserParametres() {
  const { t } = useTranslation();
  const { user } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [editing, setEditing] = useState(false);
  const [saving, setSaving] = useState(false);
  const [uploadingAvatar, setUploadingAvatar] = useState(false);
  const [avatarLoaded, setAvatarLoaded] = useState(false);
  const [showConditions, setShowConditions] = useState(false);
  const [showAbout, setShowAbout] = useState(false);

  const [telephone, setTelephone] = useState(user?.telephone ?? "");
  const [organisation, setOrganisation] = useState(user?.organisation ?? "");

  const TYPE_PORTEUR_LABELS: Record<string, string> = {
    type_entrepreneur: t("register.type_entrepreneur"),
    type_association:  t("register.type_association"),
    type_collectivite: t("register.type_collectivite"),
    type_entreprise:   t("register.type_entreprise"),
    type_groupement:   t("register.type_groupement"),
    particulier:  t("register.type_entrepreneur"),
    entreprise:   t("register.type_entreprise"),
    association:  t("register.type_association"),
    collectivite: t("register.type_collectivite"),
    autre:        t("register.type_groupement"),
    "Entrepreneur individuel": t("register.type_entrepreneur"),
    "Association":             t("register.type_association"),
    "Collectivité":            t("register.type_collectivite"),
    "Entreprise":              t("register.type_entreprise"),
    "Groupement":              t("register.type_groupement"),
  };

  const initials = user ? `${user.prenom?.[0] ?? ""}${user.nom?.[0] ?? ""}`.toUpperCase() : "??";
  const avatar = (user as any)?.avatarDataUrl as string | null | undefined;

  async function handlePatch(updates: Record<string, unknown>): Promise<boolean> {
    try {
      const updated = await apiFetch("/auth/me", { method: "PATCH", body: JSON.stringify(updates) });
      queryClient.setQueryData(["/api/auth/me"], updated);
      await queryClient.invalidateQueries({ queryKey: ["/api/auth/me"] });
      return true;
    } catch (e: any) {
      const code = (e as any)?.code as number | undefined;
      const desc = code === 413 ? t("parametres.err_img_size")
        : code === 401 ? t("parametres.err_session")
        : e?.message || t("parametres.err_unknown");
      toast({ title: t("parametres.fail"), description: desc, variant: "destructive" });
      return false;
    }
  }

  async function handleSaveInfos() {
    setSaving(true);
    const ok = await handlePatch({
      telephone: telephone.trim(),
      organisation: organisation.trim(),
    });
    setSaving(false);
    if (ok) {
      setEditing(false);
      toast({ title: t("parametres.profile_updated"), description: t("parametres.profile_updated_desc") });
    }
  }

  function handleCancelEdit() {
    setEditing(false);
    setTelephone(user?.telephone ?? "");
    setOrganisation(user?.organisation ?? "");
  }

  async function handlePickFile(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    e.target.value = "";
    if (!file) return;
    if (!file.type.startsWith("image/")) {
      toast({ title: t("parametres.avatar_format_err"), description: t("parametres.avatar_format_err_desc"), variant: "destructive" });
      return;
    }
    setUploadingAvatar(true);
    setAvatarLoaded(false);
    try {
      const dataUrl = await resizeToDataUrl(file);
      const ok = await handlePatch({ avatarDataUrl: dataUrl });
      if (ok) toast({ title: t("parametres.avatar_updated") });
    } catch (err: any) {
      const desc = (err as any)?.code === "err_canvas" ? t("parametres.err_canvas")
        : (err as any)?.code === "err_compress" ? t("parametres.err_compress")
        : err?.message || t("parametres.err_unknown");
      toast({ title: t("parametres.avatar_load_err"), description: desc, variant: "destructive" });
    } finally {
      setUploadingAvatar(false);
    }
  }

  async function handleRemoveAvatar() {
    setUploadingAvatar(true);
    const ok = await handlePatch({ avatarDataUrl: null });
    setUploadingAvatar(false);
    if (ok) toast({ title: t("parametres.avatar_removed") });
  }

  return (
    <UserLayout>
      <div className="max-w-3xl mx-auto space-y-6">
        <div className="bg-white rounded-2xl border border-[#DDE2EC] shadow-sm p-6 flex items-center gap-5">
          <div className="relative shrink-0">
            <div className="w-24 h-24 rounded-2xl bg-[#0D1F3C] flex items-center justify-center overflow-hidden shadow-md">
              {avatar ? (
                <>
                  <img
                    src={avatar}
                    alt="Avatar"
                    className={`w-full h-full object-cover ${avatarLoaded ? "block" : "hidden"}`}
                    onLoad={() => setAvatarLoaded(true)}
                    onError={() => setAvatarLoaded(false)}
                  />
                  {!avatarLoaded && <span className="text-[#FFD500] text-3xl font-black">{initials}</span>}
                </>
              ) : (
                <span className="text-[#FFD500] text-3xl font-black">{initials}</span>
              )}
            </div>
            {uploadingAvatar && (
              <div className="absolute inset-0 bg-black/40 rounded-2xl flex items-center justify-center">
                <Loader2 className="w-6 h-6 text-white animate-spin" />
              </div>
            )}
          </div>
          <div className="flex-1 min-w-0">
            <h2 className="text-xl font-extrabold text-[#0D1F3C] truncate">{user?.prenom} {user?.nom}</h2>
            <p className="text-sm text-[#6B7896] truncate">
              {TYPE_PORTEUR_LABELS[user?.typePorteur ?? ""] ?? user?.typePorteur}
            </p>
            <div className="mt-2 inline-flex items-center gap-1.5 bg-[#FFF8F0] border border-[#F0D9A8] text-[#FFD500] text-xs font-bold px-3 py-1 rounded-full">
              <MapPin className="w-3 h-3" /> {user?.territoire}
            </div>
            <div className="mt-3 flex flex-wrap gap-2">
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                disabled={uploadingAvatar}
                className="inline-flex items-center gap-1.5 text-xs font-semibold bg-[#0D1F3C] text-white px-3 py-1.5 rounded-lg hover:bg-[#162B52] disabled:opacity-50 transition-colors"
                data-testid="btn-change-avatar"
              >
                <Camera className="w-3.5 h-3.5" /> {avatar ? t("parametres.avatar_change") : t("parametres.avatar_add")}
              </button>
              {avatar && (
                <button
                  type="button"
                  onClick={handleRemoveAvatar}
                  disabled={uploadingAvatar}
                  className="inline-flex items-center gap-1.5 text-xs font-semibold border border-[#DDE2EC] text-[#6B7896] px-3 py-1.5 rounded-lg hover:bg-[#F8F9FC] disabled:opacity-50 transition-colors"
                  data-testid="btn-remove-avatar"
                >
                  <Trash2 className="w-3.5 h-3.5" /> {t("parametres.avatar_remove")}
                </button>
              )}
              <input
                ref={fileInputRef}
                type="file"
                accept="image/png,image/jpeg,image/webp"
                onChange={handlePickFile}
                className="hidden"
                data-testid="input-avatar-file"
              />
            </div>
          </div>
        </div>

        <div>
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-xs font-bold text-[#6B7896] uppercase tracking-widest">{t("parametres.section_account")}</h3>
            {!editing && (
              <button
                type="button"
                onClick={() => { setTelephone(user?.telephone ?? ""); setOrganisation(user?.organisation ?? ""); setEditing(true); }}
                className="text-xs font-bold bg-[#FFF8F0] border border-[#F0D9A8] text-[#FFD500] px-3 py-1.5 rounded-lg hover:bg-[#FDF1DC] transition-colors"
                data-testid="btn-edit-infos"
              >
                {t("parametres.edit")}
              </button>
            )}
          </div>
          <div className="bg-white rounded-2xl border border-[#DDE2EC] shadow-sm divide-y divide-[#F1F4FA]">
            <InfoRow icon={<Mail className="w-4 h-4 text-[#8B9BB4]" />} label={t("parametres.label_email")}>
              <div className="flex items-center gap-2">
                <span className="text-sm text-[#0D1F3C] font-medium">{user?.email}</span>
                {user?.emailVerified && (
                  <span className="inline-flex items-center gap-1 text-[10px] font-bold bg-green-50 text-green-700 border border-green-100 px-1.5 py-0.5 rounded-full">
                    <BadgeCheck className="w-3 h-3" /> {t("parametres.verified")}
                  </span>
                )}
              </div>
            </InfoRow>
            <InfoRow icon={<Phone className="w-4 h-4 text-[#8B9BB4]" />} label={t("parametres.label_phone")}>
              {editing ? (
                <input
                  value={telephone}
                  onChange={(e) => setTelephone(e.target.value)}
                  placeholder="+596 696 00 00 00"
                  className="w-full text-sm text-[#0D1F3C] font-medium border border-[#FFD500] rounded-lg px-3 py-1.5 bg-[#FFFDF7] focus:outline-none focus:ring-2 focus:ring-[#FFD500]/30"
                  data-testid="input-telephone"
                />
              ) : (
                <span className="text-sm text-[#0D1F3C] font-medium">{user?.telephone || "—"}</span>
              )}
            </InfoRow>
            <InfoRow icon={<Briefcase className="w-4 h-4 text-[#8B9BB4]" />} label={t("parametres.label_org")}>
              {editing ? (
                <input
                  value={organisation}
                  onChange={(e) => setOrganisation(e.target.value)}
                  placeholder={t("parametres.org_placeholder")}
                  className="w-full text-sm text-[#0D1F3C] font-medium border border-[#FFD500] rounded-lg px-3 py-1.5 bg-[#FFFDF7] focus:outline-none focus:ring-2 focus:ring-[#FFD500]/30"
                  data-testid="input-organisation"
                />
              ) : (
                <span className="text-sm text-[#0D1F3C] font-medium">{user?.organisation || "—"}</span>
              )}
            </InfoRow>
            <InfoRow icon={<MapPin className="w-4 h-4 text-[#8B9BB4]" />} label={t("parametres.label_territoire")}>
              <span className="text-sm text-[#0D1F3C] font-medium">{user?.territoire}</span>
            </InfoRow>
            {editing && (
              <div className="p-4 flex gap-3 bg-[#F8F9FC]">
                <button
                  type="button"
                  onClick={handleCancelEdit}
                  className="flex-1 h-10 rounded-lg border border-[#DDE2EC] bg-white text-sm font-semibold text-[#6B7896] hover:bg-[#F1F4FA] transition-colors"
                  data-testid="btn-cancel-edit"
                >
                  {t("parametres.cancel")}
                </button>
                <button
                  type="button"
                  onClick={handleSaveInfos}
                  disabled={saving}
                  className="flex-[2] h-10 rounded-lg bg-[#0D1F3C] text-sm font-bold text-white hover:bg-[#162B52] disabled:opacity-60 inline-flex items-center justify-center gap-2 transition-colors"
                  data-testid="btn-save-infos"
                >
                  {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
                  {t("parametres.save")}
                </button>
              </div>
            )}
          </div>
        </div>

        <div>
          <h3 className="text-xs font-bold text-[#6B7896] uppercase tracking-widest mb-3">{t("parametres.section_assist")}</h3>
          <div className="bg-white rounded-2xl border border-[#DDE2EC] shadow-sm divide-y divide-[#F1F4FA]">
            <MenuRow
              icon={<MessageSquare className="w-4 h-4 text-[#0D1F3C]" />}
              label={t("parametres.contact_support")}
              sub={t("parametres.contact_support_sub")}
              onClick={() => { window.location.href = "mailto:support@fede-financement.com"; }}
            />
            <MenuRow
              icon={<FileText className="w-4 h-4 text-[#6B7896]" />}
              label={t("parametres.cgu_label")}
              sub={t("parametres.cgu_sub")}
              onClick={() => setShowConditions(true)}
            />
            <MenuRow
              icon={<Info className="w-4 h-4 text-[#6B7896]" />}
              label={t("parametres.about")}
              sub={t("parametres.about_sub")}
              onClick={() => setShowAbout(true)}
            />
          </div>
        </div>

        <div>
          <h3 className="text-xs font-bold text-[#6B7896] uppercase tracking-widest mb-3">{t("parametres.section_security")}</h3>
          <div className="bg-[#FFF8F0] border border-[#F0D9A8] rounded-2xl p-5">
            <div className="flex items-start gap-3 mb-3">
              <ShieldAlert className="w-5 h-5 text-[#FFD500] shrink-0 mt-0.5" />
              <p className="text-sm font-bold text-[#92400E]">{t("parametres.security_title")}</p>
            </div>
            <ul className="space-y-2 text-xs text-[#92400E] leading-relaxed">
              <li><span className="font-bold">❌ {t("parametres.no_telegram")}</span> {t("parametres.no_telegram_desc")}</li>
              <li><span className="font-bold">❌ {t("parametres.no_wire")}</span> {t("parametres.no_wire_desc")}</li>
              <li><span className="font-bold">❌ {t("parametres.no_pwd")}</span> {t("parametres.no_pwd_desc")}</li>
              <li><span className="font-bold">✅ {t("parametres.report")}</span> support@fede-financement.com</li>
            </ul>
          </div>
        </div>

        <p className="text-center text-[10px] text-[#B0BAD0]">{t("parametres.footer_legal")}</p>
      </div>

      {showConditions && (
        <Modal title={t("parametres.modal_cgu_title")} onClose={() => setShowConditions(false)}>
          <p className="text-[11px] font-bold text-[#FFD500] uppercase tracking-widest mb-4">{t("parametres.modal_cgu_ref")}</p>
          <div className="text-sm text-[#3A4A64] leading-relaxed space-y-3">
            <p>FEDE {t("parametres.about_mission").toLowerCase()}</p>
            <p><strong className="text-[#0D1F3C]">1. {t("parametres.modal_cgu_1_title")}</strong><br />{t("parametres.modal_cgu_1")}</p>
            <p><strong className="text-[#0D1F3C]">2. {t("parametres.modal_cgu_2_title")}</strong><br />{t("parametres.modal_cgu_2")}</p>
            <p><strong className="text-[#0D1F3C]">3. {t("parametres.modal_cgu_3_title")}</strong><br />{t("parametres.modal_cgu_3")}</p>
            <p><strong className="text-[#0D1F3C]">4. {t("parametres.modal_cgu_4_title")}</strong><br />{t("parametres.modal_cgu_4")}</p>
            <p className="text-xs text-[#8B9BB4]">{t("parametres.modal_cgu_version")}</p>
          </div>
        </Modal>
      )}

      {showAbout && (
        <Modal title={t("parametres.modal_about_title")} onClose={() => setShowAbout(false)}>
          <div className="flex flex-col items-center mb-6">
            <div className="w-20 h-20 rounded-2xl bg-[#0D1F3C] flex items-center justify-center mb-3 shadow-md">
              <span className="text-[#FFD500] text-2xl font-black tracking-tight">F</span>
            </div>
            <h4 className="text-xl font-extrabold text-[#0D1F3C]">FEDE</h4>
            <p className="text-xs text-[#8B9BB4]">{t("parametres.about_sub")}</p>
          </div>
          <div className="bg-white border border-[#DDE2EC] rounded-xl divide-y divide-[#F1F4FA]">
            {[
              { label: t("parametres.about_mission_label"), value: t("parametres.about_mission") },
              { label: t("parametres.about_territories_label"), value: t("parametres.about_territories") },
              { label: t("parametres.about_legal_label"), value: t("parametres.about_legal") },
              { label: t("parametres.about_contact_label"), value: t("parametres.about_contact") },
              { label: t("parametres.about_website_label"), value: t("parametres.about_website") },
            ].map((it) => (
              <div key={it.label} className="px-4 py-3">
                <p className="text-[10px] font-bold text-[#FFD500] uppercase tracking-widest">{it.label}</p>
                <p className="text-sm text-[#0D1F3C] font-medium">{it.value}</p>
              </div>
            ))}
          </div>
        </Modal>
      )}
    </UserLayout>
  );
}

function InfoRow({ icon, label, children }: { icon: React.ReactNode; label: string; children: React.ReactNode }) {
  return (
    <div className="flex items-start gap-3 p-4">
      <div className="mt-0.5 shrink-0">{icon}</div>
      <div className="flex-1 min-w-0">
        <p className="text-[10px] font-bold text-[#8B9BB4] uppercase tracking-widest mb-1">{label}</p>
        {children}
      </div>
    </div>
  );
}

function MenuRow({ icon, label, sub, onClick }: { icon: React.ReactNode; label: string; sub?: string; onClick?: () => void }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="w-full text-left flex items-center gap-3 p-4 hover:bg-[#F8F9FC] transition-colors"
    >
      <div className="w-9 h-9 rounded-lg bg-[#F1F4FA] flex items-center justify-center shrink-0">{icon}</div>
      <div className="flex-1 min-w-0">
        <p className="text-sm font-semibold text-[#0D1F3C]">{label}</p>
        {sub && <p className="text-xs text-[#8B9BB4] truncate">{sub}</p>}
      </div>
      <span className="text-[#DDE2EC] text-xl shrink-0">›</span>
    </button>
  );
}

function Modal({ title, children, onClose }: { title: string; children: React.ReactNode; onClose: () => void }) {
  return (
    <div
      className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-4"
      onClick={onClose}
    >
      <div
        className="bg-white rounded-2xl shadow-2xl max-w-lg w-full max-h-[85vh] flex flex-col overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between px-5 py-4 border-b border-[#EEF0F7]">
          <h3 className="text-lg font-extrabold text-[#0D1F3C]">{title}</h3>
          <button
            type="button"
            onClick={onClose}
            className="w-9 h-9 rounded-lg bg-[#F1F4FA] flex items-center justify-center hover:bg-[#E5E9F2] transition-colors"
          >
            <X className="w-4 h-4 text-[#0D1F3C]" />
          </button>
        </div>
        <div className="overflow-y-auto p-5">{children}</div>
      </div>
    </div>
  );
}
