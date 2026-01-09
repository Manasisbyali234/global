@echo off
echo Testing server health...
curl -X GET http://localhost:5000/health
echo.
echo.
echo Testing assessment endpoint (should return 401 Unauthorized)...
curl -X POST http://localhost:5000/api/candidate/assessments/submit -H "Content-Type: application/json" -d "{\"attemptId\":\"test\",\"violations\":[]}"
echo.
echo.
echo Test completed.