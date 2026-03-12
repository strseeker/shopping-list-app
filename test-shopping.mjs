import { chromium } from '@playwright/test';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const FILE_URL = `file:///${__dirname.replace(/\\/g, '/')}/shopping-list.html`;

// 테스트 결과 추적
const results = [];
let passed = 0, failed = 0;

function log(icon, msg) {
  console.log(`${icon} ${msg}`);
}

function assert(condition, testName, detail = '') {
  if (condition) {
    passed++;
    results.push({ status: 'PASS', name: testName });
    log('✅', `PASS: ${testName}`);
  } else {
    failed++;
    results.push({ status: 'FAIL', name: testName, detail });
    log('❌', `FAIL: ${testName}${detail ? ' — ' + detail : ''}`);
  }
}

async function runTests() {
  const browser = await chromium.launch({ headless: true });
  const context = await browser.newContext();
  const page = await context.newPage();

  // localStorage 초기화 (최초 1회만)
  await page.goto(FILE_URL);
  await page.waitForLoadState('domcontentloaded');
  await page.evaluate(() => localStorage.removeItem('shopping'));
  await page.reload();
  await page.waitForLoadState('domcontentloaded');

  log('\n🚀', '=== 쇼핑 리스트 앱 자동 테스트 시작 ===\n');

  // ─── 테스트 1: 페이지 로드 ───
  log('📋', '[ 테스트 그룹 1: 페이지 로드 ]');

  const title = await page.title();
  assert(title === '쇼핑 리스트', '페이지 제목이 "쇼핑 리스트"인가');

  const input = page.locator('#newItem');
  assert(await input.isVisible(), '입력 필드가 보이는가');

  const addBtn = page.locator('.btn-add');
  assert(await addBtn.isVisible(), '추가 버튼이 보이는가');

  const emptyMsg = page.locator('.empty');
  assert(await emptyMsg.isVisible(), '빈 상태 메시지가 표시되는가');

  // ─── 테스트 2: 아이템 추가 ───
  log('\n📋', '[ 테스트 그룹 2: 아이템 추가 ]');

  // 추가 버튼 클릭으로 추가
  await input.fill('사과');
  await addBtn.click();
  await page.waitForTimeout(100);
  let items = page.locator('.item');
  assert(await items.count() === 1, '버튼 클릭으로 아이템 추가됨');

  const firstItemText = await page.locator('.item-text').first().textContent();
  assert(firstItemText === '사과', '추가된 아이템 텍스트가 "사과"인가');

  // 입력창이 비워지는지 확인
  const inputVal = await input.inputValue();
  assert(inputVal === '', '추가 후 입력창이 비워지는가');

  // Enter 키로 추가
  await input.fill('바나나');
  await input.press('Enter');
  await page.waitForTimeout(100);
  assert(await items.count() === 2, 'Enter 키로 아이템 추가됨');

  // 여러 아이템 추가
  const itemNames = ['우유', '빵', '계란'];
  for (const name of itemNames) {
    await input.fill(name);
    await input.press('Enter');
    await page.waitForTimeout(50);
  }
  assert(await items.count() === 5, '총 5개 아이템이 추가됨');

  // 빈 입력 추가 방지
  await input.fill('   ');
  await addBtn.click();
  await page.waitForTimeout(100);
  assert(await items.count() === 5, '빈 입력은 추가되지 않음');

  // 통계 텍스트 확인
  const countText = await page.locator('#count').textContent();
  assert(countText.includes('5'), `통계에 5개 표시됨 (현재: "${countText}")`);

  // ─── 테스트 3: 체크 기능 ───
  log('\n📋', '[ 테스트 그룹 3: 체크(완료) 기능 ]');

  // 첫 번째 아이템 체크
  const firstCheckbox = page.locator('.checkbox').first();
  await firstCheckbox.click();
  await page.waitForTimeout(100);

  const firstItem = page.locator('.item').first();
  const hasDoneClass = await firstItem.evaluate(el => el.classList.contains('done'));
  assert(hasDoneClass, '체크 시 .done 클래스가 추가됨');

  // 취소선 확인
  const textDecoration = await page.locator('.item.done .item-text').first()
    .evaluate(el => window.getComputedStyle(el).textDecorationLine);
  assert(textDecoration.includes('line-through'), '완료 아이템에 취소선이 표시됨');

  // 체크 해제
  await firstCheckbox.click();
  await page.waitForTimeout(100);
  const stillDone = await firstItem.evaluate(el => el.classList.contains('done'));
  assert(!stillDone, '다시 클릭하면 체크 해제됨');

  // 통계 반영 확인
  await firstCheckbox.click();
  await page.waitForTimeout(100);
  const countAfterCheck = await page.locator('#count').textContent();
  assert(countAfterCheck.includes('완료 1'), `완료 1개가 통계에 반영됨 (현재: "${countAfterCheck}")`);

  // ─── 테스트 4: 아이템 삭제 ───
  log('\n📋', '[ 테스트 그룹 4: 아이템 삭제 ]');

  const countBefore = await items.count();
  const firstDelBtn = page.locator('.btn-del').first();
  await firstDelBtn.click();
  await page.waitForTimeout(100);
  const countAfter = await items.count();
  assert(countAfter === countBefore - 1, `삭제 후 아이템 수가 ${countBefore}→${countAfter}로 감소`);

  // ─── 테스트 5: 필터 기능 ───
  log('\n📋', '[ 테스트 그룹 5: 필터 기능 ]');

  // 현재 상태: 4개 아이템 중 0개 완료 (체크 해제된 상태)
  // 한 아이템 체크
  await page.locator('.checkbox').first().click();
  await page.waitForTimeout(100);

  // 전체 필터 (기본)
  const allFilter = page.locator('.filter-btn[data-filter="all"]');
  await allFilter.click();
  await page.waitForTimeout(100);
  const allCount = await items.count();
  assert(allCount > 0, `전체 필터: ${allCount}개 표시됨`);

  // 미완료 필터
  const activeFilter = page.locator('.filter-btn[data-filter="active"]');
  await activeFilter.click();
  await page.waitForTimeout(100);
  const activeCount = await items.count();
  const allItems = await page.locator('.item').count();
  assert(activeCount < allCount, `미완료 필터: ${allCount}개 → ${activeCount}개로 줄어듦`);

  // 완료 필터
  const doneFilter = page.locator('.filter-btn[data-filter="done"]');
  await doneFilter.click();
  await page.waitForTimeout(100);
  const doneCount = await items.count();
  assert(doneCount >= 1, `완료 필터: 완료된 아이템 ${doneCount}개 표시`);
  assert(activeCount + doneCount === allCount, `미완료(${activeCount}) + 완료(${doneCount}) = 전체(${allCount})`);

  // 전체로 되돌리기
  await allFilter.click();
  await page.waitForTimeout(100);

  // ─── 테스트 6: 완료 항목 일괄 삭제 ───
  log('\n📋', '[ 테스트 그룹 6: 완료 항목 일괄 삭제 ]');

  const countBeforeClear = await items.count();
  const doneBeforeClear = await page.locator('.item.done').count();
  const clearBtn = page.locator('.btn-clear');
  await clearBtn.click();
  await page.waitForTimeout(100);
  const countAfterClear = await items.count();
  assert(
    countAfterClear === countBeforeClear - doneBeforeClear,
    `완료 항목 ${doneBeforeClear}개 일괄 삭제됨 (${countBeforeClear}→${countAfterClear}개)`
  );

  const remainingDone = await page.locator('.item.done').count();
  assert(remainingDone === 0, '삭제 후 완료 아이템이 남아있지 않음');

  // ─── 테스트 7: localStorage 저장/복원 ───
  log('\n📋', '[ 테스트 그룹 7: localStorage 저장 기능 ]');

  const itemsBeforeReload = await items.count();
  const savedData = await page.evaluate(() => localStorage.getItem('shopping'));
  assert(savedData !== null, 'localStorage에 데이터가 저장됨');

  // 페이지 새로고침 후 복원 확인
  await page.reload();
  await page.waitForLoadState('domcontentloaded');
  await page.waitForTimeout(200);
  const itemsAfterReload = await page.locator('.item').count();
  assert(
    itemsAfterReload === itemsBeforeReload,
    `새로고침 후 아이템이 복원됨 (${itemsBeforeReload}개)`
  );

  // 스크린샷 저장
  await page.screenshot({ path: 'test-result.png', fullPage: true });
  log('\n📸', '테스트 완료 스크린샷 → test-result.png');

  await browser.close();

  // ─── 최종 결과 ───
  console.log('\n' + '='.repeat(50));
  log('📊', `테스트 결과: ${passed} 통과 / ${failed} 실패 / 총 ${passed + failed}개`);
  console.log('='.repeat(50));

  if (failed === 0) {
    log('🎉', '모든 테스트 통과!');
  } else {
    log('⚠️', '실패한 테스트:');
    results.filter(r => r.status === 'FAIL').forEach(r => {
      console.log(`   ❌ ${r.name}${r.detail ? ': ' + r.detail : ''}`);
    });
  }

  process.exit(failed > 0 ? 1 : 0);
}

runTests().catch(err => {
  console.error('테스트 실행 오류:', err.message);
  process.exit(1);
});
