import fs from "fs-extra";
import path from "path";

const projectRoot = process.cwd();

const generateIconProvider = async (iconDir: string, genDir: string, useTypescript: boolean) => {
  if (!fs.existsSync(path.join(projectRoot, iconDir))) {
    console.error(`${iconDir} doesn't exists.`);
    return;
  }
  const files = fs.readdirSync(iconDir).filter((f) => f.endsWith(".json"));
  if (files.length < 1) {
    console.error(`${iconDir} has no json files`);
    return;
  }
  // normalize icondir for using it in provider import
  iconDir = /^[a-zA-Z]/.test(iconDir) ? `./${iconDir}` : iconDir;

  const importLines = files
    .map((file) => {
      const varName = path.basename(file, ".json").replace(/[-\s]/g, "_");
      return `import ${varName} from "${iconDir}/${file}";`;
    })
    .join("\n");

  const iconVars = files.map((file) => path.basename(file, ".json").replace(/[-\s]/g, "_")).join(", ");

  const output = `\
"use client";
import { addCollection } from "@iconify/react";
${importLines}
[${iconVars}].forEach(icons=>addCollection(icons))
`;

  const outputPath = path.join(projectRoot, genDir, `IconProvider.${useTypescript ? "tsx" : "jsx"}`);
  fs.ensureDirSync(path.dirname(outputPath));
  fs.writeFileSync(outputPath, output);

  console.log(`✅ Iconify Icon Provider Generated: ${outputPath}`);
};

export default generateIconProvider;
