//@flow

import * as R from 'ramda';
import * as fs from 'fs';
import { lock } from 'proper-lockfile';
import type { UfobModel, Situation } from '../metamodel/ufob';
import * as ufobMeta from '../metamodel/ufob';
import * as ufobModel from '../model/ufob';

const ufobFname = "../data/ufob.json";
const ufobEntityGraphicsFname = "../data/ufob-graphics.json";

type RestResult = { result: string } | { error: string};

// Model

export function getModel(): Promise<any> {
  return new Promise((resolve, reject) => {
    const model  = JSON.parse(fs.readFileSync(ufobFname, 'utf8'));
    const validity  = ufobMeta.validateModel(model);
    //const validity = true;
    //console.warn("Validation disabled");
    if (!model) {
      console.error("Error reading UFO-B model.");
      reject();
    } else if (validity.errors) {
      console.error("UFO-B model not valid:");
      console.error(validity.errors);
      reject(validity.errors);
    } else {
      resolve(model);
    }
  });
}

export function getGraphics(): Promise<any> {
  return new Promise((resolve, reject) => {
    fs.readFile(ufobEntityGraphicsFname, (err, data) => {
      if (err) {
        reject(err.message);
      } else {
        try {
          let entityGraphics = JSON.parse(data);
          resolve(entityGraphics);
        } catch (SyntaxError) { 
          reject("UFO-B graphics file corrupted");
        }
      }
    });
  });
}

export function writeModel(model: UfobModel) {
  fs.writeFileSync(ufobFname, JSON.stringify(model, null, 2), 'utf8');
}


