import { browser } from 'k6/experimental/browser'

import { check } from 'k6'

// Thresholds configurations
export const SUCCESS_RATE_THRESHOLD = 0.95
export const FCP_DURATION_MILLISECONDS = 1000
export const LCP_DURATION_MILLISECONDS = 3000

/** @type {import('@types/k6/options').Options} */
export const options = {
    scenarios: {
        single: {
            executor: 'per-vu-iterations',
            vus: 1,
            iterations: 1,
            maxDuration: '3s',
            gracefulStop: '2s',
            options: {
                browser: {
                    type: 'chromium',
                },
            }
        },
        single_load: {
            executor: 'per-vu-iterations',
            vus: 10,
            iterations: 1,
            maxDuration: '7s',
            gracefulStop: '3s',
            startTime: '5s',
            options: {
                browser: {
                    type: 'chromium',
                },
            }
        },
        load: {
            executor: 'constant-vus',
            vus: 10,
            duration: `4m`,
            gracefulStop: '1m',
            startTime: '15s',
            options: {
                browser: {
                    type: 'chromium',
                },
            }
        }
    },
    thresholds: {
        checks: [`rate >= ${SUCCESS_RATE_THRESHOLD}`],
        'checks{check:server_responded}': [`rate >= ${SUCCESS_RATE_THRESHOLD}`],
        'checks{check:page_loaded}': [`rate >= ${SUCCESS_RATE_THRESHOLD}`],
        browser_web_vital_fcp: [`p(90) <= ${FCP_DURATION_MILLISECONDS}`],
        browser_web_vital_lcp: [`p(90) <= ${LCP_DURATION_MILLISECONDS}`],
        
        'checks{scenario:single}': [`rate >= ${SUCCESS_RATE_THRESHOLD}`],
        'checks{scenario:single,check:server_responded}': [`rate >= ${SUCCESS_RATE_THRESHOLD}`],
        'checks{scenario:single,check:page_loaded}': [`rate >= ${SUCCESS_RATE_THRESHOLD}`],
        'browser_web_vital_fcp{scenario:single}': [`p(90) <= ${FCP_DURATION_MILLISECONDS}`],
        'browser_web_vital_lcp{scenario:single}': [`p(90) <= ${LCP_DURATION_MILLISECONDS}`],
        
        'checks{scenario:single_load}': [`rate >= ${SUCCESS_RATE_THRESHOLD}`],
        'checks{scenario:single_load,check:server_responded}': [`rate >= ${SUCCESS_RATE_THRESHOLD}`],
        'checks{scenario:single_load,check:page_loaded}': [`rate >= ${SUCCESS_RATE_THRESHOLD}`],
        'browser_web_vital_fcp{scenario:single_load}': [`p(90) <= ${FCP_DURATION_MILLISECONDS}`],
        'browser_web_vital_lcp{scenario:single_load}': [`p(90) <= ${LCP_DURATION_MILLISECONDS}`],
        
        'checks{scenario:load}': [`rate >= ${SUCCESS_RATE_THRESHOLD}`],
        'checks{scenario:load,check:server_responded}': [`rate >= ${SUCCESS_RATE_THRESHOLD}`],
        'checks{scenario:load,check:page_loaded}': [`rate >= ${SUCCESS_RATE_THRESHOLD}`],
        'browser_web_vital_fcp{scenario:load}': [`p(90) <= ${FCP_DURATION_MILLISECONDS}`],
        'browser_web_vital_lcp{scenario:load}': [`p(90) <= ${LCP_DURATION_MILLISECONDS}`],
        
    },
}

// Test
export default async function () {
    const page = browser.newPage()

    const loaderSelector = '.pn-loading.pn-arc'
    let server_responded = false
    try {
        // Send request to server
        const response = await page.goto('http://localhost:5555/')
        server_responded = response.ok()

        // Wait for loaders to disappear
        page.waitForSelector(loaderSelector, {state: 'detached', strict: false})

    } finally {
        // Check if page was fully loaded
        check(server_responded, { 'server_responded': (sr) => sr })
        check(page, { 'page_loaded': p => server_responded && p.isHidden(loaderSelector, {strict: false}) })

        page.close()
    }
}
