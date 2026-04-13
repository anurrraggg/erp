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

    // The real extraction selectors should be mapped for your ERP pages.
    // Until then, return stable data structure after a successful login.
    return buildMockData(erpId);
  } finally {
    await browser.close();
  }
};

module.exports = { scrapeErpData };
