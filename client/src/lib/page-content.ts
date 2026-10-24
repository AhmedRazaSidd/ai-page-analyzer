export interface PageContent {
  title: string;
  url: string;
  content: string;
}

export async function extractPageContent(): Promise<PageContent> {
  if (typeof chrome === "undefined" || !chrome.tabs?.query) {
    throw new Error(
      "Chrome Extension API unavailable. Open this app from the installed extension popup.",
    );
  }
  const [tab] = await chrome.tabs.query({
    active: true,
    currentWindow: true,
  });

  if (!tab?.id || !tab.url) {
    throw new Error("Unable to access the current tab.");
  }

  if (!/^https?:\/\//i.test(tab.url)) {
    throw new Error(
      "This page cannot be analyzed. Open a regular website first.",
    );
  }

  const results = await chrome.scripting.executeScript({
    target: { tabId: tab.id },
    func: () => {
      const title = document.title;
      const url = window.location.href;

      // Clone the document so the actual page remains unchanged.
      const clone = document.body.cloneNode(true) as HTMLElement;

      clone
        .querySelectorAll(
          "script, style, noscript, iframe, svg, nav, footer, header, aside",
        )
        .forEach((element) => element.remove());

      const content = (clone.innerText || "").replace(/\s+/g, " ").trim();

      return { title, url, content };
    },
  });

  const page = results[0]?.result;

  if (!page?.content) {
    throw new Error("No readable content found on this page.");
  }

  return page;
}
