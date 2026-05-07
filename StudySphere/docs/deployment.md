# StudySphere Deployment Guide

## Architecture Overview

```
┌─────────────────┐
│   AWS Amplify   │ (Frontend - React/Vite)
│   main branch   │
└────────┬────────┘
         │
         │ HTTPS
         ▼
┌─────────────────┐
│  API Gateway    │ (HTTP API)
│  g9ip7xthp9     │
└────────┬────────┘
         │
         ▼
┌─────────────────┐
│  AWS Lambda     │ (Node.js 20.x)
│  studysphere-   │
│  api-prod-api   │
└────────┬────────┘
         │
         ▼
┌─────────────────┐
│ Secrets Manager │
│ StudySphere/    │
│ api/prod        │
└─────────────────┘

┌─────────────────┐
│   Supabase      │ (Database & Auth)
│   PostgreSQL    │
└─────────────────┘
```

## Resource IDs

### AWS Resources (Account: 763112298918 | Region: us-east-1)

| Resource | ID/ARN | Purpose |
|----------|--------|---------|
| **Lambda Function** | `studysphere-api-prod-api` | Backend API handler |
| **API Gateway** | `https://g9ip7xthp9.execute-api.us-east-1.amazonaws.com/` | HTTP endpoint |
| **Secrets Manager** | `arn:aws:secretsmanager:us-east-1:763112298918:secret:StudySphere/api/prod-FPorOO` | Stores Supabase credentials |
| **IAM User** | `study-sphere-deploy` | Deployment credentials |
| **CloudFormation Stack** | `studysphere-api-prod` | Serverless deployment stack |

### Supabase Resources

| Resource | ID/URL | Purpose |
|----------|--------|---------|
| **Project URL** | `https://kyqkilqbrvvgspwurodq.supabase.co` | Supabase project |
| **Anon Key** | `eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...` | Public client key |

### Frontend Resources

| Resource | URL | Purpose |
|----------|-----|---------|
| **Amplify App** | `https://main.ddgurp0ja266c.amplifyapp.com/` | Production frontend |
| **GitHub Repo** | `https://github.com/paygeh/Montreal` | Source code |

---

## Frontend Deployment (AWS Amplify)

### Environment Variables

Set these in **AWS Amplify → App Settings → Environment Variables**:

| Variable | Value | Description |
|----------|-------|-------------|
| `VITE_SUPABASE_URL` | `https://kyqkilqbrvvgspwurodq.supabase.co` | Supabase project URL |
| `VITE_SUPABASE_ANON_KEY` | `eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...` | Supabase anon public key |
| `VITE_API_BASE` | `https://g9ip7xthp9.execute-api.us-east-1.amazonaws.com` | Backend API endpoint |

### Build Settings

**Amplify → App Settings → Build Settings:**

```yaml
version: 1
frontend:
  phases:
    preBuild:
      commands:
        - cd StudySphere/client
        - npm ci
    build:
      commands:
        - cd StudySphere/client
        - npm run build
  artifacts:
    baseDirectory: StudySphere/client/dist
    files:
      - '**/*'
  cache:
    paths:
      - StudySphere/client/node_modules/**/*
```

### Deployment Workflow

1. **Push to GitHub** → Amplify auto-deploys on push to `main`
2. **Manual deploy**: Amplify Console → Deploy → Redeploy this version

---

## Backend Deployment (Serverless Framework)

### Environment Variables (Lambda)

Set in `serverless.yml` (auto-applied on deploy):

| Variable | Value | Description |
|----------|-------|-------------|
| `NODE_ENV` | `prod` | Environment |
| `SECRETS_ID` | `StudySphere/api/prod` | Secrets Manager secret ID |

### Deploy Command

```bash
cd StudySphere/api
npm run deploy
```

Or with explicit stage:
```bash
npx serverless deploy --stage prod
```

### Local Development

```bash
cd StudySphere/api
npm run offline
```
Runs on `http://localhost:3001` (matches `VITE_API_BASE` for local dev).

---

## Database Setup (Supabase)

### Initial Schema

Run `StudySphere/supabase/schema.sql` in **Supabase Dashboard → SQL Editor**.

This creates:
- `profiles` table (auto-created on signup)
- `courses` table
- `assignments` table
- `study_sessions` table
- `gpa_records` table
- `burnout_alerts` table
- Row Level Security (RLS) policies
- Auto-create profile trigger

### Verifying Tables

**Supabase Dashboard → Table Editor** should show:
- `profiles`
- `courses`
- `assignments`
- `study_sessions`
- `gpa_records`
- `burnout_alerts`

---

## Rollback Procedures

### Frontend Rollback (Amplify)

**Option 1: Via Amplify Console**
1. Go to **Amplify Console → Deployments**
2. Click on the deployment you want to revert to
3. Click **Rollback** → **Rollback to this deployment**

**Option 2: Via Git**
```bash
git checkout <previous-commit-hash>
git push origin main
```
Amplify will auto-deploy the previous commit.

### Backend Rollback (Serverless)

**Option 1: Via CloudFormation**
```bash
aws cloudformation describe-stacks \
  --stack-name studysphere-api-prod \
  --region us-east-1
```
Note the previous deployment timestamp, then:
```bash
# Manually rollback by redeploying previous code
git checkout <previous-commit>
cd StudySphere/api
npm run deploy
```

**Option 2: Via Lambda Version**
```bash
aws lambda list-versions-by-function \
  --function-name studysphere-api-prod-api \
  --region us-east-1
```
Restore previous version if needed.

### Database Rollback (Supabase)

**Option 1: SQL Rollback**
- Go to **SQL Editor**
- Manually run reversal queries (not automated)
- Consider using Supabase's **Database Backups** feature

**Option 2: Point-in-Time Recovery**
- **Supabase Dashboard → Database → Backups**
- Select a backup point and restore

---

## Troubleshooting

### Frontend Issues

**Problem: Build fails**
- Check Amplify build logs
- Verify `node_modules` is in `.gitignore`
- Ensure all dependencies are in `package.json`

**Problem: API calls failing**
- Check browser console for CORS errors
- Verify `VITE_API_BASE` is set correctly in Amplify
- Check Lambda is running (CloudWatch logs)

### Backend Issues

**Problem: Lambda timeout**
- Increase timeout in `serverless.yml` (currently 30s)
- Check CloudWatch logs for slow operations

**Problem: AccessDeniedException**
- Verify IAM user `study-sphere-deploy` has correct permissions
- Check `SecretsManagerReadWrite` policy is attached

**Problem: Supabase connection errors**
- Verify Secrets Manager secret has correct credentials
- Check Lambda logs for `SUPABASE_URL` / `SUPABASE_ANON_KEY` errors
- Ensure Supabase tables exist

### Database Issues

**Problem: Data not saving**
- Run `schema.sql` if tables don't exist
- Check RLS policies: users can only see their own data
- Verify user is authenticated in Supabase

**Problem: "relation does not exist"**
- Tables not created → run `schema.sql`
- Wrong table name in code → check `api.ts` vs schema

---

## Monitoring

### CloudWatch Logs (Backend)

```bash
# View Lambda logs
aws logs tail /aws/lambda/studysphere-api-prod-api --since 10m --region us-east-1 --no-cli-pager
```

### Amplify Logs (Frontend)

- **Amplify Console → Deployments → [deployment] → View logs**

### Supabase Logs

- **Supabase Dashboard → Logs → Database logs**
- **Supabase Dashboard → Logs → Auth logs**

---

## Security Checklist

- [ ] `VITE_SUPABASE_ANON_KEY` is the anon key (NOT service_role)
- [ ] Secrets Manager secret uses least-privilege IAM policy
- [ ] RLS enabled on all Supabase tables
- [ ] No sensitive data in GitHub (use `.env.local` locally, Amplify env vars in prod)
- [ ] API Gateway has CORS configured for Amplify origin
- [ ] Lambda timeout set appropriately (currently 30s)

---

## Contact & Support

- **GitHub**: https://github.com/paygeh/Montreal
- **AWS Console**: https://console.aws.amazon.com
- **Supabase Dashboard**: https://supabase.com/dashboard
