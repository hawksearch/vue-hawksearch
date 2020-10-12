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
                // TrackingProperties: hs.Context,
                // CustomDictionary: hs.Context.Custom,
            },
            data
        );

        fetch(this.trackingURL, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(pl),
        })
            .then(resp => {
                //console.log('Success:', resp.status);
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
                // HawkSearch.Context.add("uniqueid", "123456789");
                return this.writePageLoad(args.pageType);
            case 'searchtracking':
                // HawkSearch.Tracking.track("searchtracking", {trackingId:"a9bd6e50-e434-45b9-9f66-489eca07ad0a", typeId: HawkSearch.Tracking.SearchType.Initial});
                // HawkSearch.Tracking.track("searchtracking", {trackingId:"a9bd6e50-e434-45b9-9f66-489eca07ad0a", typeId: HawkSearch.Tracking.SearchType.Refinement});
                return this.writeSearchTracking(args.trackingId, args.typeId); // CHANGED
            case 'click':
                // HawkSearch.Tracking.track('click',{event: e, uniqueId: "33333", trackingId: "75a0801a-a93c-4bcb-81f1-f4b011f616e3"});
                return this.writeClick(args.event, args.uniqueId, args.trackingId, ''); // CHANGED
            case 'bannerclick':
                // HawkSearch.Tracking.track('bannerclick',{bannerId: 1, campaignId: 2, trackingId:"2d652a1e-2e05-4414-9d76-51979109f724"});
                return this.writeBannerClick(args.bannerId, args.campaignId, args.trackingId); // CHANGED
            case 'bannerimpression':
                // HawkSearch.Tracking.track('bannerimpression',{bannerId: "2", campaignId: "2", trackingId:"2d652a1e-2e05-4414-9d76-51979109f724"});
                return this.writeBannerImpression(args.bannerId, args.campaignId, args.trackingId); // CHANGED
            case 'sale':
                // HawkSearch.Tracking.track('sale', {orderNo: 'order_123',itemList: [{uniqueid: '123456789', itemPrice: 12.99, quantity: 2}], total: 25.98, subTotal: 22, tax: 3.98, currency: 'USD'});
                return this.writeSale(args.orderNo, args.itemList, args.total, args.subTotal, args.tax, args.currency);
            case 'add2cart':
                // HawkSearch.Tracking.track('add2cart',{uniqueId: '123456789', price: 19.99, quantity: 3, currency: 'USD'});
                return this.writeAdd2Cart(args.uniqueId, args.price, args.quantity, args.currency);
            case 'add2cartmultiple':
                // HawkSearch.Tracking.track('add2cartmultiple', [{uniqueId: '123456789',price: 15.97,quantity: 1,currency: 'USD'},{uniqueId: '987465321', price: 18.00, quantity: 1, currency: 'USD'}]);
                return this.writeAdd2CartMultiple(args);
            case 'rate':
                // HawkSearch.Tracking.track('rate', {uniqueId: '123456789',value: 3.00});
                return this.writeRate(args.uniqueId, args.value);
            case 'recommendationclick':
                // HawkSearch.Tracking.track('recommendationclick',{uniqueId: "223222", itemIndex: "222", widgetGuid:"2d652a1e-2e05-4414-9d76-51979109f724", requestId:"2d652a1e-2e05-4414-9d76-51979109f724"});
                return this.writeRecommendationClick(args.widgetGuid, args.uniqueId, args.itemIndex, args.requestId);
            case 'autocompleteclick':
                // HawkSearch.Tracking.track('autocompleteclick',{keyword: "test", suggestType: HawkSearch.Tracking.SuggestType.PopularSearches, name:"tester", url:"/test"});
                return this.writeAutoCompleteClick(args.keyword, args.suggestType, args.name, args.url); // CHANGED
        }
    }
}

export default TrackingEvent;
