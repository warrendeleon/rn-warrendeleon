/* eslint-disable @typescript-eslint/no-require-imports */
/* eslint-disable no-undef */
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
        this.log('\n');
      }

      if (envelope.testRunFinished) {
        this.log('\n');
        this.log(chalk.bold('Summary:\n'));
        // The summary will be printed by Cucumber's default mechanism
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
