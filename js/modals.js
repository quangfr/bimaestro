// =========================================================================
// Maestro BI - js/modals.js
// Gestionnaires des Modales & Composants d'Édition
// =========================================================================

    let targetPromptModalStep = 4;
    let targetPromptModalType = 'chart'; // 'chart', 'table', 'visuels'

    function openPromptTemplateModal(step) {
      targetPromptModalStep = step;
      const modal = document.getElementById("prompt-template-modal");
      const textarea = document.getElementById("prompt-template-textarea");
      const titleEl = document.getElementById("prompt-template-modal-title");
      const subEl = document.getElementById("prompt-template-modal-subtitle");
      if (!modal || !textarea) return;

      const isTableStep = (step === 3 || step === 5);
      const isVisuelsActive = isTableStep
        ? (tablePanelViewMode[step] === 'visuels')
        : (chartViewMode[step] === 'visuels');

      if (isVisuelsActive) {
        targetPromptModalType = 'visuels';
        if (titleEl) titleEl.textContent = `Configuration du Template de Prompt Idées de Visuels (Étape ${step}) (visuels)`;
        if (subEl) subEl.textContent = "Structure SORTIE & ENTRÉES pour génération de 3 idées de visuels compatibles SAP-IBP / SAC (stocké en LocalStorage)";
        textarea.value = getVisuelsPromptTemplate();
      } else if (isTableStep) {
        targetPromptModalType = 'table';
        if (titleEl) titleEl.textContent = `Configuration du Template de Prompt IA Tables (Étape ${step}) (chartjs)`;
        if (subEl) subEl.textContent = "Génération de propositions de visualisations avec analyse comparative et modèles ERD (stocké en LocalStorage)";
        textarea.value = getTablePromptTemplate();
      } else {
        targetPromptModalType = 'chart';
        if (titleEl) titleEl.textContent = `Configuration du Template de Prompt Visuel (Étape ${step}) (sap)`;
        if (subEl) subEl.textContent = "Personnalisation du prompt Markdown généré pour tous les graphiques (stocké en LocalStorage)";
        textarea.value = getPromptTemplate();
      }

      const msg = document.getElementById("prompt-template-saved-msg");
      if (msg) msg.classList.add("hidden");
      modal.classList.remove("hidden");
      textarea.focus();
    }

    function closePromptTemplateModal() {
      const modal = document.getElementById("prompt-template-modal");
      if (modal) modal.classList.add("hidden");
    }

    function savePromptTemplateModal() {
      const textarea = document.getElementById("prompt-template-textarea");
      if (!textarea) return;

      if (targetPromptModalType === 'visuels') {
        saveVisuelsPromptTemplate(textarea.value);
        [3, 4, 5, 6].forEach(s => renderVisuelsPromptView(s));
      } else if (targetPromptModalType === 'table') {
        saveTablePromptTemplate(textarea.value);
        renderTableAiView(3);
        renderTableAiView(5);
      } else {
        savePromptTemplate(textarea.value);
        renderChartAiView(4);
        renderChartAiView(6);
      }

      const msg = document.getElementById("prompt-template-saved-msg");
      if (msg) {
        msg.classList.remove("hidden");
        setTimeout(() => msg.classList.add("hidden"), 1800);
      }
      setTimeout(() => closePromptTemplateModal(), 400);
    }

    function resetPromptTemplateModal() {
      const textarea = document.getElementById("prompt-template-textarea");
      if (!textarea) return;

      if (targetPromptModalType === 'visuels') {
        textarea.value = DEFAULT_VISUELS_PROMPT_TEMPLATE;
        localStorage.removeItem(VISUELS_PROMPT_TEMPLATE_STORAGE_KEY);
        [3, 4, 5, 6].forEach(s => renderVisuelsPromptView(s));
      } else if (targetPromptModalType === 'table') {
        textarea.value = DEFAULT_TABLE_PROMPT_TEMPLATE;
        localStorage.removeItem(TABLE_PROMPT_TEMPLATE_STORAGE_KEY);
        renderTableAiView(3);
        renderTableAiView(5);
      } else {
        textarea.value = DEFAULT_PROMPT_TEMPLATE;
        localStorage.removeItem(PROMPT_TEMPLATE_STORAGE_KEY);
        renderChartAiView(4);
        renderChartAiView(6);
      }

      const msg = document.getElementById("prompt-template-saved-msg");
      if (msg) {
        msg.textContent = "✓ Réinitialisé";
        msg.classList.remove("hidden");
        setTimeout(() => {
          msg.textContent = "✓ Enregistré";
          msg.classList.add("hidden");
        }, 1800);
      }
    }

    document.addEventListener("keydown", (e) => {
      if (e.key === "Escape") {
        closeMethodologyModal();
        closePromptTemplateModal();
        closeAddVisualModal();
        closeDataGeneratorModal();
        closeAddSchemaModal();
        closeMesureGeneratorModal();
        closeAddCustomMeasureModal();
      }
    });


    // ===== Gestion des Visualisations Personnalisées (Étapes 4 & 6) =====
    let activeAddVisualStep = 4;

    function getCustomVisuals(step) {
      try {
        const raw = localStorage.getItem(`maestro_custom_visuals_${step}`);
        if (raw) {
          const arr = JSON.parse(raw);
          if (Array.isArray(arr)) return arr;
        }
      } catch (e) {
        console.warn('Erreur lecture custom visuals:', e);
      }
      return [];
    }

    function saveCustomVisuals(step, list) {
      try {
        localStorage.setItem(`maestro_custom_visuals_${step}`, JSON.stringify(list));
      } catch (e) {
        console.warn('Erreur sauvegarde custom visuals:', e);
      }
    }

    function getCustomVisualById(step, customId) {
      const list = getCustomVisuals(step);
      return list.find(v => v.id === customId) || null;
    }

    function openAddVisualModal(step, editId = null) {
      activeAddVisualStep = (step === 6) ? 6 : 4;
      const modal = document.getElementById('add-visual-modal');
      const titleEl = document.getElementById('add-visual-modal-title');
      const subtitleEl = document.getElementById('add-visual-modal-subtitle');
      const idInput = document.getElementById('custom-visual-id');
      const inputTitle = document.getElementById('custom-visual-title');
      const inputDesc = document.getElementById('custom-visual-desc');
      const inputCode = document.getElementById('custom-visual-code');
      const errorDiv = document.getElementById('custom-visual-error');
      const submitBtn = document.getElementById('custom-visual-submit-btn');

      if (!modal) return;

      if (idInput) idInput.value = editId || '';

      const isEdit = !!editId;
      const existing = isEdit ? getCustomVisualById(activeAddVisualStep, editId) : null;

      if (titleEl) {
        titleEl.textContent = isEdit
          ? `Modifier le visuel personnalisé (Étape ${activeAddVisualStep})`
          : `Ajouter un visuel personnalisé (Étape ${activeAddVisualStep})`;
      }
      if (subtitleEl) {
        subtitleEl.textContent = (activeAddVisualStep === 4)
          ? 'Visuel de Turn Around Time (TAT) / Délais MRO'
          : 'Visuel de Capacité / Saturation Atelier';
      }
      if (submitBtn) {
        submitBtn.textContent = isEdit ? 'Mettre à jour et afficher' : 'Sauvegarder et afficher';
      }

      if (inputTitle) inputTitle.value = existing ? existing.title : '';
      if (inputDesc) inputDesc.value = existing ? (existing.desc || '') : '';
      if (inputCode) inputCode.value = existing ? (existing.codeJs || '') : '';
      if (errorDiv) errorDiv.classList.add('hidden');

      // Réinitialiser les chips personas
      const existingPersonas = (existing && Array.isArray(existing.personas)) ? existing.personas : [];
      document.querySelectorAll('#custom-visual-personas .custom-persona-btn').forEach(btn => {
        const p = btn.dataset.persona;
        if (isEdit && existingPersonas.includes(p)) {
          btn.classList.add('bg-blue-800', 'text-white', 'border-blue-800', 'shadow-xs');
          btn.classList.remove('bg-slate-50', 'text-slate-600', 'border-slate-200');
        } else {
          btn.classList.remove('bg-blue-800', 'text-white', 'border-blue-800', 'shadow-xs');
          btn.classList.add('bg-slate-50', 'text-slate-600', 'border-slate-200');
        }
      });

      modal.classList.remove('hidden');
      if (inputTitle) inputTitle.focus();
    }

    function closeAddVisualModal() {
      const modal = document.getElementById('add-visual-modal');
      if (modal) modal.classList.add('hidden');
    }

    function toggleCustomPersonaChip(btn) {
      const isSelected = btn.classList.contains('bg-blue-800');
      if (isSelected) {
        btn.classList.remove('bg-blue-800', 'text-white', 'border-blue-800', 'shadow-xs');
        btn.classList.add('bg-slate-50', 'text-slate-600', 'border-slate-200');
      } else {
        btn.classList.add('bg-blue-800', 'text-white', 'border-blue-800', 'shadow-xs');
        btn.classList.remove('bg-slate-50', 'text-slate-600', 'border-slate-200');
      }
    }

    function copyAiPromptForCustomVisual() {
      // Pour l'étape 4 (ajout visuel) -> prompt de l'étape 3
      // Pour l'étape 6 (ajout visuel) -> prompt de l'étape 5
      const sourceStep = (activeAddVisualStep === 6) ? 5 : 3;
      let promptText = (typeof generateTableAiPrompt === 'function')
        ? generateTableAiPrompt(sourceStep)
        : '';

      if (!promptText) return;

      // Récupération du titre et de la description saisis dans la modal
      const titleInput = document.getElementById('custom-visual-title');
      const descInput = document.getElementById('custom-visual-desc');
      const title = titleInput ? titleInput.value.trim() : '';
      const desc = descInput ? descInput.value.trim() : '';

      let customContext = '';
      if (title) customContext += `Titre du visuel : ${title}\n`;
      if (desc) customContext += `Description : ${desc}\n`;

      if (customContext) {
        if (promptText.includes('ENTRÉES\n')) {
          promptText = promptText.replace('ENTRÉES\n', `ENTRÉES\n${customContext}\n`);
        } else if (promptText.includes('ENTRÉES')) {
          promptText = promptText.replace('ENTRÉES', `ENTRÉES\n${customContext}`);
        } else {
          promptText = `${customContext}\n${promptText}`;
        }
      }

      const labelEl = document.getElementById('custom-visual-copy-ai-label');
      copyTextToClipboard(promptText).then(() => {
        if (labelEl) {
          const original = labelEl.textContent;
          labelEl.textContent = 'Prompt copié !';
          setTimeout(() => {
            labelEl.textContent = original;
          }, 1800);
        }
      });
    }

    function submitCustomVisual() {
      const step = activeAddVisualStep;
      const idInput = document.getElementById('custom-visual-id');
      const titleInput = document.getElementById('custom-visual-title');
      const descInput = document.getElementById('custom-visual-desc');
      const codeInput = document.getElementById('custom-visual-code');
      const errorDiv = document.getElementById('custom-visual-error');
      const errorText = document.getElementById('custom-visual-error-text');

      const editId = idInput ? idInput.value.trim() : '';
      const title = titleInput ? titleInput.value.trim() : '';
      const desc = descInput ? descInput.value.trim() : '';
      let codeStr = codeInput ? codeInput.value.trim() : '';

      const showError = (msg) => {
        if (errorDiv && errorText) {
          errorText.textContent = msg;
          errorDiv.classList.remove('hidden');
        }
      };

      if (!title) {
        showError("Veuillez saisir un titre pour la visualisation.");
        if (titleInput) titleInput.focus();
        return;
      }
      if (!codeStr) {
        showError("Veuillez coller le code JavaScript Chart.js.");
        if (codeInput) codeInput.focus();
        return;
      }

      // Nettoyage préalable (retrait des blocs Markdown ```js ... ``` si présents)
      codeStr = codeStr.replace(/^```(?:javascript|js|json)?\s*\n?/i, '').replace(/\n?\s*```$/i, '').trim();

      // Évaluation permissive multi-modes
      let evaluated = null;
      let finalCode = codeStr;
      let evalErr = null;

      // 1. Essai direct en tant que JSON
      try {
        const parsedJson = JSON.parse(codeStr);
        if (parsedJson && typeof parsedJson === 'object') {
          evaluated = parsedJson;
        }
      } catch (e) {}

      // 2. Essais d'évaluation JavaScript sécurisée
      if (!evaluated) {
        const attempts = [
          // A: Objet dénué d'accolades englobantes ({ ... })
          { body: 'return ({\n' + codeStr + '\n});', wrap: true },
          // B: Objet déjà entouré d'accolades ou expression standard
          { body: 'return (' + codeStr + ');', wrap: false },
          // C: Script contenant des déclarations (ex: const config = { ... })
          { body: codeStr + '\n;return (typeof config !== "undefined" ? config : (typeof data !== "undefined" ? data : (typeof chart !== "undefined" ? chart : null)));', isScript: true }
        ];

        for (const att of attempts) {
          try {
            const fn = new Function(att.body);
            const res = fn();
            if (res && typeof res === 'object') {
              evaluated = res;
              if (att.wrap && !finalCode.startsWith('{')) {
                finalCode = '{\n' + finalCode + '\n}';
              }
              evalErr = null;
              break;
            }
          } catch (err) {
            if (!evalErr) evalErr = err;
          }
        }
      }

      if (!evaluated || typeof evaluated !== 'object') {
        let msg = evalErr ? (evalErr.message || String(evalErr)) : "Le code doit retourner un objet JavaScript valide ({ labels, datasets } ou config Chart.js).";
        // Détection de la ligne d'erreur si disponible
        let lineDetail = '';
        if (evalErr && evalErr.stack) {
          const match = evalErr.stack.match(/<anonymous>:(\d+):(\d+)/);
          if (match) {
            const lineNum = Math.max(1, parseInt(match[1], 10) - 1);
            lineDetail = ` (ligne ~${lineNum})`;
          }
        }
        showError(`Erreur de syntaxe JS : ${msg}${lineDetail}`);
        return;
      }

      // Synchronisation du champ de saisie avec le code normalisé
      codeStr = finalCode;
      if (codeInput) {
        codeInput.value = codeStr;
      }

      let chartConfig = null;
      // Cas 1 : L'utilisateur a collé juste { labels: [...], datasets: [...] }
      if (Array.isArray(evaluated.datasets)) {
        chartConfig = {
          type: evaluated.type || 'bar',
          data: {
            labels: evaluated.labels || [],
            datasets: evaluated.datasets
          },
          options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
              legend: { display: true, position: 'top' },
              datalabels: { display: false }
            }
          }
        };
      } else if (evaluated.data && Array.isArray(evaluated.data.datasets)) {
        // Cas 2 : L'utilisateur a collé une configuration Chart.js complète
        chartConfig = evaluated;
        if (!chartConfig.options) chartConfig.options = {};
        chartConfig.options.responsive = true;
        chartConfig.options.maintainAspectRatio = false;
      } else {
        showError("L'objet doit contenir une propriété 'datasets' ou une propriété 'data' avec 'datasets'.");
        return;
      }

      // Récupérer les personas sélectionnés (facultatifs)
      const selectedPersonas = [];
      document.querySelectorAll('#custom-visual-personas .custom-persona-btn').forEach(btn => {
        if (btn.classList.contains('bg-blue-800') && btn.dataset.persona) {
          selectedPersonas.push(btn.dataset.persona);
        }
      });

      const list = getCustomVisuals(step);
      let targetId = editId;

      if (editId) {
        // Modification d'un visuel personnalisé existant
        const idx = list.findIndex(v => v.id === editId);
        if (idx !== -1) {
          list[idx].title = title;
          list[idx].desc = desc;
          list[idx].personas = selectedPersonas;
          list[idx].codeJs = codeStr;
          list[idx].config = chartConfig;
          list[idx].updatedAt = Date.now();
        } else {
          targetId = 'custom_' + Date.now();
          list.unshift({
            id: targetId,
            title: title,
            desc: desc,
            personas: selectedPersonas,
            codeJs: codeStr,
            config: chartConfig,
            createdAt: Date.now()
          });
        }
      } else {
        // Création d'un nouveau visuel
        targetId = 'custom_' + Date.now();
        const customItem = {
          id: targetId,
          title: title,
          desc: desc,
          personas: selectedPersonas,
          codeJs: codeStr,
          config: chartConfig,
          createdAt: Date.now()
        };
        list.unshift(customItem);
      }

      saveCustomVisuals(step, list);

      renderCustomVisualCards(step);
      closeAddVisualModal();

      // Sélectionner immédiatement et afficher à droite
      selectCustomOption(step, targetId);
      showToast(editId ? `✨ Visuel personnalisé <b>${title}</b> mis à jour.` : `✨ Visuel personnalisé <b>${title}</b> ajouté et affiché.`);
    }

    function deleteCustomVisual(step, customId, ev) {
      if (ev) {
        ev.stopPropagation();
        ev.preventDefault();
      }
      if (!confirm("Voulez-vous vraiment supprimer ce visuel personnalisé ?")) return;

      let list = getCustomVisuals(step);
      list = list.filter(v => v.id !== customId);
      saveCustomVisuals(step, list);

      // Si le visuel supprimé était actuellement sélectionné, basculer sur l'option par défaut 'A'
      if (selections[step] === customId) {
        selectOption(step, 'A');
      }

      renderCustomVisualCards(step);
      showToast("🗑 Visuel personnalisé supprimé.");
    }

    function selectCustomOption(step, customId) {
      const custom = getCustomVisualById(step, customId);
      if (!custom) return;

      selections[step] = customId;

      const parent = document.getElementById(`step-${step}`);
      if (parent) {
        parent.querySelectorAll('.option-card').forEach(el => el.classList.remove('active'));
        const target = document.getElementById(`opt-${step}-${customId}`);
        if (target) target.classList.add('active');
      }

      if (currentStep === step) {
        renderStepChart(step);
      }
      updateRecap();
    }

    function renderCustomVisualCards(step) {
      const container = document.getElementById(`step-${step}-custom-answers`);
      if (!container) return;

      const list = getCustomVisuals(step);
      if (list.length === 0) {
        container.innerHTML = '';
        container.classList.add('hidden');
        return;
      }

      container.classList.remove('hidden');
      container.innerHTML = '';

      list.forEach(v => {
        const isSel = (selections[step] === v.id);
        const card = document.createElement('div');
        card.id = `opt-${step}-${v.id}`;
        card.onclick = () => selectCustomOption(step, v.id);
        card.className = `option-card step-answers-card glass-card rounded-xl border border-blue-300/80 cursor-pointer flex flex-row items-start gap-3 p-3 transition relative group ${isSel ? 'active bg-blue-50/90' : 'hover:bg-slate-50/80'}`;

        // Personas badges
        let personasHtml = '';
        if (Array.isArray(v.personas) && v.personas.length > 0) {
          personasHtml = `<div class="flex flex-wrap items-center gap-1 mb-1.5">`;
          v.personas.forEach(pKey => {
            const meta = usageBadgeConfig.usageMeta[pKey];
            if (meta) {
              personasHtml += `<span class="inline-flex items-center gap-0.5 text-[9px] font-bold px-1.5 py-0.5 rounded border ${meta.classes}"><span>${meta.label}</span></span>`;
            }
          });
          personasHtml += `</div>`;
        }

        const descHtml = v.desc ? `<p class="ans-desc text-slate-600 leading-snug mb-1.5 text-[11px]">${v.desc}</p>` : '';

        card.innerHTML = `
          <div id="opt-${step}-${v.id}-body" class="flex-1 min-w-0 pr-14">
            <div class="flex items-center gap-1.5 mb-1">
              <span class="px-1.5 py-0.5 rounded text-[8.5px] font-bold bg-blue-100 text-blue-800 uppercase tracking-wider">Personnalisé</span>
            </div>
            <div class="ans-title font-bold text-slate-900 mb-1 flex items-center gap-1.5">
              <span>${v.title}</span>
            </div>
            ${descHtml}
            ${personasHtml}
          </div>
          <div class="absolute top-2.5 right-2.5 flex items-center gap-1">
            <button type="button" onclick="openAddVisualModal(${step}, '${v.id}')" title="Modifier ce visuel personnalisé"
              class="w-6 h-6 rounded-md bg-white hover:bg-blue-50 text-slate-400 hover:text-blue-700 border border-slate-200 hover:border-blue-200 flex items-center justify-center transition shadow-2xs cursor-pointer text-xs">
              ✎
            </button>
            <button type="button" onclick="deleteCustomVisual(${step}, '${v.id}', event)" title="Supprimer ce visuel personnalisé"
              class="w-6 h-6 rounded-md bg-white hover:bg-red-50 text-slate-400 hover:text-red-600 border border-slate-200 hover:border-red-200 flex items-center justify-center transition shadow-2xs cursor-pointer text-xs">
              🗑
            </button>
          </div>
        `;

        container.appendChild(card);
      });
    }


    // ===== Modale Paramètres du Générateur de Données =====
    let activeDataGenTable = null;

    function openDataGeneratorModal() {
      const g = selections[2] || 'A';
      const { parsedErd } = getOrGenerateCurrentDataset(g);
      const modal = document.getElementById('data-generator-modal');
      const tableSelect = document.getElementById('data-gen-table-select');
      if (!modal || !tableSelect) return;

      tableSelect.innerHTML = '';
      Object.keys(parsedErd.entities).forEach(tName => {
        const ent = parsedErd.entities[tName];
        const opt = document.createElement('option');
        opt.value = tName;
        opt.textContent = `${tName} (${ent.label || tName})`;
        tableSelect.appendChild(opt);
      });

      activeDataGenTable = schemaDataState.activeTable || parsedErd.mainTable;
      tableSelect.value = activeDataGenTable;

      renderDataGenFieldsForm();
      modal.classList.remove('hidden');
    }

    function closeDataGeneratorModal() {
      const modal = document.getElementById('data-generator-modal');
      if (modal) modal.classList.add('hidden');
    }

    function onDataGenTableSelectChange(tableName) {
      activeDataGenTable = tableName;
      renderDataGenFieldsForm();
    }

    function onDataGenRowCountChange(val) {
      const count = parseInt(val, 10);
      if (isNaN(count) || count < 1) return;
      const g = selections[2] || 'A';
      const { parsedErd } = getOrGenerateCurrentDataset(g);
      const strat = getTableDataStrategy(g, activeDataGenTable, parsedErd);
      strat.rowCount = Math.min(500, count);
      saveTableDataStrategy(g, activeDataGenTable, strat);
    }

    function renderDataGenFieldsForm() {
      const g = selections[2] || 'A';
      const { parsedErd } = getOrGenerateCurrentDataset(g);
      const container = document.getElementById('data-gen-fields-container');
      const countInput = document.getElementById('data-gen-count-input');
      if (!container) return;

      const ent = parsedErd.entities[activeDataGenTable];
      if (!ent) return;

      const strat = getTableDataStrategy(g, activeDataGenTable, parsedErd);
      if (countInput) countInput.value = strat.rowCount || 20;

      let html = '';
      ent.fields.forEach(f => {
        const fStrat = strat.fields[f.name] || getDefaultFieldStrategy(f, activeDataGenTable, parsedErd);
        const badgeConstraint = f.constraint ? `<span class="px-1 py-0.2 rounded text-[8.5px] font-mono ${f.constraint === 'PK' ? 'bg-amber-100 text-amber-900 border border-amber-300' : 'bg-blue-100 text-blue-900 border border-blue-300'}">${f.constraint}</span>` : '';

        html += `<div class="p-2.5 rounded-lg border border-slate-200 bg-white shadow-2xs space-y-1.5">
          <div class="flex items-center justify-between gap-2 border-b border-slate-100 pb-1">
            <div class="flex items-center gap-1.5">
              <span class="font-bold text-slate-800 text-[11px] font-mono">${f.name}</span>
              ${badgeConstraint}
              <select onchange="updateFieldStratType('${f.name}', this.value)" title="Type de donnée (enregistrable dans l'UML)" class="text-[9.5px] font-mono font-semibold bg-white border border-slate-300 rounded px-1 py-0.5 text-slate-700 cursor-pointer shadow-2xs">
                ${['string', 'int', 'float', 'date', 'boolean', 'enum'].map(t => `<option value="${t}"${(fStrat.type || f.type) === t ? ' selected' : ''}>${t}</option>`).join('')}
              </select>
            </div>
            <span class="text-[9.5px] text-slate-400 italic truncate max-w-[200px]" title="${f.comment || ''}">UML : "${f.comment || '-'}"</span>
          </div>
          <div class="pt-1">`;

        if (fStrat.generator === 'float' || fStrat.generator === 'integer') {
          const isFormulaMode = fStrat.mode === 'formula';
          html += `<div class="space-y-2">
            <div class="flex items-center justify-between">
              <div class="flex items-center rounded border border-slate-200 bg-slate-50 p-0.5 text-[9.5px]">
                <button type="button" onclick="updateFieldStratMode('${f.name}', 'distrib')" class="px-2 py-0.5 rounded font-bold transition ${!isFormulaMode ? 'bg-blue-800 text-white' : 'text-slate-600 hover:bg-slate-200'}">Distribution</button>
                <button type="button" onclick="updateFieldStratMode('${f.name}', 'formula')" class="px-2 py-0.5 rounded font-bold transition ${isFormulaMode ? 'bg-blue-800 text-white' : 'text-slate-600 hover:bg-slate-200'}">Formule</button>
              </div>
              ${isFormulaMode ? `<span id="datagen-formula-err-${f.name}" class="text-[9.5px] font-mono text-red-600 font-semibold truncate max-w-[320px]"></span>` : ''}
            </div>`;
          if (!isFormulaMode) {
            const baseMeanN = fStrat.mean !== undefined ? fStrat.mean : 20;
            const autoMin = fStrat.generator === 'float' ? parseFloat((baseMeanN * 0.5).toFixed(1)) : Math.round(baseMeanN * 0.5);
            const autoMax = fStrat.generator === 'float' ? parseFloat((baseMeanN * 1.5).toFixed(1)) : Math.round(baseMeanN * 1.5);
            html += `<div class="grid grid-cols-1 sm:grid-cols-4 gap-2 items-center">
              <div>
                <label class="block text-[9.5px] text-slate-500 font-semibold">Min :</label>
                <input type="number" step="${fStrat.generator === 'float' ? '0.1' : '1'}" value="${fStrat.min !== undefined ? fStrat.min : ''}" placeholder="${autoMin}" title="Vide : règle ±50 % (borne basse automatique)" onchange="updateFieldStratNumber('${f.name}', 'min', this.value)" class="w-full px-2 py-0.5 border border-slate-300 rounded text-xs" />
              </div>
              <div>
                <label class="block text-[9.5px] text-slate-500 font-semibold">Max :</label>
                <input type="number" step="${fStrat.generator === 'float' ? '0.1' : '1'}" value="${fStrat.max !== undefined ? fStrat.max : ''}" placeholder="${autoMax}" title="Vide : règle ±50 % (borne haute automatique)" onchange="updateFieldStratNumber('${f.name}', 'max', this.value)" class="w-full px-2 py-0.5 border border-slate-300 rounded text-xs" />
              </div>
              <div>
                <label class="block text-[9.5px] text-slate-500 font-semibold">Moyenne / Cible :</label>
                <input type="number" step="${fStrat.generator === 'float' ? '0.1' : '1'}" value="${fStrat.mean !== undefined ? fStrat.mean : ''}" onchange="updateFieldStratNumber('${f.name}', 'mean', this.value)" placeholder="${fStrat.mean !== undefined ? '' : '20'}" class="w-full px-2 py-0.5 border border-slate-300 rounded text-xs" />
              </div>
              <div>
                <label class="block text-[9.5px] text-slate-500 font-semibold">Suffixe :</label>
                <input type="text" value="${fStrat.suffix || ''}" onchange="updateFieldStratSuffix('${f.name}', this.value)" class="w-full px-2 py-0.5 border border-slate-300 rounded text-xs" placeholder="ex: j, h, %" />
              </div>
            </div>`;
          } else {
            html += `<div>
              <div class="flex items-center gap-1.5">
                <input type="text" id="datagen-formula-${f.name}" data-formula-field="${f.name}" value="${escapeHtml(fStrat.formula || '')}" placeholder="Ex: P50_MEDIAN * 1.1 ou URGENCY_WEIGHT + 2" oninput="updateFieldStratFormula('${f.name}', this.value)" class="formula-autocomplete-input flex-1 px-2.5 py-1 font-mono text-xs border border-slate-300 rounded bg-white" />
                <input type="text" value="${fStrat.suffix || ''}" onchange="updateFieldStratSuffix('${f.name}', this.value)" class="w-16 px-2 py-1 border border-slate-300 rounded text-xs" placeholder="suffixe" title="Suffixe" />
              </div>
            </div>`;
          }
          html += `</div>`;
        } else if (fStrat.generator === 'date') {
          html += `<div class="grid grid-cols-1 sm:grid-cols-2 gap-2 items-center">
            <div>
              <label class="block text-[9.5px] text-slate-500 font-semibold">Date Début (intervalle) :</label>
              <input type="date" value="${fStrat.startDate}" onchange="updateFieldStratDate('${f.name}', 'startDate', this.value)" class="w-full px-2 py-0.5 border border-slate-300 rounded text-xs" />
            </div>
            <div>
              <label class="block text-[9.5px] text-slate-500 font-semibold">Date Fin (intervalle) :</label>
              <input type="date" value="${fStrat.endDate}" onchange="updateFieldStratDate('${f.name}', 'endDate', this.value)" class="w-full px-2 py-0.5 border border-slate-300 rounded text-xs" />
            </div>
          </div>`;
        } else if (fStrat.generator === 'boolean') {
          html += `<div class="flex items-center gap-3">
            <label class="text-[10px] text-slate-600 font-semibold">Répartition % True (vs False) :</label>
            <input type="range" min="0" max="100" value="${fStrat.truePct}" oninput="updateFieldStratBool('${f.name}', this.value)" class="w-36 cursor-pointer" />
            <span id="bool-val-${f.name}" class="font-bold text-blue-800 text-[11px]">${fStrat.truePct}% true (${100 - fStrat.truePct}% false)</span>
          </div>`;
        } else if (fStrat.generator === 'enum') {
          html += `<div class="space-y-1">
            <label class="block text-[9.5px] text-slate-500 font-semibold">Valeurs &amp; distribution (% somme 100) :</label>
            <div class="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-1.5">`;
          (fStrat.values || []).forEach((item, vIdx) => {
            html += `<div class="flex items-center gap-1 bg-slate-50 p-1 rounded border border-slate-200">
              <span class="${item.isDefault ? 'text-amber-500 font-black' : 'text-slate-300'}" title="Valeur par défaut (double poids)">*</span>
              <input type="text" value="${escapeHtml(item.value)}" onchange="updateFieldStratEnumValue('${f.name}', ${vIdx}, this.value)" class="flex-1 min-w-0 px-1 py-0.2 border border-slate-200 rounded text-[10px] font-mono ${item.isDefault ? 'font-bold text-amber-700' : 'text-slate-700'}" />
              <input type="number" min="0" max="100" value="${item.pct}" onchange="updateFieldStratEnum('${f.name}', ${vIdx}, this.value)" class="w-12 px-1 py-0.2 border border-slate-300 rounded text-[10px] text-center font-bold" />
              <span class="text-[9px] text-slate-500">%</span>
            </div>`;
          });
          html += `</div></div>`;
        } else {
          // string / regex-genex / code
          const isKeyField = f.constraint && (f.constraint.includes('PK') || f.constraint.includes('UK') || f.constraint.includes('FK'));
          if (isKeyField) {
            html += `<div class="grid grid-cols-1 sm:grid-cols-3 gap-2 items-center">
              <div>
                <label class="block text-[9.5px] text-slate-500 font-semibold">Préfixe fixe :</label>
                <input type="text" value="${fStrat.prefix || ''}" onchange="updateFieldStratRegex('${f.name}', 'prefix', this.value)" class="w-full px-2 py-0.5 border border-slate-300 rounded text-xs" />
              </div>
              <div>
                <label class="block text-[9.5px] text-slate-500 font-semibold">Début compteur :</label>
                <input type="number" min="0" value="${fStrat.startNum || 1}" onchange="updateFieldStratRegex('${f.name}', 'startNum', this.value)" class="w-full px-2 py-0.5 border border-slate-300 rounded text-xs" />
              </div>
              <div>
                <label class="block text-[9.5px] text-slate-500 font-semibold">Nb chiffres (padding) :</label>
                <input type="number" min="1" max="10" value="${fStrat.numDigits || 3}" onchange="updateFieldStratRegex('${f.name}', 'numDigits', this.value)" class="w-full px-2 py-0.5 border border-slate-300 rounded text-xs" />
              </div>
            </div>`;
          } else {
            html += `<div class="grid grid-cols-1 sm:grid-cols-2 gap-2 items-center">
              <div>
                <label class="block text-[9.5px] text-slate-500 font-semibold">Préfixe / Valeur texte :</label>
                <input type="text" value="${fStrat.prefix || ''}" onchange="updateFieldStratRegex('${f.name}', 'prefix', this.value)" class="w-full px-2 py-0.5 border border-slate-300 rounded text-xs" />
              </div>
            </div>`;
          }
        }

        html += `</div></div>`;
      });

      container.innerHTML = html;

      // Initialiser la validation des formules existantes et brancher l'autocomplete
      const allModelFields = [];
      Object.values(parsedErd.entities).forEach(e => e.fields.forEach(fld => allModelFields.push({ name: fld.name, comment: fld.comment })));

      ent.fields.forEach(f => {
        const fStrat = strat.fields[f.name];
        if (fStrat && fStrat.mode === 'formula') {
          updateFieldStratFormula(f.name, fStrat.formula || '', false);
          const inp = document.getElementById(`datagen-formula-${f.name}`);
          if (inp) attachFormulaAutocomplete(inp, allModelFields);
        }
      });
    }

    function updateFieldStratMode(fieldName, mode) {
      const g = selections[2] || 'A';
      const { parsedErd } = getOrGenerateCurrentDataset(g);
      const strat = getTableDataStrategy(g, activeDataGenTable, parsedErd);
      if (strat.fields[fieldName]) {
        strat.fields[fieldName].mode = mode;
        saveTableDataStrategy(g, activeDataGenTable, strat);
        renderDataGenFieldsForm();
      }
    }

    function updateFieldStratType(fieldName, newType) {
      const g = selections[2] || 'A';
      const { parsedErd } = getOrGenerateCurrentDataset(g);
      const ent = parsedErd.entities[activeDataGenTable];
      if (!ent) return;
      const strat = getTableDataStrategy(g, activeDataGenTable, parsedErd);
      const f = ent.fields.find(x => x.name === fieldName);
      if (!f) return;
      const prev = strat.fields[fieldName] || {};
      const modifiedField = { ...f, type: newType, comment: f.comment || '' };
      if (newType === 'enum') {
        if (!(modifiedField.comment || '').includes('|')) {
          const seed = (f.comment || '').trim() || 'Valeur 1';
          modifiedField.comment = `*${seed} | Valeur 2`;
        }
      } else {
        modifiedField.comment = (f.comment || '').replace(/\s*\|.*/g, '').trim();
      }
      const def = getDefaultFieldStrategy(modifiedField, activeDataGenTable, parsedErd);
      strat.fields[fieldName] = { ...def, type: newType, mode: prev.mode || 'distrib', formula: prev.formula || '' };
      saveTableDataStrategy(g, activeDataGenTable, strat);
      renderDataGenFieldsForm();
    }

    function updateFieldStratFormula(fieldName, formula, save = true) {
      const g = selections[2] || 'A';
      const { parsedErd } = getOrGenerateCurrentDataset(g);
      const strat = getTableDataStrategy(g, activeDataGenTable, parsedErd);
      if (strat.fields[fieldName] && save) {
        strat.fields[fieldName].formula = formula;
        saveTableDataStrategy(g, activeDataGenTable, strat);
      }
      const errEl = document.getElementById(`datagen-formula-err-${fieldName}`);
      if (errEl) {
        if (!formula.trim()) {
          errEl.textContent = '';
        } else {
          const allFields = [];
          Object.values(parsedErd.entities).forEach(e => e.fields.forEach(f => allFields.push(f.name)));
          const res = validateFormulaSyntax(formula, allFields);
          errEl.textContent = res.valid ? '' : `⚠️ ${res.message}`;
        }
      }
    }

    function updateFieldStratNumber(fieldName, key, val) {
      const g = selections[2] || 'A';
      const { parsedErd } = getOrGenerateCurrentDataset(g);
      const strat = getTableDataStrategy(g, activeDataGenTable, parsedErd);
      if (strat.fields[fieldName]) {
        if (val === '' || val === null || val === undefined) {
          delete strat.fields[fieldName][key];
        } else {
          strat.fields[fieldName][key] = parseFloat(val);
        }
        saveTableDataStrategy(g, activeDataGenTable, strat);
      }
    }

    function updateFieldStratSuffix(fieldName, val) {
      const g = selections[2] || 'A';
      const { parsedErd } = getOrGenerateCurrentDataset(g);
      const strat = getTableDataStrategy(g, activeDataGenTable, parsedErd);
      if (strat.fields[fieldName]) {
        strat.fields[fieldName].suffix = val ? (val.startsWith(' ') ? val : ` ${val}`) : '';
        saveTableDataStrategy(g, activeDataGenTable, strat);
      }
    }

    function updateFieldStratDate(fieldName, key, val) {
      const g = selections[2] || 'A';
      const { parsedErd } = getOrGenerateCurrentDataset(g);
      const strat = getTableDataStrategy(g, activeDataGenTable, parsedErd);
      if (strat.fields[fieldName]) {
        strat.fields[fieldName][key] = val;
        saveTableDataStrategy(g, activeDataGenTable, strat);
      }
    }

    function updateFieldStratBool(fieldName, val) {
      const pct = parseInt(val, 10);
      const g = selections[2] || 'A';
      const { parsedErd } = getOrGenerateCurrentDataset(g);
      const strat = getTableDataStrategy(g, activeDataGenTable, parsedErd);
      if (strat.fields[fieldName]) {
        strat.fields[fieldName].truePct = pct;
        saveTableDataStrategy(g, activeDataGenTable, strat);
      }
      const label = document.getElementById(`bool-val-${fieldName}`);
      if (label) label.textContent = `${pct}% true (${100 - pct}% false)`;
    }

    function updateFieldStratEnum(fieldName, idx, val) {
      const pct = parseInt(val, 10);
      const g = selections[2] || 'A';
      const { parsedErd } = getOrGenerateCurrentDataset(g);
      const strat = getTableDataStrategy(g, activeDataGenTable, parsedErd);
      if (strat.fields[fieldName] && strat.fields[fieldName].values[idx]) {
        strat.fields[fieldName].values[idx].pct = pct;
        saveTableDataStrategy(g, activeDataGenTable, strat);
      }
    }

    function updateFieldStratEnumValue(fieldName, idx, val) {
      const g = selections[2] || 'A';
      const { parsedErd } = getOrGenerateCurrentDataset(g);
      const strat = getTableDataStrategy(g, activeDataGenTable, parsedErd);
      if (strat.fields[fieldName] && strat.fields[fieldName].values[idx]) {
        strat.fields[fieldName].values[idx].value = val;
        saveTableDataStrategy(g, activeDataGenTable, strat);
      }
    }

    function updateFieldStratRegex(fieldName, key, val) {
      const g = selections[2] || 'A';
      const { parsedErd } = getOrGenerateCurrentDataset(g);
      const strat = getTableDataStrategy(g, activeDataGenTable, parsedErd);
      if (strat.fields[fieldName]) {
        strat.fields[fieldName][key] = (key === 'startNum' || key === 'numDigits') ? parseInt(val, 10) : val;
        saveTableDataStrategy(g, activeDataGenTable, strat);
      }
    }

    function restoreDataGenDefaults() {
      const g = selections[2] || 'A';
      const { parsedErd } = getOrGenerateCurrentDataset(g);
      Object.keys(parsedErd.entities).forEach(tName => {
        const storageKey = `maestro_datagen_strat_${g}_${tName}`;
        try { localStorage.removeItem(storageKey); } catch (e) {}
      });
      renderDataGenFieldsForm();
      showToast('↻ Stratégies de génération réinitialisées selon l\'UML');
    }

    function regenerateActiveDataTable() {
      const g = selections[2] || 'A';
      const { parsedErd } = getOrGenerateCurrentDataset(g);
      const randSeed = Math.floor(Math.random() * 1000000) + 1;
      const newDataset = generateModelDataset(g, parsedErd, randSeed);
      currentModelDataset[activeDataGenTable] = newDataset[activeDataGenTable];
      renderStep2DataView();
      showToast(`🎲 Table <b>${activeDataGenTable}</b> regénérée`);
    }

    function regenerateAllDataTables() {
      const g = selections[2] || 'A';
      const randSeed = Math.floor(Math.random() * 1000000) + 1;
      const umlCode = getMermaidSchema(g);
      const parsedErd = parseMermaidErd(umlCode);
      currentModelDataset = generateModelDataset(g, parsedErd, randSeed);
      currentModelParsedErd = parsedErd;
      currentModelGranularity = g;
      renderStep2DataView(true);
      showToast('⚡ Toutes les tables du modèle ont été regénérées');
    }

    function saveDataGenToUml() {
      const g = selections[2] || 'A';
      let updatedUml = getMermaidSchema(g);
      const parsed = parseMermaidErd(updatedUml);
      let totalUpdated = 0;

      Object.keys(parsed.entities).forEach(tName => {
        const strat = getTableDataStrategy(g, tName, parsed);
        const ent = parsed.entities[tName];
        if (!ent) return;

        ent.fields.forEach(f => {
          const fStrat = strat.fields[f.name];
          if (!fStrat) return;
          const opts = {};
          if (fStrat.type && fStrat.type !== f.type) opts.type = fStrat.type;
          if (fStrat.type === 'enum' && fStrat.values && fStrat.values.length) {
            opts.comment = fStrat.values.map(v => (v.isDefault ? '*' : '') + v.value).join(' | ');
          }
          if (opts.type || opts.comment !== undefined) {
            const before = updatedUml;
            updatedUml = setUmlFieldAttributes(updatedUml, tName, f.name, opts);
            if (updatedUml !== before) totalUpdated++;
          }
        });
      });

      if (totalUpdated > 0) {
        saveMermaidSchema(g, updatedUml);
        currentModelDataset = null;
        currentModelParsedErd = null;
        currentModelGranularity = null;
        renderMermaidVisual(g);
        if (schemaViewMode === 'data') {
          try { renderStep2DataView(true); } catch (e) { console.warn('Régénération data échouée après sauvegarde UML :', e); }
        }
        renderDataGenFieldsForm();
        showToast(`📝 ${totalUpdated} champ(s) enregistré(s) dans l'UML du modèle <b>${g}</b>`);
      } else {
        showToast('⚠️ Aucune modification de type à enregistrer dans l\'UML');
      }
    }

    function restoreDataGenSchemaAndData() {
      const g = selections[2] || 'A';
      const { parsedErd } = getOrGenerateCurrentDataset(g);
      Object.keys(parsedErd.entities).forEach(tName => {
        const storageKey = `maestro_datagen_strat_${g}_${tName}`;
        try { localStorage.removeItem(storageKey); } catch (e) {}
      });
      // Réinitialiser le diagramme (custom-aware) et régénérer les données
      resetMermaidSchema();
      renderDataGenFieldsForm();
      showToast('↻ Diagramme et données réinitialisés (modèle ' + g + ')');
    }


    // ===== Modale Création d'un Nouveau Tableau (Étape 2) =====
    function openAddSchemaModal() {
      const modal = document.getElementById('add-schema-modal');
      const titleInput = document.getElementById('custom-schema-title');
      const descInput = document.getElementById('custom-schema-desc');
      const codeInput = document.getElementById('custom-schema-code');
      const errorDiv = document.getElementById('custom-schema-error');
      if (!modal) return;

      if (titleInput) titleInput.value = '';
      if (descInput) descInput.value = '';
      if (codeInput) codeInput.value = `erDiagram\n    TABLE_PRINCIPALE ||--o{ TABLE_SECONDAIRE : "1 vers N"\n    TABLE_PRINCIPALE {\n        string ID_CODE PK "C-2026-001"\n        string NOM_ELEMENT "Module Principal"\n        float QUANTITE "12.0"\n    }\n    TABLE_SECONDAIRE {\n        string ID_SOUS_ELEMENT PK "S-001"\n        string ID_CODE FK "C-2026-001"\n        string DESIGNATION "Pièce associée"\n    }`;
      if (errorDiv) errorDiv.classList.add('hidden');

      modal.classList.remove('hidden');
      if (titleInput) titleInput.focus();
    }

    function closeAddSchemaModal() {
      const modal = document.getElementById('add-schema-modal');
      if (modal) modal.classList.add('hidden');
    }

    function copyAiPromptForCustomSchema() {
      const g = selections[2] || 'A';
      const promptText = generateErdPrompt(g);
      const labelEl = document.getElementById('custom-schema-copy-ai-label');
      copyTextToClipboard(promptText).then(() => {
        if (labelEl) {
          const orig = labelEl.textContent;
          labelEl.textContent = 'Prompt ERD copié !';
          setTimeout(() => labelEl.textContent = orig, 1800);
        }
      });
    }

    function submitCustomSchema() {
      const titleInput = document.getElementById('custom-schema-title');
      const descInput = document.getElementById('custom-schema-desc');
      const codeInput = document.getElementById('custom-schema-code');
      const errorDiv = document.getElementById('custom-schema-error');
      const errorText = document.getElementById('custom-schema-error-text');

      const title = titleInput ? titleInput.value.trim() : '';
      const desc = descInput ? descInput.value.trim() : '';
      let code = codeInput ? codeInput.value.trim() : '';

      const showError = (msg) => {
        if (errorDiv && errorText) {
          errorText.textContent = msg;
          errorDiv.classList.remove('hidden');
        }
      };

      if (!title) {
        showError("Veuillez saisir un titre pour le tableau.");
        if (titleInput) titleInput.focus();
        return;
      }
      if (!code) {
        showError("Veuillez fournir le schéma relationnel Mermaid ERD.");
        if (codeInput) codeInput.focus();
        return;
      }

      code = code.replace(/^```(?:mermaid)?\s*\n?/i, '').replace(/\n?\s*```$/i, '').trim();

      const parsed = parseMermaidErd(code);
      if (Object.keys(parsed.entities).length === 0) {
        showError("Le code Mermaid ne contient aucune entité valide ({ ... }).");
        return;
      }

      const newId = 'custom_' + Date.now();
      const newCustomSchema = {
        id: newId,
        title: title,
        desc: desc || 'Schéma relationnel personnalisé',
        code: code,
        createdAt: Date.now()
      };

      customSchemas.push(newCustomSchema);
      saveCustomSchemas();
      saveMermaidSchema(newId, code);

      renderCustomSchemaOptions();
      selectGranularity(newId);
      closeAddSchemaModal();
      showToast(`✅ Nouveau tableau <b>${title}</b> créé et activé`);
    }

    function renderCustomSchemaOptions() {
      const answersContainer = document.getElementById('step-2-answers');
      if (!answersContainer) return;

      document.querySelectorAll('.custom-schema-card').forEach(el => el.remove());

      customSchemas.forEach(cs => {
        const card = document.createElement('div');
        card.id = `opt-2-${cs.id}`;
        card.className = `custom-schema-card option-card glass-card p-3 rounded-xl border border-slate-200 cursor-pointer flex items-center justify-between gap-3 ${selections[2] === cs.id ? 'active' : ''}`;
        card.onclick = () => selectGranularity(cs.id);

        card.innerHTML = `
          <div class="flex-1 min-w-0">
            <div class="flex items-center justify-between gap-1 mb-1">
              <span class="inline-flex items-center px-1.5 py-0.5 rounded text-[9.5px] font-bold bg-indigo-100 text-indigo-800">Personnalisé</span>
              <button type="button" onclick="event.stopPropagation(); deleteCustomSchema('${cs.id}')" class="text-slate-400 hover:text-red-600 text-xs px-1" title="Supprimer ce tableau">✕</button>
            </div>
            <div class="text-xs md:text-sm font-bold text-slate-900 flex items-center gap-1.5">
              ${cs.title}
            </div>
            <p class="text-[11px] text-slate-600 mt-1 leading-snug">
              ${cs.desc}
            </p>
          </div>
          <div class="w-16 h-16 bg-white rounded-lg p-1.5 border border-slate-200 shadow-sm flex items-center justify-center shrink-0 text-xl font-bold text-indigo-700">
            📊
          </div>
        `;
        answersContainer.appendChild(card);
      });
    }

    function deleteCustomSchema(id) {
      if (!confirm("Voulez-vous vraiment supprimer ce tableau personnalisé ?")) return;
      customSchemas = customSchemas.filter(cs => cs.id !== id);
      saveCustomSchemas();
      try {
        localStorage.removeItem(MERMAID_SCHEMA_STORAGE_KEY_PREFIX + id);
      } catch (e) {}

      if (selections[2] === id) {
        selectGranularity('A');
      } else {
        renderCustomSchemaOptions();
      }
      showToast('🗑️ Tableau personnalisé supprimé');
    }

    // Gestion du basculement entre les vues ui, uml, erd, data
    function toggleSchemaView(view) {
      const svgView = document.getElementById('schema-svg-view');
      const mermaidView = document.getElementById('schema-mermaid-view');
      const promptView = document.getElementById('schema-prompt-view');
      const dataView = document.getElementById('schema-data-view');

      // Normalisation des vues : 'data', 'graph' (anc. mermaid / ui), 'uml', '<>uml' (anc. erd)
      let targetMode = 'data';
      if (view === 'graph' || view === 'mermaid' || view === 'ui') targetMode = 'graph';
      else if (view === 'uml') targetMode = 'uml';
      else if (view === '<>uml' || view === 'erd' || view === 'prompt' || view === '<>' || view === 'ai' || view === 'md') targetMode = '<>uml';
      else if (view === 'data' || view === 'table') targetMode = 'data';
      else targetMode = 'data';

      schemaViewMode = targetMode;
      try {
        localStorage.setItem('maestro_switch_schema', targetMode);
      } catch (e) {}

      if (svgView) svgView.classList.toggle('hidden', targetMode !== 'graph');
      if (mermaidView) mermaidView.classList.toggle('hidden', targetMode !== 'uml');
      if (promptView) promptView.classList.toggle('hidden', targetMode !== '<>uml');
      if (dataView) dataView.classList.toggle('hidden', targetMode !== 'data');

      updateToggleButtons('schema-toggle', targetMode);

      if (targetMode === 'graph') {
        renderMermaidVisual(selections[2] || 'A');
      } else if (targetMode === 'uml') {
        updateMermaidCode(selections[2] || 'A');
        const g = selections[2] || 'A';
        updateSchemaMermaidErrorBadge(validateMermaidErdSyntax(getMermaidSchema(g)));
      } else if (targetMode === '<>uml') {
        updateSchemaPromptView(selections[2] || 'A');
      } else if (targetMode === 'data') {
        renderStep2DataView();
      }
    }


    function openMesureGeneratorModal(step) {
      activeMesureModalStep = step;
      const modal = document.getElementById('mesure-generator-modal');
      const tableSelect = document.getElementById('mesure-table-select');
      const titleEl = document.getElementById('mesure-modal-title');
      const subEl = document.getElementById('mesure-modal-subtitle');
      const badgeEl = document.getElementById('mesure-step-badge');
      if (!modal || !tableSelect) return;

      if (titleEl) {
        titleEl.textContent = `Édition des Mesures & Formules de Calcul - Étape ${step} (SAP IBP)`;
      }
      if (subEl) {
        subEl.textContent = (step === 3)
          ? 'Paramétrez les indicateurs de délai TAT selon les types de champs et formules SAP IBP'
          : 'Paramétrez les indicateurs capacitaires selon les types de champs et formules SAP IBP';
      }
      if (badgeEl) {
        badgeEl.textContent = `Étape ${step}`;
      }

      const umlCode = getStepUmlCode(step);
      const parsed = parseMermaidErd(umlCode);

      tableSelect.innerHTML = '';
      Object.keys(parsed.entities).forEach(tName => {
        const ent = parsed.entities[tName];
        const opt = document.createElement('option');
        opt.value = tName;
        opt.textContent = `${tName} (${ent.label || tName})`;
        tableSelect.appendChild(opt);
      });

      const { tableName: defaultTable } = getStepBaseDataset(step);
      activeMesureModalTable = (parsed.entities[defaultTable]) ? defaultTable : (Object.keys(parsed.entities)[0] || parsed.mainTable);
      tableSelect.value = activeMesureModalTable;

      renderMesureFieldsForm();
      modal.classList.remove('hidden');
    }

    function closeMesureGeneratorModal() {
      const modal = document.getElementById('mesure-generator-modal');
      if (modal) modal.classList.add('hidden');
      hideFormulaAutocomplete();
    }

    function onMesureTableSelectChange(tableName) {
      activeMesureModalTable = tableName;
      renderMesureFieldsForm();
    }

    function renderMesureFieldsForm() {
      const step = activeMesureModalStep;
      const umlCode = getStepUmlCode(step);
      const parsed = parseMermaidErd(umlCode);
      const container = document.getElementById('mesure-fields-container');
      if (!container) return;

      const ent = parsed.entities[activeMesureModalTable];
      if (!ent) return;

      const strat = getStepTableDataStrategy(step, activeMesureModalTable, parsed);

      let html = '';
      ent.fields.forEach(f => {
        const fStrat = strat.fields[f.name] || getDefaultFieldStrategy(f, activeMesureModalTable, parsed);
        const badgeConstraint = f.constraint ? `<span class="px-1 py-0.2 rounded text-[8.5px] font-mono ${f.constraint === 'PK' ? 'bg-amber-100 text-amber-900 border border-amber-300' : 'bg-blue-100 text-blue-900 border border-blue-300'}">${f.constraint}</span>` : '';

        html += `<div class="p-2.5 rounded-lg border border-slate-200 bg-white shadow-2xs space-y-1.5">
          <div class="flex items-center justify-between gap-2 border-b border-slate-100 pb-1">
            <div class="flex items-center gap-1.5">
              <span class="font-bold text-slate-800 text-[11px] font-mono">${f.name}</span>
              ${badgeConstraint}
              <select onchange="updateMesureStratType('${f.name}', this.value)" title="Type de donnée (enregistrable dans l'UML)" class="text-[9.5px] font-mono font-semibold bg-white border border-slate-300 rounded px-1 py-0.5 text-slate-700 cursor-pointer shadow-2xs">
                ${['string', 'int', 'float', 'date', 'boolean', 'enum'].map(t => `<option value="${t}"${(fStrat.type || f.type) === t ? ' selected' : ''}>${t}</option>`).join('')}
              </select>
            </div>
            <span class="text-[9.5px] text-slate-400 italic truncate max-w-[200px]" title="${f.comment || ''}">UML : "${f.comment || '-'}"</span>
          </div>
          <div class="pt-1">`;

        if (fStrat.generator === 'float' || fStrat.generator === 'integer') {
          const isFormulaMode = fStrat.mode === 'formula';
          html += `<div class="space-y-2">
            <div class="flex items-center justify-between">
              <div class="flex items-center rounded border border-slate-200 bg-slate-50 p-0.5 text-[9.5px]">
                <button type="button" onclick="updateMesureStratMode('${f.name}', 'distrib')" class="px-2 py-0.5 rounded font-bold transition ${!isFormulaMode ? 'bg-blue-800 text-white' : 'text-slate-600 hover:bg-slate-200'}">Distribution</button>
                <button type="button" onclick="updateMesureStratMode('${f.name}', 'formula')" class="px-2 py-0.5 rounded font-bold transition ${isFormulaMode ? 'bg-blue-800 text-white' : 'text-slate-600 hover:bg-slate-200'}">Formule</button>
              </div>
              ${isFormulaMode ? `<span id="mesure-formula-err-${f.name}" class="text-[9.5px] font-mono text-red-600 font-semibold truncate max-w-[320px]"></span>` : ''}
            </div>`;
          if (!isFormulaMode) {
            const baseMeanM = fStrat.mean !== undefined ? fStrat.mean : 20;
            const passMin = fStrat.generator === 'float' ? parseFloat((baseMeanM * 0.5).toFixed(1)) : Math.round(baseMeanM * 0.5);
            const passMax = fStrat.generator === 'float' ? parseFloat((baseMeanM * 1.5).toFixed(1)) : Math.round(baseMeanM * 1.5);
            html += `<div class="grid grid-cols-1 sm:grid-cols-4 gap-2 items-center">
              <div>
                <label class="block text-[9.5px] text-slate-500 font-semibold">Min :</label>
                <input type="number" step="${fStrat.generator === 'float' ? '0.1' : '1'}" value="${fStrat.min !== undefined ? fStrat.min : ''}" placeholder="${passMin}" title="Vide : règle ±50 % (borne basse automatique)" onchange="updateMesureStratNumber('${f.name}', 'min', this.value)" class="w-full px-2 py-0.5 border border-slate-300 rounded text-xs" />
              </div>
              <div>
                <label class="block text-[9.5px] text-slate-500 font-semibold">Max :</label>
                <input type="number" step="${fStrat.generator === 'float' ? '0.1' : '1'}" value="${fStrat.max !== undefined ? fStrat.max : ''}" placeholder="${passMax}" title="Vide : règle ±50 % (borne haute automatique)" onchange="updateMesureStratNumber('${f.name}', 'max', this.value)" class="w-full px-2 py-0.5 border border-slate-300 rounded text-xs" />
              </div>
              <div>
                <label class="block text-[9.5px] text-slate-500 font-semibold">Moyenne / Cible :</label>
                <input type="number" step="${fStrat.generator === 'float' ? '0.1' : '1'}" value="${fStrat.mean !== undefined ? fStrat.mean : ''}" onchange="updateMesureStratNumber('${f.name}', 'mean', this.value)" placeholder="${fStrat.mean !== undefined ? '' : '20'}" class="w-full px-2 py-0.5 border border-slate-300 rounded text-xs" />
              </div>
              <div>
                <label class="block text-[9.5px] text-slate-500 font-semibold">Suffixe :</label>
                <input type="text" value="${fStrat.suffix || ''}" onchange="updateMesureStratSuffix('${f.name}', this.value)" class="w-full px-2 py-0.5 border border-slate-300 rounded text-xs" placeholder="ex: j, h, %" />
              </div>
            </div>`;
          } else {
            html += `<div>
              <div class="flex items-center gap-1.5">
                <input type="text" id="mesure-formula-${f.name}" data-formula-field="${f.name}" value="${escapeHtml(fStrat.formula || '')}" placeholder="Ex: SUM(DURATION) + 2.5 ou IF(P50 > 10, P50 * 1.2, P50)" oninput="updateMesureStratFormula('${f.name}', this.value)" class="formula-autocomplete-input flex-1 px-2.5 py-1 font-mono text-xs border border-slate-300 rounded bg-white" />
                <input type="text" value="${fStrat.suffix || ''}" onchange="updateMesureStratSuffix('${f.name}', this.value)" class="w-16 px-2 py-1 border border-slate-300 rounded text-xs" placeholder="suffixe" title="Suffixe" />
              </div>
            </div>`;
          }
          html += `</div>`;
        } else if (fStrat.generator === 'date') {
          html += `<div class="grid grid-cols-1 sm:grid-cols-2 gap-2 items-center">
            <div>
              <label class="block text-[9.5px] text-slate-500 font-semibold">Date Début (intervalle) :</label>
              <input type="date" value="${fStrat.startDate}" onchange="updateMesureStratDate('${f.name}', 'startDate', this.value)" class="w-full px-2 py-0.5 border border-slate-300 rounded text-xs" />
            </div>
            <div>
              <label class="block text-[9.5px] text-slate-500 font-semibold">Date Fin (intervalle) :</label>
              <input type="date" value="${fStrat.endDate}" onchange="updateMesureStratDate('${f.name}', 'endDate', this.value)" class="w-full px-2 py-0.5 border border-slate-300 rounded text-xs" />
            </div>
          </div>`;
        } else if (fStrat.generator === 'boolean') {
          html += `<div class="flex items-center gap-3">
            <label class="text-[10px] text-slate-600 font-semibold">Répartition % True (vs False) :</label>
            <input type="range" min="0" max="100" value="${fStrat.truePct}" oninput="updateMesureStratBool('${f.name}', this.value)" class="w-36 cursor-pointer" />
            <span id="mesure-bool-val-${f.name}" class="font-bold text-blue-800 text-[11px]">${fStrat.truePct}% true (${100 - fStrat.truePct}% false)</span>
          </div>`;
        } else if (fStrat.generator === 'enum') {
          html += `<div class="space-y-1">
            <label class="block text-[9.5px] text-slate-500 font-semibold">Valeurs &amp; distribution (% somme 100) :</label>
            <div class="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-1.5">`;
          (fStrat.values || []).forEach((item, vIdx) => {
            html += `<div class="flex items-center gap-1 bg-slate-50 p-1 rounded border border-slate-200">
              <span class="${item.isDefault ? 'text-amber-500 font-black' : 'text-slate-300'}" title="Valeur par défaut (double poids)">*</span>
              <input type="text" value="${escapeHtml(item.value)}" onchange="updateMesureStratEnumValue('${f.name}', ${vIdx}, this.value)" class="flex-1 min-w-0 px-1 py-0.2 border border-slate-200 rounded text-[10px] font-mono ${item.isDefault ? 'font-bold text-amber-700' : 'text-slate-700'}" />
              <input type="number" min="0" max="100" value="${item.pct}" onchange="updateMesureStratEnum('${f.name}', ${vIdx}, this.value)" class="w-12 px-1 py-0.2 border border-slate-300 rounded text-[10px] text-center font-bold" />
              <span class="text-[9px] text-slate-500">%</span>
            </div>`;
          });
          html += `</div></div>`;
        } else {
          // string / regex-genex / code
          const isKeyField = f.constraint && (f.constraint.includes('PK') || f.constraint.includes('UK') || f.constraint.includes('FK'));
          if (isKeyField) {
            html += `<div class="grid grid-cols-1 sm:grid-cols-3 gap-2 items-center">
              <div>
                <label class="block text-[9.5px] text-slate-500 font-semibold">Préfixe fixe :</label>
                <input type="text" value="${fStrat.prefix || ''}" onchange="updateMesureStratRegex('${f.name}', 'prefix', this.value)" class="w-full px-2 py-0.5 border border-slate-300 rounded text-xs" />
              </div>
              <div>
                <label class="block text-[9.5px] text-slate-500 font-semibold">Début compteur :</label>
                <input type="number" min="0" value="${fStrat.startNum || 1}" onchange="updateMesureStratRegex('${f.name}', 'startNum', this.value)" class="w-full px-2 py-0.5 border border-slate-300 rounded text-xs" />
              </div>
              <div>
                <label class="block text-[9.5px] text-slate-500 font-semibold">Nb chiffres (padding) :</label>
                <input type="number" min="1" max="10" value="${fStrat.numDigits || 3}" onchange="updateMesureStratRegex('${f.name}', 'numDigits', this.value)" class="w-full px-2 py-0.5 border border-slate-300 rounded text-xs" />
              </div>
            </div>`;
          } else {
            html += `<div class="grid grid-cols-1 sm:grid-cols-2 gap-2 items-center">
              <div>
                <label class="block text-[9.5px] text-slate-500 font-semibold">Préfixe / Valeur texte :</label>
                <input type="text" value="${fStrat.prefix || ''}" onchange="updateMesureStratRegex('${f.name}', 'prefix', this.value)" class="w-full px-2 py-0.5 border border-slate-300 rounded text-xs" />
              </div>
            </div>`;
          }
        }

        html += `</div></div>`;
      });

      container.innerHTML = html;

      // Initialiser la validation des formules existantes et brancher l'autocomplete
      const allModelFields = [];
      Object.values(parsed.entities).forEach(e => e.fields.forEach(fld => allModelFields.push({ name: fld.name, comment: fld.comment })));

      ent.fields.forEach(f => {
        const fStrat = strat.fields[f.name];
        if (fStrat && fStrat.mode === 'formula') {
          updateMesureStratFormula(f.name, fStrat.formula || '', false);
          const inp = document.getElementById(`mesure-formula-${f.name}`);
          if (inp) attachFormulaAutocomplete(inp, allModelFields);
        }
      });
    }

    function updateMesureStratMode(fieldName, mode) {
      const step = activeMesureModalStep;
      const umlCode = getStepUmlCode(step);
      const parsed = parseMermaidErd(umlCode);
      const strat = getStepTableDataStrategy(step, activeMesureModalTable, parsed);
      if (strat.fields[fieldName]) {
        strat.fields[fieldName].mode = mode;
        saveStepTableDataStrategy(step, activeMesureModalTable, strat);
        // Synchroniser également avec l'ancien modèle getStepMeasureConfig
        const oldCfg = getStepMeasureConfig(step, fieldName);
        oldCfg.mode = mode;
        saveStepMeasureConfig(step, fieldName, oldCfg);
        renderMesureFieldsForm();
      }
    }

    function updateMesureStratType(fieldName, newType) {
      const step = activeMesureModalStep;
      const umlCode = getStepUmlCode(step);
      const parsed = parseMermaidErd(umlCode);
      const ent = parsed.entities[activeMesureModalTable];
      if (!ent) return;
      const strat = getStepTableDataStrategy(step, activeMesureModalTable, parsed);
      const f = ent.fields.find(x => x.name === fieldName);
      if (!f) return;
      const prev = strat.fields[fieldName] || {};
      const modifiedField = { ...f, type: newType, comment: f.comment || '' };
      if (newType === 'enum') {
        if (!(modifiedField.comment || '').includes('|')) {
          const seed = (f.comment || '').trim() || 'Valeur 1';
          modifiedField.comment = `*${seed} | Valeur 2`;
        }
      } else {
        modifiedField.comment = (f.comment || '').replace(/\s*\|.*/g, '').trim();
      }
      const def = getDefaultFieldStrategy(modifiedField, activeMesureModalTable, parsed);
      strat.fields[fieldName] = { ...def, type: newType, mode: prev.mode || 'distrib', formula: prev.formula || '' };
      saveStepTableDataStrategy(step, activeMesureModalTable, strat);
      renderMesureFieldsForm();
    }

    function updateMesureStratFormula(fieldName, formula, save = true) {
      const step = activeMesureModalStep;
      const umlCode = getStepUmlCode(step);
      const parsed = parseMermaidErd(umlCode);
      const strat = getStepTableDataStrategy(step, activeMesureModalTable, parsed);
      if (strat.fields[fieldName] && save) {
        strat.fields[fieldName].formula = formula;
        saveStepTableDataStrategy(step, activeMesureModalTable, strat);
        const oldCfg = getStepMeasureConfig(step, fieldName);
        oldCfg.formula = formula;
        oldCfg.mode = 'formula';
        saveStepMeasureConfig(step, fieldName, oldCfg);
      }
      const errEl = document.getElementById(`mesure-formula-err-${fieldName}`);
      if (errEl) {
        if (!formula.trim()) {
          errEl.textContent = '';
        } else {
          const allFields = [];
          Object.values(parsed.entities).forEach(e => e.fields.forEach(f => allFields.push(f.name)));
          const res = validateFormulaSyntax(formula, allFields);
          errEl.textContent = res.valid ? '' : `⚠️ ${res.message}`;
        }
      }
    }

    function updateMesureStratNumber(fieldName, key, val) {
      const step = activeMesureModalStep;
      const umlCode = getStepUmlCode(step);
      const parsed = parseMermaidErd(umlCode);
      const strat = getStepTableDataStrategy(step, activeMesureModalTable, parsed);
      if (strat.fields[fieldName]) {
        if (val === '' || val === null || val === undefined) {
          delete strat.fields[fieldName][key];
        } else {
          const num = parseFloat(val);
          strat.fields[fieldName][key] = isNaN(num) ? undefined : num;
        }
        saveStepTableDataStrategy(step, activeMesureModalTable, strat);
        // Synchroniser également avec l'ancien modèle getStepMeasureConfig
        const oldCfg = getStepMeasureConfig(step, fieldName);
        if (strat.fields[fieldName][key] === undefined) {
          delete oldCfg[key];
        } else {
          oldCfg[key] = strat.fields[fieldName][key];
        }
        saveStepMeasureConfig(step, fieldName, oldCfg);
      }
    }

    function updateMesureStratSuffix(fieldName, val) {
      const step = activeMesureModalStep;
      const umlCode = getStepUmlCode(step);
      const parsed = parseMermaidErd(umlCode);
      const strat = getStepTableDataStrategy(step, activeMesureModalTable, parsed);
      if (strat.fields[fieldName]) {
        strat.fields[fieldName].suffix = val ? (val.startsWith(' ') ? val : ` ${val}`) : '';
        saveStepTableDataStrategy(step, activeMesureModalTable, strat);
        const oldCfg = getStepMeasureConfig(step, fieldName);
        oldCfg.suffix = strat.fields[fieldName].suffix;
        saveStepMeasureConfig(step, fieldName, oldCfg);
      }
    }

    function updateMesureStratDate(fieldName, key, val) {
      const step = activeMesureModalStep;
      const umlCode = getStepUmlCode(step);
      const parsed = parseMermaidErd(umlCode);
      const strat = getStepTableDataStrategy(step, activeMesureModalTable, parsed);
      if (strat.fields[fieldName]) {
        strat.fields[fieldName][key] = val;
        saveStepTableDataStrategy(step, activeMesureModalTable, strat);
      }
    }

    function updateMesureStratBool(fieldName, val) {
      const pct = parseInt(val, 10);
      const step = activeMesureModalStep;
      const umlCode = getStepUmlCode(step);
      const parsed = parseMermaidErd(umlCode);
      const strat = getStepTableDataStrategy(step, activeMesureModalTable, parsed);
      if (strat.fields[fieldName]) {
        strat.fields[fieldName].truePct = pct;
        saveStepTableDataStrategy(step, activeMesureModalTable, strat);
      }
      const label = document.getElementById(`mesure-bool-val-${fieldName}`);
      if (label) label.textContent = `${pct}% true (${100 - pct}% false)`;
    }

    function updateMesureStratEnum(fieldName, idx, val) {
      const pct = parseInt(val, 10);
      const step = activeMesureModalStep;
      const umlCode = getStepUmlCode(step);
      const parsed = parseMermaidErd(umlCode);
      const strat = getStepTableDataStrategy(step, activeMesureModalTable, parsed);
      if (strat.fields[fieldName] && strat.fields[fieldName].values[idx]) {
        strat.fields[fieldName].values[idx].pct = pct;
        saveStepTableDataStrategy(step, activeMesureModalTable, strat);
      }
    }

    function updateMesureStratEnumValue(fieldName, idx, val) {
      const step = activeMesureModalStep;
      const umlCode = getStepUmlCode(step);
      const parsed = parseMermaidErd(umlCode);
      const strat = getStepTableDataStrategy(step, activeMesureModalTable, parsed);
      if (strat.fields[fieldName] && strat.fields[fieldName].values[idx]) {
        strat.fields[fieldName].values[idx].value = val;
        saveStepTableDataStrategy(step, activeMesureModalTable, strat);
      }
    }

    function updateMesureStratRegex(fieldName, key, val) {
      const step = activeMesureModalStep;
      const umlCode = getStepUmlCode(step);
      const parsed = parseMermaidErd(umlCode);
      const strat = getStepTableDataStrategy(step, activeMesureModalTable, parsed);
      if (strat.fields[fieldName]) {
        strat.fields[fieldName][key] = (key === 'startNum' || key === 'numDigits') ? parseInt(val, 10) : val;
        saveStepTableDataStrategy(step, activeMesureModalTable, strat);
      }
    }

    function setUmlFieldAttributes(uml, entityName, fieldName, opts = {}) {
      const esc = (s) => s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
      const entRe = new RegExp('^\\s*' + esc(entityName) + '(?:\\s*\\[[^\\]]*\\])?\\s*\\{([\\s\\S]*?)^\\s*\\}', 'm');
      const m = entRe.exec(uml);
      if (!m) return uml;
      const inner = m[1];
      const fieldRe = new RegExp('^(\\s*)(\\*?[A-Za-z_][A-Za-z0-9_]*)(\\s+)(' + esc(fieldName) + ')((?:\\s+(?:PK|FK|UK))?)(?:\\s*"[^"]*")?([ \\t]*)$', 'm');
      if (!fieldRe.test(inner)) return uml;
      const newInner = inner.replace(fieldRe, (mm, sp, oldT, sep, nm, cons, tr) => {
        const typeToken = opts.type ? opts.type : oldT;
        let commentPart = '';
        if (opts.comment !== undefined) {
          commentPart = opts.comment ? ' "' + opts.comment + '"' : '';
        } else {
          const existing = mm.match(/(\s*"[^"]*")\s*$/);
          if (existing) commentPart = existing[1];
        }
        return sp + typeToken + sep + nm + (cons || '') + commentPart + tr;
      });
      const innerStart = m.index + m[0].indexOf(inner);
      return uml.slice(0, innerStart) + newInner + uml.slice(innerStart + inner.length);
    }

    function restoreMesureModal() {
      const step = activeMesureModalStep;
      const opt = selections[step] || 'B';
      const umlCode = getStepUmlCode(step);
      const parsed = parseMermaidErd(umlCode);
      Object.keys(parsed.entities).forEach(tName => {
        const storageKey = `maestro_measure_strat_${step}_${tName}`;
        try { localStorage.removeItem(storageKey); } catch (e) {}
      });
      if ((typeof opt === 'string' && opt.startsWith('custom_m_'))) {
        // Mesure personnalisée : l'UML sauvegardé (cm.uml) est l'état de référence ; seules les règles sont réinitialisées.
      } else {
        try { localStorage.removeItem(`maestro_step_uml_${step}_${opt}`); } catch (e) {}
      }
      if (stepModelDatasets[step]) delete stepModelDatasets[step][`${step}_${opt}`];
      renderMesureFieldsForm();
      renderStepUml(step);
      if (step === 3) renderStep3TablePreview(true);
      else if (step === 5) renderStep5TablePreview(true);
      showToast('↻ Diagramme et règles des mesures réinitialisés (Étape ' + step + ')');
    }

    function saveMesuresToUml() {
      const step = activeMesureModalStep;
      const opt = selections[step] || 'B';
      let updatedUml = getStepUmlCode(step);
      const parsed = parseMermaidErd(updatedUml);
      let totalUpdated = 0;

      Object.keys(parsed.entities).forEach(tName => {
        const strat = getStepTableDataStrategy(step, tName, parsed);
        const ent = parsed.entities[tName];
        if (!ent) return;

        ent.fields.forEach(f => {
          const fStrat = strat.fields[f.name];
          if (!fStrat) return;
          const opts = {};
          if (fStrat.type && fStrat.type !== f.type) opts.type = fStrat.type;
          const hasNumericCtrl = (fStrat.generator === 'float' || fStrat.generator === 'integer');
          if (fStrat.mode === 'formula' && fStrat.formula) {
            opts.comment = fStrat.formula;
          } else if (hasNumericCtrl) {
            opts.comment = `${fStrat.mean}${fStrat.suffix || ''}`;
          } else if (fStrat.generator === 'enum' && fStrat.values && fStrat.values.length) {
            opts.comment = fStrat.values.map(v => (v.isDefault ? '*' : '') + v.value).join(' | ');
          }
          if (opts.type || opts.comment !== undefined) {
            const before = updatedUml;
            updatedUml = setUmlFieldAttributes(updatedUml, tName, f.name, opts);
            if (updatedUml !== before) totalUpdated++;
          }
        });
      });

      if (totalUpdated > 0) {
        saveStepUmlCode(step, updatedUml);
        if (stepModelDatasets[step]) delete stepModelDatasets[step][`${step}_${opt}`];
        renderStepUml(step);
        if (step === 3) renderStep3TablePreview(true);
        else if (step === 5) renderStep5TablePreview(true);
        showToast(`📝 ${totalUpdated} champ(s) enregistré(s) dans l'UML de l'Étape ${step}`);
      } else {
        showToast('⚠️ Aucune modification à enregistrer dans l\'UML');
      }
    }

    function regenerateTableMeasures() {
      const step = activeMesureModalStep;
      const opt = selections[step] || 'B';
      if (stepModelDatasets[step]) delete stepModelDatasets[step][`${step}_${opt}`];
      if (activeMesureModalStep === 3) {
        renderStep3TablePreview(true);
      } else if (activeMesureModalStep === 5) {
        renderStep5TablePreview(true);
      }
      showToast('⚡ Mesures du tableau regénérées avec succès');
    }


    // ===== Moteur Autocomplete Formule et Tooltip Explicatif (Excel-like) =====
    const FORMULA_OPERATORS = [
      { name: 'SUM', insert: 'SUM(', desc: 'SUM(champ)', body: 'Additionne les valeurs de la mesure spécifiée pour la ligne ou dimension.' },
      { name: 'AVG', insert: 'AVG(', desc: 'AVG(champ)', body: 'Calcule la moyenne arithmétique de la métrique numérique.' },
      { name: 'COUNT', insert: 'COUNT(', desc: 'COUNT(champ)', body: 'Compte le nombre total d\'occurrences d\'un attribut ou enregistrement.' },
      { name: 'DISTINCTCOUNT', insert: 'DISTINCTCOUNT(', desc: 'DISTINCTCOUNT(champ)', body: 'Dénombre les valeurs uniques distinctes d\'un identifiant.' },
      { name: 'MIN', insert: 'MIN(', desc: 'MIN(champ)', body: 'Renvoie la valeur minimale observée pour ce champ.' },
      { name: 'MAX', insert: 'MAX(', desc: 'MAX(champ)', body: 'Renvoie la valeur maximale observée pour ce champ.' },
      { name: 'IF', insert: 'IF(', desc: 'IF(condition, valeur_si_vrai, valeur_si_faux)', body: 'Structure conditionnelle permettant d\'ajuster le calcul selon un seuil.' },
      { name: 'AND', insert: 'AND ', desc: 'condition1 AND condition2', body: 'Opérateur logique ET (les deux conditions doivent être vraies).' },
      { name: 'OR', insert: 'OR ', desc: 'condition1 OR condition2', body: 'Opérateur logique OU (au moins une condition vraie).' }
    ];

    let activeAutocompleteTarget = null;
    let activeAutocompleteItems = [];
    let activeAutocompleteIndex = -1;

    function attachFormulaAutocomplete(inputEl, availableFields = []) {
      if (!inputEl || inputEl._hasFormulaAutocomplete) return;
      inputEl._hasFormulaAutocomplete = true;

      // Normalisation des champs disponibles : string -> { name, comment }
      const fields = availableFields.map(f => {
        if (f && typeof f === 'object') return { name: String(f.name || ''), comment: f.comment || '' };
        return { name: String(f || ''), comment: '' };
      });

      inputEl.addEventListener('input', (e) => {
        handleFormulaInputEvent(inputEl, fields);
      });

      inputEl.addEventListener('keydown', (e) => {
        handleFormulaKeydownEvent(e, inputEl);
      });

      inputEl.addEventListener('blur', () => {
        // Laisser le temps à un clic sur le dropdown d'être capturé
        setTimeout(() => {
          hideFormulaAutocomplete();
        }, 220);
      });
    }

    function handleFormulaInputEvent(inputEl, availableFields) {
      const cursorPos = inputEl.selectionStart || 0;
      const textBefore = inputEl.value.substring(0, cursorPos);
      const match = textBefore.match(/([A-Za-z0-9_]+)$/);

      if (!match) {
        hideFormulaAutocomplete();
        return;
      }

      const query = match[1].toUpperCase();
      if (!query || query.length < 1) {
        hideFormulaAutocomplete();
        return;
      }

      // Si le mot tapé correspond exactement à un champ présenté, on ne rouvre pas
      // le dropdown : l'utilisateur peut continuer sa saisie dans la formule.
      if (availableFields.some(f => f.name.toUpperCase() === query)) {
        hideFormulaAutocomplete();
        return;
      }

      const operatorMatches = FORMULA_OPERATORS
        .filter(op => op.name.toUpperCase().startsWith(query))
        .map(op => ({ type: 'op', label: op.name, insert: op.insert, desc: op.desc, body: op.body }));

      const fieldMatches = availableFields
        .filter(f => f.name.toUpperCase().startsWith(query))
        .map(f => ({ type: 'field', label: f.name, insert: f.name, desc: f.comment || 'Champ du modèle UML ERD', body: 'Attribut du modèle UML ERD' }));

      const suggestions = [...operatorMatches, ...fieldMatches];
      if (suggestions.length === 0) {
        hideFormulaAutocomplete();
        return;
      }

      showFormulaAutocomplete(inputEl, suggestions, match[1]);
    }

    function showFormulaAutocomplete(inputEl, suggestions, matchedWord) {
      const drop = document.getElementById('global-formula-autocomplete');
      if (!drop) return;

      activeAutocompleteTarget = inputEl;
      activeAutocompleteItems = suggestions;
      activeAutocompleteIndex = 0;

      const rect = inputEl.getBoundingClientRect();
      drop.style.top = `${rect.bottom + window.scrollY + 4}px`;
      drop.style.left = `${Math.max(8, rect.left + window.scrollX)}px`;

      let html = '';
      suggestions.forEach((s, idx) => {
        const isOp = s.type === 'op';
        html += `<div class="px-3 py-1.5 cursor-pointer flex items-start justify-between gap-2 hover:bg-blue-50 transition autocomplete-item ${idx === 0 ? 'bg-blue-50 text-blue-900 font-bold' : 'text-slate-700'}" data-index="${idx}" onmousedown="selectFormulaAutocompleteItem(${idx}, '${matchedWord}')">
          <div class="flex items-start gap-1.5 min-w-0 flex-1">
            <span class="px-1 py-0.2 rounded text-[8px] font-bold shrink-0 ${isOp ? 'bg-purple-100 text-purple-800' : 'bg-blue-100 text-blue-800'}">${isOp ? 'OP' : 'FLD'}</span>
            <span class="font-mono text-xs break-words whitespace-normal flex-1 min-w-0">${escapeHtml(s.label)}</span>
          </div>
          <span class="text-[9.5px] text-slate-400 italic break-words whitespace-normal text-right max-w-[200px] shrink-0">${escapeHtml(s.desc)}</span>
        </div>`;
      });

      drop.innerHTML = html;
      drop.classList.remove('hidden');
    }

    function hideFormulaAutocomplete() {
      const drop = document.getElementById('global-formula-autocomplete');
      if (drop) drop.classList.add('hidden');
      activeAutocompleteTarget = null;
      activeAutocompleteItems = [];
      activeAutocompleteIndex = -1;
    }

    function selectFormulaAutocompleteItem(idx, matchedWord) {
      const item = activeAutocompleteItems[idx];
      if (!item || !activeAutocompleteTarget) return;

      const input = activeAutocompleteTarget;
      const cursorPos = input.selectionStart || 0;
      const text = input.value;
      const startOfWord = cursorPos - (matchedWord ? matchedWord.length : 0);

      const replacement = item.insert;
      input.value = text.substring(0, startOfWord) + replacement + text.substring(cursorPos);
      const newPos = startOfWord + replacement.length;
      input.selectionStart = input.selectionEnd = newPos;
      input.focus();

      // Déclencher l'événement input
      input.dispatchEvent(new Event('input', { bubbles: true }));

      hideFormulaAutocomplete();
    }

    function handleFormulaKeydownEvent(e, inputEl) {
      const drop = document.getElementById('global-formula-autocomplete');
      if (!drop || drop.classList.contains('hidden') || activeAutocompleteItems.length === 0) return;

      if (e.key === 'ArrowDown') {
        e.preventDefault();
        activeAutocompleteIndex = (activeAutocompleteIndex + 1) % activeAutocompleteItems.length;
        renderAutocompleteSelection();
      } else if (e.key === 'ArrowUp') {
        e.preventDefault();
        activeAutocompleteIndex = (activeAutocompleteIndex - 1 + activeAutocompleteItems.length) % activeAutocompleteItems.length;
        renderAutocompleteSelection();
      } else if (e.key === 'Enter' || e.key === 'Tab') {
        if (activeAutocompleteIndex >= 0 && activeAutocompleteIndex < activeAutocompleteItems.length) {
          e.preventDefault();
          const cursorPos = inputEl.selectionStart || 0;
          const textBefore = inputEl.value.substring(0, cursorPos);
          const match = textBefore.match(/([A-Za-z0-9_]+)$/);
          selectFormulaAutocompleteItem(activeAutocompleteIndex, match ? match[1] : '');
        }
      } else if (e.key === 'Escape') {
        hideFormulaAutocomplete();
      }
    }

    function renderAutocompleteSelection() {
      const drop = document.getElementById('global-formula-autocomplete');
      if (!drop) return;
      const items = drop.querySelectorAll('.autocomplete-item');
      items.forEach((it, idx) => {
        if (idx === activeAutocompleteIndex) {
          it.className = 'px-3 py-1.5 cursor-pointer flex items-start justify-between gap-2 bg-blue-100 text-blue-900 font-bold autocomplete-item';
          it.scrollIntoView({ block: 'nearest' });
        } else {
          it.className = 'px-3 py-1.5 cursor-pointer flex items-start justify-between gap-2 hover:bg-blue-50 text-slate-700 transition autocomplete-item';
        }
      });
    }

    // Modal Création d'une mesure personnalisée (+ Mesure)
    function openAddCustomMeasureModal(step) {
      activeCustomMeasureStep = step;
      const modal = document.getElementById('add-custom-measure-modal');
      const nameInput = document.getElementById('custom-measure-name');
      const labelInput = document.getElementById('custom-measure-label');
      const typeSelect = document.getElementById('custom-measure-type');
      const unitInput = document.getElementById('custom-measure-unit');
      const formulaInput = document.getElementById('custom-measure-formula');
      if (!modal) return;

      if (nameInput) nameInput.value = (step === 3) ? 'TAT_CUSTOM_ESTIMATED' : 'CAPACITE_CUSTOM_PROJ';
      if (labelInput) labelInput.value = (step === 3) ? 'Délai estimé avec marge de sécurité' : 'Capacité projetée personnalisée';
      if (typeSelect) typeSelect.value = 'float';
      if (unitInput) unitInput.value = (step === 3) ? ' h' : ' %';
      if (formulaInput) formulaInput.value = (step === 3) ? 'ESTIMATED_REPAIR_DURATION + 4.0' : 'INTERVENTIONS_PLANIFIEES * 1.1';

      modal.classList.remove('hidden');
    }

    function closeAddCustomMeasureModal() {
      const modal = document.getElementById('add-custom-measure-modal');
      if (modal) modal.classList.add('hidden');
    }

    function submitCustomMeasure() {
      const name = (document.getElementById('custom-measure-name')?.value || '').trim().toUpperCase().replace(/[^A-Z0-9_]/g, '_');
      const label = (document.getElementById('custom-measure-label')?.value || '').trim();
      const type = document.getElementById('custom-measure-type')?.value || 'float';
      const unit = (document.getElementById('custom-measure-unit')?.value || '').trim();
      const formula = (document.getElementById('custom-measure-formula')?.value || '').trim();

      if (!name) {
        alert('Le nom technique de la mesure est requis.');
        return;
      }

      const step = activeCustomMeasureStep;
      const customId = 'custom_m_' + Date.now();
      const baseUml = getStepUmlCode(step);

      const fieldLine = '        ' + type + ' ' + name + ' "' + (formula || ('100' + (unit ? ' ' + unit : ''))) + '"';
      const lines = baseUml.split('\n');
      const braceIdx = lines.findIndex(l => l.includes('}'));
      if (braceIdx !== -1) {
        lines.splice(braceIdx, 0, fieldLine);
      } else {
        lines.push(fieldLine);
      }
      const newUml = lines.join('\n');

      const list = getCustomMeasures(step);
      list.push({
        id: customId,
        name,
        label: label || name,
        type,
        unit,
        formula,
        uml: newUml
      });
      saveCustomMeasures(step, list);

      saveStepMeasureConfig(step, name, {
        mode: formula ? 'formula' : 'distrib',
        mean: 25,
        suffix: unit ? (unit.startsWith(' ') ? unit : ' ' + unit) : '',
        formula
      });

      selections[step] = customId;
      if (stepModelDatasets[step]) delete stepModelDatasets[step][`${step}_${customId}`];
      closeAddCustomMeasureModal();
      toggleTableMode(step, 'uml');
      showToast('✨ Mesure <b>' + name + '</b> créée ! Son modèle UML est désormais éditable.');
    }
