const { Formatter } = require('@cucumber/cucumber');
const chalk = require('chalk');

/**
 * Custom Cucumber formatter that shows checkmarks for passing tests
 * Based on the pretty formatter but adds ✓/✗ symbols for each step
 */
class CheckmarkFormatter extends Formatter {
  constructor(options) {
    super(options);

    this.features = new Map();
    this.picklesById = new Map();
    this.testCasesById = new Map();
    this.currentFeature = null;

    // Track counts for summary
    this.scenarioCounts = { passed: 0, failed: 0, skipped: 0, pending: 0 };
    this.stepCounts = { passed: 0, failed: 0, skipped: 0, pending: 0 };
    this.currentScenarioStatus = 'PASSED'; // Track current scenario's worst status

    options.eventBroadcaster.on('envelope', envelope => {
      // Store pickles with their names and URIs
      if (envelope.pickle) {
        this.picklesById.set(envelope.pickle.id, {
          name: envelope.pickle.name,
          uri: envelope.pickle.uri,
        });
      }

      // Track test cases and link them to pickles
      if (envelope.testCase) {
        const pickle = this.picklesById.get(envelope.testCase.pickleId);
        this.testCasesById.set(envelope.testCase.id, {
          pickleId: envelope.testCase.pickleId,
          uri: pickle ? pickle.uri : null,
          name: pickle ? pickle.name : null,
        });
      }
      if (envelope.testRunStarted) {
        this.log('\n');
      }

      // Store feature info but don't print yet
      if (envelope.gherkinDocument) {
        const doc = envelope.gherkinDocument;
        if (doc.feature) {
          this.features.set(doc.uri, {
            name: doc.feature.name,
            description: doc.feature.description,
          });
        }
      }

      // Store pickle (scenario) info but don't print yet
      if (envelope.pickle) {
        this.currentPickle = envelope.pickle;
      }

      // Print feature and scenario when test case actually starts
      if (envelope.testCaseStarted) {
        // Reset scenario status for this new test case
        this.currentScenarioStatus = 'PASSED';

        const testCase = this.testCasesById.get(envelope.testCaseStarted.testCaseId);
        if (testCase && testCase.uri) {
          const feature = this.features.get(testCase.uri);

          // Print feature header only once per feature
          if (feature && this.currentFeature !== feature.name) {
            if (this.currentFeature) {
              this.log('\n'); // Add space between features
            }
            this.log(chalk.bold.cyan(`Feature: ${feature.name}\n`));
            if (feature.description) {
              this.log(chalk.gray(`  ${feature.description.trim()}\n`));
            }
            this.log('\n');
            this.currentFeature = feature.name;
          }

          // Print scenario name from test case
          if (testCase.name) {
            this.log(chalk.bold(`  Scenario: ${testCase.name}\n`));
          }
        }
      }

      if (envelope.testStepFinished) {
        const { testStepId, testStepResult } = envelope.testStepFinished;
        const step = this.getStepFromTestStepId(testStepId);

        if (step && step.text) {
          const status = testStepResult.status;
          const duration = (testStepResult.duration?.nanos || 0) / 1000000; // Convert to ms

          // Track step counts
          if (status === 'PASSED') {
            this.stepCounts.passed++;
          } else if (status === 'FAILED') {
            this.stepCounts.failed++;
            this.currentScenarioStatus = 'FAILED';
          } else if (status === 'SKIPPED') {
            this.stepCounts.skipped++;
            if (this.currentScenarioStatus !== 'FAILED') {
              this.currentScenarioStatus = 'SKIPPED';
            }
          } else if (status === 'PENDING') {
            this.stepCounts.pending++;
            if (
              this.currentScenarioStatus !== 'FAILED' &&
              this.currentScenarioStatus !== 'SKIPPED'
            ) {
              this.currentScenarioStatus = 'PENDING';
            }
          }

          let symbol;
          let statusText;

          if (status === 'PASSED') {
            symbol = chalk.green('✓');
            statusText = chalk.gray(step.text);
          } else if (status === 'FAILED') {
            symbol = chalk.red('✗');
            statusText = chalk.red(step.text);
          } else if (status === 'SKIPPED') {
            symbol = chalk.yellow('○');
            statusText = chalk.yellow(step.text);
          } else if (status === 'PENDING') {
            symbol = chalk.yellow('?');
            statusText = chalk.yellow(step.text);
          } else {
            symbol = chalk.gray('-');
            statusText = chalk.gray(step.text);
          }

          this.log(`    ${symbol} ${statusText}`);
          if (duration > 0) {
            this.log(chalk.gray(` (${duration.toFixed(0)}ms)`));
          }
          this.log('\n');

          // If failed, show error message
          if (status === 'FAILED' && testStepResult.message) {
            this.log(chalk.red(`      ${testStepResult.message}\n`));
          }
        }
      }

      if (envelope.testCaseFinished) {
        // Count scenario based on its final status
        if (this.currentScenarioStatus === 'PASSED') {
          this.scenarioCounts.passed++;
        } else if (this.currentScenarioStatus === 'FAILED') {
          this.scenarioCounts.failed++;
        } else if (this.currentScenarioStatus === 'SKIPPED') {
          this.scenarioCounts.skipped++;
        } else if (this.currentScenarioStatus === 'PENDING') {
          this.scenarioCounts.pending++;
        }
        this.log('\n');
      }

      if (envelope.testRunFinished) {
        this.log('\n');
        this.log(chalk.bold('Summary:\n'));

        // Calculate totals
        const totalScenarios =
          this.scenarioCounts.passed +
          this.scenarioCounts.failed +
          this.scenarioCounts.skipped +
          this.scenarioCounts.pending;
        const totalSteps =
          this.stepCounts.passed +
          this.stepCounts.failed +
          this.stepCounts.skipped +
          this.stepCounts.pending;

        // Build scenario summary string
        const scenarioDetails = [];
        if (this.scenarioCounts.passed > 0) {
          scenarioDetails.push(chalk.green(`${this.scenarioCounts.passed} passed`));
        }
        if (this.scenarioCounts.failed > 0) {
          scenarioDetails.push(chalk.red(`${this.scenarioCounts.failed} failed`));
        }
        if (this.scenarioCounts.skipped > 0) {
          scenarioDetails.push(chalk.yellow(`${this.scenarioCounts.skipped} skipped`));
        }
        if (this.scenarioCounts.pending > 0) {
          scenarioDetails.push(chalk.yellow(`${this.scenarioCounts.pending} pending`));
        }

        // Build step summary string
        const stepDetails = [];
        if (this.stepCounts.passed > 0) {
          stepDetails.push(chalk.green(`${this.stepCounts.passed} passed`));
        }
        if (this.stepCounts.failed > 0) {
          stepDetails.push(chalk.red(`${this.stepCounts.failed} failed`));
        }
        if (this.stepCounts.skipped > 0) {
          stepDetails.push(chalk.yellow(`${this.stepCounts.skipped} skipped`));
        }
        if (this.stepCounts.pending > 0) {
          stepDetails.push(chalk.yellow(`${this.stepCounts.pending} pending`));
        }

        // Print summary
        this.log(`  Scenarios: ${totalScenarios} (${scenarioDetails.join(', ')})\n`);
        this.log(`  Steps:     ${totalSteps} (${stepDetails.join(', ')})\n`);

        // Print duration if available
        if (envelope.testRunFinished.timestamp) {
          this.log('\n');
        }
      }
    });

    // Store steps by test step ID
    this.stepsByTestStepId = new Map();

    options.eventBroadcaster.on('envelope', envelope => {
      if (envelope.testCase) {
        envelope.testCase.testSteps.forEach(testStep => {
          if (testStep.pickleStepId) {
            this.stepsByTestStepId.set(testStep.id, testStep.pickleStepId);
          }
        });
      }

      if (envelope.pickle) {
        envelope.pickle.steps.forEach(step => {
          this.stepsByPickleStepId = this.stepsByPickleStepId || new Map();
          this.stepsByPickleStepId.set(step.id, step);
        });
      }
    });
  }

  getStepFromTestStepId(testStepId) {
    const pickleStepId = this.stepsByTestStepId.get(testStepId);
    if (!pickleStepId || !this.stepsByPickleStepId) {
      return null;
    }
    return this.stepsByPickleStepId.get(pickleStepId);
  }
}

module.exports = CheckmarkFormatter;
