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

    test('should generate misprime warning for mtThr_TGT_1', async ({ page }) => {
        const testSequence = 'TTCTAATACGACTCACTATAgGTCCTTGTAGTATAAACTAATACACCAGTCTTGTAAACCGGAGATGAAAACCTTTTTCCAAGGACACCA';

        // 1. Navigate to the local server build
        await page.goto('/');

        // 2. Await the WebAssembly engine's standard handshake sweep
        const statusText = page.locator('span:has-text("Ready")');
        await expect(statusText).toBeVisible({ timeout: 10000 });

        // 3. Fill out the target nucleotide block sequence
        const textarea = page.locator('textarea');
        await textarea.fill(testSequence);

        // 4. Fire the optimization calculation block sequence loop
        const calcButton = page.locator('button', { hasText: 'Calculate Primers' });
        await calcButton.click();

        // 5. Verify the validation text alerts exist inside the screen console element
        const resultsTerminal = page.locator('pre');

        // Asserts that the engine identified structural issues and printed the warning parameters
        await expect(resultsTerminal).toContainText('WARNINGS & MISPRIMING ALERTS:');
        await expect(resultsTerminal).toContainText('can misprime with');
        await expect(resultsTerminal).toContainText('residue overlap');
    });

    test('should correct primers at max primer lenght 70 for mtThr_TGT_1 without misprime warning', async ({ page }) => {
        const testSequence = 'TTCTAATACGACTCACTATAgGTCCTTGTAGTATAAACTAATACACCAGTCTTGTAAACCGGAGATGAAAACCTTTTTCCAAGGACACCA';

        const expected70Primer1 = 'TTCTAATACGACTCACTATAGGTCCTTGTAGTATAAACTAATACACCAGTCTTGTAAACCGGAGATG';
        const expected70Primer2 = 'TGGTGTCCTTGGAAAAAGGTTTTCATCTCCGGTTTACAAGACTG';

        // 1. Visit the local React development portal
        await page.goto('/');

        // 2. Wait for the engine initialization lifecycle hook to finish
        const statusText = page.locator('span:has-text("Ready")');
        await expect(statusText).toBeVisible({ timeout: 10000 });

        // 3. Locate the Max Length input box and simulate typing "70" from scratch
        const maxLengthInput = page.locator('input[type="number"]');
        await maxLengthInput.click();
        await maxLengthInput.fill(''); // Clears out default value '60'
        await maxLengthInput.fill('70'); // Types our custom constraint
        await maxLengthInput.blur(); // Triggers the React onBlur boundaries check

        // 4. Input the nucleotide sequence block
        const textarea = page.locator('textarea');
        await textarea.fill(testSequence);

        // 5. Fire the calculation request execution pipeline
        const calcButton = page.locator('button', { hasText: 'Calculate Primers' });
        await calcButton.click();

        // 6. Access the emerald `<pre>` code block element console matrix
        const resultsTerminal = page.locator('pre');

        // Verify the newly structured output sizes
        await expect(resultsTerminal).toContainText('Max Oligo Length Limit: 70 bases');
        await expect(resultsTerminal).toContainText('Number of Primers Designed: 2');

        // Assert 1F properties and correct 67 bp length matrix format
        await expect(resultsTerminal).toContainText('1F');
        await expect(resultsTerminal).toContainText(expected70Primer1);
        await expect(resultsTerminal).toContainText('67');

        // Assert 2R properties and correct 44 bp length matrix format
        await expect(resultsTerminal).toContainText('2R');
        await expect(resultsTerminal).toContainText(expected70Primer2);
        await expect(resultsTerminal).toContainText('44');

        // ASSERT NEGATIVE SAFETY FACTOR: The misprime block header must NOT exist in the text node layout buffer
        await expect(resultsTerminal).not.toContainText('WARNINGS & MISPRIMING ALERTS:');
    });

});
