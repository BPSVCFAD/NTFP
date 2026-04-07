# NTFP — VanOS Supply Chain Platform

**Beyond Purpose Social Venture (BPSV)**  
Forest-to-market NTFP supply chain platform connecting tribal communities with wholesale buyers.

## Projects

| Folder | Description | Stack |
|--------|-------------|-------|
| `admin/` | Admin Portal — order management, SKU catalogue, enquiries, users | React + TypeScript + Tailwind + Vite |
| `buyer/` | Buyer Portal — B2B e-commerce, product browse, order placement, payment upload | React + TypeScript + Tailwind + Vite |

## Demo Credentials

**Admin Portal**
- Email: `admin@bpsv.org.in`
- Password: `admin123`

**Buyer Portal**
- Email: `rohit@prakritinat.com` / Password: `buyer123`
- Email: `nalini@aranyaorganics.org` / Password: `buyer123`

## Local Development

```bash
# Admin portal
cd admin
npm install
npm run dev       # http://localhost:5173

# Buyer portal
cd buyer
npm install
npm run dev       # http://localhost:5174
```

## Vercel Deployment

Deploy as two separate Vercel projects from this same repo:

- **Admin**: Root Directory = `admin`
- **Buyer**: Root Directory = `buyer`

Both use Framework Preset: **Vite**

---
© 2024 Beyond Purpose Social Venture
