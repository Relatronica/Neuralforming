import type { Locale } from './locale';
import seo from '../../config/seo.config.json';

export type LandingCopy = {
  metaTitle: string;
  metaDescription: string;
  nav: {
    why: string;
    about: string;
    how: string;
    use: string;
    faq: string;
    roadmap: string;
    donate: string;
    playNow: string;
    guide: string;
    contact: string;
    menu: string;
  };
  hero: {
    badge: string;
    titleLead: string;
    titleAccent: string;
    lead: string;
    playMulti: string;
    donate: string;
    players: string;
    dilemmas: string;
    openSource: string;
    scrollDown: string;
  };
  why: {
    kicker: string;
    title: string;
    lead: string;
    quote: string;
    politicalTitle: string;
    politicalDesc: string;
    gameTitle: string;
    gameDesc: string;
    youthTitle: string;
    youthDesc: string;
    closerBefore: string;
    closerNo: string;
    closerYes: string;
    closerAnd: string;
    closerDepends: string;
    closerAfter: string;
  };
  about: {
    kicker: string;
    title: string;
    objectiveLabel: string;
    objective: string;
    body1: string;
    body2Before: string;
    tech: string;
    ethics: string;
    neural: string;
    body2After: string;
    readGuide: string;
    techTitle: string;
    techDesc: string;
    ethicsTitle: string;
    ethicsDesc: string;
    neuralTitle: string;
    neuralDesc: string;
    secretsTitle: string;
    secretsDesc: string;
  };
  how: {
    kicker: string;
    title: string;
    lead: string;
    phase: string;
    p1Title: string;
    p1Desc: string;
    p2Title: string;
    p2Desc: string;
    p3Title: string;
    p3Desc: string;
    p4Title: string;
    p4Desc: string;
  };
  use: {
    kicker: string;
    title: string;
    lead: string;
    recommended: string;
    classTitle: string;
    classDesc: string;
    classBullet1: string;
    classBullet2: string;
    classCta: string;
    soloBadge: string;
    soloTitle: string;
    soloDesc: string;
    soloBullet1: string;
    soloBullet2: string;
    soloCta: string;
    selfTitle: string;
    selfDesc: string;
    selfBullet1: string;
    selfBullet2: string;
    selfCta: string;
  };
  faq: {
    kicker: string;
    title: string;
    lead: string;
    items: { q: string; a: string }[];
  };
  roadmap: {
    kicker: string;
    title: string;
    lead: string;
    now: string;
    next: string;
    later: string;
    nowItems: string[];
    nextItems: string[];
    laterItems: string[];
  };
  cta: {
    title: string;
    lead: string;
    createRoom: string;
    guide: string;
    contact: string;
  };
  footer: {
    guide: string;
    contact: string;
    donate: string;
    by: string;
  };
  modal: {
    close: string;
    title: string;
    badge: string;
    body: string;
    tryDemo: string;
    requestInstance: string;
    selfHost: string;
    footnote: string;
  };
};

const it: LandingCopy = {
  metaTitle: 'Neuralforming — Un gioco per governare l’IA',
  metaDescription:
    'Neuralforming è un gioco: un parlamento in miniatura per dibattere e votare la governance dell’IA. Per classi, workshop e collettivi.',
  nav: {
    why: 'Perché',
    about: 'Il Gioco',
    how: 'Funziona',
    use: 'Utilizzo',
    faq: 'FAQ',
    roadmap: 'Roadmap',
    donate: 'Dona',
    playNow: 'Gioca Ora',
    guide: 'Guida al Gioco',
    contact: 'Contatti',
    menu: 'Menu',
  },
  hero: {
    badge: 'GIOCO · GOVERNANCE DELL’IA',
    titleLead: 'Un gioco per governare l’IA.',
    titleAccent: 'Si dibatte. Si vota.',
    lead: 'Neuralforming è un parlamento in miniatura. Ogni giocatore è un partito: propone tecnologie, affronta dilemmi etici e porta le proprie leggi al voto. Classi, workshop, collettivi: si impara a governare una tecnologia che già riscrive diritti, lavoro e vita pubblica.',
    playMulti: 'Gioca in Multiplayer',
    donate: 'Dona',
    players: 'Giocatori realtime',
    dilemmas: 'Dilemmi etici',
    openSource: 'Open source',
    scrollDown: 'Scorri verso il basso',
  },
  why: {
    kicker: 'Il manifesto',
    title: 'Perché un gioco, e perché adesso',
    lead: 'L’intelligenza artificiale decide già chi viene assunto, cosa vediamo, come si insegna, chi viene sorvegliato. Chi cresce dentro questa infrastruttura deve imparare a discuterla, altrimenti la governerà qualcun altro — in silenzio.',
    quote: '«Il futuro è un voto.»',
    politicalTitle: 'Perché l’IA è politica',
    politicalDesc:
      'Ogni algoritmo incorpora valori: efficienza o equità, sicurezza o libertà, profitto o cura. Sono scelte. Neuralforming le rende visibili e votabili.',
    gameTitle: 'Perché è un gioco',
    gameDesc:
      'L’attivismo ha bisogno di palestre. Un gioco costringe a prendere posizione, a perdere, a allearsi. È pratica democratica: si impara al tavolo di un voto.',
    youthTitle: 'Perché i giovani',
    youthDesc:
      'Sono la generazione che vivrà più a lungo con queste macchine. Coinvolgerli è farli entrare nelle decisioni che formeranno il loro spazio pubblico. Chi si allena a decidere oggi sarà pronto a governare.',
    closerBefore:
      'Neuralforming esiste perché il potere sull’IA va esercitato in pubblico. Una classe che vota una legge sull’automazione, un workshop che dibatte la sorveglianza: sono già atti civici. Il gioco è lo strumento. L’obiettivo è una generazione che sa dire',
    closerNo: 'no',
    closerYes: 'sì',
    closerAnd: 'e',
    closerDepends: 'dipende',
    closerAfter: '— con argomenti.',
  },
  about: {
    kicker: 'Obiettivo',
    title: 'Cos’è Neuralforming?',
    objectiveLabel: 'L’obiettivo del gioco',
    objective:
      'Completa il tuo obiettivo segreto di partito formando un’IA all’avanguardia e eticamente accettabile. Se la tecnologia galoppa e l’etica resta indietro, la società perde — anche se i tuoi punteggi tecnici sono alti.',
    body1:
      'Lo strumento è un gioco strategico: ogni giocatore è un partito politico che guida lo sviluppo dell’Intelligenza Artificiale. A ogni turno proponi una tecnologia, affronti un dilemma morale e sottoponi le tue scelte al voto parlamentare degli altri.',
    body2Before: 'Tre indicatori raccontano la tua IA:',
    tech: 'Tecnologia',
    ethics: 'Etica',
    neural: 'Neuralforming',
    body2After: '— il punteggio che nasce solo quando progresso e responsabilità avanzano insieme.',
    readGuide: 'Leggi la guida completa',
    techTitle: 'Punti Tecnologia',
    techDesc: 'Fai avanzare la ricerca con leggi e prototipi all’avanguardia',
    ethicsTitle: 'Punti Etica',
    ethicsDesc: 'Difendi trasparenza, diritti e impatto sociale delle tue scelte',
    neuralTitle: 'Neuralforming',
    neuralDesc: 'Il bilanciamento tra progresso ed etica: il vero punteggio del gioco',
    secretsTitle: 'Obiettivi segreti',
    secretsDesc: 'Ogni partito ha una missione unica: chi la completa per primo vince',
  },
  how: {
    kicker: 'Le meccaniche',
    title: 'Come Funziona',
    lead: 'Ogni turno ha quattro fasi: strategia, dilemmi, diplomazia e conseguenze. È lo stesso ciclo che userai in classe o nel playground.',
    phase: 'Fase',
    p1Title: 'Sviluppo tecnologico',
    p1Desc: 'Gioca una carta tecnologia dalla tua mano e proponila al parlamento per l’approvazione.',
    p2Title: 'Dilemma etico',
    p2Desc: 'Affronta uno scenario ispirato a problemi reali e scegli tra opzioni con effetti diversi.',
    p3Title: 'Voto parlamentare',
    p3Desc: 'Le proposte vanno al voto: allearsi, bloccare o mediare cambia i punteggi di tutti.',
    p4Title: 'Conseguenze',
    p4Desc: 'Notizie, eventi globali e milestone rendono visibile l’impatto a lungo termine.',
  },
  use: {
    kicker: 'Come usarlo',
    title: 'Come puoi utilizzarlo',
    lead: 'Tre modi, stesso gioco: in classe, da solo per allenarti, o sul tuo server.',
    recommended: 'Consigliato',
    classTitle: 'In classe, multiplayer',
    classDesc:
      'Trasforma la classe in un parlamento. Un computer è il tabellone; ogni studente entra dal telefono, dibatte e vota.',
    classBullet1: 'Master + 2–5 smartphone',
    classBullet2: 'Dibattito e voto parlamentare',
    classCta: 'Avvia stanza cloud',
    soloBadge: '1 giocatore',
    soloTitle: 'Playground singolo',
    soloDesc:
      'Allena le meccaniche da solo: l’opinione pubblica sostituisce il parlamento e reagisce alle tue leggi. Ideale per docenti e per chi arriva in classe già pronto.',
    soloBullet1: 'Difficoltà adattiva, max 15 turni',
    soloBullet2: 'Stesso mazzo di dilemmi e tecnologie',
    soloCta: 'Prova il playground',
    selfTitle: 'Sul tuo server',
    selfDesc:
      'Codice libero, Docker o Node.js. Per università, eventi e reti scolastiche che vogliono controllo, privacy e zero dipendenza dal cloud demo.',
    selfBullet1: 'Licenza AGPL-3.0',
    selfBullet2: 'Personalizzabile (mazzi, testi, regole)',
    selfCta: 'Repository GitHub',
  },
  faq: {
    kicker: 'Domande',
    title: 'FAQ',
    lead: 'Quello che di solito chiedono docenti, organizzatori e chi vuole self-hostare.',
    items: seo.faqIt,
  },
  roadmap: {
    kicker: 'Dove stiamo andando',
    title: 'Roadmap',
    lead: 'Neuralforming è un progetto vivo. Questa è la direzione di lavoro.',
    now: 'Ora',
    next: 'Prossimo',
    later: 'Oltre',
    nowItems: [
      'Multiplayer 2–5 con tabellone master e player su smartphone',
      'Playground singolo con opinione pubblica',
      'Dilemmi, tecnologie, parlamento e PWA',
      'Guida in-app e codice AGPL-3.0',
      'Demo cloud sperimentale',
    ],
    nextItems: [
      'Nuovi mazzi di dilemmi e tecnologie',
      'Report di sessione per docenti',
      'Inglese su gioco, guida e contatti',
      'Istanza cloud più stabile per le classi',
      'UX player più chiara su mobile',
    ],
    laterItems: [
      'Dashboard docente e scenari per materia',
      'Versione ibrida da tavolo (carte stampabili)',
      'Contributi della community sui mazzi',
      'Workshop e kit per eventi civici',
    ],
  },
  cta: {
    title: 'Apri un parlamento. Oggi.',
    lead: 'Una classe, un workshop, un collettivo: il primo atto è votare. Se credi che questo strumento debba restare libero e senza pubblicità, sostienilo.',
    createRoom: 'Crea stanza multiplayer',
    guide: 'Guida al gioco',
    contact: 'Contatti',
  },
  footer: {
    guide: 'Guida',
    contact: 'Contatti',
    donate: 'Dona',
    by: 'Un progetto di',
  },
  modal: {
    close: 'Chiudi',
    title: 'Stato del server cloud',
    badge: 'Demo / condivisa',
    body: 'Il server cloud gratuito è in fase sperimentale e gira su risorse condivise. Con molte sessioni contemporanee possono esserci rallentamenti o disconnessioni.',
    tryDemo: 'Prova la demo cloud',
    requestInstance: 'Richiedi un’istanza stabile',
    selfHost: 'Self-host da GitHub',
    footnote: 'Per eventi accademici o istituzionali è meglio il self-hosting o una stanza dedicata.',
  },
};

const en: LandingCopy = {
  metaTitle: 'Neuralforming — A game for governing AI',
  metaDescription:
    'Neuralforming is a game: a miniature parliament for debating and voting on AI governance. For classrooms, workshops and collectives.',
  nav: {
    why: 'Why',
    about: 'The Game',
    how: 'How',
    use: 'Use it',
    faq: 'FAQ',
    roadmap: 'Roadmap',
    donate: 'Donate',
    playNow: 'Play now',
    guide: 'Game guide',
    contact: 'Contact',
    menu: 'Menu',
  },
  hero: {
    badge: 'GAME · AI GOVERNANCE',
    titleLead: 'A game for governing AI.',
    titleAccent: 'You debate. You vote.',
    lead: 'Neuralforming is a miniature parliament. Each player is a party: you propose technologies, face ethical dilemmas and take your bills to a vote. Classrooms, workshops, collectives: you learn to govern a technology that is already rewriting rights, work and public life.',
    playMulti: 'Play multiplayer',
    donate: 'Donate',
    players: 'Realtime players',
    dilemmas: 'Ethical dilemmas',
    openSource: 'Open source',
    scrollDown: 'Scroll down',
  },
  why: {
    kicker: 'The manifesto',
    title: 'Why a game, and why now',
    lead: 'Artificial intelligence already decides who gets hired, what we see, how we teach, who is watched. The generation growing up inside this infrastructure needs to learn to argue with it, or someone else will govern it — quietly.',
    quote: '“The future is a vote.”',
    politicalTitle: 'Why AI is political',
    politicalDesc:
      'Every algorithm encodes values: efficiency or equity, security or freedom, profit or care. These are choices. Neuralforming makes them visible — and votable.',
    gameTitle: 'Why a game',
    gameDesc:
      'Activism needs training grounds. A game forces you to take a side, to lose, to form alliances. It is democratic practice: you learn at the table of a vote.',
    youthTitle: 'Why young people',
    youthDesc:
      'They are the generation that will live longest with these machines. Involving them means bringing them into the decisions that will shape their public space. Whoever trains in deciding today will be ready to govern.',
    closerBefore:
      'Neuralforming exists because power over AI belongs in public. A class voting on an automation bill, a workshop debating surveillance: those are already civic acts. The game is the tool. The aim is a generation that can say',
    closerNo: 'no',
    closerYes: 'yes',
    closerAnd: 'and',
    closerDepends: 'it depends',
    closerAfter: '— with arguments.',
  },
  about: {
    kicker: 'Objective',
    title: 'What is Neuralforming?',
    objectiveLabel: 'The aim of the game',
    objective:
      'Complete your secret party objective by shaping an AI that is both cutting-edge and ethically acceptable. If technology races ahead and ethics lag behind, society loses — even if your tech scores are high.',
    body1:
      'The instrument is a strategy game: each player is a political party steering the development of artificial intelligence. Each turn you propose a technology, face a moral dilemma and submit your choices to a parliamentary vote.',
    body2Before: 'Three indicators describe your AI:',
    tech: 'Technology',
    ethics: 'Ethics',
    neural: 'Neuralforming',
    body2After: '— the score that only rises when progress and responsibility move together.',
    readGuide: 'Read the full guide',
    techTitle: 'Technology points',
    techDesc: 'Advance research with cutting-edge laws and prototypes',
    ethicsTitle: 'Ethics points',
    ethicsDesc: 'Defend transparency, rights and the social impact of your choices',
    neuralTitle: 'Neuralforming',
    neuralDesc: 'The balance of progress and ethics: the real score of the game',
    secretsTitle: 'Secret objectives',
    secretsDesc: 'Each party has a unique mission: the first to complete it wins',
  },
  how: {
    kicker: 'The mechanics',
    title: 'How it works',
    lead: 'Every turn has four phases: strategy, dilemmas, diplomacy and consequences. It is the same cycle you will use in class or in the playground.',
    phase: 'Phase',
    p1Title: 'Technological development',
    p1Desc: 'Play a technology card from your hand and propose it to parliament for approval.',
    p2Title: 'Ethical dilemma',
    p2Desc: 'Face a scenario inspired by real problems and choose among options with different effects.',
    p3Title: 'Parliamentary vote',
    p3Desc: 'Proposals go to a vote: allying, blocking or mediating changes everyone’s scores.',
    p4Title: 'Consequences',
    p4Desc: 'News, global events and milestones make the long-term impact visible.',
  },
  use: {
    kicker: 'How to use it',
    title: 'How you can use it',
    lead: 'Three ways, one game: in class, alone to practise, or on your own server.',
    recommended: 'Recommended',
    classTitle: 'In class, multiplayer',
    classDesc:
      'Turn the classroom into a parliament. One computer is the board; each student joins from their phone, debates and votes.',
    classBullet1: 'Master + 2–5 phones',
    classBullet2: 'Debate and parliamentary vote',
    classCta: 'Start a cloud room',
    soloBadge: '1 player',
    soloTitle: 'Single-player playground',
    soloDesc:
      'Train the mechanics alone: public opinion replaces parliament and reacts to your laws. Ideal for teachers and anyone arriving in class already prepared.',
    soloBullet1: 'Adaptive difficulty, max 15 turns',
    soloBullet2: 'Same deck of dilemmas and technologies',
    soloCta: 'Try the playground',
    selfTitle: 'On your server',
    selfDesc:
      'Free code, Docker or Node.js. For universities, events and school networks that want control, privacy and zero dependence on the demo cloud.',
    selfBullet1: 'AGPL-3.0 licence',
    selfBullet2: 'Customisable (decks, copy, rules)',
    selfCta: 'GitHub repository',
  },
  faq: {
    kicker: 'Questions',
    title: 'FAQ',
    lead: 'What teachers, organisers and people who want to self-host usually ask.',
    items: [
      {
        q: 'Do I need an account or to register?',
        a: 'No. Open a room, share the QR code or the link, and players join from their phones. No login, no profiling data.',
      },
      {
        q: 'How many players and which devices?',
        a: 'Multiplayer is designed for 2–5 players. You need a master device (computer or tablet) showing the board and parliament, plus each player’s smartphone. The single-player playground is played alone on one screen.',
      },
      {
        q: 'How long is a game?',
        a: 'A class session usually lasts 45–90 minutes, depending on how much time you give to debate. The single-player playground is faster and ends in at most 15 turns.',
      },
      {
        q: 'Is the cloud stable enough for a lesson?',
        a: 'The public instance is an experimental demo on shared resources: with many rooms at once it can slow down. For a lesson or an event it is better to self-host or request a dedicated instance from the Contact page.',
      },
      {
        q: 'Can I use it offline or on a school network?',
        a: 'Yes. The project is open source (AGPL-3.0): you can install it locally or on a school server with Node.js or Docker. The code and instructions are on the GitHub repository.',
      },
      {
        q: 'Why a game on AI?',
        a: 'Governance is learned by deciding, losing a vote, negotiating with people who disagree. The game is the political device. A course can come after.',
      },
      {
        q: 'What age or subject is it for?',
        a: 'It works well in high schools, universities and civic workshops on AI ethics, civic education, computer science and philosophy. You play through debate and voting, including if you cannot code.',
      },
      {
        q: 'How can I support the project?',
        a: 'Neuralforming is free and has no ads. You can donate on Buy Me a Coffee, write from the Contact page (bugs, workshops, contributions) or open an issue on GitHub.',
      },
    ],
  },
  roadmap: {
    kicker: 'Where we are going',
    title: 'Roadmap',
    lead: 'Neuralforming is a living project. This is the working direction.',
    now: 'Now',
    next: 'Next',
    later: 'Beyond',
    nowItems: [
      '2–5 multiplayer with master board and players on phones',
      'Single-player playground with public opinion',
      'Dilemmas, technologies, parliament and PWA',
      'In-app guide and AGPL-3.0 code',
      'Experimental cloud demo',
    ],
    nextItems: [
      'New decks of dilemmas and technologies',
      'Session reports for teachers',
      'English for the game, guide and contact form',
      'A more stable cloud instance for classes',
      'Clearer player UX on mobile',
    ],
    laterItems: [
      'Teacher dashboard and subject scenarios',
      'Hybrid tabletop version (printable cards)',
      'Community contributions to the decks',
      'Workshops and kits for civic events',
    ],
  },
  cta: {
    title: 'Open a parliament. Today.',
    lead: 'A class, a workshop, a collective: the first act is to vote. If you believe this tool should stay free and without ads, support it.',
    createRoom: 'Create a multiplayer room',
    guide: 'Game guide',
    contact: 'Contact',
  },
  footer: {
    guide: 'Guide',
    contact: 'Contact',
    donate: 'Donate',
    by: 'A project by',
  },
  modal: {
    close: 'Close',
    title: 'Cloud server status',
    badge: 'Demo / shared',
    body: 'The free cloud server is experimental and runs on shared resources. With many concurrent sessions there can be slowdowns or disconnects.',
    tryDemo: 'Try the cloud demo',
    requestInstance: 'Request a stable instance',
    selfHost: 'Self-host from GitHub',
    footnote: 'For academic or institutional events, self-hosting or a dedicated room is better.',
  },
};

export const LANDING: Record<Locale, LandingCopy> = { it, en };
