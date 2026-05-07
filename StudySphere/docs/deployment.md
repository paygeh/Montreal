# StudySphere Deployment Guide

## Resource IDs

**AWS (us-east-1, Account: 763112298918)**
- Lambda: `studysphere-api-prod-api`
- API Gateway: `https://g9ip7xthp9.execute-api.us-east-1.amazonaws.com/`
- Secrets Manager: `arn:aws:secretsmanager:us-east-1:763112298918:secret:StudySphere/api/prod-FPorOO`
- IAM User: `study-sphere-deploy`

**Supabase**
- URL: `https://kyqkilqbrvvgspwurodq.supabase.co`

**Frontend**
- Amplify: `https://main.ddgurp0ja266c.amplifyapp.com/`
- GitHub: `https://github.com/paygeh/Montreal`

---

## Frontend (Amplify)

**Environment Variables:**
- `VITE_SUPABASE_URL` — Supabase project URL
- `VITE_SUPABASE_ANON_KEY` — Supabase anon key
- `VITE_API_BASE` — API Gateway endpoint

**Deploy:** Push to `main` branch (auto-deploys)

---

## Backend (Serverless)

**Deploy:**
```bash
cd StudySphere/api
npm run deploy
```

**Local:**
```bash
npm run offline
```

---

## Database (Supabase)

Run `StudySphere/supabase/schema.sql` in **SQL Editor** to create tables and RLS policies.

---

## Rollback

**Frontend:** Amplify Console → Deployments → Rollback

**Backend:**
```bash
git checkout <commit>
cd StudySphere/api
npm run deploy
```

**Database:** Supabase Dashboard → Database → Backups → Restore

---

## Logs

- Backend: `aws logs tail /aws/lambda/studysphere-api-prod-api --no-cli-pager`
- Frontend: Amplify Console → Deployments → View logs
- Database: Supabase Dashboard → Logs
