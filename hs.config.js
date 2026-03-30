function getClientGuidFromUrl() {
    const urlParams = new URLSearchParams(window.location.search);
    return urlParams.get('clientGuid');
}

export default {
    clientGuid: getClientGuidFromUrl() || import.meta.env.VITE_CLIENT_GUID || "3953cf87e0aa4a4eb9496a24d5a0fa84",
    apiUrl: import.meta.env.VITE_API_URL || "https://searchapi-dev.hawksearch.net/api/v2/search/",
    appName: import.meta.env.VITE_APP_NAME,
    generateTemplateOverrides: true
};