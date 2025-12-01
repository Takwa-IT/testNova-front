# TODO: Implement Test Results Storage and Display

## Backend Changes
- [x] Create UserTestResult entity (UserTestResult.java)
- [x] Create UserTestResultRepository (UserTestResultRepository.java)
- [x] Modify TestController.correctTest to save TestResult to DB
- [x] Add GET /api/test/user/{userId} endpoint to retrieve user's test results

## Frontend Changes
- [x] Add TestResult interface in src/app/models/test.model.ts
- [x] Add getUserTestResults method in src/app/services/auth.service.ts
- [x] Modify profile-info.component.ts to fetch and display test results
- [x] Modify profile-info.component.html to add "Mes tests" section

## Followup
- [ ] Test saving and retrieving test results
- [ ] Ensure frontend displays correctly
