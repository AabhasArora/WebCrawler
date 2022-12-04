const cheerio = require('cheerio');
const got = require('got');
const isUrlValid = require('./isValidUrl');

function parseUrl(isDebugMode, url, domain, maxDepth, visited, level) {
    const links = new Set();
    const images = new Set();
    const result = {};

    if (isDebugMode) {
        console.log(url);
    }
    
    if (isUrlValid(url)) {
        return got(url).then(response => {
            const $ = cheerio.load(response.body);

            visited.add(url); // Add url to visited links

            // Parse img tags
            $('img').each((i, link) => {
                const src = link.attribs.src;
                if (src) {
                    images.add(src);
                }
            });

            // Append image list to result
            result.images = formatResponse(images, url, level);

            // Check depth for recursion
            if (level < maxDepth) {

                // Parse link tags
                $('a').each((i, link) => {
                    let href = link.attribs.href;
                    let baseUrl = '';

                    // Remove links that are not to be parsed
                    if (isRemovableLink(href)) {
                        return;
                    }

                    // Handle relative links
                    if (isRelativeUrl(href)) {
                        baseUrl = domain;
                        //href = href.slice(1);
                    }

                    // Add links to parsing list
                    links.add(`${baseUrl}${href}`);
                });

                let linkArray = Array.from(links).filter(link => !visited.has(link)); // Remove visited links

                if (isDebugMode) {
                    linkArray.splice(10); // Run for 10 links
                }

                // Parse urls
                const promiseArr = linkArray.map(link => parseUrl(isDebugMode, link, domain, maxDepth, visited, level + 1));
                
                return Promise.all(promiseArr).then(([...list]) => {
                    let imageList = [];
                    
                    // Concat image list
                    list.forEach(listIterator => {
                        listIterator.images.forEach(listImage => {
                            imageList.push(listImage);
                        })
                    })
                    return imageList;
                })
                .then((imageList) => {
                    result.images = result.images.concat(imageList);
                })
                .then(() => result);
            }
            return result;
        })
        .catch(err => {
            console.log(err);
        });
    }
    else {
        if (isDebugMode) {
            console.log('Invalid url', url);
        }
    }
}

// Format image response
function formatResponse(images, url, level) {
    let imgArr = Array.from(images).map(image => ({
        imageUrl: image,
        sourceUrl: url,
        depth: level
    }));
    return imgArr;
}

// Find removable links
function isRemovableLink(href) {
    if (!href || href.startsWith('mailto:') || href.startsWith('tel:') || href.startsWith('#')) {
        return true;
    }
    return false;
}

// Finds relative url
function isRelativeUrl(href) {
    if (href.startsWith('/')) {
        return true;
    }
    return false;
}

module.exports = parseUrl;