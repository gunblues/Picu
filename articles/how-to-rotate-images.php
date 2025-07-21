<?php
// This file is included by index.php, so getTranslation() and $currentLang are already available.
// No need to include translations.php or redefine getTranslation() here.
?>
<main class="static-page">
    <h1><?php echo getTranslation('howToRotateImagesTitle'); ?></h1>
    <p><?php echo getTranslation('howToRotateImagesIntro'); ?></p>

    <h2><?php echo getTranslation('whyRotateImagesTitle'); ?></h2>
    <p><?php echo getTranslation('whyRotateImagesContent'); ?></p>

    <h2><?php echo getTranslation('howToUsePicuRotateTitle'); ?></h2>
    <ol>
        <li><?php echo getTranslation('rotateStep1'); ?></li>
        <li><?php echo getTranslation('rotateStep2'); ?></li>
        <li><?php echo getTranslation('rotateStep3'); ?></li>
        <li><?php echo getTranslation('rotateStep4'); ?></li>
    </ol>

    <h2><?php echo getTranslation('tipsForRotatingTitle'); ?></h2>
    <ul>
        <li><?php echo getTranslation('rotateTip1'); ?></li>
        <li><?php echo getTranslation('rotateTip2'); ?></li>
    </ul>

    <p><?php echo getTranslation('rotateConclusion'); ?></p>
</main>
