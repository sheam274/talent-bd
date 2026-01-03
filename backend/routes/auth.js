// Login Route Example
router.post('/login', async (req, res) => {
    try {
        const user = await User.findOne({ email: req.body.email }).populate('bookmarks');
        if (!user) return res.status(400).json({ message: "User not found" });

        // Logic to ensure bookmarks is never undefined
        const userResponse = {
            _id: user._id,
            name: user.name,
            email: user.email,
            role: user.role,
            bookmarks: user.bookmarks || [] // FIX: Default to empty array
        };

        res.json(userResponse);
    } catch (err) {
        res.status(500).json({ error: "Server error" });
    }
});