import { createBrowserHistory } from 'history';

const stateToURLParam = {
    Keyword: 'keyword',
    SortBy: 'sort',
    PageNo: 'pg',
    MaxPerPage: 'mpp',
    CustomUrl: 'lpurl',
    SearchWithin: 'searchWithin',
    IndexName: 'indexName'
}

export function getParamName(paramName, widget, reverse) {
    var mappingTable = widget.config.paramsMapping;

    for (let [mKey, mValue] of Object.entries(mappingTable)) {
        if (reverse) {
            [mKey, mValue] = [mValue, mKey];
        }

        if (mKey == paramName) {
            paramName = mValue;
        }
    }

    return paramName;
}

export function parseURLparams(widget) {
    var params = new URLSearchParams(location.search);
    var paramList = Object.keys(Object.fromEntries(params.entries()));
    var pendingSearch = {};

    let mappedStateToURLParam = _.mapValues(stateToURLParam, paramName => { return getParamName(paramName, widget) });

    for (let [key, value] of Object.entries(mappedStateToURLParam)) {
        pendingSearch[key] = params.get(value);
        _.pull(paramList, value)
    }

    if (paramList.length) {
        pendingSearch.FacetSelections = {};

        paramList.forEach(param => {
            pendingSearch.FacetSelections[getParamName(param, widget, true)] = decodeSingleCommaSeparatedValues(params.get(param)); // decode
        });
    }

    return _.pickBy(pendingSearch);
}

export function updateUrl(widget) {
    return new Promise((resolve, reject) => {
        const history = createBrowserHistory();

        if (widget.config.urlUpdate.enabled) {
            history.push({
                search: getSearchQueryString(widget),
            });
            resolve();
        }
    });
}

function getSearchQueryString(widget) {
    var storeState = HawksearchVue.getWidgetStore(widget).state;
    var pendingSearch = storeState.pendingSearch;

    var paramEntries = [];

    for (let [stateField, urlParam] of Object.entries(stateToURLParam)) {
        paramEntries.push([urlParam, pendingSearch[stateField]])
    }

    var searchQuery = {
        ...Object.fromEntries(paramEntries),
        language: storeState.language,
        ...pendingSearch.FacetSelections
    };

    searchQuery = _.pickBy(searchQuery);
    searchQuery = _.mapKeys(searchQuery, (value, paramName) => getParamName(paramName, widget))
    return convertObjectToQueryString(searchQuery);
}

function convertObjectToQueryString(queryObj) {
    var params = new URLSearchParams();

    for (const key in queryObj) {
        if (queryObj[key]) {
            params.set(key, encodeSingleCommaSeparatedValues(queryObj[key]));
        }
    }
    return '?' + params.toString();
}

function encodeSingleCommaSeparatedValues(arr) {
    if (_.isArray(arr) && arr.length == 1) {
        if(arr[0].trim().indexOf(' ') != -1){
            return [arr[0].replace(',', '::')];
        }
        return arr;
    }
    else {
        let result = [];
        if(typeof arr == "string"){
            return [arr.replace(',', '::')]
        }else{
            for (let facet = 0; facet < arr.length; facet++) {
                result.push(arr[facet].replace(',', '::'));
            }

            return result;
        }
    }
}
function decodeSingleCommaSeparatedValues(value) {
    if (value && _.isString(value) && value.length > 1) {
        value = decodeURIComponent(value);

        if(value.trim().indexOf(' ') != -1){
            value = value.split(',');
            let selections = []
            for (let selection = 0; selection < value.length; selection++) {
                if (value[selection].includes('::')) {
                      let str = value[selection].replace('::', ',');
                      selections.push(str);
                }else{
                    selections.push(value[selection]);
                }
                
            }  
            return selections;
        }else{
            if (value.includes('::')) {
                return [value.replace('::', ',')];
            }
            else {
                return value.split(',');
                
            }
        }
    }
    else {
        return value;
    }
}
