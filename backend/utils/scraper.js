const puppeteer = require('puppeteer');
const Job = require('../models/Job');
const Category = require('../models/Category'); // SYNC: Accessing Admin-defined categories

const scrapeJobs = async () => {
    // 1. Initialize Browser for HP-840 Environment
    const browser = await puppeteer.launch({ 
        headless: "new", 
        args: ['--no-sandbox', '--disable-setuid-sandbox'] 
    });
    const page = await browser.newPage();
    
    try {
        // 2. Fetch Active Admin Categories from DB
        // SYNC: Scraper will now only use categories approved by the Admin
        const activeCategories = await Category.find({ group: 'job' }).select('name');
        const categoryList = activeCategories.map(c => c.name);

        await page.goto('https://alljobs.teletalk.com.bd/jobs/latest', { waitUntil: 'networkidle2' });

        const jobs = await page.evaluate((categoryList) => {
            const results = [];
            const rows = document.querySelectorAll('tr'); 
            
            rows.forEach(row => {
                const titleEl = row.querySelector('td a');
                if (titleEl) {
                    const title = titleEl.innerText;
                    
                    // --- INTELLIGENT CATEGORIZATION SYNC ---
                    // It checks if the title matches any Admin-added category
                    let detectedCategory = "General"; 
                    
                    for (let cat of categoryList) {
                        const regex = new RegExp(cat, 'i');
                        if (regex.test(title)) {
                            detectedCategory = cat;
                            break;
                        }
                    }

                    // Fallback logic for common Bangladeshi job types
                    if (detectedCategory === "General") {
                        if (title.includes("Director") || title.includes("Ministry")) detectedCategory = "Government";
                        else if (title.includes("Bank")) detectedCategory = "Bank";
                    }

                    results.push({
                        title: title.trim(),
                        company: "Teletalk AllJobs Sync",
                        category: detectedCategory,
                        deadline: "Refer to Circular",
                        link: titleEl.href,
                        isScraped: true,
                        scrapedAt: new Date()
                    });
                }
            });
            return results;
        }, categoryList); // Pass Admin categories into the browser context

        // 3. Database Upsert (Prevents Duplicates)
        for (let job of jobs) {
            await Job.updateOne(
                { title: job.title, link: job.link }, 
                { $set: job }, 
                { upsert: true }
            );
        }

        console.log(`✅ Scraper Sync: ${jobs.length} jobs updated at 44°C.`);
        return jobs.length;

    } catch (err) { 
        console.error("Scraper Error:", err);
        return 0; 
    } finally { 
        await browser.close(); 
    }
};

module.exports = scrapeJobs;