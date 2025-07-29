const puppeteer = require("puppeteer");
const fs = require("fs");
const path = require("path");

// Load all posts from JSON
const jsonPath = path.resolve(__dirname, "src/data/posts.json");
const posts = JSON.parse(fs.readFileSync(jsonPath, "utf-8"));

// Ensure output directory exists
const outputDir = path.resolve(__dirname, "public/posts");
if (!fs.existsSync(outputDir)) {
  fs.mkdirSync(outputDir, { recursive: true });
}

(async () => {
  const browser = await puppeteer.launch({ headless: "new" });

  for (const post of posts) {
    const { extraction_date, platform, url } = post;

    const page = await browser.newPage();
    await page.setViewport({ width: 800, height: 1000 });

    console.log(`📸 Capturing ${platform} post from ${url}`);

    try {
      await page.goto(url, { waitUntil: "networkidle2", timeout: 60000 });
      await page.waitForSelector("iframe", { timeout: 15000 });

      const frameHandle = await page.$("iframe");
      const frame = await frameHandle.contentFrame();

      await frame.waitForSelector("article", { timeout: 20000 });
      const postElement = await frame.$("article");

      const filename = `${platform.toLowerCase()}_${extraction_date}.webp`;
      const outputPath = path.resolve(outputDir, filename);

      await postElement.screenshot({
        path: outputPath,
        type: "webp",
      });

      console.log(`✅ Saved to ${outputPath}`);
    } catch (err) {
      console.error(`❌ Failed to capture ${url}:`, err.message);
    } finally {
      await page.close();
    }
  }

  await browser.close();
})();

