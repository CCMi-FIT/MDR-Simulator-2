import * as React from "react";
import * as ReactDOM from "react-dom";
import { Modal } from "../../../components";
import { UfoaEntity } from "../../../ufoa/metamodel";
import { EntityInst } from "../../../ufoa-inst/metamodel";
import * as panels from "../../../panels";

interface Props {
  insts: EntityInst[];
  choiceType: string;
  entity: UfoaEntity;
  resolve: any;
  reject: () => void;
}

interface State {
  chosenInstName: string;
}

class ChooseEntityInstForm extends React.Component<Props, State> {

  private modalRef: any;

  constructor(props: Props) {
    super(props);
    this.state = {
      chosenInstName: props.insts[0].ei_name
    };
  }

  // Operations {{{1
  private choose = () => {
    const chosenInst = this.props.insts.find((ei) => ei.ei_name === this.state.chosenInstName);
    this.modalRef.hide();
    if (!chosenInst) {
      console.error(new Error(`Something is very wrong in ChooseEntityInstForm: ${this.state.chosenInstName} disappeared from props.insts`));
      this.props.reject();
    } else {
      this.props.resolve(chosenInst);
    }
  }

  // Rendering {{{1
  private renderSelection = () => {
    return (
      <div className="form-group">
        <label>Available instances</label>
        <select className="form-control"
          value={this.state.chosenInstName}
          onChange={(event) => this.setState({ chosenInstName: event.currentTarget.value })}
        >{this.props.insts.map((ei) => <option key={ei.ei_name}>{ei.ei_name}</option>)}</select>
      </div>
    );
  }

  private renderButtons = () => {
    return (
      <div className="form-group">
        <button type="button" className="btn btn-primary" onClick={this.choose}>Choose</button>
      </div>
    );
  }

  public render = () => {
    return (
      <Modal heading={<span>Choose instance of <strong>{this.props.entity.e_name}</strong> as <strong>{this.props.choiceType}</strong></span>} ref={(mRef) => this.modalRef = mRef}>
          {this.renderSelection()}
          {this.renderButtons()}
      </Modal>
    );
  }
}

// }}}1

export function renderPm(insts: EntityInst[], entity: UfoaEntity, choiceType: string): Promise<any> {
  return new Promise((resolve, reject) => {
    const panel = panels.getModal();
    if (panel) {
      ReactDOM.render(<ChooseEntityInstForm insts={insts} choiceType={choiceType} entity={entity} resolve={resolve} reject={reject}/>, panel);
    }
  });
}
