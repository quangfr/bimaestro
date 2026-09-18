// =========================================================================
// Maestro BI - js/erd-engine.js
// Moteur de Données Relationnel, Parseur Mermaid ERD, PRNG & Formules
// =========================================================================

    // ===== Moteur de Données, Parseur Mermaid ERD & Vue "data" (Étape 2) =====
    let customSchemas = [];
    try {
      const savedSchemas = localStorage.getItem('maestro_custom_schemas');
      if (savedSchemas) customSchemas = JSON.parse(savedSchemas);
      if (!Array.isArray(customSchemas)) customSchemas = [];
    } catch (e) {
      customSchemas = [];
    }

    function saveCustomSchemas() {
      try {
        localStorage.setItem('maestro_custom_schemas', JSON.stringify(customSchemas));
      } catch (e) {}
    }

// Mode actif pour le panneau de l'Étape 2 (data, graph, uml, <>uml)
let schemaViewMode = (function() {
  try {
    const s = localStorage.getItem('maestro_switch_schema');
    if (s === 'ui' || s === 'mermaid' || s === 'graph') return 'graph';
    if (s === 'erd') return '<>uml';
    return s || 'data';
  } catch (e) {
    return 'data';
  }
})();

    // État du tableau de données de l'Étape 2
    let schemaDataState = {
      activeTable: null,
      parentContext: null, // { table: string, filterField: string, filterValue: any }
      page: 1,
      pageSize: 20,
      sortField: null,
      sortAsc: true,
      colOrder: [],
      colWidths: {}
    };

    // États des tableaux de données pour les Étapes 3 et 5
    let step3DataState = {
      activeTable: null,
      parentContext: null,
      page: 1
    };

    let step5DataState = {
      activeTable: null,
      parentContext: null,
      page: 1
    };

    // Cache des datasets générés pour les Étapes 3 et 5
    const stepModelDatasets = {
      3: {}, // key: opt -> { parsedErd, dataset }
      5: {}  // key: opt -> { parsedErd, dataset }
    };

    function onStepTableSelectChange(step, tableName) {
      if (step === 2) {
        schemaDataState.activeTable = tableName;
        schemaDataState.parentContext = null;
        schemaDataState.page = 1;
        renderStep2DataView();
      } else if (step === 3) {
        step3DataState.activeTable = tableName;
        step3DataState.parentContext = null;
        step3DataState.page = 1;
        renderStep3TablePreview();
      } else if (step === 5) {
        step5DataState.activeTable = tableName;
        step5DataState.parentContext = null;
        step5DataState.page = 1;
        renderStep5TablePreview();
      }
    }

    function drillDownToStepTable(step, subTable, filterField, filterValue) {
      const state = (step === 3) ? step3DataState : step5DataState;
      state.parentContext = {
        table: state.activeTable,
        filterField,
        filterValue
      };
      state.activeTable = subTable;
      state.page = 1;
      if (step === 3) renderStep3TablePreview();
      else if (step === 5) renderStep5TablePreview();
    }

    function drillBackToStepTable(step) {
      const state = (step === 3) ? step3DataState : step5DataState;
      if (state.parentContext) {
        state.activeTable = state.parentContext.table;
        state.parentContext = null;
        state.page = 1;
        if (step === 3) renderStep3TablePreview();
        else if (step === 5) renderStep5TablePreview();
      } else {
        const { parsedErd } = getOrGenerateStepDataset(step);
        state.activeTable = parsedErd.mainTable || Object.keys(parsedErd.entities)[0];
        state.page = 1;
        if (step === 3) renderStep3TablePreview();
        else if (step === 5) renderStep5TablePreview();
      }
    }


    // PRNG (Mulberry32) pour des données déterministes et stables par seed
    function createPRNG(seed) {
      let s = seed >>> 0;
      return function() {
        s = (s + 0x6D2B79F5) >>> 0;
        let t = Math.imul(s ^ (s >>> 15), 1 | s);
        t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
        return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
      };
    }

    // Parseur de diagramme Mermaid ERD
    function parseMermaidErd(umlText) {
      const lines = (umlText || '').split('\n');
      const entities = {};
      const relationships = [];
      let currentEntity = null;

      const relRegex = /^\s*([A-Za-z0-9_]+)\s*(\|\||\|o|o\||o\{|\}o|\}\{|\{\|)\s*--\s*(\|\||\|o|o\||o\{|\}o|\}\{|\{\|)\s*([A-Za-z0-9_]+)\s*:\s*"?([^"\n\r]*)"?/;
      const entityHeaderRegex = /^\s*([A-Za-z0-9_]+)(?:\s*\["([^"]*)"\])?\s*\{/;

      for (let i = 0; i < lines.length; i++) {
        const line = lines[i].trim();
        if (!line || line.startsWith('%%') || line.startsWith('erDiagram')) continue;

        const relMatch = line.match(relRegex);
        if (relMatch) {
          const [, ent1, card1, card2, ent2, label] = relMatch;
          const is1toN = (card2 === 'o{' || card2 === '}{' || card2 === '{|' || (card1 === '||' && card2.includes('{')) || label.includes('1:N') || label.includes('1 vers N') || label.includes('1 → N'));
          relationships.push({
            from: ent1,
            to: ent2,
            card1,
            card2,
            is1toN,
            label: label || ''
          });
          continue;
        }

        const entMatch = line.match(entityHeaderRegex);
        if (entMatch) {
          const entName = entMatch[1];
          const entLabel = entMatch[2] || entName;
          currentEntity = {
            name: entName,
            label: entLabel,
            fields: []
          };
          entities[entName] = currentEntity;
          continue;
        }

        if (line.startsWith('\x7D')) {
          currentEntity = null;
          continue;
        }

        if (currentEntity) {
          // Extraction du champ : type, name, contrainte optionnelle, commentaire entre guillemets
          // Ex : string ID_DEMANDE PK "D-2026-000123"
          // Ex : string DEMANDEUR "Air France (AFR)"
          const fieldRegex = /^([A-Za-z0-9_*]+)\s+([A-Za-z0-9_]+)(?:\s+(PK|FK|UK))?(?:\s+"([^"]*)")?/;
          const fMatch = line.match(fieldRegex);
          if (fMatch) {
            let [, rawType, name, constraint, comment] = fMatch;
            const isMandatory = rawType.startsWith('*');
            const type = rawType.replace(/^\*/, '').toLowerCase();
            currentEntity.fields.push({
              name,
              type,
              isMandatory,
              constraint: constraint || '',
              comment: comment || ''
            });
          }
        }
      }

      // Déduction de la table principale :
      // 1. Première entité déclarée ou entité source de 1-N la plus connectée
      const entityNames = Object.keys(entities);
      let mainTable = entityNames[0] || 'TABLE_1';

      if (entityNames.includes('MDT_MAINTENANCE_REQUEST') && selections[2] === 'A') {
        mainTable = 'MDT_MAINTENANCE_REQUEST';
      } else if (entityNames.includes('MDT_INTERVENTION') && selections[2] === 'B') {
        mainTable = 'MDT_INTERVENTION';
      }

      return { entities, relationships, mainTable };
    }

    // Déduction des règles de génération par défaut depuis l'UML
    function getDefaultFieldStrategy(field, tableName, parsedErd) {
      const type = (field.type || '').toLowerCase();
      const name = field.name || '';
      const comment = field.comment || '';

      // 1. Booléen
      if (type === 'boolean' || type === 'bool' || comment.includes('true | false') || comment.includes('false | true')) {
        return {
          generator: 'boolean',
          truePct: 75
        };
      }

      // 2. Type enum ou liste de choix avec | (regex genex / distribution de choix)
      if (type === 'enum' || comment.includes('|')) {
        let rawVals = [];
        if (comment.includes('|')) {
          rawVals = comment.split('|').map(v => v.trim()).filter(Boolean);
        } else if (comment) {
          rawVals = [comment.trim()];
        } else {
          rawVals = [`${name}_1`, `${name}_2`, `${name}_3`];
        }

        if (rawVals.length > 0) {
          // La valeur préfixée '*' dans l'UML est la valeur par défaut : double poids de répartition.
          const cleaned = rawVals.map(v => ({
            value: v.replace(/^\*/, ''),
            isDefault: v.startsWith('*')
          }));
          const totalWeight = cleaned.reduce((s, c) => s + (c.isDefault ? 2 : 1), 0);
          let accPct = 0;
          const values = cleaned.map((c, idx) => {
            const basePct = Math.round(((c.isDefault ? 2 : 1) * 100) / totalWeight);
            accPct += basePct;
            const pct = (idx === cleaned.length - 1) ? (basePct + Math.max(0, 100 - accPct)) : basePct;
            return { value: c.value, pct, isDefault: c.isDefault };
          });
          return {
            generator: 'enum',
            values
          };
        }
      }

      // 3. Date / Timestamp
      if (type.includes('date') || type.includes('time')) {
        let baseDateStr = '2026-03-01';
        const dateMatch = comment.match(/\d{4}-\d{2}-\d{2}/);
        if (dateMatch) baseDateStr = dateMatch[0];
        const baseDate = new Date(baseDateStr);
        const startDate = new Date(baseDate.getTime() - 20 * 86400000).toISOString().slice(0, 10);
        const endDate = new Date(baseDate.getTime() + 40 * 86400000).toISOString().slice(0, 10);
        return {
          generator: 'date',
          startDate,
          endDate
        };
      }

      // 4. Numérique (float, int, number)
      if (type.includes('float') || type.includes('int') || type.includes('num') || type.includes('double')) {
        const numMatch = comment.match(/-?\d+(?:\.\d+)?/);
        let numVal = numMatch ? parseFloat(numMatch[0]) : NaN;
        const guessedSuffix = numMatch ? comment.replace(/-?\d+(?:\.\d+)?/, '').trim() : '';
        if (isNaN(numVal)) numVal = Math.round(20 + Math.random() * 60); // nombre invalide → moyenne aléatoire 20-80
        const isFloat = type.includes('float') || type.includes('double') || (comment.includes('.') && !type.includes('int'));
        const suffix = guessedSuffix || '';
        return {
          generator: isFloat ? 'float' : 'integer',
          mean: numVal,
          suffix: suffix ? ` ${suffix}` : ''
        };
      }

      // 5. String / Codes (regex-genex pattern avec incrément)
      let prefix = '';
      let numDigits = 4;
      let startNum = 1;
      let suffix = '';

      const dashIdx = comment.lastIndexOf('-');
      if (dashIdx !== -1) {
        prefix = comment.substring(0, dashIdx + 1);
        const endPart = comment.substring(dashIdx + 1);
        const endDigitsMatch = endPart.match(/^(\d+)(.*)$/);
        if (endDigitsMatch) {
          numDigits = endDigitsMatch[1].length;
          startNum = parseInt(endDigitsMatch[1], 10) || 1;
          suffix = endDigitsMatch[2] || '';
        } else {
          prefix = comment;
          numDigits = 3;
        }
      } else {
        prefix = comment ? `${comment} ` : `${name}_`;
        numDigits = 2;
      }

      return {
        generator: 'regex_genex',
        prefix,
        startNum,
        numDigits,
        suffix,
        sample: comment || name
      };
    }

    // Récupération ou initialisation de la stratégie d'une table
    function getTableDataStrategy(granularity, tableName, parsedErd) {
      const storageKey = `maestro_datagen_strat_${granularity}_${tableName}`;
      try {
        const raw = localStorage.getItem(storageKey);
        if (raw) {
          const parsed = JSON.parse(raw);
          if (parsed && parsed.fields) {
            // Si la nature d'un champ a changé dans l'UML (ex. string -> enum), on ré-applique la stratégie déduite.
            // On ne touche pas aux champs dont le type a été modifié explicitement dans la modale (stratégie .type).
            const ent = parsedErd.entities[tableName];
            if (ent) {
              ent.fields.forEach(f => {
                const s = parsed.fields[f.name];
                if (!s) {
                  parsed.fields[f.name] = getDefaultFieldStrategy(f, tableName, parsedErd);
                } else {
                  const ideal = getDefaultFieldStrategy(f, tableName, parsedErd);
                  if (s.generator !== 'formula' && ideal.generator !== s.generator && !s.type) {
                    parsed.fields[f.name] = ideal;
                  }
                }
              });
            }
            return parsed;
          }
        }
      } catch (e) {}

      // Construction par défaut
      const ent = parsedErd.entities[tableName];
      if (!ent) return { rowCount: 15, fields: {} };

      const fieldsStrat = {};
      ent.fields.forEach(f => {
        fieldsStrat[f.name] = getDefaultFieldStrategy(f, tableName, parsedErd);
      });

      return {
        rowCount: 15,
        fields: fieldsStrat
      };
    }

    function saveTableDataStrategy(granularity, tableName, strat) {
      const storageKey = `maestro_datagen_strat_${granularity}_${tableName}`;
      try {
        localStorage.setItem(storageKey, JSON.stringify(strat));
      } catch (e) {}
    }


    // Génération effective des données pour toutes les tables d'un modèle ERD
    function generateModelDataset(granularity, parsedErd, seed = 12345) {
      const rng = createPRNG(seed);
      const dataset = {};

      const tableNames = Object.keys(parsedErd.entities);

      // Générer d'abord les tables indépendantes puis la table principale
      tableNames.forEach(tName => {
        const ent = parsedErd.entities[tName];
        const strat = getTableDataStrategy(granularity, tName, parsedErd);
        const rowCount = strat.rowCount || 20;
        const rows = [];

        for (let r = 0; r < rowCount; r++) {
          const row = {};
          ent.fields.forEach(f => {
            const fStrat = strat.fields[f.name] || getDefaultFieldStrategy(f, tName, parsedErd);
            row[f.name] = generateFieldValue(fStrat, r, rng);
          });
          rows.push(row);
        }
        dataset[tName] = rows;
      });

      // Synchroniser les FKs pour garantir la consistance relationnelle
      parsedErd.relationships.forEach(rel => {
        const { from, to, is1toN } = rel;
        const fromRows = dataset[from] || [];
        const toRows = dataset[to] || [];
        if (!fromRows.length || !toRows.length) return;

        if (is1toN) {
          // `from` (1) -> `to` (N). Trouver la FK dans `to` correspondant à la PK de `from`
          const fromEnt = parsedErd.entities[from];
          const toEnt = parsedErd.entities[to];
          if (!fromEnt || !toEnt) return;

          const pkField = fromEnt.fields.find(f => f.constraint === 'PK');
          if (pkField) {
            const fkInTo = toEnt.fields.find(f => f.name === pkField.name || (f.constraint === 'FK' && f.name.includes(pkField.name)));
            if (fkInTo) {
              toRows.forEach((row, idx) => {
                const parentRow = fromRows[idx % fromRows.length];
                row[fkInTo.name] = parentRow[pkField.name];
              });
            }
          }
        } else {
          // Relation N-1 : `from` (N) -> `to` (1). La FK est dans `from`
          const fromEnt = parsedErd.entities[from];
          const toEnt = parsedErd.entities[to];
          if (!fromEnt || !toEnt) return;

          const pkInTo = toEnt.fields.find(f => f.constraint === 'PK');
          if (pkInTo) {
            const fkInFrom = fromEnt.fields.find(f => f.name === pkInTo.name || (f.constraint === 'FK' && f.name.includes(pkInTo.name)));
            if (fkInFrom) {
              fromRows.forEach((row, idx) => {
                const targetRow = toRows[idx % toRows.length];
                row[fkInFrom.name] = targetRow[pkInTo.name];
              });
            }
          }
        }
      });

      return dataset;
    }

    function generateFieldValue(strat, rowIdx, rng) {
      if (!strat) return `Val_${rowIdx + 1}`;

      switch (strat.generator) {
        case 'boolean':
          return (rng() * 100) < (strat.truePct || 50) ? 'true' : 'false';

        case 'enum': {
          const vals = strat.values || [{ value: 'Val1', pct: 100 }];
          const roll = rng() * 100;
          let acc = 0;
          for (let i = 0; i < vals.length; i++) {
            acc += (vals[i].pct || 0);
            if (roll <= acc || i === vals.length - 1) {
              return vals[i].value;
            }
          }
          return vals[0].value;
        }

        case 'date': {
          const startMs = new Date(strat.startDate || '2026-02-01').getTime();
          const endMs = new Date(strat.endDate || '2026-04-15').getTime();
          const range = Math.max(1, endMs - startMs);
          const randMs = startMs + rng() * range;
          return new Date(randMs).toISOString().slice(0, 10);
        }

        case 'float': {
          if (strat.mode === 'formula' && strat.formula) {
            const evaluated = evaluateFormulaOnRecord(strat.formula, strat._rowContext || {});
            const num = (typeof evaluated === 'number' && !isNaN(evaluated)) ? evaluated : 100.0;
            const rounded = (Math.round(num * 10) / 10).toFixed(1);
            return `${rounded}${strat.suffix || ''}`;
          }
          const fmean = strat.mean !== undefined ? strat.mean : 20.0;
          const min = strat.min !== undefined ? strat.min : parseFloat((fmean * 0.5).toFixed(1));
          const max = strat.max !== undefined ? strat.max : parseFloat((fmean * 1.5).toFixed(1));
          const val = min + (rng() * (max - min));
          const rounded = (Math.round(val * 10) / 10).toFixed(1);
          return `${rounded}${strat.suffix || ''}`;
        }

        case 'integer': {
          if (strat.mode === 'formula' && strat.formula) {
            const evaluated = evaluateFormulaOnRecord(strat.formula, strat._rowContext || {});
            const num = (typeof evaluated === 'number' && !isNaN(evaluated)) ? Math.round(evaluated) : 100;
            return `${num}${strat.suffix || ''}`;
          }
          const imean = strat.mean !== undefined ? strat.mean : 20;
          const min = strat.min !== undefined ? strat.min : Math.round(imean * 0.5);
          const max = strat.max !== undefined ? strat.max : Math.round(imean * 1.5);
          const val = Math.round(min + (rng() * (max - min)));
          return `${val}${strat.suffix || ''}`;
        }

        case 'regex_genex': {
          const prefix = strat.prefix !== undefined ? strat.prefix : 'ID-';
          const digits = strat.numDigits || 3;
          const startNum = strat.startNum || 1;
          const currentNum = startNum + rowIdx;
          const padded = String(currentNum).padStart(digits, '0');
          return `${prefix}${padded}${strat.suffix || ''}`;
        }

        default:
          return strat.sample || `Item-${rowIdx + 1}`;
      }
    }

    // Cache mémoire des données générées
    let currentModelDataset = null;
    let currentModelParsedErd = null;
    let currentModelGranularity = null;

    function getOrGenerateCurrentDataset(granularity, force = false) {
      const g = granularity || selections[2] || 'A';
      if (!force && currentModelDataset && currentModelGranularity === g && currentModelParsedErd) {
        return { parsedErd: currentModelParsedErd, dataset: currentModelDataset };
      }

      const umlCode = getMermaidSchema(g);
      const parsedErd = parseMermaidErd(umlCode);
      const dataset = generateModelDataset(g, parsedErd, 98765);

      currentModelGranularity = g;
      currentModelParsedErd = parsedErd;
      currentModelDataset = dataset;

      return { parsedErd, dataset };
    }


    // ===== Moteur d'évaluation de formules et gestion des mesures (Étapes 3 et 5) =====
    let currentStep3Grid = null;
    let currentStep5Grid = null;
    let activeMesureModalStep = 3;
    let activeMesureModalField = null;
    let activeCustomMeasureStep = 3;

    // Générateur et cache de dataset complet pour les Étapes 3 et 5 (synchronisé avec l'UML de chaque réponse)
    function getOrGenerateStepDataset(step, force = false) {
      const opt = selections[step] || 'B';
      const cacheKey = `${step}_${opt}`;
      if (!force && stepModelDatasets[step] && stepModelDatasets[step][cacheKey]) {
        return stepModelDatasets[step][cacheKey];
      }

      const umlCode = getStepUmlCode(step);
      const parsedErd = parseMermaidErd(umlCode);

      // Détecter la table principale du schéma de l'étape
      const entNames = Object.keys(parsedErd.entities);
      let mainTable = entNames[0] || 'TABLE_MAIN';
      if (entNames.includes('MDT_MAINTENANCE_REQUEST')) {
        mainTable = 'MDT_MAINTENANCE_REQUEST';
      } else if (entNames.includes('MDT_INTERVENTION')) {
        mainTable = 'MDT_INTERVENTION';
      } else if (entNames.includes('SHOP')) {
        mainTable = 'SHOP';
      }
      parsedErd.mainTable = mainTable;

      // Générer le dataset pour toutes les tables du schéma
      const dataset = generateModelDataset(`step_${step}_${opt}`, parsedErd, 98765 + (step * 31));

      // Calculer/évaluer les mesures par formule ou distribution pour chaque ligne de chaque table
      entNames.forEach(tName => {
        const ent = parsedErd.entities[tName];
        const strat = getStepTableDataStrategy(step, tName, parsedErd);
        const rows = dataset[tName] || [];

        rows.forEach((row, rIdx) => {
          ent.fields.forEach(fld => {
            const isKeyOrNonNum = (fld.constraint && (fld.constraint.includes('PK') || fld.constraint.includes('FK') || fld.constraint.includes('UK'))) ||
                                  (fld.type !== 'int' && fld.type !== 'float' && fld.type !== 'integer');
            const fStrat = (strat && strat.fields && strat.fields[fld.name]) || null;
            const legacyCfg = getStepMeasureConfig(step, fld.name);
            const isFormula = (fStrat && fStrat.mode === 'formula' && fStrat.formula) || (legacyCfg && legacyCfg.mode === 'formula' && legacyCfg.formula);
            const formula = (fStrat && fStrat.formula) || (legacyCfg && legacyCfg.formula) || '';
            const suffix = (fStrat && fStrat.suffix) || (legacyCfg && legacyCfg.suffix) || '';

            if (!isKeyOrNonNum && isFormula) {
              const evalVal = evaluateFormulaOnRecord(formula, row);
              const num = (typeof evalVal === 'number' && !isNaN(evalVal))
                ? ((fld.type === 'int' || fld.type === 'integer') ? Math.round(evalVal) : (Math.round(evalVal * 10) / 10).toFixed(1))
                : 100;
              row[fld.name] = `${num}${suffix}`;
            } else if (!isKeyOrNonNum && row[fld.name] !== undefined) {
              // Assurer une variation naturelle par ligne selon la moyenne/dispersion
              const baseMean = (fStrat && fStrat.mean !== undefined) ? fStrat.mean : ((legacyCfg && legacyCfg.mean !== undefined) ? legacyCfg.mean : parseFloat(String(row[fld.name]).replace(/[^0-9.-]+/g, '')) || 20);
              const prng = createPRNG(98765 + (rIdx * 19) + fld.name.length + (step * 7));
              const delta = (prng() - 0.5) * (baseMean * 0.25);
              const finalNum = Math.max(1, baseMean + delta);
              const formatted = (fld.type === 'int' || fld.type === 'integer')
                ? Math.round(finalNum)
                : (Math.round(finalNum * 10) / 10).toFixed(1);
              row[fld.name] = `${formatted}${suffix}`;
            }
          });
        });
      });

      const res = { parsedErd, dataset };
      if (!stepModelDatasets[step]) stepModelDatasets[step] = {};
      stepModelDatasets[step][cacheKey] = res;

      return res;
    }

    function getStepBaseDataset(step) {
      const { parsedErd, dataset } = getOrGenerateStepDataset(step);
      const tableName = parsedErd.mainTable || Object.keys(parsedErd.entities)[0];
      const rows = dataset[tableName] || [];
      return { rows: JSON.parse(JSON.stringify(rows)), tableName, parsedErd };
    }

    function evaluateFormulaOnRecord(formula, record) {
      if (!formula || typeof formula !== 'string' || !formula.trim()) return 100;
      let expr = formula.trim();

      // Remplacement case-insensitive des mots-clés logiques
      expr = expr.replace(/\bAND\b/gi, '&&').replace(/\bOR\b/gi, '||');

      // Traitement IF(cond, vrai, faux)
      while (/\bIF\s*\(/i.test(expr)) {
        expr = expr.replace(/\bIF\s*\(([^,]+),([^,]+),([^\)]+)\)/gi, (m, c, t, f) => {
          return '((' + c + ') ? (' + t + ') : (' + f + '))';
        });
      }

      // Remplacement des agrégateurs scalaires (SUM, AVG, MIN, MAX, COUNT, DISTINCTCOUNT) par la valeur du champ
      expr = expr.replace(/\b(SUM|AVG|MIN|MAX|COUNT|DISTINCTCOUNT)\s*\(([A-Za-z0-9_]+)\)/gi, (m, fn, fld) => {
        return fld;
      });

      // Remplacement des identifiants de champs par leur valeur numérique
      expr = expr.replace(/\b[A-Za-z_][A-Za-z0-9_]*\b/g, (token) => {
        const upper = token.toUpperCase();
        if (upper === 'TRUE') return 'true';
        if (upper === 'FALSE') return 'false';
        if (upper === 'NULL') return 'null';
        if (record && record[token] !== undefined) {
          const v = record[token];
          if (typeof v === 'number') return String(v);
          const parsed = parseFloat(String(v).replace(/[^0-9.-]+/g, ''));
          return isNaN(parsed) ? '0' : String(parsed);
        }
        return '0';
      });

      // Opérateur <> en != et = en ===
      expr = expr.replace(/<>/g, '!=').replace(/([^=!<>]|^)=([^=]|$)/g, '$1===$2');

      try {
        const fn = new Function('return (' + expr + ');');
        const res = fn();
        return (typeof res === 'number' && !isNaN(res)) ? res : (res ? 1 : 0);
      } catch (e) {
        return 100;
      }
    }

    function validateFormulaSyntax(formula, availableFields = []) {
      if (!formula || typeof formula !== 'string' || !formula.trim()) {
        return { valid: false, message: 'La formule ne peut pas être vide' };
      }
      let trimmed = formula.trim();

      // 1. Équilibre des parenthèses
      let depth = 0;
      for (let char of trimmed) {
        if (char === '(') depth++;
        else if (char === ')') depth--;
        if (depth < 0) return { valid: false, message: 'Parenthèse fermante en trop' };
      }
      if (depth !== 0) return { valid: false, message: 'Parenthèse non fermée' };

      // 2. Vérification des appels IF
      const ifMatches = [...trimmed.matchAll(/\bIF\s*\(/gi)];
      for (const m of ifMatches) {
        const start = m.index + m[0].length;
        let d = 1;
        let inner = '';
        for (let i = start; i < trimmed.length; i++) {
          if (trimmed[i] === '(') d++;
          else if (trimmed[i] === ')') {
            d--;
            if (d === 0) { inner = trimmed.substring(start, i); break; }
          }
        }
        const parts = inner.split(',');
        if (parts.length < 3) {
          return { valid: false, message: 'La fonction IF requiert 3 arguments : IF(condition, vrai, faux)' };
        }
      }

      // 3. Test d'évaluation avec mock context
      const mockRecord = {};
      availableFields.forEach(f => { mockRecord[f] = 10; });
      try {
        const val = evaluateFormulaOnRecord(trimmed, mockRecord);
      } catch (e) {
        return { valid: false, message: 'Erreur d\'expression : ' + e.message };
      }

      return { valid: true, message: 'Syntaxe valide (compatible SAP IBP Key Figure)' };
    }

    // Gestion du dictionnaire des mesures (min/max/moy vs formule)
    function getStepMeasureConfig(step, fieldName) {
      const storageKey = 'maestro_measure_cfg_' + step + '_' + fieldName;
      try {
        const raw = localStorage.getItem(storageKey);
        if (raw) {
          const cfg = JSON.parse(raw);
          if (cfg) return cfg;
        }
      } catch (e) {}
      return {
        mode: 'distrib',
        formula: ''
      };
    }

    function saveStepMeasureConfig(step, fieldName, cfg) {
      const storageKey = 'maestro_measure_cfg_' + step + '_' + fieldName;
      try {
        localStorage.setItem(storageKey, JSON.stringify(cfg));
      } catch (e) {}
    }


    // ===== Modal de paramétrage des mesures (Unified Mesure Generator Modal - Étapes 3 & 5) =====
    let activeMesureModalTable = null;

    // Récupération ou initialisation de la stratégie d'une table d'étape (Étape 3 ou 5)
    function getStepTableDataStrategy(step, tableName, parsedErd) {
      const storageKey = `maestro_measure_strat_${step}_${tableName}`;
      try {
        const raw = localStorage.getItem(storageKey);
        if (raw) {
          const parsed = JSON.parse(raw);
          if (parsed && parsed.fields) {
            // Si la nature d'un champ a changé dans l'UML (ex. string -> enum), on ré-applique la stratégie déduite.
            // On ne touche pas aux champs dont le type a été modifié explicitement dans la modale (stratégie .type).
            const ent = parsedErd.entities[tableName];
            if (ent) {
              ent.fields.forEach(f => {
                const s = parsed.fields[f.name];
                if (!s) {
                  parsed.fields[f.name] = getDefaultFieldStrategy(f, tableName, parsedErd);
                } else {
                  const ideal = getDefaultFieldStrategy(f, tableName, parsedErd);
                  if (s.generator !== 'formula' && ideal.generator !== s.generator && !s.type) {
                    parsed.fields[f.name] = ideal;
                  }
                }
              });
            }
            return parsed;
          }
        }
      } catch (e) {}

      const ent = parsedErd.entities[tableName];
      if (!ent) return { fields: {} };

      const fieldsStrat = {};
      ent.fields.forEach(f => {
        // Vérifier si une ancienne config maestro_measure_cfg_${step}_${f.name} existe
        const oldCfg = getStepMeasureConfig(step, f.name);
        const defaultStrat = getDefaultFieldStrategy(f, tableName, parsedErd);
        if (oldCfg && (oldCfg.formula || oldCfg.mode === 'formula')) {
          defaultStrat.mode = 'formula';
          defaultStrat.formula = oldCfg.formula || '';
          if (oldCfg.suffix) defaultStrat.suffix = oldCfg.suffix;
        } else if (oldCfg && (oldCfg.mean !== undefined || oldCfg.min !== undefined)) {
          defaultStrat.mode = 'distrib';
          if (oldCfg.min !== undefined) defaultStrat.min = oldCfg.min;
          if (oldCfg.max !== undefined) defaultStrat.max = oldCfg.max;
          if (oldCfg.mean !== undefined) defaultStrat.mean = oldCfg.mean;
          if (oldCfg.suffix) defaultStrat.suffix = oldCfg.suffix;
        }
        fieldsStrat[f.name] = defaultStrat;
      });

      return { fields: fieldsStrat };
    }

    function saveStepTableDataStrategy(step, tableName, strat) {
      const storageKey = `maestro_measure_strat_${step}_${tableName}`;
      try {
        localStorage.setItem(storageKey, JSON.stringify(strat));
      } catch (e) {}
    }
