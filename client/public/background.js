// Helper to open side panel for the active window
async function openSidePanel() {
  try {
    const window = await chrome.windows.getCurrent();
    if (window?.id) {
      await chrome.sidePanel.open({ windowId: window.id });
    }
  } catch (error) {
    console.error("Failed to open side panel:", error);
  }
}

// 1. Open when the user clicks the extension action icon in the toolbar
chrome.action.onClicked.addListener(async (tab) => {
  if (tab?.windowId) {
    chrome.sidePanel.open({ windowId: tab.windowId }).catch(console.error);
  } else {
    await openSidePanel();
  }
});

// 2. Open when keyboard shortcut (Ctrl+Shift+Y / Command+Shift+Y) is pressed
chrome.commands.onCommand.addListener(async (command) => {
  if (command === "open_side_panel") {
    await openSidePanel();
  }
});

// Configure side panel to open on action click automatically
chrome.sidePanel.setPanelBehavior({ openPanelOnActionClick: true }).catch(console.error);
