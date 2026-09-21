import React, {
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import anime from "animejs/lib/anime.es.js";

import {
  generateDesign,
  generateTryOn,
  editReferenceImage,
  isHuggingFaceConfigured,
} from "./gemini";
import DesignResultPage from "./DesignResultPage";

import "./App.css";

/* ======================================================= */
/* Inspiration                                             */
/* ======================================================= */

const inspirationImages = [
  {
    src: "https://images.unsplash.com/photo-1490481651871-ab68de25d43d?auto=format&fit=crop&w=900&q=85",
    title: "Sari Drape / सिल्हूट",
  },
  {
    src: "https://images.unsplash.com/photo-1539109136881-3be0616acf4b?auto=format&fit=crop&w=900&q=85",
    title: "Zari Evening / ज़री",
  },
  {
    src: "https://images.unsplash.com/photo-1485968579580-b6d095142e6e?auto=format&fit=crop&w=900&q=85",
    title: "Lotus Geometry / कमल",
  },
  {
    src: "https://images.unsplash.com/photo-1551488831-00ddcb6c6bd3?auto=format&fit=crop&w=900&q=85",
    title: "Kalamkari Texture",
  },
  {
    src: "https://images.unsplash.com/photo-1544441893-675973e31985?auto=format&fit=crop&w=900&q=85",
    title: "Banarasi Surface",
  },
  {
    src: "https://images.unsplash.com/photo-1529139574466-a303027c1d8b?auto=format&fit=crop&w=900&q=85",
    title: "Temple Border",
  },
  {
    src: "https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?auto=format&fit=crop&w=900&q=85",
    title: "Indigo Block Print",
  },
  {
    src: "https://images.unsplash.com/photo-1525507119028-ed4c629a60a3?auto=format&fit=crop&w=900&q=85",
    title: "Handloom Direction",
  },
];

const presets = [
  "Kanjeevaram silk sari with a sculpted modern blouse",
  "Indigo handloom co-ord with Kalamkari details",
  "Lotus-inspired lehenga with zari embroidery",
  "Contemporary kurta jacket with temple borders",
];

/* ======================================================= */
/* App                                                     */
/* ======================================================= */

function App() {
  const [prompt, setPrompt] = useState("");
  const [language, setLanguage] = useState("en-IN");

  const [isListening, setIsListening] =
    useState(false);

  const [voiceText, setVoiceText] =
    useState("");

  const [isGenerating, setIsGenerating] =
    useState(false);

  const [generationStep, setGenerationStep] =
    useState(0);

  const [generatedImage, setGeneratedImage] =
    useState("");

  const [showResultPage, setShowResultPage] =
    useState(false);

  const [generationError, setGenerationError] =
    useState("");

  const [referenceImage, setReferenceImage] =
    useState("");

  const [referenceName, setReferenceName] =
    useState("");

  const [referencePrompt, setReferencePrompt] =
    useState("");

  const [referenceResult, setReferenceResult] =
    useState("");

  const [isEditingReference, setIsEditingReference] =
    useState(false);

  const [referenceError, setReferenceError] =
    useState("");

  const [personImage, setPersonImage] =
    useState("");

  const [personName, setPersonName] =
    useState("");

  const [tryOnImage, setTryOnImage] =
    useState("");

  const [isTryingOn, setIsTryingOn] =
    useState(false);

  const [tryOnError, setTryOnError] =
    useState("");

  const [brushSize, setBrushSize] =
    useState(8);

  const [brushColor, setBrushColor] =
    useState("#111111");

  const [tool, setTool] =
    useState("pen");

  const canvasRef = useRef(null);
  const drawingRef = useRef(false);
  const lastPointRef = useRef(null);

  const recognitionRef =
    useRef(null);

  const cursorRef =
    useRef(null);

  const [canUseSpeech, setCanUseSpeech] =
    useState(true);

  /* ===================================================== */
  /* Cursor                                                */
  /* ===================================================== */

  useEffect(() => {
    const cursor = cursorRef.current;

    if (!cursor) {
      return undefined;
    }

    const moveCursor = (event) => {
      cursor.style.transform =
        `translate3d(${event.clientX}px, ${event.clientY}px, 0)`;
    };

    const down = () => {
      cursor.classList.add("cursor-active");
    };

    const up = () => {
      cursor.classList.remove("cursor-active");
    };

    const isInteractive = (target) =>
      target instanceof Element &&
      Boolean(
        target.closest(
          "a, button, input, textarea, select, .inspiration-card, .hero-gallery-main, .hero-gallery-stack img"
        )
      );

    const handlePointerOver = (event) => {
      if (isInteractive(event.target)) {
        cursor.classList.add("cursor-hover");
      }
    };

    const handlePointerOut = (event) => {
      if (
        isInteractive(event.target) &&
        !isInteractive(event.relatedTarget)
      ) {
        cursor.classList.remove("cursor-hover");
      }
    };

    window.addEventListener(
      "mousemove",
      moveCursor
    );

    window.addEventListener(
      "mousedown",
      down
    );

    window.addEventListener(
      "mouseup",
      up
    );

    document.addEventListener("mouseover", handlePointerOver);
    document.addEventListener("mouseout", handlePointerOut);

    return () => {
      window.removeEventListener(
        "mousemove",
        moveCursor
      );

      window.removeEventListener(
        "mousedown",
        down
      );

      window.removeEventListener(
        "mouseup",
        up
      );

      document.removeEventListener("mouseover", handlePointerOver);
      document.removeEventListener("mouseout", handlePointerOut);
    };
  }, []);

  /* ===================================================== */
  /* Scroll motion                                         */
  /* ===================================================== */

  useEffect(() => {
    const elements =
      document.querySelectorAll(
        "[data-reveal]"
      );

    if (!elements.length) {
      return undefined;
    }

    const directionRef = {
      current: "down",
    };
    let lastScrollY = window.scrollY;
    let frameId = null;

    const updateScrollState = () => {
      frameId = null;

      const currentScrollY = window.scrollY;
      const direction =
        currentScrollY >= lastScrollY
          ? "down"
          : "up";

      directionRef.current = direction;
      lastScrollY = currentScrollY;

      const documentHeight =
        document.documentElement.scrollHeight -
        window.innerHeight;
      const progress = documentHeight > 0
        ? currentScrollY / documentHeight
        : 0;

      document.documentElement.dataset.scrollDirection =
        direction;
      document.documentElement.style.setProperty(
        "--scroll-progress",
        `${Math.min(Math.max(progress, 0), 1)}`
      );
    };

    const handleScroll = () => {
      if (frameId === null) {
        frameId = window.requestAnimationFrame(
          updateScrollState
        );
      }
    };

    const observer =
      new IntersectionObserver(
        (entries) => {
          entries.forEach((entry) => {
            if (entry.isIntersecting) {
              entry.target.dataset.revealDirection =
                directionRef.current;

              entry.target.classList.remove(
                "is-visible"
              );

              window.requestAnimationFrame(() => {
                entry.target.classList.add(
                  "is-visible"
                );
              });
            } else {
              entry.target.classList.add(
                "is-outside"
              );

              entry.target.classList.remove(
                "is-visible"
              );
            }
          });
        },
        {
          threshold: 0.14,
        }
      );

    elements.forEach((element) =>
      observer.observe(element)
    );

    window.addEventListener(
      "scroll",
      handleScroll,
      { passive: true }
    );

    updateScrollState();

    return () => {
      observer.disconnect();
      window.removeEventListener(
        "scroll",
        handleScroll
      );

      if (frameId !== null) {
        window.cancelAnimationFrame(frameId);
      }

      delete document.documentElement.dataset
        .scrollDirection;
      document.documentElement.style.removeProperty(
        "--scroll-progress"
      );
    };
  }, []);

  /* ===================================================== */
  /* Anime.js motion                                       */
  /* ===================================================== */

  useEffect(() => {
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      return undefined;
    }

    const navigation = document.querySelector(".navigation");
    const heroElements = document.querySelectorAll(
      ".hero-copy, .hero-side, .hero-gallery"
    );
    const revealElements = document.querySelectorAll(
      "[data-reveal]:not(.hero-copy):not(.hero-side):not(.hero-gallery)"
    );
    const heroGallery = document.querySelector(".hero-gallery");

    const introTimeline = anime.timeline({
      easing: "easeOutExpo",
      autoplay: true,
    });

    introTimeline
      .add({
        targets: navigation,
        opacity: [0, 1],
        translateY: [-18, 0],
        duration: 900,
      })
      .add({
        targets: heroElements,
        opacity: [0, 1],
        translateY: [34, 0],
        scale: [0.985, 1],
        delay: anime.stagger(110),
        duration: 1100,
      }, "-=560");

    const revealObserver = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (!entry.isIntersecting) {
            return;
          }

          anime({
            targets: entry.target,
            opacity: [0, 1],
            translateY: [42, 0],
            scale: [0.985, 1],
            duration: 900,
            easing: "easeOutExpo",
          });

          revealObserver.unobserve(entry.target);
        });
      },
      { threshold: 0.16 }
    );

    revealElements.forEach((element) => revealObserver.observe(element));

    const handlePointerMove = (event) => {
      if (!heroGallery || window.innerWidth < 800) {
        return;
      }

      const x = event.clientX / window.innerWidth - 0.5;
      const y = event.clientY / window.innerHeight - 0.5;

      anime({
        targets: heroGallery,
        translateX: x * 10,
        translateY: y * 8,
        duration: 900,
        easing: "easeOutQuad",
      });
    };

    const resetGallery = () => {
      anime({
        targets: heroGallery,
        translateX: 0,
        translateY: 0,
        duration: 700,
        easing: "easeOutExpo",
      });
    };

    window.addEventListener("mousemove", handlePointerMove, { passive: true });
    window.addEventListener("blur", resetGallery);

    return () => {
      introTimeline.pause();
      revealObserver.disconnect();
      anime.remove([navigation, ...heroElements, ...revealElements]);
      window.removeEventListener("mousemove", handlePointerMove);
      window.removeEventListener("blur", resetGallery);
    };
  }, []);

  /* ===================================================== */
  /* Speech recognition                                    */
  /* ===================================================== */

  useEffect(() => {
    const SpeechRecognition =
      window.SpeechRecognition ||
      window.webkitSpeechRecognition;

    if (!SpeechRecognition) {
      setCanUseSpeech(false);
      return undefined;
    }

    const recognition =
      new SpeechRecognition();

    recognition.continuous = true;
    recognition.interimResults = true;
    recognition.lang = language;

    recognition.onresult = (event) => {
      let finalTranscript = "";
      let interimTranscript = "";

      for (
        let i = event.resultIndex;
        i < event.results.length;
        i += 1
      ) {
        const transcript =
          event.results[i][0].transcript;

        if (event.results[i].isFinal) {
          finalTranscript += transcript;
        } else {
          interimTranscript += transcript;
        }
      }

      if (finalTranscript.trim()) {
        setPrompt((current) =>
          `${current} ${finalTranscript.trim()}`.trim()
        );
      }

      setVoiceText(
        interimTranscript ||
          finalTranscript
      );
    };

    recognition.onerror = (event) => {
      console.error(
        "Speech recognition error:",
        event.error
      );

      setIsListening(false);
    };

    recognition.onend = () => {
      setIsListening(false);
    };

    recognitionRef.current =
      recognition;

    return () => {
      recognition.stop();
    };
  }, [language]);

  const startVoice = () => {
    if (!recognitionRef.current) {
      return;
    }

    try {
      setVoiceText("");

      recognitionRef.current.lang =
        language;

      recognitionRef.current.start();

      setIsListening(true);
    } catch (error) {
      console.error(error);
    }
  };

  const stopVoice = () => {
    if (!recognitionRef.current) {
      return;
    }

    recognitionRef.current.stop();
    setIsListening(false);
  };

  const toggleVoice = () => {
    if (isListening) {
      stopVoice();
    } else {
      startVoice();
    }
  };

  /* ===================================================== */
  /* Canvas                                                 */
  /* ===================================================== */

  useEffect(() => {
    const canvas =
      canvasRef.current;

    if (!canvas) {
      return undefined;
    }

    const ctx =
      canvas.getContext("2d");

    const ratio =
      window.devicePixelRatio || 1;

    const cssWidth =
      canvas.clientWidth || 1000;

    const cssHeight =
      canvas.clientHeight || 550;

    canvas.width =
      cssWidth * ratio;

    canvas.height =
      cssHeight * ratio;

    ctx.scale(ratio, ratio);

    ctx.fillStyle = "#f1eee7";
    ctx.fillRect(
      0,
      0,
      cssWidth,
      cssHeight
    );

    ctx.lineCap = "round";
    ctx.lineJoin = "round";

    return undefined;
  }, []);

  const getCanvasPoint = (event) => {
    const canvas =
      canvasRef.current;

    if (!canvas) {
      return {
        x: 0,
        y: 0,
      };
    }

    const rect =
      canvas.getBoundingClientRect();

    return {
      x:
        event.clientX -
        rect.left,

      y:
        event.clientY -
        rect.top,
    };
  };

  const startDrawing = (event) => {
    const canvas =
      canvasRef.current;

    if (!canvas) {
      return;
    }

    drawingRef.current = true;

    const point =
      getCanvasPoint(event);

    lastPointRef.current =
      point;

    const ctx =
      canvas.getContext("2d");

    ctx.beginPath();
    ctx.arc(
      point.x,
      point.y,
      tool === "eraser"
        ? brushSize * 0.8
        : brushSize * 0.45,
      0,
      Math.PI * 2
    );

    ctx.fillStyle =
      tool === "eraser"
        ? "#f1eee7"
        : brushColor;

    ctx.fill();
  };

  const draw = (event) => {
    if (!drawingRef.current) {
      return;
    }

    const canvas =
      canvasRef.current;

    if (!canvas) {
      return;
    }

    const current =
      getCanvasPoint(event);

    const previous =
      lastPointRef.current ||
      current;

    const ctx =
      canvas.getContext("2d");

    ctx.beginPath();
    ctx.moveTo(
      previous.x,
      previous.y
    );

    ctx.lineTo(
      current.x,
      current.y
    );

    ctx.strokeStyle =
      tool === "eraser"
        ? "#f1eee7"
        : brushColor;

    ctx.lineWidth =
      tool === "eraser"
        ? brushSize * 2.2
        : brushSize;

    ctx.lineCap = "round";
    ctx.lineJoin = "round";
    ctx.stroke();

    lastPointRef.current =
      current;
  };

  const stopDrawing = () => {
    drawingRef.current = false;
    lastPointRef.current = null;
  };

  const clearCanvas = () => {
    const canvas =
      canvasRef.current;

    if (!canvas) {
      return;
    }

    const ctx =
      canvas.getContext("2d");

    ctx.fillStyle = "#f1eee7";

    ctx.fillRect(
      0,
      0,
      canvas.clientWidth,
      canvas.clientHeight
    );
  };

  const canvasAsDataUrl = () => {
    const canvas =
      canvasRef.current;

    if (!canvas) {
      return "";
    }

    return canvas.toDataURL(
      "image/png"
    );
  };

  const useSketchAsPrompt = () => {
    setPrompt((current) => {
      const sketchInstruction =
        "Use my hand-drawn sketch as the design structure.";

      return current.includes(
        sketchInstruction
      )
        ? current
        : `${current} ${sketchInstruction}`.trim();
    });

    document
      .getElementById("create")
      ?.scrollIntoView({
        behavior: "smooth",
      });
  };

  /* ===================================================== */
  /* Reference image                                       */
  /* ===================================================== */

  const handleReferenceUpload = (
    event
  ) => {
    const file =
      event.target.files?.[0];

    if (!file) {
      return;
    }

    const reader =
      new FileReader();

    reader.onload = () => {
      setReferenceImage(
        reader.result
      );

      setReferenceName(
        file.name
      );

      setReferenceResult("");
      setReferenceError("");
    };

    reader.readAsDataURL(file);
  };

  const editReference = async () => {
    if (!referenceImage) {
      setReferenceError(
        "Upload a reference image first."
      );
      return;
    }

    if (!referencePrompt.trim()) {
      setReferenceError(
        "Tell ThreadLabs what you want to change."
      );
      return;
    }

    setIsEditingReference(true);
    setReferenceError("");
    setReferenceResult("");

    try {
      const result =
        await editReferenceImage(
          referenceImage,
          referencePrompt
        );

      setReferenceResult(
        result.image
      );
    } catch (error) {
      console.error(error);

      setReferenceError(
        error?.message ||
          "Reference editing failed."
      );
    } finally {
      setIsEditingReference(false);
    }
  };

  const useReferenceAsDesignSource = () => {
    if (!referenceResult) {
      return;
    }

    setGeneratedImage(
      referenceResult
    );

    document
      .getElementById(
        "design-result"
      )
      ?.scrollIntoView({
        behavior: "smooth",
      });
  };

  /* ===================================================== */
  /* Person image                                          */
  /* ===================================================== */

  const handlePersonUpload = (
    event
  ) => {
    const file =
      event.target.files?.[0];

    if (!file) {
      return;
    }

    const reader =
      new FileReader();

    reader.onload = () => {
      setPersonImage(
        reader.result
      );

      setPersonName(
        file.name
      );

      setTryOnError("");
    };

    reader.readAsDataURL(file);
  };

  /* ===================================================== */
  /* Generate design                                       */
  /* ===================================================== */

  const scrollToOutput = () => {
    setTimeout(() => {
      document
        .getElementById(
          "design-result"
        )
        ?.scrollIntoView({
          behavior: "smooth",
          block: "start",
        });
    }, 150);
  };

  const generateFashionDesign =
    async () => {
      const trimmedPrompt =
        prompt.trim();

      if (
        !trimmedPrompt &&
        !referenceImage
      ) {
        setGenerationError(
          "Describe what you want to design or upload a reference image."
        );

        document
          .getElementById(
            "create"
          )
          ?.scrollIntoView({
            behavior: "smooth",
          });

        return;
      }

      setIsGenerating(true);
      setShowResultPage(true);
      setGenerationError("");
      setGeneratedImage("");

      setGenerationStep(1);

      let progressTimer;

      try {
        /*
          Small visual progress sequence while Hugging Face is working.
          The actual API call remains the source of truth.
        */
        progressTimer =
          setInterval(() => {
            setGenerationStep(
              (current) =>
                current >= 3
                  ? 3
                  : current + 1
            );
          }, 1600);

        const result =
          await generateDesign(
            trimmedPrompt,
            referenceResult ||
              referenceImage ||
              null
          );

        setGenerationStep(4);
        setGeneratedImage(
          result.image
        );

        setTimeout(() => {
          scrollToOutput();
        }, 100);
      } catch (error) {
        console.error(
          "ThreadLabs generation error:",
          error
        );

        setGenerationError(
          error?.message ||
            "ThreadLabs couldn't generate the image."
        );
      } finally {
        clearInterval(progressTimer);
        setIsGenerating(false);
      }
    };

  /* ===================================================== */
  /* Virtual try-on                                        */
  /* ===================================================== */

  const runVirtualTryOn = async () => {
    if (!personImage) {
      setTryOnError(
        "Upload your photo first."
      );
      return;
    }

    if (!generatedImage) {
      setTryOnError(
        "Generate a fashion design first."
      );
      return;
    }

    setIsTryingOn(true);
    setTryOnError("");

    try {
      const result =
        await generateTryOn(
          personImage,
          generatedImage
        );

      setTryOnImage(
        result.image
      );
    } catch (error) {
      console.error(
        "Virtual try-on error:",
        error
      );

      setTryOnError(
        error?.message ||
          "Virtual try-on failed."
      );
    } finally {
      setIsTryingOn(false);
    }
  };

  /* ===================================================== */
  /* Download                                              */
  /* ===================================================== */

  const downloadImage = (
    image,
    filename
  ) => {
    if (!image) {
      return;
    }

    const link =
      document.createElement("a");

    link.href = image;
    link.download =
      filename;

    document.body.appendChild(
      link
    );

    link.click();

    document.body.removeChild(
      link
    );
  };

  /* ===================================================== */
  /* Prompt examples                                       */
  /* ===================================================== */

  const promptCharacters =
    useMemo(
      () => prompt.length,
      [prompt]
    );

  return (
    <div className="threadlabs-root">
      <div
        ref={cursorRef}
        className="custom-cursor"
      />

      {showResultPage ? (
        <DesignResultPage
          prompt={prompt}
          generatedImage={generatedImage}
          isGenerating={isGenerating}
          generationStep={generationStep}
          onBack={() => setShowResultPage(false)}
          onGenerateAgain={generateFashionDesign}
        />
      ) : (
      <div className="threadlabs-app">

      {/* ================================================= */}
      {/* NAVIGATION                                        */}
      {/* ================================================= */}

      <header className="navigation">
        <a
          href="#top"
          className="brand"
        >
          <span className="brand-name">
            ThreadLabs
          </span>

          <span className="brand-subtitle">
            INDIA / GLOBAL CRAFT
          </span>
        </a>

        <nav className="nav-links">
          <a href="#create">
            Create
          </a>

          <a href="#reference">
            Reference
          </a>

          <a href="#sketch">
            Sketch
          </a>

          <a href="#design-result">
            Designs
          </a>

          <a href="#tryon">
            Try On
          </a>
        </nav>

        <div className="nav-status">
          <span className="status-dot" />
          AI DESIGN STUDIO
        </div>
      </header>

      {/* ================================================= */}
      {/* HERO                                              */}
      {/* ================================================= */}

      <main id="top">
        <section className="hero">
          <div
            className="hero-copy"
            data-reveal
          >
            <div className="eyebrow">
              DESI / DESIGN / MAKE
            </div>

            <h1>
              Design it.
              <br />
              Wear it.
              <br />
              <span>Make it real.</span>
            </h1>

            <p className="hero-description">
              Shape your idea through Indian drape,
              craft, story, and language — then take
              the finished fashion concept from screen
              to tailor.
            </p>

            <a
              href="#create"
              className="hero-cta"
            >
              Start designing
              <span>↘</span>
            </a>
          </div>

          <div
            className="hero-side"
            data-reveal
          >
            <div className="hero-number">
              01
            </div>

            <p>
              No design degree.
              <br />
              No template.
              <br />
              Just your idea.
            </p>
          </div>

          <div
            className="hero-gallery"
            data-reveal
          >
            <figure className="hero-gallery-main">
              <img
                src={inspirationImages[0].src}
                alt="Editorial fashion silhouette"
              />
              <figcaption>
                MATERIAL / FORM / ATTITUDE
              </figcaption>
            </figure>

            <div className="hero-gallery-stack">
              <img
                src={inspirationImages[3].src}
                alt="Close-up fabric texture"
              />
              <img
                src={inspirationImages[5].src}
                alt="Runway fashion reference"
              />
            </div>
          </div>
        </section>

        {/* ================================================= */}
        {/* CREATE                                            */}
        {/* ================================================= */}

        <section
          id="create"
          className="create-section"
        >
          <div
            className="section-heading"
            data-reveal
          >
            <span>01 — CREATE</span>

            <h2>
              Start with
              <br />
              an idea.
            </h2>

            <p>
              Type exactly what you imagine.
              ThreadLabs turns your language into
              a full fashion design presentation.
            </p>
          </div>

          <div
            className="create-panel"
            data-reveal
          >
            <div className="create-panel-top">
              <span>
                THREADLABS / IMAGE GENERATOR
              </span>

              <span>
                {isHuggingFaceConfigured()
                  ? "HUGGING FACE CONNECTED"
                  : "API KEY REQUIRED"}
              </span>
            </div>

            <textarea
              className="prompt-input"
              value={prompt}
              onChange={(event) =>
                setPrompt(
                  event.target.value
                )
              }
              placeholder="Describe the outfit you are imagining..."
              rows={6}
            />

            <div className="prompt-meta">
              <span>
                {promptCharacters} characters
              </span>

              <span>
                English / Hindi / Telugu / Tamil / Bengali
              </span>
            </div>

            <div className="preset-grid">
              {presets.map(
                (preset) => (
                  <button
                    type="button"
                    className="preset-chip"
                    key={preset}
                    onClick={() =>
                      setPrompt(
                        preset
                      )
                    }
                  >
                    {preset}
                  </button>
                )
              )}
            </div>

            <button
              type="button"
              className="generate-button"
              onClick={
                generateFashionDesign
              }
              disabled={isGenerating}
            >
              {isGenerating
                ? "GENERATING DESIGN..."
                : "GENERATE DESIGN"}

              <span>
                {isGenerating
                  ? "◌"
                  : "↗"}
              </span>
            </button>

            {generationError && (
              <div className="error-message">
                {generationError}
              </div>
            )}

            {isGenerating && (
              <div className="generation-progress">
                <div className="progress-line">
                  <span
                    className={
                      generationStep >= 1
                        ? "active"
                        : ""
                    }
                  >
                    Reading idea
                  </span>

                  <span
                    className={
                      generationStep >= 2
                        ? "active"
                        : ""
                    }
                  >
                    Building garment
                  </span>

                  <span
                    className={
                      generationStep >= 3
                        ? "active"
                        : ""
                    }
                  >
                    Rendering board
                  </span>

                  <span
                    className={
                      generationStep >= 4
                        ? "active"
                        : ""
                    }
                  >
                    Finishing
                  </span>
                </div>

                <div className="generation-loader">
                  <div />
                </div>
              </div>
            )}
          </div>
        </section>

        {/* ================================================= */}
        {/* VOICE                                             */}
        {/* ================================================= */}

        <section
          className="voice-section"
          data-reveal
        >
          <div className="voice-heading">
            <span>
              02 — VOICE PROMPT
            </span>

            <h2>
              Just say
              <br />
              what you mean.
            </h2>

            <p>
              Speak your design naturally in
              English, Hindi, Telugu, Tamil, or Bengali.
            </p>
          </div>

          <div className="voice-control">
            <div className="language-row">
              <span>
                LANGUAGE
              </span>

              <select
                value={language}
                onChange={(event) =>
                  setLanguage(
                    event.target.value
                  )
                }
              >
                <option value="en-IN">
                  English
                </option>

                <option value="hi-IN">
                  Hindi
                </option>

                <option value="te-IN">
                  Telugu
                </option>

                <option value="ta-IN">
                  Tamil
                </option>

                <option value="bn-IN">
                  Bengali
                </option>
              </select>
            </div>

            <button
              type="button"
              className={
                isListening
                  ? "voice-button listening"
                  : "voice-button"
              }
              onClick={
                canUseSpeech
                  ? toggleVoice
                  : undefined
              }
              disabled={!canUseSpeech}
            >
              <span className="voice-ring">
                {isListening
                  ? "■"
                  : "●"}
              </span>

              <span>
                {!canUseSpeech
                  ? "Speech recognition unavailable"
                  : isListening
                  ? "Listening..."
                  : "Start speaking"}
              </span>
            </button>

            <div className="voice-transcript">
              {voiceText ||
                "Your spoken words will appear here."}
            </div>
          </div>
        </section>

        {/* ================================================= */}
        {/* REFERENCE                                        */}
        {/* ================================================= */}

        <section
          id="reference"
          className="reference-section"
        >
          <div
            className="section-heading"
            data-reveal
          >
            <span>
              03 — REFERENCE LAB
            </span>

            <h2>
              Bring your
              <br />
              reference.
            </h2>

            <p>
              Upload an outfit you like and tell
              ThreadLabs exactly what you want to
              change.
            </p>
          </div>

          <div
            className="reference-layout"
            data-reveal
          >
            <div className="upload-panel">
              <label
                className="upload-zone"
                htmlFor="reference-upload"
              >
                <input
                  id="reference-upload"
                  type="file"
                  accept="image/*"
                  onChange={
                    handleReferenceUpload
                  }
                />

                <span className="upload-icon">
                  +
                </span>

                <strong>
                  Upload reference image
                </strong>

                <small>
                  PNG / JPG / WEBP
                </small>
              </label>

              {referenceName && (
                <div className="file-name">
                  {referenceName}
                </div>
              )}

              {referenceImage && (
                <img
                  src={referenceImage}
                  alt="Reference"
                  className="reference-preview"
                />
              )}
            </div>

            <div className="reference-editor">
              <label>
                WHAT SHOULD CHANGE?
              </label>

              <textarea
                value={referencePrompt}
                onChange={(event) =>
                  setReferencePrompt(
                    event.target.value
                  )
                }
                placeholder="Example: Keep the silhouette, use handloom cotton, add a temple border, and bring in Kalamkari florals with a structured neckline."
                rows={8}
              />

              <button
                type="button"
                className="secondary-button"
                onClick={
                  editReference
                }
                disabled={
                  isEditingReference
                }
              >
                {isEditingReference
                  ? "EDITING IMAGE..."
                  : "EDIT REFERENCE →"}
              </button>

              {referenceError && (
                <div className="error-message">
                  {referenceError}
                </div>
              )}

              {referenceResult && (
                <div className="reference-result">
                  <div className="reference-result-header">
                    <span>
                      EDITED REFERENCE
                    </span>

                    <button
                      type="button"
                      onClick={
                        useReferenceAsDesignSource
                      }
                    >
                      USE AS DESIGN →
                    </button>
                  </div>

                  <img
                    src={referenceResult}
                    alt="Edited fashion reference"
                  />
                </div>
              )}
            </div>
          </div>
        </section>

        {/* ================================================= */}
        {/* INSPIRATION                                      */}
        {/* ================================================= */}

        <section
          className="inspiration-section"
          data-reveal
        >
          <div className="inspiration-header">
            <span>
              INDIA / VISUAL REFERENCES
            </span>

            <span>
              SCROLL →
            </span>
          </div>

          <div className="inspiration-strip">
            {inspirationImages.map(
              (item) => (
                <div
                  className="inspiration-card"
                  key={item.src}
                >
                  <img
                    src={item.src}
                    alt={item.title}
                  />

                  <span>
                    {item.title}
                  </span>
                </div>
              )
            )}
          </div>
        </section>

        {/* ================================================= */}
        {/* SKETCH                                            */}
        {/* ================================================= */}

        <section
          id="sketch"
          className="sketch-section"
        >
          <div
            className="section-heading"
            data-reveal
          >
            <span>
              04 — SKETCH
            </span>

            <h2>
              Draw it
              <br />
              your way.
            </h2>

            <p>
              Rough sketch? That works.
              Draw the silhouette, placement or
              details and send the sketch to the AI.
            </p>
          </div>

          <div
            className="sketch-workspace"
            data-reveal
          >
            <div className="sketch-toolbar">
              <button
                type="button"
                className={
                  tool === "pen"
                    ? "tool active"
                    : "tool"
                }
                onClick={() =>
                  setTool("pen")
                }
              >
                PEN
              </button>

              <button
                type="button"
                className={
                  tool === "eraser"
                    ? "tool active"
                    : "tool"
                }
                onClick={() =>
                  setTool("eraser")
                }
              >
                ERASER
              </button>

              <label>
                SIZE
                <input
                  type="range"
                  min="2"
                  max="30"
                  value={brushSize}
                  onChange={(event) =>
                    setBrushSize(
                      Number(
                        event.target.value
                      )
                    )
                  }
                />
              </label>

              <label className="color-control">
                COLOR
                <input
                  type="color"
                  value={brushColor}
                  onChange={(event) =>
                    setBrushColor(
                      event.target.value
                    )
                  }
                />
              </label>

              <button
                type="button"
                className="tool"
                onClick={
                  clearCanvas
                }
              >
                CLEAR
              </button>
            </div>

            <div className="canvas-wrap">
              <canvas
                ref={canvasRef}
                className="fashion-canvas"
                onPointerDown={
                  startDrawing
                }
                onPointerMove={draw}
                onPointerUp={
                  stopDrawing
                }
                onPointerLeave={
                  stopDrawing
                }
              />
            </div>

            <div className="sketch-footer">
              <span>
                Draw freely. It doesn't have to
                look perfect.
              </span>

              <button
                type="button"
                className="secondary-button"
                onClick={
                  useSketchAsPrompt
                }
              >
                SEND SKETCH TO PROMPT →
              </button>
            </div>
          </div>
        </section>

        {/* ================================================= */}
        {/* DESIGN RESULT                                    */}
        {/* ================================================= */}

        <section
          id="design-result"
          className="design-result-section"
        >
          <div
            className="section-heading result-heading"
            data-reveal
          >
            <span>
              05 — AI DESIGN
            </span>

            <h2>
              Your idea,
              <br />
              fully designed.
            </h2>

            <p>
              This is the actual image generated
              by Hugging Face — not a text description,
              not JSON and not a placeholder.
            </p>
          </div>

          <div
            className="design-board"
            data-reveal
          >
            {isGenerating ? (
              <div className="design-loading">
                <div className="loading-orbit">
                  <span />
                  <span />
                  <span />
                </div>

                <strong>
                  BUILDING YOUR DESIGN BOARD
                </strong>

                <p>
                  Translating your idea into
                  garment structure, materials,
                  details and presentation views.
                </p>
              </div>
            ) : generatedImage ? (
              <>
                <div className="generated-image-frame">
                  <img
                    src={generatedImage}
                    alt="ThreadLabs AI generated fashion design board"
                  />
                </div>

                <div className="design-actions">
                  <button
                    type="button"
                    className="secondary-button"
                    onClick={() =>
                      downloadImage(
                        generatedImage,
                        "threadlabs-design.png"
                      )
                    }
                  >
                    SAVE DESIGN ↓
                  </button>

                  <button
                    type="button"
                    className="generate-button compact"
                    onClick={
                      generateFashionDesign
                    }
                  >
                    GENERATE ANOTHER →
                  </button>
                </div>
              </>
            ) : (
              <div className="design-empty">
                <span>
                  TL / 05
                </span>

                <h3>
                  Your finished fashion
                  board will appear here.
                </h3>

                <p>
                  Write your idea above and
                  generate the first concept.
                </p>
              </div>
            )}
          </div>
        </section>

        {/* ================================================= */}
        {/* TRY ON                                           */}
        {/* ================================================= */}

        <section
          id="tryon"
          className="tryon-section"
        >
          <div
            className="section-heading"
            data-reveal
          >
            <span>
              06 — VIRTUAL TRY-ON
            </span>

            <h2>
              See yourself
              <br />
              wearing it.
            </h2>

            <p>
              Upload a clear photo and ThreadLabs
              will place the generated design onto
              the person realistically.
            </p>
          </div>

          <div
            className="tryon-layout"
            data-reveal
          >
            <div className="tryon-upload-panel">
              <label
                className="upload-zone"
                htmlFor="person-upload"
              >
                <input
                  id="person-upload"
                  type="file"
                  accept="image/*"
                  onChange={
                    handlePersonUpload
                  }
                />

                <span className="upload-icon">
                  +
                </span>

                <strong>
                  Upload your photo
                </strong>

                <small>
                  Clear front-facing photo works best
                </small>
              </label>

              {personName && (
                <div className="file-name">
                  {personName}
                </div>
              )}

              {personImage && (
                <img
                  src={personImage}
                  alt="Person for virtual try-on"
                  className="person-preview"
                />
              )}

              <button
                type="button"
                className="generate-button"
                onClick={
                  runVirtualTryOn
                }
                disabled={
                  isTryingOn ||
                  !personImage ||
                  !generatedImage
                }
              >
                {isTryingOn
                  ? "BUILDING TRY-ON..."
                  : "TRY THIS DESIGN ON ME"}

                <span>
                  →
                </span>
              </button>

              {tryOnError && (
                <div className="error-message">
                  {tryOnError}
                </div>
              )}
            </div>

            <div className="tryon-preview">
              {isTryingOn ? (
                <div className="tryon-loading">
                  <div className="loading-orbit">
                    <span />
                    <span />
                    <span />
                  </div>

                  <strong>
                    FITTING THE GARMENT
                  </strong>

                  <p>
                    Preserving the person while
                    adapting the generated clothing.
                  </p>
                </div>
              ) : tryOnImage ? (
                <>
                  <div className="preview-header">
                    <span>
                      THREADLABS / TRY-ON
                    </span>

                    <button
                      type="button"
                      onClick={() =>
                        downloadImage(
                          tryOnImage,
                          "threadlabs-try-on.png"
                        )
                      }
                    >
                      SAVE ↓
                    </button>
                  </div>

                  <div className="preview-stage">
                    <img
                      src={tryOnImage}
                      alt="Virtual try-on result"
                    />
                  </div>
                </>
              ) : (
                <div className="tryon-empty">
                  <span>
                    TRY ON
                  </span>

                  <h3>
                    Your virtual fitting
                    appears here.
                  </h3>

                  <p>
                    Generate a design and upload
                    your photo to start.
                  </p>
                </div>
              )}
            </div>
          </div>
        </section>

        {/* ================================================= */}
        {/* FOOTER                                            */}
        {/* ================================================= */}

        <footer className="site-footer">
          <div>
            <span className="footer-brand">
              ThreadLabs
            </span>

            <span>
              INDIA / GLOBAL CRAFT
            </span>
          </div>

          <div>
            Your imagination
            <span className="footer-arrow">
              →
            </span>
            Our design
            <span className="footer-arrow">
              →
            </span>
            Real clothes
          </div>
        </footer>
      </main>
      </div>
      )}
    </div>
  );
}

export default App;
