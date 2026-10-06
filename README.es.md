> Traducción comunitaria (borrador) — Política P2-002 de NTARI, Difusión Multilingüe Global. Fuente: README.md (original en inglés, instantánea del 2026-10-05). Borrador comunitario asistido por máquina, pendiente de revisión por el mantenedor regional según P2-002 §3.1. Las especificaciones técnicas centrales permanecen en inglés según §2.2.
>
> ¿Encontraste un error en esta traducción? Tu corrección es una contribución
> bienvenida y valorada: haz un fork del repositorio y abre un pull request en
> https://github.com/NTARI-RAND/agrinet-docs.

# Sitio web

Este sitio web está construido con [Docusaurus](https://docusaurus.io/), un generador moderno de sitios web estáticos.

## Instalación

```bash
yarn
```

## Desarrollo local

```bash
yarn start
```

Este comando inicia un servidor de desarrollo local y abre una ventana del navegador. La mayoría de los cambios se reflejan en vivo sin necesidad de reiniciar el servidor.

## Compilación

```bash
yarn build
```

Este comando genera contenido estático en el directorio `build`, que puede servirse con cualquier servicio de alojamiento de contenido estático.

## Despliegue

Usando SSH:

```bash
USE_SSH=true yarn deploy
```

Sin usar SSH:

```bash
GIT_USER=<Your GitHub username> yarn deploy
```

Si usas GitHub Pages para el alojamiento, este comando es una forma práctica de compilar el sitio web y publicarlo (push) en la rama `gh-pages`.

## Configuración de la búsqueda

El sitio incluye una búsqueda local de la documentación que funciona sin ningún servicio externo, de modo que el desarrollo local y los despliegues de vista previa siempre incluyen una barra de búsqueda funcional. Cuando hay credenciales reales de Algolia DocSearch, cambiamos automáticamente a Algolia. Ask AI ahora se configura por separado, así que puedes habilitar la búsqueda de Algolia sin Ask AI, o viceversa, según las credenciales que proporciones. La experiencia impulsada por Algolia adopta un activador en forma de píldora inspirado en React.dev, con una insignia dedicada de Ask AI, para que los visitantes descubran de inmediato cuándo hay respuestas conversacionales disponibles.

Crea un archivo `.env` (o exporta las variables en tu shell) con los siguientes valores para habilitar la búsqueda de Algolia y Ask AI:

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

Define las variables de Ask AI solo cuando tu aplicación de DocSearch esté configurada para esa experiencia; de lo contrario, pueden dejarse sin definir. Sin esas variables, el sitio sigue usando la búsqueda local de la documentación incluida (o Algolia, si se proporcionan esas credenciales) sin intentar activar Ask AI. Cuando están presentes tanto las credenciales de Algolia como un asistente de Ask AI, la configuración conecta automáticamente el asistente con DocSearch para que el modal pueda mostrar el panel conversacional, igual que en la experiencia de React.dev. Dejar vacíos los campos de Ask AI mientras se siguen proporcionando credenciales de Algolia produce la interfaz tradicional solo con DocSearch.
