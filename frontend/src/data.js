/* TALENTBD CORE DATA ASSETS (2026 REVISION)
   Sync: Integrated with WalletDashboard XP & LearningHub Verification Logic
*/

export const COURSES = [
    {
        id: 1,
        title: "React JS for Beginners",
        description: "Learn to build modern web interfaces with React 19 and Framer Motion.",
        videoUrl: "https://www.youtube.com/embed/SqcY0GlETPk",
        skillTag: "React JS",
        xpReward: 500, // Synced with Level Progression
        cashBonus: 50, // Synced with Wallet Balance
        difficulty: "Beginner",
        duration: "12 mins",
        thumbnail: "https://images.unsplash.com/photo-1633356122544-f134324a6cee?w=400&q=80",
        quiz: [
            {
                question: "What is JSX?",
                options: ["A CSS framework", "A syntax extension for JS", "A database"],
                correctAnswer: 1
            },
            {
                question: "Which hook is used for side effects?",
                options: ["useState", "useEffect", "useRef"],
                correctAnswer: 1
            }
        ]
    },
    {
        id: 2,
        title: "Mastering Graphic Design",
        description: "Create stunning visuals, logos, and brand identities for 2026 trends.",
        videoUrl: "https://www.youtube.com/embed/un50Bs4BvZ8",
        skillTag: "Graphic Design",
        xpReward: 450,
        cashBonus: 50,
        difficulty: "Intermediate",
        duration: "18 mins",
        thumbnail: "https://images.unsplash.com/photo-1626785774573-4b799315345d?w=400&q=80",
        quiz: [
            {
                question: "Which color mode is best for print?",
                options: ["RGB", "HSB", "CMYK"],
                correctAnswer: 2
            },
            {
                question: "What does 'Kerning' refer to in typography?",
                options: ["Space between lines", "Space between characters", "Font thickness"],
                correctAnswer: 1
            }
        ]
    },
    {
        id: 3,
        title: "AI Prompt Engineering",
        description: "Leverage LLMs to speed up your coding and design workflows.",
        videoUrl: "https://www.youtube.com/embed/jC4v5AS4RIM",
        skillTag: "AI Operations",
        xpReward: 600,
        cashBonus: 50,
        difficulty: "Advanced",
        duration: "15 mins",
        thumbnail: "https://images.unsplash.com/photo-1677442136019-21780ecad995?w=400&q=80",
        quiz: [
            {
                question: "What is 'Few-Shot' prompting?",
                options: ["No examples given", "Providing a few examples", "Using a shorter prompt"],
                correctAnswer: 1
            }
        ]
    }
];

export const GIGS = [
    { 
        id: 1, 
        title: "Fix React Bug", 
        reward: 50, // Numerical for wallet calculation
        currency: "$",
        requiredSkill: "React JS", 
        description: "Fix a state persistence issue in a high-traffic dashboard. Requires knowledge of LocalStorage.",
        postedDate: "Jan 2026",
        type: "Fixed Price",
        urgency: "High"
    },
    { 
        id: 2, 
        title: "Logo Design", 
        reward: 30, 
        currency: "$",
        requiredSkill: "Graphic Design", 
        description: "Design a minimalist logo for a tech startup in the green energy sector.",
        postedDate: "Jan 2026",
        type: "Gig",
        urgency: "Standard"
    },
    { 
        id: 3, 
        title: "Python Data Script", 
        reward: 80, 
        currency: "$",
        requiredSkill: "Python", 
        description: "Scrape product data from an e-commerce site and export to CSV.",
        postedDate: "Feb 2026",
        type: "Project",
        urgency: "Urgent"
    }
];