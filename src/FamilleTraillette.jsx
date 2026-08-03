import { useState, useEffect } from "react";

/* ------------------------------------------------------------------
   Famille Traillette — site vitrine
   React + Tailwind, sans backend.
   Données clans : API publique ClashKing (api.clashk.ing), sans token.
   Si l'appel échoue, on retombe sur les données statiques ci-dessous.
------------------------------------------------------------------- */

const DISCORD_URL = "https://discord.gg/cJykBJSvu";
const CLASHKING = "https://api.clashk.ing";

// Logo fourni par le client. Place le fichier dans /public et garde ce chemin,
// ou remplace par une URL absolue. Si l'image ne charge pas, l'emblème SVG
// de secours plus bas prend le relais.
const LOGO_URL = "/logo-traillette.webp";

const MEMBRES_MAX = 50;

// L'API renvoie les ligues de guerre en anglais : on les repasse en français
// pour rester cohérent avec le reste du site.
const LIGUES = {
  Unranked: "Non classé",
  Bronze: "Bronze",
  Silver: "Argent",
  Gold: "Or",
  Crystal: "Cristal",
  Master: "Maître",
  Champion: "Champion",
  Titan: "Titan",
  Legend: "Légende",
};

const traduireLigue = (nom) =>
  nom
    ? nom
        .replace(/\bLeague\b/, "")
        .replace(/\b\w+\b/, (mot) => LIGUES[mot] ?? mot)
        .replace(/\s+/g, " ")
        .trim()
    : null;

// Chaque clan porte son propre thème : la couleur d'accent colore la carte
// (badge, bordure, halo) et une phrase d'accroche lui donne sa personnalité.
// Modifier `slogan`, `emoji` et `emojiEnd` suffit à changer le ton d'un clan.
const CLANS = [
  {
    tag: "2CQ08LYJ8",
    name: "MamieTraillette",
    rank: "Clan 1",
    thLabel: "Hdv 15 et +",
    thMin: 15,
    thMax: 18,
    accent: "violet",
    emoji: "👵",
    emojiEnd: "⚔️",
    slogan: "On attaque avec sagesse, on gagne avec panache !",
    pitch:
      "Réservé aux joueurs expérimentés. Guerres haut niveau, ligue légendes, compétitivité au rendez-vous.",
    stats: { ligue: "Légendes", guerres: "Toujours", type: "Compétitif" },
  },
  {
    tag: "2CU0P0RGQ",
    name: "PapiTraillette",
    rank: "Clan 2",
    thLabel: "Hdv 3 à 14",
    thMin: 3,
    thMax: 14,
    accent: "blue",
    emoji: "👴",
    emojiEnd: "📈",
    slogan: "On grimpe les Hdv à notre rythme, et on lâche rien !",
    pitch:
      "Pour progresser à son rythme. Entraide, dons et conseils pour monter en puissance et passer au niveau supérieur.",
    stats: { ligue: "Or à Titan", guerres: "Régulières", type: "Progression" },
  },
  {
    tag: "2RVYUPRUU",
    name: "Ehpad Élite",
    rank: "Clan 3",
    thLabel: "Tous Hdv",
    thMin: 1,
    thMax: 18,
    accent: "green",
    emoji: "💀",
    emojiEnd: "🎉",
    slogan: "Ici on joue pour le fun… et on écrase quand même !",
    pitch:
      "Ouvert à tous les Hôtels de Ville. Détente, événements, fun et entraide, sans prise de tête.",
    stats: { ligue: "Libre", guerres: "Farm / Fun", type: "Détente" },
  },
];

const VALEURS = [
  {
    titre: "Esprit de famille",
    texte: "Entraide, respect et bonne humeur sont nos valeurs principales.",
    icon: "shield",
  },
  {
    titre: "Dons & événements",
    texte: "Des dons constants et des événements réguliers pour tous.",
    icon: "gift",
  },
  {
    titre: "Progression",
    texte: "Trois clans adaptés à chaque niveau pour progresser sereinement.",
    icon: "chart",
  },
  {
    titre: "Communauté active",
    texte: "Une communauté vivante sur Discord pour ne rien manquer.",
    icon: "chat",
  },
];

const ETAPES = [
  {
    n: "01",
    titre: "Rejoins le Discord",
    texte: "Tout se passe sur le serveur. C'est la porte d'entrée de la famille.",
  },
  {
    n: "02",
    titre: "Ouvre un ticket",
    texte: "Un salon privé s'ouvre entre toi et le staff. Personne d'autre ne le voit.",
  },
  {
    n: "03",
    titre: "Présente-toi",
    texte: "Ton prénom, ton âge, et depuis combien de temps tu joues à Clash of Clans.",
  },
  {
    n: "04",
    titre: "Envoie tes screens",
    texte: "Une capture de ton village et une de ton profil. Le staff te place dans le bon clan.",
  },
];

/* ---------------------------- Icônes ---------------------------- */

const Icon = ({ name, className = "", ...rest }) => {
  const paths = {
    shield: "M12 2l8 3.5v6c0 5-3.4 9.2-8 10.5-4.6-1.3-8-5.5-8-10.5v-6L12 2z",
    gift: "M20 8h-3.2a3 3 0 10-4.8-3.4A3 3 0 007.2 8H4v4h16V8zM5 13h14v8H5v-8z",
    chart: "M4 20V10m5 10V4m5 16v-7m5 7V7",
    chat: "M4 5h16v10H9l-5 4V5z",
  };
  return (
    <svg
      viewBox="0 0 24 24"
      className={className}
      fill={name === "chart" ? "none" : "currentColor"}
      stroke="currentColor"
      strokeWidth={name === "chart" ? 2 : 0}
      strokeLinecap="round"
      aria-hidden="true"
      {...rest}
    >
      <path d={paths[name]} />
    </svg>
  );
};

const DiscordMark = ({ className = "" }) => (
  <svg viewBox="0 0 24 18" className={className} fill="currentColor" aria-hidden="true">
    <path d="M20.3 1.6A18 18 0 0015.9.3l-.3.5a15 15 0 00-7.2 0L8.1.3A18 18 0 003.7 1.6C.9 5.8.1 9.9.5 14a18.2 18.2 0 005.5 2.8l1.2-1.9a11.7 11.7 0 01-1.9-.9l.5-.4a12.9 12.9 0 0012.4 0l.5.4c-.6.4-1.2.7-1.9.9l1.2 1.9A18.2 18.2 0 0023.5 14c.5-4.8-.8-8.8-3.2-12.4zM8.3 11.6c-1.1 0-2-1-2-2.3s.9-2.3 2-2.3 2 1 2 2.3-.9 2.3-2 2.3zm7.4 0c-1.1 0-2-1-2-2.3s.9-2.3 2-2.3 2 1 2 2.3-.9 2.3-2 2.3z" />
  </svg>
);

/* Emblème de secours si le logo ne charge pas */
const CrestFallback = ({ className = "", id = "a" }) => (
  <svg viewBox="0 0 120 140" className={className} aria-hidden="true">
    <defs>
      <linearGradient id={`g-${id}`} x1="0" y1="0" x2="0" y2="1">
        <stop offset="0%" stopColor="#FBD87A" />
        <stop offset="52%" stopColor="#F0B429" />
        <stop offset="100%" stopColor="#9A6D0F" />
      </linearGradient>
    </defs>
    <path d="M60 4l52 18v46c0 34-22 58-52 68C30 126 8 102 8 68V22L60 4z" fill={`url(#g-${id})`} />
    <path d="M60 15l42 15v38c0 28-18 47-42 56-24-9-42-28-42-56V30l42-15z" fill="#33194F" />
    <path d="M36 44h48v14H67v46H53V58H36V44z" fill={`url(#g-${id})`} />
  </svg>
);

/* Logo du clan — image fournie, repli SVG si elle échoue */
const Crest = ({ className = "", id = "a", priority = false }) => {
  const [failed, setFailed] = useState(false);
  if (failed) return <CrestFallback className={className} id={id} />;
  return (
    <img
      src={LOGO_URL}
      alt=""
      width={640}
      height={640}
      className={`rounded-full ${className}`}
      onError={() => setFailed(true)}
      loading={priority ? "eager" : "lazy"}
      fetchPriority={priority ? "high" : "auto"}
      decoding="async"
      aria-hidden="true"
    />
  );
};

/* ---------------------------- Données ---------------------------- */

function useClanData() {
  const [live, setLive] = useState({});

  useEffect(() => {
    let cancelled = false;
    // Sans limite de temps, une API lente laisserait les requêtes en suspens :
    // les données statiques suffisent à afficher le site.
    const ctrl = new AbortController();
    const timer = setTimeout(() => ctrl.abort(), 8000);

    Promise.all(
      CLANS.map((c) =>
        fetch(`${CLASHKING}/v1/clans/%23${c.tag}`, { signal: ctrl.signal })
          .then((r) => (r.ok ? r.json() : null))
          .catch(() => null)
      )
    ).then((res) => {
      clearTimeout(timer);
      if (cancelled) return;
      const out = {};
      res.forEach((d, i) => {
        if (d && d.name) {
          out[CLANS[i].tag] = {
            level: d.clanLevel,
            members: d.members,
            badge: d.badgeUrls?.medium,
            warLeague: traduireLigue(d.warLeague?.name),
          };
        }
      });
      setLive(out);
    });

    return () => {
      cancelled = true;
      clearTimeout(timer);
      ctrl.abort();
    };
  }, []);

  return live;
}

/* Copie dans le presse-papiers avec retour visuel temporaire.
   navigator.clipboard est absent hors contexte sécurisé : on ne suppose
   ni sa présence, ni la réussite de l'écriture. */
function useCopie(texte) {
  const [copie, setCopie] = useState(false);

  useEffect(() => {
    if (!copie) return;
    const t = setTimeout(() => setCopie(false), 2000);
    return () => clearTimeout(t);
  }, [copie]);

  const copier = async () => {
    try {
      await navigator.clipboard.writeText(texte);
      setCopie(true);
      return true;
    } catch {
      return false;
    }
  };

  return [copie, copier];
}

/* ---------------------------- Sections ---------------------------- */

const LIENS_NAV = [
  ["Accueil", "#accueil"],
  ["Nos clans", "#clans"],
  ["Recrutement", "#recrutement"],
];

const Nav = () => {
  // Le public vient surtout du mobile : sans ce menu, les liens de section
  // seraient inaccessibles sous le point de rupture md.
  const [open, setOpen] = useState(false);

  return (
    <header
      className="sticky top-0 z-40 border-b ft-line"
      style={{ background: "rgba(18,14,28,.82)", backdropFilter: "blur(10px)" }}
    >
      <div className="mx-auto flex max-w-6xl items-center justify-between gap-3 px-5 py-3">
        <a href="#accueil" className="ft-nav flex items-center gap-3">
          <Crest className="h-9 w-auto" id="nav" priority />
          <span className="ft-display leading-none text-lg">
            <span className="block">FAMILLE</span>
            <span className="block ft-gold">TRAILLETTE</span>
          </span>
        </a>

        <nav className="hidden items-center gap-7 md:flex">
          {LIENS_NAV.map(([label, href]) => (
            <a key={href} href={href} className="ft-nav ft-label text-sm ft-muted hover:text-white">
              {label}
            </a>
          ))}
        </nav>

        <div className="flex items-center gap-2">
          <a
            href={DISCORD_URL}
            target="_blank"
            rel="noreferrer"
            className="ft-btn ft-discord ft-label flex items-center gap-2 rounded-lg px-4 py-2 text-sm text-white"
          >
            <DiscordMark className="h-4 w-auto" />
            <span className="hidden sm:inline">Rejoindre le Discord</span>
            <span className="sm:hidden">Discord</span>
          </a>

          <button
            type="button"
            onClick={() => setOpen((v) => !v)}
            className="ft-nav ft-panel2 ft-line rounded-lg border p-2 md:hidden"
            aria-expanded={open}
            aria-controls="menu-mobile"
            aria-label={open ? "Fermer le menu" : "Ouvrir le menu"}
          >
            <svg viewBox="0 0 24 24" className="h-5 w-5" stroke="currentColor" strokeWidth="2" fill="none" strokeLinecap="round" aria-hidden="true">
              {open ? <path d="M6 6l12 12M18 6L6 18" /> : <path d="M4 7h16M4 12h16M4 17h16" />}
            </svg>
          </button>
        </div>
      </div>

      {open && (
        <nav id="menu-mobile" className="border-t ft-line px-5 py-3 md:hidden">
          {LIENS_NAV.map(([label, href]) => (
            <a
              key={href}
              href={href}
              onClick={() => setOpen(false)}
              className="ft-nav ft-label block py-3 text-sm ft-muted hover:text-white"
            >
              {label}
            </a>
          ))}
        </nav>
      )}
    </header>
  );
};

const Hero = () => (
  <section id="accueil" className="ft-hero-bg relative overflow-hidden">
    <div className="relative mx-auto grid max-w-6xl items-center gap-10 px-5 py-20 md:min-h-136 md:grid-cols-5 md:py-28">
      <div className="md:col-span-3">
        <p className="ft-label mb-4 text-sm" style={{ color: "var(--violet)" }}>
          Bienvenue dans la
        </p>
        <h1 className="ft-display text-5xl leading-none sm:text-6xl md:text-7xl">
          <span className="block">FAMILLE</span>
          <span className="block ft-gold">TRAILLETTE</span>
        </h1>
        <p className="ft-muted mt-6 max-w-md text-lg leading-relaxed">
          Trois clans, une même famille. Une communauté soudée, active et
          passionnée par Clash of Clans.
        </p>
        <div className="mt-9 flex flex-wrap gap-3">
          <a
            href={DISCORD_URL}
            target="_blank"
            rel="noreferrer"
            className="ft-btn ft-discord ft-label flex items-center gap-2 rounded-lg px-6 py-3 text-white"
          >
            <DiscordMark className="h-4 w-auto" />
            Rejoindre le Discord
          </a>
          <a href="#clans" className="ft-btn ft-ghost ft-label rounded-lg px-6 py-3">
            Découvrir nos clans
          </a>
        </div>
      </div>
      {/* Les deux colonnes de droite restent vides : c'est là que
          l'illustration de fond (château et troupes) doit rester visible. */}
    </div>
  </section>
);

/* Tag du clan : les joueurs le copient pour retrouver le clan dans le jeu. */
const TagClan = ({ tag }) => {
  const [copie, copier] = useCopie(`#${tag}`);
  return (
    <button
      type="button"
      onClick={copier}
      aria-label={`Copier le tag du clan #${tag}`}
      className="ft-nav ft-tag ft-label ft-panel2 ft-line mx-auto mt-3 flex items-center gap-2 rounded-md border px-3 py-1.5 text-xs"
    >
      <span className="ft-gold">#{tag}</span>
      <span className="ft-muted">{copie ? "Copié" : "Copier"}</span>
    </button>
  );
};

/* Places disponibles : l'argument de recrutement le plus concret. */
const Places = ({ membres }) => {
  const libres = MEMBRES_MAX - membres;
  const complet = libres <= 0;
  return (
    <p className="ft-label mt-4 text-center text-xs">
      <span className={complet ? "ft-muted" : "ft-gold"}>
        {complet ? "Clan complet" : `${libres} place${libres > 1 ? "s" : ""} disponible${libres > 1 ? "s" : ""}`}
      </span>
      <span className="ft-muted"> · {membres}/{MEMBRES_MAX} membres</span>
    </p>
  );
};

const ClanCard = ({ clan, live, selected }) => {
  const on = selected !== null && selected >= clan.thMin && selected <= clan.thMax;
  const dim = selected !== null && !on;
  const d = live[clan.tag];

  return (
    <article
      className="ft-card ft-panel relative rounded-2xl p-6"
      data-on={on}
      data-dim={dim}
      style={{
        "--accent": `var(--${clan.accent})`,
        ...(on ? { borderColor: `var(--${clan.accent})`, boxShadow: `0 18px 40px -22px var(--${clan.accent})` } : {}),
      }}
    >
      <span
        className="ft-label absolute -top-3 left-6 rounded px-2 py-1 text-xs"
        style={{ background: `var(--${clan.accent})`, color: "#140E22" }}
      >
        {clan.rank}
      </span>

      <div className="ft-crest-halo flex h-20 items-center justify-center">
        {d?.badge ? (
          <img src={d.badge} alt="" width={200} height={200} loading="lazy" decoding="async" className="relative z-10 h-20 w-20" />
        ) : (
          <span className="ft-display relative z-10 text-4xl" style={{ color: `var(--${clan.accent})` }}>
            {clan.thLabel.replace("Hdv ", "")}
          </span>
        )}
      </div>

      <h3 className="ft-display mt-4 text-center text-2xl">{clan.name}</h3>
      <p className="ft-label mt-1 text-center text-sm" style={{ color: `var(--${clan.accent})` }}>
        {clan.thLabel}
      </p>

      {clan.slogan && (
        <p className="ft-bulle mx-auto mt-4 max-w-xs rounded-xl px-4 py-2.5 text-center text-sm italic leading-snug">
          {clan.emoji && <span className="not-italic">{clan.emoji} </span>}
          <span style={{ color: `var(--${clan.accent})` }}>{clan.slogan}</span>
          {clan.emojiEnd && <span className="not-italic"> {clan.emojiEnd}</span>}
        </p>
      )}

      <TagClan tag={clan.tag} />

      <p className="ft-muted mt-4 text-center text-sm leading-relaxed">{clan.pitch}</p>

      <div className="ft-sep my-5" />

      <dl className="grid grid-cols-3 gap-2 text-center">
        {[
          ["Ligue", d?.warLeague || clan.stats.ligue],
          ["Guerres", clan.stats.guerres],
          ["Type", clan.stats.type],
        ].map(([k, v]) => (
          <div key={k}>
            <dt className="ft-label ft-muted text-xs">{k}</dt>
            <dd className="mt-1 text-sm font-medium">{v}</dd>
          </div>
        ))}
      </dl>

      {d && <Places membres={d.members} />}
    </article>
  );
};

const Clans = () => {
  const live = useClanData();
  const [selected, setSelected] = useState(null);
  const levels = Array.from({ length: 18 }, (_, i) => i + 1);

  return (
    <section id="clans" className="mx-auto max-w-6xl px-5 py-20">
      <h2 className="ft-display text-center text-3xl md:text-4xl">NOS CLANS</h2>
      <p className="ft-muted mt-2 text-center">
        Trois clans pour tous les niveaux d'Hôtel de Ville.
      </p>

      <div className="ft-panel mt-10 rounded-2xl p-5">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <p className="ft-label text-sm">Ton Hôtel de Ville</p>
          {selected !== null && (
            <button
              onClick={() => setSelected(null)}
              className="ft-label ft-muted text-xs hover:text-white"
            >
              Tout afficher
            </button>
          )}
        </div>
        <div className="mt-4 flex flex-wrap gap-2">
          {levels.map((n) => (
            <button
              key={n}
              onClick={() => setSelected(selected === n ? null : n)}
              data-on={selected === n}
              aria-pressed={selected === n}
              aria-label={`Hôtel de ville niveau ${n}`}
              className="ft-th ft-label ft-panel2 h-9 w-9 rounded-md border text-sm ft-line"
            >
              {n}
            </button>
          ))}
        </div>
        <p className="ft-muted mt-4 text-sm" aria-live="polite">
          {selected === null
            ? "Choisis ton niveau pour voir quel clan t'accueille."
            : `Hdv ${selected} — ${CLANS.filter((c) => selected >= c.thMin && selected <= c.thMax)
                .map((c) => c.name)
                .join(" et ")} t'attendent.`}
        </p>
      </div>

      <div className="mt-10 grid gap-6 md:grid-cols-3">
        {CLANS.map((c) => (
          <ClanCard key={c.tag} clan={c} live={live} selected={selected} />
        ))}
      </div>
    </section>
  );
};

const Valeurs = () => (
  <section className="mx-auto max-w-6xl px-5 pb-20">
    <div className="ft-panel rounded-2xl px-6 py-12">
      <h2 className="ft-display text-center text-2xl md:text-3xl">
        CE QUI NOUS RASSEMBLE
      </h2>
      <div className="mt-10 grid gap-8 sm:grid-cols-2 lg:grid-cols-4">
        {VALEURS.map((v) => (
          <div key={v.titre} className="text-center">
            <Icon name={v.icon} className="mx-auto h-9 w-9" style={{ color: "var(--violet)" }} />
            <h3 className="ft-label mt-4 text-sm" style={{ color: "var(--violet)" }}>
              {v.titre}
            </h3>
            <p className="ft-muted mt-2 text-sm leading-relaxed">{v.texte}</p>
          </div>
        ))}
      </div>
    </div>
  </section>
);

const Recrutement = () => {
  const [copied, copier] = useCopie(DISCORD_URL);

  // Si le presse-papiers est indisponible, on ouvre directement l'invitation.
  const copy = async () => {
    if (!(await copier())) window.open(DISCORD_URL, "_blank", "noreferrer");
  };

  return (
    <section id="recrutement" className="mx-auto max-w-6xl px-5 pb-20">
      <h2 className="ft-display text-center text-3xl md:text-4xl">REJOINDRE LA FAMILLE</h2>
      <p className="ft-muted mx-auto mt-2 max-w-lg text-center">
        Quatre étapes, dix minutes. Le staff te répond directement dans ton ticket.
      </p>

      <ol className="mt-12 grid gap-6 md:grid-cols-4">
        {ETAPES.map((e) => (
          <li key={e.n} className="ft-panel relative rounded-2xl p-6 pt-8">
            <span className="ft-display absolute -top-4 left-6 text-3xl" style={{ color: "var(--gold-dim)" }}>
              {e.n}
            </span>
            <h3 className="ft-display text-lg">{e.titre}</h3>
            <p className="ft-muted mt-2 text-sm leading-relaxed">{e.texte}</p>
          </li>
        ))}
      </ol>

      <div className="ft-panel mt-10 flex flex-col items-center gap-6 rounded-2xl p-8 md:flex-row md:justify-between">
        <div className="flex items-center gap-5">
          <span
            className="flex h-16 w-16 shrink-0 items-center justify-center rounded-2xl text-white"
            style={{ background: "var(--blurple)" }}
          >
            <DiscordMark className="h-8 w-auto" />
          </span>
          <div>
            <h3 className="ft-display text-xl" style={{ color: "var(--violet)" }}>
              Toute la famille t'attend sur Discord
            </h3>
            <p className="ft-muted mt-1 text-sm">
              Échanges, entraide, annonces, recrutement et bien plus encore.
            </p>
          </div>
        </div>
        <div className="flex w-full shrink-0 flex-col gap-2 md:w-auto">
          <a
            href={DISCORD_URL}
            target="_blank"
            rel="noreferrer"
            className="ft-btn ft-discord ft-label flex items-center justify-center gap-2 rounded-lg px-6 py-3 text-white"
          >
            <DiscordMark className="h-4 w-auto" />
            Rejoindre le Discord
          </a>
          <button
            type="button"
            onClick={copy}
            aria-label="Copier le lien du Discord"
            className="ft-nav ft-panel2 ft-line flex items-center justify-between gap-3 rounded-lg border px-4 py-2 text-sm"
          >
            <span className="ft-muted truncate">{DISCORD_URL.replace("https://", "")}</span>
            <span className="ft-label shrink-0 text-xs ft-gold">
              {copied ? "Copié" : "Copier"}
            </span>
          </button>
        </div>
      </div>
    </section>
  );
};

const Footer = () => (
  <footer className="border-t ft-line" style={{ background: "#0D0A16" }}>
    <div className="mx-auto grid max-w-6xl gap-10 px-5 py-14 md:grid-cols-4">
      <div>
        <div className="flex items-center gap-3">
          <Crest className="h-9 w-auto" id="foot" />
          <span className="ft-display leading-none">
            <span className="block">FAMILLE</span>
            <span className="block ft-gold">TRAILLETTE</span>
          </span>
        </div>
        <p className="ft-muted mt-4 text-sm">
          Trois clans, une seule famille. Ensemble, plus forts.
        </p>
      </div>

      <div>
        <h4 className="ft-label text-sm">Liens</h4>
        <ul className="ft-muted mt-4 space-y-2 text-sm">
          <li><a href="#accueil" className="hover:text-white">Accueil</a></li>
          <li><a href="#clans" className="hover:text-white">Nos clans</a></li>
          <li><a href="#recrutement" className="hover:text-white">Recrutement</a></li>
        </ul>
      </div>

      <div>
        <h4 className="ft-label text-sm">Informations</h4>
        <ul className="ft-muted mt-4 space-y-2 text-sm">
          <li>Jeu : Clash of Clans</li>
          <li>Plateforme : Mobile</li>
          <li>Langue : Français</li>
          <li>Communauté : Mondiale</li>
        </ul>
      </div>

      <div>
        <h4 className="ft-label text-sm">Nous suivre</h4>
        <a
          href={DISCORD_URL}
          target="_blank"
          rel="noreferrer"
          className="ft-btn mt-4 inline-flex h-11 w-11 items-center justify-center rounded-lg text-white"
          style={{ background: "var(--blurple)" }}
          aria-label="Discord"
        >
          <DiscordMark className="h-5 w-auto" />
        </a>
      </div>
    </div>

    <div className="ft-muted border-t ft-line px-5 py-6 text-center text-xs leading-relaxed">
      <p>
        Données de clan fournies par{" "}
        <a href="https://clashk.ing" target="_blank" rel="noreferrer" className="ft-gold hover:underline">
          ClashKing
        </a>
        .
      </p>
      <p className="mt-2">
        Ce site n'est ni affilié, ni approuvé, ni sponsorisé par Supercell. Clash of
        Clans est une marque de Supercell. Contenu créé dans le cadre de la Fan
        Content Policy de Supercell.
      </p>
      <p className="mt-3">© {new Date().getFullYear()} Famille Traillette</p>
      <p className="mt-2">
        Made with <span style={{ color: "var(--gold)" }} aria-label="amour">♥</span> by{" "}
        <a
          href="https://www.romain-pinsolle.fr/"
          target="_blank"
          rel="noreferrer"
          className="ft-gold hover:underline"
        >
          Romain Pinsolle
        </a>
      </p>
    </div>
  </footer>
);

/* ---------------------------- App ---------------------------- */

export default function FamilleTraillette() {
  return (
    <div className="ft min-h-screen">
      <a href="#clans" className="ft-skip ft-label">
        Aller au contenu
      </a>
      <Nav />
      <main id="contenu">
        <Hero />
        <Clans />
        <Valeurs />
        <Recrutement />
      </main>
      <Footer />
    </div>
  );
}
