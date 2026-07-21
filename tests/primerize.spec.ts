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
        const resultsTerminal = page.getByTestId('primerize-terminal');

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

        // 5. Verify the results terminal contains the generated oligo layout
        const resultsTerminal = page.getByTestId('primerize-terminal');
        await expect(resultsTerminal).toBeVisible();
        // POPRAWKA: Zmiana tekstu na aktualny nagłówek z run_primerize.py
        await expect(resultsTerminal).toContainText('STANFORD PRIMERIZE 1D TERMINAL REPORT');

        // 6. Verify the biological warning alert box exists using data-testid (Future-proof)
        const warningAlert = page.getByTestId('primerize-warning');
        await expect(warningAlert).toBeVisible();

        // Asserts that the engine identified structural issues inside the warning component
        // Usunęliśmy sztywny ciąg 'Engine Warning:', sprawdzamy same faktyczne komunikaty o misprimingu
        await expect(warningAlert).toContainText('can misprime with');
        await expect(warningAlert).toContainText('residue overlap');

        // Optional sanity check: Ensure that the critical error notification box (rose-50) is NOT present
        const errorAlert = page.locator('div.bg-rose-50');
        await expect(errorAlert).not.toBeVisible();
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

        // 6. Access the results terminal elements via test id
        const resultsTerminal = page.getByTestId('primerize-terminal');
        await expect(resultsTerminal).toBeVisible();

        // POPRAWKA: Dopasowanie do nowego formatu linii limitu długości w Pythonie
        await expect(resultsTerminal).toContainText('Max Limit: 70 bases');
        await expect(resultsTerminal).toContainText('Number of Primers Designed: 2');

        // POPRAWKA: Sprawdzamy nowy format zapisu nagłówka starteru: Nazwa_(kierunek) (długość bp)
        await expect(resultsTerminal).toContainText('Oligo_1F (67 bp)');
        await expect(resultsTerminal).toContainText(expected70Primer1);

        // POPRAWKA: Sprawdzamy drugi starter analogicznie do nowego formatu
        await expect(resultsTerminal).toContainText('Oligo_2R (44 bp)');
        await expect(resultsTerminal).toContainText(expected70Primer2);

        // POPRAWKA: Prawidłowa weryfikacja braku ostrzeżeń o misprimingu na poziomie UI Componentu
        const warningAlert = page.getByTestId('primerize-warning');
        await expect(warningAlert).not.toBeVisible();
    });


});
