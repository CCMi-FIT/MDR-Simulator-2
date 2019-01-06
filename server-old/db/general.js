//@flow

import * as fs from 'fs';
import { lock } from 'proper-lockfile';
import type { Id } from '../metamodel/general';
import { error } from '../logging';

export function fileOpWithLock(fname: string, opP: Promise<any>): Promise<any> {
  return new Promise((resolve, reject) => {
    lock(fname).then(release => {
      opP.then(
        ()    => { 
          release();
          resolve();
        },
        error => {
          release();
          error(fname + ": locking of file failed");
          reject(error);
        }
      );
    });
  });
}

// Model

export function getModel(fname: string, meta: any): Promise<any> {
  return new Promise((resolve, reject) => {
    const model  = JSON.parse(fs.readFileSync(fname, 'utf8'));
    //console.dir(model.events);
    const validity  = meta.validateModel(model);
    //const validity = true;
    //console.warn("Validation disabled");
    if (!model) {
      error("Error reading model " + fname);
      reject();
    } else if (validity.errors) {
      error(fname + ": model not valid:");
      error(validity.errors);
      reject();
    } else {
      resolve(model);
    }
  });
}

export function getGraphics(fname: string): Promise<any> {
  return new Promise((resolve, reject) => {
    fs.readFile(fname, (err, data) => {
      if (err) {
        error(`Error reading UFO-A graphics file: ${err.message}`);
        reject(err.message);
      } else {
        try {
          let graphics = JSON.parse(data);
          resolve(graphics);
        } catch (SyntaxError) { 
          error(fname + ": graphics file corrupted");
          reject(fname + ": graphics file corrupted");
        }
      }
    });
  });
}

export function writeModel(fname: string, model: any): Promise<any> {
  return new Promise((resolve, reject) => {
    fs.writeFile(fname, JSON.stringify(model, null, 2), err => {
      if (err) {
        error("Error writing model: " + err.message);
        reject(err.message);
      } else {
        resolve();
      }
    });
  });
}

export function saveGraphics(fname: string, graphics: any): Promise<any> {
  return writeModel(fname, graphics);
}

export function graphicsDelete(fname: string): Promise<any> {
  return writeModel(fname, {});
}
  
export function graphicsElementDelete(fname: string, elId: Id): Promise<any> {
  return fileOpWithLock(fname, new Promise((resolve, reject) => {
    let model  = JSON.parse(fs.readFileSync(fname, 'utf8'));
    delete model[elId];
    writeModel(fname, model).then(
      ()    => resolve(),
      error => reject(error)
    );
  }));
}

