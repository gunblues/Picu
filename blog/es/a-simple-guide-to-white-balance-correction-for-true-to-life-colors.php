<?php
// include_once(__DIR__ . '/../../header.php'); 
?>
<main class="static-page">
    <h1>Una guía sencilla para la corrección del balance de blancos para colores realistas</h1>
    <p><em>25 de julio de 2025</em></p>

    <picture>
      <source media="(max-width: 768px)" srcset="/images/image-whitebalance-hero-mobile.webp" type="image/webp">
      <source media="(min-width: 769px)" srcset="/images/image-whitebalance-hero-desktop.webp" type="image/webp">
      <img src="/images/image-whitebalance-hero-desktop.webp" alt="Una foto dividida que muestra una versión con un matiz de color azul y una versión corregida con colores naturales"
           width="100%" style="max-height: 50vh; object-fit: cover;" loading="lazy">
    </picture>

    <p>¿Alguna vez has tomado una foto en interiores que salió con un extraño tono anaranjado? ¿O una foto a la sombra que se veía anormalmente azul? Este problema común es el resultado de un balance de blancos incorrecto. Nuestros cerebros son asombrosos para ajustarse automáticamente a diferentes tipos de luz, por lo que percibimos una hoja de papel blanca como blanca ya sea que estemos bajo la luz cálida de una lámpara o la luz fría de un día nublado. Las cámaras digitales, sin embargo, no son tan inteligentes. Simplemente registran la luz tal como es, lo que a menudo resulta en un matiz de color no deseado.</p>
    <p>La corrección del balance de blancos es el proceso de eliminar estos matices de color poco realistas para que los objetos que parecen blancos en persona se representen como blancos en tu foto. Es la base absoluta de la corrección de color. Si tu balance de blancos es incorrecto, todos los demás colores de tu foto también lo serán. Dominar este simple ajuste es el primer y más importante paso para lograr colores naturales, precisos y hermosos en tus imágenes.</p>

    <h2>Entendiendo la temperatura del color</h2>
    <p>El concepto central detrás del balance de blancos es la **temperatura del color**. Diferentes fuentes de luz producen diferentes colores de luz. Este color se mide en una escala llamada escala Kelvin (K).</p>
    <ul>
        <li><strong>Luz cálida (Kelvin más bajo):</strong> La llama de una vela o una bombilla de tungsteno tradicional producen una luz muy cálida, de color amarillo anaranjado. Esto se encuentra en el extremo inferior de la escala (alrededor de 1000-3000 K).</li>
        <li><strong>Luz neutra (sol de mediodía):</strong> La luz solar directa durante el mediodía se considera una luz relativamente neutra o "blanca" (alrededor de 5500 K).</li>
        <li><strong>Luz fría (Kelvin más alto):</strong> La luz en un día muy nublado o a la sombra es en realidad de tonos azules o fría. Esto se encuentra en el extremo superior de la escala (alrededor de 6500-10,000 K).</li>
    </ul>
    <p>El trabajo del ajuste del balance de blancos es compensar la temperatura de color de la fuente de luz para producir una imagen neutra. Si estás fotografiando con luz cálida, la cámara necesita agregar azul para neutralizar el naranja. Si estás fotografiando con luz fría, la cámara necesita agregar amarillo/naranja para neutralizar el azul.</p>

    <h2>Las herramientas para la corrección del balance de blancos</h2>
    <p>En tu editor de fotos, normalmente encontrarás tres herramientas principales para ajustar el balance de blancos.</p>

    <h3>1. Los preajustes de balance de blancos</h3>
    <p>La mayoría de los editores ofrecen un menú desplegable de preajustes que coinciden con los ajustes que podrías encontrar en tu cámara. Estos incluyen opciones como "Luz de día", "Nublado", "Sombra", "Tungsteno" y "Fluorescente". Si conoces la condición de iluminación en la que se tomó tu foto, seleccionar el preajuste correspondiente a menudo puede acercarte mucho a un resultado correcto al instante. Por ejemplo, si tu foto de interior se ve naranja, elegir el preajuste "Tungsteno" agregará automáticamente azul para contrarrestarlo.</p>

    <h3>2. Los deslizadores de Temperatura y Tinte</h3>
    <p>Estos deslizadores te dan un control manual para afinar el color.</p>
    <ul>
        <li><strong>Temperatura:</strong> Este es el deslizador principal. Ajusta el color a lo largo de un eje de azul a amarillo. Si tu imagen es demasiado azul, mueves el deslizador hacia el lado amarillo para calentarla. Si tu imagen es demasiado naranja, mueves el deslizador hacia el lado azul para enfriarla.</li>
        <li><strong>Tinte:</strong> Este deslizador ajusta el color a lo largo de un eje de verde a magenta. Se utiliza para corregir fuentes de luz más inusuales, especialmente las luces fluorescentes, que a menudo pueden producir un matiz verdoso. Si corriges la temperatura pero la foto todavía se ve un poco "rara", un pequeño ajuste en el deslizador de tinte suele ser la solución.</li>
    </ul>

    <h3>3. El selector de balance de blancos (la herramienta Cuentagotas)</h3>
    <p>Esta es la forma más rápida y, a menudo, la más precisa de establecer el balance de blancos. La herramienta cuentagotas te permite decirle al software qué se supone que es un color neutro.</p>
    <ol>
        <li><strong>Selecciona la herramienta:</strong> Busca y selecciona el icono del cuentagotas en tu panel de balance de blancos.</li>
        <li><strong>Encuentra un punto neutro:</strong> Busca un objeto en tu foto que sepas con certeza que debe ser de un color neutro: blanco, gris medio o negro. Buenos candidatos incluyen una camisa blanca, una acera gris, el blanco de los ojos de alguien o una etiqueta de precio.</li>
        <li><strong>Haz clic en el punto neutro:</strong> Haz clic en ese punto neutro con el cuentagotas. El software analizará automáticamente el color de los píxeles en los que hiciste clic y ajustará instantáneamente los deslizadores de Temperatura y Tinte para que esos píxeles se vuelvan perfectamente neutros.</li>
    </ol>
    <p>Debido a que el software ahora sabe qué es el "verdadero neutro", puede reasignar con precisión todos los demás colores de la imagen, eliminando el matiz de color de toda la foto con un solo clic. Es una herramienta potente e increíblemente eficiente.</p>

    <h2>Un flujo de trabajo simple para el balance de blancos</h2>
    <ol>
        <li><strong>Prueba primero el cuentagotas:</strong> Escanea tu imagen en busca de un punto neutro. Si puedes encontrar uno, la herramienta cuentagotas es tu camino más rápido hacia un resultado preciso.</li>
        <li><strong>Usa los preajustes si no existe un punto neutro:</strong> Si tu foto no tiene colores neutros obvios (por ejemplo, una puesta de sol o una escena de bosque), intenta aplicar un preajuste basado en las condiciones de iluminación que recuerdes.</li>
        <li><strong>Ajusta con los deslizadores:</strong> Después de usar el cuentagotas o un preajuste, usa los deslizadores de Temperatura y Tinte para hacer pequeños ajustes finales basados en tu propio juicio creativo. Es posible que desees que una escena se sienta un poco más cálida o más fría para un efecto creativo.</li>
    </ol>

    <h2>Conclusión</h2>
    <p>Corregir el balance de blancos es la base de una buena edición de color. Es un proceso simple, pero tiene un profundo impacto en la calidad final de tu imagen. Al asegurarte de que los colores de tu foto sean precisos y estén libres de matices poco naturales, creas un lienzo limpio y profesional sobre el cual se pueden construir todas tus otras ediciones creativas. Tómate los pocos segundos para corregir el balance de blancos y serás recompensado con imágenes vibrantes, naturales y fieles a la realidad.</p>

    <p>¿Listo para corregir tus colores? <a href="/">¡Prueba nuestras herramientas gratuitas de edición de fotos hoy mismo!</a></p>
</main>
<?php
// include_once(__DIR__ . '/../../footer.php'); 
?>
