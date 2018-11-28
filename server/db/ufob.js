//@flow

import * as R from 'ramda';
import * as fs from 'fs';
import { lock } from 'proper-lockfile';
import * as db from './general';
import type { RestResult } from './general';
import type { Situation, EventB, UfobModel } from '../metamodel/ufob';
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

export function graphicsDelete(): Promise<any> {
  return db.graphicsDelete(ufobGraphicsFname);
}

export function writeModel(model: UfobModel) {
  db.writeModel(model, ufobFname);
}

