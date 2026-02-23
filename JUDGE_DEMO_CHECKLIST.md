# Judge Demo Checklist

This document provides a step-by-step guide to demonstrating the Vani Voice Platform for the judges, ensuring all new features, styling, and "Demo Mode" are showcased properly.

## 1. Landing Page CTAs
- [ ] **Action:** Navigate to the main Landing Page (`/`).
- [ ] **Verification:** Scroll down and locate the main "Launch live demo" CTAs.
- [ ] **Verification:** Click one of the CTAs. You should be correctly routed to the `/dashboard`.

## 2. Dashboard Tour & "Demo Mode"
- [ ] **Action:** On the `/dashboard` page, look for the "Demo Mode: OFF" toggle button in the top right Action Bar.
- [ ] **Verification:** If Demo Mode is OFF and there are no live Supabase calls, the dashboard will look empty.
- [ ] **Action:** Click the "Demo Mode" button to toggle it "ON".
- [ ] **Verification:** The dashboard should instantly populate with mock data for KPIs, Recent Calls, and the Callback Queue.
- [ ] **Verification:** The "Demo Mode: ON" button should now glow brightly with a red highlight (`raycast-red`).

## 3. Premium UI & Glassmorphism
- [ ] **Action:** Review the "Recent Calls" table UI. 
- [ ] **Verification:** Note the glassmorphic styling, enhanced border radii (24px), subtle background gradients, and premium typography that match the landing page tokens.
- [ ] **Action:** Click a row in the "Recent Calls" table to open the Transcript Panel.
- [ ] **Verification:** Observe the premium slide-in panel animation. Look at the gradient overlay, grain texture, refined headers, and UI depth elements.

## 4. Live Data Failover (Optional)
- [ ] **Action:** If time allows, place an actual live call through the `TelephonyDialer` or via Vapi.
- [ ] **Verification:** The live call will be appended correctly alongside or replacing empty states without disrupting the application structure.
