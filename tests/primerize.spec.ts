import { test, expect } from '@playwright/test';

test.describe('Stanford Primerize 1D - WebAssembly E2E Test', () => {

    test('should generate correct primers for hGln_TTG_3-1_CCA (promoter added automatically)', async ({ page }) => {
        const testSequence = 'GGCCCCATGGTGTAATGGTTAGCACTCTGGACTTTGAATCCAGCGATCCGAGTTCAAATCTCGGTGGGACCTCCA';

        // Oczekiwane sekwencje starterów wyliczone przez algorytm Stanforda
        const expectedPrimer1 = 'TTCTAATACGACTCACTATAGGCCCCATGGTGTAATGGTTAGCACTCTGGACTTTGAAT';
        const expectedPrimer2 = 'TGGAGGTCCCACCGAGATTTGAACTCGGATCGCTGGATTCAAAGTCCAGAGTGCTAAC';

        // 1. Wejdź na stronę główną aplikacji
        await page.goto('/');

        // 2. Czekamy, aż status silnika zmieni się na 'Ready'
        const statusText = page.locator('span:has-text("Ready")');
        await expect(statusText).toBeVisible({ timeout: 20000 });

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

    test('should generate misprime warning for mtThr_TGT_1 (promoter in the sequence)', async ({ page }) => {
        const testSequence = 'TTCTAATACGACTCACTATAgGTCCTTGTAGTATAAACTAATACACCAGTCTTGTAAACCGGAGATGAAAACCTTTTTCCAAGGACACCA';

        // 1. Navigate to the local server build
        await page.goto('/');

        // 2. Await the WebAssembly engine's standard handshake sweep
        const statusText = page.locator('span:has-text("Ready")');
        await expect(statusText).toBeVisible({ timeout: 20000 });

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

    test('should generate correct primers at max primer lenght 70 for mtThr_TGT_1 (promoter in the sequence) without misprime warning', async ({ page }) => {
        const testSequence = 'TTCTAATACGACTCACTATAgGTCCTTGTAGTATAAACTAATACACCAGTCTTGTAAACCGGAGATGAAAACCTTTTTCCAAGGACACCA';

        const expected70Primer1 = 'TTCTAATACGACTCACTATAGGTCCTTGTAGTATAAACTAATACACCAGTCTTGTAAACCGGAGATG';
        const expected70Primer2 = 'TGGTGTCCTTGGAAAAAGGTTTTCATCTCCGGTTTACAAGACTG';

        // 1. Visit the local React development portal
        await page.goto('/');

        // 2. Wait for the engine initialization lifecycle hook to finish
        const statusText = page.locator('span:has-text("Ready")');
        await expect(statusText).toBeVisible({ timeout: 20000 });

        // 3. Rozwijamy opcje zaawansowane
        const advancedToggleBtn = page.locator('button', { hasText: 'Show Advanced Design Settings' });
        await advancedToggleBtn.click();

        // 4. Wprowadzamy wartość Max Limit (Celujemy za pomocą pierwszej gałki spinbutton)
        const maxLengthInput = page.getByRole('spinbutton').nth(1);
        await maxLengthInput.click();
        await maxLengthInput.fill('');
        await maxLengthInput.fill('70');
        await maxLengthInput.blur();

        // 5. Wprowadzamy sekwencję nukleotydową
        const textarea = page.locator('textarea');
        await textarea.fill(testSequence);

        // 6. Odpalamy silnik obliczeniowy
        const calcButton = page.locator('button', { hasText: 'Calculate Primers' });
        await calcButton.click();

        // 7. Weryfikacja terminala wynikowego
        const resultsTerminal = page.getByTestId('primerize-terminal');

        // FIX 1: Dodajemy timeout 20000ms, aby Playwright cierpliwie poczekał na zakończenie obliczeń WASM
        await expect(resultsTerminal).toBeVisible({ timeout: 20000 });

        // FIX 2: Dopasowanie sprawdzanego tekstu do nowego formatu jednostek ("bp" zamiast "bases") z run_primerize.py
        await expect(resultsTerminal).toContainText('Max Limit: 70 bp');
        await expect(resultsTerminal).toContainText('Min Limit: 15 bp');
        await expect(resultsTerminal).toContainText('Min Tm: 60.0°C');
        await expect(resultsTerminal).toContainText('Number of Primers Designed: 2');

        // Sprawdzamy obecność wygenerowanych starterów
        await expect(resultsTerminal).toContainText('Oligo_1F (67 bp)');
        await expect(resultsTerminal).toContainText(expected70Primer1);
        await expect(resultsTerminal).toContainText('Oligo_2R (44 bp)');
        await expect(resultsTerminal).toContainText(expected70Primer2);

        // Sprawdzamy brak ostrzeżeń
        const warningAlert = page.getByTestId('primerize-warning');
        await expect(warningAlert).not.toBeVisible();
    });



});
