# SCORM Demo Website Specification

## Overview
A Next.js-based web application designed to demonstrate SCORM content playback and track user learning journeys. The application focuses on a friendly, minimal user interface with a white and pink color scheme.

## Technology Stack
- **Framework**: Next.js (latest version)
- **Language**: TypeScript
- **Styling**: Tailwind CSS / CSS Modules
- **State Management**: Zustand (for SCORM API state)
- **SCORM Parsing**: `scorm-again` or similar lightweight library for parsing manifests and handling runtime communication.

## Technical Architecture

### Folder Structure (Atomic Design)
The project will follow the Atomic Design methodology to ensure component reusability and scalability.

```
src/
├── app/                 # Next.js App Router pages
├── components/          # Atomic Design components
│   ├── atoms/           # Basic building blocks (index.ts for barrels)
│   ├── molecules/       # Groups of atoms (index.ts for barrels)
│   ├── organisms/       # Complex sections (index.ts for barrels)
│   └── templates/       # Page layouts (index.ts for barrels)
├── hooks/               # Custom React hooks
├── utils/               # Helper functions
├── styles/              # Global styles
└── store/               # Zustand stores
```

#### Naming Conventions
- **Components**: Name components in camelCase (e.g., `button`, `playerIcon`).
- **Files**: Use camelCase for file names (e.g., `button.tsx`, `button.module.css`).

#### Barrel Style Usage
To keep imports clean, each component directory should use an `index.ts` file to export its components.

**Example Structure:**
```
src/components/atoms/
├── button/                       
│   ├── button.tsx                # Component implementation
│   ├── button.module.css         # CSS Modules
│   ├── button.stories.tsx        # Storybook stories
│   ├── button.test.tsx           # Unit tests
│   └── index.ts                  # export * from './button'
├── playerIcon/
│   ├── playerIcon.tsx            # Component implementation
│   ├── playerIcon.module.css     # CSS Modules
│   ├── playerIcon.stories.tsx    # Storybook stories
│   ├── playerIcon.test.tsx       # Unit tests
│   └── index.ts                  # export * from './playerIcon'
└── index.ts                      # export * from './atoms'

```

**Example Page Usage:**
```tsx
// Clean imports via barrels
import { Button } from '@/components/atoms';
import { ScormPlayer } from '@/components/organisms';
```


### Theme Configuration
To support easy configuration of the primary color, we will use CSS Variables mapped to Tailwind's configuration.

- **Implementation**: Define colors in `globals.css` using CSS custom properties.
- **Tailwind Config**: Reference these variables in `tailwind.config.ts`.

```css
:root {
  --color-primary: 255 105 180; /* Pink RGB */
  --color-primary-light: 255 193 204;
}
```

This allows the theme to be updated dynamically or by simply changing a few lines in the CSS file.

## Design & UI/UX
- **Style**: Minimal, Clean, Friendly.
- **Color Palette**:
    - **Primary**: Soft Pink (`#FFC1CC` to `#FF69B4` range, adjusted for accessibility).
    - **Background**: White (`#FFFFFF`) / Off-White (`#FAFAFA`).
    - **Text**: Dark Gray (`#333333`) for softness.
    - **Accents**: Rounded corners, subtle shadows, glassmorphism hints.
- **Typography**: Modern sans-serif (e.g., Inter or Outfit).

## Core Functionality

### 1. SCORM Upload
- **Interface**: Drag-and-drop zone for `.zip` SCORM packages.
- **Processing**:
    - Unzip and validate the package (client-side or server-side).
    - Parse `imsmanifest.xml` or `CSF.xml` to extract course title, resources, and organization structure.
    - Support SCORM Version (1.1, 1.2, or 2004).
    - **Enhanced Validation**: Check for manifest consistency. If a version cannot be clearly identified or if critical files are missing for the detected version, provide a descriptive warning/error to the user.


### 2. SCORM Player (RTE - Run-Time Environment)
- **iframe Isolation**: Render SCORM content within a secure `iframe`.
- **API Adapter**:
    - Implement `API` (SCORM 1.2) and `API_1484_11` (SCORM 2004) window objects.
    - Handle standard calls: `Initialize`, `Terminate`, `GetValue`, `SetValue`, `Commit`.
- **Navigation**:
    - Support multi-SCO (Shareable Content Object) navigation if the package contains multiple resources.
    - Next/Previous buttons (if controlled by LMS).

### 3. Course Library
- **Persistence**: Store uploaded SCORM packages and user progress (locally or via database).
- **Listing View**: Multi-column grid or list view showcasing all available courses.
- **Course Metadata**: Display Title, Version, Upload Date, and last accessed time.
- **Progress Tracking**: 
    - Status indicators: `Not Started`, `In Progress`, `Completed`, `Passed`, `Failed`.
    - Visual progress percentages.
- **Actions**:
    - **Launch**: Start the course from the beginning.
    - **Resume**: Continue from the last saved location (`cmi.location`).
    - **Delete**: Remove course from the library.

### 4. Analytics Dashboard
- **Overview Metrics**:
    - **Total Courses**: Number of unique courses uploaded.
    - **Completion Rate**: Percentage of completed courses vs total.
    - **Average Score**: Calculated across all scored attempts.
    - **Total Learning Time**: Sum of all session times.
- **Visualizations**:
    - **Learning Activity**: Bar or line chart showing sessions over the last 30 days.
    - **Score Distribution**: Histogram or pie chart of success vs failure.
- **Detailed Reports**:
    - Per-course deep dive: attempts count, specific data model values (`suspend_data` size, etc.).

## Navigation & Layout
The application will feature a top-level navigation bar with the following tabs:
- **Dashboard**: The main overview and starting point.
- **Course Library**: Detailed management and browsing of SCORM content.
- **Analytics**: Comprehensive data visualization and reporting.

## Suggested "Learning SCORM Journey" Features
*Ideas to enhance the educational aspect of the demo:*

1.  **Live Debugger / Console**:
    - specific panel that displays RTS (Run-Time Service) logs.
    - Show real-time calls: "Course sent `cmi.core.score.raw` = 80".
    - Allow users to "see" the communication between content and LMS.

2.  **CMI Explorer**:
    - A visual tree view of the current data model (CMI) stored for the session.
    - inspect values like `completion_status`, `success_status`, `session_time`.

3.  **Conformance Mode**:
    - Strict vs. Lenient error handling settings.
    - Badges for courses that perfectly follow the standard.

4.  **Responsive Tester**:
    - Built-in toggles to resize the SCORM iframe to simulate Mobile, Tablet, and Desktop views to test content responsiveness.
