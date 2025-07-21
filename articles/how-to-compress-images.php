<?php
// This file is included by index.php, so getTranslation() and $currentLang are already available.
// No need to include translations.php or redefine getTranslation() here.
?>
<main class="static-page">
    <h1><?php echo getTranslation('howToCompressImagesTitle'); ?></h1>
    <p><?php echo getTranslation('howToCompressImagesIntro'); ?></p>

    <h2><?php echo getTranslation('whyCompressImagesTitle'); ?></h2>
    <p><?php echo getTranslation('whyCompressImagesContent'); ?></p>

    <h2><?php echo getTranslation('howToUsePicuCompressTitle'); ?></h2>
    <ol>
        <li><?php echo getTranslation('compressStep1'); ?></li>
        <li><?php echo getTranslation('compressStep2'); ?></li>
        <li><?php echo getTranslation('compressStep3'); ?></li>
        <li><?php echo getTranslation('compressStep4'); ?></li>
        <li><?php echo getTranslation('compressStep5'); ?></li>
    </ol>

    <h2><?php echo getTranslation('tipsForCompressionTitle'); ?></h2>
    <ul>
        <li><?php echo getTranslation('tip1'); ?></li>
        <li><?php echo getTranslation('tip2'); ?></li>
        <li><?php echo getTranslation('tip3'); ?></li>
    </ul>

    <p><?php echo getTranslation('compressConclusion'); ?></p>
</main>
