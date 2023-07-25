import { FacetType } from "./models/facets/FacetType";

export function getVisitorId() {
	let hawk_visitor_id = 'hawk_visitor_id'
	let visitorId = getCookie(hawk_visitor_id);

	if (!visitorId) {
		setCookie(hawk_visitor_id, createGuid(), getVisitorExpiry(), true);
		visitorId = getCookie(hawk_visitor_id);
	}

	return visitorId
}

export function getVisitId() {
	let hawk_visit_id = 'hawk_visit_id'
	let visitId = getCookie(hawk_visit_id);

	if (!visitId) {
		setCookie('hawk_visit_id', createGuid(), getVisitExpiry(), true);
		visitId = getCookie('hawk_visit_id');
	}

	return visitId
}

export function getCookie(name) {
	const nameEQ = name + '=';
	const ca = document.cookie.split(';');

	for (let i = 0; i < ca.length; i++) {
		let c = ca[i];
		while (c.charAt(0) === ' ') {
			c = c.substring(1, c.length);
		}
		if (c.indexOf(nameEQ) === 0) {
			return c.substring(nameEQ.length, c.length);
		}
	}
	return null;
}

export function setCookie(name, value, expiry, secure) {
	let expires;

	if (expiry) {
		expires = '; expires=' + expiry;
	}
	else {
		expires = '';
	}

	let cookie = name + '=' + value + expires + '; path=/';
	if (secure) {
		cookie += ';secure';
	}
	document.cookie = cookie;
}

export const deleteCookie = name => {
	document.cookie = name + '=;expires=Thu, 01 Jan 1970 00:00:01 GMT;';
};

export function createGuid() {
	const s = [];
	const hexDigits = '0123456789abcdef';
	for (let i = 0; i < 36; i++) {
		s[i] = hexDigits.substr(Math.floor(Math.random() * 0x10), 1);
	}
	s[14] = '4'; // bits 12-15 of the time_hi_and_version field to 0010
	// tslint:disable-next-line: no-bitwise
	s[19] = hexDigits.substr((s[19] & 0x3) | 0x8, 1); // bits 6-7 of the clock_seq_hi_and_reserved to 01
	s[8] = s[13] = s[18] = s[23] = '-';

	const uuid = s.join('');
	return uuid;
}

function getVisitorExpiry() {
	const d = new Date();
	// 1 year
	d.setTime(d.getTime() + 360 * 24 * 60 * 60 * 1000);
	return d.toUTCString();
}

function getVisitExpiry() {
	const d = new Date();
	// 4 hours
	d.setTime(d.getTime() + 4 * 60 * 60 * 1000);
	return d.toUTCString();
}

export const getParsedObject = (facetC) => {
	if (!facetC) {
		return {};
	}
	const dict = {};
	(facetC || '').split(',').forEach(element => {
		const splitText = element.split('|');
		dict[splitText[0]] = splitText[1];
	});
	return dict;
};

function getStringifyObject(obj) {
	let str = '';
	const items = [];
	Object.keys(obj).forEach((element) => {
		if (typeof obj[element] === 'object') {
			Object.keys(obj[element]).forEach((key, index) => {
				const item = element + '|' + key + '|' + obj[element][key]
				items.push(item)
			})
		} else {
			const item = element + '|' + obj[element]
			items.push(item)
		}
	});
	return items.join(',');
}

function getRecentFacetExpiry() {
	const d = new Date();
	// 12 hours
	d.setTime(d.getTime() + 12 * 60 * 60 * 1000);
	return d.toUTCString();
}

export const getRecentSearch = () => {
	const cookie = getCookie(FacetType.RecentSearches);
	return getParsedObject(cookie);
}

export const setRecentSearch = val => {
	const cookie = getCookie(FacetType.RecentSearches);
	if (!cookie) {
		setCookie(FacetType.RecentSearches, `${val}|1`, getRecentFacetExpiry());
		return;
	}
	let dict = getParsedObject(cookie);
	if (dict[val]) {
		dict[val] = Number(dict[val]) + 1;
	} else {
		dict = {
			...dict,
			[val]: 1,
		};
	}
	const str = getStringifyObject(dict);

	setCookie(FacetType.RecentSearches, str, getRecentFacetExpiry());
};
