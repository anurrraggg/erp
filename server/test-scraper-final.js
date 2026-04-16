const puppeteer = require('puppeteer');
const fs = require('fs');

(async () => {
    console.log("🚀 Starting Final Check Test...");
    const browser = await puppeteer.launch({ headless: false, defaultViewport: null });
    const page = await browser.newPage();

    console.log("🌐 Navigating to ERP...");
    await page.goto('https://erp.psit.ac.in/', { waitUntil: 'domcontentloaded' });

    console.log("🛑 Please log in manually...");
    
    try {
        await page.waitForNavigation({ timeout: 60000, waitUntil: 'networkidle2' });
        console.log("✅ Logged in successfully! Wait while we navigate menu...");
        await new Promise(r => setTimeout(r, 4000));
        
        // 1. Click Attendance exactly!
        console.log("👆 Clicking 'My Attendance'...");
        await page.evaluate(() => {
            const els = Array.from(document.querySelectorAll('a, span, div, li, button'));
            const target = els.find(e => e.innerText && e.innerText.trim().toUpperCase() === 'MY ATTENDANCE');
            if (target) target.click();
        });
        
        await new Promise(r => setTimeout(r, 5000));
        fs.writeFileSync('true_attendance.html', await page.content());
        console.log("💾 Saved true_attendance.html!");
        
        // Go back to Dashboard
        await page.goto('https://erp.psit.ac.in/Student/Dashboard', { waitUntil: 'networkidle2' }).catch(()=>{});
        await new Promise(r => setTimeout(r, 3000));

        // 2. Click Timetable exactly!
        console.log("👆 Clicking 'Time Table'...");
        await page.evaluate(() => {
            const els = Array.from(document.querySelectorAll('a, span, div, li, button'));
            const target = els.find(e => e.innerText && e.innerText.trim().toUpperCase() === 'TIME TABLE' || e.innerText.trim().toUpperCase() === 'TIMETABLE');
            if (target) target.click();
        });
        
        await new Promise(r => setTimeout(r, 5000));
        fs.writeFileSync('true_timetable.html', await page.content());
        console.log("💾 Saved true_timetable.html!");
        
        console.log("\n🎉 TEST COMPLETE!");
        
    } catch (e) {
        console.error("❌ Test Failed:", e.message);
    } finally {
        await browser.close();
    }
})();
