const parseUrl = require('./parseUrl');
const isUrlValid = require('./isValidUrl');
const domainRegex = '^(?:https?:\/\/)?(?:[^@\/\n]+@)?(?:www\.)?([^:\/\n]+)'; // Domain extracter regex from url

function crawl(url, maxDepth, isDebugMode) {
    const visitedLinks = new Set();
    const domain = extractDomainFromUrl(url);

    return parseUrl(isDebugMode, url, domain, maxDepth, visitedLinks, 0).then((response) => {
        return response.images;
    });
}

// Extract domain from url for relative urls
function extractDomainFromUrl(url) {
    if (isUrlValid(url)) {
        return url.match(domainRegex)[0];
    }
    throw new Error('Invalid url');
}

module.exports = crawl;