# Defect & Bug Tracking Log

**Project**: Online Exam Application with Auto-Grading  
**Quality Assurance Record**: Iterative Bug Tracking & Defect Resolution

---

## Defect Resolution Matrix

| Defect ID | Module / Component | Severity | Description | Root Cause | Resolution / Fix Applied | Verification Status |
| :--- | :--- | :--- | :--- | :--- | :--- | :--- |
| **BUG-001** | Backend / Environment | **Critical** | `node: command not found` on default Linux PATH | System had no global Node.js runtime installed in default PATH | Configured isolated Node.js v22 LTS binary inside `.tools/node` and created `activate.sh` | **RESOLVED & VERIFIED** |
| **BUG-002** | Frontend / Expo | **High** | Expo export web command failed due to missing metro bundler runtime | Web support requires `@expo/metro-runtime` dependency | Installed `@expo/metro-runtime@~3.2.3` in `client/package.json` | **RESOLVED & VERIFIED** |
| **BUG-003** | Auto-Grading Engine | **Medium** | Negative marking could award student a negative total score on all-wrong answers | Unbounded score subtraction without floor | Implemented `Math.max(0, totalScore)` in `GradingService.js` to prevent negative final mark | **RESOLVED & VERIFIED (TC-UNIT-03)** |
| **BUG-004** | Security / Question API | **Critical** | Student network inspection exposed `isCorrect` property on options payload | Single question query model used for both Teachers and Students | Stripped `isCorrect` from options in `GET /exams/:id/take` endpoint for non-teacher users | **RESOLVED & VERIFIED (TC-INT-03)** |
| **BUG-005** | Student Runner / Navigation | **Medium** | Student could attempt to submit the same exam multiple times | No pre-submission status verification | Added check for `status === 'SUBMITTED'` in `submissionController.js` returning 400 with existing result | **RESOLVED & VERIFIED (TC-BB-07)** |
| **BUG-006** | Performance / Testing | **Low** | Standalone load testing script hung when no existing server process was active | Autocannon script assumed external daemon | Enhanced `load_test.js` to self-bind an in-process server instance on port 5055 and shut down cleanly upon completion | **RESOLVED & VERIFIED** |
| **BUG-007** | Frontend / Web Bundler | **High** | Browser console error `(0, _expoModulesCore.registerWebModule) is not a function` causing blank white screen | `@expo/vector-icons` wildcard peer dependency pulled mismatched canary `expo-font@57.0.3` instead of Expo 51's `expo-font@12.0.10` | Locked and installed `expo-font@~12.0.10` in `client/package.json` | **RESOLVED & VERIFIED** |
