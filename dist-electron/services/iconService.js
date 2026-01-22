"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.IconService = void 0;
const axios_1 = __importDefault(require("axios"));
const fs = __importStar(require("fs-extra"));
const node_html_parser_1 = require("node-html-parser");
const path_1 = __importDefault(require("path"));
const archiver_1 = __importDefault(require("archiver"));
function sanitizeFolderName(input) {
    return input.replace(/[<>:"/\\|?*]/g, "-").trim();
}
function sanitizeZipName(input) {
    const normalized = input.trim().replace(/[<>:"/\\|?*]/g, "-");
    const withoutExt = normalized.toLowerCase().endsWith(".zip") ? normalized.slice(0, -4) : normalized;
    return withoutExt.length ? withoutExt : "icons";
}
function withColorCustomization(svg, color, forceMonochrome) {
    const root = (0, node_html_parser_1.parse)(svg);
    const svgEl = root.querySelector("svg");
    if (!svgEl)
        return svg;
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
async function createZipFromFiles(filePaths, baseDir, zipPath) {
    await fs.ensureDir(path_1.default.dirname(zipPath));
    await new Promise((resolve, reject) => {
        const output = fs.createWriteStream(zipPath);
        const zip = (0, archiver_1.default)("zip", { zlib: { level: 9 } });
        output.on("close", () => resolve());
        output.on("error", (err) => reject(err));
        zip.on("error", (err) => reject(err));
        zip.pipe(output);
        for (const filePath of filePaths) {
            const rel = path_1.default.relative(baseDir, filePath).replace(/\\/g, "/");
            zip.file(filePath, { name: rel });
        }
        zip.finalize().catch(reject);
    });
}
/**
 * Downloads a single icon as SVG string
 */
async function fetchIconSvg(iconName) {
    const url = `https://api.iconify.design/${iconName}.svg`;
    const response = await axios_1.default.get(url);
    return response.data;
}
/**
 * Parses an SVG string to extract body and metadata for JSON collection
 */
function parseSvgForJson(svg, iconName) {
    const root = (0, node_html_parser_1.parse)(svg);
    const svgEl = root.querySelector("svg");
    if (!svgEl) {
        throw new Error("Invalid SVG structure");
    }
    const body = svgEl.innerHTML.trim();
    const [, , width, height] = (svgEl.getAttribute("viewBox") || "0 0 24 24").split(" ").map(Number);
    const [prefix, name] = iconName.split(":");
    return { prefix, name, body, width, height };
}
exports.IconService = {
    /**
     * Saves icons as individual SVG files
     */
    async saveAsSVGs(icons, outputDir, options, onProgress) {
        const baseDir = options?.subfolder && sanitizeFolderName(options.subfolder)
            ? path_1.default.join(outputDir, sanitizeFolderName(options.subfolder))
            : outputDir;
        await fs.ensureDir(baseDir);
        const results = [];
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
                const targetDir = options?.organizeByPrefix ? path_1.default.join(baseDir, prefix) : baseDir;
                if (options?.organizeByPrefix) {
                    await fs.ensureDir(targetDir);
                }
                const filePath = path_1.default.join(targetDir, fileName);
                await fs.writeFile(filePath, svg);
                results.push(filePath);
                onProgress?.(results.length, total, iconName);
            }
            catch (err) {
                console.error(`Failed to save ${iconName}: ${err.message}`);
                throw new Error(`Failed to save ${iconName}: ${err.message}`);
            }
        }
        if (options?.zipEnabled) {
            const zipName = options?.zipName ? sanitizeZipName(options.zipName) : `icons-${Date.now()}`;
            const zipPath = path_1.default.join(baseDir, `${zipName}.zip`);
            await createZipFromFiles(results, baseDir, zipPath);
            results.push(zipPath);
        }
        return results;
    },
    /**
     * Saves icons grouped in Iconify-compatible JSON collections
     */
    async saveAsJSON(icons, outputDir, options, onProgress) {
        const collections = {};
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
            }
            catch (err) {
                console.error(`Failed to parse ${iconName}: ${err.message}`);
                throw new Error(`Failed to parse ${iconName}: ${err.message}`);
            }
        }
        const baseDir = options?.subfolder && sanitizeFolderName(options.subfolder)
            ? path_1.default.join(outputDir, sanitizeFolderName(options.subfolder))
            : outputDir;
        await fs.ensureDir(baseDir);
        const savedFiles = [];
        for (const [prefix, data] of Object.entries(collections)) {
            const filePath = path_1.default.join(baseDir, `${prefix}.json`);
            await fs.writeJson(filePath, data, { spaces: 2 });
            savedFiles.push(filePath);
        }
        if (options?.zipEnabled) {
            const zipName = options?.zipName ? sanitizeZipName(options.zipName) : `collections-${Date.now()}`;
            const zipPath = path_1.default.join(baseDir, `${zipName}.zip`);
            await createZipFromFiles(savedFiles, baseDir, zipPath);
            savedFiles.push(zipPath);
        }
        return savedFiles;
    },
    /**
     * Generate IconProvider logic adapted for Electron
     * (Previously in src/utils/generateIconProvider.ts)
     */
    async generateIconProvider(iconDir, genDir, useTypescript) {
        if (!fs.existsSync(iconDir)) {
            throw new Error(`Directory ${iconDir} doesn't exist.`);
        }
        const files = fs.readdirSync(iconDir).filter((f) => f.endsWith(".json"));
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
        let relativeIconDir = path_1.default.relative(genDir, iconDir).replace(/\\/g, '/');
        if (!relativeIconDir.startsWith('.')) {
            relativeIconDir = './' + relativeIconDir;
        }
        const importLines = files
            .map((file) => {
            const varName = path_1.default.basename(file, ".json").replace(/[-\s]/g, "_");
            return `import ${varName} from "${relativeIconDir}/${file}";`;
        })
            .join("\n");
        const iconVars = files.map((file) => path_1.default.basename(file, ".json").replace(/[-\s]/g, "_")).join(", ");
        const output = `\
"use client";
import { addCollection } from "@iconify/react";
${importLines}
[${iconVars}].forEach(icons=>addCollection(icons))
`;
        const outputPath = path_1.default.join(genDir, `IconProvider.${useTypescript ? "tsx" : "jsx"}`);
        await fs.ensureDir(path_1.default.dirname(outputPath));
        await fs.writeFile(outputPath, output);
        return outputPath;
    }
};
