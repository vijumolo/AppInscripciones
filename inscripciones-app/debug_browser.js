import puppeteer from 'puppeteer';

(async () => {
    try {
        const browser = await puppeteer.launch({ headless: 'new' });
        const page = await browser.newPage();

        page.on('console', msg => console.log('BROWSER_LOG:', msg.text()));
        page.on('pageerror', err => console.log('BROWSER_ERROR:', err.message));

        console.log("Navigating to http://localhost:5175/admin ...");
        await page.goto('http://localhost:5175/admin', { waitUntil: 'networkidle0' });

        console.log("Taking screenshot...");
        await page.screenshot({ path: 'admin_login_error.png' });

        const bodyHTML = await page.evaluate(() => document.body.innerHTML);
        console.log("BODY LENGTH:", bodyHTML.length);
        if (bodyHTML.length < 500) {
            console.log("BODY CONTENT:", bodyHTML);
        }

        await browser.close();
    } catch (e) {
        console.error("Puppeteer Script Error:", e);
    }
})();
