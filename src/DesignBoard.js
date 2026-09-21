import React from "react";

function DesignBoard({
  design,
  visuals,
  visualsLoading,
  visualProgress,
}) {
  if (!design) return null;

  return (
    <section
      className="design-board"
      id="design-board"
    >
      <div className="board-header">
        <div>
          <p className="board-eyebrow">
            THREADLABS / AI FASHION DEVELOPMENT
          </p>

          <h2>
            {design.title || "Untitled Design"}
          </h2>

          <p className="board-tagline">
            {design.tagline ||
              "Your imagination, engineered into fashion."}
          </p>
        </div>

        <div className="board-brand">
          <strong>ThreadLabs</strong>
          <span>by The Beatles</span>
        </div>
      </div>

      <div className="visual-generation-status">
        <div className="visual-generation-top">
          <div>
            <span>
              AI VISUAL DEVELOPMENT
            </span>

            <h3>
              {visualsLoading
                ? "Rendering your fashion board..."
                : visuals?.board
                ? "Fashion board complete."
                : "Ready to render."}
            </h3>
          </div>

          <strong>
            {visualsLoading
              ? `${visualProgress}%`
              : visuals?.board
              ? "100%"
              : "READY"}
          </strong>
        </div>

        <div className="visual-generation-track">
          <div
            className="visual-generation-fill"
            style={{
              width: `${
                visualsLoading
                  ? visualProgress
                  : visuals?.board
                  ? 100
                  : 0
              }%`,
            }}
          />
        </div>
      </div>

      {/* ====================================================
          REAL AI GENERATED IMAGE
      ==================================================== */}

      <div className="ai-fashion-board">

        {visualsLoading ? (
          <div className="board-image-loading">
            <div className="loading-orbit" />
            <span>
              AI IS DESIGNING
            </span>

            <strong>
              {visualProgress}%
            </strong>

            <p>
              Building silhouette,
              materials, garment views
              and technical details...
            </p>
          </div>
        ) : visuals?.board ? (
          <img
            src={visuals.board}
            alt={`${design.title} AI fashion design board`}
            className="generated-fashion-board"
          />
        ) : (
          <div className="board-image-empty">
            <span>THREADLABS</span>
            <strong>
              GENERATE YOUR DESIGN
            </strong>
          </div>
        )}

      </div>

      {/* ====================================================
          DESIGN INFORMATION
      ==================================================== */}

      <div className="board-info-grid">

        <div className="board-card">
          <span className="label">
            CONCEPT
          </span>

          <h3>
            {design.garment}
          </h3>

          <p>
            {design.concept}
          </p>
        </div>

        <div className="board-card">
          <span className="label">
            DESIGN STORY
          </span>

          <p className="large-story">
            {design.designStory}
          </p>
        </div>

        <div className="board-card">
          <span className="label">
            SILHOUETTE
          </span>

          <p>
            {design.silhouette}
          </p>

          <span className="label info-label">
            FIT
          </span>

          <p>
            {design.fit}
          </p>
        </div>

        <div className="board-card">
          <span className="label">
            INSPIRATION
          </span>

          <h3>
            {design.inspiration?.source}
          </h3>

          <p>
            {design.inspiration?.story}
          </p>
        </div>

      </div>

      {/* ====================================================
          FABRICS
      ==================================================== */}

      <div className="board-card full-card">

        <span className="label">
          MATERIAL DEVELOPMENT
        </span>

        <h3>
          Fabric, texture & construction.
        </h3>

        <div className="fabric-list">

          {(design.fabrics || []).map(
            (fabric, index) => (
              <div
                className="fabric-item"
                key={index}
              >
                <div className="fabric-number">
                  {String(index + 1).padStart(
                    2,
                    "0"
                  )}
                </div>

                <div>
                  <h4>
                    {fabric.name}
                  </h4>

                  <p>
                    {fabric.reason}
                  </p>

                  <span className="texture">
                    Texture —{" "}
                    {fabric.texture}
                  </span>
                </div>
              </div>
            )
          )}

        </div>
      </div>

      {/* ====================================================
          COLORS
      ==================================================== */}

      <div className="board-card full-card">

        <span className="label">
          COLOR SYSTEM
        </span>

        <h3>
          The visual language.
        </h3>

        <div className="color-grid">

          {(design.colors || []).map(
            (color, index) => (
              <div
                className="color-card"
                key={index}
              >
                <div
                  className="color-swatch"
                  style={{
                    backgroundColor:
                      color.hex ||
                      "#111",
                  }}
                />

                <div className="color-info">
                  <strong>
                    {color.name}
                  </strong>

                  <span>
                    {color.hex}
                  </span>

                  <p>
                    {color.role}
                  </p>
                </div>
              </div>
            )
          )}

        </div>
      </div>

      {/* ====================================================
          DETAILS
      ==================================================== */}

      <div className="board-two-column">

        <div className="board-card">

          <span className="label">
            DETAIL STUDIES
          </span>

          <h3>
            Signature elements.
          </h3>

          <div className="detail-list">

            {(design.details || []).map(
              (detail, index) => (
                <div
                  className="detail-row"
                  key={index}
                >
                  <span>
                    {String(
                      index + 1
                    ).padStart(2, "0")}
                  </span>

                  <p>
                    {detail}
                  </p>
                </div>
              )
            )}

          </div>
        </div>

        <div className="board-card">

          <span className="label">
            CONSTRUCTION
          </span>

          <h3>
            How the garment comes together.
          </h3>

          <div className="detail-list">

            {(design.construction || []).map(
              (item, index) => (
                <div
                  className="detail-row"
                  key={index}
                >
                  <span>
                    {String(
                      index + 1
                    ).padStart(2, "0")}
                  </span>

                  <p>
                    {item}
                  </p>
                </div>
              )
            )}

          </div>

        </div>

      </div>

      {/* ====================================================
          FOOTER
      ==================================================== */}

      <div className="board-footer">

        <div>
          <strong>
            ThreadLabs
          </strong>

          <span>
            by The Beatles
          </span>
        </div>

        <p>
          YOUR IMAGINATION → OUR DESIGN → REAL CLOTHES
        </p>

      </div>
    </section>
  );
}

export default DesignBoard;