- Pri pridani instance entity zkontrolovat, ze v modelu nechybi supertype, tj. neexistuje takova generalizace, kde e je podtyp a v modelu neni instance teto generalizace.

Fixes:
- Focus inputu newEntityInstModal

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

