const E_T = {
    pageLoad: 1,
    search: 2,
    click: 3,
    addToCart: 4,
    rate: 5,
    sale: 6,
    bannerClick: 7,
    bannerImpression: 8,
    recommendationClick: 10,
    autoCompleteClick: 11,
    add2CartMultiple: 14
}

const P_T = {
    item: 1,
    landing: 2,
    cart: 3,
    order: 4,
    custom: 5
}

//var SuggestType = {
//    PopularSearches: 1,
//    TopCategories: 2,
//    TopProductMatches: 3,
//    TopContentMatches: 4
//}

const SearchType = {
    Initial: 1,
    Refinement: 2
}

class TrackingEvent {
    trackingURL;
    clientGUID;

    constructor(config) {
        this.trackingURL = config.trackEventUrl;
        this.clientGUID = config.clientGuid;
    }

    getVisitorExpiry() {
        const d = new Date();
        // 1 year
        d.setTime(d.getTime() + 360 * 24 * 60 * 60 * 1000);
        return d.toUTCString();
    }

    getVisitExpiry() {
        const d = new Date();
        // 4 hours
        d.setTime(d.getTime() + 4 * 60 * 60 * 1000);
        return d.toUTCString();
    }

    createGuid() {
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

    getCookie(name) {
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

    setCookie(name, value, expiry) {
        let expires;

        if (expiry) {
            expires = '; expires=' + expiry;
        }
        else {
            expires = '';
        }

        document.cookie = name + '=' + value + expires + '; path=/';
    }

    getSearchType(searchParams, responseData) {
        if (searchParams && responseData && searchParams.Keyword == responseData.Keyword) {
            return SearchType.Refinement;
        }
        else {
            return SearchType.Initial;
        }
    }

    writePageLoad(pageType) {
        const c = document.documentElement;
        const pl = {
            EventType: E_T.pageLoad,
            EventData: btoa(
                JSON.stringify({
                    PageTypeId: P_T[pageType],
                    RequestPath: window.location.pathname,
                    Qs: window.location.search,
                    ViewportHeight: c.clientHeight,
                    ViewportWidth: c.clientWidth,
                })
            ),
        };
        this.mr(pl);
    }

    writeSearchTracking(trackingId, typeId) {
        const guid = this.createGuid();

        if (typeId === SearchType.Initial) {
            this.setCookie('hawk_query_id', guid);
        }

        const queryId = this.getCookie('hawk_query_id') || guid;

        const c = document.documentElement;
        const pl = {
            EventType: E_T.search,
            EventData: btoa(
                JSON.stringify({
                    QueryId: queryId,
                    TrackingId: trackingId,
                    TypeId: typeId,
                    ViewportHeight: c.clientHeight,
                    ViewportWidth: c.clientWidth,
                })
            ),
        };
        this.mr(pl);
    }

    writeClick(event, uniqueId, trackingId, url) {
        const c = document.documentElement;
        const pl = {
            EventType: E_T.click,
            EventData: btoa(
                JSON.stringify({
                    Url: url,
                    Qs: window.location.search,
                    RequestPath: window.location.pathname,
                    TrackingId: trackingId,
                    UniqueId: uniqueId,
                    ViewportHeight: c.clientHeight,
                    ViewportWidth: c.clientWidth,
                })
            ),
        };
        this.mr(pl);
    }

    writeBannerClick(bannerId, campaignId, trackingId) {
        const pl = {
            EventType: E_T.bannerClick,
            EventData: btoa(
                JSON.stringify({
                    CampaignId: campaignId,
                    BannerId: bannerId,
                    TrackingId: trackingId,
                })
            ),
        };
        this.mr(pl);
    }

    writeBannerImpression(bannerId, campaignId, trackingId) {
        const pl = {
            EventType: E_T.bannerImpression,
            EventData: btoa(
                JSON.stringify({
                    CampaignId: campaignId,
                    BannerId: bannerId,
                    TrackingId: trackingId,
                })
            ),
        };
        this.mr(pl);
    }

    writeSale(orderNo, itemList, total, subTotal, tax, currency) {
        const pl = {
            EventType: E_T.sale,
            EventData: btoa(
                JSON.stringify({
                    OrderNo: orderNo,
                    ItemList: itemList,
                    Total: total,
                    Tax: tax,
                    SubTotal: subTotal,
                    Currency: currency,
                })
            ),
        };
        this.mr(pl);
    }

    writeAdd2Cart(uniqueId, price, quantity, currency) {
        const pl = {
            EventType: E_T.addToCart,
            EventData: btoa(
                JSON.stringify({
                    UniqueId: uniqueId,
                    Quantity: quantity,
                    Price: price,
                    Currency: currency,
                })
            ),
        };
        this.mr(pl);
    }

    writeAdd2CartMultiple(args) {
        const pl = {
            EventType: E_T.add2CartMultiple,
            EventData: btoa(
                JSON.stringify({
                    ItemsList: args,
                })
            ),
        };
        this.mr(pl);
    }

    writeRate(uniqueId, value) {
        const pl = {
            EventType: E_T.rate,
            EventData: btoa(
                JSON.stringify({
                    UniqueId: uniqueId,
                    Value: value,
                })
            ),
        };
        this.mr(pl);
    }

    writeRecommendationClick(widgetGuid, uniqueId, itemIndex, requestId) {
        const pl = {
            EventType: E_T.recommendationClick,
            EventData: btoa(
                JSON.stringify({
                    ItemIndex: itemIndex,
                    RequestId: requestId,
                    UniqueId: uniqueId,
                    WidgetGuid: widgetGuid,
                })
            ),
        };
        this.mr(pl);
    }

    writeAutoCompleteClick(keyword, suggestType, name, url) {
        const pl = {
            EventType: E_T.autoCompleteClick,
            EventData: btoa(
                JSON.stringify({
                    Keyword: keyword,
                    Name: name,
                    SuggestType: suggestType,
                    Url: url,
                })
            ),
        };
        this.mr(pl);
    }

    mr(data) {
        let visitId = this.getCookie('hawk_visit_id');
        let visitorId = this.getCookie('hawk_visitor_id');

        if (!visitId) {
            this.setCookie('hawk_visit_id', this.createGuid(), this.getVisitExpiry());
            visitId = this.getCookie('hawk_visit_id');
        }

        if (!visitorId) {
            this.setCookie('hawk_visitor_id', this.createGuid(), this.getVisitorExpiry());
            visitorId = this.getCookie('hawk_visitor_id');
        }

        const pl = Object.assign(
            {
                ClientGuid: this.clientGUID,
                VisitId: visitId,
                VisitorId: visitorId,
            },
            data
        );

        fetch(this.trackingURL, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(pl),
        })
        .catch(error => {
            console.error('Error:', error);
        }); 
    }

    track(eventName, args) {
        if (!this.trackingURL || !this.clientGUID) {
            return;
        }

        switch (eventName.toLowerCase()) {
            case 'pageload':
                return this.writePageLoad(args.pageType);

            case 'searchtracking':
                return this.writeSearchTracking(args.trackingId, args.typeId);

            case 'click':
                return this.writeClick(args.event, args.uniqueId, args.trackingId, '');

            case 'bannerclick':
                return this.writeBannerClick(args.bannerId, args.campaignId, args.trackingId);

            case 'bannerimpression':
                return this.writeBannerImpression(args.bannerId, args.campaignId, args.trackingId);

            case 'sale':
                return this.writeSale(args.orderNo, args.itemList, args.total, args.subTotal, args.tax, args.currency);

            case 'add2cart':
                return this.writeAdd2Cart(args.uniqueId, args.price, args.quantity, args.currency);

            case 'add2cartmultiple':
                return this.writeAdd2CartMultiple(args);

            case 'rate':
                return this.writeRate(args.uniqueId, args.value);

            case 'recommendationclick':
                return this.writeRecommendationClick(args.widgetGuid, args.uniqueId, args.itemIndex, args.requestId);

            case 'autocompleteclick':
                return this.writeAutoCompleteClick(args.keyword, args.suggestType, args.name, args.url);

        }
    }
}

export default TrackingEvent;
