const fs = require('fs');
const cheerio = require('cheerio');

const attHtml = fs.readFileSync('true_attendance.html', 'utf8');
let $ = cheerio.load(attHtml);
const att = [];
$('tr').each((i, row) => {
    const text = $(row).text();
    if(text.includes('%')) {
        const c = $(row).find('td, th');
        if(c.length > 1) {
            const subj = $(c[0]).text().trim().replace(/\n/g, ' ');
            const percentCell = $(c).filter((j,e) => $(e).text().includes('%')).last();
            const pct = percentCell.text().match(/(\d+(?:\.\d+)?)/)?.[1];
            if(pct && !subj.toLowerCase().includes('total')) {
                att.push(`${subj} : ${pct}%`);
            }
        }
    }
});
console.log("=== ATTENDANCE ===");
console.log(att.length ? att.join('\n') : "NO ATTENDANCE FOUND");

try {
    const ttHtml = fs.readFileSync('true_timetable.html', 'utf8');
    $ = cheerio.load(ttHtml);
    const tt = [];
    $('tr').each((i, row) => {
        const t = $(row).text().trim().replace(/\s+/g, ' ');
        if (t.length > 5 && !t.toLowerCase().includes('time table')) {
             tt.push(t);
        }
    });
    console.log("\n=== TIMETABLE RAW ROWS ===");
    console.log(tt.slice(0, 15).join('\n'));
} catch (e) {
    console.log("No timetable found");
}
