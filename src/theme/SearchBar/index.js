import React, {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import clsx from "clsx";
import { createPortal } from "react-dom";
import Head from "@docusaurus/Head";
import Link from "@docusaurus/Link";
import { useHistory } from "@docusaurus/router";
import Translate, { translate } from "@docusaurus/Translate";
import useDocusaurusContext from "@docusaurus/useDocusaurusContext";
import { DocSearchButton } from "@docsearch/react/button";
import { useDocSearchKeyboardEvents } from "@docsearch/react/useDocSearchKeyboardEvents";
import { useAllDocsData } from "@docusaurus/plugin-content-docs/client";
import {
  isRegexpStringMatch,
  useSearchLinkCreator,
} from "@docusaurus/theme-common";
import {
  mergeFacetFilters,
  useAlgoliaAskAi,
  useAlgoliaContextualFacetFilters,
  useSearchResultUrlProcessor,
} from "@docusaurus/theme-search-algolia/client";
import translations from "@theme/SearchTranslations";

import styles from "./styles.module.css";

let DocSearchModal = null;

function importDocSearchModalIfNeeded() {
  if (DocSearchModal) {
    return Promise.resolve();
  }

  return Promise.all([
    import("@docsearch/react/modal"),
    import("@docsearch/react/style"),
    import("./styles.modal.css"),
  ]).then(([{ DocSearchModal: Modal }]) => {
    DocSearchModal = Modal;
  });
}

function useNavigator({ externalUrlRegex }) {
  const history = useHistory();
  const [navigator] = useState(() => ({
    navigate({ itemUrl }) {
      if (isRegexpStringMatch(externalUrlRegex, itemUrl)) {
        window.location.href = itemUrl;
      } else {
        history.push(itemUrl);
      }
    },
  }));

  return navigator;
}

function useTransformSearchClient() {
  const {
    siteMetadata: { docusaurusVersion },
  } = useDocusaurusContext();

  return useCallback((searchClient) => {
    searchClient.addAlgoliaAgent("docusaurus", docusaurusVersion);
    return searchClient;
  }, [docusaurusVersion]);
}

function useTransformItems({ transformItems }) {
  const processSearchResultUrl = useSearchResultUrlProcessor();
  const [transformer] = useState(() => (items) =>
    transformItems
      ? transformItems(items)
      : items.map((item) => ({
          ...item,
          url: processSearchResultUrl(item.url),
        })),
  );

  return transformer;
}

function useResultsFooterComponent({ closeModal }) {
  return useMemo(
    () =>
      ({ state }) => (
        <ResultsFooter state={state} onClose={closeModal} />
      ),
    [closeModal],
  );
}

function Hit({ hit, children }) {
  return <Link to={hit.url}>{children}</Link>;
}

function ResultsFooter({ state, onClose }) {
  const createSearchLink = useSearchLinkCreator();

  return (
    <Link to={createSearchLink(state.query)} onClick={onClose}>
      <Translate id="theme.SearchBar.seeAll" values={{ count: state.context.nbHits }}>
        {"See all {count} results"}
      </Translate>
    </Link>
  );
}

function useSearchParameters({ contextualSearch, searchParameters }) {
  const contextualSearchFacetFilters = useAlgoliaContextualFacetFilters();
  const configFacetFilters = searchParameters?.facetFilters ?? [];

  const facetFilters = contextualSearch
    ? mergeFacetFilters(contextualSearchFacetFilters, configFacetFilters)
    : configFacetFilters;

  return {
    ...searchParameters,
    facetFilters,
  };
}

function SearchIcon(props) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
      {...props}
    >
      <circle cx="11" cy="11" r="7" />
      <line x1="20" y1="20" x2="16.65" y2="16.65" />
    </svg>
  );
}

function createDocIndex(allDocsData) {
  return Object.values(allDocsData ?? {}).flatMap((pluginData) =>
    pluginData.versions.flatMap((version) =>
      version.docs.map((doc) => {
        const description = doc.description || doc.frontMatter?.description || "";
        const keywords = Array.isArray(doc.keywords) ? doc.keywords : [];
        const fallbackTitle =
          doc.title ??
          doc.frontMatter?.title ??
          doc.frontMatter?.sidebar_label ??
          doc.sidebar_label ??
          doc.id ??
          "";
        const title = typeof fallbackTitle === "string" ? fallbackTitle : String(fallbackTitle);

        return {
          id: doc.id,
          title,
          description,
          permalink: doc.permalink,
          searchText: `${title} ${description} ${keywords.join(" ")}`.toLowerCase(),
        };
      }),
    ),
  );
}

function useDocsIndex() {
  const allDocsData = useAllDocsData();
  return useMemo(() => createDocIndex(allDocsData), [allDocsData]);
}

function AlgoliaSearchBar({ config, className, ...rest }) {
  const navigator = useNavigator({ externalUrlRegex: config.externalUrlRegex });
  const searchParameters = useSearchParameters({
    contextualSearch: config.contextualSearch,
    searchParameters: config.searchParameters,
  });
  const transformItems = useTransformItems(config);
  const transformSearchClient = useTransformSearchClient();

  const askAiConfig = config.askAi;

  const searchContainer = useRef(null);
  const searchButtonRef = useRef(null);
  const [isOpen, setIsOpen] = useState(false);
  const [initialQuery, setInitialQuery] = useState(undefined);

  const {
    extraAskAiProps,
    currentPlaceholder,
    isAskAiActive,
    onAskAiToggle,
  } = useAlgoliaAskAi({
    indexName: config.indexName,
    apiKey: config.apiKey,
    appId: config.appId,
    placeholder: config.placeholder,
    translations: config.translations,
    searchParameters: config.searchParameters,
    askAi: askAiConfig,
  });

  const askAiEnabled = Boolean(askAiConfig);

  const prepareSearchContainer = useCallback(() => {
    if (!searchContainer.current) {
      const div = document.createElement("div");
      searchContainer.current = div;
      document.body.insertBefore(div, document.body.firstChild);
    }
  }, []);

  const openModal = useCallback(() => {
    prepareSearchContainer();
    importDocSearchModalIfNeeded().then(() => setIsOpen(true));
  }, [prepareSearchContainer]);

  const closeModal = useCallback(() => {
    setIsOpen(false);
    searchButtonRef.current?.focus();
    setInitialQuery(undefined);
    if (onAskAiToggle) {
      onAskAiToggle(false);
    }
  }, [onAskAiToggle]);

  const handleInput = useCallback((event) => {
    if (event.key === "f" && (event.metaKey || event.ctrlKey)) {
      return;
    }

    event.preventDefault();
    setInitialQuery(event.key);
    openModal();
  }, [openModal]);

  const resultsFooterComponent = useResultsFooterComponent({ closeModal });

  useDocSearchKeyboardEvents({
    isOpen,
    onOpen: openModal,
    onClose: closeModal,
    onInput: handleInput,
    searchButtonRef,
    isAskAiActive: isAskAiActive ?? false,
    onAskAiToggle: onAskAiToggle ?? (() => {}),
  });

  useEffect(() => {
    if (!isOpen) {
      return undefined;
    }

    const onKeyDown = (event) => {
      if (event.key === "/") {
        event.preventDefault();
        searchButtonRef.current?.click();
      }
    };

    document.addEventListener("keydown", onKeyDown);
    return () => document.removeEventListener("keydown", onKeyDown);
  }, [isOpen]);

  const askAiBadgeLabel = translate({
    id: "theme.SearchBar.askAiBadgeLabel",
    message: "Ask AI",
    description: "Label for the Ask AI badge displayed next to the search trigger",
  });

  return (
    <div className={clsx(styles.searchWrapper, className)} {...rest}>
      <Head>
        <link
          rel="preconnect"
          href={`https://${config.appId}-dsn.algolia.net`}
          crossOrigin="anonymous"
        />
      </Head>

      <div className={clsx(styles.algoliaButtonWrapper, {
        [styles.algoliaButtonWithBadge]: askAiEnabled,
      })}>
        <DocSearchButton
          className={styles.algoliaButton}
          onTouchStart={importDocSearchModalIfNeeded}
          onFocus={importDocSearchModalIfNeeded}
          onMouseOver={importDocSearchModalIfNeeded}
          onClick={openModal}
          ref={searchButtonRef}
          translations={config.translations?.button ?? translations.button}
        />
        {askAiEnabled && (
          <span className={styles.askAiBadge} aria-hidden="true">
            {askAiBadgeLabel}
          </span>
        )}
      </div>

      {isOpen && DocSearchModal && searchContainer.current &&
        createPortal(
          <DocSearchModal
            {...config}
            onClose={closeModal}
            initialScrollY={window.scrollY}
            initialQuery={initialQuery}
            navigator={navigator}
            transformItems={transformItems}
            hitComponent={Hit}
            transformSearchClient={transformSearchClient}
            {...(config.searchPagePath && {
              resultsFooterComponent,
            })}
            placeholder={currentPlaceholder || config.placeholder}
            translations={config.translations?.modal ?? translations.modal}
            searchParameters={searchParameters}
            {...extraAskAiProps}
          />,
          searchContainer.current,
        )}
    </div>
  );
}

function LocalSearchBar({ className, ...rest }) {
  const documents = useDocsIndex();
  const [query, setQuery] = useState("");
  const [isOpen, setIsOpen] = useState(false);
  const [highlightedIndex, setHighlightedIndex] = useState(0);
  const history = useHistory();
  const containerRef = useRef(null);

  const normalizedQuery = query.trim().toLowerCase();

  const results = useMemo(() => {
    if (!normalizedQuery) {
      return [];
    }

    const terms = normalizedQuery.split(/\s+/).filter(Boolean);

    return documents
      .map((doc) => {
        if (!terms.every((term) => doc.searchText.includes(term))) {
          return null;
        }

        const titleIndex = doc.title.toLowerCase().indexOf(terms[0]);

        return {
          ...doc,
          weight: titleIndex === -1 ? Number.MAX_SAFE_INTEGER : titleIndex,
        };
      })
      .filter(Boolean)
      .sort((a, b) => a.weight - b.weight)
      .slice(0, 8);
  }, [documents, normalizedQuery]);

  useEffect(() => {
    setHighlightedIndex(0);
  }, [normalizedQuery, results.length]);

  useEffect(() => {
    if (!isOpen) {
      return undefined;
    }

    function handleClickOutside(event) {
      if (containerRef.current && !containerRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    }

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [isOpen]);

  const placeholder = translate({
    id: "theme.SearchBar.placeholder",
    message: "Search documentation",
    description: "Placeholder for the local search input",
  });

  const emptyMessage = translate({
    id: "theme.SearchBar.noResults",
    message: "No matching documents",
    description: "Message shown when the local search has no results",
  });

  const showResults = isOpen && Boolean(normalizedQuery);

  const handleSubmit = (event) => {
    event.preventDefault();

    if (results.length === 0) {
      return;
    }

    history.push(results[Math.min(highlightedIndex, results.length - 1)].permalink);
    setIsOpen(false);
    setQuery("");
  };

  const handleKeyDown = (event) => {
    if (event.key === "ArrowDown" && results.length > 0) {
      event.preventDefault();
      setHighlightedIndex((index) => (index + 1) % results.length);
    } else if (event.key === "ArrowUp" && results.length > 0) {
      event.preventDefault();
      setHighlightedIndex((index) => (index - 1 + results.length) % results.length);
    } else if (event.key === "Escape") {
      setIsOpen(false);
      event.currentTarget.blur();
    }
  };

  return (
    <div
      ref={containerRef}
      className={clsx(styles.searchWrapper, styles.localSearch, className)}
      {...rest}
    >
      <form role="search" className={styles.localForm} onSubmit={handleSubmit}>
        <SearchIcon className={styles.localIcon} />
        <input
          type="search"
          className={styles.localInput}
          value={query}
          placeholder={placeholder}
          aria-label={placeholder}
          onChange={(event) => {
            setQuery(event.target.value);
            if (!isOpen) {
              setIsOpen(true);
            }
          }}
          onFocus={() => setIsOpen(true)}
          onKeyDown={handleKeyDown}
        />
        <kbd className={styles.shortcut}>/</kbd>
      </form>
      {showResults && (
        <ul className={styles.results} role="listbox">
          {results.length > 0 ? (
            results.map((result, index) => (
              <li key={result.permalink} role="option" aria-selected={index === highlightedIndex}>
                <Link
                  to={result.permalink}
                  className={clsx(styles.resultLink, {
                    [styles.resultLinkActive]: index === highlightedIndex,
                  })}
                  onMouseEnter={() => setHighlightedIndex(index)}
                  onClick={() => {
                    setIsOpen(false);
                    setQuery("");
                  }}
                >
                  <span className={styles.resultTitle}>{result.title}</span>
                  {result.description && (
                    <span className={styles.resultDescription}>{result.description}</span>
                  )}
                </Link>
              </li>
            ))
          ) : (
            <li className={styles.empty} role="option" aria-selected="false">
              {emptyMessage}
            </li>
          )}
        </ul>
      )}
    </div>
  );
}

export default function SearchBar(props) {
  const {
    siteConfig: { themeConfig },
  } = useDocusaurusContext();

  if (themeConfig?.algolia) {
    return (
      <AlgoliaSearchBar config={themeConfig.algolia} {...props} />
    );
  }

  return <LocalSearchBar {...props} />;
}
