<?php
// This file is included by index.php, so getTranslation() and $currentLang are already available.
// No need to include translations.php or redefine getTranslation() here.
?>
<main class="static-page">
    <h1><?php echo getTranslation('howToResizeImagesTitle'); ?></h1>
    <p><?php echo getTranslation('howToResizeImagesIntro'); ?></p>

    <h2><?php echo getTranslation('whyResizeImagesTitle'); ?></h2>
    <p><?php echo getTranslation('whyResizeImagesContent'); ?></p>

    <h2><?php echo getTranslation('howToUsePicuResizeTitle'); ?></h2>
    <ol>
        <li><?php echo getTranslation('resizeStep1'); ?></li>
        <li><?php echo getTranslation('resizeStep2'); ?></li>
        <li><?php echo getTranslation('resizeStep3'); ?></li>
        <li><?php echo getTranslation('resizeStep4'); ?></li>
        <li><?php echo getTranslation('resizeStep5'); ?></li>
    </ol>

    <h2><?php echo getTranslation('tipsForResizingTitle'); ?></h2>
    <ul>
        <li><?php echo getTranslation('resizeTip1'); ?></li>
        <li><?php echo getTranslation('resizeTip2'); ?></li>
        <li><?php echo getTranslation('resizeTip3'); ?></li>
    </ul>

    <p><?php echo getTranslation('resizeConclusion'); ?></p>
</main>
