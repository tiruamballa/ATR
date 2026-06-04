const mongoose = require('mongoose');
const dotenv = require('dotenv');
const User = require('../models/User');
const Phase = require('../models/Phase');
const Task = require('../models/Task');
const Streak = require('../models/Streak');
const DSATopic = require('../models/DSATopic');
const AptitudeTopic = require('../models/AptitudeTopic');
const DailyProgress = require('../models/DailyProgress');
const EnglishProgress = require('../models/EnglishProgress');
const Analytics = require('../models/Analytics');

dotenv.config();

const phasesData = [
  {
    monthIndex: 0,
    year: 2026,
    monthName: 'June',
    name: 'Core Ignition',
    goal: 'Build absolute programming foundations in HTML, CSS, JavaScript, Git, and AI fundamentals.',
    estimatedHours: 120,
    primarySkill: 'HTML/CSS/JS/Git',
    weeks: [
      {
        weekNumber: 1,
        dev: 'HTML5 semantic structure & basic layouts',
        dsa: 'DSA: Arrays — introduction, memory allocation and random access',
        english: 'English: Technology vocabulary build & reading active articles',
        aptitude: 'Aptitude: Percentages — fundamental calculations and fractions mapping'
      },
      {
        weekNumber: 2,
        dev: 'CSS3 flexbox grids and responsive page designs',
        dsa: 'DSA: Arrays — two pointers technique (pair sum, container with most water)',
        english: 'English: Technical document reading and active summarizing',
        aptitude: 'Aptitude: Percentages — word problems and comparisons'
      },
      {
        weekNumber: 3,
        dev: 'JavaScript ES6 functions, variables, closures, promises',
        dsa: 'DSA: Arrays — sliding window technique (max sum subarray of size K)',
        english: 'English: Speaking session — 1 minute elevator pitch practice',
        aptitude: 'Aptitude: Profit & Loss — formulas and cost-selling relations'
      },
      {
        weekNumber: 4,
        dev: 'Git version control branching, merging, PR workflows',
        dsa: 'DSA: Arrays — prefix sum technique (range sum queries)',
        english: 'English: Professional email drafting and corporate greetings',
        aptitude: 'Aptitude: Profit & Loss — discounts, successive discounts, marked price queries'
      }
    ]
  },
  {
    monthIndex: 1,
    year: 2026,
    monthName: 'July',
    name: 'React Reactor',
    goal: 'Master React components, state, hooks, and SQL relational database queries.',
    estimatedHours: 130,
    primarySkill: 'React & SQL/DBMS',
    weeks: [
      {
        weekNumber: 1,
        dev: 'React JS component trees, props, state, useState hook',
        dsa: 'DSA: Strings — basic character counts and string reversal',
        english: 'English: Vocabulary for collaborative work & team checkins',
        aptitude: 'Aptitude: Time & Work — basic rates and person-hours logic'
      },
      {
        weekNumber: 2,
        dev: 'SQL relational tables creation, JOIN operations, basic SELECT',
        dsa: 'DSA: Strings — anagram check and sorting methods',
        english: 'English: Speaking session — discussing task updates in standup',
        aptitude: 'Aptitude: Time & Work — alternate days work patterns'
      },
      {
        weekNumber: 3,
        dev: 'DBMS conceptual normalization (1NF, 2NF, 3NF) and ER diagrams',
        dsa: 'DSA: Strings — pattern matching algorithms (KMP/Rabin-Karp basics)',
        english: 'English: Reading technical blogs and listing industry vocabulary',
        aptitude: 'Aptitude: Speed & Distance — core formulas and average speed'
      },
      {
        weekNumber: 4,
        dev: 'React forms handling, user events, useEffect lifecycle hook',
        dsa: 'DSA: Strings — substring search and sliding window on strings',
        english: 'English: Writing project changelogs and releases',
        aptitude: 'Aptitude: Speed & Distance — relative speeds and trains crossing queries'
      }
    ]
  },
  {
    monthIndex: 2,
    year: 2026,
    monthName: 'August',
    name: 'Backend Basecamp',
    goal: 'Develop REST APIs using Node.js + Express, MongoDB, and Mongoose modeling.',
    estimatedHours: 140,
    primarySkill: 'Node/Express/MongoDB',
    weeks: [
      {
        weekNumber: 1,
        dev: 'React Context API and custom hooks for global states',
        dsa: 'DSA: Hashing — Map/Set structures and hash function basics',
        english: 'English: Speaking session — explaining a React code block',
        aptitude: 'Aptitude: Probability — basics laws of probability, coins and cards'
      },
      {
        weekNumber: 2,
        dev: 'NodeJS runtime environment, module exports, fs file system',
        dsa: 'DSA: Hashing — Two Sum problem and Subarray Sum Equals K',
        english: 'English: Writing comprehensive bug reports and logs',
        aptitude: 'Aptitude: Probability — dice rolls and conditional probability',
        isP1: true
      },
      {
        weekNumber: 3,
        dev: 'ExpressJS server routers, error handlers, customs middlewares',
        dsa: 'DSA: Hashing — Group Anagrams and vertical tree mappings',
        english: 'English: Analytics vocabulary and graphing terms',
        aptitude: 'Aptitude: Permutation & Combination — basic factorial arrangements'
      },
      {
        weekNumber: 4,
        dev: 'MongoDB Mongoose schemas validations, queries, CRUD integrations',
        dsa: 'DSA: Hashing — Longest Consecutive Sequence',
        english: 'English: Reading technical specification sheets',
        aptitude: 'Aptitude: Permutation & Combination — circular seat arrangements'
      }
    ]
  },
  {
    monthIndex: 3,
    year: 2026,
    monthName: 'September',
    name: 'AI Launchpad',
    goal: 'Understand LLM APIs, prompt engineering, vector embeddings, and RAG architectures.',
    estimatedHours: 120,
    primarySkill: 'LLMs & LangChain',
    weeks: [
      {
        weekNumber: 1,
        dev: 'OpenAI API key configuration and system prompt styling',
        dsa: 'DSA: Linked List — Singly linked list creation, node insertions',
        english: 'English: Speaking session — pitching a custom AI project idea',
        aptitude: 'Aptitude: Number Series — finding missing term patterns'
      },
      {
        weekNumber: 2,
        dev: 'Text embeddings generations, Vector DB setups (Pinecone/Chroma)',
        dsa: 'DSA: Linked List — reverse singly linked list, recursive and iterative',
        english: 'English: Vocabulary logs for AI terminology',
        aptitude: 'Aptitude: Number Series — identifying wrong terms in progression'
      },
      {
        weekNumber: 3,
        dev: 'RAG setup: PDF document loader, splitting, vector querying',
        dsa: 'DSA: Linked List — detect cycle in list (Floyd’s Cycle detection)',
        english: 'English: Writing summaries of RAG pipeline designs',
        aptitude: 'Aptitude: Data Interpretation — interpreting table metrics'
      },
      {
        weekNumber: 4,
        dev: 'LangChain integration: chaining prompts and LLM memories',
        dsa: 'DSA: Linked List — remove N-th node from end of list',
        english: 'English: Reading AI system case studies',
        aptitude: 'Aptitude: Data Interpretation — interpreting bar graphs'
      }
    ]
  },
  {
    monthIndex: 4,
    year: 2026,
    monthName: 'October',
    name: 'Analytics Quest',
    goal: 'Apply Python data tools for data analytics alongside advanced agentic AI models.',
    estimatedHours: 130,
    primarySkill: 'Data Analytics & AI',
    weeks: [
      {
        weekNumber: 1,
        dev: 'Python Pandas dataframes, loading CSVs, numpy indexing',
        dsa: 'DSA: Stack — implementation using dynamic arrays & pointers',
        english: 'English: Speaking session — explaining layout design critiques',
        aptitude: 'Aptitude: Percentages master review — quick tricks'
      },
      {
        weekNumber: 2,
        dev: 'Data visualizations: matplotlib and seaborn plot patterns',
        dsa: 'DSA: Stack — balanced parentheses checker (valid brackets)',
        english: 'English: Vocabulary logs for statistical evaluations',
        aptitude: 'Aptitude: Profit & Loss master review — markups and costs'
      },
      {
        weekNumber: 3,
        dev: 'Applied AI model APIs deployment (HuggingFace, Replicate)',
        dsa: 'DSA: Queue — implementation using array ring buffer',
        english: 'English: Writing data analytics summaries',
        aptitude: 'Aptitude: Time & Work master review — pipes & cisterns'
      },
      {
        weekNumber: 4,
        dev: 'Data analytics project — dashboards and interactive plots',
        dsa: 'DSA: Queue — sliding window maximum (deque approach)',
        english: 'English: Reading data research papers and stats logs',
        aptitude: 'Aptitude: Speed & Distance master review — boats & streams'
      }
    ]
  },
  {
    monthIndex: 5,
    year: 2026,
    monthName: 'November',
    name: 'Software Foundations',
    goal: 'Deepen knowledge in OOPs principles, Software Design Patterns, Computer Networks, and Resume v1.',
    estimatedHours: 140,
    primarySkill: 'OOPs/CN/Resume v1',
    weeks: [
      {
        weekNumber: 1,
        dev: 'Java Object Oriented programming — Inheritance & Polymorphism',
        dsa: 'DSA: Trees — Binary Tree structure and node insertion',
        english: 'English: Speaking session — mock behavioral interviews',
        aptitude: 'Aptitude: Probability master review — coin/card subsets'
      },
      {
        weekNumber: 2,
        dev: 'Low Level Design — SOLID design principles implementations',
        dsa: 'DSA: Trees — Binary Tree traversal (Pre-order, In-order, Post-order)',
        english: 'English: Resume v1 layout selection and content drafting',
        aptitude: 'Aptitude: Permutations & Combinations master reviews'
      },
      {
        weekNumber: 3,
        dev: 'Computer Networks — OSI reference model Layers and duties',
        dsa: 'DSA: Trees — find max depth / height of binary tree',
        english: 'English: LinkedIn profile writing and resume tag links',
        aptitude: 'Aptitude: Number Series master review'
      },
      {
        weekNumber: 4,
        dev: 'High Level Design — load balancer routers, proxy structures',
        dsa: 'DSA: Trees — invert binary tree, validation of BSTs',
        english: 'English: Portfolio website code construction and deployment',
        aptitude: 'Aptitude: Data Interpretation — line charts comparisons'
      }
    ]
  },
  {
    monthIndex: 6,
    year: 2026,
    monthName: 'December',
    name: 'System Infrastructure',
    goal: 'Study Operating Systems fundamentals, TCP/IP network layers, and Docker containerization.',
    estimatedHours: 130,
    primarySkill: 'OS/Docker/Networks',
    weeks: [
      {
        weekNumber: 1,
        dev: 'Operating Systems — Process vs Thread, context switching',
        dsa: 'DSA: Graphs — BFS traversal (adjacency list representations)',
        english: 'English: Speaking session — panel debate on technical frameworks',
        aptitude: 'Aptitude: Percentages advanced levels questions'
      },
      {
        weekNumber: 2,
        dev: 'Computer Networks — TCP vs UDP protocols connection states',
        dsa: 'DSA: Graphs — DFS traversal (recursive path search)',
        english: 'English: Vocabulary logs for network configurations',
        aptitude: 'Aptitude: Profit & Loss advanced levels questions'
      },
      {
        weekNumber: 3,
        dev: 'Docker containerization — writing Dockerfiles and image caching',
        dsa: 'DSA: Graphs — Cycle detection in directed and undirected graphs',
        english: 'English: Writing server Docker configuration files documentation',
        aptitude: 'Aptitude: Time & Work advanced levels questions'
      },
      {
        weekNumber: 4,
        dev: 'Network security — SSL handshakes and HTTPS cryptographic keys',
        dsa: 'DSA: Graphs — Number of islands (connected components)',
        english: 'English: Reading networking security whitepapers',
        aptitude: 'Aptitude: Speed & Distance advanced levels questions'
      }
    ]
  },
  {
    monthIndex: 7,
    year: 2026,
    monthName: 'January',
    name: 'Interview Arena',
    goal: 'Review Cloud basics, test suites, competitive coding rules, Resume v1 edits, and mock placement runs.',
    estimatedHours: 140,
    primarySkill: 'Cloud/Testing/Mocks',
    weeks: [
      {
        weekNumber: 1,
        dev: 'Cloud services basics — AWS EC2 servers, S3 static buckets',
        dsa: 'DSA: Recursion — basic subsets generation algorithms',
        english: 'English: Speaking session — client call mock situations',
        aptitude: 'Aptitude: Probability advanced levels questions'
      },
      {
        weekNumber: 2,
        dev: 'Jest and React Testing Library — unit testing components',
        dsa: 'DSA: Recursion — generating permutations of a set',
        english: 'English: Resume v1 revision notes based on feedback',
        aptitude: 'Aptitude: Permutations & Combinations advanced level'
      },
      {
        weekNumber: 3,
        dev: 'Competitive programming speed optimizations, Big-O complexities',
        dsa: 'DSA: Backtracking — N-Queens constraint solver',
        english: 'English: Portfolio website code review logs',
        aptitude: 'Aptitude: Number Series advanced level patterns'
      },
      {
        weekNumber: 4,
        dev: 'Full mock placement tests — Aptitude + technical coding',
        dsa: 'DSA: Backtracking — Word Search algorithm',
        english: 'English: Writing performance assessment summaries',
        aptitude: 'Aptitude: Data Interpretation — pie chart ratios'
      }
    ]
  },
  {
    monthIndex: 8,
    year: 2027,
    monthName: 'February',
    name: 'Internship Sprint',
    goal: 'Participate in internship placements, refine coding speed, and execute mock interview loops.',
    estimatedHours: 150,
    primarySkill: 'Placements & DP',
    weeks: [
      {
        weekNumber: 1,
        dev: 'Internship placement season guidelines and portal registration',
        dsa: 'DSA: Dynamic Programming — Intro, Memoization vs Tabulation (Fibonacci)',
        english: 'English: Speaking session — practicing HR review questions',
        aptitude: 'Aptitude: Comprehensive quants mock test 1'
      },
      {
        weekNumber: 2,
        dev: 'Mock interview series with alumni — React & backend topics',
        dsa: 'DSA: Dynamic Programming — Coin Change problem',
        english: 'English: Vocabulary logs for interview responses',
        aptitude: 'Aptitude: Logical reasoning test series 1'
      },
      {
        weekNumber: 3,
        dev: 'UI optimization: CSS transitions, animations, Framer Motion',
        dsa: 'DSA: Dynamic Programming — Longest Common Subsequence',
        english: 'English: Resume distribution trackers and cover letters',
        aptitude: 'Aptitude: Comprehensive quants mock test 2'
      },
      {
        weekNumber: 4,
        dev: 'Live internship placement interviews & coding rounds practice',
        dsa: 'DSA: Dynamic Programming — 0/1 Knapsack problem',
        english: 'English: Post-interview follow-up writing',
        aptitude: 'Aptitude: Logical reasoning test series 2'
      }
    ]
  },
  {
    monthIndex: 9,
    year: 2027,
    monthName: 'March',
    name: 'Advanced DSA Exploration',
    goal: 'Conquer complex Graph algorithms, Tree segmentations, and hard dynamic programming.',
    estimatedHours: 140,
    primarySkill: 'Trees/Graphs/DP',
    weeks: [
      {
        weekNumber: 1,
        dev: 'Building dashboard dashboards for analytics data visualization',
        dsa: 'DSA: Trees — Lowest Common Ancestor in Binary Tree',
        english: 'English: Speaking session — explaining system layout design',
        aptitude: 'Aptitude: Percentages masterclass questions'
      },
      {
        weekNumber: 2,
        dev: 'Optimizing graph databases queries (Neo4j basics)',
        dsa: 'DSA: Graphs — Dijkstra’s shortest path algorithm',
        english: 'English: Writing technical blog articles about system setups',
        aptitude: 'Aptitude: Profit & Loss masterclass questions'
      },
      {
        weekNumber: 3,
        dev: 'Concurrency handling in NodeJS servers',
        dsa: 'DSA: Recursion — Phone letter combinations',
        english: 'English: Reading design pattern reviews',
        aptitude: 'Aptitude: Time & Work masterclass questions'
      },
      {
        weekNumber: 4,
        dev: 'Analyzing complex data pipelines and data caches',
        dsa: 'DSA: Dynamic Programming — Edit Distance and operations',
        english: 'English: Speaking session — project system architectures',
        aptitude: 'Aptitude: Speed & Distance masterclass questions'
      }
    ]
  },
  {
    monthIndex: 10,
    year: 2027,
    monthName: 'April',
    name: 'DevOps Deep Dive',
    goal: 'Master Docker Compose setups, Kubernetes orchestration basics, and CI/CD pipelines.',
    estimatedHours: 130,
    primarySkill: 'DevOps & Greedy',
    weeks: [
      {
        weekNumber: 1,
        dev: 'Docker Compose multi-container setup (React + Express + MongoDB)',
        dsa: 'DSA: Greedy — Activity Selection problem',
        english: 'English: Speaking session — sprint planning roleplay',
        aptitude: 'Aptitude: Probability masterclass questions'
      },
      {
        weekNumber: 2,
        dev: 'Kubernetes basics: Pods, Services, Deployments configs',
        dsa: 'DSA: Greedy — Fractional Knapsack problem',
        english: 'English: Writing multi-container deployment instructions',
        aptitude: 'Aptitude: Permutations & Combinations masterclass'
      },
      {
        weekNumber: 3,
        dev: 'CI/CD workflows implementation via GitHub Actions',
        dsa: 'DSA: Greedy — Huffman Coding text compression',
        english: 'English: Reading DevOps and cloud case studies',
        aptitude: 'Aptitude: Number Series masterclass questions'
      },
      {
        weekNumber: 4,
        dev: 'Cloud load balancers and auto-scaling rules configuration',
        dsa: 'DSA: Greedy — Job Sequencing with deadlines',
        english: 'English: Speaking session — post-mortem incident discussions',
        aptitude: 'Aptitude: Data Interpretation masterclass charts'
      }
    ]
  },
  {
    monthIndex: 11,
    year: 2027,
    monthName: 'May',
    name: 'System Design & OOPs',
    goal: 'Focus on Low Level & High Level System Design patterns, caching, and heap structures.',
    estimatedHours: 140,
    primarySkill: 'LLD/HLD/Heap',
    weeks: [
      {
        weekNumber: 1,
        dev: 'LLD: Singleton, Factory, and Observer design patterns',
        dsa: 'DSA: Heap — Binary Heap implementation (max and min heap)',
        english: 'English: Speaking session — critique of architectural choices',
        aptitude: 'Aptitude: Quantitative analytics tests'
      },
      {
        weekNumber: 2,
        dev: 'HLD: Database horizontal sharding and master-slave replication',
        dsa: 'DSA: Heap — Find K-th Largest element in an array',
        english: 'English: Writing low level design specifications',
        aptitude: 'Aptitude: Analytical reasoning mock sets'
      },
      {
        weekNumber: 3,
        dev: 'System caching: Redis installation and cache invalidation policies',
        dsa: 'DSA: Heap — Merge K Sorted Lists',
        english: 'English: Vocabulary logs for architectural layouts',
        aptitude: 'Aptitude: Math shortcuts for calculation speed'
      },
      {
        weekNumber: 4,
        dev: 'API gateways, rate limiting, message queues (RabbitMQ basics)',
        dsa: 'DSA: Heap — Find Median from Data Stream',
        english: 'English: Speaking session — system architecture defense',
        aptitude: 'Aptitude: Logical reasoning tests series'
      }
    ]
  },
  {
    monthIndex: 12,
    year: 2027,
    monthName: 'June',
    name: 'Database Dungeon',
    goal: 'Optimize database schemas, indexes, window functions, and Trie structures.',
    estimatedHours: 130,
    primarySkill: 'DB Indexing & Tries',
    weeks: [
      {
        weekNumber: 1,
        dev: 'Database index query optimization (explain logs)',
        dsa: 'DSA: Tries — Trie Node insertions, searches, prefix checks',
        english: 'English: Speaking session — database scaling debates',
        aptitude: 'Aptitude: Quantitative mock assessments'
      },
      {
        weekNumber: 2,
        dev: 'Advanced SQL: Window functions (ROW_NUMBER, RANK) and CTEs',
        dsa: 'DSA: Tries — Word Search II backtracking with Trie',
        english: 'English: Writing database schema dictionaries',
        aptitude: 'Aptitude: Advanced algebra shortcuts'
      },
      {
        weekNumber: 3,
        dev: 'NoSQL storage setups (Cassandra key-values modeling)',
        dsa: 'DSA: Tries — Autocomplete system implementation',
        english: 'English: Reading DB performance optimization guides',
        aptitude: 'Aptitude: Logical analysis test series'
      },
      {
        weekNumber: 4,
        dev: 'SQL transaction isolation levels: dirty reads, serialization',
        dsa: 'DSA: Tries — Replace Words in list matching prefix',
        english: 'English: Presenting database optimization techniques',
        aptitude: 'Aptitude: Comprehensive math mockup tests'
      }
    ]
  },
  {
    monthIndex: 13,
    year: 2027,
    monthName: 'July',
    name: 'Placement Warrior',
    goal: 'Participate in placement preparations, speed coding, and bit manipulation.',
    estimatedHours: 150,
    primarySkill: 'Placements & Bitwise',
    weeks: [
      {
        weekNumber: 1,
        dev: 'Full mock placement cycles: aptitude tests + coding rounds',
        dsa: 'DSA: Bit Manipulation — Power of Two and Bitwise AND/OR',
        english: 'English: Speaking session — placement interview simulation',
        aptitude: 'Aptitude: Full quants placement mockup 1'
      },
      {
        weekNumber: 2,
        dev: 'Group discussions practice sessions: trending tech themes',
        dsa: 'DSA: Bit Manipulation — Number of 1 bits (Hamming weight)',
        english: 'English: Vocabulary logs for business presentations',
        aptitude: 'Aptitude: Full quants placement mockup 2'
      },
      {
        weekNumber: 3,
        dev: 'Speed coding challenges on array and string algorithms',
        dsa: 'DSA: Bit Manipulation — Single Number in duplicate list',
        english: 'English: Resume v2 review logs and edit targets',
        aptitude: 'Aptitude: Full quants placement mockup 3'
      },
      {
        weekNumber: 4,
        dev: 'FAANG-level technical mock interviews with alumni panel',
        dsa: 'DSA: Bit Manipulation — Generate all Subsets using bitmasks',
        english: 'English: Mock behavioral analysis reports',
        aptitude: 'Aptitude: Full quants placement mockup 4'
      }
    ]
  },
  {
    monthIndex: 14,
    year: 2027,
    monthName: 'August',
    name: 'Advanced Testing & QA',
    goal: 'Set up automated Jest integration tests, E2E testing with Cypress, and deploy to Vercel/Render.',
    estimatedHours: 130,
    primarySkill: 'Testing & QA',
    weeks: [
      {
        weekNumber: 1,
        dev: 'Writing backend integration tests using supertest',
        dsa: 'DSA: Arrays — 3Sum problem (avoiding duplicates)',
        english: 'English: Speaking session — discussing project releases',
        aptitude: 'Aptitude: Aptitude test series progress check'
      },
      {
        weekNumber: 2,
        dev: 'E2E testing configuration using Cypress / Playwright',
        dsa: 'DSA: Strings — Longest Palindromic Substring',
        english: 'English: Writing end-to-end test descriptions',
        aptitude: 'Aptitude: Logical reasoning query structures'
      },
      {
        weekNumber: 3,
        dev: 'Setting up staging pipelines on Vercel (Client) and Render (Server)',
        dsa: 'DSA: Hashing — Subarray Sum Divisible by K',
        english: 'English: Reading automated testing reports',
        aptitude: 'Aptitude: Short math calculations drills'
      },
      {
        weekNumber: 4,
        dev: 'Load testing server APIs using Artillery / k6 tools',
        dsa: 'DSA: Linked List — Reorder List (midpoint + reverse + merge)',
        english: 'English: Speaking session — explaining load logs',
        aptitude: 'Aptitude: Quantitative advanced test sets'
      }
    ]
  },
  {
    monthIndex: 15,
    year: 2027,
    monthName: 'September',
    name: 'Project Polish & Resume v2',
    goal: 'Refactor full-stack projects, run profiling tools, and draft Resume v2.',
    estimatedHours: 130,
    primarySkill: 'Refactoring & Resume v2',
    weeks: [
      {
        weekNumber: 1,
        dev: 'React app profiling: finding memory leaks, caching components',
        dsa: 'DSA: Stack — Next Greater Element',
        english: 'English: Speaking session — project showcase demo',
        aptitude: 'Aptitude: Revision — Percentages complex models'
      },
      {
        weekNumber: 2,
        dev: 'Express security configurations: helmet headers, rate limiters',
        dsa: 'DSA: Queue — Implement Stack using Queues',
        english: 'English: Resume v2 final draft adjustments',
        aptitude: 'Aptitude: Revision — Profit & Loss calculations'
      },
      {
        weekNumber: 3,
        dev: 'Refactoring codebase for clean modular structure',
        dsa: 'DSA: Trees — BST insertions, searches, deletions',
        english: 'English: Writing system documentation changelogs',
        aptitude: 'Aptitude: Revision — Time & Work variables'
      },
      {
        weekNumber: 4,
        dev: 'Writing readmes and API documentation for portfolio projects',
        dsa: 'DSA: Graphs — Clone Graph deep copy',
        english: 'English: Reading peer portfolios and resumes',
        aptitude: 'Aptitude: Revision — Speed & Distance variables'
      }
    ]
  },
  {
    monthIndex: 16,
    year: 2027,
    monthName: 'October',
    name: 'Placement Arena',
    goal: 'Solve LeetCode hard problems, practice company-specific tests, and run final interview mock loops.',
    estimatedHours: 140,
    primarySkill: 'Mocks & DP Hard',
    weeks: [
      {
        weekNumber: 1,
        dev: 'Reviewing LeetCode hard algorithms and sorting tricks',
        dsa: 'DSA: Dynamic Programming — Longest Increasing Subsequence',
        english: 'English: Speaking session — final mock reviews',
        aptitude: 'Aptitude: Full quants simulated mock test 3'
      },
      {
        weekNumber: 2,
        dev: 'Company-specific past question banks solved (TCS, Infosys, Zoho)',
        dsa: 'DSA: Dynamic Programming — Partition Equal Subset Sum',
        english: 'English: Vocabulary logs for interview responses',
        aptitude: 'Aptitude: Reasoning speed mock checks'
      },
      {
        weekNumber: 3,
        dev: 'System design quick review checklists (load, cache, replication)',
        dsa: 'DSA: Dynamic Programming — Word Break problem',
        english: 'English: LinkedIn networking template writing',
        aptitude: 'Aptitude: Analytical reasoning tests series'
      },
      {
        weekNumber: 4,
        dev: 'Final mock interview loops with industry professionals',
        dsa: 'DSA: Dynamic Programming — Maximal Square',
        english: 'English: Speaking session — post-mock interview review',
        aptitude: 'Aptitude: Math calculations final revision'
      }
    ]
  },
  {
    monthIndex: 17,
    year: 2027,
    monthName: 'November',
    name: 'Final Sprint',
    goal: 'Execute placement drives, negotiate offers, and submit Resume v3.',
    estimatedHours: 150,
    primarySkill: 'Placements & Graphs',
    weeks: [
      {
        weekNumber: 1,
        dev: 'Tracking placement drives, checking portal job postings',
        dsa: 'DSA: Graphs — Word Ladder problem (BFS path length)',
        english: 'English: Speaking session — HR offer negotiations',
        aptitude: 'Aptitude: Final quants revision'
      },
      {
        weekNumber: 2,
        dev: 'Solving specific coding challenges for current drives',
        dsa: 'DSA: Graphs — Network Delay Time (Dijkstra/Bellman-Ford)',
        english: 'English: Resume v3 final placement rounds check',
        aptitude: 'Aptitude: Final logical reasoning checks'
      },
      {
        weekNumber: 3,
        dev: 'Reviewing contract terms and benefits checklists',
        dsa: 'DSA: Dynamic Programming — Coin Change II',
        english: 'English: Writing formal offer acceptance letters',
        aptitude: 'Aptitude: Final mock test arrays'
      },
      {
        weekNumber: 4,
        dev: 'Placement season wrap-up, feedback reporting',
        dsa: 'DSA: Trees — Serialize and Deserialize Binary Tree',
        english: 'English: Speaking session — placement journey review',
        aptitude: 'Aptitude: Final quants reviews'
      }
    ]
  }
];

const seedDatabase = async (options = { closeConnection: true }) => {
  try {
    if (mongoose.connection.readyState === 0) {
      console.log('Connecting to database for seeding...');
      await mongoose.connect(process.env.MONGODB_URI);
    }
    console.log('DB connection established. Clearing existing Phases and Tasks...');

    // Clear previous seeded items
    await Phase.deleteMany({});
    // Delete non-custom tasks (only roadmap tasks, keeping custom ones intact)
    await Task.deleteMany({ isCustom: false });

    console.log('Creating or finding single user tiruamballa@atr.com...');
    let demoUser = await User.findOne({ email: 'tiruamballa@atr.com' });
    if (!demoUser) {
      demoUser = await User.create({
        name: 'tiruamballa',
        email: 'tiruamballa@atr.com',
        password: '100207',
        leetcodeUsername: '',
        githubStats: {
          repos: 0,
          contributions: 0,
          streak: 0,
          projectsCount: 0,
        },
        resumes: [],
        skillsProficiency: {
          react: 0,
          backend: 0,
          sql: 0,
          dbms: 0,
          os: 0,
          cn: 0,
          oops: 0,
          aptitude: 0,
          mockInterviews: 0,
        }
      });
      console.log('Single user tiruamballa@atr.com created successfully.');
    } else {
      console.log('Single user already exists. Resetting stats for this user.');
      demoUser.githubStats = {
        repos: 0,
        contributions: 0,
        streak: 0,
        projectsCount: 0,
      };
      demoUser.skillsProficiency = {
        react: 0,
        backend: 0,
        sql: 0,
        dbms: 0,
        os: 0,
        cn: 0,
        oops: 0,
        aptitude: 0,
        mockInterviews: 0,
      };
      demoUser.resumes = [];
      demoUser.leetcodeUsername = '';
      await demoUser.save();
    }

    // Re-create/Reset streak to 0
    await Streak.deleteMany({ userId: demoUser._id });
    await Streak.create({ userId: demoUser._id, currentStreak: 0, longestStreak: 0 });

    // Clear user history logs
    await DailyProgress.deleteMany({ userId: demoUser._id });
    await EnglishProgress.deleteMany({ userId: demoUser._id });
    await Analytics.deleteMany({ userId: demoUser._id });

    // Reset topic achievements
    await DSATopic.updateMany({ userId: demoUser._id }, { $set: { solvedQuestions: 0 } });
    await AptitudeTopic.updateMany({ userId: demoUser._id }, { $set: { attempted: 0, accuracy: 0 } });

    console.log('Seeding 18 Phase documents...');
    const insertedPhases = [];
    for (const phaseItem of phasesData) {
      const phaseDoc = await Phase.create({
        name: phaseItem.name,
        goal: phaseItem.goal,
        estimatedHours: phaseItem.estimatedHours,
        primarySkill: phaseItem.primarySkill,
        monthIndex: phaseItem.monthIndex,
        year: phaseItem.year,
        monthName: phaseItem.monthName,
      });
      insertedPhases.push({ ...phaseItem, dbId: phaseDoc._id });
    }
    console.log(`Successfully seeded ${insertedPhases.length} phases.`);

    console.log('Seeding baseline weekly tasks...');
    let totalTasksSeeded = 0;

    for (const phase of insertedPhases) {
      for (const week of phase.weeks) {
        // We create tasks for: Dev, DSA, English, Aptitude
        const weekTasks = [
          {
            title: `Dev: ${week.dev}`,
            description: `Focus area for the ${phase.name} phase in week ${week.weekNumber}.`,
            category: 'Development',
            deadline: new Date(phase.year, getMonthNumber(phase.monthName) - 1, week.weekNumber * 7),
            priority: 'P2',
            weekNumber: week.weekNumber,
            phaseId: phase.dbId,
            userId: demoUser._id,
            isCustom: false,
          },
          {
            title: week.dsa,
            description: `DSA tracking problem sets for week ${week.weekNumber}.`,
            category: 'DSA',
            deadline: new Date(phase.year, getMonthNumber(phase.monthName) - 1, week.weekNumber * 7),
            priority: 'P1',
            weekNumber: week.weekNumber,
            phaseId: phase.dbId,
            userId: demoUser._id,
            isCustom: false,
          },
          {
            title: week.english,
            description: `English verbal session and targeted exercises.`,
            category: 'English',
            deadline: new Date(phase.year, getMonthNumber(phase.monthName) - 1, week.weekNumber * 7),
            priority: 'P3',
            weekNumber: week.weekNumber,
            phaseId: phase.dbId,
            userId: demoUser._id,
            isCustom: false,
          },
          {
            title: week.aptitude,
            description: `Quantitative and analytical aptitude exercises.`,
            category: 'Aptitude',
            deadline: new Date(phase.year, getMonthNumber(phase.monthName) - 1, week.weekNumber * 7),
            priority: 'P2',
            weekNumber: week.weekNumber,
            phaseId: phase.dbId,
            userId: demoUser._id,
            isCustom: false,
          }
        ];

        // Seed them into the database
        await Task.insertMany(weekTasks);
        totalTasksSeeded += weekTasks.length;
      }
    }

    // All tasks remain Pending initially for clean start.

    console.log(`Successfully seeded ${totalTasksSeeded} weekly tasks.`);
    console.log('Seeding complete! Database ready.');
    
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

// Helper to get month index from name
const getMonthNumber = (monthName) => {
  const months = {
    January: 1, February: 2, March: 3, April: 4, May: 5, June: 6,
    July: 7, August: 8, September: 9, October: 10, November: 11, December: 12
  };
  return months[monthName];
};

if (require.main === module) {
  seedDatabase();
}

module.exports = seedDatabase;
