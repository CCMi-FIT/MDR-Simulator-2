// Imports {{{1
import * as _ from "lodash";
import * as React from "react";
import * as ReactDOM from "react-dom";
import { Panel, renderConfirmPm } from "../../../components";
import { Association, Connection, Mult } from "../../../ufoa/metamodel";
import * as ufoaMeta from "../../../ufoa/metamodel";
import * as ufoaDB from "../../../ufoa/db";
import { UfoaVisEdge, UfoaEdgesDataSet, UfoaVisModel } from "../diagram";
import * as panels from "../../../panels";

// Props & State {{{1
interface Props {
  association: Association;
  visModel: UfoaVisModel;
}

interface State {
  association2: Association;
  showMeta: boolean;
  saveDisabled: boolean;
}
//}}}1

function commitAssociation(edges: UfoaEdgesDataSet, a: Association) {
  ufoaDB.updateAssociation(a).then(
    () => {
      edges.update({
        id: a.a_id,
        from: a.a_connection1.e_id,
        to: a.a_connection2.e_id,
        label: a.a_label,
        title: ufoaMeta.assocStr(a),
        arrows: {
          from: {
            enabled: a.a_type === "MemberOf",
            type: "circle"
          }
        }
      });
      panels.disposeDialogUfoa();
      panels.displayInfo("Association saved.");
    },
    (error) => panels.displayError("Association save failed: " + error)
  );
}

// Component {{{1
class AssociationForm extends panels.PaneDialog<Props, State> {

  constructor(props: Props) {
    super(props);
    this.state = {
      association2: props.association,
      showMeta: props.association.a_type === "MemberOf",
      saveDisabled: true
    };
    //console.dir(this.props);
    //console.dir(this.state);
  }

// Operations {{{1
  private setAttr = (
    target: EventTarget & HTMLSelectElement | EventTarget & HTMLInputElement | EventTarget & HTMLTextAreaElement,
    assocAttr?: keyof Association,
    multAttr?: keyof Mult) => {
    if (target) {
      const val: any = target.value;
      this.setState((state: State, props: Props) => {
	const aOrig = props.association;
	const stateNew: State = (
	  assocAttr === "a_type" ? {
	    ...state,
	    showMeta: val === "MemberOf",
	    association2: { 
	      ...state.association2,
	      a_type: val
	    }
	  }
	  : assocAttr === "a_meta" ? {
	    ...state,
	    association2: {
	      ...state.association2,
	      a_meta: val
	    }
	  }
	  : (assocAttr === "a_connection1" && multAttr === "lower") ? {
	    ...state,
	    association2: { 
	      ...state.association2,
	      a_connection1: {
		...state.association2.a_connection1,
		mult: {
		  ...state.association2.a_connection1.mult,
		  lower: !val || val < 0 ? 0 : parseInt(val, 10)
		}
	      }
	    }
	  }
	  : (assocAttr === "a_connection1" && multAttr === "upper") ? (
	    val ? {
	      ...state,
	      association2: { 
		...state.association2,
		a_connection1: {
		  ...state.association2.a_connection1,
		  mult: {
		    ...state.association2.a_connection1.mult,
		    upper: !val || val < 0 ? 0 : parseInt(val, 10)
		  }
		}
	      }
	    }
	    : (() => {
	      const s2: State = _.clone(state);
	      _.unset(s2, ["association2", "a_connection1", "mult", "upper"]);
	      return s2;
	    })()
	  )
	  : (assocAttr === "a_connection2" && multAttr === "lower") ? {
	    ...state,
	    association2: { 
	      ...state.association2,
	      a_connection1: {
		...state.association2.a_connection2,
		mult: {
		  ...state.association2.a_connection2.mult,
		  lower: !val || val < 0 ? 0 : parseInt(val, 10)
		}
	      }
	    }
	  }
	  : (assocAttr === "a_connection2" && multAttr === "upper") ? (
	    val ? {
	      ...state,
	      association2: { 
		...state.association2,
		a_connection1: {
		  ...state.association2.a_connection2,
		  mult: {
		    ...state.association2.a_connection2.mult,
		    upper: !val || val < 0 ? 0 : parseInt(val, 10)
		  }
		}
	      }
	    }
	    : (() => {
	      const s2: State = _.clone(state);
	      _.unset(s2, ["association2", "a_connection2", "mult", "upper"]);
	      return s2;
	    })()
	  )
	  : assocAttr === "a_label" ? {
	    ...state,
	    association2: {
	      ...state.association2,
	      a_label: val
	    }
	  }
	  : (() => {
	      console.error(new Error(`AssociationForm: setAttr not matched`));
	      return _.clone(state);
	    })()
	);
	return { 
	  ...stateNew, 
	  saveDisabled: _.isEqual(aOrig, stateNew.association2) 
	};
      });
    }
  }

  private save = () => {
    const aOriginal = this.props.association;
    const aNew = this.state.association2;
    const edges: any = this.props.visModel.edges;
    if (!_.isEqual(aOriginal, aNew)) {
      commitAssociation(edges, aNew);
    }
  };

  private delete = () => {
    const edges  = this.props.visModel.edges;
    const a_id = this.props.association.a_id;
    ufoaDB.deleteAssociation(a_id).then(
      () => {
        edges.remove(a_id);
        panels.disposeDialogUfoa();
        panels.displayInfo("Association deleted.");
      },
      (error) => panels.displayError("Association delete failed: " + error)
    );
  }

  // Rendering {{{1

  private renderType = () => {
    return (
      <div className="row form-group">
        <label>Type</label>
        <select className="form-control" value={this.state.association2.a_type} onChange={(e) => this.setAttr(e.currentTarget, "a_type")}>
          {ufoaMeta.assocTypes.map(t => <option key={t}>{t}</option>)}
        </select>
      </div>);
  }

  private renderMeta = () => {
    return (
      <div className="row form-group">
        <label>Meta</label>
        <select className="form-control" value={this.state.association2.a_meta} onChange={(e) => this.setAttr(e.currentTarget, "a_meta")}>
          {ufoaMeta.assocMetas.map((meta) => <option key={meta}>{meta}</option>)}
        </select>
      </div>);
  }

  private renderMultiplicity = (connection: "a_connection1" | "a_connection2") => {
    const e = ufoaDB.getEntity(this.state.association2[connection].e_id);
    const upper = this.state.association2[connection].mult.upper;
    if (!e) { 
      return (<span>Internal error: entity not found</span>);
    } else {
      return (
        <Panel heading={ufoaMeta.entityNameLine(e)} inner={true}>
          <div className="d-flex flex-row">
            <div>
              <input
              className="form-control"
              type="number"
              value={this.state.association2[connection].mult.lower}
              onChange={(e2) => this.setAttr(e2.currentTarget, connection, "lower")}
              />
            </div>
            <div style={{paddingLeft: "5px", paddingRight: "5px"}}>..</div>
            <div>
              <input
              className="form-control"
              type="number"
              value={upper ? upper : ""}
              onChange={(e2) => this.setAttr(e2.currentTarget, connection, "upper")}
              />
            </div>
          </div>
        </Panel>
      );
    }
  }

  private renderMultiplicities = () => {
    return (
      <div className="row form-group">
        <label>Multiplicities</label>
        <div className="d-flex flex-row">
          <div style={{paddingRight: "5px"}}>
            {this.renderMultiplicity("a_connection1")}
          </div>
          <div style={{paddingLeft: "5px"}}>
            {this.renderMultiplicity("a_connection2")}
          </div>
        </div>
      </div>
    );
  }

  private renderLabel = () => {
    return (
      <div className="row form-group">
        <label>Label</label>
        <textarea className="form-control" value={this.state.association2.a_label} onChange={(e) => this.setAttr(e.currentTarget, "a_label")} rows={2} cols={30}/>
      </div>
    );
  }

  private renderButtons = () => {
    return (
      <div className="row form-group"> 
        <div className="col-sm-6 text-center"> 
          <button type="button" className="btn btn-primary" onClick={this.save} disabled={this.state.saveDisabled}>Update</button>
        </div>
        <div className="col-sm-6 text-center">
          {this.renderButtonDelete()}
        </div>
      </div>
    );
  }

  private renderButtonDelete = () => {
    return (
      <button type="button" className="btn btn-danger" onClick={() => {
        renderConfirmPm(
          "Deleting Association",
          "delete",
          <span>Are you sure you want to delete &quot;{this.props.association.a_id}&quot;?</span>
        ).then(() => this.delete());
      }}>Delete
      </button>
    );
  }

  public render = () => {
    return (
      <Panel heading={<span>Association {this.props.association.a_id}</span>}>
        <div className="container-fluid">
          {this.renderType()}
          {this.state.showMeta ? this.renderMeta() : null}
          {this.renderMultiplicities()}
          {this.renderLabel()}
          {this.renderButtons()}
        </div>
      </Panel>
    );
  }
}

///}}}1
export function render(association: Association, ufoaVisModel: UfoaVisModel) {
  const panel = panels.getDialogUfoa();
  if (panel) {
    ReactDOM.render(<AssociationForm association={association} visModel={ufoaVisModel}/>, panel);
    panels.showDialogUfoa();
  }
}
