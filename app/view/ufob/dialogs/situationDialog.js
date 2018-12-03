//@flow

import * as R from 'ramda';
import * as React from 'react';
import * as ReactDOM from 'react-dom';
import { Panel, Button } from 'react-bootstrap';
import { Confirm } from 'react-confirm-bootstrap';
import type { Situation, Disposition } from '../../../metamodel/ufob';
import * as ufobMeta from '../../../metamodel/ufob';
import * as ufobDB from '../../../db/ufob';
import type { VisModel } from '../../rendering';
import * as panels from '../../panels';

type Props = {
  situation: Situation,
  ufobVisModel: VisModel
};

type State = {
  situation2: Situation,
  saveDisabled: boolean
};

function commitSituation(nodes: any, s: Situation) {
  ufobDB.updateSituation(s).then((response) => {
    nodes.update({ id: s.s_id, label: s.s_name });
    panels.hideDialog();
    panels.displayInfo("Situation saved.");
  }, (error) => panels.displayError("Situation save failed: " + error));
}
  
class SituationForm extends React.Component<Props, State> {

  constructor(props) {
    super(props);
    this.state = {
      situation2: Object.assign({}, props.situation),
      saveDisabled: true
    };
    //console.dir(this.props);
    //console.dir(this.state);
  }
  setAttr = (attr: string, event: any) => {
    let val = event.currentTarget.value;
    this.setState((state: State, props: Props) => {
      let stateCopy = Object.assign({}, state); // Just because Flow bitches about state in R.dissocPath
      let aOrig = props.situation;
      let stateNew = 
        attr === "s_name" ?
          R.mergeDeepRight(state, { situation2: { s_name: val }})
        : (() => {
            console.error(`SituationForm: setAttr of ${attr} not implemented`);
            return R.mergeDeepRight(state, {});
          })();
      return R.mergeDeepRight(stateNew, { saveDisabled: R.equals(aOrig, stateNew.situation2) });
    });
  }

  save = (situation) => {
    let situationOriginal = this.props.situation;
    let situationNew = this.state.situation2;
    let nodes: any = this.props.ufobVisModel.nodes;
    if (!R.equals(situationOriginal, situationNew)) {
      commitSituation(nodes, situationNew);
    }
  };

  delete = (situation) => {
    let nodes: any = this.props.ufobVisModel.nodes;
    let s_id = this.props.situation.s_id;
    ufobDB.deleteSituation(s_id).then((response) => {
      nodes.remove({ id: s_id });
      panels.hideDialog();
      panels.displayInfo("Situation deleted.");
    }, (error) => panels.displayError("Situation delete failed: " + error));
  }

  renderSituationName() {
    return (
      <div className="form-group">
        <textarea className="form-control" type="text" value={this.state.situation2.s_name} onChange={(e) => this.setAttr("s_name", e)} rows="5" cols="30"/>
      </div>);
  }

  renderDisposition = (d: Disposition) => {
    return (
      <div className="form-group">
        <textarea className="form-control" type="text" value={d.d_text} onChange={(e) => this.setAttr("d_text", e)} rows="5" cols="30"/>
      </div>);
    
  }

  renderDispositions() {
    return ( 
      <Panel>
        <Panel.Heading>Dispositions</Panel.Heading>
        <Panel.Body collapsible={false}>
          <div className="container-fluid">
            {this.state.situation2.s_dispositions.map(this.renderDisposition)}
          </div>
        </Panel.Body>
      </Panel>);
  }

  renderButtons() {
    return (
      <div className="form-group row col-sm-12"> 
        <div className="col-sm-6">
          <Button className="btn-primary" onClick={this.save} disabled={this.state.saveDisabled}>Update situation</Button>
        </div>
        <div className="col-sm-6 text-right">
          {this.renderButtonDelete()}
        </div>
      </div>);
  }

  renderButtonDelete() {
    return (
      <Confirm
        onConfirm={this.delete}
        body={`Are you sure you want to delete "${this.props.situation.s_name}"?`}
        confirmText="Confirm Delete"
        title="Deleting Situation">
        <Button className="btn-danger">Delete situation</Button>
      </Confirm>);
  }

  render() {
    return ( 
      <Panel className="dialog">
        <Panel.Heading><strong>{this.props.situation.s_name}</strong></Panel.Heading>
        <Panel.Body collapsible={false}>
          {this.renderSituationName()}
          {this.renderButtons()}
        </Panel.Body>
      </Panel>);
  }

  componentDidMount() {
    panels.fitPanes();
  }
}

export function render(situation: Situation, ufobVisModel: VisModel) {
  let panel = panels.getDialog();
  if (panel) {
    ReactDOM.render(<SituationForm situation={situation} ufobVisModel={ufobVisModel}/>, panel);
    panels.showDialog();
  }
}

