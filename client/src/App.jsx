import { useState } from "react";
import reactLogo from "./assets/react.svg";
import viteLogo from "./assets/vite.svg";
import heroImg from "./assets/hero.png";

import {
  Bot,
  ChevronDown,
  FileText,
  Globe,
  HelpCircle,
  List,
  Send,
  Settings,
  Sparkles,
  Languages,
  ThumbsDown,
  ThumbsUp,
} from "lucide-react";

function App() {
  return (
    <div className="assistant">
      {/* Header */}
      <header className="header">
        <div className="brand">
          <div className="brand-icon">
            <Sparkles size={20} />
          </div>

          <div>
            <div className="brand-name">
              AI Page Assistant
              <span className="beta">BETA</span>
            </div>
          </div>
        </div>

        <div className="header-actions">
          <button className="icon-button" aria-label="Settings">
            <Settings size={18} />
          </button>

          <button className="icon-button close-button" aria-label="Close">
            ×
          </button>
        </div>
      </header>

      {/* Tabs */}
      <div className="tabs">
        <button className="tab active">Chat</button>
        <button className="tab">Summarize</button>
      </div>

      {/* Chat */}
      <main className="chat-area">
        {/* User message */}
        <div className="user-message">
          What are the main points discussed in this article?
        </div>

        <div className="message-time user-time">
          2:30 PM
        </div>

        {/* AI message */}
        <div className="ai-message-row">
          <div className="ai-avatar">
            <Sparkles size={17} />
          </div>

          <div className="ai-content">
            <div className="ai-message">
              The article discusses how AI is transforming
              various industries and society. It highlights
              key advancements like machine learning and NLP,
              real-world applications in healthcare, finance,
              and education, challenges such as ethics and
              bias, and future possibilities including AGI
              and human-AI collaboration.

              <div className="message-actions">
                <button>
                  <ThumbsUp size={15} />
                </button>

                <button>
                  <ThumbsDown size={15} />
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Input */}
        <div className="input-wrapper">
          <input
            type="text"
            placeholder="Ask anything about this page..."
          />

          <button className="send-button">
            <Send size={18} />
          </button>
        </div>
      </main>

      {/* Quick Actions */}
      <section className="quick-actions">
        <h2>Quick Actions</h2>

        <div className="actions-grid">
          <button className="action-card">
            <FileText size={23} className="purple-icon" />
            <span>Summarize<br />Page</span>
          </button>

          <button className="action-card">
            <HelpCircle size={23} className="blue-icon" />
            <span>Ask a<br />Question</span>
          </button>

          <button className="action-card">
            <List size={23} className="green-icon" />
            <span>Key<br />Points</span>
          </button>

          <button className="action-card">
            <Languages size={23} className="yellow-icon" />
            <span>Translate<br />Page</span>
          </button>
        </div>
      </section>

      {/* Footer */}
      <footer className="footer">
        <div className="context-status">
          <Globe size={17} />
          <span>Current page context is active</span>
        </div>

        <button className="learn-more">
          Learn more
        </button>
      </footer>
    </div>
  );
}

export default App;
