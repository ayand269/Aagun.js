<h1 align="center">
  🔥 Aagun.js
</h1>

<p align="center">
  <strong>Ignite your backend.</strong><br>
  A blazing-fast, Express-based Node.js framework with first-class TypeScript support, CLI, and developer-focused DX.
</p>

<p align="center">
  <a href="https://www.npmjs.com/package/aagun">
    <img src="https://img.shields.io/npm/v/aagun?color=orange&style=flat-square" alt="npm version">
  </a>
  <a href="https://www.npmjs.com/package/@aagun/core">
    <img src="https://img.shields.io/npm/v/@aagun/core?color=firebrick&style=flat-square" alt="@aagun/core version">
  </a>
  <a href="https://github.com/yourusername/aagun">
    <img src="https://img.shields.io/github/stars/yourusername/aagun?style=flat-square" alt="GitHub stars">
  </a>
</p>

---

## 📚 Documentation

Explore the full guide on setup, features, background tasks, file uploads, caching, and more:

👉 **[Read the Docs](https://aagun.gitbook.io/docs/)**

---

## 🚀 Quick Start

```bash
npx create-aagun-app my-app
cd my-app
npm run dev
```

---

## 📁 Project Structure

### Type-Based (Default)
```txt
src/
├── controllers/
│   └── home.controller.ts
├── middleware/
│   └── auth.middleware.ts
├── models/
├── utils/
├── index.ts
aagun.config.ts
```

### Module-Based (Optional)
```txt
src/
├── modules/
│   ├── auth/
│   │   ├── auth.controller.ts
│   │   ├── auth.middleware.ts
│   │   ├── auth.model.ts
│   │   └── auth.utils.ts
│   └── booking/
│       ├── booking.controller.ts
│       ├── booking.middleware.ts
│       ├── booking.model.ts
│       └── booking.utils.ts
├── index.ts
aagun.config.ts
```
Use `aagun.config.ts` to switch between structures or detect mismatches.

---

## ⚙️ CLI Commands

```bash
# Start development server with hot reload
aagun dev

# Build the project for production
aagun build

# Start production server
aagun start

# Doctor: Check for dependency or structure issues
aagun doctor

# Fix mismatches in dependency versions or structure
aagun fix

# Generate controller/model/service files
aagun generate -c Auth

# Example of full generate usage
aagun generate -c Auth --module

# Create new project (used internally by create-aagun-app)
aagun create my-app
```

---

## 📄 License

MIT © [Ayan Das](https://github.com/yourusername)

---

## 🌐 Links

- [Website](https://yourprojectsite.com)
- [GitHub](https://github.com/yourusername/aagun)
- [Documentation](https://aagun.gitbook.io/docs/)

