const fs = require('fs');

const crawlUrl = require('./crawlUrl')

var args = process.argv.slice(2);

const isDebugMode = !!args.filter(arg => arg.indexOf('--debug') !== -1).length;
const base = args[0];
const depth = parseInt(args[1], 10);

crawlUrl(base, depth, isDebugMode).then(list => fs.writeFileSync('results.json', JSON.stringify(list)));