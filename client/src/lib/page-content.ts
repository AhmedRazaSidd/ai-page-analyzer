export interface PageContent {
  title: string;
  url: string;
  description: string;
  content: string;
  imageUrl?: string;
  selectedText?: string;
}
export async function extractPageContent(): Promise<PageContent> {
  console.log("Step 1: extractPageContent called");
  console.log("Chrome API:", typeof chrome);

  if (
    typeof chrome === "undefined" ||
    !chrome.tabs?.query ||
    !chrome.scripting?.executeScript
  ) {
    throw new Error(
      "Chrome Extension API unavailable. Open the installed extension popup.",
    );
  }

  const [tab] = await chrome.tabs.query({
    active: true,
    currentWindow: true,
  });

  if (tab?.id === undefined || !tab.url) {
    throw new Error("Unable to access the current tab.");
  }

  if (!/^https?:\/\//i.test(tab.url)) {
    throw new Error(
      "This page cannot be analyzed. Open a regular website first.",
    );
  }
  console.log("Step 2: Current tab:", tab);
  console.log("Step 3: Injecting script into tab:", tab.id);

  try {
    const results = await chrome.scripting.executeScript({
      target: { tabId: tab.id },
      func: () => {
        const title = document.title || "Untitled page";
        const url = window.location.href;
        const description =
          document
            .querySelector<HTMLMetaElement>('meta[name="description"]')
            ?.content?.trim() ||
          document
            .querySelector<HTMLMetaElement>('meta[property="og:description"]')
            ?.content?.trim() ||
          document
            .querySelector<HTMLMetaElement>('meta[name="twitter:description"]')
            ?.content?.trim() ||
          "";

        const imageUrl =
          document.querySelector<HTMLMetaElement>('meta[property="og:image"]')
            ?.content ||
          document.querySelector<HTMLMetaElement>('meta[name="twitter:image"]')
            ?.content ||
          undefined;

        const selectedText = window.getSelection()?.toString().trim() || "";

        if (!document.body) {
          return { title, url, description, content: "", imageUrl, selectedText };
        }

        // Clone the page so the original website is not modified.
        const clone = document.body.cloneNode(true) as HTMLElement;

        clone
          .querySelectorAll(
            "script, style, noscript, iframe, svg, nav, footer, header, aside",
          )
          .forEach((element) => element.remove());

        const rawContent = (clone.innerText || clone.textContent || "")
          .replace(/\s+/g, " ")
          .trim();

        const content = selectedText
          ? `[USER HIGHLIGHTED TEXT]:\n"${selectedText}"\n\n[FULL PAGE CONTENT]:\n${rawContent}`
          : rawContent;

        return { title, url, description, content, imageUrl, selectedText };
      },
    });

    console.log("Step 4: Script results:", results);

    const page = results[0]?.result as PageContent | undefined;

    if (!page?.content) {
      throw new Error(
        "No readable text found. The page may be empty or dynamically rendered.",
      );
    }

    return page;
  } catch (error) {
    if (error instanceof Error) {
      if (
        error.message.includes("Extension manifest must request permission") ||
        error.message.includes("Cannot access contents of url")
      ) {
        throw new Error(
          "Permission to access this page was denied. Please reload the extension in chrome://extensions and ensure 'Site access' is set to 'On all sites'.",
        );
      }

      throw new Error(`Page extraction failed: ${error.message}`);
    }

    throw new Error("Page extraction failed due to an unknown error.");
  }
}
