// @flow

import * as ReactDOM from 'react-dom';

const dialogId = "dialog-box";
const messageId = "message-box";

export function getContainer(): ?Element {
  let container = document.getElementById(dialogId);
  if (!container) {
    console.error("container #" + dialogId + " does not exist");
  }
  return container;
}

export function hideDialog(): void {
  let container = getContainer();
  if (container) {
    ReactDOM.unmountComponentAtNode(container);
    $(container).hide();
  }
}

export function showDialog(): void {
  $("#" + dialogId).show();
}

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
    msgBox.fadeIn().delay(5000).fadeOut();
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

