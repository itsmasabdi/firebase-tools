import * as _ from "lodash";
import * as fs from "fs";
import * as path from "path";

import { askInstallDependencies } from "./npm-dependencies";
import { prompt } from "../../../prompt";

const TEMPLATE_ROOT = path.resolve(__dirname, "../../../../templates/init/functions/python/");
const MAIN_TEMPLATE = fs.readFileSync(path.join(TEMPLATE_ROOT, "main.py"), "utf8");
const PACKAGE_LINTING_TEMPLATE = fs.readFileSync(
  path.join(TEMPLATE_ROOT, "package.lint.json"),
  "utf8"
);
const PACKAGE_NO_LINTING_TEMPLATE = fs.readFileSync(
  path.join(TEMPLATE_ROOT, "package.nolint.json"),
  "utf8"
);
const ESLINT_TEMPLATE = fs.readFileSync(path.join(TEMPLATE_ROOT, "_eslintrc"), "utf8");
const GITIGNORE_TEMPLATE = fs.readFileSync(path.join(TEMPLATE_ROOT, "_gitignore"), "utf8");

export function setup(setup: any, config: any): Promise<any> {
  return prompt(setup.functions, [
    {
      name: "lint",
      type: "confirm",
      message: "Do you want to use ESLint to catch probable bugs and enforce style?",
      default: false,
    },
  ])
    .then(() => {
      if (setup.functions.lint) {
        _.set(setup, "config.functions.predeploy", ['npm --prefix "$RESOURCE_DIR" run lint']);
        return config
          .askWriteProjectFile("functions/package.json", PACKAGE_LINTING_TEMPLATE)
          .then(() => {
            config.askWriteProjectFile("functions/.eslintrc.js", ESLINT_TEMPLATE);
          });
      }
      return config.askWriteProjectFile("functions/package.json", PACKAGE_NO_LINTING_TEMPLATE);
    })
    .then(() => {
      return config.askWriteProjectFile("functions/index.js", MAIN_TEMPLATE);
    })
    .then(() => {
      return config.askWriteProjectFile("functions/.gitignore", GITIGNORE_TEMPLATE);
    })
    .then(() => {
      return askInstallDependencies(setup.functions, config);
    });
}
