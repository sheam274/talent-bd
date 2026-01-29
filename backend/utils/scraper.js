const puppeteer = require('puppeteer');
const Job = require('../models/Job');
const Category = require('../models/Category');

/**
 * TALENTBD CLOUD SCRAPER 2026
 * Synchronizes external teletalk data with your custom Admin Taxonomy.
 */
const scrapeJobs = async () => {
    console.log("🚀 Initializing TalentBD Scraper Engine...");

    const browser = await puppeteer.launch({ 
        headless: "new", 
        args: [
            '--no-sandbox', 
            '--disable-setuid-sandbox',
            '--disable-dev-shm-usage',
            '--window-size=1920,1080'
        ] 
    });
    
    try {
        const page = await browser.newPage();
        
        // Professional User Agent to bypass basic bot detection
        await page.setUserAgent('Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/121.0.0.0 Safari/537.36');

        // 1. FETCH ADMIN TAXONOMY
        // We fetch the full objects so we can map by Name but save the ID
        const activeCategories = await Category.find({ group: 'job', isActive: true });
        
        // Prepare simplified list for the Browser context
        const categoryMap = activeCategories.map(c => ({
            id: c._id.toString(),
            name: c.name
        }));

        // 2. NAVIGATE TO SOURCE
        console.log("📡 Connecting to AllJobs Teletalk...");
        await page.goto('https://alljobs.teletalk.com.bd/jobs/latest', { 
            waitUntil: 'domcontentloaded', 
            timeout: 60000 
        });

        // 3. EXTRACTION & INTELLIGENT MATCHING
        const scrapedJobs = await page.evaluate((categoryMap) => {
            const jobs = [];
            // Target the specific table rows in the Teletalk layout
            const rows = document.querySelectorAll('table tr'); 
            
            rows.forEach(row => {
                const cells = row.querySelectorAll('td');
                if (cells.length >= 3) {
                    const titleLink = cells[0].querySelector('a');
                    const companyName = cells[1]?.innerText.trim();
                    const deadline = cells[2]?.innerText.trim();

                    if (titleLink) {
                        const title = titleLink.innerText.trim();
                        const link = titleLink.href;

                        // --- SMART CATEGORIZATION ---
                        // Find a match from our Admin Categories
                        let matched = categoryMap.find(cat => 
                            title.toLowerCase().includes(cat.name.toLowerCase()) ||
                            companyName.toLowerCase().includes(cat.name.toLowerCase())
                        );

                        // Fallback logic for common BD sectors
                        let finalCategoryId = matched ? matched.id : null;
                        let finalCategoryName = matched ? matched.name : "General";

                        // Apply secondary pattern matching if no direct Admin match found
                        if (!matched) {
                            const t = title.toLowerCase();
                            if (t.includes('bank')) finalCategoryName = "Banking";
                            if (t.includes('engineer') || t.includes('it')) finalCategoryName = "IT & Software";
                            if (t.includes('ministry') || t.includes('directorate')) finalCategoryName = "Government";
                        }

                        jobs.push({
                            title: title,
                            company: companyName || "Government/Semi-Gov",
                            officialApplyLink: link,
                            categoryName: finalCategoryName, // Temporary name for post-processing
                            categoryId: finalCategoryId,     // The real MongoDB ID
                            deadline: deadline || "Check Circular",
                            location: "Bangladesh",
                            employmentType: "Full-time",
                            isScraped: true
                        });
                    }
                }
            });
            return jobs;
        }, categoryMap);

        // 4. DATABASE UPSERT (DEDUPLICATION)
        console.log(`🔍 Found ${scrapedJobs.length} raw jobs. Filtering and saving...`);
        
        let upsertedCount = 0;
        for (const jobData of scrapedJobs) {
            // Find the ID for fallback names if they didn't match an Admin ID initially
            if (!jobData.categoryId) {
                const fallbackCat = activeCategories.find(c => c.name === jobData.categoryName);
                if (fallbackCat) jobData.categoryId = fallbackCat._id;
            }

            // Upsert based on the link (unique identifier)
            const result = await Job.updateOne(
                { officialApplyLink: jobData.officialApplyLink },
                { 
                    $setOnInsert: {
                        ...jobData,
                        createdAt: new Date(),
                        isActive: true
                    }
                },
                { upsert: true }
            );

            if (result.upsertedCount > 0) {
                upsertedCount++;
            }
        }

        console.log(`✅ Scraper Finished. New jobs added: ${upsertedCount}`);
        return upsertedCount;

    } catch (err) { 
        console.error("❌ Scraper Engine Error:", err.message);
        return 0;
    } finally { 
        await browser.close(); 
    }
};

module.exports = scrapeJobs;