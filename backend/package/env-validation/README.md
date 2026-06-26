# Environment Variable Validation

This module ensures that all required environment variables are present and valid before the application starts.

## Required Variables

| Variable | Type | Constraints | Example |
| --- | --- | --- | --- |
| `DATABASE_URL` | string | | `postgres://user:password@localhost:5432/database` |
| `JWT_SECRET` | string | min 32 characters | `a-very-long-and-secure-secret-key` |
| `JWT_REFRESH_SECRET` | string | | `another-very-long-and-secure-secret-key` |
| `SMTP_HOST` | string | | `smtp.example.com` |
| `SMTP_PORT` | number | | `587` |
| `STELLAR_SECRET_KEY` | string | | `S...` |

## Optional Variables

| Variable | Type | Default |
| --- | --- | --- |
| `NODE_ENV` | string | `development` |
| `PORT` | number | `6000` |
| `FRONTEND_URL` | string | `http://localhost:3000` |
| `MAIL_HOST` | string | |
| `MAIL_PORT` | number | `2525` |
| `MAIL_USER` | string | |
| `MAIL_PASS` | string | |
| `MAIL_FROM` | string | `noreply@freightflow.io` |
| `UPLOAD_DIR` | string | `./uploads` |
| `CLOUDINARY_CLOUD_NAME` | string | |
| `CLOUDINARY_API_KEY` | string | |
| `CLOUDINARY_API_SECRET` | string | |
| `REDIS_URL` | string | |