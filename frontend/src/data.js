export const COURSES = [
    {
        id: 1,
        title: "React JS for Beginners",
        description: "Learn to build modern web interfaces.",
        videoUrl: "https://www.youtube.com/embed/SqcY0GlETPk",
        skillTag: "React JS",
        quiz: [
            {
                question: "What is JSX?",
                options: ["A CSS framework", "A syntax extension for JS", "A database"],
                correctAnswer: 1
            }
        ]
    },
    {
        id: 2,
        title: "Mastering Graphic Design",
        description: "Create stunning visuals and logos.",
        videoUrl: "https://www.youtube.com/embed/un50Bs4BvZ8",
        skillTag: "Graphic Design",
        quiz: [
            {
                question: "Which color mode is best for print?",
                options: ["RGB", "HSB", "CMYK"],
                correctAnswer: 2
            }
        ]
    }
];

export const GIGS = [
    { id: 1, title: "Fix React Bug", reward: "$50", requiredSkill: "React JS", description: "Fix a state issue in a dashboard." },
    { id: 2, title: "Logo Design", reward: "$30", requiredSkill: "Graphic Design", description: "Design a logo for a tech startup." }
];