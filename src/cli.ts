#!/usr/bin/env node

import { Command } from "commander";
import downloadIcons from "./main";
import generateIconProvider from "./utils/generateIconProvider";

const program = new Command();

program
  .name("iconify-downloader")
  .description("Download icons from Iconify in SVG or JSON format.")
  .option("-i, --icons <icons...>", "Icon names (e.g., logos:react skill-icons:javascript)")
  .option("-o, --output <dir>", "Output directory (defaults: svg-> icons, json -> collections)")
  .option("-f, --format <format>", "Output format: svg | json", "svg")
  .option(
    "-g, --generate [dir]",
    "Generate IconProvider (optional: Provider get generated to cwd if no value passed )\n Icon sets directory can be passed with -o,--output flag default to ./collections"
  )
  .option("-t,--use-typescript [format]", "Used along with --generate to use typescript (IconProvider.tsx) Provider")
  .parse(process.argv);

const options = program.opts();

(async () => {
  try {
    if (!options.icons && !options.generate) {
      console.error("❌ Error: --icons option is required unless using --generate");
      process.exit(1);
    }

    if (options.icons) {
      await downloadIcons(options.icons, {
        outputDir: options.output,
        format: options.format,
      });
    }
    if (options.generate) {
      generateIconProvider(options.output || "./collections", options.generate === true ? "." : options.generate, options.useTypescript);
    }
  } catch (err: any) {
    console.error("❌ Error:", err.message);
    process.exit(1);
  }
})();
