const { firefox } = require('playwright');
const fs = require('fs').promises;
const path = require('path');
const yaml = require('js-yaml');
const { glob } = require('glob');

function slugify(str) {
    if (!str) return '';
    str = str.replace(/^\s+|\s+$/g, ''); // trim
    str = str.toLowerCase();

    // remove accents, swap ñ for n, etc
    var from = "àáäâèéëêìíïîòóöôùúüûñç·/_,:";
    var to   = "aaaaeeeeiiiioooouuuunc------";
    for (var i = 0, l = from.length; i < l; i++) {
        str = str.replace(new RegExp(from.charAt(i), 'g'), to.charAt(i));
    }

    str = str.replace(/[^a-z0-9 -]/g, '') // remove invalid chars
        .replace(/\s+/g, '-') // collapse whitespace and replace by -
        .replace(/-+/g, '-') // collapse dashes
        .replace(/donnees/g, 'donn-es'); // specific rule for this project

    return str;
}

async function buildUrlList() {
    const projectRoot = path.resolve(__dirname, '../../../');
    const moduleFiles = await glob('content/modules/*.html', { cwd: projectRoot });

    const moduleUrls = await Promise.all(
        moduleFiles.map(async (file) => {
            try {
                const filePath = path.join(projectRoot, file);
                const content = await fs.readFile(filePath, 'utf-8');
                const match = content.match(/^---\r?\n([\s\S]+?)\r?\n---/);
                if (match && match[1]) {
                    const frontmatter = yaml.load(match[1]);
                    if (frontmatter.title) {
                        const slug = slugify(frontmatter.title);
                        return `http://localhost:8081/modules/${slug}/`;
                    }
                }
            } catch (error) {
                console.error(`Could not process file ${file}:`, error);
            }
            return null;
        })
    );

    const validModuleUrls = moduleUrls.filter(Boolean);
    const staticUrls = [
        'http://localhost:8081/',
        'http://localhost:8081/leaderboard/'
    ];
    return [...staticUrls, ...validModuleUrls];
}

async function checkAccessibility() {
    let browser;
    let hasViolations = false;
    
    const isHeadless = process.env.HEADFUL !== 'true';
    if (!isHeadless) {
        console.log('*** Running in HEADFUL mode for debugging. A browser window should appear. ***');
    }

    console.log('Building dynamic URL list from module files...');
    const urls = await buildUrlList();
    console.log('--- URLs to be scanned ---');
    console.log(urls.join('\n'));
    console.log('--------------------------');

    try {
        browser = await firefox.launch({ headless: isHeadless });
        const page = await browser.newPage();
        const axeScriptContent = await fs.readFile(require.resolve('axe-core'), 'utf-8');

        page.on('console', msg => console.log(`[BROWSER LOG] ${msg.type().toUpperCase()}: ${msg.text()}`));
        page.on('requestfailed', request => console.error(`[NET FAIL] ${request.url()}: ${request.failure().errorText}`));
        page.on('response', response => {
            if (response.status() >= 400) {
                console.error(`[HTTP ERR] Status ${response.status()} for ${response.url()}`);
            }
        });
        
        console.log('Starting accessibility scan...');

        for (const url of urls) {
            console.log(`\nNavigating to: ${url}`);
            try {
                await page.goto(url, { waitUntil: 'domcontentloaded', timeout: 15000 });
                console.log(`Navigation successful.`);
            } catch (error) {
                console.error(`❌ TIMEOUT or NAVIGATION ERROR for ${url}.`);
                console.error('Details:', error.message);
                hasViolations = true;
                continue;
            }

            console.log(`Running Axe on ${url}...`);
            await page.evaluate(axeScriptContent);
            const results = await page.evaluate(() => axe.run());

            if (results.violations.length > 0) {
                hasViolations = true;
                console.error(`❌ Found ${results.violations.length} accessibility violations on ${url}:`);
                results.violations.forEach((violation, index) => {
                    console.error(`\n${index + 1}. ${violation.id} (${violation.impact})`);
                    console.error(`   Description: ${violation.description}`);
                    violation.nodes.forEach(node => {
                        console.error(`   - Element: ${node.target.join(', ')}`);
                    });
                });
            } else {
                console.log(`✅ No accessibility violations found on ${url}.`);
            }
        }
    } catch (error) {
        console.error('\nAn unexpected error occurred during the accessibility scan:', error);
        hasViolations = true;
    } finally {
        if (browser) {
            console.log('Closing browser...');
            await browser.close();
        }
    }

    if (hasViolations) {
        console.error('\nAccessibility check failed with violations.');
        process.exit(1);
    } else {
        console.log('\nAccessibility check passed for all pages.');
        process.exit(0);
    }
}

checkAccessibility();
