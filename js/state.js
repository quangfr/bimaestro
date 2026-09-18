// =========================================================================
// Maestro BI - js/state.js
// État global, Navigation, Sélections & Splitters
// =========================================================================


    let currentStep = 0;
    const TOTAL_STEPS = 7;
    const selections = { 1: 'A', 2: 'A', 3: 'B', 4: 'B', 5: 'B', 6: 'A' };

    const metaInfo = {
      1: {
        'A': { title: "SLA & Removal Plan (CSPM)", desc: "Respect des SLA, dates Shop Visit & removal plan PERF", icon: "", persona: "CSPM" },
        'B': { title: "Équilibrage Réseau & Slots (NTPL)", desc: "Charge/capacité multi-ateliers, MPS vs S&OP & slotting", icon: "", persona: "NTPL" },
        'C': { title: "Volumes & Coûts SV (FINC)", desc: "Pénalités de retard (€), mix moteurs/modules & IBP to Cost Tracker", icon: "", persona: "FINC" },
        'D': { title: "Ordonnancement Atelier (SHPL)", desc: "Aléas quotidiens (pannes, retards), flux MM/SM & MPS Adherence", icon: "", persona: "SHPL" },
        'E': { title: "Demande & Workscopes (DMMG & FTM)", desc: "Demande multi-sources, workscopes Walk & variance début/fin SV", icon: "", persona: "DMMG & FTM" },
        'F': { title: "Qualité des Données & Modèles (DGOV)", desc: "Complétude saisies MES, benchmark 4 méthodes vs réel & certitude", icon: "", persona: "DGOV" }
      },
      2: {
        'A': { title: "Macro : Consolidation Demande", desc: "1 ligne = 1 demande de révision moteur (Macro) • Délais forfaitisés", icon: "📁" },
        'B': { title: "Atelier : Lignes d'Intervention", desc: "1 ligne = 1 intervention unitaire (Shop & Gamme opératoire) • Finesse poste", icon: "🔧" }
      },
      3: {
        'A': { title: "S&OP (D-SOP)", desc: "Délais déterministes basés sur les gammes opératoires et forfaits de transit", icon: "➕" },
        'B': { title: "Projection Statistique (D-STA)", desc: "Distribution statistique réelle empirique (percentiles 5%, 50%, 95%)", icon: "📊" },
        'C': { title: "Projection Capacitaire (D-CAP)", desc: "Délais dynamiques pondérés par la charge atelier et l'effet goulot", icon: "🚦" },
        'D': { title: "Modélisation Avancée (D-ML)", desc: "Simulation probabiliste multi-factorielle des aléas et usures", icon: "📈" }
      },
      4: {
        'A': { title: "TAT Médian & Bornes (P5-P95)", desc: "Dispersion statistique P50 et intervalle P5-P95 par moteur", icon: "⏱️" },
        'B': { title: "Décomposition du TAT", desc: "Barres empilées par type de moteur : atelier, attente appro & transit", icon: "📊" },
        'C': { title: "Respect des Délais Clients", desc: "Écart TAT moyen contractuel vs effectif et % non-respect", icon: "🤝" },
        'D': { title: "Tableau d'Alertes des Demandes", desc: "Listing opérationnel des demandes MDT_MAINTENANCE_REQUEST par statut", icon: "📋" },
        'E': { title: "Cartes KPIs", desc: "TAT moyen réel & taux de respect SLA global", icon: "⏱️" },
        'F': { title: "Barres vs Seuils Cibles P85", desc: "Durée réelle par type de moteur face au seuil contractuel P85", icon: "🎯" },
        'G': { title: "Waterfall des Dérives", desc: "Cascade cumulative des écarts contractuel vs réel", icon: "🌊" },
        'H': { title: "Heatmap Occupation Réseau (S34-S42)", desc: "Matrice thermique des 10 centres SAE MRO par semaine S34 à S42 avec seuils vert/jaune/rouge", icon: "🗺️" },
        'I': { title: "Comparatif 4 Méthodes vs Réel", desc: "Histogramme comparant les 4 méthodes vs TAT effectif (18.2 j)", icon: "🏛️" }
      },
      5: {
        'A': { title: "Capacité S&OP (C-SOP)", desc: "Capacité nominale planifiée par atelier selon le plan de charge S&OP", icon: "🗓️" },
        'B': { title: "Projection Statistique (C-STA)", desc: "Capacité projetée par analyse statistique du débit et du WIP réel", icon: "⚡" },
        'C': { title: "Projection Logistique (C-LOG)", desc: "Capacité contrainte par la disponibilité effective des kits pièces (OTIF)", icon: "📦" },
        'D': { title: "Modélisation Avancée (C-ML)", desc: "Simulation prédictive intégrant aléas d'atelier, rebuts CND et bancs d'essai", icon: "🔮" }
      },
      6: {
        'A': { title: "Taux de Retard par Shop", desc: "Pourcentage d'interventions en retard par atelier SAE face au seuil de 10%", icon: "⚠️" },
        'B': { title: "Retards par Type & Shop", desc: "Types d'intervention (T-XXXXXX) avec attente imprévue décliné par shop", icon: "⚠️" },
        'C': { title: "Routes de Transfert Inter-Shops", desc: "Flux interventions transférées inter-shops et délai navette moyen", icon: "🚚" },
        'D': { title: "Décomposition du Délai par Shop", desc: "Barres horizontales par shop décomposant attente, réparation et transfert", icon: "📊" },
        'E': { title: "Taux de Charge par Station", desc: "Barre de charge par station de réparation face au seuil critique de 85%", icon: "🚦" },
        'F': { title: "Heatmap d'Occupation des Stations", desc: "Matrice thermique des stations du shop (S-MON) par semaine S34 à S42", icon: "🗓️" },
        'G': { title: "Entrées vs Sorties (WIP)", desc: "Diagramme de flux cumulé (CFD) arrivées / clôtures d'interventions", icon: "📈" },
        'H': { title: "Treemap Temps & Retards", desc: "Temps passé par moteur dans le shop avec drill-down par réparation et seuils <8%, 8-15%, >15%", icon: "🗂️" },
        'I': { title: "Comparatif 4 Méthodes vs Réel", desc: "Histogramme comparant les 4 méthodes vs débit effectif (124 interventions)", icon: "🏛️" }
      }
    };


    function switchStep(step) {
      currentStep = step;
      document.querySelectorAll('.step-page').forEach((el) => {
        el.classList.toggle('hidden', el.id !== `step-${step}`);
      });

      for (let i = 0; i <= TOTAL_STEPS; i++) {
        const tab = document.getElementById(`tab-${i}`);
        if (!tab) continue;
        if (i === step) {
          tab.className = "px-2.5 py-1 rounded-lg text-xs font-bold transition flex items-center gap-1 bg-blue-800 text-white shadow-sm shadow-blue-700/20";
        } else {
          tab.className = "px-2.5 py-1 rounded-lg text-xs font-bold transition flex items-center gap-1 bg-white text-slate-600 border border-slate-200 hover:text-blue-600 hover:bg-slate-50 shadow-sm";
        }
      }

      // Mise à jour du bouton suivant/fin
      const btnNext = document.getElementById('btn-next');
      if (btnNext) {
        if (step === TOTAL_STEPS) {
          btnNext.textContent = "Terminé (Haut)";
          btnNext.onclick = () => window.scrollTo({ top: 0, behavior: 'smooth' });
        } else {
          btnNext.textContent = "Suivant";
          btnNext.onclick = nextStep;
        }
      }

      if (step === 2) {
        setTimeout(() => {
          drawSchema(selections[2]);
          toggleSchemaView(schemaViewMode);
        }, 50);
      }
      if (step === 3) {
        toggleTableMode(3, tablePanelViewMode[3]);
      }
      if (step === 5) {
        toggleTableMode(5, tablePanelViewMode[5]);
      }
      if (step === 4) {
        setTimeout(() => toggleChartMode(4, chartViewMode[4]), 50);
      }
      if (step === 6) {
        setTimeout(() => toggleChartMode(6, chartViewMode[6]), 50);
      }
      if (step === 7) {
        renderFinalDashboard();
      }

      if (window.lucide && window.lucide.createIcons) {
        window.lucide.createIcons();
      }

      // Application de la largeur persistée du panneau gauche pour les étapes à volet double
      applyStepSplitWidth(step);

      try {
        localStorage.setItem('maestro_last_step', String(step));
      } catch (e) {}
    }


    // ===== Gestion du redimensionnement interactif du volet gauche (Étapes 2 à 6) =====
    const SPLIT_STORAGE_PREFIX = 'maestro_split_ratio_step_';
    const DEFAULT_SPLIT_PERCENT = 41.666; // Équivalent lg:col-span-5 (~41.7%)

    function getStepSplitWidth(step) {
      try {
        const saved = localStorage.getItem(SPLIT_STORAGE_PREFIX + step);
        if (saved !== null) {
          const val = parseFloat(saved);
          if (!isNaN(val) && val >= 18 && val <= 82) return val;
        }
      } catch (e) {}
      return DEFAULT_SPLIT_PERCENT;
    }

    function applyStepSplitWidth(step) {
      if (step < 2 || step > 6) return;
      const leftPanel = document.getElementById(`step-${step}-answers`);
      if (!leftPanel) return;

      // On n'applique le style en ligne que si l'écran est >= lg (1024px)
      if (window.innerWidth >= 1024) {
        const pct = getStepSplitWidth(step);
        leftPanel.style.width = pct + '%';
        leftPanel.style.flexBasis = pct + '%';
        leftPanel.style.maxWidth = pct + '%';
      } else {
        leftPanel.style.width = '';
        leftPanel.style.flexBasis = '';
        leftPanel.style.maxWidth = '';
      }
    }

    function resetStepSplitWidth(step) {
      try {
        localStorage.removeItem(SPLIT_STORAGE_PREFIX + step);
      } catch (e) {}
      applyStepSplitWidth(step);
    }

    function initSplitPanels() {
      // Configurer les splitters pour les étapes 2 à 6
      for (let s = 1; s <= 6; s++) {
        const splitter = document.getElementById(`step-${s}-splitter`);
        const container = document.getElementById(`step-${s}-split-container`);
        const leftPanel = document.getElementById(`step-${s}-answers`);
        if (!splitter || !container || !leftPanel) continue;

        let isDragging = false;
        let startX = 0;
        let startWidthPx = 0;
        let containerWidthPx = 0;

        splitter.addEventListener('mousedown', (e) => {
          if (e.button !== 0) return; // Clic gauche uniquement
          if (window.innerWidth < 1024) return;

          isDragging = true;
          startX = e.clientX;
          const rect = container.getBoundingClientRect();
          containerWidthPx = rect.width;
          startWidthPx = leftPanel.getBoundingClientRect().width;

          document.body.style.cursor = 'col-resize';
          document.body.style.userSelect = 'none';

          const onMouseMove = (ev) => {
            if (!isDragging || containerWidthPx <= 0) return;
            const deltaX = ev.clientX - startX;
            const newWidthPx = startWidthPx + deltaX;
            let newPct = (newWidthPx / containerWidthPx) * 100;
            // Bornes de redimensionnement : entre 18% et 82%
            if (newPct < 18) newPct = 18;
            if (newPct > 82) newPct = 82;

            leftPanel.style.width = newPct + '%';
            leftPanel.style.flexBasis = newPct + '%';
            leftPanel.style.maxWidth = newPct + '%';

            try {
              localStorage.setItem(SPLIT_STORAGE_PREFIX + s, newPct.toFixed(2));
            } catch (err) {}
          };

          const onMouseUp = () => {
            if (!isDragging) return;
            isDragging = false;
            document.body.style.cursor = '';
            document.body.style.userSelect = '';
            window.removeEventListener('mousemove', onMouseMove);
            window.removeEventListener('mouseup', onMouseUp);

            // Redessiner ou actualiser graphiques Chart.js / Schémas si nécessaire
            if (s === 2) {
              drawSchema(selections[2] || 'A');
            } else if (s === 4 && typeof renderStepChart === 'function') {
              renderStepChart(4);
            } else if (s === 6 && typeof renderStepChart === 'function') {
              renderStepChart(6);
            }
          };


          window.addEventListener('mousemove', onMouseMove);
          window.addEventListener('mouseup', onMouseUp);
          e.preventDefault();
        });

        // Double-clic sur le splitter pour réinitialiser à la largeur par défaut (~41.7%)
        splitter.addEventListener('dblclick', () => {
          resetStepSplitWidth(s);
          if (s === 2) drawSchema(selections[2] || 'A');
          if (s === 4 && typeof renderStepChart === 'function') renderStepChart(4);
          if (s === 6 && typeof renderStepChart === 'function') renderStepChart(6);
        });
      }

      // Réagir au redimensionnement de la fenêtre
      window.addEventListener('resize', () => {
        if (currentStep >= 2 && currentStep <= 6) {
          applyStepSplitWidth(currentStep);
        }
      });
    }

    function nextStep() {
      if (currentStep < TOTAL_STEPS) switchStep(currentStep + 1);
    }

    function prevStep() {
      if (currentStep > 0) switchStep(currentStep - 1);
    }

    // Définition des classements recommandés parmi les graphiques usuels selon l'objectif en Étape 1
    const recommendedCharts = {
      'A': { // Engagements SLA (CSPM) : Cartes synthétiques, Barres seuil, Décomposition, Alertes
        step4: ['C', 'E', 'A', 'B', 'D', 'F', 'G', 'H', 'I'],
        step6: ['E', 'C', 'A', 'B', 'D', 'F', 'G', 'H', 'I']
      },
      'B': { // Optimisation capacités (NTPL) : Barres décomposées, Barres seuil, Alertes, Cartes
        step4: ['B', 'F', 'H', 'A', 'C', 'D', 'E', 'G', 'I'],
        step6: ['E', 'F', 'H', 'A', 'D', 'B', 'C', 'G', 'I']
      },
      'C': { // Suivi retard & pénalités (FINC) : Alertes en tête, Barres seuil, Décomposition, Cartes
        step4: ['C', 'D', 'G', 'E', 'A', 'B', 'F', 'H', 'I'],
        step6: ['G', 'E', 'C', 'A', 'B', 'D', 'F', 'H', 'I']
      },
      'D': { // Arbitrage Atelier & Approvisionnements (SHPL) : Barres décomposées (attente pièces), Alertes nominatives, Ratio attente stock, Flux In/Out
        step4: ['B', 'G', 'D', 'C', 'E', 'A', 'F', 'H', 'I'],
        step6: ['A', 'C', 'D', 'G', 'H', 'E', 'B', 'F', 'I']
      },
      'E': { // Consolidation Demande & Workscopes (DMMG & FTM) : Courbes, Barres seuil, Décomposition
        step4: ['A', 'F', 'G', 'C', 'D', 'E', 'B', 'H', 'I'],
        step6: ['B', 'D', 'G', 'F', 'H', 'A', 'C', 'E', 'I']
      },
      'F': { // Data Gouvernance (DGOV) : Histogramme comparatif 4 méthodes vs effectif en tête (4.I / 6.I), P5-P95, retards, ratio Lean
        step4: ['I', 'A', 'F', 'G', 'C', 'D', 'E', 'B', 'H'],
        step6: ['I', 'B', 'D', 'G', 'A', 'C', 'E', 'F', 'H']
      }
    };

    // Configuration des badges d'usage pour les visualisations des étapes 4 et 6
    // Mapping direct avec les Personas SAE MAESTRO (Positions & Rôles)
    const usageBadgeConfig = {
      // Mapping Objectif Étape 1 -> Clés Persona actives
      targetUsage: {
        'A': ['cspm', 'ftm', 'eo'],
        'B': ['network', 'shop', 'demand'],
        'C': ['finance', 'cspm'],
        'D': ['shop', 'eo', 'network'],
        'E': ['demand', 'ftm', 'network'],
        'F': ['dgov', 'ftm', 'network', 'shop']
      },
      // Définition visuelle de chaque badge Persona SAE MAESTRO
      usageMeta: {
        'eo':         { label: 'EOWN', classes: 'bg-red-50 text-red-700 border-red-200' },
        'cspm':       { label: 'CSPM', classes: 'bg-emerald-50 text-emerald-700 border-emerald-200' },
        'network':    { label: 'NTPL', classes: 'bg-blue-50 text-blue-800 border-blue-200' },
        'shop':       { label: 'SHPL', classes: 'bg-cyan-50 text-cyan-700 border-cyan-200' },
        'ftm':        { label: 'FTM', classes: 'bg-teal-50 text-teal-700 border-teal-200' },
        'finance':    { label: 'FINC', classes: 'bg-amber-50 text-amber-700 border-amber-200' },
        'demand':     { label: 'DMMG', classes: 'bg-purple-50 text-purple-700 border-purple-200' },
        'dgov':       { label: 'DGOV', classes: 'bg-indigo-50 text-indigo-700 border-indigo-200' }
      },
      // Personas prépondérants pour chaque carte de l'Étape 4 (Délai & TAT)
      step4: {
        'A': ['network', 'demand', 'ftm', 'dgov'],
        'B': ['shop', 'network', 'eo'],
        'C': ['cspm', 'ftm', 'finance'],
        'D': ['eo', 'cspm', 'shop'],
        'E': ['cspm', 'network', 'ftm'],
        'F': ['ftm', 'shop', 'demand'],
        'G': ['finance', 'cspm', 'demand'],
        'H': ['eo', 'shop', 'ftm'],
        'I': ['dgov', 'ftm', 'network']
      },
      // Personas prépondérants pour chaque carte de l'Étape 6 (Capacité & Saturation)
      step6: {
        'A': ['shop', 'eo', 'network'],
        'B': ['ftm', 'demand', 'shop', 'dgov'],
        'C': ['network', 'shop', 'demand'],
        'D': ['shop', 'demand', 'dgov'],
        'E': ['network', 'shop'],
        'F': ['network', 'demand'],
        'G': ['demand', 'network', 'finance', 'dgov'],
        'H': ['shop', 'eo', 'network'],
        'I': ['dgov', 'network', 'shop']
      }
    };

    function renderUsageBadges() {
      const q1 = selections[1] || 'A';
      const activeUsageKeys = usageBadgeConfig.targetUsage[q1] || ['eo'];

      [4, 6].forEach(stepNum => {
        const stepMap = usageBadgeConfig[`step${stepNum}`];
        ['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H', 'I'].forEach(opt => {
          const card = document.getElementById(`opt-${stepNum}-${opt}`);
          if (!card) return;

          // Supprimer conteneur précédent s'il existe
          const oldContainer = card.querySelector('.badge-usages-container');
          if (oldContainer) oldContainer.remove();

          const cardUsages = stepMap[opt] || [];
          const hasActiveUsage = cardUsages.some(u => activeUsageKeys.includes(u));

          // Masquer les cartes dont aucun usage ne correspond à l'usage actif
          // (sauf si la carte est la sélection active — toujours visible)
          const isSelected = (selections[stepNum] === opt);
          if (!hasActiveUsage && !isSelected) {
            card.classList.add('hidden');
          } else {
            card.classList.remove('hidden');
          }

          if (cardUsages.length > 0) {
            const containerEl = document.createElement('div');
            containerEl.className = 'badge-usages-container flex flex-wrap items-center gap-1 mt-1.5';

            cardUsages.forEach(usageKey => {
              const meta = usageBadgeConfig.usageMeta[usageKey];
              if (!meta) return;
              const isActiveUsage = activeUsageKeys.includes(usageKey);

              const badgeEl = document.createElement('span');
              if (isActiveUsage) {
                badgeEl.className = `inline-flex items-center gap-1 text-[9px] font-bold px-1.5 py-0.5 rounded border shadow-xs ring-1 ring-offset-1 ring-blue-400 ${meta.classes}`;
              } else {
                badgeEl.className = `inline-flex items-center gap-1 text-[9px] font-medium px-1.5 py-0.5 rounded border bg-slate-50 text-slate-600 border-slate-200`;
              }
              badgeEl.textContent = meta.label;
              containerEl.appendChild(badgeEl);
            });

            // L'insérer dans le conteneur texte de la carte
            const textContainer = card.querySelector('.flex-1') || card.firstElementChild;
            if (textContainer) {
              textContainer.appendChild(containerEl);
            }
          }
        });
      });
    }

    function filterPersona(roleKey) {
      document.querySelectorAll('.persona-chip').forEach(btn => {
        if (btn.dataset.role === roleKey) {
          btn.className = 'persona-chip px-2 py-0.5 rounded-full text-[10px] font-bold border transition bg-blue-800 text-white border-blue-800 shadow-xs';
        } else {
          btn.className = 'persona-chip px-2 py-0.5 rounded-full text-[10px] font-medium border border-slate-200 bg-white text-slate-600 hover:border-blue-300 hover:text-blue-800 transition shadow-2xs';
        }
      });

      const personaMap = {
        'all': ['A', 'B', 'C', 'D', 'E', 'F'],
        'eo': ['A', 'D'],
        'cspm': ['A'],
        'network': ['B', 'D'],
        'shop': ['D', 'B'],
        'ftm': ['E', 'A'],
        'finance': ['C'],
        'demand': ['E', 'B'],
        'dgov': ['F', 'A', 'E']
      };

      const matches = personaMap[roleKey] || ['A', 'B', 'C', 'D', 'E', 'F'];
      ['A', 'B', 'C', 'D', 'E', 'F'].forEach(opt => {
        const card = document.getElementById(`opt-1-${opt}`);
        if (!card) return;
        if (matches.includes(opt)) {
          card.classList.remove('opacity-25', 'grayscale-[40%]');
        } else {
          card.classList.add('opacity-25', 'grayscale-[40%]');
        }
      });

      if (roleKey !== 'all' && matches.length > 0) {
        selectOption(1, matches[0]);
      }
    }

    // Gestion de la compatibilité et mise en avant des graphiques usuels (A à I)
    function updateCompatibilities() {
      const q1 = selections[1] || 'A';
      const reco = recommendedCharts[q1] || recommendedCharts['A'];

      // Toutes les options restent sélectionnables
      applyStepConstraints(2, {});
      applyStepConstraints(3, {});
      applyStepConstraints(4, {}, reco.step4);
      applyStepConstraints(6, {}, reco.step6);

      // Mise à jour dynamique des badges d'usage filtrés par Q1 sur les cartes 4 et 6
      renderUsageBadges();

      // Si sélection invalide (et non custom), basculer sur l'option recommandée principale
      const validOptions = ['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H', 'I'];
      const isCustom4 = typeof selections[4] === 'string' && selections[4].startsWith('custom_') && !!getCustomVisualById(4, selections[4]);
      if (!isCustom4 && !validOptions.includes(selections[4])) {
        selections[4] = reco.step4[0];
        const sel4 = document.getElementById('select-q4');
        if (sel4) sel4.value = selections[4];
      }
      const isCustom6 = typeof selections[6] === 'string' && selections[6].startsWith('custom_') && !!getCustomVisualById(6, selections[6]);
      if (!isCustom6 && !validOptions.includes(selections[6])) {
        selections[6] = reco.step6[0];
        const sel6 = document.getElementById('select-q6');
        if (sel6) sel6.value = selections[6];
      }
    }

    function applyStepConstraints(stepNum, disabledMap, topList = ['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H', 'I']) {
      const selectEl = document.getElementById(`select-q${stepNum}`);
      const options = (stepNum === 4 || stepNum === 6) ? ['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H', 'I'] : ['A', 'B', 'C', 'D', 'E'];

      options.forEach(opt => {
        const card = document.getElementById(`opt-${stepNum}-${opt}`);
        const selectOpt = selectEl ? selectEl.querySelector(`option[value="${opt}"]`) : null;
        const isDisabled = !!disabledMap[opt];

        if (card) {
          let notice = card.querySelector(`.badge-incompatible-step`);
          let topBadge = card.querySelector(`.badge-top4-step`);

          if (isDisabled) {
            card.classList.add('opacity-35', 'pointer-events-none', 'grayscale', 'bg-slate-100');
            if (topBadge) topBadge.remove();
            if (!notice) {
              notice = document.createElement('div');
              notice.className = "badge-incompatible-step text-[9px] text-slate-500 font-medium mt-1 bg-slate-100 border border-slate-200 rounded px-1.5 py-0.5 inline-block";
              notice.innerHTML = `○ Option non disponible`;
              const textContainer = card.querySelector('.flex-1') || card.firstElementChild;
              if (textContainer) textContainer.appendChild(notice);
            }
          } else {
            card.classList.remove('opacity-35', 'pointer-events-none', 'grayscale', 'bg-slate-100');
            if (notice) notice.remove();
            if (topBadge) topBadge.remove();
          }
        }

        if (selectOpt) {
          selectOpt.disabled = isDisabled;
        }
      });
    }



    function resolveStepCascade(stepNum, disabledMap, priorityList) {
      if (disabledMap[selections[stepNum]]) {
        // Trouver la première option disponible
        const nextValid = priorityList.find(opt => !disabledMap[opt]);
        if (nextValid) {
          selections[stepNum] = nextValid;
          const parent = document.getElementById(`step-${stepNum}`);
          if (parent) {
            parent.querySelectorAll('.option-card').forEach(el => el.classList.remove('active'));
            const target = document.getElementById(`opt-${stepNum}-${nextValid}`);
            if (target) target.classList.add('active');
          }
          const selectEl = document.getElementById(`select-q${stepNum}`);
          if (selectEl) selectEl.value = nextValid;

          if (stepNum === 2) {
            drawSchema(nextValid);
          }
        }
      }
    }

    function onSummarySelectChange(q, val) {
      selections[q] = val;

      const parent = document.getElementById(`step-${q}`);
      if (parent) {
        parent.querySelectorAll('.option-card').forEach(el => el.classList.remove('active'));
        const target = document.getElementById(`opt-${q}-${val}`);
        if (target) target.classList.add('active');
      }

      if (q === 2) {
        drawSchema(val);
      }

      // Mise à jour de la compatibilité et recalcul en cascade si besoin
      updateCompatibilities();

      renderStep3TablePreview();
      renderStep5TablePreview();
      updateRecap();
      renderFinalDashboard();
      refreshNavDropdowns();
      if (currentStep === 4) renderStepChart(4);
      if (currentStep === 6) renderStepChart(6);
    }

    function selectOption(q, opt) {
      selections[q] = opt;
      const parent = document.getElementById(`step-${q}`);
      if (parent) {
        parent.querySelectorAll('.option-card').forEach(el => el.classList.remove('active'));
        const target = document.getElementById(`opt-${q}-${opt}`);
        if (target) target.classList.add('active');
      }

      const selectEl = document.getElementById(`select-q${q}`);
      if (selectEl) selectEl.value = opt;

      if (q === 1) {
        document.querySelectorAll('#step-1 .option-card').forEach(el => el.classList.remove('opacity-25', 'grayscale-[40%]'));
        const optToChip = { 'A': 'eo', 'B': 'cspm', 'C': 'network', 'D': 'finance', 'E': 'shop', 'F': 'demand', 'G': 'dgov' };
        const activeChip = optToChip[opt];
        if (activeChip) {
          document.querySelectorAll('.persona-chip').forEach(btn => {
            if (btn.dataset.role === activeChip) {
              btn.className = 'persona-chip px-2 py-0.5 rounded-full text-[10px] font-bold border transition bg-blue-800 text-white border-blue-800 shadow-xs';
            } else {
              btn.className = 'persona-chip px-2 py-0.5 rounded-full text-[10px] font-medium border border-slate-200 bg-white text-slate-600 hover:border-blue-300 hover:text-blue-800 transition shadow-2xs';
            }
          });
        }
      }

      updateCompatibilities();

      if (q === 1 || q === 2 || q === 3) {
        if (q === 2 || q === 3) {
          step3DataState.activeTable = null;
          step3DataState.parentContext = null;
          step3DataState.page = 1;
        }
        renderStep3TablePreview();
        renderStepUml(3);
      }
      if (q === 1 || q === 2 || q === 5) {
        if (q === 2 || q === 5) {
          step5DataState.activeTable = null;
          step5DataState.parentContext = null;
          step5DataState.page = 1;
        }
        renderStep5TablePreview();
        renderStepUml(5);
      }
      if (q === 2) {
        drawSchema(opt);
      }
      if (currentStep === 4) renderStepChart(4);
      if (currentStep === 6) renderStepChart(6);
      updateRecap();
      if (currentStep === 7) {
        renderFinalDashboard();
      }
      refreshNavDropdowns();
    }

    function selectGranularity(opt) {
      selections[2] = opt;
      const parent = document.getElementById(`step-2`);
      if (parent) {
        parent.querySelectorAll('.option-card').forEach(el => el.classList.remove('active'));
        const target = document.getElementById(`opt-2-${opt}`);
        if (target) target.classList.add('active');
      }
      const selectQ2 = document.getElementById('select-q2');
      if (selectQ2) selectQ2.value = opt;

      updateCompatibilities();

      schemaDataState.activeTable = null;
      schemaDataState.parentContext = null;
      schemaDataState.page = 1;
      step3DataState.activeTable = null;
      step3DataState.parentContext = null;
      step3DataState.page = 1;
      step5DataState.activeTable = null;
      step5DataState.parentContext = null;
      step5DataState.page = 1;

      drawSchema(opt);
      if (schemaViewMode === 'uml' || schemaViewMode === 'graph' || schemaViewMode === 'mermaid') updateMermaidCode(opt);
      renderStep2DataView(true);
      renderStep3TablePreview();
      renderStep5TablePreview();
      updateRecap();
      if (currentStep === 7) {
        renderFinalDashboard();
      }
      refreshNavDropdowns();
    }

    function onUsageChange(val) {
      selectOption(1, val);
    }


    // ===== Dropdowns de la barre de navigation : changer une réponse au survol (Étapes 1 à 6) =====
    // Ordre fixe (A, B, C, D) conservé pour chaque étape, sans remonter l'option sélectionnée.
    const NAV_ORDER = ['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H', 'I'];

    function buildNavDropdowns() {
      for (let q = 1; q <= 6; q++) {
        const dd = document.getElementById(`nav-dd-${q}`);
        if (!dd || !metaInfo[q]) continue;
        dd.innerHTML = '';
        const opts = NAV_ORDER.filter((o) => metaInfo[q][o]);

        opts.forEach((o) => {
          const m = metaInfo[q][o];
          const isSel = selections[q] === o;
          const btn = document.createElement('button');
          btn.type = 'button';
          btn.className =
            'w-full text-left flex items-start gap-2 px-2 py-1.5 rounded-lg text-[12px] transition border ' +
            (isSel
              ? 'bg-blue-50 border-blue-200 text-blue-800'
              : 'text-slate-700 hover:bg-slate-50 border-transparent');
          btn.innerHTML =
            `<span class="flex-1 min-w-0"><span class="block font-bold text-[13px] leading-tight text-slate-900">${o} · ${m.title}</span>` +
            `<span class="block font-normal text-slate-500 text-[12px] leading-snug whitespace-normal">${m.desc}</span></span>` +
            (isSel ? '<span class="ml-2 shrink-0 text-[13px] font-bold text-blue-800">✓</span>' : '');
          btn.onclick = () => onSummarySelectChange(q, o);
          dd.appendChild(btn);
        });
      }
    }

    function refreshNavDropdowns() {
      buildNavDropdowns();
    }
