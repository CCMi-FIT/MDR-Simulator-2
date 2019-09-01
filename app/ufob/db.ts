import { Id } from "../metamodel";
import { Situation, UfobEvent, UfobModel } from "./metamodel";
import { Graphics } from "../api";
import * as ufobMeta from "./metamodel";
import * as urls from "./urls";
import * as ufobModel from "./model";
import { getData, postData } from "../db";

// Model {{{1
var model: UfobModel = ufobMeta.emptyModel;

export function loadModel(): Promise<UfobModel> {
  return new Promise((resolve, reject) => {
    getData<UfobModel>(urls.clientURL(urls.ufobGetModel)).then(
      (data) => {
        model = data;
        resolve(data);
      },
      (error) => reject(error));
  });
}

export function loadGraphics(): Promise<Graphics> {
  return getData<Graphics>(urls.clientURL(urls.ufobGetGraphics));
}

export function saveGraphics(graphics: Graphics): Promise<any> {
  return postData<Graphics>(urls.clientURL(urls.ufobGraphicsSave), graphics);
}

// Events {{{1

export function getEvents(): UfobEvent[] {
  return model.events;
}

export function getUfobEventById(evId: Id): UfobEvent | undefined {
  const res = ufobModel.getUfobEventById(model, evId);
  if (!res) {
    console.error(new Error(`UFO-B database inconsistency: ev_id ${evId} not found.`));
  }
  return res;
}

export function newEvent(evName: string, sId: Id): UfobEvent {
  return ufobModel.newEvent(model, evName, sId);
}

export function updateEvent(updatedEvent: UfobEvent): Promise<any> {
  return new Promise((resolve, reject) => {
    const validity = ufobModel.updateEvent(model, updatedEvent);
    if (validity.errors) {
      reject("Event update failed: " + validity.errors);
    } else {
      postData(urls.clientURL(urls.ufobEventUpdate), { event: JSON.stringify(updatedEvent)}).then(
        (result) => resolve(result),
        (error)  => reject(error)
      );
    }
  });
}

export function deleteEvent(evId: Id): Promise<any> {
  return new Promise((resolve, reject) => {
    ufobModel.deleteEvent(model, evId);
    postData(urls.clientURL(urls.ufobEventDelete), { evId }).then(
      (result) => resolve(result),
      (error)  => reject(error)
    );
  });
}

export function getInstsNames(): string[] {
  return ufobModel.getInstsNames(model);
}

// Situations {{{1

export function getSituations(): Situation[] {
  return model.situations;
}

export function getSituationById(sId: Id): Situation | undefined {
  return ufobModel.getSituationById(model, sId);
}

export function newSituation(): Situation {
  return ufobModel.newSituation(model);
}

export function updateSituation(updatedSituation: Situation): Promise<any> {
  return new Promise((resolve, reject) => {
    const validity = ufobModel.updateSituation(model, updatedSituation);
    if (validity.errors) {
      reject("Situation update failed: " + validity.errors);
    } else {
      postData(urls.clientURL(urls.ufobSituationUpdate), { situation: JSON.stringify(updatedSituation)}).then(
        (result) => resolve(result),
        (error)  => reject(error)
      );
    }
  });
}

export function deleteSituation(sId: Id): Promise<any> {
  return new Promise((resolve, reject) => {
    ufobModel.deleteSituation(model, sId);
    postData(urls.clientURL(urls.ufobSituationDelete), { sId }).then(
      (result) => resolve(result),
      (error)  => reject(error)
    );
  });
}

// Hooks {{{1

export function entityDeletionHook(eId: Id) {
  model = ufobModel.entityDeletionHook(model, eId);
}
