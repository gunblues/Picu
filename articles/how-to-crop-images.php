<?php
// This file is included by index.php, so getTranslation() and $currentLang are already available.
// No need to include translations.php or redefine getTranslation() here.
?>
<main class="static-page">
    <h1><?php echo getTranslation('howToCropImagesTitle'); ?></h1>
    <p><?php echo getTranslation('howToCropImagesIntro'); ?></p>

    <h2><?php echo getTranslation('whyCropImagesTitle'); ?></h2>
    <p><?php echo getTranslation('whyCropImagesContent'); ?></p>

    <h2><?php echo getTranslation('howToUsePicuCropTitle'); ?></h2>
    <ol>
        <li><?php echo getTranslation('cropStep1'); ?></li>
        <li><?php echo getTranslation('cropStep2'); ?></li>
        <li><?php echo getTranslation('cropStep3'); ?></li>
        <li><?php echo getTranslation('cropStep4'); ?></li>
        <li><?php echo getTranslation('cropStep5'); ?></li>
    </ol>

    <h2><?php echo getTranslation('tipsForCroppingTitle'); ?></h2>
    <ul>
        <li><?php echo getTranslation('cropTip1'); ?></li>
        <li><?php echo getTranslation('cropTip2'); ?></li>
        <li><?php echo getTranslation('cropTip3'); ?></li>
    </ul>

    <p><?php echo getTranslation('cropConclusion'); ?></p>
</main>
