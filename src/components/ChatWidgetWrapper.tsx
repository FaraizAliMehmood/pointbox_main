import { lazy, Suspense } from "react";

const ChatWidget = lazy(() =>
  import("./ChatWidget").then((mod) => ({ default: mod.ChatWidget }))
);

export function ChatWidgetWrapper() {
  return (
    <div className="chat-widget-root">
      <Suspense
        fallback={
          <div
            id="n8n-chat"
            className="n8n-chat chat-widget-loading"
            aria-label="Chat loading"
          />
        }
      >
        <ChatWidget />
      </Suspense>
      <a
        href="https://wa.me/96176504204"
        target="_blank"
        rel="noopener noreferrer"
        className="whatsapp-button"
        aria-label="Chat on WhatsApp"
      >
        <img
          src="https://upload.wikimedia.org/wikipedia/commons/6/6b/WhatsApp.svg"
          alt="WhatsApp Chat"
        />
      </a>
    </div>
  );
}
