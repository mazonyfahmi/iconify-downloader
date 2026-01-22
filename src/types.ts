type IconFormat = "svg" | "json";

interface DownloadOptions {
  outputDir?: string;
  format?: IconFormat;
}
interface ParsedIconData {
  prefix: string;
  name: string;
  body: string;
  width: number;
  height: number;
}

export type { IconFormat, DownloadOptions, ParsedIconData };
