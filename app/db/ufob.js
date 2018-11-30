// @flow

import type { Id, Situation, EventB, Disposition, UfobModel } from '../metamodel/ufob';
import * as ufobMeta from '../metamodel/ufob';
import * as urls from "../urls";
import * as ufobModel from '../model/ufob';
import { getData, postData } from './general';

var model: UfobModel = ufobMeta.emptyModel;

// Model

export function loadModel(): Promise<any> {
  return new Promise((resolve, reject) => {
    getData(urls.baseURL + urls.ufobGetModel).then(data => {
      model = data;
      resolve(data);
    }, (error) => reject(error));
  });
}

export function loadGraphics(): Promise<any> {
  return getData(urls.baseURL + urls.ufobGetGraphics);
}

export function saveGraphics(graphics: any): Promise<any> {
  return postData(urls.baseURL + urls.ufobGraphicsSave, { graphics: JSON.stringify(graphics) });
}

// Events

export function getEventById(ev_id: Id): ?EventB {
  return ufobModel.getEventById(model, ev_id);
}

export function updateEvent(updatedEvent: EventB): Promise<any> {
  return new Promise((resolve, reject) => {
    let validity = ufobModel.updateEvent(model, updatedEvent);
    if (validity.errors) {
      reject("Event update failed: " + validity.errors);
    } else {
      return postData(urls.baseURL + urls.ufobEventUpdate, { event: JSON.stringify(updatedEvent)});
    }
  });
}

export function deleteEvent(ev_id: Id): Promise<any> {
  return new Promise((resolve, reject) => {
    ufobModel.deleteEvent(model, ev_id);
    return postData(urls.baseURL + urls.ufobEventDelete, { ev_id });
  });
}

//Situations

export function getSituationById(s_id: Id): ?Situation {
  return ufobModel.getSituationById(model, s_id);
}

export function updateSituation(updatedSituation: Situation): Promise<any> {
  return new Promise((resolve, reject) => {
    let validity = ufobModel.updateSituation(model, updatedSituation);
    if (validity.errors) {
      reject("Situation update failed: " + validity.errors);
    } else {
      return postData(urls.baseURL + urls.ufobSituationUpdate, { situation: JSON.stringify(updatedSituation)});
    }
  });
}

export function deleteSituation(s_id: Id): Promise<any> {
  return new Promise((resolve, reject) => {
    ufobModel.deleteSituation(model, s_id);
    return postData(urls.baseURL + urls.ufobSituationDelete, { s_id });
  });
}
