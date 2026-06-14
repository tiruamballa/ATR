const mongoose = require('mongoose');
const dotenv = require('dotenv');
const connectDB = require('../config/db');
const User = require('../models/User');
const Phase = require('../models/Phase');
const Week = require('../models/Week');
const Topic = require('../models/Topic');
const Streak = require('../models/Streak');
const DSATopic = require('../models/DSATopic');
const DSAQuestion = require('../models/DSAQuestion'); // Deprecated, but keep model import
const AptitudeTopic = require('../models/AptitudeTopic');
const DailyProgress = require('../models/DailyProgress');
const Semester = require('../models/Semester');
const Subject = require('../models/Subject');
const AttendanceEntry = require('../models/AttendanceEntry');
const Habit = require('../models/Habit');

dotenv.config();

const seedDatabase = async (options = { closeConnection: true }) => {
  try {
    if (mongoose.connection.readyState === 0) {
      await connectDB();
    }
    console.log('DB connection established. Clearing ATR schemas...');
    try {
      await mongoose.connection.db.collection('phases').dropIndex('monthIndex_1');
      console.log('Stale unique index monthIndex_1 dropped successfully inside seed script.');
    } catch (err) {
      // Ignore
    }

    // Clear previous seeded items
    await Phase.deleteMany({});
    await Week.deleteMany({});
    await Topic.deleteMany({});
    await DSATopic.deleteMany({});
    await DSAQuestion.deleteMany({});
    await AptitudeTopic.deleteMany({});
    await DailyProgress.deleteMany({});
    await Semester.deleteMany({});
    await Subject.deleteMany({});
    await AttendanceEntry.deleteMany({});
    await Habit.deleteMany({});

    console.log('Creating or finding single user tiruamballa@atr.com...');
    let demoUser = await User.findOne({ email: 'tiruamballa@atr.com' });
    if (!demoUser) {
      demoUser = await User.create({
        name: 'Tiru Naidu',
        email: 'tiruamballa@atr.com',
        password: '100207',
        leetcodeUsername: '',
        githubStats: { repos: 0, contributions: 0, streak: 0, projectsCount: 0 },
        resumes: [],
        studyHoursTarget: 4,
        dsaTarget: 4,
        attendanceTarget: 75
      });
      console.log('Single user tiruamballa@atr.com created successfully.');
    } else {
      console.log('Resetting targets for existing user.');
      demoUser.studyHoursTarget = 4;
      demoUser.dsaTarget = 4;
      demoUser.attendanceTarget = 75;
      demoUser.name = 'Tiru Naidu';
      await demoUser.save();
    }

    // Reset Streak
    await Streak.deleteMany({ userId: demoUser._id });
    await Streak.create({ userId: demoUser._id, currentStreak: 0, longestStreak: 0 });

    // Seed default Habits
    const habitsList = [
      { name: 'English Speaking', target: '15 Minute Speaking Practice' },
      { name: 'Exercise', target: '30 Minute Workout' },
      { name: 'Reading', target: 'Read 10 pages of a book' },
      { name: 'Meditation', target: '10 Minute Mindfulness session' }
    ];
    for (const h of habitsList) {
      await Habit.create({
        userId: demoUser._id,
        name: h.name,
        target: h.target,
        completedHistory: []
      });
    }
    console.log('Habits seeded successfully.');

    // ── 1. DEFINE DETAILED WEEK CURRICULUMS (1 TO 70)
    const weeksDefinitions = [];

    for (let w = 1; w <= 70; w++) {
      // Default Fallbacks
      let devTopic = { name: 'Technical Project Revision', subtopics: ['Code review', 'Refactoring base loops', 'Performance checks'], target: 'Review past repos', deliverable: 'Refactored code' };
      let dsaTopic = { name: 'Algorithms Mastery', subtopics: ['Advanced recursion search space', 'LeetCode practice'], target: 'Solve 10 Questions', deliverable: 'Completed problems checklist' };
      let aptTopic = { part: 'PART 4 Vocabulary', name: 'Critical Reasoning', subtopics: ['Assumption finding', 'Strengthening arguments', 'Weakening arguments'], target: '30 Questions', estQuestions: 30, criteria: '85% Accuracy' };
      let ipTopic = { name: 'OS Practice & Mocks', subtopics: ['Memory paging mock interview', 'Deadlocks review questions'], target: 'Complete OS Mock Set', deliverable: 'OS summary writeups' };

      // Phase 1: Foundation Forge (Weeks 1 to 4)
      if (w === 1) {
        devTopic = {
          name: 'HTML Fundamentals',
          subtopics: ['header', 'nav', 'section', 'article', 'footer', 'table', 'form basics'],
          target: 'Build a Personal Profile Page layout',
          deliverable: 'Personal Profile Page static code'
        };
        dsaTopic = { name: 'Arrays Basics', subtopics: ['RAM Allocation & contiguity', 'Time complexity analysis'], target: 'Track arrays', deliverable: 'Subtopic checklist' };
        aptTopic = { part: 'PART 1 Quantitative Aptitude', name: 'Number System', subtopics: ['Primes', 'LCM & HCF', 'Divisibility rules'], target: '40 Questions', estQuestions: 40, criteria: '80% Accuracy' };
        ipTopic = { name: 'DBMS Introduction', subtopics: ['Data vs Information', 'DBMS Architecture', 'File systems comparison'], target: 'Basic database principles summary', deliverable: 'DBMS summary notes' };
      } else if (w === 2) {
        devTopic = {
          name: 'Advanced HTML + Forms',
          subtopics: ['input types', 'textarea', 'select', 'checkbox', 'radio button', 'audio', 'video'],
          target: 'Build a Student Registration Form with validations',
          deliverable: 'Valid HTML5 form page'
        };
        dsaTopic = { name: 'CSS Fundamentals Selector/Box', subtopics: ['px', 'rem', 'em', 'margin', 'padding', 'border'], target: 'Style components', deliverable: 'Box model code' };
        aptTopic = { part: 'PART 1 Quantitative Aptitude', name: 'Ratio & Proportion', subtopics: ['Basic Ratios', 'Direct/Inverse Proportion'], target: '40 Questions', estQuestions: 40, criteria: '80% Accuracy' };
        ipTopic = { name: 'ER Model', subtopics: ['Entities & Attributes', 'Relationships mappings'], target: 'Draw ER diagrams', deliverable: 'ER diagram layout document' };
      } else if (w === 3) {
        devTopic = {
          name: 'CSS Fundamentals',
          subtopics: ['Selectors', 'Colors', 'Units', 'Box Model'],
          target: 'Create a Styled Landing Page structure',
          deliverable: 'Styled HTML static site'
        };
        dsaTopic = { name: 'Arrays Patterns', subtopics: ['Two pointers', 'Sliding Window', 'Prefix Sum'], target: 'Pattern solved code check', deliverable: 'Array checks script' };
        aptTopic = { part: 'PART 1 Quantitative Aptitude', name: 'Ratio & Proportion', subtopics: ['Partnerships', 'Mixtures & alligations'], target: '40 Questions', estQuestions: 40, criteria: '85% Accuracy' };
        ipTopic = { name: 'Keys & Constraints', subtopics: ['Primary vs Foreign keys', 'Unique and Check constraints'], target: 'Define constraints rules', deliverable: 'DDL script draft' };
      } else if (w === 4) {
        devTopic = {
          name: 'Modern CSS',
          subtopics: ['justify-content', 'align-items', 'media queries', 'CSS variables'],
          target: 'Build a Responsive Portfolio landing page',
          deliverable: 'Responsive CSS layout stylesheet'
        };
        dsaTopic = { name: 'Arrays Advanced', subtopics: ['Two sum', 'Majority element', 'Kadane\'s algorithm'], target: 'Arrays advanced code tasks', deliverable: 'Advanced subarray scripts' };
        aptTopic = { part: 'PART 1 Quantitative Aptitude', name: 'Average', subtopics: ['Averages formulas', 'Weighted averages'], target: '40 Questions', estQuestions: 40, criteria: '80% Accuracy' };
        ipTopic = { name: 'Normalization', subtopics: ['1NF', '2NF', '3NF dependencies'], target: 'Normalize relational database schema', deliverable: 'BCNF normalized tables description' };
      }

      // Phase 2: JavaScript + React Builder (Weeks 5 to 12)
      else if (w === 5) {
        devTopic = {
          name: 'JavaScript Basics',
          subtopics: ['let', 'const', 'var', 'primitive types', 'operators basics'],
          target: 'Write modular arithmetic JS functions',
          deliverable: 'JS variables script'
        };
        dsaTopic = { name: 'Arrays Revision', subtopics: ['3Sum', '4Sum', 'Merge Intervals', 'Subarray Sum equals K'], target: 'Arrays checklist audit', deliverable: 'Revising arrays log' };
        aptTopic = { part: 'PART 1 Quantitative Aptitude', name: 'Percentage', subtopics: ['Percentage computations', 'Successive increments'], target: '45 Questions', estQuestions: 45, criteria: '80% Accuracy' };
        ipTopic = { name: 'SQL Basics', subtopics: ['DDL commands', 'DML commands', 'SELECT basic query syntax'], target: 'Write 10 queries', deliverable: 'SQL script file' };
      } else if (w === 6) {
        devTopic = {
          name: 'JavaScript Logic',
          subtopics: ['if', 'switch', 'for', 'while', 'arrow functions'],
          target: 'Write looping conditional flows',
          deliverable: 'JS logical statements'
        };
        dsaTopic = { name: 'Strings Basics', subtopics: ['Basic string operations', 'Reverse words', 'Anagram checks', 'Palindromes'], target: 'Verify strings tasks', deliverable: 'Strings scripts' };
        aptTopic = { part: 'PART 1 Quantitative Aptitude', name: 'Profit & Loss', subtopics: ['Cost/Sale prices', 'Markup & Discounts'], target: '45 Questions', estQuestions: 45, criteria: '80% Accuracy' };
        ipTopic = { name: 'SQL Queries', subtopics: ['Filtering with WHERE', 'Sorting with ORDER BY', 'GROUP BY aggregates'], target: 'Aggregate sales database queries', deliverable: 'SQL summaries list' };
      } else if (w === 7) {
        devTopic = {
          name: 'JavaScript Advanced',
          subtopics: ['map', 'filter', 'reduce', 'querySelector'],
          target: 'Build a modular ToDo App client',
          deliverable: 'DOM-based checklist ToDo application'
        };
        dsaTopic = { name: 'Strings Patterns', subtopics: ['Pattern matching', 'Longest common prefix', 'String conversion atoi'], target: 'String matching solutions', deliverable: 'String patterns checklist' };
        aptTopic = { part: 'PART 1 Quantitative Aptitude', name: 'SI & CI', subtopics: ['Simple interest', 'Compound interest compoundings'], target: '40 Questions', estQuestions: 40, criteria: '80% Accuracy' };
        ipTopic = { name: 'Joins', subtopics: ['Inner Join', 'Left/Right Join', 'Full Outer Joins'], target: 'Write Joins statements', deliverable: 'Queries list file' };
      } else if (w === 8) {
        devTopic = {
          name: 'Async JavaScript',
          subtopics: ['Promises', 'Async Await', 'Fetch API integration'],
          target: 'Assemble a dynamic Weather App querying public API',
          deliverable: 'Async API query app codebase'
        };
        dsaTopic = { name: 'Linked List Basics', subtopics: ['Singly LL insertion', 'Singly LL deletion', 'Singly LL reversal'], target: 'Linked list basics tasks', deliverable: 'Singly LL scripts' };
        aptTopic = { part: 'PART 1 Quantitative Aptitude', name: 'Time & Work', subtopics: ['Person-days', 'Pipelines equations'], target: '40 Questions', estQuestions: 40, criteria: '85% Accuracy' };
        ipTopic = { name: 'SQL Interview Questions', subtopics: ['SQL Subqueries', 'Common Table Expressions (CTEs)', 'Window Functions'], target: 'Resolve CTE questions', deliverable: 'Advanced SQL queries sheet' };
      } else if (w === 9) {
        devTopic = {
          name: 'React Basics',
          subtopics: ['JSX markup rules', 'React Components hierarchies', 'Props sharing data'],
          target: 'Create a static React Portfolio layout components',
          deliverable: 'React portfolio component codes'
        };
        dsaTopic = { name: 'Linked List Advanced', subtopics: ['Cycle detection', 'Middle of LL', 'Intersection of LL'], target: 'Cycle verification LL', deliverable: 'Cycle checklist log' };
        aptTopic = { part: 'PART 1 Quantitative Aptitude', name: 'Speed Distance', subtopics: ['Relative speeds meetings', 'Boats & Streams rates'], target: '40 Questions', estQuestions: 40, criteria: '85% Accuracy' };
        ipTopic = { name: 'CN Introduction', subtopics: ['Network definitions', 'LAN vs WAN concepts', 'Hubs, switches, routers'], target: 'Map network devices', deliverable: 'CN basics summary file' };
      } else if (w === 10) {
        devTopic = {
          name: 'React State',
          subtopics: ['useState hook', 'Event Handling integrations'],
          target: 'Develop an interactive Expense Tracker React application',
          deliverable: 'Expense tracker stateful app'
        };
        dsaTopic = { name: 'Stack Basics', subtopics: ['Stack design via arrays', 'Min Stack', 'Valid Parentheses'], target: 'Stack codes checklist', deliverable: 'Stacks implementations list' };
        aptTopic = { part: 'PART 1 Quantitative Aptitude', name: 'Geometry', subtopics: ['Area & Perimeter', 'Volume of 3D objects'], target: '45 Questions', estQuestions: 45, criteria: '80% Accuracy' };
        ipTopic = { name: 'OSI Model', subtopics: ['OSI 7 Layers specification', 'Protocol mappings per layer'], target: 'OSI definitions draft', deliverable: 'OSI layers reference doc' };
      } else if (w === 11) {
        devTopic = {
          name: 'React Advanced',
          subtopics: ['useEffect hook triggers', 'API Calls with Axios/Fetch'],
          target: 'Assemble a dynamic Movie Search App UI',
          deliverable: 'Movie search API client app'
        };
        dsaTopic = { name: 'Stack Monotonic', subtopics: ['Next Greater Element', 'Trapping Rain Water'], target: 'Monotonic stack solutions', deliverable: 'Rainwater code scripts' };
        aptTopic = { part: 'PART 1 Quantitative Aptitude', name: 'Higher Maths', subtopics: ['Permutations & Combinations', 'Probability basics'], target: '40 Questions', estQuestions: 40, criteria: '80% Accuracy' };
        ipTopic = { name: 'TCP/IP', subtopics: ['Three-way Handshake socket', 'TCP vs UDP comparisons'], target: 'Detail TCP handshake stages', deliverable: 'TCP UDP socket guide' };
      } else if (w === 12) {
        devTopic = {
          name: 'React Router',
          subtopics: ['Routing paths configuration', 'Context API global state', 'Form validation controls'],
          target: 'Assemble a Mini Dashboard portal layout',
          deliverable: 'React context router dashboard codebase'
        };
        dsaTopic = { name: 'Queue Basics', subtopics: ['Queue using stacks', 'Circular queue design'], target: 'Queue implementations tasks', deliverable: 'Queue script codes' };
        aptTopic = { part: 'PART 1 Quantitative Aptitude', name: 'Data Interpretation', subtopics: ['Bar charts', 'Pie charts calculations', 'Line graphs trends'], target: '50 Questions', estQuestions: 50, criteria: '85% Accuracy' };
        ipTopic = { name: 'Network Devices', subtopics: ['IP Addressing blocks', 'CIDR subnets partitioning'], target: 'Perform subnet divisions calculations', deliverable: 'Subnetting math worksheet' };
      }

      // Phase 3: AI Builder (Weeks 13 to 16)
      else if (w === 13) {
        devTopic = {
          name: 'AI Basics',
          subtopics: ['What is AI', 'ML vs AI', 'Deep Learning neural basics'],
          target: 'Build an AI Notes text application layout',
          deliverable: 'AI notes UI layouts code'
        };
        dsaTopic = { name: 'Queue Advanced', subtopics: ['Sliding Window Maximum', 'Priority Queue integration'], target: 'Solve sliding window max', deliverable: 'Queue solutions' };
        aptTopic = { part: 'PART 2 Analytical Reasoning', name: 'Series', subtopics: ['Number Series patterns', 'Letter Series alphabet loops'], target: '40 Questions', estQuestions: 40, criteria: '80% Accuracy' };
        ipTopic = { name: 'OSI Model Revision', subtopics: ['OSI Layer encapsulations', 'Data Link vs Network protocols'], target: 'Answer layers revision set', deliverable: 'OSI model revision sheet' };
      } else if (w === 14) {
        devTopic = {
          name: 'Prompt Engineering',
          subtopics: ['Zero Shot prompt structures', 'Few Shot examples formats', 'Chain Of Thought reasoning steps'],
          target: 'Compose a prompt library dashboard utility',
          deliverable: 'Prompt engineering config files library'
        };
        dsaTopic = { name: 'Binary Search Basics', subtopics: ['1D Search', 'Lower/Upper Bound'], target: 'Binary search array queries', deliverable: 'BS codes lists' };
        aptTopic = { part: 'PART 2 Analytical Reasoning', name: 'Analogy', subtopics: ['Word analogies', 'Number classification analogies'], target: '40 Questions', estQuestions: 40, criteria: '80% Accuracy' };
        ipTopic = { name: 'TCP/IP Revision', subtopics: ['HTTP vs HTTPS security parameters', 'SSL Handshake processes'], target: 'Define SSL Handshake sequence', deliverable: 'SSL handshake guide file' };
      } else if (w === 15) {
        devTopic = {
          name: 'LLM Fundamentals',
          subtopics: ['Tokens and Tokenization', 'Embeddings vectors representation', 'Context Window capacities constraints'],
          target: 'Study context size handling and model context constraints',
          deliverable: 'LLM token analysis document'
        };
        dsaTopic = { name: 'Binary Search Advanced', subtopics: ['Rotated sorted array search', 'Find peak elements'], target: 'Rotated arrays query checks', deliverable: 'Rotated BS solutions' };
        aptTopic = { part: 'PART 2 Analytical Reasoning', name: 'Coding Decoding', subtopics: ['Deciphering keys codes', 'Letter substitution grids'], target: '40 Questions', estQuestions: 40, criteria: '85% Accuracy' };
        ipTopic = { name: 'Prompting Techniques', subtopics: ['System vs User prompts roles', 'Temperature configurations parameters'], target: 'Draft prompting configurations parameters list', deliverable: 'Prompt variables config sheets' };
      } else if (w === 16) {
        devTopic = {
          name: 'OpenAI APIs',
          subtopics: ['API Keys security configurations', 'Chat Completion chat loop requests', 'Function Calling parameters binding'],
          target: 'Develop an AI Study Assistant application using LLM client',
          deliverable: 'AI study assistant dynamic codebase'
        };
        dsaTopic = { name: 'Recursion Basics', subtopics: ['Recursion basics callstack', 'Subsequence generation'], target: 'Subsequence generating scripts', deliverable: 'Recursion scripts' };
        aptTopic = { part: 'PART 2 Analytical Reasoning', name: 'Blood Relation', subtopics: ['Family trees layouts', 'Coded relationship symbols'], target: '40 Questions', estQuestions: 40, criteria: '85% Accuracy' };
        ipTopic = { name: 'Vector DBs & Embeddings', subtopics: ['Vector database indexing concepts', 'Cosine similarity search metric'], target: 'Map vector search pipeline', deliverable: 'Vector database schemas reference sheet' };
      }

      // Phase 4: Backend Forge (Weeks 17 to 22)
      else if (w === 17) {
        devTopic = {
          name: 'Node.js',
          subtopics: ['Runtime variables exports', 'Modules types CommonJS vs ESM', 'File System fs module commands'],
          target: 'Build file reading utility tools',
          deliverable: 'Node.js file reader scripts'
        };
        dsaTopic = { name: 'Recursion Advanced', subtopics: ['Combinations sum backtracking', 'Permutations & Backtracking patterns'], target: 'Backtracking recursion code tasks', deliverable: 'Backtracking scripts' };
        aptTopic = { part: 'PART 2 Analytical Reasoning', name: 'Direction', subtopics: ['Compass movements navigation', 'Displacements vector math'], target: '40 Questions', estQuestions: 40, criteria: '80% Accuracy' };
        ipTopic = { name: 'HTTP Protocol', subtopics: ['HTTP request response headers', 'Status codes 2xx, 3xx, 4xx, 5xx definitions'], target: 'Summarize standard status codes meanings', deliverable: 'HTTP headers guides document' };
      } else if (w === 18) {
        devTopic = {
          name: 'Express',
          subtopics: ['Routing endpoints maps', 'Middleware chains integrations'],
          target: 'Write logger and error handling custom middlewares',
          deliverable: 'Express server scaffolding files'
        };
        dsaTopic = { name: 'Binary Trees Traversals', subtopics: ['Inorder traversal', 'Preorder traversal', 'Postorder traversal'], target: 'Binary tree traversals code tasks', deliverable: 'Trees scripts' };
        aptTopic = { part: 'PART 2 Analytical Reasoning', name: 'Venn Diagram', subtopics: ['Venn relations sets', '3-circle intersection problems'], target: '40 Questions', estQuestions: 40, criteria: '85% Accuracy' };
        ipTopic = { name: 'REST API Design', subtopics: ['Resource naming guidelines', 'Stateless design patterns'], target: 'Draft REST API URL routes map', deliverable: 'REST API blueprint sheet' };
      } else if (w === 19) {
        devTopic = {
          name: 'REST APIs',
          subtopics: ['GET resource querying', 'POST payload submissions', 'PUT updates syncing', 'DELETE resource deletions'],
          target: 'Implement REST operations on user profiles',
          deliverable: 'Complete REST controllers code files'
        };
        dsaTopic = { name: 'Binary Trees Views & LCA', subtopics: ['Height of binary tree', 'Diameter of tree', 'LCA of Binary Tree'], target: 'Binary trees structural query solutions', deliverable: 'Tree views codes list' };
        aptTopic = { part: 'PART 2 Analytical Reasoning', name: 'Clocks', subtopics: ['Angle between hands equations', 'Clock gains and losses calculations'], target: '40 Questions', estQuestions: 40, criteria: '80% Accuracy' };
        ipTopic = { name: 'MVC Architecture', subtopics: ['Model roles database bindings', 'View vs Controllers separation'], target: 'Organize folder layout for MVC server', deliverable: 'MVC directory structure guide' };
      } else if (w === 20) {
        devTopic = {
          name: 'MongoDB',
          subtopics: ['CRUD database queries', 'Aggregation pipeline matching group', 'Indexing schema performance definitions'],
          target: 'Perform group aggregates queries on customer tables',
          deliverable: 'MongoDB aggregation pipeline script code'
        };
        dsaTopic = { name: 'BST Basics', subtopics: ['Search in BST', 'Insert into BST'], target: 'BST operations solved scripts', deliverable: 'BST scripts' };
        aptTopic = { part: 'PART 2 Analytical Reasoning', name: 'Calendars', subtopics: ['Odd days calculations formulas', 'Leap year check systems rules'], target: '40 Questions', estQuestions: 40, criteria: '80% Accuracy' };
        ipTopic = { name: 'NoSQL Schema Design', subtopics: ['Embedded documents vs DBRefs references', 'Dynamic typing models structure'], target: 'Design ecommerce MongoDB schema collections layout', deliverable: 'MongoDB schema diagrams mapping' };
      } else if (w === 21) {
        devTopic = {
          name: 'Authentication',
          subtopics: ['JWT credentials payloads signing', 'Cookies transport variables validation', 'Sessions database backing'],
          target: 'Implement security auth middleware checking headers',
          deliverable: 'JWT auth controller code file'
        };
        dsaTopic = { name: 'BST Operations', subtopics: ['Delete Node in BST', 'Validate BST'], target: 'Validate BST properties scripts', deliverable: 'BST validation codes' };
        aptTopic = { part: 'PART 2 Analytical Reasoning', name: 'Cubes', subtopics: ['Dice face opposite checks', 'Cube cutting calculations'], target: '40 Questions', estQuestions: 40, criteria: '80% Accuracy' };
        ipTopic = { name: 'Password Hashing & Security', subtopics: ['bcrypt hashing salts configurations', 'SQL injection mitigation checks'], target: 'Implement bcrypt hash validation methods', deliverable: 'Auth validation service scripts' };
      } else if (w === 22) {
        devTopic = {
          name: 'Backend Project',
          subtopics: ['ATR API Backend build', 'Endpoints authorization tests', 'Error handler integration'],
          target: 'Build: ATR API Backend with JWT Auth and database endpoints',
          deliverable: 'Completed ATR Backend server repository'
        };
        dsaTopic = { name: 'Heap Basics', subtopics: ['Heapify sorting layouts', 'Priority queue implementation'], target: 'Heap sorting algorithms codes', deliverable: 'Heap heapify scripts' };
        aptTopic = { part: 'PART 2 Analytical Reasoning', name: 'Logical Deduction', subtopics: ['Syllogisms deductions', 'Implications connectives checks'], target: '40 Questions', estQuestions: 40, criteria: '85% Accuracy' };
        ipTopic = { name: 'API Testing with Postman', subtopics: ['Postman environment variables config', 'Writing automated response check scripts'], target: 'Assemble Postman queries automated test suite', deliverable: 'Postman test collection JSON file' };
      }

      // Phase 5: Internship Sprint (Weeks 23 to 32)
      else if (w === 23) {
        devTopic = {
          name: 'SQL Databases',
          subtopics: ['Queries', 'Joins', 'Functions', 'Procedures'],
          target: 'Build: Student Management System SQL Schema',
          deliverable: 'SQL procedures scripts schema'
        };
        dsaTopic = { name: 'Heap Advanced', subtopics: ['Kth Largest element', 'Median from Data Stream'], target: 'Kth element heap scripts', deliverable: 'Heap solutions list' };
        aptTopic = { part: 'PART 3 Grammar & RC', name: 'Parts Of Speech', subtopics: ['Nouns', 'Pronouns', 'Verbs', 'Adjectives'], target: '30 Questions', estQuestions: 30, criteria: '85% Accuracy' };
        ipTopic = { name: 'Relational Database Optimization', subtopics: ['Database indexing B-Tree plans', 'Query execution plans diagnostics'], target: 'Tuning query constraints scripts', deliverable: 'Tuned query script logs' };
      } else if (w === 24) {
        devTopic = {
          name: 'Git Version Control & Github',
          subtopics: ['Git add, commit, push, pull commands', 'Branching merge conflicts resolutions', 'Pull requests code reviews'],
          target: 'Publish multi-branch repository code to GitHub',
          deliverable: 'Git setup history repository'
        };
        dsaTopic = { name: 'Graphs Basics', subtopics: ['BFS graph traversal', 'DFS graph traversal'], target: 'Graphs BFS DFS solutions', deliverable: 'Graph traversals list' };
        aptTopic = { part: 'PART 3 Grammar & RC', name: 'Nouns', subtopics: ['Proper and Common Nouns', 'Plural and Singular Nouns'], target: '30 Questions', estQuestions: 30, criteria: '85% Accuracy' };
        ipTopic = { name: 'Git Advanced Branching', subtopics: ['Git rebase operations', 'Git cherry-pick commands'], target: 'Rebase development branches', deliverable: 'Git branch mappings log' };
      } else if (w === 25) {
        devTopic = {
          name: 'Docker Containers & Images',
          subtopics: ['Dockerfile construction configs', 'Docker build image commands', 'Docker run container commands'],
          target: 'Dockerize Node.js application server container',
          deliverable: 'Dockerized server image config'
        };
        dsaTopic = { name: 'Graphs Advanced', subtopics: ['Cycle detection in graph', 'Dijkstra shortest path'], target: 'Dijkstra graphs script solutions', deliverable: 'Shortest paths codes' };
        aptTopic = { part: 'PART 3 Grammar & RC', name: 'Pronouns', subtopics: ['Personal Pronouns', 'Relative Pronouns'], target: '30 Questions', estQuestions: 30, criteria: '85% Accuracy' };
        ipTopic = { name: 'Docker Networking & Volumes', subtopics: ['Docker host networking parameters', 'Docker data volumes persistence bindings'], target: 'Setup persistent database Docker volume bindings', deliverable: 'Docker volume mappings config' };
      } else if (w === 26) {
        devTopic = {
          name: 'Docker Compose',
          subtopics: ['Docker Compose YAML specifications', 'Multi-container linking DB Web', 'compose up orchestrations'],
          target: 'Orchestrate multi-container Express MongoDB Redis network',
          deliverable: 'Completed docker-compose.yml configuration file'
        };
        dsaTopic = { name: 'Greedy Basics', subtopics: ['Assign cookies greedy', 'Lemonade change greedy'], target: 'Greedy basic algorithms solutions', deliverable: 'Greedy basics script' };
        aptTopic = { part: 'PART 3 Grammar & RC', name: 'Verbs', subtopics: ['Action and Linking Verbs', 'Auxiliary Verbs'], target: '30 Questions', estQuestions: 30, criteria: '85% Accuracy' };
        ipTopic = { name: 'Docker Registry Sprints', subtopics: ['Docker Hub registry authentication', 'Docker Push images repositories'], target: 'Push dockerized image to public registry hub', deliverable: 'Registry image registry logs' };
      } else if (w === 27) {
        devTopic = {
          name: 'Full ATR Platform: Schema Design',
          subtopics: ['Full system database normalization', 'System requirements definitions', 'Models declarations design'],
          target: 'Build: Full ATR Platform database mapping models structures',
          deliverable: 'Full ATR Database normalization plan'
        };
        dsaTopic = { name: 'Greedy Advanced', subtopics: ['Job sequencing greedy', 'Fractional Knapsack greedy'], target: 'Fractional Knapsack greedy scripts', deliverable: 'Greedy advanced solutions' };
        aptTopic = { part: 'PART 3 Grammar & RC', name: 'Adjectives', subtopics: ['Descriptive Adjectives', 'Degrees of Comparison'], target: '30 Questions', estQuestions: 30, criteria: '85% Accuracy' };
        ipTopic = { name: 'System Design: Scaling Types', subtopics: ['Horizontal scaling clusters setup', 'Vertical scaling CPU constraints'], target: 'Map scalability configurations rules', deliverable: 'Scalability options overview' };
      } else if (w === 28) {
        devTopic = {
          name: 'Full ATR Platform: Backend API',
          subtopics: ['Express backend controllers coding', 'Authentication middleware mounts', 'Tasks management endpoints config'],
          target: 'Develop backend API endpoints for Full ATR Platform system',
          deliverable: 'Full ATR Backend core server code'
        };
        dsaTopic = { name: 'DP 1D Basics', subtopics: ['Climbing stairs DP', 'House robber DP'], target: '1D DP dynamic codes', deliverable: 'DP basics solutions' };
        aptTopic = { part: 'PART 3 Grammar & RC', name: 'Adverbs', subtopics: ['Adverbs of Manner', 'Adverbs of Place and Time'], target: '30 Questions', estQuestions: 30, criteria: '85% Accuracy' };
        ipTopic = { name: 'System Design: Load Balancers', subtopics: ['Load balancer round-robin routing', 'Least connections routing logic'], target: 'Draft load balancer routing rule config', deliverable: 'Nginx load balancing config file' };
      } else if (w === 29) {
        devTopic = {
          name: 'Full ATR Platform: Frontend UI',
          subtopics: ['React layout dashboard pages', 'API calls integrations modules', 'State sync configurations'],
          target: 'Assemble frontend React UI dashboard pages for Full ATR Platform',
          deliverable: 'Full ATR Frontend core application portal'
        };
        dsaTopic = { name: 'DP Knapsack', subtopics: ['0/1 Knapsack DP', 'Subset sum equals K DP'], target: 'Knapsack DP solutions scripts', deliverable: 'Knapsack DP codes list' };
        aptTopic = { part: 'PART 3 Grammar & RC', name: 'Prepositions', subtopics: ['Prepositions of Place', 'Prepositions of Time'], target: '30 Questions', estQuestions: 30, criteria: '85% Accuracy' };
        ipTopic = { name: 'System Design: Caching Types', subtopics: ['Redis in-memory caching pipelines', 'Cache eviction policy LRU'], target: 'Write Redis cache retrieval controller scripts', deliverable: 'Redis integration config files' };
      } else if (w === 30) {
        devTopic = {
          name: 'Resume Construction',
          subtopics: ['Resume templates configurations layout', 'ATS check optimization keywords', 'Technical projects summaries details'],
          target: 'Build: Resume Ready version detailing student projects metrics',
          deliverable: 'Resume ATS optimized version draft PDF'
        };
        dsaTopic = { name: 'DP LIS', subtopics: ['Longest Increasing Subsequence DP', 'Edit distance DP'], target: 'LIS DP code solutions', deliverable: 'LIS DP scripts lists' };
        aptTopic = { part: 'PART 3 Grammar & RC', name: 'Conjunctions', subtopics: ['Coordinating Conjunctions', 'Subordinating Conjunctions'], target: '30 Questions', estQuestions: 30, criteria: '85% Accuracy' };
        ipTopic = { name: 'System Design: Database Replication', subtopics: ['Master-Slave read write replication', 'Multi-master synchronizations'], target: 'Draft replication topology plan outline', deliverable: 'Replication layout model file' };
      } else if (w === 31) {
        devTopic = {
          name: 'LinkedIn Optimization',
          subtopics: ['LinkedIn profile audit headline', 'Professional achievements listing', 'Experience bullets construction'],
          target: 'Audit LinkedIn profile page structure and sync accomplishments',
          deliverable: 'LinkedIn profile optimization plan document'
        };
        dsaTopic = { name: 'DP Grid', subtopics: ['Unique paths grid DP', 'Minimum path sum grid DP'], target: 'Grid DP path scripts', deliverable: 'Grid DP solutions' };
        aptTopic = { part: 'PART 3 Grammar & RC', name: 'Interjections', subtopics: ['Common Interjections and usage'], target: '30 Questions', estQuestions: 30, criteria: '85% Accuracy' };
        ipTopic = { name: 'System Design: Database Sharding', subtopics: ['Horizontal sharding keys ranges', 'Consistent hashing partitions maps'], target: 'Draft sharding database layout plan', deliverable: 'Sharding layout blueprint sheet' };
      } else if (w === 32) {
        devTopic = {
          name: 'Mock Technical Interviews',
          subtopics: ['Technical mock interview simulations', 'Self introduction pitch corrections', 'Technical questions mock answers'],
          target: 'Conduct 2 technical mock interview rounds',
          deliverable: 'Technical interview feedback sheets log'
        };
        dsaTopic = { name: 'Trie Basics', subtopics: ['Implement Trie prefix tree', 'Word search II Trie'], target: 'Trie implementation code scripts', deliverable: 'Trie scripts' };
        aptTopic = { part: 'PART 3 Grammar & RC', name: 'Tenses', subtopics: ['Simple Present/Past/Future', 'Perfect continuous formats'], target: '30 Questions', estQuestions: 30, criteria: '85% Accuracy' };
        ipTopic = { name: 'System Design: High Availability', subtopics: ['High availability clusters redundancies', 'Failover triggers configurations'], target: 'Outline system redundancy setup strategy', deliverable: 'High availability blueprint file' };
      }

      // Phase 6: Placement Accelerator (Weeks 33 to 36)
      else if (w === 33) {
        devTopic = {
          name: 'Docker Fundamentals',
          subtopics: ['Images', 'Containers', 'Docker Commands'],
          target: 'Build: Dockerize one React project',
          deliverable: 'Dockerfile configuration'
        };
        dsaTopic = { name: 'Advanced Graphs I', subtopics: ['BFS', 'DFS', 'Connected Components', 'Number of Islands', 'Flood Fill'], target: 'Solve 15 Questions', deliverable: 'LeetCode checklist' };
        aptTopic = { part: 'PART 1 Quantitative Aptitude', name: 'Higher Maths', subtopics: ['Probability Basics', 'Sample Space', 'Events'], target: '25 Questions', estQuestions: 25, criteria: '85% Accuracy' };
        ipTopic = { name: 'DBMS Interview Questions Set 1', subtopics: ['Keys', 'Normalization', 'ACID properties'], target: 'Solve 10 DBMS questions', deliverable: 'DBMS answers' };
        devTopic.miniProject = 'Dockerized React project';
      } else if (w === 34) {
        devTopic = {
          name: 'Docker Compose',
          subtopics: ['Multi Container Apps', 'compose commands'],
          target: 'Build: Deploy Dockerized Application',
          deliverable: 'docker-compose.yml config'
        };
        dsaTopic = { name: 'Advanced Graphs II', subtopics: ['Topological Sort', 'Kahn Algorithm', 'Cycle Detection'], target: 'Solve 15 Questions', deliverable: 'LeetCode checklist' };
        aptTopic = { part: 'PART 1 Quantitative Aptitude', name: 'Higher Maths', subtopics: ['Probability Advanced'], target: '25 Questions', estQuestions: 25, criteria: '85% Accuracy' };
        ipTopic = { name: 'SQL Interview Questions', subtopics: ['SQL Joins queries', 'Window functions', 'CTEs'], target: 'Solve 15 SQL questions', deliverable: 'SQL answers' };
        devTopic.miniProject = 'Multi container compose app';
      } else if (w === 35) {
        devTopic = {
          name: 'AWS Basics',
          subtopics: ['Cloud Concepts', 'AWS infrastructure basics'],
          target: 'Build: AWS Account Setup',
          deliverable: 'AWS dashboard credentials check'
        };
        dsaTopic = { name: 'Greedy Algorithms', subtopics: ['Activity Selection', 'Fractional Knapsack', 'Job Sequencing'], target: 'Solve 15 Questions', deliverable: 'LeetCode checklist' };
        aptTopic = { part: 'PART 1 Quantitative Aptitude', name: 'Higher Maths', subtopics: ['Permutations'], target: '30 Questions', estQuestions: 30, criteria: '80% Accuracy' };
        ipTopic = { name: 'CN Interview Questions', subtopics: ['OSI layers protocols', 'TCP UDP comparison', 'IP addresses'], target: 'Solve 15 CN questions', deliverable: 'CN answers' };
      } else if (w === 36) {
        devTopic = {
          name: 'EC2, S3, IAM',
          subtopics: ['Instance creation', 'Bucket setup', 'IAM policies'],
          target: 'Build: Deploy Project on AWS',
          deliverable: 'AWS deploy URL'
        };
        dsaTopic = { name: 'Greedy Practice Sprint', subtopics: ['Medium Greedy Problems'], target: 'Solve 20 Questions', deliverable: 'LeetCode checklist' };
        aptTopic = { part: 'PART 1 Quantitative Aptitude', name: 'Higher Maths', subtopics: ['Combinations'], target: '30 Questions', estQuestions: 30, criteria: '80% Accuracy' };
        ipTopic = { name: 'OOP Interview Questions', subtopics: ['Inheritance', 'Encapsulation', 'SOLID principles'], target: 'OOP design answers', deliverable: 'OOP notes' };
      }

      // Phase 7: Advanced DSA & System Design (Weeks 37 to 40)
      else if (w === 37) {
        devTopic = {
          name: 'System Design Basics',
          subtopics: ['Scalability', 'Availability', 'Throughput vs Latency'],
          target: 'Build: Architecture notes',
          deliverable: 'Architecture doc'
        };
        dsaTopic = { name: 'Dynamic Programming I', subtopics: ['Fibonacci DP', 'Climbing Stairs', 'House Robber'], target: 'Solve 15 Questions', deliverable: 'LeetCode checklist' };
        aptTopic = { part: 'PART 1 Quantitative Aptitude', name: 'Data Interpretation', subtopics: ['Data Interpretation Tables'], target: '20 Questions', estQuestions: 20, criteria: '85% Accuracy' };
        ipTopic = { name: 'OS Interview Questions', subtopics: ['Processes vs Threads', 'CPU scheduling', 'Paging'], target: 'Solve 10 OS questions', deliverable: 'OS answers' };
      } else if (w === 38) {
        devTopic = {
          name: 'Load Balancers',
          subtopics: ['Reverse Proxy', 'Load balancing algorithms'],
          target: 'Build: Reverse Proxy Nginx setup',
          deliverable: 'Nginx config'
        };
        dsaTopic = { name: 'Dynamic Programming II', subtopics: ['Knapsack', 'Subset Sum'], target: 'Solve 15 Questions', deliverable: 'LeetCode checklist' };
        aptTopic = { part: 'PART 1 Quantitative Aptitude', name: 'Data Interpretation', subtopics: ['Pie Charts'], target: '20 Questions', estQuestions: 20, criteria: '85% Accuracy' };
        ipTopic = { name: 'Networking Protocols Revision', subtopics: ['DNS resolution', 'HTTP secure', 'SSL/TLS'], target: 'Solve 15 CN questions', deliverable: 'CN revision answers' };
      } else if (w === 39) {
        devTopic = {
          name: 'Caching',
          subtopics: ['Redis Basics', 'Eviction policies LRU'],
          target: 'Build: Cache integration',
          deliverable: 'Cache script code'
        };
        dsaTopic = { name: 'Dynamic Programming III', subtopics: ['Longest Increasing Subsequence', 'Coin Change'], target: 'Solve 15 Questions', deliverable: 'LeetCode checklist' };
        aptTopic = { part: 'PART 1 Quantitative Aptitude', name: 'Data Interpretation', subtopics: ['Bar Graphs'], target: '20 Questions', estQuestions: 20, criteria: '85% Accuracy' };
        ipTopic = { name: 'DBMS Transactions Revision', subtopics: ['ACID models', 'Concurrency locks'], target: 'DBMS transactions answers', deliverable: 'DBMS revision notes' };
      } else if (w === 40) {
        devTopic = {
          name: 'Database Scaling Basics',
          subtopics: ['Read write split', 'Master-Slave replication'],
          target: 'Build: Database scaling documentation',
          deliverable: 'Scaling docs'
        };
        dsaTopic = { name: 'Dynamic Programming Revision', subtopics: ['Mixed DP Problems'], target: 'Solve 20 Questions', deliverable: 'LeetCode checklist' };
        aptTopic = { part: 'PART 1 Quantitative Aptitude', name: 'Data Interpretation', subtopics: ['Mixed DI'], target: '20 Questions', estQuestions: 20, criteria: '85% Accuracy' };
        ipTopic = { name: 'System Design Interview Questions', subtopics: ['High availability designs', 'Failover setups'], target: 'Solve 10 SD questions', deliverable: 'SD answers' };
      }

      // Phase 8: Placement Project Sprint (Weeks 41 to 44)
      else if (w === 41) {
        devTopic = {
          name: 'Full Stack Project Planning',
          subtopics: ['Requirements', 'Architecture', 'Database Design'],
          target: 'Build: Placement Tracker OR AI Resume Builder design plan',
          deliverable: 'Architecture blueprint design'
        };
        dsaTopic = { name: 'Trees Revision', subtopics: ['Height & Traversals trees'], target: 'Solve 10 Questions', deliverable: 'LeetCode checklist' };
        aptTopic = { part: 'PART 2 Analytical Reasoning', name: 'Logical Deduction', subtopics: ['Reasoning Revision'], target: '30 Questions', estQuestions: 30, criteria: '85% Accuracy' };
        ipTopic = { name: 'System Design: Sharding', subtopics: ['Sharding partitions keys', 'Consistent hashing maps'], target: 'Sharding strategy blueprint', deliverable: 'Sharding docs' };
      } else if (w === 42) {
        devTopic = {
          name: 'Project Development I',
          subtopics: ['Backend Build', 'APIs', 'Authentication'],
          target: 'Build backend APIs with auth controllers',
          deliverable: 'REST API codebase'
        };
        dsaTopic = { name: 'BST Problems', subtopics: ['BST validation deletion'], target: 'Solve 10 Questions', deliverable: 'LeetCode checklist' };
        aptTopic = { part: 'PART 1 Quantitative Aptitude', name: 'Ratio & Proportion', subtopics: ['Quantitative Revision'], target: '30 Questions', estQuestions: 30, criteria: '85% Accuracy' };
        ipTopic = { name: 'DBMS Revision', subtopics: ['Normalization schema tables', 'Relational constraints rules'], target: 'Resolve DBMS queries database', deliverable: 'DBMS revision answers' };
      } else if (w === 43) {
        devTopic = {
          name: 'Project Development II',
          subtopics: ['Frontend', 'Dashboard', 'Analytics'],
          target: 'Assemble frontend React UI portal dashboard pages',
          deliverable: 'Client React app directory'
        };
        dsaTopic = { name: 'Heap Problems', subtopics: ['Heapify sort heaps'], target: 'Solve 10 Questions', deliverable: 'LeetCode checklist' };
        aptTopic = { part: 'PART 3 Grammar & RC', name: 'Reading Comprehension', subtopics: ['Verbal Revision'], target: '30 Questions', estQuestions: 30, criteria: '85% Accuracy' };
        ipTopic = { name: 'CN Revision', subtopics: ['OSI layers protocol', 'TCP socket handshake'], target: 'Map network devices interfaces', deliverable: 'CN revision answers' };
      } else if (w === 44) {
        devTopic = {
          name: 'Project Deployment',
          subtopics: ['Testing', 'Bug Fixes', 'Deployment'],
          target: 'Deploy project live to staging and production',
          deliverable: 'Staging deploy URL'
        };
        dsaTopic = { name: 'Graph Revision', subtopics: ['BFS DFS Graph revisions'], target: 'Solve 10 Questions', deliverable: 'LeetCode checklist' };
        aptTopic = { part: 'PART 2 Analytical Reasoning', name: 'Logical Deduction', subtopics: ['Logical Revision'], target: '30 Questions', estQuestions: 30, criteria: '85% Accuracy' };
        ipTopic = { name: 'OS Revision', subtopics: ['CPU process schedulers', 'Virtual memory replacements'], target: 'Solve OS scheduler mock tests', deliverable: 'OS revision answers' };
      }

      // Phase 9: Placement Readiness Sprint (Weeks 45 to 48)
      else if (w === 45) {
        devTopic = {
          name: 'Resume Version 1',
          subtopics: ['Resume templates formatting', 'ATS checks optimizations'],
          target: 'Publish Resume Version 1 ATS optimized',
          deliverable: 'Resume PDF draft file'
        };
        dsaTopic = { name: 'Mixed Easy + Medium', subtopics: ['Top questions easy medium list'], target: 'Solve 15 Questions', deliverable: 'LeetCode checklist' };
        aptTopic = { part: 'PART 1 Quantitative Aptitude', name: 'Number System', subtopics: ['Quantitative Drill'], target: '30 Questions', estQuestions: 30, criteria: '85% Accuracy' };
        ipTopic = { name: 'Full Syllabus Revision Set 1', subtopics: ['DBMS, SQL, CN mocks', 'OOP OS reviews'], target: 'Mock interviews sprint questions', deliverable: 'Revision feedback log' };
      } else if (w === 46) {
        devTopic = {
          name: 'LinkedIn Optimization',
          subtopics: ['Headline formatting profile updates', 'Project description listings'],
          target: 'Revise LinkedIn page details',
          deliverable: 'LinkedIn audit completion status'
        };
        dsaTopic = { name: 'Weekly Contest Practice', subtopics: ['Contest mock algorithms solved'], target: 'Solve 15 Questions', deliverable: 'LeetCode checklist' };
        aptTopic = { part: 'PART 1 Quantitative Aptitude', name: 'Data Interpretation', subtopics: ['Full Mock Test'], target: '40 Questions', estQuestions: 40, criteria: '85% Accuracy' };
        ipTopic = { name: 'Full Syllabus Revision Set 2', subtopics: ['System design sharding LB', 'Caching database replicates'], target: 'Explain scalability options', deliverable: 'Revision notes guide' };
      } else if (w === 47) {
        devTopic = {
          name: 'Portfolio Optimization',
          subtopics: ['Project links additions UI UX', 'Mobile responsiveness updates'],
          target: 'Deploy optimized Personal Portfolio page live',
          deliverable: 'Portfolio website deploy link'
        };
        dsaTopic = { name: 'Top 75 Interview Questions', subtopics: ['Blind 75 algorithms solved list'], target: 'Solve 15 Questions', deliverable: 'LeetCode checklist' };
        aptTopic = { part: 'PART 3 Grammar & RC', name: 'Sentence Correction', subtopics: ['Aptitude Quick revision'], target: '30 Questions', estQuestions: 30, criteria: '90% Accuracy' };
        ipTopic = { name: 'DBMS + CN + OS Quick Revision', subtopics: ['OSI Layers TCP socket protocols', 'DB normalization transactions ACID', 'Process threads memory management'], target: 'Core CS interview mocks', deliverable: 'CS cores quick cheat sheet' };
      } else if (w === 48) {
        devTopic = {
          name: 'Internship Readiness Audit',
          subtopics: ['React project validation check', 'Backend API check', 'AWS deploy validation', 'CS cores models verified'],
          target: 'Perform baseline audit checks checklist items',
          deliverable: 'Internship audit sheet checks'
        };
        dsaTopic = { name: 'Leecode Target Audit', subtopics: ['Leetcode solved questions checks', 'Total solved questions audit'], target: 'Confirm 200+ questions milestone solves', deliverable: 'Milestone solved count log' };
        aptTopic = { part: 'PART 3 Grammar & RC', name: 'Reading Comprehension', subtopics: ['Full Mock Test'], target: '40 Questions', estQuestions: 40, criteria: '85% Accuracy' };
        ipTopic = { name: 'CS Core revision', subtopics: ['Final tech interview simulation', 'Final mock assessments feedback'], target: 'Confirm placement ready baselines checklist items', deliverable: 'CS cores final review logs' };
      }

      // Fallbacks / Placement Mastery (Weeks 49 to 70)
      else if (w >= 49 && w <= 52) {
        devTopic = { name: 'DevOps & Cloud Sprints', subtopics: ['Docker multi-containers compose config', 'GitHub Actions CI/CD pipeline automation', 'AWS deployment setup instances'], target: 'Deploy App to Live Staging Cloud', deliverable: 'Deploy URL code file' };
        dsaTopic = { name: 'Advanced DSA Graphs & DP', subtopics: ['Graphs Topological Sort cycle detection', 'DP Knapsack and LIS patterns'], target: 'Solve 20 Questions', deliverable: 'LeetCode checklist' };
        aptTopic = { part: 'PART 1 Quantitative Aptitude', name: 'Percentage', subtopics: ['Quantitative mix drills', 'Averages speed calculations'], target: '40 Questions', estQuestions: 40, criteria: '85% Accuracy' };
        ipTopic = { name: 'System Design Scaling Sprints', subtopics: ['Load balancers sharding caching', 'Database Master-Slave replication logic'], target: 'Design scalable portfolio platforms layout', deliverable: 'Design blueprint documentation file' };
      } else if (w >= 53 && w <= 56) {
        devTopic = { name: 'Advanced AI Systems', subtopics: ['Agentic AI tool calling logic', 'LangGraph stateful routing multi-agents', 'Advanced RAG query translations'], target: 'Build AI Career Coach dynamic application', deliverable: 'AI Coach system codebase' };
        dsaTopic = { name: 'Advanced DSA Trie & SegTree', subtopics: ['Trie prefix matches implement', 'Segment Tree range query updates'], target: 'Solve 15 Questions', deliverable: 'Trie code script files' };
        aptTopic = { part: 'PART 2 Analytical Reasoning', name: 'Logical Deduction', subtopics: ['Logical analogies series coding', 'Venn intersection dice cube cutting'], target: '30 Questions', estQuestions: 30, criteria: '90% Accuracy' };
        ipTopic = { name: 'AI Models Evaluations', subtopics: ['RAG evaluation frameworks metrics', 'Multi-agent study planner architectures'], target: 'Verify AI models accuracy performance', deliverable: 'AI evaluation validation metrics log' };
      } else if (w >= 57 && w <= 60) {
        devTopic = { name: 'Full Stack SaaS Build', subtopics: ['Stripe payment checkout auth integration', 'Admin management dashboard charts UI', 'AWS EC2 S3 container deployments'], target: 'Deploy Full Stack SaaS Application live', deliverable: 'SaaS URL live deploy links' };
        dsaTopic = { name: 'Placement DSA Revision Sprints', subtopics: ['Arrays strings Linked List review', 'Stacks queues binary search review'], target: 'Solve 20 high-frequency questions', deliverable: 'Solved questions lists logs' };
        aptTopic = { part: 'PART 3 Grammar & RC', name: 'Tenses', subtopics: ['Grammar active voice sentence checks', 'Reading comprehension main idea Tone'], target: '35 Questions', estQuestions: 35, criteria: '85% Accuracy' };
        ipTopic = { name: 'Technical Resume V2 Optimization', subtopics: ['SaaS project summary details', 'LinkedIn profile achievements syncs', 'GitHub clean repositories summaries'], target: 'Deploy Portfolio V2 website portal', deliverable: 'Portfolio V2 deployed live' };
      } else if (w >= 61 && w <= 64) {
        devTopic = { name: 'Core CS subjects revision', subtopics: ['DBMS normalization SQL Transactions', 'OS cpu scheduler paging deadlock', 'CN layers socket protocols TCP/IP'], target: 'Resolve CS core revision sets', deliverable: 'CS cores quick summary guides' };
        dsaTopic = { name: 'Daily DSA 5 Solves Target', subtopics: ['DP Greedy Graphs advanced algorithms', 'LeetCode daily questions code tasks'], target: 'Solve 35 Questions overall', deliverable: 'Daily DSA checklists code' };
        aptTopic = { part: 'PART 4 Vocabulary', name: 'Critical Reasoning', subtopics: ['Synonyms antonyms verbal sentence completions', 'Critical reasoning arguments assumptions'], target: '40 Questions', estQuestions: 40, criteria: '90% Accuracy' };
        ipTopic = { name: 'Tech Placement Mock Sprints', subtopics: ['Technical mock interview rounds tests', 'Placement simulation assessments feedback'], target: 'Complete 12 mock interviews', deliverable: 'Tech interview rating logs' };
      } else if (w >= 65 && w <= 68) {
        devTopic = { name: 'Company Specific Preparation', subtopics: ['Service giants TCS Infosys Accenture', 'Intermediate product giants Zoho Deloitte'], target: 'Practice Online Assessment queries codes', deliverable: 'OA codes lists' };
        dsaTopic = { name: 'Advanced System Coding Sprints', subtopics: ['Data structure design tasks', 'Graphs topological routing simulations'], target: 'Solve 20 hard questions', deliverable: 'Graphs codes lists' };
        aptTopic = { part: 'PART 1 Quantitative Aptitude', name: 'Higher Maths', subtopics: ['Numerical DI OA mocks', 'Cognitive analytical sets practice'], target: '45 Questions', estQuestions: 45, criteria: '85% Accuracy' };
        ipTopic = { name: 'HR Behavioral Rounds Prep', subtopics: ['HR questions behavioral scenarios', 'Project explanation depth reviews'], target: 'Complete HR mocks simulation rounds', deliverable: 'HR mock reviews scorecards' };
      } else {
        // Final Sprint (W69 to W70)
        devTopic = { name: 'Applications & Sprints Tracking', subtopics: ['Cold emailing referrals networking', 'Onboarding preparation guidelines'], target: 'Track active job applications syncs', deliverable: 'Job tracker sheet status' };
        dsaTopic = { name: 'Final DSA Sprints brushup', subtopics: ['High frequency questions A2Z final checks', 'Daily DSA revisions logs'], target: 'Solve 10 Questions', deliverable: 'Leetcode final logs' };
        aptTopic = { part: 'PART 4 Vocabulary', name: 'Vocabulary', subtopics: ['General checkups', 'Synonyms antonyms vocabulary drills'], target: '20 Questions', estQuestions: 20, criteria: '90% Accuracy' };
        ipTopic = { name: 'Offer Evaluations & Negotiations', subtopics: ['Offer reviews salary package negotiations', 'Core CS final review logs'], target: 'Finalize offers selection parameters list', deliverable: 'Negotiation outline plans files' };
      }

      weeksDefinitions.push({
        globalWeekNumber: w,
        dev: devTopic,
        dsa: dsaTopic,
        aptitude: aptTopic,
        ip: ipTopic
      });
    }

    // ── 5. SEED PHASES AND WEEKS AND TOPICS (NORMALIZED SEED LOOPS)
    let weekOffset = 0;
    const ROADMAP_START_DATE = new Date('2026-06-15');

    // 15 phases config
    const phasesConfig = [
      { name: 'Phase 1: Foundation Forge', numWeeks: 4, monthName: 'June-July 2026', year: 2026, monthIndex: 0, skill: 'HTML & CSS Fundamentals' },
      { name: 'Phase 2: JavaScript + React Builder', numWeeks: 8, monthName: 'July-August 2026', year: 2026, monthIndex: 1, skill: 'JS & React UI Components' },
      { name: 'Phase 3: AI Builder', numWeeks: 4, monthName: 'September 2026', year: 2026, monthIndex: 2, skill: 'Prompt Eng & OpenAI API' },
      { name: 'Phase 4: Backend Forge', numWeeks: 6, monthName: 'October-November 2026', year: 2026, monthIndex: 3, skill: 'Node Express MongoDB SQL' },
      { name: 'Phase 5: Internship Sprint', numWeeks: 10, monthName: 'December 2026 - January 2027', year: 2027, monthIndex: 4, skill: 'Docker Git Deployment' },
      { name: 'Phase 6: Placement Accelerator', numWeeks: 4, monthName: 'February 2027', year: 2027, monthIndex: 5, skill: 'Advanced Graphs & AWS' },
      { name: 'Phase 7: Advanced DSA & System Design', numWeeks: 4, monthName: 'March 2027', year: 2027, monthIndex: 6, skill: 'DP & Redis Cache Scaling' },
      { name: 'Phase 8: Placement Project Sprint', numWeeks: 4, monthName: 'April 2027', year: 2027, monthIndex: 7, skill: 'Full Stack Project Build' },
      { name: 'Phase 9: Placement Readiness Sprint', numWeeks: 4, monthName: 'May 2027', year: 2027, monthIndex: 8, skill: 'Mock Interviews & Resumes' },
      { name: 'Phase 10: DevOps & Cloud', numWeeks: 4, monthName: 'June 2027', year: 2027, monthIndex: 9, skill: 'Docker Compose Nginx CI/CD' },
      { name: 'Phase 11: Advanced AI Sprints', numWeeks: 4, monthName: 'July 2027', year: 2027, monthIndex: 10, skill: 'Agentic AI LangGraph RAG' },
      { name: 'Phase 12: Placement Project Month', numWeeks: 4, monthName: 'August 2027', year: 2027, monthIndex: 11, skill: 'Full Stack SaaS & GenAI' },
      { name: 'Phase 13: Placement Prep', numWeeks: 4, monthName: 'September 2027', year: 2027, monthIndex: 12, skill: 'DSA Revision & CS Cores' },
      { name: 'Phase 14: Placement Arena', numWeeks: 4, monthName: 'October 2027', year: 2027, monthIndex: 13, skill: 'Company OA Mock Sprints' },
      { name: 'Phase 15: Final Sprint', numWeeks: 2, monthName: 'November 2027', year: 2027, monthIndex: 14, skill: 'Job Tracking & Offers' }
    ];

    for (const pConfig of phasesConfig) {
      const phaseStart = new Date(ROADMAP_START_DATE.getTime() + weekOffset * 7 * 24 * 60 * 60 * 1000);
      const phaseEnd = new Date(phaseStart.getTime() + pConfig.numWeeks * 7 * 24 * 60 * 60 * 1000 - 1000);

      const phaseDoc = await Phase.create({
        userId: demoUser._id,
        name: pConfig.name,
        monthIndex: pConfig.monthIndex,
        year: pConfig.year,
        monthName: pConfig.monthName,
        plannedStartDate: phaseStart,
        plannedEndDate: phaseEnd
      });

      for (let w = 0; w < pConfig.numWeeks; w++) {
        const globalW = weekOffset + w + 1;
        const wDef = weeksDefinitions.find(x => x.globalWeekNumber === globalW);
        if (wDef) {
          const weekStart = new Date(ROADMAP_START_DATE.getTime() + (globalW - 1) * 7 * 24 * 60 * 60 * 1000);
          const weekEnd = new Date(weekStart.getTime() + 7 * 24 * 60 * 60 * 1000 - 1000);

          const weekDoc = await Week.create({
            userId: demoUser._id,
            phaseId: phaseDoc._id,
            weekNumber: w + 1,
            globalWeekNumber: globalW,
            name: `${pConfig.monthName.split(' ')[0]} Week ${w + 1}`,
            status: 'Not Started',
            plannedStartDate: weekStart,
            plannedEndDate: weekEnd
          });

          // Create Development Topic
          await Topic.create({
            userId: demoUser._id,
            weekId: weekDoc._id,
            name: wDef.dev.name,
            category: 'Development',
            practiceTarget: wDef.dev.target,
            weeklyDeliverable: wDef.dev.deliverable,
            miniProject: wDef.dev.miniProject || '',
            subtopics: wDef.dev.subtopics.map(s => ({ name: s, isCompleted: false }))
          });

          // Create DSA Topic
          await Topic.create({
            userId: demoUser._id,
            weekId: weekDoc._id,
            name: wDef.dsa.name,
            category: 'DSA',
            practiceTarget: wDef.dsa.target,
            weeklyDeliverable: wDef.dsa.deliverable,
            subtopics: wDef.dsa.subtopics.map(s => ({ name: s, isCompleted: false }))
          });

          // Create Aptitude Topic
          await Topic.create({
            userId: demoUser._id,
            weekId: weekDoc._id,
            name: wDef.aptitude.name,
            category: 'Aptitude',
            practiceTarget: wDef.aptitude.target,
            estimatedQuestions: wDef.aptitude.estQuestions,
            completionCriteria: wDef.aptitude.criteria,
            subtopics: wDef.aptitude.subtopics.map(s => ({ name: s, isCompleted: false }))
          });

          // Create IP Skill Topic
          await Topic.create({
            userId: demoUser._id,
            weekId: weekDoc._id,
            name: wDef.ip.name,
            category: 'IP Skills',
            practiceTarget: wDef.ip.target,
            weeklyDeliverable: wDef.ip.deliverable,
            subtopics: wDef.ip.subtopics.map(s => ({ name: s, isCompleted: false }))
          });
        }
      }

      weekOffset += pConfig.numWeeks;
    }
    console.log('Normalized Phase, Week, and Topic seeded successfully.');

    // ── 6. SEED STRIVER DSA TRACKER TOPICS AND QUESTIONS (NEW ACCORDION BASED SUBTOPICS ENGINE)
    console.log('Seeding DSATopic collections...');
    const dsaTrackerData = [
      { topic: 'Arrays', subtopics: ['Easy Arrays', 'Medium Arrays', 'Hard Arrays', 'Arrays Revision'] },
      { topic: 'Strings', subtopics: ['Basic Strings', 'Advanced Strings', 'Pattern Matching', 'Strings Revision'] },
      { topic: 'Linked List', subtopics: ['Singly Linked List', 'Doubly Linked List', 'LL Cycles & Loops', 'LL Sorting & Merging'] },
      { topic: 'Stack', subtopics: ['Stack Basics & Design', 'Monotonic Stack Patterns', 'Stack Revision'] },
      { topic: 'Queue', subtopics: ['Queue Basics & Design', 'Sliding Window Maximum', 'Circular Queue'] },
      { topic: 'Binary Search', subtopics: ['BS on 1D Arrays', 'BS on Rotated Arrays', 'BS Range Maximization', 'BS on 2D Matrix'] },
      { topic: 'Recursion', subtopics: ['Recursion Basics', 'Subsequence Generation', 'Backtracking Patterns', 'Recursion Revision'] },
      { topic: 'Trees', subtopics: ['Tree Traversals', 'Height & Balances', 'LCA & Views', 'Trees Revision'] },
      { topic: 'BST', subtopics: ['BST Search & Insertion', 'BST Deletion', 'Validate BST', 'BST Advanced'] },
      { topic: 'Heap', subtopics: ['Heap Basics & Heapify', 'Kth Element Problems', 'Median from Data Stream'] },
      { topic: 'Graphs', subtopics: ['BFS & DFS Traversals', 'Cycle Detection', 'Shortest Paths (Dijkstra)', 'Disjoint Set Union (DSU)'] },
      { topic: 'Greedy', subtopics: ['Greedy Basics', 'Activity Selection & Scheduling', 'Greedy Advanced Problems'] },
      { topic: 'DP', subtopics: ['1D DP (Fibonacci/Climbing)', '0/1 Knapsack Patterns', 'LIS Patterns', 'Grid DP Patterns', 'DP Advanced Sprints'] },
      { topic: 'Trie', subtopics: ['Trie Implementation & Basics', 'Advanced Word Search Patterns'] },
      { topic: 'Segment Tree', subtopics: ['Segment Tree Range Queries', 'Segment Tree Mutable Updates'] }
    ];

    for (const item of dsaTrackerData) {
      await DSATopic.create({
        userId: demoUser._id,
        topicName: item.topic,
        isCustom: false,
        subtopics: item.subtopics.map(subName => ({
          name: subName,
          isCompleted: false,
          questionsSolved: 0,
          revisionCount: 0,
          notes: ''
        }))
      });
    }
    console.log('DSATopic subtopics tracker seeded successfully.');

    const aptitudeData = [
      {
        part: 'PART 1 Quantitative Aptitude',
        topics: [
          { name: 'Number System and Algebra', subtopics: ['Prime numbers & factors', 'Divisibility rules', 'LCM & HCF calculations', 'Algebraic expressions'] },
          { name: 'Ratio and Proportion', subtopics: ['Direct/Inverse Proportion', 'Partnership allocations', 'Mixtures & alligations'] },
          { name: 'Average', subtopics: ['Simple averages', 'Weighted averages'] },
          { name: 'Percentage', subtopics: ['Percentage computations', 'Successive increments'] },
          { name: 'Profit and Loss', subtopics: ['Cost/Sale prices', 'Markup & Discounts'] },
          { name: 'Simple Interest', subtopics: ['Simple Interest formulas', 'Word problems'] },
          { name: 'Compound Interest', subtopics: ['Compound Interest formulas', 'Compounding intervals'] },
          { name: 'Time and Work', subtopics: ['Person-days work rate', 'Pipe & Cistern flow'] },
          { name: 'Time Speed Distance', subtopics: ['Relative speeds meetings', 'Trains & Boats crossings'] },
          { name: 'Geometry', subtopics: ['Area & Perimeter', 'Volume of 3D objects', 'Coordinate shapes'] },
          { name: 'Higher Mathematics', subtopics: ['Permutations & Combinations', 'Probability basics'] },
          { name: 'Data Interpretation', subtopics: ['Bar charts', 'Pie charts calculations', 'Line graphs trends'] }
        ]
      },
      {
        part: 'PART 2 Analytical Reasoning',
        topics: [
          { name: 'Number Series', subtopics: ['Arithmetic progressions series', 'Geometric series check'] },
          { name: 'Letter Series', subtopics: ['Alphabet shifts letter series', 'Pattern repeats'] },
          { name: 'Analogies', subtopics: ['Word analogies', 'Number classification analogies'] },
          { name: 'Odd Man Out', subtopics: ['Classification anomalies', 'Odd word out'] },
          { name: 'Coding Decoding', subtopics: ['Key deciphering substitutions', 'Substitution cyphers'] },
          { name: 'Directions', subtopics: ['Compass direction displacements', 'Distance navigation'] },
          { name: 'Blood Relations', subtopics: ['Family tree relations mapping', 'Coded relationships'] },
          { name: 'Analytical Reasoning', subtopics: ['Puzzles', 'Linear & circular arrangements'] },
          { name: 'Calendars', subtopics: ['Odd days calculations', 'Leap year check systems'] },
          { name: 'Clocks', subtopics: ['Angle between hands', 'Clock gains and losses'] },
          { name: 'True False Logic', subtopics: ['Truth logic validation', 'Connectives statements'] },
          { name: 'Cubes', subtopics: ['Dice face opposite checks', 'Cube cutting calculations'] },
          { name: 'Venn Diagrams', subtopics: ['Venn relations sets', '3-circle intersection problems'] },
          { name: 'Non Verbal Reasoning', subtopics: ['Pattern completion figures', 'Mirror images'] },
          { name: 'Logical Deductions', subtopics: ['Syllogisms deductions', 'Connectives and implications'] }
        ]
      },
      {
        part: 'PART 3 Grammar & Reading Comprehension',
        topics: [
          { name: 'Parts Of Speech', subtopics: ['Noun identifiers', 'Verb actions helpers', 'Adjective descriptors'] },
          { name: 'Nouns', subtopics: ['Proper and Common Nouns', 'Plural and Singular Nouns', 'Possessive Nouns'] },
          { name: 'Pronouns', subtopics: ['Personal Pronouns', 'Relative Pronouns', 'Reflexive Pronouns'] },
          { name: 'Verbs', subtopics: ['Action and Linking Verbs', 'Auxiliary Verbs', 'Transitive/Intransitive'] },
          { name: 'Adjectives', subtopics: ['Descriptive Adjectives', 'Degrees of Comparison', 'Demonstrative Adjectives'] },
          { name: 'Adverbs', subtopics: ['Adverbs of Manner', 'Adverbs of Place and Time', 'Adverbs of Frequency'] },
          { name: 'Prepositions', subtopics: ['Prepositions of Place', 'Prepositions of Time', 'Prepositions of Direction'] },
          { name: 'Conjunctions', subtopics: ['Coordinating Conjunctions', 'Subordinating Conjunctions', 'Correlative Conjunctions'] },
          { name: 'Interjections', subtopics: ['Common Interjections and usage'] },
          { name: 'Tenses', subtopics: ['Simple Present/Past/Future', 'Perfect continuous formats', 'Conditional tenses'] },
          { name: 'Articles', subtopics: ['Definite vs indefinite a/an/the', 'Omission of articles'] },
          { name: 'Active Passive Voice', subtopics: ['Voice conversions syntax', 'By-agent omissions'] },
          { name: 'Direct Indirect Speech', subtopics: ['Reported speech conversions', 'Tense backshifts rules'] },
          { name: 'Reading Comprehension', subtopics: ['Main idea extraction', 'Tone analysis', 'Inference questions'] }
        ]
      },
      {
        part: 'PART 4 Vocabulary',
        topics: [
          { name: 'Synonyms', subtopics: ['Contextual synonyms mapping', 'Advanced vocabulary lists'] },
          { name: 'Antonyms', subtopics: ['Contextual antonyms mapping', 'Opposite meaning words'] },
          { name: 'Sentence Completion', subtopics: ['Single blank completions', 'Double blank logic mapping'] },
          { name: 'Critical Reasoning', subtopics: ['Assumption finding', 'Strengthening arguments', 'Weakening arguments'] }
        ]
      }
    ];

    for (const item of aptitudeData) {
      for (const t of item.topics) {
        await AptitudeTopic.create({
          userId: demoUser._id,
          partName: item.part,
          topicName: t.name,
          subtopics: t.subtopics.map(subName => ({
            name: subName,
            isCompleted: false,
            questionsSolved: 0,
            accuracyPercent: 0,
            revisionCount: 0,
            notes: ''
          })),
          isCompleted: false,
          notes: ''
        });
      }
    }
    console.log('Aptitude Book chapters seeded successfully.');

    console.log('Seeding complete! Database V4 ready.');
    
    if (options.closeConnection) {
      mongoose.connection.close();
      process.exit(0);
    }
  } catch (err) {
    console.error(`Error during seeding: ${err.message}`);
    if (options.closeConnection) {
      mongoose.connection.close();
      process.exit(1);
    }
    throw err;
  }
};

if (require.main === module) {
  seedDatabase();
}

module.exports = seedDatabase;
