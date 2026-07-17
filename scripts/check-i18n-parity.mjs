#!/usr/bin/env node
// Checks key/placeholder parity across messages/*.json locale files against messages/en.json.
// No external dependencies — node:fs/node:path only.

import { readdirSync, readFileSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const messagesDir = path.join(__dirname, '..', 'messages');
const REFERENCE_LOCALE = 'en.json';

/** Recursively flattens a nested object into dot-joined leaf key -> string value pairs. */
function flatten(obj, prefix = '') {
	const result = {};
	for (const [key, value] of Object.entries(obj)) {
		if (key === '$schema') continue;
		const flatKey = prefix ? `${prefix}.${key}` : key;
		if (value !== null && typeof value === 'object' && !Array.isArray(value)) {
			Object.assign(result, flatten(value, flatKey));
		} else {
			result[flatKey] = value;
		}
	}
	return result;
}

/** Extracts the set of {placeholder} names used in a message string. */
function extractPlaceholders(value) {
	if (typeof value !== 'string') return new Set();
	const matches = value.matchAll(/\{([^{}]+)\}/g);
	return new Set(Array.from(matches, (m) => m[1]));
}

function setsEqual(a, b) {
	if (a.size !== b.size) return false;
	for (const item of a) {
		if (!b.has(item)) return false;
	}
	return true;
}

function loadFlatMessages(filePath) {
	let raw;
	try {
		raw = readFileSync(filePath, 'utf8');
	} catch (err) {
		throw new Error(`Cannot read ${filePath}: ${err.message}`);
	}
	let parsed;
	try {
		parsed = JSON.parse(raw);
	} catch (err) {
		throw new Error(`Cannot parse ${filePath} as JSON: ${err.message}`);
	}
	return flatten(parsed);
}

function main() {
	let entries;
	try {
		entries = readdirSync(messagesDir).filter((f) => f.endsWith('.json'));
	} catch (err) {
		console.error(`Cannot read messages directory ${messagesDir}: ${err.message}`);
		process.exit(1);
	}

	if (!entries.includes(REFERENCE_LOCALE)) {
		console.error(`Reference locale ${REFERENCE_LOCALE} not found in ${messagesDir}`);
		process.exit(1);
	}

	let referenceMessages;
	try {
		referenceMessages = loadFlatMessages(path.join(messagesDir, REFERENCE_LOCALE));
	} catch (err) {
		console.error(err.message);
		process.exit(1);
	}
	const referenceKeys = new Set(Object.keys(referenceMessages));

	const localeFiles = entries.filter((f) => f !== REFERENCE_LOCALE).sort();

	let hasDrift = false;
	const report = [];

	for (const file of localeFiles) {
		const locale = file.replace(/\.json$/, '');
		let localeMessages;
		try {
			localeMessages = loadFlatMessages(path.join(messagesDir, file));
		} catch (err) {
			hasDrift = true;
			report.push(`✗ ${locale}: ${err.message}`);
			continue;
		}
		const localeKeys = new Set(Object.keys(localeMessages));

		const missingKeys = [...referenceKeys].filter((k) => !localeKeys.has(k)).sort();
		const extraKeys = [...localeKeys].filter((k) => !referenceKeys.has(k)).sort();

		const placeholderMismatches = [];
		for (const key of referenceKeys) {
			if (!localeKeys.has(key)) continue;
			const refPlaceholders = extractPlaceholders(referenceMessages[key]);
			const localePlaceholders = extractPlaceholders(localeMessages[key]);
			if (!setsEqual(refPlaceholders, localePlaceholders)) {
				placeholderMismatches.push({
					key,
					expected: [...refPlaceholders].sort(),
					found: [...localePlaceholders].sort(),
				});
			}
		}

		const localeHasDrift =
			missingKeys.length > 0 || extraKeys.length > 0 || placeholderMismatches.length > 0;

		if (!localeHasDrift) {
			report.push(`✓ ${locale}: in parity (${localeKeys.size} keys)`);
			continue;
		}

		hasDrift = true;
		report.push(`✗ ${locale}: DRIFT DETECTED`);
		if (missingKeys.length > 0) {
			report.push(`  missing keys (${missingKeys.length}): ${missingKeys.join(', ')}`);
		}
		if (extraKeys.length > 0) {
			report.push(`  extra keys (${extraKeys.length}): ${extraKeys.join(', ')}`);
		}
		for (const mismatch of placeholderMismatches) {
			report.push(
				`  placeholder mismatch in "${mismatch.key}": expected {${mismatch.expected.join(', ')}}, found {${mismatch.found.join(', ')}}`,
			);
		}
	}

	console.log(`i18n parity check — reference: ${REFERENCE_LOCALE} (${referenceKeys.size} keys)`);
	console.log(report.join('\n'));

	if (hasDrift) {
		console.error('\ni18n parity check FAILED — drift detected above.');
		process.exit(1);
	}

	console.log('\ni18n parity check PASSED — all locales in parity.');
	process.exit(0);
}

main();
