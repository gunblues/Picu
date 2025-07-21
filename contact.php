<?php
require_once 'modules/translations.php';

// Language detection logic (same as index.php)
$currentLang = 'en';
$requestUri = $_SERVER['REQUEST_URI'];
$pathSegments = explode('/', trim($requestUri, '/'));
if (isset($pathSegments[0]) && array_key_exists($pathSegments[0], $translations)) {
    $currentLang = $pathSegments[0];
} else {
    if (isset($_SERVER['HTTP_ACCEPT_LANGUAGE'])) {
        $browserLangs = explode(',', $_SERVER['HTTP_ACCEPT_LANGUAGE']);
        foreach ($browserLangs as $lang) {
            $lang = substr($lang, 0, 2);
            if (array_key_exists($lang, $translations)) {
                $currentLang = $lang;
                break;
            }
        }
    }
}

function getTranslation($key) {
    global $translations, $currentLang;
    return $translations[$currentLang][$key] ?? $key;
}
?>
<!DOCTYPE html>
<html lang="<?php echo $currentLang; ?>">
<head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1" />
    <title><?php echo getTranslation('contactUsTitle'); ?> - Picu</title>
    <link rel="stylesheet" href="/dist/assets/style.B1UYG75_.css">
    <style>
        body { display: flex; flex-direction: column; min-height: 100vh; }
        main { flex: 1; }
        .static-page { max-width: 800px; margin: 40px auto; padding: 20px; }
        footer { background-color: #f8f9fa; padding: 20px 0; text-align: center; margin-top: auto; }
        footer a { margin: 0 15px; text-decoration: none; color: #333; }
    </style>
</head>
<body>
    <main class="static-page">
        <h1><?php echo getTranslation('contactUsTitle'); ?></h1>
        <p><?php echo getTranslation('contactUsContent'); ?></p>
        <a href="mailto:contact.picu@gmail.com">contact.picu@gmail.com</a>
    </main>
    <footer>
        <a href="/about.php"><?php echo getTranslation('footerAbout'); ?></a>
        <a href="/contact.php"><?php echo getTranslation('footerContact'); ?></a>
        <a href="/privacy.php"><?php echo getTranslation('footerPrivacy'); ?></a>
    </footer>
</body>
</html>
