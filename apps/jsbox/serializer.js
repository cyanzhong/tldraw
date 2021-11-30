const fs = require("fs");
const path = require("path");

const files = {};
["index.html"].forEach(filename => {
  files[filename] = fs.readFileSync(path.join(__dirname, filename), "utf-8");
})

const outputPath = path.join(__dirname, "files.js");
fs.writeFileSync(outputPath, JSON.stringify(files));