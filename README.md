# Project_350_Tuition_Hub
This is our Github repo for Project 350.
<h1>Project Name:</h1> 
<h3>Tuition_Hub</h3>
<h1>Team Members:</h1>
<h3>1.Zakaria Ahmed Jim(2020331050)</h3>
<h3>2.Irfanul Huda(2020331060)</h3>
<h3>3.Tanjima Rahman Farny(2020331074)</h3>

<h1>Tuition_Hub</h1>
TuitionHub is a web platform connecting guardians seeking tutors with qualified educators. Guardians can create tuition posts, while tutors can browse and apply for opportunities. The platform supports filtering, application management, and user dashboards, with all transactions displayed in Bangladeshi Taka (৳).<br>
<h1>Table of Contents</h1><br>

Features<br>
Technologies Used<br>
Installation<br>
Usage<br>
API Endpoints<br>

<h1>Features</h1><br>


Guardian Features:<br>
Create and manage tuition posts with details like subjects, budget, and schedule.<br>
View and manage tutor applications (accept/reject).<br>
Dashboard to track active posts and application statuses.<br>


Tutor Features:<br>
Browse and filter tuition posts by subject, location, budget, and teaching mode.<br>
Apply to posts with a cover letter and proposed rate.<br>
Dashboard to monitor application statuses<br>

Student Features:<br>
Can use ChatBot to study and analyse weakness.<br>

Admin Features:<br>
Can remove posts or users.<br>

General Features:<br>
User authentication (login, logout, role-based access).<br>
Responsive UI with animated transitions.<br>
Real-time data fetching and error handling.<br>
Currency support for Bangladeshi Taka (৳).<br>



<h1>Technologies Used</h1><br>

Frontend:<br>
React (TypeScript)<br>
React Router for navigation<br>
Framer Motion for animations<br>
Lucide React for icons<br>
Tailwind CSS for styling<br>


Backend: <br>
Node.js with Express<br>
MongoDB for data storage<br>
JWT for authentication<br>


Other:<br>
Axios for API requests<br>
Vite (assumed for development server)<br>



<h1>Installation</h1><br>
Follow these steps to set up the project locally.<br>
Prerequisites
<br>
Node.js (v18 or higher)<br>
npm or Yarn<br>
MongoDB (local or Atlas)<br>
Backend API server running (see API Endpoints)
<br>
Steps<br>

Clone the repository:<br>
git clone <link><br>
cd tuitionhub<br>


Install dependencies:<br>
npm install<br>


Set up environment variables:Create a .env file in the root directory and add:<br>
VITE_API_URL=http://localhost:5000<br>
<br>
Adjust VITE_API_URL to match your backend API URL.<br>
<br>
Run the backend server:Ensure the backend server is running (refer to your backend documentation). The default API URL is http://localhost:5000.<br>
<br>
Start the development server:<br>
npm run dev<br>

The app will be available at http://localhost:5173 (or the port specified by Vite).<br>


Usage<br>

Register or log in:<br>
Create an account as a guardian, tutor, or student.<br>
Log in to access role-specific features.<br>


Guardians:<br>
Navigate to the dashboard to create a new tuition post.<br>
View applications under "My Tuition Posts" and accept/reject tutors.<br>


Tutors:<br>
Go to the "Tuition Posts" page to browse opportunities.<br>
Apply to posts with a cover letter and proposed rate.<br>
Track applications in the dashboard.<br>


Admins (if implemented):<br>
Access the platform overview to manage users and posts.<br>



<h1>API Endpoints</h1><br>
The frontend interacts with the following API endpoints (assumed based on the code):<br>
<br>
GET /api/tuition-posts: Fetch all tuition posts with filters.<br>
GET /api/tuition-posts/my/posts: Fetch posts created by the guardian.<br>
GET /api/tuition-posts/my/applications: Fetch applications submitted by the tutor.<br>
POST /api/tuition-posts/:postId/apply: Submit an application to a post.<br>
PUT /api/tuition-posts/:postId/applications/:applicationId: Update application status (accept/reject).<br>
<br>


<h1>Guidelines</h1><br>

Follow the existing code style (Prettier, ESLint if configured).
Write clear, concise commit messages.
Test your changes locally before submitting.
Ensure no sensitive data is committed (e.g., .env files).

<h1>License</h1><br>
This project is licensed under the MIT License. See the LICENSE file for details.
