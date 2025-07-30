# 🎓 SmartSchool Platform

SmartSchool is a full-stack, role-based school management platform built with **Next.js** (frontend) and **ASP.NET Core Web API + SQL Server** (backend). It enables real-time collaboration between teachers, parents, and admins — managing student profiles, daily learning logs, attendance tracking, and online fee payments — with Codex-integrated agent instructions and color strategy.

---

## 🚀 Features

- ✅ Role-based dashboards (Admin, Teacher, Parent)
- ✅ Daily attendance logging (by teacher)
- ✅ Daily learning updates auto-shared with parents
- ✅ Online fee payment via Razorpay/Stripe (planned)
- ✅ Admin control for users, roles, and analytics
- ✅ Modern UI using Tailwind CSS
- ✅ Secure ASP.NET API with EF Core and JWT
- ✅ GitHub Copilot / Codex support with embedded guidance

## 🛠️ Setup

1. Copy `.env.example` to `.env` in the project root.
2. Update `VITE_API_URL` with your backend's base URL. It defaults to `http://localhost:5000/api`.

---

## 🧠 Tech Stack

| Layer        | Technology                     |
|--------------|--------------------------------|
| Frontend     | Next.js 14 (App Router)        |
| Styling      | Tailwind CSS                   |
| State Mgmt   | React Context API              |
| Backend      | ASP.NET Core Web API (.NET 8+) |
| Database     | Microsoft SQL Server           |
| Auth         | JWT or Cookie-based Auth       |
| Payments     | Razorpay / Stripe (Planned)    |
| Hosting      | Vercel (Frontend), Azure/IIS   |

---

## 🎨 Color Strategy

Defined in: [`styles/theme.config.md`](./styles/theme.config.md)

| Use Case       | Color Name | Hex       |
|----------------|------------|-----------|
| Primary        | Indigo     | `#1976D2` |
| Secondary      | Green      | `#4CAF50` |
| Accent         | Amber      | `#FFC107` |
| Background     | Light Gray | `#F4F6F8` |
| Text Main      | Charcoal   | `#212121` |
| Text Subdued   | Gray       | `#616161` |
| Error          | Red        | `#D32F2F` |

---

## 📁 Project Structure

<details>
<summary>📦 Frontend (Next.js)</summary>

```txt
/smartschool/
├── app/                         # App Router Pages
│   ├── login/page.tsx
│   ├── dashboard/[role]/page.tsx
│   ├── student/[id]/page.tsx
│   └── layout.tsx               # Shared layout
├── components/                  # UI Components
│   ├── Navbar.tsx
│   ├── Sidebar.tsx
│   ├── AttendanceTable.tsx
│   └── PaymentForm.tsx
├── context/                     # React Context API
│   ├── AuthContext.tsx
│   └── RoleGuard.tsx
├── lib/                         # Utilities
│   └── api.ts                   # Axios wrapper
├── public/                      # Static assets
├── styles/
│   ├── globals.css
│   └── theme.config.md          # Codex-readable color guide
├── middleware.ts                # Role-based route guard
├── tailwind.config.js           # Tailwind theme extension
├── AGENTS.md                    # Codex agents + instructions
├── ACCESS_MATRIX.md             # Role-wise permission rules
└── README.md                    # Project documentation
```
 </details>
<details> <summary>🧩 Backend (ASP.NET Core)</summary>
  
```txt
/SmartSchoolAPI/
├── Controllers/                 # API Controllers
│   ├── AuthController.cs
│   ├── StudentController.cs
│   ├── AttendanceController.cs
├── DTOs/                        # Input/Output Models
├── Models/                      # Entity Models
├── Data/                        # DbContext, Seeders, Migrations
├── Services/                    # Business Logic Layer
├── Helpers/                     # JWT, Password Hashing
├── appsettings.json             # DB & Auth Config
└── Program.cs                   # Startup & Configuration
```
</details>
