import { translate } from "@docusaurus/Translate";

const translations = {
  button: {
    buttonText: translate({
      id: "theme.SearchBar.buttonText",
      message: "Search docs",
      description: "Label shown inside the navbar search trigger",
    }),
    buttonAriaLabel: translate({
      id: "theme.SearchBar.buttonAriaLabel",
      message: "Search docs",
      description: "ARIA label for the navbar search trigger",
    }),
  },
  modal: {
    searchBox: {
      resetButtonTitle: translate({
        id: "theme.SearchModal.searchBox.resetButtonTitle",
        message: "Clear the query",
        description: "The label and ARIA label for search box reset button",
      }),
      resetButtonAriaLabel: translate({
        id: "theme.SearchModal.searchBox.resetButtonTitle",
        message: "Clear the query",
        description: "The label and ARIA label for search box reset button",
      }),
      cancelButtonText: translate({
        id: "theme.SearchModal.searchBox.cancelButtonText",
        message: "Cancel",
        description: "The label and ARIA label for search box cancel button",
      }),
      cancelButtonAriaLabel: translate({
        id: "theme.SearchModal.searchBox.cancelButtonText",
        message: "Cancel",
        description: "The label and ARIA label for search box cancel button",
      }),
      clearButtonTitle: translate({
        id: "theme.SearchModal.searchBox.resetButtonTitle",
        message: "Clear the query",
        description: "The label and ARIA label for search box reset button",
      }),
      clearButtonAriaLabel: translate({
        id: "theme.SearchModal.searchBox.resetButtonTitle",
        message: "Clear the query",
        description: "The label and ARIA label for search box reset button",
      }),
      closeButtonText: translate({
        id: "theme.SearchModal.searchBox.cancelButtonText",
        message: "Cancel",
        description: "The label and ARIA label for search box cancel button",
      }),
      closeButtonAriaLabel: translate({
        id: "theme.SearchModal.searchBox.cancelButtonText",
        message: "Cancel",
        description: "The label and ARIA label for search box cancel button",
      }),
      placeholderText: translate({
        id: "theme.SearchModal.searchBox.placeholderText",
        message: "Search docs",
        description: "The placeholder text for the main search input field",
      }),
      placeholderTextAskAi: translate({
        id: "theme.SearchModal.searchBox.placeholderTextAskAi",
        message: "Ask another question...",
        description: "The placeholder text when in AI question mode",
      }),
      placeholderTextAskAiStreaming: translate({
        id: "theme.SearchModal.searchBox.placeholderTextAskAiStreaming",
        message: "Answering...",
        description: "The placeholder text for search box when AI is streaming an answer",
      }),
      enterKeyHint: translate({
        id: "theme.SearchModal.searchBox.enterKeyHint",
        message: "search",
        description: "The hint for the search box enter key text",
      }),
      enterKeyHintAskAi: translate({
        id: "theme.SearchModal.searchBox.enterKeyHintAskAi",
        message: "enter",
        description: "The hint for the Ask AI search box enter key text",
      }),
      searchInputLabel: translate({
        id: "theme.SearchModal.searchBox.searchInputLabel",
        message: "Search docs",
        description: "The ARIA label for search input",
      }),
      backToKeywordSearchButtonText: translate({
        id: "theme.SearchModal.searchBox.backToKeywordSearchButtonText",
        message: "Back to keyword search",
        description: "The text for back to keyword search button",
      }),
      backToKeywordSearchButtonAriaLabel: translate({
        id: "theme.SearchModal.searchBox.backToKeywordSearchButtonAriaLabel",
        message: "Back to keyword search",
        description: "The ARIA label for back to keyword search button",
      }),
    },
    startScreen: {
      recentSearchesTitle: translate({
        id: "theme.SearchModal.startScreen.recentSearchesTitle",
        message: "Recent",
        description: "The title for recent searches",
      }),
      noRecentSearchesText: translate({
        id: "theme.SearchModal.startScreen.noRecentSearchesText",
        message: "No recent searches",
        description: "The text when there are no recent searches",
      }),
      saveRecentSearchButtonTitle: translate({
        id: "theme.SearchModal.startScreen.saveRecentSearchButtonTitle",
        message: "Save this search",
        description: "The title for save recent search button",
      }),
      removeRecentSearchButtonTitle: translate({
        id: "theme.SearchModal.startScreen.removeRecentSearchButtonTitle",
        message: "Remove this search from history",
        description: "The title for remove recent search button",
      }),
      favoriteSearchesTitle: translate({
        id: "theme.SearchModal.startScreen.favoriteSearchesTitle",
        message: "Favorite",
        description: "The title for favorite searches",
      }),
      removeFavoriteSearchButtonTitle: translate({
        id: "theme.SearchModal.startScreen.removeFavoriteSearchButtonTitle",
        message: "Remove this search from favorites",
        description: "The title for remove favorite search button",
      }),
      recentConversationsTitle: translate({
        id: "theme.SearchModal.startScreen.recentConversationsTitle",
        message: "Recent conversations",
        description: "The title for recent conversations",
      }),
      removeRecentConversationButtonTitle: translate({
        id: "theme.SearchModal.startScreen.removeRecentConversationButtonTitle",
        message: "Remove this conversation from history",
        description: "The title for remove recent conversation button",
      }),
    },
    errorScreen: {
      titleText: translate({
        id: "theme.SearchModal.errorScreen.titleText",
        message: "Unable to fetch results",
        description: "The title for error screen",
      }),
      helpText: translate({
        id: "theme.SearchModal.errorScreen.helpText",
        message: "You might want to check your network connection.",
        description: "The help text for error screen",
      }),
    },
    resultsScreen: {
      askAiPlaceholder: translate({
        id: "theme.SearchModal.resultsScreen.askAiPlaceholder",
        message: "Ask AI: ",
        description: "The placeholder text for Ask AI input",
      }),
    },
    askAiScreen: {
      disclaimerText: translate({
        id: "theme.SearchModal.askAiScreen.disclaimerText",
        message: "Answers are generated with AI which can make mistakes. Verify responses.",
        description: "The disclaimer text for AI answers",
      }),
      relatedSourcesText: translate({
        id: "theme.SearchModal.askAiScreen.relatedSourcesText",
        message: "Related sources",
        description: "The text for related sources",
      }),
      thinkingText: translate({
        id: "theme.SearchModal.askAiScreen.thinkingText",
        message: "Thinking...",
        description: "The text when AI is thinking",
      }),
      copyButtonText: translate({
        id: "theme.SearchModal.askAiScreen.copyButtonText",
        message: "Copy",
        description: "The text for copy button",
      }),
      copyButtonCopiedText: translate({
        id: "theme.SearchModal.askAiScreen.copyButtonCopiedText",
        message: "Copied!",
        description: "The text for copy button when copied",
      }),
      copyButtonTitle: translate({
        id: "theme.SearchModal.askAiScreen.copyButtonTitle",
        message: "Copy",
        description: "The title for copy button",
      }),
      newAnswerButtonText: translate({
        id: "theme.SearchModal.askAiScreen.newAnswerButtonText",
        message: "New answer",
        description: "The text for the new answer button",
      }),
      newAnswerButtonAriaLabel: translate({
        id: "theme.SearchModal.askAiScreen.newAnswerButtonAriaLabel",
        message: "New answer",
        description: "The ARIA label for the new answer button",
      }),
      askAnotherQuestionButtonText: translate({
        id: "theme.SearchModal.askAiScreen.askAnotherQuestionButtonText",
        message: "Ask another question",
        description: "The text for ask another question button",
      }),
      askAnotherQuestionButtonAriaLabel: translate({
        id: "theme.SearchModal.askAiScreen.askAnotherQuestionButtonAriaLabel",
        message: "Ask another question",
        description: "The ARIA label for ask another question button",
      }),
    },
  },
};

export default translations;
