const puppeteer = require("puppeteer");

const buildMockData = (erpId) => ({
  profile: {
    name: "Demo Student",
    email: `${erpId}@college.edu`,
  },
  attendance: [
    { subject: "CN", percent: 80 },
    { subject: "DBMS", percent: 72 },
    { subject: "OS", percent: 60 },
  ],
  timetable: [
    { day: "Mon", subject: "Operating Systems", time: "9:00 - 10:00", room: "A-102" },
    { day: "Mon", subject: "Computer Networks", time: "10:00 - 11:00", room: "B-204" },
    { day: "Tue", subject: "DBMS", time: "11:00 - 12:00", room: "C-303" },
  ],
  notices: [
    { title: "Holiday Tomorrow", content: "College will remain closed tomorrow.", date: "Nov 15, 2026" },
    { title: "Exam Schedule", content: "Mid sem exams start next week.", date: "Nov 14, 2026" },
  ],
});

const scrapeErpData = async ({ erpId, password }) => {
  const useMock = process.env.ERP_MOCK_MODE !== "false";

  if (useMock) {
    return buildMockData(erpId);
  }

  const loginUrl = process.env.ERP_LOGIN_URL;
  if (!loginUrl) {
    throw new Error("ERP_LOGIN_URL is required when ERP_MOCK_MODE=false");
  }

  const browser = await puppeteer.launch({
    headless: process.env.PUPPETEER_HEADLESS !== "false",
    args: ["--no-sandbox", "--disable-setuid-sandbox"],
  });

  try {
    const page = await browser.newPage();
    await page.goto(loginUrl, { waitUntil: "networkidle2", timeout: 45000 });

    const erpIdSelector = process.env.ERP_ID_SELECTOR || "input[name='username']";
    const passwordSelector = process.env.ERP_PASSWORD_SELECTOR || "input[name='password']";
    const submitSelector = process.env.ERP_SUBMIT_SELECTOR || "button[type='submit']";

    await page.waitForSelector(erpIdSelector, { timeout: 15000 });
    await page.type(erpIdSelector, erpId, { delay: 30 });
    await page.type(passwordSelector, password, { delay: 30 });

    await Promise.all([
      page.click(submitSelector),
      page.waitForNavigation({ waitUntil: "networkidle2", timeout: 45000 }),
    ]);

    // --- REAL ERP EXTRACTION LOGIC ---
    await new Promise(r => setTimeout(r, 4000)); // wait for dashboard animations and data

    // Navigate to My Account
    try {
      const accountElements = await page.$x("//*[contains(text(), 'My Account') or contains(text(), 'StudentProfile')]");
      let clickedAccount = false;
      for (const el of accountElements) {
         try {
            await el.click();
            clickedAccount = true;
            break;
         } catch(e) {}
      }
      if (clickedAccount) {
         await new Promise(r => setTimeout(r, 4000)); // wait for My Account to load
      }
    } catch(e) {
      console.log("Could not find My Account tab, proceeding on Dashboard", e.message);
    }
    // 1. Profile and Notices from Dashboard
    const dashboardData = await page.evaluate((id) => {
      // Find Name - Deep Scan
      let name = "Student";
      const walker = document.createTreeWalker(document.body, NodeFilter.SHOW_TEXT, null, false);
      let node;
      while ((node = walker.nextNode())) {
         const txt = node.textContent.trim();
         // Looking for a typical all-caps name. 
         if (txt.length > 5 && txt.length < 35 && txt === txt.toUpperCase()) {
            // Is it a name? Ignore common UI terms:
            if (!/DASHBOARD|LOG OUT|HOME|ATTENDANCE|MY ACCOUNT|TIMETABLE|PSIT|SEMESTER|FACULTY|REPORT|SUMMARY|STUDENT|DETAILS|WELCOME/i.test(txt)) {
                // If it contains space, likely First Last 
                if (txt.includes(' ')) {
                    name = txt;
                    break;
                }
            }
         }
      }
      
      // Clean up the name casing
      if (name !== "Student") {
         name = name.split(' ').map(w => w.charAt(0).toUpperCase() + w.slice(1).toLowerCase()).join(' ');
      }

      // Find Notices
      const dateRegex = /\d{2}\/\d{2}\/\d{2} \d{2}:\d{2} [aA|pP][mM]/;
      const allLeaves = Array.from(document.querySelectorAll('*')).filter(el => el.children.length === 0);
      const notices = [];
      const seenTitles = new Set();

      for (const el of allLeaves) {
        if (dateRegex.test(el.innerText)) {
           const dateStr = el.innerText.trim();
           const parentText = el.parentElement ? el.parentElement.innerText : "";
           const lines = parentText.split('\n').map(l => l.trim()).filter(l => l.length > 0);
           const title = lines[0]; // first line of the parent's text is typically the title
           
           if (title && title !== dateStr && !seenTitles.has(title) && title.length > 10) {
              seenTitles.add(title);
              notices.push({
                 title: title,
                 content: "Please check your ERP portal for full details.",
                 date: dateStr
              });
           }
        }
      }

      return { profile: { name, email: `${id}@psit.ac.in` }, notices: notices.slice(0, 10) };
    }, erpId);

    let attendance = [];
    let timetable = [];

    // 2. Navigate and Scrape Attendance
    try {
      // Find and click the "My Attendance" link robustly
      await page.evaluate(() => {
          const els = Array.from(document.querySelectorAll('a, span, div, li, button'));
          const target = els.find(e => e.innerText && e.innerText.trim().toUpperCase() === 'MY ATTENDANCE');
          if (target) target.click();
      });
      await new Promise(r => setTimeout(r, 4000)); // Wait for attendance page load
      
      attendance = await page.evaluate(() => {
          const att = [];
          const rows = document.querySelectorAll('tr');
          rows.forEach(row => {
             const text = row.innerText.toLowerCase();
             if (text.includes('%')) {
                const cells = Array.from(row.querySelectorAll('td, th'));
                const percentCell = cells.filter(c => c.innerText.includes('%')).pop();
                if (percentCell) {
                   const percentMatch = percentCell.innerText.match(/(\d+(?:\.\d+)?)/);
                   if (percentMatch) {
                      const subject = cells[0].innerText.replace(/\n/g, ' ').trim();
                      if (subject && subject.length > 2 && !subject.toLowerCase().includes('total')) {
                         att.push({ subject, percent: parseFloat(percentMatch[1]) });
                      }
                   }
                }
             }
          });
          return att;
      });
    } catch(e) {
      console.log("Error extracting attendance:", e.message);
    }

    if (attendance.length === 0) {
       attendance.push({ subject: "(Data scraped failed - Wait for sync)", percent: 0 });
    }

    // 3. Navigate back and Scrape Timetable
    try {
      await page.goto(loginUrl + "Student/Dashboard", { waitUntil: "networkidle2" }).catch(()=>{});
      await new Promise(r => setTimeout(r, 2000));

      await page.evaluate(() => {
          const els = Array.from(document.querySelectorAll('a, span, div, li, button'));
          const target = els.find(e => e.innerText && (e.innerText.trim().toUpperCase() === 'TIME TABLE' || e.innerText.trim().toUpperCase() === 'TIMETABLE'));
          if (target) target.click();
      });
      await new Promise(r => setTimeout(r, 4000)); // Wait for timetable page load

      // Generic Timetable Extractor
      timetable = await page.evaluate(() => {
          const tt = [];
          const rows = document.querySelectorAll('tr');
          const days = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
          
          rows.forEach(row => {
              const text = row.innerText.trim().replace(/\s+/g, ' ');
              // Try to identify rows that start with a Day or have strong subject characteristics
              const matchedDay = days.find(d => text.toLowerCase().startsWith(d.toLowerCase()));
              if (matchedDay) {
                  // Fallback generic parse
                  const parts = text.split(' ');
                  tt.push({ 
                      day: matchedDay, 
                      subject: text.length > 20 ? text.substring(0, 30) + "..." : text, 
                      time: "Class Time", 
                      room: "" 
                  });
              }
          });
          return tt;
      });
    } catch(e) {
      console.log("Error extracting timetable:", e.message);
    }
    
    return {
      profile: dashboardData.profile,
      notices: dashboardData.notices,
      attendance,
      timetable
    };
  } finally {
    await browser.close();
  }
};

module.exports = { scrapeErpData };
