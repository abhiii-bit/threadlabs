import React, { useMemo, useState } from "react";

const suggestionOptions = [
  "Add a detachable statement sleeve",
  "Try a softer everyday fabric",
  "Create a matching accessory",
  "Make the silhouette more dramatic",
];

function DesignResultPage({
  prompt,
  generatedImage,
  isGenerating,
  generationStep,
  onBack,
  onGenerateAgain,
}) {
  const [suggestion, setSuggestion] = useState("");
  const [selectedSuggestions, setSelectedSuggestions] = useState([]);

  const progress = isGenerating
    ? Math.min(generationStep * 25, 95)
    : generatedImage
    ? 100
    : 0;

  const estimate = useMemo(() => {
    const detailCount = selectedSuggestions.length;
    return {
      prototype: 4800 + detailCount * 650,
      delivery: detailCount > 1 ? "4-6 weeks" : "3-5 weeks",
    };
  }, [selectedSuggestions.length]);

  const toggleSuggestion = (option) => {
    setSelectedSuggestions((current) =>
      current.includes(option)
        ? current.filter((item) => item !== option)
        : [...current, option]
    );
  };

  const addSuggestion = () => {
    const trimmedSuggestion = suggestion.trim();

    if (!trimmedSuggestion || selectedSuggestions.includes(trimmedSuggestion)) {
      return;
    }

    setSelectedSuggestions((current) => [...current, trimmedSuggestion]);
    setSuggestion("");
  };

  return (
    <main className="result-page">
      <header className="result-page-header">
        <button type="button" className="result-back-button" onClick={onBack}>
          <span aria-hidden="true">&lt;-</span>
          BACK TO STUDIO
        </button>
        <div className="result-page-brand">
          <strong>ThreadLabs</strong>
          <span>DESIGN DEVELOPMENT / 05</span>
        </div>
      </header>

      <section className="result-page-intro">
        <div>
          <span className="result-kicker">AI DESIGN DEVELOPMENT</span>
          <h1>Your idea,<br />now in focus.</h1>
          <p>{prompt || "Your custom fashion concept"}</p>
        </div>
        <div className="result-progress-summary">
          <span>IMAGE GENERATION</span>
          <strong>{progress}%</strong>
          <div className="result-progress-track"><div style={{ width: `${progress}%` }} /></div>
          <small>{isGenerating ? "Rendering garment, material and detail views..." : generatedImage ? "Fashion board rendered and ready for refinement." : "Waiting for the first render."}</small>
        </div>
      </section>

      <section className="result-page-grid">
        <div className="result-image-panel">
          {isGenerating ? (
            <div className="result-image-loading">
              <div className="loading-orbit"><span /><span /><span /></div>
              <strong>BUILDING YOUR BOARD</strong>
              <span>{progress}% COMPLETE</span>
            </div>
          ) : generatedImage ? (
            <img src={generatedImage} alt="Generated ThreadLabs fashion design" />
          ) : (
            <div className="result-image-empty">Your generated image will appear here.</div>
          )}
        </div>

        <aside className="result-side-panel">
          <div className="result-panel-heading">
            <span>REFINEMENT NOTES</span>
            <h2>What should we add?</h2>
            <p>Choose a direction or write a note. These suggestions will guide the next design pass.</p>
          </div>
          <div className="suggestion-list">
            {suggestionOptions.map((option) => (
              <button type="button" className={selectedSuggestions.includes(option) ? "suggestion-chip selected" : "suggestion-chip"} key={option} onClick={() => toggleSuggestion(option)}>
                <span>{selectedSuggestions.includes(option) ? "✓" : "+"}</span>{option}
              </button>
            ))}
          </div>
          <div className="suggestion-input-row">
            <input value={suggestion} onChange={(event) => setSuggestion(event.target.value)} onKeyDown={(event) => { if (event.key === "Enter") addSuggestion(); }} placeholder="Add your own suggestion..." aria-label="Add your own design suggestion" />
            <button type="button" onClick={addSuggestion}>ADD</button>
          </div>
          {selectedSuggestions.length > 0 && (
            <div className="selected-suggestions">
              <span>ADDED TO NEXT PASS</span>
              <p>{selectedSuggestions.join("  ·  ")}</p>
            </div>
          )}
          <button type="button" className="result-primary-button" onClick={onGenerateAgain} disabled={isGenerating}>
            {isGenerating ? "GENERATING..." : "GENERATE NEXT PASS"}<span>-&gt;</span>
          </button>
        </aside>
      </section>

      <section className="result-estimates">
        <div className="estimate-intro">
          <span>PROJECT OUTLOOK</span>
          <h2>From image to<br />something real.</h2>
          <p>Planning estimates update as you add construction details. Final pricing is confirmed after a material and fit review.</p>
        </div>
        <div className="estimate-card">
          <span>EST. FIRST PROTOTYPE</span>
          <strong>INR {estimate.prototype.toLocaleString("en-IN")}</strong>
          <small>Includes pattern, sampling and one fitting round.</small>
        </div>
        <div className="estimate-card">
          <span>EST. DELIVERY WINDOW</span>
          <strong>{estimate.delivery}</strong>
          <small>Material sourcing begins after design approval.</small>
        </div>
      </section>
    </main>
  );
}

export default DesignResultPage;