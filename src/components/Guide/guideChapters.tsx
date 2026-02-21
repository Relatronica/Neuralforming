import {
  BookOpen,
  Users,
  Zap,
  AlertCircle,
  Target,
  Trophy,
  Vote,
  Newspaper,
  TrendingUp,
  type LucideIcon,
} from 'lucide-react';

export interface GuideChapter {
  id: string;
  title: string;
  icon: LucideIcon;
  iconColor: string;
  content: React.ReactNode;
}

export const guideChapters: GuideChapter[] = [
  {
    id: 'intro',
    title: 'Introduzione',
    icon: BookOpen,
    iconColor: 'text-blue-400',
    content: (
      <>
        <p className="text-gray-300 leading-relaxed text-lg mb-6">
          Neuralforming è un gioco strategico dove rappresenti un <strong className="text-gray-100">partito politico</strong> che
          deve prendere decisioni cruciali sullo sviluppo dell'Intelligenza Artificiale.
          Il tuo obiettivo è bilanciare innovazione tecnologica, etica e responsabilità sociale
          per guidare la società verso un futuro sostenibile.
        </p>

        <div className="bg-gray-800/50 border border-gray-700 rounded-xl p-6 mb-6">
          <h3 className="text-lg font-bold text-gray-100 mb-3 flex items-center gap-2">
            <Target className="w-5 h-5 text-green-400" />
            Obiettivo del Gioco
          </h3>
          <p className="text-gray-300 leading-relaxed mb-4">
            Ogni giocatore ha un <strong className="text-gray-100">obiettivo segreto</strong> assegnato
            all'inizio della partita. Per vincere, devi raggiungere il tuo obiettivo specifico,
            che può richiedere:
          </p>
          <ul className="list-disc list-inside text-gray-300 space-y-2 ml-4">
            <li>Raggiungere certi livelli di punti Tecnologia, Etica o Neuralforming</li>
            <li>Bilanciare i tuoi punti in modo specifico</li>
            <li>Raccogliere un certo numero di tecnologie</li>
          </ul>
        </div>

        <div className="bg-gray-800/50 border border-gray-700 rounded-xl p-6">
          <h3 className="text-lg font-bold text-gray-100 mb-3">Condizioni di Vittoria</h3>
          <div className="space-y-3">
            <div className="flex items-start gap-3">
              <span className="shrink-0 w-6 h-6 rounded-full bg-green-500/20 flex items-center justify-center text-green-400 text-xs font-bold mt-0.5">1</span>
              <div>
                <p className="text-gray-200 font-medium">Vittoria per obiettivo</p>
                <p className="text-gray-400 text-sm">Un giocatore completa il proprio obiettivo segreto</p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <span className="shrink-0 w-6 h-6 rounded-full bg-blue-500/20 flex items-center justify-center text-blue-400 text-xs font-bold mt-0.5">2</span>
              <div>
                <p className="text-gray-200 font-medium">Vittoria standard</p>
                <p className="text-gray-400 text-sm">Raggiungi almeno 65 punti NF, 45 punti Etica, 5 tecnologie e bilanciamento &ge; 0.5</p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <span className="shrink-0 w-6 h-6 rounded-full bg-red-500/20 flex items-center justify-center text-red-400 text-xs font-bold mt-0.5">!</span>
              <div>
                <p className="text-gray-200 font-medium">Sconfitta</p>
                <p className="text-gray-400 text-sm">Punteggi alti in tecnologia ma insufficienti in etica: IA tecnicamente avanzata ma eticamente inaccettabile</p>
              </div>
            </div>
          </div>
        </div>
      </>
    ),
  },

  {
    id: 'punti',
    title: 'Sistema di Punti',
    icon: TrendingUp,
    iconColor: 'text-yellow-400',
    content: (
      <>
        <p className="text-gray-300 leading-relaxed text-lg mb-6">
          Il bilanciamento tra tre tipi di punteggio è la chiave per vincere.
          Ogni scelta che fai influenza uno o più di questi indicatori.
        </p>
        <div className="space-y-4">
          <div className="bg-gray-800/50 rounded-xl p-5 border border-blue-500/20">
            <h3 className="font-semibold text-blue-300 mb-2 text-lg">Punti Tecnologia</h3>
            <p className="text-gray-300">
              Rappresentano il progresso tecnologico e l'innovazione. Si ottengono giocando
              tecnologie avanzate e prendendo decisioni che favoriscono lo sviluppo tecnico.
            </p>
          </div>
          <div className="bg-gray-800/50 rounded-xl p-5 border border-green-500/20">
            <h3 className="font-semibold text-green-300 mb-2 text-lg">Punti Etica</h3>
            <p className="text-gray-300">
              Rappresentano l'impegno verso la responsabilità e i valori etici. Si ottengono
              prendendo decisioni che privilegiano il benessere sociale e la trasparenza.
            </p>
          </div>
          <div className="bg-gray-800/50 rounded-xl p-5 border border-purple-500/20">
            <h3 className="font-semibold text-purple-300 mb-2 text-lg">Punti Neuralforming</h3>
            <p className="text-gray-300">
              Rappresentano il bilanciamento perfetto tra tecnologia ed etica. Si ottengono
              quando le tue decisioni combinano innovazione e responsabilità sociale.
            </p>
          </div>
        </div>

        <div className="mt-6 bg-gray-800/50 border border-gray-700 rounded-xl p-5">
          <h3 className="font-semibold text-gray-100 mb-2">Bilanciamento</h3>
          <p className="text-gray-300 text-sm">
            Il rapporto tra tecnologia ed etica (da 0 a 1) è fondamentale per la vittoria.
            Un bilanciamento troppo sbilanciato verso la tecnologia porta alla sconfitta,
            anche con punteggi alti.
          </p>
        </div>
      </>
    ),
  },

  {
    id: 'turno',
    title: 'Fasi del Turno',
    icon: Zap,
    iconColor: 'text-orange-400',
    content: (
      <>
        <p className="text-gray-300 leading-relaxed text-lg mb-6">
          Ogni turno si articola in tre fasi principali. Ogni fase presenta scelte
          strategiche che influenzano il tuo percorso verso la vittoria.
        </p>

        <div className="space-y-6">
          <div className="bg-gray-800/50 rounded-xl p-6 border border-gray-700">
            <div className="flex items-center gap-3 mb-3">
              <span className="shrink-0 w-8 h-8 rounded-lg bg-blue-500/20 flex items-center justify-center text-blue-400 font-bold text-sm">1</span>
              <h3 className="text-lg font-bold text-gray-100">Fase di Sviluppo</h3>
            </div>
            <p className="text-gray-300 mb-3">Durante il tuo turno, puoi:</p>
            <ul className="list-disc list-inside text-gray-300 space-y-1.5 ml-4">
              <li><strong className="text-gray-100">Pescare una carta tecnologia</strong> dal mazzo (se la tua mano è vuota)</li>
              <li><strong className="text-gray-100">Giocare una carta tecnologia</strong> dalla tua mano</li>
            </ul>
            <p className="text-gray-400 text-sm mt-3">
              Quando giochi una tecnologia, questa viene sottoposta alla
              votazione parlamentare (in multiplayer) o all'opinione pubblica (nel playground).
            </p>
            <div className="bg-red-900/15 rounded-lg p-3 border border-red-700/30 mt-3">
              <p className="text-gray-300 text-sm">
                <strong className="text-red-300">Attenzione:</strong> se la tecnologia viene
                bocciata, il dilemma etico viene <strong className="text-gray-100">saltato</strong> e
                il turno passa direttamente al giocatore successivo.
              </p>
            </div>
          </div>

          <div className="bg-gray-800/50 rounded-xl p-6 border border-gray-700">
            <div className="flex items-center gap-3 mb-3">
              <span className="shrink-0 w-8 h-8 rounded-lg bg-green-500/20 flex items-center justify-center text-green-400 font-bold text-sm">2</span>
              <h3 className="text-lg font-bold text-gray-100">Dilemma Etico</h3>
            </div>
            <p className="text-gray-300 mb-3">
              Se la tecnologia è stata approvata, peschi automaticamente un <strong className="text-gray-100">dilemma etico</strong>.
            </p>
            <p className="text-gray-300">
              Devi scegliere tra due opzioni, ognuna con conseguenze diverse sui tuoi punti.
              Le tue scelte influenzano il tuo percorso verso la vittoria!
            </p>
          </div>

          <div className="bg-gray-800/50 rounded-xl p-6 border border-gray-700">
            <div className="flex items-center gap-3 mb-3">
              <span className="shrink-0 w-8 h-8 rounded-lg bg-amber-500/20 flex items-center justify-center text-amber-400 font-bold text-sm">3</span>
              <h3 className="text-lg font-bold text-gray-100">Conseguenze</h3>
            </div>
            <p className="text-gray-300">
              Dopo aver risolto il dilemma, appaiono le <strong className="text-gray-100">conseguenze</strong> della
              tua scelta, che modificano ulteriormente i tuoi punti. Leggi attentamente per
              capire l'impatto delle tue decisioni!
            </p>
          </div>
        </div>
      </>
    ),
  },

  {
    id: 'votazione',
    title: 'Votazione Parlamentare',
    icon: Vote,
    iconColor: 'text-red-400',
    content: (
      <>
        <p className="text-gray-300 leading-relaxed text-lg mb-6">
          Alcune tecnologie richiedono l'approvazione del Parlamento prima di essere implementate.
          Il risultato della votazione influisce sui punti che ricevi.
        </p>

        <div className="bg-gray-800/50 rounded-xl p-6 border border-gray-700 mb-6">
          <h3 className="font-bold text-gray-100 mb-4 text-lg">Sistema di Reward/Penalty</h3>
          <p className="text-gray-300 mb-4">
            <strong className="text-gray-100">Ogni voto ha conseguenze!</strong> Non solo il proponente,
            ma anche tutti i votanti ricevono punti o penalità in base al loro voto e al risultato:
          </p>

          <div className="space-y-4">
            <div className="bg-green-900/20 rounded-lg p-4 border border-green-700/40">
              <h4 className="font-semibold text-green-300 mb-3">Se la legge è APPROVATA (&ge;50%)</h4>
              <ul className="space-y-2">
                <li className="flex items-start gap-2 text-gray-300 text-sm">
                  <span className="shrink-0 text-green-400 font-bold mt-px">+</span>
                  <span><strong className="text-gray-100">Proponente:</strong> Riceve punti base + bonus in base all'approvazione (10-30%)</span>
                </li>
                <li className="flex items-start gap-2 text-gray-300 text-sm">
                  <span className="shrink-0 text-green-400 font-bold mt-px">+</span>
                  <span><strong className="text-gray-100">Votanti SÌ:</strong> Ricevono +25% dei punti base</span>
                </li>
                <li className="flex items-start gap-2 text-gray-300 text-sm">
                  <span className="shrink-0 text-gray-500 font-bold mt-px">~</span>
                  <span><strong className="text-gray-100">Votanti NO:</strong> Ricevono +5% dei punti base</span>
                </li>
              </ul>
            </div>

            <div className="bg-red-900/20 rounded-lg p-4 border border-red-700/40">
              <h4 className="font-semibold text-red-300 mb-3">Se la legge è BOCCIATA (&lt;50%)</h4>
              <ul className="space-y-2">
                <li className="flex items-start gap-2 text-gray-300 text-sm">
                  <span className="shrink-0 text-red-400 font-bold mt-px">-</span>
                  <span><strong className="text-gray-100">Proponente:</strong> Riceve penalità (-40% o -50% dei punti base)</span>
                </li>
                <li className="flex items-start gap-2 text-gray-300 text-sm">
                  <span className="shrink-0 text-red-400 font-bold mt-px">-</span>
                  <span><strong className="text-gray-100">Votanti SÌ:</strong> Ricevono -10% dei punti base</span>
                </li>
                <li className="flex items-start gap-2 text-gray-300 text-sm">
                  <span className="shrink-0 text-gray-500 font-bold mt-px">~</span>
                  <span><strong className="text-gray-100">Votanti NO:</strong> Ricevono -5% dei punti base</span>
                </li>
              </ul>
            </div>
          </div>
        </div>

        <div className="bg-gray-800/50 rounded-xl p-6 border border-gray-700">
          <h3 className="font-bold text-gray-100 mb-3">Soglie Speciali</h3>
          <div className="space-y-3">
            <div className="flex items-start gap-3">
              <span className="shrink-0 mt-0.5 text-green-400 text-lg font-bold">&ge;70%</span>
              <p className="text-gray-300 text-sm">Bonus extra per il proponente (+30% bonus)</p>
            </div>
            <div className="flex items-start gap-3">
              <span className="shrink-0 mt-0.5 text-red-400 text-lg font-bold">&lt;30%</span>
              <p className="text-gray-300 text-sm">Penalità più severe per il proponente (-50% penalità)</p>
            </div>
          </div>
          <p className="text-gray-400 text-sm mt-4">
            In modalità <strong className="text-gray-300">multiplayer</strong>, tutti i giocatori votano
            in tempo reale e ogni voto conta. Nel <strong className="text-gray-300">playground</strong>,
            la votazione è sostituita dal sistema di Opinione Pubblica.
          </p>
        </div>
      </>
    ),
  },

  {
    id: 'carte',
    title: 'Carte e Abilità',
    icon: Trophy,
    iconColor: 'text-yellow-400',
    content: (
      <>
        <p className="text-gray-300 leading-relaxed text-lg mb-6">
          Oltre alle carte tecnologia standard, il gioco include carte speciali e
          abilità sbloccabili che aggiungono profondità strategica.
        </p>

        <div className="bg-gray-800/50 rounded-xl p-6 border border-purple-500/20 mb-6">
          <h3 className="text-lg font-bold text-purple-300 mb-3 flex items-center gap-2">
            <Zap className="w-5 h-5" />
            Carte Jolly
          </h3>
          <p className="text-gray-300 mb-4">
            Alcune carte nella tua mano sono <strong className="text-gray-100">jolly</strong>: carte speciali
            che potenziano gli effetti del dilemma etico successivo.
          </p>
          <ul className="list-disc list-inside text-gray-300 space-y-2 ml-4">
            <li>Moltiplicano i punti di una delle opzioni del dilemma (x1.5 o x2)</li>
            <li>Oppure aggiungono bonus punti fissi a tutte le categorie</li>
          </ul>
          <div className="bg-gray-900/50 rounded-lg p-4 border border-gray-700 mt-4">
            <p className="text-gray-300 text-sm">
              <strong className="text-gray-100">Come funzionano:</strong> quando giochi un jolly,
              questo <strong className="text-gray-100">non passa dalla votazione parlamentare</strong>.
              Viene pescato automaticamente un dilemma etico e gli effetti del jolly
              si applicano ai punti dell'opzione che sceglierai.
            </p>
          </div>
        </div>

        <div className="bg-gray-800/50 rounded-xl p-6 border border-yellow-500/20">
          <h3 className="text-lg font-bold text-yellow-300 mb-3 flex items-center gap-2">
            <Trophy className="w-5 h-5" />
            Milestone e Abilità Speciali
          </h3>
          <p className="text-gray-300 mb-4">
            Raggiungendo certi traguardi, sblocchi <strong className="text-gray-100">milestone</strong> che
            ti conferiscono abilità speciali permanenti:
          </p>
          <div className="grid sm:grid-cols-2 gap-3">
            {[
              { name: 'Pioniere Tecnologico', req: '30 punti tech', bonus: '+15% approvazione nelle votazioni' },
              { name: 'Guardiano Etico', req: '25 punti etica', bonus: 'Protezione dagli eventi negativi' },
              { name: 'Leader Bilanciato', req: 'Bilanciamento > 0.6, tech ≥ 20, etica ≥ 20', bonus: '+50% NF su tech bilanciate' },
              { name: 'Innovatore NF', req: '25 punti NF', bonus: 'Carta extra ogni turno' },
              { name: 'Maestro NF', req: '40 punti NF', bonus: 'Salta un dilemma (1 volta) con 50% punti NF' },
              { name: 'Sviluppatore Esperto', req: '3 tecnologie giocate', bonus: '+10% approvazione nelle votazioni' },
            ].map((m) => (
              <div key={m.name} className="bg-gray-900/50 rounded-lg p-3 border border-gray-700">
                <p className="font-semibold text-gray-100 text-sm">{m.name}</p>
                <p className="text-gray-500 text-xs mt-0.5">{m.req}</p>
                <p className="text-yellow-300/80 text-xs mt-1">{m.bonus}</p>
              </div>
            ))}
          </div>
          <p className="text-gray-400 text-sm mt-4">
            I milestone sbloccati vengono mostrati con un'animazione e rimangono attivi per il resto della partita.
            I bonus alle votazioni si sommano tra loro.
          </p>
        </div>
      </>
    ),
  },

  {
    id: 'eventi',
    title: 'Eventi e News',
    icon: Newspaper,
    iconColor: 'text-cyan-400',
    content: (
      <>
        <p className="text-gray-300 leading-relaxed text-lg mb-6">
          Durante la partita possono verificarsi eventi che coinvolgono tutti i giocatori
          e notizie che riflettono le scelte fatte nel gioco.
        </p>

        <div className="space-y-4">
          <div className="bg-gray-800/50 rounded-xl p-6 border border-cyan-500/20">
            <h3 className="font-semibold text-cyan-300 mb-3 text-lg">News dalla Società</h3>
            <p className="text-gray-300">
              Eventi che influenzano tutti i giocatori, modificando i punti di tecnologia,
              etica o neuralforming. Possono essere positive o negative!
            </p>
            <p className="text-gray-400 text-sm mt-3">
              Le notizie appaiono come ticker scorrevole nell'header del gioco e ruotano
              automaticamente in base alle scelte fatte durante la partita.
            </p>
          </div>

          <div className="bg-gray-800/50 rounded-xl p-6 border border-orange-500/20">
            <h3 className="font-semibold text-orange-300 mb-3 text-lg">Eventi Globali</h3>
            <p className="text-gray-300">
              Situazioni speciali attivate da condizioni specifiche che cambiano le regole
              del gioco temporaneamente o influenzano tutti i giocatori in modo significativo.
            </p>
            <p className="text-gray-400 text-sm mt-3">
              Gli eventi globali sono imprevedibili e possono capovolgere le sorti della
              partita: preparati ad adattare la tua strategia!
            </p>
          </div>
        </div>
      </>
    ),
  },

  {
    id: 'modalita',
    title: 'Modalità di Gioco',
    icon: Users,
    iconColor: 'text-indigo-400',
    content: (
      <>
        <p className="text-gray-300 leading-relaxed text-lg mb-6">
          Neuralforming offre due modalità di gioco, ciascuna pensata per un'esperienza diversa.
        </p>

        <div className="space-y-4">
          <div className="bg-primary-600/5 rounded-xl p-6 border border-primary-500/20">
            <div className="flex items-center gap-3 mb-3">
              <Users className="w-6 h-6 text-primary-400" />
              <h3 className="text-lg font-bold text-gray-100">Multiplayer in Classe</h3>
              <span className="text-xs font-semibold bg-primary-500/20 text-primary-300 px-2 py-0.5 rounded-full">Consigliato</span>
            </div>
            <p className="text-gray-300 mb-3">
              Crea una stanza e invita 2-8 giocatori tramite QR code o link diretto.
              Un dispositivo (desktop o tablet) funge da tabellone master, mentre ogni
              giocatore si collega dal proprio smartphone.
            </p>
            <ul className="list-disc list-inside text-gray-400 text-sm space-y-1.5 ml-4">
              <li>Tutti i giocatori votano sulle tecnologie proposte in tempo reale</li>
              <li>Le decisioni strategiche e la diplomazia diventano centrali</li>
              <li>Possibilità di unirsi a partite in corso</li>
              <li>Riconnessione automatica in caso di disconnessione</li>
            </ul>
          </div>

          <div className="bg-gray-800/50 rounded-xl p-6 border border-gray-700">
            <h3 className="text-lg font-bold text-gray-100 mb-3">Playground (Single Player)</h3>
            <p className="text-gray-300 mb-3">
              Gioca da solo in una simulazione con <strong className="text-gray-100">difficoltà adattiva</strong> e
              un sistema di <strong className="text-gray-100">Opinione Pubblica</strong> che
              reagisce alle tue scelte al posto del parlamento.
              La partita dura al massimo 15 turni.
            </p>
            <ul className="list-disc list-inside text-gray-400 text-sm space-y-1.5 ml-4">
              <li>L'opinione pubblica può approvare o bocciare le tue tecnologie</li>
              <li>Se l'opinione scende troppo per 3 turni consecutivi, perdi la partita</li>
              <li>La difficoltà aumenta con il progredire dei turni e dei punteggi</li>
            </ul>
            <p className="text-gray-400 text-sm mt-3">
              Perfetto per esplorare le meccaniche del gioco e prepararsi
              per le partite multiplayer in classe.
            </p>
          </div>
        </div>
      </>
    ),
  },

  {
    id: 'strategia',
    title: 'Consigli Strategici',
    icon: AlertCircle,
    iconColor: 'text-amber-400',
    content: (
      <>
        <p className="text-gray-300 leading-relaxed text-lg mb-6">
          Alcuni suggerimenti per migliorare le tue possibilità di vittoria.
        </p>

        <div className="space-y-3">
          {[
            {
              title: 'Bilancia i tuoi punti',
              desc: 'Non concentrarti solo su un tipo di punti, a meno che il tuo obiettivo non lo richieda. Il bilanciamento è la chiave del Neuralforming score.',
            },
            {
              title: 'Leggi attentamente',
              desc: 'Ogni decisione ha conseguenze a lungo termine. Valuta pro e contro di ogni opzione prima di scegliere.',
            },
            {
              title: 'Pianifica le votazioni',
              desc: 'In multiplayer, considera come gli altri giocatori potrebbero votare. Ricorda: ogni voto ha conseguenze sui tuoi punti!',
            },
            {
              title: 'Valuta il rischio del voto',
              desc: 'Votare NO può bloccare un avversario, ma se la legge passa comunque riceverai solo un piccolo bonus. Votare SÌ ti dà più punti se passa, ma penalità se viene bocciata.',
            },
            {
              title: 'Sblocca i milestone',
              desc: 'Le abilità speciali possono cambiare le sorti della partita. Pianifica la tua strategia per raggiungere i traguardi il prima possibile.',
            },
            {
              title: 'Gestisci la tua mano',
              desc: 'Non giocare tutte le carte subito. Tieni alcune riserve per i momenti giusti e per i jolly strategici.',
            },
            {
              title: 'Monitora gli obiettivi',
              desc: 'Controlla regolarmente il tuo obiettivo segreto nella dashboard per sapere esattamente cosa ti manca per vincere.',
            },
          ].map((tip, i) => (
            <div key={i} className="bg-gray-800/50 rounded-xl p-5 border border-gray-700 flex items-start gap-4">
              <span className="shrink-0 w-8 h-8 rounded-lg bg-amber-500/15 flex items-center justify-center text-amber-400 font-bold text-sm">
                {i + 1}
              </span>
              <div>
                <p className="font-semibold text-gray-100 mb-1">{tip.title}</p>
                <p className="text-gray-400 text-sm leading-relaxed">{tip.desc}</p>
              </div>
            </div>
          ))}
        </div>
      </>
    ),
  },
];
