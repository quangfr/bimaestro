// =========================================================================
// Maestro BI - js/data-schemas.js
// Schémas relationnels Mermaid ERD statiques & Templates de prompts IA
// =========================================================================

    // --- Étape 2 : Code Mermaid des 3 schémas relationnels (à garder identique dans content.md) ---
    const SCHEMA_MERMAID = {
      A: `erDiagram
    MDT_MAINTENANCE_REQUEST ||--o{ MDT_INTERVENTION : "1 demande → N interventions (1:N)"
    MDT_MAINTENANCE_REQUEST }o--|| TIMEPROFILE : "N demandes → 1 période (N:1)"
    MDT_MAINTENANCE_REQUEST }o--|| CONTRACT_SLA : "N demandes → 1 contrat SLA (N:1)"

    MDT_MAINTENANCE_REQUEST ["Demande de Maintenance Moteur"] {
        string ID_DEMANDE PK "D-2026-000123"
        enum DEMANDEUR_NAME "*EZY | AFR | ACH | RYA"
        date DATE_DEMANDE "2026-03-01"
        enum PROGRAMME_MOTEUR "*LEAP | CFM56 | GE90"
        enum ENGINE_TYPE "*LEAP-1A26 | CFM56-7B | CFM56-5B | LEAP-1B | GE90-115B"
        enum NIVEAU_URGENCE_GLOBAL "*Haute (AOG) | Moyenne | Basse"
        string COMMENTAIRE_GLOBAL "Dépose suite FOD"
        int INTERVENTION_COUNT "3"
        float URGENCY_WEIGHT "3.0"
        float TOTAL_ENGINE_TAT "21.5 j"
    }
    TIMEPROFILE ["Profil Temporel"] {
        string ID_PERIOD PK "2026-W36"
        date START_DATE "2026-09-01"
        date END_DATE "2026-09-07"
        boolean IS_WORKING_DAY "*true | false"
    }
    CONTRACT_SLA ["Contrat SLA Client"] {
        string ID_CONTRAT PK "CTR-AFR-01"
        float SLA_CIBLE_JOURS "18.0 j"
        float PENALITE_JOUR_EUR "2500 EUR"
    }
    MDT_INTERVENTION ["Intervention d'Atelier"] {
        string ID_INTERVENTION PK "I-2026-000123-01"
        string ID_DEMANDE FK "D-2026-000123"
        enum TYPE_REPARATION "*T-AUBTUR | T-INSCND | T-MAJLOU | T-BANESS | T-EQUROT | T-COMHOT | T-REVCAR | T-FODREP"
        enum PRECISION_AUTRE "*Re-frettage spécifique | Usinage aubes HP | CND Ultra-sons | Traitement thermique | Équilibrage dynamique"
        enum SHOP_NAME "*S-MON | S-VIL | S-CHL | S-BRU | S-SQY | S-GEN | S-BDX | S-TLS | S-LGG | S-CRE"
        string DONNEES_TECHNIQUES "DOC-NDT-2026-442"
        float INTERVENTION_TAT "32.5 h"
    }`,
      B: `erDiagram
    MDT_MAINTENANCE_REQUEST ||--o{ MDT_INTERVENTION : "1 demande → N interventions (1:N)"
    SHOP ||--o{ STATION : "1 shop → 3 à 10 stations (1:N)"
    STATION ||--o{ MDT_INTERVENTION : "1 station → N interventions (1:N)"
    SHOP ||--o{ MDT_INTERVENTION : "1 shop → N interventions (1:N)"
    TIMEPROFILE ||--o{ MDT_INTERVENTION : "1 période → N interventions (1:N)"
    DUREE_STANDARDS ||--o{ MDT_INTERVENTION : "1 standard → N interventions (1:N)"

    MDT_INTERVENTION ["Intervention d'Atelier"] {
        enum ID_DEMANDE FK "*D-2026-000123 | D-2026-000124 | D-2026-000125"
        string ID_INTERVENTION PK "I-2026-000123-01"
        enum TYPE_REPARATION "*T-AUBTUR | T-INSCND | T-MAJLOU | T-BANESS | T-EQUROT | T-COMHOT | T-REVCAR | T-FODREP"
        enum PRECISION_AUTRE "*Re-frettage spécifique | Usinage aubes HP | CND Ultra-sons | Traitement thermique | Équilibrage dynamique"
        enum STATION_NAME FK "*S-MON-01 | S-MON-02 | S-MON-03 | S-VIL-01 | S-VIL-02 | S-CHL-01 | S-TLS-01"
        enum SHOP_NAME FK "*S-MON | S-VIL | S-CHL | S-BRU | S-SQY | S-GEN | S-BDX | S-TLS | S-LGG | S-CRE"
        string DONNEES_TECHNIQUES "DOC-NDT-2026-442"
        float ESTIMATED_REPAIR_DURATION "18.5 h"
        float SHOP_QUEUE_TIME "12.0 h"
        float INTERVENTION_TAT "32.5 h"
    }
    STATION ["Station de Réparation"] {
        enum STATION_NAME PK "*S-MON-01 | S-MON-02 | S-MON-03 | S-VIL-01 | S-VIL-02 | S-CHL-01 | S-TLS-01"
        enum SHOP_NAME FK "*S-MON | S-VIL | S-CHL | S-BRU | S-SQY | S-GEN | S-BDX | S-TLS | S-LGG | S-CRE"
        enum TYPE_REPARATION "*T-AUBTUR | T-INSCND | T-MAJLOU | T-BANESS | T-EQUROT | T-COMHOT | T-REVCAR | T-FODREP"
        float SEUIL_SATURATION "85.0 %"
    }
    SHOP ["Atelier (Shop)"] {
        enum SHOP_NAME PK "*S-MON | S-VIL | S-CHL | S-BRU | S-SQY | S-GEN | S-BDX | S-TLS | S-LGG | S-CRE"
        int NB_STATIONS "6"
        float CAPACITE_HEBDO "1450.0 h"
    }
    MDT_MAINTENANCE_REQUEST ["Demande de Maintenance Moteur"] {
        string ID_DEMANDE PK "D-2026-000123"
        enum DEMANDEUR_NAME "*EZY | AFR | ACH | RYA"
        enum ENGINE_TYPE "*LEAP-1A26 | CFM56-7B | CFM56-5B | LEAP-1B | GE90-115B"
        enum NIVEAU_URGENCE_GLOBAL "*Haute (AOG) | Moyenne | Basse"
    }
    DUREE_STANDARDS ["Durées Standards"] {
        enum ENGINE_TYPE PK "*LEAP-1A26 | CFM56-7B | CFM56-5B | LEAP-1B | GE90-115B"
        enum TYPE_REPARATION PK "*T-AUBTUR | T-INSCND | T-MAJLOU | T-BANESS | T-EQUROT | T-COMHOT | T-REVCAR | T-FODREP"
        float DUREE_STANDARD_H "18.5 h"
    }
    TIMEPROFILE ["Profil Temporel"] {
        string ID_PERIOD PK "2026-W36"
        date DATE_DEBUT "2026-09-01"
        date DATE_FIN "2026-09-07"
    }`
    };

    const CARD_CODE = {
      '2A': SCHEMA_MERMAID.A,
      '2B': SCHEMA_MERMAID.B,
      '4A': `gantt
    title TAT Médian (P50) et Intervalle de Dispersion (P5 - P95) par Moteur (Jours)
    dateFormat X
    axisFormat %s j

    section CFM56-7B
    Dispersion P5 - P95 (9.2j à 21j)     :a1, 9, 21
    Médian P50 (14.5j)                   :milestone, m1, 14, 0d

    section LEAP-1A
    Dispersion P5 - P95 (14j à 31.5j)    :crit, a2, 14, 31
    Médian P50 (21.4j)                   :milestone, m2, 21, 0d

    section LEAP-1B
    Dispersion P5 - P95 (11.8j à 27j)    :active, a3, 12, 27
    Médian P50 (18.2j)                   :milestone, m3, 18, 0d`,
      '4B': `%%{init: {'theme': 'base', 'themeVariables': { 'primaryColor': '#3b82f6'}}}%%
xychart-beta
    title "Décomposition du TAT Dossier (Jours) : Réparation vs Transit vs Attente"
    x-axis ["CFM56-7B", "CFM56-5B", "LEAP-1A", "LEAP-1B", "GE90-115B"]
    y-axis "Jours cumulés" 0 --> 30
    bar [10, 9, 13, 12, 16]
    bar [2, 2, 3, 3, 4]
    bar [3, 3, 5, 4, 6]`,
      '4C': `%%{init: {'theme': 'base'}}%%
xychart-beta
    title "Écart TAT Contractuel vs Effectif et Taux de Non-Respect SLA (%)"
    x-axis ["Air France (AFR)", "Lufthansa (DLH)", "Delta Air Lines (DAL)", "Ryanair (RYR)"]
    y-axis "TAT Moyen (Jours)" 0 --> 25
    bar [20, 18, 22, 16]
    bar [19, 17, 22, 19]
    line [5, 4, 6, 15]`,
      '4D': `graph TD
    A[Pointage Événement Moteur ESN] --> B{Statut de la Demande}
    B -- "TAT <= SLA" --> C[🟢 Conforme • Dossier sous contrôle]
    B -- "En cours sans retard" --> D[⏳ En Cours • Clôture dans les délais]
    B -- "TAT > SLA (+1 à +4j)" --> E[⚠️ En Retard • Surveillance chef d'atelier]
    B -- "Dérive critique / AOG" --> F[🚨 AOG Critique • Escalade immédiate & Pénalités]

    style C fill:#dcfce7,stroke:#16a34a,stroke-width:1.5px
    style D fill:#dbeafe,stroke:#1e40af,stroke-width:1.5px
    style E fill:#fef3c7,stroke:#d97706,stroke-width:1.5px
    style F fill:#fee2e2,stroke:#dc2626,stroke-width:2px`,
      '4E': `pie title "Synthèse KPIs MRO — Conformité SLA des Demandes"
    "Demandes conformes (SLA respecté)" : 96
    "Demandes en alerte / dérive" : 4`,
      '4F': `xychart-beta
    title "TAT Demande Moteur (jours) vs Seuil Critique P85"
    x-axis ["CFM56-7B", "CFM56-5B", "LEAP-1A", "LEAP-1B", "GE90-115B"]
    y-axis "TAT (jours)" 0 --> 40
    bar [18, 16, 26, 22, 29]
    line [24, 24, 24, 24, 24]`,
      '4G': `flowchart LR
    A[18 j Cible SLA] -->|+3 j Attente Pièces| B[21 j]
    B -->|+2 j Aléa CND| C[23 j]
    C -->|-1 j Fast-Track| D[22 j]
    D -->|Réel constaté| E(22 j Réel)
    style E fill:#1e40af,color:#fff,stroke:#1e40af,stroke-width:2px`,
      '4H': `%%{init: {'theme': 'base'}}%%
xychart-beta
    title "Heatmap d'Occupation Réseau par Site (10 centres SAE MRO) : Charge Moyenne S34..S42 (%)"
    x-axis ["S-MON", "S-VIL", "S-CHL", "S-BRU", "S-TLS", "S-SQY", "S-GEN", "S-BDX", "S-LGG", "S-CRE"]
    y-axis "% Taux d'Occupation Réseau" 0 --> 110
    bar [98, 96, 88, 86, 82, 79, 76, 74, 71, 68]
    line [80, 80, 80, 80, 80, 80, 80, 80, 80, 80]`,
      '4I': `%%{init: {'theme': 'base'}}%%
xychart-beta
    title "Benchmark TAT Demande : 4 Méthodes vs Effectif Référence (18.2 j)"
    x-axis ["D-SOP", "D-STA", "D-CAP", "D-ML"]
    y-axis "TAT (Jours)" 0 --> 30
    bar [15.4, 17.8, 22.4, 18.6]
    line [18.2, 18.2, 18.2, 18.2]`,
      '6A': `%%{init: {'theme': 'base', 'themeVariables': { 'primaryColor': '#ef4444'}}}%%
xychart-beta
    title "Taux de Retard des Interventions par Shop (%) vs Seuil Tolérance (10%)"
    x-axis ["S-MON", "S-VIL", "S-CHL", "S-BRU", "S-TLS", "S-SQY", "S-GEN", "S-BDX", "S-LGG", "S-CRE"]
    y-axis "% Interventions en Retard" 0 --> 25
    bar [18.2, 15.4, 12.1, 16.5, 9.2, 7.6, 11.4, 6.8, 9.6, 5.8]
    line [10, 10, 10, 10, 10, 10, 10, 10, 10, 10]`,
      '6B': `%%{init: {'theme': 'base'}}%%
xychart-beta
    title "Part des Interventions Subissant un Aléa Imprévu (% Retard) : CFM56 vs LEAP"
    x-axis ["T-REVCAR", "T-INSCND", "T-AUBTUR", "T-BANESS"]
    y-axis "% Interventions Décalées" 0 --> 35
    bar [18, 14, 12, 8]
    bar [29, 24, 26, 17]`,
      '6C': `%%{init: {'theme': 'base'}}%%
xychart-beta
    title "Flux Inter-Shops (% Interventions) et Délai Navette Route (Jours)"
    x-axis ["S-MON ➔ S-VIL", "S-CHL ➔ S-BRU", "S-VIL ➔ S-SQY", "S-GEN ➔ S-MON"]
    y-axis "% Part du Flux Global" 0 --> 45
    bar [38, 27, 19, 16]
    line [12, 24, 18, 31]`,
      '6D': `%%{init: {'theme': 'base'}}%%
xychart-beta
    title "Délai Moyen d'Intervention par Shop (h) : Attente vs Réparation vs Transfert"
    x-axis ["S-MON", "S-VIL", "S-CHL", "S-BRU", "S-TLS", "S-SQY", "S-GEN", "S-BDX"]
    y-axis "Heures Moyennes Cumulées" 0 --> 35
    bar [7.5, 6.8, 5.2, 6.1, 4.3, 3.4, 4.1, 2.9]
    bar [18.2, 21.5, 16.4, 17.0, 15.2, 12.8, 14.0, 11.5]
    bar [3.8, 3.2, 2.8, 3.5, 2.6, 2.1, 2.3, 1.9]`,
      '6E': `xychart-beta
    title "Taux de Charge par Station de Réparation (S-XXX-YY) vs Seuil Critique 85%"
    x-axis ["S-MON-01", "S-VIL-01", "S-BRU-01", "S-MON-02", "S-VIL-02", "S-GEN-01", "S-CHL-01", "S-TLS-01"]
    y-axis "% Charge Station" 0 --> 100
    bar [94, 92, 89, 88, 86, 82, 81, 78]
    line [85, 85, 85, 85, 85, 85, 85, 85]`,
      '6F': `%%{init: {'theme': 'base'}}%%
xychart-beta
    title "Heatmap d'Occupation des Stations (Shop S-MON) : Charge Moyenne S34..S42 (%)"
    x-axis ["S-MON-01 (Aubes)", "S-MON-02 (Comb.)", "S-MON-03 (CND)", "S-MON-04 (Usin.)", "S-MON-05 (Équil.)", "S-MON-06 (FOD)"]
    y-axis "% Charge Hebdomadaire Moyenne" 0 --> 100
    bar [92, 86, 84, 81, 77, 69]
    line [85, 85, 85, 85, 85, 85]`,
      '6G': `xychart-beta
    title "CFD Interventions — Entrées (Inductions) vs Sorties (Clôtures)"
    x-axis "Jours" 1 --> 30
    y-axis "Interventions cumulées" 0 --> 40
    line [3, 8, 14, 21, 28, 34, 40]
    line [1, 4, 7, 11, 16, 22, 29]`,
      '6H': `%%{init: {'theme': 'base'}}%%
xychart-beta
    title "Treemap Shop S-MON : Temps Passé (h) & Taux de Retard Trichromatique (<8% Vert, 8-15% Jaune, >15% Rouge)"
    x-axis ["CFM56-7B", "LEAP-1A", "CFM56-5B", "LEAP-1B", "GE90-115B"]
    y-axis "Temps Passé (Heures)" 0 --> 500
    bar [480, 390, 290, 240, 160]
    line [16.5, 18.2, 11.4, 7.2, 5.8]`,
      '6I': `%%{init: {'theme': 'base'}}%%
xychart-beta
    title "Benchmark Capacité Interventions Shop : 4 Méthodes vs Débit Réel (124 interventions)"
    x-axis ["C-SOP", "C-STA", "C-LOG", "C-ML"]
    y-axis "Capacité Mensuelle (Interventions)" 0 --> 160
    bar [142, 115, 108, 126]
    line [124, 124, 124, 124]`
    };

    function copyTextToClipboard(text) {
      if (navigator.clipboard && navigator.clipboard.writeText) {
        return navigator.clipboard.writeText(text);
      }
      return new Promise((resolve, reject) => {
        const ta = document.createElement('textarea');
        ta.value = text;
        ta.setAttribute('readonly', '');
        ta.style.position = 'fixed';
        ta.style.opacity = '0';
        document.body.appendChild(ta);
        ta.select();
        try { document.execCommand('copy'); resolve(); } catch (e) { reject(e); }
        document.body.removeChild(ta);
      });
    }

    function showToast(message, duration) {
      let toaster = document.getElementById('toaster');
      if (!toaster) {
        toaster = document.createElement('div');
        toaster.id = 'toaster';
        toaster.className = 'fixed z-50 bottom-3 left-1/2 -translate-x-1/2 flex flex-col items-center gap-1.5 pointer-events-none';
        document.body.appendChild(toaster);
      }
      const el = document.createElement('div');
      el.className = 'bg-slate-900 text-white text-[11px] font-semibold px-3 py-1.5 rounded-full shadow-lg opacity-0 translate-y-1 transition-all duration-300 pointer-events-none';
      el.innerHTML = message;
      toaster.appendChild(el);
      requestAnimationFrame(() => {
        el.classList.remove('opacity-0');
        el.classList.remove('translate-y-1');
      });
      setTimeout(() => {
        el.classList.add('opacity-0');
        el.classList.add('translate-y-1');
        setTimeout(() => el.remove(), 300);
      }, duration || 2200);
    }

    function updateToggleButtons(toggleId, view) {
      const toggle = document.getElementById(toggleId);
      if (!toggle) return;
      toggle.querySelectorAll('button').forEach((b) => {
        const active = b.dataset.view === view;
        b.className = 'px-2 py-0.5 text-[9.5px] font-bold transition ' +
          (active ? 'bg-blue-800 text-white' : 'bg-white text-slate-600 hover:bg-slate-50');
      });
    }

    // ===== Contrôleur de Zoom & Pan pour Diagrammes UML =====
    const umlPanZoomState = {};

    function getOrCreatePanZoom(containerId) {
      if (!umlPanZoomState[containerId]) {
        umlPanZoomState[containerId] = {
          scale: 1.0,
          translateX: 0,
          translateY: 0,
          isDragging: false,
          startX: 0,
          startY: 0
        };
      }
      return umlPanZoomState[containerId];
    }

    function applyUmlTransform(containerId) {
      const container = document.getElementById(containerId);
      if (!container) return;
      const svg = container.querySelector('svg');
      if (!svg) return;
      const state = getOrCreatePanZoom(containerId);
      svg.style.transformOrigin = 'center center';
      svg.style.transform = `translate(${state.translateX}px, ${state.translateY}px) scale(${state.scale})`;
      svg.style.transition = state.isDragging ? 'none' : 'transform 0.15s ease-out';
    }

    function zoomUmlDiagram(containerId, factor) {
      const state = getOrCreatePanZoom(containerId);
      const newScale = Math.max(0.3, Math.min(3.5, state.scale * factor));
      state.scale = Math.round(newScale * 100) / 100;
      applyUmlTransform(containerId);
    }

    function resetUmlZoom(containerId) {
      const state = getOrCreatePanZoom(containerId);
      state.scale = 1.0;
      state.translateX = 0;
      state.translateY = 0;
      applyUmlTransform(containerId);
    }

    function initUmlPanZoom(containerId) {
      const container = document.getElementById(containerId);
      if (!container || container._panZoomInit) return;
      container._panZoomInit = true;

      // Zoom au scroll dans la zone
      container.addEventListener('wheel', (e) => {
        e.preventDefault();
        const factor = e.deltaY < 0 ? 1.12 : 0.89;
        zoomUmlDiagram(containerId, factor);
      }, { passive: false });

      // Pan au drag (clic et glisser)
      container.addEventListener('mousedown', (e) => {
        if (e.button !== 0) return;
        const state = getOrCreatePanZoom(containerId);
        state.isDragging = true;
        state.startX = e.clientX - state.translateX;
        state.startY = e.clientY - state.translateY;
        container.style.cursor = 'grabbing';
      });

      window.addEventListener('mousemove', (e) => {
        const state = getOrCreatePanZoom(containerId);
        if (!state.isDragging) return;
        state.translateX = e.clientX - state.startX;
        state.translateY = e.clientY - state.startY;
        applyUmlTransform(containerId);
      });

      window.addEventListener('mouseup', () => {
        const state = getOrCreatePanZoom(containerId);
        if (state.isDragging) {
          state.isDragging = false;
          if (container) container.style.cursor = 'grab';
        }
      });
    }

    function switchCardView(step, opt, view, ev) {
      if (ev) ev.stopPropagation();
      const img = document.getElementById('opt-' + step + '-' + opt + '-img');
      const code = document.getElementById('opt-' + step + '-' + opt + '-code');
      if (!img || !code) return;
      const toImg = view === 'img';
      img.classList.toggle('hidden', !toImg);
      code.classList.toggle('hidden', toImg);
      updateToggleButtons('opt-' + step + '-' + opt + '-toggle', view);
      if (view === 'code') {
        const text = (CARD_CODE[step + opt] || '').trim();
        if (text) {
          const pre = code.querySelector('pre');
          if (pre) pre.textContent = text;
        }
        copyTextToClipboard(text).then(
          () => showToast('📋 Code <b>' + step + '.' + opt + '</b> copié dans le presse-papier'),
          () => showToast('❌ Copie dans le presse-papier impossible')
        );
      }
    }

    function initCardCodeViews() {
      Object.keys(CARD_CODE).forEach((key) => {
        const code = document.getElementById('opt-' + key[0] + '-' + key[1] + '-code');
        if (code) {
          const pre = code.querySelector('pre');
          if (pre) pre.textContent = CARD_CODE[key];
        }
      });
    }


    // ===== Modèles UML Ciblés (Étapes 3 et 5) : Tables & Champs impliqués dans le calcul =====
    const STEP_UML_SCHEMAS = {
      3: {
        'A': `erDiagram
    MDT_MAINTENANCE_REQUEST ||--o{ MDT_INTERVENTION : "1 demande -> N interventions (1:N)"
    CONTRACT_SLA ||--o{ MDT_MAINTENANCE_REQUEST : "1 contrat -> N demandes (1:N)"
    TIMEPROFILE ||--o{ MDT_INTERVENTION : "1 période -> N interventions (1:N)"
    MDT_MAINTENANCE_REQUEST {
        string ID_DEMANDE PK "D-2026-000123"
        enum DEMANDEUR_NAME "*EZY | AFR | ACH | RYA"
        date DATE_DEMANDE "2026-03-01"
        enum PROGRAMME_MOTEUR "*LEAP | CFM56 | GE90"
        float TOTAL_ENGINE_TAT "21.5 j"
    }
    CONTRACT_SLA {
        string ID_CONTRAT PK "CTR-AFR-01"
        float SLA_CIBLE_JOURS "18.0 j"
        float PENALITE_JOUR_EUR "2500 EUR"
    }
    TIMEPROFILE {
        string ID_PERIOD PK "2026-W10"
        boolean IS_WORKING_DAY "*true | false"
    }
    MDT_INTERVENTION {
        string ID_INTERVENTION PK "I-2026-000123-01"
        string ID_DEMANDE FK "D-2026-000123"
        enum TYPE_REPARATION "*T-AUBTUR | T-INSCND | T-MAJLOU"
        float ESTIMATED_REPAIR_DURATION "18.5 h"
        float SHOP_QUEUE_TIME "12.0 h"
        float INTERVENTION_TAT "30.5 h"
    }`,
        'B': `erDiagram
    MDT_MAINTENANCE_REQUEST ||--o{ MDT_INTERVENTION : "1 demande -> N interventions (1:N)"
    DUREE_STANDARDS ||--o{ MDT_INTERVENTION : "1 standard -> N interventions (1:N)"
    ENGINE_FLEET ||--o{ MDT_MAINTENANCE_REQUEST : "1 type flotte -> N demandes (1:N)"
    MDT_MAINTENANCE_REQUEST {
        string ID_DEMANDE PK "D-2026-000123"
        enum ENGINE_TYPE FK "*LEAP-1A26 | CFM56-7B | CFM56-5B | LEAP-1B | GE90-115B"
        float TOTAL_ENGINE_TAT "21.5 j"
    }
    ENGINE_FLEET {
        enum ENGINE_TYPE PK "*LEAP-1A26 | CFM56-7B | CFM56-5B | LEAP-1B | GE90-115B"
        float FACTEUR_DISPERSION "1.35"
    }
    DUREE_STANDARDS {
        enum ENGINE_TYPE PK "*LEAP-1A26 | CFM56-7B | CFM56-5B"
        enum TYPE_REPARATION PK "*T-AUBTUR | T-INSCND | T-MAJLOU"
        float DUREE_STANDARD_H "18.5 h"
    }
    MDT_INTERVENTION {
        string ID_INTERVENTION PK "I-2026-000123-01"
        string ID_DEMANDE FK "D-2026-000123"
        enum TYPE_REPARATION "*T-AUBTUR | T-INSCND | T-MAJLOU"
        float P05_OPT "14.0 h"
        float P50_MEDIAN "18.5 h"
        float INTERVENTION_TAT "30.5 h"
    }`,
        'C': `erDiagram
    MDT_MAINTENANCE_REQUEST ||--o{ MDT_INTERVENTION : "1 demande -> N interventions (1:N)"
    STATION ||--o{ MDT_INTERVENTION : "1 station -> N interventions (1:N)"
    SHOP ||--o{ STATION : "1 shop -> N stations (1:N)"
    SHOP {
        enum SHOP_NAME PK "*S-MON | S-VIL | S-CHL | S-BRU"
        int NB_STATIONS "6"
        float CAPACITE_HEBDO "1450.0 h"
    }
    STATION {
        enum STATION_NAME PK "*S-MON-01 | S-MON-02"
        enum SHOP_NAME FK "*S-MON | S-VIL | S-CHL | S-BRU"
        float SEUIL_SATURATION "85.0 %"
    }
    MDT_MAINTENANCE_REQUEST {
        string ID_DEMANDE PK "D-2026-000123"
        enum NIVEAU_URGENCE_GLOBAL "*Haute (AOG) | Moyenne | Basse"
    }
    MDT_INTERVENTION {
        string ID_INTERVENTION PK "I-2026-000123-01"
        string ID_DEMANDE FK "D-2026-000123"
        enum STATION_NAME FK "*S-MON-01 | S-MON-02"
        float ESTIMATED_REPAIR_DURATION "18.5 h"
        float INTERVENTION_TAT "30.5 h"
    }`,
        'D': `erDiagram
    MDT_MAINTENANCE_REQUEST ||--o{ MDT_INTERVENTION : "1 demande -> N interventions (1:N)"
    COMPOSANT_CRITIQUE ||--o{ MDT_INTERVENTION : "1 pièce -> N interventions (1:N)"
    CONTROLE_CND ||--o{ MDT_INTERVENTION : "1 protocole -> N interventions (1:N)"
    COMPOSANT_CRITIQUE {
        enum REF_PIECE PK "*AUB-HP-01 | DISQ-BP-02 | CRTT-03"
        float USURE_PREDICTIVE_PCT "76.5 %"
    }
    CONTROLE_CND {
        enum TYPE_CND PK "*US-01 | RX-02 | MAG-03"
        float TAUX_ALEA_CND "4.2 %"
    }
    MDT_MAINTENANCE_REQUEST {
        string ID_DEMANDE PK "D-2026-000123"
        string COMMENTAIRE_GLOBAL "Dépose suite FOD"
    }
    MDT_INTERVENTION {
        string ID_INTERVENTION PK "I-2026-000123-01"
        string ID_DEMANDE FK "D-2026-000123"
        enum TYPE_REPARATION "*T-AUBTUR | T-INSCND | T-MAJLOU"
        enum PRECISION_AUTRE "*CND Ultra-sons | Re-frettage spécifique | Usinage aubes HP"
        float ALEA_TECH "1.5 h"
        float INTERVENTION_TAT "32.0 h"
    }`
      },
      5: {
        'A': `erDiagram
    SHOP ||--o{ MDT_INTERVENTION : "1 shop -> N interventions (1:N)"
    CALENDRIER_OUVERTURE ||--o{ SHOP : "1 calendrier -> N shops (1:N)"
    BAIE_MAINTENANCE ||--o{ SHOP : "1 atelier -> N baies (1:N)"
    CALENDRIER_OUVERTURE {
        string ID_SAISON PK "2026-S1"
        int HEURES_OUVRABLES_MOIS "360 h"
    }
    BAIE_MAINTENANCE {
        string ID_BAIE PK "B-MON-01"
        int CAPACITE_NOMINALE_H "160 h"
    }
    SHOP {
        enum SHOP_NAME PK "*S-MON | S-VIL | S-BRU"
        int NB_STATIONS "6"
        float CAPACITE_HEBDO "1450.0 h"
    }
    MDT_INTERVENTION {
        string ID_INTERVENTION PK "I-2026-000123-01"
        enum SHOP_NAME FK "*S-MON | S-VIL | S-BRU"
        enum TYPE_REPARATION "*T-AUBTUR | T-MAJLOU | T-BANESS"
        int INTERVENTIONS_PLANIFIEES "68"
        int CAPACITE_ALLOUEE "72"
        float TENSION_PREVISIONNELLE "94.4 %"
    }`,
        'B': `erDiagram
    STATION ||--o{ MDT_INTERVENTION : "1 station -> N interventions (1:N)"
    SHOP ||--o{ STATION : "1 shop -> N stations (1:N)"
    FLUX_ENCOURS ||--o{ STATION : "1 flux -> N stations (1:N)"
    FLUX_ENCOURS {
        string ID_FLUX PK "FLX-WIP-MON"
        float CADENCE_SORTIE_J "2.4 u/j"
    }
    SHOP {
        enum SHOP_NAME PK "*S-MON | S-VIL | S-BRU"
        int NB_STATIONS "6"
    }
    STATION {
        enum STATION_NAME PK "*S-MON-01 | S-MON-02 | S-MON-03"
        enum SHOP_NAME FK "*S-MON | S-VIL | S-BRU"
        int POSTES_STATION_TAMPON "4"
    }
    MDT_INTERVENTION {
        string ID_INTERVENTION PK "I-2026-000123-01"
        enum SHOP_NAME FK "*S-MON | S-VIL | S-BRU"
        enum TYPE_REPARATION "*T-AUBTUR | T-EQUROT"
        int INTERVENTIONS_WIP "22"
        float TAUX_OCCUPATION "91.7 %"
    }`,
        'C': `erDiagram
    SHOP ||--o{ MDT_INTERVENTION : "1 shop -> N interventions (1:N)"
    STOCK_PIECES ||--o{ MDT_INTERVENTION : "1 référence -> N interventions (1:N)"
    FOURNISSEUR_LOGISTIQUE ||--o{ STOCK_PIECES : "1 fournisseur -> N stocks (1:N)"
    FOURNISSEUR_LOGISTIQUE {
        string ID_FOURNISSEUR PK "FRN-SAFRAN-01"
        float TAUX_SERVICE_OTIF "92.4 %"
    }
    STOCK_PIECES {
        string ID_KIT_REPARATION PK "KIT-LLP-LEAP"
        int PIECES_DISPONIBLES "14"
        int SEUIL_ALERTE_RUPTURE "5"
    }
    SHOP {
        enum SHOP_NAME PK "*S-MON | S-VIL | S-BRU"
        int NB_STATIONS "6"
    }
    MDT_INTERVENTION {
        string ID_INTERVENTION PK "I-2026-000123-01"
        enum SHOP_NAME FK "*S-MON | S-VIL | S-BRU"
        enum TYPE_REPARATION "*T-AUBTUR | T-EQUROT"
        int INTERVENTIONS_ATTENTE_PIECES "8"
        float DELAI_APPRO_MOYEN "12.0 j"
        float TAUX_BLOCAGE_ATELIER "36.4 %"
    }`,
        'D': `erDiagram
    SHOP ||--o{ MDT_INTERVENTION : "1 shop -> N interventions (1:N)"
    EQUIPEMENT_CRITIQUE ||--o{ SHOP : "1 équipement -> N shops (1:N)"
    REBUT_STATISTIQUE ||--o{ MDT_INTERVENTION : "1 modèle rebut -> N interventions (1:N)"
    EQUIPEMENT_CRITIQUE {
        string ID_BANC_TEST PK "BANC-TEST-MON-01"
        float DISPONIBILITE_MACHINE "98.5 %"
    }
    REBUT_STATISTIQUE {
        enum TYPE_REPARATION PK "*T-AUBTUR | T-COMHOT"
        float TAUX_REBUT_MOYEN "3.1 %"
    }
    SHOP {
        enum SHOP_NAME PK "*S-MON | S-VIL | S-BRU"
        int NB_STATIONS "6"
    }
    MDT_INTERVENTION {
        string ID_INTERVENTION PK "I-2026-000123-01"
        enum SHOP_NAME FK "*S-MON | S-VIL | S-BRU"
        enum TYPE_REPARATION "*T-AUBTUR | T-COMHOT"
        float VOLUME_PREDIT_MRO "28.4"
        float ALEAS_CONTROLE_CND "3.8"
        float SATURATION_PROBABILISTE "98.2 %"
    }`
      }
    };

    function getCustomMeasures(step) {
      try {
        const raw = localStorage.getItem(`maestro_step_custom_measures_${step}`);
        if (raw) {
          const arr = JSON.parse(raw);
          if (Array.isArray(arr)) return arr;
        }
      } catch (e) {}
      return [];
    }

    function saveCustomMeasures(step, list) {
      try {
        localStorage.setItem(`maestro_step_custom_measures_${step}`, JSON.stringify(list));
      } catch (e) {}
    }


    const PROMPT_TEMPLATE_STORAGE_KEY = 'maestro_prompt_template';
    const DEFAULT_PROMPT_TEMPLATE = `Générer un graphique en HTML à la SAP-IBP / SAC incluant dedans les instructions pour le faire pas à pas
- Titre : {title}

- Contexte : 
{desc}

- Type  : {chartType}
- Modèle & Grain : {model} — {grain}
- Axe X : {axisX}
- Axe Y : {axisY}

- Dimensions :
{dimensions}
- Mesures :
{measures}

- Filtres : 
{filters}
- Règles : 
{businessRules}`;

    const TABLE_PROMPT_TEMPLATE_STORAGE_KEY = 'maestro_table_prompt_template';
    const DEFAULT_TABLE_PROMPT_TEMPLATE = `Proposer une visualisation pertinente basée sur les ENTRÉES dans un code bloc au format contenu sans le { } de l'objet js de ChartJS avec un minimum de données d'exemples.

ENTRÉES
{optBody}

Modèles Relationnels ERD :
--- Modèle (Consolidation Demande) ---
{uml2A}

--- Modèle (Lignes d'Intervention) ---
{uml2B}`;

    const VISUELS_PROMPT_TEMPLATE_STORAGE_KEY = 'maestro_visuels_prompt_template';
    const DEFAULT_VISUELS_PROMPT_TEMPLATE = `Générer 3 idées de visuels compatibles avec SAP-IBP / SAC, chacune est dans un bloc de code qui suit la structure exacte suivante SORTIE sur la base des ENTRÉES : 

SORTIE

- Titre : 
- Contexte : 
- Type  : (type de graphique)
- Axe X : (éventuellement X1, X2 selon les graphiques)
- Axe Y : (idem)

- Dimensions :
  * NOM_DIMENSION (Description ou liste de valeurs séparé d'une virgule) 

- Mesures :
  * NOM_MESURE (Description et exemples)

- Filtres : (suggestions de dimensions en filtre sur le graphique)
- Règles : (instructions sur la génération automatique des données, nombre d'éléments, moyenne, distribution et intervalle pour les valeurs)

ENTRÉES
{stepEntries}`;

    function getTablePromptTemplate() {
      try {
        const custom = localStorage.getItem(TABLE_PROMPT_TEMPLATE_STORAGE_KEY);
        if (custom && custom.trim().length > 0) return custom;
      } catch (e) {}
      return DEFAULT_TABLE_PROMPT_TEMPLATE;
    }

    function saveTablePromptTemplate(templateStr) {
      try {
        localStorage.setItem(TABLE_PROMPT_TEMPLATE_STORAGE_KEY, templateStr);
      } catch (e) {}
    }

    function getVisuelsPromptTemplate() {
      try {
        const custom = localStorage.getItem(VISUELS_PROMPT_TEMPLATE_STORAGE_KEY);
        if (custom && custom.trim().length > 0) return custom;
      } catch (e) {}
      return DEFAULT_VISUELS_PROMPT_TEMPLATE;
    }

    function saveVisuelsPromptTemplate(templateStr) {
      try {
        localStorage.setItem(VISUELS_PROMPT_TEMPLATE_STORAGE_KEY, templateStr);
      } catch (e) {}
    }
