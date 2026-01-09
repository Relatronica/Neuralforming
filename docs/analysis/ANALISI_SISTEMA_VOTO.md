# Analisi Game Design: Sistema di Voto e Punteggi

## 📊 Situazione Attuale

### Meccaniche Esistenti

1. **Proponente (chi propone la legge)**:
   - ✅ Se approvata (>50%): riceve punti base + bonus (10-30% in base all'approvazione)
   - ❌ Se bocciata (<50%): riceve penalità (-40% o -50% dei punti base)

2. **Votanti che votano SÌ**:
   - ✅ Ricevono il 25% dei punti base (solo se la legge è approvata)
   - ⚠️ Nessuna penalità se la legge viene bocciata

3. **Votanti che votano NO**:
   - ⚠️ Nessun punto, nessuna penalità
   - ⚠️ Strategia ottimale: votare sempre NO per bloccare gli avversari

### 🔴 Problema Identificato

**"Tutti votano sempre contro"** - Questo è un problema di **game design** classico:

- **Incentivi distorti**: Votare NO è sempre la scelta più sicura (zero rischi, zero costi)
- **Dilemma del prigioniero**: Anche se tutti votassero SÌ otterrebbero più punti, la strategia dominante è votare NO
- **Gameplay poco interessante**: Le votazioni diventano prevedibili e poco strategiche
- **Mancanza di conseguenze**: I votanti NO non subiscono alcuna penalità per aver bloccato una legge

---

## 🎯 Analisi delle Soluzioni Possibili

### Opzione 1: Sistema "Reward/Penalty" Simmetrico ⭐ **RACCOMANDATO**

**Meccanica**:
- ✅ Votanti SÌ: ricevono punti se approvata (come ora, 25%)
- ❌ Votanti NO: ricevono penalità se la legge viene **bocciata** (es. -10% dei punti base)
- ✅ Votanti NO: ricevono bonus se la legge viene **approvata** (es. +5% dei punti base) - "hai sbagliato previsione"

**Pro**:
- ✅ Crea un vero dilemma strategico: votare NO ha un costo se la legge passa comunque
- ✅ Incentiva votazioni più equilibrate
- ✅ Aggiunge profondità strategica: devi valutare se la legge passerà o meno
- ✅ Realismo: in politica, opporsi a leggi popolari ha conseguenze

**Contro**:
- ⚠️ Potrebbe essere troppo punitivo se mal bilanciato
- ⚠️ Richiede tuning attento dei valori

**Valori suggeriti**:
```typescript
// Se legge APPROVATA:
- Votanti SÌ: +25% punti base (come ora)
- Votanti NO: +5% punti base (bonus "hai sbagliato, ma la legge è passata")

// Se legge BOCCIATA:
- Votanti SÌ: -10% punti base (penalità "hai sostenuto una legge impopolare")
- Votanti NO: -5% punti base (penalità "hai bloccato il progresso")
```

---

### Opzione 2: Sistema "Minority Bonus" 

**Meccanica**:
- ✅ Votanti SÌ: ricevono punti se approvata (come ora)
- ✅ Votanti NO: ricevono bonus se sono in **minoranza** e la legge passa (es. +15% punti base) - "hai resistito alla maggioranza"
- ❌ Votanti NO: ricevono penalità se sono in **maggioranza** e bloccano la legge (es. -10% punti base) - "hai bloccato il progresso"

**Pro**:
- ✅ Incentiva votazioni più equilibrate
- ✅ Premia il coraggio di opporsi quando si è in minoranza
- ✅ Penalizza il "voto di massa" contro tutto

**Contro**:
- ⚠️ Più complesso da spiegare
- ⚠️ Potrebbe creare situazioni controintuitive

---

### Opzione 3: Sistema "Alignment-Based" 

**Meccanica**:
- ✅ Votanti SÌ: ricevono punti se approvata (come ora)
- ✅ Votanti NO: ricevono punti se la legge è **allineata con la loro strategia** ma loro hanno votato NO (es. +10% punti base) - "hai votato strategicamente"
- ❌ Votanti NO: ricevono penalità se la legge è **allineata con la loro strategia** e loro hanno votato NO (es. -15% punti base) - "hai votato contro i tuoi interessi"

**Pro**:
- ✅ Aggiunge profondità strategica basata sull'allineamento
- ✅ Incentiva votazioni più intelligenti
- ✅ Realismo: votare contro i propri interessi ha senso solo in certe situazioni

**Contro**:
- ⚠️ Molto complesso da implementare
- ⚠️ Richiede calcolo dell'allineamento per ogni votante
- ⚠️ Potrebbe essere difficile da comunicare ai giocatori

---

### Opzione 4: Sistema "Risk/Reward" Asimmetrico

**Meccanica**:
- ✅ Votanti SÌ: ricevono punti se approvata (come ora, 25%)
- ✅ Votanti SÌ: ricevono bonus extra se la legge passa con **alta approvazione** (>70%) (es. +10% bonus)
- ❌ Votanti NO: ricevono penalità se la legge viene bocciata ma loro erano in **minoranza** (es. -5% punti base) - "hai bloccato una legge popolare"
- ✅ Votanti NO: ricevono bonus se la legge viene bocciata e loro erano in **maggioranza** (es. +5% punti base) - "hai rappresentato la volontà popolare"

**Pro**:
- ✅ Bilancia rischio/ricompensa
- ✅ Premia sia il coraggio (votare SÌ) che la rappresentanza (votare NO quando si è in maggioranza)
- ✅ Penalizza solo quando si blocca una legge popolare

**Contro**:
- ⚠️ Più complesso da calcolare
- ⚠️ Richiede calcolo delle maggioranze/minoranze

---

## 🎮 Raccomandazione Finale

### ⭐ **Opzione 1: Sistema "Reward/Penalty" Simmetrico** (VARIANTE MIGLIORATA)

**Implementazione suggerita**:

```typescript
// Se legge APPROVATA (>50%):
- Proponente: punti base + bonus approvazione (come ora)
- Votanti SÌ: +25% punti base (come ora)
- Votanti NO: +5% punti base (bonus "hai sbagliato previsione, ma la legge è passata")

// Se legge BOCCIATA (<50%):
- Proponente: -40% o -50% punti base (come ora)
- Votanti SÌ: -10% punti base (penalità "hai sostenuto una legge impopolare")
- Votanti NO: -5% punti base (penalità "hai bloccato il progresso")
```

**Perché questa variante**:
1. ✅ **Semplicità**: Facile da capire e comunicare
2. ✅ **Bilanciamento**: Crea incentivi per entrambe le scelte
3. ✅ **Strategia**: Ogni voto ha conseguenze, crea tensione
4. ✅ **Realismo**: Riflette la realtà politica (opporsi ha costi)
5. ✅ **Tuning facile**: I valori possono essere aggiustati facilmente

**Valori da testare**:
- Votanti NO quando legge approvata: +5% potrebbe essere troppo poco, provare +10%
- Votanti SÌ quando legge bocciata: -10% potrebbe essere troppo, provare -5%
- Votanti NO quando legge bocciata: -5% potrebbe essere troppo, provare -3%

---

## 🔧 Considerazioni Implementative

### 1. **Backward Compatibility**
- Il sistema attuale già assegna punti ai votanti SÌ quando approvata
- Aggiungere penalità/bonus ai votanti NO richiede modifiche minime
- Non rompe il gameplay esistente

### 2. **Comunicazione ai Giocatori**
- Mostrare chiaramente le conseguenze del voto prima di votare
- Messaggi espliciti: "Se voti NO e la legge passa, riceverai +5% punti"
- Feedback visivo immediato dopo la votazione

### 3. **Bilanciamento**
- Iniziare con valori conservativi (es. +5%, -5%)
- Testare in partite reali
- Aggiustare in base al feedback

### 4. **Edge Cases**
- Cosa succede se tutti votano NO? (legge bocciata, tutti ricevono -5%)
- Cosa succede se tutti votano SÌ? (legge approvata, tutti ricevono +25% o +5%)
- Gestire partite con pochi giocatori (2-3 giocatori)

---

## 📈 Impatto Atteso sul Gameplay

### Prima (Situazione Attuale)
- ❌ Votazioni prevedibili (tutti votano NO)
- ❌ Poca strategia nelle votazioni
- ❌ Poco coinvolgimento emotivo
- ❌ Leggi raramente approvate

### Dopo (Con Sistema Reward/Penalty)
- ✅ Votazioni più equilibrate e strategiche
- ✅ Dilemma reale: "Voto SÌ e rischio penalità se bocciata, o voto NO e rischio penalità se approvata?"
- ✅ Maggiore coinvolgimento emotivo
- ✅ Più leggi approvate, gameplay più dinamico
- ✅ Strategia più profonda: valutare probabilità di approvazione

---

## 🎯 Conclusioni

Il problema identificato è **reale e significativo** per l'esperienza di gioco. La soluzione proposta (Opzione 1 - Variante Migliorata) è:

1. ✅ **Semplice da implementare**
2. ✅ **Facile da comunicare ai giocatori**
3. ✅ **Bilanciata e strategica**
4. ✅ **Migliora significativamente l'esperienza di gioco**

**Raccomandazione**: Implementare l'Opzione 1 con valori iniziali conservativi, testare in partite reali, e aggiustare i valori in base al feedback dei giocatori.

---

## 🧪 Piano di Test

1. **Fase 1**: Implementare con valori conservativi (+5%, -5%, -10%)
2. **Fase 2**: Testare in partite con 2-4 giocatori
3. **Fase 3**: Raccogliere feedback:
   - Le votazioni sono più equilibrate?
   - I giocatori si sentono penalizzati ingiustamente?
   - Il gameplay è più interessante?
4. **Fase 4**: Aggiustare valori in base al feedback
5. **Fase 5**: Testare con valori finali

---

*Analisi effettuata il: 2024*
*Game Designer: AI Assistant*
