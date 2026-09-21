require("dotenv").config();

const express = require("express");
const path = require("path");

const app = express();
const port = process.env.PORT || 10000;
const openAIKey = process.env.OPENAI_API_KEY;

app.use(express.json({ limit: "25mb" }));
app.use(express.static(path.join(__dirname, "build")));

function decodeDataUrl(dataUrl) {
  const match = /^data:(.+);base64,(.+)$/.exec(dataUrl || "");

  if (!match) {
    throw new Error("The uploaded reference image is invalid.");
  }

  return {
    buffer: Buffer.from(match[2], "base64"),
    contentType: match[1],
  };
}

async function openAIRequest(url, options) {
  if (!openAIKey) {
    throw new Error("OPENAI_API_KEY is not configured on the server.");
  }

  const response = await fetch(`https://api.openai.com/v1/${url}`, {
    ...options,
    headers: {
      Authorization: `Bearer ${openAIKey}`,
      ...options.headers,
    },
  });
  const payload = await response.json().catch(() => ({}));

  if (!response.ok) {
    throw new Error(payload.error?.message || `OpenAI returned ${response.status}.`);
  }

  return payload;
}

app.get("/api/health", (request, response) => {
  response.json({ openAIConfigured: Boolean(openAIKey) });
});

app.post("/api/images", async (request, response) => {
  try {
    const { prompt, referenceImage, aspectRatio = "4:3" } = request.body;

    if (!prompt?.trim()) {
      return response.status(400).json({ error: "A design prompt is required." });
    }

    const size = aspectRatio === "4:5" ? "1024x1536" : "1536x1024";
    let payload;

    if (referenceImage) {
      const image = decodeDataUrl(referenceImage);
      const form = new FormData();
      form.append("model", "gpt-image-1");
      form.append("prompt", prompt);
      form.append("size", size);
      form.append(
        "image",
        new Blob([image.buffer], { type: image.contentType }),
        "reference.png"
      );

      payload = await openAIRequest("images/edits", {
        method: "POST",
        body: form,
      });
    } else {
      payload = await openAIRequest("images/generations", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          model: "gpt-image-1",
          prompt,
          size,
          quality: "auto",
        }),
      });
    }

    const image = payload.data?.[0]?.b64_json;

    if (!image) {
      throw new Error("OpenAI returned no image data.");
    }

    return response.json({ image: `data:image/png;base64,${image}` });
  } catch (error) {
    console.error("ThreadLabs OpenAI request failed:", error);
    return response.status(502).json({ error: error.message });
  }
});

app.use((request, response) => {
  response.sendFile(path.join(__dirname, "build", "index.html"));
});

app.listen(port, () => {
  console.log(`ThreadLabs server listening on port ${port}`);
  console.log(`OpenAI API key configured: ${Boolean(openAIKey)}`);
});