import { test, expect } from '@playwright/test';

test.describe('Stanford Primerize 1D - WebAssembly E2E Test', () => {
  test('should generate correct primers for hGln_TTG_3-1_CCA (promoter should be added automatically)', async ({
    page,
  }) => {
    const testSequence =
      'GGCCCCATGGTGTAATGGTTAGCACTCTGGACTTTGAATCCAGCGATCCGAGTTCAAATCTCGGTGGGACCTCCA';

    const expectedPrimer1 =
      'TTCTAATACGACTCACTATAGGCCCCATGGTGTAATGGTTAGCACTCTGGACTTTGAAT';
    const expectedPrimer2 =
      'TGGAGGTCCCACCGAGATTTGAACTCGGATCGCTGGATTCAAAGTCCAGAGTGCTAAC';

    await page.goto('/');

    // Waiting for enginge status to be "Ready"
    const statusText = page.locator('span:has-text("Ready")');
    await expect(statusText).toBeVisible({ timeout: 20000 });

    const textarea = page.locator('textarea');
    await textarea.fill(testSequence);

    const calcButton = page.locator('button', { hasText: 'Calculate Primers' });
    await calcButton.click();

    const resultsTerminal = page.getByTestId('primerize-terminal');
    await expect(resultsTerminal).toBeVisible({ timeout: 20000 });

    await expect(resultsTerminal).toContainText(
      'Number of Primers Designed: 2',
    );

    await expect(resultsTerminal).toContainText(expectedPrimer1);
    await expect(resultsTerminal).toContainText('Oligo_1F (59 bp)');
    await expect(resultsTerminal).toContainText(expectedPrimer2);
    await expect(resultsTerminal).toContainText('Oligo_2R (58 bp)');
  });

  test('should generate misprime warning for mtThr_TGT_1 (promoter already in the sequence)', async ({
    page,
  }) => {
    const testSequence =
      'TTCTAATACGACTCACTATAgGTCCTTGTAGTATAAACTAATACACCAGTCTTGTAAACCGGAGATGAAAACCTTTTTCCAAGGACACCA';

    await page.goto('/');

    const statusText = page.locator('span:has-text("Ready")');
    await expect(statusText).toBeVisible({ timeout: 20000 });

    const textarea = page.locator('textarea');
    await textarea.fill(testSequence);

    const calcButton = page.locator('button', { hasText: 'Calculate Primers' });
    await calcButton.click();

    const resultsTerminal = page.getByTestId('primerize-terminal');
    await expect(resultsTerminal).toBeVisible({ timeout: 20000 });

    const warningAlert = page.getByTestId('primerize-warning');
    await expect(warningAlert).toBeVisible();

    // Asserts that the engine identified structural issues inside the warning component
    await expect(warningAlert).toContainText('can misprime with');
    await expect(warningAlert).toContainText('residue overlap');

    // Optional sanity check: Ensure that the critical error notification box is NOT present
    const errorAlert = page.getByTestId('primerize-error');
    await expect(errorAlert).not.toBeVisible();
  });

  test('should generate correct primers at max primer length 70 for mtThr_TGT_1 (promoter already in the sequence) without misprime warning', async ({
    page,
  }) => {
    const testSequence =
      'TTCTAATACGACTCACTATAgGTCCTTGTAGTATAAACTAATACACCAGTCTTGTAAACCGGAGATGAAAACCTTTTTCCAAGGACACCA';

    const expected70Primer1 =
      'TTCTAATACGACTCACTATAGGTCCTTGTAGTATAAACTAATACACCAGTCTTGTAAACCGGAGATG';
    const expected70Primer2 = 'TGGTGTCCTTGGAAAAAGGTTTTCATCTCCGGTTTACAAGACTG';

    await page.goto('/');

    const statusText = page.locator('span:has-text("Ready")');
    await expect(statusText).toBeVisible({ timeout: 20000 });

    // expanding advanced options
    const advancedToggleBtn = page.locator('button', {
      hasText: 'Show Advanced Design Settings',
    });
    await advancedToggleBtn.click();

    // Max Limit value
    const maxLengthInput = page.getByRole('spinbutton').nth(1);
    await maxLengthInput.click();
    await maxLengthInput.fill('');
    await maxLengthInput.fill('70');
    await maxLengthInput.blur();

    const textarea = page.locator('textarea');
    await textarea.fill(testSequence);

    const calcButton = page.locator('button', { hasText: 'Calculate Primers' });
    await calcButton.click();

    const resultsTerminal = page.getByTestId('primerize-terminal');
    await expect(resultsTerminal).toBeVisible({ timeout: 20000 });

    await expect(resultsTerminal).toContainText('Max Limit: 70 bp');
    await expect(resultsTerminal).toContainText('Min Limit: 15 bp');
    await expect(resultsTerminal).toContainText('Min Tm: 60.0°C');
    await expect(resultsTerminal).toContainText(
      'Number of Primers Designed: 2',
    );

    await expect(resultsTerminal).toContainText('Oligo_1F (67 bp)');
    await expect(resultsTerminal).toContainText(expected70Primer1);
    await expect(resultsTerminal).toContainText('Oligo_2R (44 bp)');
    await expect(resultsTerminal).toContainText(expected70Primer2);

    const warningAlert = page.getByTestId('primerize-warning');
    await expect(warningAlert).not.toBeVisible();
  });

  test('should generate correct primers for hGln_TTG_3-1_CCA (promoter should be added automatically) for custom number of primers, min length and min Tm', async ({
    page,
  }) => {
    const testSequence =
      'GGCCCCATGGTGTAATGGTTAGCACTCTGGACTTTGAATCCAGCGATCCGAGTTCAAATCTCGGTGGGACCTCCA';

    const expectedPrimer1 = 'TTCTAATACGACTCACTATAGGCCCCATGGTGTAA';
    const expectedPrimer2 = 'AGTCCAGAGTGCTAACCATTACACCATGGGGCCTA';
    const expectedPrimer3 = 'TGGTTAGCACTCTGGACTTTGAATCCAGCGATCCGAGTTCAAAT';
    const expectedPrimer4 = 'TGGAGGTCCCACCGAGATTTGAACTCGGATCGCT';

    await page.goto('/');

    const statusText = page.locator('span:has-text("Ready")');
    await expect(statusText).toBeVisible({ timeout: 20000 });

    // expanding advanced options
    const advancedToggleBtn = page.locator('button', {
      hasText: 'Show Advanced Design Settings',
    });
    await advancedToggleBtn.click();

    // Minimum Tm = 59
    const minTmInput = page.getByRole('spinbutton').first();
    await minTmInput.click();
    await minTmInput.fill('');
    await minTmInput.fill('59');
    await minTmInput.blur();

    // Min Oligo Length Limit = 34
    const minLengthInput = page.getByRole('spinbutton').nth(2);
    await minLengthInput.click();
    await minLengthInput.fill('');
    await minLengthInput.fill('34');
    await minLengthInput.blur();

    // Number of Primers = 4
    const numPrimersInput = page.getByRole('spinbutton').nth(3);
    await numPrimersInput.click();
    await numPrimersInput.fill('');
    await numPrimersInput.fill('4');
    await numPrimersInput.blur();

    const textarea = page.locator('textarea');
    await textarea.fill(testSequence);

    const calcButton = page.locator('button', { hasText: 'Calculate Primers' });
    await calcButton.click();

    const resultsTerminal = page.getByTestId('primerize-terminal');
    await expect(resultsTerminal).toBeVisible({ timeout: 20000 });

    await expect(resultsTerminal).toContainText('Input Sequence (95 bp):');
    await expect(resultsTerminal).toContainText(
      'Min Tm: 59.0°C | Max Limit: 60 bp | Min Limit: 34 bp',
    );
    await expect(resultsTerminal).toContainText(
      'Number of Primers Constraint: 4',
    );
    await expect(resultsTerminal).toContainText(
      'Number of Primers Designed: 4',
    );

    await expect(resultsTerminal).toContainText('Oligo_1F (35 bp)');
    await expect(resultsTerminal).toContainText(expectedPrimer1);

    await expect(resultsTerminal).toContainText('Oligo_2R (35 bp)');
    await expect(resultsTerminal).toContainText(expectedPrimer2);

    await expect(resultsTerminal).toContainText('Oligo_3F (44 bp)');
    await expect(resultsTerminal).toContainText(expectedPrimer3);

    await expect(resultsTerminal).toContainText('Oligo_4R (34 bp)');
    await expect(resultsTerminal).toContainText(expectedPrimer4);

    const warningAlert = page.getByTestId('primerize-warning');
    await expect(warningAlert).not.toBeVisible();
  });
});
