# Awakening Homoeopathy

A **separate** React + Firebase website for Awakening's homoeopathic consultation service. It is intentionally independent from the existing Awakening Integral Health website and from the separate Homeopathy Reference/corpus project.

## What is included

- React 18 + TypeScript + Vite
- Responsive ocean/glass visual language inspired by the existing Awakening site
- Public pages: Home, Practice/Practitioner, Care Approach, Patient Guides + guide detail pages, Contact, Privacy, Terms, Medical Disclaimer
- Firebase Anonymous Auth for public booking/contact ownership
- Email/Password Auth for administrators
- Firestore-backed services, practitioners, live slots, bookings, enquiries and payment settings
- Atomic slot claiming to reduce double-booking risk
- Provisional booking confirmation page
- Manual payment reference/proof flow
- Optional Firebase Storage upload for images/PDF payment proofs
- Admin dashboard for bookings, consultation services, practitioner credentials, daily slot generation, enquiries and payment settings
- Firebase Hosting SPA configuration
- Firestore rules, Storage rules and indexes
- Per-page SEO metadata, robots.txt, sitemap.xml and favicon

## Important separation

This project does **not** require or modify the existing `awakening-integral-website` repository. Copy design/content assets only when you intentionally choose to do so.

## 1. Create a new Firebase project

Create a completely separate Firebase project for this website.

Enable:

1. **Authentication**
   - Anonymous
   - Email/Password
2. **Cloud Firestore**
3. **Firebase Hosting**
4. **Cloud Storage** only if you want screenshot/PDF payment-proof uploads

The booking system still works without Storage; users can submit a transaction/UTR reference instead.

## 2. Configure environment variables

Copy `.env.example` to `.env.local` and paste the Firebase Web App configuration values from Firebase Console > Project settings > Your apps.

```bash
cp .env.example .env.local
```

Never commit `.env.local`.

## 3. Install and run

```bash
npm install
npm run dev
```

Production build:

```bash
npm run build
```

## 4. Deploy Firebase rules and Hosting

Install/login to Firebase CLI and select the **new** Firebase project:

```bash
npm install -g firebase-tools
firebase login
firebase use --add
firebase deploy --only firestore:rules,firestore:indexes
```

If Cloud Storage is enabled:

```bash
firebase deploy --only storage
```

Then build and deploy Hosting:

```bash
npm run build
firebase deploy --only hosting
```

## 5. Create the first administrator

1. Firebase Console > Authentication > Users > **Add user**.
2. Give the user an email/password.
3. Copy that user's Firebase Auth **UID**.
4. Firestore > create collection `users` > document ID = that exact UID.
5. Add fields:

```text
role: "admin"
email: "admin@example.com"
```

That user can now sign in at `/admin/login`.

Do **not** add a public administrator-registration page.

## 6. Initial admin configuration

After logging in:

- **Services:** add consultation types, fee and duration.
- **Practitioners:** add doctors/practitioners and link them to services.
- **Slots:** select a practitioner/service/date and create appointment times.
- **Payment settings:** enter UPI ID, display name and payment instructions.

All of these values are Firestore driven; you do not have to modify React code when fees or appointment slots change.

## Booking state model

A new booking is created with:

```text
status: pending
paymentStatus: pending
```

When the patient submits a transaction reference/payment proof:

```text
paymentStatus: claimed
```

Admin may then:

```text
paymentStatus: verified
status: confirmed
```

or reject the payment claim. Confirmed appointments can subsequently be marked completed or cancelled.

## Firestore collections

```text
users/{uid}
services/{serviceId}
practitioners/{practitionerId}
slots/{slotId}
bookings/{bookingId}
inquiries/{inquiryId}
siteSettings/payment
```

Public booking ownership is tied to Firebase Anonymous Auth UID. This avoids making all booking records publicly readable.

## Payment proof Storage path

When enabled, client uploads go to:

```text
payment-proofs/{anonymousUserUid}/{bookingId}/proof-<timestamp>.<ext>
```

Storage rules restrict reads/writes to the owner and administrators. Proof files are limited to images/PDF and 5 MB.

## Architecture notes

- Visitor-facing site and admin UI are one React deployment but have separate routes/security.
- Firebase config values used by browser SDKs are not treated as secrets; authorization comes from Auth + Security Rules.
- Admin access is derived from `users/{uid}.role` in Firestore.
- The client never contains a service account/private key.
- Payment verification is deliberately an administrative operation.
- Booking slot claiming runs inside a Firestore transaction.

## Appointment schedule model

The booking calendar uses:

```text
Appointment duration: 15 minutes
Buffer after appointment: 15 minutes
Start interval: 30 minutes
Default clinic window: 09:00–15:00 Asia/Kolkata
```

The admin may change the opening/closing window for a particular generated day, while the 15-minute appointment + 15-minute buffer rule remains fixed.

## Content and professional-boundary notes

Public copy deliberately avoids guaranteed cure claims, testimonials and instructions to stop prescribed care. Practitioner qualifications and registration information are data fields rather than hard-coded claims. Before public launch, the registered practitioner should review the final presentation against current professional-conduct, advertising and local practice requirements.

## Suggested next production additions

Before taking real payments/clinical data at scale, consider:

- Cloud Functions / server backend for confirmation emails and calendar/Google Meet creation
- App Check
- audit logging
- robust payment gateway integration/webhooks instead of manual UTR verification
- formal medical/privacy/legal copy reviewed for your jurisdiction
- consent/retention workflow for clinical case records if you later collect them
- analytics only after consent/privacy configuration

## No connection to Homeopathy Reference

The Homeopathy Reference/corpus/search application remains a completely separate project. This repository is only for the patient-facing Awakening Homoeopathy clinical website.
