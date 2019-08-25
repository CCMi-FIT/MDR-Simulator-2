import * as React from "react";
import * as ReactDOM from "react-dom";
import { Modal } from "../../../components";
import { UfoaEntity } from "../../../ufoa/metamodel";
import { EntityInst } from "../../../ufoa-inst/metamodel";
import * as ufoaInstModel from "../../../ufoa-inst/model";
import * as panels from "../../../panels";
 
interface Props {
  entity: UfoaEntity;
  insts: EntityInst[];
  resolve: (param: any) => any;
  reject: () => void;
}

interface State {
  instName: string;
  duplicityError: boolean;
  saveDisabled: boolean;
}

class EntityInstNameForm extends React.Component<Props, State> {

  private nameInput: HTMLInputElement | null = null;

  constructor(props: Props) {
    super(props);
    this.state = {
      instName: "",
      duplicityError: false,
      saveDisabled: true
    };
  }

  // Operations {{{1

  private setInstName(val: string) {
    this.setState((state: State, props: Props) => {
      return (props.insts.find((ei) => ei.ei_name === val)) ? {
	instName: val,
	duplicityError: true,
	saveDisabled: true
      }
      : {
	instName: val,
	duplicityError: false,
	saveDisabled: false
      }
    });
  }

  private handleKeyPress(event: React.KeyboardEvent) {
    if (event.key === "Enter") {
      this.save();
    }
  }

  private save() {
    panels.disposeModal();
    const res = ufoaInstModel.newEntityInst(this.props.entity, this.state.instName);
    this.props.resolve(res);
  }

  // Rendering {{{1
  private renderInput() {
    return (
      <div className="form-group">
        <label>Name</label>
        <input className="form-control"
          ref={(input) => { this.nameInput = input; }}
          value={this.state.instName}
          onKeyPress={this.handleKeyPress}
          onChange={(event) => this.setInstName(event.currentTarget.value)}
        />
      </div>
    );
  }

  private renderError() {
    return (
      <div>
        This name is already present.
      </div>
    );
  }

  private renderButtons() {
    return (
      <div className="form-group"> 
        <button type="button" className="btn btn-primary" onClick={this.save} disabled={this.state.saveDisabled}>Set name</button>
      </div>
    );
  }

  public render() {
    return (
      <Modal heading={<span><strong>Enter instance name for {this.props.entity.e_name}</strong></span>}>
        <div>
          {this.renderInput()}
          {this.state.duplicityError ? this.renderError() : ""}
          {this.renderButtons()}
        </div>
      </Modal>
    );
  }

  public componentDidMount() {
    if (this.nameInput) {
      this.nameInput.focus();
    }
  }
}
// }}}1

export function renderPm(insts: EntityInst[], entity: UfoaEntity): Promise<any> {
  return new Promise((resolve, reject) => {
    const panel = panels.getModal();
    if (panel) {
      ReactDOM.render(<EntityInstNameForm insts={insts} entity={entity} resolve={resolve} reject={reject}/>, panel);
      panels.showModal();
    }
  });
}
