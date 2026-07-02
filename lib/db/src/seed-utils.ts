import { db } from "./index";
import { countriesTable, programsTable } from "./schema";

const COUNTRIES: Array<{
  code: string; name: string; currency: string; isEu: boolean; sortOrder: number;
  programs: Array<{ name: string; type: string; description: string; maxAmountEur: string; sortOrder: number }>;
}> = [
  {
    code: "FR", name: "France", currency: "EUR", isEu: true, sortOrder: 1,
    programs: [
      { name: "FEDER France 2021–2027", type: "feder", description: "Fonds européen de développement régional — cohésion économique et sociale", maxAmountEur: "1000000", sortOrder: 1 },
      { name: "FSE+ Emploi & Formation", type: "fse", description: "Fonds social européen+ — emploi, inclusion et formation professionnelle", maxAmountEur: "500000", sortOrder: 2 },
      { name: "BPI France", type: "national", description: "Banque publique d'investissement — innovation et développement des PME", maxAmountEur: "800000", sortOrder: 3 },
      { name: "Plan de Relance", type: "national", description: "France Relance — transition écologique, compétitivité, cohésion sociale", maxAmountEur: "300000", sortOrder: 4 },
      { name: "Banque des Territoires", type: "regional", description: "Investissements dans les territoires — logement, ville, énergie", maxAmountEur: "250000", sortOrder: 5 },
    ],
  },
  {
    code: "ES", name: "Espagne", currency: "EUR", isEu: true, sortOrder: 2,
    programs: [
      { name: "FEDER España 2021–2027", type: "feder", description: "Fondo Europeo de Desarrollo Regional — cohesión territorial", maxAmountEur: "1000000", sortOrder: 1 },
      { name: "FSE+ España", type: "fse", description: "Fondo Social Europeo+ — empleo e inclusión social", maxAmountEur: "500000", sortOrder: 2 },
      { name: "CDTI Innovation", type: "national", description: "Centro para el Desarrollo Tecnológico Industrial — I+D+i", maxAmountEur: "600000", sortOrder: 3 },
      { name: "ICO Emprendedores", type: "national", description: "Instituto de Crédito Oficial — emprendimiento y PYME", maxAmountEur: "200000", sortOrder: 4 },
      { name: "Plan de Recuperación", type: "national", description: "Plan de Recuperación, Transformación y Resiliencia", maxAmountEur: "400000", sortOrder: 5 },
    ],
  },
  {
    code: "IT", name: "Italie", currency: "EUR", isEu: true, sortOrder: 3,
    programs: [
      { name: "FEDER Italia 2021–2027", type: "feder", description: "Fondo Europeo di Sviluppo Regionale — sviluppo territoriale", maxAmountEur: "1000000", sortOrder: 1 },
      { name: "FSE+ Italia", type: "fse", description: "Fondo Sociale Europeo+ — occupazione e inclusione", maxAmountEur: "500000", sortOrder: 2 },
      { name: "Invitalia PMI", type: "national", description: "Agenzia nazionale per l'attrazione degli investimenti", maxAmountEur: "750000", sortOrder: 3 },
      { name: "SIMEST Export", type: "national", description: "Supporto all'internazionalizzazione delle imprese italiane", maxAmountEur: "300000", sortOrder: 4 },
      { name: "Piano Nazionale Ripresa", type: "national", description: "PNRR — transizione digitale e verde", maxAmountEur: "500000", sortOrder: 5 },
    ],
  },
  {
    code: "DE", name: "Allemagne", currency: "EUR", isEu: true, sortOrder: 4,
    programs: [
      { name: "EFRE Deutschland 2021–2027", type: "feder", description: "Europäischer Fonds für regionale Entwicklung", maxAmountEur: "1000000", sortOrder: 1 },
      { name: "ESF+ Deutschland", type: "fse", description: "Europäischer Sozialfonds+ — Beschäftigung und soziale Inklusion", maxAmountEur: "500000", sortOrder: 2 },
      { name: "KfW Förderbank", type: "national", description: "Kreditanstalt für Wiederaufbau — Investitionen und Innovationen", maxAmountEur: "1000000", sortOrder: 3 },
      { name: "BAFA Energieeffizienz", type: "national", description: "Bundesamt für Wirtschaft — Energieeffizienz und erneuerbare Energien", maxAmountEur: "200000", sortOrder: 4 },
      { name: "Gründungszuschuss", type: "national", description: "Förderung der Selbstständigkeit aus der Arbeitslosigkeit", maxAmountEur: "100000", sortOrder: 5 },
    ],
  },
  {
    code: "PT", name: "Portugal", currency: "EUR", isEu: true, sortOrder: 5,
    programs: [
      { name: "FEDER Portugal 2030", type: "feder", description: "Fundo Europeu de Desenvolvimento Regional — coesão territorial", maxAmountEur: "1000000", sortOrder: 1 },
      { name: "FSE+ Portugal", type: "fse", description: "Fundo Social Europeu+ — emprego e inclusão social", maxAmountEur: "500000", sortOrder: 2 },
      { name: "IAPMEI PME", type: "national", description: "Agência para a Competitividade e Inovação — PME", maxAmountEur: "400000", sortOrder: 3 },
      { name: "Portugal Ventures", type: "national", description: "Capital de risco público para startups e empresas inovadoras", maxAmountEur: "500000", sortOrder: 4 },
      { name: "PRR Récupération", type: "national", description: "Plano de Recuperação e Resiliência — transição digital e verde", maxAmountEur: "600000", sortOrder: 5 },
    ],
  },
  {
    code: "NL", name: "Pays-Bas", currency: "EUR", isEu: true, sortOrder: 6,
    programs: [
      { name: "EFRO Nederland 2021–2027", type: "feder", description: "Europees Fonds voor Regionale Ontwikkeling", maxAmountEur: "1000000", sortOrder: 1 },
      { name: "ESF+ Nederland", type: "fse", description: "Europees Sociaal Fonds+ — werkgelegenheid en inclusie", maxAmountEur: "500000", sortOrder: 2 },
      { name: "RVO Subsidies", type: "national", description: "Rijksdienst voor Ondernemend Nederland — innovatie en duurzaamheid", maxAmountEur: "350000", sortOrder: 3 },
      { name: "Topsectorenbeleid", type: "national", description: "Publiek-private samenwerking in topsectoren", maxAmountEur: "250000", sortOrder: 4 },
      { name: "Interreg NWE", type: "regional", description: "Interreg North-West Europe — transnationale samenwerking", maxAmountEur: "300000", sortOrder: 5 },
    ],
  },
  {
    code: "BE", name: "Belgique", currency: "EUR", isEu: true, sortOrder: 7,
    programs: [
      { name: "FEDER Wallonie 2021–2027", type: "feder", description: "Fonds européen de développement régional — Wallonie et Bruxelles", maxAmountEur: "1000000", sortOrder: 1 },
      { name: "FSE+ Belgique", type: "fse", description: "Fonds social européen+ — emploi et cohésion sociale", maxAmountEur: "500000", sortOrder: 2 },
      { name: "Sowalfin Garantie", type: "regional", description: "Société wallonne de financement et de garantie des PME", maxAmountEur: "300000", sortOrder: 3 },
      { name: "Innoviris Bruxelles", type: "regional", description: "Institut bruxellois pour la Recherche et l'Innovation", maxAmountEur: "400000", sortOrder: 4 },
      { name: "VLAIO Flandre", type: "regional", description: "Agentschap Innoveren & Ondernemen — Vlaamse steunmaatregelen", maxAmountEur: "350000", sortOrder: 5 },
    ],
  },
  {
    code: "PL", name: "Pologne", currency: "PLN", isEu: true, sortOrder: 8,
    programs: [
      { name: "FEDER Polska 2021–2027", type: "feder", description: "Europejski Fundusz Rozwoju Regionalnego — spójność terytorialna", maxAmountEur: "1000000", sortOrder: 1 },
      { name: "EFS+ Polska", type: "fse", description: "Europejski Fundusz Społeczny+ — zatrudnienie i włączenie społeczne", maxAmountEur: "500000", sortOrder: 2 },
      { name: "Polski Fundusz Rozwoju", type: "national", description: "PFR — tarcza finansowa dla MŚP i dużych przedsiębiorstw", maxAmountEur: "800000", sortOrder: 3 },
      { name: "BGK Infrastruktura", type: "national", description: "Bank Gospodarstwa Krajowego — infrastruktura i innowacje", maxAmountEur: "600000", sortOrder: 4 },
      { name: "KPO Récupération", type: "national", description: "Krajowy Plan Odbudowy — transformacja cyfrowa i zielona", maxAmountEur: "500000", sortOrder: 5 },
    ],
  },
  {
    code: "RO", name: "Roumanie", currency: "RON", isEu: true, sortOrder: 9,
    programs: [
      { name: "FEDR Romania 2021–2027", type: "feder", description: "Fondul European de Dezvoltare Regională — coeziune teritorială", maxAmountEur: "1000000", sortOrder: 1 },
      { name: "FSE+ Romania", type: "fse", description: "Fondul Social European+ — ocupare și incluziune socială", maxAmountEur: "500000", sortOrder: 2 },
      { name: "IMM Invest Romania", type: "national", description: "Program de garantare a creditelor pentru IMM-uri", maxAmountEur: "400000", sortOrder: 3 },
      { name: "Start-Up Nation", type: "national", description: "Program de sprijin pentru înființarea de IMM-uri", maxAmountEur: "200000", sortOrder: 4 },
      { name: "PNRR Récupération", type: "national", description: "Planul Național de Redresare și Reziliență", maxAmountEur: "600000", sortOrder: 5 },
    ],
  },
  {
    code: "GR", name: "Grèce", currency: "EUR", isEu: true, sortOrder: 10,
    programs: [
      { name: "FEDER Grèce 2021–2027", type: "feder", description: "Ευρωπαϊκό Ταμείο Περιφερειακής Ανάπτυξης — εδαφική συνοχή", maxAmountEur: "1000000", sortOrder: 1 },
      { name: "FSE+ Grèce", type: "fse", description: "Ευρωπαϊκό Κοινωνικό Ταμείο+ — απασχόληση και κοινωνική ένταξη", maxAmountEur: "500000", sortOrder: 2 },
      { name: "ESPA 2021–2027", type: "national", description: "Εταιρικό Σύμφωνο για το Πλαίσιο Ανάπτυξης — ΕΣΠΑ", maxAmountEur: "700000", sortOrder: 3 },
      { name: "TEPIX II Fonds", type: "national", description: "Ταμείο Επιχειρηματικότητας II — χρηματοδότηση ΜΜΕ", maxAmountEur: "300000", sortOrder: 4 },
      { name: "TAA Résilience", type: "national", description: "Ταμείο Ανάκαμψης και Ανθεκτικότητας", maxAmountEur: "500000", sortOrder: 5 },
    ],
  },
  {
    code: "HU", name: "Hongrie", currency: "HUF", isEu: true, sortOrder: 11,
    programs: [
      { name: "FEDER Hongrie 2021–2027", type: "feder", description: "Európai Regionális Fejlesztési Alap — területi kohézió", maxAmountEur: "1000000", sortOrder: 1 },
      { name: "FSE+ Hongrie", type: "fse", description: "Európai Szociális Alap+ — foglalkoztatás és szociális befogadás", maxAmountEur: "500000", sortOrder: 2 },
      { name: "Széchenyi Tőkealap", type: "national", description: "Széchenyi Tőkealap — kkv-k finanszírozása és fejlesztése", maxAmountEur: "400000", sortOrder: 3 },
      { name: "GINOP Compétitivité", type: "national", description: "Gazdaságfejlesztési és Innovációs Operatív Program", maxAmountEur: "600000", sortOrder: 4 },
      { name: "NHP Hajrá", type: "national", description: "Növekedési Hitelprogram — kkv-k beruházási finanszírozása", maxAmountEur: "300000", sortOrder: 5 },
    ],
  },
  {
    code: "SE", name: "Suède", currency: "SEK", isEu: true, sortOrder: 12,
    programs: [
      { name: "FEDER Sverige 2021–2027", type: "feder", description: "Europeiska regionala utvecklingsfonden — territorial sammanhållning", maxAmountEur: "1000000", sortOrder: 1 },
      { name: "ESF+ Sverige", type: "fse", description: "Europeiska socialfonden+ — sysselsättning och social inkludering", maxAmountEur: "500000", sortOrder: 2 },
      { name: "Tillväxtverket", type: "national", description: "Tillväxtverket — stöd till företag och regional tillväxt", maxAmountEur: "300000", sortOrder: 3 },
      { name: "Almi Entreprise", type: "national", description: "ALMI Företagspartner — lån och rådgivning till företag", maxAmountEur: "400000", sortOrder: 4 },
      { name: "Vinnova Innovation", type: "national", description: "Vinnova — finansiering av forskning och innovation", maxAmountEur: "500000", sortOrder: 5 },
    ],
  },
  {
    code: "DK", name: "Danemark", currency: "DKK", isEu: true, sortOrder: 13,
    programs: [
      { name: "FEDER Danmark 2021–2027", type: "feder", description: "Den Europæiske Fond for Regionaludvikling — territorial samhørighed", maxAmountEur: "1000000", sortOrder: 1 },
      { name: "ESF+ Danmark", type: "fse", description: "Den Europæiske Socialfond+ — beskæftigelse og social inklusion", maxAmountEur: "500000", sortOrder: 2 },
      { name: "Erhvervsstyrelsen", type: "national", description: "Erhvervsstyrelsen — støtte til vækst og innovation i virksomheder", maxAmountEur: "300000", sortOrder: 3 },
      { name: "EKF Export Kredit", type: "national", description: "Eksport Kredit Fonden — eksportfinansiering og garantier", maxAmountEur: "400000", sortOrder: 4 },
      { name: "GreenFund Énergie", type: "national", description: "Den Grønne Fond — vedvarende energi og energieffektivitet", maxAmountEur: "250000", sortOrder: 5 },
    ],
  },
  {
    code: "AT", name: "Autriche", currency: "EUR", isEu: true, sortOrder: 14,
    programs: [
      { name: "FEDER Österreich 2021–2027", type: "feder", description: "Europäischer Fonds für regionale Entwicklung — Österreich", maxAmountEur: "1000000", sortOrder: 1 },
      { name: "ESF+ Österreich", type: "fse", description: "Europäischer Sozialfonds+ — Beschäftigung und soziale Inklusion", maxAmountEur: "500000", sortOrder: 2 },
      { name: "AWS Gründerfonds", type: "national", description: "Austria Wirtschaftsservice — Finanzierung von Gründungen und KMU", maxAmountEur: "400000", sortOrder: 3 },
      { name: "FFG Innovation", type: "national", description: "Österreichische Forschungsförderungsgesellschaft — FTI-Förderungen", maxAmountEur: "600000", sortOrder: 4 },
      { name: "WKO Export", type: "national", description: "Wirtschaftskammer Österreich — Internationalisierungsförderung", maxAmountEur: "200000", sortOrder: 5 },
    ],
  },
  {
    code: "FI", name: "Finlande", currency: "EUR", isEu: true, sortOrder: 15,
    programs: [
      { name: "FEDER Suomi 2021–2027", type: "feder", description: "Euroopan aluekehitysrahasto — alueellinen yhteenkuuluvuus", maxAmountEur: "1000000", sortOrder: 1 },
      { name: "ESF+ Suomi", type: "fse", description: "Euroopan sosiaalirahasto+ — työllisyys ja sosiaalinen osallisuus", maxAmountEur: "500000", sortOrder: 2 },
      { name: "Business Finland", type: "national", description: "Business Finland — rahoitus tutkimukseen, kehitykseen ja innovaatioon", maxAmountEur: "600000", sortOrder: 3 },
      { name: "Finnvera Garanties", type: "national", description: "Finnvera — takaukset ja lainat pk-yrityksille", maxAmountEur: "400000", sortOrder: 4 },
      { name: "ELY-Centres", type: "regional", description: "ELY-Keskukset — alueelliset kehittämistuet yrityksille", maxAmountEur: "200000", sortOrder: 5 },
    ],
  },
  {
    code: "IE", name: "Irlande", currency: "EUR", isEu: true, sortOrder: 16,
    programs: [
      { name: "FEDER Ireland 2021–2027", type: "feder", description: "European Regional Development Fund — territorial cohesion", maxAmountEur: "1000000", sortOrder: 1 },
      { name: "ESF+ Ireland", type: "fse", description: "European Social Fund+ — employment and social inclusion", maxAmountEur: "500000", sortOrder: 2 },
      { name: "Enterprise Ireland", type: "national", description: "Enterprise Ireland — funding for Irish businesses and startups", maxAmountEur: "500000", sortOrder: 3 },
      { name: "SBCI Finance", type: "national", description: "Strategic Banking Corporation of Ireland — SME financing", maxAmountEur: "300000", sortOrder: 4 },
      { name: "LEO Local Enterprise", type: "regional", description: "Local Enterprise Offices — support for local businesses", maxAmountEur: "150000", sortOrder: 5 },
    ],
  },
  {
    code: "SK", name: "Slovaquie", currency: "EUR", isEu: true, sortOrder: 17,
    programs: [
      { name: "FEDER Slovensko 2021–2027", type: "feder", description: "Európsky fond regionálneho rozvoja — územná súdržnosť", maxAmountEur: "1000000", sortOrder: 1 },
      { name: "ESF+ Slovensko", type: "fse", description: "Európsky sociálny fond+ — zamestnanosť a sociálna inklúzia", maxAmountEur: "500000", sortOrder: 2 },
      { name: "SIEA Énergie", type: "national", description: "Slovenská inovačná a energetická agentúra — energia a inovácie", maxAmountEur: "300000", sortOrder: 3 },
      { name: "SARIO Investissement", type: "national", description: "Slovak Investment and Trade Development Agency", maxAmountEur: "400000", sortOrder: 4 },
      { name: "SBA PME", type: "national", description: "Slovak Business Agency — podpora malých a stredných podnikov", maxAmountEur: "200000", sortOrder: 5 },
    ],
  },
  {
    code: "HR", name: "Croatie", currency: "EUR", isEu: true, sortOrder: 18,
    programs: [
      { name: "FEDER Hrvatska 2021–2027", type: "feder", description: "Europski fond za regionalni razvoj — teritorijalna kohezija", maxAmountEur: "1000000", sortOrder: 1 },
      { name: "ESF+ Hrvatska", type: "fse", description: "Europski socijalni fond+ — zapošljavanje i socijalna uključenost", maxAmountEur: "500000", sortOrder: 2 },
      { name: "HAMAG-BICRO", type: "national", description: "Agencija za malo gospodarstvo, inovacije i investicije", maxAmountEur: "400000", sortOrder: 3 },
      { name: "HBOR Banque", type: "national", description: "Hrvatska banka za obnovu i razvitak — kreditiranje poduzetnika", maxAmountEur: "600000", sortOrder: 4 },
      { name: "HZZ Emploi", type: "national", description: "Hrvatski zavod za zapošljavanje — poticaji za zapošljavanje", maxAmountEur: "150000", sortOrder: 5 },
    ],
  },
  {
    code: "LT", name: "Lituanie", currency: "EUR", isEu: true, sortOrder: 19,
    programs: [
      { name: "FEDER Lietuva 2021–2027", type: "feder", description: "Europos regioninės plėtros fondas — teritorinė sanglauda", maxAmountEur: "1000000", sortOrder: 1 },
      { name: "ESF+ Lietuva", type: "fse", description: "Europos socialinis fondas+ — užimtumas ir socialinė įtrauktis", maxAmountEur: "500000", sortOrder: 2 },
      { name: "INVEGA Garanties", type: "national", description: "Investicijų ir verslo garantijos — garantijos ir paskolos SVV", maxAmountEur: "300000", sortOrder: 3 },
      { name: "MITA Innovation", type: "national", description: "Mokslo, inovacijų ir technologijų agentūra — inovacijų rėmimas", maxAmountEur: "400000", sortOrder: 4 },
      { name: "LDA Développement", type: "national", description: "Lietuvos verslo paramos agentūra — verslo plėtros parama", maxAmountEur: "200000", sortOrder: 5 },
    ],
  },
  {
    code: "BG", name: "Bulgarie", currency: "BGN", isEu: true, sortOrder: 20,
    programs: [
      { name: "FEDER България 2021–2027", type: "feder", description: "Европейски фонд за регионално развитие — териториална сближеност", maxAmountEur: "1000000", sortOrder: 1 },
      { name: "ESF+ България", type: "fse", description: "Европейски социален фонд+ — заетост и социално включване", maxAmountEur: "500000", sortOrder: 2 },
      { name: "ББР Banque Dev.", type: "national", description: "Българска банка за развитие — кредити за МСП", maxAmountEur: "400000", sortOrder: 3 },
      { name: "Fond des Fonds", type: "national", description: "Фонд на фондовете — финансови инструменти за МСП", maxAmountEur: "300000", sortOrder: 4 },
      { name: "NKIZ Export", type: "national", description: "Национална компания за износ — насърчаване на износа", maxAmountEur: "200000", sortOrder: 5 },
    ],
  },
  {
    code: "LV", name: "Lettonie", currency: "EUR", isEu: true, sortOrder: 21,
    programs: [
      { name: "FEDER Latvija 2021–2027", type: "feder", description: "Eiropas Reģionālās attīstības fonds — teritoriālā kohēzija", maxAmountEur: "1000000", sortOrder: 1 },
      { name: "ESF+ Latvija", type: "fse", description: "Eiropas Sociālais fonds+ — nodarbinātība un sociālā iekļaušana", maxAmountEur: "500000", sortOrder: 2 },
      { name: "ALTUM Garanties", type: "national", description: "ALTUM — valsts attīstības finanšu institūcija garantijām un aizdevumiem", maxAmountEur: "350000", sortOrder: 3 },
      { name: "LIAA Innovation", type: "national", description: "Latvijas Investīciju un attīstības aģentūra — inovāciju atbalsts", maxAmountEur: "300000", sortOrder: 4 },
      { name: "CFLA Investissement", type: "national", description: "Centrālā finanšu un līgumu aģentūra — ES fondu administrēšana", maxAmountEur: "400000", sortOrder: 5 },
    ],
  },
  {
    code: "SI", name: "Slovénie", currency: "EUR", isEu: true, sortOrder: 22,
    programs: [
      { name: "FEDER Slovenija 2021–2027", type: "feder", description: "Evropski sklad za regionalni razvoj — teritorialna kohezija", maxAmountEur: "1000000", sortOrder: 1 },
      { name: "ESF+ Slovenija", type: "fse", description: "Evropski socialni sklad+ — zaposlovanje in socialna vključenost", maxAmountEur: "500000", sortOrder: 2 },
      { name: "Spirit Slovenia", type: "national", description: "Spirit Slovenija — podpora podjetništvu, inovacijam in internacionalizaciji", maxAmountEur: "400000", sortOrder: 3 },
      { name: "SID Banka", type: "national", description: "Slovenska izvozna in razvojna banka — financiranje podjetij", maxAmountEur: "500000", sortOrder: 4 },
      { name: "SPIRIT Export", type: "national", description: "Spirit Slovenija Export — podpora pri internacionalizaciji", maxAmountEur: "200000", sortOrder: 5 },
    ],
  },
  {
    code: "LU", name: "Luxembourg", currency: "EUR", isEu: true, sortOrder: 23,
    programs: [
      { name: "FEDER Luxembourg 2021–2027", type: "feder", description: "Fonds européen de développement régional — Luxembourg", maxAmountEur: "1000000", sortOrder: 1 },
      { name: "FSE+ Luxembourg", type: "fse", description: "Fonds social européen+ — emploi et cohésion sociale", maxAmountEur: "500000", sortOrder: 2 },
      { name: "Luxinnovation", type: "national", description: "Agence nationale pour la promotion de l'innovation au Luxembourg", maxAmountEur: "600000", sortOrder: 3 },
      { name: "SNCI Finance", type: "national", description: "Société nationale de crédit et d'investissement — PME et start-ups", maxAmountEur: "400000", sortOrder: 4 },
      { name: "Fit 4 Innovation", type: "national", description: "Programme de transformation numérique des entreprises luxembourgeoises", maxAmountEur: "250000", sortOrder: 5 },
    ],
  },
  {
    code: "EE", name: "Estonie", currency: "EUR", isEu: true, sortOrder: 24,
    programs: [
      { name: "FEDER Eesti 2021–2027", type: "feder", description: "Euroopa Regionaalarengu Fond — territoriaalne ühtekuuluvus", maxAmountEur: "1000000", sortOrder: 1 },
      { name: "ESF+ Eesti", type: "fse", description: "Euroopa Sotsiaalfond+ — tööhõive ja sotsiaalne kaasatus", maxAmountEur: "500000", sortOrder: 2 },
      { name: "EAS Entreprise", type: "national", description: "Enterprise Estonia — ettevõtluse arendamine ja rahvusvahelistumine", maxAmountEur: "400000", sortOrder: 3 },
      { name: "KredEx Garanties", type: "national", description: "KredEx — laenu- ja kapitalimeetmed ettevõtetele", maxAmountEur: "300000", sortOrder: 4 },
      { name: "Startup Estonia", type: "national", description: "Startup Estonia — idufirmade ökosüsteemi arendamine", maxAmountEur: "200000", sortOrder: 5 },
    ],
  },
  {
    code: "CY", name: "Chypre", currency: "EUR", isEu: true, sortOrder: 25,
    programs: [
      { name: "FEDER Κύπρος 2021–2027", type: "feder", description: "Ευρωπαϊκό Ταμείο Περιφερειακής Ανάπτυξης — Κύπρος", maxAmountEur: "1000000", sortOrder: 1 },
      { name: "ESF+ Κύπρος", type: "fse", description: "Ευρωπαϊκό Κοινωνικό Ταμείο+ — απασχόληση και κοινωνική ένταξη", maxAmountEur: "500000", sortOrder: 2 },
      { name: "RIEF Innovation", type: "national", description: "Research and Innovation Foundation — χρηματοδότηση έρευνας", maxAmountEur: "300000", sortOrder: 3 },
      { name: "CIPA Investissement", type: "national", description: "Cyprus Investment Promotion Agency — ξένες επενδύσεις", maxAmountEur: "400000", sortOrder: 4 },
      { name: "Recovery Plan CY", type: "national", description: "Σχέδιο Ανάκαμψης και Ανθεκτικότητας Κύπρου", maxAmountEur: "350000", sortOrder: 5 },
    ],
  },
  {
    code: "MT", name: "Malte", currency: "EUR", isEu: true, sortOrder: 26,
    programs: [
      { name: "FEDER Malta 2021–2027", type: "feder", description: "European Regional Development Fund — territorial cohesion Malta", maxAmountEur: "1000000", sortOrder: 1 },
      { name: "ESF+ Malta", type: "fse", description: "European Social Fund+ — employment and social inclusion", maxAmountEur: "500000", sortOrder: 2 },
      { name: "Malta Enterprise", type: "national", description: "Malta Enterprise — support for business investment and growth", maxAmountEur: "400000", sortOrder: 3 },
      { name: "FinanceMalta", type: "national", description: "FinanceMalta — promotion of financial services sector", maxAmountEur: "300000", sortOrder: 4 },
      { name: "MFIN Développement", type: "national", description: "Ministry for Finance — economic development programmes", maxAmountEur: "250000", sortOrder: 5 },
    ],
  },
  {
    code: "CZ", name: "République tchèque", currency: "CZK", isEu: true, sortOrder: 27,
    programs: [
      { name: "FEDER Česko 2021–2027", type: "feder", description: "Evropský fond pro regionální rozvoj — územní soudržnost", maxAmountEur: "1000000", sortOrder: 1 },
      { name: "ESF+ Česko", type: "fse", description: "Evropský sociální fond+ — zaměstnanost a sociální začleňování", maxAmountEur: "500000", sortOrder: 2 },
      { name: "CzechInvest", type: "national", description: "CzechInvest — podpora podnikání a přilákání investic", maxAmountEur: "500000", sortOrder: 3 },
      { name: "ČMZRB Garantie", type: "national", description: "Českomoravská záruční a rozvojová banka — záruky a úvěry", maxAmountEur: "400000", sortOrder: 4 },
      { name: "MPO Innovation", type: "national", description: "Ministerstvo průmyslu a obchodu — inovace a podnikání", maxAmountEur: "300000", sortOrder: 5 },
    ],
  },
  {
    code: "NC", name: "Nouvelle-Calédonie", currency: "XPF", isEu: false, sortOrder: 28,
    programs: [
      { name: "FIDES", type: "national", description: "Fonds d'investissement pour le développement économique et social", maxAmountEur: "300000", sortOrder: 1 },
      { name: "ACE Entrepreneuriat", type: "regional", description: "Agence pour la Création d'Entreprise — accompagnement entrepreneurial", maxAmountEur: "100000", sortOrder: 2 },
      { name: "Subvention Agricole", type: "regional", description: "Aides agricoles de la Province Nord et Sud", maxAmountEur: "80000", sortOrder: 3 },
      { name: "DEFI Jeunes", type: "regional", description: "Dispositif d'encouragement aux initiatives de la jeunesse", maxAmountEur: "50000", sortOrder: 4 },
      { name: "Formation Pro", type: "regional", description: "Fonds de formation professionnelle — DTEFP Nouvelle-Calédonie", maxAmountEur: "60000", sortOrder: 5 },
    ],
  },
  {
    code: "MQ", name: "Martinique", currency: "EUR", isEu: false, sortOrder: 29,
    programs: [
      { name: "FEDER 2021–2027", type: "feder", description: "Fonds européen de développement régional — Martinique", maxAmountEur: "1000000", sortOrder: 1 },
      { name: "FSE+ Emploi & Formation", type: "fse", description: "Fonds social européen+ — emploi et formation professionnelle", maxAmountEur: "500000", sortOrder: 2 },
      { name: "LEADER Agriculture & Rural", type: "regional", description: "Programme LEADER — agriculture et développement rural", maxAmountEur: "200000", sortOrder: 3 },
      { name: "BPI France Outre-Mer", type: "national", description: "BPI France — financement spécifique Outre-Mer", maxAmountEur: "400000", sortOrder: 4 },
      { name: "Subvention CTM", type: "regional", description: "Collectivité Territoriale de Martinique — subventions sectorielles", maxAmountEur: "150000", sortOrder: 5 },
    ],
  },
  {
    code: "PF", name: "Polynésie française", currency: "XPF", isEu: false, sortOrder: 30,
    programs: [
      { name: "SEFI", type: "national", description: "Service de l'emploi, de la formation et de l'insertion professionnelle", maxAmountEur: "80000", sortOrder: 1 },
      { name: "FDA Archipels", type: "regional", description: "Fonds de développement des archipels — économie locale", maxAmountEur: "200000", sortOrder: 2 },
      { name: "Tourisme Durable", type: "regional", description: "Direction du Tourisme — aides au développement touristique durable", maxAmountEur: "150000", sortOrder: 3 },
      { name: "ALS Logement", type: "regional", description: "Aide au Logement Social — construction et rénovation", maxAmountEur: "100000", sortOrder: 4 },
      { name: "FSP Solidarité", type: "regional", description: "Fonds de solidarité pour les projets d'insertion sociale", maxAmountEur: "60000", sortOrder: 5 },
    ],
  },
  {
    code: "GP", name: "Guadeloupe", currency: "EUR", isEu: false, sortOrder: 31,
    programs: [
      { name: "FEDER Guadeloupe", type: "feder", description: "Fonds européen de développement régional — Guadeloupe", maxAmountEur: "1000000", sortOrder: 1 },
      { name: "FSE+", type: "fse", description: "Fonds social européen+ — emploi et formation", maxAmountEur: "500000", sortOrder: 2 },
      { name: "Plan de Relance", type: "national", description: "France Relance — investissements prioritaires Guadeloupe", maxAmountEur: "300000", sortOrder: 3 },
      { name: "Subvention Région", type: "regional", description: "Région Guadeloupe — aides aux entreprises et associations", maxAmountEur: "150000", sortOrder: 4 },
      { name: "ADIE Microfinancement", type: "regional", description: "Association pour le droit à l'initiative économique — microcrédit", maxAmountEur: "50000", sortOrder: 5 },
    ],
  },
  {
    code: "RE", name: "La Réunion", currency: "EUR", isEu: false, sortOrder: 32,
    programs: [
      { name: "FEDER Réunion", type: "feder", description: "Fonds européen de développement régional — La Réunion", maxAmountEur: "1000000", sortOrder: 1 },
      { name: "Aide Région Réunion", type: "regional", description: "Région Réunion — dispositifs d'aide au développement économique", maxAmountEur: "200000", sortOrder: 2 },
      { name: "FSE+", type: "fse", description: "Fonds social européen+ — emploi et insertion professionnelle", maxAmountEur: "500000", sortOrder: 3 },
      { name: "NACRE", type: "national", description: "Nouvel accompagnement pour la création et la reprise d'entreprise", maxAmountEur: "80000", sortOrder: 4 },
      { name: "DEETS Cohésion", type: "national", description: "Direction de l'économie, de l'emploi, du travail et des solidarités", maxAmountEur: "100000", sortOrder: 5 },
    ],
  },
];

export async function seedCountriesIfEmpty(): Promise<void> {
  const existing = await db.select().from(countriesTable).limit(1);
  if (existing.length > 0) return;

  console.log("🌍 Seeding countries and programs...");

  for (const country of COUNTRIES) {
    await db
      .insert(countriesTable)
      .values({
        code: country.code,
        name: country.name,
        currency: country.currency,
        isEu: country.isEu,
        isActive: true,
        sortOrder: country.sortOrder,
      })
      .onConflictDoNothing();

    for (const program of country.programs) {
      await db
        .insert(programsTable)
        .values({
          countryCode: country.code,
          name: program.name,
          type: program.type,
          description: program.description,
          maxAmountEur: program.maxAmountEur,
          isActive: true,
          sortOrder: program.sortOrder,
        })
        .onConflictDoNothing();
    }
  }

  console.log(`✅ Seeded ${COUNTRIES.length} countries and ${COUNTRIES.reduce((a, c) => a + c.programs.length, 0)} programs`);
}
