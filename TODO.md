- Playground instance -- jen Simulation tab

- remove operations

Scenarios?
- V instance modelu bude tlacitko "Save simulation step".
- Zobrazeni seznamu steps (tj. posloupnosti eventu -- opet zvazit tech vicero eventu v jednom step!) reprezentujici scenar a moznost proklikavat se tim -- asi jen read-only (jinak by se muselo kontrolovat, ze to neovlivnilo dalsi kroky) + moznost "Rollback here", tj. zahodi se nasledujici steps. Read-only se bude realizovat tak, ze pokud nebude current step === last step, tak tlacitko Save bude disabled.

Server DB API:
  - loadScenario(scId: Id)
  - addStep(step: SimulationStep) (po Save)

Fixes:
- Behaviour a Simulation: pri otevreni fit to size
- bug: nevyzadovat wmda text pri vytvoreni nove situace
- bug: Edit WMDA -> Cancel: nejde potom ulozit event
- UFO-A Entity Dialog: aktualizovat diagram pri update:
  - Entity: barvy
  - asociace: arrows (memberOf)
- vyresit vicero instanci nadtyp-podtyp
- Focus inputu newEntityInstModal

Improvements:
- "name is not unique" by melo rici, kde je pouzito
- reset simulation button
- kontrola pri prekliknuti dialogu na jiny element, ze nezustalo neco neulozeneho
- simulation: event sourcing (undo)
- Kontroly:
  - Pri pridani instance entity zkontrolovat, ze v modelu nechybi supertype, tj. neexistuje takova generalizace, kde e je podtyp a v modelu neni instance teto generalizace.
  - GeneralisationSet: Kontrola, ze vsechny nadtypy jsou jedna entita.

Refactoring:
- refactor to https://www.primefaces.org/primereact / Bootstrap 4 (react-boostrap umi jen Boostrap 3 -- zbavit se ho? je velky...)
- nahradit react-typeahead napr. https://github.com/moroshko/react-autosuggest (bundlephobia)
- nahradit react-confirm napr. https://www.npmjs.com/package/react-confirm-dialog (bundlephobia)
- zkusit nahradit Visjs nejakou lean alternativou

Ideas:
- dedicnost v inst modelu nahradit vnorenymi krabickami (obsah uzlu bude <div>)
- transformace modelu do textu (pro jednotlive entity).
- scenare
- simulace
  - dispositions budou mít condition (nyní existence instance, v budoucnu i hodnoty atributů)

