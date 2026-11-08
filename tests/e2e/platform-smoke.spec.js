import { expect, test } from '@playwright/test';

test.beforeEach(async ({ page }) => {
  await page.addInitScript(() => localStorage.setItem('product-experience-center:locale', 'zh-Hans'));
});

async function enterDemo(page) {
  await page.goto('/', { waitUntil: 'domcontentloaded' });
  await page.getByLabel('账号', { exact: true }).fill('UI reviewer');
  await page.getByLabel('密码', { exact: true }).fill('demo');
  await page.getByRole('button', { name: '进入平台' }).click();
  await expect(page.getByRole('link', { name: '项目管理', exact: true })).toBeVisible();
}

test('enters the native UI demo and signs out without exposing legacy tools', async ({ page }) => {
  await enterDemo(page);
  await expect(page).toHaveTitle('Preview');
  await expect(page.getByRole('button', { name: '管理控制台', exact: true })).toHaveAttribute(
    'aria-pressed',
    'true',
  );
  await expect(page.getByRole('button', { name: '控制台', exact: true })).toHaveCount(0);
  await expect(page.locator('iframe')).toHaveCount(0);
  await page.getByRole('button', { name: '个人中心' }).click();
  await page.getByRole('menuitem', { name: '退出登录' }).click();
  await expect(page.getByRole('button', { name: '进入平台' })).toBeVisible();
});

test('preserves demo navigation on refresh and closes the page document with Escape', async ({ page }) => {
  await enterDemo(page);
  await page.getByRole('link', { name: '账号管理', exact: true }).click();
  await page.reload();
  await expect(page.getByRole('link', { name: '账号管理', exact: true })).toHaveAttribute(
    'aria-current',
    'page',
  );
  const trigger = page.getByRole('button', { name: '本页文档', exact: true });
  await trigger.click();
  await expect(trigger).toHaveAttribute('aria-expanded', 'true');
  await expect(page.getByRole('complementary', { name: '本页文档' })).toBeVisible();
  await page.keyboard.press('Escape');
  await expect(trigger).toHaveAttribute('aria-expanded', 'false');
  await expect(trigger).toBeFocused();
});
