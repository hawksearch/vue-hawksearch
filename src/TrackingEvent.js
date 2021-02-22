import { getCookie, setCookie, getVisitorId, getVisitId, createGuid } from './CookieHandler';



class TrackingEvent {
    trackingURL;
    trackConfig;
    clientGUID;

     E_T = {
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

     P_T = {
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

     SearchType = {
        Initial: 1,
        Refinement: 2
    }

     TrackEventNameMapping = {
        'Click': 'click',
        'Cart': '',
        'CopyRequestTracking': '',
        'RequestTracking': '',
        'Search': 'searchtracking',
        'Sale': 'sale',
        'RecommendationImpression': '',
        'RecommendationClick': 'recommendationclick',
        'Rate': 'rate',
        'PageLoad': 'pageload',
        'Identify': '',
        'BannerImpression': 'bannerimpression',
        'BannerClick': 'bannerclick',
        'AutocompleteClick': 'autocompleteclick',
        'Add2CartMultiple': 'add2cartmultiple',
        'Add2Cart': 'add2cart'
    }

     AvailableEvents = [
        'click',
        'recommendationclick',
        'pageload',
        'searchtracking',
        'autocompleteclick',
        'bannerclick',
        'bannerimpression'
    ]

    constructor(config) {
        this.trackingURL = config.trackEventUrl;
        this.trackConfig = config.trackConfig;
        this.clientGUID = config.clientGuid;
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
            EventType: this.E_T.pageLoad,
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
        return this.makeRequest(pl);
    }

    writeSearchTracking(trackingId, typeId) {
        const guid = createGuid();

        if (typeId === SearchType.Initial) {
            setCookie('hawk_query_id', guid);
        }

        const queryId = getCookie('hawk_query_id') || guid;

        const c = document.documentElement;
        const pl = {
            EventType: this.E_T.search,
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
        return this.makeRequest(pl);
    }

    writeClick(event, uniqueId, trackingId, url) {
        const c = document.documentElement;
        const pl = {
            EventType: this.E_T.click,
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
        return this.makeRequest(pl);
    }

    writeBannerClick(bannerId, campaignId, trackingId) {
        const pl = {
            EventType: this.E_T.bannerClick,
            EventData: btoa(
                JSON.stringify({
                    CampaignId: campaignId,
                    BannerId: bannerId,
                    TrackingId: trackingId,
                })
            ),
        };
        return this.makeRequest(pl);
    }

    writeBannerImpression(bannerId, campaignId, trackingId) {
        const pl = {
            EventType: this.E_T.bannerImpression,
            EventData: btoa(
                JSON.stringify({
                    CampaignId: campaignId,
                    BannerId: bannerId,
                    TrackingId: trackingId,
                })
            ),
        };
        return this.makeRequest(pl);
    }

    writeSale(orderNo, itemList, total, subTotal, tax, currency) {
        const pl = {
            EventType: this.E_T.sale,
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
       return this.makeRequest(pl);
    }

    writeAdd2Cart(uniqueId, price, quantity, currency) {
        const pl = {
            EventType: this.E_T.addToCart,
            EventData: btoa(
                JSON.stringify({
                    UniqueId: uniqueId,
                    Quantity: quantity,
                    Price: price,
                    Currency: currency,
                })
            ),
        };
        return this.makeRequest(pl);
    }

    writeAdd2CartMultiple(args) {
        const pl = {
            EventType: this.E_T.add2CartMultiple,
            EventData: btoa(
                JSON.stringify({
                    ItemsList: args,
                })
            ),
        };
        return this.makeRequest(pl);
    }

    writeRate(uniqueId, value) {
        const pl = {
            EventType: this.E_T.rate,
            EventData: btoa(
                JSON.stringify({
                    UniqueId: uniqueId,
                    Value: value,
                })
            ),
        };
        return this.makeRequest(pl);
    }

    writeRecommendationClick(widgetGuid, uniqueId, itemIndex, requestId) {
        const pl = {
            EventType: this.E_T.recommendationClick,
            EventData: btoa(
                JSON.stringify({
                    ItemIndex: itemIndex,
                    RequestId: requestId,
                    UniqueId: uniqueId,
                    WidgetGuid: widgetGuid,
                })
            ),
        };
        return this.makeRequest(pl);
    }

    writeAutoCompleteClick(keyword, suggestType, name, url) {
        const pl = {
            EventType: this.E_T.autoCompleteClick,
            EventData: btoa(
                JSON.stringify({
                    Keyword: encodeURIComponent(keyword),
                    Name: encodeURIComponent(name),
                    SuggestType: suggestType,
                    Url: url,
                })
            ),
        };
        return this.makeRequest(pl);
    }

    makeRequest(data) {
        let visitId = getVisitId();
        let visitorId = getVisitorId();

        const pl = Object.assign(
            {
                ClientGuid: this.clientGUID,
                VisitId: visitId,
                VisitorId: visitorId,
            },
            data
        );

        return new Promise((resolve,reject) => {
            fetch(this.trackingURL, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(pl),
        })
        .then(()=>{
            resolve();
        })
        .catch(error => {
            console.error('Error:', error);
        });
    });

    }

    track(eventName, args) {
        if (!this.trackingURL || !this.clientGUID || !this.isEnabled(eventName)) {
            return;
        }

        switch (eventName.toLowerCase()) {
            case 'pageload':
                return this.writePageLoad(args.pageType);

            case 'searchtracking':
                return this.writeSearchTracking(args.trackingId, args.typeId);

            case 'click':
                return this.writeClick(args.event, args.uniqueId, args.trackingId, args.url);

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

    isEnabled(eventName) {
        return Boolean(this.AvailableEvents.includes(eventName) && (!this.trackConfig || this.trackConfig.find(e => this.TrackEventNameMapping[e] == eventName)));
    }
}

export default TrackingEvent;
