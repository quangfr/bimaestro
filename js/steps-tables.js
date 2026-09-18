// =========================================================================
// Maestro BI - js/steps-tables.js
// Étapes 3 & 5 : Tableaux de Données Grid.js, Drilldowns & Sélecteurs
// =========================================================================

    // ===== Rendu du Tableau de l'Étape 3 avec Grid.js =====
    function renderStep3TablePreview(resetPage = false) {
      const q2 = selections[2] || 'A';
      const q3 = selections[3] || 'B';

      const titleEl = document.getElementById('step3-table-title');
      const badgeEl = document.getElementById('step3-combo-badge');
      const container = document.getElementById('step3-table-container');
      if (!container) return;

      const granCapTableNames = {
        'A': 'MDT_MAINTENANCE_REQUEST (Consolidation Demande)',
        'B': 'MDT_INTERVENTION (Lignes d\'Atelier)'
      };

      if (titleEl) {
        titleEl.innerHTML = '📋 Extrait de la table centrale <span class="font-mono text-blue-800 font-bold ml-1">' + granCapTableNames[q2] + '</span>';
      }
      if (badgeEl) {
        badgeEl.textContent = granCapTableNames[q2] + ' + Méthode 3.' + q3;
      }

      const { parsedErd, dataset } = getOrGenerateStepDataset(3);

      if (resetPage || !step3DataState.activeTable || !parsedErd.entities[step3DataState.activeTable]) {
        step3DataState.activeTable = parsedErd.mainTable || Object.keys(parsedErd.entities)[0];
        step3DataState.parentContext = null;
        step3DataState.page = 1;
      }

      const activeTableName = step3DataState.activeTable;
      const activeEntity = parsedErd.entities[activeTableName];
      if (!activeEntity) return;

      // Barre d'outils et sélecteur / fil d'Ariane / retour
      const tableSelectEl = document.getElementById('step-3-data-table-select');
      const breadcrumbEl = document.getElementById('step-3-data-breadcrumb');
      const backBtn = document.getElementById('step-3-data-back-btn');
      const filterBadge = document.getElementById('step-3-data-filter-badge');

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
        if (step3DataState.parentContext || activeTableName !== parsedErd.mainTable) {
          backBtn.classList.remove('hidden');
          if (step3DataState.parentContext) {
            filterBadge.classList.remove('hidden');
            filterBadge.textContent = `Filtre : ${step3DataState.parentContext.filterField} = ${step3DataState.parentContext.filterValue}`;
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
      if (step3DataState.parentContext) {
        const { filterField, filterValue } = step3DataState.parentContext;
        rawRows = rawRows.filter(r => String(r[filterField]) === String(filterValue));
      }

      // Construction des colonnes Grid.js
      const gridColumns = [];

      // 1. Colonnes des attributs propres de l'entité
      activeEntity.fields.forEach((f, idx) => {
        const badgeConstraint = f.constraint ? ` <span class="px-1 py-0.2 rounded text-[8.5px] font-mono ${f.constraint === 'PK' ? 'bg-amber-100 text-amber-900 border border-amber-300' : 'bg-blue-100 text-blue-900 border border-blue-300'}">${f.constraint}</span>` : '';
        const baseW = Math.max(105, (f.name.length * 7.5) + (f.constraint ? 45 : 22));
        const isCalc = idx >= activeEntity.fields.length - 2;

        gridColumns.push({
          id: f.name,
          name: gridjs.html(`<span class="font-bold text-slate-700">${f.name}</span>${badgeConstraint}`),
          width: `${baseW}px`,
          sort: true,
          formatter: (cell) => {
            const val = (cell !== undefined && cell !== null) ? String(cell) : '';
            if (isCalc) {
              return gridjs.html('<span class="text-blue-800 font-bold font-mono">' + escapeHtml(val) + '</span>');
            }
            if (idx === 0) {
              return gridjs.html('<span class="text-slate-600 font-semibold font-mono">' + escapeHtml(val) + '</span>');
            }
            return gridjs.html(`<span class="text-slate-800" title="${escapeHtml(val)}">${escapeHtml(val)}</span>`);
          }
        });
      });

      // 2. Colonnes relationnelles déduites du schéma Mermaid
      // - Relations N-1 : colonne avec nom / libellé
      // - Relations 1-N : compteur cliquable drill-down
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
                  <button type="button" onclick="drillDownToStepTable(3, '${rel.to}', '${pkField.name}', '${pkVal}')" class="px-1.5 py-0.5 rounded bg-emerald-50 hover:bg-emerald-100 text-emerald-800 font-bold border border-emerald-200 text-[10px] cursor-pointer transition inline-flex items-center gap-1 shadow-2xs" title="Voir les détails (${rel.to})">
                    <span>${count} ↗</span>
                  </button>
                `);
              }
            });
          } else {
            // N-1 : affichage d'un libellé significatif
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
        activeEntity.fields.forEach(f => {
          rowObj[f.name] = row[f.name] !== undefined ? row[f.name] : '';
        });

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

      container.innerHTML = '';
      if (currentStep3Grid) {
        try { currentStep3Grid.destroy(); } catch (e) {}
        currentStep3Grid = null;
      }

      currentStep3Grid = new gridjs.Grid({
        columns: gridColumns,
        data: gridData,
        sort: true,
        resizable: true,
        pagination: { limit: 10, summary: true },
        language: {
          pagination: {
            previous: 'Préc.',
            next: 'Suiv.',
            navigate: (page, pages) => 'Page ' + page + ' sur ' + pages,
            page: (page) => 'Page ' + page,
            showing: 'Affichage de',
            of: 'sur',
            to: 'à',
            results: 'enregistrements (10 par page)'
          },
          loading: 'Chargement...',
          noRecordsFound: 'Aucune donnée disponible',
          error: 'Erreur de chargement'
        }
      });
      currentStep3Grid.render(container);

      if (tablePanelViewMode[3] === 'ai') {
        renderTableAiView(3);
      } else if (tablePanelViewMode[3] === 'visuels') {
        renderVisuelsPromptView(3);
      }
    }


    // ===== Rendu du Tableau de l'Étape 5 avec Grid.js =====
    function renderStep5TablePreview(resetPage = false) {
      const q2 = selections[2] || 'A';
      const q5 = selections[5] || 'B';

      const container = document.getElementById('step5-table-container');
      const titleEl = document.getElementById('step5-table-title');
      const badgeEl = document.getElementById('step5-combo-badge');
      if (!container) return;

      const granCapTableNames = {
        'A': 'MDT_MAINTENANCE_REQUEST (Consolidation Demande)',
        'B': 'MDT_INTERVENTION (Lignes d\'Atelier)'
      };

      if (titleEl) {
        titleEl.innerHTML = '📋 Extrait de la vue capacitaire <span class="font-mono text-purple-700 font-bold ml-1">' + granCapTableNames[q2] + '</span>';
      }
      if (badgeEl) {
        badgeEl.textContent = granCapTableNames[q2] + ' + Capacité 5.' + q5;
      }

      const { parsedErd, dataset } = getOrGenerateStepDataset(5);

      if (resetPage || !step5DataState.activeTable || !parsedErd.entities[step5DataState.activeTable]) {
        step5DataState.activeTable = parsedErd.mainTable || Object.keys(parsedErd.entities)[0];
        step5DataState.parentContext = null;
        step5DataState.page = 1;
      }

      const activeTableName = step5DataState.activeTable;
      const activeEntity = parsedErd.entities[activeTableName];
      if (!activeEntity) return;

      // Barre d'outils et sélecteur / fil d'Ariane / retour
      const tableSelectEl = document.getElementById('step-5-data-table-select');
      const breadcrumbEl = document.getElementById('step-5-data-breadcrumb');
      const backBtn = document.getElementById('step-5-data-back-btn');
      const filterBadge = document.getElementById('step-5-data-filter-badge');

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
        if (step5DataState.parentContext || activeTableName !== parsedErd.mainTable) {
          backBtn.classList.remove('hidden');
          if (step5DataState.parentContext) {
            filterBadge.classList.remove('hidden');
            filterBadge.textContent = `Filtre : ${step5DataState.parentContext.filterField} = ${step5DataState.parentContext.filterValue}`;
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
      if (step5DataState.parentContext) {
        const { filterField, filterValue } = step5DataState.parentContext;
        rawRows = rawRows.filter(r => String(r[filterField]) === String(filterValue));
      }

      // Construction des colonnes Grid.js
      const gridColumns = [];

      // 1. Colonnes des attributs propres de l'entité
      activeEntity.fields.forEach((f, idx) => {
        const badgeConstraint = f.constraint ? ` <span class="px-1 py-0.2 rounded text-[8.5px] font-mono ${f.constraint === 'PK' ? 'bg-amber-100 text-amber-900 border border-amber-300' : 'bg-blue-100 text-blue-900 border border-blue-300'}">${f.constraint}</span>` : '';
        const baseW = Math.max(105, (f.name.length * 7.5) + (f.constraint ? 45 : 22));
        const isCalc = idx >= activeEntity.fields.length - 2;

        gridColumns.push({
          id: f.name,
          name: gridjs.html(`<span class="font-bold text-slate-700">${f.name}</span>${badgeConstraint}`),
          width: `${baseW}px`,
          sort: true,
          formatter: (cell) => {
            const val = (cell !== undefined && cell !== null) ? String(cell) : '';
            if (isCalc) {
              return gridjs.html('<span class="text-purple-700 font-bold font-mono">' + escapeHtml(val) + '</span>');
            }
            if (idx === 0) {
              return gridjs.html('<span class="text-slate-600 font-semibold font-mono">' + escapeHtml(val) + '</span>');
            }
            return gridjs.html(`<span class="text-slate-800" title="${escapeHtml(val)}">${escapeHtml(val)}</span>`);
          }
        });
      });

      // 2. Colonnes relationnelles déduites du schéma Mermaid
      // - Relations N-1 : colonne avec nom / libellé
      // - Relations 1-N : compteur cliquable drill-down
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
                  <button type="button" onclick="drillDownToStepTable(5, '${rel.to}', '${pkField.name}', '${pkVal}')" class="px-1.5 py-0.5 rounded bg-emerald-50 hover:bg-emerald-100 text-emerald-800 font-bold border border-emerald-200 text-[10px] cursor-pointer transition inline-flex items-center gap-1 shadow-2xs" title="Voir les détails (${rel.to})">
                    <span>${count} ↗</span>
                  </button>
                `);
              }
            });
          } else {
            // N-1 : affichage d'un libellé significatif
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
        activeEntity.fields.forEach(f => {
          rowObj[f.name] = row[f.name] !== undefined ? row[f.name] : '';
        });

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

      container.innerHTML = '';
      if (currentStep5Grid) {
        try { currentStep5Grid.destroy(); } catch (e) {}
        currentStep5Grid = null;
      }

      currentStep5Grid = new gridjs.Grid({
        columns: gridColumns,
        data: gridData,
        sort: true,
        resizable: true,
        pagination: { limit: 10, summary: true },
        language: {
          pagination: {
            previous: 'Préc.',
            next: 'Suiv.',
            navigate: (page, pages) => 'Page ' + page + ' sur ' + pages,
            page: (page) => 'Page ' + page,
            showing: 'Affichage de',
            of: 'sur',
            to: 'à',
            results: 'enregistrements (10 par page)'
          },
          loading: 'Chargement...',
          noRecordsFound: 'Aucune donnée disponible',
          error: 'Erreur de chargement'
        }
      });
      currentStep5Grid.render(container);

      

      if (tablePanelViewMode[5] === 'ai') {
        renderTableAiView(5);
      } else if (tablePanelViewMode[5] === 'visuels') {
        renderVisuelsPromptView(5);
      }
    }
