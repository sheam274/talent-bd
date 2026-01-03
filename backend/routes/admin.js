// POST: Add a new video to the learning hub
app.post('/api/admin/add-video', async (req, res) => {
    try {
        const { title, category, skillTag, videoUrl, description } = req.body;
        
        // Convert standard YouTube link to Embed link for the iframe
        const embedUrl = videoUrl.replace("watch?v=", "embed/");
        
        const Course = require('./models/Course');
        const newVideo = new Course({
            title,
            category,
            skillTag,
            videoUrl: embedUrl,
            description
        });
        
        await newVideo.save();
        res.status(201).json({ message: "Video Uploaded Successfully", newVideo });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});