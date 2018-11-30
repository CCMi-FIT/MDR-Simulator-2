//@flow

import * as R from 'ramda';
import * as fs from 'fs';
import { lock } from 'proper-lockfile';
import * as db from './general';
import type { RestResult } from './general';
import type { Id, Situation, EventB, UfobModel } from '../metamodel/ufob';
import * as ufobMeta from '../metamodel/ufob';
import * as ufobModel from '../model/ufob';

const ufobFname = "../data/ufob.json";
const ufobGraphicsFname = "../data/ufob-graphics.json";

// Model

export function getModel(): Promise<any> {
  return db.getModel(ufobFname, ufobMeta);
}

export function getGraphics(): Promise<any> {
  return db.getGraphics(ufobGraphicsFname);
}

export function saveGraphics(graphics: any, next: (RestResult) => void): Promise<any> {
  return db.saveGraphics(ufobGraphicsFname, graphics, next);
}

export function graphicsDelete(): Promise<any> {
  return db.graphicsDelete(ufobGraphicsFname);
}

export function writeModel(model: UfobModel) {
  db.writeModel(model, ufobFname);
}

// Event

export function updateEvent(updatedEvent: any, next: (RestResult) => void) {
  lock(ufobFname).then((release) => {
    loadSetSaveEvent(updatedEvent, next);
    return release();
  });
}

function loadSetSaveEvent(updatedEvent: any, next: (RestResult) => void) {
  getModel().then((model) => {
    ufobModel.updateEvent(model, updatedEvent);
    const validity = ufobMeta.validateModel(model);
    if (validity.errors) {
      console.error("Consistency error: updating of event " + updatedEvent.ev_id + " with " + JSON.stringify(updatedEvent) + " would brake the model.");
      next({"error": "Internal server error on UFOB-B event updating."});
    } else {
      writeModel(model);
      next({"result": "ok"});
    }
  }, (error) => { next({ "error": error, "ev_id": updatedEvent.ev_id }); });
}

export function deleteEvent(ev_id: Id, next: (RestResult) => void) {
  lock(ufobFname).then((release) => {
    getModel().then((model) => {
      ufobModel.deleteEvent(model, ev_id);
      writeModel(model);
      next({"result": "ok"});
    });
    return release();
  });
}

// Situation

export function updateSituation(updatedSituation: any, next: (RestResult) => void) {
  lock(ufobFname).then((release) => {
    loadSetSaveSituation(updatedSituation, next);
    return release();
  });
}

function loadSetSaveSituation(updatedSituation: any, next: (RestResult) => void) {
  getModel().then((model) => {
    ufobModel.updateSituation(model, updatedSituation);
    const validity = ufobMeta.validateModel(model);
    if (validity.errors) {
      console.error("Consistency error: updating of situation " + updatedSituation.s_id + " with " + JSON.stringify(updatedSituation) + " would brake the model.");
      next({"error": "Internal server error on UFOB-B situation updating."});
    } else {
      writeModel(model);
      next({"result": "ok"});
    }
  }, (error) => { next({ "error": error, "s_id": updatedSituation.s_id }); });
}

export function deleteSituation(s_id: Id, next: (RestResult) => void) {
  lock(ufobFname).then((release) => {
    getModel().then((model) => {
      ufobModel.deleteSituation(model, s_id);
      writeModel(model);
      next({"result": "ok"});
    });
    return release();
  });
}

