// Custom Jest reporter: aggregates the a11y test results (grouped by WCAG success criterion in
// their describe titles, e.g. "WCAG 1.4.3 - Contrast") against the criteria catalogue and writes
// accessibility-report.md. The output reads like a vendor a11y dashboard but is generated from this
// repo's own tests, no licence. It is deliberately honest: criteria the unit tests can't prove are
// listed under the native-audit / manual layer rather than faked as passing.

const fs = require('fs');
const path = require('path');
const BASE_CRITERIA = require('./wcag-criteria');

// Per-app overrides. A criterion's true disposition is app-specific. Drop an
// `a11y-report.config.js` in the project root: { projectName, overrides }.
function loadConfig() {
  const configPath = path.resolve(process.cwd(), 'a11y-report.config.js');
  if (!fs.existsSync(configPath)) return { projectName: 'this app', overrides: {} };
  const cfg = require(configPath);
  return { projectName: cfg.projectName || 'this app', overrides: cfg.overrides || {} };
}

function mergeCriteria(overrides) {
  const merged = {};
  for (const [sc, meta] of Object.entries(BASE_CRITERIA)) {
    merged[sc] = overrides[sc] ? { ...meta, ...overrides[sc] } : meta;
  }
  return merged;
}

const SC_RE = /WCAG\s+(\d+\.\d+\.\d+)/;
const LAYER_LABEL = {
  automated: 'Automated (Jest)',
  native: 'Native audit',
  manual: 'Manual',
  'n/a': 'N/A',
};

// ANSI colour codes in jest failure messages are "ESC [ ... m". Match the "[...m" tail without a
// literal control character so the pattern stays no-control-regex clean.
const ANSI_RE = /\[[0-9;]*m/g;

function extractSc(ancestorTitles, title) {
  for (const candidate of [...ancestorTitles, title]) {
    const match = SC_RE.exec(candidate);
    if (match) return match[1];
  }
  return null;
}

function cleanMessage(failureMessages) {
  if (!failureMessages || !failureMessages.length) return '';
  return failureMessages
    .join('\n')
    .replace(ANSI_RE, '')
    .split('\n')
    .filter(line => line.trim() && !line.trim().startsWith('at '))
    .slice(0, 6)
    .map(line => line.trim())
    .join(' / ');
}

function statusFor(meta, bucket) {
  if (meta && meta.layer !== 'automated') return null; // owned by another layer
  if (!bucket) return { icon: '◻️', label: 'not yet tested' };
  if (bucket.fail > 0) return { icon: '❌', label: `${bucket.fail} violation(s)` };
  if (bucket.known > 0) return { icon: '⚠️', label: `${bucket.known} known finding(s)` };
  return { icon: '✅', label: `pass (${bucket.pass})` };
}

function render(bySc, when, criteria, projectName) {
  const entries = Object.entries(criteria);
  const automated = entries.filter(([, meta]) => meta.layer === 'automated');
  const tested = automated.filter(([sc]) => bySc[sc]);
  const violations = Object.entries(bySc).flatMap(([sc, bucket]) =>
    bucket.findings
      .filter(finding => finding.type === 'violation')
      .map(finding => ({ sc, ...finding }))
  );
  const known = Object.entries(bySc).flatMap(([sc, bucket]) =>
    bucket.findings.filter(finding => finding.type === 'known').map(finding => ({ sc, ...finding }))
  );
  const counts = { automated: 0, native: 0, manual: 0, 'n/a': 0 };
  for (const [, meta] of entries) counts[meta.layer]++;

  const lines = [];
  lines.push('# Accessibility Report - EAA / WCAG 2.1 (A & AA)');
  lines.push('');
  lines.push(`> Generated ${when} from the ${projectName} accessibility test suite. The European`);
  lines.push(
    '> Accessibility Act (Directive 2019/882) has mandated WCAG 2.1 AA for EU-distributed'
  );
  lines.push('> apps since 28 June 2025.');
  lines.push('');
  lines.push('## Summary');
  lines.push('');
  lines.push(`- **Criteria in scope:** ${entries.length} (Level A + AA, per EN 301 549)`);
  lines.push(
    `- **Automated coverage:** ${tested.length} / ${automated.length} applicable unit-testable criteria tested`
  );
  lines.push(`- **Violations (must fix):** ${violations.length}`);
  lines.push(`- **Known / accepted findings (tracked):** ${known.length}`);
  lines.push(
    `- **Other layers:** ${counts.native} native-audit · ${counts.manual} manual · ${counts['n/a']} N/A`
  );
  lines.push('');

  if (violations.length) {
    lines.push('## ❌ Violations');
    lines.push('');
    for (const violation of violations) {
      const meta = criteria[violation.sc] || {};
      lines.push(`- **${violation.sc} ${meta.title || ''}** - ${violation.title}`);
      if (violation.detail) lines.push(`  - ${violation.detail}`);
    }
    lines.push('');
  }

  if (known.length) {
    lines.push('## ⚠️ Known / accepted findings');
    lines.push('');
    for (const finding of known) {
      const meta = criteria[finding.sc] || {};
      lines.push(`- **${finding.sc} ${meta.title || ''}** - ${finding.title}`);
    }
    lines.push('');
  }

  lines.push('## Coverage by success criterion');
  lines.push('');
  lines.push('| SC | Criterion | Level | Owned by | Status |');
  lines.push('|---|---|---|---|---|');
  for (const [sc, meta] of entries) {
    let status;
    if (meta.layer === 'automated') {
      const auto = statusFor(meta, bySc[sc]);
      status = auto ? `${auto.icon} ${auto.label}` : '◻️ not yet tested';
    } else if (meta.layer === 'native') {
      status = '🔵 native audit';
    } else if (meta.layer === 'manual') {
      status = '👁 manual';
    } else {
      status = '- n/a';
    }
    const note = meta.note ? ` <br/><sub>${meta.note}</sub>` : '';
    lines.push(
      `| ${sc} | ${meta.title}${note} | ${meta.level} | ${LAYER_LABEL[meta.layer]} | ${status} |`
    );
  }
  lines.push('');
  lines.push('## Methodology');
  lines.push('');
  lines.push('Four layers, no single tool covers all of WCAG:');
  lines.push('');
  lines.push(
    '- **Automated (Jest):** this suite. React tree, props and resolved styles, runs in PR.'
  );
  lines.push(
    '- **Native audit:** Apple `performAccessibilityAudit` + Google ATF, the rendered native a11y tree (contrast as drawn, hit region, dynamic type).'
  );
  lines.push('- **Manual:** VoiceOver / TalkBack release ritual, focus order and label quality.');
  lines.push('- **N/A:** criteria for content this app does not have (audio, video).');
  lines.push('');
  return lines.join('\n');
}

class AccessibilityReporter {
  onRunComplete(_contexts, results) {
    const bySc = {};
    for (const file of results.testResults) {
      for (const test of file.testResults) {
        const sc = extractSc(test.ancestorTitles || [], test.title);
        if (!sc) continue;
        const bucket = (bySc[sc] = bySc[sc] || { pass: 0, fail: 0, known: 0, findings: [] });
        const isKnown = /\(known/i.test(test.title);
        if (test.status === 'failed') {
          bucket.fail++;
          bucket.findings.push({
            type: 'violation',
            title: test.title,
            detail: cleanMessage(test.failureMessages),
          });
        } else if (test.status === 'passed' && isKnown) {
          bucket.known++;
          bucket.findings.push({ type: 'known', title: test.title });
        } else if (test.status === 'passed') {
          bucket.pass++;
        }
      }
    }
    const { projectName, overrides } = loadConfig();
    const criteria = mergeCriteria(overrides);
    const when = new Date().toISOString().slice(0, 10);
    const markdown = render(bySc, when, criteria, projectName);
    const outPath = path.resolve(process.cwd(), 'accessibility-report.md');
    fs.writeFileSync(outPath, markdown);
    process.stdout.write(
      `\n📋 Accessibility report written to ${path.relative(process.cwd(), outPath)}\n`
    );
  }
}

module.exports = AccessibilityReporter;
