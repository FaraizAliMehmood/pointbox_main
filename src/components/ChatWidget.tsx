import { useEffect } from "react";
import { createChat } from "@n8n/chat";

const WEBHOOK_URL =
  "https://n8n.srv1265667.hstgr.cloud/webhook/373baa62-f93c-41a6-9814-67a29249ff1e/chat";

export function ChatWidget() {
  useEffect(() => {
    let observer: MutationObserver | null = null;

    const initChat = () => {
      try {
        createChat({
          webhookUrl: WEBHOOK_URL,
          initialMessages: [
            "👋 Welcome to Yammine Solutions!",
            "Waleed the AI Agent with you.",
            "How can we assist you today?",
          ],
          target: "#n8n-chat",
        });

        requestAnimationFrame(() => {
          const root = document.querySelector(".n8n-chat");
          const win = root?.querySelector(".chat-window");

          if (win) {
            observer = new MutationObserver(() => {
              const isVisible = (win as HTMLElement).style.display !== "none";
              if (isVisible) {
                root?.classList.add("chat-open");
              } else {
                root?.classList.remove("chat-open");
              }
            });

            observer.observe(win, {
              attributes: true,
              attributeFilter: ["style"],
            });
          }
        });
      } catch (err) {
        console.error("[ChatWidget] Failed to initialize:", err);
      }
    };

    initChat();

    return () => {
      observer?.disconnect();
    };
  }, []);

  return <div id="n8n-chat" className="n8n-chat" />;
}
