# GeoHub Tournament System - Implementation Progress

## Overview
This document tracks the implementation of the comprehensive tournament system for GeoHub as specified in the GitHub issue.

## ✅ Completed Work

### Phase 1: Database Models & Types (COMPLETE)
**Files Created:**
- `@types/Participant.ts` - Participant type definition
- `@types/Tournament.ts` - Tournament type definition  
- `@types/TournamentParticipant.ts` - Junction table type
- `@types/Round.ts` - Round type definition
- `@types/TournamentGuess.ts` - Guess type definition
- `backend/models/participant.ts` - Participant model
- `backend/models/tournament.ts` - Tournament model
- `backend/models/tournamentParticipant.ts` - Junction model
- `backend/models/round.ts` - Round model
- `backend/models/tournamentGuess.ts` - Guess model
- `backend/utils/generateParticipantId.ts` - Auto-generates PART-{timestamp}-{random} IDs
- `backend/utils/generateAccessCode.ts` - Generates unique 8-char codes
- `backend/utils/calculateTournamentScore.ts` - GeoGuessr scoring formula

**Database Changes:**
- Updated `backend/utils/dbConnect.ts` with new collections:
  - participants
  - tournaments
  - tournamentParticipants
  - rounds
  - tournamentGuesses

**Type Updates:**
- Updated `backend/models/user.ts` to include `role: 'ADMIN'` field
- Updated `@types/index.ts` to export new types

### Phase 2: Admin Setup & Authentication (COMPLETE)
**Files Created:**
- `pages/admin/setup.tsx` - Initial admin account creation page
- `pages/admin/index.tsx` - Admin login page  
- `pages/admin/dashboard.tsx` - Basic dashboard (placeholder)
- `pages/api/admin/setup.ts` - API route for creating first admin
- `pages/api/admin/check-setup.ts` - API route to check if setup is needed

**Features Implemented:**
- First-time setup flow (only accessible if no users exist)
- Admin login with rate limiting (5 attempts per 15 min)
- Password validation (8+ chars, uppercase, lowercase, numbers)
- Email and username validation
- Auto-redirect logic based on setup status

**Type Updates:**
- Updated `@types/next-auth.d.ts` to include `role?: 'ADMIN'` in session
- Updated `@types/Page.ts` to include `noNav?: boolean` option
- Updated `pages/api/auth/[...nextauth].ts` to include role in session

## 📋 Remaining Work

### Phase 3: Admin Panel Layout & Users Section
**What's Needed:**
1. Create admin panel layout component with:
   - Sidebar navigation (Users, Participants, Games tabs)
   - Header with admin info and logout
   - Main content area
   
2. Users Section Implementation:
   - List all admin users in a table
   - Add User modal/form
   - Edit User modal/form
   - Delete User with confirmation
   - Prevent deletion of last admin user

**Files to Create:**
- `components/admin/AdminLayout.tsx`
- `components/admin/Sidebar.tsx`
- `components/admin/UsersSection.tsx`
- `pages/admin/dashboard/users.tsx`
- `pages/api/admin/users/index.ts` (GET, POST)
- `pages/api/admin/users/[id].ts` (PUT, DELETE)

### Phase 4: Admin Panel - Participants Section
**What's Needed:**
1. Participants CRUD interface:
   - Table with columns: Participant ID, Name, Surname, Notes, Created At, Actions
   - Add Participant modal with auto-ID generation
   - Edit Participant modal
   - Delete with validation (not in active tournaments)
   - Search/filter by name, surname, or ID
   - Pagination (50 per page)
   - Export to CSV functionality

**Files to Create:**
- `components/admin/ParticipantsSection.tsx`
- `components/admin/ParticipantModal.tsx`
- `pages/admin/dashboard/participants.tsx`
- `pages/api/admin/participants/index.ts` (GET, POST)
- `pages/api/admin/participants/[id].ts` (GET, PUT, DELETE)
- `pages/api/admin/participants/export.ts` (CSV export)

### Phase 5: Admin Panel - Tournaments Section
**What's Needed:**
1. Tournaments list view:
   - Table with visual states (active/finished/cancelled)
   - Columns: Name, Date, Participants, Gamemode, Status, Actions
   - Three-dots menu per tournament
   
2. Create/Edit Tournament form:
   - Basic info: Name, Date, Notes
   - Participant multi-select with search
   - Gamemode configuration:
     * Fairness Mode dropdown (3 options)
     * Map Pool dropdown (10+ options)
     * Number of Rounds input (1-50)
   - Auto-generate access codes for each participant

**Files to Create:**
- `components/admin/TournamentsSection.tsx`
- `components/admin/TournamentForm.tsx`
- `components/admin/GamemodeConfig.tsx`
- `pages/admin/dashboard/tournaments.tsx`
- `pages/api/admin/tournaments/index.ts` (GET, POST)
- `pages/api/admin/tournaments/[id].ts` (GET, PUT, DELETE)
- `pages/api/admin/tournaments/[id]/generate-codes.ts`

### Phase 6: Tournament Management - General Tab
**What's Needed:**
1. Tournament Controls panel:
   - Start/Pause/Resume/End buttons
   - Status badge display
   
2. Tournament Info panel:
   - Read-only tournament details
   - Gamemaster notes (editable textarea with auto-save)
   
3. Attendee Codes panel:
   - Table with: Participant Name, Access Code, Status, Actions
   - Copy code buttons
   - Individual pause/resume
   - Kick/reset actions
   
4. Live Scoreboard:
   - Real-time table with all participants
   - Columns: Rank, Participant, Current Round, Total Score, Avg Distance, Last Guess, Status
   - Auto-refresh every 2 seconds
   - Medal icons for top 3

**Files to Create:**
- `pages/admin/tournaments/[id]/manage.tsx`
- `components/tournament/TournamentControls.tsx`
- `components/tournament/TournamentInfo.tsx`
- `components/tournament/AttendeeCodes.tsx`
- `components/tournament/LiveScoreboard.tsx`
- `pages/api/tournaments/[id]/start.ts`
- `pages/api/tournaments/[id]/pause.ts`
- `pages/api/tournaments/[id]/resume.ts`
- `pages/api/tournaments/[id]/end.ts`
- `pages/api/tournaments/[id]/participants/[participantId]/pause.ts`
- `pages/api/tournaments/[id]/scoreboard.ts`

### Phase 7: Tournament Management - Attendees Tab
**What's Needed:**
1. Grid view of participant screens:
   - Responsive 2x2, 3x3, or 4x4 grid
   - Each card shows:
     * Participant name
     * Real-time screen capture
     * Current round/score/time
     * Status badge
     * Mini-map with last guess
     * Quick pause/resume button
   - Click to expand full screen
   - Filters (All, Playing, Paused, Finished)

**Files to Create:**
- `components/tournament/AttendeesGrid.tsx`
- `components/tournament/ParticipantCard.tsx`
- WebSocket setup (see Phase 9)

### Phase 8: Participant Experience
**What's Needed:**
1. Homepage modification:
   - Add tournament code input (centered, large)
   - Validate and redirect to lobby
   
2. Tournament lobby:
   - Display tournament name
   - "Waiting for gamemaster..." message
   - List of connected participants
   - Countdown if scheduled
   
3. Game modifications:
   - Pause overlay (non-dismissible)
   - Round transition screens
   - Tournament-specific scoring
   
4. Results page:
   - Final standings
   - Personal stats
   - Exit button

**Files to Create:**
- Modify `pages/index.tsx` (add code input)
- `pages/tournament/[code]/lobby.tsx`
- `components/tournament/PauseOverlay.tsx`
- `components/tournament/RoundTransition.tsx`
- `pages/tournament/[code]/results.tsx`
- `pages/api/tournament/validate-code.ts`
- `pages/api/tournament/[code]/join.ts`

### Phase 9: WebSocket & Real-time Communication
**What's Needed:**
1. Set up Socket.io server
2. Implement event handlers for:
   - Tournament start/pause/resume/end
   - Participant connect/disconnect
   - Guess submission
   - Scoreboard updates
   - Individual pause/resume
   - Screen sharing/capture
   - Heartbeat mechanism

**Files to Create:**
- `pages/api/socket.ts` - Socket.io server setup
- `utils/socket/tournamentEvents.ts` - Tournament event handlers
- `utils/socket/participantEvents.ts` - Participant event handlers
- `utils/socket/gamemasterEvents.ts` - Gamemaster event handlers
- `hooks/useTournamentSocket.ts` - React hook for socket connection
- `hooks/useParticipantSocket.ts` - React hook for participants

**Events to Implement:**
```typescript
// Server → Participant
'tournament:started'
'tournament:paused'
'tournament:resumed'
'tournament:ended'
'participant:paused'
'participant:resumed'
'round:next'

// Participant → Server
'participant:connected'
'participant:ready'
'guess:submitted'
'participant:heartbeat'

// Server → Gamemaster
'participant:status_changed'
'guess:received'
'scoreboard:updated'
```

### Phase 10: Scoring & Calculations (Partially Complete)
**Already Have:**
- `calculateTournamentScore.ts` - Score calculation function

**Still Need:**
- Distance calculation between two lat/long points
- Scoreboard aggregation logic
- Round completion tracking
- Fairness mode implementation (map distribution logic)

**Files to Create:**
- `backend/utils/calculateDistance.ts` (already exists, verify compatibility)
- `backend/utils/generateRounds.ts` - Create rounds based on fairness mode
- `backend/queries/getScoreboard.ts` - Aggregate participant scores
- `backend/queries/updateParticipantScore.ts`

### Phase 11: Security & Validation
**What's Needed:**
1. Middleware for route protection
2. Input validation with Zod schemas
3. Rate limiting on all API routes
4. XSS/SQL injection prevention
5. CSRF protection

**Files to Create:**
- `middleware/requireAdmin.ts` - Admin route protection
- `middleware/requireTournamentAccess.ts` - Tournament access validation
- `middleware/rateLimiter.ts` - Rate limiting middleware
- `backend/validations/tournament.ts` - Zod schemas for tournaments
- `backend/validations/participant.ts` - Zod schemas for participants

### Phase 12: Testing & Refinement
**What's Needed:**
- Integration tests for tournament flow
- WebSocket connection tests
- Multi-participant load tests
- UI/UX improvements
- Performance optimization
- Error handling improvements

## 🔧 Technology Stack
- **Frontend**: React, Next.js, TypeScript
- **Backend**: Next.js API Routes
- **Database**: MongoDB (already configured)
- **Real-time**: Socket.io (needs to be added)
- **Auth**: NextAuth.js (already configured)
- **Styling**: Styled Components (already in use)
- **Validation**: Zod (already in package.json)

## 📦 Dependencies to Add
```json
{
  "socket.io": "^4.x",
  "socket.io-client": "^4.x"
}
```

## 🚀 Recommended Development Order
1. ✅ Phase 1 & 2 (COMPLETE)
2. Phase 3: Admin layout and users
3. Phase 4: Participants section
4. Phase 5: Tournaments list and create
5. Phase 9: WebSocket setup (needed for phases 6-8)
6. Phase 6: Tournament management (General tab)
7. Phase 8: Participant experience
8. Phase 7: Attendees monitoring
9. Phase 10: Complete scoring logic
10. Phase 11: Security hardening
11. Phase 12: Testing and refinement

## 📝 Notes
- This is a MASSIVE undertaking - essentially building a complete new application
- Estimated total: 5000+ lines of new code across 50+ new files
- The foundation is solid - models, types, and auth are in place
- Consider breaking this into multiple PRs for easier review
- WebSocket implementation is critical - many features depend on it
- Testing with multiple concurrent users will be essential

## 🔗 Key Integrations Needed
1. Integrate tournament system with existing GeoHub game engine
2. Ensure compatibility with existing map system
3. Adapt location/round generation for tournament modes
4. Modify game state management for multi-player scenarios

## ⚠️ Challenges to Address
1. Real-time screen sharing/monitoring at scale
2. Managing WebSocket connections for many participants
3. Ensuring fairness in map randomization modes
4. Preventing cheating/coordination between participants
5. Handling disconnections and reconnections gracefully
6. Performance with large tournaments (50+ participants)
