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

<link rel="stylesheet" href="/dist/assets/style.CLGy8Ncu.css">
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
      <button data-tab="rotate"><?php echo getTranslation('tabRotate'); ?></button>
      <button data-tab="enhance"><?php echo getTranslation('tabEnhance'); ?></button>
      <button data-tab="crop"><?php echo getTranslation('tabCrop'); ?></button>
      <button data-tab="removebg"><?php echo getTranslation('tabRemovebg'); ?></button>
    </div>

    <div id="compress" class="tab-content active">
      <div id="compress-size-info" style="margin-top: 10px; margin-bottom: 10px; font-weight: bold;"></div>
      <div class="tool-controls">
        <div class="control-group">
          <label for="compress-quality"><?php echo getTranslation('qualityLabel'); ?> <span id="compress-quality-value">70</span></label>
          <input type="range" id="compress-quality" min="1" max="100" value="70" />
        </div>
        <div class="control-group">
          <label for="compress-format"><?php echo getTranslation('formatLabel'); ?></label>
          <select id="compress-format">
            <option value="image/jpeg">JPEG</option>
            <option value="image/webp">WEBP</option>
          </select>
        </div>
        <div class="control-group">
          <label for="compress-max-dimension"><?php echo getTranslation('maxDimensionLabel'); ?></label>
          <input id="compress-max-dimension" type="number" min="1" placeholder="<?php echo getTranslation('autoPlaceholder'); ?>">
        </div>
      </div>
      
      <button id="compress-btn"><?php echo getTranslation('compressBtn'); ?></button>
      <div id="compress-progress-container" style="width: 100%; background-color: #e0e0e0; border-radius: 5px; margin-top: 10px; overflow: hidden; display: none;">
        <div id="compress-progress-bar" style="height: 20px; width: 0%; background-color: #4CAF50; border-radius: 5px; text-align: center; line-height: 20px; color: white;"></div>
      </div>
    </div>

    <div id="resize" class="tab-content">
      <fieldset>
        <legend>
          <label>
            <input type="radio" name="resize-mode" value="pixel" checked> <?php echo getTranslation('resizeModePixel'); ?>
          </label>
        </legend>
        <div id="pixel-options" class="tool-controls">
          <div class="control-group">
              <label for="resize-width"><?php echo getTranslation('widthLabel'); ?></label>
              <input id="resize-width" type="number" min="1">
          </div>
          <div class="control-group">
              <label for="resize-height"><?php echo getTranslation('heightLabel'); ?></label>
              <input id="resize-height" type="number" min="1">
          </div>
          <div class="control-group checkbox-group">
              <label><input type="checkbox" id="aspect-ratio-checkbox" checked> <?php echo getTranslation('maintainAspectRatio'); ?></label>
              <label><input type="checkbox" id="no-enlarge-checkbox"> <?php echo getTranslation('noEnlargeSmaller'); ?></label>
          </div>
        </div>
      </fieldset>

      <fieldset>
        <legend>
          <label>
            <input type="radio" name="resize-mode" value="percentage"> <?php echo getTranslation('resizeModePercentage'); ?> <span id="percentage-value">75%</span>
          </label>
        </legend>
        <div id="percentage-options" class="tool-controls">
          <div class="control-group">
            <input type="range" id="percentage-slider" min="1" max="100" value="75">
          </div>
        </div>
      </fieldset>

      <button id="resize-btn"><?php echo getTranslation('resizeBtn'); ?></button>
      <div id="resize-progress-container" style="width: 100%; background-color: #e0e0e0; border-radius: 5px; margin-top: 10px; overflow: hidden; display: none;">
        <div id="resize-progress-bar" style="height: 20px; width: 0%; background-color: #4CAF50; border-radius: 5px; text-align: center; line-height: 20px; color: white;"></div>
      </div>
      <div id="resize-preview"></div>
    </div>

    <div id="whitebg" class="tab-content">
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
        <div id="whitebg-preview-container" style="margin-top: 15px; text-align: center; display: none;">
            <img id="whitebg-preview-image" style="max-width: 100%; height: auto; border: 1px solid #eee; box-shadow: 0 2px 5px rgba(0,0,0,0.1);" alt="White Background Preview">
        </div>
      <button id="whitebg-btn"><?php echo getTranslation('whitebgBtn'); ?></button>
      <div id="whitebg-progress-container" style="width: 100%; background-color: #e0e0e0; border-radius: 5px; margin-top: 10px; overflow: hidden; display: none;">
        <div id="whitebg-progress-bar" style="height: 20px; width: 0%; background-color: #4CAF50; border-radius: 5px; text-align: center; line-height: 20px; color: white;"></div>
      </div>
      <div id="whitebg-preview"></div>
    </div>

    <div id="rotate" class="tab-content">
        <div class="tool-controls">
            <div class="control-group">
                <label><?php echo getTranslation('rotateLabel'); ?></label>
                <button id="rotate-left-btn"><?php echo getTranslation('rotateLeft'); ?></button>
                <button id="rotate-right-btn"><?php echo getTranslation('rotateRight'); ?></button>
            </div>
            <div class="control-group">
                <label><?php echo getTranslation('flipLabel'); ?></label>
                <button id="flip-horizontal-btn"><?php echo getTranslation('flipHorizontal'); ?></button>
                <button id="flip-vertical-btn"><?php echo getTranslation('flipVertical'); ?></button>
            </div>
        </div>
        <div id="rotate-operation-sequence" style="margin-top: 10px; font-weight: bold; text-align: center; display: none;"></div>
        <div id="rotate-preview-container" style="margin-top: 15px; text-align: center; display: none;">
            <img id="rotate-preview-image" style="max-width: 100%; height: auto; border: 1px solid #eee; box-shadow: 0 2px 5px rgba(0,0,0,0.1);" alt="Rotate Preview">
        </div>
        <button id="rotate-btn"><?php echo getTranslation('rotateBtn'); ?></button>
        <div id="rotate-progress-container" style="width: 100%; background-color: #e0e0e0; border-radius: 5px; margin-top: 10px; overflow: hidden; display: none;">
            <div id="rotate-progress-bar" style="height: 20px; width: 0%; background-color: #4CAF50; border-radius: 5px; text-align: center; line-height: 20px; color: white;"></div>
        </div>
    </div>

    <div id="enhance" class="tab-content">
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
      <button id="enhance-reset-btn"><?php echo getTranslation('resetBtn'); ?></button>
    </div>

    <div id="crop" class="tab-content">
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
      <div class="tool-controls">
        <div class="control-group checkbox-group">
          <label><input type="checkbox" id="removebg-white-bg" /> <span><?php echo getTranslation('addWhiteBackground'); ?></span></label>
        </div>
		<button id="removebg-btn"><?php echo getTranslation('removebgBtn'); ?></button>
	    <button id="download-removebg-btn" style="display:none;"><?php echo getTranslation('downloadBtn'); ?></button><br><br>
      </div>
      <div id="removebg-progress-container" style="width: 100%; background-color: #e0e0e0; border-radius: 5px; margin-top: 10px; overflow: hidden; display: none;">
        <div id="removebg-progress-bar" style="height: 20px; width: 0%; background-color: #4CAF50; border-radius: 5px; text-align: center; line-height: 20px; color: white;"></div>
      </div>
	  <canvas id="removebg-canvas" style="display:none; max-width:100%;"></canvas><br>
	  <img id="removebg-output" style="display:none; max-width:100%;" alt="Result">
	</div>

  </div>
</main>

<div class="section" id="privacy-section">
    <h3><?php echo getTranslation('privacyTitle'); ?></h3>
    <p><?php echo getTranslation('privacyNotice'); ?></p>
</div>

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
    window.appTranslations = {
        compressEstimateTotalSize: "<?php echo getTranslation('compressEstimateTotalSize'); ?>",
        compressEstimatedReduction: "<?php echo getTranslation('compressEstimatedReduction'); ?>",
        compressActualTotalSize: "<?php echo getTranslation('compressActualTotalSize'); ?>",
        compressActualReduction: "<?php echo getTranslation('compressActualReduction'); ?>",
        compressing: "<?php echo getTranslation('compressing'); ?>", // New translation key
        packing: "<?php echo getTranslation('packing'); ?>", // New translation key
        totalOriginalSizeLabel: "<?php echo getTranslation('totalOriginalSizeLabel'); ?>", // New translation key
        compressSummary: "<?php echo getTranslation('compressSummary'); ?>", // New translation key
        compressSummaryReduction: "<?php echo getTranslation('compressSummaryReduction'); ?>", // New translation key
    };
</script>
<script type="module" src="/dist/assets/main.C8xtNgX7.js"></script>

</body>
</html>
