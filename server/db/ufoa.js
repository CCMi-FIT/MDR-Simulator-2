//@flow

import * as R from 'ramda';
import * as fs from 'fs';
import { lock } from 'proper-lockfile';
import type { Id, EntityType, UfoaEntity, Generalisation, UfoaModel } from '../metamodel/ufoa';
import * as ufoaMeta from '../metamodel/ufoa';
import * as ufoaModel from '../model/ufoa';

const ufoaFname = "../data/ufoa.json";
const ufoaEntityGraphicsFname = "../data/ufoa-entity-graphics.json";

// Model

export function getModel(): Promise<any> {
  return new Promise((resolve, reject) => {
    const model  = JSON.parse(fs.readFileSync(ufoaFname, 'utf8'));
    const validity  = ufoaMeta.validateModel(model);
    //const validity = true;
    //console.warn("Validation disabled");
    if (!model) {
      console.error("Error reading UFO-A model.");
      reject();
    } else if (validity.errors) {
      console.error("UFO-A model not valid:");
      console.error(validity.errors);
      reject(validity.errors);
    } else {
      resolve(model);
    }
  });
}

export function getEntityGraphics(): Promise<any> {
  return new Promise((resolve, reject) => {
    fs.readFile(ufoaEntityGraphicsFname, (err, data) => {
      if (err) {
        reject(err.message);
      } else {
        try {
          let entityGraphics = JSON.parse(data);
          resolve(entityGraphics);
        } catch (SyntaxError) { 
          reject("UFO-A entity graphics file corrupted");
        }
      }
    });
  });
}

type RestResult = { result: string } | { error: string};

export function writeModel(model: UfoaModel) {
  fs.writeFileSync(ufoaFname, JSON.stringify(model, null, 2), 'utf8');
}

// Entities

export function updateEntity(updatedEntity: any, next: (RestResult) => void) {
  lock(ufoaFname).then((release) => {
    loadSetSaveEntity(updatedEntity, next);
    return release();
  });
}

export function saveEntityGraphics(entityGraphics: any, next: (RestResult) => void) {
  lock(ufoaFname).then((release) => {
    fs.writeFile(ufoaEntityGraphicsFname, JSON.stringify(entityGraphics, null, 2), (err) => {
      if (err) {
        next({ "error": err.message });
      } else {
        next({"result": "ok"});
      }
      return release();
    });
  });
}

function loadSetSaveEntity(updatedEntity: any, next: (RestResult) => void) {
  getModel().then((model) => {
    ufoaModel.updateEntity(model, updatedEntity);
    const validity = ufoaMeta.validateModel(model);
    if (validity.errors) {
      console.error("Consistency error: updating of entity " + updatedEntity.e_id + " with " + JSON.stringify(updatedEntity) + " would brake the model.");
      next({"error": "Internal server error on UFOA-A entity updating."});
    } else {
      writeModel(model);
      next({"result": "ok"});
    }
  }, (error) => { next({ "error": error, "e_id": updatedEntity.e_id }); });
}

export function deleteEntity(e_id: Id, next: (RestResult) => void) {
  lock(ufoaFname).then((release) => {
    getModel().then((model) => {
      ufoaModel.deleteEntity(model, e_id);
      writeModel(model);
      next({"result": "ok"});
    });
    return release();
  });
}

//TODO zkusit abstrahovat lock na withLock

// Generalisations

export function updateGeneralisation(updatedGeneralisation: any, next: (RestResult) => void) {
  lock(ufoaFname).then((release) => {
    loadSetSaveGeneralisation(updatedGeneralisation, next);
    return release();
  });
}

function loadSetSaveGeneralisation(updatedGeneralisation: any, next: (RestResult) => void) {
  getModel().then((model) => {
    ufoaModel.updateGeneralisation(model, updatedGeneralisation);
    const validity = ufoaMeta.validateModel(model);
    if (!validity) {
      console.error("Consistency error: updating of generalisation " + updatedGeneralisation.g_id + " with " + JSON.stringify(updatedGeneralisation) + " would brake the model.");
      next({"error": "Internal server error on UFOA-A generalisation updating."});
    } else {
      writeModel(model);
      next({"result": "ok"});
    }
  }, (error) => { next({ "error": error, "g_id": updatedGeneralisation.g_id }); });
}

export function deleteGeneralisation(g_id: Id, next: (RestResult) => void) {
  lock(ufoaFname).then((release) => {
    getModel().then((model) => {
      ufoaModel.deleteGeneralisation(model, g_id);
      writeModel(model);
      next({"result": "ok"});
    });
    return release();
  });
}

// Associations

export function updateAssociation(updatedAssociation: any, next: (RestResult) => void) {
  lock(ufoaFname).then((release) => {
    loadSetSaveAssociation(updatedAssociation, next);
    return release();
  });
}

function loadSetSaveAssociation(updatedAssociation: any, next: (RestResult) => void) {
  getModel().then((model) => {
    ufoaModel.updateAssociation(model, updatedAssociation);
    const validity = ufoaMeta.validateModel(model);
    if (validity.errors) {
      console.error("Consistency error: updating of association " + updatedAssociation.a_id + " with " + JSON.stringify(updatedAssociation) + " would brake the model.");
      next({"error": "Internal server error on UFOA-A association updating."});
    } else {
      writeModel(model);
      next({"result": "ok"});
    }
  }, (error) => { next({ "error": error, "a_id": updatedAssociation.a_id }); });
}

export function deleteAssociation(a_id: Id, next: (RestResult) => void) {
  lock(ufoaFname).then((release) => {
    getModel().then((model) => {
      ufoaModel.deleteAssociation(model, a_id);
      writeModel(model);
      next({"result": "ok"});
    });
    return release();
  });
}


