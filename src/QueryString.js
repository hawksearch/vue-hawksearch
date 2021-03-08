import { createBrowserHistory } from 'History';

const allowedParams = [
	"keyword",
	"sort",
	"pg",
	"lp",
	"PageId",
	"lpurl",
	"mpp",
	"searchWithin",
	"is100Coverage",
	"indexName",
	"language"
];

export function parseSearchQueryString(search) {
	const queryObj = parseQueryStringToObject(search);

	// extract out components, including facet selections
	const { keyword, sort, pg, mpp, lp, PageId, lpurl, searchWithin, is100Coverage, indexName, language } = queryObj;
	let { ...facetSelections } = queryObj;
	facetSelections = _.mapValues(facetSelections, (value) => { return _.isArray(value) ? value : [value]});

	// ignore landing pages if keyword is passed
	const pageId = lp || PageId;

	return {
		Keyword: lpurl || pageId ? '' : keyword,
		SortBy: sort,
		PageNo: pg ? Number(pg) : undefined,
		MaxPerPage: mpp ? Number(mpp) : undefined,
		PageId: pageId ? Number(pageId) : undefined,
		CustomUrl: lpurl,
		SearchWithin: searchWithin,
		Is100CoverageTurnedOn: is100Coverage ? Boolean(is100Coverage) : undefined,
		FacetSelections: facetSelections,
		IndexName: indexName,
		Language: language
	};
}

export function updateUrl(storeState, widget) {
	return new Promise((resolve, reject) => {
		const history = createBrowserHistory();

		if (widget.config.urlUpdate.enabled && !storeState.waitingForInitialSearch) {
			history.push({
				search: getSearchQueryString(storeState.pendingSearch),
			});
			resolve();
		}
	});
}

function parseQueryStringToObject(search) {
	const params = new URLSearchParams(search);

	const parsed = {};

	params.forEach((value, key) => {
		if (allowedParams.includes(key)) {
			// `keyword` is special and should never be turned into an array
			parsed[key] = value;
		} else {
			// everything else should be turned into an array

			if (!value) {
				// no useful value for this query param, so skip it
				return;
			}

			// multiple selections are split by commas, so split into an array
			const multipleValues = value.split(',');

			// and now handle any comma escaping - any single value that contained a comma is escaped to '::'
			for (let x = 0; x < multipleValues.length; ++x) {
				multipleValues[x] = multipleValues[x].replace('::', ',');
			}

			parsed[key] = multipleValues;
		}
	});

	return parsed;
}

function convertObjectToQueryString(queryObj) {
	var params = new URLSearchParams();

	for (const key in queryObj) {
		if (queryObj[key]) {
			params.set(key, encodeSingleCommaSeparatedValues(queryObj[key]))
		}
	}

	return '?' + params.toString();
}

function getSearchQueryString(searchRequest) {
	const searchQuery = {
		keyword: searchRequest.Keyword,

		sort: searchRequest.SortBy,
		pg: searchRequest.PageNo ? String(searchRequest.PageNo) : undefined,
		mpp: searchRequest.MaxPerPage ? String(searchRequest.MaxPerPage) : undefined,
		is100Coverage: searchRequest.Is100CoverageTurnedOn ? String(searchRequest.Is100CoverageTurnedOn) : undefined,
		searchWithin: searchRequest.SearchWithin,
		indexName: searchRequest.IndexName,
		language: (searchRequest.ClientData && searchRequest.ClientData.Custom)  ? searchRequest.ClientData.Custom.language : undefined ,

		...searchRequest.FacetSelections,
	};

	return convertObjectToQueryString(searchQuery);
}

function encodeSingleCommaSeparatedValues(arr) {
	if (_.isArray(arr) && arr.length == 1) {
		return [arr[0].replace(',', '::')];
	}
	else {
		return arr;
	}
}