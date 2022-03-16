const { Parcel } = require("@parcel/core");
const fs = require("fs");
const path = require("path");

const outputName = "tldraw";
const distDir = "dist";
const distEntry = `${outputName}.js`;
const entryFilePath = path.join(__dirname, "main.js");
const entryFileContent = fs.readFileSync(entryFilePath, "utf-8");

const bundler = new Parcel({
  entries: "main.js",
  defaultConfig: "@parcel/config-default",
  mode: "production",
  targets: {
    main: {
      engines: {},
      distDir,
      distEntry,
      includeNodeModules: false
    }
  },
  defaultTargetOptions: {
    shouldOptimize: true,
    shouldScopeHoist: true,
    sourceMaps: false
  }
});

function injectContent() {
  const stringsFolder = path.join(__dirname, "strings");
  const stringsFiles = fs.readdirSync(stringsFolder);
  const localizedText = {};

  stringsFiles.forEach(fileName => {
    if (path.extname(fileName) !== ".strings") {
      return;
    }

    const locale = fileName.replace(".strings", "");
    localizedText[locale] = {};

    const filePath = path.join(stringsFolder, fileName);
    const content = fs.readFileSync(filePath, "utf-8");
    const lines = content.split(/\r?\n/);
    lines.forEach(line => {
      const match = /[\"'](.+)[\"'][ \n]*=[ \n]*[\"'](.+)[\"']/.exec(line);
      if (match) {
        localizedText[locale][match[1]] = match[2];
      }
    });
  });

  const stringsText = `$app.strings = ${JSON.stringify(localizedText)};`;
  const configFile = fs.readFileSync(path.join(__dirname, "config.json"), "utf-8");
  const configDict = JSON.parse(configFile).settings;
  const configText = Object.keys(configDict).map(key => {
    const value = (() => {
      const value = configDict[key];
      if (typeof value === "string") {
        return `"${value}"`;
      } else {
        return value;
      }
    })();
    return `$app.${key} = ${value};`;
  }).join("\n");

  const contents = [
    stringsText,
    configText,
    entryFileContent
  ]

  fs.writeFileSync(entryFilePath, contents.join("\n\n"));
}

function cleanUp() {
  fs.writeFileSync(entryFilePath, entryFileContent);
}

function buildTextActions() {
  const script = fs.readFileSync(path.join(__dirname, distDir, distEntry), "utf-8");
  const filePath = path.join(__dirname, "template.json");
  const fileContent = fs.readFileSync(filePath, "utf-8");
  const textActions = JSON.parse(fileContent);
  textActions.actions[2].parameters.script.value = script;
  const outputPath = path.join(__dirname, `dist/${outputName}.json`);
  fs.writeFileSync(outputPath, JSON.stringify(textActions, null, 2));
}

async function build() {
  injectContent();
  try {
    const { bundleGraph, buildTime } = await bundler.run();
    const bundles = bundleGraph.getBundles();
    console.log(`🔥  Built ${bundles.length} bundles in ${buildTime}ms!`);
  } catch (error) {
    console.log(error.diagnostics);
  }

  buildTextActions();
  cleanUp();
}

build();