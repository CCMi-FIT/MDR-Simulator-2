import * as React from "react";
import * as ReactDOM from "react-dom";
import { Modal } from "../../../components";
import * as panels from "../../../panels";

interface Props {
  edgeData: any;
  nextFn: (name: string) => void;
}

type SelectedValue = "generalisation" | "association";

interface State {
  selection: SelectedValue;
}

class NewEdgeForm extends React.Component<Props, State> {

  private modalRef: any;

  constructor(props: Props) {
    super(props);
    this.state = {
      selection: "generalisation",
    };
  }

  private selectionMade = (event: React.ChangeEvent) => {
    const ct = event.currentTarget as HTMLSelectElement;
    const val: string = ct.value;
    if (!["generalisation", "association"].includes(val)) {
      throw(new Error("invalid value in selection: " + val));
    } else {
      this.setState({ selection: val as SelectedValue });
    }
  }

  private setEdgeType = () => {
    this.modalRef.hide();
    this.props.nextFn(this.state.selection);
  }

  public render = () => {
    return (
      <Modal heading="Select new edge type:" ref={(mRef) => this.modalRef = mRef}>
        <div className="form-group">
          <select className="form-control" value={this.state.selection} onChange={this.selectionMade}>
            <option key="generalisation" value="generalisation">Generalisation</option>
            <option key="association" value="association">Association</option>
          </select>
        </div>
        <button type="button" className="btn btn-primary" onClick={this.setEdgeType}>Select type</button>
      </Modal>
    );
  }
}

export function render(edgeData: any, nextFn: (name: string) => void) {
  const panel = panels.getModal();
  if (panel) {
    ReactDOM.render(<NewEdgeForm edgeData={edgeData} nextFn={nextFn}/>, panel);
  }
}
