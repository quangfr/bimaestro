// =========================================================================
// Maestro BI - js/steps-charts.js
// Étapes 4, 6 & 7 : Moteur Graphique Chart.js & Dashboard de Synthèse
// =========================================================================

// ===== Moteur Graphique Chart.js : données factices seedées (data.json = structure & libellés uniquement) =====
    // Les valeurs chiffrées sont générées aléatoirement selon des règles de cohérence, avec un seed stable
    // (persistance entre sessions via localStorage). data.json ne contient que structure / libellés / non-chiffré.

    const SEED_KEY = 'maestro_seed';

    function maestroSeed() {
      let seed = 42;
      try {
        const ls = localStorage.getItem(SEED_KEY);
        if (ls && !isNaN(parseInt(ls, 10))) seed = parseInt(ls, 10) & 0xffffffff;
      } catch (e) {}
      return seed;
    }

    function mulberry32(a) {
      return function () {
        a |= 0; a = (a + 0x6D2B79F5) | 0;
        let t = Math.imul(a ^ (a >>> 15), 1 | a);
        t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
        return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
      };
    }

    const M4DATA = { status: 'idle', base: null };

    function rndRange(rng, min, max) { return min + rng() * (max - min); }
    function rndInt(rng, min, max) { return Math.round(rndRange(rng, min, max)); }
    function rndDec(rng, min, max) { return Math.round(rndRange(rng, min, max) * 10) / 10; }
    function clampN(v, min, max) { return Math.max(min, Math.min(max, v)); }

    // Règles de cohérence métier : chaque jeu conserve des relations plausibles (P5 < P50 < P95,
    // somme 100%, retard 0 pour les statuts conformes, saturation corrélée au WIP, etc.)
    function buildMaestroData(base) {
      const rng = mulberry32(maestroSeed());
      const D = JSON.parse(JSON.stringify(base));

      // 4.A — TAT médian & bornes par famille (P5 ≈ 60-70 % P50, P95 ≈ 140-165 % P50)
      const p50Base = {
        'CFM56-7B': 14.9,
        'CFM56-5B': 13.8,
        'LEAP-1A': 21.6,
        'LEAP-1B': 18.4,
        'GE90-115B': 26.2,
        'M88-2': 16.5
      };
      D.modeles = D.modeles.map((m) => {
        const baseVal = p50Base[m.famille] || 18.0;
        const p50 = rndDec(rng, baseVal - 1.2, baseVal + 1.2);
        const p5 = rndDec(rng, p50 * 0.60, p50 * 0.70);
        const p95 = rndDec(rng, p50 * 1.40, p50 * 1.65);
        return { famille: m.famille, p50, p5, p95 };
      });

      // 4.B — Décomposition TAT par type de moteur (réparation 9-12.5, transit 1.5-4, attente 2.5-7)
      D.decompoTAT = D.decompoTAT.map((s) => {
        const reparation = rndDec(rng, 9, 12.5);
        const transfert = rndDec(rng, 1.5, 4);
        const attente = rndDec(rng, 2.5, 7);
        const label = s.famille || s.moteur || s.site;
        return { famille: label, site: label, reparation, transfert, attente };
      });

      // 4.C — Respect SLA par client (effectif ≥ contractuel pour RYR, % non-respect élevé)
      D.respectClients = D.respectClients.map((c) => {
        let contrat = rndDec(rng, 14, 17);
        let over = rndDec(rng, 0.8, 3.0);
        let nonRespect = rndRange(rng, 2.4, 8);
        if (c.code === 'RYR') { over = rndRange(rng, 2.2, 3.4); nonRespect = rndRange(rng, 13, 16); }
        if (c.code === 'DAL') nonRespect = rndRange(rng, 3.5, 7);
        return { code: c.code, nom: c.nom, contrat: contrat, effectif: contrat + over, nonRespect: Math.round(nonRespect * 10) / 10 };
      });

      // 4.D — Demandes de visite / Alertes : TAT et retard selon statut, pénalités = retard × 1500-2500 €
      const statutTat = { 'AOG Critique': [30, 42], 'En Retard': [20, 24], 'En Cours': [15, 19], 'Conforme': [13, 17] };
      D.alertesESN = D.alertesESN.map((a) => {
        const statut = a.priorite || a.statut || 'En Cours';
        const [lo, hi] = statutTat[statut] || [15, 20];
        const tat = rndDec(rng, lo, hi);
        let retard = 0;
        if (statut === 'AOG Critique') retard = rndDec(rng, 8, 18);
        else if (statut === 'En Retard') retard = rndDec(rng, 2, 5);
        const penalites = Math.round(retard * rndRange(rng, 1500, 2500));
        return {
          id_demande: a.id_demande || a.id_visit || a.esn,
          id_moteur: a.id_moteur || a.esn,
          client: a.client,
          site: a.site,
          model: a.model || a.modele || a.type,
          statut: statut,
          priorite: statut,
          tat_realise_j: tat,
          tat: tat,
          retard: retard,
          derapage_sla_j: retard,
          penalites_eur: penalites,
          penalites: penalites
        };
      });

      // 4.E — KPIs synthétiques (agrégats)
      const tatMoyen = rndDec(rng, 17, 20);
      D.kpis = {
        tatMoyen: tatMoyen,
        tatCible: 18,
        slaRespect: rndDec(rng, 95, 98),
        slaCible: 97,
        deriveEncours: rndDec(rng, 6, 15),
        deriveSeuil: 12,
        conformiteP85: rndDec(rng, 78, 92),
        seuilP85: 85,
        dossiersOuverts: rndInt(rng, 180, 240),
        aogCritiques: rndInt(rng, 3, 9)
      };

      // 4.F — Durée moteur vs seuil P85 (dépassements sur certaines motorisations)
      D.modulesP85 = D.modulesP85.map((m, i) => {
        const seuil = m.seuil || 24;
        const tat = rndDec(rng, 14, 28);
        const label = m.famille || m.module;
        return { module: label, tat, seuil };
      });

      // 4.G — Waterfall : cible + dérives cumulées
      const cible = rndDec(rng, 15, 17);
      const d1 = rndDec(rng, 2.6, 3.6);
      const d2 = rndDec(rng, 1.5, 2.5);
      const d3 = rndDec(rng, -1.8, -0.8);
      const d4 = rndDec(rng, 0.6, 1.5);
      const total = cible + d1 + d2 + d3 + d4;
      D.waterfall = {
        cible: cible,
        cibleLabel: D.waterfall.cibleLabel,
        etapes: [
          { etape: D.waterfall.etapes[0].etape, rel: d1 },
          { etape: D.waterfall.etapes[1].etape, rel: d2 },
          { etape: D.waterfall.etapes[2].etape, rel: d3 },
          { etape: D.waterfall.etapes[3].etape, rel: d4 }
        ],
        total: Math.round(total * 10) / 10
      };

      // 4.H — Heatmap Taux d'occupation réseau : 10 centres SAE MRO en Y, 9 semaines (S34 à S42) en X
      const reseauSemaines = ['S34', 'S35', 'S36', 'S37', 'S38', 'S39', 'S40', 'S41', 'S42'];
      const reseauSites = [
        'S-VIL (Villaroche)',
        'S-MON (Montereau)',
        'S-CHL (Châtellerault)',
        'S-BRU (Bruxelles)',
        'S-SQY (Saint-Quentin)',
        'S-GEN (Gennevilliers)',
        'S-BDX (Bordeaux)',
        'S-TLS (Toulouse)',
        'S-LGG (Liège)',
        'S-CRE (Le Creusot)'
      ];
      // Taux d'occupation en % avec zones vertes (<80%), jaunes (80-95%) et rouges (>95%)
      const reseauBase = [
        [92, 94, 98, 97, 95, 91, 88, 86, 84], // S-VIL
        [95, 97, 99, 101, 98, 96, 92, 89, 87], // S-MON
        [82, 85, 88, 89, 86, 84, 80, 78, 75], // S-CHL
        [91, 93, 96, 95, 92, 88, 84, 81, 79], // S-BRU
        [74, 76, 79, 81, 78, 75, 73, 70, 68], // S-SQY
        [79, 83, 86, 88, 85, 81, 77, 75, 72], // S-GEN
        [68, 71, 74, 76, 73, 70, 68, 66, 64], // S-BDX
        [75, 78, 82, 84, 81, 78, 75, 72, 70], // S-TLS
        [76, 79, 83, 85, 82, 79, 76, 74, 71], // S-LGG
        [65, 68, 71, 73, 70, 67, 65, 63, 61]  // S-CRE
      ];
      D.heatmapNetwork = {
        semaines: reseauSemaines,
        sites: reseauSites,
        valeurs: reseauSites.map((site, sIdx) =>
          reseauSemaines.map((sem, wIdx) => {
            const raw = reseauBase[sIdx] ? reseauBase[sIdx][wIdx] : 75;
            return rndInt(rng, Math.max(50, raw - 3), Math.min(103, raw + 3));
          })
        )
      };
      // Rétro-compatibilité D.gates
      const gateCibles = { G1: 5, G2: 8, G3: 4, G4: 4, G5: 3 };
      D.gates = (base.gates || []).map((g) => {
        const cibleG = gateCibles[g.gate] || 4;
        const realise = rndDec(rng, cibleG - 0.8, cibleG + 1.6);
        return { gate: g.gate, cible: cibleG, realise: Math.max(0.5, Math.round(realise * 10) / 10), retard: Math.max(0, Math.round((realise - cibleG) * 10) / 10) };
      });

      // 6.A — Taux de retard des interventions par shop (S-XXX) vs seuil 10%
      const shopRetardBase = {
        'S-MON': 18.2, 'S-VIL': 15.4, 'S-CHL': 12.1, 'S-BRU': 16.5,
        'S-TLS': 9.2,  'S-SQY': 7.6,  'S-GEN': 11.4, 'S-BDX': 6.8,
        'S-LGG': 9.6,  'S-CRE': 5.8
      };
      const shopsList = (base.sites && base.sites.map(s => s.code)) || Object.keys(shopRetardBase);
      D.retardShops = shopsList.map(code => {
        const baseTaux = shopRetardBase[code] || 10.0;
        const taux = rndDec(rng, baseTaux - 1.2, baseTaux + 1.2);
        const totalInt = rndInt(rng, 18, 52);
        return { shop: code, code, nom: code, taux_retard: Math.max(2, Math.round(taux * 10) / 10), total_interventions: totalInt, seuil: 10 };
      });
      // Garder D.pieces pour compatibilité résiduelle
      D.pieces = (base.pieces || []).map(p => ({ ...p, heures: rndInt(rng, 15, 80) }));

      // 6.B — % retards par opération (CFM 8-20, LEAP = CFM + 7-12)
      D.retardsOps = D.retardsOps.map((op) => {
        const cfm = rndDec(rng, 8, 20);
        const leap = cfm + rndDec(rng, 7, 12);
        return { operation: op.operation, cfm: cfm, leap: Math.round(leap * 10) / 10 };
      });

      // 6.C — Concentration des flux inter-sites + délai navette
      const nRoutes = (D.routes && D.routes.length) || 4;
      D.routes = D.routes.map((rt, i) => {
        const pct = Math.max(5, Math.round((36 - i * (28 / Math.max(1, nRoutes - 1)) + rndRange(rng, -2, 2)) * 10) / 10);
        return { route: rt.route, pct: pct, delai: rndDec(rng, 1.2, 3.8) };
      });

      // 6.D — Délai moyen de traitement par shop : Attente vs Réparation vs Transfert
      D.decompoShopTAT = shopsList.map(code => {
        const attente = rndDec(rng, 3.2, 7.8);
        const reparation = rndDec(rng, 12.5, 23.5);
        const transfert = rndDec(rng, 1.8, 4.2);
        const total = Math.round((attente + reparation + transfert) * 10) / 10;
        return {
          shop: code,
          code,
          attente: Math.round(attente * 10) / 10,
          reparation: Math.round(reparation * 10) / 10,
          transfert: Math.round(transfert * 10) / 10,
          total
        };
      });
      D.ratioLean = [
        { composante: "Temps travail VA atelier", valeur: 55 },
        { composante: "Attente passive pièces & outillage", valeur: 28 },
        { composante: "Transfert logistique inter-shops", valeur: 17 }
      ];

      // 6.E — Barre de charge par station de réparation (S-XXX-YY) vs seuil 85%
      const rawStations = (base.chargeStations && base.chargeStations.length) ? base.chargeStations : [
        { id_station: 'S-MON-01', nom: 'S-MON-01 (Aubes HP)', shop: 'S-MON', charge: 94, seuil: 85 },
        { id_station: 'S-MON-02', nom: 'S-MON-02 (Combustion)', shop: 'S-MON', charge: 88, seuil: 85 },
        { id_station: 'S-VIL-01', nom: 'S-VIL-01 (Équilibrage)', shop: 'S-VIL', charge: 92, seuil: 85 },
        { id_station: 'S-VIL-02', nom: 'S-VIL-02 (Inspection CND)', shop: 'S-VIL', charge: 86, seuil: 85 },
        { id_station: 'S-BRU-01', nom: 'S-BRU-01 (Banc Essai)', shop: 'S-BRU', charge: 89, seuil: 85 },
        { id_station: 'S-CHL-01', nom: 'S-CHL-01 (Maint. Majeure)', shop: 'S-CHL', charge: 81, seuil: 85 },
        { id_station: 'S-TLS-01', nom: 'S-TLS-01 (Intégration)', shop: 'S-TLS', charge: 78, seuil: 85 },
        { id_station: 'S-SQY-01', nom: 'S-SQY-01 (Revêtements)', shop: 'S-SQY', charge: 74, seuil: 85 },
        { id_station: 'S-GEN-01', nom: 'S-GEN-01 (Aubes Précision)', shop: 'S-GEN', charge: 82, seuil: 85 },
        { id_station: 'S-LGG-01', nom: 'S-LGG-01 (Banc CND)', shop: 'S-LGG', charge: 79, seuil: 85 }
      ];
      const seuilCharge = Number(D.seuilCharge) || 85;
      D.chargeStations = rawStations.map(st => {
        let charge = rndInt(rng, 65, 96);
        if (st.id_station.includes('MON-01') || st.id_station.includes('VIL-01')) charge = rndInt(rng, 90, 96);
        else if (st.id_station.includes('MON-02') || st.id_station.includes('BRU-01')) charge = rndInt(rng, 86, 91);
        return {
          id_station: st.id_station,
          station: st.nom || st.id_station,
          nom: st.nom || st.id_station,
          shop: st.shop || st.id_station.substring(0, 5),
          charge,
          seuil: seuilCharge
        };
      });
      D.chargeAteliers = shopsList.map(s => ({ atelier: s, charge: rndInt(rng, 60, 95), seuil: seuilCharge }));

      // 6.F — Heatmap d'occupation du shop (S-MON) : stations en Y, semaines S34 à S42 en X
      const shopSemaines = ['S34', 'S35', 'S36', 'S37', 'S38', 'S39', 'S40', 'S41', 'S42'];
      const shopStations = [
        'S-MON-01 (Aubes HP)',
        'S-MON-02 (Combustion)',
        'S-MON-03 (Ressuage CND)',
        'S-MON-04 (Usinage Tour CN)',
        'S-MON-05 (Équilibrage)',
        'S-MON-06 (Recette & FOD)'
      ];
      D.heatmapShop = {
        shop: 'S-MON (Montereau)',
        semaines: shopSemaines,
        jours: shopSemaines, // rétro-compatibilité
        stations: shopStations,
        valeurs: shopStations.map((st, stIdx) =>
          shopSemaines.map((sem, sIdx) => {
            const baseVal = (stIdx === 0 ? 93 : stIdx === 1 ? 88 : stIdx === 2 ? 83 : stIdx === 3 ? 78 : stIdx === 4 ? 74 : 68) + (sIdx === 3 || sIdx === 4 ? 4 : -2);
            return rndInt(rng, Math.max(48, baseVal - 4), Math.min(99, baseVal + 4));
          })
        )
      };
      D.heatmapStation = D.heatmapShop; // rétro-compatibilité
      D.heatmap = {
        semaines: reseauSemaines,
        sites: reseauSites.slice(0, 6),
        valeurs: reseauSites.slice(0, 6).map(() => [60, 75, 92, 85, 70, 75, 80, 85, 90])
      };

      // 6.G — CFD cumulée (entrées > sorties → WIP croissant)
      const entre = [];
      const sortie = [];
      let cumE = 0, cumS = 0;
      for (let d = 0; d < D.cfd.jours.length; d++) {
        const e = rndRange(rng, 11, 19);
        const s = e * rndRange(rng, 0.88, 0.97);
        entre.push(Math.round(e));
        sortie.push(Math.round(s));
        cumE += e; cumS += s;
      }
      D.cfd = { jours: D.cfd.jours, entre, sortie, cumIn: entre, cumOut: sortie };

      // 6.H — Treemap temps passé par type de moteur (niveau 1) et type de réparation (drill-down) sur un shop (S-MON)
      // Seuils trichromatiques : Vert < 8%, Jaune 8-15%, Rouge > 15%
      D.treemapShop = {
        shop: 'S-MON (Montereau)',
        moteurs: [
          {
            moteur: 'CFM56-7B',
            heures: rndInt(rng, 460, 520),
            retard: rndDec(rng, 16.5, 18.8), // > 15% -> Rouge critique
            reparations: [
              { type: 'T-AUBTUR (Usinage Aubes HP)', heures: rndInt(rng, 195, 235), retard: rndDec(rng, 18.5, 21.5) }, // Rouge (>15%)
              { type: 'T-COMHOT (Chambre Combustion)', heures: rndInt(rng, 135, 160), retard: rndDec(rng, 11.5, 14.2) }, // Jaune (8-15%)
              { type: 'T-FODREP (Réparation FOD)', heures: rndInt(rng, 70, 90), retard: rndDec(rng, 8.8, 11.2) }, // Jaune (8-15%)
              { type: 'T-INSCND (Inspection CND)', heures: rndInt(rng, 45, 60), retard: rndDec(rng, 5.5, 7.2) } // Vert (<8%)
            ]
          },
          {
            moteur: 'LEAP-1A',
            heures: rndInt(rng, 370, 430),
            retard: rndDec(rng, 17.5, 20.2), // > 15% -> Rouge critique
            reparations: [
              { type: 'T-AUBTUR (Usinage Aubes HP)', heures: rndInt(rng, 160, 190), retard: rndDec(rng, 20.0, 23.0) }, // Rouge (>15%)
              { type: 'T-COMHOT (Chambre Combustion)', heures: rndInt(rng, 115, 140), retard: rndDec(rng, 15.5, 18.0) }, // Rouge (>15%)
              { type: 'T-FODREP (Réparation FOD)', heures: rndInt(rng, 55, 75), retard: rndDec(rng, 10.0, 13.5) }, // Jaune (8-15%)
              { type: 'T-INSCND (Inspection CND)', heures: rndInt(rng, 30, 45), retard: rndDec(rng, 6.0, 7.8) } // Vert (<8%)
            ]
          },
          {
            moteur: 'CFM56-5B',
            heures: rndInt(rng, 275, 320),
            retard: rndDec(rng, 9.8, 12.5), // 8-15% -> Jaune (tension modérée)
            reparations: [
              { type: 'T-COMHOT (Chambre Combustion)', heures: rndInt(rng, 125, 150), retard: rndDec(rng, 11.5, 13.5) }, // Jaune
              { type: 'T-AUBTUR (Usinage Aubes HP)', heures: rndInt(rng, 85, 110), retard: rndDec(rng, 9.0, 11.2) }, // Jaune
              { type: 'T-FODREP (Réparation FOD)', heures: rndInt(rng, 55, 75), retard: rndDec(rng, 6.2, 7.6) } // Vert (<8%)
            ]
          },
          {
            moteur: 'LEAP-1B',
            heures: rndInt(rng, 220, 260),
            retard: rndDec(rng, 6.2, 7.8), // < 8% -> Vert (conforme)
            reparations: [
              { type: 'T-AUBTUR (Usinage Aubes HP)', heures: rndInt(rng, 100, 125), retard: rndDec(rng, 7.0, 7.9) }, // Vert
              { type: 'T-COMHOT (Chambre Combustion)', heures: rndInt(rng, 70, 95), retard: rndDec(rng, 6.0, 7.4) }, // Vert
              { type: 'T-FODREP (Réparation FOD)', heures: rndInt(rng, 45, 60), retard: rndDec(rng, 5.0, 6.5) } // Vert
            ]
          },
          {
            moteur: 'GE90-115B',
            heures: rndInt(rng, 145, 180),
            retard: rndDec(rng, 4.5, 6.8), // < 8% -> Vert (conforme)
            reparations: [
              { type: 'T-AUBTUR (Usinage Aubes HP)', heures: rndInt(rng, 80, 105), retard: rndDec(rng, 5.2, 6.9) }, // Vert
              { type: 'T-COMHOT (Chambre Combustion)', heures: rndInt(rng, 60, 80), retard: rndDec(rng, 3.8, 5.5) } // Vert
            ]
          }
        ]
      };
      D.goulots = D.treemapShop.moteurs.map(m => ({ poste: m.moteur, wip: m.heures, saturation: Math.round(m.retard * 5) }));

      // 4.I & 6.I — DGOV : Comparatif des 4 Méthodes de Calcul vs Référence Effectif
      const refTAT = 18.2;
      D.calculsTAT = [
        { code: '3.A', label: 'D-SOP', acronym: 'D-SOP', nom: 'S&OP (D-SOP)', tat: rndDec(rng, 15.0, 15.8), ref: refTAT, certitude: 85, completude: 98.5 },
        { code: '3.B', label: 'D-STA', acronym: 'D-STA', nom: 'Projection statistique (D-STA)', tat: rndDec(rng, 17.5, 18.2), ref: refTAT, certitude: 92, completude: 94.2 },
        { code: '3.C', label: 'D-CAP', acronym: 'D-CAP', nom: 'Projection capacitaire (D-CAP)', tat: rndDec(rng, 21.8, 22.8), ref: refTAT, certitude: 89, completude: 91.0 },
        { code: '3.D', label: 'D-ML', acronym: 'D-ML', nom: 'Modélisation avancée (D-ML)', tat: rndDec(rng, 18.3, 18.9), ref: refTAT, certitude: 95, completude: 93.4 }
      ].map(item => {
        const ecart = Math.round(((item.tat - item.ref) / item.ref) * 1000) / 10;
        return { ...item, ecart };
      });

      const refCapa = 124; // interventions mensuelles en shop
      D.calculsCapa = [
        { code: '5.A', label: 'C-SOP', acronym: 'C-SOP', nom: 'Capacité S&OP (C-SOP)', capa: rndInt(rng, 138, 145), ref: refCapa, certitude: 88, completude: 98.0 },
        { code: '5.B', label: 'C-STA', acronym: 'C-STA', nom: 'Projection statistique (C-STA)', capa: rndInt(rng, 112, 118), ref: refCapa, certitude: 91, completude: 97.4 },
        { code: '5.C', label: 'C-LOG', acronym: 'C-LOG', nom: 'Projection logistique (C-LOG)', capa: rndInt(rng, 105, 110), ref: refCapa, certitude: 90, completude: 95.2 },
        { code: '5.D', label: 'C-ML', acronym: 'C-ML', nom: 'Modélisation avancée (C-ML)', capa: rndInt(rng, 122, 128), ref: refCapa, certitude: 96, completude: 96.1 }
      ].map(item => {
        const ecart = Math.round(((item.capa - item.ref) / item.ref) * 1000) / 10;
        return { ...item, ecart };
      });

      return D;
    }

    function initMaestroData(cb) {
      if (M4DATA.base) { cb && cb(); return; }
      fetch('data.json')
        .then((res) => {
          if (!res.ok) throw new Error('HTTP ' + res.status);
          return res.json();
        })
        .then((base) => {
          M4DATA.base = base;
          M4DATA.data = buildMaestroData(base);
          cb && cb();
        })
        .catch((err) => {
          M4DATA.status = 'error:' + err.message;
          cb && cb();
        });
    }

    function maestroData() { return M4DATA.data; }

    // ---- helpers Chart.js ----
    const CHART_FONT = { family: 'ui-sans-serif, system-ui, sans-serif' };

    function baseChartOpts(extra) {
      if (typeof ChartDataLabels !== 'undefined' && typeof Chart !== 'undefined' && !Chart._maestroDatalabelsRegistered) {
        try { Chart.register(ChartDataLabels); Chart._maestroDatalabelsRegistered = true; } catch (e) {}
      }
      const extraPlugins = (extra && extra.plugins) || {};
      const mergedPlugins = Object.assign(
        {
          legend: { position: 'bottom', labels: { boxWidth: 9, boxHeight: 9, font: Object.assign({ size: 9 }, CHART_FONT), padding: 8 } },
          tooltip: { titleFont: Object.assign({ size: 10 }, CHART_FONT), bodyFont: Object.assign({ size: 9.5 }, CHART_FONT), boxPadding: 3, cornerRadius: 4 },
          datalabels: {
            display: (context) => {
              const ds = context.dataset;
              if (ds.datalabels && ds.datalabels.display !== undefined) return ds.datalabels.display;
              const val = ds.data[context.dataIndex];
              return val !== null && val !== undefined && val !== 0;
            },
            color: '#1e293b',
            font: { size: 9, weight: 'bold', family: CHART_FONT.family },
            anchor: 'end',
            align: 'top',
            offset: 2,
            formatter: (v) => {
              if (Array.isArray(v)) {
                const diff = Math.round(Math.abs(v[1] - v[0]) * 10) / 10;
                return diff + ' j';
              }
              if (typeof v === 'number') {
                return (Math.round(v * 10) / 10).toString();
              }
              return v;
            }
          }
        },
        extraPlugins
      );
      const res = Object.assign(
        {
          responsive: true,
          maintainAspectRatio: false,
          layout: { padding: { top: 16, bottom: 6, left: 6, right: 14 } },
          animation: { duration: 350 }
        },
        extra || {}
      );
      res.plugins = mergedPlugins;
      return res;
    }

    function destroyChart(canvas) {
      if (canvas && canvas._maestroChart) {
        try { canvas._maestroChart.destroy(); } catch (e) {}
        canvas._maestroChart = null;
      }
    }

    function renderChartInto(canvas, config) {
      if (!canvas || typeof Chart === 'undefined') return;
      destroyChart(canvas);
      try {
        canvas._maestroChart = new Chart(canvas, config);
      } catch (e) {
        console.warn('Chart.js render error:', e);
      }
    }

    function granLabel() {
      const q2 = selections[2] || 'A';
      return q2 === 'A' ? 'Grain Demande (MDT_MAINTENANCE_REQUEST)' : 'Grain Ligne Atelier (MDT_INTERVENTION)';
    }

    // ---- Construction des 16 graphiques (Étapes 4 et 6) : libellés ← D, chiffres ← seed ----
    function calc4A(p, mult) {
      const mk = (k) => p.map((x) => Math.round(x[k] * mult * 10) / 10);
      return {
        config: {
          type: 'bar',
          data: {
            labels: p.map((x) => x.famille),
            datasets: [
              { label: 'P5', data: mk('p5'), backgroundColor: '#94a3b8', borderRadius: 3 },
              { label: 'P50 (médian)', data: mk('p50'), backgroundColor: '#3b82f6', borderRadius: 3 },
              { label: 'P95', data: mk('p95'), backgroundColor: '#6366f1', borderRadius: 3 }
            ]
          },
          options: baseChartOpts({
            indexAxis: 'y',
            plugins: {
              datalabels: { anchor: 'end', align: 'right', offset: 2, formatter: (v) => v + ' j' }
            },
            scales: {
              x: { beginAtZero: true, title: { display: true, text: 'Axe X : Durée TAT (jours)', font: { size: 9.5, weight: 'bold' } }, ticks: { font: { size: 9 } } },
              y: { title: { display: true, text: 'Axe Y : Famille Moteur', font: { size: 9.5, weight: 'bold' } }, ticks: { font: Object.assign({ size: 10 }, CHART_FONT) } }
            }
          })
        },
        note: 'Barres de dispersion P5-P50-P95 : boîte de distribution du TAT par famille de moteur. P5 ≈ 60-70 % P50, P95 ≈ 140-165 % P50 (cohérence seed).'
      };
    }

    function calc4B(p, mult) {
      const mk = (k) => p.map((x) => Math.round(x[k] * mult * 10) / 10);
      return {
        config: {
          type: 'bar',
          data: {
            labels: p.map((x) => x.famille || x.site),
            datasets: [
              { label: 'Rép. Atelier', data: mk('reparation'), backgroundColor: '#3b82f6', stack: 't', borderRadius: 3 },
              { label: 'Validation/Appro', data: mk('attente'), backgroundColor: '#ef4444', stack: 't', borderRadius: 3 },
              { label: 'Transit', data: mk('transfert'), backgroundColor: '#f59e0b', stack: 't', borderRadius: 3 }
            ]
          },
          options: baseChartOpts({
            indexAxis: 'y',
            plugins: {
              datalabels: {
                anchor: 'center', align: 'center', color: '#ffffff',
                font: { size: 8.5, weight: 'bold' },
                formatter: (v) => (v >= 2 ? v + ' j' : '')
              }
            },
            scales: {
              x: { stacked: true, beginAtZero: true, title: { display: true, text: 'Axe X : Jours TAT cumulés décomposés (jours)', font: { size: 9.5, weight: 'bold' } }, ticks: { font: { size: 9 } } },
              y: { stacked: true, title: { display: true, text: 'Axe Y : Famille Moteur (ENGINE_TYPE)', font: { size: 9.5, weight: 'bold' } }, ticks: { font: Object.assign({ size: 9.5 }, CHART_FONT) } }
            }
          })
        },
        note: 'Barres empilées par type de moteur : révision atelier + attente appro/validation + transit. La part d\'attente révèle les goulots hors atelier pour chaque motorisation.'
      };
    }

    function calc4C(p, mult) {
      const labels = p.map((c) => c.nom + ' (' + c.code + ')');
      const mk = (k, r = 1) => p.map((c) => Math.round(c[k] * r * 10) / 10);
      return {
        config: {
          data: {
            labels,
            datasets: [
              { type: 'bar', label: 'Contractuel', data: mk('contrat'), backgroundColor: '#10b981', borderRadius: 3 },
              { type: 'bar', label: 'Effectif', data: mk('effectif'), backgroundColor: '#3b82f6', borderRadius: 3 },
              { type: 'line', label: '% Non-Respect SLA', data: mk('nonRespect'), borderColor: '#dc2626', backgroundColor: '#dc2626', borderWidth: 2, yAxisID: 'y1', tension: 0.3, pointRadius: 3 }
            ]
          },
          options: baseChartOpts({
            plugins: {
              datalabels: {
                align: (ctx) => ctx.dataset.type === 'line' ? 'top' : 'end',
                anchor: (ctx) => ctx.dataset.type === 'line' ? 'center' : 'end',
                formatter: (v, ctx) => ctx.dataset.type === 'line' ? v + ' %' : v + ' j'
              }
            },
            scales: {
              x: { title: { display: true, text: 'Axe X : Compagnies Aériennes', font: { size: 9.5, weight: 'bold' } }, ticks: { font: Object.assign({ size: 9 }, CHART_FONT) }, grid: { display: false } },
              y: { beginAtZero: true, title: { display: true, text: 'Axe Y1 : TAT Moyen (jours)', font: { size: 9.5, weight: 'bold' } }, ticks: { font: { size: 9 } } },
              y1: { position: 'right', min: 0, beginAtZero: true, title: { display: true, text: 'Axe Y2 : Non-Respect SLA (%)', font: { size: 9.5, weight: 'bold' } }, grid: { drawOnChartArea: false }, ticks: { font: { size: 9 } } }
            }
          })
        },
        note: 'Écart TAT contractuel vs effectif couplé au taux de non-respect SLA (ligne rouge, axe droite). Ryanair (RYR) présente le dépassement le plus marqué.'
      };
    }

    function calc4D(p, mult) {
      const rows = p.map((a, i) => ({ a, i, v: a.retard * mult })).sort((x, y) => y.v - x.v);
      const colors = { 'AOG Critique': '#ef4444', 'En Retard': '#f59e0b', 'En Cours': '#3b82f6', 'Conforme': '#10b981' };
      return {
        config: {
          type: 'bar',
          data: {
            labels: rows.map((r) => (r.a.id_demande || r.a.esn) + ' (' + r.a.id_moteur + ') · ' + r.a.client + ' · ' + r.a.site),
            datasets: [
              {
                label: 'Retard (j)',
                data: rows.map((r) => Math.round(r.v * 10) / 10),
                backgroundColor: rows.map((r) => colors[r.a.statut || r.a.priorite] || '#94a3b8'),
                borderRadius: 3
              }
            ]
          },
          options: baseChartOpts({
            indexAxis: 'y',
            plugins: {
              tooltip: {
                callbacks: {
                  afterLabel: (ctx) => {
                    const a = rows[ctx.dataIndex];
                    return `Demande : ${a.a.id_demande || a.a.esn} (${a.a.id_moteur})\nPriorité/Statut : ${a.a.priorite || a.a.statut}\nTAT : ${a.a.tat_realise_j || a.a.tat} j\nPénalités : ${(a.a.penalites_eur || a.a.penalites).toLocaleString('fr-FR')} €`;
                  }
                }
              }
            },
            plugins: {
              datalabels: { anchor: 'end', align: 'right', offset: 2, formatter: (v) => v > 0 ? '+' + v + ' j' : '0 j' }
            },
            scales: {
              x: { beginAtZero: true, title: { display: true, text: 'Axe X : Retard au-delà du SLA (jours)', font: { size: 9.5, weight: 'bold' } }, ticks: { font: { size: 9 } } },
              y: { title: { display: true, text: 'Axe Y : Demande (ESN) · Client · Site', font: { size: 9.5, weight: 'bold' } }, ticks: { font: { size: 8.5 } } }
            }
          })
        },
        note: 'Listing des demandes trié par retard décroissant (rouge = AOG Critique, orange = En Retard). Passer la souris : TAT et pénalités estimées.'
      };
    }

function calc4E(k, labels, mult) {
      const items = [
        { label: labels.tatMoyen, val: k.tatMoyen * mult, ref: k.tatCible },
        { label: labels.slaRespect, val: k.slaRespect, ref: k.slaCible },
        { label: labels.deriveEncours, val: k.deriveEncours * mult, ref: k.deriveSeuil }
      ];
      return {
        config: {
          type: 'bar',
          data: {
            labels: items.map((i) => i.label),
            datasets: [
              { label: 'Valeur Réelle', data: items.map((i) => Math.round(i.val * 10) / 10), backgroundColor: '#3b82f6', borderRadius: 3 },
              { label: 'Cible / Seuil', data: items.map((i) => i.ref), backgroundColor: '#cbd5e1', borderRadius: 3 }
            ]
          },
          options: baseChartOpts({
            indexAxis: 'y',
            plugins: {
              datalabels: {
                anchor: 'end', align: 'right', offset: 2,
                formatter: (v, ctx) => ctx.dataIndex === 1 ? v + ' %' : v + ' j'
              }
            },
            scales: {
              x: { beginAtZero: true, title: { display: true, text: 'Axe X : Valeurs Mesurées vs Cibles (jours ou %)', font: { size: 9.5, weight: 'bold' } }, ticks: { font: { size: 9 } } },
              y: { title: { display: true, text: 'Axe Y : Indicateurs Clés MRO', font: { size: 9.5, weight: 'bold' } }, ticks: { font: { size: 9 } } }
            }
          })
        },
        note: 'Agrégats scalaires hétérogènes (jours / %) regroupés pour la synthèse : la valeur réelle est toujours comparée à sa cible contractuelle ou à son seuil d\'alerte.'
      };
    }

    function calc4F(p, mult) {
      const mk = p.map((m) => Math.round(m.tat * mult * 10) / 10);
      return {
        config: {
          type: 'bar',
          data: {
            labels: p.map((m) => m.module),
            datasets: [
              {
                label: 'TAT Réalisé (j)',
                data: mk,
                backgroundColor: p.map((m, i) => (mk[i] > m.seuil ? '#ef4444' : mk[i] > m.seuil - 3 ? '#f59e0b' : '#3b82f6')),
                borderRadius: 3
              },
              { label: 'Seuil P85', data: p.map((m) => m.seuil), type: 'line', borderColor: '#dc2626', borderWidth: 2, borderDash: [5, 4], pointRadius: 0, backgroundColor: '#dc2626' }
            ]
          },
          options: baseChartOpts({
            indexAxis: 'y',
            plugins: {
              datalabels: {
                display: (ctx) => ctx.datasetIndex === 0,
                anchor: 'end', align: 'right', offset: 2, formatter: (v) => v + ' j'
              }
            },
            scales: {
              x: { beginAtZero: true, max: 35, title: { display: true, text: 'Axe X : TAT Total Moteur Réalisé vs Seuil P85 (jours)', font: { size: 9.5, weight: 'bold' } }, ticks: { font: { size: 9 } } },
              y: { title: { display: true, text: 'Axe Y : Famille Moteur (ENGINE_TYPE)', font: { size: 9.5, weight: 'bold' } }, ticks: { font: Object.assign({ size: 9 }, CHART_FONT) } }
            }
          })
        },
        note: 'Durée globale réelle par type de moteur face au seuil contractuel P85. Barres rouges = motorisations dépassant la tolérance contractuelle.'
      };
    }

    function calc4G(w, mult) {
      const labels = [w.cibleLabel, ...w.etapes.map((e) => e.etape), 'TAT Réel'];
      const floats = [[0, Math.round(w.cible * mult * 10) / 10]];
      const colors = ['#cbd5e1'];
      let run = w.cible;
      w.etapes.forEach((e) => {
        const rel = e.rel * mult;
        const from = Math.round(run * 10) / 10;
        const to = Math.round((run + rel) * 10) / 10;
        if (rel >= 0) { floats.push([from, to]); colors.push('#ef4444'); }
        else { floats.push([to, from]); colors.push('#10b981'); }
        run += rel;
      });
      floats.push([0, Math.max(0, Math.round(run * 10) / 10)]);
      colors.push('#1e40af');
      return {
        config: {
          type: 'bar',
          data: {
            labels,
            datasets: [
              {
                label: 'Jours cumulés',
                data: floats,
                backgroundColor: colors,
                borderRadius: 3,
                tooltip: {
                  callbacks: {
                    label: (ctx) => {
                      const idx = ctx.dataIndex;
                      if (idx === 0) return 'TAT Cible : ' + floats[idx][1] + ' j';
                      if (idx === labels.length - 1) return 'TAT Réel : ' + floats[idx][1] + ' j';
                      const rel = (floats[idx][1] - floats[idx][0]) * (floats[idx][1] >= floats[idx][0] ? 1 : -1);
                      return 'Variation : ' + Math.round(rel * 10) / 10 + ' j';
                    }
                  }
                }
              }
            ]
          },
          options: baseChartOpts({
            plugins: {
              datalabels: {
                anchor: 'end', align: 'top', offset: 2,
                formatter: (v, ctx) => {
                  const idx = ctx.dataIndex;
                  if (idx === 0) return floats[idx][1] + ' j';
                  if (idx === labels.length - 1) return floats[idx][1] + ' j';
                  const rel = (floats[idx][1] - floats[idx][0]) * (floats[idx][1] >= floats[idx][0] ? 1 : -1);
                  const rounded = Math.round(rel * 10) / 10;
                  return (rounded >= 0 ? '+' : '') + rounded + ' j';
                }
              }
            },
            scales: {
              x: { title: { display: true, text: 'Axe X : Étapes et Dérives TAT', font: { size: 9.5, weight: 'bold' } }, ticks: { font: { size: 8.5 } } },
              y: { beginAtZero: true, title: { display: true, text: 'Axe Y : Durée Cumulée (jours)', font: { size: 9.5, weight: 'bold' } }, ticks: { font: { size: 9 } } }
            }
          })
        },
        note: 'Cascade : le TAT réel = cible + attentes pièces + aléas CND ± fast-track ± dérives logistiques. Barres vertes = réduction, rouges = dérive.'
      };
    }

    function calc4H(hmNetwork, mult) {
      const netData = hmNetwork || (maestroData() && maestroData().heatmapNetwork) || {
        semaines: ['S34', 'S35', 'S36', 'S37', 'S38', 'S39', 'S40', 'S41', 'S42'],
        sites: [
          'S-VIL (Villaroche)',
          'S-MON (Montereau)',
          'S-CHL (Châtellerault)',
          'S-BRU (Bruxelles)',
          'S-SQY (Saint-Quentin)',
          'S-GEN (Gennevilliers)',
          'S-BDX (Bordeaux)',
          'S-TLS (Toulouse)',
          'S-LGG (Liège)',
          'S-CRE (Le Creusot)'
        ],
        valeurs: [
          [92, 94, 98, 97, 95, 91, 88, 86, 84],
          [95, 97, 99, 101, 98, 96, 92, 89, 87],
          [82, 85, 88, 89, 86, 84, 80, 78, 75],
          [91, 93, 96, 95, 92, 88, 84, 81, 79],
          [74, 76, 79, 81, 78, 75, 73, 70, 68],
          [79, 83, 86, 88, 85, 81, 77, 75, 72],
          [68, 71, 74, 76, 73, 70, 68, 66, 64],
          [75, 78, 82, 84, 81, 78, 75, 72, 70],
          [76, 79, 83, 85, 82, 79, 76, 74, 71],
          [65, 68, 71, 73, 70, 67, 65, 63, 61]
        ]
      };

      const isMatrixAvailable = typeof Chart !== 'undefined' && Chart.registry && Chart.registry.controllers && Chart.registry.controllers.get('matrix');
      // Échelle trichromatique : Vert (< 80%), Jaune (80-95%), Rouge (> 95%)
      const colorByTension = (v) => (v > 95 ? '#ef4444' : v >= 80 ? '#f59e0b' : '#10b981');

      if (isMatrixAvailable) {
        const matrixData = [];
        netData.sites.forEach((site, sIdx) => {
          netData.semaines.forEach((sem, wIdx) => {
            const rawVal = (netData.valeurs[sIdx] && netData.valeurs[sIdx][wIdx]) || 75;
            const v = Math.round(clampN(rawVal * (0.95 + (mult - 1) * 0.1), 30, 115));
            matrixData.push({ x: sem, y: site, v: v });
          });
        });

        return {
          config: {
            type: 'matrix',
            data: {
              datasets: [{
                label: 'Occupation Réseau (%)',
                data: matrixData,
                backgroundColor(c) {
                  const val = c.raw ? c.raw.v : 0;
                  return colorByTension(val);
                },
                borderColor: '#ffffff',
                borderWidth: 1.5,
                borderRadius: 3,
                width({ chart }) {
                  const a = chart.chartArea;
                  return a ? Math.max(10, (a.right - a.left) / netData.semaines.length - 3) : 24;
                },
                height({ chart }) {
                  const a = chart.chartArea;
                  return a ? Math.max(12, (a.bottom - a.top) / netData.sites.length - 2.5) : 22;
                }
              }]
            },
            options: baseChartOpts({
              plugins: {
                legend: { display: false },
                tooltip: {
                  callbacks: {
                    title: (items) => items[0] && items[0].raw ? `${items[0].raw.y} • Semaine ${items[0].raw.x}` : '',
                    label: (item) => {
                      if (!item.raw) return '';
                      const v = item.raw.v;
                      const statut = v > 95 ? '🚨 Surcharge critique (>95%)' : v >= 80 ? '⚠️ Tension capacitaire (80-95%)' : '🟢 Charge fluide (<80%)';
                      return [`Taux d'occupation : ${v} %`, `Statut : ${statut}`];
                    }
                  }
                },
                datalabels: {
                  display: true,
                  color: '#ffffff',
                  font: { size: 8.5, weight: 'bold' },
                  anchor: 'center',
                  align: 'center',
                  formatter: (v) => (v && v.v !== undefined) ? v.v + '%' : ''
                }
              },
              scales: {
                x: {
                  type: 'category',
                  labels: netData.semaines,
                  title: { display: true, text: 'Axe X : Semaines Calendaires (S34 à S42)', font: { size: 9.5, weight: 'bold' } },
                  ticks: { font: Object.assign({ size: 9 }, CHART_FONT) },
                  grid: { display: false }
                },
                y: {
                  type: 'category',
                  labels: netData.sites,
                  offset: true,
                  title: { display: true, text: 'Axe Y : Centres MRO SAE (10 sites réseau)', font: { size: 9.5, weight: 'bold' } },
                  ticks: { font: Object.assign({ size: 8.5, weight: 'bold' }, CHART_FONT) },
                  grid: { display: false }
                }
              }
            })
          },
          note: 'Heatmap d\'occupation réseau des 10 centres SAE MRO (Y) par semaine S34..S42 (X) : Vert (<80%) = capacité fluide, Jaune (80-95%) = tension capacitaire, Rouge (>95%) = saturation critique (S-VIL, S-MON).'
        };
      }

      // Fallback en barres groupées
      const rows = netData.sites.map((site, sIdx) => ({
        label: site,
        data: netData.valeurs[sIdx].map((v) => Math.round(clampN(v * (0.95 + (mult - 1) * 0.1), 0, 115)))
      }));

      return {
        config: {
          type: 'bar',
          data: {
            labels: netData.semaines,
            datasets: rows.map((r) => ({
              label: r.label,
              data: r.data,
              backgroundColor: colorByTension(r.data.reduce((a, b) => a + b, 0) / r.data.length),
              borderRadius: 2
            }))
          },
          options: baseChartOpts({
            plugins: {
              legend: { position: 'bottom', labels: { boxWidth: 8, boxHeight: 8, font: { size: 8 } } },
              datalabels: {
                display: (ctx) => ctx.dataset.data[ctx.dataIndex] >= 95,
                anchor: 'end', align: 'top', offset: 1, font: { size: 7.5, weight: 'bold' },
                formatter: (v) => v + '%'
              },
              tooltip: { callbacks: { label: (ctx) => ctx.dataset.label + ' : ' + ctx.parsed.y + ' %' } }
            },
            scales: {
              x: { title: { display: true, text: 'Axe X : Semaines S34..S42', font: { size: 9.5, weight: 'bold' } }, ticks: { font: Object.assign({ size: 8.5 }, CHART_FONT) }, grid: { display: false } },
              y: { min: 0, max: 115, title: { display: true, text: 'Axe Y : Taux d\'Occupation (%)', font: { size: 9.5, weight: 'bold' } }, ticks: { font: { size: 8.5 } } }
            }
          })
        },
        note: 'Heatmap d\'occupation réseau par semaine : Vert < 80 %, Jaune 80-95 %, Rouge > 95 %.'
      };
    }

    function calc4I(p, mult) {
      const labels = p.map((m) => m.label);
      const tatSimule = p.map((m) => Math.round(m.tat * mult * 10) / 10);
      const refEffectif = p.map((m) => m.ref);
      const ecartPct = p.map((m) => {
        const val = Math.round(m.tat * mult * 10) / 10;
        return Math.round(((val - m.ref) / m.ref) * 1000) / 10;
      });

      return {
        config: {
          data: {
            labels,
            datasets: [
              {
                type: 'bar',
                label: 'TAT Estimé Méthode (j)',
                data: tatSimule,
                backgroundColor: ['#94a3b8', '#3b82f6', '#f59e0b', '#10b981'],
                borderRadius: 4,
                yAxisID: 'y'
              },
              {
                type: 'line',
                label: 'TAT Effectif Référence (18.2 j)',
                data: refEffectif,
                borderColor: '#64748b',
                borderWidth: 2,
                borderDash: [5, 4],
                pointRadius: 0,
                fill: false,
                yAxisID: 'y'
              },
              {
                type: 'line',
                label: '% Écart vs Effectif',
                data: ecartPct,
                borderColor: '#dc2626',
                backgroundColor: '#dc2626',
                borderWidth: 2.5,
                tension: 0.25,
                pointRadius: 4,
                pointBackgroundColor: '#dc2626',
                yAxisID: 'y1'
              }
            ]
          },
          options: baseChartOpts({
            plugins: {
              datalabels: {
                align: (ctx) => ctx.datasetIndex === 2 ? (ctx.dataset.data[ctx.dataIndex] >= 0 ? 'top' : 'bottom') : 'end',
                anchor: (ctx) => ctx.datasetIndex === 2 ? 'center' : 'end',
                offset: 2,
                formatter: (v, ctx) => {
                  if (ctx.datasetIndex === 0) return v + ' j';
                  if (ctx.datasetIndex === 2) return (v >= 0 ? '+' : '') + v + ' %';
                  return '';
                }
              },
              tooltip: {
                callbacks: {
                  afterBody: (items) => {
                    const idx = items[0].dataIndex;
                    const item = p[idx];
                    return `• Méthode : ${item.nom}\n• Degré de certitude : ${item.certitude} %\n• Complétude saisies : ${item.completude} %`;
                  }
                }
              }
            },
            scales: {
              x: {
                title: { display: true, text: 'Axe X : Méthodes de Calcul de TAT (D-SOP, D-STA, D-CAP, D-ML)', font: { size: 9.5, weight: 'bold' } },
                ticks: { font: Object.assign({ size: 9 }, CHART_FONT) },
                grid: { display: false }
              },
              y: {
                beginAtZero: true,
                max: 30,
                title: { display: true, text: 'Axe Y1 : TAT Moyen Prévu (jours)', font: { size: 9.5, weight: 'bold' } },
                ticks: { font: { size: 9 } }
              },
              y1: {
                position: 'right',
                title: { display: true, text: 'Axe Y2 : % Variance vs Réel (%)', font: { size: 9.5, weight: 'bold' } },
                grid: { drawOnChartArea: false },
                ticks: { font: { size: 9 }, callback: (v) => v + '%' }
              }
            }
          })
        },
        note: 'Benchmark des 4 méthodes de calcul (D-SOP, D-STA, D-CAP, D-ML) face au TAT réel de référence (18.2 j). L\'écart le plus faible est obtenu avec D-ML (+2.2%) avec un taux de complétude des saisies de 93.4%.'
      };
    }

    function calc6A(retardShops, mult) {
      const labels = retardShops.map((r) => r.nom || r.code || r.shop);
      const data = retardShops.map((r) => Math.round(r.taux_retard * (0.85 + mult / 3) * 10) / 10);
      const seuil = 10;
      return {
        config: {
          type: 'bar',
          data: {
            labels,
            datasets: [
              {
                label: '% Interventions en Retard',
                data,
                backgroundColor: data.map((v) => (v >= 15 ? '#ef4444' : v >= 10 ? '#f59e0b' : '#3b82f6')),
                borderRadius: 4
              },
              {
                type: 'line',
                label: 'Seuil tolérance (10%)',
                data: labels.map(() => seuil),
                borderColor: '#dc2626',
                borderWidth: 2,
                borderDash: [5, 4],
                pointRadius: 0,
                fill: false
              }
            ]
          },
          options: baseChartOpts({
            plugins: {
              datalabels: {
                display: (ctx) => ctx.datasetIndex === 0,
                anchor: 'end',
                align: 'top',
                offset: 2,
                formatter: (v) => v + ' %'
              }
            },
            scales: {
              x: { title: { display: true, text: 'Axe X : Centre & Atelier Shop (S-XXX)', font: { size: 9.5, weight: 'bold' } }, ticks: { font: Object.assign({ size: 8.5 }, CHART_FONT) }, grid: { display: false } },
              y: { beginAtZero: true, max: 25, title: { display: true, text: 'Axe Y : Taux d\'Interventions en Retard (%)', font: { size: 9.5, weight: 'bold' } }, ticks: { font: { size: 9 } } }
            }
          })
        },
        note: 'Taux de retard par shop face au seuil contractuel de 10% : rouge = alerte critique (retard ≥ 15%), ambre = tension (≥ 10%), bleu = sous contrôle (< 10%).'
      };
    }

    function calc6B(ops, mult) {
      const labels = ops.map((o) => o.operation);
      const cfm = ops.map((o) => Math.round(o.cfm * (0.85 + mult / 3) * 10) / 10);
      const leap = ops.map((o) => Math.round(o.leap * (0.85 + mult / 3) * 10) / 10);
      return {
        config: {
          type: 'bar',
          data: {
            labels,
            datasets: [
              { label: 'CFM56 (% retard)', data: cfm, backgroundColor: '#3b82f6', borderRadius: 3 },
              { label: 'LEAP (% retard)', data: leap, backgroundColor: '#f59e0b', borderRadius: 3 }
            ]
          },
          options: baseChartOpts({
            plugins: {
              datalabels: {
                anchor: 'end', align: 'top', offset: 2,
                formatter: (v) => v + ' %'
              }
            },
            scales: {
              x: { title: { display: true, text: 'Axe X : Type de Réparation (T-XXXXXX)', font: { size: 9.5, weight: 'bold' } }, ticks: { font: Object.assign({ size: 8.5 }, CHART_FONT) }, grid: { display: false } },
              y: { beginAtZero: true, title: { display: true, text: 'Axe Y : % Retard Imprévu (%)', font: { size: 9.5, weight: 'bold' } }, ticks: { font: { size: 9 } } }
            }
          })
        },
        note: 'Taux d\'interventions subissant un aléa ou dérive imprévue par type de réparation (T-XXXXXX), comparé entre CFM56 et LEAP.'
      };
    }

    function calc6C(p, mult) {
      const pctData = p.map((r) => Math.round(r.pct * (0.9 + mult / 4) * 10) / 10);
      return {
        config: {
          data: {
            labels: p.map((r) => r.route),
            datasets: [
              { type: 'bar', label: '% Flux inter-sites', data: pctData, backgroundColor: '#3b82f6', borderRadius: 3, xAxisID: 'x' },
              { type: 'line', label: 'Délai navette (j)', data: p.map((r) => r.delai), borderColor: '#f59e0b', backgroundColor: '#f59e0b', borderWidth: 2, tension: 0.3, pointRadius: 3, xAxisID: 'x1' }
            ]
          },
          options: baseChartOpts({
            indexAxis: 'y',
            plugins: {
              datalabels: {
                align: 'right', anchor: 'end', offset: 2,
                formatter: (v, ctx) => ctx.datasetIndex === 0 ? v + ' %' : v + ' j'
              }
            },
            scales: {
              x: { id: 'x', beginAtZero: true, max: 50, title: { display: true, text: 'Axe X1 (Bas) : Part du Flux Logistique (%)', font: { size: 9.5, weight: 'bold' } }, ticks: { font: { size: 9 } } },
              x1: { id: 'x1', position: 'top', beginAtZero: true, max: 5, grid: { drawOnChartArea: false }, title: { display: true, text: 'Axe X2 (Haut) : Délai Navette (jours)', font: { size: 9.5, weight: 'bold' } }, ticks: { font: { size: 9 } } },
              y: { title: { display: true, text: 'Axe Y : Navettes & Transits Inter-Sites', font: { size: 9.5, weight: 'bold' } }, ticks: { font: { size: 8.5 } } }
            }
          })
        },
        note: 'Concentration des flux logistiques entre centres : barres = part du flux, ligne (axe supérieur) = délai de la navette. Le delta logistique pèse sur le TAT.'
      };
    }

    function calc6D(decompo, mult) {
      const rows = (decompo || []).map(d => ({
        shop: d.shop,
        attente: Math.round(d.attente * (0.9 + mult / 4) * 10) / 10,
        reparation: Math.round(d.reparation * (0.95 + mult / 5) * 10) / 10,
        transfert: Math.round(d.transfert * 10) / 10
      }));

      return {
        config: {
          type: 'bar',
          data: {
            labels: rows.map(r => r.shop),
            datasets: [
              {
                label: 'Attente File & Pièces (h)',
                data: rows.map(r => r.attente),
                backgroundColor: '#f59e0b',
                borderRadius: 2
              },
              {
                label: 'Réparation Effectif VA (h)',
                data: rows.map(r => r.reparation),
                backgroundColor: '#3b82f6',
                borderRadius: 2
              },
              {
                label: 'Transfert Logistique (h)',
                data: rows.map(r => r.transfert),
                backgroundColor: '#8b5cf6',
                borderRadius: 2
              }
            ]
          },
          options: baseChartOpts({
            indexAxis: 'y',
            plugins: {
              datalabels: {
                display: false
              },
              tooltip: {
                callbacks: {
                  footer: (items) => {
                    const idx = items[0].dataIndex;
                    const r = rows[idx];
                    const total = Math.round((r.attente + r.reparation + r.transfert) * 10) / 10;
                    return `• Total intervention : ${total} heures`;
                  }
                }
              }
            },
            scales: {
              x: { stacked: true, beginAtZero: true, title: { display: true, text: 'Axe X : Heures Moyennes de Traitement par Intervention', font: { size: 9.5, weight: 'bold' } }, ticks: { font: { size: 9 } } },
              y: { stacked: true, title: { display: true, text: 'Axe Y : Centres & Ateliers MRO (S-XXX)', font: { size: 9.5, weight: 'bold' } }, ticks: { font: { size: 8.5 } } }
            }
          })
        },
        note: 'Décomposition du délai moyen par shop : attente file/appro (ambre), usinage/réparation VA (bleu), transit inter-sites (violet).'
      };
    }

    function calc6E(stations, mult) {
      const dataRows = (stations || []).map(s => ({
        label: s.nom || s.station || s.id_station,
        charge: Math.round(s.charge * (0.95 + mult / 10)),
        seuil: s.seuil || 85
      }));

      return {
        config: {
          type: 'bar',
          data: {
            labels: dataRows.map(r => r.label),
            datasets: [
              {
                label: 'Taux de Charge (%)',
                data: dataRows.map(r => r.charge),
                backgroundColor: dataRows.map(r => r.charge >= r.seuil ? '#ef4444' : r.charge >= 80 ? '#f59e0b' : '#3b82f6'),
                borderRadius: 3
              },
              {
                type: 'line',
                label: 'Seuil Saturation (85%)',
                data: dataRows.map(r => r.seuil),
                borderColor: '#dc2626',
                borderWidth: 2,
                borderDash: [5, 4],
                pointRadius: 0,
                fill: false
              }
            ]
          },
          options: baseChartOpts({
            indexAxis: 'y',
            plugins: {
              datalabels: {
                anchor: 'end',
                align: 'right',
                offset: 2,
                formatter: (v, ctx) => ctx.datasetIndex === 0 ? v + ' %' : ''
              }
            },
            scales: {
              x: { min: 0, max: 105, title: { display: true, text: 'Axe X : Taux de Charge Station vs Seuil 85% (%)', font: { size: 9.5, weight: 'bold' } }, ticks: { font: { size: 9 } } },
              y: { title: { display: true, text: 'Axe Y : Stations de Réparation (S-XXX-YY)', font: { size: 9.5, weight: 'bold' } }, ticks: { font: { size: 8.5 } } }
            }
          })
        },
        note: 'Taux de charge par station de réparation face au seuil de 85% (ligne rouge) : les postes en surchauffe apparaissent en rouge.'
      };
    }

    function calc6F(hm, mult) {
      const shopData = hm || (maestroData() && maestroData().heatmapShop) || {
        shop: 'S-MON (Montereau)',
        semaines: ['S34', 'S35', 'S36', 'S37', 'S38', 'S39', 'S40', 'S41', 'S42'],
        stations: [
          'S-MON-01 (Aubes HP)',
          'S-MON-02 (Combustion)',
          'S-MON-03 (Ressuage CND)',
          'S-MON-04 (Usinage Tour CN)',
          'S-MON-05 (Équilibrage)',
          'S-MON-06 (Recette & FOD)'
        ],
        valeurs: [
          [92, 94, 98, 97, 95, 91, 88, 86, 84],
          [85, 88, 91, 89, 87, 85, 82, 80, 78],
          [78, 84, 88, 86, 83, 80, 78, 76, 74],
          [72, 79, 84, 80, 78, 75, 73, 71, 69],
          [68, 74, 80, 78, 75, 72, 70, 68, 65],
          [62, 69, 75, 73, 70, 67, 65, 62, 59]
        ]
      };

      const semaines = shopData.semaines || shopData.jours || ['S34', 'S35', 'S36', 'S37', 'S38', 'S39', 'S40', 'S41', 'S42'];

      const isMatrixAvailable = typeof Chart !== 'undefined' && Chart.registry && Chart.registry.controllers && Chart.registry.controllers.get('matrix');
      const colorsByValue = (v) => (v >= 90 ? '#dc2626' : v >= 85 ? '#ef4444' : v >= 75 ? '#f59e0b' : v >= 60 ? '#3b82f6' : '#10b981');

      if (isMatrixAvailable) {
        const matrixData = [];
        shopData.stations.forEach((station, sIdx) => {
          semaines.forEach((sem, jIdx) => {
            const rawVal = (shopData.valeurs[sIdx] && shopData.valeurs[sIdx][jIdx]) || 70;
            const v = Math.round(clampN(rawVal * (0.9 + mult / 3), 10, 100));
            matrixData.push({ x: sem, y: station, v: v });
          });
        });

        return {
          config: {
            type: 'matrix',
            data: {
              datasets: [{
                label: 'Tension Station (%)',
                data: matrixData,
                backgroundColor(c) {
                  const val = c.raw ? c.raw.v : 0;
                  return colorsByValue(val);
                },
                borderColor: '#ffffff',
                borderWidth: 1.5,
                borderRadius: 3,
                width({ chart }) {
                  const a = chart.chartArea;
                  return a ? Math.max(12, (a.right - a.left) / semaines.length - 3) : 24;
                },
                height({ chart }) {
                  const a = chart.chartArea;
                  return a ? Math.max(16, (a.bottom - a.top) / shopData.stations.length - 3) : 28;
                }
              }]
            },
            options: baseChartOpts({
              plugins: {
                legend: { display: false },
                tooltip: {
                  callbacks: {
                    title: (items) => items[0] && items[0].raw ? `${items[0].raw.y} • Semaine ${items[0].raw.x}` : '',
                    label: (item) => item.raw ? `Occupation : ${item.raw.v} % (Shop ${shopData.shop})` : ''
                  }
                },
                datalabels: {
                  display: true,
                  color: '#ffffff',
                  font: { size: 9, weight: 'bold' },
                  anchor: 'center',
                  align: 'center',
                  formatter: (v) => (v && v.v !== undefined) ? v.v + '%' : ''
                }
              },
              scales: {
                x: {
                  type: 'category',
                  labels: semaines,
                  title: { display: true, text: 'Axe X : Semaines Calendaires S34..S42 (' + (shopData.shop || 'Shop S-MON') + ')', font: { size: 9.5, weight: 'bold' } },
                  ticks: { font: Object.assign({ size: 9 }, CHART_FONT) },
                  grid: { display: false }
                },
                y: {
                  type: 'category',
                  labels: shopData.stations,
                  offset: true,
                  title: { display: true, text: 'Axe Y : Stations de Réparation du Shop (S-XXX-YY)', font: { size: 9.5, weight: 'bold' } },
                  ticks: { font: Object.assign({ size: 9, weight: 'bold' }, CHART_FONT) },
                  grid: { display: false }
                }
              }
            })
          },
          note: 'Heatmap d\'occupation des stations du shop ' + (shopData.shop || 'S-MON') + ' : matrice thermique avec les stations en axe Y et les semaines S34 à S42 en axe X. S-MON-01 (Aubes HP) sature en milieu de période (rouge ≥ 90%).'
        };
      }

      // Fallback en barres groupées
      const rows = shopData.stations.map((station, sIdx) => ({
        label: station,
        data: shopData.valeurs[sIdx].map((v) => Math.round(clampN(v * (0.9 + mult / 3), 0, 100)))
      }));

      return {
        config: {
          type: 'bar',
          data: {
            labels: semaines,
            datasets: rows.map((r) => ({
              label: r.label,
              data: r.data,
              backgroundColor: colorsByValue(r.data.reduce((a, b) => a + b, 0) / r.data.length),
              borderRadius: 2
            }))
          },
          options: baseChartOpts({
            plugins: {
              legend: { position: 'bottom', labels: { boxWidth: 8, boxHeight: 8, font: { size: 8 } } },
              datalabels: {
                display: (ctx) => ctx.dataset.data[ctx.dataIndex] >= 85,
                anchor: 'end', align: 'top', offset: 1, font: { size: 8, weight: 'bold' },
                formatter: (v) => v + '%'
              },
              tooltip: { callbacks: { label: (ctx) => ctx.dataset.label + ' : ' + ctx.parsed.y + ' %' } }
            },
            scales: {
              x: { title: { display: true, text: 'Axe X : Semaines S34..S42 (' + (shopData.shop || 'Shop S-MON') + ')', font: { size: 9.5, weight: 'bold' } }, ticks: { font: Object.assign({ size: 8.5 }, CHART_FONT) }, grid: { display: false } },
              y: { min: 0, max: 105, title: { display: true, text: 'Axe Y : Taux d\'Occupation Stations (%)', font: { size: 9.5, weight: 'bold' } }, ticks: { font: { size: 8.5 } } }
            }
          })
        },
        note: 'Occupation des stations du shop ' + (shopData.shop || 'S-MON') + ' par semaine S34..S42 : rouge ≥ 90 %, orange ≥ 85 %.'
      };
    }

    function calc6G(cfd) {
      return {
        config: {
          type: 'line',
          data: {
            labels: cfd.jours,
            datasets: [
              { label: 'Cumul entrées', data: cfd.cumIn, borderColor: '#3b82f6', backgroundColor: 'rgba(59,130,246,0.12)', fill: true, tension: 0.35, pointRadius: 2, borderWidth: 2 },
              { label: 'Cumul sorties', data: cfd.cumOut, borderColor: '#10b981', backgroundColor: 'rgba(16,185,129,0.12)', fill: true, tension: 0.35, pointRadius: 2, borderWidth: 2 }
            ]
          },
          options: baseChartOpts({
            plugins: {
              datalabels: {
                display: (ctx) => ctx.dataIndex % 2 === 1 || ctx.dataIndex === cfd.jours.length - 1,
                anchor: 'end', align: 'top', offset: 2, formatter: (v) => v
              }
            },
            scales: {
              x: { title: { display: true, text: 'Axe X : Chronologie des Jours Ouvrés', font: { size: 9.5, weight: 'bold' } }, ticks: { font: Object.assign({ size: 9 }, CHART_FONT) }, grid: { display: false } },
              y: { beginAtZero: true, title: { display: true, text: 'Axe Y : Modules & Réacteurs Cumulés (WIP)', font: { size: 9.5, weight: 'bold' } }, ticks: { font: { size: 9 } } }
            }
          })
        },
        note: 'CFD cumulée sur 10 jours ouvrés : les entrées (bleu) restent constamment au-dessus des sorties (vert) → WIP croissant, point d\'accroche capacitaire.'
      };
    }

    window._drillTreemapEngine = null;

    window.resetTreemapDrill = function() {
      window._drillTreemapEngine = null;
      renderStepChart(6);
      if (document.getElementById('mock-chart-q6-canvas')) renderDashboardChart(6);
    };

    function calc6H(td, mult) {
      const dataRoot = td || (maestroData() && maestroData().treemapShop);
      const isTreemapAvailable = typeof Chart !== 'undefined' && Chart.registry && Chart.registry.controllers && Chart.registry.controllers.get('treemap');
      // Seuils trichromatiques : Vert (<8%), Jaune (8-15%), Rouge (>15%)
      const colorByRetard = (retard) => (retard > 15 ? '#ef4444' : retard >= 8 ? '#f59e0b' : '#10b981');

      const isDrilled = !!window._drillTreemapEngine;
      const drillEngine = window._drillTreemapEngine;

      let currentItems = [];
      let currentTitle = "";
      let currentNote = "";

      if (!isDrilled) {
        // Niveau 1 : Répartition par type de moteur
        currentItems = (dataRoot && dataRoot.moteurs ? dataRoot.moteurs : []).map(m => ({
          label: m.moteur,
          moteur: m.moteur,
          heures: Math.round(m.heures * mult),
          retard: m.retard
        }));
        currentTitle = `Treemap Shop S-MON — Répartition par Type de Moteur (💡 Cliquer pour drill-down)`;
        currentNote = `Treemap Shop S-MON (Niveau 1 — Moteurs) : surface = temps passé (heures), couleur trichromatique = taux de retard (Vert < 8%, Jaune 8-15%, Rouge > 15%). 💡 Cliquez sur un moteur pour déclencher le drill-down par type de réparation.`;
      } else {
        // Niveau 2 : Décomposition par type de réparation pour le moteur sélectionné
        const mObj = (dataRoot && dataRoot.moteurs ? dataRoot.moteurs : []).find(m => m.moteur === drillEngine) || (dataRoot && dataRoot.moteurs && dataRoot.moteurs[0]);
        currentItems = (mObj && mObj.reparations ? mObj.reparations : []).map(r => ({
          label: r.type,
          type: r.type,
          moteur: mObj ? mObj.moteur : drillEngine,
          heures: Math.round(r.heures * mult),
          retard: r.retard
        }));
        currentTitle = `Treemap Shop S-MON — Décomposition ${drillEngine} par Type de Réparation`;
        currentNote = `Treemap Shop S-MON (Niveau 2 — Réparations sur ${drillEngine}) : surface = temps passé (heures), couleur = taux de retard (Vert < 8%, Jaune 8-15%, Rouge > 15%). Cliquez sur "◀ Revenir aux Moteurs" pour remonter au niveau 1.`;
      }

      const totalHeures = currentItems.reduce((acc, it) => acc + it.heures, 0);

      if (isTreemapAvailable) {
        const treeItems = currentItems.map(it => ({
          nom: it.label,
          moteur: it.moteur,
          heures: it.heures,
          retard: it.retard,
          pctTemps: Math.round((it.heures / Math.max(1, totalHeures)) * 1000) / 10
        }));

        return {
          title: currentTitle,
          note: currentNote,
          config: {
            type: 'treemap',
            data: {
              datasets: [{
                tree: treeItems,
                key: 'heures',
                groups: ['nom'],
                spacing: 2,
                borderWidth: 1.5,
                borderColor: '#ffffff',
                borderRadius: 4,
                backgroundColor(ctx) {
                  if (!ctx.raw) return '#3b82f6';
                  const item = ctx.raw._data || ctx.raw;
                  return colorByRetard(item.retard || 0);
                },
                labels: {
                  display: true,
                  formatter(ctx) {
                    if (!ctx.raw) return '';
                    const item = ctx.raw._data || ctx.raw;
                    return [item.nom, `${item.heures}h (${item.pctTemps}%)`, `Retard : ${item.retard}%`];
                  },
                  color: '#ffffff',
                  font: [
                    { size: 10.5, weight: 'bold', family: CHART_FONT.family },
                    { size: 9, weight: 'bold', family: CHART_FONT.family },
                    { size: 8.5, weight: 'normal', family: CHART_FONT.family }
                  ],
                  position: 'center'
                }
              }]
            },
            options: baseChartOpts({
              onClick(evt, elements) {
                if (!elements || !elements.length) return;
                if (!window._drillTreemapEngine) {
                  const el = elements[0];
                  const rawItem = currentItems[el.index];
                  if (rawItem && rawItem.moteur) {
                    window._drillTreemapEngine = rawItem.moteur;
                    renderStepChart(6);
                    if (document.getElementById('mock-chart-q6-canvas')) renderDashboardChart(6);
                  }
                }
              },
              plugins: {
                legend: { display: false },
                datalabels: { display: false },
                tooltip: {
                  callbacks: {
                    title(items) {
                      const item = items[0] && (items[0].raw._data || items[0].raw);
                      return item ? `📦 ${item.nom}` : '';
                    },
                    label(item) {
                      const d = item.raw._data || item.raw;
                      if (!d) return '';
                      const drillHint = !isDrilled ? ' • 💡 Cliquer pour décomposer par réparation' : '';
                      const statut = d.retard > 15 ? '🚨 Retard critique (>15%)' : d.retard >= 8 ? '⚠️ Tension modérée (8-15%)' : '🟢 Conforme (<8%)';
                      return [
                        `Temps passé : ${d.heures} heures (${d.pctTemps}% du total)`,
                        `Taux de retard : ${d.retard} % [${statut}]${drillHint}`
                      ];
                    }
                  }
                }
              }
            })
          }
        };
      }

      // Fallback en barres horizontales avec drill-down identique
      const rows = [...currentItems].sort((a, b) => b.heures - a.heures);
      return {
        title: currentTitle,
        note: currentNote,
        config: {
          type: 'bar',
          data: {
            labels: rows.map(r => r.label),
            datasets: [
              {
                label: 'Temps Passé (heures)',
                data: rows.map(r => r.heures),
                backgroundColor: rows.map(r => colorByRetard(r.retard)),
                borderRadius: 3
              }
            ]
          },
          options: baseChartOpts({
            indexAxis: 'y',
            onClick(evt, elements) {
              if (!elements || !elements.length) return;
              if (!window._drillTreemapEngine) {
                const el = elements[0];
                const rawItem = rows[el.index];
                if (rawItem && rawItem.moteur) {
                  window._drillTreemapEngine = rawItem.moteur;
                  renderStepChart(6);
                  if (document.getElementById('mock-chart-q6-canvas')) renderDashboardChart(6);
                }
              }
            },
            plugins: {
              datalabels: {
                anchor: 'end', align: 'right', offset: 2,
                formatter: (v, ctx) => `${v}h (Retard: ${rows[ctx.dataIndex].retard}%)`
              },
              tooltip: {
                callbacks: {
                  afterLabel: (ctx) => `Taux de retard : ${rows[ctx.dataIndex].retard}%${!isDrilled ? ' • Cliquer pour drill-down' : ''}`
                }
              }
            },
            scales: {
              x: { beginAtZero: true, title: { display: true, text: 'Axe X : Temps Passé d\'Intervention (heures)', font: { size: 9.5, weight: 'bold' } }, ticks: { font: { size: 9 } } },
              y: { title: { display: true, text: isDrilled ? 'Axe Y : Types de Réparation' : 'Axe Y : Types de Moteur', font: { size: 9.5, weight: 'bold' } }, ticks: { font: { size: 8.5 } } }
            }
          })
        }
      };
    }

    function calc6I(p, mult) {
      const labels = p.map((m) => m.label);
      const capaSimule = p.map((m) => Math.round(m.capa * mult));
      const refEffectif = p.map((m) => m.ref);
      const ecartPct = p.map((m) => {
        const val = Math.round(m.capa * mult);
        return Math.round(((val - m.ref) / m.ref) * 1000) / 10;
      });

      return {
        config: {
          data: {
            labels,
            datasets: [
              {
                type: 'bar',
                label: 'Capacité Simulée (interventions/mois)',
                data: capaSimule,
                backgroundColor: ['#94a3b8', '#3b82f6', '#f59e0b', '#10b981'],
                borderRadius: 4,
                yAxisID: 'y'
              },
              {
                type: 'line',
                label: 'Débit Effectif Référence (124 interventions)',
                data: refEffectif,
                borderColor: '#64748b',
                borderWidth: 2,
                borderDash: [5, 4],
                pointRadius: 0,
                fill: false,
                yAxisID: 'y'
              },
              {
                type: 'line',
                label: '% Écart vs Réel',
                data: ecartPct,
                borderColor: '#dc2626',
                backgroundColor: '#dc2626',
                borderWidth: 2.5,
                tension: 0.25,
                pointRadius: 4,
                pointBackgroundColor: '#dc2626',
                yAxisID: 'y1'
              }
            ]
          },
          options: baseChartOpts({
            plugins: {
              datalabels: {
                align: (ctx) => ctx.datasetIndex === 2 ? (ctx.dataset.data[ctx.dataIndex] >= 0 ? 'top' : 'bottom') : 'end',
                anchor: (ctx) => ctx.datasetIndex === 2 ? 'center' : 'end',
                offset: 2,
                formatter: (v, ctx) => {
                  if (ctx.datasetIndex === 0) return v + ' int';
                  if (ctx.datasetIndex === 2) return (v >= 0 ? '+' : '') + v + ' %';
                  return '';
                }
              },
              tooltip: {
                callbacks: {
                  afterBody: (items) => {
                    const idx = items[0].dataIndex;
                    const item = p[idx];
                    return `• Méthode : ${item.nom || item.label}\n• Degré de certitude : ${item.certitude} %\n• Complétude MES atelier : ${item.completude} %`;
                  }
                }
              }
            },
            scales: {
              x: {
                title: { display: true, text: 'Axe X : Méthodes de Projection Capacité (C-SOP, C-STA, C-LOG, C-ML)', font: { size: 9.5, weight: 'bold' } },
                ticks: { font: Object.assign({ size: 9 }, CHART_FONT) },
                grid: { display: false }
              },
              y: {
                beginAtZero: true,
                max: 160,
                title: { display: true, text: 'Axe Y1 : Débit Mensuel (interventions)', font: { size: 9.5, weight: 'bold' } },
                ticks: { font: { size: 9 } }
              },
              y1: {
                position: 'right',
                title: { display: true, text: 'Axe Y2 : % Écart vs Référence (%)', font: { size: 9.5, weight: 'bold' } },
                grid: { drawOnChartArea: false },
                ticks: { font: { size: 9 }, callback: (v) => v + '%' }
              }
            }
          })
        },
        note: 'Benchmark des 4 méthodes capacitaires (C-SOP, C-STA, C-LOG, C-ML) face au débit réel constaté (124 interventions/mois). La modélisation avancée C-ML affiche la meilleure fidélité terrain (+2.4%) et la certitude la plus robuste (96%).'
      };
    }

const STEP_BUILDERS = {
      4: {
        A: (d, mult) => calc4A(d.modeles, mult),
        B: (d, mult) => calc4B(d.decompoTAT, mult),
        C: (d, mult) => calc4C(d.respectClients, mult),
        D: (d, mult) => calc4D(d.alertesESN, mult),
        E: (d, mult) => calc4E(d.kpis, d.kpisLabels, mult),
        F: (d, mult) => calc4F(d.modulesP85, mult),
        G: (d, mult) => calc4G(d.waterfall, mult),
        H: (d, mult) => calc4H(d.heatmapNetwork || d.gates, mult),
        I: (d, mult) => calc4I(d.calculsTAT, mult)
      },
      6: {
        A: (d, mult) => calc6A(d.retardShops, mult),
        B: (d, mult) => calc6B(d.retardsOps, mult),
        C: (d, mult) => calc6C(d.routes, mult),
        D: (d, mult) => calc6D(d.decompoShopTAT, mult),
        E: (d, mult) => calc6E(d.chargeStations, mult),
        F: (d, mult) => calc6F(d.heatmapShop || d.heatmapStation, mult),
        G: (d) => calc6G(d.cfd),
        H: (d, mult) => calc6H(d.treemapShop || d.goulots, mult),
        I: (d, mult) => calc6I(d.calculsCapa, mult)
      }
    };

    const STEP_NOTES = {
      4: {
        A: '🎯 Personas : FTM & NTPL • Distribution du TAT par famille moteur : médiane P50 et dispersion P5-P95 (90 % du flux).',
        B: '🎯 Personas : CSPM & DMMG • Décomposition du TAT de la demande par phase macro (Réparation, Validation/Appro, Transit).',
        C: '🎯 Personas : CSPM & FINC • Respect des délais contractuels par compagnie : TAT convenu vs effectif et % non-respect SLA.',
        D: '🎯 Personas : EOWN & CSPM • Tableau d\'alertes nominatives des demandes moteur : priorisation des dérives critiques AOG et retards.',
        E: '🎯 Personas : CSPM & Direction MRO • KPIs synthétiques de pilotage de la demande : TAT Wing to Wing moyen, respect SLA global et volumes de demandes.',
        F: '🎯 Personas : FTM & CSPM • Barres vs seuils P85 par flotte moteur : détection des dérives sur les demandes de maintenance.',
        G: '🎯 Personas : FINC & CSPM • Waterfall des dérives TAT de la demande : cascade cumulative de la cible contractuelle au temps réel constaté.',
        H: '🎯 Personas : NTPL & Direction Industrielle • Heatmap d\'occupation réseau des 10 sites MRO sur les semaines S34 à S42. Code trichromatique : Vert < 80%, Jaune 80-95%, Rouge > 95%.',
        I: '🎯 Personas : DGOV & FTM • Histogramme comparatif des 4 méthodes de calcul de TAT vs effectif réel (18.2 j) : variance et complétude.'
      },
      6: {
        A: '🎯 Personas : SHPL & NTPL • Taux de retard des interventions par shop (S-XXX) face au seuil contractuel de tolérance (10%) : identification des ateliers en dérive.',
        B: '🎯 Personas : FTM & DMMG • Taux d\'aléa et retards imprévus par type de réparation (T-XXXXXX) en shop, comparatif flottes CFM56 vs LEAP.',
        C: '🎯 Personas : NTPL & SHPL • Flux de sous-traitance et routes de transfert d\'interventions inter-shops (S-XXX).',
        D: '🎯 Personas : SHPL & Continuous Improvement • Décomposition du délai moyen d\'intervention par shop : attente file/pièces, réparation effective et transit logistique.',
        E: '🎯 Personas : SHPL & NTPL • Taux de charge des stations de réparation (S-XXX-YY) face au seuil critique de 85% : repérage des machines et postes saturés.',
        F: '🎯 Personas : SHPL & Continuous Improvement • Heatmap d\'occupation des stations par shop (S-MON) : tension hebdomadaire par station de réparation (S-XXX-YY) sur les semaines S34 à S42.',
        G: '🎯 Personas : DMMG & NTPL • CFD flux cumulé entrées (inductions) vs sorties (clôtures) des interventions en shop.',
        H: '🎯 Personas : SHPL & EOWN • Treemap Shop : répartition du temps passé par moteur (niveau 1) et drill-down par réparation (niveau 2). Couleur trichromatique selon le taux de retard (Vert < 8%, Jaune 8-15%, Rouge > 15%).',
        I: '🎯 Personas : DGOV & NTPL • Histogramme comparatif des 4 méthodes capacitaires vs débit effectif réel (124 interventions) : écart et complétude MES.'
      }
    };

    function buildStepChartSpec(step, opt, mult) {
      if (typeof opt === 'string' && opt.startsWith('custom_')) {
        const custom = getCustomVisualById(step, opt);
        if (custom) {
          return {
            config: custom.config,
            title: `✨ ${custom.title}`,
            sub: `Visuel personnalisé (Étape ${step})`,
            note: custom.desc
          };
        }
      }
      const D = maestroData();
      if (!D) return null;
      const builder = STEP_BUILDERS[step][opt];
      if (!builder) return null;
      const res = builder(D, mult);
      const meta = metaInfo[step] && metaInfo[step][opt];
      const icon = meta && meta.icon ? meta.icon : (step === 4 ? '⏱️' : '🏭');
      const title = res.title || (icon + ' ' + (meta ? meta.title : 'Visuel ' + step + '.' + opt));
      const sub = res.sub || ('Option ' + step + '.' + opt + ' : ' + (meta ? meta.title : '') + (step === 4 ? ' • ' + granLabel() : ''));
      const note = res.note || (STEP_NOTES[step] && STEP_NOTES[step][opt]) || '';
      return { config: res.config, title: title, sub: sub, note: note };
    }

    // ===== Gestionnaire du Mode Éditeur Visuel Chart.js Dynamique (Étapes 4 & 6) =====
    const chartViewMode = {
      4: (function() { try { const s = localStorage.getItem('maestro_switch_chart_4'); if (s === 'chart' || s === 'ui') return 'graph'; if (s === 'config') return 'js'; if (s === 'chartjs') return '<>js'; return s || 'graph'; } catch(e) { return 'graph'; } })(),
      6: (function() { try { const s = localStorage.getItem('maestro_switch_chart_6'); if (s === 'chart' || s === 'ui') return 'graph'; if (s === 'config') return 'js'; if (s === 'chartjs') return '<>js'; return s || 'graph'; } catch(e) { return 'graph'; } })()
    };
    const editingChartConfig = { 4: null, 6: null };

    const COLOR_PALETTES = [
      { name: 'Bleu SAE', color: '#3b82f6' },
      { name: 'Émeraude Conforme', color: '#10b981' },
      { name: 'Ambre Vigilance', color: '#f59e0b' },
      { name: 'Rouge Critique', color: '#ef4444' },
      { name: 'Violet Spécial', color: '#8b5cf6' },
      { name: 'Cyan Industriel', color: '#06b6d4' },
      { name: 'Indigo Nuit', color: '#6366f1' },
      { name: 'Ardoise / Gris', color: '#64748b' }
    ];

    function getChartStorageKey(step, opt) {
      return 'maestro_custom_chart_' + step + '_' + (opt || selections[step]);
    }

    const CHART_MD_SPECS = {
      4: {
        A: {
          title: "Distribution du TAT Médian et Dispersion P5 - P95 par Famille Moteur",
          chartType: "Boxplot / Barres Horizontales P5, P50, P95 (indexAxis: y)",
          model: "MDT_MAINTENANCE_REQUEST (Dossier Macro de Demande)",
          grain: "1 ligne = 1 demande de visite globale (ID_DEMANDE)",
          axisX: "Durée du Turn Around Time global de la visite en jours calendaires",
          axisY: "Famille de motorisation aéronautique (ENGINE_TYPE)",
          dimensions: ["ENGINE_TYPE (CFM56-7B, LEAP-1A, LEAP-1B, CFM56-5B, GE90-115B, M88-2)", "TIMEPROFILE (Période d'induction)"],
          measures: [
            "P50_MEDIAN_TAT (Délai médian réalisé en jours)",
            "P5_LOWER_TAT (Borne basse 5e percentile - scénario optimiste)",
            "P95_UPPER_TAT (Borne haute 95e percentile - scénario pessimiste)"
          ],
          filters: "Statut demande = Clôturée ou En-cours standard ; Clients tous comptes",
          businessRules: "P5 ≈ 60-70% de P50 ; P95 ≈ 140-165% de P50. Les barres horizontales s'étendent de 0 à la valeur du percentile avec étiquettes 'XX.X j' en bout de barre."
        },
        B: {
          title: "Décomposition du TAT Dossier par Phase (Atelier, Attente Appro, Transit Logistique)",
          chartType: "Barres Horizontales Empilées (Stacked Bar, indexAxis: y)",
          model: "MDT_MAINTENANCE_REQUEST (Dossier Macro de Demande)",
          grain: "1 ligne = 1 demande de visite globale (ID_DEMANDE)",
          axisX: "Jours de TAT cumulés décomposés",
          axisY: "Famille de motorisation (ENGINE_TYPE)",
          dimensions: ["ENGINE_TYPE (CFM56-7B, CFM56-5B, LEAP-1A, LEAP-1B, GE90-115B, M88-2)", "PHASE_DOSSIER (Atelier, Attente Appro/Client, Transit)"],
          measures: [
            "TEMPS_REVISION_ATELIER (Durée nette opérée en atelier MRO - Bleu #3b82f6)",
            "ATTENTE_VALIDATION_APPRO (Attente pièces de rechange et approbations client - Rouge #ef4444)",
            "TRANSIT_LOGISTIQUE (Transport et navettes inter-sites réseau - Ambre #f59e0b)"
          ],
          filters: "Dossiers de maintenance moteur sur les 12 derniers mois",
          businessRules: "Empilement horizontal totalisant le TAT moyen du moteur. Affichage d'étiquettes internes centrées en blanc si durée >= 2 jours."
        },
        C: {
          title: "Respect des Engagements Délais par Client et Taux de Non-Respect SLA",
          chartType: "Dual-Axis Combination Chart (Barres Groupées TAT + Ligne % Non-Respect SLA)",
          model: "MDT_MAINTENANCE_REQUEST & Table CONTRACT_SLA",
          grain: "1 ligne = 1 demande de visite globale (ID_DEMANDE)",
          axisX: "Compagnies Aériennes Clientes (DEMANDEUR : Air France AFR, Air China CCA, easyJet EZY, Lufthansa DLH, Delta DAL, Emirates UAE, Singapore SIA)",
          axisY: "Axe Y1 (Gauche) = TAT Moyen en Jours • Axe Y2 (Droite) = Taux de Non-Respect SLA en %",
          dimensions: ["DEMANDEUR (Code & Nom Compagnie)", "ID_CONTRAT (Engagements contractuels)"],
          measures: [
            "TAT_CONTRACTUEL_CIBLE (SLA convenu au contrat en jours - Vert #10b981)",
            "TAT_EFFECTIF_REVISE (TAT moyen réel constaté en jours - Bleu #3b82f6)",
            "SLA_NON_RESPECT_PCT (Part des dossiers livrés au-delà de l'engagement contractuel en % - Ligne Rouge #dc2626)"
          ],
          filters: "Toutes flottes confondues, pondéré par le volume de demandes par compagnie",
          businessRules: "Axe Y1 débute à 0. Axe Y2 débute à 0% sans grille secondaire. Infobulles comparant le dérapage moyen par compagnie."
        },
        D: {
          title: "Tableau d'Alertes Nominatives des Demandes et Pénalités Encourues",
          chartType: "Barres Horizontales (indexAxis: y) Triées par Retard Décroissant",
          model: "MDT_MAINTENANCE_REQUEST (Dossier Macro de Demande)",
          grain: "1 ligne = 1 demande globale identifiée par ID_DEMANDE (Format: D-YYYY-XXXXXX)",
          axisX: "Jours de retard au-delà du SLA contractuel",
          axisY: "Identifiant Demande (ID_DEMANDE / ESN) • Client • Site d'induction",
          dimensions: ["ID_DEMANDE (D-YYYY-XXXXXX)", "DEMANDEUR (Compagnie cliente)", "ENGINE_TYPE (Modèle moteur)", "NIVEAU_URGENCE_GLOBAL / STATUT"],
          measures: [
            "RETARD_SLA_JOURS (Dépassement net par rapport au délai convenu)",
            "TOTAL_ENGINE_TAT (TAT réel cumulé à date)",
            "PENALITES_ESTIMEES_EUR (Pénalités contractuelles = Retard × 1500 à 2500 €/jour)"
          ],
          filters: "Top 8 des dossiers les plus critiques classés par retard décroissant",
          businessRules: "Couleurs selon criticité : AOG Critique = Rouge (#ef4444), En Retard = Ambre (#f59e0b), En Cours = Bleu (#3b82f6), Conforme = Vert (#10b981). Étiquette '+X j' en bout de barre."
        },
        E: {
          title: "Cartes KPIs Synthétiques du Pilotage Délais MRO",
          chartType: "Multi-KPI Horizontal Bar (Indicateurs Scalaires Réel vs Cible, indexAxis: y)",
          model: "MDT_MAINTENANCE_REQUEST (Dossier Macro de Demande)",
          grain: "Agrégats macro-décisionnels sur l'ensemble du parc de demandes",
          axisX: "Valeur de l'indicateur mesuré vs Seuil/Cible (jours ou %)",
          axisY: "Intitulé du KPI (TAT Moyen Glissant, Taux de Respect SLA, Dérive d'En-Cours WIP)",
          dimensions: ["INDICATEUR_METIER (Libellé du KPI)"],
          measures: [
            "VALEUR_MESUREE (Performance réelle mesurée - Bleu #3b82f6)",
            "VALEUR_CIBLE (Seuil d'alerte ou objectif contractuel - Gris #cbd5e1)"
          ],
          filters: "Périmètre global réseau toutes usines et flottes confondues",
          businessRules: "Double barre par indicateur permettant la comparaison visuelle immédiate réel vs cible. Formatage d'étiquettes conditionnel ('j' ou '%')."
        },
        F: {
          title: "Durée Réelle par Famille Moteur vs Seuil Contractuel P85",
          chartType: "Barres Horizontales avec Ligne de Seuil P85 (indexAxis: y)",
          model: "MDT_MAINTENANCE_REQUEST (Dossier Macro de Demande)",
          grain: "1 ligne = 1 demande de visite globale (ID_DEMANDE)",
          axisX: "TAT Total Moteur Réalisé (jours calendaires)",
          axisY: "Famille de motorisation (ENGINE_TYPE)",
          dimensions: ["ENGINE_TYPE (CFM56-7B, CFM56-5B, LEAP-1A, LEAP-1B, GE90-115B, M88-2)"],
          measures: [
            "ACTUAL_TOTAL_TAT (TAT moyen réalisé par type de moteur)",
            "P85_CONTRACTUAL_THRESHOLD (Ligne de référence en tirets rouges : engagement contractuel P85 à 24 jours)"
          ],
          filters: "Demandes clôturées sur le semestre en cours",
          businessRules: "Coloration conditionnelle de la barre : Rouge si TAT > Seuil P85, Ambre si TAT > Seuil - 3 jours, Bleu si TAT sous contrôle."
        },
        G: {
          title: "Waterfall des Dérives du TAT (Cascade de Décomposition des Retards)",
          chartType: "Waterfall / Cascade Chart (Barres Flottantes Cumulatives)",
          model: "MDT_MAINTENANCE_REQUEST (Dossier Macro de Demande)",
          grain: "1 ligne = 1 événement contributeur au délai de visite",
          axisX: "Jalons et Facteurs de Dérive (TAT Cible, Attente Pièces, Aléas CND, Fast-Track, TAT Réel)",
          axisY: "Durée cumulée de la visite moteur en jours",
          dimensions: ["CAUSE_DERIVE (Étape ou motif d'écart de gamme)"],
          measures: [
            "VARIATION_DELAI_JOURS (Impact positif en rouge ou gain en vert)",
            "CUMULATIVE_ENGINE_TAT (Niveau cumulé résultant)"
          ],
          filters: "Dossier représentatif en dérive moyenne",
          businessRules: "Première barre grise (Cible 16 j), barres rouges pour allongement de délai (+3.1 j pièces, +2.0 j CND, +1.1 j logistique), barre verte pour accélération (-1.3 j fast-track), dernière barre bleu marine pour TAT Réel final (20.9 j)."
        },
        H: {
          title: "Heatmap d'Occupation Réseau par Site MRO (Semaines S34 à S42)",
          chartType: "Heatmap Matrix (Grille Thermique Sites en Y × Semaines en X)",
          model: "MDT_MAINTENANCE_REQUEST & Table Réseau Sites",
          grain: "1 cellule = Taux d'occupation moyen du centre SAE pour la semaine calendaire",
          axisX: "Semaines calendaires S34 à S42 (Période glissante 9 semaines)",
          axisY: "10 Centres Industriels SAE MRO (S-VIL Villaroche, S-MON Montereau, S-CHL Châtellerault, S-BRU Bruxelles, S-SQY Saint-Quentin, S-GEN Gennevilliers, S-BDX Bordeaux, S-TLS Toulouse, S-LGG Liège, S-CRE Le Creusot)",
          dimensions: ["SITE_MRO (10 centres industriels)", "SEMAINE_CALENDAIRE (S34 à S42)"],
          measures: [
            "TAUX_OCCUPATION_PCT (Charge globale du site en % de la capacité nominale)"
          ],
          filters: "Capacité globale réseau SAE MRO",
          businessRules: "Échelle trichromatique stricte : Vert fluide si charge < 80%, Jaune/Ambre si tension 80% à 95%, Rouge saturation critique si charge > 95% (ex: Montereau et Villaroche en surchauffe)."
        },
        I: {
          title: "Benchmark Fiabilité TAT : Comparatif des 4 Méthodes vs Référence Effectif",
          chartType: "Dual-Axis Clustered Bar & Deviation Line Chart",
          model: "MDT_MAINTENANCE_REQUEST & Référentiel Méthodologique MRO",
          grain: "1 ligne = 1 méthode d'estimation du TAT (D-SOP, D-STA, D-CAP, D-ML)",
          axisX: "Méthodes de calcul du TAT (D-SOP Standard, D-STA Statistique, D-CAP Capacité, D-ML Machine Learning)",
          axisY: "Axe Y1 (Gauche) = TAT Estimé en Jours • Axe Y2 (Droite) = % Écart relatif vs Réel",
          dimensions: ["METHODE_CALCUL_TAT (Code et intitulé de la méthode)", "DEGRE_CERTITUDE (%)"],
          measures: [
            "TAT_CALCULE_JOURS (Valeur estimée par la méthode en jours - Barres de couleur)",
            "TAT_EFFECTIF_REF (Valeur réelle constatée de référence : 18.2 jours - Ligne pointillée grise)",
            "ECART_RELATIF_PCT (% d'écart vs effectif = (Estimé - 18.2) / 18.2 - Ligne Rouge #dc2626)",
            "DATA_COMPLETENESS_RATE (Taux de complétude des données d'entrée = 93.4%)"
          ],
          filters: "Toutes motorisations confondues",
          businessRules: "L'approche Machine Learning (D-ML) offre l'écart le plus resserré (+2.2% vs 18.2 j). Infobulles détaillant le degré de certitude et la complétude des données de chaque modèle."
        }
      },
      6: {
        A: {
          title: "Taux d'Interventions en Retard par Atelier Shop vs Seuil Tolérance 10%",
          chartType: "Barres Verticales / Colonnes avec Ligne de Seuil",
          model: "MDT_INTERVENTION (Opérations d'Atelier)",
          grain: "1 ligne = 1 intervention unitaire sur poste ou atelier (ID_INTERVENTION)",
          axisX: "Centres & Ateliers Shops SAE (SHOP_NAME : S-MON, S-VIL, S-CHL, S-BRU, S-TLS, S-SQY, S-GEN, S-BDX, S-LGG, S-CRE)",
          axisY: "Pourcentage d'interventions accusant un retard (%)",
          dimensions: ["SHOP_NAME (10 shops SAE MRO)"],
          measures: [
            "INTERVENTION_DELAY_RATE (% d'interventions en retard par rapport à la gamme constructeur)",
            "SEUIL_RETARD_TOLERANCE (Ligne rouge pointillée à 10.0% de tolérance contractuelle)",
            "TOTAL_INTERVENTIONS_COUNT (Volume global traité)"
          ],
          filters: "Interventions clôturées sur le mois écoulé (référence débit : 124 interventions/mois)",
          businessRules: "Coloration trichromatique des colonnes : Rouge critique si retard >= 15%, Ambre si retard entre 10% et 15%, Bleu si retard < 10% sous contrôle."
        },
        B: {
          title: "Taux d'Aléa Imprévu par Type d'Intervention : CFM56 vs LEAP",
          chartType: "Barres Groupées Comparatives (Clustered Column)",
          model: "MDT_INTERVENTION (Opérations d'Atelier)",
          grain: "1 ligne = 1 intervention unitaire sur station/shop",
          axisX: "Types de Réparation (TYPE_REPARATION : T-INSCND, T-AUBTUR, T-MAJLOU, T-BANESS, T-EQUROT, T-COMHOT, T-REVCAR, T-FODREP)",
          axisY: "Taux de retard imprévu en cours d'opération (%)",
          dimensions: ["TYPE_REPARATION (8 gammes techniques)", "PROGRAMME_MOTEUR (CFM56 vs LEAP)"],
          measures: [
            "RETARD_CFM56_PCT (Taux d'aléa sur flotte mature CFM56 - Bleu #3b82f6)",
            "RETARD_LEAP_PCT (Taux d'aléa sur nouvelle génération LEAP - Ambre #f59e0b)"
          ],
          filters: "Toutes stations confondues",
          businessRules: "Le programme LEAP accuse systématiquement un surplus d'aléas imprévus (+7 à +12%) en raison de la maturité industrielle et de la complexité des composites."
        },
        C: {
          title: "Top Routes de Transfert Logistique Inter-Shops et Délais Navettes",
          chartType: "Dual-Axis Combination Horizontal Bar & Line Chart",
          model: "MDT_INTERVENTION & Flux Logistiques Inter-Sites",
          grain: "1 ligne = 1 flux de navette inter-shops",
          axisX: "Axe X1 (Bas) = Part du Flux Logistique Total (%) • Axe X2 (Haut) = Délai Moyen Navette (jours)",
          axisY: "Routes de transfert (SHOP_SOURCE ➔ SHOP_DEST : S-MON ➔ S-VIL, S-CHL ➔ S-BRU, S-VIL ➔ S-SQY...)",
          dimensions: ["ROUTE_TRANSFERT (Origine vers Destination)"],
          measures: [
            "TRANSFER_VOLUME_PCT (Part du flux d'interventions transitant par cette liaison - Barres bleues)",
            "AVG_TRANSIT_DURATION_DAYS (Délai moyen de navette aller-retour - Ligne ambre avec points)"
          ],
          filters: "Transferts inter-ateliers réalisés sur les 6 derniers mois",
          businessRules: "Barres bleues associées à l'axe X inférieur (0 à 50%). Ligne ambre associée à l'axe X supérieur (0 à 5 jours). Met en exergue le goulot logistique Montereau-Villaroche."
        },
        D: {
          title: "Décomposition du Délai Moyen d'Intervention par Shop (Attente, Réparation, Transit)",
          chartType: "Barres Horizontales Empilées (Stacked Bar, indexAxis: y)",
          model: "MDT_INTERVENTION (Opérations d'Atelier)",
          grain: "1 ligne = 1 shop industriel (SHOP_NAME)",
          axisX: "Heures moyennes de traitement consommées par intervention",
          axisY: "Ateliers Shops (S-XXX : S-MON, S-VIL, S-CHL, S-BRU, S-TLS, S-SQY, S-GEN, S-BDX, S-LGG, S-CRE)",
          dimensions: ["SHOP_NAME (10 ateliers industriels)", "SEGMENT_DURÉE (Attente File/Appro, Réparation VA, Transit)"],
          measures: [
            "AVG_QUEUE_HOURS (Attente passive en file et mise à disposition outillage - Ambre #f59e0b)",
            "AVG_REPAIR_HOURS (Temps d'usinage et révision valeur ajoutée à la station - Bleu #3b82f6)",
            "AVG_TRANSIT_HOURS (Temps logistique de transit et déchargement - Violet #8b5cf6)"
          ],
          filters: "Toutes opérations terminées, normalisées sur base 100",
          businessRules: "Infobulle avec calcul dynamique du total en heures. Révèle que l'attente passive représente jusqu'à 30% du temps de cycle atelier."
        },
        E: {
          title: "Taux de Charge par Station de Réparation vs Seuil Critique 85%",
          chartType: "Barres Horizontales avec Ligne de Seuil Critique (indexAxis: y)",
          model: "MDT_INTERVENTION & Dimension STATION",
          grain: "1 ligne = 1 station de travail unitaire (STATION_NAME : S-XXX-YY, 3 à 10 par shop)",
          axisX: "Taux d'occupation effectif de la station (%)",
          axisY: "Poste / Station de réparation (ex: S-MON-01 Aubes HP, S-MON-02 Combustion, S-VIL-01 Équilibrage...)",
          dimensions: ["STATION_NAME (Code station normalisé S-XXX-YY)", "SHOP_NAME (Shop de rattachement)"],
          measures: [
            "TAUX_OCCUPATION_STATION (Heures engagées / Capacité d'ouverture du poste)",
            "SEUIL_SATURATION_CRITIQUE (Ligne verticale rouge à 85.0% de saturation)"
          ],
          filters: "Stations actives du réseau MRO",
          businessRules: "Coloration conditionnelle : Rouge critique si charge >= 85%, Ambre si charge entre 80% et 85%, Bleu si fluide (<80%). Détecte immédiatement les stations goulots d'étranglement."
        },
        F: {
          title: "Heatmap d'Occupation des Stations du Shop S-MON (Semaines S34 à S42)",
          chartType: "Heatmap Matrix (Grille Thermique Stations en Y × Semaines en X)",
          model: "MDT_INTERVENTION & Dimension STATION",
          grain: "1 cellule = Taux d'occupation hebdomadaire de la station",
          axisX: "Semaines calendaires S34 à S42 (9 semaines)",
          axisY: "Stations de réparation du Shop S-MON (S-MON-01 Aubes HP, S-MON-02 Combustion, S-MON-03 Ressuage CND, S-MON-04 Tour CN, S-MON-05 Équilibrage, S-MON-06 Recette)",
          dimensions: ["STATION_NAME (6 stations du shop S-MON)", "SEMAINE_CALENDAIRE (S34 à S42)"],
          measures: [
            "WORKLOAD_TENSION_RATE (Taux d'occupation hebdomadaire de la baie en %)"
          ],
          filters: "Périmètre restreint au Shop S-MON (Montereau)",
          businessRules: "Échelle trichromatique : Vert si <75%, Bleu si 75-84%, Ambre si 85-89%, Rouge si >=90%. La station S-MON-01 sature à 98% en semaine S36."
        },
        G: {
          title: "Cumulative Flow Diagram (CFD) : Flux d'Entrées vs Sorties d'Interventions (WIP)",
          chartType: "Cumulative Flow Diagram (Line Chart Cumulatif Entrées / Sorties)",
          model: "MDT_INTERVENTION (Opérations d'Atelier)",
          grain: "1 point = Cumul des opérations inductives et terminées par jour ouvré",
          axisX: "Chronologie des jours ouvrés (J1 à J10)",
          axisY: "Volume cumulé de lignes d'interventions en atelier",
          dimensions: ["TIMEPROFILE (Jours ouvrés)", "FLUX_DIRECTION (Lancements vs Clôtures)"],
          measures: [
            "CUMULATIVE_INTERVENTION_INDUCTION (Cumul des interventions injectées en atelier - Bleu #3b82f6)",
            "CUMULATIVE_INTERVENTION_RELEASE (Cumul des interventions terminées et libérées - Vert #10b981)",
            "SHOP_WIP_INTERVENTIONS (Écart vertical entre les deux courbes = En-cours d'atelier WIP)"
          ],
          filters: "Périmètre de régulation d'atelier sur 10 jours",
          businessRules: "Remplissage semi-transparent sous chaque courbe. L'écartement grandissant entre la courbe bleue et la courbe verte matérialise l'accumulation d'en-cours WIP."
        },
        H: {
          title: "Treemap Hiérarchique du Temps Passé et Taux de Retard par Moteur / Réparation",
          chartType: "Treemap Hiérarchique avec Drill-Down (Niveau 1 Moteurs ➔ Niveau 2 Réparations)",
          model: "MDT_INTERVENTION & Dimension TYPE_REPARATION",
          grain: "Niveau 1 = Flotte moteur (ENGINE_TYPE) • Niveau 2 = Gamme de réparation (TYPE_REPARATION)",
          axisX: "Surface du rectangle proportionnelle au temps passé en heures d'intervention",
          axisY: "Couleur trichromatique selon le taux de retard effectif constaté",
          dimensions: ["Niveau 1 : ENGINE_TYPE (CFM56-7B, LEAP-1A, CFM56-5B, LEAP-1B, GE90-115B)", "Niveau 2 : TYPE_REPARATION (T-AUBTUR, T-COMHOT, T-FODREP, T-INSCND)"],
          measures: [
            "TEMPS_PASSE_HEURES (Volume total d'heures d'intervention consommées)",
            "TAUX_RETARD_INTERVENTIONS (Pourcentage de dossiers en dérive horaire)"
          ],
          filters: "Périmètre du Shop S-MON (Montereau)",
          businessRules: "Échelle trichromatique : Vert si Retard < 8%, Jaune/Ambre si Retard 8-15%, Rouge si Retard > 15%. Clic sur un moteur pour explorer le détail par réparation ; bouton retour pour remonter."
        },
        I: {
          title: "Benchmark Capacité Atelier : Comparatif des 4 Méthodes vs Débit Réel (124 int/mois)",
          chartType: "Dual-Axis Clustered Bar & Deviation Line Chart",
          model: "MDT_INTERVENTION & Référentiel Méthodologique MRO",
          grain: "1 ligne = 1 méthode de projection de capacité (C-SOP, C-STA, C-LOG, C-ML)",
          axisX: "Méthodes d'évaluation capacitaire (C-SOP Standard, C-STA Statistique, C-LOG Logistique, C-ML Machine Learning)",
          axisY: "Axe Y1 (Gauche) = Capacité Simulée (interventions/mois) • Axe Y2 (Droite) = % Écart vs Débit Réel",
          dimensions: ["METHODE_CHARGE_CAPA (Code et désignation)", "INTERVALLE_CERTITUDE (%)"],
          measures: [
            "CAPACITE_SIMULEE_INTERVENTIONS (Nombre d'interventions mensuelles simulées)",
            "CAPACITE_EFFECTIVE_REF (Débit effectif mesuré en atelier : 124 interventions/mois - Ligne pointillée)",
            "ECART_CHARGE_PCT (% d'écart vs référence = (Simulé - 124) / 124 - Ligne Rouge)",
            "TAUX_COMPLETUDE_MES (Taux de complétude des données d'atelier = 96.1%)"
          ],
          filters: "Ensemble des 10 ateliers shops SAE",
          businessRules: "La modélisation avancée C-ML offre la prévision la plus fidèle (126 int/mois, soit +1.6% d'écart). Infobulles avec certification de complétude méthodologique."
        }
      }
    };


    function getOptionCardPureText(step, opt) {
      const bodyEl = document.getElementById(`opt-${step}-${opt}-body`);
      if (bodyEl) {
        const clone = bodyEl.cloneNode(true);
        clone.querySelectorAll('.opt-copy-btn').forEach(b => b.remove());
        const raw = (clone.innerText || clone.textContent || '');
        return raw.split('\n').map(l => l.trim()).filter(Boolean).join('\n');
      }
      if (metaInfo[step] && metaInfo[step][opt]) {
        return `${metaInfo[step][opt].title}\n${metaInfo[step][opt].desc}`;
      }
      return '';
    }

    function generateVisuelsPrompt(step) {
      // Réponse sélectionnée Étape 1
      const q1 = selections[1] || 'A';
      const q1Info = (metaInfo[1] && metaInfo[1][q1]) ? metaInfo[1][q1] : { title: 'Objectif', desc: '' };
      const q1Text = `Objectif Étape 1 : ${q1Info.title} (${q1Info.desc || ''})`;

      // Modèles ERD 2.A et 2.B
      const uml2A = (typeof getMermaidSchema === 'function' ? getMermaidSchema('A') : '').trim();
      const uml2B = (typeof getMermaidSchema === 'function' ? getMermaidSchema('B') : '').trim();

      let entries = [];
      entries.push(`--- Objectif Métier (Étape 1) ---\n${q1Text}`);
      entries.push(`--- Modèles Relationnels ERD ---\nModèle (Consolidation Demande) :\n\`\`\`mermaid\n${uml2A}\n\`\`\`\n\nModèle (Lignes d'Intervention) :\n\`\`\`mermaid\n${uml2B}\n\`\`\``);

      if (step === 3 || step === 5) {
        const opt = selections[step] || 'B';
        const optText = getOptionCardPureText(step, opt);
        const stepLabel = (step === 3) ? "Méthode de Calcul TAT (Étape 3)" : "Méthode de Projection Capacité (Étape 5)";
        entries.push(`--- ${stepLabel} ---\nOption ${opt} :\n${optText}`);
      } else if (step === 4) {
        const opt3 = selections[3] || 'B';
        const opt3Text = getOptionCardPureText(3, opt3);
        entries.push(`--- Méthode de Calcul TAT (Étape 3) ---\nOption ${opt3} :\n${opt3Text}`);

        const opt4 = selections[4] || 'B';
        let opt4Text = '';
        if (typeof opt4 === 'string' && opt4.startsWith('custom_')) {
          const custom = getCustomVisualById(4, opt4);
          opt4Text = custom ? `Visuel Personnalisé : ${custom.title}\n${custom.desc || ''}` : opt4;
        } else {
          opt4Text = `Option ${opt4} :\n${getOptionCardPureText(4, opt4)}`;
        }
        entries.push(`--- Visuel TAT Sélectionné (Étape 4) ---\n${opt4Text}`);
      } else if (step === 6) {
        const opt5 = selections[5] || 'B';
        const opt5Text = getOptionCardPureText(5, opt5);
        entries.push(`--- Méthode de Projection Capacité (Étape 5) ---\nOption ${opt5} :\n${opt5Text}`);

        const opt6 = selections[6] || 'A';
        let opt6Text = '';
        if (typeof opt6 === 'string' && opt6.startsWith('custom_')) {
          const custom = getCustomVisualById(6, opt6);
          opt6Text = custom ? `Visuel Personnalisé : ${custom.title}\n${custom.desc || ''}` : opt6;
        } else {
          opt6Text = `Option ${opt6} :\n${getOptionCardPureText(6, opt6)}`;
        }
        entries.push(`--- Visuel Capacité Sélectionné (Étape 6) ---\n${opt6Text}`);
      }

      const entriesFormatted = entries.join('\n\n');
      let tpl = getVisuelsPromptTemplate();
      return tpl.replace('{stepEntries}', entriesFormatted);
    }

    function renderVisuelsPromptView(step) {
      const codeEl = document.getElementById(`step-${step}-visuels-code`);
      if (codeEl) {
        codeEl.textContent = generateVisuelsPrompt(step);
      }
    }

    function copyVisuelsPrompt(step) {
      const text = generateVisuelsPrompt(step);
      const btn = document.getElementById(`step-${step}-visuels-copy-btn`);
      copyTextToClipboard(text).then(() => {
        if (btn) {
          btn.textContent = '✓';
          btn.classList.add('text-emerald-400');
          setTimeout(() => {
            btn.textContent = '⧉';
            btn.classList.remove('text-emerald-400');
          }, 1500);
        }
      });
    }

    const tablePanelViewMode = {
      3: (function() { try { const s = localStorage.getItem('maestro_switch_table_3'); const m = (s === 'ui' ? 'data' : (s || 'data')); return (m === 'mermaid' ? 'graph' : m); } catch(e) { return 'data'; } })(),
      5: (function() { try { const s = localStorage.getItem('maestro_switch_table_5'); const m = (s === 'ui' ? 'data' : (s || 'data')); return (m === 'mermaid' ? 'graph' : m); } catch(e) { return 'data'; } })()
    };

    function generateTableAiPrompt(step) {
      const opt = selections[step] || (step === 3 ? 'B' : 'B');
      const bodyEl = document.getElementById(`opt-${step}-${opt}-body`);
      let optText = "";
      if (bodyEl) {
        const clone = bodyEl.cloneNode(true);
        clone.querySelectorAll('.opt-copy-btn').forEach(b => b.remove());
        const raw = (clone.innerText || clone.textContent || '');
        optText = raw.split('\n').map(l => l.trim()).filter(Boolean).join('\n');
      } else if (metaInfo[step] && metaInfo[step][opt]) {
        optText = `${metaInfo[step][opt].title}\n${metaInfo[step][opt].desc}`;
      }

      const uml2A = (getMermaidSchema('A') || '').trim();
      const uml2B = (getMermaidSchema('B') || '').trim();

      let tpl = getTablePromptTemplate();
      const replacements = {
        '{step}': step,
        '{opt}': opt,
        '{optBody}': optText,
        '{uml2A}': uml2A,
        '{uml2B}': uml2B
      };

      for (const [k, v] of Object.entries(replacements)) {
        tpl = tpl.split(k).join(v);
      }
      return tpl;
    }

    function renderTableAiView(step) {
      const codeEl = document.getElementById(`step-${step}-ai-code`);
      if (codeEl) {
        codeEl.textContent = generateTableAiPrompt(step);
      }
    }

    function copyTableAi(step) {
      const text = generateTableAiPrompt(step);
      const btn = document.getElementById(`step-${step}-ai-copy-btn`);
      copyTextToClipboard(text).then(() => {
        if (btn) {
          btn.textContent = '✓';
          btn.classList.add('text-emerald-400');
          setTimeout(() => {
            btn.textContent = '⧉';
            btn.classList.remove('text-emerald-400');
          }, 1500);
        }
      });
    }

    function toggleTableMode(step, mode) {
      let targetMode = 'data';
      if (mode === 'visuels' || mode === '<>visuels') targetMode = 'visuels';
      else if (mode === 'graph' || mode === 'mermaid') targetMode = 'graph';
      else if (mode === 'uml' || mode === 'erd' || mode === '<>uml') targetMode = 'uml';
      else targetMode = 'data';

      tablePanelViewMode[step] = targetMode;
      try {
        localStorage.setItem(`maestro_switch_table_${step}`, targetMode);
      } catch (e) {}

      const uiView = document.getElementById(`step-${step}-ui-view`);
      const umlView = document.getElementById(`step-${step}-uml-view`);
      const mermaidView = document.getElementById(`step-${step}-mermaid-view`);
      const aiView = document.getElementById(`step-${step}-ai-view`);
      const visuelsView = document.getElementById(`step-${step}-visuels-view`);
      const toggleContainer = document.getElementById(`step-${step}-toggle`);

      if (toggleContainer) {
        toggleContainer.querySelectorAll('button[data-view]').forEach(btn => {
          const v = btn.dataset.view;
          const isActive = (v === targetMode) || (v === 'ai' && targetMode === 'ai') || (v === 'data' && targetMode === 'data') || (v === 'graph' && (targetMode === 'graph' || targetMode === 'mermaid'));
          btn.className = isActive
            ? 'px-2 py-0.5 text-[9.5px] font-bold bg-blue-800 text-white transition'
            : 'px-2 py-0.5 text-[9.5px] font-bold bg-white text-slate-600 hover:bg-slate-50 transition';
        });
      }

      if (uiView) uiView.classList.toggle('hidden', targetMode !== 'data');
      if (umlView) umlView.classList.toggle('hidden', targetMode !== 'uml');
      if (mermaidView) mermaidView.classList.toggle('hidden', targetMode !== 'graph' && targetMode !== 'mermaid');
      if (aiView) aiView.classList.toggle('hidden', targetMode !== 'ai');
      if (visuelsView) visuelsView.classList.toggle('hidden', targetMode !== 'visuels');

      const promptTplBtn = document.getElementById(`step-${step}-prompt-template-btn`);
      if (promptTplBtn) promptTplBtn.classList.toggle('hidden', targetMode !== 'ai');

      const mesureEditBtn = document.getElementById(`step-${step}-mesure-edit-btn`);
      if (mesureEditBtn) mesureEditBtn.classList.toggle('hidden', targetMode !== 'data');

      if (targetMode === 'ai') {
        renderTableAiView(step);
      } else if (targetMode === 'visuels') {
        renderVisuelsPromptView(step);
      } else if (targetMode === 'graph' || targetMode === 'mermaid') {
        renderStepUml(step);
      } else if (targetMode === 'uml') {
        updateStepUmlCodeEditor(step);
      } else {
        if (step === 3) renderStep3TablePreview();
        else if (step === 5) renderStep5TablePreview();
      }
    }

    function updateStepUmlCodeEditor(step) {
      const codeArea = document.getElementById(`step-${step}-uml-code`);
      if (!codeArea) return;
      const code = (getStepUmlCode(step) || '').trim();
      if (codeArea.value !== code) codeArea.value = code;
      const badge = document.getElementById(`step-${step}-uml-editable-badge`);
      const opt = selections[step] || 'B';
      const isCustom = typeof opt === 'string' && opt.startsWith('custom_m_');
      if (badge) badge.classList.toggle('hidden', !isCustom);
    }

    function getPromptTemplate() {
      try {
        const custom = localStorage.getItem(PROMPT_TEMPLATE_STORAGE_KEY);
        if (custom && custom.trim().length > 0) return custom;
      } catch (e) {}
      return DEFAULT_PROMPT_TEMPLATE;
    }

    function savePromptTemplate(templateStr) {
      try {
        localStorage.setItem(PROMPT_TEMPLATE_STORAGE_KEY, templateStr);
      } catch (e) {}
    }

    function getOptionDescription(step, opt) {
      const cardEl = document.getElementById(`opt-${step}-${opt}`);
      if (cardEl) {
        const descEl = cardEl.querySelector('.ans-desc');
        if (descEl && descEl.textContent.trim()) {
          return descEl.textContent.trim();
        }
      }
      if (metaInfo[step] && metaInfo[step][opt] && metaInfo[step][opt].desc) {
        return metaInfo[step][opt].desc;
      }
      return "";
    }

    function getChartJsSourceCode(step, opt) {
      if (typeof opt === 'string' && opt.startsWith('custom_')) {
        const custom = getCustomVisualById(step, opt);
        if (custom && custom.codeJs) return custom.codeJs.trim();
        if (custom && custom.config) return JSON.stringify(custom.config, null, 2);
      }
      const key = getChartStorageKey(step, opt);
      const saved = localStorage.getItem(key);
      if (saved) {
        try {
          return JSON.stringify(JSON.parse(saved), null, 2);
        } catch (e) {}
      }
      const spec = buildStepChartSpec(step, opt, 1);
      if (spec && spec.config) {
        return JSON.stringify(spec.config, (k, v) => typeof v === 'function' ? undefined : v, 2);
      }
      return '// Code source Chart.js non disponible';
    }

    function generateChartJsPrompt(step, opt) {
      // Prompt basé sur les ENTRÉES (table de calculs & modèles ERD)
      const sourceStep = (step === 6) ? 5 : 3;
      let promptText = (typeof generateTableAiPrompt === 'function')
        ? generateTableAiPrompt(sourceStep)
        : '';

      const desc = getOptionDescription(step, opt);
      let visualTitle = '';
      if (typeof opt === 'string' && opt.startsWith('custom_')) {
        const custom = getCustomVisualById(step, opt);
        visualTitle = custom ? custom.title : opt;
      } else if (metaInfo[step] && metaInfo[step][opt]) {
        visualTitle = metaInfo[step][opt].title;
      }

      let customContext = '';
      if (visualTitle) customContext += `Titre du visuel : "${visualTitle}"\n`;
      if (desc) customContext += `Description : "${desc}"\n`;

      if (customContext && promptText) {
        if (promptText.includes('ENTRÉES\n')) {
          promptText = promptText.replace('ENTRÉES\n', `ENTRÉES\n${customContext}\n`);
        } else if (promptText.includes('ENTRÉES')) {
          promptText = promptText.replace('ENTRÉES', `ENTRÉES\n${customContext}`);
        } else {
          promptText = `${customContext}\n${promptText}`;
        }
      }
      return promptText || `Proposer une visualisation pertinente basée sur les ENTRÉES dans un code bloc au format contenu sans le { } de l'objet js de ChartJS avec un minimum de données d'exemples.`;
    }

    function generateSapPrompt(step, opt) {
      // Prompt de transposition SAP-IBP / SAP Analytics Stories
      const jsCode = getChartJsSourceCode(step, opt);
      const uml2A = (typeof getMermaidSchema === 'function' ? getMermaidSchema('A') : '').trim();
      const uml2B = (typeof getMermaidSchema === 'function' ? getMermaidSchema('B') : '').trim();

      return `Générer les hypothèses et les instructions pour utiliser SAP-IBP / SAP Analytics Stories pour générer le même graphique pas à pas, en connaissant le VISUEL et les ENTRÉES :

VISUEL :
\`\`\`javascript
${jsCode}
\`\`\`

ENTRÉES :
--- Modèle (Consolidation Demande) ---
\`\`\`mermaid
${uml2A}
\`\`\`

--- Modèle (Lignes d'Intervention) ---
\`\`\`mermaid
${uml2B}
\`\`\``;
    }

    function generateChartMarkdownPrompt(step, opt) {
      return generateSapPrompt(step, opt);
    }

    function renderChartAiView(step) {
      const opt = selections[step];
      const codeEl = document.getElementById('step-' + step + '-sap-code') || document.getElementById('step-' + step + '-ai-code');
      if (codeEl) {
        codeEl.textContent = generateSapPrompt(step, opt);
      }
    }

    function renderChartJsPromptView(step) {
      const opt = selections[step];
      const codeEl = document.getElementById('step-' + step + '-chartjs-prompt-code') || document.getElementById('step-' + step + '-ai-code');
      if (codeEl) {
        codeEl.textContent = generateChartJsPrompt(step, opt);
      }
    }

    function renderChartSapView(step) {
      renderChartAiView(step);
    }

    function onChartConfigChange(step, val) {
      const opt = selections[step];
      const savedMsg = document.getElementById(`step-${step}-config-saved-msg`);
      try {
        const parsed = JSON.parse(val);
        const key = getChartStorageKey(step, opt);
        localStorage.setItem(key, val);
        const canvas = document.getElementById('step-' + step + '-canvas');
        if (canvas) {
          renderChartInto(canvas, parsed);
        }
        if (savedMsg) {
          savedMsg.textContent = '✓ Enregistré';
          savedMsg.className = 'text-[9.5px] text-emerald-600 font-semibold inline';
          clearTimeout(window[`_savedTimer_${step}`]);
          window[`_savedTimer_${step}`] = setTimeout(() => {
            savedMsg.className = 'text-[9.5px] text-emerald-600 font-semibold hidden';
          }, 2000);
        }
      } catch (err) {
        if (savedMsg) {
          savedMsg.textContent = '⚠ JSON invalide';
          savedMsg.className = 'text-[9.5px] text-rose-600 font-semibold inline';
        }
      }
    }

    function renderChartConfigView(step) {
      const codeEl = document.getElementById('step-' + step + '-config-code');
      if (!codeEl) return;
      const cfg = getActiveChartConfig(step);
      let text = '// Aucune configuration disponible';
      if (cfg) {
        text = JSON.stringify(cfg, null, 2);
      }
      if (codeEl.tagName.toLowerCase() === 'textarea') {
        codeEl.value = text;
      } else {
        codeEl.textContent = text;
      }
    }

    function renderChartDataJsView(step) {
      renderChartConfigView(step);
    }

    function copyChartConfigJson(step) {
      const codeEl = document.getElementById('step-' + step + '-config-code');
      const text = codeEl ? (codeEl.value !== undefined ? codeEl.value : codeEl.textContent) : '';
      const btn = document.getElementById('step-' + step + '-config-copy-btn');
      copyTextToClipboard(text).then(() => {
        if (btn) {
          btn.textContent = '✓';
          btn.classList.add('text-emerald-400');
          setTimeout(() => {
            btn.textContent = '⧉';
            btn.classList.remove('text-emerald-400');
          }, 1500);
        }
      });
    }

    function copyChartDataJs(step) {
      copyChartConfigJson(step);
    }

    function copyChartJsCode(step) {
      const codeEl = document.getElementById('step-' + step + '-js-code');
      const text = codeEl ? codeEl.textContent : '';
      const btn = document.getElementById('step-' + step + '-js-copy-btn');
      copyTextToClipboard(text).then(() => {
        if (btn) {
          btn.textContent = '✓';
          btn.classList.add('text-emerald-400');
          setTimeout(() => {
            btn.textContent = '⧉';
            btn.classList.remove('text-emerald-400');
          }, 1500);
        }
      });
    }

    function copyChartJsPrompt(step) {
      const opt = selections[step];
      const text = generateChartJsPrompt(step, opt);
      const btn = document.getElementById('step-' + step + '-chartjs-prompt-copy-btn');
      copyTextToClipboard(text).then(() => {
        if (btn) {
          btn.textContent = '✓';
          btn.classList.add('text-emerald-400');
          setTimeout(() => {
            btn.textContent = '⧉';
            btn.classList.remove('text-emerald-400');
          }, 1500);
        }
      });
    }

    function copyChartSapPrompt(step) {
      const opt = selections[step];
      const text = generateSapPrompt(step, opt);
      const btn = document.getElementById('step-' + step + '-sap-copy-btn') || document.getElementById('step-' + step + '-ai-copy-btn');
      copyTextToClipboard(text).then(() => {
        if (btn) {
          btn.textContent = '✓';
          btn.classList.add('text-emerald-400');
          setTimeout(() => {
            btn.textContent = '⧉';
            btn.classList.remove('text-emerald-400');
          }, 1500);
        }
      });
    }

    function copyChartAi(step) {
      copyChartSapPrompt(step);
    }

    // ===== Gestionnaire des données statiques du graphique (Vue data & Graph Data Generator) =====
    let activeGraphDataStep = 4;
    const currentStep4ChartGrid = null;
    const currentStep6ChartGrid = null;
    window._chartGrids = { 4: null, 6: null };

    function getGraphDataStorageKey(step, opt) {
      return `maestro_graph_data_${step}_${opt}`;
    }

    function getGraphDataOverride(step, opt) {
      try {
        const raw = localStorage.getItem(getGraphDataStorageKey(step, opt));
        if (raw) return JSON.parse(raw);
      } catch (e) {}
      return null;
    }

    function saveGraphDataOverride(step, opt, dataObj) {
      try {
        localStorage.setItem(getGraphDataStorageKey(step, opt), JSON.stringify(dataObj));
      } catch (e) {}
    }

    function resetGraphData(step) {
      const opt = selections[step];
      try {
        localStorage.removeItem(getGraphDataStorageKey(step, opt));
      } catch (e) {}
      renderChartDataView(step);
      renderStepChart(step);
      showToast(`↻ Données du graphique réinitialisées (Option ${step}.${opt})`);
    }

    function getEffectiveChartConfig(step) {
      const opt = selections[step];
      const spec = buildStepChartSpec(step, opt, 1);
      if (!spec || !spec.config) return null;
      let cfg = JSON.parse(JSON.stringify(spec.config, (k, v) => typeof v === 'function' ? undefined : v));
      const override = getGraphDataOverride(step, opt);
      if (override && override.datasets && cfg.data && Array.isArray(cfg.data.datasets)) {
        override.datasets.forEach((ods, dsIdx) => {
          if (cfg.data.datasets[dsIdx] && Array.isArray(ods.data)) {
            cfg.data.datasets[dsIdx].data = ods.data.slice();
          }
        });
      }
      return cfg;
    }

    function renderChartDataView(step) {
      const container = document.getElementById(`step-${step}-data-table-container`);
      if (!container) return;
      const opt = selections[step];
      const cfg = getEffectiveChartConfig(step);
      if (!cfg || !cfg.data) {
        container.innerHTML = '<p class="text-slate-400 italic p-3 text-xs">Données non disponibles pour ce graphique.</p>';
        return;
      }

      const labels = Array.isArray(cfg.data.labels) ? cfg.data.labels : [];
      const datasets = Array.isArray(cfg.data.datasets) ? cfg.data.datasets : [];
      if (!labels.length && !datasets.length) {
        container.innerHTML = '<p class="text-slate-400 italic p-3 text-xs">Aucune série de données dans ce graphique.</p>';
        return;
      }

      const gridColumns = [
        {
          id: '__label',
          name: 'Catégorie / Axe X',
          width: '145px',
          formatter: (cell) => gridjs.html(`<span class="font-bold text-slate-700">${escapeHtml(cell)}</span>`)
        }
      ];

      datasets.forEach((ds, dsIdx) => {
        const dsName = ds.label || `Série ${dsIdx + 1}`;
        const baseW = Math.max(105, (dsName.length * 7.5) + 30);
        gridColumns.push({
          id: `__ds_${dsIdx}`,
          name: dsName,
          width: `${baseW}px`,
          formatter: (cell) => gridjs.html(`<span class="font-mono font-semibold text-blue-900">${escapeHtml(cell)}</span>`)
        });
      });

      const gridRows = labels.map((label, rIdx) => {
        const row = [String(label)];
        datasets.forEach(ds => {
          const val = (Array.isArray(ds.data) && ds.data[rIdx] !== undefined) ? ds.data[rIdx] : '-';
          row.push(String(val));
        });
        return row;
      });

      container.innerHTML = '';
      if (window._chartGrids[step]) {
        try { window._chartGrids[step].destroy(); } catch (e) {}
        window._chartGrids[step] = null;
      }

      window._chartGrids[step] = new gridjs.Grid({
        columns: gridColumns,
        data: gridRows,
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
          noRecordsFound: 'Aucune donnée disponible',
          error: 'Erreur de chargement'
        }
      });
      window._chartGrids[step].render(container);
    }

    function openGraphDataGeneratorModal(step) {
      activeGraphDataStep = step;
      const opt = selections[step];
      const modal = document.getElementById('graph-data-generator-modal');
      const badge = document.getElementById('graph-data-step-badge');
      const targetLabel = document.getElementById('graph-data-target-label');
      if (!modal) return;

      if (badge) badge.textContent = `Étape ${step}`;
      if (targetLabel) targetLabel.textContent = `Option active : ${step}.${opt}`;

      renderGraphDataFieldsForm();
      modal.classList.remove('hidden');
    }

    function closeGraphDataGeneratorModal() {
      const modal = document.getElementById('graph-data-generator-modal');
      if (modal) modal.classList.add('hidden');
    }

    function renderGraphDataFieldsForm() {
      const step = activeGraphDataStep;
      const opt = selections[step];
      const container = document.getElementById('graph-data-fields-container');
      if (!container) return;

      const spec = buildStepChartSpec(step, opt, 1);
      if (!spec || !spec.config || !spec.config.data) {
        container.innerHTML = '<p class="text-slate-400 italic p-3 text-xs">Aucune série éditable disponible.</p>';
        return;
      }

      const cfg = getEffectiveChartConfig(step);
      const labels = cfg.data.labels || [];
      const datasets = cfg.data.datasets || [];

      let html = '';
      datasets.forEach((ds, dsIdx) => {
        const rawValues = (Array.isArray(ds.data) ? ds.data : []).map(v => typeof v === 'number' ? v : parseFloat(v) || 0);
        const count = rawValues.length || 1;
        const currentSum = rawValues.reduce((a, b) => a + b, 0);
        const currentMean = Math.round((currentSum / count) * 10) / 10;
        const variance = rawValues.reduce((a, b) => a + Math.pow(b - currentMean, 2), 0) / count;
        const currentStd = Math.round(Math.sqrt(variance) * 10) / 10;
        const minVal = rawValues.length ? Math.min(...rawValues) : 0;
        const maxVal = rawValues.length ? Math.max(...rawValues) : 0;

        html += `<div class="p-3 rounded-lg border border-slate-200 bg-white shadow-2xs space-y-2.5">
          <div class="flex items-center justify-between border-b border-slate-100 pb-1.5">
            <div class="flex items-center gap-2">
              <span class="w-2.5 h-2.5 rounded-full" style="background-color: ${ds.backgroundColor || ds.borderColor || '#3b82f6'}"></span>
              <span class="font-bold text-slate-800 text-xs">${escapeHtml(ds.label || `Série ${dsIdx + 1}`)}</span>
              <span class="text-[10px] text-slate-400 font-mono">(${count} points)</span>
            </div>
            <span class="text-[10px] font-mono text-slate-500">Min: ${minVal} • Max: ${maxVal}</span>
          </div>

          <div class="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-2 items-center">
            <div>
              <label class="block text-[9.5px] text-slate-500 font-semibold mb-0.5">Moyenne cible (Moy) :</label>
              <input type="number" step="0.1" id="graph-gen-mean-${dsIdx}" value="${currentMean}" class="w-full px-2 py-1 border border-slate-300 rounded text-xs font-mono font-bold text-slate-800 focus:outline-none focus:ring-1 focus:ring-blue-800" />
            </div>
            <div>
              <label class="block text-[9.5px] text-slate-500 font-semibold mb-0.5">Écart / Dispersion (± Écart-type) :</label>
              <input type="number" step="0.1" min="0" id="graph-gen-std-${dsIdx}" value="${currentStd}" class="w-full px-2 py-1 border border-slate-300 rounded text-xs font-mono font-bold text-slate-800 focus:outline-none focus:ring-1 focus:ring-blue-800" />
            </div>
            <div class="sm:col-span-2">
              <label class="block text-[9.5px] text-slate-500 font-semibold mb-0.5">Aperçu direct des valeurs :</label>
              <input type="text" id="graph-gen-vals-${dsIdx}" value="${rawValues.join(', ')}" class="w-full px-2 py-1 border border-slate-300 rounded text-[11px] font-mono text-slate-700 focus:outline-none focus:ring-1 focus:ring-blue-800 truncate" title="Valeurs directes séparées par virgule" />
            </div>
          </div>
        </div>`;
      });

      container.innerHTML = html;
    }

    function saveGraphDataFromModal() {
      const step = activeGraphDataStep;
      const opt = selections[step];
      const cfg = getEffectiveChartConfig(step);
      if (!cfg || !cfg.data || !Array.isArray(cfg.data.datasets)) return;

      const overrideDatasets = [];
      cfg.data.datasets.forEach((ds, dsIdx) => {
        const valInput = document.getElementById(`graph-gen-vals-${dsIdx}`);
        let vals = [];
        if (valInput && valInput.value.trim()) {
          vals = valInput.value.split(',').map(s => {
            const n = parseFloat(s.trim());
            return isNaN(n) ? 0 : Math.round(n * 10) / 10;
          });
        } else {
          vals = ds.data ? ds.data.slice() : [];
        }
        overrideDatasets.push({
          label: ds.label,
          data: vals
        });
      });

      saveGraphDataOverride(step, opt, { datasets: overrideDatasets });
      closeGraphDataGeneratorModal();
      renderChartDataView(step);
      renderStepChart(step);
      showToast(`💾 Données du graphique enregistrées (Étape ${step}.${opt})`);
    }

    function regenerateGraphDataFromModal() {
      const step = activeGraphDataStep;
      const opt = selections[step];
      const cfg = getEffectiveChartConfig(step);
      if (!cfg || !cfg.data || !Array.isArray(cfg.data.datasets)) return;

      const labels = cfg.data.labels || [];
      const count = labels.length || 6;
      const rng = createPRNG(Date.now() % 1000000);

      cfg.data.datasets.forEach((ds, dsIdx) => {
        const meanInput = document.getElementById(`graph-gen-mean-${dsIdx}`);
        const stdInput = document.getElementById(`graph-gen-std-${dsIdx}`);
        const valsInput = document.getElementById(`graph-gen-vals-${dsIdx}`);
        const mean = meanInput ? (parseFloat(meanInput.value) || 20) : 20;
        const std = stdInput ? (parseFloat(stdInput.value) || Math.max(1, mean * 0.2)) : Math.max(1, mean * 0.2);

        const newVals = [];
        for (let i = 0; i < count; i++) {
          // Box-Muller normal approximation using mulberry32 PRNG
          const u1 = Math.max(0.0001, rng());
          const u2 = rng();
          const z = Math.sqrt(-2.0 * Math.log(u1)) * Math.cos(2.0 * Math.PI * u2);
          const generated = Math.round(Math.max(0, mean + z * std) * 10) / 10;
          newVals.push(generated);
        }
        if (valsInput) valsInput.value = newVals.join(', ');
      });
      showToast(`🎲 Nouvelles valeurs générées avec moyenne et dispersion`);
    }

    function restoreGraphDataModal() {
      const step = activeGraphDataStep;
      const opt = selections[step];
      try {
        localStorage.removeItem(getGraphDataStorageKey(step, opt));
      } catch (e) {}
      renderGraphDataFieldsForm();
      renderChartDataView(step);
      renderStepChart(step);
      showToast(`↻ Données d'origine rétablies (Étape ${step}.${opt})`);
    }

    function toggleChartMode(step, mode) {
      // Normaliser le mode (data | graph | js | <>js | visuels | sap)
      let targetMode = mode;
      if (mode === 'ui' || mode === 'chart') targetMode = 'graph';
      if (mode === 'ai') targetMode = 'sap';
      if (mode === '<>js' || mode === 'chartjs') targetMode = '<>js';
      if (mode === 'js' || mode === 'config') targetMode = 'js';
      if (mode === '<>visuels') targetMode = 'visuels';
      if (mode === '<>sap') targetMode = 'sap';
      if (mode === 'data') targetMode = 'data';
      chartViewMode[step] = targetMode;
      try {
        localStorage.setItem('maestro_switch_chart_' + step, targetMode);
      } catch (e) {}

      const dataView = document.getElementById('step-' + step + '-data-view');
      const chartView = document.getElementById('step-' + step + '-chart-view');
      const configView = document.getElementById('step-' + step + '-config-view');
      const chartjsPromptView = document.getElementById('step-' + step + '-chartjs-prompt-view');
      const visuelsView = document.getElementById('step-' + step + '-visuels-view');
      const sapView = document.getElementById('step-' + step + '-sap-view') || document.getElementById('step-' + step + '-ai-view');
      const toggleContainer = document.getElementById('step-' + step + '-chart-toggle');

      if (toggleContainer) {
        toggleContainer.querySelectorAll('button[data-view]').forEach(btn => {
          const v = btn.dataset.view;
          const isActive = (v === targetMode) || (v === 'chart' && targetMode === 'graph');
          btn.className = isActive
            ? 'px-2 py-0.5 text-[9.5px] font-bold bg-blue-800 text-white transition'
            : 'px-2 py-0.5 text-[9.5px] font-bold bg-white text-slate-600 hover:bg-slate-50 transition';
        });
      }

      if (dataView) dataView.classList.toggle('hidden', targetMode !== 'data');
      if (chartView) chartView.classList.toggle('hidden', targetMode !== 'graph');
      if (configView) configView.classList.toggle('hidden', targetMode !== 'js');
      if (chartjsPromptView) chartjsPromptView.classList.toggle('hidden', targetMode !== '<>js');
      if (visuelsView) visuelsView.classList.toggle('hidden', targetMode !== 'visuels');
      if (sapView) sapView.classList.toggle('hidden', targetMode !== 'sap');

      if (targetMode === 'data') {
        renderChartDataView(step);
      } else if (targetMode === 'js') {
        renderChartConfigView(step);
      } else if (targetMode === '<>js') {
        renderChartJsPromptView(step);
      } else if (targetMode === 'visuels') {
        renderVisuelsPromptView(step);
      } else if (targetMode === 'sap') {
        renderChartSapView(step);
      } else {
        renderStepChart(step);
      }
    }

    function getActiveChartConfig(step) {
      const opt = selections[step];
      const key = getChartStorageKey(step, opt);
      const saved = localStorage.getItem(key);
      if (saved) {
        try {
          return JSON.parse(saved);
        } catch (e) {
          console.warn('Erreur lecture localStorage chart:', e);
        }
      }
      const spec = buildStepChartSpec(step, opt, 1);
      if (spec && spec.config) {
        // Copie propre et sérialisable
        return JSON.parse(JSON.stringify(spec.config, (k, v) => typeof v === 'function' ? undefined : v));
      }
      return null;
    }

    function renderGuiEditor(step) {
      const container = document.getElementById('step-' + step + '-gui-editor');
      if (!container) return;

      const cfg = getActiveChartConfig(step);
      editingChartConfig[step] = cfg;
      if (!cfg) {
        container.innerHTML = '<p class="text-slate-400 italic p-3">Configuration non disponible pour ce type de graphique.</p>';
        return;
      }

      const data = cfg.data || {};
      const labels = Array.isArray(data.labels) ? data.labels : [];
      const datasets = Array.isArray(data.datasets) ? data.datasets : [];
      const scales = (cfg.options && cfg.options.scales) || {};
      const plugins = (cfg.options && cfg.options.plugins) || {};
      const legend = plugins.legend || {};

      const xAxisTitle = (scales.x && scales.x.title && scales.x.title.text) || '';
      const yAxisTitle = (scales.y && scales.y.title && scales.y.title.text) || '';
      const isLegendDisplay = legend.display !== false;

      let html = '';

      // Section 1 : Titres des Axes & Légende
      html += `
        <div class="bg-slate-50 border border-slate-200 rounded-lg p-2.5">
          <div class="font-bold text-slate-800 text-[11.5px] mb-2 flex items-center gap-1.5">
            <span>🏷️</span> Axes & Légende
          </div>
          <div class="grid grid-cols-1 sm:grid-cols-2 gap-2">
            <div>
              <label class="block text-[10px] font-bold text-slate-600 mb-0.5">Titre Axe X</label>
              <input type="text" id="gui-${step}-axis-x" value="${escapeHtml(xAxisTitle)}" oninput="saveGuiEditor(${step})" class="w-full bg-white border border-slate-300 rounded px-2 py-1 text-[11px] focus:border-blue-500 focus:outline-none" />
            </div>
            <div>
              <label class="block text-[10px] font-bold text-slate-600 mb-0.5">Titre Axe Y</label>
              <input type="text" id="gui-${step}-axis-y" value="${escapeHtml(yAxisTitle)}" oninput="saveGuiEditor(${step})" class="w-full bg-white border border-slate-300 rounded px-2 py-1 text-[11px] focus:border-blue-500 focus:outline-none" />
            </div>
          </div>
          <div class="mt-2 flex items-center gap-2">
            <label class="inline-flex items-center gap-1.5 text-[10.5px] font-semibold text-slate-700 cursor-pointer">
              <input type="checkbox" id="gui-${step}-legend-display" ${isLegendDisplay ? 'checked' : ''} onchange="saveGuiEditor(${step})" class="rounded border-slate-300 text-blue-800 focus:ring-blue-700" />
              <span>Afficher la légende</span>
            </label>
          </div>
        </div>
      `;

      // Section 2 : Séries & Palette de couleurs
      html += `
        <div class="bg-slate-50 border border-slate-200 rounded-lg p-2.5">
          <div class="font-bold text-slate-800 text-[11.5px] mb-2 flex items-center gap-1.5">
            <span>🎨</span> Séries de Données & Couleurs
          </div>
          <div class="space-y-2">
      `;

      datasets.forEach((ds, dsIdx) => {
        const dsLabel = ds.label || `Série ${dsIdx + 1}`;
        const currentColor = (typeof ds.backgroundColor === 'string' && ds.backgroundColor.startsWith('#')) ? ds.backgroundColor : '#3b82f6';

        html += `
          <div class="bg-white border border-slate-200 rounded-md p-2 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
            <div class="flex-1 min-w-0">
              <label class="block text-[9.5px] font-bold text-slate-500 uppercase">Nom de la série ${dsIdx + 1}</label>
              <input type="text" id="gui-${step}-ds-label-${dsIdx}" value="${escapeHtml(dsLabel)}" oninput="saveGuiEditor(${step})" class="w-full mt-0.5 bg-slate-50 border border-slate-300 rounded px-1.5 py-0.5 text-[11px] font-semibold text-slate-800 focus:border-blue-500 focus:outline-none" />
            </div>
            <div class="shrink-0 flex items-center gap-1.5">
              <label class="text-[10px] font-semibold text-slate-600">Couleur :</label>
              <input type="color" id="gui-${step}-ds-color-${dsIdx}" value="${currentColor}" oninput="saveGuiEditor(${step})" onchange="saveGuiEditor(${step})" class="w-7 h-7 p-0.5 border border-slate-300 rounded cursor-pointer" />
              <div class="flex items-center gap-1 ml-1">
                ${COLOR_PALETTES.slice(0, 5).map(p => `
                  <button type="button" title="${p.name}" onclick="document.getElementById('gui-${step}-ds-color-${dsIdx}').value='${p.color}'; saveGuiEditor(${step});" class="w-4 h-4 rounded-full border border-white shadow-xs hover:scale-110 transition" style="background-color: ${p.color};"></button>
                `).join('')}
              </div>
            </div>
          </div>
        `;
      });

      html += `
          </div>
        </div>
      `;

      // Section 3 : Données et Labels
      if (labels.length > 0) {
        html += `
          <div class="bg-slate-50 border border-slate-200 rounded-lg p-2.5">
            <div class="flex items-center justify-between mb-2">
              <div class="font-bold text-slate-800 text-[11.5px] flex items-center gap-1.5">
                <span>📊</span> Points de Données (${labels.length} éléments)
              </div>
              <button type="button" onclick="guiAddRow(${step})" class="text-[10px] font-bold text-blue-800 bg-blue-50 hover:bg-blue-100 border border-blue-200 px-2 py-0.5 rounded cursor-pointer transition shadow-2xs">
                + Ajouter une ligne
              </button>
            </div>
            <div class="space-y-1.5 max-h-[220px] overflow-y-auto pr-1">
        `;

        labels.forEach((lbl, rIdx) => {
          html += `
            <div class="bg-white border border-slate-200 rounded-md p-1.5 flex items-center gap-2" id="gui-${step}-row-${rIdx}">
              <span class="text-[10px] font-mono text-slate-400 w-5 shrink-0 text-center">${rIdx + 1}</span>
              <input type="text" id="gui-${step}-lbl-${rIdx}" value="${escapeHtml(lbl)}" placeholder="Label" oninput="saveGuiEditor(${step})" class="flex-1 min-w-[120px] bg-slate-50 border border-slate-300 rounded px-1.5 py-0.5 text-[11px] focus:border-blue-500 focus:outline-none" />
          `;

          datasets.forEach((ds, dsIdx) => {
            const rawVal = Array.isArray(ds.data) ? ds.data[rIdx] : '';
            const val = (rawVal !== undefined && rawVal !== null && typeof rawVal === 'number') ? rawVal : (typeof rawVal === 'object' && rawVal && rawVal.y !== undefined ? rawVal.y : rawVal || 0);
            html += `
              <div class="flex items-center gap-1 shrink-0 w-24">
                <input type="number" step="any" id="gui-${step}-val-${dsIdx}-${rIdx}" value="${val}" placeholder="Val" oninput="saveGuiEditor(${step})" class="w-full bg-slate-50 border border-slate-300 rounded px-1.5 py-0.5 text-[11px] text-right font-mono focus:border-blue-500 focus:outline-none" />
              </div>
            `;
          });

          html += `
              <button type="button" onclick="guiRemoveRow(${step}, ${rIdx})" title="Supprimer cette ligne" class="text-slate-400 hover:text-red-600 font-bold px-1.5 py-0.5 text-[12px] cursor-pointer transition">
                ✕
              </button>
            </div>
          `;
        });

        html += `
            </div>
          </div>
        `;
      }

      container.innerHTML = html;
    }

    function escapeHtml(str) {
      if (str === undefined || str === null) return '';
      return String(str)
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;')
        .replace(/'/g, '&#039;');
    }

    function guiAddRow(step) {
      const cfg = editingChartConfig[step];
      if (!cfg || !cfg.data) return;
      if (!Array.isArray(cfg.data.labels)) cfg.data.labels = [];
      cfg.data.labels.push(`Élément ${cfg.data.labels.length + 1}`);
      if (Array.isArray(cfg.data.datasets)) {
        cfg.data.datasets.forEach(ds => {
          if (Array.isArray(ds.data)) {
            const lastVal = ds.data.length > 0 ? ds.data[ds.data.length - 1] : 10;
            ds.data.push(typeof lastVal === 'number' ? Math.round(lastVal * 0.95) : 10);
          }
        });
      }
      saveGuiEditor(step);
      renderGuiEditor(step);
    }

    function guiRemoveRow(step, rIdx) {
      const cfg = editingChartConfig[step];
      if (!cfg || !cfg.data) return;
      if (Array.isArray(cfg.data.labels)) {
        cfg.data.labels.splice(rIdx, 1);
      }
      if (Array.isArray(cfg.data.datasets)) {
        cfg.data.datasets.forEach(ds => {
          if (Array.isArray(ds.data)) ds.data.splice(rIdx, 1);
        });
      }
      saveGuiEditor(step);
      renderGuiEditor(step);
    }

    function saveGuiEditor(step) {
      const opt = selections[step];
      const cfg = editingChartConfig[step];
      if (!cfg || !cfg.data) return;

      // 1. Lire les titres d'axes et légende
      const axisXInput = document.getElementById(`gui-${step}-axis-x`);
      const axisYInput = document.getElementById(`gui-${step}-axis-y`);
      const legendCheck = document.getElementById(`gui-${step}-legend-display`);

      if (!cfg.options) cfg.options = {};
      if (!cfg.options.scales) cfg.options.scales = {};
      if (axisXInput) {
        if (!cfg.options.scales.x) cfg.options.scales.x = {};
        if (!cfg.options.scales.x.title) cfg.options.scales.x.title = { display: true };
        cfg.options.scales.x.title.text = axisXInput.value;
        cfg.options.scales.x.title.display = !!axisXInput.value;
      }
      if (axisYInput) {
        if (!cfg.options.scales.y) cfg.options.scales.y = {};
        if (!cfg.options.scales.y.title) cfg.options.scales.y.title = { display: true };
        cfg.options.scales.y.title.text = axisYInput.value;
        cfg.options.scales.y.title.display = !!axisYInput.value;
      }
      if (legendCheck) {
        if (!cfg.options.plugins) cfg.options.plugins = {};
        if (!cfg.options.plugins.legend) cfg.options.plugins.legend = {};
        cfg.options.plugins.legend.display = legendCheck.checked;
      }

      // 2. Séries et Couleurs
      const datasets = Array.isArray(cfg.data.datasets) ? cfg.data.datasets : [];
      datasets.forEach((ds, dsIdx) => {
        const lblInput = document.getElementById(`gui-${step}-ds-label-${dsIdx}`);
        const colorInput = document.getElementById(`gui-${step}-ds-color-${dsIdx}`);
        if (lblInput) ds.label = lblInput.value;
        if (colorInput) {
          ds.backgroundColor = colorInput.value;
          if (ds.borderColor && typeof ds.borderColor === 'string') {
            ds.borderColor = colorInput.value;
          }
        }
      });

      // 3. Données et Labels
      const labels = Array.isArray(cfg.data.labels) ? cfg.data.labels : [];
      labels.forEach((_, rIdx) => {
        const lblInput = document.getElementById(`gui-${step}-lbl-${rIdx}`);
        if (lblInput) labels[rIdx] = lblInput.value;
        datasets.forEach((ds, dsIdx) => {
          const valInput = document.getElementById(`gui-${step}-val-${dsIdx}-${rIdx}`);
          if (valInput && Array.isArray(ds.data)) {
            const num = parseFloat(valInput.value);
            ds.data[rIdx] = isNaN(num) ? 0 : num;
          }
        });
      });

      // Sauvegarde dans localStorage
      const key = getChartStorageKey(step, opt);
      localStorage.setItem(key, JSON.stringify(cfg));

      // Rendre dans le canvas
      const canvas = document.getElementById('step-' + step + '-canvas');
      renderChartInto(canvas, cfg);
    }

    function resetChartCode(step) {
      const opt = selections[step];
      const key = getChartStorageKey(step, opt);
      localStorage.removeItem(key);
      if (chartViewMode[step] === 'config') {
        renderChartConfigView(step);
      }
      renderStepChart(step);
    }

    function renderStepChart(step) {
      const opt = selections[step];
      if (!opt) return;
      const spec = buildStepChartSpec(step, opt, 1);
      if (!spec) return;
      const canvas = document.getElementById('step-' + step + '-canvas');
      const titleEl = document.getElementById('step-' + step + '-chart-title');
      if (titleEl) titleEl.innerHTML = spec.title;

      if (step === 6) {
        const resetBtn = document.getElementById('step-6-treemap-reset');
        if (resetBtn) {
          if (opt === 'H' && window._drillTreemapEngine) {
            resetBtn.classList.remove('hidden');
            resetBtn.textContent = `◀ Revenir aux Moteurs (${window._drillTreemapEngine})`;
          } else {
            resetBtn.classList.add('hidden');
          }
        }
      }

      // Vérifier si un code personnalisé existe dans localStorage pour cette option, sinon utiliser la config pilotée par les données data
      let activeConfig = getEffectiveChartConfig(step) || spec.config;
      const key = getChartStorageKey(step, opt);
      const savedCode = localStorage.getItem(key);
      if (savedCode) {
        try {
          activeConfig = JSON.parse(savedCode);
        } catch (e) {
          console.warn('Erreur chargement code customisé:', e);
          activeConfig = getEffectiveChartConfig(step) || spec.config;
        }
      }

      // Synchroniser la vue ouverte (data, js, <>js, visuels, sap)
      if (chartViewMode[step] === 'data') {
        renderChartDataView(step);
      } else if (chartViewMode[step] === 'js' || chartViewMode[step] === 'config') {
        renderChartConfigView(step);
      } else if (chartViewMode[step] === '<>js' || chartViewMode[step] === 'chartjs') {
        renderChartJsPromptView(step);
      } else if (chartViewMode[step] === 'visuels') {
        renderVisuelsPromptView(step);
      } else if (chartViewMode[step] === 'sap' || chartViewMode[step] === 'ai' || chartViewMode[step] === 'md') {
        renderChartSapView(step);
      }

      renderChartInto(canvas, activeConfig);
    }

    const dashboardCardMode = { 4: 'ui', 6: 'ui' };

    function toggleDashboardCardMode(step, mode) {
      dashboardCardMode[step] = mode;
      const cardContainer = document.getElementById('card-step-7-chart-q' + step);
      const toggle = document.getElementById('mock-chart-q' + step + '-toggle');
      const chartView = document.getElementById('mock-chart-q' + step + '-container');
      const configView = document.getElementById('mock-chart-q' + step + '-config-view');
      const sapView = document.getElementById('mock-chart-q' + step + '-sap-view');

      if (toggle) {
        toggle.querySelectorAll('button[data-view]').forEach(btn => {
          const v = btn.dataset.view;
          btn.className = (v === mode)
            ? 'px-1.5 py-0.5 text-[8.5px] font-bold bg-blue-800 text-white transition'
            : 'px-1.5 py-0.5 text-[8.5px] font-bold bg-white text-slate-600 hover:bg-slate-50 transition';
        });
      }

      if (chartView) chartView.classList.toggle('hidden', mode !== 'ui');
      if (configView) configView.classList.toggle('hidden', mode !== 'config');
      if (sapView) sapView.classList.toggle('hidden', mode !== 'sap');

      if (mode === 'ui') {
        renderDashboardChart(step);
      } else if (mode === 'config') {
        renderDashboardCardConfig(step);
      } else if (mode === 'sap') {
        renderDashboardCardSap(step);
      }
    }

    function onDashboardConfigChange(step, val) {
      const opt = selections[step];
      const savedMsg = document.getElementById(`mock-chart-q${step}-config-saved-msg`);
      try {
        const parsed = JSON.parse(val);
        const key = getDashboardChartStorageKey(step, opt);
        localStorage.setItem(key, val);
        const canvas = document.getElementById('mock-chart-q' + step + '-canvas');
        if (canvas) {
          renderChartInto(canvas, parsed);
        }
        if (savedMsg) {
          savedMsg.textContent = '✓ Enregistré';
          savedMsg.className = 'text-[8.5px] text-emerald-600 font-semibold inline';
          clearTimeout(window[`_dashSavedTimer_${step}`]);
          window[`_dashSavedTimer_${step}`] = setTimeout(() => {
            savedMsg.className = 'text-[8.5px] text-emerald-600 font-semibold hidden';
          }, 2000);
        }
      } catch (err) {
        if (savedMsg) {
          savedMsg.textContent = '⚠ JSON invalide';
          savedMsg.className = 'text-[8.5px] text-rose-600 font-semibold inline';
        }
      }
    }

    function getDashboardChartStorageKey(step, opt) {
      return `maestro_dash_custom_chart_${step}_${opt}`;
    }

    function renderDashboardCardConfig(step) {
      const codeEl = document.getElementById('mock-chart-q' + step + '-config-code');
      if (!codeEl) return;
      const opt = selections[step];
      const key = getDashboardChartStorageKey(step, opt);
      const saved = localStorage.getItem(key);
      let text = '// Aucune configuration disponible';
      if (saved) {
        text = saved;
      } else {
        const spec = buildStepChartSpec(step, opt, getFilterMultiplier());
        if (spec && spec.config) {
          text = JSON.stringify(spec.config, null, 2);
        }
      }
      if (codeEl.tagName && codeEl.tagName.toLowerCase() === 'textarea') {
        codeEl.value = text;
      } else {
        codeEl.textContent = text;
      }
    }

    function renderDashboardCardSap(step) {
      const codeEl = document.getElementById('mock-chart-q' + step + '-sap-code');
      if (!codeEl) return;
      const opt = selections[step];
      codeEl.textContent = generateSapPrompt(step, opt);
    }

    function copyDashboardCardConfig(step) {
      const codeEl = document.getElementById('mock-chart-q' + step + '-config-code');
      const text = codeEl ? (codeEl.value !== undefined ? codeEl.value : codeEl.textContent) : '';
      const btn = document.getElementById('mock-chart-q' + step + '-config-copy-btn');
      copyTextToClipboard(text).then(() => {
        if (btn) {
          btn.textContent = '✓';
          btn.classList.add('text-emerald-400');
          setTimeout(() => {
            btn.textContent = '⧉';
            btn.classList.remove('text-emerald-400');
          }, 1500);
        }
      });
    }

    function copyDashboardCardSap(step) {
      const codeEl = document.getElementById('mock-chart-q' + step + '-sap-code');
      const text = codeEl ? codeEl.textContent : '';
      const btn = document.getElementById('mock-chart-q' + step + '-sap-copy-btn');
      copyTextToClipboard(text).then(() => {
        if (btn) {
          btn.textContent = '✓';
          btn.classList.add('text-emerald-400');
          setTimeout(() => {
            btn.textContent = '⧉';
            btn.classList.remove('text-emerald-400');
          }, 1500);
        }
      });
    }

    function renderDashboardChart(step) {
      const opt = selections[step];
      if (!opt) return;
      const canvas = document.getElementById('mock-chart-q' + step + '-canvas');
      if (!canvas) return;
      const key = getDashboardChartStorageKey(step, opt);
      const saved = localStorage.getItem(key);
      if (saved) {
        try {
          const cfg = JSON.parse(saved);
          renderChartInto(canvas, cfg);
          return;
        } catch (e) {
          console.warn('Erreur lecture config dashboard sauvegardée:', e);
        }
      }
      const spec = buildStepChartSpec(step, opt, getFilterMultiplier());
      if (!spec) return;
      renderChartInto(canvas, spec.config);
    }

    function updateRecap() {
      const q1 = selections[1], q2 = selections[2], q3 = selections[3], q4 = selections[4], q5 = selections[5], q6 = selections[6];
      const recapEl = document.getElementById('recap-text');
      if (recapEl) {
        recapEl.textContent =
          `Q1: ${q1} (${metaInfo[1][q1]?.title || ''}) • Q2: ${q2} • Q3: ${q3} • Q4: ${q4} • Q5: ${q5} • Q6: ${q6}`;
      }


      // Synchroniser également tous les dropdowns de l'étape 7 et leurs descriptions
      for (let i = 1; i <= 6; i++) {
        const sel = document.getElementById(`select-q${i}`);
        if (sel && sel.value !== selections[i]) {
          sel.value = selections[i];
        }
        const descEl = document.getElementById(`sum-q${i}-desc`);
        if (descEl && metaInfo[i] && metaInfo[i][selections[i]]) {
          descEl.textContent = metaInfo[i][selections[i]].desc;
        }
      }
    }

    function renderFinalDashboard() {
      const q1 = selections[1];
      const q2 = selections[2];
      const q3 = selections[3];
      const q4 = selections[4];
      const q5 = selections[5];
      const q6 = selections[6];

      // Synchronisation des selects de la nav
      for (let i = 1; i <= 6; i++) {
        const choice = selections[i];
        const selectEl = document.getElementById(`select-q${i}`);
        if (selectEl && selectEl.value !== choice) {
          selectEl.value = choice;
        }
      }

      // Badge profil
      const badge = document.getElementById('summary-badge');
      if (badge) {
        if (q1 === 'A') {
          badge.textContent = "CSPM · SLA & Removal Plan";
          badge.className = "text-xs font-bold text-emerald-700 font-mono";
        } else if (q1 === 'B') {
          badge.textContent = "NTPL · Équilibrage Réseau & Slots";
          badge.className = "text-xs font-bold text-blue-800 font-mono";
        } else if (q1 === 'C') {
          badge.textContent = "FINC · Volumes & Coûts SV";
          badge.className = "text-xs font-bold text-amber-700 font-mono";
        } else if (q1 === 'D') {
          badge.textContent = "SHPL · Ordonnancement Atelier";
          badge.className = "text-xs font-bold text-cyan-700 font-mono";
        } else if (q1 === 'E') {
          badge.textContent = "DMMG & FTM · Demande & Workscopes";
          badge.className = "text-xs font-bold text-purple-700 font-mono";
        } else if (q1 === 'F') {
          badge.textContent = "DGOV · Qualité des Données & Modèles";
          badge.className = "text-xs font-bold text-indigo-700 font-mono";
        } else {
          badge.textContent = "CSPM · SLA & Removal Plan";
          badge.className = "text-xs font-bold text-emerald-700 font-mono";
        }
      }

      // Génération des 4 KPI Cards du haut (influencées par Q1, Q3 TAT et Q5 Capacité)
      renderKpis(q1, q3, q5);

      // Afficher l'explication des cartes sélectionnées Q4 et Q6 dans les encadrés synthèse
      let q4Meta = metaInfo[4][q4] || {};
      if (typeof q4 === 'string' && q4.startsWith('custom_')) {
        const custom4 = getCustomVisualById(4, q4);
        if (custom4) {
          q4Meta = { icon: '✨', title: custom4.title, desc: custom4.desc || 'Visuel personnalisé' };
        }
      }
      let q6Meta = metaInfo[6][q6] || {};
      if (typeof q6 === 'string' && q6.startsWith('custom_')) {
        const custom6 = getCustomVisualById(6, q6);
        if (custom6) {
          q6Meta = { icon: '✨', title: custom6.title, desc: custom6.desc || 'Visuel personnalisé' };
        }
      }

      const q4TitleEl = document.getElementById('mock-chart-q4-title');
      const q4SubEl   = document.getElementById('mock-chart-q4-sub');
      if (q4TitleEl) q4TitleEl.innerHTML = `<span>${q4Meta.icon || '⏱️'}</span> ${q4Meta.title || 'Suivi Délai & Engagements'}`;
      if (q4SubEl)   q4SubEl.textContent = q4Meta.desc || `Choix Q4 : ${q4}`;

      const q6TitleEl = document.getElementById('mock-chart-q6-title');
      const q6SubEl   = document.getElementById('mock-chart-q6-sub');
      if (q6TitleEl) q6TitleEl.innerHTML = `<span>${q6Meta.icon || '🏭'}</span> ${q6Meta.title || 'Charge & Saturation Ateliers'}`;
      if (q6SubEl)   q6SubEl.textContent = q6Meta.desc || `Choix Q6 : ${q6}`;

      // Synchroniser les vues actives dans les encadrés Q4 & Q6
      if (dashboardCardMode[4] === 'ui') {
        renderChartQ4(q4, q1, q3, q2);
      } else if (dashboardCardMode[4] === 'config') {
        renderDashboardCardConfig(4);
      } else if (dashboardCardMode[4] === 'sap') {
        renderDashboardCardSap(4);
      }

      if (dashboardCardMode[6] === 'ui') {
        renderChartQ6(q6, q2);
      } else if (dashboardCardMode[6] === 'config') {
        renderDashboardCardConfig(6);
      } else if (dashboardCardMode[6] === 'sap') {
        renderDashboardCardSap(6);
      }
    }

    // État des filtres interactifs Étape 7
    // État des filtres interactifs Étape 7
    const currentFilters = {
      site: 'ALL',
      client: 'ALL',
      engine: 'ALL',
      date: '2026-10-15'
    };

    function onFilterChange() {
      currentFilters.site = document.getElementById('filter-site')?.value || 'ALL';
      currentFilters.client = document.getElementById('filter-client')?.value || 'ALL';
      currentFilters.engine = document.getElementById('filter-engine')?.value || 'ALL';
      currentFilters.date = document.getElementById('filter-date')?.value || '2026-10-15';
      renderFinalDashboard();
    }

    function resetFilters() {
      currentFilters.site = 'ALL';
      currentFilters.client = 'ALL';
      currentFilters.engine = 'ALL';
      currentFilters.date = '2026-10-15';
      if (document.getElementById('filter-site')) document.getElementById('filter-site').value = 'ALL';
      if (document.getElementById('filter-client')) document.getElementById('filter-client').value = 'ALL';
      if (document.getElementById('filter-engine')) document.getElementById('filter-engine').value = 'ALL';
      if (document.getElementById('filter-date')) document.getElementById('filter-date').value = '2026-10-15';
      renderFinalDashboard();
    }

    function getFilterMultiplier() {
      let m = 1.0;
      const site = currentFilters.site.replace('S-', '');
      if (site === 'VIL') m *= 0.96;
      else if (site === 'MON') m *= 1.08;
      else if (site === 'CHL') m *= 0.92;
      else if (site === 'BRU') m *= 1.04;
      else if (site === 'SQY') m *= 0.95;
      else if (site === 'GEN') m *= 1.02;
      else if (site === 'BDX') m *= 0.98;
      else if (site === 'TLS') m *= 0.97;
      else if (site === 'LGG') m *= 1.05;
      else if (site === 'CRE') m *= 1.01;

      if (currentFilters.client === 'AFR') m *= 1.02;
      else if (currentFilters.client === 'CCA') m *= 1.04;
      else if (currentFilters.client === 'EZY') m *= 0.97;
      else if (currentFilters.client === 'DLH') m *= 0.95;
      else if (currentFilters.client === 'DAL') m *= 0.98;
      else if (currentFilters.client === 'UAE') m *= 1.03;
      else if (currentFilters.client === 'SIA') m *= 0.94;

      if (currentFilters.engine === 'CFM56') m *= 0.90;
      else if (currentFilters.engine === 'CFM56_5B') m *= 0.88;
      else if (currentFilters.engine === 'LEAP1A') m *= 1.06;
      else if (currentFilters.engine === 'LEAP1B') m *= 1.03;
      else if (currentFilters.engine === 'GE90') m *= 1.15;
      else if (currentFilters.engine === 'M88') m *= 0.93;

      // Variation selon l'éloignement de la date dans le futur (effet de saisonnalité)
      if (currentFilters.date) {
        const d = new Date(currentFilters.date);
        if (!isNaN(d.getTime())) {
          const month = d.getMonth(); // 0 à 11
          if (month >= 5 && month <= 8) m *= 1.08; // Pic estival
          else if (month >= 9 && month <= 11) m *= 1.03; // Automne
          else if (month >= 0 && month <= 2) m *= 0.97; // Hiver
        }
      }

      return m;
    }

    function updatePrevisionnelDate(medianTatDays) {
      const el = document.getElementById('filter-previsionnel-date');
      if (!el) return;
      const baseDateStr = currentFilters.date || document.getElementById('filter-date')?.value || '2026-10-15';
      const baseDate = new Date(baseDateStr);
      if (isNaN(baseDate.getTime())) {
        el.textContent = "--";
        return;
      }
      const daysToAdd = Math.round(Number(medianTatDays) || 19);
      const targetDate = new Date(baseDate.getTime() + daysToAdd * 24 * 60 * 60 * 1000);
      const formatted = targetDate.toLocaleDateString('fr-FR', { day: '2-digit', month: '2-digit', year: 'numeric' });
      el.textContent = `${formatted} (+${daysToAdd}j)`;
    }

    function renderKpis(q1, q3, q5) {
      const container = document.getElementById('mock-kpis');
      if (!container) return;

      q5 = q5 || selections[5] || 'B';
      const m = getFilterMultiplier();

      // 1. Détermination du KPI 3 (TAT & Dispersion / Certitude)
      let tatLabel = "TAT MOYEN (" + q3 + ")";
      let baseTat = (19.3 * m).toFixed(1);
      let tatVal = `${baseTat} j`;
      let tatSub = "Méthode: " + (metaInfo[3][q3]?.title || q3);
      let tatColor = "text-blue-800";
      let tatBorder = "border-blue-300";
      let medianDaysForCalc = 19.3 * m;

      if (q3 === 'B') {
        tatLabel = "TAT DISPERSION";
        const p50 = (19.0 * m).toFixed(1);
        const p5 = (12.0 * m).toFixed(1);
        const p95 = (26.5 * m).toFixed(1);
        tatVal = `${p50}j (${p5}j - ${p95}j)`;
        tatSub = `Bornes P5-P95`;
        tatColor = "text-indigo-700";
        tatBorder = "border-indigo-300";
        medianDaysForCalc = 19.0 * m;
      } else if (q3 === 'D') {
        tatLabel = "TAT PRÉDICTIF & CERTITUDE";
        const p50 = (18.8 * m).toFixed(1);
        const p5 = (14.2 * m).toFixed(1);
        const p95 = (23.6 * m).toFixed(1);
        const cert = Math.max(86, Math.min(96, Math.round(92 / m)));
        tatVal = `${p50}j (${p5}j - ${p95}j)`;
        tatSub = `Certitude: ${cert} %`;
        tatColor = "text-purple-700";
        tatBorder = "border-purple-300";
        medianDaysForCalc = 18.8 * m;
      } else if (q3 === 'C') {
        tatLabel = "TAT CHARGÉ ATELIER";
        const tVal = (21.6 * m).toFixed(1);
        const cert3c = Math.max(82, Math.min(94, Math.round(89 / m)));
        tatVal = `${tVal} j`;
        tatSub = `Sur la base de la charge machine • Certitude: ${cert3c} %`;
        tatColor = "text-amber-700";
        tatBorder = "border-amber-300";
        medianDaysForCalc = 21.6 * m;
      } else {
        tatLabel = "TAT GAMME THÉORIQUE";
        const tVal = (18.0 * m).toFixed(1);
        tatVal = `${tVal} j`;
        tatSub = "Barème constructeur nominal + forfaits";
        medianDaysForCalc = 18.0 * m;
      }

      // Mise à jour de la date prévisionnelle de livraison (Date + TAT médian)
      updatePrevisionnelDate(medianDaysForCalc);

      // 2. Détermination du KPI 4 (Capacité / Charge & Certitude)
      let capLabel = "CAPACITÉ & CHARGE (5" + q5 + ")";
      const baseCap = Math.min(99, Math.round(83 * m));
      let capVal = `${baseCap} %`;
      let capSub = metaInfo[5][q5]?.title || q5;
      let capColor = "text-blue-800";
      let capBorder = "border-blue-300";

      if (q5 === 'A') {
        capLabel = "CHARGE S&OP PRÉVISIONNELLE";
        const p50 = Math.min(98, Math.round(86 * m));
        const p5 = Math.min(92, Math.round(72 * m));
        const p95 = Math.min(100, Math.round(94 * m));
        const cert5a = Math.max(84, Math.min(95, Math.round(91 / m)));
        capVal = `${p50}% (${p5}% - ${p95}%)`;
        capSub = `Sur la base du carnet S&OP • Certitude: ${cert5a} %`;
        capColor = "text-blue-800";
        capBorder = "border-blue-300";
      } else if (q5 === 'B') {
        capLabel = "CHARGE EN-COURS (WIP INSTANT)";
        const p50 = Math.min(98, Math.round(88 * m));
        const p5 = Math.min(95, Math.round(75 * m));
        const p95 = Math.min(100, Math.round(96 * m));
        capVal = `${p50}% (${p5}% - ${p95}%)`;
        capSub = `Effectif pointé en direct`;
        capColor = "text-amber-700";
        capBorder = "border-amber-300";
      } else if (q5 === 'C') {
        capLabel = "DISPO PIÈCES & FLUX APPRO";
        const dispoP50 = Math.min(99, Math.round(89 * m));
        const dispoP5 = Math.min(92, Math.round(78 * m));
        const dispoP95 = Math.min(100, Math.round(97 * m));
        const cert5c = Math.max(85, Math.min(96, Math.round(90 / m)));
        capVal = `${dispoP50}% (${dispoP5}% - ${dispoP95}%)`;
        capSub = `Complétude kits OTIF • Certitude: ${cert5c} %`;
        capColor = "text-indigo-700";
        capBorder = "border-indigo-300";
      } else if (q5 === 'D') {
        capLabel = "CHARGE PRÉDICTIVE (RÉALITÉ MRO)";
        const p50 = Math.min(98, Math.round(83 * m));
        const p5 = Math.min(90, Math.round(70 * m));
        const p95 = Math.min(100, Math.round(95 * m));
        const certCap = Math.max(88, Math.min(98, Math.round(94 / m)));
        capVal = `${p50}% (${p5}% - ${p95}%)`;
        capSub = `Aléas CND, Bancs & LLP • Certitude: ${certCap} %`;
        capColor = "text-purple-700";
        capBorder = "border-purple-300";
      }

      let kpis = [];
      if (q1 === 'A') {
        // 1.A : CSPM (Engagements contractuels & SLA)
        const slaConf = (Math.min(99.5, 94.6 / m)).toFixed(1);
        const onTime = Math.round(142 * m);
        const totalClosed = Math.round(150 * m);
        kpis = [
          { label: "CONFORMITÉ SLA GLOBALE", val: `${slaConf} %`, sub: "Objectif contractuel: 95 %", color: "text-emerald-700", border: "border-emerald-300" },
          { label: "DOSSIERS LIVRÉS À L'HEURE", val: `${onTime}`, sub: `Sur ${totalClosed} dossiers clôturés`, color: "text-emerald-600", border: "border-emerald-300" },
          { label: tatLabel, val: tatVal, sub: tatSub, color: tatColor, border: tatBorder },
          { label: capLabel, val: capVal, sub: capSub, color: capColor, border: capBorder }
        ];
      } else if (q1 === 'B') {
        // 1.B : NTPL (Équilibrage réseau & slots)
        const chargeGlob = Math.min(99, Math.round(83 * m));
        const goulots = Math.max(1, Math.round(2 * m));
        kpis = [
          { label: "CHARGE GLOBALE USINES", val: `${chargeGlob} %`, sub: "Seuil critique à 85 %", color: "text-blue-800", border: "border-blue-300" },
          { label: "ATELIERS EN GOULOT", val: `${goulots}`, sub: "Montereau & Villaroche", color: "text-red-700", border: "border-red-300" },
          { label: tatLabel, val: tatVal, sub: tatSub, color: tatColor, border: tatBorder },
          { label: capLabel, val: capVal, sub: capSub, color: capColor, border: capBorder }
        ];
      } else if (q1 === 'C') {
        // 1.C : FINC (Volumes IBP & Coûts)
        const retards = Math.max(2, Math.round(14 * m));
        const sousPen = Math.max(1, Math.round(6 * m));
        const penAmount = (Math.round(184500 * m / 500) * 500).toLocaleString('fr-FR');
        kpis = [
          { label: "MOTEURS EN RETARD", val: `${retards}`, sub: `dont ${sousPen} sous pénalités`, color: "text-amber-700", border: "border-amber-300" },
          { label: "EXPOSITION PÉNALITÉS", val: `${penAmount} €`, sub: "Risque estimé au MTD", color: "text-red-700", border: "border-red-300" },
          { label: tatLabel, val: tatVal, sub: tatSub, color: tatColor, border: tatBorder },
          { label: capLabel, val: capVal, sub: capSub, color: capColor, border: capBorder }
        ];
      } else if (q1 === 'D') {
        // 1.D : SHPL (Ordonnancement atelier & aléas)
        const otifRate = (Math.min(99, 87.8 / m)).toFixed(1);
        const missingParts = Math.max(1, Math.round(5 * m));
        kpis = [
          { label: "DISPONIBILITÉ PIÈCES CRITIQUES", val: `${otifRate} %`, sub: "Taux de service magasin OTIF", color: "text-cyan-700", border: "border-cyan-300" },
          { label: "KITS EN RUPTURE SUR CHAÎNE", val: `${missingParts}`, sub: "Dont 2 sous-ensembles LLP", color: "text-red-700", border: "border-red-300" },
          { label: tatLabel, val: tatVal, sub: tatSub, color: tatColor, border: tatBorder },
          { label: capLabel, val: capVal, sub: capSub, color: capColor, border: capBorder }
        ];
      } else if (q1 === 'E') {
        // 1.E : DMMG & FTM (Consolidation demande & workscopes)
        const fiabRate = (Math.min(99.2, 92.4 / m)).toFixed(1);
        const driftVal = (Math.max(4.2, 7.8 * m)).toFixed(1);
        kpis = [
          { label: "FIABILITÉ GLOBALE MODÈLE", val: `${fiabRate} %`, sub: "Conformité prévision vs réel", color: "text-purple-700", border: "border-purple-300" },
          { label: "DÉRIVE MOYENNE PRÉVU/RÉEL", val: `± ${driftVal} j`, sub: "Écart résiduel constaté", color: "text-indigo-600", border: "border-indigo-300" },
          { label: tatLabel, val: tatVal, sub: tatSub, color: tatColor, border: tatBorder },
          { label: capLabel, val: capVal, sub: capSub, color: capColor, border: capBorder }
        ];
      } else if (q1 === 'F') {
        // 1.F : DGOV (Qualité données & conformité)
        const compRate = (Math.min(99.5, 94.8 / m)).toFixed(1);
        const certScore = Math.max(88, Math.min(98, Math.round(94 / m)));
        kpis = [
          { label: "COMPLÉTUDE SAISIES MES", val: `${compRate} %`, sub: "Données atelier pointées", color: "text-indigo-700", border: "border-indigo-300" },
          { label: "INDICE CERTITUDE PRÉVISION", val: `${certScore} %`, sub: "Niveau confiance statistique", color: "text-emerald-700", border: "border-emerald-300" },
          { label: tatLabel, val: tatVal, sub: tatSub, color: tatColor, border: tatBorder },
          { label: capLabel, val: capVal, sub: capSub, color: capColor, border: capBorder }
        ];
      } else {
        const slaConf = (Math.min(99.5, 94.6 / m)).toFixed(1);
        const onTime = Math.round(142 * m);
        const totalClosed = Math.round(150 * m);
        kpis = [
          { label: "CONFORMITÉ SLA GLOBALE", val: `${slaConf} %`, sub: "Objectif contractuel: 95 %", color: "text-emerald-700", border: "border-emerald-300" },
          { label: "DOSSIERS LIVRÉS À L'HEURE", val: `${onTime}`, sub: `Sur ${totalClosed} dossiers clôturés`, color: "text-emerald-600", border: "border-emerald-300" },
          { label: tatLabel, val: tatVal, sub: tatSub, color: tatColor, border: tatBorder },
          { label: capLabel, val: capVal, sub: capSub, color: capColor, border: capBorder }
        ];
      }

      container.innerHTML = kpis.map(k => `
        <div class="bg-white rounded-lg p-2 border ${k.border} shadow-sm">
          <div class="text-[9px] text-slate-500 font-bold uppercase tracking-wider truncate">${k.label}</div>
          <div class="text-sm md:text-base font-black ${k.color} my-0.5 leading-tight">${k.val}</div>
          <div class="text-[9px] text-slate-500 truncate">${k.sub}</div>
        </div>
      `).join('');
    }

    function renderChartQ4(q4, q1, q3, q2) {
      renderDashboardChart(4);
    }

    function renderChartQ6(q6, q2) {
      renderDashboardChart(6);
    }

