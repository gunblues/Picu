<?php
// This file is included by index.php, so getTranslation() and $currentLang are already available.
// No need to include translations.php or redefine getTranslation() here.
?>
<!DOCTYPE html>
<html lang="<?php echo $currentLang; ?>">
<head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1" />
    <title><?php echo getTranslation('tutorialsSectionTitle'); ?> - Picu</title>
    <link rel="stylesheet" href="/dist/assets/style.BD4YzPQX.css">
    <style>
        body { display: flex; flex-direction: column; min-height: 100vh; }
        main { flex: 1; }
        .static-page { max-width: 800px; margin: 40px auto; padding: 20px; }
        footer { background-color: #f8f9fa; padding: 20px 0; text-align: center; margin-top: auto; }
        footer a { margin: 0 15px; text-decoration: none; color: #333; }
        .article-list li { margin-bottom: 10px; }
    </style>
</head>
<body>
    <main class="static-page">
        <h1><?php echo getTranslation('tutorialsSectionTitle'); ?></h1>
        <p><?php echo getTranslation('tutorialsIntro'); ?></p>

        <ul class="article-list">
            <li><a href="/<?php echo $currentLang; ?>/articles/how-to-compress-images"><?php echo getTranslation('howToCompressImagesTitle'); ?></a></li>
            <!-- Future articles will be listed here -->
        </ul>
    </main>
    <footer>
        <div class="footer-container">
            <div class="footer-links">
                <a href="/<?php echo $currentLang; ?>/about"><?php echo getTranslation('footerAbout'); ?></a>
                <a href="/<?php echo $currentLang; ?>/contact"><?php echo getTranslation('footerContact'); ?></a>
                <a href="/<?php echo $currentLang; ?>/privacy"><?php echo getTranslation('footerPrivacy'); ?></a>
            </div>
            <div class="footer-copyright">
                &copy; <?php echo date("Y"); ?> Picu. All Rights Reserved.
            </div>
        </div>
    </footer>
</body>
</html>
