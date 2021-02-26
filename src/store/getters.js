export default {
    getResponseField: (state) => (fieldName) => {
        var responseFields = fieldName.split('.');
        responseFields.reverse();

        var getResponseProperty = (value, subfield) => {
            if (subfield && value.hasOwnProperty(subfield)) {
                return getResponseProperty(value[subfield], responseFields.pop());
            }
            else {
                return value;
            }
        }

        if (state.searchOutput) {
            return getResponseProperty(state.searchOutput, responseFields.pop());
        }
    },
    tabSelection: (state) => {
        if (state.searchOutput) {
            var tabFacet = state.searchOutput.Facets.find(facet => facet.FieldType == 'tab');

            if (tabFacet) {
                return tabFacet.Values.find(value => value.Selected == true);
            }
        }
    }
};
