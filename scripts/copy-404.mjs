import { copyFileSync, existsSync } from "node:fs";

const src = "dist/index.html";
const dst = "dist/404.html";
if (existsSync(src)) {
  copyFileSync(src, dst);
  console.log("created dist/404.html");
}