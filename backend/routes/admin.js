const Course = require('./models/Course'); // Ensure this matches your file structure

// POST: Add a new video & certification quiz to the learning hub
app.post('/api/admin/add-video', async (req, res) => {
    try {
        const { 
            title, 
            category, 
            skillTag, 
            videoUrl, 
            description, 
            quiz, 
            rewardXP, 
            rewardWallet,
            difficulty 
        } = req.body;

        // 1. STRICTOR VALIDATION
        if (!title || !skillTag || !videoUrl) {
            return res.status(400).json({ 
                error: "Required: Title, Skill Tag, and Video URL must be provided." 
            });
        }

        // 2. CHECK FOR DUPLICATES
        const existingVideo = await Course.findOne({ videoUrl });
        if (existingVideo) {
            return res.status(400).json({ error: "This video course has already been published." });
        }

        // 3. ROBUST URL CONVERSION (Support for Timestamped URLs)
        let embedUrl = videoUrl;
        try {
            if (videoUrl.includes("watch?v=")) {
                // Extracts the ID even if there are &t= or other params
                const videoId = videoUrl.split("v=")[1].split("&")[0];
                embedUrl = `https://www.youtube.com/embed/${videoId}`;
            } else if (videoUrl.includes("youtu.be/")) {
                const videoId = videoUrl.split("/").pop().split("?")[0];
                embedUrl = `https://www.youtube.com/embed/${videoId}`;
            }
        } catch (urlErr) {
            return res.status(400).json({ error: "Invalid YouTube URL format." });
        }

        // 4. CREATE THE COURSE
        // Preserves the reward system and quiz features exactly as requested
        const newCourse = new Course({
            title: title.trim(),
            category: category || 'Development',
            skillTag: skillTag.toLowerCase().trim(),
            difficulty: difficulty || 'Beginner',
            videoUrl: embedUrl,
            description: description || '',
            rewardXP: Number(rewardXP) || 100,
            rewardWallet: Number(rewardWallet) || 50,
            // Ensure quiz is an array and filter out empty questions
            quiz: Array.isArray(quiz) ? quiz.filter(q => q.question) : []
        });

        // 5. SAVE TO MONGODB
        await newCourse.save();

        console.log(`🎬 New Course Published: ${title}`);
        
        res.status(201).json({ 
            success: true,
            message: "Course and Certification Quiz published successfully.", 
            course: newCourse 
        });

    } catch (err) {
        console.error("❌ Admin Upload Error:", err.message);
        res.status(500).json({ 
            error: "Internal Server Error", 
            details: err.message 
        });
    }
});

// GET: Fetch all courses (Essential for the Learning Hub to work)
app.get('/api/courses', async (req, res) => {
    try {
        const courses = await Course.find().sort({ createdAt: -1 });
        res.json(courses);
    } catch (err) {
        res.status(500).json({ error: "Failed to fetch courses" });
    }
});