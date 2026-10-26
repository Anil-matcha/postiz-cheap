# Social Studio — Feature Implementation Roadmap

This document outlines the step-by-step roadmap to achieve complete feature parity with the reference social management platform. Features are organized into targeted phases with clear architectural requirements, component lists, and acceptance criteria.

---

## Phase 1: Interactive Calendar Superpowers

### 1.1 Drag-and-Drop Post Rescheduling
- **Objective**: Allow creators to drag post cards between calendar days and hourly slots to reschedule them in real-time.
- **Components & Files**:
  - `src/components/calendar/ContentCalendar.jsx`
  - `src/app/api/posts/[id]/route.js` (PATCH endpoint for updated `scheduledAt`)
- **Key Implementation Details**:
  - Implement native HTML5 Drag and Drop (`draggable`, `onDragStart`, `onDragOver`, `onDrop`).
  - Pass the dragging post's `id` through `dataTransfer`.
  - Date cells and hour slots detect drops and send a fast optimistic update followed by an API call.
- **Checklist**:
  - [x] Drag handle on post card top banner.
  - [x] Drop target highlight with primary border accent (`#612bd3`).
  - [x] Optimistic UI update with rollback on network failure.
  - [x] Toast notification confirming new schedule date/time.

---

### 1.2 Custom Post Tags & Category Color Banners
- **Objective**: Allow users to assign colored tags (e.g., `#Launch`, `#Promo`, `#Meme`, `#CaseStudy`) so calendar cards visually stand out.
- **Components & Files**:
  - `prisma/schema.prisma` (Add `Tag` model with `name`, `color`, and relation to `Post`)
  - `src/components/calendar/ContentCalendar.jsx`
  - `src/components/composer/PostComposerModal.jsx` (Tag selector / creator pill input)
- **Checklist**:
  - [x] Tag creation input with color picker preset palette.
  - [x] Calendar item card renders custom tag background color on top banner.
  - [x] Filter toolbar option to filter calendar view by Tag.

---

### 1.3 Optimal Posting Time Slots (Schedule Table)
- **Objective**: Configure recurring default time slots per channel (e.g., *Tuesday & Thursday at 9:00 AM and 5:00 PM*) so posts automatically snap to the next open slot.
- **Components & Files**:
  - `src/components/calendar/PostingTimeSlotsModal.jsx`
  - `src/app/api/social/slots/route.js`
- **Checklist**:
  - [ ] Day-by-day weekly slot manager per connected channel.
  - [ ] "Find Next Available Slot" quick schedule button in composer.
  - [ ] Visual indicators on empty calendar slots showing recommended posting times.

---

### 1.4 Recurring & Repeat Post Scheduling
- **Objective**: Support recurring posts that re-publish every $N$ days, weeks, or months (e.g., evergreen content, weekly shoutouts).
- **Components & Files**:
  - `prisma/schema.prisma` (`repeatInterval`, `repeatUntil` fields on `Post`)
  - `src/components/composer/PostComposerModal.jsx`
  - `src/components/calendar/ContentCalendar.jsx` (Display repeat icon badge)
- **Checklist**:
  - [ ] Repeat toggle with interval selector (Daily, Weekly, Bi-weekly, Monthly).
  - [ ] Automatic queue generation for future occurrences.
  - [ ] Repeat icon indicator (`FiRepeat`) on calendar cards.

---

### 1.5 Individual Post Analytics & Statistics Modal
- **Objective**: Click the analytics icon on published cards to view real-time engagement data.
- **Components & Files**:
  - `src/components/calendar/PostAnalyticsModal.jsx`
  - `src/app/api/posts/[id]/analytics/route.js`
- **Checklist**:
  - [ ] Metric cards: Impressions, Views, Likes, Shares/Reposts, Comments, Clicks.
  - [ ] Visual mini-graph for engagement over the first 48 hours.
  - [ ] Direct link to the live post on the respective platform.

---

## Phase 2: Advanced Post Composer Capabilities

### 2.1 Thread & Multi-Post Sequencing
- **Objective**: Create multi-part sequential threads for platforms that support it (X, Threads, LinkedIn).
- **Components & Files**:
  - `src/components/composer/PostComposerModal.jsx`
  - `src/components/composer/ThreadItem.jsx`
- **Checklist**:
  - [ ] `+ Add to Thread` button under the main composer textarea.
  - [ ] Live preview updates to show threaded chain with reply line connector.
  - [ ] Staggered publishing queue ensuring correct order.

---

### 2.2 Platform-Specific Caption & Media Overrides
- **Objective**: Customize text, hashtags, or media for individual platforms without creating separate posts.
- **Components & Files**:
  - `src/components/composer/PostComposerModal.jsx`
- **Checklist**:
  - [x] Tab bar in composer to switch between "All Channels" and specific platforms.
  - [x] Indicator dot when a platform has a customized override.
  - [x] Character counter adhering to each platform's character limit (280 for X, 2,200 for Instagram, 3,000 for LinkedIn).

---

### 2.3 Automated First Comment Scheduler
- **Objective**: Automatically publish a first comment containing hashtags, affiliate links, or calls-to-action immediately after the main post goes live.
- **Components & Files**:
  - `prisma/schema.prisma` (`firstComment` field)
  - `src/components/composer/PostComposerModal.jsx`
- **Checklist**:
  - [ ] Optional "First Comment" input section in composer.
  - [ ] Character limit verification for first comments per network.
  - [ ] Automated execution immediately after main post status becomes `completed`.

---

### 2.4 Social Rich Text Formatter (Unicode Styling)
- **Objective**: Allow users to format text with bold, italics, underline, and bullet lists on platforms that don't support native markdown.
- **Components & Files**:
  - `src/components/composer/RichTextToolbar.jsx`
  - `src/lib/unicode-formatter.js` (converts ASCII to mathematical alphanumeric Unicode)
- **Checklist**:
  - [ ] Formatting toolbar: Bold (**B**), Italic (*I*), Strikethrough (~S~), Bullet List (•).
  - [ ] Automatic Unicode transformation for feed previews.

---

### 2.5 Branded Signatures Manager
- **Objective**: Set up reusable signatures, footers, or sign-offs appended to posts automatically based on channel.
- **Components & Files**:
  - `src/components/composer/SignatureSelector.jsx`
  - `src/app/api/user/signatures/route.js`
- **Checklist**:
  - [ ] User signature creation modal.
  - [ ] Quick-insert dropdown in composer.
  - [ ] Option to set default signature per channel.

---

## Phase 3: Analytics Dashboard (`/analytics`)

### 3.1 Overview Performance Metrics
- **Objective**: A dedicated analytics page with visual trends for reach, audience growth, and engagement rate.
- **Components & Files**:
  - `src/app/analytics/page.js`
  - `src/components/analytics/MetricsSummaryCards.jsx`
  - `src/components/analytics/GrowthChart.jsx`
- **Checklist**:
  - [x] Date range selector (Last 7 Days, Last 30 Days, Last 90 Days, Custom).
  - [x] High-level KPIs: Total Reach, Engagement Rate, Total Followers, Published Posts.
  - [x] Interactive reach curve chart with platform toggle.

---

### 3.2 Top-Performing Posts Leaderboard
- **Objective**: Ranked list of posts showing which content generated the most engagement, views, and conversion.
- **Components & Files**:
  - `src/components/analytics/TopPostsTable.jsx`
- **Checklist**:
  - [x] Sortable table by Impressions, Likes, Comments, Engagement Rate.
  - [x] Platform badge and preview thumbnail.
  - [x] One-click "Duplicate / Repurpose with AI" action.

---

## Phase 4: Media Asset Library (`/media`)

### 4.1 Centralized Media Manager
- **Objective**: A persistent media library where users upload, categorize, and reuse images and videos across posts.
- **Components & Files**:
  - `src/app/media/page.js`
  - `src/components/media/MediaGrid.jsx`
  - `src/components/media/MediaUploaderModal.jsx`
- **Checklist**:
  - [x] Multi-file drag-and-drop uploader with progress bars.
  - [x] Folder and tag organization.
  - [x] Quick "Insert into Post" button opening composer with media attached.

---

### 4.2 In-App Image Editor & Cropper
- **Objective**: Crop and resize images to optimal aspect ratios for different platforms (1:1 Square, 9:16 Story/Reel, 16:9 Landscape).
- **Components & Files**:
  - `src/components/media/ImageCropperModal.jsx`
- **Checklist**:
  - [x] Aspect ratio presets: Instagram Post (1:1), Story/Reel (9:16), X Header/Post (16:9), YouTube Thumbnail (16:9).
  - [x] Zoom and pan controls.

---

## Phase 5: Agency & Multi-Client Support

### 5.1 Client / Brand Profiles
- **Objective**: Manage multiple distinct clients or brands within a single workspace account.
- **Components & Files**:
  - `prisma/schema.prisma` (`Client` model with relations to `Account` and `Post`)
  - `src/components/calendar/ClientSelector.jsx`
- **Checklist**:
  - [ ] Client switcher in sidebar and top navbar.
  - [ ] Channels and calendar filtered to selected client.

---

### 5.2 Team Collaboration & Approval Workflows
- **Objective**: Invite team members with specific roles (*Admin*, *Editor*, *Approver*).
- **Components & Files**:
  - `src/app/settings/team/page.js`
  - `src/components/team/MemberInviteModal.jsx`
- **Checklist**:
  - [ ] Team member invitation via email.
  - [ ] Role-based access control.
  - [ ] "Submit for Review" post state requiring Approver sign-off before scheduling.

---

## Phase 6: Automated Ingestion & RSS Autoposting

### 6.1 RSS Feed to Social Scheduler
- **Objective**: Automatically create draft or scheduled posts whenever a new article is published on a blog or RSS feed.
- **Components & Files**:
  - `src/app/autopost/page.js`
  - `src/lib/rss-parser.js`
- **Checklist**:
  - [ ] RSS feed URL validator and connection setup.
  - [ ] AI prompt template to generate post copy from article title and summary.
  - [ ] Auto-schedule or draft-only toggle.

---

## Progress Tracker Summary

| Phase | Description | Status |
| :--- | :--- | :--- |
| **Foundation** | Core Calendar UI (Month, Week 24h, Day, List Views, Light/Dark Modes) | **Completed** |
| **Phase 1** | Calendar Superpowers (Drag-and-Drop, Tags, Slots, Repeat, Analytics Modal) | **Next Up** |
| **Phase 2** | Advanced Composer (Threads, Overrides, First Comment, Unicode Formatter) | **Queued** |
| **Phase 3** | Analytics Dashboard (`/analytics` page & performance graphs) | **Completed** |
| **Phase 4** | Media Asset Manager (`/media` page, folders, image cropper) | **Completed** |
| **Phase 5** | Agency & Teams (Clients, team invites, post approval workflows) | **Next Up** |
| **Phase 6** | Autopost & RSS Ingestion (`/autopost` automation engine) | **Queued** |
