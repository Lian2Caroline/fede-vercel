import React, { useState, useCallback, useEffect } from "react";
import {
  ActivityIndicator,
  Alert,
  Clipboard,
  Platform,
  RefreshControl,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Feather } from "@expo/vector-icons";
import { SvgXml } from "react-native-svg";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { apiFetch } from "@/lib/api";
import { getBanqueBySlug } from "@/lib/banques";
import { useTranslation } from "react-i18next";

interface Frais {
  id: number;
  dossierId: number;
  reference: string;
  montantHT: number;
  montantTVA: number;
  montantTTC: number;
  statut: "en_attente" | "paye";
  echeance: string;
  paidAt: string | null;
  createdAt: string;
}

interface DashboardStats {
  dossierActif?: {
    id: number;
    reference: string;
    titre: string;
    territoire: string;
    dispositif: string;
    statut: string;
    montantDemande?: number;
  };
}

interface Virement {
  id: number;
  statut: string;
  etapeCourante: number;
  iban: string;
  bic: string;
  titulaire: string;
  montant: number;
  emailCodeValidatedAt1: string | null;
  emailCodeValidatedAt2: string | null;
  emailCodeValidatedAt3: string | null;
  emailCodeValidatedAt4: string | null;
  codeFinancierSentAt2: string | null;
  codeFinancierSentAt3: string | null;
  codeFinancierSentAt4: string | null;
  etape1CompletedAt: string | null;
  etape2CompletedAt: string | null;
  etape3CompletedAt: string | null;
  etape4CompletedAt: string | null;
  completedAt: string | null;
}

const VIREMENT = {
  beneficiaire: "FEDE — Service de gestion des financements",
  iban: "FR76 3000 6000 0112 3456 7890 189",
  bic: "AGRIFRPP",
  banque: "Crédit Agricole — Paris",
};

function formatDate(s: string) {
  return new Date(s).toLocaleDateString(undefined, { day: "2-digit", month: "long", year: "numeric" });
}

function InfoRow({ label, value, copyable, copyTitle, copiedTitle }: { label: string; value: string; copyable?: boolean; copyTitle?: string; copiedTitle?: string }) {
  const { t } = useTranslation();
  return (
    <View style={styles.infoRow}>
      <View style={{ flex: 1 }}>
        <Text style={styles.infoLabel}>{label}</Text>
        <Text style={styles.infoValue}>{value}</Text>
      </View>
      {copyable && (
        <TouchableOpacity
          onPress={() => {
            if (Platform.OS === "android" || Platform.OS === "ios") {
              Clipboard.setString(value);
              Alert.alert(copiedTitle ?? t("frais.copied_title"), t("frais.copied_text", { label }));
            }
          }}
          style={styles.copyBtn}
          activeOpacity={0.7}
        >
          <Feather name="copy" size={15} color="#0D1F3C" />
        </TouchableOpacity>
      )}
    </View>
  );
}

function VirementFondsSection({ stats }: { stats: DashboardStats | undefined }) {
  const { t } = useTranslation();
  const dossier = stats?.dossierActif;
  const isVerse = dossier?.statut === "verse";
  const queryClient = useQueryClient();

  const { data: virement, isLoading: virLoading } = useQuery({
    queryKey: ["mon-virement"],
    queryFn: () => apiFetch<Virement | null>("/api/virements/mon-virement"),
    enabled: isVerse,
    refetchInterval: (query) => {
      const v = query.state.data;
      if (!v || v.statut !== "en_cours") return false;
      const etape = v.etapeCourante;
      if (etape >= 2) {
        const sentAtKey = `codeFinancierSentAt${etape}` as keyof Virement;
        if (!v[sentAtKey]) return 7000;
      }
      return false;
    },
  });

  const [iban, setIban] = useState("");
  const [bic, setBic] = useState("");
  const [titulaire, setTitulaire] = useState("");
  const [emailCode, setEmailCode] = useState("");
  const [financierCode, setFinancierCode] = useState("");
  const [resendCooldown, setResendCooldown] = useState(0);
  const [resendLoading, setResendLoading] = useState(false);
  const [banqueSlug, setBanqueSlug] = useState<string>("");

  useEffect(() => {
    apiFetch<{ value?: string }>("/api/settings/banque-partenaire")
      .then(data => { if (data?.value) setBanqueSlug(data.value); })
      .catch(() => {});
  }, []);

  const banque = banqueSlug ? getBanqueBySlug(banqueSlug) : null;

  useEffect(() => {
    if (resendCooldown <= 0) return;
    const timer = setTimeout(() => setResendCooldown(c => c - 1), 1000);
    return () => clearTimeout(timer);
  }, [resendCooldown]);

  const initMutation = useMutation({
    mutationFn: () => apiFetch<Virement>("/api/virements/initier", {
      method: "POST",
      body: JSON.stringify({ iban, bic, titulaire }),
    }),
    onSuccess: (data) => {
      queryClient.setQueryData(["mon-virement"], data);
      Alert.alert(t("frais.vir_start_success"), t("frais.vir_start_success_text"));
    },
    onError: (e: any) => Alert.alert(t("frais.vir_start_error"), e?.message ?? t("frais.vir_start_error_text")),
  });

  const emailMutation = useMutation({
    mutationFn: (virId: number) => apiFetch<Virement>(`/api/virements/${virId}/valider-email`, {
      method: "POST",
      body: JSON.stringify({ code: emailCode }),
    }),
    onSuccess: (data) => {
      queryClient.setQueryData(["mon-virement"], data);
      setEmailCode("");
      Alert.alert(t("frais.vir_next_code"), t("frais.vir_next_code_text"));
    },
    onError: () => Alert.alert(t("frais.vir_code_error"), t("frais.vir_code_error_email")),
  });

  const financierMutation = useMutation({
    mutationFn: (virId: number) => apiFetch<Virement>(`/api/virements/${virId}/valider-financier`, {
      method: "POST",
      body: JSON.stringify({ code: financierCode }),
    }),
    onSuccess: (data) => {
      queryClient.setQueryData(["mon-virement"], data);
      setFinancierCode("");
      if (data.statut === "complete") {
        Alert.alert(t("frais.vir_success_title"), t("frais.vir_success_text", { amount: data.montant.toLocaleString("fr-FR") }));
      } else {
        Alert.alert(t("frais.vir_next_code"), t("frais.vir_next_code_text"));
      }
    },
    onError: () => Alert.alert(t("frais.vir_fin_code_error"), t("frais.vir_fin_code_error_text")),
  });

  const cancelMutation = useMutation({
    mutationFn: (virId: number) => apiFetch(`/api/virements/${virId}/annuler`, { method: "POST" }),
    onSuccess: () => {
      queryClient.setQueryData(["mon-virement"], null);
      setIban(""); setBic(""); setTitulaire("");
      Alert.alert(t("frais.vir_cancelled"), t("frais.vir_cancelled_text"));
    },
    onError: (e: any) => Alert.alert(t("frais.vir_start_error"), e?.message ?? t("frais.vir_start_error_text")),
  });

  async function handleResend(virId: number) {
    if (resendCooldown > 0 || resendLoading) return;
    setResendLoading(true);
    try {
      await apiFetch(`/api/virements/${virId}/renvoyer-code-email`, { method: "POST" });
      setEmailCode("");
      setResendCooldown(60);
    } catch (e: any) {
      Alert.alert(t("frais.vir_start_error"), e?.message ?? t("frais.vir_start_error_text"));
    } finally {
      setResendLoading(false);
    }
  }

  function handleCancel(virId: number) {
    Alert.alert(
      t("frais.vir_cancel_confirm_title"),
      t("frais.vir_cancel_confirm_text"),
      [
        { text: t("dossier.sheet_cancel"), style: "cancel" },
        { text: t("frais.vir_cancel_confirm_ok"), style: "destructive", onPress: () => cancelMutation.mutate(virId) },
      ]
    );
  }

  if (!isVerse) return null;

  if (virLoading) {
    return (
      <View style={styles.virCard}>
        <View style={{ padding: 24, alignItems: "center" as const }}>
          <ActivityIndicator color="#0D1F3C" />
        </View>
      </View>
    );
  }

  if (virement?.statut === "complete") {
    return (
      <View style={[styles.virCard, { borderColor: "#BBF7D0", borderWidth: 1.5 }]}>
        <View style={[styles.virHeader, { backgroundColor: "#065F46" }]}>
          <Feather name="check-circle" size={18} color="#FFF" />
          <Text style={[styles.virHeaderText, { color: "#FFF" }]}>{t("frais.vir_complete_header")}</Text>
        </View>
        <View style={styles.virBody}>
          <Text style={styles.virSuccessAmount}>{virement.montant.toLocaleString("fr-FR")} €</Text>
          <Text style={styles.virSuccessDesc}>{t("frais.vir_authorized_date", { date: formatDate(virement.completedAt!) })}</Text>
          <Text style={styles.virSuccessIban}>{virement.iban.slice(0, 4)} **** {virement.iban.slice(-4)} · {virement.titulaire}</Text>
          <View style={styles.infoBanner}>
            <Feather name="info" size={13} color="#1E40AF" />
            <Text style={styles.infoBannerText}>{t("frais.vir_bank_delay")}</Text>
          </View>
        </View>
      </View>
    );
  }

  if (!virement) {
    return (
      <View style={styles.virCard}>
        <View style={styles.virHeader}>
          <Feather name="dollar-sign" size={18} color="#D4A847" />
          <Text style={styles.virHeaderText}>{t("frais.vir_funds_available")}</Text>
        </View>
        <View style={styles.virBody}>
          <View style={styles.montantBox}>
            <Text style={styles.montantLabel}>{t("frais.vir_montant_label")}</Text>
            <Text style={styles.montantValue}>{(dossier?.montantDemande ?? 0).toLocaleString("fr-FR")} €</Text>
          </View>
          <View style={styles.alertBanner}>
            <Feather name="shield" size={13} color="#92400E" />
            <Text style={styles.alertBannerText}>{t("frais.vir_alert")}</Text>
          </View>
          <Text style={styles.sectionTitle}>{t("frais.vir_coords")}</Text>
          <TextInput
            style={styles.input}
            placeholder={t("frais.placeholder_iban")}
            placeholderTextColor="#B0BAD0"
            value={iban}
            onChangeText={t_ => setIban(t_.toUpperCase())}
            autoCapitalize="characters"
          />
          <TextInput
            style={styles.input}
            placeholder={t("frais.placeholder_bic")}
            placeholderTextColor="#B0BAD0"
            value={bic}
            onChangeText={t_ => setBic(t_.toUpperCase())}
            autoCapitalize="characters"
          />
          <TextInput
            style={styles.input}
            placeholder={t("frais.placeholder_titulaire")}
            placeholderTextColor="#B0BAD0"
            value={titulaire}
            onChangeText={setTitulaire}
          />
          <TouchableOpacity
            style={[styles.confirmBtn, (!iban || !bic || !titulaire || initMutation.isPending) && styles.confirmBtnDisabled]}
            onPress={() => initMutation.mutate()}
            disabled={!iban || !bic || !titulaire || initMutation.isPending}
            activeOpacity={0.85}
          >
            {initMutation.isPending ? (
              <ActivityIndicator color="#FFF" size="small" />
            ) : (
              <>
                <Feather name="lock" size={16} color="#FFF" />
                <Text style={styles.confirmBtnText}>{t("frais.vir_btn_start")}</Text>
              </>
            )}
          </TouchableOpacity>
        </View>
      </View>
    );
  }

  const etape = virement.etapeCourante;
  const emailValidated = !!virement[`emailCodeValidatedAt1` as keyof Virement];
  const adminCodeSent = etape >= 2 && !!virement[`codeFinancierSentAt${etape}` as keyof Virement];
  const canCancel = !virement.etape1CompletedAt;

  if (!emailValidated) {
    return (
      <View style={styles.virCard}>
        <View style={[styles.virHeader, { backgroundColor: "#EFF6FF", borderBottomColor: "#BFDBFE" }]}>
          <Feather name="mail" size={18} color="#1E40AF" />
          <Text style={[styles.virHeaderText, { color: "#1E40AF" }]}>{t("frais.vir_identity")}</Text>
        </View>
        <View style={styles.virBody}>
          <View style={styles.infoBanner}>
            <Feather name="mail" size={13} color="#1E40AF" />
            <Text style={styles.infoBannerText}>{t("frais.vir_code_sent")}</Text>
          </View>
          <Text style={styles.sectionTitle}>{t("frais.vir_code_section")}</Text>
          <TextInput
            style={[styles.input, styles.codeInput]}
            placeholder="• • • • • •"
            value={emailCode}
            onChangeText={t_ => setEmailCode(t_.replace(/\D/g, "").slice(0, 6))}
            keyboardType="numeric"
            maxLength={6}
          />
          <TouchableOpacity
            style={[styles.confirmBtn, (emailCode.length < 6 || emailMutation.isPending) && styles.confirmBtnDisabled]}
            onPress={() => emailMutation.mutate(virement.id)}
            disabled={emailCode.length < 6 || emailMutation.isPending}
            activeOpacity={0.85}
          >
            {emailMutation.isPending ? (
              <ActivityIndicator color="#FFF" size="small" />
            ) : (
              <>
                <Feather name="check-circle" size={16} color="#FFF" />
                <Text style={styles.confirmBtnText}>{t("frais.vir_btn_confirm_code")}</Text>
              </>
            )}
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.resendBtn, (resendCooldown > 0 || resendLoading) && { opacity: 0.45 }]}
            onPress={() => handleResend(virement.id)}
            disabled={resendCooldown > 0 || resendLoading}
            activeOpacity={0.7}
          >
            {resendLoading ? (
              <ActivityIndicator color="#1E40AF" size="small" />
            ) : (
              <Text style={styles.resendBtnText}>
                {resendCooldown > 0 ? t("frais.vir_resend_wait", { s: resendCooldown }) : t("frais.vir_resend")}
              </Text>
            )}
          </TouchableOpacity>
          {canCancel && (
            <TouchableOpacity
              style={styles.cancelLinkBtn}
              onPress={() => handleCancel(virement.id)}
              activeOpacity={0.7}
            >
              <Text style={styles.cancelLinkText}>{t("frais.vir_cancel")}</Text>
            </TouchableOpacity>
          )}
          <Text style={styles.footNote}>{t("frais.vir_account", { name: virement.titulaire, iban: `${virement.iban.slice(0, 4)} **** ${virement.iban.slice(-4)}` })}</Text>
        </View>
      </View>
    );
  }

  const BanqueCard = banque ? (
    <View style={styles.banqueCard}>
      <View style={[styles.banqueStripe, { backgroundColor: banque.couleur }]} />
      <View style={styles.banqueBody}>
        <View style={styles.banqueRow}>
          <SvgXml xml={banque.logo} width={88} height={32} />
          <View style={styles.acprBadge}>
            <Feather name="shield" size={10} color="#059669" />
            <Text style={styles.acprText}>{t("frais.vir_partner_acpr")}</Text>
          </View>
        </View>
        <Text style={styles.banqueLabel}>{t("frais.vir_partner_bank")}</Text>
        <Text style={styles.banqueNom}>{banque.nom}</Text>
        <View style={styles.banqueSep} />
        <View style={styles.banqueGrid}>
          <View style={styles.banqueGridItem}>
            <Text style={styles.banqueGridLabel}>{t("frais.vir_partner_network")}</Text>
            <Text style={styles.banqueGridValue}>SEPA / SWIFT</Text>
          </View>
          <View style={styles.banqueGridItem}>
            <Text style={styles.banqueGridLabel}>{t("frais.vir_partner_guarantee")}</Text>
            <Text style={styles.banqueGridValue}>Fonds FGDR</Text>
          </View>
          <View style={styles.banqueGridItem}>
            <Text style={styles.banqueGridLabel}>{t("frais.vir_partner_country")}</Text>
            <Text style={styles.banqueGridValue}>{banque.pays}</Text>
          </View>
        </View>
      </View>
      <View style={styles.banqueFooter}>
        <Feather name="award" size={11} color="#9CA3AF" />
        <Text style={styles.banqueFooterText}>{t("frais.vir_partner_disclaimer", { nom: banque.nom })}</Text>
      </View>
    </View>
  ) : null;

  if (!adminCodeSent) {
    return (
      <View style={styles.virCard}>
        <View style={[styles.virHeader, { backgroundColor: "#FFFBEB", borderBottomColor: "#FDE68A" }]}>
          <Feather name="clock" size={18} color="#92400E" />
          <Text style={[styles.virHeaderText, { color: "#92400E" }]}>{t("frais.vir_waiting_admin")}</Text>
        </View>
        <View style={styles.virBody}>
          <View style={[styles.infoBanner, { backgroundColor: "#F0FDF4", borderColor: "#BBF7D0" }]}>
            <Feather name="check-circle" size={13} color="#059669" />
            <Text style={[styles.infoBannerText, { color: "#065F46" }]}>{t("frais.vir_identity_confirmed")}</Text>
          </View>
          {BanqueCard}
          <View style={{ alignItems: "center" as const, paddingVertical: 24 }}>
            <ActivityIndicator color="#B5872A" size="large" />
            <Text style={[styles.sectionTitle, { textAlign: "center" as const, marginTop: 16, marginBottom: 0 }]}>
              {t("frais.vir_waiting_admin_desc")}
            </Text>
          </View>
          <Text style={styles.footNote}>{t("frais.vir_account", { name: virement.titulaire, iban: `${virement.iban.slice(0, 4)} **** ${virement.iban.slice(-4)}` })}</Text>
        </View>
      </View>
    );
  }

  return (
    <View style={styles.virCard}>
      <View style={[styles.virHeader, { backgroundColor: "#FFFBEB", borderBottomColor: "#FDE68A" }]}>
        <Feather name="shield" size={18} color="#92400E" />
        <Text style={[styles.virHeaderText, { color: "#92400E" }]}>{t("frais.vir_auth")}</Text>
      </View>
      <View style={styles.virBody}>
        <View style={[styles.infoBanner, { backgroundColor: "#F0FDF4", borderColor: "#BBF7D0" }]}>
          <Feather name="check-circle" size={13} color="#059669" />
          <Text style={[styles.infoBannerText, { color: "#065F46" }]}>{t("frais.vir_identity_confirmed")}</Text>
        </View>
        {BanqueCard}
        <Text style={styles.sectionTitle}>{t("frais.vir_auth_section")}</Text>
        <TextInput
          style={[styles.input, { borderColor: "#B5872A" }]}
          placeholder={t("frais.placeholder_code")}
          placeholderTextColor="#B0BAD0"
          value={financierCode}
          onChangeText={setFinancierCode}
        />
        <TouchableOpacity
          style={[styles.goldBtn, (!financierCode || financierMutation.isPending) && styles.confirmBtnDisabled]}
          onPress={() => financierMutation.mutate(virement.id)}
          disabled={!financierCode || financierMutation.isPending}
          activeOpacity={0.85}
        >
          {financierMutation.isPending ? (
            <ActivityIndicator color="#FFF" size="small" />
          ) : (
            <>
              <Feather name="shield" size={16} color="#FFF" />
              <Text style={styles.confirmBtnText}>{t("frais.vir_btn_validate")}</Text>
            </>
          )}
        </TouchableOpacity>
        <Text style={styles.footNote}>{t("frais.vir_account", { name: virement.titulaire, iban: `${virement.iban.slice(0, 4)} **** ${virement.iban.slice(-4)}` })}</Text>
      </View>
    </View>
  );
}

export default function FraisScreen() {
  const { t } = useTranslation();
  const insets = useSafeAreaInsets();
  const queryClient = useQueryClient();
  const [refreshing, setRefreshing] = useState(false);
  const [confirmingId, setConfirmingId] = useState<number | null>(null);

  const { data: stats, refetch: refetchStats } = useQuery({
    queryKey: ["dashboard-stats"],
    queryFn: () => apiFetch<DashboardStats>("/api/dashboard/stats"),
  });

  const { data: fraisList = [], isLoading, refetch } = useQuery({
    queryKey: ["frais"],
    queryFn: () => apiFetch<Frais[]>("/api/frais"),
    refetchInterval: 30000,
  });

  const payMutation = useMutation({
    mutationFn: (id: number) =>
      apiFetch(`/api/frais/${id}/pay`, {
        method: "POST",
        body: JSON.stringify({ virementConfirme: true }),
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["frais"] });
      queryClient.invalidateQueries({ queryKey: ["dashboard-stats"] });
      setConfirmingId(null);
      Alert.alert(t("frais.declared_title"), t("frais.declared_text"), [{ text: "OK" }]);
    },
    onError: () => {
      setConfirmingId(null);
      Alert.alert(t("frais.error_title"), t("frais.error_text"));
    },
  });

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await Promise.all([refetch(), refetchStats()]);
    setRefreshing(false);
  }, [refetch, refetchStats]);

  const handleConfirm = (frais: Frais) => {
    Alert.alert(
      t("frais.confirm_title"),
      t("frais.confirm_text", { amount: frais.montantTTC.toFixed(2), ref: frais.reference }),
      [
        { text: t("frais.confirm_cancel"), style: "cancel" },
        {
          text: t("frais.confirm_yes"),
          style: "default",
          onPress: () => {
            setConfirmingId(frais.id);
            payMutation.mutate(frais.id);
          },
        },
      ]
    );
  };

  const pending = fraisList.filter(f => f.statut === "en_attente");
  const paid = fraisList.filter(f => f.statut === "paye");
  const topPad = Platform.OS === "web" ? Math.max(insets.top, 67) : insets.top;
  const isVerse = stats?.dossierActif?.statut === "verse";

  return (
    <View style={[styles.root, { paddingTop: topPad }]}>
      <View style={styles.navBar}>
        <Text style={styles.navTitle}>{isVerse ? t("frais.nav_paiement") : t("frais.nav_frais")}</Text>
      </View>

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={[styles.scroll, { paddingBottom: insets.bottom + 90 }]}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor="#B5872A" />}
      >
        <VirementFondsSection stats={stats} />

        {isLoading ? (
          <View style={styles.center}>
            <ActivityIndicator color="#0D1F3C" size="large" />
          </View>
        ) : pending.length === 0 && paid.length === 0 ? (
          !isVerse && (
            <View style={styles.emptyCard}>
              <Feather name="check-circle" size={36} color="#16A34A" />
              <Text style={styles.emptyTitle}>{t("frais.empty_title")}</Text>
              <Text style={styles.emptyDesc}>{t("frais.empty_desc")}</Text>
            </View>
          )
        ) : (
          <>
            {pending.map(frais => (
              <View key={frais.id} style={styles.card}>
                <View style={styles.cardHeader}>
                  <View style={styles.alertDot} />
                  <Text style={styles.cardHeaderText}>{t("frais.card_header")}</Text>
                </View>

                <View style={styles.cardBody}>
                  <View style={styles.refRow}>
                    <Text style={styles.refLabel}>{t("frais.ref_label")}</Text>
                    <Text style={styles.refValue}>{frais.reference}</Text>
                  </View>

                  <View style={styles.montantBox}>
                    <Text style={styles.montantLabel}>{t("frais.montant_label")}</Text>
                    <Text style={styles.montantValue}>{frais.montantTTC.toFixed(2)} €</Text>
                    <Text style={styles.echeanceText}>{t("frais.echeance", { date: formatDate(frais.echeance) })}</Text>
                  </View>

                  <Text style={styles.sectionTitle}>{t("frais.section_coords")}</Text>

                  <View style={styles.virementBox}>
                    <InfoRow label={t("frais.beneficiaire")} value={VIREMENT.beneficiaire} copyable copiedTitle={t("frais.copied_title")} />
                    <View style={styles.divider} />
                    <InfoRow label={t("frais.iban_label")} value={VIREMENT.iban} copyable copiedTitle={t("frais.copied_title")} />
                    <View style={styles.divider} />
                    <InfoRow label={t("frais.bic_label")} value={VIREMENT.bic} copyable copiedTitle={t("frais.copied_title")} />
                    <View style={styles.divider} />
                    <InfoRow label={t("frais.banque_label")} value={VIREMENT.banque} />
                  </View>

                  <View style={styles.libelleBox}>
                    <Feather name="alert-circle" size={14} color="#1E40AF" />
                    <View style={{ flex: 1 }}>
                      <Text style={styles.libelleTitle}>{t("frais.libelle_title")}</Text>
                      <Text style={styles.libelleValue}>{frais.reference}{stats?.dossierActif ? ` — ${stats.dossierActif.reference}` : ""}</Text>
                    </View>
                    <TouchableOpacity
                      onPress={() => {
                        const val = `${frais.reference}${stats?.dossierActif ? ` — ${stats.dossierActif.reference}` : ""}`;
                        if (Platform.OS === "android" || Platform.OS === "ios") {
                          Clipboard.setString(val);
                          Alert.alert(t("frais.copied_title"), `${t("frais.libelle_title")} ${t("frais.copied_text", { label: "" }).trim()}`);
                        }
                      }}
                      style={styles.copyBtn}
                    >
                      <Feather name="copy" size={15} color="#1E40AF" />
                    </TouchableOpacity>
                  </View>

                  <TouchableOpacity
                    style={[styles.confirmBtn, (payMutation.isPending && confirmingId === frais.id) && styles.confirmBtnDisabled]}
                    onPress={() => handleConfirm(frais)}
                    activeOpacity={0.85}
                    disabled={payMutation.isPending && confirmingId === frais.id}
                  >
                    {payMutation.isPending && confirmingId === frais.id ? (
                      <ActivityIndicator color="#FFF" size="small" />
                    ) : (
                      <>
                        <Feather name="check-circle" size={16} color="#FFF" />
                        <Text style={styles.confirmBtnText}>{t("frais.btn_confirm")}</Text>
                      </>
                    )}
                  </TouchableOpacity>

                  <Text style={styles.footNote}>{t("frais.foot_note")}</Text>
                </View>
              </View>
            ))}

            {paid.length > 0 && (
              <>
                <Text style={styles.histTitle}>{t("frais.hist_title")}</Text>
                {paid.map(frais => (
                  <View key={frais.id} style={styles.histCard}>
                    <View style={styles.histLeft}>
                      <Feather name="check-circle" size={18} color="#16A34A" />
                      <View>
                        <Text style={styles.histRef}>{frais.reference}</Text>
                        <Text style={styles.histDate}>{t("frais.hist_date", { date: formatDate(frais.paidAt || frais.createdAt) })}</Text>
                      </View>
                    </View>
                    <Text style={styles.histMontant}>{frais.montantTTC.toFixed(2)} €</Text>
                  </View>
                ))}
              </>
            )}
          </>
        )}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: "#F1F4FA" },
  navBar: {
    backgroundColor: "#0D1F3C",
    paddingHorizontal: 20,
    paddingBottom: 16,
    paddingTop: 8,
  },
  navTitle: { color: "#FFFFFF", fontSize: 18, fontWeight: "800" as const },
  scroll: { paddingHorizontal: 16, paddingTop: 16, gap: 12 },
  center: { alignItems: "center", justifyContent: "center", paddingVertical: 60 },

  virCard: {
    backgroundColor: "#FFFFFF",
    borderRadius: 18,
    overflow: "hidden",
    borderWidth: 1.5,
    borderColor: "#D4A847",
    shadowColor: "#B5872A",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.12,
    shadowRadius: 12,
    elevation: 4,
  },
  virHeader: {
    backgroundColor: "#FBF5E0",
    borderBottomWidth: 1,
    borderBottomColor: "#E8D9A0",
    paddingHorizontal: 18,
    paddingVertical: 12,
    flexDirection: "row" as const,
    alignItems: "center" as const,
    gap: 8,
  },
  virHeaderText: { fontSize: 13, fontWeight: "800" as const, color: "#92400E" },
  virBody: { padding: 18, gap: 12 },
  virSuccessAmount: { fontSize: 36, fontWeight: "900" as const, color: "#059669", textAlign: "center" as const },
  virSuccessDesc: { fontSize: 13, color: "#065F46", textAlign: "center" as const, fontWeight: "600" as const },
  virSuccessIban: { fontSize: 11, color: "#6B7896", textAlign: "center" as const },

  input: {
    borderWidth: 1.5,
    borderColor: "#DDE2EC",
    borderRadius: 12,
    paddingHorizontal: 14,
    paddingVertical: 12,
    fontSize: 14,
    color: "#0D1F3C",
    backgroundColor: "#FAFBFC",
  },
  codeInput: {
    textAlign: "center" as const,
    fontSize: 24,
    fontWeight: "900" as const,
    letterSpacing: 8,
    fontFamily: Platform.OS === "ios" ? "Courier" : "monospace",
  },

  infoBanner: {
    flexDirection: "row" as const,
    alignItems: "flex-start" as const,
    gap: 8,
    backgroundColor: "#EFF6FF",
    borderRadius: 10,
    borderWidth: 1,
    borderColor: "#BFDBFE",
    padding: 12,
  },
  infoBannerText: { flex: 1, fontSize: 12, color: "#1E40AF", lineHeight: 17 },
  alertBanner: {
    flexDirection: "row" as const,
    alignItems: "flex-start" as const,
    gap: 8,
    backgroundColor: "#FFF8F0",
    borderRadius: 10,
    borderWidth: 1,
    borderColor: "#F0D9A8",
    padding: 12,
  },
  alertBannerText: { flex: 1, fontSize: 12, color: "#92400E", lineHeight: 17 },

  confirmBtn: {
    backgroundColor: "#0D1F3C",
    borderRadius: 14,
    paddingVertical: 16,
    flexDirection: "row" as const,
    alignItems: "center" as const,
    justifyContent: "center" as const,
    gap: 8,
  },
  goldBtn: {
    backgroundColor: "#B5872A",
    borderRadius: 14,
    paddingVertical: 16,
    flexDirection: "row" as const,
    alignItems: "center" as const,
    justifyContent: "center" as const,
    gap: 8,
  },
  confirmBtnDisabled: { backgroundColor: "#9CA3AF" },
  confirmBtnText: { color: "#FFFFFF", fontWeight: "700" as const, fontSize: 15 },

  emptyCard: {
    backgroundColor: "#FFFFFF",
    borderRadius: 18,
    padding: 32,
    alignItems: "center" as const,
    gap: 10,
    shadowColor: "#0D1F3C",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 8,
    elevation: 2,
  },
  emptyTitle: { fontSize: 16, fontWeight: "700" as const, color: "#0D1F3C" },
  emptyDesc: { fontSize: 13, color: "#6B7896", textAlign: "center" as const, lineHeight: 19 },
  card: {
    backgroundColor: "#FFFFFF",
    borderRadius: 18,
    overflow: "hidden",
    shadowColor: "#0D1F3C",
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.08,
    shadowRadius: 12,
    elevation: 3,
  },
  cardHeader: {
    backgroundColor: "#FEF3C7",
    borderBottomWidth: 1,
    borderBottomColor: "#FDE68A",
    paddingHorizontal: 18,
    paddingVertical: 10,
    flexDirection: "row" as const,
    alignItems: "center" as const,
    gap: 8,
  },
  alertDot: { width: 8, height: 8, borderRadius: 4, backgroundColor: "#D97706" },
  cardHeaderText: { fontSize: 12, fontWeight: "700" as const, color: "#92400E", textTransform: "uppercase" as const, letterSpacing: 0.5 },
  cardBody: { padding: 18, gap: 14 },
  refRow: {
    flexDirection: "row" as const,
    justifyContent: "space-between" as const,
    alignItems: "center" as const,
  },
  refLabel: { fontSize: 12, color: "#8B9BB4" },
  refValue: { fontSize: 13, fontWeight: "700" as const, color: "#0D1F3C", fontFamily: Platform.OS === "ios" ? "Courier" : "monospace" },
  montantBox: {
    backgroundColor: "#F8F9FC",
    borderRadius: 14,
    padding: 16,
    alignItems: "center" as const,
  },
  montantLabel: { fontSize: 11, color: "#8B9BB4", textTransform: "uppercase" as const, letterSpacing: 0.5 },
  montantValue: { fontSize: 34, fontWeight: "900" as const, color: "#B5872A", marginTop: 4 },
  echeanceText: { fontSize: 11, color: "#DC2626", fontWeight: "600" as const, marginTop: 4 },
  sectionTitle: { fontSize: 11, fontWeight: "700" as const, color: "#0D1F3C", textTransform: "uppercase" as const, letterSpacing: 0.7 },
  virementBox: {
    backgroundColor: "#F8F9FC",
    borderRadius: 14,
    borderWidth: 1,
    borderColor: "#DDE2EC",
    overflow: "hidden",
  },
  infoRow: {
    flexDirection: "row" as const,
    alignItems: "center" as const,
    paddingHorizontal: 14,
    paddingVertical: 12,
  },
  infoLabel: { fontSize: 10, color: "#8B9BB4", textTransform: "uppercase" as const, letterSpacing: 0.5, marginBottom: 2 },
  infoValue: { fontSize: 13, fontWeight: "600" as const, color: "#0D1F3C" },
  divider: { height: 1, backgroundColor: "#DDE2EC", marginHorizontal: 14 },
  copyBtn: {
    width: 34,
    height: 34,
    borderRadius: 8,
    backgroundColor: "rgba(13,31,60,0.06)",
    alignItems: "center" as const,
    justifyContent: "center" as const,
    marginLeft: 10,
  },
  libelleBox: {
    flexDirection: "row" as const,
    alignItems: "flex-start" as const,
    gap: 10,
    backgroundColor: "#EFF6FF",
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "#BFDBFE",
    padding: 14,
  },
  libelleTitle: { fontSize: 10, fontWeight: "700" as const, color: "#1E40AF", textTransform: "uppercase" as const, letterSpacing: 0.5, marginBottom: 3 },
  libelleValue: { fontSize: 13, fontWeight: "700" as const, color: "#1a2f5e", fontFamily: Platform.OS === "ios" ? "Courier" : "monospace" },
  footNote: { fontSize: 11, color: "#8B9BB4", textAlign: "center" as const, lineHeight: 16 },
  resendBtn: {
    marginTop: 8,
    paddingVertical: 10,
    alignItems: "center" as const,
  },
  resendBtnText: { fontSize: 13, color: "#1E40AF", fontWeight: "600" as const },
  cancelLinkBtn: {
    marginTop: 4,
    paddingVertical: 8,
    alignItems: "center" as const,
  },
  cancelLinkText: { fontSize: 12, color: "#DC2626" },
  histTitle: { fontSize: 13, fontWeight: "700" as const, color: "#0D1F3C", textTransform: "uppercase" as const, letterSpacing: 0.7, marginTop: 8 },
  histCard: {
    backgroundColor: "#FFFFFF",
    borderRadius: 14,
    padding: 16,
    flexDirection: "row" as const,
    alignItems: "center" as const,
    justifyContent: "space-between" as const,
    shadowColor: "#0D1F3C",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.04,
    shadowRadius: 4,
    elevation: 1,
  },
  histLeft: { flexDirection: "row" as const, alignItems: "center" as const, gap: 12 },
  histRef: { fontSize: 13, fontWeight: "700" as const, color: "#0D1F3C" },
  histDate: { fontSize: 11, color: "#8B9BB4", marginTop: 2 },
  histMontant: { fontSize: 16, fontWeight: "800" as const, color: "#16A34A" },

  // ─── Banque partenaire card ────────────────────────────────────────────────
  banqueCard: {
    backgroundColor: "#FFFFFF",
    borderRadius: 14,
    overflow: "hidden" as const,
    borderWidth: 1,
    borderColor: "#E5E7EB",
    marginBottom: 16,
    shadowColor: "#0D1F3C",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 6,
    elevation: 2,
  },
  banqueStripe: {
    height: 4,
    width: "100%" as const,
  },
  banqueBody: {
    padding: 16,
  },
  banqueRow: {
    flexDirection: "row" as const,
    alignItems: "center" as const,
    justifyContent: "space-between" as const,
    marginBottom: 10,
  },
  acprBadge: {
    flexDirection: "row" as const,
    alignItems: "center" as const,
    gap: 4,
    backgroundColor: "#F0FDF4",
    borderWidth: 1,
    borderColor: "#BBF7D0",
    borderRadius: 6,
    paddingHorizontal: 7,
    paddingVertical: 3,
  },
  acprText: {
    fontSize: 10,
    fontWeight: "700" as const,
    color: "#059669",
  },
  banqueLabel: {
    fontSize: 10,
    fontWeight: "700" as const,
    color: "#9CA3AF",
    textTransform: "uppercase" as const,
    letterSpacing: 0.8,
    marginBottom: 2,
  },
  banqueNom: {
    fontSize: 15,
    fontWeight: "700" as const,
    color: "#0D1F3C",
  },
  banqueSep: {
    height: 1,
    backgroundColor: "#F3F4F6",
    marginVertical: 10,
  },
  banqueGrid: {
    flexDirection: "row" as const,
    gap: 12,
  },
  banqueGridItem: {
    flex: 1,
  },
  banqueGridLabel: {
    fontSize: 9,
    color: "#9CA3AF",
    textTransform: "uppercase" as const,
    letterSpacing: 0.5,
    marginBottom: 2,
  },
  banqueGridValue: {
    fontSize: 11,
    fontWeight: "600" as const,
    color: "#374151",
  },
  banqueFooter: {
    flexDirection: "row" as const,
    alignItems: "center" as const,
    gap: 5,
    backgroundColor: "#F9FAFB",
    borderTopWidth: 1,
    borderTopColor: "#F3F4F6",
    paddingHorizontal: 16,
    paddingVertical: 8,
  },
  banqueFooterText: {
    fontSize: 10,
    color: "#9CA3AF",
    flex: 1,
  },
});
