export function getVisitorId() {
	let hawk_visitor_id = 'hawk_visitor_id'
	let visitorId = getCookie(hawk_visitor_id);

	if (!visitorId) {
		setCookie(hawk_visitor_id, createGuid(), getVisitorExpiry());
		visitorId = getCookie(hawk_visitor_id);
	}

	return visitorId
}

export function getVisitId() {
	let hawk_visit_id = 'hawk_visit_id'
	let visitId = getCookie(hawk_visit_id);

	if (!visitId) {
		setCookie('hawk_visit_id', createGuid(), getVisitExpiry());
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

export function setCookie(name, value, expiry) {
	let expires;

	if (expiry) {
		expires = '; expires=' + expiry;
	}
	else {
		expires = '';
	}

	document.cookie = name + '=' + value + expires + '; path=/';
}

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

