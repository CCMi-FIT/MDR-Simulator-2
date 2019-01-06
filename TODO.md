Small fixes:
- rolovani jen vnitrku panes, ne celeho

Refactoring:
- ufoa a ufob Graphics dat do extra modulu. mazani pri smazani entity udelat jako Hook
- refactoring na domenove moduly
- refactor to https://www.primefaces.org/primereact / Bootstrap 4
- nahradit react-typeahead napr. https://github.com/moroshko/react-autosuggest (bundlephobia)
- nahradit react-confirm napr. https://www.npmjs.com/package/react-confirm-dialog (bundlephobia)
- zkusit nahradit Visjs nejakou lean alternativou

Ideas:
- simulace
  - kontrola max jedné default entity v každém kroku
- dispositions budou mít condition (nyní existence instance, v budoucnu i hodnoty atributů)

