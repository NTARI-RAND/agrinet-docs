# lipu linluwi

> **toki pona:** lipu ni li lipu lili pi kulupu, tan nasin NTARI "P2-002". lipu
> ale li lipu "README.md" pi toki Inli (tenpo pi sitelen: 2026-10-05). ilo sona
> li pali e lipu ni, la kulupu o lukin o pona e ona, tan nasin "P2-002" kipisi
> nanpa 3.1.
>
> **English:** This is a condensed community rendering under NTARI policy
> P2-002. The complete document is the English original README.md (snapshot
> 2026-10-05). Machine-assisted draft pending community review per P2-002
> section 3.1.
>
> sina lukin e pakala lon toki ni la o pona e ona: o pali e "fork" lon
> https://github.com/NTARI-RAND/agrinet-docs, o pana e "pull request". pana sina li
> pona tawa mi mute.

lipu linluwi ni li kama kepeken [ilo "Docusaurus"](https://docusaurus.io/). ilo ni li ilo sin. ona li pali e lipu linluwi pi ante ala.

## o pana e ilo

```bash
yarn
```

## pali lon ilo sina

```bash
yarn start
```

toki wawa ni li open e ilo pana lon ilo sina, li open e lupa pi ilo lukin linluwi. ante mute li kama lon lukin lon tenpo sama. sina wile ala open sin e ilo pana.

## o pali e lipu

```bash
yarn build
```

toki wawa ni li pali e lipu pi ante ala lon poki `build`. ilo pana ale pi lipu pi ante ala li ken pana e ona.

## o pana e lipu tawa linluwi

kepeken nasin "SSH":

```bash
USE_SSH=true yarn deploy
```

kepeken ala nasin "SSH":

```bash
GIT_USER=<Your GitHub username> yarn deploy
```

sina kepeken ilo "GitHub Pages" tawa pana lipu la, toki wawa ni li nasin pona: ona li pali e lipu linluwi, li pana e ona tawa linja `gh-pages`.

## nasin pi ilo alasa

lipu linluwi li jo e ilo alasa lipu lon ilo sina. ilo ni li wile ala e ilo ante tan ma ante. tan ni la, pali lon ilo sina en lipu lukin pi tenpo lili li jo e linja alasa pona lon tenpo ale. sona open lon pi ilo "Algolia DocSearch" li lon la, mi mute li ante tawa ilo "Algolia". ilo li pali e ni kepeken wile ona. lon tenpo ni la, jan li pana e nasin pi ilo "Ask AI" lon poka ante. tan ni la, sina ken open e alasa "Algolia" taso, anu ilo "Ask AI" taso. ni li tan sona open pi pana sina. lukin pi ilo "Algolia" li kepeken nena sike, tan lukin pi nasin "React.dev". nena ni li jo e sitelen lili "Ask AI" pi ona taso. tan ni la jan lukin li sona lon tenpo sama e ni: ilo li ken toki sama jan, li ken pana e toki pi pana sona.

o pali e lipu `.env` (anu o pana e ijo ante ni lon ilo pi toki wawa sina) kepeken nanpa ni, tawa open pi alasa "Algolia" en ilo "Ask AI":

```bash
ALGOLIA_APP_ID="..."
ALGOLIA_API_KEY="..."          # Search-only API key
ALGOLIA_INDEX_NAME="..."

# Optional Ask AI configuration
ALGOLIA_ASSISTANT_ID="..."     # Algolia Ask AI assistant identifier

# Optional overrides if your Ask AI integration uses a dedicated application or index
# ALGOLIA_AI_APP_ID="..."
# ALGOLIA_AI_API_KEY="..."
# ALGOLIA_AI_INDEX_NAME="..."
```

sina o pana e ijo ante pi ilo "Ask AI" lon tenpo ni taso: ilo "DocSearch" sina li jo e nasin tawa lukin ni. ante la sina ken pana ala e ona. ijo ante ni li lon ala la, lipu linluwi li awen kepeken ilo alasa lipu lon ilo sina (anu ilo "Algolia", sina pana e sona open ona la), li alasa ala open e ilo "Ask AI". sona open pi ilo "Algolia" en ilo pali "Ask AI" li lon la, nasin li wan e ilo pali tawa ilo "DocSearch" kepeken wile ona. tan ni la, lupa lili li ken pana e kipisi pi toki sama jan, sama lukin pi nasin "React.dev". sina pana e sona open pi ilo "Algolia", taso sina pana ala e ijo "Ask AI" la, ilo li pana e lukin "DocSearch" taso pi tenpo pini.
