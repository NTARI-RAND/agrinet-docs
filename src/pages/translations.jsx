import React from "react";
import Layout from "@theme/Layout";
import Translate, { translate } from "@docusaurus/Translate";
import useBaseUrl from "@docusaurus/useBaseUrl";
import useDocusaurusContext from "@docusaurus/useDocusaurusContext";
import clsx from "clsx";
import styles from "./translations.module.css";

const fullTranslations = [
  {
    language: "French",
    nativeName: "Français",
    locale: "fr",
  },
  {
    language: "Japanese",
    nativeName: "日本語",
    locale: "ja",
  },
  {
    language: "Korean",
    nativeName: "한국어",
    locale: "ko",
  },
  {
    language: "Simplified Chinese",
    nativeName: "简体中文",
    locale: "zh-Hans",
  },
  {
    language: "Spanish",
    nativeName: "Español",
    locale: "es",
  },
  {
    language: "Turkish",
    nativeName: "Türkçe",
    locale: "tr",
  },
];

const inProgressTranslations = [
  {
    language: "Arabic",
    nativeName: "العربية",
    contributeUrl: "/community/translations?language=arabic",
  },
  {
    language: "Azerbaijani",
    nativeName: "Azərbaycanca",
    contributeUrl: "/community/translations?language=azerbaijani",
  },
  {
    language: "Belarusian",
    nativeName: "Беларуская",
    contributeUrl: "/community/translations?language=belarusian",
  },
  {
    language: "Bengali",
    nativeName: "বাংলা",
    contributeUrl: "/community/translations?language=bengali",
  },
  {
    language: "German",
    nativeName: "Deutsch",
    contributeUrl: "/community/translations?language=german",
  },
  {
    language: "Hindi",
    nativeName: "हिन्दी",
    contributeUrl: "/community/translations?language=hindi",
  },
  {
    language: "Indonesian",
    nativeName: "Bahasa Indonesia",
    contributeUrl: "/community/translations?language=indonesian",
  },
  {
    language: "Italian",
    nativeName: "Italiano",
    contributeUrl: "/community/translations?language=italian",
  },
  {
    language: "Polish",
    nativeName: "Polski",
    contributeUrl: "/community/translations?language=polish",
  },
  {
    language: "Portuguese (Brazil)",
    nativeName: "Português (Brasil)",
    contributeUrl: "/community/translations?language=portuguese-brazil",
  },
  {
    language: "Russian",
    nativeName: "Русский",
    contributeUrl: "/community/translations?language=russian",
  },
  {
    language: "Vietnamese",
    nativeName: "Tiếng Việt",
    contributeUrl: "/community/translations?language=vietnamese",
  },
];

const translationGuidelinesRepo =
  "https://github.com/NTARI-RAND/agrinet-docs/tree/main/tools/translations";

function TranslationCard({ language, nativeName, locale, docsUrl, contributeUrl, status }) {
  const {
    siteConfig: {
      i18n: { defaultLocale = "en" } = {},
    } = {},
  } = useDocusaurusContext();

  const defaultDocsHomeUrl = useBaseUrl("/");
  const localizedDocsHomeUrl = useBaseUrl(locale ? `/${locale}/` : "/");

  const computedDocsUrl = React.useMemo(() => {
    if (docsUrl) {
      return docsUrl;
    }

    if (!locale) {
      return null;
    }

    return locale === defaultLocale ? defaultDocsHomeUrl : localizedDocsHomeUrl;
  }, [docsUrl, locale, defaultLocale, defaultDocsHomeUrl, localizedDocsHomeUrl]);

  const computedContributeUrl = React.useMemo(() => {
    if (contributeUrl) {
      return contributeUrl;
    }

    return computedDocsUrl;
  }, [contributeUrl, computedDocsUrl]);

  const statusLabel = React.useMemo(
    () =>
      translate({
        id: `translations.status.${status === "Complete" ? "complete" : "inProgress"}`,
        message: status,
      }),
    [status]
  );

  const handleLanguageClick = (url) => {
    if (!url || typeof window === "undefined") {
      return;
    }

    window.open(url, "_blank", "noopener,noreferrer");
  };

  const handleContribute = (event) => {
    event.preventDefault();
    const targetUrl = computedContributeUrl;

    if (!targetUrl || typeof window === "undefined") {
      return;
    }

    window.open(targetUrl, "_blank", "noopener,noreferrer");
  };

  return (
    <article className={styles.card}>
      <header className={styles.cardHeader}>
        <div>
          <button
            type="button"
            className={styles.languageButton}
            onClick={() => handleLanguageClick(computedDocsUrl ?? computedContributeUrl)}
            disabled={!computedDocsUrl && !computedContributeUrl}
            aria-label={translate({
              id: "translations.card.openLanguage",
              message: "Open the {language} translation",
              values: { language },
            })}
          >
            <span className={styles.languageName}>{language}</span>
            <span className={styles.nativeName}>{nativeName}</span>
          </button>
        </div>
        <span className={clsx(styles.status, status === "Complete" && styles.statusComplete)}>
          {statusLabel}
        </span>
      </header>
      <div className={styles.cardBody}>
        {docsUrl ? (
          <p>
            <Translate id="translations.card.completeDescription">
              Explore the full Agrinet documentation in this language or spot areas that need updates by
              opening the translation site in a new tab.
            </Translate>
          </p>
        ) : (
          <p>
            <Translate id="translations.card.inProgressDescription">
              Track the community&apos;s progress and join the discussion on Agrinet before the localized docs
              go live.
            </Translate>
          </p>
        )}
        <div className={styles.links}>
          {computedDocsUrl && (
            <a
              className="button button--sm button--secondary"
              href={computedDocsUrl}
              target="_blank"
              rel="noopener noreferrer"
            >
              <Translate id="translations.card.readDocs">Read docs</Translate>
            </a>
          )}
          <button
            type="button"
            className={clsx("button button--sm button--outline button--primary", styles.contributeButton)}
            onClick={handleContribute}
            disabled={!computedContributeUrl}
          >
            <Translate id="translations.card.contribute">Contribute</Translate>
          </button>
        </div>
      </div>
    </article>
  );
}

export default function TranslationsPage() {
  return (
    <Layout
      title="Community Translations"
      description="Join the global community translating the Agrinet documentation."
    >
      <div className={styles.hero}>
        <div className="container">
          <h1>
            <Translate id="translations.hero.title">Translations</Translate>
          </h1>
          <p>
            <Translate id="translations.hero.tagline">
              Discover community-led translations of the Agrinet documentation and help us bring climate
              resilient farming knowledge to more growers around the world.
            </Translate>
          </p>
        </div>
      </div>

      <main className="container">
        <section className={styles.section}>
          <h2>
            <Translate id="translations.section.links.title">How language links work</Translate>
          </h2>
          <div className={styles.infoCard}>
            <p>
              <Translate id="translations.section.links.descriptionOne">
                Select a language to open its translation workspace in a new browser tab. Completed
                translations launch the localized Agrinet documentation, while in-progress efforts open the
                community hub for that language so you can follow along or volunteer.
              </Translate>
            </p>
            <p>
              <Translate id="translations.section.links.descriptionTwo">
                The Contribute button mirrors this behavior, giving you a shortcut to jump straight into the
                translated experience without leaving the main Agrinet site.
              </Translate>
            </p>
          </div>
        </section>

        <section className={styles.section}>
          <h2>
            <Translate id="translations.section.full.title">Fully translated sites</Translate>
          </h2>
          <p className={styles.sectionDescription}>
            <Translate id="translations.section.full.description">
              These languages have complete translations. Enjoy the Agrinet docs in your language, review new
              changes, or help keep them aligned with the main site.
            </Translate>
          </p>
          <div className={styles.grid}>
            {fullTranslations.map((translation) => (
              <TranslationCard key={translation.language} status="Complete" {...translation} />
            ))}
          </div>
        </section>

        <section className={styles.section}>
          <h2>
            <Translate id="translations.section.progress.title">Translations in progress</Translate>
          </h2>
          <p className={styles.sectionDescription}>
            <Translate id="translations.section.progress.description">
              These teams are actively translating new content. Follow their progress, offer feedback, and
              help review terminology before the localized Agrinet docs launch.
            </Translate>
          </p>
          <div className={styles.grid}>
            {inProgressTranslations.map((translation) => (
              <TranslationCard key={translation.language} status="In progress" {...translation} />
            ))}
          </div>
        </section>

        <section className={styles.section}>
          <h2>
            <Translate id="translations.section.contribute.title">How to contribute</Translate>
          </h2>
          <div className={styles.infoCard}>
            <p>
              <Translate id="translations.section.contribute.descriptionOne">
                Each translation is maintained by volunteers. Contributions typically involve translating or
                reviewing Markdown files and opening pull requests in the repository for your language. Start
                by reading the contributor guidelines in that repository to learn how their team collaborates.
              </Translate>
            </p>
            <p>
              <Translate id="translations.section.contribute.descriptionTwo">
                Not sure where to begin? Look for open issues labeled for newcomers, ask a question in the
                discussions tab, or offer to review a pending pull request. Every improvement helps the
                community access Agrinet documentation in their native language.
              </Translate>
            </p>
          </div>
        </section>

        <section className={styles.section}>
          <h2>
            <Translate id="translations.section.newTranslation.title">Start a new translation</Translate>
          </h2>
          <div className={styles.infoCard}>
            <p>
              <Translate id="translations.section.newTranslation.description">
                Check the lists above to confirm your language isn&apos;t already in motion. When you&apos;re ready to
                propose a new translation, submit a pull request that introduces your language code,
                maintainer details, and repository location. Our team will review it and help you get listed on
                this page.
              </Translate>
            </p>
          </div>
        </section>

        <section className={styles.section}>
          <h2>
            <Translate id="translations.section.maintainers.title">Maintainer responsibilities</Translate>
          </h2>
          <div className={styles.infoCard}>
            <ul className={styles.infoList}>
              <li>
                <strong>Sync with main docs:</strong> Keep your translation repository updated whenever new
                Agrinet content is published so readers always see current guidance.
              </li>
              <li>
                <strong>Review contributions:</strong> Provide timely feedback on pull requests, validate
                technical accuracy, and ensure terminology stays consistent across the site.
              </li>
              <li>
                <strong>Coordinate volunteers:</strong> Share progress updates, curate issues for newcomers,
                and celebrate milestones with your language community.
              </li>
            </ul>
          </div>
        </section>

        <section className={styles.section}>
          <h2>
            <Translate id="translations.section.localePlan.title">Locale readiness plan</Translate>
          </h2>
          <div className={styles.infoCard}>
            <ol className={styles.infoList}>
              <li>
                <Translate
                  id="translations.section.localePlan.stepOne"
                  values={{
                    bootstrapScript: <code>node tools/translations/bootstrap-locales.mjs</code>,
                    introLink: (
                      <a
                        href="https://docusaurus.io/docs/i18n/introduction"
                        target="_blank"
                        rel="noopener noreferrer"
                      >
                        {translate({
                          id: "translations.section.localePlan.introLinkText",
                          message: "internationalization overview",
                        })}
                      </a>
                    ),
                    tutorialLink: (
                      <a
                        href="https://docusaurus.io/docs/i18n/tutorial"
                        target="_blank"
                        rel="noopener noreferrer"
                      >
                        {translate({
                          id: "translations.section.localePlan.tutorialLinkText",
                          message: "step-by-step tutorial",
                        })}
                      </a>
                    ),
                  }}
                >
                  {"Run {bootstrapScript} to extract fresh string catalogs for each configured locale. Review the {introLink} and {tutorialLink} so your team knows which JSON and Markdown files to translate before committing them under i18n/."}
                </Translate>
              </li>
              <li>
                <Translate
                  id="translations.section.localePlan.stepTwo"
                  values={{
                    crowdinLink: (
                      <a
                        href="https://docusaurus.io/docs/i18n/crowdin"
                        target="_blank"
                        rel="noopener noreferrer"
                      >
                        {translate({
                          id: "translations.section.localePlan.crowdinLinkText",
                          message: "Crowdin integration guide",
                        })}
                      </a>
                    ),
                  }}
                >
                  {"Translate the generated content manually or by connecting your workspace through the {crowdinLink}. Keep terminology aligned with the Agrinet glossary before submitting pull requests."}
                </Translate>
              </li>
              <li>
                <Translate
                  id="translations.section.localePlan.stepThree"
                  values={{
                    buildScript: <code>node tools/translations/build-locales.mjs</code>,
                    gitLink: (
                      <a href="https://docusaurus.io/docs/i18n/git" target="_blank" rel="noopener noreferrer">
                        {translate({
                          id: "translations.section.localePlan.gitLinkText",
                          message: "i18n Git workflow",
                        })}
                      </a>
                    ),
                  }}
                >
                  {"Verify every language renders by running {buildScript} and publish the resulting build/<locale>/ directories using the {gitLink}. This prevents 404s on routes such as /fr/ and keeps deployments in sync."}
                </Translate>
              </li>
            </ol>
          </div>
        </section>

        <section className={styles.section}>
          <h2>
            <Translate id="translations.section.resources.title">Resources</Translate>
          </h2>
          <div className={styles.infoCard}>
            <ul className={styles.infoList}>
              <li>
                <a href={translationGuidelinesRepo} target="_blank" rel="noopener noreferrer">
                  <Translate id="translations.section.resources.guidelinesLink">
                    Agrinet translation guidelines and scripts
                  </Translate>
                </a>
                <Translate id="translations.section.resources.guidelinesDescription">
                  : Tools for syncing content, automating glossary checks, and preparing release updates.
                </Translate>
              </li>
              <li>
                <Translate id="translations.section.resources.docusaurusHeading">
                  Docusaurus internationalization references:
                </Translate>
                <ul>
                  <li>
                    <a href="https://docusaurus.io/docs/i18n/introduction" target="_blank" rel="noopener noreferrer">
                      <Translate id="translations.section.resources.docusaurusOverview">
                        Internationalization overview
                      </Translate>
                    </a>
                  </li>
                  <li>
                    <a href="https://docusaurus.io/docs/i18n/tutorial" target="_blank" rel="noopener noreferrer">
                      <Translate id="translations.section.resources.docusaurusTutorial">
                        Step-by-step localization tutorial
                      </Translate>
                    </a>
                  </li>
                  <li>
                    <a href="https://docusaurus.io/docs/i18n/git" target="_blank" rel="noopener noreferrer">
                      <Translate id="translations.section.resources.docusaurusGit">
                        Git workflows for translated sites
                      </Translate>
                    </a>
                  </li>
                  <li>
                    <a href="https://docusaurus.io/docs/i18n/crowdin" target="_blank" rel="noopener noreferrer">
                      <Translate id="translations.section.resources.docusaurusCrowdin">
                        Crowdin integration guide
                      </Translate>
                    </a>
                  </li>
                </ul>
              </li>
              <li>
                <a href="https://react.i18next.com/" target="_blank" rel="noopener noreferrer">
                  <Translate id="translations.section.resources.reactI18next">react-i18next</Translate>
                </a>
                <Translate id="translations.section.resources.reactI18nextDescription">
                  : A popular React internationalization library that supports language detection, namespaces,
                  and lazy loading for complex translation workflows.
                </Translate>
              </li>
            </ul>
          </div>
        </section>
      </main>
    </Layout>
  );
}
