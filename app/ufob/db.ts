import { clientURL } from "../api";
import * as api from "./api";
import { Id, Graphics } from "../metamodel";
import { Situation, UfobEvent, UfobModel } from "./metamodel";
import * as ufobMeta from "./metamodel";
import * as ufobModel from "./model";
import { getData, postData } from "../db";

// Model {{{1
var model: UfobModel = ufobMeta.emptyModel;

export function loadModel(): Promise<UfobModel> {
  return new Promise((resolve, reject) => {
    getData<UfobModel>(clientURL(api.getModelURL)).then(
      (data) => {
        model = data;
        resolve(data);
      },
      (error) => reject(error));
  });
}

export function loadGraphics(): Promise<Graphics> {
  return getData<Graphics>(clientURL(api.getGraphicsURL));
}

export function saveGraphics(graphics: Graphics): Promise<any> {
  return postData<api.Graphics>(clientURL(api.graphicsSaveURL), { graphics });
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
      postData<api.UpdateEvent>(clientURL(api.eventUpdateURL), { event: updatedEvent}).then(
        (result) => resolve(result),
        (error)  => reject(error)
      );
    }
  });
}

export function deleteEvent(evId: Id): Promise<any> {
  return new Promise((resolve, reject) => {
    ufobModel.deleteEvent(model, evId);
    postData<api.DeleteEvent>(clientURL(api.eventDeleteURL), { ev_id: evId }).then(
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

export function getEventsToSituation(sId: Id) : UfobEvent[] {
  return getEvents().filter(ev => ev.ev_to_situation_id === sId);
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
      postData<api.UpdateSituation>(clientURL(api.situationUpdateURL), { situation: updatedSituation}).then(
        (result) => resolve(result),
        (error)  => reject(error)
      );
    }
  });
}

export function deleteSituation(sId: Id): Promise<any> {
  const events = getEventsToSituation(sId);
  return new Promise((resolve, reject) => {
    const deletePms = events.map(ev => deleteEvent(ev.ev_id));
    Promise.all(deletePms).then(
      (results) => {
	ufobModel.deleteSituation(model, sId);
	postData<api.DeleteSituation>(clientURL(api.situationDeleteURL), { s_id: sId }).then(
	  (result) => resolve(result),
	  (error)  => reject(error)
	);
      },
      (error) => reject(error)
    );
  });
}

// Hooks {{{1

export function entityDeletionHook(eId: Id) {
  model = ufobModel.entityDeletionHook(model, eId);
}
