function getFacetFieldName(facet) {
    if (!facet) {
        return null;
    }

    if (typeof HawksearchVue?.getFacetParamName === 'function') {
        return HawksearchVue.getFacetParamName(facet);
    }

    return facet.ParamName || facet.Field;
}

function findMatchingFacetValue(selectionValue, facetValues, negationPrefix) {
    if (!facetValues || !facetValues.length) {
        return null;
    }

    for (const facetValue of facetValues) {
        const isDirectMatch = facetValue.Value === selectionValue;
        const isNegatedMatch = negationPrefix && `${negationPrefix}${facetValue.Value}` === selectionValue;

        if (isDirectMatch || isNegatedMatch) {
            return facetValue;
        }

        const nestedMatch = findMatchingFacetValue(selectionValue, facetValue.Children, negationPrefix);

        if (nestedMatch) {
            return nestedMatch;
        }
    }

    return null;
}

export function buildSelectionsSnapshot(pendingSearch, searchOutput) {
    const snapshot = {};
    const facets = searchOutput?.Facets || [];
    const facetSelections = pendingSearch?.FacetSelections || {};
    const searchWithin = pendingSearch?.SearchWithin;

    if (!facets.length) {
        if (searchWithin) {
            snapshot.searchWithin = {
                Items: [{ Value: searchWithin, Label: searchWithin }],
                Label: 'Search Within'
            };
        }

        return snapshot;
    }

    const negationPrefix = searchOutput?.NegativeFacetValuePrefix || pendingSearch?.NegativeFacetValuePrefix || '@';

    Object.keys(facetSelections).forEach(field => {
        const selectionValues = facetSelections[field];

        if (!selectionValues || !selectionValues.length) {
            return;
        }

        const facet = facets.find(f => getFacetFieldName(f) === field);

        if (!facet || facet.FieldType === 'tab') {
            return;
        }

        const items = [];

        if (facet.FieldType === 'range') {
            selectionValues.forEach(selectionValue => {
                items.push({
                    Value: selectionValue,
                    Label: selectionValue
                });
            });
        }
        else {
            selectionValues.forEach(selectionValue => {
                const matchedValue = findMatchingFacetValue(selectionValue, facet.Values, negationPrefix);

                if (!matchedValue || !matchedValue.Label) {
                    return;
                }

                items.push({
                    Value: selectionValue,
                    Label: matchedValue.Label,
                    Path: matchedValue.Path
                });
            });
        }

        if (!items.length) {
            return;
        }

        snapshot[field] = {
            Items: items,
            Label: facet.Name
        };
    });

    if (searchWithin) {
        const searchWithinFacet = facets.find(f => getFacetFieldName(f) === 'searchWithin' || f.Field === 'searchWithin');

        snapshot.searchWithin = {
            Items: [{ Value: searchWithin, Label: searchWithin }],
            Label: searchWithinFacet?.Name || 'Search Within'
        };
    }

    return snapshot;
}

export function buildSelectionHeadersFromSnapshot(selectionsSnapshot) {
    const headers = {
        PageNo: 1,
        FacetSelections: {},
        SearchWithin: undefined,
    };

    Object.keys(selectionsSnapshot || {}).forEach(field => {
        if (field === 'searchWithin') {
            const value = selectionsSnapshot?.searchWithin?.Items?.[0]?.Value;

            if (value !== undefined && value !== null && value !== '') {
                headers.SearchWithin = value;
            }

            return;
        }

        const values = (selectionsSnapshot[field]?.Items || []).map(item => item.Value);

        if (values.length) {
            headers.FacetSelections[field] = values;
        }
    });

    return headers;
}
