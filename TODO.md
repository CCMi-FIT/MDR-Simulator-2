- Pridavani missing generalisations a associations udelat dvoufazove: nejdrive mezi pridavanymi instancemi, potom mezi vsemi.
- Editace instance names je snad hotova, ted udelat instanciaci ve scenari, plus je tam TODO
- U explicitnich instanci umoznit misto vyctu zadani vyrazu napr. p#, kde se krizek bude nahrazovat cislem (umozni automaticke pridavani dalsich pojmenovanych entit neznamych v dobe vytvareni modelu -- darci a pacienti a jejich genomy, ...)

- Pri pridani instance entity zkontrolovat, ze v modelu nechybi supertype, tj. neexistuje takova generalizace, kde e je podtyp a v modelu neni instance teto generalizace.

Scenario:
  - Scenario.js rozdelit na Metamodel, model, ...
  - Z main oddelit dispatch
  - V instance modelu bude tlacitko "Save simulation step".
  - Zobrazeni seznamu steps (tj. posloupnosti eventu -- opet zvazit tech vicero eventu v jednom step!) reprezentujici scenar a moznost proklikavat se tim -- asi jen read-only (jinak by se muselo kontrolovat, ze to neovlivnilo dalsi kroky) + moznost "Rollback here", tj. zahodi se nasledujici steps. Read-only se bude realizovat tak, ze pokud nebude current step === last step, tak tlacitko Save bude disabled.

Server DB API:
  - loadScenario(scId: Id)
  - addStep(step: SimulationStep) (po Save)

Fixes:
- Focus inputu newEntityInstModal
- UFO-A Entity Dialog: Update barvy pri zmene typu

Upgrades:
- https://split.js.org

Refactoring:
- refactor to https://www.primefaces.org/primereact / Bootstrap 4 (react-boostrap umi jen Boostrap 3 -- zbavit se ho? je velky...)
- nahradit react-typeahead napr. https://github.com/moroshko/react-autosuggest (bundlephobia)
- nahradit react-confirm napr. https://www.npmjs.com/package/react-confirm-dialog (bundlephobia)
- zkusit nahradit Visjs nejakou lean alternativou

Ideas:
- simulace
  - dispositions budou mít condition (nyní existence instance, v budoucnu i hodnoty atributů)

