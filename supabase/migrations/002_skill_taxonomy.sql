-- =====================================================
-- SKILL TAXONOMY - COMPREHENSIVE SKILLS DATABASE
-- =====================================================

-- Skill Taxonomy Table
CREATE TABLE IF NOT EXISTS skill_taxonomy (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  canonical_name TEXT UNIQUE NOT NULL,
  aliases TEXT[] DEFAULT '{}',
  category TEXT,
  is_hot_skill BOOLEAN DEFAULT FALSE
);

-- =====================================================
-- PROGRAMMING LANGUAGES
-- =====================================================
INSERT INTO skill_taxonomy (canonical_name, aliases, category, is_hot_skill) VALUES
('JavaScript', ARRAY['JS', 'ES6', 'ES2015', 'ECMAScript', 'Vanilla JS'], 'language', true),
('TypeScript', ARRAY['TS', 'TSX'], 'language', true),
('Python', ARRAY['Python3', 'Py', 'Python 3'], 'language', true),
('Java', ARRAY['Java8', 'Java11', 'Java17', 'JDK', 'J2EE'], 'language', true),
('C#', ARRAY['CSharp', 'C Sharp', '.NET C#'], 'language', true),
('C++', ARRAY['CPP', 'C Plus Plus'], 'language', true),
('C', ARRAY['C Language', 'ANSI C'], 'language', false),
('Go', ARRAY['Golang', 'Go Lang'], 'language', true),
('Rust', ARRAY['Rust Lang'], 'language', true),
('Ruby', ARRAY['Ruby Lang'], 'language', false),
('PHP', ARRAY['PHP7', 'PHP8'], 'language', false),
('Swift', ARRAY['Swift UI', 'iOS Swift'], 'language', true),
('Kotlin', ARRAY['Kotlin Android'], 'language', true),
('Scala', ARRAY['Scala Lang'], 'language', false),
('R', ARRAY['R Language', 'R Programming'], 'language', false),
('MATLAB', ARRAY['Matrix Laboratory'], 'language', false),
('Perl', ARRAY['Perl5', 'Perl6'], 'language', false),
('Dart', ARRAY['Dart Lang', 'Flutter Dart'], 'language', true),
('Elixir', ARRAY['Elixir Lang'], 'language', false),
('Haskell', ARRAY['Haskell Lang'], 'language', false),
('Lua', ARRAY['Lua Script'], 'language', false),
('Shell', ARRAY['Bash', 'Shell Script', 'Zsh', 'Fish'], 'language', false),
('PowerShell', ARRAY['PS', 'Windows PowerShell'], 'language', false),
('Solidity', ARRAY['Smart Contracts', 'Ethereum Solidity'], 'language', true);

-- =====================================================
-- FRONTEND FRAMEWORKS & LIBRARIES
-- =====================================================
INSERT INTO skill_taxonomy (canonical_name, aliases, category, is_hot_skill) VALUES
('React', ARRAY['ReactJS', 'React.js', 'React 18'], 'framework', true),
('Next.js', ARRAY['NextJS', 'Next', 'Next 14'], 'framework', true),
('Vue.js', ARRAY['Vue', 'VueJS', 'Vue 3'], 'framework', true),
('Nuxt.js', ARRAY['NuxtJS', 'Nuxt', 'Nuxt 3'], 'framework', true),
('Angular', ARRAY['AngularJS', 'Angular 17', 'Angular 16'], 'framework', true),
('Svelte', ARRAY['SvelteJS', 'Svelte Kit'], 'framework', true),
('SvelteKit', ARRAY['Svelte Kit', 'SK'], 'framework', true),
('Solid.js', ARRAY['SolidJS', 'Solid'], 'framework', false),
('Remix', ARRAY['Remix Run'], 'framework', true),
('Astro', ARRAY['Astro JS', 'AstroJS'], 'framework', true),
('jQuery', ARRAY['JQuery', 'jQuery UI'], 'framework', false),
('Bootstrap', ARRAY['Bootstrap 5', 'BS5', 'Twitter Bootstrap'], 'framework', false),
('Tailwind CSS', ARRAY['TailwindCSS', 'Tailwind'], 'framework', true),
('Material UI', ARRAY['MUI', 'Material-UI'], 'framework', true),
('Chakra UI', ARRAY['ChakraUI'], 'framework', false),
('Ant Design', ARRAY['AntD', 'Ant D'], 'framework', false),
('Shadcn UI', ARRAY['Shadcn', 'Shadcn/ui'], 'framework', true),
('Framer Motion', ARRAY['Framer', 'Motion'], 'framework', false),
('Three.js', ARRAY['ThreeJS', '3D Web'], 'framework', false),
('D3.js', ARRAY['D3', 'Data Driven Documents'], 'framework', false),
('Chart.js', ARRAY['ChartJS', 'Charts'], 'framework', false),
('HTMX', ARRAY['htmx'], 'framework', true),
('Alpine.js', ARRAY['AlpineJS', 'Alpine'], 'framework', false);

-- =====================================================
-- BACKEND FRAMEWORKS
-- =====================================================
INSERT INTO skill_taxonomy (canonical_name, aliases, category, is_hot_skill) VALUES
('Node.js', ARRAY['Node', 'NodeJS', 'Node 20'], 'runtime', true),
('Express.js', ARRAY['Express', 'ExpressJS'], 'framework', true),
('NestJS', ARRAY['Nest', 'Nest.js'], 'framework', true),
('Fastify', ARRAY['Fastify JS'], 'framework', false),
('Koa', ARRAY['Koa JS', 'KoaJS'], 'framework', false),
('Django', ARRAY['Django Python', 'Django REST'], 'framework', true),
('Flask', ARRAY['Flask Python'], 'framework', true),
('FastAPI', ARRAY['Fast API', 'Python FastAPI'], 'framework', true),
('Spring Boot', ARRAY['Spring', 'SpringBoot', 'Spring Framework'], 'framework', true),
('ASP.NET', ARRAY['ASP.NET Core', '.NET Core', 'Dotnet'], 'framework', true),
('Ruby on Rails', ARRAY['Rails', 'RoR'], 'framework', false),
('Laravel', ARRAY['Laravel PHP'], 'framework', false),
('Symfony', ARRAY['Symfony PHP'], 'framework', false),
('Gin', ARRAY['Gin Golang', 'Gin Go'], 'framework', false),
('Echo', ARRAY['Echo Go', 'Echo Golang'], 'framework', false),
('Fiber', ARRAY['Fiber Go', 'GoFiber'], 'framework', false),
('Phoenix', ARRAY['Phoenix Elixir'], 'framework', false),
('Actix', ARRAY['Actix Web', 'Actix Rust'], 'framework', false),
('Hono', ARRAY['Hono JS'], 'framework', true),
('Elysia', ARRAY['Elysia JS', 'Bun Elysia'], 'framework', false),
('tRPC', ARRAY['TRPC', 't RPC'], 'framework', true);

-- =====================================================
-- MOBILE DEVELOPMENT
-- =====================================================
INSERT INTO skill_taxonomy (canonical_name, aliases, category, is_hot_skill) VALUES
('React Native', ARRAY['RN', 'React Native CLI', 'Expo'], 'framework', true),
('Flutter', ARRAY['Flutter SDK', 'Flutter Dart'], 'framework', true),
('iOS Development', ARRAY['iOS', 'iPhone Development', 'iPad Development'], 'concept', true),
('Android Development', ARRAY['Android', 'Android SDK', 'Android Studio'], 'concept', true),
('SwiftUI', ARRAY['Swift UI', 'Apple SwiftUI'], 'framework', true),
('Jetpack Compose', ARRAY['Compose', 'Android Compose'], 'framework', true),
('Xamarin', ARRAY['Xamarin Forms'], 'framework', false),
('Ionic', ARRAY['Ionic Framework'], 'framework', false),
('Capacitor', ARRAY['Capacitor JS'], 'framework', false),
('Expo', ARRAY['Expo React Native', 'Expo SDK'], 'framework', true);

-- =====================================================
-- DATABASES
-- =====================================================
INSERT INTO skill_taxonomy (canonical_name, aliases, category, is_hot_skill) VALUES
('PostgreSQL', ARRAY['Postgres', 'PSQL', 'PG'], 'database', true),
('MySQL', ARRAY['MariaDB', 'MySQL 8'], 'database', true),
('MongoDB', ARRAY['Mongo', 'NoSQL MongoDB'], 'database', true),
('Redis', ARRAY['Redis Cache', 'Redis DB'], 'database', true),
('SQLite', ARRAY['SQLite3'], 'database', false),
('Microsoft SQL Server', ARRAY['MSSQL', 'SQL Server', 'T-SQL'], 'database', true),
('Oracle Database', ARRAY['Oracle DB', 'Oracle SQL', 'PL/SQL'], 'database', false),
('Cassandra', ARRAY['Apache Cassandra', 'CQL'], 'database', false),
('DynamoDB', ARRAY['AWS DynamoDB', 'Dynamo'], 'database', true),
('Firebase', ARRAY['Firebase Realtime DB', 'Firestore'], 'database', true),
('Supabase', ARRAY['Supabase DB'], 'database', true),
('CockroachDB', ARRAY['Cockroach DB', 'CRDB'], 'database', false),
('Elasticsearch', ARRAY['ES', 'Elastic', 'ELK'], 'database', true),
('Neo4j', ARRAY['Neo4j Graph', 'Graph Database'], 'database', false),
('InfluxDB', ARRAY['Influx', 'Time Series DB'], 'database', false),
('Prisma', ARRAY['Prisma ORM', 'PrismaJS'], 'tool', true),
('Drizzle ORM', ARRAY['Drizzle', 'DrizzleORM'], 'tool', true),
('TypeORM', ARRAY['Type ORM'], 'tool', false),
('Sequelize', ARRAY['Sequelize ORM'], 'tool', false),
('Mongoose', ARRAY['Mongoose ODM', 'MongoDB Mongoose'], 'tool', false);

-- =====================================================
-- CLOUD PLATFORMS
-- =====================================================
INSERT INTO skill_taxonomy (canonical_name, aliases, category, is_hot_skill) VALUES
('AWS', ARRAY['Amazon Web Services', 'Amazon AWS'], 'cloud', true),
('Azure', ARRAY['Microsoft Azure', 'Azure Cloud'], 'cloud', true),
('Google Cloud Platform', ARRAY['GCP', 'Google Cloud'], 'cloud', true),
('Vercel', ARRAY['Vercel Deploy', 'Zeit'], 'cloud', true),
('Netlify', ARRAY['Netlify Deploy'], 'cloud', true),
('Heroku', ARRAY['Heroku Cloud'], 'cloud', false),
('DigitalOcean', ARRAY['DO', 'Digital Ocean'], 'cloud', false),
('Cloudflare', ARRAY['CF', 'Cloudflare Workers'], 'cloud', true),
('Railway', ARRAY['Railway App'], 'cloud', true),
('Render', ARRAY['Render Cloud'], 'cloud', true),
('Fly.io', ARRAY['Fly', 'Flyio'], 'cloud', false),
('PlanetScale', ARRAY['Planet Scale'], 'cloud', true),
('Neon', ARRAY['Neon DB', 'Neon Postgres'], 'cloud', true),
('Upstash', ARRAY['Upstash Redis'], 'cloud', true);

-- =====================================================
-- AWS SERVICES
-- =====================================================
INSERT INTO skill_taxonomy (canonical_name, aliases, category, is_hot_skill) VALUES
('AWS EC2', ARRAY['EC2', 'Elastic Compute'], 'cloud', true),
('AWS S3', ARRAY['S3', 'Simple Storage Service'], 'cloud', true),
('AWS Lambda', ARRAY['Lambda', 'Serverless Lambda'], 'cloud', true),
('AWS RDS', ARRAY['RDS', 'Relational Database Service'], 'cloud', true),
('AWS DynamoDB', ARRAY['DynamoDB'], 'cloud', true),
('AWS CloudFront', ARRAY['CloudFront', 'CDN'], 'cloud', false),
('AWS SQS', ARRAY['SQS', 'Simple Queue Service'], 'cloud', false),
('AWS SNS', ARRAY['SNS', 'Simple Notification Service'], 'cloud', false),
('AWS ECS', ARRAY['ECS', 'Elastic Container Service'], 'cloud', false),
('AWS EKS', ARRAY['EKS', 'Elastic Kubernetes Service'], 'cloud', true),
('AWS Cognito', ARRAY['Cognito', 'AWS Auth'], 'cloud', false),
('AWS API Gateway', ARRAY['API Gateway'], 'cloud', false);

-- =====================================================
-- DEVOPS & TOOLS
-- =====================================================
INSERT INTO skill_taxonomy (canonical_name, aliases, category, is_hot_skill) VALUES
('Docker', ARRAY['Docker Container', 'Docker Compose', 'Containerization'], 'devops', true),
('Kubernetes', ARRAY['K8s', 'K8', 'Kube'], 'devops', true),
('Jenkins', ARRAY['Jenkins CI', 'Jenkins Pipeline'], 'devops', false),
('GitHub Actions', ARRAY['GH Actions', 'GitHub CI/CD'], 'devops', true),
('GitLab CI/CD', ARRAY['GitLab CI', 'GitLab Pipelines'], 'devops', true),
('CircleCI', ARRAY['Circle CI'], 'devops', false),
('Travis CI', ARRAY['TravisCI'], 'devops', false),
('Terraform', ARRAY['TF', 'HashiCorp Terraform', 'IaC'], 'devops', true),
('Ansible', ARRAY['Ansible Playbook'], 'devops', false),
('Pulumi', ARRAY['Pulumi IaC'], 'devops', false),
('Nginx', ARRAY['NGINX', 'Nginx Server'], 'devops', true),
('Apache', ARRAY['Apache Server', 'Apache HTTP'], 'devops', false),
('Prometheus', ARRAY['Prometheus Monitoring'], 'devops', false),
('Grafana', ARRAY['Grafana Dashboard'], 'devops', false),
('DataDog', ARRAY['Datadog Monitoring'], 'devops', false),
('New Relic', ARRAY['NewRelic'], 'devops', false),
('Sentry', ARRAY['Sentry Error Tracking'], 'devops', true),
('ArgoCD', ARRAY['Argo CD', 'GitOps'], 'devops', false),
('Helm', ARRAY['Helm Charts', 'Kubernetes Helm'], 'devops', false);

-- =====================================================
-- VERSION CONTROL & COLLABORATION
-- =====================================================
INSERT INTO skill_taxonomy (canonical_name, aliases, category, is_hot_skill) VALUES
('Git', ARRAY['Git VCS', 'Version Control'], 'tool', true),
('GitHub', ARRAY['GH', 'GitHub.com'], 'tool', true),
('GitLab', ARRAY['GL', 'GitLab.com'], 'tool', true),
('Bitbucket', ARRAY['BB', 'Atlassian Bitbucket'], 'tool', false),
('Jira', ARRAY['Atlassian Jira', 'Jira Software'], 'tool', true),
('Confluence', ARRAY['Atlassian Confluence'], 'tool', false),
('Notion', ARRAY['Notion App'], 'tool', true),
('Linear', ARRAY['Linear App'], 'tool', true),
('Slack', ARRAY['Slack App'], 'tool', true),
('Discord', ARRAY['Discord Bot'], 'tool', false);

-- =====================================================
-- TESTING
-- =====================================================
INSERT INTO skill_taxonomy (canonical_name, aliases, category, is_hot_skill) VALUES
('Jest', ARRAY['JestJS', 'Jest Testing'], 'tool', true),
('Vitest', ARRAY['Vite Test'], 'tool', true),
('Mocha', ARRAY['MochaJS'], 'tool', false),
('Chai', ARRAY['ChaiJS'], 'tool', false),
('Cypress', ARRAY['Cypress Testing', 'Cypress E2E'], 'tool', true),
('Playwright', ARRAY['Playwright Testing'], 'tool', true),
('Selenium', ARRAY['Selenium WebDriver'], 'tool', false),
('Puppeteer', ARRAY['Puppeteer Testing'], 'tool', false),
('Testing Library', ARRAY['React Testing Library', 'RTL'], 'tool', true),
('PyTest', ARRAY['Pytest', 'Python Testing'], 'tool', true),
('JUnit', ARRAY['JUnit 5', 'Java Testing'], 'tool', true),
('TestNG', ARRAY['Test NG'], 'tool', false),
('Postman', ARRAY['Postman API', 'API Testing'], 'tool', true),
('Insomnia', ARRAY['Insomnia API'], 'tool', false),
('K6', ARRAY['k6 Load Testing', 'Grafana K6'], 'tool', false),
('Storybook', ARRAY['Storybook UI'], 'tool', true);

-- =====================================================
-- AI & MACHINE LEARNING
-- =====================================================
INSERT INTO skill_taxonomy (canonical_name, aliases, category, is_hot_skill) VALUES
('Machine Learning', ARRAY['ML', 'Machine Learning Engineering'], 'concept', true),
('Deep Learning', ARRAY['DL', 'Neural Networks'], 'concept', true),
('TensorFlow', ARRAY['TF', 'TensorFlow 2'], 'framework', true),
('PyTorch', ARRAY['Torch', 'PyTorch Lightning'], 'framework', true),
('Keras', ARRAY['Keras API'], 'framework', false),
('Scikit-learn', ARRAY['sklearn', 'SK Learn'], 'framework', true),
('Pandas', ARRAY['Pandas Python', 'Data Pandas'], 'framework', true),
('NumPy', ARRAY['Numpy', 'Numerical Python'], 'framework', true),
('OpenCV', ARRAY['CV2', 'Computer Vision'], 'framework', false),
('NLTK', ARRAY['Natural Language Toolkit'], 'framework', false),
('spaCy', ARRAY['Spacy NLP'], 'framework', false),
('Hugging Face', ARRAY['HuggingFace', 'Transformers'], 'framework', true),
('LangChain', ARRAY['Lang Chain', 'LLM Chain'], 'framework', true),
('OpenAI API', ARRAY['GPT API', 'ChatGPT API'], 'tool', true),
('LLM', ARRAY['Large Language Model', 'LLMs'], 'concept', true),
('RAG', ARRAY['Retrieval Augmented Generation'], 'concept', true),
('Vector Database', ARRAY['Vector DB', 'Embeddings DB'], 'concept', true),
('Pinecone', ARRAY['Pinecone Vector'], 'tool', true),
('Weaviate', ARRAY['Weaviate Vector'], 'tool', false),
('Computer Vision', ARRAY['CV', 'Image Recognition'], 'concept', true),
('NLP', ARRAY['Natural Language Processing', 'Text Processing'], 'concept', true),
('MLOps', ARRAY['ML Operations', 'Machine Learning Ops'], 'concept', true),
('Jupyter', ARRAY['Jupyter Notebook', 'JupyterLab'], 'tool', true),
('Google Colab', ARRAY['Colab', 'Colaboratory'], 'tool', true);

-- =====================================================
-- DATA ENGINEERING
-- =====================================================
INSERT INTO skill_taxonomy (canonical_name, aliases, category, is_hot_skill) VALUES
('Apache Spark', ARRAY['Spark', 'PySpark'], 'tool', true),
('Apache Kafka', ARRAY['Kafka', 'Kafka Streams'], 'tool', true),
('Apache Airflow', ARRAY['Airflow', 'Data Pipeline'], 'tool', true),
('Apache Flink', ARRAY['Flink'], 'tool', false),
('Hadoop', ARRAY['Apache Hadoop', 'HDFS'], 'tool', false),
('Snowflake', ARRAY['Snowflake DB', 'Snowflake Cloud'], 'tool', true),
('Databricks', ARRAY['Databricks Platform'], 'tool', true),
('dbt', ARRAY['Data Build Tool', 'DBT'], 'tool', true),
('ETL', ARRAY['Extract Transform Load', 'Data ETL'], 'concept', true),
('Data Warehouse', ARRAY['DW', 'DWH', 'Data Warehousing'], 'concept', true),
('Data Lake', ARRAY['Data Lakes'], 'concept', false),
('BigQuery', ARRAY['Google BigQuery', 'GBQ'], 'tool', true),
('Redshift', ARRAY['AWS Redshift', 'Amazon Redshift'], 'tool', false);

-- =====================================================
-- SECURITY
-- =====================================================
INSERT INTO skill_taxonomy (canonical_name, aliases, category, is_hot_skill) VALUES
('OAuth', ARRAY['OAuth 2.0', 'OAuth2'], 'concept', true),
('JWT', ARRAY['JSON Web Token', 'JWT Auth'], 'concept', true),
('HTTPS', ARRAY['SSL', 'TLS', 'SSL/TLS'], 'concept', true),
('OWASP', ARRAY['OWASP Top 10', 'Web Security'], 'concept', true),
('Penetration Testing', ARRAY['Pen Testing', 'Ethical Hacking'], 'concept', false),
('Security Audit', ARRAY['Code Audit', 'Security Review'], 'concept', false),
('Encryption', ARRAY['AES', 'RSA', 'Cryptography'], 'concept', false),
('Auth0', ARRAY['Auth Zero'], 'tool', true),
('Clerk', ARRAY['Clerk Auth'], 'tool', true),
('NextAuth', ARRAY['NextAuth.js', 'Auth.js'], 'tool', true),
('Keycloak', ARRAY['KeyCloak'], 'tool', false),
('Firebase Auth', ARRAY['Firebase Authentication'], 'tool', true);

-- =====================================================
-- API & ARCHITECTURE
-- =====================================================
INSERT INTO skill_taxonomy (canonical_name, aliases, category, is_hot_skill) VALUES
('REST API', ARRAY['RESTful', 'REST', 'RESTful API'], 'concept', true),
('GraphQL', ARRAY['GQL', 'Graph QL'], 'concept', true),
('gRPC', ARRAY['GRPC', 'Google RPC'], 'concept', false),
('WebSocket', ARRAY['WS', 'WebSockets', 'Socket.io'], 'concept', true),
('Microservices', ARRAY['Micro Services', 'MSA'], 'concept', true),
('Serverless', ARRAY['FaaS', 'Function as a Service'], 'concept', true),
('Event-Driven Architecture', ARRAY['EDA', 'Event Driven'], 'concept', false),
('Domain-Driven Design', ARRAY['DDD'], 'concept', false),
('CQRS', ARRAY['Command Query Responsibility Segregation'], 'concept', false),
('Service Mesh', ARRAY['Istio', 'Linkerd'], 'concept', false),
('API Gateway', ARRAY['Kong', 'API Management'], 'concept', false),
('Message Queue', ARRAY['MQ', 'RabbitMQ', 'Message Broker'], 'concept', true),
('Webhook', ARRAY['Webhooks', 'HTTP Callbacks'], 'concept', true);

-- =====================================================
-- CONCEPTS & METHODOLOGIES
-- =====================================================
INSERT INTO skill_taxonomy (canonical_name, aliases, category, is_hot_skill) VALUES
('Agile', ARRAY['Agile Methodology', 'Agile Development'], 'concept', true),
('Scrum', ARRAY['Scrum Master', 'Scrum Framework'], 'concept', true),
('Kanban', ARRAY['Kanban Board'], 'concept', false),
('CI/CD', ARRAY['Continuous Integration', 'Continuous Deployment', 'DevOps CI CD'], 'concept', true),
('TDD', ARRAY['Test Driven Development', 'Test-Driven'], 'concept', true),
('BDD', ARRAY['Behavior Driven Development'], 'concept', false),
('Clean Code', ARRAY['Code Quality', 'Clean Architecture'], 'concept', true),
('Design Patterns', ARRAY['Software Patterns', 'GoF Patterns'], 'concept', true),
('SOLID Principles', ARRAY['SOLID', 'OOP Principles'], 'concept', true),
('OOP', ARRAY['Object Oriented Programming', 'Object-Oriented'], 'concept', true),
('Functional Programming', ARRAY['FP', 'Functional'], 'concept', false),
('Data Structures', ARRAY['DS', 'DSA'], 'concept', true),
('Algorithms', ARRAY['Algo', 'DSA'], 'concept', true),
('System Design', ARRAY['System Architecture', 'HLD', 'LLD'], 'concept', true),
('Code Review', ARRAY['PR Review', 'Peer Review'], 'concept', true),
('Documentation', ARRAY['Technical Writing', 'API Docs'], 'concept', true),
('Performance Optimization', ARRAY['Performance Tuning', 'Optimization'], 'concept', true),
('Debugging', ARRAY['Troubleshooting', 'Bug Fixing'], 'concept', true);

-- =====================================================
-- SOFT SKILLS
-- =====================================================
INSERT INTO skill_taxonomy (canonical_name, aliases, category, is_hot_skill) VALUES
('Communication', ARRAY['Verbal Communication', 'Written Communication'], 'soft_skill', true),
('Teamwork', ARRAY['Team Collaboration', 'Team Player'], 'soft_skill', true),
('Problem Solving', ARRAY['Analytical Thinking', 'Critical Thinking'], 'soft_skill', true),
('Leadership', ARRAY['Team Lead', 'Tech Lead'], 'soft_skill', true),
('Time Management', ARRAY['Prioritization', 'Deadline Management'], 'soft_skill', true),
('Mentoring', ARRAY['Coaching', 'Training'], 'soft_skill', false),
('Presentation', ARRAY['Public Speaking', 'Demo Skills'], 'soft_skill', false),
('Adaptability', ARRAY['Flexibility', 'Quick Learner'], 'soft_skill', true),
('Attention to Detail', ARRAY['Detail Oriented', 'Precision'], 'soft_skill', true),
('Project Management', ARRAY['PM', 'Project Planning'], 'soft_skill', true);

-- =====================================================
-- WEB3 & BLOCKCHAIN
-- =====================================================
INSERT INTO skill_taxonomy (canonical_name, aliases, category, is_hot_skill) VALUES
('Blockchain', ARRAY['Blockchain Development', 'Distributed Ledger'], 'concept', true),
('Ethereum', ARRAY['ETH', 'Ethereum Development'], 'tool', true),
('Smart Contracts', ARRAY['Solidity Contracts'], 'concept', true),
('Web3.js', ARRAY['Web3', 'Web3JS'], 'framework', false),
('Ethers.js', ARRAY['Ethers', 'EthersJS'], 'framework', false),
('Hardhat', ARRAY['Hardhat Ethereum'], 'tool', false),
('NFT', ARRAY['Non-Fungible Token', 'NFTs'], 'concept', false),
('DeFi', ARRAY['Decentralized Finance'], 'concept', false),
('IPFS', ARRAY['InterPlanetary File System'], 'tool', false);

-- =====================================================
-- GAME DEVELOPMENT
-- =====================================================
INSERT INTO skill_taxonomy (canonical_name, aliases, category, is_hot_skill) VALUES
('Unity', ARRAY['Unity3D', 'Unity Game Engine'], 'tool', true),
('Unreal Engine', ARRAY['UE4', 'UE5', 'Unreal'], 'tool', true),
('Godot', ARRAY['Godot Engine'], 'tool', false),
('Game Development', ARRAY['Game Dev', 'Gaming'], 'concept', false),
('AR/VR', ARRAY['Augmented Reality', 'Virtual Reality', 'XR'], 'concept', true),
('WebGL', ARRAY['Web GL', '3D Web'], 'concept', false);
