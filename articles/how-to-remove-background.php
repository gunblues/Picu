<?php
// This file is included by index.php, so getTranslation() and $currentLang are already available.
// No need to include translations.php or redefine getTranslation() here.
?>
<main class="static-page">
    <h1><?php echo getTranslation('howToRemoveBackgroundTitle'); ?></h1>
    <p><?php echo getTranslation('howToRemoveBackgroundIntro'); ?></p>

    <h2><?php echo getTranslation('whyRemoveBackgroundTitle'); ?></h2>
    <p><?php echo getTranslation('whyRemoveBackgroundContent'); ?></p>

    <h2><?php echo getTranslation('howToUsePicuRemoveBackgroundTitle'); ?></h2>
    <ol>
        <li><?php echo getTranslation('removebgStep1'); ?></li>
        <li><?php echo getTranslation('removebgStep2'); ?></li>
        <li><?php echo getTranslation('removebgStep3'); ?></li>
        <li><?php echo getTranslation('removebgStep4'); ?></li>
    </ol>

    <h2><?php echo getTranslation('tipsForRemoveBackgroundTitle'); ?></h2>
    <ul>
        <li><?php echo getTranslation('removebgTip1'); ?></li>
        <li><?php echo getTranslation('removebgTip2'); ?></li>
    </ul>

    <p><?php echo getTranslation('removebgConclusion'); ?></p>
</main>
