# RaastaAI

**AI-Powered Civic Issue Reporting and Road Safety Platform**

[![Live Demo](https://img.shields.io/badge/Live-Vercel-black?logo=vercel)](https://rasta-ai-ecru.vercel.app)
[![AWS](https://img.shields.io/badge/Deployed-AWS%20EC2-orange?logo=amazonaws)](http://3.104.66.81)

RaastaAI is a civic technology platform that lets citizens report road-related problems and public infrastructure issues, track their progress, and follow the resolution workflow from submission to closure.

---

## Table of Contents

1. [Project Overview](#1-project-overview)
2. [Key Features](#2-key-features)
3. [Technology Stack](#3-technology-stack)
4. [Implementation Details](#4-implementation-details)
5. [Screenshots](#5-screenshots)
6. [Deployment](#6-deployment)
7. [Setup and Usage](#7-setup-and-usage)
8. [Project Status and Limitations](#8-project-status-and-limitations)

---

## 1. Project Overview

### Problem Statement

Citizens regularly face potholes, waterlogging, damaged roads, and other public infrastructure problems. Traditional complaint systems make it hard to report an issue accurately and even harder to find out what happened to it afterwards. Reports get lost, there is little feedback, and residents have no visibility into whether anyone is acting on their complaint.

### Our Solution

RaastaAI makes civic reporting simple and transparent. Citizens can submit a complaint with a category, priority, photograph, and location, then follow it through a clear status timeline. Administrators get a portal to review and manage incoming reports.

### Target Users

| User | How they use RaastaAI |
|------|-----------------------|
| Citizens | Report issues, track complaints, view the road map |
| Municipal authorities | Review reports and follow resolution workflows |
| Administrators | Manage complaints and monitor the platform through the Admin Portal |

---

## 2. Key Features

- **Citizen Dashboard**: overview of the user's activity and complaints
- **Report Issue**: submit a complaint with details, category, and priority
- **Complaint Categories and Priority Levels**: classify issues such as potholes and waterlogging
- **Complaint Photographs**: attach and view images with each report
- **Location and GPS Information**: pin where the issue is
- **My Reports**: see every complaint you have submitted
- **Road Map**: view reported issues on a map-style interface
- **Complaint Status Tracking**: know whether a complaint is pending, in progress, or resolved
- **Resolution Workflow Timeline**: step-by-step history of how a complaint progressed
- **User Profile**: manage account details
- **Admin Portal**: administrator view for managing complaints
- **Notification Interface**: updates about complaint activity

---

## 3. Technology Stack

| Layer | Technology |
|-------|-----------|
| Frontend | React.js |
| Language | TypeScript |
| Build tool | Vite |
| Styling | CSS |
| AI integration | Google Gemini API (key supplied via environment variable) |
| Web server (AWS) | Nginx |
| Cloud hosting | AWS EC2 (t3.micro, Amazon Linux) |
| Frontend hosting | Vercel |
| Backend / Database | `[ADD: to be confirmed]` |

---

## 4. Implementation Details

### Project Structure

```
Rasta-AI/
├── public/            # Static public assets
├── screenshots/       # Project screenshots used in this README
├── src/
│   ├── components/    # Reusable UI components
│   ├── data/          # Demo data and image references
│   └── ...            # Application source code
├── .env.example       # Environment variable template
├── package.json       # Dependencies and scripts
├── vite.config.ts     # Vite configuration
└── README.md
```

### How It Works

- **Single-page application**: the UI is built with React and TypeScript, bundled by Vite into static files in `dist/`.
- **Component-based UI**: reusable components in `src/components/` are shared across the dashboard, report form, complaint lists, timeline, and admin views.
- **Demo data**: `src/data/` holds sample complaints and image references used to populate the interface.
- **AI configuration**: the Google Gemini API key is read from an environment variable (see `.env.example`), so no secret is committed to the repository.
- **Static deployment**: because the build output is plain static files, the same build is served by Nginx on AWS EC2 and by Vercel.

> `[ADD: short description of any specific logic you want to highlight, e.g. how priority levels are assigned or how the timeline is rendered]`

---

## 5. Screenshots

### Citizen Dashboard
The home screen greets the citizen and offers quick access to **Track Complaint**, **Nearby Issues**, and **My Reports**.

![Citizen Dashboard](screenshots/dashboard.png)

### Recent Reports and Complaint Status
Recent complaints appear with their photo, complaint ID, location, date, and a status label (Submitted, Verified, In Progress). A Civic Watcher badge rewards active reporters.

![Recent Reports](screenshots/recent-reports.png)

### Report a Road Issue
The report form starts with a photograph (upload from device, take a photo, or choose from previous records), followed by issue category and the remaining details.

![Report Issue](screenshots/report-issue.png)

### Municipal Admin Portal
The Executive Road Intelligence Dashboard shows total, pending, in-progress, and resolved counts, complaints by category, and a status distribution chart. The sidebar gives access to All Complaints, Pending Verification, Verified, Assigned, In Progress, Resolved, Road Map, Analytics, and Settings.

![Admin Portal](screenshots/admin-portal.png)

---

## 6. Deployment

RaastaAI is deployed on two platforms.

### Live Links

| Platform | Link |
|----------|------|
| Vercel (live website) | https://rasta-ai-ecru.vercel.app |
| AWS EC2 (public IP) | http://3.104.66.81 |
| GitHub repository | https://github.com/Laksh2006/Rasta-AI |

### AWS Deployment Details

| Setting | Value |
|---------|-------|
| Service | Amazon EC2 |
| Instance type | t3.micro |
| Operating system | Amazon Linux |
| Web server | Nginx |
| Port | 80 (HTTP) |
| Public IP | 3.104.66.81 |

**Steps used to deploy on EC2** (adjust to match what you actually ran):

1. Launch a `t3.micro` Amazon Linux instance and open **port 80** (HTTP) and **port 22** (SSH) in the security group.
2. Connect over SSH and install the tools:
   ```bash
   sudo dnf update -y
   sudo dnf install -y nginx git nodejs
   ```
3. Clone the repository and build the app:
   ```bash
   git clone https://github.com/Laksh2006/Rasta-AI.git
   cd Rasta-AI
   npm install
   npm run build
   ```
4. Copy the build output to the Nginx web root:
   ```bash
   sudo cp -r dist/* /usr/share/nginx/html/
   ```
5. Start Nginx and enable it on boot:
   ```bash
   sudo systemctl start nginx
   sudo systemctl enable nginx
   ```
6. Open `http://3.104.66.81` in a browser.

> Note: an EC2 public IP can change if the instance is stopped and restarted, unless an Elastic IP is attached. Update the link above if it changes.

### Vercel Deployment Details

| Setting | Value |
|---------|-------|
| Platform | Vercel |
| Framework preset | Vite |
| Source | GitHub repository (`Laksh2006/Rasta-AI`) |
| Build command | `npm run build` |
| Output directory | `dist` |

Add the Gemini API key as an environment variable in the Vercel project settings if you want the AI feature enabled.

---

## 7. Setup and Usage

### Prerequisites

- Node.js 18 or later
- npm
- Git

### Installation

```bash
# 1. Clone the repository
git clone https://github.com/Laksh2006/Rasta-AI.git
cd Rasta-AI

# 2. Install dependencies
npm install

# 3. Create your environment file
cp .env.example .env
```

Open `.env` and add your Google Gemini API key. Use the variable name shown in `.env.example`.

```env
# Example only. Check .env.example for the exact variable name.
VITE_GEMINI_API_KEY=your_api_key_here
```

> Never commit your `.env` file or share your API key.

### Run Locally

```bash
npm run dev
```

Vite prints a local address, usually `http://localhost:5173`. Open it in your browser.

### Build for Production

```bash
npm run build
npm run preview   # optional: preview the production build locally
```

The production files are generated in `dist/`.

### Using the App

1. Open the **Citizen Dashboard** to see an overview.
2. Go to **Report Issue**, choose a category and priority, add a photo and location, and submit.
3. Open **My Reports** to see your complaints and their current status.
4. Open a complaint to follow its **Resolution Workflow Timeline**.
5. Use **Road Map** to view reported issues by location.
6. Check **Notifications** for updates and **Profile** to manage your account.
7. Administrators use the **Admin Portal** to review and manage complaints.

---

## 8. Project Status and Limitations

This section lists what is and is not fully implemented, so the documentation stays accurate.

- The frontend interface and the features listed above are implemented using demo data from `src/data/`. The app includes a **Switch to Municipal Admin** toggle and a **Reset Demo** option for presentations.
- The figures on the admin dashboard (for example total reports and resolution rate) are sample values for demonstration, not live statistics.
- Google Gemini API configuration is provided through environment variables. `[VERIFY: whether live AI responses are working in the deployed app]`
- Backend, database, and authentication: `[VERIFY: describe what exists, or state that data is currently demo data and these are planned]`

### Future Improvements

- Persistent backend and database for complaints
- User authentication and role-based access for citizens, authorities, and admins
- Real-time notifications
- AI-based issue classification and priority suggestions from uploaded photos

---

## License

`[ADD: license, e.g. MIT]`

## Team

**Team Name:** Unique Stars

| Role | Name |
|------|------|
| Team Leader | Krupal |
| Member | Bharatesh |
| Member | Laksh |
| Member | Nitinkumar |

`[ADD: institution / course name, if required]`
