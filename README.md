# 🛣️ RaastaAI
### Smart Road Issue Reporting & Resolution Platform

<div align="center">

**Report. Track. Resolve.**

*Building Better Roads for a Better Tomorrow.*

![React](https://img.shields.io/badge/React-19-61DAFB?logo=react&logoColor=black)
![TypeScript](https://img.shields.io/badge/TypeScript-3178C6?logo=typescript&logoColor=white)
![Vite](https://img.shields.io/badge/Vite-646CFF?logo=vite&logoColor=white)
![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-06B6D4?logo=tailwindcss&logoColor=white)

</div>

---

## 🌍 About the Project

RaastaAI is a smart civic technology platform designed to connect citizens with municipal authorities to improve road infrastructure.

The platform enables citizens to report road-related problems such as potholes, damaged roads, and waterlogging by submitting photographs and location information.

Municipal administrators can review complaints, verify reported issues, assign repair teams, manage repair activities, and monitor complaint resolution.

**Our mission is to make road maintenance more transparent, efficient, and accessible through technology.**

## 🎯 Problem Statement

Road damage, potholes, and waterlogging create serious inconvenience and safety risks for citizens.

Traditional complaint systems often lack transparency, efficient tracking, and proper communication between citizens and municipal authorities.

RaastaAI addresses these challenges through a centralized digital platform for road issue reporting and complaint management.

## ✨ Key Features

### 👤 Citizen Portal

- Report potholes, damaged roads, and waterlogging.
- Upload photographs as evidence of road damage.
- Provide geographical location information.
- Track complaints using unique complaint IDs.
- View previously submitted complaints.
- Receive complaint progress notifications.
- Explore reported road issues on interactive maps.
- Manage citizen profile information.

### 🛠️ Municipal Admin Dashboard

- Monitor complaints and municipal activities.
- Review and manage citizen reports.
- Verify or reject submitted complaints.
- Manage repair team assignments.
- Organize complaints according to priority.
- Update complaint statuses.
- Manage repair-related photographs.
- View complaint analytics and statistics.
- Monitor reported issues geographically.
- Receive complaint activity notifications.

### 📍 Complaint Tracking

Complaint statuses include:

1. Submitted
2. Verified
3. Assigned
4. In Progress
5. Resolved
6. Rejected

Each complaint receives a unique tracking ID.

---

## 📸 Application Screenshots

Explore the RaastaAI platform interface through its actual application views:

### 1. Citizen Dashboard
The citizen home portal provides quick actions to report road hazards, lookup active complaint statuses, and review municipal announcements.

![Citizen Dashboard](screenshots/citizen-dashboard.png)

### 2. Recent Reports
Displays submitted community reports with real-time status badges (`SUBMITTED`, `VERIFIED`, `IN PROGRESS`), location details, and community watcher milestones.

![Recent Reports](screenshots/recent-reports.png)

### 3. Report a Road Issue
Enables citizens to upload photographic evidence of road damage, select issue categories (potholes, waterlogging, damaged roads), and capture location coordinates.

![Report Road Issue](screenshots/report-issue.png)

### 4. Municipal Admin Dashboard
The municipal operations control room featuring real-time reporting triage, live issue metrics, resolution completion rates, and defect distribution charts.

![Municipal Admin Dashboard](screenshots/admin-dashboard.png)

---

## 🖥️ Technology Stack

| Technology | Purpose |
|---|---|
| React 19 | Frontend development |
| TypeScript | Type-safe development |
| Vite | Development and build tool |
| Tailwind CSS | UI styling |
| Leaflet.js | Interactive maps |
| OpenStreetMap | Map tiles |
| Recharts | Data visualization |
| Lucide React | Icons |
| Motion | UI animations |
| LocalStorage | Browser data persistence |
| Google GenAI SDK | AI integration dependency |

## 📂 Project Structure

```text
RaastaAI/
│
├── public/
│   └── images/
│       ├── pothole-1.jpg
│       ├── pothole-2.jpg
│       ├── pothole-3.jpg
│       ├── waterlogging-1.jpg
│       ├── waterlogging-2.jpg
│       ├── waterlogging-3.jpg
│       ├── damaged-1.jpg
│       ├── damaged-2.jpg
│       ├── damaged-3.jpg
│       ├── repair-1.jpg
│       ├── repair-2.jpg
│       ├── repair-3.jpg
│       └── fallback.jpg
│
├── screenshots/
│   ├── admin-dashboard.png
│   ├── citizen-dashboard.png
│   ├── recent-reports.png
│   └── report-issue.png
│
├── src/
│   ├── components/
│   │   ├── admin/
│   │   ├── citizen/
│   │   ├── auth/
│   │   └── common/
│   │
│   ├── data/
│   │   ├── demoImages.ts
│   │   └── initialComplaints.ts
│   │
│   ├── services/
│   │   └── dataService.ts
│   │
│   ├── types/
│   │   └── index.ts
│   │
│   ├── App.tsx
│   ├── index.css
│   └── main.tsx
│
├── .env.example
├── .gitignore
├── index.html
├── metadata.json
├── package.json
├── package-lock.json
├── bun.lock
├── tsconfig.json
├── vite.config.ts
└── README.md
```

## ⚙️ Installation & Setup

Follow these steps to run RaastaAI locally.

### Prerequisites

- Node.js
- npm
- Git
- VS Code or Google Antigravity

### 1. Clone the Repository

```bash
git clone https://github.com/YOUR-USERNAME/RaastaAI.git
```

### 2. Navigate to the Project

```bash
cd RaastaAI
```

### 3. Install Dependencies

```bash
npm install
```

### 4. Start the Development Server

```bash
npm run dev
```

### 5. Open in Browser

Visit the local address displayed in your terminal.

For example:

```text
http://localhost:3000
```

## 🔐 Demo Login Credentials

Use the predefined demonstration accounts to explore the application.

**Citizen Account**

```text
Email: citizen@raastaai.demo
Password: citizen123
```

**Municipal Admin Account**

```text
Email: admin@raastaai.demo
Password: admin123
```

The login page also provides one-click demo access.

> Note: These are demonstration credentials, not production authentication accounts.

## 🔄 How RaastaAI Works

1. **Report:** Citizens submit road complaints with photographs and location information.
2. **Registration:** The application generates a unique complaint ID.
3. **Verification:** Municipal administrators review submitted complaints.
4. **Assignment:** Verified complaints can be assigned to repair teams.
5. **Progress:** Administrators update complaint statuses.
6. **Resolution:** Completed repair work is marked as resolved.
7. **Tracking:** Citizens can follow complaint progress.

## 💾 Data Management

The current prototype uses browser LocalStorage to maintain:

- Complaint records
- Notification information
- Demonstration user sessions

Initial demonstration complaints and notifications are included in the project.

Data is stored locally in the browser and is not synchronized between different users or devices.

## 🧪 Available Commands

| Command | Description |
|---|---|
| `npm install` | Install project dependencies |
| `npm run dev` | Start development server |
| `npm run build` | Create production build |
| `npm run preview` | Preview production build |
| `npm run lint` | Run lint checks, if configured |

## 🚀 Future Enhancements

- AI-powered pothole detection using computer vision.
- Automatic road damage severity classification.
- AI-assisted road condition analysis.
- Secure backend and database integration.
- Production-ready authentication.
- Real-time notifications.
- Live repair team tracking.
- Municipal corporation integration.
- Mobile application support.
- Advanced road condition analytics.

## ⚠️ Current Project Limitations

- The current project is a frontend-oriented demonstration prototype.
- Authentication uses predefined demo credentials.
- Complaint and notification data are stored using browser LocalStorage.
- A shared production database is not currently implemented.
- AI-powered road damage detection is a planned enhancement, not a confirmed implemented feature.
- Production deployment requires secure backend services and authentication.

## 🌱 Vision

Our vision is to build smarter, safer, and better-connected cities by making civic issue reporting easier and road maintenance more transparent.

We believe every citizen deserves better roads and an effective way to report infrastructure problems.

## 🤝 Contributions

Suggestions, feedback, and contributions are welcome!

If you have ideas to improve RaastaAI, feel free to open an issue or submit a pull request.

## ⭐ Support the Project

If you like the idea behind RaastaAI, consider giving the repository a star on GitHub.

---

<div align="center">

# 🛣️ RaastaAI

### Report. Track. Resolve.

**Building Better Roads for a Better Tomorrow.**

Made with ❤️ for smarter communities.

</div>