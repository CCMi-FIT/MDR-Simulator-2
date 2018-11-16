// @flow

import * as r from "./view/ufoa/canvas/rendering";
import * as dispatch from "./view/dispatch";
import * as panels from "./view/panels";
import * as networkToolbar from './view/ufoa/networkToolbar/toolbar';
import * as ufoaDB from "./db/ufoa";

$(window).resize(function() {
  panels.fitPanes();
});

$(document).ready(function() {
  panels.fitPanes();
  Promise.all([ufoaDB.loadModel(), ufoaDB.loadEntityGraphics()]).then(([ufoaModel, ufoaEntityGraphics]) => {
    let error = ufoaModel.error || ufoaEntityGraphics.error;
    if (error) {
      panels.displayError(error);
    } else {
      panels.hideMsg();
      let ufoaVisModel  = r.model2vis(ufoaModel, ufoaEntityGraphics);
      let network       = r.renderUfoa(ufoaVisModel);
      network.on("click", params => dispatch.handleClick(ufoaVisModel, params));
      networkToolbar.render(ufoaModel, network);
    }
  }, (error) => panels.displayError("Error loading UFO-A model: " + error));
});

