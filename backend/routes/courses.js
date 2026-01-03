app.get('/api/courses', async (req, res) => {
    const courses = await Course.find();
    res.json(courses);
});

app.post('/api/courses/upload', async (req, res) => {
    const newCourse = new Course(req.body);
    await newCourse.save();
    res.status(201).json(newCourse);
});