// @flow

import * as React from 'react';
import * as ReactDOM from 'react-dom';

const ufoaBoxId = "ufoa-box";
const ufobBoxId = "ufob-box";
const simulationBoxId = "simulation-box";
const instDiagramId = "ufoa-inst-diagram";
const ufobDiagramId = "simulation-diagram";
const dialogId = "dialog-box";
const messageId = "message-box";
const modalId = "modal-box";

export const wmdaPanelId = "wmda-panel";
export const wmdaTitleId = "wmda-panel-label";
export const eventsLogId = "events-log";

export function getWindowHeight(): number {
  return $(window).innerHeight();
}

export function getWindowWidth(): number {
  return $(window).innerWidth();
}

export function fitPanes() {
  const ww = getWindowWidth();
  const wh = getWindowHeight();

  $(`#${ufoaBoxId}`).css("height", `${wh - 115}px`);
  $("#ufoa-float-toolbar").css("left", `${ww - 400}px`);

  const dbox = $("#dialog-box > div");
  const dboxh = wh - 150;
  dbox.css("height", `${dboxh}px`);
  dbox.css("overflow-y", "scroll");
}

// Getting

export function getPanel(panelId: string): HTMLElement {
  let panel = document.getElementById(panelId);
  if (!panel) {
    throw("panel #" + panelId + " does not exist");
  } else {
    return panel;
  }
}

export function getDialog(): HTMLElement {
  return getPanel(dialogId);
}

export function getModal(): HTMLElement {
  return getPanel(modalId);
}

export function getSimulationBox(): HTMLElement {
  return getPanel(simulationBoxId);
}

export function getInstDiagram(): HTMLElement {
  return getPanel(instDiagramId);
}

export function getUfobDiagram(): HTMLElement {
  return getPanel(ufobDiagramId);
}

export function getToolbarTop(): number {
  return $(`#${ufoaBoxId}`).offset().top;
}


// Showing

function showPanel(panelId: string): void {
  let panel = getPanel(panelId);
  if (panel) {
    $(panel).fadeIn();
  }
}

export function showDialog(): void {
  showPanel(dialogId);
  fitPanes();
}

export function showModal(): void {
  showPanel(modalId);
}

// Hiding

function disposePanel(panelId: string): void {
  let panel = getPanel(panelId);
  if (panel) {
    ReactDOM.unmountComponentAtNode(panel);
    $(panel).fadeOut();
  }
}

export function disposeDialog(): void {
  disposePanel(dialogId);
}

export function disposeModal(): void {
  // $FlowFixMe
  $("#exampleModal").modal("hide");
  disposePanel(modalId);
}

// Messages

const closeButton = `
  <button type="button" class="close" aria-label="Close" onclick="$('#${messageId}').hide()"}>
    <span aria-hidden="true">&times;</span>
  </button>`;

export function displayMsg(msg: string, style: "alert-success"|"alert-danger", fade: boolean): void {
  const msgBox = $("#" + messageId);
  msgBox.html(msg + closeButton);
  msgBox.removeClass();
  msgBox.addClass("message-box alert");
  msgBox.addClass(style);
  if (fade) {
    msgBox.fadeIn().delay(3000).fadeOut();
  } else {
    msgBox.fadeIn();
  }
}

export function hideMsg(): void {
  $("#" + messageId).hide();
}

export function displayInfo(msg: string): void {
  displayMsg(msg, "alert-success", true);
}

export function displayError(msg: string): void {
  displayMsg(msg, "alert-danger", false);
}

// Component

export class PaneDialog<Props: {}, State: ?{} = null> extends React.Component<Props, State> {
  componentDidMount() {
    fitPanes();
  }
  componentDidUpdate() {
    fitPanes();
  }
}

