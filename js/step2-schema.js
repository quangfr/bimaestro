// =========================================================================
// Maestro BI - js/step2-schema.js
// Étape 2 : Visualiseur Mermaid, Canvas 2D, Grid.js & Drill-down
// =========================================================================

    function getStepUmlCode(step) {
      const opt = selections[step] || 'B';
      if (typeof opt === 'string' && opt.startsWith('custom_m_')) {
        const list = getCustomMeasures(step);
        const cm = list.find(m => m.id === opt);
        if (cm && cm.uml) return cm.uml;
      }
      const storageKey = `maestro_step_uml_${step}_${opt}`;
      try {
        const saved = localStorage.getItem(storageKey);
        if (saved && saved.trim()) return saved;
      } catch (e) {}
      if (STEP_UML_SCHEMAS[step] && STEP_UML_SCHEMAS[step][opt]) {
        return STEP_UML_SCHEMAS[step][opt];
      }
      return STEP_UML_SCHEMAS[step] ? (STEP_UML_SCHEMAS[step]['B'] || STEP_UML_SCHEMAS[step]['A']) : '';
    }

    function saveStepUmlCode(step, code) {
      const opt = selections[step] || 'B';
      if (typeof opt === 'string' && opt.startsWith('custom_m_')) {
        const list = getCustomMeasures(step);
        const cm = list.find(m => m.id === opt);
        if (cm) {
          cm.uml = code;
          saveCustomMeasures(step, list);
        }
      } else {
        try {
          localStorage.setItem(`maestro_step_uml_${step}_${opt}`, code);

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


        } catch (e) {}
      }
    }

    function renderStepUml(step) {
      const opt = selections[step] || 'B';
      const container = document.getElementById(`step-${step}-mermaid-diagram`);
      const codeArea = document.getElementById(`step-${step}-uml-code`);
      const badge = document.getElementById(`step-${step}-uml-editable-badge`);
      if (!container) return;

      const code = (getStepUmlCode(step) || '').trim();
      const isCustom = typeof opt === 'string' && opt.startsWith('custom_m_');

      if (codeArea && codeArea.value !== code) {
        codeArea.value = code;
      }

      // Validation front de la syntaxe Mermaid ERD avant appel à la librairie
      const vResult = validateMermaidErdSyntax(code);
      if (typeof mermaid === 'undefined') {
        container.innerHTML = '<div class="text-xs text-slate-400 p-4">⏳ Chargement de Mermaid...</div>';
        return;
      }
      if (vResult.errors.length > 0) {
        container.innerHTML = buildUmlErrorHtml(vResult);
        return;
      }

      if (badge) badge.classList.toggle('hidden', !isCustom);

      try {
        if (!window._mermaidInitialized) {
          mermaid.initialize({
            startOnLoad: false,
            theme: 'default',
            securityLevel: 'loose',
            er: { useMaxWidth: true, entityPadding: 15, fontSize: 11 }
          });
          window._mermaidInitialized = true;
        }

        const renderId = `mermaid-step-${step}-${Date.now()}`;
        mermaid.render(renderId, code).then(({ svg }) => {
          container.innerHTML = svg;
          const svgEl = container.querySelector('svg');
          if (svgEl) {
            svgEl.style.maxWidth = '100%';
            svgEl.style.maxHeight = '100%';
            svgEl.style.height = 'auto';
            svgEl.style.display = 'block';
            svgEl.style.margin = 'auto';
            initUmlPanZoom(`step-${step}-mermaid-diagram`);
            applyUmlTransform(`step-${step}-mermaid-diagram`);
          }
        }).catch((err) => {
          console.error(`Step ${step} Mermaid ERD error:`, err);
          container.innerHTML = `<div class="p-3 text-red-600 text-xs font-mono bg-red-50 rounded border border-red-200">⚠️ Erreur de syntaxe Mermaid ERD :<br><pre class="mt-1 whitespace-pre-wrap">${err.message || err}</pre></div>`;
        });
      } catch (e) {
        console.error(`Step ${step} render exception:`, e);
      }
    }

    function onStepUmlChange(step, val) {
      saveStepUmlCode(step, val);
      const savedMsg = document.getElementById(`step-${step}-uml-saved-msg`);
      if (savedMsg) {
        savedMsg.classList.remove('hidden');
        clearTimeout(window['_stepUmlSaved_' + step]);
        window['_stepUmlSaved_' + step] = setTimeout(() => savedMsg.classList.add('hidden'), 1500);
      }
      // Validation des formules du modèle
      const parsed = parseMermaidErd(val);
      const availableFieldNames = [];
      Object.values(parsed.entities).forEach(ent => {
        ent.fields.forEach(f => availableFieldNames.push(f.name));
      });

      // Vérification syntaxe et exactitude
      const opt = selections[step];
      if (typeof opt === 'string' && opt.startsWith('custom_m_')) {
        const list = getCustomMeasures(step);
        const cm = list.find(m => m.id === opt);
        if (cm && cm.formula) {
          const res = validateFormulaSyntax(cm.formula, availableFieldNames);
          if (!res.valid) {
            console.warn(`Formule invalide après édition UML. Fallback valeur 100.`);
            showToast(`⚠️ Formule invalide : fallback valeur 100 appliqué`);
          }
        }
      }

      renderStepUml(step);
      if (step === 3) renderStep3TablePreview();
      else if (step === 5) renderStep5TablePreview();
    }

    function copyStepUml(step) {
      const code = getStepUmlCode(step);
      copyTextToClipboard(code).then(() => {
        showToast(`📋 Modèle UML de l'étape ${step} copié`);
      });
    }

    const MERMAID_SCHEMA_STORAGE_KEY_PREFIX = 'maestro_schema_mermaid_';

    function getMermaidSchema(granularity) {
      const g = granularity || selections[2] || 'A';
      try {
        const saved = localStorage.getItem(MERMAID_SCHEMA_STORAGE_KEY_PREFIX + g);
        if (saved && saved.trim()) return saved;
      } catch (e) {}
      return SCHEMA_MERMAID[g] || SCHEMA_MERMAID.A;
    }

    function saveMermaidSchema(granularity, code) {
      const g = granularity || selections[2] || 'A';
      try {
        localStorage.setItem(MERMAID_SCHEMA_STORAGE_KEY_PREFIX + g, code);
      } catch (e) {}
    }

    function onMermaidCodeChange(val) {
      const g = selections[2] || 'A';
      saveMermaidSchema(g, val);
      const msg = document.getElementById('schema-mermaid-saved-msg');
      if (msg) {
        msg.classList.remove('hidden');
        clearTimeout(window._schemaSavedTimer);
        window._schemaSavedTimer = setTimeout(() => msg.classList.add('hidden'), 1500);
      }

      // Validation front immédiate : blocage du rendu en cas de mauvaise syntaxe
      const vResult = validateMermaidErdSyntax(val);
      updateSchemaMermaidErrorBadge(vResult);
      clearTimeout(window._schemaRenderTimer);
      if (vResult.errors.length > 0) {
        const container = document.getElementById('schema-mermaid-diagram');
        if (container) container.innerHTML = buildUmlErrorHtml(vResult);
        return;
      }

      window._schemaRenderTimer = setTimeout(() => {
        renderMermaidVisual(g);
        // La modification de l'UML régénère le jeu de données (vue "data")
        currentModelDataset = null;
        currentModelParsedErd = null;
        currentModelGranularity = null;
        if (schemaViewMode === 'data') {
          try { renderStep2DataView(true); } catch (e) { console.warn('Régénération data échouée après édition UML :', e); }
        }
      }, 300);
    }

    function resetMermaidSchema() {
      const g = selections[2] || 'A';
      let defaultCode;
      if (g.startsWith('custom_')) {
        const cs = (customSchemas || []).find(c => c.id === g);
        defaultCode = cs ? cs.code : SCHEMA_MERMAID.A;
        saveMermaidSchema(g, defaultCode);
      } else {
        try {
          localStorage.removeItem(MERMAID_SCHEMA_STORAGE_KEY_PREFIX + g);
        } catch (e) {}
        defaultCode = SCHEMA_MERMAID[g] || SCHEMA_MERMAID.A;
      }
      updateMermaidCode(g);
      updateSchemaMermaidErrorBadge(validateMermaidErdSyntax(defaultCode));
      renderMermaidVisual(g);
      currentModelDataset = null;
      currentModelParsedErd = null;
      currentModelGranularity = null;
      if (schemaViewMode === 'data') {
        try { renderStep2DataView(true); } catch (e) {}
      }
      const msg = document.getElementById('schema-mermaid-saved-msg');
      if (msg) {
        msg.textContent = '✓ Réinitialisé';
        msg.classList.remove('hidden');
        clearTimeout(window._schemaSavedTimer);
        window._schemaSavedTimer = setTimeout(() => {
          msg.textContent = '✓ Enregistré';
          msg.classList.add('hidden');
        }, 1500);
      }
      showToast('↻ Modèle <b>' + (g.startsWith('custom_') ? 'Personnalisé' : (g === 'B' ? '2.B' : '2.A')) + '</b> réinitialisé');
    }

    const ERD_GENERIC_PROMPT = `Génère un nouveau diagramme ERD Mermaid à partir du diagramme original ENTRÉE et selon la SORTIE.

ENTRÉE
[Diagramme Mermaid ERD actif]

SORTIE
**Type :** Type de données (ex: \`string\`, \`int\`, \`float\`, \`date\`, \`boolean\` ou \`enum\`). Mettre \`*\` devant si obligatoire à la création (ex: \`*string\`, \`*enum\`).
**Nom :** Nom court et explicite de l'attribut (ex: \`DEMANDEUR\`, \`ENGINE_TYPE\`).
**Contraintes :** \`PK\`, \`FK\`, \`UK\` si applicable.
**Commentaire :** Exemple concret si texte libre, ou liste des valeurs possibles séparées par un tube \`|\` pour le type \`enum\` ou \`boolean\`. Mettre \`*\` sur la valeur par défaut (ex: \`"*true | false"\` ou \`"*Air France (AFR) | Lufthansa (DLH) | Delta Air Lines (DAL)"\`).
**Relations :** Cardinalités Mermaid standard avec libellé débutant par un verbe à l'infinitif.`;

    function updateSchemaPromptView(granularity) {
      const g = granularity || selections[2] || 'A';
      const promptEl = document.getElementById('schema-prompt-code');
      if (promptEl) {
        const activeUml = getMermaidSchema(g);
        promptEl.value = ERD_GENERIC_PROMPT.replace('[Diagramme Mermaid ERD actif]', activeUml);
      }
    }

    function copySchemaPrompt() {
      const promptEl = document.getElementById('schema-prompt-code');
      const btn = document.getElementById('schema-prompt-copy-btn');
      const text = promptEl ? promptEl.value : ERD_GENERIC_PROMPT;
      copyTextToClipboard(text).then(() => {
        if (btn) {
          btn.innerHTML = '<span>✅</span>';
          btn.classList.add('text-emerald-400');
          setTimeout(() => {
            btn.innerHTML = '⧉';
            btn.classList.remove('text-emerald-400');
          }, 1500);
        }
      });
    }

    function updateMermaidCode(granularity) {
      const g = granularity || selections[2] || 'A';
      const codeEl = document.getElementById('schema-mermaid-code');
      if (codeEl) {
        codeEl.value = getMermaidSchema(g);
      }
    }

    function copyMermaidSchema() {
      const codeEl = document.getElementById('schema-mermaid-code');
      const btn = document.getElementById('schema-copy-btn');
      if (!codeEl) return;
      const text = codeEl.value !== undefined ? codeEl.value : codeEl.textContent || '';
      copyTextToClipboard(text).then(() => {
        if (btn) {
          btn.innerHTML = '<span>✅</span>';
          btn.classList.add('text-emerald-600');
          setTimeout(() => {
            btn.innerHTML = '⧉';
            btn.classList.remove('text-emerald-600');
          }, 1800);
        }
      });
    }

    // Validation front-end de la syntaxe Mermaid ERD (bloque le rendu avant la librairie)
    const ERD_ALLOWED_TYPES = ['string', 'int', 'integer', 'float', 'double', 'number', 'boolean', 'bool', 'date', 'datetime', 'time', 'enum'];

    function validateMermaidErdSyntax(umlText) {
      const errors = [];
      const warnings = [];
      const lines = (umlText || '').split('\n');
      let braceDepth = 0;
      let currentEntity = null;

      const relRegex = /^\s*([A-Za-z0-9_]+)\s*(\|\||\|o|o\||o\{|\}o|\}\{|\{\|)\s*--\s*(\|\||\|o|o\||o\{|\}o|\}\{|\{\|)\s*([A-Za-z0-9_]+)\s*(?::\s*"?([^"\n\r]*)"?)?\s*$/;
      const entHeaderRegex = /^\s*([A-Za-z0-9_]+)(?:\s*\["([^"]*)"\])?\s*\{\s*$/;
      const closeRegex = /^\s*\}\s*$/;
      const fieldRegex = /^\s*(\*?[A-Za-z_][A-Za-z0-9_]*)\s+([A-Za-z0-9_]+)(?:\s+(PK|FK|UK))?(?:\s+"([^"]*)")?\s*$/;

      for (let i = 0; i < lines.length; i++) {
        const raw = lines[i];
        const line = raw.trim();
        const lineNo = i + 1;
        if (!line || line.startsWith('%%')) continue;
        if (line === 'erDiagram') continue;

        if (braceDepth > 0 && !line.startsWith('}')) {
          const fMatch = line.match(fieldRegex);
          if (!fMatch) {
            errors.push({ line: lineNo, motif: line, message: 'Champ mal formé — attendu : <type> <NOM> [PK|FK|UK] "commentaire"' });
            continue;
          }
          const fieldType = fMatch[1].replace(/^\*/, '').toLowerCase();
          if (ERD_ALLOWED_TYPES.indexOf(fieldType) === -1) {
            warnings.push({ line: lineNo, motif: line, message: `Type de champ « ${fMatch[1]} » non standard` });
          }
          continue;
        }

        const closeMatch = line.match(closeRegex);
        if (closeMatch) {
          if (braceDepth <= 0) {
            errors.push({ line: lineNo, motif: line, message: 'Accolade fermante } sans bloc { correspondant' });
          } else {
            braceDepth--;
            currentEntity = null;
          }
          continue;
        }

        if (line.match(relRegex)) continue;

        const entMatch = line.match(entHeaderRegex);
        if (entMatch) {
          if ((raw.match(/"/g) || []).length % 2 !== 0) {
            errors.push({ line: lineNo, motif: line, message: 'Guillemet non fermé dans le libellé de l\'entité' });
            continue;
          }
          braceDepth++;
          currentEntity = entMatch[1];
          continue;
        }

        errors.push({ line: lineNo, motif: line, message: 'Syntaxe inconnue (attendu : relation, entité { ... }, champ ou accolade fermante }' });
      }

      if (braceDepth > 0) {
        errors.push({ line: lines.length, motif: '}', message: `Accolade ouvrante { non refermée (${braceDepth} bloc(s) entité à clôturer)` });
      }

      return { errors, warnings };
    }

    function buildUmlErrorHtml(result) {
      const msgs = [];
      (result.errors || []).forEach(e => msgs.push(`Ligne ${e.line} : ${e.message}<br><span class="text-red-500 opacity-70">» ${escapeHtml(e.motif)}</span>`));
      (result.warnings || []).forEach(w => msgs.push(`Avertissement Ligne ${w.line} : ${w.message}<br><span class="text-amber-600 opacity-70">» ${escapeHtml(w.motif)}</span>`));
      return `<div class="p-3 text-red-600 text-xs font-mono bg-red-50 rounded border border-red-200 max-w-full overflow-auto">⚠️ Syntaxe bloquée par validation front (avant Mermaid) :<br><pre class="mt-1 whitespace-pre-wrap">${msgs.join('<br>') || 'Erreur inconnue'}</pre></div>`;
    }

    function updateSchemaMermaidErrorBadge(result) {
      const badge = document.getElementById('schema-mermaid-err');
      if (!badge) return;
      const msgs = [];
      (result.errors || []).forEach(e => msgs.push(`L.${e.line} : ${e.message}`));
      (result.warnings || []).forEach(w => msgs.push(`Avert. L.${w.line} : ${w.message}`));
      if (msgs.length) {
        badge.textContent = msgs.slice(0, 2).join(' • ') + (msgs.length > 2 ? ` (+${msgs.length - 2})` : '');
        badge.title = msgs.join('\n');
        badge.classList.remove('hidden');
        badge.classList.toggle('text-red-600', (result.errors || []).length > 0);
        badge.classList.toggle('text-amber-600', (result.errors || []).length === 0 && (result.warnings || []).length > 0);
      } else {
        badge.textContent = '';
        badge.title = '';
        badge.classList.add('hidden');
      }
    }

    function renderMermaidVisual(granularity) {
      const g = granularity || selections[2] || 'A';
      const container = document.getElementById('schema-mermaid-diagram');
      if (!container) return;
      const code = (getMermaidSchema(g) || SCHEMA_MERMAID.A).trim();

      if (typeof mermaid === 'undefined') {
        container.innerHTML = '<div class="text-xs text-slate-400 p-4">⏳ Chargement de Mermaid...</div>';
        return;
      }

      // Blocage de la mauvaise syntaxe en amont de la librairie Mermaid
      const vResult = validateMermaidErdSyntax(code);
      updateSchemaMermaidErrorBadge(vResult);
      if (vResult.errors.length > 0) {
        container.innerHTML = buildUmlErrorHtml(vResult);
        return;
      }

      try {
        if (!window._mermaidInitialized) {
          mermaid.initialize({
            startOnLoad: false,
            theme: 'default',
            securityLevel: 'loose',
            er: {
              useMaxWidth: true,
              entityPadding: 15,
              fontSize: 11
            }
          });
          window._mermaidInitialized = true;
        }

        const renderId = 'mermaid-render-' + g + '-' + Date.now();
        mermaid.render(renderId, code).then(({ svg }) => {
          container.innerHTML = svg;
          const svgEl = container.querySelector('svg');
          if (svgEl) {
            svgEl.style.maxWidth = '100%';
            svgEl.style.maxHeight = '100%';
            svgEl.style.height = 'auto';
            svgEl.style.display = 'block';
            svgEl.style.margin = 'auto';
            initUmlPanZoom('schema-mermaid-diagram');
            applyUmlTransform('schema-mermaid-diagram');
          }
        }).catch((err) => {
          console.error('Mermaid ERD render error:', err);
          container.innerHTML = '<div class="p-3 text-red-600 text-xs font-mono bg-red-50 rounded border border-red-200">⚠️ Erreur de syntaxe Mermaid ERD :<br><pre class="mt-1 whitespace-pre-wrap">' + (err.message || err) + '</pre></div>';
        });
      } catch (e) {
        console.error('Mermaid render exception:', e);
      }
    }


    // Instance globale Grid.js pour l'Étape 2
    let currentStep2Grid = null;

    // Affichage dynamique de la vue "data" propulsée par Grid.js
    function renderStep2DataView(resetPage = false) {
      const g = selections[2] || 'A';
      const { parsedErd, dataset } = getOrGenerateCurrentDataset(g);

      if (resetPage || !schemaDataState.activeTable || !parsedErd.entities[schemaDataState.activeTable]) {
        schemaDataState.activeTable = parsedErd.mainTable;
        schemaDataState.parentContext = null;
        schemaDataState.page = 1;
      }

      const activeTableName = schemaDataState.activeTable;
      const activeEntity = parsedErd.entities[activeTableName];
      if (!activeEntity) return;

      // Barre d'outils et breadcrumb / selecteur
      const breadcrumbEl = document.getElementById('schema-data-breadcrumb');
      const tableSelectEl = document.getElementById('schema-data-table-select');
      const backBtn = document.getElementById('schema-data-back-btn');
      const filterBadge = document.getElementById('schema-data-filter-badge');

      if (tableSelectEl) {
        const entNames = Object.keys(parsedErd.entities);
        tableSelectEl.innerHTML = entNames.map(tName => {
          const ent = parsedErd.entities[tName];
          const isMain = (tName === parsedErd.mainTable);
          const lbl = `${tName} (${ent.label || (isMain ? 'Table principale' : 'Associée')})`;
          return `<option value="${tName}"${tName === activeTableName ? ' selected' : ''}>${lbl}</option>`;
        }).join('');
      }

      if (breadcrumbEl) {
        breadcrumbEl.textContent = `${activeTableName} (${activeEntity.label || activeTableName})`;
      }

      if (backBtn && filterBadge) {
        if (schemaDataState.parentContext || activeTableName !== parsedErd.mainTable) {
          backBtn.classList.remove('hidden');
          if (schemaDataState.parentContext) {
            filterBadge.classList.remove('hidden');
            filterBadge.textContent = `Filtre : ${schemaDataState.parentContext.filterField} = ${schemaDataState.parentContext.filterValue}`;
          } else {
            filterBadge.classList.add('hidden');
          }
        } else {
          backBtn.classList.add('hidden');
          filterBadge.classList.add('hidden');
        }
      }

      // Filtrer les données si drill-down actif
      let rawRows = (dataset[activeTableName] || []).slice();
      if (schemaDataState.parentContext) {
        const { filterField, filterValue } = schemaDataState.parentContext;
        rawRows = rawRows.filter(r => String(r[filterField]) === String(filterValue));
      }

      // Construction des colonnes Grid.js
      const gridColumns = [];

      // 1. Colonnes des attributs propres de l'entité
      activeEntity.fields.forEach(f => {
        const badgeConstraint = f.constraint ? ` <span class="px-1 py-0.2 rounded text-[8.5px] font-mono ${f.constraint === 'PK' ? 'bg-amber-100 text-amber-900 border border-amber-300' : 'bg-blue-100 text-blue-900 border border-blue-300'}">${f.constraint}</span>` : '';
        const baseWidth = Math.max(105, (f.name.length * 7.5) + (f.constraint ? 45 : 22));
        gridColumns.push({
          id: f.name,
          name: gridjs.html(`<span class="font-bold text-slate-700">${f.name}</span>${badgeConstraint}`),
          width: `${baseWidth}px`,
          sort: true,
          formatter: (cell) => {
            const val = (cell !== undefined && cell !== null) ? String(cell) : '';
            return gridjs.html(`<span class="text-slate-800" title="${val}">${val}</span>`);
          }
        });
      });

      // 2. Colonnes relationnelles déduites du schéma Mermaid
      // - Relations N-1 : première colonne avec nom / libellé
      // - Relations 1-N : compteur cliquable pour drill-down
      const pkField = activeEntity.fields.find(f => f.constraint === 'PK') || activeEntity.fields[0];

      parsedErd.relationships.forEach(rel => {
        if (rel.from === activeTableName) {
          const targetEnt = parsedErd.entities[rel.to];
          if (!targetEnt) return;

          if (rel.is1toN) {
            // 1-N : badge cliquable drill-down vers la table fille
            gridColumns.push({
              id: `__rel_1n_${rel.to}`,
              name: gridjs.html(`<span class="font-bold text-emerald-800">Détail ${targetEnt.label || rel.to}</span>`),
              sort: false,
              formatter: (_, row) => {
                const pkVal = row.cells[0]?.data;
                const targetRows = dataset[rel.to] || [];
                const count = targetRows.filter(tr => String(tr[pkField.name]) === String(pkVal)).length;
                return gridjs.html(`
                  <button type="button" onclick="drillDownToSubTable('${rel.to}', '${pkField.name}', '${pkVal}')" class="px-1.5 py-0.5 rounded bg-emerald-50 hover:bg-emerald-100 text-emerald-800 font-bold border border-emerald-200 text-[10px] cursor-pointer transition inline-flex items-center gap-1 shadow-2xs" title="Voir les détails (${rel.to})">
                    <span>${count} ↗</span>
                  </button>
                `);
              }
            });
          } else {
            // N-1 : affichage d'un libellé significatif (NOM ou 1er non-PK/FK)
            const nomField = targetEnt.fields.find(f => f.name.toUpperCase().includes('NOM') || f.name.toUpperCase().endsWith('_NAME')) ||
                             targetEnt.fields.find(f => f.constraint !== 'PK' && f.constraint !== 'FK') ||
                             targetEnt.fields[0];
            if (nomField) {
              gridColumns.push({
                id: `__rel_n1_${rel.to}_${nomField.name}`,
                name: gridjs.html(`<span class="font-bold text-blue-900">${rel.to} [${nomField.name}]</span>`),
                sort: true,
                formatter: (cell) => gridjs.html(`<span class="font-medium text-blue-900">${cell || '-'}</span>`)
              });
            }
          }
        } else if (rel.to === activeTableName && !rel.is1toN) {
          const parentEnt = parsedErd.entities[rel.from];
          if (parentEnt) {
            const nomField = parentEnt.fields.find(f => f.name.toUpperCase().includes('NOM') || f.name.toUpperCase().endsWith('_NAME')) ||
                             parentEnt.fields.find(f => f.constraint !== 'PK' && f.constraint !== 'FK') ||
                             parentEnt.fields[0];
            if (nomField) {
              gridColumns.push({
                id: `__rel_n1_${rel.from}_${nomField.name}`,
                name: gridjs.html(`<span class="font-bold text-blue-900">${rel.from} [${nomField.name}]</span>`),
                sort: true,
                formatter: (cell) => gridjs.html(`<span class="font-medium text-blue-900">${cell || '-'}</span>`)
              });
            }
          }
        }
      });

      // Construction des lignes de données au format d'objets pour Grid.js
      const gridData = rawRows.map((row, rIdx) => {
        const rowObj = {};
        // Remplir les attributs propres
        activeEntity.fields.forEach(f => {
          rowObj[f.name] = row[f.name] !== undefined ? row[f.name] : '';
        });

        // Remplir les colonnes associées
        parsedErd.relationships.forEach(rel => {
          if (rel.from === activeTableName) {
            if (rel.is1toN) {
              rowObj[`__rel_1n_${rel.to}`] = row[pkField.name];
            } else {
              const targetEnt = parsedErd.entities[rel.to];
              if (targetEnt) {
                const nomField = targetEnt.fields.find(f => f.name.toUpperCase().includes('NOM') || f.name.toUpperCase().endsWith('_NAME')) ||
                                 targetEnt.fields.find(f => f.constraint !== 'PK' && f.constraint !== 'FK') ||
                                 targetEnt.fields[0];
                if (nomField) {
                  const targetRows = dataset[rel.to] || [];
                  const pkInTarget = targetEnt.fields.find(f => f.constraint === 'PK');
                  let displayVal = '-';
                  if (pkInTarget && row[pkInTarget.name] !== undefined) {
                    const matched = targetRows.find(tr => String(tr[pkInTarget.name]) === String(row[pkInTarget.name]));
                    if (matched && matched[nomField.name] !== undefined) displayVal = matched[nomField.name];
                  } else if (targetRows.length > 0) {
                    const matched = targetRows[rIdx % targetRows.length];
                    if (matched && matched[nomField.name] !== undefined) displayVal = matched[nomField.name];
                  }
                  rowObj[`__rel_n1_${rel.to}_${nomField.name}`] = displayVal;
                }
              }
            }
          } else if (rel.to === activeTableName && !rel.is1toN) {
            const parentEnt = parsedErd.entities[rel.from];
            if (parentEnt) {
              const nomField = parentEnt.fields.find(f => f.name.toUpperCase().includes('NOM') || f.name.toUpperCase().endsWith('_NAME')) ||
                               parentEnt.fields.find(f => f.constraint !== 'PK' && f.constraint !== 'FK') ||
                               parentEnt.fields[0];
              if (nomField) {
                const parentRows = dataset[rel.from] || [];
                const pkInParent = parentEnt.fields.find(f => f.constraint === 'PK');
                let displayVal = '-';
                if (pkInParent && row[pkInParent.name] !== undefined) {
                  const matched = parentRows.find(tr => String(tr[pkInParent.name]) === String(row[pkInParent.name]));
                  if (matched && matched[nomField.name] !== undefined) displayVal = matched[nomField.name];
                } else if (parentRows.length > 0) {
                  const matched = parentRows[rIdx % parentRows.length];
                  if (matched && matched[nomField.name] !== undefined) displayVal = matched[nomField.name];
                }
                rowObj[`__rel_n1_${rel.from}_${nomField.name}`] = displayVal;
              }
            }
          }
        });

        return rowObj;
      });

      // Conteneur DOM
      const wrapper = document.getElementById('schema-data-table-wrapper');
      if (!wrapper) return;
      wrapper.innerHTML = '';

      // Destruction de l'ancienne instance Grid.js si existante
      if (currentStep2Grid) {
        try {
          currentStep2Grid.destroy();
        } catch (e) {}
        currentStep2Grid = null;
      }

      // Initialisation du tableau Grid.js
      currentStep2Grid = new gridjs.Grid({
        columns: gridColumns,
        data: gridData,
        sort: true,
        resizable: true,
        pagination: {
          limit: 10,
          summary: true
        },
        language: {
          pagination: {
            previous: 'Préc.',
            next: 'Suiv.',
            navigate: (page, pages) => `Page ${page} sur ${pages}`,
            page: (page) => `Page ${page}`,
            showing: 'Affichage de',
            of: 'sur',
            to: 'à',
            results: 'enregistrements (10 par page)'
          },
          loading: 'Chargement des données...',
          noRecordsFound: 'Aucun enregistrement disponible',
          error: 'Erreur de chargement'
        }
      });

      currentStep2Grid.render(wrapper);
    }

    function drillDownToSubTable(subTable, filterField, filterValue) {
      schemaDataState.parentContext = {
        table: schemaDataState.activeTable,
        filterField,
        filterValue
      };
      schemaDataState.activeTable = subTable;
      schemaDataState.page = 1;
      renderStep2DataView();
    }

    function drillBackToMainTable() {
      if (schemaDataState.parentContext) {
        schemaDataState.activeTable = schemaDataState.parentContext.table;
        schemaDataState.parentContext = null;
        schemaDataState.page = 1;
        renderStep2DataView();
      } else {
        const g = selections[2] || 'A';
        const { parsedErd } = getOrGenerateCurrentDataset(g);
        schemaDataState.activeTable = parsedErd.mainTable;
        schemaDataState.page = 1;
        renderStep2DataView();
      }
    }


    function drawSchema(granularity) {
      renderMermaidVisual(granularity);
      updateMermaidCode(granularity);
      updateSchemaPromptView(granularity);
      if (schemaViewMode === 'data') {
        renderStep2DataView(true);
      }
      const canvas = document.getElementById('schemaCanvas');
      if (!canvas || !canvas.getContext) return;
      const ctx = canvas.getContext('2d');
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      // Définition rigoureuse du modèle dimensionnel selon la granularité
      let schemaModel = {};

      if (granularity === 'A') {
        schemaModel = {
          fact: {
            title: "MDT_MAINTENANCE_REQUEST",
            sub: "Grain : ID_DEMANDE + ENGINE_TYPE + DEMANDEUR",
            grainColor: "#3b82f6",
            rows: [
              { type: 'PK', name: 'ID_DEMANDE', desc: 'Clé primaire dossier (D-2026-000123)' },
              { type: 'A',  name: 'DEMANDEUR_NAME', desc: 'Compagnie cliente (EZY, AFR, ACH, RYA)' },
              { type: 'A',  name: 'DATE_DEMANDE', desc: 'Date d\'émission de la demande' },
              { type: 'A',  name: 'PROGRAMME_MOTEUR', desc: 'Famille globale (CFM56, LEAP)' },
              { type: 'A',  name: 'ENGINE_TYPE', desc: 'Modèle exact (CFM56-5B, LEAP-1A)' },
              { type: 'A',  name: 'NIVEAU_URGENCE_GLOBAL', desc: 'Criticité (Haute AOG, Moyenne, Basse)' },
              { type: 'A',  name: 'COMMENTAIRE_GLOBAL', desc: 'Contexte dépose & antécédents' },
              { type: 'M',  name: 'INTERVENTION_COUNT', desc: 'COUNT(ID_INTERVENTION) actives' },
              { type: 'M',  name: 'URGENCY_WEIGHT', desc: 'Poids algo ordonnancement' },
              { type: 'M',  name: 'TOTAL_ENGINE_TAT', desc: 'TAT global consolidé dossier (j)' }
            ]
          },
          dims: [
            {
              title: "lignes (MDT_INTERVENTION)", icon: "🔧", color: "#10b981", x: 10, y: 10, w: 172, h: 106,
              rows: [
                { type: 'PK', name: 'ID_INTERVENTION', desc: 'Opération unitaire (I-2026-000123-01)' },
                { type: 'A',  name: 'TYPE_REPARATION', desc: 'T-INSCND, T-AUBTUR...' },
                { type: 'A',  name: 'SHOP_NAME', desc: 'Shop SAE (S-MON, S-VIL...)' },
                { type: 'A',  name: 'INTERVENTION_TAT', desc: 'TAT unitaire de la ligne' }
              ]
            },
            {
              title: "contrats (CONTRACT_SLA)", icon: "📜", color: "#8b5cf6", x: 458, y: 10, w: 172, h: 106,
              rows: [
                { type: 'PK', name: 'ID_CONTRAT', desc: 'Accord cadre client' },
                { type: 'A',  name: 'DEMANDEUR_NAME', desc: 'Compagnie cliente liée' },
                { type: 'A',  name: 'SLA_CIBLE_JOURS', desc: 'Engagement TAT convenu' },
                { type: 'A',  name: 'PENALITE_JOUR_EUR', desc: 'Taux pénalité journalière' }
              ]
            },
            {
              title: "profil temps (TIMEPROFILE)", icon: "📅", color: "#ec4899", x: 458, y: 244, w: 172, h: 106,
              rows: [
                { type: 'PK', name: 'ID_PERIOD', desc: 'Semaine / Mois fiscal' },
                { type: 'A',  name: 'START_DATE', desc: 'Date début période' },
                { type: 'A',  name: 'END_DATE', desc: 'Date fin période' },
                { type: 'A',  name: 'IS_WORKING_DAY', desc: 'Jour ouvré SAE' }
              ]
            },
            {
              title: "types moteurs (ENGINE_REF)", icon: "✈️", color: "#0284c7", x: 10, y: 126, w: 172, h: 108,
              rows: [
                { type: 'PK', name: 'ENGINE_TYPE', desc: 'Variante répertoriée OEM' },
                { type: 'A',  name: 'PROGRAMME', desc: 'Famille CFM56 / LEAP / GE90' },
                { type: 'A',  name: 'FABRICANT', desc: 'CFM Intl / SAE / GE' },
                { type: 'A',  name: 'POUSSÉE_KN', desc: 'Plage poussée certifiée' }
              ]
            },
            {
              title: "clients & flottes (CUSTOMER)", icon: "🏢", color: "#f59e0b", x: 10, y: 244, w: 172, h: 106,
              rows: [
                { type: 'PK', name: 'DEMANDEUR_NAME', desc: 'Compagnie aérienne / Opérateur' },
                { type: 'A',  name: 'PAYS_BASE', desc: 'Hub opérationnel principal' },
                { type: 'A',  name: 'STATUT_COMPTE', desc: 'Key Account / Standard' },
                { type: 'A',  name: 'CONTACT_TECH', desc: 'CAMO / Support Flotte' }
              ]
            }
          ]
        };
      } else {
        // Granularité B : Niveau Interventions & Planification d'Atelier (MDT_INTERVENTION)
        schemaModel = {
          fact: {
            title: "MDT_INTERVENTION",
            sub: "Grain : ID_DEMANDE + ID_INTERVENTION + STATION",
            grainColor: "#10b981",
            rows: [
              { type: 'PK', name: 'ID_DEMANDE', desc: 'Clé composite 1/2 (D-2026-000123)' },
              { type: 'PK', name: 'ID_INTERVENTION', desc: 'Clé composite 2/2 (I-2026-000123-01)' },
              { type: 'A',  name: 'TYPE_REPARATION', desc: 'T-INSCND, T-AUBTUR, T-MAJLOU...' },
              { type: 'FK', name: 'STATION_NAME', desc: '-> STATION (S-XXX-YY)' },
              { type: 'FK', name: 'SHOP_NAME', desc: '-> SHOP (S-XXX)' },
              { type: 'A',  name: 'DONNEES_TECHNIQUES', desc: 'Réf rapport inspection' },
              { type: 'M',  name: 'ESTIMATED_REPAIR_DURATION', desc: 'Durée standard gamme (h)' },
              { type: 'M',  name: 'SHOP_QUEUE_TIME', desc: 'Attente station & shop (h)' },
              { type: 'M',  name: 'INTERVENTION_TAT', desc: 'TAT unitaire cumulé (h)' }
            ]
          },
          dims: [
            {
              title: "en-tête (MDT_MAINTENANCE_REQ)", icon: "📁", color: "#1e40af", x: 10, y: 10, w: 172, h: 106,
              rows: [
                { type: 'PK', name: 'ID_DEMANDE', desc: 'Dossier parent' },
                { type: 'A',  name: 'DEMANDEUR_NAME', desc: 'Compagnie donneuse d\'ordre' },
                { type: 'A',  name: 'ENGINE_TYPE', desc: 'Modèle exact propulseur' },
                { type: 'A',  name: 'NIVEAU_URGENCE_GLOBAL', desc: 'Criticité globale (AOG)' }
              ]
            },
            {
              title: "ateliers & sites (SHOP)", icon: "🏭", color: "#f59e0b", x: 458, y: 10, w: 172, h: 106,
              rows: [
                { type: 'PK', name: 'SHOP_NAME', desc: 'Site SAE (S-XXX, 10 sites)' },
                { type: 'A',  name: 'NB_STATIONS', desc: '3 à 10 stations par shop' },
                { type: 'A',  name: 'CAPACITE_HEBDO', desc: 'Heures dispo globales' }
              ]
            },
            {
              title: "stations (STATION)", icon: "🤖", color: "#8b5cf6", x: 10, y: 244, w: 172, h: 106,
              rows: [
                { type: 'PK', name: 'STATION_NAME', desc: 'Format S-XXX-YY (3-10 / shop)' },
                { type: 'A',  name: 'SHOP_NAME', desc: 'Shop parent (S-XXX)' },
                { type: 'A',  name: 'SEUIL_SATURATION', desc: 'Seuil critique 85%' }
              ]
            },
            {
              title: "profil temps (TIMEPROFILE)", icon: "⏱️", color: "#ec4899", x: 458, y: 244, w: 172, h: 106,
              rows: [
                { type: 'PK', name: 'ID_PERIOD', desc: 'Période calendaire (Jour/Sem)' },
                { type: 'A',  name: 'DATE_DEBUT', desc: 'Début créneau planification' },
                { type: 'A',  name: 'DATE_FIN', desc: 'Fin créneau planification' },
                { type: 'A',  name: 'IS_WORKING_DAY', desc: 'Jour ouvré MRO' }
              ]
            },
            {
              title: "gammes (DUREE_STANDARDS)", icon: "⭐", color: "#0284c7", x: 10, y: 126, w: 172, h: 108,
              rows: [
                { type: 'PK', name: 'ENGINE_TYPE', desc: 'Modèle moteur (CFM, LEAP)' },
                { type: 'PK', name: 'TYPE_REPARATION', desc: 'T-INSCND, T-AUBTUR...' },
                { type: 'A',  name: 'DUREE_STANDARD_H', desc: '⏱️ Temps gamme constructeur' },
                { type: 'A',  name: 'REVISION_VERSION', desc: 'Indice manuel OEM' }
              ]
            }
          ]
        };
      }

      // 1. Dessin des liaisons relationnelles avec cardinalités 1 : N
      const factBox = { x: 218, y: 14, w: 204, h: 332 };

      schemaModel.dims.forEach(dim => {
        // Points d'ancrage
        let startX, startY, endX, endY, card1X, card1Y, cardNX, cardNY;

        if (dim.x < factBox.x) {
          // Dimension à gauche
          startX = dim.x + dim.w;
          startY = dim.y + dim.h / 2;
          endX = factBox.x;
          if (dim.y < 90) {
            endY = factBox.y + 55;
          } else if (dim.y < 200) {
            endY = factBox.y + 160;
          } else {
            endY = factBox.y + factBox.h - 55;
          }
          card1X = startX + 12;
          card1Y = startY - 6;
          cardNX = endX - 18;
          cardNY = endY - 6;
        } else {
          // Dimension à droite
          startX = dim.x;
          startY = dim.y + dim.h / 2;
          endX = factBox.x + factBox.w;
          endY = dim.y < 150 ? factBox.y + 75 : factBox.y + factBox.h - 75;
          card1X = startX - 18;
          card1Y = startY - 6;
          cardNX = endX + 8;
          cardNY = endY - 6;
        }

        ctx.beginPath();
        ctx.moveTo(startX, startY);
        ctx.bezierCurveTo((startX + endX)/2, startY, (startX + endX)/2, endY, endX, endY);
        ctx.strokeStyle = '#94a3b8';
        ctx.lineWidth = 1.8;
        ctx.stroke();

        // Flèche / Crow's foot vers la table de faits (côté N)
        ctx.beginPath();
        if (dim.x < factBox.x) {
          ctx.moveTo(endX - 8, endY - 6);
          ctx.lineTo(endX, endY);
          ctx.lineTo(endX - 8, endY + 6);
        } else {
          ctx.moveTo(endX + 8, endY - 6);
          ctx.lineTo(endX, endY);
          ctx.lineTo(endX + 8, endY + 6);
        }
        ctx.strokeStyle = dim.color;
        ctx.lineWidth = 2;
        ctx.stroke();

        // Badge Cardinalité '1' côté dimension
        ctx.fillStyle = '#059669';
        ctx.font = 'bold 11px sans-serif';
        ctx.textAlign = 'center';
        ctx.fillText("1", card1X, card1Y);

        // Badge Cardinalité 'N' côté fait
        ctx.fillStyle = '#1e40af';
        ctx.font = 'bold 11px sans-serif';
        ctx.textAlign = 'center';
        ctx.fillText("N", cardNX, cardNY);
      });

      // 2. Dessin de la Table de Faits Centrale (style table relationnelle Power BI)
      ctx.save();
      // Ombre portée douce
      ctx.shadowColor = 'rgba(0, 0, 0, 0.08)';
      ctx.shadowBlur = 10;
      ctx.fillStyle = '#ffffff';
      ctx.strokeStyle = schemaModel.fact.grainColor;
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.roundRect(factBox.x, factBox.y, factBox.w, factBox.h, 8);
      ctx.fill();
      ctx.stroke();
      ctx.restore();

      // En-tête de la table de faits
      ctx.fillStyle = schemaModel.fact.grainColor;
      ctx.beginPath();
      ctx.roundRect(factBox.x, factBox.y, factBox.w, 36, [8, 8, 0, 0]);
      ctx.fill();

      ctx.fillStyle = '#ffffff';
      ctx.font = 'bold 11.5px sans-serif';
      ctx.textAlign = 'center';
      ctx.fillText(schemaModel.fact.title, factBox.x + factBox.w / 2, factBox.y + 17);

      ctx.fillStyle = '#eff6ff';
      ctx.font = '9px sans-serif';
      ctx.fillText("TABLE DE FAITS CENTRALE", factBox.x + factBox.w / 2, factBox.y + 29);

      // Sous-titre grain
      ctx.fillStyle = '#f1f5f9';
      ctx.fillRect(factBox.x, factBox.y + 36, factBox.w, 18);
      ctx.fillStyle = '#475569';
      ctx.font = 'italic 8.5px sans-serif';
      ctx.textAlign = 'center';
      ctx.fillText(schemaModel.fact.sub, factBox.x + factBox.w / 2, factBox.y + 48);

      // Lignes d'attributs de la table de faits
      let curY = factBox.y + 58;
      const rowHeight = 29;

      schemaModel.fact.rows.forEach((row, i) => {
        ctx.fillStyle = (i % 2 === 0) ? '#f8fafc' : '#ffffff';
        ctx.fillRect(factBox.x + 1, curY - 2, factBox.w - 2, rowHeight);

        // Badge Type (PK / FK / SAISIE / M)
        let badgeColor = '#1e40af';
        let badgeText = 'FK';
        if (row.type === 'PK') {
          badgeColor = '#d97706';
          badgeText = 'PK';
        } else if (row.type === 'M') {
          badgeColor = '#7c3aed';
          badgeText = '📐';
        } else if (row.type === 'A') {
          badgeColor = '#059669';
          badgeText = 'ATTR';
        }

        ctx.fillStyle = badgeColor;
        ctx.font = 'bold 8.5px monospace';
        ctx.textAlign = 'left';
        ctx.fillText(badgeText, factBox.x + 4, curY + 11);

        // Nom du champ
        ctx.fillStyle = (row.type === 'M') ? '#4c1d95' : (row.type === 'PK' ? '#92400e' : (row.type === 'A' ? '#065f46' : '#1d4ed8'));
        ctx.font = (row.type === 'PK' || row.type === 'M') ? 'bold 10px monospace' : '9.5px monospace';
        ctx.fillText(row.name, factBox.x + 30, curY + 11);

        // Description / Relation
        ctx.fillStyle = '#64748b';
        ctx.font = '8px sans-serif';
        ctx.fillText(row.desc, factBox.x + 28, curY + 22);

        curY += rowHeight;
      });

      // 3. Dessin des Tables de Dimensions (style Power BI exact)
      schemaModel.dims.forEach(dim => {
        ctx.save();
        ctx.shadowColor = 'rgba(0, 0, 0, 0.06)';
        ctx.shadowBlur = 8;
        ctx.fillStyle = '#ffffff';
        ctx.strokeStyle = dim.color;
        ctx.lineWidth = 1.6;
        ctx.beginPath();
        ctx.roundRect(dim.x, dim.y, dim.w, dim.h, 6);
        ctx.fill();
        ctx.stroke();
        ctx.restore();

        // En-tête Dimension
        ctx.fillStyle = dim.color;
        ctx.beginPath();
        ctx.roundRect(dim.x, dim.y, dim.w, 22, [6, 6, 0, 0]);
        ctx.fill();

        ctx.fillStyle = '#ffffff';
        ctx.font = 'bold 9.5px sans-serif';
        ctx.textAlign = 'left';
        ctx.fillText(`${dim.icon} ${dim.title}`, dim.x + 6, dim.y + 15);

        // Lignes d'attributs de la dimension
        let dY = dim.y + 26;
        dim.rows.forEach((r, idx) => {
          ctx.fillStyle = (idx % 2 === 0) ? '#f8fafc' : '#ffffff';
          ctx.fillRect(dim.x + 1, dY - 1, dim.w - 2, 19);

          if (r.type === 'PK') {
            ctx.fillStyle = '#d97706';
            ctx.font = 'bold 8px monospace';
            ctx.textAlign = 'left';
            ctx.fillText("PK", dim.x + 4, dY + 8);

            ctx.fillStyle = '#92400e';
            ctx.font = 'bold 8.5px monospace';
            ctx.fillText(r.name, dim.x + 20, dY + 8);
          } else {
            ctx.fillStyle = '#94a3b8';
            ctx.font = '7.5px monospace';
            ctx.textAlign = 'left';
            ctx.fillText("•", dim.x + 5, dY + 8);

            ctx.fillStyle = '#334155';
            ctx.font = '8.5px sans-serif';
            ctx.fillText(r.name, dim.x + 14, dY + 8);
          }

          ctx.fillStyle = '#64748b';
          ctx.font = '7px sans-serif';
          ctx.fillText(r.desc, dim.x + 14, dY + 16);

          dY += 20;
        });
      });

      updateMermaidCode(granularity);
    }
