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
            difficulty,
            price,       // ADDED: For Marketplace selling
            instructor,  // ADDED: To link with User model
            thumbnail    // ADDED: For premium UI
        } = req.body;

        // 1. STRICTOR VALIDATION
        // Added instructor to required fields to maintain DB integrity
        if (!title || !skillTag || !videoUrl || !instructor) {
            return res.status(400).json({ 
                error: "Required: Title, Skill Tag, Video URL, and Instructor ID must be provided." 
            });
        }

        // 2. CHECK FOR DUPLICATES
        const existingVideo = await Course.findOne({ videoUrl });
        if (existingVideo) {
            return res.status(400).json({ error: "This video course has already been published." });
        }

        // 3. CREATE THE COURSE
        // Note: The URL conversion is now handled by the Pre-Save Hook in Course.js, 
        // but we pass the raw URL here to keep the controller clean.
        const newCourse = new Course({
            title: title.trim(),
            instructor: instructor, // Link to the User ID
            category: category || 'Development',
            skillTag: skillTag.toLowerCase().trim(),
            difficulty: difficulty || 'Beginner',
            videoUrl: videoUrl,
            price: Number(price) || 0,
            thumbnail: thumbnail || '',
            description: description || '',
            rewardXP: Number(rewardXP) || 100,
            rewardWallet: Number(rewardWallet) || 50,
            quiz: Array.isArray(quiz) ? quiz.filter(q => q.question) : []
        });

        // 4. SAVE TO MONGODB
        await newCourse.save();

        console.log(`🎬 New Course Published: ${title} by Admin/Instructor`);
        
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

// GET: Fetch all courses with SYNCED SEARCH & FILTERING
// This makes the Learning Hub responsive for the user
app.get('/api/courses', async (req, res) => {
    try {
        const { category, skill, difficulty, search } = req.query;
        let query = {};

        // SYNC: Filter by Category
        if (category) query.category = category;
        
        // SYNC: Filter by Difficulty
        if (difficulty) query.difficulty = difficulty;

        // SYNC: Filter by Skill (lowercase for model match)
        if (skill) query.skillTag = skill.toLowerCase();

        // SYNC: Search by Title (Case-insensitive)
        if (search) {
            query.title = { $regex: search, $options: 'i' };
        }

        const courses = await Course.find(query)
            .populate('instructor', 'name savedCV.profileImage') // Shows instructor info on UI
            .sort({ createdAt: -1 });

        res.json({
            success: true,
            count: courses.length,
            courses
        });
    } catch (err) {
        res.status(500).json({ error: "Failed to fetch courses", details: err.message });
    }
});