import axios from "axios";
import fs from "fs-extra";
import { parse } from "node-html-parser";
import path from "path";
import type { ParsedIconData, DownloadOptions } from "./types";

/**
 * Downloads a single icon as SVG string
 * @param iconName - e.g. "logos:java"
 * @returns SVG string
 */
async function fetchIconSvg(iconName: string): Promise<string> {
  const url = `https://api.iconify.design/${iconName}.svg`;
  const response = await axios.get(url);
  return response.data;
}

/**
 * Parses an SVG string to extract body and metadata for JSON collection
 */
function parseSvgForJson(svg: string, iconName: string): ParsedIconData {
  const root = parse(svg);
  const svgEl = root.querySelector("svg");

  if (!svgEl) {
    throw new Error("Invalid SVG structure");
  }

  const body = svgEl.innerHTML.trim();
  const [, , width, height] = (svgEl.getAttribute("viewBox") || "0 0 24 24").split(" ").map(Number);
  const [prefix, name] = iconName.split(":");

  return { prefix, name, body, width, height };
}

/**
 * Saves icons as individual SVG files
 */
async function saveAsSVGs(icons: string[], outputDir: string = "./icons"): Promise<void> {
  await fs.ensureDir(outputDir);

  for (const iconName of icons) {
    try {
      const svg = await fetchIconSvg(iconName);
      const [prefix, name] = iconName.split(":");
      const fileName = `${prefix}-${name}.svg`;
      const filePath = path.join(outputDir, fileName);
      await fs.writeFile(filePath, svg);
      console.log(`✅ Saved SVG: ${fileName}`);
    } catch (err: any) {
      console.error(`❌ Failed to save ${iconName}: ${err.message}`);
    }
  }
}

/**
 * Saves icons grouped in Iconify-compatible JSON collections
 */
async function saveAsJSON(icons: string[], outputDir: string = "./collections"): Promise<void> {
  const collections: Record<string, any> = {};

  for (const iconName of icons) {
    try {
      const svg = await fetchIconSvg(iconName);
      const { prefix, name, body, width, height } = parseSvgForJson(svg, iconName);

      if (!collections[prefix]) {
        collections[prefix] = {
          prefix,
          icons: {},
          width,
          height,
        };
      }

      collections[prefix].icons[name] = { body, width, height };
      console.log(`✅ Processed JSON icon: ${iconName}`);
    } catch (err: any) {
      console.error(`❌ Failed to parse ${iconName}: ${err.message}`);
    }
  }

  await fs.ensureDir(outputDir);

  for (const [prefix, data] of Object.entries(collections)) {
    const filePath = path.join(outputDir, `${prefix}.json`);
    await fs.writeJson(filePath, data, { spaces: 2 });
    console.log(`📁 Saved JSON collection: ${filePath}`);
  }
}

/**
 * Main download function (entry point)
 * @param icons - List of icon names like ["logos:java"]
 * @param options - Optional: outputDir and format ("svg" | "json")
 */
async function downloadIcons(icons: string[], options: DownloadOptions = {}): Promise<void> {
  const { outputDir, format = "svg" } = options;

  if (!icons || icons.length === 0) {
    console.error("❌ No icons provided.");
    return;
  }

  if (!["svg", "json"].includes(format)) {
    console.error("❌ Invalid format. Use 'svg' or 'json'.");
    return;
  }

  if (format === "svg") {
    await saveAsSVGs(icons, outputDir);
  } else {
    await saveAsJSON(icons, outputDir);
  }
}

export { saveAsJSON, saveAsSVGs, downloadIcons, downloadIcons as default };
