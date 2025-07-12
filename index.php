<?php
require_once 'modules/translations.php';

// Determine current language
$currentLang = 'en'; // Default language

// 1. Try to get language from URL path (e.g., /en/, /zh/)
$requestUri = $_SERVER['REQUEST_URI'];
$pathSegments = explode('/', trim($requestUri, '/'));
if (isset($pathSegments[0]) && array_key_exists($pathSegments[0], $translations)) {
    $currentLang = $pathSegments[0];
} else {
    // 2. Fallback to browser's Accept-Language header
    if (isset($_SERVER['HTTP_ACCEPT_LANGUAGE'])) {
        $browserLangs = explode(',', $_SERVER['HTTP_ACCEPT_LANGUAGE']);
        foreach ($browserLangs as $lang) {
            $lang = substr($lang, 0, 2); // Get first two characters (e.g., "en", "zh")
            if (array_key_exists($lang, $translations)) {
                $currentLang = $lang;
                break;
            }
        }
    }
}

function getTranslation($key) {
    global $translations, $currentLang;
    return $translations[$currentLang][$key] ?? $key; // Fallback to key if translation not found
}
?>
<!DOCTYPE html>
<html lang="<?php echo $currentLang; ?>">
<head>
<meta charset="UTF-8" />
<meta name="viewport" content="width=device-width, initial-scale=1" />
<title><?php echo getTranslation('title'); ?></title>
<!-- Favicon -->
<link rel="icon" type="image/png" sizes="32x32" href="/icons/favicon-32x32.png">
<link rel="icon" type="image/png" sizes="16x16" href="/icons/favicon-16x16.png">
<link rel="apple-touch-icon" sizes="180x180" href="/icons/apple-touch-icon.png">
<link rel="manifest" href="/icons/site.webmanifest">

<link rel="stylesheet" href="/dist/assets/style.B5aEvsmp.css">
<link rel="stylesheet" href="lib/cropper.min.css">
<script src="lib/jszip.min.js" defer></script>
<script src="lib/cropper.min.js" defer></script>
<script src="https://cdn.jsdelivr.net/npm/@mediapipe/selfie_segmentation/selfie_segmentation.js" defer></script>

<!-- SEO Meta Tags -->
<meta name="description" content="<?php echo getTranslation('seoDescription'); ?>">
<meta name="keywords" content="<?php echo getTranslation('seoKeywords'); ?>">

<!-- Open Graph / Facebook -->
<meta property="og:type" content="website">
<meta property="og:url" content="https://picu.app/"> <!-- Replace with your actual website URL -->
<meta property="og:title" content="<?php echo getTranslation('ogTitle'); ?>">
<meta property="og:description" content="<?php echo getTranslation('ogDescription'); ?>">
<meta property="og:image" content="https://picu.app/picu-og-image.jpg">

<!-- Twitter -->
<meta property="twitter:card" content="summary_large_image">
<meta property="twitter:url" content="https://picu.app/"> <!-- Replace with your actual website URL -->
<meta property="twitter:title" content="<?php echo getTranslation('twitterTitle'); ?>">
<meta property="twitter:description" content="<?php echo getTranslation('twitterDescription'); ?>">
<meta property="twitter:image" content="https://picu.app/picu-twitter-image.jpg">

<!-- 多國語言 hreflang 標籤 -->
<link rel="alternate" hreflang="en" href="https://picu.app/en/" />
<link rel="alternate" hreflang="zh" href="https://picu.app/zh/" />
<link rel="alternate" hreflang="ja" href="https://picu.app/ja/" />
<link rel="alternate" hreflang="ko" href="https://picu.app/ko/" />
<link rel="alternate" hreflang="es" href="https://picu.app/es/" />
<link rel="alternate" hreflang="hi" href="https://picu.app/hi/" />
<link rel="alternate" hreflang="ar" href="https://picu.app/ar/" />
<link rel="alternate" hreflang="fr" href="https://picu.app/fr/" />
<link rel="alternate" hreflang="bn" href="https://picu.app/bn/" />
<link rel="alternate" hreflang="pt" href="https://picu.app/pt/" />
<link rel="alternate" hreflang="ru" href="https://picu.app/ru/" />
<link rel="alternate" hreflang="x-default" href="https://picu.app/" />

<script async src="https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=pub-1004943414433052"
     crossorigin="anonymous"></script>
<!-- Google tag (gtag.js) -->
<script async src="https://www.googletagmanager.com/gtag/js?id=G-DQ2LFZDBSS"></script>
<script>
  window.dataLayer = window.dataLayer || [];
  function gtag(){dataLayer.push(arguments);}
  gtag('js', new Date());

  gtag('config', 'G-DQ2LFZDBSS');
</script>

</head>
<body>

<main>
  <h1>🐣<?php echo getTranslation('title'); ?></h1>

  <div class="section" id="upload-section">
    <h2><?php echo getTranslation('uploadTitle'); ?></h2>
    <div id="upload-area" tabindex="0"><?php echo getTranslation('uploadArea'); ?></div>
    <input id="file-input" type="file" accept="image/*" multiple style="display:none" />
    <div id="uploaded-list" aria-label="已上傳圖片列表"></div>
    <div class="upload-actions">
        <button id="select-all-btn"><?php echo getTranslation('selectAll'); ?></button>
        <button id="deselect-all-btn"><?php echo getTranslation('deselectAll'); ?></button>
    </div>
  </div> <!-- /#upload-section -->

  <div class="section" id="tools-section">
    <div id="tabs">
      <button data-tab="compress" class="active"><?php echo getTranslation('tabCompress'); ?></button>
      <button data-tab="resize"><?php echo getTranslation('tabResize'); ?></button>
      <button data-tab="whitebg"><?php echo getTranslation('tabWhitebg'); ?></button>
      <button data-tab="enhance"><?php echo getTranslation('tabEnhance'); ?></button>
      <button data-tab="crop"><?php echo getTranslation('tabCrop'); ?></button>
      <button data-tab="removebg"><?php echo getTranslation('tabRemovebg'); ?></button>
    </div>

    <div id="compress" class="tab-content active">
      <h3><?php echo getTranslation('compressTitle'); ?></h3>
      <div class="tool-controls">
        <div class="control-group">
          <label for="compress-quality"><?php echo getTranslation('qualityLabel'); ?> <span id="compress-quality-value">70</span></label>
          <input type="range" id="compress-quality" min="1" max="100" value="70" />
        </div>
        <div class="control-group">
          <label for="compress-format"><?php echo getTranslation('formatLabel'); ?></label>
          <select id="compress-format">
            <option value="original"><?php echo getTranslation('originalFormat'); ?></option>
            <option value="image/jpeg">JPEG</option>
            <option value="image/webp">WEBP</option>
          </select>
        </div>
        <div class="control-group">
          <label for="compress-resize-width"><?php echo getTranslation('widthLabel'); ?></label>
          <input id="compress-resize-width" type="number" min="1" placeholder="<?php echo getTranslation('autoPlaceholder'); ?>">
        </div>
        <div class="control-group">
          <label for="compress-resize-height"><?php echo getTranslation('heightLabel'); ?></label>
          <input id="compress-resize-height" type="number" min="1" placeholder="<?php echo getTranslation('autoPlaceholder'); ?>">
        </div>
      </div>
      <div id="compress-list"></div>
      <button id="compress-btn"><?php echo getTranslation('compressBtn'); ?></button>
    </div>

    <div id="resize" class="tab-content">
      <h3><?php echo getTranslation('resizeTitle'); ?></h3>
      <div class="tool-controls">
        <div class="control-group">
            <label for="resize-width"><?php echo getTranslation('widthLabel'); ?></label>
            <input id="resize-width" type="number" min="1">
        </div>
        <div class="control-group">
            <label for="resize-height"><?php echo getTranslation('heightLabel'); ?></label>
            <input id="resize-height" type="number" min="1">
        </div>
      </div>
      <button id="resize-btn"><?php echo getTranslation('resizeBtn'); ?></button>
      <div id="resize-preview"></div>
    </div>

    <div id="whitebg" class="tab-content">
      <h3><?php echo getTranslation('whitebgTitle'); ?></h3>
        <div class="tool-controls">
            <div class="control-group">
                <label for="whitebg-width"><?php echo getTranslation('widthLabel'); ?></label>
                <input type="number" id="whitebg-width" value="1000" min="100" max="5000">
            </div>
            <div class="control-group">
                <label for="whitebg-height"><?php echo getTranslation('heightLabel'); ?></label>
                <input type="number" id="whitebg-height" value="1000" min="100" max="5000">
            </div>
            <div class="control-group checkbox-group">
                <label><input type="checkbox" id="whitebg-shadow" /> <span class="data-i18n-key-addShadow"><?php echo getTranslation('addShadow'); ?></span></label>
                <label><input type="checkbox" id="whitebg-border" /> <span class="data-i18n-key-addBorder"><?php echo getTranslation('addBorder'); ?></span></label>
            </div>
        </div>
      <button id="whitebg-btn"><?php echo getTranslation('whitebgBtn'); ?></button>
      <div id="whitebg-preview"></div>
    </div>

    <div id="enhance" class="tab-content">
      <h3><?php echo getTranslation('enhanceTitle'); ?></h3>
      <div class="tool-controls">
        <div class="control-group">
          <label for="brightness"><?php echo getTranslation('brightnessLabel'); ?> <span id="brightness-value">0</span></label>
          <input type="range" id="brightness" min="-100" max="100" value="0" />
        </div>
        <div class="control-group">
          <label for="saturation"><?php echo getTranslation('saturationLabel'); ?> <span id="saturation-value">100</span></label>
          <input type="range" id="saturation" min="0" max="200" value="100" />
        </div>
        <div class="control-group">
          <label for="contrast"><?php echo getTranslation('contrastLabel'); ?> <span id="contrast-value">100</span></label>
          <input type="range" id="contrast" min="0" max="200" value="100" />
        </div>
        <div class="control-group">
          <label for="filter"><?php echo getTranslation('filterLabel'); ?></label>
          <select id="filter">
            <option value="none"><?php echo getTranslation('filterNone'); ?></option>
            <option value="grayscale"><?php echo getTranslation('filterGrayscale'); ?></option>
            <option value="sepia"><?php echo getTranslation('filterSepia'); ?></option>
            <option value="invert"><?php echo getTranslation('filterInvert'); ?></option>
            <option value="blur"><?php echo getTranslation('filterBlur'); ?></option>
          </select>
        </div>
      </div>
      <canvas id="enhance-canvas"></canvas>
      <button id="enhance-download-btn"><?php echo getTranslation('enhanceBtn'); ?></button>
    </div>

    <div id="crop" class="tab-content">
      <h3><?php echo getTranslation('cropTitle'); ?></h3>
      <div id="crop-toolbar">
        <button data-ratio="1/1"><?php echo getTranslation('ratio1x1'); ?></button>
        <button data-ratio="4/3"><?php echo getTranslation('ratio4x3'); ?></button>
        <button data-ratio="16/9"><?php echo getTranslation('ratio16x9'); ?></button>
        <button data-ratio="custom"><?php echo getTranslation('ratioFree'); ?></button>
      </div>
      <div id="crop-canvas"></div>
      <button id="crop-btn"><?php echo getTranslation('cropBtn'); ?></button>
    </div>

	<div id="removebg" class="tab-content">
	  <h3><?php echo getTranslation('removebgTitle'); ?></h3>
	  <button id="removebg-btn"><?php echo getTranslation('removebgBtn'); ?></button>
	<button id="download-removebg-btn" style="display:none;"><?php echo getTranslation('downloadBtn'); ?></button><br><br>
	  <canvas id="removebg-canvas" style="display:none; max-width:100%;"></canvas><br>
	  <img id="removebg-output" style="display:none; max-width:100%;" alt="Result">
	</div>

  </div>
</main>

<script>
    window.alertTranslations = {
        alertSelectImage: "<?php echo getTranslation('alertSelectImage'); ?>",
        alertDragCropArea: "<?php echo getTranslation('alertDragCropArea'); ?>",
        alertEnterWidthHeight: "<?php echo getTranslation('alertEnterWidthHeight'); ?>",
        alertSelectImageForEnhance: "<?php echo getTranslation('alertSelectImageForEnhance'); ?>",
        alertSelectImageForWhiteBg: "<?php echo getTranslation('alertSelectImageForWhiteBg'); ?>",
        alertSelectImageForCompress: "<?php echo getTranslation('alertSelectImageForCompress'); ?>",
        alertSelectImageForResize: "<?php echo getTranslation('alertSelectImageForResize'); ?>",
        alertSelectImageForRemoveBg: "<?php echo getTranslation('alertSelectImageForRemoveBg'); ?>",
    };
</script>
<script type="module" src="/dist/assets/main.BcKU10YN.js"></script>

</body>
</html>
