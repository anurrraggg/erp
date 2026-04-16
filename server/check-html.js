const fs = require('fs');
const cheerio = require('cheerio');
const $ = cheerio.load(fs.readFileSync('dashboard.html'));
const att = [];
$('tr').each((i, row) => {
    if($(row).text().includes('%')) {
        att.push($(row).text().replace(/\s+/g,' ').trim());
    }
});
console.log("Dashboard TR elements with %:", att);

const lists = [];
$('ul > li').each((i, row) => {
    lists.push($(row).text().trim());
});
console.log("Lists:", lists.slice(0, 10));
