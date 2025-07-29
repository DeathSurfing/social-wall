const puppeteer = require("puppeteer");
const fs = require("fs");
const path = require("path");

(async () => {
  // Load post.json
  const jsonPath = path.resolve(__dirname, "../src/data/post.json");
  const data = JSON.parse(fs.readFileSync(jsonPath, "utf-8"));

  const { extraction_date, platform, url } = data;

  // Create output directory if it doesn't exist
  const outputDir = path.resolve(__dirname, "posts");
  if (!fs.existsSync(outputDir)) {
    fs.mkdirSync(outputDir);
  }

  // Launch Puppeteer
  const browser = await puppeteer.launch({ headless: "new" });
  const page = await browser.newPage();

  // Set a larger viewport for Instagram embeds
  await page.setViewport({ width: 800, height: 1000 });

  // Go to the embed URL
  await page.goto(url, { waitUntil: "networkidle2", timeout: 60000 });

  // Wait for the Instagram embed to render
  await page.waitForSelector("iframe");

  // Instagram embeds are inside an iframe
  const frameHandle = await page.$("iframe");
  const frame = await frameHandle.contentFrame();

  // Wait for the post content to load in the iframe
  await frame.waitForSelector("article", { timeout: 30000 });

  // Take screenshot of the iframe content
  const postElement = await frame.$("article");
  const screenshotPath = path.resolve(
    outputDir,
    `instagram_${extraction_date}.webp`
  );

  await postElement.screenshot({
    path: screenshotPath,
    type: "webp",
  });

  console.log(`✅ Screenshot saved to ${screenshotPath}`);

  await browser.close();
})();

