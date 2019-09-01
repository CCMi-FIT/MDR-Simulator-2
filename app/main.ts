import $ from "jquery";
import { UfoaModel } from "./ufoa/metamodel";
import { UfobModel } from "./ufob/metamodel";
import { Graphics } from "./api";
import * as ufoa from "./ufoa/main";
import * as ufob from "./ufob/main";
import * as simulation from "./simulation/main";
import * as panels from "./panels";
import * as ufoaDB from "./ufoa/db";
import * as ufobDB from "./ufob/db";

$(window).resize(() => {
  panels.fitPanes();
});

$(document).ready(() => {
  panels.fitPanes();
  Promise.all([
    ufoaDB.loadModel(),
    ufoaDB.loadGraphics(),
    ufobDB.loadModel(),
    ufobDB.loadGraphics()]).then(
      ([ufoaModel, ufoaEntityGraphics, ufobModel, ufobGraphics]: [UfoaModel, Graphics, UfobModel, Graphics]) => {
        panels.hideMsg();
        ufoa.initialise(ufoaModel, ufoaEntityGraphics);
        const ufobVisModel = ufob.initialise(ufobModel, ufobGraphics);
        simulation.initialise(ufobVisModel);
      },
      (error) => panels.displayError("Error loading model: " + error)
    );
});
