Vedsora website (plain HTML, CSS and JavaScript)

Open index.html in any browser, or serve the folder with any static server. No build step is needed.

index.html   all pages, each in a <div data-page="...">: home, why, how, organisations, musicians, accountants,
             innovation, founder, roadmap, about, contact, and four interim legal notices
styles.css   design tokens (colours, fonts) at the top, then components; light and dark themes
script.js    page switching by URL hash (#how, #musicians ...), per-page titles, the line demo,
             the evidence-grade explorer and the contact form
assets/      founder photo, favicon, social sharing image (og-image.png)
robots.txt, sitemap.xml

Content source: "Vedsora- Business Plan (Final)" (November 2026). Do not add claims that are not in it.

Contact form: with no endpoint it opens the visitor's email app addressed to info@vedsora.com and says nothing
has been sent yet. To send directly, set data-endpoint="https://..." on <form id="contact-form"> (a form service
or an Azure Function that accepts a JSON POST and returns 2xx). Success is shown only on a 2xx response.

Before launch: approved privacy, terms, safeguarding and data-protection texts (the current pages are interim notices).
