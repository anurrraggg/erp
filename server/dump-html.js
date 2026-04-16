const fs = require('fs');
const puppeteer = require('puppeteer');

(async () => {
    console.log("🚀 Starting HTML Dumper...");
    const browser = await puppeteer.launch({ headless: false, defaultViewport: null });
    const page = await browser.newPage();

    console.log("🌐 Navigating to ERP...");
    await page.goto('https://erp.psit.ac.in/', { waitUntil: 'domcontentloaded' });

    console.log("🛑 Please log in manually...");
    
    try {
        await page.waitForNavigation({ timeout: 60000, waitUntil: 'networkidle2' });
        console.log("✅ Logged in successfully!");
        await new Promise(r => setTimeout(r, 3000));
        
        // 1. Save Dashboard HTML
        console.log("💾 Saving Dashboard HTML...");
        const dashHtml = await page.content();
        fs.writeFileSync('dashboard.html', dashHtml);

        // 2. Try to find and click Attendance
        const attElements = await page.$$('::-p-xpath(//a[contains(translate(text(), "ABCDEFGHIJKLMNOPQRSTUVWXYZ", "abcdefghijklmnopqrstuvwxyz"), "attendance")])');
        for (const el of attElements) {
            try {
                console.log("👆 Clicking Attendance Link...");
                await el.click();
                await new Promise(r => setTimeout(r, 4000));
                console.log("💾 Saving Attendance HTML...");
                fs.writeFileSync('attendance.html', await page.content());
                break;
            } catch (e) {}
        }
        
        // Go back to Dashboard to find Timetable
        await page.goto('https://erp.psit.ac.in/Student/Dashboard', { waitUntil: 'networkidle2' }).catch(() => {});
        await new Promise(r => setTimeout(r, 2000));

        // 3. Try to find and click Timetable
        const ttElements = await page.$$('::-p-xpath(//a[contains(translate(text(), "ABCDEFGHIJKLMNOPQRSTUVWXYZ", "abcdefghijklmnopqrstuvwxyz"), "timetable") or contains(translate(text(), "ABCDEFGHIJKLMNOPQRSTUVWXYZ", "abcdefghijklmnopqrstuvwxyz"), "time table")])');
        for (const el of ttElements) {
            try {
                console.log("👆 Clicking Timetable Link...");
                await el.click();
                await new Promise(r => setTimeout(r, 4000));
                console.log("💾 Saving Timetable HTML...");
                fs.writeFileSync('timetable.html', await page.content());
                break;
            } catch (e) {}
        }

        console.log("\n🎉 ALL DONE! Closing browser in 2 seconds...");
        await new Promise(r => setTimeout(r, 2000));

    } catch (error) {
        console.error("❌ Test Failed:", error.message);
    } finally {
        await browser.close();
    }
})();
