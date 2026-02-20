# AM Clean Services - Professional Cleaning Website

<div align="center">

![AM Clean Services](https://img.shields.io/badge/AM%20Clean-Services-blue?style=for-the-badge)
![Next.js](https://img.shields.io/badge/Next.js-16.1.6-black?style=flat-square)
![Prisma](https://img.shields.io/badge/Prisma-5.8.0-2D3748?style=flat-square)
![PostgreSQL](https://img.shields.io/badge/PostgreSQL-Neon-336791?style=flat-square)

**A complete, production-ready cleaning services website with admin dashboard, image/video management, and WhatsApp integration.**

</div>

---

## 📋 Overview

AM Clean Services is a modern, fully-featured website for a professional cleaning business in **Cité El Khadhra, Tunisia**.

### Key Features

- 🌟 **Innovative Landing Page** - Hero section, services, about, gallery, and contact
- 🔐 **Secure Admin Dashboard** - Manage images, videos, and business information
- ⚙️ **Dynamic Contact Information** - Edit all contact details in admin panel (no hardcoding)
- 📱 **WhatsApp Integration** - Direct customer contact
- 🗺️ **Location Map** - Business address display
- 📸 **Before & After Gallery** - Admin-uploaded projects
- 💾 **PostgreSQL Database** - Prisma ORM
- 📤 **UploadThing Integration** - File management
- 📱 **Fully Responsive** - Mobile, tablet, desktop

## 🚀 Quick Start

### Option 1: Automated Setup (Windows)

```bash
setup.bat
```

### Option 2: Manual Setup

```bash
npm install
npx prisma db push
npx ts-node lib/createAdmin.ts
npm run dev
```

### Access the Website

- **Landing**: http://localhost:3000
- **Admin Login**: http://localhost:3000/login
  - Email: `admin@amclean.com`
  - Password: `SecurePassword123!`

⚠️ Change your admin password immediately after first login!

## 📚 Documentation

- [README_BUSINESS.md](./README_BUSINESS.md) - Business overview
- [SETUP_GUIDE.md](./SETUP_GUIDE.md) - Detailed setup
- [IMPLEMENTATION_SUMMARY.md](./IMPLEMENTATION_SUMMARY.md) - What's included

## 🛠️ Tech Stack

- **Framework**: Next.js 16.1.6
- **Database**: PostgreSQL (Neon)
- **ORM**: Prisma 5.8.0
- **Auth**: bcryptjs
- **File Upload**: UploadThing
- **Styling**: Tailwind CSS

## 📁 Project Structure

```
├── app/
│   ├── api/auth/      - Authentication endpoints
│   ├── api/media/     - Media management API
│   ├── api/about/     - Contact information API
│   ├── admin/         - Admin dashboard (media & about)
│   ├── login/         - Login page
│   ├── page.tsx       - Landing page
│   └── layout.tsx     - Root layout
├── lib/
│   ├── auth.ts        - Auth config
│   ├── config.ts      - Business config
│   ├── prisma.ts      - Database client
│   └── createAdmin.ts - Admin creation
├── prisma/
│   └── schema.prisma  - Database schema (User, Media, About)
└── package.json
```

## ℹ️ About & Contact Management

The admin dashboard now includes a **dynamic contact information editor**:

### 📝 Editable Fields:

- **À Propos** - Company description
- **Adresse** - Business address
- **Téléphone** - Phone number
- **Email** - Contact email
- **Instagram** - Instagram profile link
- **Facebook** - Facebook profile link

### 🔄 How It Works:

1. Admin logs in → Goes to **"ℹ️ About & Contact"** tab
2. Clicks **"✏️ Edit"** button
3. Updates all contact information
4. Clicks **"💾 Save Changes"**
5. Changes **automatically appear** on landing page!

**No hardcoding!** All data is stored in the database and displayed dynamically.

## 📞 Business Information

⚠️ **Note**: All contact information below is now managed through the admin dashboard. Edit via admin panel to update landing page.

- 📍 **Address**: Cité El Khadhra, Tunisia
- 📱 **Phone**: +216 50 770 176
- 📧 **Email**: amcleanservices06@gmail.com
- 📷 **Instagram**: [@amclean.services](https://instagram.com/amclean.services)
- 👍 **Facebook**: [AM Clean Services](https://www.facebook.com/profile.php?id=61555985104044)

## 🆘 Troubleshooting

**Can't login?**

```bash
npx ts-node lib/createAdmin.ts
```

**Database issue?**

```bash
npx prisma db push
```

**Port already in use?**

```bash
npm run dev -- -p 3001
```

## 🎉 Status

✅ **Production Ready** - All features complete and tested

---

**Made with ❤️ for AM Clean Services** | Last Updated: February 19, 2026
