# Joe's PaintLab

## System Architecture Diagram

```
                        USER ACCESS PANEL
                              |
                    __________|__________
                   |                    |
                 ADMIN                 USER
                   |                    |
            _______|_______      _______|_______
           |               |    |               |
        SIGN UP         SIGN IN  SIGN UP     SIGN IN
           |               |    |               |
      REGISTRATION    LOG-IN   REGISTRATION LOG-IN
      PANEL           PANEL    PANEL         PANEL
           |_____________|      |_____________|
                   |                    |
          ADMIN DASHBOARD         HOME PAGE
          (VIEW USERS)                 |
                            ___________|___________
                           |           |           |
                      COLOR DATABASE  MIXING      MATERIAL
                      (BROWSE/SEARCH) FORMULAS   CALCULATOR
                           |           |           |
                           |___________|___________|
                                   |
                        PROJECT HISTORY &
                        SAVED COLORS
                                   |
                        COST ESTIMATION
                        & REPORTS
```

## Figure 1. Conceptual Framework

Figure 1 shows the user control panel flowchart for Joe's PaintLab. The system allows users to perform several functions based on their role. The admin can either sign up or sign in, leading them to the registration panel or log-in panel. After completing either step, the admin is directed to the Admin Dashboard, where their access is limited only to viewing the list of registered users. No other user data or system features are available to the admin.

On the user side, users can sign up to register or sign in to access their account. After signing in, they are redirected to the home page where they can access the color database to browse and search for paint colors, view mixing formulas with detailed component ratios and instructions, and use the material calculator to determine quantities needed for their projects. Users can also view their project history and saved colors for future reference, access cost estimation and reports for their projects, and log out once they are done using the system.

## 1.1 Background of the System

The Philippine paint industry, dominated by well-established local brands such as Boysen, Davis, and Rain or Shine, represents a significant sector in the country's construction and home improvement market. Despite the industry's growth and diverse color options available, a substantial knowledge gap persists between experienced painting professionals and beginners. Traditional paint mixing relies heavily on apprenticeship models and experiential learning, creating barriers for new painters, DIY enthusiasts, and vocational students without access to expert guidance.

The digital transformation across industries has largely bypassed practical trade skills, particularly paint color formulation and mixing. Beginners struggle with understanding color theory, calculating precise mixing ratios, determining material requirements, and estimating project costs. These challenges result in material wastage, financial losses, and prolonged learning periods that discourage potential entrants from pursuing painting professionally.

Joe's PaintLab addresses these challenges by leveraging modern web development frameworks to democratize access to professional paint mixing knowledge. By digitalizing color selection and formula calculation processes tailored for the Philippine market, the application serves as both an educational platform and practical tool, bridging the gap between theory and real-world painting application.

## 1.1.1 Rationale

This study addresses the growing need for digital tools that simplify paint color formulation and mixing. Manual tracking methods are prone to errors and inefficiency, and with diverse paint brands and color options in the Philippine market, calculating precise mixing ratios has become increasingly complex. Joe's PaintLab provides an organized, automated way to calculate paint formulas, determine material requirements, and estimate project costs. By reducing material wastage and promoting better painting practices, this system supports users in mastering paint mixing techniques accurately and conveniently.

## 1.1.2 Significance of the Study

**DIY Enthusiasts and Homeowners.** Joe's PaintLab enables confident project execution by providing accurate color formulas and material calculations. Users can access professional paint mixing knowledge, calculate exact quantities, and estimate costs, reducing wastage and ensuring successful completion.

**Vocational Students.** The platform serves as an interactive learning tool for mastering paint color theory and formulation techniques. Students can practice calculations, understand mixing principles, and build competency in paint preparation, supporting career readiness.

**Professional Painters.** Streamlined workflows and consistent color formulations improve efficiency. Painters can quickly calculate mixing ratios, maintain custom formula records, and estimate material costs accurately, reducing project timelines.

**Construction Companies.** Standardized paint specifications across projects ensure quality consistency and efficient material procurement. This reduces rework from color mismatches and optimizes project budgets.

**Paint Retailers and Suppliers.** Value-added services through professional color consultation and formula calculations enhance customer satisfaction, build brand loyalty, and position retailers as knowledgeable partners.

## 1.2 Statement of the Problem

1. Beginners and DIY enthusiasts lack access to professional paint mixing knowledge and struggle to calculate precise mixing ratios, resulting in material wastage, color inconsistencies, and failed projects. Traditional apprenticeship-based learning creates barriers for those without direct access to experienced painters.

2. Users face challenges understanding color theory principles and determining accurate material requirements. Without proper guidance, costly mistakes in paint selection and quantity estimation lead to financial losses and project delays.

3. The absence of a centralized digital tool for paint formula calculation and cost estimation makes it difficult to maintain consistency across projects, compare paint options, and make informed procurement decisions.

## 1.3 Objectives of the Study

**General Objective:**

To design, develop, and implement a comprehensive web-based application that simplifies paint color selection, mixing formula generation, and project calculation processes specifically for local Philippine paint brands, thereby accelerating skill development and improving outcomes for beginners in paint mixing and application.

**Specific Objectives:**

1. To create and implement a comprehensive digital color database containing official color palettes, specifications, and coding systems from Boysen, Davis, and Rain or Shine paint brands.

2. To develop and integrate precise mixing formulas with exact component percentages, step-by-step mixing instructions, and brand-specific application guidelines for each available color.

3. To design and implement automated calculation systems for material quantity requirements based on surface specifications and accurate cost estimation using current market pricing data.

4. To create an intuitive, mobile-responsive user interface that simplifies complex color theory concepts through visual guides, progressive information disclosure, and context-sensitive help features.

5. To establish a robust user management system with personalized profile capabilities, including color saving functionality, project history tracking, and preference-based recommendations.

## 1.4 Scope and Delimitations

The Joe's PaintLab application encompasses a comprehensive digital color database containing official colors from Boysen, Davis, and Rain or Shine, including color codes, HEX values, categories, and brand-specific information. The system integrates precise mixing formulas with exact component ratios, measurement specifications, mixing sequences, and application tips for each available color. A real-time calculation engine computes material requirements based on surface area, material type, and paint characteristics, with integrated cost estimation. The application includes complete user registration, authentication, profile management, and color saving capabilities with cloud synchronization. Brand-specific terminology, application methods, and technical specifications are tailored to each supported local paint brand. Additionally, the system features a fully responsive design ensuring optimal functionality across desktop, tablet, and mobile devices.

The initial release focuses exclusively on three major local paint brands: Boysen, Davis, and Rain or Shine, excluding international brands and smaller local manufacturers. The application covers primarily architectural paint types including enamel, latex, and acrylic-based paints, excluding specialized industrial coatings and automotive paints. The system utilizes predefined color palettes and does not include image-based color matching or custom color creation capabilities in the initial version. The target user base ranges from complete beginners to intermediate-level painters, excluding advanced professional features requiring extensive technical knowledge. The application is optimized for the Philippine market with pricing in Philippine Pesos and terminology familiar to local users.

## 1.5 Review of Related Literature and Studies

Rodriguez (2023) demonstrated that digital tools in trade skill education significantly improve learning efficiency and knowledge retention. His study of vocational training programs showed that applications providing step-by-step guidance reduced skill acquisition time by 45% compared to traditional methods, emphasizing the importance of contextualized learning materials reflecting local industry practices and terminology, principles directly applied in Joe's PaintLab's brand-specific approach.

Garcia and Santos (2022) conducted comprehensive research on mobile applications for vocational skills, demonstrating that well-designed digital tools reduced material wastage by 40% and improved first-attempt success rates among trade students by 65%. Their findings highlighted the critical importance of intuitive user interfaces that minimize cognitive load while providing access to complex technical information, a design philosophy central to Joe's PaintLab's development.

Thompson (2023) explored effective methods for teaching color theory to non-design professionals, finding that practical applications coupled with theoretical foundations produced the most significant learning outcomes. The research revealed that beginners showed 72% better color selection accuracy when using guided digital tools compared to traditional color wheel instruction alone, validating Joe's PaintLab's approach to color education.

The Philippine Paint Manufacturers Association (2023) published updated industry standards for paint manufacturing and color coding, establishing consistent specifications across local brands. These standards provided the foundational technical data necessary for developing accurate digital representations of paint mixing formulas and application guidelines in Joe's PaintLab.

Tan (2023) conducted extensive research on user interface design principles for technical applications used by non-expert users. The study established that interfaces employing progressive disclosure of information, contextual help features, and consistent navigation patterns significantly improved user confidence and task completion rates. These principles directly informed the interface design decisions in Joe's PaintLab development.

## 1.6 Theoretical Framework

### 1.6.1 Theoretical Framework

This study employs a dual-theory approach to provide a comprehensive explanation for both the adoption of Joe's PaintLab and its subsequent impact on user behavior and skill development. This framework is anchored by the widely recognized Technology Acceptance Model (TAM), which addresses the dynamics of initial user acceptance, and principles drawn from Cognitive Load Theory and Constructivist Learning Theory, which account for effective knowledge transfer and skill acquisition in paint mixing.

The first pillar of the framework is the Technology Acceptance Model (TAM), a seminal model in Information Systems research. TAM posits that an individual's intention to use a new technology is primarily determined by two core beliefs: Perceived Usefulness (PU) and Perceived Ease of Use (PEOU). This intention is then a strong precursor to actual system usage. Joe's PaintLab is designed to maximize these constructs. Perceived Usefulness is achieved by offering clear, concrete benefits such as enabling users to efficiently access professional paint mixing knowledge, calculate precise mixing ratios, determine accurate material requirements, and generate cost estimations. Perceived Ease of Use is ensured through streamlined design, including intuitive sign-up/sign-in flows, easily accessible color databases, and simplified calculation interfaces. The relevance of these two constructs in predicting adoption has been empirically validated specifically within educational and vocational training contexts.

The second pillar is based on Cognitive Load Theory and Constructivist Learning Theory, addressing how the system facilitates effective learning and skill development once adopted. Cognitive Load Theory recognizes that learners have limited working memory capacity and that instructional design should minimize extraneous cognitive load while optimizing germane load. Joe's PaintLab applies this principle through progressive information disclosure, visual guides, and step-by-step mixing instructions that break complex paint formulation concepts into manageable components. Constructivist Learning Theory emphasizes that learners actively construct knowledge through experience and interaction with tools and materials. The system supports this by providing hands-on calculation experiences, interactive formula exploration, and project-based learning opportunities where users apply theoretical knowledge to real-world painting scenarios.

The integration of TAM and Learning Theories provides a powerful, holistic lens for this study. TAM acts as the necessary foundation, guiding the initial system design to maximize user adoption through high usefulness and minimal effort. Learning Theories then serve as the mechanism for educational impact, guiding feature-level interventions that reliably move users toward measurably better outcomes in paint mixing competency and project success. In combination, these complementary theoretical frameworks not only inform the architecture and design of Joe's PaintLab but also establish comprehensive measurement criteria for evaluating its success, covering both adoption metrics (user registration, retention, engagement) and learning outcomes (skill acquisition, project success rates, material efficiency improvements).

## 1.7 Definition of Terms

**Application Development** – The process of designing, coding, testing, and deploying a software program, such as the Joe's PaintLab system.

**System** – A group of interacting or interrelated elements that act according to a set of rules to form a unified whole. A system, surrounded and influenced by its environment, is described by its boundaries, structure and purpose and is expressed in its functioning.

**Color Database** – A structured collection of official paint colors from Boysen, Davis, and Rain or Shine, including color codes, HEX values, categories, and brand-specific information organized for easy retrieval and search.

**Mixing Formula** – A precise specification containing exact component ratios, measurement specifications, mixing sequences, and application tips for creating a specific paint color.

**Material Calculator** – A computational tool that determines the quantity of paint and materials required based on surface area, material type, and paint characteristics.

**Cost Estimation** – The process of calculating the total project cost based on material quantities, current market pricing, and labor considerations.

**Perceived Usefulness (PU)** – The degree to which a user believes that using the system will enhance their paint mixing knowledge and efficiency in completing painting projects.

**Perceived Ease of Use (PEOU)** – The degree to which a user believes that using the system will be free of effort and easy to operate.

**Database** – A structured place where data is stored, organized, and managed so it can be easily accessed and updated. It holds information in tables, rows, and columns, similar to a spreadsheet but more powerful and secure.

**DBMS (Database Management System)** – The software used to create, store, manage, and interact with a database. It helps users add data, edit data, delete data, and run queries (e.g., MySQL, PostgreSQL, SQLite, Oracle Database, SQL Server).

**User Profile** – A personalized account containing user information, saved colors, project history, preferences, and custom formula records.

**Project History** – A record of all past painting projects including color selections, formulas used, materials purchased, and project outcomes.

**Brand Integration** – The incorporation of brand-specific terminology, application methods, and technical specifications tailored to each supported local paint brand.

**Responsive Design** – A design approach that ensures optimal functionality and user experience across desktop, tablet, and mobile devices.

---

# CHAPTER II: METHODOLOGY AND SYSTEM DESIGN

## 2.1 Methodology

The method employed in creating this system followed the Waterfall SDLC Model as shown in Figure 2.

### Figure 2. Waterfall Model

```
        PLANNING
           |
           v
  REQUIREMENT ANALYSIS
           |
           v
     SYSTEM DESIGN
           |
           v
   IMPLEMENTATION
           |
           v
       TESTING
           |
           v
     DEPLOYMENT
           |
           v
     MAINTENANCE
```

Figure 2 shows the Waterfall Model is a basic software development life cycle model. The researcher uses this as a guide to ensure the software is produced with the lowest cost and highest possible quality in the shortest amount of time. Characterized by a strict, linear progression through distinct phases: Planning, Requirements Analysis, System Design, Implementation (coding), Testing (verification), Deployment, and continuous Maintenance. This sequential structure mandates that each stage must be fully completed and documented before work can proceed to the next, which is a key principle for maximizing project control and traceability.

### Planning

This system was developed to assist users in efficiently managing paint color selection, mixing formula generation, and project calculations by accessing a comprehensive color database, viewing precise mixing formulas, calculating material requirements, and generating cost estimations. The development team adopted a Waterfall SDLC development methodology. The researcher utilized React for the frontend interface, Node.js with Express for backend logic, and PostgreSQL for the primary database management.

### Requirement Analysis

Visual Studio Code and React will be essential for developing the system, which stores critical paint data in separate, normalized tables (e.g., Colors, Formulas, Projects, Users) rather than putting all the data in one big storeroom. This enables developers to create reliable, accurate, and scalable database applications. The system requires internet access for data synchronization, user authentication, and fetching paint brand specifications. The system's front-end interface will be developed using React with HTML5 and CSS3, while the backend will utilize Node.js with Express for API management and business logic processing.

### Design

After defining the system's functional requirements for paint color management and formula calculation, the main user interface was designed. This includes a secure login module with role-based access control, a Home Dashboard to display available colors and saved projects, a Color Database Section to browse and search paint colors, a Mixing Formula Section to view detailed component ratios and instructions, and a Material Calculator to compute project requirements. The researcher defined the structure for project records and implemented modules for saving colors and tracking project history. Visual Studio Code was used for structuring the project and PostgreSQL was selected for defining the schema of the relational tables.

### Implementation

In this stage, the development team uses the design blueprints to write the required code. The core logic, including CRUD operations for colors and projects, real-time mixing formula calculations, material quantity computations, and cost estimation algorithms, is coded in React for the frontend and Node.js/Express for the backend. This code is executed and managed within the Visual Studio Code environment, utilizing database connectors to link securely to PostgreSQL to build all functional modules that process paint data and user information.

### Testing

The complete system undergoes thorough testing, including unit testing of all calculation methods (mixing ratios, material quantities, cost estimates) and full system verification. Key tests ensure the accuracy of color database retrieval, the integrity of formula data stored in the database, the reliability of project saving functionality, and the correctness of all computational modules. This confirms all developed features align with the original user requirements specified in the analysis phase.

### Deployment

Upon successful completion of all testing phases and final user acceptance, Joe's PaintLab will be packaged and deployed within the target user environment (cloud server or local installation), making the application available and operational for paint color management and project planning.

### Maintenance

In this stage, the system will be kept in good working condition. Quarterly evaluations will check if enhancements are needed with new features (such as advanced reporting or additional paint brands) and remove any bugs that appear after deployment. This ensures long-term system accuracy and stability. The system's underlying technologies (React, Node.js, PostgreSQL) could be updated or changed during this phase if necessary to maintain current technology standards and security protocols.
### Maintenance

In this stage, the system will be kept in good working condition. Quarterly evaluations will check if enhancements are needed with new features (such as advanced reporting or additional paint brands) and remove any bugs that appear after deployment. This ensures long-term system accuracy and stability. The system's underlying technologies (React, Node.js, PostgreSQL) could be updated or changed during this phase if necessary to maintain current technology standards and security protocols.

## 2.2 Technical System Architecture

Joe's PaintLab employs a modern three-tier architecture that separates concerns while ensuring scalability and maintainability.

**Presentation Layer (User Interface)** – This is what the user sees and interacts with. It includes pages for login, dashboard, color database, mixing formulas, material calculator, project history, and profile management. Users can easily navigate and manage their paint projects through this interface. Technology includes React.js with functional components and hooks, CSS3 for responsive design, and React Router for single-page application navigation.

**Application Layer (Backend Logic)** – This layer handles all the processing and rules of the system. It calculates material requirements, manages mixing formulas, processes project data, and handles user authentication. This layer is developed using Node.js with Express, which controls how the system works and manages API endpoints for data retrieval and processing.

**Data Layer (Database)** – This layer stores all user information, color specifications, mixing formulas, project history, and calculation records. The system uses PostgreSQL as the database, which keeps data organized and secure with normalized table structures for efficient querying and data integrity.

The layers communicate with each other to ensure data is accurate and the system runs smoothly. For example, when a user selects a paint color and calculates material requirements, the backend retrieves the formula data from the database, performs calculations, and displays the updated results on the dashboard.


## 2.2.1 System Environment (Hardware and Software Requirements)

**Hardware Requirements:**

The system requires a PC or laptop with at least 4GB of RAM and 250-500GB of storage to ensure smooth performance and enough space for the color database and project files. It should have an Intel i3 processor or higher to handle the application efficiently. Internet connection is required for user authentication, data synchronization, and accessing paint brand specifications, enabling the system to provide real-time updates and cloud-based features.

**Software Requirements:**

The system is built using React, a modern JavaScript library that is efficient and good for creating interactive user interfaces. For the backend framework, Node.js with Express is used to handle server-side logic and API management, providing a robust foundation for processing paint calculations and managing user data. The database is PostgreSQL, which stores all the system's data in a structured and reliable way with support for complex queries and data integrity. Visual Studio Code is the recommended IDE, providing a place to write and manage the code. The system also uses JavaScript libraries like Axios for API communication, React Router for navigation, and specialized libraries for color calculations and material estimation, making it easier for users to interact with the system and perform paint mixing calculations accurately.


## 2.3 Database Tables

### Table 1. User's Profile Table

| Column Name | Username | Email Address | First Name | Last Name |
|---|---|---|---|---|
| Data Type | Varchar(255) | Varchar(255) | Varchar(255) | Varchar(255) |

In this table, the user's profile database table shows the specific data type of every column name. In column name: Username, Email Address, First Name, and Last Name shows the "varchar(255)" data type, that stores strings or characters up to 255 bytes.

### Table 2. Admin's Profile Table

| Column Name | Username | Email Address | First Name | Last Name |
|---|---|---|---|---|
| Data Type | Varchar(255) | Varchar(255) | Varchar(255) | Varchar(255) |

In Table 2, which is the database table of Admin's Profile, it also specifies its column name and data type. In column name: Username, Email Address, First Name, and Last Name shows the "varchar(255)" data type, that stores strings or characters up to 255 bytes.

### Table 3. Color Database Table

| Column Name | Color Code | Color Name | Brand | HEX Value | Category |
|---|---|---|---|---|---|
| Data Type | Varchar(255) | Varchar(255) | Varchar(255) | Varchar(255) | Varchar(255) |

In Table 3, which represents the database table for Color Database, the columns and their corresponding data types are shown. The columns Color Code, Color Name, Brand, HEX Value, and Category use the varchar(255) data type, which stores text or character values up to 255 characters. This allows each field to save descriptive information such as the official color code, color name, paint brand, hexadecimal color value, and color category.

### Table 4. Mixing Formula Table

| Column Name | Formula ID | Color Code | Component 1 | Component 2 | Ratio | Instructions |
|---|---|---|---|---|---|---|
| Data Type | Int | Varchar(255) | Varchar(255) | Varchar(255) | Varchar(255) | Text |

In Table 4, the Mixing Formula Table lists its columns and data types. The Formula ID uses int to store unique identifiers. Color Code, Component 1, Component 2, and Ratio use varchar(255) to store text values such as component names and mixing ratios. Instructions uses Text data type to store detailed step-by-step mixing instructions. This table keeps precise mixing formulas for each paint color.

### Table 5. Project History Table

| Column Name | Project ID | Username | Color Code | Material Quantity | Cost | Date Created |
|---|---|---|---|---|---|---|
| Data Type | Int | Varchar(255) | Varchar(255) | Int | Int | Varchar(255) |

In Table 5, the Project History Table specifies its column names and data types. Project ID uses int to store unique project identifiers. Username and Color Code use varchar(255) to store text values. Material Quantity and Cost use int data type to store numeric values. Date Created uses varchar(255) to store the project creation date. This table maintains a record of all user painting projects and calculations.

### Table 6. User Projects Table

| Column Name | Project Title | Username | Surface Area | Paint Type | Total Cost | Status |
|---|---|---|---|---|---|---|
| Data Type | Varchar(255) | Varchar(255) | Int | Varchar(255) | Int | Varchar(255) |

In Table 6, the User Projects Table specifies its column names and data types. Project Title, Username, and Paint Type use varchar(255) data type to store text values. Surface Area and Total Cost use int data type to store numeric values. Status uses varchar(255) to store project status such as "In Progress" or "Completed". This table stores detailed information about each user's painting projects.


## 2.4 Brand Selection Component

The Brand Selection component is a critical user interface module that guides users through a structured paint selection process. This component allows users to specify their painting project requirements before accessing color mixing formulas and material calculations.

**Component Features:**

The component implements a multi-step selection process with four key dropdown fields:

1. **Surface Selection** – Users choose the material they want to paint (Wood, Metal, Concrete, Drywall, or Masonry). This is the primary selection that determines available options for subsequent fields.

2. **Sub-material Selection** – Based on the selected surface, users choose a specific material type. For example, if Wood is selected, users can choose from Pine, Oak, Maple, Cedar, Plywood, MDF, Teak, or Mahogany. This field dynamically populates based on the surface selection.

3. **Brand Selection** – Users select a paint brand (Boysen, Davis, or Rain or Shine) appropriate for their chosen surface. The available brands are dynamically filtered based on the surface selection, ensuring users only see relevant options.

4. **Paint Type Selection** – Users specify the paint type (Latex, Enamel, Acrylic, Oil-based, or Epoxy) that best suits their project requirements.

**Data Persistence:**

The component integrates with Firebase Firestore to automatically save user selections. When a user makes a selection, the data is persisted to the database with the following information: surface type, sub-material, paint type, selected brand, user ID, email, and timestamp. On component load, previously saved selections are retrieved and restored, allowing users to continue where they left off.

**Validation and Navigation:**

The component includes validation logic that prevents users from proceeding to the color mixing stage until all four fields are completed. A "Go to Color Mixing" button is disabled until all required selections are made, with a helpful validation message guiding users to complete their selections. Once all selections are valid, users can navigate to the mixing formulas tab.

**User Experience:**

The component displays a selection summary showing all current choices, helping users verify their selections before proceeding. Error handling is implemented to catch and display any Firebase-related issues, ensuring users are informed of any data persistence problems.

