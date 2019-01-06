// @flow

import * as ra from "./ufoa/view/canvas/rendering";
import * as rb from "./ufob/view/canvas/rendering";
import * as dispatchA from "./ufoa/view/dispatch";
import * as dispatchB from "./ufob/view/dispatch";
import * as panels from "./panels";
import * as networkToolbar from './networkToolbar/toolbar';
//import * as scenarioPane from './view/scenario/pane';
import * as ufoaDB from "./ufoa/db";
import * as ufobDB from "./ufob/db";
//import * as scenarioDB from "./db/scenario.js";

$(window).resize(function() {
  panels.fitPanes();
});

$(document).ready(function() {
  panels.fitPanes();
  Promise.all([
    ufoaDB.loadModel(),
    ufoaDB.loadGraphics(),
    ufobDB.loadModel(),
    ufobDB.loadGraphics()]).then(
    //scenarioDB.loadModel()]).then(
      //([ufoaModel, ufoaEntityGraphics, ufobModel, ufobGraphics, scenarios]) => {
      ([ufoaModel, ufoaEntityGraphics, ufobModel, ufobGraphics]) => {
        panels.hideMsg();
        let ufoaVisModel = ra.model2vis(ufoaModel, ufoaEntityGraphics);
        let ufoaNetwork  = ra.renderUfoa(ufoaVisModel);
        let ufobVisModel = rb.model2vis(ufobModel, ufobGraphics);
        let ufobNetwork  = rb.renderUfob(ufobVisModel);
        ufoaNetwork.on("click", params => dispatchA.handleClick(ufoaVisModel, params));
        ufobNetwork.on("click", params => dispatchB.handleClick(ufobVisModel, params));
        networkToolbar.render("ufoa-float-toolbar", ufoaModel.entities, "e_name", "e_id", ufoaDB, ufoaNetwork);
        networkToolbar.render("ufob-float-toolbar", ufobModel.events, "ev_name" , "ev_id", ufobDB, ufobNetwork);
        //scenarioPane.render(scenarios, ufobVisModel);
      }, 
      error => panels.displayError("Error loading model: " + error)
    );
});

