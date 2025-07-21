<?php
// This file is included by index.php, so getTranslation() and $currentLang are already available.
// No need to include translations.php or redefine getTranslation() here.
?>
<main class="static-page">
    <h1><?php echo getTranslation('howToAddWhiteBackgroundTitle'); ?></h1>
    <p><?php echo getTranslation('howToAddWhiteBackgroundIntro'); ?></p>

    <h2><?php echo getTranslation('whyAddWhiteBackgroundTitle'); ?></h2>
    <p><?php echo getTranslation('whyAddWhiteBackgroundContent'); ?></p>

    <h2><?php echo getTranslation('howToUsePicuWhiteBackgroundTitle'); ?></h2>
    <ul class="no-dot">
        <li><?php echo getTranslation('whitebgStep1'); ?></li>
        <li><?php echo getTranslation('whitebgStep2'); ?></li>
        <li><?php echo getTranslation('whitebgStep3'); ?></li>
        <li><?php echo getTranslation('whitebgStep4'); ?></li>
    </ul>

    <h2><?php echo getTranslation('tipsForWhiteBackgroundTitle'); ?></h2>
    <ul>
        <li><?php echo getTranslation('whitebgTip1'); ?></li>
        <li><?php echo getTranslation('whitebgTip2'); ?></li>
    </ul>

    <p><?php echo getTranslation('whitebgConclusion'); ?></p>
</main>
