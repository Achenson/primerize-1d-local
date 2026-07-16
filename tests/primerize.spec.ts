import { test, expect } from '@playwright/test';

test.describe('Stanford Primerize 1D - WebAssembly E2E Test', () => {

    test('should generate correct primers for hGln_TTG_3-1_CCA', async ({ page }) => {
        const testSequence = 'TTCTAATACGACTCACTATAGGCCCCATGGTGTAATGGTTAGCACTCTGGACTTTGAATCCAGCGATCCGAGTTCAAATCTCGGTGGGACCTCCA';

        // Oczekiwane sekwencje starterów wyliczone przez algorytm Stanforda
        const expectedPrimer1 = 'TTCTAATACGACTCACTATAGGCCCCATGGTGTAATGGTTAGCACTCTGGACTTTGAAT';
        const expectedPrimer2 = 'TGGAGGTCCCACCGAGATTTGAACTCGGATCGCTGGATTCAAAGTCCAGAGTGCTAAC';

        // 1. Wejdź na stronę główną aplikacji
        await page.goto('/');

        // 2. Czekamy, aż status silnika zmieni się na 'Ready'
        const statusText = page.locator('span:has-text("Ready")');
        await expect(statusText).toBeVisible({ timeout: 10000 });

        // 3. Lokalizujemy pole tekstowe i symulujemy natywne wklejenie sekwencji (Ctrl+V)
        const textarea = page.locator('textarea');
        await textarea.fill(testSequence);

        // 4. Klikamy przycisk obliczeń
        const calcButton = page.locator('button', { hasText: 'Calculate Primers' });
        await calcButton.click();

        // 5. Weryfikujemy zawartość czarnego okna wyników (<pre>)
        const resultsTerminal = page.locator('pre');

        // Playwright checks report counts, structural keys, base strings, and lengths
        await expect(resultsTerminal).toContainText('Number of Primers Designed: 2');

        // Asserts 1F name, its unique structural string, and its precise 59 bp column length
        await expect(resultsTerminal).toContainText('1F');
        await expect(resultsTerminal).toContainText(expectedPrimer1);
        await expect(resultsTerminal).toContainText('59');

        // Asserts 2R name, its unique structural string, and its precise 58 bp column length
        await expect(resultsTerminal).toContainText('2R');
        await expect(resultsTerminal).toContainText(expectedPrimer2);
        await expect(resultsTerminal).toContainText('58');
    });
});
