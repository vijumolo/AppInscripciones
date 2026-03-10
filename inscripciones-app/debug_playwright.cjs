const { chromium } = require('playwright');

(async () => {
    const browser = await chromium.launch();
    const page = await browser.newPage();

    page.on('console', msg => {
        if (msg.type() === 'error') {
            console.log('BROWSER_ERROR:', msg.text());
        } else {
            console.log('BROWSER_LOG:', msg.text());
        }
    });

    page.on('pageerror', error => {
        console.log('PAGE_EXCEPTION:', error.message);
    });

    console.log("Navigating to http://localhost:5175/admin ...");

    try {
        await page.goto('http://localhost:5175/admin', { waitUntil: 'networkidle' });

        // Wait a second for any redirects or renders
        await page.waitForTimeout(2000);

        console.log("Current URL after load:", page.url());

        // Type in email and password
        await page.fill('input[type="email"]', 'admin@ejemplo.com');
        await page.fill('input[type="password"]', 'anypassword');

        console.log("Clicking login...");
        await page.click('button[type="submit"]');

        // Wait for potential navigation to dashboard
        await page.waitForTimeout(3000);
        console.log("Current URL after login attempt:", page.url());

    } catch (e) {
        console.error("Navigation Error:", e);
    }

    await browser.close();
})();
