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
	const { keyword, sort, pg, mpp, lp, PageId, lpurl, searchWithin, is100Coverage, indexName, language, ...facetSelections } = queryObj;

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

export function updateUrl(state) {
	const history = createBrowserHistory();
	if (state.config.urlUpdate.enabled && !state.waitingForInitialSearch) {
		history.push({
			search: getSearchQueryString(state.pendingSearch),
		});
	}
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
	const queryStringValues = [];

	for (const key in queryObj) {
		if (queryObj.hasOwnProperty(key)) {
			if (allowedParams.includes(key)) {
				const value = queryObj[key];

				if (value === undefined || value === null) {
					// if any of the special keys just aren't defined or are null, don't include them in
					// the query string
					continue;
				}

				if (typeof value !== 'string') {
					throw new Error(`${key} must be a string`);
				}

				// certain strings are special and are never arrays
				queryStringValues.push(key + '=' + value);
			} else {
				const values = queryObj[key];

				// handle comma escaping - if any of the values contains a comma, they need to be escaped first
				const escapedValues = [];

				for (const unescapedValue of values) {
					escapedValues.push(unescapedValue.replace(',', '::'));
				}

				queryStringValues.push(key + '=' + escapedValues.join(','));
			}
		}
	}

	return '?' + queryStringValues.join('&');
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

		...searchRequest.FacetSelections,
	};

	return convertObjectToQueryString(searchQuery);
}
