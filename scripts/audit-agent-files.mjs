#!/usr/bin/env node

import fs from 'node:fs';
import path from 'node:path';

const cwd = process.cwd();
const args = process.argv.slice(2);
const targets = args.length > 0 ? args : ['.agent/skills', '.claude/agents'];

const skillNamePattern = /^[a-z0-9-]+$/;
const reservedSkillPrefixPattern = /^(claude|anthropic)(-|$)/;
const proactivePattern = /\buse (when|proactively)\b/i;

const findings = [];

function addFinding(level, scope, filePath, message) {
  findings.push({
    level,
    scope,
    filePath,
    message,
  });
}

function readFile(filePath) {
  return fs.readFileSync(filePath, 'utf8');
}

function extractFrontmatter(content) {
  const match = content.match(/^---\r?\n([\s\S]*?)\r?\n---\r?\n?/);
  if (!match) {
    return null;
  }

  const raw = match[1];
  const data = {};
  let currentListKey = null;

  for (const line of raw.split(/\r?\n/)) {
    if (!line.trim()) {
      continue;
    }

    const listItem = line.match(/^\s*-\s+(.*)$/);
    if (listItem && currentListKey) {
      if (!Array.isArray(data[currentListKey])) {
        data[currentListKey] = [];
      }
      data[currentListKey].push(stripQuotes(listItem[1].trim()));
      continue;
    }

    const keyValue = line.match(/^([A-Za-z0-9_-]+):\s*(.*)$/);
    if (!keyValue) {
      currentListKey = null;
      continue;
    }

    const [, key, value] = keyValue;
    if (!value) {
      currentListKey = key;
      data[key] = [];
      continue;
    }

    currentListKey = null;
    data[key] = stripQuotes(value.trim());
  }

  return {
    raw,
    data,
    body: content.slice(match[0].length),
  };
}

function stripQuotes(value) {
  return value.replace(/^['"]|['"]$/g, '');
}

function countWords(text) {
  const words = text.trim().match(/\S+/g);
  return words ? words.length : 0;
}

function rel(filePath) {
  return (path.relative(cwd, filePath) || '.').split(path.sep).join('/');
}

function auditSkillDirectory(skillDir) {
  const skillFile = path.join(skillDir, 'SKILL.md');
  const readmeFile = path.join(skillDir, 'README.md');
  const folderName = path.basename(skillDir);

  if (!fs.existsSync(skillFile)) {
    addFinding('error', 'skill', skillDir, 'Missing SKILL.md');
    return;
  }

  if (fs.existsSync(readmeFile)) {
    addFinding('warning', 'skill', readmeFile, 'README.md present; Anthropic guide recommends keeping documentation in SKILL.md or references/.');
  }

  if (!skillNamePattern.test(folderName)) {
    addFinding('warning', 'skill', skillDir, 'Folder name is not kebab-case.');
  }

  const content = readFile(skillFile);
  const frontmatter = extractFrontmatter(content);

  if (!frontmatter) {
    addFinding('error', 'skill', skillFile, 'Missing YAML frontmatter.');
    return;
  }

  const name = frontmatter.data.name;
  const description = frontmatter.data.description;

  if (!name) {
    addFinding('error', 'skill', skillFile, 'Missing required frontmatter field: name.');
  } else {
    if (!skillNamePattern.test(name)) {
      addFinding('warning', 'skill', skillFile, `Skill name "${name}" is not kebab-case.`);
    }
    if (reservedSkillPrefixPattern.test(name)) {
      addFinding('warning', 'skill', skillFile, `Skill name "${name}" uses a reserved Anthropic prefix.`);
    }
    if (name !== folderName) {
      addFinding('warning', 'skill', skillFile, `Skill name "${name}" does not match folder name "${folderName}".`);
    }
  }

  if (!description) {
    addFinding('error', 'skill', skillFile, 'Missing required frontmatter field: description.');
  } else {
    if (description.length > 1024) {
      addFinding('error', 'skill', skillFile, `Description is ${description.length} characters; Anthropic guide limit is 1024.`);
    }
    if (/[<>]/.test(description)) {
      addFinding('error', 'skill', skillFile, 'Description contains angle brackets, which Anthropic forbids in frontmatter.');
    }
    if (!/\buse when\b/i.test(description)) {
      addFinding('warning', 'skill', skillFile, 'Description does not include an explicit "Use when ..." trigger phrase.');
    }
  }

  const bodyWordCount = countWords(frontmatter.body);
  if (bodyWordCount > 5000) {
    addFinding('warning', 'skill', skillFile, `SKILL.md body is ${bodyWordCount} words; guide recommends keeping it under 5000 words.`);
  }

  if (/##\s+When to Use This Skill/i.test(frontmatter.body)) {
    addFinding('warning', 'skill', skillFile, 'Body contains a "When to Use" section; prefer putting trigger guidance in description frontmatter.');
  }
}

function auditSubagentFile(agentFile) {
  const content = readFile(agentFile);
  const frontmatter = extractFrontmatter(content);
  const fileStem = path.basename(agentFile, path.extname(agentFile));

  if (!frontmatter) {
    addFinding('error', 'subagent', agentFile, 'Missing YAML frontmatter.');
    return;
  }

  const name = frontmatter.data.name;
  const description = frontmatter.data.description;

  if (!name) {
    addFinding('error', 'subagent', agentFile, 'Missing required frontmatter field: name.');
  } else if (name !== fileStem) {
    addFinding('warning', 'subagent', agentFile, `Subagent name "${name}" does not match filename "${fileStem}".`);
  }

  if (!description) {
    addFinding('error', 'subagent', agentFile, 'Missing required frontmatter field: description.');
  } else if (!proactivePattern.test(description)) {
    addFinding('warning', 'subagent', agentFile, 'Description should include a clear "use when" or "use proactively" trigger phrase for delegation.');
  }
}

function auditTarget(targetPath) {
  const fullPath = path.resolve(cwd, targetPath);

  if (!fs.existsSync(fullPath)) {
    addFinding('warning', 'workspace', fullPath, 'Target path does not exist.');
    return;
  }

  const stats = fs.statSync(fullPath);
  if (stats.isDirectory()) {
    if (path.basename(fullPath) === 'skills') {
      for (const entry of fs.readdirSync(fullPath, { withFileTypes: true })) {
        if (entry.isDirectory()) {
          auditSkillDirectory(path.join(fullPath, entry.name));
        }
      }
      return;
    }

    if (path.basename(fullPath) === 'agents') {
      for (const entry of fs.readdirSync(fullPath, { withFileTypes: true })) {
        if (entry.isFile() && entry.name.endsWith('.md')) {
          auditSubagentFile(path.join(fullPath, entry.name));
        }
      }
      return;
    }
  }

  if (stats.isFile() && path.basename(fullPath) === 'SKILL.md') {
    auditSkillDirectory(path.dirname(fullPath));
    return;
  }

  if (stats.isFile() && fullPath.endsWith('.md')) {
    auditSubagentFile(fullPath);
    return;
  }

  addFinding('warning', 'workspace', fullPath, 'Unsupported audit target.');
}

for (const target of targets) {
  auditTarget(target);
}

if (findings.length === 0) {
  console.log('No audit findings.');
  process.exit(0);
}

const order = { error: 0, warning: 1 };
findings.sort((a, b) => {
  return order[a.level] - order[b.level] || a.filePath.localeCompare(b.filePath);
});

for (const finding of findings) {
  const prefix = finding.level === 'error' ? 'ERROR' : 'WARN';
  console.log(`${prefix} [${finding.scope}] ${rel(finding.filePath)}: ${finding.message}`);
}

const errorCount = findings.filter((finding) => finding.level === 'error').length;
const warningCount = findings.length - errorCount;

console.log(`\n${errorCount} error(s), ${warningCount} warning(s)`);

process.exit(errorCount > 0 ? 1 : 0);
