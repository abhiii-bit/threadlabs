import { InferenceClient } from "@huggingface/inference";

const API_TOKEN = process.env.REACT_APP_HUGGINGFACE_API_TOKEN;
const IMAGE_MODEL =
  process.env.REACT_APP_HUGGINGFACE_IMAGE_MODEL ||
  "stabilityai/stable-diffusion-3-medium-diffusers";
const IMAGE_TO_IMAGE_MODEL =
  process.env.REACT_APP_HUGGINGFACE_IMAGE_TO_IMAGE_MODEL ||
  "black-forest-labs/FLUX.1-Kontext-dev";

const hf = API_TOKEN
  ? new InferenceClient(API_TOKEN)
  : null;

if (!API_TOKEN) {
  console.warn(
    "ThreadLabs: REACT_APP_HUGGINGFACE_API_TOKEN is missing. Add it to your .env file."
  );
}

/*
  This is the visual system we want EVERY ThreadLabs generation
  to follow.

  The screenshot you supplied is not being treated as a generic
  "fashion photo". It is treated as the visual reference for the
  final presentation-board format.
*/
const THREADLABS_BOARD_STYLE = `
THREADLABS VISUAL OUTPUT LOCK

Create ONE finished horizontal fashion-design presentation board.

The final image must look like a premium editorial fashion design board
printed on warm ivory / cream paper.

OUTPUT FORMAT
- Landscape horizontal composition.
- 4:3 aspect ratio.
- High resolution.
- The entire image is the final presentation board.
- Do NOT generate a website screenshot.
- Do NOT generate a phone screen.
- Do NOT generate a UI dashboard.
- Do NOT generate a generic moodboard.
- Do NOT generate a single isolated fashion photograph.
- Do NOT generate a normal Pinterest collage.

VISUAL LANGUAGE
- Warm ivory paper background.
- Extremely subtle paper texture.
- Elegant editorial typography inspired by a premium fashion-school portfolio.
- Dark olive / muted forest-green serif headings with strong contrast.
- Near-black readable body text, never pale gray.
- Thin but clearly visible divider rules.
- Sophisticated fashion-school / couture design-document aesthetic.
- Natural warm studio lighting.
- Premium photographic realism.
- No neon.
- No futuristic cyberpunk look.
- No glossy SaaS cards.
- No black background.
- No loud gradients.
- No cartoon styling.

READABILITY AND LAYOUT LOCK
- Treat the attached reference board as the visual direction: clean ivory paper,
  one large hero image on the left, organized product views on the right,
  and clearly separated lower information panels.
- Use a strong, obvious visual hierarchy: large title, medium section headings,
  and short body labels that can be read at a glance.
- Use large enough typography for the final image. Never use microscopic text.
- Keep every label and specification high contrast, sharp, fully inside its panel,
  and separated from nearby images.
- Use generous whitespace and padding around every section.
- Limit each information panel to concise labels and short values.
- Keep divider lines straight, crisp, and aligned to a consistent grid.
- Make the board feel spacious and editorial, not crowded or collage-like.
- The hero garment must occupy the largest visual area and remain immediately visible.
- Do not overlap text, images, swatches, sketches, or borders.
- Avoid illegible pseudo-text, random letters, dense paragraphs, tiny footnotes,
  watermarks, logos, and decorative writing that cannot be read.

BOARD STRUCTURE

LEFT HERO AREA
- Approximately the left third of the board is a large hero fashion photograph.
- Show the designed garment being worn by a fashion model.
- The clothing must be the exact garment described in the user's prompt.
- Make the garment the visual priority.
- Show realistic construction, fabric, seams, folds and materials.
- Include a tasteful related accessory when appropriate.
- Place an elegant editorial title near the upper-left portion of this hero area.
- Add a small subtitle and a short poetic design concept statement.

TOP RIGHT
- Add a "Top Views" section.
- Show the designed garment on a dress form / mannequin from:
  1. front
  2. side
  3. back
- Keep all three views visually consistent.
- These are technical fashion presentation views, not random photographs.

FAR RIGHT / INSPIRATION
- Add a narrow inspiration section.
- Include one tasteful inspiration photograph related to the garment.
- Add a small "Inspiration" heading and a short design explanation.

MIDDLE RIGHT
- Add a "Details" section.
- Show approximately four close-up detail images.
- Examples:
  fabric texture,
  neckline,
  embroidery,
  lace,
  stitching,
  closure,
  embellishment,
  construction detail.
- Each detail should correspond to the actual generated garment.

BOTTOM LEFT
- If the design includes an accessory, create a dedicated accessory section.
- Show the main accessory large.
- Add two or three smaller supporting views around it.
- These views must be consistent with the same accessory.

BOTTOM CENTER
- Add a "Design Specifications" section.
- Present clean fashion-design specification information.
- Include useful fields such as:
  Garment Type
  Silhouette
  Primary Fabric
  Accent
  Closure
  Boning / Structure
  Lining
  Construction Difficulty

BOTTOM RIGHT
- Add a "Technical Sketch" section.
- Include hand-drawn fashion technical sketches.
- Show front and back technical views.
- Add small accessory technical sketches when an accessory exists.

LOWER EDGE
- Add a small "Fabric & Material Suggestions" section.
- Show realistic material swatches / miniature fabric images.
- Label the fabrics and materials.

FOOTER
- Finish the board with a small elegant handwritten-style phrase:
  "Your imagination → Our design → Real clothes"

CONSISTENCY
- Every section must depict the SAME garment.
- Every mannequin view must depict the SAME design as the hero photograph.
- Closeups must match the same fabric and construction.
- Accessory views must match the same accessory.
- Technical sketches must match the garment.
- Fabric swatches must correspond to the visible garment.

IMPORTANT
The user's fashion prompt is the source of truth for the garment itself.

The supplied ThreadLabs presentation-board structure is the source of truth
for the composition.

Do not replace the board format with another image style.
Do not simplify it into a single model photo.
Do not turn it into a generic collage.
Do not make unrelated creative decisions that change the garment.
`;

/* ------------------------------------------------------- */
/* Helpers                                                 */
/* ------------------------------------------------------- */

function ensureAI() {
  if (!API_TOKEN) {
    throw new Error(
      "Hugging Face API token is missing. Add REACT_APP_HUGGINGFACE_API_TOKEN to your .env file and restart the React server."
    );
  }
}

function normalizeError(error) {
  if (!error) {
    return "Unknown Hugging Face error.";
  }

  if (typeof error === "string") {
    return error;
  }

  const status =
    error?.status ||
    error?.response?.status ||
    error?.code;

  const message =
    error?.message ||
    error?.response?.data?.error?.message ||
    JSON.stringify(error);

  return status
    ? `${status}: ${message}`
    : message;
}

function toUserFacingImageError(error) {
  return new Error(
    `Image generation failed through Hugging Face. ${normalizeError(error)}`
  );
}

async function makeTryOnReference(personImage, designImage) {
  const [person, design] = await Promise.all(
    [personImage, designImage].map((source) =>
      new Promise((resolve, reject) => {
        const image = new Image();
        image.onload = () => resolve(image);
        image.onerror = reject;
        image.src = source;
      })
    )
  );

  const canvas = document.createElement("canvas");
  const panelWidth = 768;
  const panelHeight = 1024;
  canvas.width = panelWidth * 2;
  canvas.height = panelHeight;

  const context = canvas.getContext("2d");
  context.fillStyle = "#f3eee5";
  context.fillRect(0, 0, canvas.width, canvas.height);

  const drawPanel = (image, offsetX, label) => {
    const scale = Math.max(
      panelWidth / image.naturalWidth,
      (panelHeight - 72) / image.naturalHeight
    );
    const width = image.naturalWidth * scale;
    const height = image.naturalHeight * scale;
    const x = offsetX + (panelWidth - width) / 2;
    const y = 56 + (panelHeight - 72 - height) / 2;

    context.fillStyle = "#273326";
    context.font = "600 28px sans-serif";
    context.fillText(label, offsetX + 28, 38);
    context.drawImage(image, x, y, width, height);
  };

  drawPanel(person, 0, "IDENTITY SOURCE - KEEP THIS FACE");
  drawPanel(design, panelWidth, "GARMENT SOURCE - USE THIS DESIGN");

  return new Promise((resolve, reject) => {
    canvas.toBlob((blob) => {
      if (blob) {
        resolve(blob);
      } else {
        reject(new Error("Could not prepare the try-on reference image."));
      }
    }, "image/jpeg", 0.92);
  });
}

/* ------------------------------------------------------- */
/* Hugging Face image generation                           */
/* ------------------------------------------------------- */

async function requestImage({
  prompt,
  referenceImage = null,
  aspectRatio = "4:3",
}) {
  ensureAI();

  const width = aspectRatio === "4:3" ? 1024 : 832;
  const height = aspectRatio === "4:3" ? 768 : 1216;
  const negativePrompt =
    "low resolution, blurry, soft focus, pixelated, jpeg artifacts, distorted anatomy, extra fingers, malformed hands, duplicate person, asymmetrical face, plastic skin, bad garment fit, warped seams, melted fabric, muddy details, tiny text, illegible labels, fake words, random letters, overlapping panels, cramped layout, low contrast, washed out typography, watermark, logo, cluttered collage";

  const blob = referenceImage
    ? await hf.imageToImage({
        model: IMAGE_TO_IMAGE_MODEL,
        inputs:
          referenceImage instanceof Blob
            ? referenceImage
            : await fetch(referenceImage).then((result) =>
                result.blob()
              ),
        parameters: {
          prompt,
          negative_prompt: negativePrompt,
          guidance_scale: 7.5,
          num_inference_steps: 30,
          target_size: { width, height },
        },
      })
    : await hf.textToImage({
        model: IMAGE_MODEL,
        inputs: prompt,
        parameters: {
          width,
          height,
          negative_prompt: negativePrompt,
          guidance_scale: 7.5,
          num_inference_steps: 30,
        },
      });

  const image = await new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onloadend = () => resolve(reader.result);
    reader.onerror = reject;
    reader.readAsDataURL(blob);
  });

  return {
    image,
    model: IMAGE_MODEL,
  };
}

async function generateWithModel({
  prompt,
  referenceImage = null,
  aspectRatio = "4:3",
}) {
  try {
    return await requestImage({
      prompt,
      referenceImage,
      aspectRatio,
    });
  } catch (error) {
    console.error(
      "ThreadLabs Hugging Face image generation failed:",
      error
    );
    throw toUserFacingImageError(error);
  }
}

/* ------------------------------------------------------- */
/* Fashion Design                                          */
/* ------------------------------------------------------- */

export async function generateDesign(
  userPrompt,
  referenceImage = null
) {
  const cleanPrompt =
    String(userPrompt || "").trim();

  if (!cleanPrompt && !referenceImage) {
    throw new Error(
      "Describe the garment or upload a reference image first."
    );
  }

  const prompt = `
You are the image-generation engine inside ThreadLabs, an AI fashion
design studio.

USER DESIGN REQUEST:
${cleanPrompt || "Use the uploaded reference image as the garment basis."}

${THREADLABS_BOARD_STYLE}

GARMENT ACCURACY RULE:
Preserve every meaningful design instruction in the user's request:
shape, garment type, neckline, silhouette, sleeve structure, colors,
textures, materials, embellishment, accessory details and styling.

REFERENCE IMAGE RULE:
When a reference image is provided, use it as the visual sdource of truth
for the board's composition, spacing, hierarchy, paper tone, image placement,
typography scale, panel structure and overall presentation style.
Keep the user's garment request as the source of truth for the garment itself.
Do not return a generic image or a different collage format.

The result should feel like a professional fashion-design presentation
prepared for a couture atelier and a skilled tailor.

Generate the actual final image.
`;

  return generateWithModel({
    prompt,
    referenceImage,
    aspectRatio: "4:3",
  });
}

/* ------------------------------------------------------- */
/* Reference Image Editing                                 */
/* ------------------------------------------------------- */

export async function editReferenceImage(
  referenceImage,
  editPrompt
) {
  if (!referenceImage) {
    throw new Error(
      "Upload a reference image before editing it."
    );
  }

  if (!editPrompt?.trim()) {
    throw new Error(
      "Tell ThreadLabs what you want to change."
    );
  }

  const prompt = `
You are editing an existing fashion reference image for ThreadLabs.

IMPORTANT:
The uploaded image is the source of truth.

USER'S REQUESTED CHANGE:
${editPrompt.trim()}

Preserve everything that the user did NOT ask to change.

Do not randomly redesign the garment.
Do not replace the clothing with something unrelated.
Do not alter proportions unnecessarily.

Return a refined final fashion image with the requested change.
`;

  return generateWithModel({
    prompt,
    aspectRatio: "4:3",
  });
}

/* ------------------------------------------------------- */
/* Virtual Try-On                                          */
/* ------------------------------------------------------- */

export async function generateTryOn(
  personImage,
  designImage
) {
  if (!personImage) {
    throw new Error(
      "Upload a person photo for the virtual try-on."
    );
  }

  if (!designImage) {
    throw new Error(
      "Generate a design first."
    );
  }

  const prompt = `
You are the ThreadLabs virtual try-on engine.

The input image is a two-panel reference:
- LEFT PANEL: the person whose face and identity must be preserved.
- RIGHT PANEL: the generated ThreadLabs garment that must be transferred.

Dress the SAME PERSON from the left panel in the EXACT garment from the right panel.

STRICT RULES:
- Preserve the person's facial identity.
- Preserve realistic body proportions.
- Preserve skin tone and natural appearance.
- Preserve realistic lighting.
- Transfer the garment accurately.
- Preserve garment structure, silhouette, color, fabric and details.
- Make the clothing physically believable.
- The garment must fit the person's body naturally.
- Avoid plastic-looking AI skin.
- Avoid changing the person's face.
- Avoid changing the person's hair unless necessary for garment fitting.
- Do not invent a completely different garment.

FINAL OUTPUT:
A single premium, photorealistic fashion photograph of the person from
the left panel wearing the generated ThreadLabs design. Do not output
the two-panel reference, labels, collage, or split screen.

Use clean editorial fashion photography.
`;
  
  return generateWithModel({
    prompt,
    referenceImage: await makeTryOnReference(
      personImage,
      designImage
    ),
    aspectRatio: "4:5",
  });
}

/* ------------------------------------------------------- */
/* Utility                                                 */
/* ------------------------------------------------------- */

export function isHuggingFaceConfigured() {
  return Boolean(API_TOKEN);
}
