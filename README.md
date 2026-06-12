# TuitionHub

A web platform connecting guardians seeking tutors with qualified educators in Bangladesh. Guardians post tuition requirements, tutors browse and apply, and students get access to an AI-powered learning assistant. All rates are displayed in Bangladeshi Taka (৳).

---

## Team Members

| Name | Student ID |
|---|---|
| Irfanul Huda | 2020331060 |
| Zakaria Ahmed Jim | 2020331050 |
| Tanjima Rahman Farny | 2020331074 |

---

## Table of Contents

- [Features](#features)
- [Tech Stack](#tech-stack)
- [Live App](#live-app)
- [Usage](#usage)
- [API Endpoints](#api-endpoints)
- [License](#license)

---

## Features

### Guardian
- Create tuition posts with subject, budget, schedule, location, and teaching mode
- View and manage tutor applications — accept or reject with one click
- Dashboard to track all active posts and their application statuses

### Tutor
- Browse and filter tuition posts by subject, location, budget, and teaching mode
- Apply to posts with a cover letter and proposed rate
- Dashboard to monitor the status of all submitted applications

### Student
- Access an AI-powered learning assistant (chatbot) for studying and self-assessment
- Chatbot is exclusive to users registered with the Student role

### Admin
- View and manage all users and tuition posts on the platform
- Remove inappropriate posts or suspend users

### General
- Role-based authentication using JWT (Guardian, Tutor, Student, Admin)
- Real-time notifications via Socket.io (new applications, status updates)
- Responsive UI with smooth animated transitions
- Currency support for Bangladeshi Taka (৳)

---

## Tech Stack

**Frontend**
- React 18 (TypeScript)
- React Router v6
- Tailwind CSS
- Framer Motion
- Lucide React
- Socket.io Client

**Backend**
- Node.js + Express
- MongoDB + Mongoose
- JWT authentication
- Socket.io
- OpenAI API (for the student chatbot)

**Dev Tools**
- Vite
- Nodemon + Concurrently
- ESLint + TypeScript ESLint

---

## Live App

Click on the link below to get started with the app:

https://project350-tuition-finder.vercel.app/

---

## Usage

### Register / Login
- Create an account and select your role: **Guardian**, **Tutor**, or **Student**
- Log in to access role-specific features

### As a Guardian
1. Go to the Dashboard and click **Create Tuition Post**
2. Fill in subjects, budget, schedule, location, and preferred teaching mode
3. View incoming applications under **My Tuition Posts** and accept or reject tutors

### As a Tutor
1. Browse open posts on the **Tuition Posts** page
2. Use filters to narrow by subject, location, budget, or teaching mode
3. Click **Apply** on a post, write a cover letter, and set your proposed rate
4. Track all applications from the **Dashboard**

### As a Student
1. Log in and look for the chatbot widget in the bottom-right corner
2. Use the AI learning assistant to study topics or identify areas of weakness

### As an Admin
1. Log in with admin credentials
2. Access the admin panel to review and remove posts or users as needed

---

## API Endpoints

### Auth
| Method | Endpoint | Description |
|---|---|---|
| POST | `/api/auth/register` | Register a new user |
| POST | `/api/auth/login` | Log in and receive a JWT |

### Tuition Posts
| Method | Endpoint | Description |
|---|---|---|
| GET | `/api/tuition-posts` | Fetch all posts (supports filters) |
| POST | `/api/tuition-posts` | Create a new tuition post (Guardian) |
| GET | `/api/tuition-posts/my/posts` | Fetch the guardian's own posts |
| GET | `/api/tuition-posts/my/applications` | Fetch the tutor's submitted applications |
| POST | `/api/tuition-posts/:postId/apply` | Apply to a tuition post (Tutor) |
| PUT | `/api/tuition-posts/:postId/applications/:applicationId` | Accept or reject an application (Guardian) |

### Tutors
| Method | Endpoint | Description |
|---|---|---|
| GET | `/api/tutors` | Fetch all tutor profiles |
| GET | `/api/tutors/:id` | Fetch a specific tutor's profile |
| PUT | `/api/tutors/:id` | Update tutor profile |

---

## License

This project is licensed under the MIT License.
