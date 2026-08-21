# CampaignPro 📧

**CampaignPro** is a full-stack email marketing platform that enables organizations and marketers to create, manage, personalize, send, and monitor bulk email campaigns efficiently.

The application provides a complete email marketing workflow — from contact management and reusable email templates to campaign scheduling, email delivery, engagement tracking, and analytics.

## 🚀 Live Demo

**Frontend:**
https://guvi-final-project.vercel.app

**Backend API / Swagger:**
https://guvi-final-project.onrender.com/swagger-ui/index.html

---

## ✨ Features

### 🔐 User Management

* User registration and login
* Secure authentication and authorization
* Role-based access control
* User profile management
* Admin user management
* Secure application access using Spring Security

### 👥 Contact Management

* Create, update, and delete contacts
* Search and manage contacts
* Organize contacts into groups/categories
* Maintain a centralized contact database
* Select targeted audiences for campaigns

### 📝 Email Template Management

* Create reusable email templates
* Rich-text email content
* Personalized placeholders
* Preview templates before sending
* Edit and manage existing templates
* Reuse templates across multiple campaigns

### 📢 Campaign Management

* Create and manage email campaigns
* Select contacts or contact groups
* Associate campaigns with email templates
* Save campaigns as drafts
* Edit campaigns before sending
* Send campaigns immediately
* Schedule campaigns for future delivery
* Maintain campaign history

### 📬 Email Delivery

* Bulk email delivery through an external email service provider
* Personalized email content
* Delivery status tracking
* Retry mechanism for temporary delivery failures

### 📊 Campaign Tracking

Track recipient engagement, including:

* Email delivery status
* Email opens
* Link clicks
* Recipient engagement

### 📈 Analytics Dashboard

Monitor campaign performance through:

* Total emails sent
* Delivery rate
* Open rate
* Click rate
* Campaign-wise performance
* Overall campaign statistics

### 🛠️ Admin Dashboard

Administrators can:

* Manage users
* Monitor campaigns
* Review system activity
* View overall analytics
* Monitor platform usage

---

## 🏗️ Application Architecture

```text
                    ┌─────────────────────┐
                    │      React UI       │
                    │ TypeScript + Redux  │
                    │     TailwindCSS     │
                    └──────────┬──────────┘
                               │
                            REST API
                               │
                               ▼
                    ┌─────────────────────┐
                    │    Spring Boot     │
                    │      REST API      │
                    │ Spring Security    │
                    │       JPA          │
                    └──────────┬──────────┘
                               │
                               ▼
                    ┌─────────────────────┐
                    │     PostgreSQL     │
                    │      Database      │
                    └─────────────────────┘
                               │
                               │
                    ┌──────────▼──────────┐
                    │   Email Provider    │
                    │   SMTP / Brevo      │
                    └─────────────────────┘
```

---

## 🛠️ Tech Stack

### Frontend

* **React**
* **TypeScript**
* **Redux Toolkit**
* **Tailwind CSS**

### Backend

* **Java**
* **Spring Boot**
* **Spring Data JPA**
* **REST APIs**
* **Spring Security**

### Database

* **PostgreSQL**

### Email

* **SMTP / Brevo**

### Deployment

* **Frontend:** Vercel
* **Backend:** Render
* **Database:** PostgreSQL on Render

---

## 🔒 Security

CampaignPro uses Spring Security to provide:

* Secure user authentication
* Role-based authorization
* Protected REST APIs
* User-specific access to application resources
* Secure password handling
* JWT-based authentication

> Sensitive credentials such as database passwords, JWT secrets, SMTP credentials, and API keys are managed through environment variables and should never be committed to the repository.

---

## 🔄 Application Workflow

```text
Register / Login
       │
       ▼
   Dashboard
       │
       ├── Manage Contacts
       │
       ├── Create Email Templates
       │
       ├── Create Campaign
       │       │
       │       ├── Select Recipients
       │       ├── Select Template
       │       ├── Personalize Content
       │       └── Schedule / Send
       │
       ▼
  Email Delivery
       │
       ▼
  Track Engagement
       │
       ▼
 Analytics Dashboard
```

---

## 📁 Project Structure

A typical project structure is organized as follows:

```text
CampaignPro/
│
├── frontend/
│   ├── src/
│   ├── public/
│   ├── package.json
│   └── ...
│
├── backend/
│   ├── src/
│   │   ├── main/
│   │   │   ├── java/
│   │   │   └── resources/
│   │   └── test/
│   ├── pom.xml
│   └── ...
│
└── README.md
```

---

## 🌐 API Documentation

The backend provides REST APIs for authentication, users, contacts, templates, campaigns, email delivery, tracking, and analytics.

Interactive API documentation is available through Swagger:

**Swagger UI:**
https://guvi-final-project.onrender.com/swagger-ui/index.html

---

## 🚀 Deployment

### Frontend

The React application is deployed on **Vercel**.

**Live application:**
https://guvi-final-project.vercel.app

### Backend

The Spring Boot REST API is deployed on **Render**.

**Swagger:**
https://guvi-final-project.onrender.com/swagger-ui/index.html

### Database

The application uses **PostgreSQL** for persistent data storage.

---

## ⚙️ Environment Variables

The application uses environment variables for configuration and sensitive information.

### Backend

Example:

```env
DB_URL=your_database_url
DB_USERNAME=your_database_username
DB_PASSWORD=your_database_password

MAIL_HOST=your_smtp_host
MAIL_PORT=587
MAIL_USERNAME=your_smtp_username
MAIL_PASSWORD=your_smtp_password

JWT_SECRET=your_jwt_secret
JWT_ACCESS_EXP_MIN=60
JWT_REFRESH_EXP_DAYS=7

CORS_ALLOWED_ORIGINS=your_frontend_url
```

### Frontend

Example:

```env
VITE_API_URL=your_backend_api_url
```

> Never commit `.env` files or real credentials to GitHub.

---

## 🧪 Running the Project Locally

### Prerequisites

Make sure you have installed:

* Java 17+
* Node.js 18+
* npm
* PostgreSQL
* Git

### Backend

Clone the repository:

```bash
git clone <your-repository-url>
cd <your-repository>/backend
```

Configure the required environment variables and database connection.

Then run:

```bash
./mvnw spring-boot:run
```

The backend will start on:

```text
http://localhost:8080
```

Swagger UI:

```text
http://localhost:8080/swagger-ui/index.html
```

### Frontend

Open a new terminal:

```bash
cd <your-repository>/frontend
npm install
npm run dev
```

The frontend will normally be available at:

```text
http://localhost:5173
```

---

## 📊 Key Highlights

* Full-stack Java and React application
* RESTful backend architecture
* Secure authentication and authorization
* Role-based access control
* Contact and audience management
* Reusable email templates
* Bulk email campaigns
* Campaign scheduling
* Personalized email delivery
* Email open and click tracking
* Campaign analytics
* Admin dashboard
* PostgreSQL database
* Cloud deployment using Vercel and Render
* Swagger API documentation

---

## 🎯 Project Objective

The primary objective of CampaignPro is to provide a centralized platform for managing the complete email marketing lifecycle.

Instead of using separate tools for contacts, templates, campaigns, delivery, and analytics, CampaignPro combines these capabilities into a single full-stack application.

---

## 👨‍💻 Project Status

**Status:** ✅ Completed

CampaignPro has been developed as a complete full-stack email marketing application with frontend, backend, database, email delivery, campaign tracking, analytics, authentication, and cloud deployment.

---

## 📄 License

This project was developed for educational and portfolio purposes.
