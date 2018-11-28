//@flow

import * as R from 'ramda';
import * as fs from 'fs';

export type RestResult = { result: string } | { error: string};

// Model

export function getModel(fname: string, meta: any): Promise<any> {
  return new Promise((resolve, reject) => {
    const model  = JSON.parse(fs.readFileSync(fname, 'utf8'));
    //console.dir(model.events);
    const validity  = meta.validateModel(model);
    //const validity = true;
    //console.warn("Validation disabled");
    if (!model) {
      console.error("Error reading model " + fname);
      reject();
    } else if (validity.errors) {
      console.error(fname + ": model not valid:");
      console.error(validity.errors);
      reject(validity.errors);
    } else {
      resolve(model);
    }
  });
}

export function getGraphics(fname): Promise<any> {
  return new Promise((resolve, reject) => {
    fs.readFile(fname, (err, data) => {
      if (err) {
        reject(err.message);
      } else {
        try {
          let graphics = JSON.parse(data);
          resolve(graphics);
        } catch (SyntaxError) { 
          reject(fname + ": graphics file corrupted");
        }
      }
    });
  });
}

export function graphicsDelete(fname: string): Promise<any> {
  return new Promise((resolve, reject) => {
    fs.writeFile(fname, "{}", (err) => {
      if (err) {
        reject({ "error": err.message });
      } else {
        resolve({ "result": "success" });
      }
    });
  });
}

export function writeModel(model: any, fname: string) {
  fs.writeFileSync(fname, JSON.stringify(model, null, 2), 'utf8');
}

