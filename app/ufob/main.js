// @flow

import type { VisModel } from "../diagram";
import type { UfobModel } from "./metamodel";
import * as ufobDiagram from "./view/diagram";
import * as dispatchB from "./view/dispatch";
import * as networkToolbar from '../networkToolbar/toolbar';
import * as panels from "../panels";
import * as ufobDB from "./db";

export function initialise(ufobModel: UfobModel, ufobGraphics: any): VisModel {
  let ufobVisModel = ufobDiagram.model2vis(ufobModel, ufobGraphics);
  const ufobDiagramContainer = panels.getUfobBox();
  if (ufobDiagramContainer) {
    let ufobNetwork  = ufobDiagram.renderUfob(ufobVisModel, ufobDiagramContainer);
    ufobNetwork.on("click", params => dispatchB.handleClick(ufobVisModel, params));
    networkToolbar.render("ufob-float-toolbar", ufobModel.events, "ev_name" , "ev_id", ufobDB, ufobNetwork);
  }
  return ufobVisModel;
}


