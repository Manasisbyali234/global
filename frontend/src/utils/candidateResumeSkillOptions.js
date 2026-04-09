export const degreeSkillCatalog = [
    {
        name: "B.Tech Computer Science",
        technicalSkills: [
            "Python", "Java", "C", "C++",
            "Data Structures & Algorithms",
            "OOP", "SQL", "DBMS",
            "HTML", "CSS", "JavaScript",
            "React basics", "Node.js basics",
            "Linux command line", "Git",
            "Software Testing basics"
        ],
        softSkills: [
            "Problem-solving",
            "Analytical thinking",
            "Technical documentation",
            "Team collaboration",
            "Presentation skills"
        ]
    },
    {
        name: "B.Tech AI & ML",
        technicalSkills: [
            "Python",
            "NumPy", "Pandas",
            "Scikit-learn",
            "TensorFlow", "PyTorch",
            "Supervised learning",
            "Unsupervised learning",
            "Neural Networks",
            "Deep Learning basics",
            "NLP basics",
            "Computer Vision basics"
        ],
        softSkills: [
            "Critical thinking",
            "Data interpretation",
            "Research mindset",
            "Explaining technical concepts"
        ]
    },
    {
        name: "B.Tech Data Science",
        technicalSkills: [
            "Python", "R",
            "SQL",
            "Excel", "Power BI basics",
            "Data cleaning",
            "Pandas",
            "Matplotlib", "Seaborn",
            "Statistical analysis",
            "Hypothesis testing",
            "EDA",
            "Basic ML models"
        ],
        softSkills: [
            "Data storytelling",
            "Report writing",
            "Logical reasoning",
            "Attention to detail"
        ]
    },
    {
        name: "B.Tech Electronics & Communication",
        technicalSkills: [
            "Digital electronics",
            "Analog electronics",
            "Circuit design",
            "Microcontrollers",
            "Embedded systems",
            "Communication systems",
            "Antennas & waves",
            "PCB basics",
            "MATLAB", "Simulink"
        ],
        softSkills: [
            "Systems thinking",
            "Troubleshooting",
            "Safety awareness"
        ]
    },
    {
        name: "B.Tech Mechanical Engineering",
        technicalSkills: [
            "Engineering mechanics",
            "Thermodynamics",
            "Fluid mechanics",
            "Heat transfer",
            "Machine design",
            "AutoCAD",
            "SolidWorks",
            "FEA basics",
            "Workshop practice"
        ],
        softSkills: [
            "Hands-on problem solving",
            "Safety awareness",
            "Precision in design"
        ]
    },
    {
        name: "BCA",
        technicalSkills: [
            "C", "C++", "Java",
            "Web development basics",
            "DBMS", "OS",
            "Networking basics",
            "Software Engineering"
        ],
        softSkills: [
            "Structured thinking",
            "Teamwork",
            "Learning discipline"
        ]
    },
    {
        name: "MCA",
        technicalSkills: [
            "Advanced programming",
            "Design patterns",
            "Algorithms",
            "Web applications",
            "Mobile app basics",
            "Cloud basics",
            "Advanced DBMS"
        ],
        softSkills: [
            "System design thinking",
            "Independent project handling",
            "Time management"
        ]
    },
    {
        name: "MBA",
        technicalSkills: [
            "Advanced Excel",
            "Financial modeling basics",
            "Business analytics tools",
            "PowerPoint",
            "Project management tools"
        ],
        softSkills: [
            "Leadership",
            "Negotiation",
            "Decision making",
            "Stakeholder management"
        ]
    },
    {
        name: "B.Sc Computer Science",
        technicalSkills: [
            "Python", "Java", "C++",
            "DSA", "OOP",
            "DBMS", "OS",
            "Web basics"
        ],
        softSkills: [
            "Logical reasoning",
            "Structured thinking",
            "Project mindset"
        ]
    },
    {
        name: "Diploma in Computer Engineering",
        technicalSkills: [
            "C", "C++",
            "Networking basics",
            "Hardware basics",
            "Operating systems",
            "Web basics"
        ],
        softSkills: [
            "Troubleshooting",
            "Structured problem solving"
        ]
    },
    {
        name: "Digital Marketing Course",
        technicalSkills: [
            "Google Ads",
            "Meta Ads",
            "Google Analytics",
            "SEO",
            "Email marketing",
            "Content planning",
            "Landing pages",
            "A/B testing"
        ],
        softSkills: [
            "Strategic thinking",
            "Client communication",
            "Adaptability"
        ]
    },
    {
        name: "Full Stack Development",
        technicalSkills: [
            "HTML", "CSS", "JavaScript",
            "React",
            "Node.js",
            "REST APIs",
            "Git",
            "Deployment"
        ],
        softSkills: [
            "Debugging mindset",
            "Self learning",
            "Project ownership"
        ]
    },
    {
        name: "Cybersecurity Course",
        technicalSkills: [
            "Networking",
            "Firewalls",
            "Wireshark",
            "Nmap",
            "Metasploit",
            "Vulnerability assessment",
            "OS hardening"
        ],
        softSkills: [
            "Risk awareness",
            "Ethical mindset",
            "Attention to detail"
        ]
    },
    {
        name: "UI/UX Design",
        technicalSkills: [
            "Figma",
            "Adobe XD",
            "Wireframing",
            "Prototyping",
            "User flows",
            "Design thinking"
        ],
        softSkills: [
            "Empathy",
            "Visual thinking",
            "Communication"
        ]
    },
    {
        name: "Data Analytics",
        technicalSkills: [
            "Python", "R",
            "SQL",
            "Power BI", "Tableau",
            "Data cleaning",
            "Visualization",
            "Dashboards"
        ],
        softSkills: [
            "Data storytelling",
            "Business understanding",
            "Reporting"
        ]
    }
];

export const candidateResumeSkillOptions = degreeSkillCatalog.reduce((allSkills, degree) => {
    [...degree.technicalSkills, ...degree.softSkills].forEach((skill) => {
        const normalizedSkill = skill.trim().toLowerCase();

        if (!allSkills.some((existingSkill) => existingSkill.toLowerCase() === normalizedSkill)) {
            allSkills.push(skill.trim());
        }
    });

    return allSkills;
}, []);
