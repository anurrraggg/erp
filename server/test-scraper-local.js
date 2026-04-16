const puppeteer = require('puppeteer');

(async () => {
    console.log("🚀 Starting Puppeteer Test...");
    // Launch Chrome visibly so you can see it working!
    const browser = await puppeteer.launch({ headless: false, defaultViewport: null });
    const page = await browser.newPage();

    console.log("🌐 Navigating to ERP...");
    await page.goto('https://erp.psit.ac.in/', { waitUntil: 'domcontentloaded' });

    console.log("🛑 WAIT! Please manually type your Username and Password into the Chrome window and click Login!");
    console.log("⌛ Waiting up to 60 seconds for you to log in...");

    try {
        // Wait until it reaches the Student Dashboard
        await page.waitForNavigation({ timeout: 60000, waitUntil: 'networkidle2' });
        console.log("✅ Logged in successfully!");
        
        // Let the page fully render
        await new Promise(r => setTimeout(r, 3000));
        
        // NOW WE RUN THE EXACT SCRAPER LOGIC
        console.log("🕵️‍♂️ Scraping data from the Dashboard...");
        const scrapedData = await page.evaluate(() => {
            
            // 1. Find Name - Deep Scan
            let name = "Student";
            const walker = document.createTreeWalker(document.body, NodeFilter.SHOW_TEXT, null, false);
            let node;
            while ((node = walker.nextNode())) {
                const txt = node.textContent.trim();
                if (txt.length > 5 && txt.length < 35 && txt === txt.toUpperCase()) {
                    if (!/DASHBOARD|LOG OUT|HOME|ATTENDANCE|MY ACCOUNT|TIMETABLE|PSIT|SEMESTER|FACULTY|REPORT|SUMMARY|STUDENT|DETAILS|WELCOME/i.test(txt)) {
                        if (txt.includes(' ')) {
                            name = txt;
                            break;
                        }
                    }
                }
            }
            if (name !== "Student") {
                name = name.split(' ').map(w => w.charAt(0).toUpperCase() + w.slice(1).toLowerCase()).join(' ');
            }

            // 2. Mock Timetable/Attendance extraction 
            // (We just want to see if the DOM can be read)
            const attendance = [];
            document.querySelectorAll('tr').forEach(row => {
                if (row.innerText.includes('%')) {
                   attendance.push(row.innerText.replace(/\n/g, ' '));
                }
            });

            return {
                foundName: name,
                foundAttendanceRows: attendance.length
            };
        });

        console.log("\n====== 🎯 SCRAPE RESULTS ======");
        console.log("Extracted Name: ", scrapedData.foundName);
        console.log("Found Attendance Data Rows: ", scrapedData.foundAttendanceRows);
        console.log("===============================\n");

        console.log("Closing browser in 5 seconds...");
        await new Promise(r => setTimeout(r, 5000));

    } catch (error) {
        console.error("❌ Test Failed (Maybe you didn't log in in time, or portal is down?):", error.message);
    } finally {
        await browser.close();
    }
})();
