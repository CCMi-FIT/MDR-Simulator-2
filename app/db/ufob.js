// @flow

import type { Situation, EventB, Disposition, UfobModel } from '../metamodel/ufob';
import * as ufobMeta from '../metamodel/ufob';
import * as urls from "../urls";
import * as ufobModel from '../model/ufob';
import { loadData, saveData } from './general';

var model: UfobModel = ufobMeta.emptyModel;

// Model

export function loadModel(): Promise<any> {
  return loadData(urls.baseURL + urls.ufobGetModel);
}

export function loadGraphics(): Promise<any> {
  return loadData(urls.baseURL + urls.ufobGetGraphics);
}

export function saveGraphics(graphics: any): Promise<any> {
  return saveData(urls.baseURL + urls.ufobGraphicsSave, { graphics: JSON.stringify(graphics) });
}

