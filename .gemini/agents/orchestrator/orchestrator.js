const { exec } = require('child_process');
const path = require('path');

// Resolve paths relative to the project root
const projectRoot = path.resolve(__dirname, '../../../'); 
const healthCheckScript = path.join(projectRoot, '.gemini/agents/health-check/health-check.js');
const a11yScript = path.join(projectRoot, '.gemini/agents/accessibility/check-accessibility.js');
const playwrightConfig = path.join(projectRoot, '.gemini/agents/testing/playwright.config.js');

const commands = {
  healthCheck: `node ${healthCheckScript}`,
  runTests: `npx playwright test`,
  a11yCheck: `node ${a11yScript}`
};

function runCommand(name, command, cwd = projectRoot) {
    return new Promise((resolve, reject) => {
        console.log(`\n▶️  Running: ${name}...`);
        const child = exec(command, { cwd, timeout: 60000 }, (error, stdout, stderr) => {
            if (error) {
                if (error.signal === 'SIGTERM') {
                    console.error(`❌ Failure: ${name} timed out after 60 seconds.`);
                } else {
                    console.error(`❌ Failure: ${name} failed with exit code ${error.code}.`);
                }
                // We still print stdout/stderr for context on failure
                if (stdout) console.log(stdout);
                if (stderr) console.error(stderr);
                reject(new Error(`${name} failed.`));
            } else {
                if (stdout) console.log(stdout);
                if (stderr) console.error(stderr);
                console.log(`✅ Success: ${name} completed.`);
                resolve();
            }
        });
    });
}

async function runValidation() {
  const geminiRoot = path.join(projectRoot, '.gemini');
  try {
    await runCommand('Health Check', commands.healthCheck, projectRoot);
    await runCommand('E2E Tests', commands.runTests, geminiRoot);
    await runCommand('Accessibility Check', commands.a11yCheck, projectRoot);

    console.log('\n🎉  Validation successful! All checks passed.');
    process.exit(0);
  } catch (error) {
    console.error('\n🛑  Validation failed. Please check the errors above.');
    process.exit(1);
  }
}

runValidation();
