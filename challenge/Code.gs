/**
 * 두뇌로수학 연산 테스트 — 챌린지 기록 시트 스크립트 (2026-11-17 로그인판)
 *
 * 붙이는 곳: 구글 시트 → 확장 프로그램 → Apps Script → 이 파일 내용 전체를 붙여넣기 → 저장
 * 서비스: 왼쪽 «서비스 +» → «Google Sheets API» 추가(표 기능에 필요. 없으면 줄무늬 서식으로 대신한다)
 * 표: 시트 메뉴 «챌린지 → 명단·기록을 표로 바꾸기» (이미 만든 줄무늬 탭을 표로. 안 되면 이유를 창으로 알려 준다)
 * 배포: 배포 → 배포 관리 → 연필 → 버전 «새 버전» → 배포 (주소가 그대로다. «새 배포»는 주소가 바뀐다)
 *
 * 탭 (A열·1행은 여백, 표는 B2 부터)
 *   명단  : 선생님이 이름·나이를 적으면 옆 칸에 4자리 챌린지 코드가 생기고 «이름(코드)» 학생 탭이 생긴다
 *   기록  : 앱이 채점할 때마다 한 줄씩 쓴다(전체 학생, 풀 때마다 한 줄 — 같은 날 여러 줄도 된다). 손으로 고치지 않는다
 *   이름(코드) : 기록 중 그 학생 줄만 날짜순으로 보여 주고 정답률 꺾은선을 그린다(FILTER 수식)
 *
 * 앱과 주고받기 (로그인 = 이름 + 코드 둘 다 맞아야 한다)
 *   GET  ?name=김민준&code=4821 → { ok, name, age, doneToday, history } / { ok: false, error: 'wrong' }
 *   POST { name, code, course, scope, correct, total, seconds, finishedAt }
 *        → { ok, name, age, doneToday, history } / { ok: false, error: 'wrong' }
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
const ROSTER_TYPES = ['TEXT', 'DROPDOWN', 'TEXT', 'TEXT'];
const LOG_TYPES = ['TEXT', 'TEXT', 'TEXT', 'TEXT', 'TEXT', 'TEXT', 'TEXT', 'DOUBLE', 'DOUBLE', 'DOUBLE', 'DOUBLE'];
const TZ = 'Asia/Seoul';
const TOP = 2; // 머리글 줄(1행은 여백)
const LEFT = 2; // 첫 칸 열 B(A열은 여백)

// NOTE: 시트를 열 때 저절로 도는 onOpen 은 표 API(Sheets 서비스) 권한이 없어 여기서 탭을 만들면 표가 아닌 줄무늬가 된다.
// 탭 만들기·옛 모양 옮기기는 메뉴(권한 있음)나 앱의 첫 요청(웹 앱)에서 한다
function onOpen() {
	SpreadsheetApp.getUi()
		.createMenu('챌린지')
		.addItem('시트 정리(새 모양으로) · 명단 코드·학생 탭 만들기', 'syncRoster')
		.addItem('명단·기록을 표로 바꾸기', 'makeTables')
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
	const legacy = {};
	const make = (name, head, types, widths) => {
		const old = ss.getSheetByName(name);
		// B2 머리글이 맞으면 새 모양 그대로 쓴다
		if (old && old.getRange(TOP, LEFT).getValue() === head[0]) return old;
		// NOTE: 옛 모양(A1 부터) 탭이 남아 있으면 이름을 «(옛)»으로 바꿔 두고 새로 만든다 —
		// 옛 명단을 새 스크립트가 B열부터 읽어 코드가 맞아도 로그인이 안 됐다(2026-11-17)
		if (old) {
			legacy[name] = old;
			old.setName(spareName_(name + '(옛)'));
		}
		const sh = ss.insertSheet(name);
		frame_(sh, head, widths, true);
		table_(sh, name, head, types);
		return sh;
	};
	const roster = make(
		ROSTER,
		ROSTER_HEAD,
		ROSTER_TYPES,
		[110, 80, 100, 220],
	);
	const log = make(
		LOG,
		LOG_HEAD,
		LOG_TYPES,
		[130, 95, 90, 80, 60, 90, 200, 70, 60, 80, 95],
	);
	// 처음 만든 빈 «시트1»은 정리한다(내용이 있으면 둔다)
	['시트1', 'Sheet1'].forEach((n) => {
		const sh = ss.getSheetByName(n);
		if (sh && sh.getLastRow() === 0 && ss.getSheets().length > 1) ss.deleteSheet(sh);
	});
	if (legacy[ROSTER]) moveRoster_(legacy[ROSTER], roster);
	return { roster, log };
}

/** 같은 이름 탭이 이미 있으면 뒤에 번호를 붙인다 */
function spareName_(name) {
	const ss = SpreadsheetApp.getActive();
	let title = name;
	for (let n = 2; ss.getSheetByName(title); n++) title = name + n;
	return title;
}

/**
 * 옛 명단(A열 이름 · B열 코드 · C열 메모, 1행 머리글)의 학생을 새 명단 표로 옮긴다. 코드는 그대로.
 * 옛 학생 탭 «이름(코드)»은 옛 기록을 가리키므로 «이름(코드) 옛»으로 비켜 두고 새로 만든다.
 */
function moveRoster_(old, roster) {
	const ss = SpreadsheetApp.getActive();
	old
		.getDataRange()
		.getValues()
		.slice(1)
		.forEach((r) => {
			const name = String(r[0]).trim();
			const code = code_(r[1]);
			if (!name) return;
			append_(ROSTER, roster, [name, '', code, String(r[2] || '')]);
			const tab = ss.getSheetByName(name + '(' + code + ')');
			if (tab) tab.setName(spareName_(name + '(' + code + ') 옛'));
		});
	// 표 API(Sheets)로 쓴 줄을 아래 syncRoster 가 읽을 수 있게 먼저 반영
	SpreadsheetApp.flush();
	syncRoster();
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
 * 스프레드시트 «표»로 만든다(Sheets API 서비스 필요). 머리글부터 지금 마지막 줄까지 표가 된다.
 * 표 이름 = 탭 이름(기록을 쓸 때 이 이름으로 표를 찾는다).
 * 실패하면 줄무늬 서식 + 나이 드롭다운으로 대신하고 실패 이유(글)를 돌려준다. 성공하면 ''.
 */
function table_(sh, name, head, types) {
	const last = Math.max(sh.getLastRow(), TOP + 1);
	try {
		// NOTE: 줄무늬·입력 규칙(드롭다운)이 겹쳐 있으면 표를 못 만든다 — 먼저 걷어 낸다
		sh.getBandings().forEach((b) => b.remove());
		sh.getRange(TOP, LEFT, last - TOP + 1, head.length).clearDataValidations();
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
									endRowIndex: last,
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
		return '';
	} catch (err) {
		sh.getRange(TOP, LEFT, sh.getMaxRows() - TOP + 1, head.length).applyRowBanding(
			SpreadsheetApp.BandingTheme.BLUE,
			true,
			false,
		);
		types.forEach((t, i) => {
			if (t !== 'DROPDOWN') return;
			sh.getRange(TOP + 1, LEFT + i, sh.getMaxRows() - TOP, 1).setDataValidation(
				SpreadsheetApp.newDataValidation().requireValueInList(AGES, true).build(),
			);
		});
		return String((err && err.message) || err);
	}
}

/** 메뉴 «명단·기록을 표로 바꾸기» — 이미 있는 탭(줄무늬)을 표로 바꾸고 결과를 창으로 알려 준다 */
function makeTables() {
	const { roster, log } = ensureSheets_();
	const lines = [
		[ROSTER, roster, ROSTER_HEAD, ROSTER_TYPES],
		[LOG, log, LOG_HEAD, LOG_TYPES],
	].map(([name, sh, head, types]) => {
		if (tableId_(name)) return name + ': 이미 표입니다';
		const err = table_(sh, name, head, types);
		if (!err) return name + ': 표로 바꿨습니다';
		if (/Sheets is not defined/.test(err))
			return name + ': 실패 — Apps Script 왼쪽 «서비스 +»에서 Google Sheets API 를 추가해 주세요';
		return name + ': 실패 — ' + err;
	});
	SpreadsheetApp.getUi().alert(lines.join('\n'));
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
	const used = new Set(rows.map((r) => code_(r.values[2])).filter(Boolean));
	rows.forEach((r) => {
		const name = String(r.values[0]).trim();
		if (!name) return;
		let code = code_(r.values[2]);
		if (!code) {
			code = newCode_(used);
			used.add(code);
			roster.getRange(r.row, LEFT + 2).setNumberFormat('@').setValue(code);
		}
		studentTab_(name, code);
	});
}

/**
 * 칸에 든 코드를 네 자리 글자로. 0000 을 직접 적으면 시트가 숫자 0 으로 바꿔 둘 수 있어서 앞을 0 으로 채운다(2026-11-17)
 */
function code_(v) {
	const s = String(v).trim();
	return /^\d{1,4}$/.test(s) ? ('000' + s).slice(-4) : s;
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
		'=IFERROR(FILTER({' + log + 'C3:C, ' + log + 'G3:L}, TEXT(' + log + 'D3:D, "0000")="' + code +
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
		(r) => String(r.values[0]).trim() === name && code_(r.values[2]) === code,
	);
	if (!name || !code || !hit) return { ok: false, error: 'wrong' };
	return { ok: true, name: name, code: code, age: String(hit.values[1] || '') };
}

/** 그 학생의 기록(오래된 것부터) */
function history_(log, code) {
	return rows_(log, LOG_HEAD.length)
		.filter((r) => code_(r.values[2]) === code)
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
		// 하루 한 번 제한은 없앴다(2026-11-24) — 같은 날 다시 풀면 한 줄 더 쌓인다(앱이 다시 풀기 전에 묻는다)
		const rate = d.total ? Math.round((d.correct / d.total) * 100) : 0;
		append_(LOG, log, [
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

/** 표(이름 = 탭 이름)에 한 줄 — 표가 있으면 표 안에(표가 함께 늘어난다), 없으면 마지막 줄 아래에 */
function append_(name, sh, values) {
	const id = tableId_(name);
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
	const row = Math.max(sh.getLastRow(), TOP) + 1;
	sh.getRange(row, LEFT, 1, values.length).setNumberFormat('@').setValues([values]);
	if (name === LOG) sh.getRange(row, LEFT + 7, 1, 4).setNumberFormat('0');
}

/** 날짜 칸은 시트가 Date 로 바꿔 둘 수 있어 글자로 맞춘다 */
function dayOf_(v) {
	return v instanceof Date ? Utilities.formatDate(v, TZ, 'yyyy-MM-dd') : String(v);
}
