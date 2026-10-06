> Traduction communautaire (brouillon) — politique NTARI P2-002, Diffusion
> multilingue mondiale. Source : README.md (original anglais, instantané du
> 2026-10-05). Brouillon communautaire assisté par machine, en attente de
> relecture par le mainteneur régional conformément au P2-002 §3.1. Les
> spécifications techniques de base restent en anglais conformément au §2.2.
>
> Vous avez remarqué une erreur de traduction ? N'hésitez pas à la corriger
> vous-même : forkez le dépôt https://github.com/NTARI-RAND/agrinet-docs et ouvrez
> une pull request. Les corrections de traduction sont des contributions
> précieuses, tout autant que le code.

# Site web

Ce site web est construit avec [Docusaurus](https://docusaurus.io/), un générateur moderne de sites web statiques.

## Installation

```bash
yarn
```

## Développement local

```bash
yarn start
```

Cette commande démarre un serveur de développement local et ouvre une fenêtre de navigateur. La plupart des modifications sont prises en compte en direct, sans qu'il soit nécessaire de redémarrer le serveur.

## Construction

```bash
yarn build
```

Cette commande génère le contenu statique dans le répertoire `build`, qui peut ensuite être servi par n'importe quel service d'hébergement de contenu statique.

## Déploiement

Avec SSH :

```bash
USE_SSH=true yarn deploy
```

Sans SSH :

```bash
GIT_USER=<Your GitHub username> yarn deploy
```

Si vous utilisez GitHub Pages pour l'hébergement, cette commande est un moyen pratique de construire le site web et de le pousser vers la branche `gh-pages`.

## Configuration de la recherche

Le site intègre une recherche locale dans la documentation qui fonctionne sans aucun service externe, de sorte que le développement local et les déploiements de prévisualisation disposent toujours d'une barre de recherche fonctionnelle. Lorsque de véritables identifiants Algolia DocSearch sont présents, nous basculons automatiquement vers Algolia. Ask AI est désormais configuré séparément : vous pouvez donc activer la recherche Algolia sans Ask AI, ou inversement, selon les identifiants que vous fournissez. L'expérience propulsée par Algolia adopte un déclencheur en forme de pilule inspiré de React.dev, avec un badge Ask AI dédié, afin que les visiteurs découvrent immédiatement quand des réponses conversationnelles sont disponibles.

Créez un fichier `.env` (ou exportez les variables dans votre shell) avec les valeurs suivantes pour activer la recherche Algolia et Ask AI :

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

Ne définissez les variables Ask AI que si votre application DocSearch est configurée pour cette expérience ; sinon, elles peuvent rester non définies. Sans ces variables, le site continue d'utiliser la recherche locale intégrée dans la documentation (ou Algolia, si ces identifiants sont fournis) sans tenter d'activer Ask AI. Lorsque les identifiants Algolia et un assistant Ask AI sont tous deux présents, la configuration connecte automatiquement l'assistant à DocSearch, afin que la fenêtre modale puisse afficher le panneau conversationnel, exactement comme dans l'expérience React.dev. Laisser les champs Ask AI vides tout en fournissant des identifiants Algolia produit l'interface traditionnelle limitée à DocSearch.
