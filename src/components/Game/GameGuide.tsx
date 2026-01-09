import { X, BookOpen, Users, Zap, AlertCircle, Target, Trophy, Vote, Newspaper, TrendingUp } from 'lucide-react';

interface GameGuideProps {
  onClose: () => void;
}

export const GameGuide = ({ onClose }: GameGuideProps) => {
  return (
    <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center p-4 z-50 overflow-y-auto">
      <div className="bg-gray-900 rounded-xl shadow-2xl max-w-4xl w-full max-h-[90vh] overflow-y-auto border border-gray-700">
        {/* Header */}
        <div className="sticky top-0 bg-gray-900 border-b border-gray-700 p-6 flex items-center justify-between z-10">
          <div className="flex items-center gap-3">
            <BookOpen className="w-6 h-6 text-blue-400" />
            <h2 className="text-2xl font-bold text-gray-100">Guida Completa al Gioco</h2>
          </div>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-100 transition-colors p-2 hover:bg-gray-800 rounded-lg"
            aria-label="Chiudi guida"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-8">
          {/* Introduzione */}
          <section>
            <h3 className="text-xl font-bold text-gray-100 mb-3 flex items-center gap-2">
              <BookOpen className="w-5 h-5 text-blue-400" />
              Cos'è Neuralforming?
            </h3>
            <p className="text-gray-300 leading-relaxed">
              Neuralforming è un gioco strategico dove rappresenti un partito politico che deve prendere decisioni 
              cruciali sullo sviluppo dell'Intelligenza Artificiale. Il tuo obiettivo è bilanciare innovazione tecnologica, 
              etica e responsabilità sociale per guidare la società verso un futuro sostenibile.
            </p>
          </section>

          {/* Obiettivo del Gioco */}
          <section>
            <h3 className="text-xl font-bold text-gray-100 mb-3 flex items-center gap-2">
              <Target className="w-5 h-5 text-green-400" />
              Obiettivo del Gioco
            </h3>
            <p className="text-gray-300 leading-relaxed mb-3">
              Ogni giocatore ha un <strong className="text-gray-100">obiettivo segreto</strong> assegnato all'inizio della partita. 
              Per vincere, devi raggiungere il tuo obiettivo specifico, che può richiedere:
            </p>
            <ul className="list-disc list-inside text-gray-300 space-y-2 ml-4">
              <li>Raggiungere certi livelli di punti Tecnologia, Etica o Neuralforming</li>
              <li>Bilanciare i tuoi punti in modo specifico</li>
              <li>Raccogliere un certo numero di tecnologie</li>
            </ul>
            <p className="text-gray-300 leading-relaxed mt-3">
              Consulta il tuo obiettivo nella dashboard per sapere cosa devi fare per vincere!
            </p>
          </section>

          {/* Sistema di Punti */}
          <section>
            <h3 className="text-xl font-bold text-gray-100 mb-3 flex items-center gap-2">
              <TrendingUp className="w-5 h-5 text-yellow-400" />
              Sistema di Punti
            </h3>
            <div className="space-y-4">
              <div className="bg-gray-800 rounded-lg p-4 border border-gray-700">
                <h4 className="font-semibold text-blue-300 mb-2">🔵 Punti Tecnologia</h4>
                <p className="text-gray-300 text-sm">
                  Rappresentano il progresso tecnologico e l'innovazione. Si ottengono giocando tecnologie avanzate 
                  e prendendo decisioni che favoriscono lo sviluppo tecnico.
                </p>
              </div>
              <div className="bg-gray-800 rounded-lg p-4 border border-gray-700">
                <h4 className="font-semibold text-green-300 mb-2">🟢 Punti Etica</h4>
                <p className="text-gray-300 text-sm">
                  Rappresentano l'impegno verso la responsabilità e i valori etici. Si ottengono prendendo decisioni 
                  che privilegiano il benessere sociale e la trasparenza.
                </p>
              </div>
              <div className="bg-gray-800 rounded-lg p-4 border border-gray-700">
                <h4 className="font-semibold text-purple-300 mb-2">🟣 Punti Neuralforming</h4>
                <p className="text-gray-300 text-sm">
                  Rappresentano il bilanciamento perfetto tra tecnologia ed etica. Si ottengono quando le tue decisioni 
                  combinano innovazione e responsabilità sociale.
                </p>
              </div>
            </div>
          </section>

          {/* Fasi del Turno */}
          <section>
            <h3 className="text-xl font-bold text-gray-100 mb-3 flex items-center gap-2">
              <Zap className="w-5 h-5 text-orange-400" />
              Fasi del Turno
            </h3>
            <div className="space-y-4">
              <div className="bg-gray-800 rounded-lg p-4 border border-gray-700">
                <h4 className="font-semibold text-gray-100 mb-2">1. Fase di Sviluppo</h4>
                <p className="text-gray-300 text-sm mb-2">
                  Durante il tuo turno, puoi:
                </p>
                <ul className="list-disc list-inside text-gray-300 text-sm space-y-1 ml-4">
                  <li><strong>Pescare una carta tecnologia</strong> dal mazzo (se la tua mano è vuota)</li>
                  <li><strong>Giocare una carta tecnologia</strong> dalla tua mano</li>
                </ul>
                <p className="text-gray-300 text-sm mt-2">
                  Quando giochi una tecnologia, ricevi i suoi punti e potrebbe essere necessaria una <strong>votazione parlamentare</strong>.
                </p>
              </div>

              <div className="bg-gray-800 rounded-lg p-4 border border-gray-700">
                <h4 className="font-semibold text-gray-100 mb-2">2. Dilemma Etico</h4>
                <p className="text-gray-300 text-sm mb-2">
                  Dopo aver giocato una tecnologia, peschi automaticamente un <strong>dilemma etico</strong>.
                </p>
                <p className="text-gray-300 text-sm">
                  Devi scegliere tra due opzioni, ognuna con conseguenze diverse sui tuoi punti. 
                  Le tue scelte influenzano il tuo percorso verso la vittoria!
                </p>
              </div>

              <div className="bg-gray-800 rounded-lg p-4 border border-gray-700">
                <h4 className="font-semibold text-gray-100 mb-2">3. Conseguenze</h4>
                <p className="text-gray-300 text-sm">
                  Dopo aver risolto il dilemma, appaiono le <strong>conseguenze</strong> della tua scelta, 
                  che modificano ulteriormente i tuoi punti. Leggi attentamente per capire l'impatto delle tue decisioni!
                </p>
              </div>
            </div>
          </section>

          {/* Votazione Parlamentare */}
          <section>
            <h3 className="text-xl font-bold text-gray-100 mb-3 flex items-center gap-2">
              <Vote className="w-5 h-5 text-red-400" />
              Votazione Parlamentare
            </h3>
            <p className="text-gray-300 leading-relaxed mb-3">
              Alcune tecnologie richiedono l'approvazione del Parlamento prima di essere implementate. 
              Il risultato della votazione influisce sui punti che ricevi:
            </p>
            
            <div className="bg-gray-800 rounded-lg p-4 border border-gray-700 mb-4">
              <h4 className="font-semibold text-gray-100 mb-3">📊 Sistema di Reward/Penalty</h4>
              <p className="text-gray-300 text-sm mb-3">
                <strong>Ogni voto ha conseguenze!</strong> Non solo il proponente, ma anche tutti i votanti ricevono punti o penalità in base al loro voto e al risultato:
              </p>
              
              <div className="space-y-3">
                <div className="bg-green-900/30 rounded p-3 border border-green-700/50">
                  <h5 className="font-semibold text-green-300 mb-2">✅ Se la legge è APPROVATA (≥50%):</h5>
                  <ul className="list-disc list-inside text-gray-300 text-sm space-y-1 ml-4">
                    <li><strong>Proponente:</strong> Riceve punti base + bonus in base all'approvazione (10-30%)</li>
                    <li><strong>Votanti SÌ:</strong> Ricevono +25% dei punti base (hanno sostenuto una legge popolare)</li>
                    <li><strong>Votanti NO:</strong> Ricevono +5% dei punti base (hanno sbagliato previsione, ma la legge è passata)</li>
                  </ul>
                </div>
                
                <div className="bg-red-900/30 rounded p-3 border border-red-700/50">
                  <h5 className="font-semibold text-red-300 mb-2">❌ Se la legge è BOCCIATA (&lt;50%):</h5>
                  <ul className="list-disc list-inside text-gray-300 text-sm space-y-1 ml-4">
                    <li><strong>Proponente:</strong> Riceve penalità (-40% o -50% dei punti base)</li>
                    <li><strong>Votanti SÌ:</strong> Ricevono -10% dei punti base (hanno sostenuto una legge impopolare)</li>
                    <li><strong>Votanti NO:</strong> Ricevono -5% dei punti base (hanno bloccato il progresso)</li>
                  </ul>
                </div>
              </div>
              
              <p className="text-gray-300 text-sm mt-3 italic">
                💡 <strong>Strategia:</strong> Valuta attentamente se votare SÌ o NO - ogni scelta ha conseguenze reali sui tuoi punti!
              </p>
            </div>

            <ul className="list-disc list-inside text-gray-300 space-y-2 ml-4">
              <li><strong>Approvazione ≥ 70%:</strong> Bonus extra per il proponente (+30% bonus)!</li>
              <li><strong>Approvazione &lt; 30%:</strong> Penalità più severe per il proponente (-50% penalità)</li>
            </ul>
            
            <p className="text-gray-300 leading-relaxed mt-3">
              In modalità <strong>single player</strong>, gli altri partiti (AI) votano automaticamente in base ai loro interessi. 
              In modalità <strong>multiplayer</strong>, tutti i giocatori votano in tempo reale e ogni voto conta!
            </p>
          </section>

          {/* Milestone */}
          <section>
            <h3 className="text-xl font-bold text-gray-100 mb-3 flex items-center gap-2">
              <Trophy className="w-5 h-5 text-yellow-400" />
              Milestone e Abilità Speciali
            </h3>
            <p className="text-gray-300 leading-relaxed mb-3">
              Raggiungendo certi traguardi, sblocchi <strong>milestone</strong> che ti conferiscono abilità speciali:
            </p>
            <ul className="list-disc list-inside text-gray-300 space-y-2 ml-4">
              <li><strong>Bonus alle votazioni:</strong> Le tue proposte ricevono più supporto</li>
              <li><strong>Protezione dagli eventi:</strong> Sei immune a certi effetti negativi</li>
              <li><strong>Punti doppi:</strong> Ottieni bonus punti in certe situazioni</li>
              <li><strong>Carte extra:</strong> Peschi più tecnologie</li>
            </ul>
            <p className="text-gray-300 leading-relaxed mt-3">
              I milestone sbloccati vengono mostrati con un'animazione e rimangono attivi per il resto della partita!
            </p>
          </section>

          {/* Eventi e News */}
          <section>
            <h3 className="text-xl font-bold text-gray-100 mb-3 flex items-center gap-2">
              <Newspaper className="w-5 h-5 text-cyan-400" />
              Eventi Globali e News
            </h3>
            <p className="text-gray-300 leading-relaxed mb-3">
              Durante la partita possono verificarsi:
            </p>
            <div className="space-y-3">
              <div className="bg-gray-800 rounded-lg p-4 border border-gray-700">
                <h4 className="font-semibold text-cyan-300 mb-2">📰 News dalla Società</h4>
                <p className="text-gray-300 text-sm">
                  Eventi che influenzano tutti i giocatori, modificando i punti di tecnologia, etica o neuralforming. 
                  Possono essere positive o negative!
                </p>
              </div>
              <div className="bg-gray-800 rounded-lg p-4 border border-gray-700">
                <h4 className="font-semibold text-orange-300 mb-2">⚡ Eventi Globali</h4>
                <p className="text-gray-300 text-sm">
                  Situazioni speciali che cambiano le regole del gioco temporaneamente o influenzano tutti i giocatori 
                  in modo significativo.
                </p>
              </div>
            </div>
          </section>

          {/* Carte Speciali */}
          <section>
            <h3 className="text-xl font-bold text-gray-100 mb-3 flex items-center gap-2">
              <Zap className="w-5 h-5 text-purple-400" />
              Carte Speciali: Jolly
            </h3>
            <p className="text-gray-300 leading-relaxed mb-3">
              Alcune carte tecnologia sono <strong>jolly</strong> che possono essere giocate durante un dilemma per:
            </p>
            <ul className="list-disc list-inside text-gray-300 space-y-2 ml-4">
              <li>Moltiplicare i punti di una delle opzioni del dilemma</li>
              <li>Ottenere bonus punti extra</li>
            </ul>
            <p className="text-gray-300 leading-relaxed mt-3">
              Usa i jolly strategicamente per massimizzare l'impatto delle tue decisioni!
            </p>
          </section>

          {/* Modalità di Gioco */}
          <section>
            <h3 className="text-xl font-bold text-gray-100 mb-3 flex items-center gap-2">
              <Users className="w-5 h-5 text-indigo-400" />
              Modalità di Gioco
            </h3>
            <div className="space-y-3">
              <div className="bg-gray-800 rounded-lg p-4 border border-gray-700">
                <h4 className="font-semibold text-gray-100 mb-2">Single Player</h4>
                <p className="text-gray-300 text-sm">
                  Gioca contro 4 partiti AI controllati dal computer. I loro turni vengono processati automaticamente. 
                  Perfetto per imparare le meccaniche del gioco!
                </p>
              </div>
              <div className="bg-gray-800 rounded-lg p-4 border border-gray-700">
                <h4 className="font-semibold text-gray-100 mb-2">Multiplayer</h4>
                <p className="text-gray-300 text-sm">
                  Crea una stanza e invita altri giocatori tramite QR code. Tutti i giocatori votano sulle tecnologie 
                  proposte e prendono decisioni in tempo reale. La strategia diventa ancora più importante!
                </p>
              </div>
            </div>
          </section>

          {/* Consigli Strategici */}
          <section>
            <h3 className="text-xl font-bold text-gray-100 mb-3 flex items-center gap-2">
              <AlertCircle className="w-5 h-5 text-amber-400" />
              Consigli Strategici
            </h3>
            <ul className="list-disc list-inside text-gray-300 space-y-2 ml-4">
              <li><strong>Bilancia i tuoi punti:</strong> Non concentrarti solo su un tipo di punti, a meno che il tuo obiettivo non lo richieda</li>
              <li><strong>Leggi attentamente:</strong> Ogni decisione ha conseguenze a lungo termine</li>
              <li><strong>Pianifica le votazioni:</strong> In multiplayer, considera come gli altri giocatori potrebbero votare. Ricorda: ogni voto ha conseguenze sui tuoi punti!</li>
              <li><strong>Valuta il rischio:</strong> Votare NO può bloccare un avversario, ma se la legge passa comunque riceverai solo un piccolo bonus. Votare SÌ ti dà più punti se passa, ma penalità se viene bocciata</li>
              <li><strong>Usa i milestone:</strong> Sbloccare abilità speciali può cambiare le sorti della partita</li>
              <li><strong>Gestisci la tua mano:</strong> Non giocare tutte le carte subito, tieni alcune riserve per i momenti giusti</li>
              <li><strong>Monitora gli obiettivi:</strong> Controlla regolarmente il tuo obiettivo per sapere cosa ti serve per vincere</li>
            </ul>
          </section>

          {/* Footer */}
          <div className="pt-6 border-t border-gray-700">
            <p className="text-center text-gray-400 text-sm">
              Buona fortuna nel guidare la società verso un futuro etico e tecnologico! 🚀
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
