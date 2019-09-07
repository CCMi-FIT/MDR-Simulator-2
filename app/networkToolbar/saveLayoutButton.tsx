import * as React from "react";
import * as panels from "../panels";

interface Props {
  network: any;
  db: any;
}

export class SaveLayout extends React.Component<Props> {

  private save = () => {
    const graphics = this.props.network.getPositions();
    this.props.db.saveGraphics(graphics).then(
      ()      => panels.displayInfo("Diagram layout saved."),
      (error: string) => panels.displayError("Diagram layout saving failed: " + error)
    );
  }

  public render = () => {
    return (
      <button type="button" className="btn btn-light" title="Save diagram layout" onClick={this.save}>
        <i className="fas fa-save"/>
      </button>
    );
  }
}
