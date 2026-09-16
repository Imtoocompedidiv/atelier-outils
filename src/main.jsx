import React, { Suspense } from "react";
import { createRoot } from "react-dom/client";
import "./shared/base.css";

const modules = import.meta.glob("./demos/*/App.jsx");
const requested = new URLSearchParams(window.location.search).get("etude");
const loader = requested && modules[`./demos/${requested}/App.jsx`];
const Demo = loader ? React.lazy(loader) : null;

class ErrorBoundary extends React.Component {
  state = { failed: false };
  static getDerivedStateFromError() {
    return { failed: true };
  }
  render() {
    if (this.state.failed)
      return (
        <main className="atelier-message">
          <h1>La démonstration n’a pas pu s’ouvrir.</h1>
          <p>
            Rechargez la page pour réessayer. Aucune donnée n’a été envoyée.
          </p>
          <button onClick={() => location.reload()}>Recharger</button>
        </main>
      );
    return this.props.children;
  }
}

createRoot(document.getElementById("root")).render(
  <ErrorBoundary>
    <Suspense
      fallback={
        <main className="atelier-message" role="status">
          Ouverture de l’atelier…
        </main>
      }
    >
      {Demo ? (
        <Demo />
      ) : (
        <main className="atelier-message">
          <h1>Atelier d’outils professionnels</h1>
          <p>
            Des prototypes pour explorer une tâche précise, avec des exemples
            que l’on peut manipuler.
          </p>
          <p>Pour ouvrir votre étude, utilisez le lien reçu par mail.</p>
          <a href="https://imtoocompedidiv.github.io/portfolio/">
            Découvrir mon travail
          </a>
        </main>
      )}
    </Suspense>
  </ErrorBoundary>,
);
