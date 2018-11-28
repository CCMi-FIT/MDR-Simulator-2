// @flow

import type { Situation, EventB, Disposition, UfobModel } from '../metamodel/ufob';
import * as ufobMeta from '../metamodel/ufob';
import * as urls from "../urls";
import * as ufobModel from '../model/ufob';
import { loadData } from './general';

var model: UfobModel = ufobMeta.emptyModel;

// Model

export function loadModel(): Promise<any> {
  return loadData(urls.baseURL + urls.ufobGetModel);
}

export function loadGraphics(): Promise<any> {
  return loadData(urls.baseURL + urls.ufobGetGraphics);
}


