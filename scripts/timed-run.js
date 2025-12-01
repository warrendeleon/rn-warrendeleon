#!/usr/bin/env node
/* global console */
/**
 * Wrapper script that times command execution and prints duration.
 * Usage: node scripts/timed-run.js <command> [args...]
 */

const { spawn } = require('child_process');

const args = process.argv.slice(2);
if (args.length === 0) {
  console.error('Usage: node scripts/timed-run.js <command> [args...]');
  process.exit(1);
}

const startTime = Date.now();
const command = args[0];
const commandArgs = args.slice(1);

console.log(`\n⏱️  Starting: ${args.join(' ')}\n`);

const child = spawn(command, commandArgs, {
  stdio: 'inherit',
  shell: true,
});

child.on('close', code => {
  const endTime = Date.now();
  const durationMs = endTime - startTime;
  const durationSec = Math.floor(durationMs / 1000);
  const minutes = Math.floor(durationSec / 60);
  const seconds = durationSec % 60;

  const timeStr = minutes > 0 ? `${minutes}m ${seconds}s` : `${seconds}s`;

  console.log('\n' + '─'.repeat(50));
  if (code === 0) {
    console.log(`✅ Completed in ${timeStr}`);
  } else {
    console.log(`❌ Failed after ${timeStr} (exit code: ${code})`);
  }
  console.log('─'.repeat(50) + '\n');

  process.exit(code);
});

child.on('error', err => {
  console.error(`Failed to start command: ${err.message}`);
  process.exit(1);
});
