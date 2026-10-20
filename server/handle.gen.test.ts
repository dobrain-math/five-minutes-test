/**
 * 배포되는 묶음(handle.gen.js)과 진입점(middleware.ts)을 검사한다.
 * NOTE: 미들웨어가 .ts 를 불러오면 배포에서 매번 터졌다(2026-10-20) — 그 재발을 막는다.
 */
import { execFileSync } from 'node:child_process';
import { mkdtempSync, readFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { describe, expect, test } from 'vitest';

const root = join(import.meta.dirname, '..');
const read = (p: string) => readFileSync(join(root, p), 'utf-8');

describe('배포 묶음', () => {
	test('middleware.ts 는 .ts 파일을 불러오지 않는다', () => {
		const imports = read('middleware.ts').match(/from\s+'[^']+'/g) ?? [];
		expect(imports).toEqual(["from './server/handle.gen.js'"]);
	});

	test('handle.gen.js 는 다른 파일을 불러오지 않는 한 덩어리다', () => {
		expect(read('server/handle.gen.js')).not.toMatch(/^\s*import\s/m);
	});

	test('handle.gen.js 가 server/handle.ts 의 최신 묶음이다(고친 뒤 bun run build:server)', () => {
		const out = join(mkdtempSync(join(tmpdir(), 'handle-')), 'handle.gen.js');
		execFileSync(
			'bun',
			[
				'build',
				'server/handle.ts',
				'--target=node',
				'--format=esm',
				`--outfile=${out}`,
			],
			{ cwd: root, stdio: 'ignore' },
		);
		const normalize = (s: string) => s.replace(/\r\n/g, '\n').trim();
		expect(normalize(readFileSync(out, 'utf-8'))).toBe(
			normalize(read('server/handle.gen.js')),
		);
	});
});
