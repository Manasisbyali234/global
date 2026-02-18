const mongoose = require('mongoose');
require('dotenv').config();

const colors = {
  reset: '\x1b[0m',
  red: '\x1b[31m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  cyan: '\x1b[36m'
};

const log = {
  success: (msg) => console.log(`${colors.green}✓${colors.reset} ${msg}`),
  error: (msg) => console.log(`${colors.red}✗${colors.reset} ${msg}`),
  warning: (msg) => console.log(`${colors.yellow}⚠${colors.reset} ${msg}`),
  info: (msg) => console.log(`${colors.cyan}ℹ${colors.reset} ${msg}`),
  header: (msg) => console.log(`\n${colors.blue}${msg}${colors.reset}`)
};

const preDeploymentCheck = async () => {
  console.log('\n╔════════════════════════════════════════════════════════════╗');
  console.log('║        PRE-DEPLOYMENT READINESS CHECK                      ║');
  console.log('╚════════════════════════════════════════════════════════════╝');

  let allChecksPassed = true;
  const issues = [];
  const warnings = [];

  try {
    // Check 1: Environment Variables
    log.header('1. Environment Variables');
    
    const requiredEnvVars = ['MONGODB_URI', 'JWT_SECRET', 'NODE_ENV'];
    requiredEnvVars.forEach(varName => {
      if (process.env[varName]) {
        log.success(`${varName} is set`);
      } else {
        log.error(`${varName} is missing`);
        issues.push(`Missing environment variable: ${varName}`);
        allChecksPassed = false;
      }
    });

    // Check 2: Database Connection
    log.header('2. Database Connection');
    try {
      await mongoose.connect(process.env.MONGODB_URI, {
        serverSelectionTimeoutMS: 5000
      });
      log.success('Database connection successful');
    } catch (error) {
      log.error(`Database connection failed: ${error.message}`);
      issues.push('Cannot connect to database');
      allChecksPassed = false;
      process.exit(1);
    }

    const db = mongoose.connection.db;

    // Check 3: Collections Exist
    log.header('3. Required Collections');
    const collections = await db.listCollections().toArray();
    const collectionNames = collections.map(c => c.name);
    
    const requiredCollections = ['candidates', 'candidateprofiles'];
    requiredCollections.forEach(collName => {
      if (collectionNames.includes(collName)) {
        log.success(`Collection '${collName}' exists`);
      } else {
        log.warning(`Collection '${collName}' does not exist (will be created on first use)`);
        warnings.push(`Collection '${collName}' will be created on first use`);
      }
    });

    // Check 4: Null candidateId Records
    log.header('4. Data Integrity - Null candidateId');
    const candidateProfilesCollection = db.collection('candidateprofiles');
    const nullCount = await candidateProfilesCollection.countDocuments({ candidateId: null });
    
    if (nullCount === 0) {
      log.success('No null candidateId records found');
    } else {
      log.error(`Found ${nullCount} records with null candidateId`);
      issues.push(`${nullCount} profiles have null candidateId - run fixNullCandidateIds.js`);
      allChecksPassed = false;
    }

    // Check 5: Index Configuration
    log.header('5. Index Configuration');
    const indexes = await candidateProfilesCollection.indexes();
    const candidateIdIndex = indexes.find(idx => idx.key.candidateId);
    
    if (candidateIdIndex) {
      if (candidateIdIndex.unique) {
        log.success('candidateId has unique index');
      } else {
        log.error('candidateId index exists but is not unique');
        issues.push('candidateId index is not unique - run createIndexes.js');
        allChecksPassed = false;
      }
    } else {
      log.error('candidateId index does not exist');
      issues.push('candidateId index missing - run createIndexes.js');
      allChecksPassed = false;
    }

    // Check 6: Model Files
    log.header('6. Model Files');
    const fs = require('fs');
    const path = require('path');
    
    const modelPath = path.join(__dirname, '../models/CandidateProfile.js');
    if (fs.existsSync(modelPath)) {
      const modelContent = fs.readFileSync(modelPath, 'utf8');
      
      // Check for validation
      if (modelContent.includes('validate:') && modelContent.includes('Candidate ID')) {
        log.success('CandidateProfile model has enhanced validation');
      } else {
        log.warning('CandidateProfile model may not have enhanced validation');
        warnings.push('Verify CandidateProfile.js has latest validation code');
      }
      
      // Check for pre-save hook
      if (modelContent.includes('pre(\'save\'') && modelContent.includes('candidateId')) {
        log.success('CandidateProfile model has pre-save validation hook');
      } else {
        log.warning('CandidateProfile model may not have pre-save hook');
        warnings.push('Verify CandidateProfile.js has pre-save hook');
      }
    } else {
      log.error('CandidateProfile model file not found');
      issues.push('CandidateProfile.js not found');
      allChecksPassed = false;
    }

    // Check 7: Controller Files
    log.header('7. Controller Files');
    const controllerPath = path.join(__dirname, '../controllers/candidateController.js');
    if (fs.existsSync(controllerPath)) {
      const controllerContent = fs.readFileSync(controllerPath, 'utf8');
      
      // Check for validation
      if (controllerContent.includes('if (!candidate._id)')) {
        log.success('candidateController has candidateId validation');
      } else {
        log.warning('candidateController may not have candidateId validation');
        warnings.push('Verify candidateController.js has validation code');
      }
      
      // Check for rollback
      if (controllerContent.includes('findByIdAndDelete') && controllerContent.includes('rollback')) {
        log.success('candidateController has rollback mechanism');
      } else {
        log.warning('candidateController may not have rollback mechanism');
        warnings.push('Verify candidateController.js has rollback code');
      }
    } else {
      log.error('candidateController file not found');
      issues.push('candidateController.js not found');
      allChecksPassed = false;
    }

    // Check 8: Database Statistics
    log.header('8. Database Statistics');
    const candidatesCollection = db.collection('candidates');
    const totalCandidates = await candidatesCollection.countDocuments();
    const totalProfiles = await candidateProfilesCollection.countDocuments();
    
    log.info(`Total Candidates: ${totalCandidates}`);
    log.info(`Total Profiles: ${totalProfiles}`);
    
    const difference = Math.abs(totalCandidates - totalProfiles);
    if (difference === 0) {
      log.success('Candidate and Profile counts match');
    } else if (difference <= 5) {
      log.warning(`Small difference in counts: ${difference}`);
      warnings.push(`${difference} candidates without profiles or vice versa`);
    } else {
      log.warning(`Significant difference in counts: ${difference}`);
      warnings.push(`${difference} candidates without profiles or vice versa - may need cleanup`);
    }

    // Check 9: Recent Registrations Test
    log.header('9. Recent Registrations Check');
    const recentCandidates = await candidatesCollection
      .find({})
      .sort({ createdAt: -1 })
      .limit(5)
      .toArray();
    
    if (recentCandidates.length > 0) {
      log.info(`Checking last ${recentCandidates.length} registrations...`);
      let allHaveProfiles = true;
      
      for (const candidate of recentCandidates) {
        const hasProfile = await candidateProfilesCollection.findOne({ 
          candidateId: candidate._id 
        });
        if (!hasProfile) {
          log.warning(`Candidate ${candidate.email} has no profile`);
          allHaveProfiles = false;
        }
      }
      
      if (allHaveProfiles) {
        log.success('All recent candidates have profiles');
      } else {
        warnings.push('Some recent candidates are missing profiles');
      }
    } else {
      log.info('No candidates in database yet');
    }

    // Final Summary
    console.log('\n╔════════════════════════════════════════════════════════════╗');
    console.log('║                    SUMMARY                                 ║');
    console.log('╚════════════════════════════════════════════════════════════╝\n');

    if (allChecksPassed && issues.length === 0) {
      log.success('ALL CHECKS PASSED! System is ready for deployment.');
      
      if (warnings.length > 0) {
        console.log(`\n${colors.yellow}Warnings (${warnings.length}):${colors.reset}`);
        warnings.forEach((warning, i) => {
          console.log(`  ${i + 1}. ${warning}`);
        });
      }
      
      console.log('\n✅ You can proceed with deployment.');
    } else {
      log.error(`DEPLOYMENT NOT READY - ${issues.length} critical issue(s) found`);
      
      console.log(`\n${colors.red}Critical Issues:${colors.reset}`);
      issues.forEach((issue, i) => {
        console.log(`  ${i + 1}. ${issue}`);
      });
      
      if (warnings.length > 0) {
        console.log(`\n${colors.yellow}Warnings:${colors.reset}`);
        warnings.forEach((warning, i) => {
          console.log(`  ${i + 1}. ${warning}`);
        });
      }
      
      console.log('\n❌ Fix the critical issues before deploying.');
      console.log('\nRecommended actions:');
      console.log('  1. Run: node scripts/fixNullCandidateIds.js');
      console.log('  2. Run: node scripts/createIndexes.js');
      console.log('  3. Run this check again');
    }

    console.log('\n');
    process.exit(allChecksPassed ? 0 : 1);

  } catch (error) {
    console.error('\n❌ Pre-deployment check failed:', error.message);
    console.error('\nFull error:', error);
    process.exit(1);
  }
};

preDeploymentCheck();
