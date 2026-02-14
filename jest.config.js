// Jest configuration for FinEdge project
module.exports = {
    testEnvironment: 'node',
    testMatch: ['**/test/**/*.test.js'],
    testPathIgnorePatterns: ['/node_modules/', 'server.test.js'],
    collectCoverageFrom: [
        'src/**/*.js',
        '!src/server.js',
        '!src/config/**'
    ],
    coverageDirectory: 'coverage',
    verbose: true,
    forceExit: true,
    detectOpenHandles: true,
    testTimeout: 30000
};
