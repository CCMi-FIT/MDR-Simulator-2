// @flow

import * as ra from "./view/ufoa/canvas/rendering";
import * as rb from "./view/ufob/canvas/rendering";
import * as dispatchA from "./view/ufoa/dispatch";
import * as dispatchB from "./view/ufob/dispatch";
import * as panels from "./view/panels";
import * as networkToolbar from './view/networkToolbar/toolbar';
import * as scenarioPane from './view/scenario/pane';
import * as ufoaDB from "./db/ufoa";
import * as ufobDB from "./db/ufob";

$(window).resize(function() {
  panels.fitPanes();
});

$(document).ready(function() {
  panels.fitPanes();
  Promise.all([
    ufoaDB.loadModel(),
    ufoaDB.loadGraphics(),
    ufobDB.loadModel(),
    ufobDB.loadGraphics()]).then(([ufoaModel, ufoaEntityGraphics, ufobModel, ufobGraphics]) => {
      let error = ufoaModel.error || ufoaEntityGraphics.error || ufobModel.error || ufobGraphics.error;
      if (error) {
        panels.displayError(error);
      } else {
        panels.hideMsg();
        let ufoaVisModel = ra.model2vis(ufoaModel, ufoaEntityGraphics);
        let ufoaNetwork  = ra.renderUfoa(ufoaVisModel);
        let ufobVisModel = rb.model2vis(ufobModel, ufobGraphics);
        let ufobNetwork  = rb.renderUfob(ufobVisModel);
        ufoaNetwork.on("click", params => dispatchA.handleClick(ufoaVisModel, params));
        ufobNetwork.on("click", params => dispatchB.handleClick(ufobVisModel, params));
        networkToolbar.render("ufoa-float-toolbar", ufoaModel.entities, "e_name", "e_id", ufoaDB, ufoaNetwork);
        networkToolbar.render("ufob-float-toolbar", ufobModel.events, "ev_name" , "ev_id", ufobDB, ufobNetwork);
        scenarioPane.render(ufobVisModel);
      }
    }, (error) => panels.displayError("Error loading model: " + error));
});

