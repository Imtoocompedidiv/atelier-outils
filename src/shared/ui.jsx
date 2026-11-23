import React, { useEffect, useState } from "react";

export function DemoNotice({ company }) {
  return (
    <div className="atelier-notice">
      <span>
        Prototype indépendant préparé pour {company}. Données fictives.
      </span>
      <a href="https://imtoocompedidiv.github.io/portfolio/">
        Autres réalisations
      </a>
    </div>
  );
}
export function DemoFooter({ children }) {
  return (
    <footer className="atelier-footer">
      {children ||
        "Les modifications restent dans cette page. Aucun message ni document n’est envoyé à un tiers."}
    </footer>
  );
}
export function useDocumentTitle(title) {
  useEffect(() => {
    document.title = `${title} · Démonstration`;
  }, [title]);
}
export function useAnnouncement() {
  const [message, setMessage] = useState("");
  return [
    message,
    setMessage,
    <span role="status" aria-live="polite" key="announcement">
      {message}
    </span>,
  ];
}
