# HR Testing Platform (Premium Edition)

A high-performance, enterprise-grade HR assessment platform built with Next.js, Prisma, and TensorFlow.js.

## ✨ Key Features
- **Modern UI**: Full glassmorphism, dark-mode-first aesthetic with Framer Motion animations.
- **Dynamic Assessment Engine**: Create and manage custom tests with AI question generation.
- **Multi-Tenant RBAC**: Specialized organizational partitioning for agencies and clinics.
- **Edge AI Proctoring**: Browser-native face/object detection and tab-focus tracking.
- **Bulk Recruitment**: CSV candidate ingestion with automated invite blasts via Nodemailer.
- **Admin Dashboard**: Real-time analytics, charts (Recharts), and proctoring evidence viewing.

## 🚀 Quickstart
1. **Clone & Install**:
   ```bash
   npm install
   ```
2. **Setup Database**:
   Update your `.env` with a PostgreSQL connection string and run:
   ```bash
   npx prisma db push
   npx prisma generate
   ```
3. **Run Locally**:
   ```bash
   npm run dev
   ```

## 🛠️ Tech Stack
- **Framework**: [Next.js 14](https://nextjs.org/)
- **ORM**: [Prisma](https://www.prisma.io/)
- **AI Analytics**: [TensorFlow.js](https://www.tensorflow.org/js)
- **UI & Animation**: [Tailwind CSS](https://tailwindcss.com/), [Framer Motion](https://www.framer.com/motion/), [Lucide React](https://lucide.dev/)
- **Auth**: [NextAuth.js](https://next-auth.js.org/)
- **Charts**: [Recharts](https://recharts.org/)

---
*Developed for Phase 5.5 Stabilization Release.*
