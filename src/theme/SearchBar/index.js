import React, { useEffect, useMemo, useRef, useState } from "react";
import clsx from "clsx";
import Link from "@docusaurus/Link";
import { useHistory } from "@docusaurus/router";
import useDocusaurusContext from "@docusaurus/useDocusaurusContext";
import { translate } from "@docusaurus/Translate";
import { useAllDocsData } from "@docusaurus/plugin-content-docs/client";
import OriginalSearchBar from "@theme-original/SearchBar";

import styles from "./styles.module.css";

function createDocIndex(allDocsData) {
  return Object.values(allDocsData ?? {}).flatMap((pluginData) =>
    pluginData.versions.flatMap((version) =>
      version.docs.map((doc) => {
        const description = doc.description || doc.frontMatter?.description || "";
        const keywords = Array.isArray(doc.keywords) ? doc.keywords : [];

        return {
          id: doc.id,
          title: doc.title,
          description,
          permalink: doc.permalink,
          searchText: `${doc.title} ${description} ${keywords.join(" ")}`.toLowerCase(),
        };
      }),
    ),
  );
}

function useDocsIndex() {
  const allDocsData = useAllDocsData();

  return useMemo(() => createDocIndex(allDocsData), [allDocsData]);
}

function LocalSearchBar(props) {
  const { className, ...rest } = props;
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
      className={clsx("navbar__item", "navbar__search", styles.searchBar, className)}
      {...rest}
    >
      <form role="search" className={styles.form} onSubmit={handleSubmit}>
        <input
          type="search"
          className={clsx("navbar__search-input", styles.input)}
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
    return <OriginalSearchBar {...props} />;
  }

  return <LocalSearchBar {...props} />;
}
