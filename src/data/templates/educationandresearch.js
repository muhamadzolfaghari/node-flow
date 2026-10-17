// Education & Research templates.
// Combined registry and lookup live in src/components/templates.js.
export const TEMPLATES = [
  {
    id: "academic-research-thesis",
    title: "Academic Research Thesis & Literature Map",
    category: "Education & Research",
    role: "Student & Academic",
    kind: "mindmap",
    description: "Comprehensive research structure covering theoretical foundations, empirical methodology, qualitative benchmarks, and limitations.",
    code: `mindmap
  root((Doctoral / Master Thesis))
    Theoretical Foundation
      Primary Paradigms
        Distributed Systems Theory
        Vector Graphics Compilation
      Key Literature
        Lamport Time & Orderings
        Compiler Design Patterns
    Research Methodology
      Qualitative Analysis
        User Interviews (N=40)
        Observational Usability Labs
      Quantitative Benchmarks
        WASM vs JS Hash Speed
        Frame Rendering Latency (60fps)
    Empirical Results
      Zero Cloud Data Leakage
      3.7x Execution Acceleration
    Discussion & Limitations
      Browser Memory Boundaries
      Mobile Screen Real Estate
    Future Directions
      Local Multi-Agent Synthesis
      Hardware Accelerated WebGPU
`,
  },
  {
    id: "scientific-method-lab",
    title: "Scientific Method & Lab Experiment Protocol",
    category: "Education & Research",
    role: "Student & Academic",
    kind: "flowchart",
    description: "Step-by-step scientific method protocol from observation and hypothesis testing to controlled experiment and peer-reviewed publication.",
    code: `flowchart TD
    Obs["1. Real-World Observation"] --> Question["2. Formulate Research Question"]
    Question --> LitReview["3. Literature Review & Prior Art"]
    LitReview --> Hypo["4. Formulate Testable Hypothesis"]
    Hypo --> Protocol["5. Design Controlled Experiment"]
    Protocol --> RunExp["6. Conduct Experiment & Gather Data"]
    RunExp --> Analyze{"7. Statistical Data Analysis"}
    Analyze -- "Hypothesis Supported" --> DrawConc["8. Draw Scientific Conclusions"]
    Analyze -- "Hypothesis Refuted" --> Refine["Refine or Formulate New Hypothesis"]
    Refine --> Protocol
    DrawConc --> PeerReview["9. Peer Review & Publication"]
    PeerReview --> Repeat["10. Independent Replication by Scientific Community"]
`,
  },
  {
    id: "student-study-schedule",
    title: "Student Semester Course & Exam Plan",
    category: "Education & Research",
    role: "Student & Academic",
    kind: "timeline",
    description: "Semester timeline outlining foundation lectures, midterm review sessions, advanced topics, final projects, and exam blitz.",
    code: `timeline
    title Academic Semester & Exam Preparation Plan
    section Weeks 1-4 Foundation
        Orientation & Syllabus Review : Core Readings : Form Study Groups
        Lecture Modules 1-3 : Weekly Lab Assignments : Concept Summaries
    section Weeks 5-8 Midterm Sprint
        Midterm Review Sessions : Practice Exams : Submit Research Proposal
        Midterm Examinations : Grade Review & Office Hours : Adjust Study Habits
    section Weeks 9-12 Deep Dive
        Advanced Special Topics : Group Project Sprint : Draft Research Paper
        Final Project Deliverable : Peer Presentations : Instructor Feedback
    section Weeks 13-16 Finals
        Comprehensive Review : Mock Exam Blitz : Formula & Mindmap Synthesis
        Final Examinations : Semester Wrap-up & Project Portfolios
`,
  },
];
