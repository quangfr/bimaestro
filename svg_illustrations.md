# MAESTRO - Référentiel des Illustrations Vectorielles SVG

Ce document archive l'ensemble des snippets SVG utilisés pour illustrer les cartes d'options dans `index.html`. Ces illustrations ont été déportées ici pour garder `content.md` focalisé sur le cadrage fonctionnel, la gouvernance des données et les spécifications Power BI / DAX.

---

## Sommaire
- [Étape 1 : Objectif](#étape-1--objectif)
- [Étape 2 : Données](#étape-2--données)
- [Étape 3 : TAT](#étape-3--tat)
- [Étape 4 : Délai](#étape-4--délai)
- [Étape 5 : Capacité](#étape-5--capacité)
- [Étape 6 : Saturation](#étape-6--saturation)

---

## Étape 1 : Objectif

### Option 1.A : Urgence Opérationnelle (AOG)
```xml
<svg class="w-full h-full" viewBox="0 0 100 85">
  <rect x="5" y="5" width="90" height="75" rx="8" fill="#fef2f2" stroke="#ef4444" stroke-width="1.8" />
  <circle cx="50" cy="28" r="16" fill="#fca5a5" opacity="0.35" />
  <text x="50" y="35" font-size="20" text-anchor="middle" fill="#dc2626">🚨</text>
  <text x="50" y="54" font-size="8.5" font-weight="black" text-anchor="middle" fill="#b91c1c">AOG CRITIQUE</text>
  <text x="50" y="66" font-size="7" text-anchor="middle" fill="#64748b">ESN-9842 • Retard > 5j</text>
  <line x1="20" y1="72" x2="80" y2="72" stroke="#ef4444" stroke-width="1" stroke-dasharray="2,2" />
</svg>
```

### Option 1.B : Engagements Contractuels (SLA)
```xml
<svg class="w-full h-full" viewBox="0 0 100 85">
  <circle cx="50" cy="40" r="30" fill="none" stroke="#f1f5f9" stroke-width="7" />
  <circle cx="50" cy="40" r="30" fill="none" stroke="#10b981" stroke-width="7" stroke-dasharray="188" stroke-dashoffset="24" stroke-linecap="round" />
  <text x="50" y="44" font-size="14" font-weight="black" text-anchor="middle" fill="#0f172a">94.2%</text>
  <text x="50" y="56" font-size="7.5" font-weight="semibold" text-anchor="middle" fill="#059669">Conformité SLA</text>
  <circle cx="50" cy="10" r="3.5" fill="#10b981" />
</svg>
```

### Option 1.C : Optimisation des Capacités
```xml
<svg class="w-full h-full" viewBox="0 0 100 85">
  <rect x="8" y="10" width="38" height="26" rx="4" fill="#f8fafc" stroke="#3b82f6" stroke-width="1.2" />
  <text x="27" y="24" font-size="8.5" font-weight="bold" text-anchor="middle" fill="#1e40af">VIL</text>
  <text x="27" y="33" font-size="6.5" text-anchor="middle" fill="#64748b">Charge 72%</text>

  <rect x="54" y="10" width="38" height="26" rx="4" fill="#f8fafc" stroke="#3b82f6" stroke-width="1.2" />
  <text x="73" y="24" font-size="8.5" font-weight="bold" text-anchor="middle" fill="#1e40af">CHL</text>
  <text x="73" y="33" font-size="6.5" text-anchor="middle" fill="#64748b">Charge 68%</text>

  <rect x="8" y="44" width="38" height="28" rx="4" fill="#fef2f2" stroke="#ef4444" stroke-width="1.8" />
  <text x="27" y="58" font-size="8.5" font-weight="black" text-anchor="middle" fill="#b91c1c">MON ⚠️</text>
  <text x="27" y="68" font-size="6.5" font-weight="bold" text-anchor="middle" fill="#dc2626">Sat. 94%</text>

  <rect x="54" y="44" width="38" height="28" rx="4" fill="#f8fafc" stroke="#3b82f6" stroke-width="1.2" />
  <text x="73" y="58" font-size="8.5" font-weight="bold" text-anchor="middle" fill="#1e40af">BRU</text>
  <text x="73" y="68" font-size="6.5" text-anchor="middle" fill="#64748b">Charge 81%</text>
</svg>
```

### Option 1.D : Suivi Retard & Pénalités
```xml
<svg class="w-full h-full" viewBox="0 0 100 85">
  <rect x="6" y="6" width="88" height="34" rx="5" fill="#fffbeb" stroke="#f59e0b" stroke-width="1.5" />
  <text x="50" y="18" font-size="7" font-bold text-anchor="middle" fill="#78350f">DÉPASSEMENT MOYEN</text>
  <text x="50" y="32" font-size="13" font-weight="black" text-anchor="middle" fill="#b45309">+7.5 jours</text>

  <rect x="6" y="44" width="88" height="35" rx="5" fill="#fef2f2" stroke="#ef4444" stroke-width="1.5" />
  <text x="50" y="56" font-size="7" font-bold text-anchor="middle" fill="#991b1b">PÉNALITÉS ENCOURS</text>
  <text x="50" y="71" font-size="13" font-weight="black" text-anchor="middle" fill="#dc2626">142 500 €</text>
</svg>
```

### Option 1.E : Logistique et Approvisionnement
```xml
<svg class="w-full h-full" viewBox="0 0 100 85">
  <rect x="8" y="8" width="84" height="28" rx="4" fill="#eff6ff" stroke="#3b82f6" stroke-width="1.3" />
  <text x="16" y="21" font-size="8" font-weight="bold" fill="#1e40af">Aubes HP Monocristal</text>
  <rect x="16" y="25" width="48" height="6" rx="2" fill="#bfdbfe" />
  <rect x="16" y="25" width="42" height="6" rx="2" fill="#2563eb" />
  <text x="74" y="30" font-size="7.5" font-weight="bold" fill="#1e40af">88% Stock</text>

  <rect x="8" y="40" width="84" height="28" rx="4" fill="#fffbeb" stroke="#f59e0b" stroke-width="1.3" />
  <text x="16" y="53" font-size="8" font-weight="bold" fill="#92400e">Disque LLP Turbine</text>
  <rect x="16" y="57" width="48" height="6" rx="2" fill="#fde68a" />
  <rect x="16" y="57" width="22" height="6" rx="2" fill="#d97706" />
  <text x="72" y="62" font-size="7.5" font-weight="bold" fill="#b45309">Lead: 18j ⚠️</text>
</svg>
```

---

## Étape 2 : Données

### Option 2.A : Demande de Visite (visit)
```xml
<svg class="w-full h-full" viewBox="0 0 60 60">
  <rect x="4" y="8" width="52" height="44" rx="4" fill="#eff6ff" stroke="#3b82f6" stroke-width="1.5" />
  <rect x="4" y="8" width="52" height="14" rx="4" fill="#3b82f6" />
  <text x="30" y="18" font-size="8" font-weight="bold" fill="#ffffff" text-anchor="middle">VISIT (Macro)</text>
  <circle cx="20" cy="34" r="8" fill="#dbeafe" stroke="#2563eb" stroke-width="1.2" />
  <text x="20" y="37" font-size="9" text-anchor="middle">✈️</text>
  <rect x="33" y="28" width="20" height="4" rx="1" fill="#2563eb" />
  <rect x="33" y="35" width="14" height="3" rx="1" fill="#93c5fd" />
  <rect x="33" y="41" width="18" height="3" rx="1" fill="#10b981" />
</svg>
```

### Option 2.B : Réparation par Atelier (repair)
```xml
<svg class="w-full h-full" viewBox="0 0 60 60">
  <rect x="4" y="6" width="22" height="24" rx="3" fill="#f0fdf4" stroke="#16a34a" stroke-width="1.3" />
  <text x="15" y="16" font-size="6.5" font-weight="bold" fill="#15803d" text-anchor="middle">Shop A</text>
  <text x="15" y="24" font-size="5" fill="#475569" text-anchor="middle">VIL</text>

  <rect x="34" y="30" width="22" height="24" rx="3" fill="#f0fdf4" stroke="#16a34a" stroke-width="1.3" />
  <text x="45" y="40" font-size="6.5" font-weight="bold" fill="#15803d" text-anchor="middle">Shop B</text>
  <text x="45" y="48" font-size="5" fill="#475569" text-anchor="middle">MON</text>

  <path d="M 26 18 Q 44 14, 45 28" fill="none" stroke="#f59e0b" stroke-width="1.8" stroke-dasharray="2,2" />
  <text x="36" y="21" font-size="5.5" font-weight="bold" fill="#d97706">transit</text>
</svg>
```

### Option 2.C : Tâche sur Poste (task)
```xml
<svg class="w-full h-full" viewBox="0 0 60 60">
  <rect x="4" y="6" width="52" height="48" rx="4" fill="#fffbeb" stroke="#f59e0b" stroke-width="1.5" />
  <text x="30" y="16" font-size="7" font-weight="bold" fill="#b45309" text-anchor="middle">STATION / TASK</text>
  <circle cx="20" cy="34" r="10" fill="#fef3c7" stroke="#d97706" stroke-width="1.2" />
  <text x="20" y="38" font-size="11" text-anchor="middle">⚙️</text>
  <rect x="34" y="24" width="18" height="18" rx="2" fill="#2563eb" />
  <text x="43" y="32" font-size="5" font-weight="bold" fill="#ffffff" text-anchor="middle">THEO</text>
  <text x="43" y="39" font-size="6" font-weight="bold" fill="#ffffff" text-anchor="middle">4.5h</text>
</svg>
```

---

## Étape 3 : TAT

### Option 3.A : Délais Théoriques de Traitement
```xml
<svg class="w-full h-full" viewBox="0 0 50 50">
  <rect x="5" y="6" width="40" height="10" rx="2" fill="#dbeafe" stroke="#2563eb" />
  <text x="25" y="14" font-size="7" font-weight="bold" text-anchor="middle" fill="#1e40af">3j + 12j</text>
  <text x="25" y="27" font-size="10" font-weight="black" text-anchor="middle" fill="#64748b">+</text>
  <rect x="5" y="32" width="40" height="10" rx="2" fill="#d1fae5" stroke="#059669" />
  <text x="25" y="40" font-size="7" font-weight="bold" text-anchor="middle" fill="#065f46">TR 1j</text>
</svg>
```

### Option 3.B : Table des Délais Moyens (P50, P5, P95)
```xml
<svg class="w-full h-full" viewBox="0 0 50 50">
  <rect x="6" y="28" width="6" height="14" fill="#93c5fd" />
  <rect x="15" y="18" width="6" height="24" fill="#93c5fd" />
  <rect x="24" y="10" width="6" height="32" fill="#2563eb" />
  <rect x="33" y="14" width="6" height="28" fill="#93c5fd" />
  <line x1="27" y1="6" x2="27" y2="42" stroke="#059669" stroke-width="1.5" />
  <text x="27" y="48" font-size="6" font-weight="bold" text-anchor="middle" fill="#059669">P50</text>
</svg>
```

### Option 3.C : Délais selon Occupation Atelier
```xml
<svg class="w-full h-full" viewBox="0 0 50 50">
  <line x1="8" y1="40" x2="44" y2="40" stroke="#94a3b8" stroke-width="1.2" />
  <line x1="8" y1="8" x2="8" y2="40" stroke="#94a3b8" stroke-width="1.2" />
  <path d="M 8 38 Q 30 36, 40 8" fill="none" stroke="#dc2626" stroke-width="2" />
  <line x1="34" y1="8" x2="34" y2="40" stroke="#d97706" stroke-dasharray="1.5,1.5" />
  <text x="34" y="47" font-size="6" font-weight="bold" text-anchor="middle" fill="#d97706">85%</text>
</svg>
```

### Option 3.D : Modélisation Avancée (Probabiliste)
```xml
<svg class="w-full h-full" viewBox="0 0 50 50">
  <path d="M 5 40 Q 18 40, 25 12 Q 32 40, 45 40" fill="none" stroke="#2563eb" stroke-width="2" />
  <line x1="25" y1="12" x2="25" y2="40" stroke="#d97706" stroke-dasharray="2,2" />
  <circle cx="25" cy="12" r="2.5" fill="#d97706" />
  <text x="25" y="47" font-size="6.5" font-weight="bold" text-anchor="middle" fill="#d97706">m</text>
</svg>
```

---

## Étape 4 : Délai

#### Option 4.A : TAT Médian & Bornes 5%-95%
```xml
<svg class="w-full h-full" viewBox="0 0 100 85">
  <line x1="8" y1="72" x2="92" y2="72" stroke="#cbd5e1" stroke-width="1" />
  <line x1="24" y1="20" x2="24" y2="62" stroke="#64748b" stroke-width="1.5" />
  <line x1="20" y1="20" x2="28" y2="20" stroke="#64748b" stroke-width="1.5" />
  <line x1="20" y1="62" x2="28" y2="62" stroke="#64748b" stroke-width="1.5" />
  <rect x="18" y="32" width="12" height="18" rx="1.5" fill="#3b82f6" />
  <line x1="16" y1="41" x2="32" y2="41" stroke="#1e3a8a" stroke-width="2" />
  <text x="24" y="80" font-size="6.5" font-bold text-anchor="middle" fill="#64748b">CFM56</text>

  <line x1="50" y1="12" x2="50" y2="65" stroke="#64748b" stroke-width="1.5" />
  <line x1="46" y1="12" x2="54" y2="12" stroke="#64748b" stroke-width="1.5" />
  <line x1="46" y1="65" x2="54" y2="65" stroke="#64748b" stroke-width="1.5" />
  <rect x="44" y="26" width="12" height="24" rx="1.5" fill="#6366f1" />
  <line x1="42" y1="38" x2="58" y2="38" stroke="#312e81" stroke-width="2" />
  <text x="50" y="80" font-size="6.5" font-bold text-anchor="middle" fill="#64748b">LEAP-1A</text>

  <line x1="76" y1="16" x2="76" y2="64" stroke="#64748b" stroke-width="1.5" />
  <line x1="72" y1="16" x2="80" y2="16" stroke="#64748b" stroke-width="1.5" />
  <line x1="72" y1="64" x2="80" y2="64" stroke="#64748b" stroke-width="1.5" />
  <rect x="70" y="29" width="12" height="22" rx="1.5" fill="#0284c7" />
  <line x1="68" y1="40" x2="84" y2="40" stroke="#0c4a6e" stroke-width="2" />
  <text x="76" y="80" font-size="6.5" font-bold text-anchor="middle" fill="#64748b">LEAP-1B</text>
</svg>
```

### Option 4.B : Décomposition du TAT par Site
```xml
<svg class="w-full h-full" viewBox="0 0 100 85">
  <text x="5" y="16" font-size="6.5" font-semibold fill="#64748b">VIL</text>
  <rect x="20" y="8" width="42" height="10" rx="1.5" fill="#3b82f6" />
  <rect x="63" y="8" width="14" height="10" rx="1.5" fill="#f59e0b" />
  <rect x="78" y="8" width="16" height="10" rx="1.5" fill="#ef4444" />

  <text x="5" y="32" font-size="6.5" font-semibold fill="#64748b">MON</text>
  <rect x="20" y="24" width="36" height="10" rx="1.5" fill="#3b82f6" />
  <rect x="57" y="24" width="20" height="10" rx="1.5" fill="#f59e0b" />
  <rect x="78" y="24" width="18" height="10" rx="1.5" fill="#ef4444" />

  <text x="5" y="48" font-size="6.5" font-semibold fill="#64748b">CHL</text>
  <rect x="20" y="40" width="46" height="10" rx="1.5" fill="#3b82f6" />
  <rect x="67" y="40" width="12" height="10" rx="1.5" fill="#f59e0b" />
  <rect x="80" y="40" width="10" height="10" rx="1.5" fill="#ef4444" />

  <text x="5" y="64" font-size="6.5" font-semibold fill="#64748b">BRU</text>
  <rect x="20" y="56" width="40" height="10" rx="1.5" fill="#3b82f6" />
  <rect x="61" y="56" width="16" height="10" rx="1.5" fill="#f59e0b" />
  <rect x="78" y="56" width="12" height="10" rx="1.5" fill="#ef4444" />

  <rect x="14" y="74" width="5" height="5" rx="1" fill="#3b82f6" />
  <text x="21" y="79" font-size="5.5" fill="#64748b">Répar.</text>
  <rect x="42" y="74" width="5" height="5" rx="1" fill="#f59e0b" />
  <text x="49" y="79" font-size="5.5" fill="#64748b">Transf.</text>
  <rect x="71" y="74" width="5" height="5" rx="1" fill="#ef4444" />
  <text x="78" y="79" font-size="5.5" fill="#64748b">Attente</text>
</svg>
```

### Option 4.C : Respect Délais par Client & Moteur
```xml
<svg class="w-full h-full" viewBox="0 0 100 85">
  <text x="12" y="70" font-size="6" font-semibold fill="#64748b">AFR</text>
  <rect x="8" y="26" width="6" height="38" rx="1" fill="#3b82f6" />
  <rect x="15" y="22" width="6" height="42" rx="1" fill="#93c5fd" />

  <text x="35" y="70" font-size="6" font-semibold fill="#64748b">DLH</text>
  <rect x="31" y="30" width="6" height="34" rx="1" fill="#3b82f6" />
  <rect x="38" y="28" width="6" height="36" rx="1" fill="#93c5fd" />

  <text x="58" y="70" font-size="6" font-semibold fill="#64748b">DAL</text>
  <rect x="54" y="24" width="6" height="40" rx="1" fill="#3b82f6" />
  <rect x="61" y="22" width="6" height="42" rx="1" fill="#93c5fd" />

  <text x="80" y="70" font-size="6" font-semibold fill="#64748b">RYR</text>
  <rect x="76" y="34" width="6" height="30" rx="1" fill="#3b82f6" />
  <rect x="83" y="20" width="6" height="44" rx="1" fill="#ef4444" />

  <polyline points="14,35 37,42 60,38 83,18" fill="none" stroke="#dc2626" stroke-width="1.8" />
  <circle cx="83" cy="18" r="2" fill="#dc2626" />
  <text x="83" y="14" font-size="5.5" font-bold text-anchor="middle" fill="#dc2626">14%</text>

  <rect x="12" y="76" width="5" height="4" fill="#3b82f6" />
  <text x="19" y="80" font-size="5" fill="#64748b">Contractuel</text>
  <rect x="47" y="76" width="5" height="4" fill="#93c5fd" />
  <text x="54" y="80" font-size="5" fill="#64748b">Effectif</text>
  <line x1="73" y1="78" x2="81" y2="78" stroke="#dc2626" stroke-width="1.5" />
  <text x="83" y="80" font-size="5" fill="#dc2626">% Écart</text>
</svg>
```

### Option 4.D : Tableau d'Alertes Nominatives
```xml
<svg class="w-full h-full" viewBox="0 0 100 85">
  <rect x="4" y="6" width="92" height="20" rx="3" fill="#f8fafc" stroke="#e2e8f0" />
  <circle cx="12" cy="16" r="3" fill="#10b981" />
  <text x="20" y="19" font-size="7" font-bold fill="#334155">9842 • AFR • Conforme</text>

  <rect x="4" y="32" width="92" height="20" rx="3" fill="#f8fafc" stroke="#e2e8f0" />
  <circle cx="12" cy="42" r="3" fill="#f59e0b" />
  <text x="20" y="45" font-size="7" font-bold fill="#334155">7731 • DLH • Aléas +2j</text>

  <rect x="4" y="58" width="92" height="20" rx="3" fill="#fef2f2" stroke="#fecaca" />
  <circle cx="12" cy="68" r="3" fill="#ef4444" />
  <text x="20" y="71" font-size="7" font-bold fill="#dc2626">6510 • RYR • AOG Critique</text>
</svg>
```

### Option 4.E : Cartes KPIs Synthétiques
```xml
<svg class="w-full h-full" viewBox="0 0 100 85">
  <rect x="6" y="6" width="88" height="34" rx="4" fill="#f8fafc" stroke="#cbd5e1" stroke-width="1.2" />
  <text x="50" y="18" font-size="7" font-bold text-anchor="middle" fill="#64748b">TAT MOYEN RÉEL</text>
  <text x="50" y="32" font-size="13" font-weight="black" text-anchor="middle" fill="#0284c7">18.4 jours</text>

  <rect x="6" y="44" width="88" height="35" rx="4" fill="#f8fafc" stroke="#cbd5e1" stroke-width="1.2" />
  <text x="50" y="56" font-size="7" font-bold text-anchor="middle" fill="#64748b">RESPECT SLA GLOBAL</text>
  <text x="50" y="71" font-size="13" font-weight="black" text-anchor="middle" fill="#16a34a">96.2 %</text>
</svg>
```

### Option 4.F : Barres vs Seuils Cibles P85
```xml
<svg class="w-full h-full" viewBox="0 0 100 85">
  <text x="8" y="18" font-size="7.5" font-semibold fill="#64748b">Aubes</text>
  <rect x="32" y="9" width="46" height="13" rx="2" fill="#3b82f6" />
  <line x1="68" y1="5" x2="68" y2="25" stroke="#dc2626" stroke-width="2" />

  <text x="8" y="44" font-size="7.5" font-semibold fill="#64748b">Révis.</text>
  <rect x="32" y="35" width="58" height="13" rx="2" fill="#3b82f6" />
  <line x1="78" y1="31" x2="78" y2="51" stroke="#dc2626" stroke-width="2" />

  <text x="8" y="70" font-size="7.5" font-semibold fill="#64748b">Banc</text>
  <rect x="32" y="61" width="38" height="13" rx="2" fill="#3b82f6" />
  <line x1="60" y1="57" x2="60" y2="77" stroke="#dc2626" stroke-width="2" />

  <text x="68" y="83" font-size="6.5" font-bold text-anchor="middle" fill="#dc2626">| Seuil P85</text>
</svg>
```

### Option 4.G : Waterfall des Dérives TAT
```xml
<svg class="w-full h-full" viewBox="0 0 100 85">
  <line x1="8" y1="72" x2="94" y2="72" stroke="#cbd5e1" stroke-width="1.2" />
  <rect x="10" y="32" width="14" height="40" rx="1.5" fill="#3b82f6" />
  <text x="17" y="28" font-size="6" font-bold fill="#1d4ed8" text-anchor="middle">18j Cible</text>
  <rect x="28" y="20" width="13" height="12" rx="1.5" fill="#ef4444" />
  <text x="34" y="16" font-size="6" font-bold fill="#dc2626" text-anchor="middle">+3j Pièce</text>
  <rect x="45" y="12" width="13" height="8" rx="1.5" fill="#f59e0b" />
  <text x="51" y="8" font-size="6" font-bold fill="#b45309" text-anchor="middle">+2j CND</text>
  <rect x="62" y="16" width="13" height="6" rx="1.5" fill="#10b981" />
  <text x="68" y="27" font-size="5.5" font-bold fill="#059669" text-anchor="middle">-1j Shift</text>
  <rect x="79" y="16" width="14" height="56" rx="1.5" fill="#1e40af" />
  <text x="86" y="12" font-size="6" font-bold fill="#1e3a8a" text-anchor="middle">22j Réel</text>
</svg>
```

### Option 4.H : Jalons de Traversée (Gates)
```xml
<svg class="w-full h-full" viewBox="0 0 100 85">
  <line x1="10" y1="18" x2="88" y2="18" stroke="#cbd5e1" stroke-width="2" />
  <circle cx="20" cy="18" r="6" fill="#10b981" />
  <text x="20" y="21" font-size="6" font-weight="bold" fill="#ffffff" text-anchor="middle">G1</text>
  <text x="20" y="32" font-size="6" fill="#059669" text-anchor="middle">Démont.</text>

  <circle cx="50" cy="18" r="6" fill="#3b82f6" />
  <text x="50" y="21" font-size="6" font-weight="bold" fill="#ffffff" text-anchor="middle">G2</text>
  <text x="50" y="32" font-size="6" fill="#1d4ed8" text-anchor="middle">Usinage</text>

  <circle cx="80" cy="18" r="6" fill="#ef4444" />
  <text x="80" y="21" font-size="6" font-weight="bold" fill="#ffffff" text-anchor="middle">G3</text>
  <text x="80" y="32" font-size="6" fill="#dc2626" text-anchor="middle">Banc Test</text>

  <rect x="15" y="44" width="70" height="28" rx="4" fill="#f8fafc" stroke="#e2e8f0" />
  <text x="50" y="57" font-size="7" font-weight="bold" fill="#334155" text-anchor="middle">Chemin Critique Actif</text>
  <text x="50" y="66" font-size="6" fill="#dc2626" text-anchor="middle">Retard +2j sur Gate 3</text>
</svg>
```

---

## Étape 5 : Capacité

### Option 5.A : Prévisions des Demandes (Plan S&OP)
```xml
<svg class="w-full h-full" viewBox="0 0 50 50">
  <rect x="8" y="10" width="34" height="32" rx="3" fill="#f5f3ff" stroke="#8b5cf6" stroke-width="1.2" />
  <line x1="8" y1="18" x2="42" y2="18" stroke="#8b5cf6" stroke-width="1.2" />
  <rect x="12" y="22" width="6" height="5" rx="1" fill="#c4b5fd" />
  <rect x="22" y="22" width="6" height="5" rx="1" fill="#c4b5fd" />
  <rect x="32" y="22" width="6" height="5" rx="1" fill="#7c3aed" />
  <rect x="12" y="30" width="6" height="5" rx="1" fill="#c4b5fd" />
  <rect x="22" y="30" width="6" height="5" rx="1" fill="#7c3aed" />
  <rect x="32" y="30" width="6" height="5" rx="1" fill="#c4b5fd" />
  <circle cx="15" cy="14" r="1.5" fill="#7c3aed" />
  <circle cx="35" cy="14" r="1.5" fill="#7c3aed" />
</svg>
```

### Option 5.B : Demandes Effectives à l'Instant (WIP Réel)
```xml
<svg class="w-full h-full" viewBox="0 0 50 50">
  <circle cx="25" cy="25" r="18" fill="#fffbeb" stroke="#f59e0b" stroke-width="1.5" />
  <path d="M 25 12 L 25 25 L 34 25" fill="none" stroke="#d97706" stroke-width="2" stroke-linecap="round" />
  <circle cx="25" cy="25" r="3" fill="#d97706" />
  <text x="25" y="40" font-size="5.5" font-weight="bold" fill="#b45309" text-anchor="middle">LIVE WIP</text>
</svg>
```

### Option 5.C : Capacité & Approvisionnement Pièces
```xml
<svg class="w-full h-full" viewBox="0 0 50 50">
  <rect x="7" y="11" width="36" height="28" rx="3" fill="#eff6ff" stroke="#2563eb" stroke-width="1.2" />
  <path d="M 7 19 L 43 19" stroke="#93c5fd" stroke-width="1" />
  <rect x="11" y="23" width="12" height="6" rx="1.5" fill="#2563eb" />
  <rect x="27" y="23" width="12" height="6" rx="1.5" fill="#f59e0b" />
  <circle cx="17" cy="34" r="2" fill="#10b981" />
  <text x="21" y="36" font-size="5" font-weight="bold" fill="#059669">OTIF</text>
  <circle cx="34" cy="15" r="2" fill="#2563eb" />
</svg>
```

### Option 5.D : Prévisions Multi-factorielles (Réalité MRO)
```xml
<svg class="w-full h-full" viewBox="0 0 50 50">
  <path d="M 8 36 Q 16 30, 24 22 T 42 12" fill="none" stroke="#10b981" stroke-width="2" />
  <path d="M 8 36 Q 16 36, 24 28 T 42 20" fill="none" stroke="#6ee7b7" stroke-width="1.2" stroke-dasharray="2,2" />
  <circle cx="24" cy="22" r="2.5" fill="#059669" />
  <circle cx="42" cy="12" r="2.5" fill="#059669" />
  <text x="25" y="44" font-size="5" font-weight="bold" fill="#059669" text-anchor="middle">CND & Bancs</text>
</svg>
```

---

## Étape 6 : Saturation

### Option 6.A : Top Pièces Manquantes par Site
```xml
<svg class="w-full h-full" viewBox="0 0 100 85">
  <text x="6" y="18" font-size="6.5" font-semibold fill="#64748b">Aubes HP</text>
  <rect x="36" y="10" width="56" height="10" rx="2" fill="#ef4444" />
  <text x="76" y="17" font-size="6" font-bold fill="#fff">MON (84h)</text>

  <text x="6" y="34" font-size="6.5" font-semibold fill="#64748b">Disques LLP</text>
  <rect x="36" y="26" width="46" height="10" rx="2" fill="#f59e0b" />
  <text x="66" y="33" font-size="6" font-bold fill="#fff">VIL (52h)</text>

  <text x="6" y="50" font-size="6.5" font-semibold fill="#64748b">Joints Fan</text>
  <rect x="36" y="42" width="34" height="10" rx="2" fill="#3b82f6" />
  <text x="54" y="49" font-size="6" font-bold fill="#fff">CHL (28h)</text>

  <text x="6" y="66" font-size="6.5" font-semibold fill="#64748b">Injecteurs</text>
  <rect x="36" y="58" width="26" height="10" rx="2" fill="#0284c7" />
  <text x="46" y="65" font-size="6" font-bold fill="#fff">BRU (16h)</text>

  <text x="50" y="79" font-size="6" font-bold text-anchor="middle" fill="#dc2626">Attente cumulée ruptures</text>
</svg>
```

### Option 6.B : Retards par Réparation & Moteur
```xml
<svg class="w-full h-full" viewBox="0 0 100 85">
  <text x="6" y="16" font-size="6" font-semibold fill="#64748b">Usinage</text>
  <rect x="30" y="9" width="46" height="5.5" rx="1" fill="#3b82f6" />
  <rect x="30" y="15.5" width="58" height="5.5" rx="1" fill="#6366f1" />

  <text x="6" y="32" font-size="6" font-semibold fill="#64748b">Ressuage</text>
  <rect x="30" y="25" width="38" height="5.5" rx="1" fill="#3b82f6" />
  <rect x="30" y="31.5" width="48" height="5.5" rx="1" fill="#6366f1" />

  <text x="6" y="48" font-size="6" font-semibold fill="#64748b">Aubes</text>
  <rect x="30" y="41" width="30" height="5.5" rx="1" fill="#3b82f6" />
  <rect x="30" y="47.5" width="52" height="5.5" rx="1" fill="#6366f1" />

  <text x="6" y="64" font-size="6" font-semibold fill="#64748b">Banc Test</text>
  <rect x="30" y="57" width="22" height="5.5" rx="1" fill="#3b82f6" />
  <rect x="30" y="63.5" width="36" height="5.5" rx="1" fill="#6366f1" />

  <rect x="22" y="74" width="6" height="4" rx="1" fill="#3b82f6" />
  <text x="30" y="78" font-size="5.5" fill="#64748b">CFM56</text>
  <rect x="62" y="74" width="6" height="4" rx="1" fill="#6366f1" />
  <text x="70" y="78" font-size="5.5" fill="#64748b">LEAP</text>
</svg>
```

### Option 6.C : Routes de Transfert & Délais Navettes
```xml
<svg class="w-full h-full" viewBox="0 0 100 85">
  <text x="6" y="17" font-size="6" font-semibold fill="#64748b">MON➔VIL</text>
  <rect x="36" y="9" width="45" height="10" rx="1.5" fill="#3b82f6" />
  <circle cx="88" cy="14" r="5" fill="#f59e0b" />
  <text x="88" y="16" font-size="5" font-bold text-anchor="middle" fill="#fff">1.2j</text>

  <text x="6" y="33" font-size="6" font-semibold fill="#64748b">CHL➔BRU</text>
  <rect x="36" y="25" width="32" height="10" rx="1.5" fill="#3b82f6" />
  <circle cx="76" cy="30" r="5" fill="#f59e0b" />
  <text x="76" y="32" font-size="5" font-bold text-anchor="middle" fill="#fff">2.4j</text>

  <text x="6" y="49" font-size="6" font-semibold fill="#64748b">VIL➔CHL</text>
  <rect x="36" y="41" width="25" height="10" rx="1.5" fill="#3b82f6" />
  <circle cx="68" cy="46" r="5" fill="#f59e0b" />
  <text x="68" y="48" font-size="5" font-bold text-anchor="middle" fill="#fff">1.8j</text>

  <text x="6" y="65" font-size="6" font-semibold fill="#64748b">MON➔BRU</text>
  <rect x="36" y="57" width="18" height="10" rx="1.5" fill="#3b82f6" />
  <circle cx="61" cy="62" r="5" fill="#f59e0b" />
  <text x="61" y="64" font-size="5" font-bold text-anchor="middle" fill="#fff">3.1j</text>

  <rect x="18" y="74" width="6" height="4" fill="#3b82f6" />
  <text x="26" y="78" font-size="5.5" fill="#64748b">% Demandes</text>
  <circle cx="68" cy="76" r="3" fill="#f59e0b" />
  <text x="74" y="78" font-size="5.5" fill="#64748b">Délai navette</text>
</svg>
```

### Option 6.D : Ratio Attente vs Travail Effectif
```xml
<svg class="w-full h-full" viewBox="0 0 100 85">
  <circle cx="36" cy="38" r="22" fill="none" stroke="#3b82f6" stroke-width="6.5" />
  <circle cx="36" cy="38" r="22" fill="none" stroke="#ef4444" stroke-width="6.5" stroke-dasharray="138" stroke-dashoffset="80" />
  <text x="68" y="30" font-size="8" font-bold fill="#dc2626">42% Attente</text>
  <text x="68" y="46" font-size="8" font-bold fill="#2563eb">58% Usinage</text>
  <text x="50" y="73" font-size="7.5" font-semibold text-anchor="middle" fill="#64748b">Lead Time</text>
</svg>
```

### Option 6.E : Barres de Charge vs Seuil 85%
```xml
<svg class="w-full h-full" viewBox="0 0 100 85">
  <text x="8" y="20" font-size="7.5" font-semibold fill="#64748b">VIL-01</text>
  <rect x="32" y="10" width="45" height="13" rx="2" fill="#3b82f6" />

  <text x="8" y="46" font-size="7.5" font-semibold fill="#64748b">MON-01</text>
  <rect x="32" y="36" width="62" height="13" rx="2" fill="#ef4444" />

  <line x1="68" y1="5" x2="68" y2="58" stroke="#d97706" stroke-dasharray="2.5,2.5" stroke-width="1.8" />
  <text x="68" y="70" font-size="7" font-bold text-anchor="middle" fill="#d97706">Seuil Critique 85%</text>
</svg>
```

### Option 6.F : Heatmap Hebdomadaire / Site
```xml
<svg class="w-full h-full" viewBox="0 0 100 85">
  <rect x="10" y="10" width="16" height="16" rx="2.5" fill="#dbeafe" stroke="#93c5fd" />
  <rect x="31" y="10" width="16" height="16" rx="2.5" fill="#3b82f6" />
  <rect x="52" y="10" width="16" height="16" rx="2.5" fill="#ef4444" />
  <rect x="73" y="10" width="16" height="16" rx="2.5" fill="#dbeafe" stroke="#93c5fd" />

  <rect x="10" y="32" width="16" height="16" rx="2.5" fill="#dbeafe" stroke="#93c5fd" />
  <rect x="31" y="32" width="16" height="16" rx="2.5" fill="#ef4444" />
  <rect x="52" y="32" width="16" height="16" rx="2.5" fill="#b91c1c" />
  <rect x="73" y="32" width="16" height="16" rx="2.5" fill="#3b82f6" />

  <text x="50" y="66" font-size="8" font-bold text-anchor="middle" fill="#dc2626">Pic S38 (Rouge)</text>
</svg>
```

### Option 6.G : Courbes Entrées vs Sorties WIP
```xml
<svg class="w-full h-full" viewBox="0 0 100 85">
  <path d="M 10 58 Q 40 50, 60 22 Q 80 16, 92 12" fill="none" stroke="#2563eb" stroke-width="2.2" />
  <path d="M 10 60 Q 40 56, 60 52 Q 80 48, 92 46" fill="none" stroke="#059669" stroke-width="2.2" />
  <text x="82" y="10" font-size="7.5" font-bold fill="#2563eb">In</text>
  <text x="82" y="58" font-size="7.5" font-bold fill="#059669">Out</text>
  <text x="50" y="75" font-size="7.5" font-bold text-anchor="middle" fill="#dc2626">Dérive WIP</text>
</svg>
```

### Option 6.H : Treemap des Goulots d'Atelier
```xml
<svg class="w-full h-full" viewBox="0 0 100 85">
  <rect x="8" y="8" width="52" height="42" rx="2" fill="#ef4444" />
  <text x="34" y="26" font-size="7" font-bold fill="#ffffff" text-anchor="middle">Tour CN 5A</text>
  <text x="34" y="36" font-size="6" fill="#fee2e2" text-anchor="middle">94% (48h WIP)</text>

  <rect x="62" y="8" width="30" height="42" rx="2" fill="#f59e0b" />
  <text x="77" y="26" font-size="6.5" font-weight="bold" fill="#ffffff" text-anchor="middle">CND</text>
  <text x="77" y="36" font-size="5.5" fill="#fef3c7" text-anchor="middle">86%</text>

  <rect x="8" y="52" width="40" height="25" rx="2" fill="#3b82f6" />
  <text x="28" y="66" font-size="6.5" font-weight="bold" fill="#ffffff" text-anchor="middle">Banc Test</text>
  <text x="28" y="73" font-size="5.5" fill="#dbeafe" text-anchor="middle">74%</text>

  <rect x="50" y="52" width="42" height="25" rx="2" fill="#10b981" />
  <text x="71" y="66" font-size="6.5" font-weight="bold" fill="#ffffff" text-anchor="middle">Équilibrage</text>
  <text x="71" y="73" font-size="5.5" fill="#d1fae5" text-anchor="middle">62%</text>
</svg>
```
