import type { Locale } from './locale';

export type GameCopy = {
  languageLabel: string;
  languageHelp: string;
  setup: {
    tagline: string;
    title: string;
    connecting: string;
    connectingHint: string;
    connectionError: string;
    connectionHint: string;
    masterBlurbLead: string;
    masterBlurb: string;
    or: string;
    roomIdJoin: string;
    roomIdPlaceholder: string;
    create: string;
    join: string;
    roomIdShare: string;
    roomIdShareHint: string;
    qrLabel: string;
    qrLinkHint: string;
    players: string;
    masterBadge: string;
    partyName: string;
    partyNamePlaceholder: string;
    partyColor: string;
    alreadyJoined: string;
    joinGame: string;
    joinedTitle: string;
    joinedWait: string;
    start: string;
    waitPlayers: string;
    alertRoomId: string;
    alertPartyName: string;
    alertMinPlayers: string;
    alertNoPlayers: string;
    alertNoRoom: string;
  };
  login: {
    subtitle: string;
    scanQr: string;
    or: string;
    roomId: string;
    roomIdPlaceholder: string;
    partyName: string;
    partyNamePlaceholder: string;
    partyColor: string;
    partyIcon: string;
    submit: string;
    newGame: string;
    newGameHint: string;
    nameTaken: string;
    invalidQr: string;
  };
  colors: Record<string, string>;
  icons: Record<string, string>;
  common: {
    close: string;
    copied: string;
    copy: string;
    cancel: string;
    confirm: string;
    continue: string;
    back: string;
    error: string;
    player: string;
    master: string;
    demo: string;
    loadingGame: string;
  };
  scores: {
    tech: string;
    ethics: string;
    neural: string;
    techPoints: string;
    ethicsPoints: string;
    neuralPoints: string;
    yourPoints: string;
    balance: string;
  };
  phases: {
    development: string;
    dilemma: string;
    consequence: string;
    voting: string;
    phase: string;
  };
  hand: {
    proposals: string;
    laws: string;
    milestones: string;
    objective: string;
    yourProposals: string;
    approvedLaws: string;
    yourMilestones: string;
    yourObjective: string;
    confirmTitle: string;
    confirmBodyBefore: string;
    confirmBodyAfter: string;
    propose: string;
    waitingTurn: string;
    turnOrder: string;
    inPlay: string;
    noProposals: string;
    draw: string;
    alreadyProposed: string;
    cannotPropose: string;
    noLaws: string;
    noLawsHint: string;
    noMilestones: string;
    noMilestonesHint: string;
    ability: string;
    noObjective: string;
    turnOf: string;
  };
  voting: {
    yes: string;
    no: string;
    votedYes: string;
    votedNo: string;
    discuss: string;
    ready: string;
    readyDone: string;
    votes: string;
    rejectedLandslide: string;
    rejected: string;
    approvedLandslide: string;
    approved: string;
  };
  dilemma: {
    title: string;
    votingInProgress: string;
    discussion: string;
    choose: string;
    jokerActive: string;
  };
  cards: {
    law: string;
    bonusEffect: string;
    ethicsTimes: string;
  };
  invite: {
    title: string;
    hint: string;
    footnote: string;
    button: string;
  };
  game: {
    victory: string;
    defeat: string;
    won: (name: string) => string;
    yourTurn: string;
    observing: string;
    waitTurn: string;
    turnN: (n: number) => string;
    turnOf: (name: string) => string;
    otherPlayer: string;
    emptyHand: string;
    newProposal: string;
    playerNotFound: string;
    init: string;
  };
  opening: {
    playersReady: string;
    start: string;
  };
  sp: {
    yourParty: string;
    newGame: string;
    developmentPhase: string;
    winReason: string;
    loseEthics: string;
    loseOpinion: string;
    loseTime: string;
    publicOpinion: string;
    highConsensus: string;
    crisisWarning: (n: number) => string;
  };
  difficulty: {
    easy: string;
    easyDesc: string;
    medium: string;
    mediumDesc: string;
    hard: string;
    hardDesc: string;
    crisis: string;
    crisisDesc: string;
  };
  opinion: {
    collapsed: (name: string) => string;
    enthusiastic: (name: string, value: number) => string;
    positive: (name: string, value: number) => string;
    stable: (name: string, value: number) => string;
    doubts: (name: string, value: number) => string;
    criticism: (name: string, value: number) => string;
  };
  aiNames: string[];
  tour: {
    back: string;
    close: string;
    last: string;
    next: string;
    skip: string;
    welcomeTitle: string;
    welcomeBody: string;
    menuTitle: string;
    menuBody: string;
    newsTitle: string;
    newsBody: string;
    sectionsTitle: string;
    sectionsLead: string;
    sectionsProposals: string;
    sectionsLaws: string;
    sectionsMilestones: string;
    sectionsObjective: string;
    objectiveTitle: string;
    objectiveBody: string;
    proposalsTitle: string;
    proposalsBody: string;
    drawTitle: string;
    drawBody: string;
    lawsTitle: string;
    lawsBody: string;
    milestonesTitle: string;
    milestonesBody: string;
    howTitle: string;
    howDev: string;
    howVote: string;
    howDilemma: string;
  };
  milestones: Record<
    string,
    { name: string; description: string; abilityName: string; abilityDescription: string }
  >;
  events: Record<string, { title: string; description: string }>;
  dashboard: {
    title: string;
    techPct: string;
    ethicsPct: string;
    balanceLabel: string;
    turn: string;
  };
  ticker: {
    label: string;
  };
  roster: {
    title: string;
    inGame: string;
    turn: string;
    skip: string;
    disconnected: string;
    aiOpponents: string;
  };
};

const it: GameCopy = {
  languageLabel: 'Lingua della partita',
  languageHelp: 'Dilemmi, carte e interfaccia saranno in questa lingua per tutti i giocatori.',
  setup: {
    tagline: "Governare l'Intelligenza Artificiale",
    title: 'Setup Partita',
    connecting: 'Connessione al server in corso...',
    connectingHint: 'Assicurati che il server sia avviato su',
    connectionError: 'Errore di connessione',
    connectionHint: 'Verifica che il server sia avviato:',
    masterBlurbLead: 'Sei il Master della partita.',
    masterBlurb:
      'Il master non è un giocatore, ma gestisce la partita e vede tutto lo stato del gioco.',
    or: 'oppure',
    roomIdJoin: 'ID Partita (per unirsi)',
    roomIdPlaceholder: "Incolla l'ID della partita",
    create: 'Crea Partita',
    join: 'Unisciti',
    roomIdShare: 'ID Partita (condividi con gli altri giocatori)',
    roomIdShareHint: 'Gli altri giocatori possono unirsi usando questo ID',
    qrLabel: 'Inquadra per entrare nella PWA giocatore',
    qrLinkHint: "Link diretto alla PWA giocatore con l'ID già compilato",
    players: 'Giocatori',
    masterBadge: 'Master',
    partyName: 'Nome del Partito',
    partyNamePlaceholder: 'Es: Partito Democratico',
    partyColor: 'Colore del Partito',
    alreadyJoined: 'Già Unito',
    joinGame: 'Unisciti alla Partita',
    joinedTitle: '✓ Ti sei unito alla partita!',
    joinedWait: 'Aspetta che il master avvii il gioco...',
    start: 'Inizia Partita',
    waitPlayers: 'Aspetta almeno 2 giocatori per iniziare',
    alertRoomId: "Inserisci l'ID della partita",
    alertPartyName: 'Inserisci il nome del partito',
    alertMinPlayers: 'Devi avere almeno 2 giocatori per iniziare!',
    alertNoPlayers: 'Nessun giocatore nella room!',
    alertNoRoom: 'Errore: ID partita non disponibile',
  },
  login: {
    subtitle: "Accedi alla partita con il tuo nome e l'ID della partita",
    scanQr: 'Scansiona QR Code',
    or: 'oppure',
    roomId: 'ID Partita',
    roomIdPlaceholder: 'Inserisci ID partita o incolla URL completo',
    partyName: 'Nome del Partito',
    partyNamePlaceholder: 'Il tuo nome partito',
    partyColor: 'Colore del Partito',
    partyIcon: 'Icona del Partito',
    submit: 'Accedi alla Partita',
    newGame: '🆕 Nuova Partita',
    newGameHint: 'Pulisce la sessione salvata per entrare in una nuova partita',
    nameTaken: 'Questo nome è già usato in questa partita. Scegli un altro nome.',
    invalidQr: 'QR code non valido. Assicurati di scansionare il QR code della partita.',
  },
  colors: {
    '#3B82F6': 'Blu',
    '#3b82f6': 'Blu',
    '#EF4444': 'Rosso',
    '#ef4444': 'Rosso',
    '#10B981': 'Verde',
    '#10b981': 'Verde',
    '#F59E0B': 'Giallo',
    '#eab308': 'Giallo',
    '#8B5CF6': 'Viola',
    '#a855f7': 'Viola',
    '#EC4899': 'Rosa',
    '#ec4899': 'Rosa',
    '#F97316': 'Arancione',
    '#f97316': 'Arancione',
    '#06B6D4': 'Ciano',
    '#06b6d4': 'Ciano',
  },
  icons: {
    landmark: 'Landmark',
    shield: 'Scudo',
    star: 'Stella',
    flame: 'Fiamma',
    lightning: 'Fulmine',
    crown: 'Corona',
    globe: 'Globo',
    torch: 'Torcia',
  },
  common: {
    close: 'Chiudi',
    copied: 'Copiato!',
    copy: 'Copia',
    cancel: 'Annulla',
    confirm: 'Conferma',
    continue: 'Continua',
    back: 'Indietro',
    error: 'Errore',
    player: 'Giocatore',
    master: 'Master',
    demo: 'Demo',
    loadingGame: 'Inizializzazione partita...',
  },
  scores: {
    tech: 'Tech',
    ethics: 'Etica',
    neural: 'Neural',
    techPoints: 'Punti Tecnologia',
    ethicsPoints: 'Punti Etica',
    neuralPoints: 'Punti Neuralforming',
    yourPoints: 'I tuoi punti',
    balance: 'Bilanciamento',
  },
  phases: {
    development: 'Sviluppo',
    dilemma: 'Dilemma Etico',
    consequence: 'Conseguenza',
    voting: 'Votazione',
    phase: 'Fase',
  },
  hand: {
    proposals: 'Proposte',
    laws: 'Leggi',
    milestones: 'Milestone',
    objective: 'Obiettivo',
    yourProposals: 'Le Tue Proposte',
    approvedLaws: 'Leggi Approvate',
    yourMilestones: 'I Tuoi Milestone',
    yourObjective: 'Il Tuo Obiettivo',
    confirmTitle: 'Conferma Proposta',
    confirmBodyBefore: 'Stai per proporre',
    confirmBodyAfter: 'Tutti i giocatori voteranno su questa proposta. Puoi proporre una sola legge per turno.',
    propose: 'Proponi',
    waitingTurn: 'In attesa del tuo turno...',
    turnOrder: 'Ordine Turni',
    inPlay: 'IN GIOCO',
    noProposals: 'Non hai proposte disponibili',
    draw: 'Nuova Proposta',
    alreadyProposed: 'Hai già proposto una legge in questo turno. Attendi il prossimo turno.',
    cannotPropose: 'Non puoi proporre leggi in questo momento.',
    noLaws: 'Nessuna legge approvata ancora',
    noLawsHint: 'Presenta proposte per iniziare',
    noMilestones: 'Nessun milestone raggiunto ancora',
    noMilestonesHint: 'Raggiungi obiettivi per sbloccare abilità speciali',
    ability: 'Abilità',
    noObjective: 'Nessun obiettivo assegnato',
    turnOf: 'Turno di',
  },
  voting: {
    yes: 'Vota Sì',
    no: 'Vota No',
    votedYes: 'Votato Sì',
    votedNo: 'Votato No',
    discuss: 'Discutete la Proposta',
    ready: 'Pronto a votare',
    readyDone: 'In attesa degli altri...',
    votes: 'Voti',
    rejectedLandslide:
      'Bocciata! La proposta è stata respinta dal parlamento con grande maggioranza. Il fallimento ha danneggiato la tua reputazione politica (-50% penalità)',
    rejected:
      'Bocciata! La proposta è stata respinta dal parlamento. Il fallimento ha danneggiato la tua reputazione politica (-40% penalità)',
    approvedLandslide:
      'Approvazione schiacciante! La proposta ha ricevuto ampio sostegno parlamentare (+30% bonus)',
    approved: 'Approvata! La proposta ha ottenuto il sostegno della maggioranza (+10% bonus)',
  },
  dilemma: {
    title: 'Dilemma Etico',
    votingInProgress: 'Votazione sul dilemma in corso...',
    discussion: 'Discussione in corso',
    choose: 'Scegli la tua decisione',
    jokerActive: 'Jolly Attivo',
  },
  cards: {
    law: 'LEGGE',
    bonusEffect: 'Effetto Bonus',
    ethicsTimes: 'Etica ×',
  },
  invite: {
    title: 'Invita giocatori',
    hint: 'Inquadra il QR code per unirti alla partita in corso',
    footnote: 'I nuovi giocatori entreranno nella partita con 0 punti',
    button: 'Invita',
  },
  game: {
    victory: 'Vittoria!',
    defeat: 'Sconfitta',
    won: (name) => `${name} ha vinto!`,
    yourTurn: 'È il tuo turno',
    observing: 'Osservando il gioco...',
    waitTurn: 'Aspetta il tuo turno...',
    turnN: (n) => `Turno ${n}`,
    turnOf: (name) => `Turno di ${name}`,
    otherPlayer: 'Altro Giocatore',
    emptyHand:
      'Non hai proposte disponibili. Clicca su "Nuova Proposta" per presentare una nuova iniziativa legislativa.',
    newProposal: 'Nuova Proposta',
    playerNotFound: 'Giocatore non trovato',
    init: 'Inizializzazione partita...',
  },
  opening: {
    playersReady: 'Giocatori pronti',
    start: 'Inizia il Gioco',
  },
  sp: {
    yourParty: 'Il Tuo Partito',
    newGame: 'Nuova Partita',
    developmentPhase: 'Fase di Sviluppo',
    winReason: 'Hai raggiunto il tuo obiettivo mantenendo il consenso pubblico!',
    loseEthics:
      "Il tuo approccio è troppo sbilanciato. L'IA che hai sviluppato è eticamente inaccettabile.",
    loseOpinion: "L'opinione pubblica è crollata! Il governo è caduto per mancanza di consenso.",
    loseTime: "Troppo tempo è passato senza raggiungere l'obiettivo. Il parlamento ha revocato il mandato.",
    publicOpinion: 'Opinione Pubblica',
    highConsensus: 'Consenso Alto',
    crisisWarning: (n) => `PERICOLO: Il governo cadrà tra ${n} turno/i!`,
  },
  difficulty: {
    easy: 'Facile',
    easyDesc: 'Situazione stabile. Il parlamento è collaborativo.',
    medium: 'Moderata',
    mediumDesc: 'Le scelte si fanno più complesse. Attenzione al bilanciamento.',
    hard: 'Difficile',
    hardDesc: 'Crisi in arrivo. Ogni decisione conta.',
    crisis: 'Crisi',
    crisisDesc: "Situazione critica! L'opinione pubblica è volatile.",
  },
  opinion: {
    collapsed: (name) =>
      `L'opinione pubblica è crollata! La proposta "${name}" è stata respinta con indignazione. Il consenso è troppo basso per procedere.`,
    enthusiastic: (name, value) =>
      `La proposta "${name}" ha ricevuto un'accoglienza entusiasta dal pubblico! L'opinione pubblica sale a ${value}.`,
    positive: (name, value) =>
      `"${name}" è stata accolta positivamente. L'opinione pubblica migliora leggermente (${value}).`,
    stable: (name, value) =>
      `"${name}" è stata approvata senza particolari reazioni. L'opinione pubblica resta stabile (${value}).`,
    doubts: (name, value) =>
      `La proposta "${name}" ha generato qualche perplessità nell'opinione pubblica (${value}).`,
    criticism: (name, value) =>
      `"${name}" ha suscitato forti critiche dall'opinione pubblica. Il consenso cala significativamente (${value}).`,
  },
  aiNames: [
    'Partito Progressista',
    'Alleanza Tecnologica',
    'Coalizione Etica',
    'Movimento Innovazione',
  ],
  tour: {
    back: 'Indietro',
    close: 'Chiudi',
    last: 'Fine',
    next: 'Avanti',
    skip: 'Salta',
    welcomeTitle: 'Benvenuto in Neuralforming! 🎮',
    welcomeBody:
      "Questo tour ti guiderà attraverso le funzionalità principali del gioco. Prendi decisioni politiche per un'IA sostenibile e responsabile!",
    menuTitle: 'Menu di Gioco',
    menuBody:
      'Da qui puoi accedere alle opzioni del gioco, incluso il pulsante per iniziare una nuova partita.',
    newsTitle: 'Notizie Globali 📰',
    newsBody:
      'Le notizie mostrano eventi che influenzano il gioco. Puoi chiuderle temporaneamente, ma torneranno quando necessario.',
    sectionsTitle: 'Le Tue Sezioni',
    sectionsLead: 'Hai 4 sezioni principali:',
    sectionsProposals: 'Proposte: Le carte tecnologia nella tua mano',
    sectionsLaws: 'Leggi: Le tecnologie che hai fatto approvare',
    sectionsMilestones: 'Milestone: Abilità speciali sbloccate',
    sectionsObjective: 'Obiettivo: La tua missione segreta per vincere',
    objectiveTitle: 'Il Tuo Obiettivo 🎯',
    objectiveBody:
      'Ogni giocatore ha un obiettivo segreto. Raggiungilo per vincere la partita! Controlla spesso questa sezione per vedere i tuoi progressi.',
    proposalsTitle: 'Le Tue Proposte',
    proposalsBody:
      'Qui vedi le carte tecnologia nella tua mano. Quando è il tuo turno, puoi proporre una tecnologia cliccando su una carta. Le altre carte mostrano i punti che guadagnerai se approvate.',
    drawTitle: 'Pesca Nuove Carte',
    drawBody:
      'Usa questo pulsante per pescare una nuova carta tecnologia dal mazzo. Puoi pescare una carta per turno quando è il tuo momento di giocare.',
    lawsTitle: 'Leggi Approvate 📜',
    lawsBody:
      'Quando una tecnologia viene approvata dalla maggioranza dei giocatori, diventa una legge. Le leggi approvate ti danno punti permanenti e contano per il tuo obiettivo.',
    milestonesTitle: 'Milestone 🏆',
    milestonesBody:
      'Raggiungendo certi traguardi, sblocchi milestone che ti danno abilità speciali. Queste abilità possono cambiare le regole del gioco a tuo favore!',
    howTitle: 'Come Funziona il Gioco',
    howDev:
      'Fase di Sviluppo: Quando è il tuo turno, puoi proporre una tecnologia dalla tua mano. Gli altri giocatori voteranno su di essa.',
    howVote:
      'Votazione: Quando qualcuno propone una tecnologia, tutti votano Sì o No. Ogni voto ha conseguenze sui tuoi punti.',
    howDilemma:
      'Dilemmi: A volte dovrai affrontare dilemmi etici che influenzano i tuoi punti. Scegli saggiamente!',
  },
  milestones: {
    'milestone-tech-pioneer': {
      name: 'Pioniere Tecnologico',
      description: "Raggiungi 30 punti Tecnologia per dimostrare la tua competenza nell'innovazione.",
      abilityName: 'Supporto Tecnologico',
      abilityDescription: 'Le tecnologie che giochi ricevono +15% di approvazione parlamentare.',
    },
    'milestone-ethics-guardian': {
      name: 'Guardiano Etico',
      description: 'Raggiungi 25 punti Etica per dimostrare il tuo impegno verso la responsabilità.',
      abilityName: 'Protezione Etica',
      abilityDescription: 'Sei protetto dagli effetti negativi degli eventi globali etici.',
    },
    'milestone-balanced-leader': {
      name: 'Leader Bilanciato',
      description: 'Mantieni un bilanciamento > 0.6 tra Tecnologia ed Etica per dimostrare equilibrio.',
      abilityName: 'Sinergia Perfetta',
      abilityDescription:
        'Quando giochi una tecnologia bilanciata (tech ed ethics simili), ricevi +50% punti Neuralforming.',
    },
    'milestone-neuralforming-25': {
      name: 'Innovatore Neuralforming',
      description: 'Raggiungi 25 punti Neuralforming per dimostrare progressi significativi.',
      abilityName: 'Iniziativa Parlamentare',
      abilityDescription: "All'inizio di ogni turno, peschi automaticamente una carta tecnologia extra.",
    },
    'milestone-neuralforming-40': {
      name: 'Maestro Neuralforming',
      description: 'Raggiungi 40 punti Neuralforming per diventare un leader riconosciuto.',
      abilityName: 'Esenzione Parlamentare',
      abilityDescription:
        'Una volta per partita, puoi saltare un dilemma e ricevere comunque metà dei punti Neuralforming.',
    },
    'milestone-technologies-3': {
      name: 'Sviluppatore Esperto',
      description: 'Sviluppa almeno 3 tecnologie per dimostrare la tua capacità di innovazione.',
      abilityName: 'Coalizione Tecnologica',
      abilityDescription:
        'I partiti tecnologici sono più propensi a votare a favore delle tue proposte (+10% approvazione).',
    },
  },
  events: {
    'crisis-ethical': {
      title: 'Crisi Etica Pubblica',
      description: "Uno scandalo etico coinvolge l'IA sviluppata. I cittadini perdono fiducia nel progetto.",
    },
    'breakthrough-tech': {
      title: 'Svolta Tecnologica',
      description: "Una scoperta scientifica rivoluzionaria accelera lo sviluppo dell'IA per tutti i partiti.",
    },
    'public-opinion-swing': {
      title: "Cambiamento dell'Opinione Pubblica",
      description:
        "L'opinione pubblica si sposta verso un approccio più bilanciato. I partiti bilanciati guadagnano supporto.",
    },
    'tech-oversight': {
      title: 'Richiesta di Maggiore Supervisione',
      description: 'Il parlamento richiede maggiore trasparenza e supervisione etica sull\'IA.',
    },
  },
  dashboard: {
    title: 'Dashboard IA',
    techPct: 'Tecnologia %',
    ethicsPct: 'Etica %',
    balanceLabel: 'Bilanciamento Etica/Tecnologia',
    turn: 'Turno',
  },
  ticker: {
    label: 'News',
  },
  roster: {
    title: 'Giocatori',
    inGame: 'in gioco',
    turn: 'Turno',
    skip: 'Salta',
    disconnected: 'Offline',
    aiOpponents: 'Avversari IA',
  },
};

const en: GameCopy = {
  languageLabel: 'Game language',
  languageHelp: 'Dilemmas, cards and the interface will be in this language for every player.',
  setup: {
    tagline: 'Governing Artificial Intelligence',
    title: 'Game setup',
    connecting: 'Connecting to the server...',
    connectingHint: 'Make sure the server is running at',
    connectionError: 'Connection error',
    connectionHint: 'Check that the server is running:',
    masterBlurbLead: 'You are the game Master.',
    masterBlurb: 'The master is not a player: you run the session and see the full board.',
    or: 'or',
    roomIdJoin: 'Game ID (to join)',
    roomIdPlaceholder: 'Paste the game ID',
    create: 'Create game',
    join: 'Join',
    roomIdShare: 'Game ID (share with the other players)',
    roomIdShareHint: 'Others can join using this ID',
    qrLabel: 'Scan to open the player app',
    qrLinkHint: 'Direct link to the player app with the ID already filled in',
    players: 'Players',
    masterBadge: 'Master',
    partyName: 'Party name',
    partyNamePlaceholder: 'e.g. Democratic Party',
    partyColor: 'Party colour',
    alreadyJoined: 'Already joined',
    joinGame: 'Join the game',
    joinedTitle: '✓ You have joined the game!',
    joinedWait: 'Wait for the master to start...',
    start: 'Start game',
    waitPlayers: 'Wait for at least 2 players to start',
    alertRoomId: 'Enter the game ID',
    alertPartyName: 'Enter the party name',
    alertMinPlayers: 'You need at least 2 players to start!',
    alertNoPlayers: 'No players in the room!',
    alertNoRoom: 'Error: game ID is missing',
  },
  login: {
    subtitle: 'Join the game with your party name and the game ID',
    scanQr: 'Scan QR code',
    or: 'or',
    roomId: 'Game ID',
    roomIdPlaceholder: 'Enter the game ID or paste the full URL',
    partyName: 'Party name',
    partyNamePlaceholder: 'Your party name',
    partyColor: 'Party colour',
    partyIcon: 'Party icon',
    submit: 'Join the game',
    newGame: '🆕 New game',
    newGameHint: 'Clears the saved session so you can join a new game',
    nameTaken: 'This name is already used in this game. Choose another.',
    invalidQr: 'Invalid QR code. Scan the QR code for this game.',
  },
  colors: {
    '#3B82F6': 'Blue',
    '#3b82f6': 'Blue',
    '#EF4444': 'Red',
    '#ef4444': 'Red',
    '#10B981': 'Green',
    '#10b981': 'Green',
    '#F59E0B': 'Yellow',
    '#eab308': 'Yellow',
    '#8B5CF6': 'Purple',
    '#a855f7': 'Purple',
    '#EC4899': 'Pink',
    '#ec4899': 'Pink',
    '#F97316': 'Orange',
    '#f97316': 'Orange',
    '#06B6D4': 'Cyan',
    '#06b6d4': 'Cyan',
  },
  icons: {
    landmark: 'Landmark',
    shield: 'Shield',
    star: 'Star',
    flame: 'Flame',
    lightning: 'Lightning',
    crown: 'Crown',
    globe: 'Globe',
    torch: 'Torch',
  },
  common: {
    close: 'Close',
    copied: 'Copied!',
    copy: 'Copy',
    cancel: 'Cancel',
    confirm: 'Confirm',
    continue: 'Continue',
    back: 'Back',
    error: 'Error',
    player: 'Player',
    master: 'Master',
    demo: 'Demo',
    loadingGame: 'Starting the game...',
  },
  scores: {
    tech: 'Tech',
    ethics: 'Ethics',
    neural: 'Neural',
    techPoints: 'Technology points',
    ethicsPoints: 'Ethics points',
    neuralPoints: 'Neuralforming points',
    yourPoints: 'Your points',
    balance: 'Balance',
  },
  phases: {
    development: 'Development',
    dilemma: 'Ethical dilemma',
    consequence: 'Consequence',
    voting: 'Vote',
    phase: 'Phase',
  },
  hand: {
    proposals: 'Bills',
    laws: 'Laws',
    milestones: 'Milestones',
    objective: 'Objective',
    yourProposals: 'Your bills',
    approvedLaws: 'Passed laws',
    yourMilestones: 'Your milestones',
    yourObjective: 'Your objective',
    confirmTitle: 'Confirm proposal',
    confirmBodyBefore: 'You are about to propose',
    confirmBodyAfter: 'Every player will vote on this bill. You may propose only one law per turn.',
    propose: 'Propose',
    waitingTurn: 'Waiting for your turn...',
    turnOrder: 'Turn order',
    inPlay: 'PLAYING',
    noProposals: 'You have no bills in hand',
    draw: 'New bill',
    alreadyProposed: 'You already proposed a law this turn. Wait for the next one.',
    cannotPropose: 'You cannot propose a law right now.',
    noLaws: 'No laws passed yet',
    noLawsHint: 'Propose bills to get started',
    noMilestones: 'No milestones unlocked yet',
    noMilestonesHint: 'Reach targets to unlock special abilities',
    ability: 'Ability',
    noObjective: 'No objective assigned',
    turnOf: "Turn:",
  },
  voting: {
    yes: 'Vote Yes',
    no: 'Vote No',
    votedYes: 'Voted Yes',
    votedNo: 'Voted No',
    discuss: 'Debate the bill',
    ready: 'Ready to vote',
    readyDone: 'Waiting for the others...',
    votes: 'Votes',
    rejectedLandslide:
      'Rejected! Parliament threw out the bill by a wide margin. The failure damaged your political standing (−50% penalty)',
    rejected:
      'Rejected! Parliament threw out the bill. The failure damaged your political standing (−40% penalty)',
    approvedLandslide:
      'Overwhelming approval! The bill won broad parliamentary support (+30% bonus)',
    approved: 'Passed! The bill won a majority (+10% bonus)',
  },
  dilemma: {
    title: 'Ethical dilemma',
    votingInProgress: 'Dilemma vote in progress...',
    discussion: 'Debate in progress',
    choose: 'Choose your decision',
    jokerActive: 'Joker active',
  },
  cards: {
    law: 'LAW',
    bonusEffect: 'Bonus effect',
    ethicsTimes: 'Ethics ×',
  },
  invite: {
    title: 'Invite players',
    hint: 'Scan the QR code to join the game in progress',
    footnote: 'New players join with 0 points',
    button: 'Invite',
  },
  game: {
    victory: 'Victory!',
    defeat: 'Defeat',
    won: (name) => `${name} won!`,
    yourTurn: 'Your turn',
    observing: 'Watching the game...',
    waitTurn: 'Wait for your turn...',
    turnN: (n) => `Turn ${n}`,
    turnOf: (name) => `${name}'s turn`,
    otherPlayer: 'Another player',
    emptyHand: 'You have no bills in hand. Click “New bill” to table a new legislative initiative.',
    newProposal: 'New bill',
    playerNotFound: 'Player not found',
    init: 'Starting the game...',
  },
  opening: {
    playersReady: 'Players ready',
    start: 'Start the game',
  },
  sp: {
    yourParty: 'Your party',
    newGame: 'New game',
    developmentPhase: 'Development phase',
    winReason: 'You completed your objective while keeping public support!',
    loseEthics: 'Your approach is too unbalanced. The AI you built is ethically unacceptable.',
    loseOpinion: 'Public opinion collapsed! The government fell for lack of support.',
    loseTime: 'Too much time passed without reaching the objective. Parliament revoked the mandate.',
    publicOpinion: 'Public opinion',
    highConsensus: 'High support',
    crisisWarning: (n) => `DANGER: the government will fall in ${n} turn(s)!`,
  },
  difficulty: {
    easy: 'Easy',
    easyDesc: 'A stable situation. Parliament is cooperative.',
    medium: 'Moderate',
    mediumDesc: 'Choices get harder. Watch the balance.',
    hard: 'Hard',
    hardDesc: 'A crisis is coming. Every decision counts.',
    crisis: 'Crisis',
    crisisDesc: 'Critical situation! Public opinion is volatile.',
  },
  opinion: {
    collapsed: (name) =>
      `Public opinion collapsed! The bill “${name}” was rejected in outrage. Support is too low to continue.`,
    enthusiastic: (name, value) =>
      `The bill “${name}” was greeted with enthusiasm! Public opinion rises to ${value}.`,
    positive: (name, value) =>
      `“${name}” was received positively. Public opinion improves slightly (${value}).`,
    stable: (name, value) =>
      `“${name}” passed without much reaction. Public opinion holds steady (${value}).`,
    doubts: (name, value) =>
      `The bill “${name}” raised some doubts in public opinion (${value}).`,
    criticism: (name, value) =>
      `“${name}” drew strong criticism. Support falls sharply (${value}).`,
  },
  aiNames: [
    'Progressive Party',
    'Technology Alliance',
    'Ethics Coalition',
    'Innovation Movement',
  ],
  tour: {
    back: 'Back',
    close: 'Close',
    last: 'Done',
    next: 'Next',
    skip: 'Skip',
    welcomeTitle: 'Welcome to Neuralforming!',
    welcomeBody:
      'This tour walks you through the main features. Take political decisions for a sustainable, responsible AI.',
    menuTitle: 'Game menu',
    menuBody: 'Open game options here, including the button to start a new session.',
    newsTitle: 'World news',
    newsBody:
      'News items show events that affect the game. You can dismiss them for a while; they come back when needed.',
    sectionsTitle: 'Your sections',
    sectionsLead: 'You have four main sections:',
    sectionsProposals: 'Bills: technology cards in your hand',
    sectionsLaws: 'Laws: technologies you got passed',
    sectionsMilestones: 'Milestones: unlocked special abilities',
    sectionsObjective: 'Objective: your secret mission to win',
    objectiveTitle: 'Your objective',
    objectiveBody:
      'Each player has a secret objective. Complete it to win. Check this tab often to see your progress.',
    proposalsTitle: 'Your bills',
    proposalsBody:
      'These are the technology cards in your hand. On your turn, propose one by tapping a card. The others show the points you would gain if they pass.',
    drawTitle: 'Draw new cards',
    drawBody:
      'Use this button to draw a technology card from the deck. You may draw one card per turn when it is your turn to play.',
    lawsTitle: 'Passed laws',
    lawsBody:
      'When a majority passes a technology, it becomes a law. Passed laws give permanent points and count toward your objective.',
    milestonesTitle: 'Milestones',
    milestonesBody:
      'Hitting certain targets unlocks milestones with special abilities. Those abilities can tilt the rules in your favour.',
    howTitle: 'How the game works',
    howDev:
      'Development: on your turn, propose a technology from your hand. The others will vote on it.',
    howVote:
      'Vote: when someone proposes a technology, everyone votes Yes or No. Each vote affects your scores.',
    howDilemma:
      'Dilemmas: sometimes you face ethical dilemmas that change your scores. Choose carefully.',
  },
  milestones: {
    'milestone-tech-pioneer': {
      name: 'Technology pioneer',
      description: 'Reach 30 Technology points to show your skill at innovation.',
      abilityName: 'Technology support',
      abilityDescription: 'Technologies you play get +15% parliamentary approval.',
    },
    'milestone-ethics-guardian': {
      name: 'Ethics guardian',
      description: 'Reach 25 Ethics points to show your commitment to responsibility.',
      abilityName: 'Ethical protection',
      abilityDescription: 'You are protected from the negative effects of ethical global events.',
    },
    'milestone-balanced-leader': {
      name: 'Balanced leader',
      description: 'Keep a Technology/Ethics balance above 0.6 to show equilibrium.',
      abilityName: 'Perfect synergy',
      abilityDescription:
        'When you play a balanced technology (similar tech and ethics), you gain +50% Neuralforming points.',
    },
    'milestone-neuralforming-25': {
      name: 'Neuralforming innovator',
      description: 'Reach 25 Neuralforming points to show significant progress.',
      abilityName: 'Parliamentary initiative',
      abilityDescription: 'At the start of each turn you automatically draw an extra technology card.',
    },
    'milestone-neuralforming-40': {
      name: 'Neuralforming master',
      description: 'Reach 40 Neuralforming points to become a recognised leader.',
      abilityName: 'Parliamentary exemption',
      abilityDescription:
        'Once per game you may skip a dilemma and still receive half the Neuralforming points.',
    },
    'milestone-technologies-3': {
      name: 'Expert developer',
      description: 'Develop at least 3 technologies to show your capacity to innovate.',
      abilityName: 'Technology coalition',
      abilityDescription:
        'Technology parties are more likely to vote for your bills (+10% approval).',
    },
  },
  events: {
    'crisis-ethical': {
      title: 'Public ethics crisis',
      description: 'An ethics scandal hits the AI being built. Citizens lose trust in the project.',
    },
    'breakthrough-tech': {
      title: 'Technological breakthrough',
      description: 'A scientific discovery speeds up AI development for every party.',
    },
    'public-opinion-swing': {
      title: 'Public opinion shift',
      description: 'Public opinion swings toward a more balanced approach. Balanced parties gain support.',
    },
    'tech-oversight': {
      title: 'Call for tighter oversight',
      description: 'Parliament demands more transparency and ethical oversight of AI.',
    },
  },
  dashboard: {
    title: 'AI dashboard',
    techPct: 'Technology %',
    ethicsPct: 'Ethics %',
    balanceLabel: 'Ethics / Technology balance',
    turn: 'Turn',
  },
  ticker: {
    label: 'News',
  },
  roster: {
    title: 'Players',
    inGame: 'in play',
    turn: 'Turn',
    skip: 'Skip',
    disconnected: 'Offline',
    aiOpponents: 'AI opponents',
  },
};

export const GAME: Record<Locale, GameCopy> = { it, en };

export function gameT(locale?: Locale) {
  return GAME[locale ?? 'it'] ?? GAME.it;
}
