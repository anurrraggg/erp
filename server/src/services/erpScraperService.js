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

    const erpIdSelector = process.env.ERP_ID_SELECTOR || "input[name='erpId']";
    const passwordSelector = process.env.ERP_PASSWORD_SELECTOR || "input[type='password']";
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

    // 1. Profile and Notices from Dashboard
    const dashboardData = await page.evaluate((id) => {
      // Find Name
      let name = "Demo Student";
      const headings = Array.from(document.querySelectorAll('h1, h2, h3, h4, h5, div.font-bold, strong, b'));
      for (const h of headings) {
        if (h.innerText === h.innerText.toUpperCase() && h.innerText.length > 4 && h.innerText.length < 30) {
          name = h.innerText.trim();
          break; // First bold uppercase string is usually the name
        }
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

    // 2. Navigate to Attendance
    try {
      // Find and click the "My Attendance" button/link
      const elements = await page.$x("//*[contains(text(), 'My Attendance')]");
      let clicked = false;
      for (const el of elements) {
         try {
            await el.click();
            clicked = true;
            break;
         } catch(e) {}
      }
      
      if (clicked) {
        await new Promise(r => setTimeout(r, 4000)); // Wait for attendance page to load
        
        attendance = await page.evaluate(() => {
          const att = [];
          const rows = document.querySelectorAll('tr');
          rows.forEach(row => {
            const text = row.innerText.toLowerCase();
            if (text.includes('%')) {
               const cells = Array.from(row.querySelectorAll('td, th'));
               const percentCell = cells.find(c => c.innerText.includes('%'));
               if (percentCell) {
                 const percentMatch = percentCell.innerText.match(/(\d+(?:\.\d+)?)/);
                 if (percentMatch) {
                    const subject = cells[0].innerText.replace('\n', ' ').trim();
                    if (subject && subject.toLowerCase() !== 'total') {
                       att.push({ subject, percent: parseFloat(percentMatch[1]) });
                    }
                 }
               }
            }
          });
          return att;
        });
      }
    } catch(e) {
      console.log("Error extracting attendance:", e.message);
    }

    if (attendance.length === 0) {
       // Graceful fallback so the frontend doesn't break
       attendance.push({ subject: "(Data scraped failed - Contact Admin)", percent: 0 });
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
