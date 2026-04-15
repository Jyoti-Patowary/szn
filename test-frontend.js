const { chromium } = require('playwright');

(async () => {
  const browser = await chromium.launch();
  const page = await browser.newPage();

  // Navigate to the app
  await page.goto('http://localhost:8082');

  // Wait for it to load
  await page.waitForTimeout(2000);

  // Take screenshot of default theme (Spring)
  await page.screenshot({ path: 'spring-theme.png' });

  // Click Summer
  await page.getByText('Summer', { exact: true }).click();
  await page.waitForTimeout(500);
  await page.screenshot({ path: 'summer-theme.png' });

  // Click Winter
  await page.getByText('Winter', { exact: true }).click();
  await page.waitForTimeout(500);
  await page.screenshot({ path: 'winter-theme.png' });

  await browser.close();
})();
