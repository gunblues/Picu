<?php
// This file is included by index.php, so getTranslation() and $currentLang are already available.
// No need to include translations.php or redefine getTranslation() here.
?>
<main class="static-page">
    <h1><?php echo getTranslation('howToWatermarkImagesTitle'); ?></h1>
    <p><?php echo getTranslation('howToWatermarkImagesIntro'); ?></p>

    <h2><?php echo getTranslation('whyWatermarkImagesTitle'); ?></h2>
    <p><?php echo getTranslation('whyWatermarkImagesContent'); ?></p>

    <h2><?php echo getTranslation('howToUsePicuWatermarkTitle'); ?></h2>
    <ol>
        <li><?php echo getTranslation('watermarkStep1'); ?></li>
        <li><?php echo getTranslation('watermarkStep2'); ?></li>
        <li><?php echo getTranslation('watermarkStep3'); ?></li>
        <li><?php echo getTranslation('watermarkStep4'); ?></li>
        <li><?php echo getTranslation('watermarkStep5'); ?></li>
    </ol>

    <h2><?php echo getTranslation('tipsForWatermarkingTitle'); ?></h2>
    <ul>
        <li><?php echo getTranslation('watermarkTip1'); ?></li>
        <li><?php echo getTranslation('watermarkTip2'); ?></li>
        <li><?php echo getTranslation('watermarkTip3'); ?></li>
    </ul>

    <p><?php echo getTranslation('watermarkConclusion'); ?></p>
</main>
