//@flow

import * as db from './general';
import type { Id } from '../metamodel/general';
import type { UfobModel } from '../metamodel/ufob';
import * as ufobMeta from '../metamodel/ufob';
import * as ufobModel from '../model/ufob';
import { error } from '../logging';

const ufobFname = "../data/ufob.json";
const ufobGraphicsFname = "../data/ufob-graphics.json";

// Model {{{1

export function getModel(): Promise<any> {
  return db.getModel(ufobFname, ufobMeta);
}

export function getGraphics(): Promise<any> {
  return db.getGraphics(ufobGraphicsFname);
}

export function saveGraphics(graphics: any): Promise<any> {
  return db.saveGraphics(ufobGraphicsFname, graphics);
}

export function graphicsDelete(): Promise<any> {
  return db.graphicsDelete(ufobGraphicsFname);
}

export function writeModel(model: UfobModel): Promise<any> {
  return db.writeModel(ufobFname, model);
}

// Event {{{1

export function updateEvent(updatedEvent: any): Promise<any> {
  return db.fileOpWithLock(ufobFname, new Promise((resolve, reject) => {
    getModel().then(
      model => {
        ufobModel.updateEvent(model, updatedEvent);
        const validity = ufobMeta.validateModel(model);
        if (validity.errors) {
          error("Consistency error: updating of event " + updatedEvent.ev_id + " with " + JSON.stringify(updatedEvent) + " would brake the model.");
          reject("Error on UFOB-B event updating.");
        } else {
          writeModel(model).then(
            ()    => resolve(),
            error => reject(error)
          );
        }
      },
      error => reject(error)
    );
  }));
}

export function deleteEvent(ev_id: Id): Promise<any> {
  return db.fileOpWithLock(ufobFname, new Promise((resolve, reject) => {
    getModel().then(
      model => {
        ufobModel.deleteEvent(model, ev_id);
        writeModel(model).then(
          () => deleteElementGraphics(ev_id).then(
            ()    => resolve(),
            error => reject(error)
          ),
          error => reject(error)
        );
     }
    );
  }));
}

// Situation {{{1

export function updateSituation(updatedSituation: any): Promise<any> {
  return db.fileOpWithLock(ufobFname, new Promise((resolve, reject) => {
    getModel().then(
      model => {
        ufobModel.updateSituation(model, updatedSituation);
        const validity = ufobMeta.validateModel(model);
        if (validity.errors) {
          error("Consistency error: updating of situation " + updatedSituation.s_id + " with " + JSON.stringify(updatedSituation) + " would brake the model.");
          reject("Error on UFOB-B situation updating.");
        } else {
          writeModel(model).then(
            ()    => resolve(),
            error => reject(error)
          );
        }
      }, 
      error => reject(error)
    );
  }));
}

export function deleteSituation(s_id: Id): Promise<any> {
  return db.fileOpWithLock(ufobFname, new Promise((resolve, reject) => {
    getModel().then(
      model => {
        ufobModel.deleteSituation(model, s_id);
        writeModel(model).then(
          () => deleteElementGraphics(s_id).then(
            ()    => resolve(),
            error => reject(error)
          ),
          error => reject(error)
        );
      }
    );
  }));
}

// Graphics {{{1

function deleteElementGraphics(elId: Id): Promise<any> {
  return db.graphicsElementDelete(ufobGraphicsFname, elId);
}

// Hooks {{{1

export function entityDeletionHook(e_id: Id): Promise<any> {
  return db.fileOpWithLock(ufobFname, new Promise((resolve, reject) => {
    getModel().then(
      model => {
        const model2 = ufobModel.entityDeletionHook(model, e_id);
        writeModel(model2).then(
          ()    => resolve(),
          error => reject(error)
        );
      }
    );
  }));
}

