<?php
// This file is included by index.php, so getTranslation() and $currentLang are already available.
// No need to include translations.php or redefine getTranslation() here.
?>
<main class="static-page">
    <h1><?php echo getTranslation('tutorialsSectionTitle'); ?></h1>
    <p><?php echo getTranslation('tutorialsIntro'); ?></p>

    <ul class="article-list">
        <li><a href="/<?php echo $currentLang; ?>/articles/how-to-compress-images"><?php echo getTranslation('howToCompressImagesTitle'); ?></a></li>
        <!-- Future articles will be listed here -->
    </ul>
</main>
