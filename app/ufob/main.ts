import { Graphics } from "../metamodel";
import { UfobVisModel } from "./view/diagram";
import { UfobModel } from "./metamodel";
import * as ufobDiagram from "./view/diagram";
import * as dispatchB from "./view/dispatch";
import * as networkToolbar from "../networkToolbar/toolbar";
import * as panels from "../panels";
import * as ufobDB from "./db";

export function initialise(ufobModel: UfobModel, ufobGraphics: Graphics): UfobVisModel {
  const ufobVisModel = ufobDiagram.model2vis(ufobModel, ufobGraphics);
  const ufobDiagramContainer = panels.getUfobBox();
  if (ufobDiagramContainer) {
    const ufobNetwork  = ufobDiagram.renderUfob(ufobVisModel, ufobDiagramContainer);
    ufobNetwork.on("click", (params: any) => dispatchB.handleClick(ufobVisModel, params));
    networkToolbar.render("ufob-float-toolbar", ufobModel.events, "ev_name" , "ev_id", ufobDB, ufobNetwork);
  }
  return ufobVisModel;
}
