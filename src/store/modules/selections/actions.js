import { buildSelectionsSnapshot, buildSelectionHeadersFromSnapshot } from '@/composables/useSelectionsSnapshot';

export default {
  applySelectionsSnapshot({ dispatch, state }, selectionsSnapshot) {
    const headers = buildSelectionHeadersFromSnapshot(selectionsSnapshot);
    const displayedSelectionFields = Object.keys(state.selections || {}).filter(
      (field) => field !== "searchWithin",
    );
    const hiddenFacetSelections = lodash.pickBy(
      state.pendingSearch?.FacetSelections || {},
      (value, field) => {
        return !displayedSelectionFields.includes(field);
      },
    );

    headers.FacetSelections = Object.assign(
      {},
      hiddenFacetSelections,
      headers.FacetSelections,
    );
    return dispatch("fetchResults", headers, { root: true });
  },
  clearSelectionItem({ dispatch, state }, { field, itemValue }) {
    const selections = lodash.cloneDeep(state.selections || {});

    if (field === "searchWithin") {
      delete selections.searchWithin;
      return dispatch("applySelectionsSnapshot", selections);
    }

    if (!selections[field]) {
      return Promise.resolve();
    }

    selections[field].Items = (selections[field].Items || []).filter(
      (item) => item.Value !== itemValue,
    );

    if (!selections[field].Items.length) {
      delete selections[field];
    }

    return dispatch("applySelectionsSnapshot", selections);
  },
  clearSelectionField({ dispatch, state }, field) {
    const selections = lodash.cloneDeep(state.selections || {});

    if (field === "searchWithin") {
      delete selections.searchWithin;
      return dispatch("applySelectionsSnapshot", selections);
    }

    if (!selections[field]) {
      return Promise.resolve();
    }

    delete selections[field];

    return dispatch("applySelectionsSnapshot", selections);
  },
  clearAllSelectionsAndSearchWithin({ dispatch }) {
    return dispatch(
      "fetchResults",
      {
        PageNo: 1,
        FacetSelections: {},
        SearchWithin: undefined,
      },
      { root: true },
    );
  },
};
