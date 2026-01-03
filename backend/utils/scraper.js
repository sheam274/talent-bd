const puppeteer = require('puppeteer');
const Job = require('../models/Job');

const scrapeJobs = async () => {
    const browser = await puppeteer.launch({ headless: "new", args: ['--no-sandbox'] });
    const page = await browser.newPage();
    try {
        await page.goto('https://alljobs.teletalk.com.bd/jobs/latest', { waitUntil: 'networkidle2' });

        const jobs = await page.evaluate(() => {
            const results = [];
            const rows = document.querySelectorAll('tr'); 
            rows.forEach(row => {
                const titleEl = row.querySelector('td a');
                if (titleEl) {
                    const title = titleEl.innerText;
                    // Dynamic Categorization Logic
                    let category = "Private";
                    if (title.includes("Director") || title.includes("Ministry")) category = "Government";
                    else if (title.includes("Bank")) category = "Bank";
                    else if (title.includes("Officer") || title.includes("Assistant")) category = "Official";

                    results.push({
                        title: title.trim(),
                        company: "Consolidated Source",
                        category: category,
                        deadline: "See Circular",
                        link: titleEl.href
                    });
                }
            });
            return results;
        });

        for (let job of jobs) {
            await Job.updateOne({ title: job.title }, { $set: job }, { upsert: true });
        }
        return jobs.length;
    } catch (err) { return 0; }
    finally { await browser.close(); }
};

module.exports = scrapeJobs;