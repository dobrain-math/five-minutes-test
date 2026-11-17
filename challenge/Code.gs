/**
 * 두뇌로수학 연산 테스트 — 챌린지 기록 시트 스크립트 (2026-11-17 로그인판)
 *
 * 붙이는 곳: 구글 시트 → 확장 프로그램 → Apps Script → 이 파일 내용 전체를 붙여넣기 → 저장
 * 서비스: 왼쪽 «서비스 +» → «Google Sheets API» 추가(표 기능에 필요. 없으면 줄무늬 서식으로 대신한다)
 * 배포: 배포 → 배포 관리 → 연필 → 버전 «새 버전» → 배포 (주소가 그대로다. «새 배포»는 주소가 바뀐다)
 *
 * 탭 (A열·1행은 여백, 표는 B2 부터)
 *   명단  : 선생님이 이름·나이를 적으면 옆 칸에 4자리 챌린지 코드가 생기고 «이름(코드)» 학생 탭이 생긴다
 *   기록  : 앱이 채점할 때마다 한 줄씩 쓴다(전체 학생, 학생마다 하루 한 줄). 손으로 고치지 않는다
 *   이름(코드) : 기록 중 그 학생 줄만 날짜순으로 보여 주고 정답률 꺾은선을 그린다(FILTER 수식)
 *
 * 앱과 주고받기 (로그인 = 이름 + 코드 둘 다 맞아야 한다)
 *   GET  ?name=김민준&code=4821 → { ok, name, age, doneToday, history } / { ok: false, error: 'wrong' }
 *   POST { name, code, course, scope, correct, total, seconds, finishedAt }
 *        → { ok, name, age, doneToday, history } / { ok: false, error: 'wrong' | 'done-today' }
 */

const ROSTER = '명단';
const LOG = '기록';
const ROSTER_HEAD = ['이름', '나이', '챌린지 코드', '메모'];
const LOG_HEAD = [
	'기록 시각',
	'날짜',
	'챌린지 코드',
	'이름',
	'나이',
	'권',
	'범위',
	'맞힌 수',
	'전체',
	'정답률(%)',
	'걸린 시간(초)',
];
/** 앱 src/data/ages.ts 와 같은 목록 — 명단 «나이» 칸 드롭다운 */
const AGES = ['5세', '6세', '7세', '초1', '초2', '초3', '초4', '초5', '초6', '중1'];
const TZ = 'Asia/Seoul';
const TOP = 2; // 머리글 줄(1행은 여백)
const LEFT = 2; // 첫 칸 열 B(A열은 여백)

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
	if (sheet.getName() !== ROSTER || e.range.getColumn() !== LEFT) return;
	syncRoster();
}

// ── 시트 만들기 ─────────────────────────────────────────────

function ensureSheets_() {
	const ss = SpreadsheetApp.getActive();
	const make = (name, head, types, widths) => {
		const old = ss.getSheetByName(name);
		if (old) return old;
		const sh = ss.insertSheet(name);
		frame_(sh, head, widths, true);
		table_(sh, name, head, types);
		return sh;
	};
	const roster = make(
		ROSTER,
		ROSTER_HEAD,
		['TEXT', 'DROPDOWN', 'TEXT', 'TEXT'],
		[110, 80, 100, 220],
	);
	const log = make(
		LOG,
		LOG_HEAD,
		['TEXT', 'TEXT', 'TEXT', 'TEXT', 'TEXT', 'TEXT', 'TEXT', 'DOUBLE', 'DOUBLE', 'DOUBLE', 'DOUBLE'],
		[130, 95, 90, 80, 60, 90, 200, 70, 60, 80, 95],
	);
	// 처음 만든 빈 «시트1»은 정리한다(내용이 있으면 둔다)
	['시트1', 'Sheet1'].forEach((n) => {
		const sh = ss.getSheetByName(n);
		if (sh && sh.getLastRow() === 0 && ss.getSheets().length > 1) ss.deleteSheet(sh);
	});
	return { roster, log };
}

/** A열·1행 여백을 작게, B2 에 머리글, 열 폭 */
function frame_(sh, head, widths, textBody) {
	sh.setColumnWidth(1, 16);
	sh.setRowHeight(1, 12);
	sh.getRange(TOP, LEFT, 1, head.length)
		.setValues([head])
		.setFontWeight('bold');
	sh.setFrozenRows(TOP);
	widths.forEach((w, i) => sh.setColumnWidth(LEFT + i, w));
	// 글자로 둘 칸(코드·날짜)이 숫자·날짜로 바뀌지 않게. 학생 탭은 수식이 들어가므로 하지 않는다
	if (textBody)
		sh.getRange(TOP + 1, LEFT, sh.getMaxRows() - TOP, head.length).setNumberFormat('@');
}

/**
 * 스프레드시트 «표»로 만든다(Sheets API 서비스 필요). 서비스가 없으면 줄무늬 서식으로 대신한다.
 * 표 이름 = 탭 이름(기록을 쓸 때 이 이름으로 표를 찾는다).
 */
function table_(sh, name, head, types) {
	try {
		Sheets.Spreadsheets.batchUpdate(
			{
				requests: [
					{
						addTable: {
							table: {
								name: name,
								range: {
									sheetId: sh.getSheetId(),
									startRowIndex: TOP - 1,
									endRowIndex: TOP + 1,
									startColumnIndex: LEFT - 1,
									endColumnIndex: LEFT - 1 + head.length,
								},
								columnProperties: head.map((h, i) => {
									const col = { columnIndex: i, columnName: h, columnType: types[i] };
									if (types[i] === 'DROPDOWN')
										col.dataValidationRule = {
											condition: {
												type: 'ONE_OF_LIST',
												values: AGES.map((a) => ({ userEnteredValue: a })),
											},
										};
									return col;
								}),
							},
						},
					},
				],
			},
			SpreadsheetApp.getActive().getId(),
		);
	} catch (err) {
		sh.getRange(TOP, LEFT, sh.getMaxRows() - TOP + 1, head.length).applyRowBanding(
			SpreadsheetApp.BandingTheme.BLUE,
			true,
			false,
		);
	}
}

/** 표 id(기록 줄을 표 안에 이어 붙일 때). 표가 없으면 null */
function tableId_(name) {
	try {
		const got = Sheets.Spreadsheets.get(SpreadsheetApp.getActive().getId(), {
			fields: 'sheets(tables(tableId,name))',
		});
		for (const sheet of got.sheets || [])
			for (const t of sheet.tables || []) if (t.name === name) return t.tableId;
	} catch (err) {
		// 서비스 없음
	}
	return null;
}

/** 머리글 아래 내용 줄(빈 줄은 뺀다). [줄 번호, 값들] */
function rows_(sh, width) {
	const last = sh.getLastRow();
	if (last <= TOP) return [];
	return sh
		.getRange(TOP + 1, LEFT, last - TOP, width)
		.getValues()
		.map((values, i) => ({ row: TOP + 1 + i, values: values }))
		.filter((r) => r.values.some((v) => v !== ''));
}

/** 이름은 있는데 코드가 없는 줄에 코드를 주고, 학생 탭이 없으면 만든다 */
function syncRoster() {
	const { roster } = ensureSheets_();
	const rows = rows_(roster, ROSTER_HEAD.length);
	const used = new Set(rows.map((r) => String(r.values[2])).filter(Boolean));
	rows.forEach((r) => {
		const name = String(r.values[0]).trim();
		if (!name) return;
		let code = String(r.values[2]);
		if (!code) {
			code = newCode_(used);
			used.add(code);
			roster.getRange(r.row, LEFT + 2).setNumberFormat('@').setValue(code);
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
	frame_(sh, head, [95, 90, 200, 70, 60, 80, 95], false);
	sh.getRange(TOP, LEFT, 1, head.length).setBackground('#e8f0fe');
	// 기록 탭: C 날짜 · D 코드 · G~L 권·범위·맞힌 수·전체·정답률·걸린 시간
	const log = "'" + LOG + "'!";
	sh.getRange(TOP + 1, LEFT).setFormula(
		'=IFERROR(FILTER({' + log + 'C3:C, ' + log + 'G3:L}, TO_TEXT(' + log + 'D3:D)="' + code +
			'"), "아직 기록이 없습니다")',
	);
	const chart = sh
		.newChart()
		.setChartType(Charts.ChartType.LINE)
		.addRange(sh.getRange('B2:B400'))
		.addRange(sh.getRange('G2:G400'))
		.setNumHeaders(1)
		.setOption('title', name + ' 정답률')
		.setOption('legend', { position: 'none' })
		.setOption('vAxis', { minValue: 0, maxValue: 100 })
		.setOption('pointSize', 6)
		.setPosition(TOP, LEFT + head.length + 1, 0, 0)
		.build();
	sh.insertChart(chart);
}

// ── 로그인·기록 ─────────────────────────────────────────────

/** 이름 + 코드가 모두 맞는 명단 줄(틀린 횟수 잠금은 2026-11-17 사용자 지시로 뺌) */
function login_(name, code) {
	name = String(name || '').trim();
	code = String(code || '').trim();
	const { roster } = ensureSheets_();
	const hit = rows_(roster, ROSTER_HEAD.length).find(
		(r) => String(r.values[0]).trim() === name && String(r.values[2]).trim() === code,
	);
	if (!name || !code || !hit) return { ok: false, error: 'wrong' };
	return { ok: true, name: name, code: code, age: String(hit.values[1] || '') };
}

/** 그 학생의 기록(오래된 것부터) */
function history_(log, code) {
	return rows_(log, LOG_HEAD.length)
		.filter((r) => String(r.values[2]) === code)
		.map((r) => {
			const v = r.values;
			return {
				date: dayOf_(v[1]),
				course: String(v[5]),
				scope: String(v[6]),
				correct: Number(v[7]),
				total: Number(v[8]),
				seconds: Number(v[10]),
			};
		});
}

function answer_(who, log, now) {
	const history = history_(log, who.code);
	const today = Utilities.formatDate(now, TZ, 'yyyy-MM-dd');
	return json_({
		ok: true,
		name: who.name,
		age: who.age,
		doneToday: history.some((h) => h.date === today),
		history: history,
	});
}

function json_(obj) {
	return ContentService.createTextOutput(JSON.stringify(obj)).setMimeType(
		ContentService.MimeType.JSON,
	);
}

function doGet(e) {
	const who = login_(e.parameter.name, e.parameter.code);
	if (!who.ok) return json_(who);
	return answer_(who, ensureSheets_().log, new Date());
}

function doPost(e) {
	const lock = LockService.getScriptLock();
	lock.waitLock(10000);
	try {
		const d = JSON.parse(e.postData.contents);
		const who = login_(d.name, d.code);
		if (!who.ok) return json_(who);

		const { log } = ensureSheets_();
		const at = new Date(Number(d.finishedAt) || Date.now());
		const day = Utilities.formatDate(at, TZ, 'yyyy-MM-dd');
		// 챌린지는 하루 한 번 — 앱이 막지만 다른 기기·새로고침으로 두 번 와도 한 줄만 남긴다
		if (history_(log, who.code).some((h) => h.date === day))
			return json_({ ok: false, error: 'done-today' });

		const rate = d.total ? Math.round((d.correct / d.total) * 100) : 0;
		append_(log, [
			Utilities.formatDate(at, TZ, 'yyyy-MM-dd HH:mm'),
			day,
			who.code,
			who.name,
			who.age,
			String(d.course),
			String(d.scope),
			Number(d.correct),
			Number(d.total),
			rate,
			Number(d.seconds),
		]);
		return answer_(who, log, at);
	} finally {
		lock.releaseLock();
	}
}

/** 기록 한 줄 — 표가 있으면 표 안에(표가 함께 늘어난다), 없으면 마지막 줄 아래에 */
function append_(log, values) {
	const id = tableId_(LOG);
	if (id) {
		Sheets.Spreadsheets.batchUpdate(
			{
				requests: [
					{
						appendCells: {
							tableId: id,
							fields: 'userEnteredValue',
							rows: [
								{
									values: values.map((v) =>
										typeof v === 'number'
											? { userEnteredValue: { numberValue: v } }
											: { userEnteredValue: { stringValue: v } },
									),
								},
							],
						},
					},
				],
			},
			SpreadsheetApp.getActive().getId(),
		);
		return;
	}
	const row = Math.max(log.getLastRow(), TOP) + 1;
	log.getRange(row, LEFT, 1, values.length).setNumberFormat('@').setValues([values]);
	log.getRange(row, LEFT + 7, 1, 4).setNumberFormat('0');
}

/** 날짜 칸은 시트가 Date 로 바꿔 둘 수 있어 글자로 맞춘다 */
function dayOf_(v) {
	return v instanceof Date ? Utilities.formatDate(v, TZ, 'yyyy-MM-dd') : String(v);
}
