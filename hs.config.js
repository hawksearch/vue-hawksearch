function getClientGuidFromUrl() {
    const urlParams = new URLSearchParams(window.location.search);
    return urlParams.get('clientGuid');
}

export default {
    clientGuid: getClientGuidFromUrl() || import.meta.env.VITE_CLIENT_GUID || "",
    apiUrl: import.meta.env.VITE_API_URL || "",
    appName: import.meta.env.VITE_APP_NAME,
    generateTemplateOverrides: true
};
