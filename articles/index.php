<?php
// This file is included by index.php, so getTranslation() and $currentLang are already available.
// No need to include translations.php or redefine getTranslation() here.
?>
<main class="static-page">
    <h1><?php echo getTranslation('tutorialsSectionTitle'); ?></h1>
    <p><?php echo getTranslation('tutorialsIntro'); ?></p>

    <ul class="article-list">
        <li><a href="/<?php echo $currentLang; ?>/articles/how-to-compress-images"><?php echo getTranslation('howToCompressImagesTitle'); ?></a></li>
        <li><a href="/<?php echo $currentLang; ?>/articles/how-to-crop-images"><?php echo getTranslation('howToCropImagesTitle'); ?></a></li>
        <li><a href="/<?php echo $currentLang; ?>/articles/how-to-resize-images"><?php echo getTranslation('howToResizeImagesTitle'); ?></a></li>
        <li><a href="/<?php echo $currentLang; ?>/articles/how-to-rotate-images"><?php echo getTranslation('howToRotateImagesTitle'); ?></a></li>
        <li><a href="/<?php echo $currentLang; ?>/articles/how-to-remove-background"><?php echo getTranslation('howToRemoveBackgroundTitle'); ?></a></li>
        <li><a href="/<?php echo $currentLang; ?>/articles/how-to-add-white-background"><?php echo getTranslation('howToAddWhiteBackgroundTitle'); ?></a></li>
        <li><a href="/<?php echo $currentLang; ?>/articles/how-to-watermark-images"><?php echo getTranslation('howToWatermarkImagesTitle'); ?></a></li>
        <!-- Future articles will be listed here -->
    </ul>
</main>
