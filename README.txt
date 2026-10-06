Vedsora website (plain HTML, CSS and JavaScript)

Open index.html in any browser. No build step or server is needed.

index.html   all ten pages plus four legal placeholders, each in a <div data-page="...">
styles.css   design tokens (colours, fonts) at the top, then components; light and dark themes
script.js    page switching by URL hash (#why, #how ...) and the interactive parts
assets/      founder image

Fonts load from Google Fonts, so they need an internet connection; without one the site falls back to system fonts.
Before launch: connect the contact form (see TODO in script.js), replace contact placeholders, write the legal pages.
