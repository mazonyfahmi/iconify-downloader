import axios from "axios";
import * as fs from "fs-extra";
import { parse } from "node-html-parser";
import path from "path";
import archiver from "archiver";

// Define reusable types here or import if shared
interface ParsedIconData {
    prefix: string;
    name: string;
    body: string;
    width: number;
    height: number;
}

export interface DownloadOptions {
    outputDir?: string;
    format?: "svg" | "json";
}

export type DownloadCustomizationOptions = {
    subfolder?: string;
    organizeByPrefix?: boolean;
    applyColor?: boolean;
    color?: string;
    forceMonochrome?: boolean;
    zipEnabled?: boolean;
    zipName?: string;
};

function sanitizeFolderName(input: string): string {
    return input.replace(/[<>:"/\\|?*]/g, "-").trim();
}

function sanitizeZipName(input: string): string {
    const normalized = input.trim().replace(/[<>:"/\\|?*]/g, "-");
    const withoutExt = normalized.toLowerCase().endsWith(".zip") ? normalized.slice(0, -4) : normalized;
    return withoutExt.length ? withoutExt : "icons";
}

function withColorCustomization(svg: string, color: string, forceMonochrome: boolean): string {
    const root = parse(svg);
    const svgEl = root.querySelector("svg");
    if (!svgEl) return svg;

    const existingStyle = svgEl.getAttribute("style");
    const styleWithColor = existingStyle ? `${existingStyle}; color: ${color};` : `color: ${color};`;
    svgEl.setAttribute("style", styleWithColor);

    if (!forceMonochrome) {
        return root.toString();
    }

    const nodes = svgEl.querySelectorAll("*");
    for (const node of nodes) {
        const fill = node.getAttribute("fill");
        if (fill && fill !== "none") {
            node.setAttribute("fill", "currentColor");
        }
        const stroke = node.getAttribute("stroke");
        if (stroke && stroke !== "none") {
            node.setAttribute("stroke", "currentColor");
        }
    }

    const svgFill = svgEl.getAttribute("fill");
    if (!svgFill || svgFill !== "none") {
        svgEl.setAttribute("fill", "currentColor");
    }

    return root.toString();
}

async function createZipFromFiles(filePaths: string[], baseDir: string, zipPath: string) {
    await fs.ensureDir(path.dirname(zipPath));
    await new Promise<void>((resolve, reject) => {
        const output = fs.createWriteStream(zipPath);
        const zip = archiver("zip", { zlib: { level: 9 } });

        output.on("close", () => resolve());
        output.on("error", (err) => reject(err));
        zip.on("error", (err: any) => reject(err));

        zip.pipe(output);

        for (const filePath of filePaths) {
            const rel = path.relative(baseDir, filePath).replace(/\\/g, "/");
            zip.file(filePath, { name: rel });
        }

        zip.finalize().catch(reject);
    });
}

/**
 * Downloads a single icon as SVG string
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

export const IconService = {
    /**
     * Saves icons as individual SVG files
     */
    async saveAsSVGs(
        icons: string[],
        outputDir: string,
        options?: DownloadCustomizationOptions,
        onProgress?: (current: number, total: number, iconName: string) => void
    ): Promise<string[]> {
        const baseDir =
            options?.subfolder && sanitizeFolderName(options.subfolder)
                ? path.join(outputDir, sanitizeFolderName(options.subfolder))
                : outputDir;
        await fs.ensureDir(baseDir);
        const results: string[] = [];

        const total = icons.length;
        for (const iconName of icons) {
            try {
                // Handle cases where iconName might have dots instead of colons (e.g. "fluent.color:icon" -> "fluent-color:icon")
                // Actually Iconify convention is strictly "prefix:name". 
                // Some collections like "fluent-color" have a dash. 
                // "fluent.color" is likely invalid unless mapped.
                // We trust the search result gave us valid "prefix:name".
                
                let svg = await fetchIconSvg(iconName);
                if (options?.applyColor && options?.color) {
                    svg = withColorCustomization(svg, options.color, Boolean(options.forceMonochrome));
                }
                
                // Safe split for filename: replace colon with dash or keep structure
                const [prefix, ...nameParts] = iconName.split(":");
                const name = nameParts.join("-");
                
                const fileName = `${prefix}-${name}.svg`;
                const targetDir = options?.organizeByPrefix ? path.join(baseDir, prefix) : baseDir;
                if (options?.organizeByPrefix) {
                    await fs.ensureDir(targetDir);
                }
                const filePath = path.join(targetDir, fileName);
                await fs.writeFile(filePath, svg);
                results.push(filePath);
                onProgress?.(results.length, total, iconName);
            } catch (err: any) {
                console.error(`Failed to save ${iconName}: ${err.message}`);
                throw new Error(`Failed to save ${iconName}: ${err.message}`);
            }
        }
        if (options?.zipEnabled) {
            const zipName = options?.zipName ? sanitizeZipName(options.zipName) : `icons-${Date.now()}`;
            const zipPath = path.join(baseDir, `${zipName}.zip`);
            await createZipFromFiles(results, baseDir, zipPath);
            results.push(zipPath);
        }

        return results;
    },

    /**
     * Saves icons grouped in Iconify-compatible JSON collections
     */
    async saveAsJSON(
        icons: string[],
        outputDir: string,
        options?: DownloadCustomizationOptions,
        onProgress?: (current: number, total: number, iconName: string) => void
    ): Promise<string[]> {
        const collections: Record<string, any> = {};

        const total = icons.length;
        let completed = 0;
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
                completed += 1;
                onProgress?.(completed, total, iconName);
            } catch (err: any) {
                console.error(`Failed to parse ${iconName}: ${err.message}`);
                throw new Error(`Failed to parse ${iconName}: ${err.message}`);
            }
        }

        const baseDir =
            options?.subfolder && sanitizeFolderName(options.subfolder)
                ? path.join(outputDir, sanitizeFolderName(options.subfolder))
                : outputDir;
        await fs.ensureDir(baseDir);
        const savedFiles: string[] = [];

        for (const [prefix, data] of Object.entries(collections)) {
            const filePath = path.join(baseDir, `${prefix}.json`);
            await fs.writeJson(filePath, data, { spaces: 2 });
            savedFiles.push(filePath);
        }

        if (options?.zipEnabled) {
            const zipName = options?.zipName ? sanitizeZipName(options.zipName) : `collections-${Date.now()}`;
            const zipPath = path.join(baseDir, `${zipName}.zip`);
            await createZipFromFiles(savedFiles, baseDir, zipPath);
            savedFiles.push(zipPath);
        }

        return savedFiles;
    },

    /**
     * Generate IconProvider logic adapted for Electron
     * (Previously in src/utils/generateIconProvider.ts)
     */
    async generateIconProvider(iconDir: string, genDir: string, useTypescript: boolean): Promise<string> {
        if (!fs.existsSync(iconDir)) {
            throw new Error(`Directory ${iconDir} doesn't exist.`);
        }

        const files = fs.readdirSync(iconDir).filter((f: string) => f.endsWith(".json"));
        if (files.length < 1) {
            throw new Error(`${iconDir} has no json files`);
        }

        // normalize icondir for import (relative path logic might need adjustment for the generated file)
        // For the generated file, we probably want to use a relative import from the provider file to the json files
        // But since this is running in Electron Main, we just need to write the file content string correct.

        // Assumption: iconDir is relative to where the provider will be or we use aliases.
        // For simplicity, let's assume standard structure:
        // src/generated/IconProvider.tsx
        // src/collections/mdi.json

        // This part might need refinement based on where the user wants to save things.
        // Let's stick to the current logic but ensure paths are safer.

        let relativeIconDir = path.relative(genDir, iconDir).replace(/\\/g, '/');
        if (!relativeIconDir.startsWith('.')) {
            relativeIconDir = './' + relativeIconDir;
        }

        const importLines = files
            .map((file: string) => {
                const varName = path.basename(file, ".json").replace(/[-\s]/g, "_");
                return `import ${varName} from "${relativeIconDir}/${file}";`;
            })
            .join("\n");

        const iconVars = files.map((file: string) => path.basename(file, ".json").replace(/[-\s]/g, "_")).join(", ");

        const output = `\
"use client";
import { addCollection } from "@iconify/react";
${importLines}
[${iconVars}].forEach(icons=>addCollection(icons))
`;

        const outputPath = path.join(genDir, `IconProvider.${useTypescript ? "tsx" : "jsx"}`);
        await fs.ensureDir(path.dirname(outputPath));
        await fs.writeFile(outputPath, output);

        return outputPath;
    }
};
