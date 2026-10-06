> Tradução comunitária (rascunho) — política P2-002 da NTARI, Transmissão Multilíngue Global. Fonte: README.md (original em inglês, snapshot de 2026-10-05). Rascunho comunitário assistido por máquina, pendente de revisão do mantenedor regional conforme P2-002 §3.1. As especificações técnicas centrais permanecem em inglês conforme §2.2.
>
> Notou algum erro nesta tradução? Correções de tradução são contribuições
> valiosas e muito bem-vindas: faça um fork do repositório e abra um pull
> request em https://github.com/NTARI-RAND/agrinet-docs.

# Site

Este site é construído com o [Docusaurus](https://docusaurus.io/), um gerador moderno de sites estáticos.

## Instalação

```bash
yarn
```

## Desenvolvimento local

```bash
yarn start
```

Este comando inicia um servidor de desenvolvimento local e abre uma janela do navegador. A maioria das alterações é refletida ao vivo, sem necessidade de reiniciar o servidor.

## Build

```bash
yarn build
```

Este comando gera conteúdo estático no diretório `build`, que pode ser servido por qualquer serviço de hospedagem de conteúdo estático.

## Implantação

Usando SSH:

```bash
USE_SSH=true yarn deploy
```

Sem usar SSH:

```bash
GIT_USER=<Your GitHub username> yarn deploy
```

Se você usa o GitHub Pages para hospedagem, este comando é uma forma prática de construir o site e enviá-lo (push) para o branch `gh-pages`.

## Configuração da busca

O site inclui uma busca local na documentação que funciona sem nenhum serviço externo, de modo que o desenvolvimento local e as implantações de pré-visualização sempre contam com uma barra de busca funcional. Quando credenciais reais do Algolia DocSearch estão presentes, passamos automaticamente a usar o Algolia. O Ask AI agora é configurado separadamente, para que você possa ativar a busca do Algolia sem o Ask AI ou vice-versa, conforme as credenciais que fornecer. A experiência baseada no Algolia adota um acionador em formato de pílula inspirado no React.dev, com um selo dedicado do Ask AI, para que os visitantes descubram imediatamente quando respostas conversacionais estão disponíveis.

Crie um arquivo `.env` (ou exporte as variáveis no seu shell) com os seguintes valores para ativar a busca do Algolia e o Ask AI:

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

Defina as variáveis do Ask AI somente quando a sua aplicação DocSearch estiver configurada para essa experiência; caso contrário, elas podem ficar sem definição. Sem as variáveis, o site continua usando a busca local embutida na documentação (ou o Algolia, se essas credenciais forem fornecidas), sem tentar ativar o Ask AI. Quando tanto as credenciais do Algolia quanto um assistente do Ask AI estão presentes, a configuração conecta automaticamente o assistente ao DocSearch, para que o modal possa exibir o painel conversacional, exatamente como na experiência do React.dev. Deixar os campos do Ask AI vazios e, ainda assim, fornecer as credenciais do Algolia resulta na interface tradicional somente com o DocSearch.
