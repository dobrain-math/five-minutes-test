/**
 * 두뇌로수학 연산 테스트 — 챌린지 기록 시트 스크립트 (프로토타입 2026-11-10)
 *
 * 붙이는 곳: 구글 시트 → 확장 프로그램 → Apps Script → 이 파일 내용 전체를 붙여넣기 → 저장
 * 배포: 배포 → 새 배포 → 유형 «웹 앱» → 실행 계정 «나» · 액세스 «모든 사용자» → 배포 → 웹 앱 URL 을 앱에 넣는다
 *
 * 탭
 *   명단  : 선생님이 이름만 적으면 옆 칸에 4자리 챌린지 코드가 생기고 «이름(코드)» 학생 탭이 생긴다
 *   기록  : 앱이 채점할 때마다 한 줄씩 쓴다(전체 학생). 손으로 고치지 않는다
 *   이름(코드) : 기록 중 그 학생의 «그날 첫 풀이»만 날짜순으로 보여 주고 정답률 꺾은선을 그린다(FILTER 수식)
 *
 * 앱과 주고받기
 *   GET  ?code=4821            → { ok: true, name: "김민준" } / { ok: false }
 *   POST { code, course, scope, correct, total, seconds, finishedAt } → { ok, name, first }
 */

const ROSTER = '명단';
const LOG = '기록';
const ROSTER_HEAD = ['이름', '챌린지 코드', '메모'];
const LOG_HEAD = [
	'기록 시각',
	'날짜',
	'챌린지 코드',
	'이름',
	'권',
	'범위',
	'맞힌 수',
	'전체',
	'정답률(%)',
	'걸린 시간(초)',
	'그날 첫 풀이',
];
const TZ = 'Asia/Seoul';

function onOpen() {
	ensureSheets_();
	SpreadsheetApp.getUi()
		.createMenu('챌린지')
		.addItem('명단 코드·학생 탭 다시 만들기', 'syncRoster')
		.addToUi();
}

/** 명단 «이름» 칸을 고치면 코드·학생 탭을 바로 만든다 */
function onEdit(e) {
	const sheet = e.range.getSheet();
	if (sheet.getName() !== ROSTER || e.range.getColumn() !== 1) return;
	syncRoster();
}

function ensureSheets_() {
	const ss = SpreadsheetApp.getActive();
	const make = (name, head) => {
		let sh = ss.getSheetByName(name);
		if (sh) return sh;
		sh = ss.insertSheet(name);
		sh.getRange(1, 1, 1, head.length).setValues([head]).setFontWeight('bold');
		sh.setFrozenRows(1);
		return sh;
	};
	const roster = make(ROSTER, ROSTER_HEAD);
	roster.getRange('B:B').setNumberFormat('@'); // 코드는 글자로(앞자리 0·숫자 변환 방지)
	const log = make(LOG, LOG_HEAD);
	log.getRange('B:C').setNumberFormat('@'); // 날짜·코드를 글자 그대로(시트가 날짜로 바꾸지 않게)
	// 처음 만든 빈 «시트1»은 정리한다(내용이 있으면 둔다)
	['시트1', 'Sheet1'].forEach((n) => {
		const sh = ss.getSheetByName(n);
		if (sh && sh.getLastRow() === 0 && ss.getSheets().length > 1) ss.deleteSheet(sh);
	});
	return { roster, log };
}

/** 이름은 있는데 코드가 없는 줄에 코드를 주고, 학생 탭이 없으면 만든다 */
function syncRoster() {
	const { roster } = ensureSheets_();
	const last = roster.getLastRow();
	if (last < 2) return;
	const rows = roster.getRange(2, 1, last - 1, 2).getValues();
	const used = new Set(rows.map((r) => String(r[1])).filter(Boolean));
	rows.forEach((r, i) => {
		const name = String(r[0]).trim();
		if (!name) return;
		let code = String(r[1]);
		if (!code) {
			code = newCode_(used);
			used.add(code);
			roster.getRange(i + 2, 2).setValue(code);
		}
		studentTab_(name, code);
	});
}

/** 1000~9999 중 아직 안 쓴 번호(앞자리 0 없음 — 학생이 헷갈리지 않게) */
function newCode_(used) {
	for (;;) {
		const code = String(1000 + Math.floor(Math.random() * 9000));
		if (!used.has(code)) return code;
	}
}

function studentTab_(name, code) {
	const ss = SpreadsheetApp.getActive();
	const title = name + '(' + code + ')';
	if (ss.getSheetByName(title)) return;
	const sh = ss.insertSheet(title);
	const head = ['날짜', '권', '범위', '맞힌 수', '전체', '정답률(%)', '걸린 시간(초)'];
	sh.getRange(1, 1, 1, head.length).setValues([head]).setFontWeight('bold');
	sh.setFrozenRows(1);
	// 그날 첫 풀이만, 날짜순(기록 탭이 시간순으로 쌓이므로 그대로 날짜순)
	sh.getRange('A2').setFormula(
		'=IFERROR(FILTER({' +
			LOG + '!B2:B, ' + LOG + '!E2:J}, ' +
			LOG + '!C2:C="' + code + '", ' +
			LOG + '!K2:K="O"), "아직 기록이 없습니다")',
	);
	const chart = sh
		.newChart()
		.setChartType(Charts.ChartType.LINE)
		.addRange(sh.getRange('A1:A400'))
		.addRange(sh.getRange('F1:F400'))
		.setNumHeaders(1)
		.setOption('title', name + ' 정답률')
		.setOption('legend', { position: 'none' })
		.setOption('vAxis', { minValue: 0, maxValue: 100 })
		.setOption('pointSize', 6)
		.setPosition(2, 9, 0, 0)
		.build();
	sh.insertChart(chart);
}

function findName_(code) {
	const { roster } = ensureSheets_();
	const last = roster.getLastRow();
	if (last < 2 || !code) return null;
	const rows = roster.getRange(2, 1, last - 1, 2).getValues();
	const hit = rows.find((r) => String(r[1]) === String(code));
	return hit ? String(hit[0]).trim() : null;
}

function json_(obj) {
	return ContentService.createTextOutput(JSON.stringify(obj)).setMimeType(
		ContentService.MimeType.JSON,
	);
}

function doGet(e) {
	const name = findName_(e.parameter.code);
	return json_(name ? { ok: true, name: name } : { ok: false });
}

function doPost(e) {
	const lock = LockService.getScriptLock();
	lock.waitLock(10000);
	try {
		const d = JSON.parse(e.postData.contents);
		const name = findName_(d.code);
		if (!name) return json_({ ok: false, error: 'unknown-code' });

		const { log } = ensureSheets_();
		const at = new Date(Number(d.finishedAt) || Date.now());
		const day = Utilities.formatDate(at, TZ, 'yyyy-MM-dd');
		const last = log.getLastRow();
		const seen =
			last >= 2 &&
			log
				.getRange(2, 2, last - 1, 2)
				.getValues()
				.some((r) => dayOf_(r[0]) === day && String(r[1]) === String(d.code));
		const first = !seen;
		const rate = d.total ? Math.round((d.correct / d.total) * 100) : 0;
		log.appendRow([
			Utilities.formatDate(at, TZ, 'yyyy-MM-dd HH:mm'),
			day,
			String(d.code),
			name,
			d.course,
			d.scope,
			d.correct,
			d.total,
			rate,
			d.seconds,
			first ? 'O' : '',
		]);
		return json_({ ok: true, name: name, first: first });
	} finally {
		lock.releaseLock();
	}
}

/** 날짜 칸은 시트가 Date 로 바꿔 둘 수 있어 글자로 맞춘다 */
function dayOf_(v) {
	return v instanceof Date ? Utilities.formatDate(v, TZ, 'yyyy-MM-dd') : String(v);
}
