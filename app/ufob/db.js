// @flow

import type { Id } from '../metamodel';
import type { Situation, UfobEvent, UfobModel } from './metamodel';
import * as ufobMeta from './metamodel';
import * as urls from "./urls";
import * as ufobModel from './model';
import { getData, postData } from '../db';

// Model {{{1

var model: UfobModel = ufobMeta.emptyModel;

export function loadModel(): Promise<any> {
  return new Promise((resolve, reject) => {
    getData(urls.clientURL(urls.ufobGetModel)).then(data => {
      model = data;
      resolve(data);
    }, (error) => reject(error));
  });
}

export function loadGraphics(): Promise<any> {
  return getData(urls.clientURL(urls.ufobGetGraphics));
}

export function saveGraphics(graphics: any): Promise<any> {
  return postData(urls.clientURL(urls.ufobGraphicsSave), { graphics: JSON.stringify(graphics) });
}

// Events {{{1

export function getEvents(): Array<UfobEvent> {
  return model.events;
}

export function getUfobEventById(ev_id: Id): ?UfobEvent {
  const res = ufobModel.getUfobEventById(model, ev_id);
  if (!res) {
    console.error(`UFO-B database inconsistency: ev_id ${ev_id} not found.`);
  }
  return res; 
}

export function newEvent(ev_name: string, s_id: Id): UfobEvent {
  return ufobModel.newEvent(model, ev_name, s_id);
}

export function updateEvent(updatedEvent: UfobEvent): Promise<any> {
  return new Promise((resolve, reject) => {
    let validity = ufobModel.updateEvent(model, updatedEvent);
    if (validity.errors) {
      reject("Event update failed: " + validity.errors);
    } else {
      postData(urls.clientURL(urls.ufobEventUpdate), { event: JSON.stringify(updatedEvent)}).then(
        result => resolve(result),
        error => reject(error)
      );
    }
  });
}

export function deleteEvent(ev_id: Id): Promise<any> {
  return new Promise((resolve, reject) => {
    ufobModel.deleteEvent(model, ev_id);
    postData(urls.clientURL(urls.ufobEventDelete), { ev_id }).then(
      result => resolve(result),
      error => reject(error)
    );
  });
}

// Situations {{{1

export function getSituations(): Array<Situation> {
  return model.situations;
}

export function getSituationById(s_id: Id): ?Situation {
  return ufobModel.getSituationById(model, s_id);
}

export function newSituation(): Situation {
  return ufobModel.newSituation(model);
}

export function updateSituation(updatedSituation: Situation): Promise<any> {
  return new Promise((resolve, reject) => {
    let validity = ufobModel.updateSituation(model, updatedSituation);
    if (validity.errors) {
      reject("Situation update failed: " + validity.errors);
    } else {
      postData(urls.clientURL(urls.ufobSituationUpdate), { situation: JSON.stringify(updatedSituation)}).then(
        result => resolve(result),
        error => reject(error)
      );
    }
  });
}

export function deleteSituation(s_id: Id): Promise<any> {
  return new Promise((resolve, reject) => {
    ufobModel.deleteSituation(model, s_id);
    postData(urls.clientURL(urls.ufobSituationDelete), { s_id }).then(
      result => resolve(result),
      error => reject(error)
    );
  });
}

// Hooks {{{1

export function entityDeletionHook(e_id: Id) {
  model = ufobModel.entityDeletionHook(model, e_id);
}


