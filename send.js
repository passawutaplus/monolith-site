/*
  One place for every form on the site.

  The site is static on Vercel, so messages go to FormSubmit, which forwards
  them to STUDIO_EMAIL. The very first message triggers a one-time
  "Activate form" email from FormSubmit to that inbox — click it once.

  If sending fails, the caller shows a prefilled email link instead, so a
  message is never lost silently.
*/
(function () {
  const STUDIO_EMAIL = "monolithdesign.info@gmail.com";
  const ENDPOINT = `https://formsubmit.co/ajax/${STUDIO_EMAIL}`;

  function mailto(subject, fields) {
    const body = Object.entries(fields)
      .filter(([, value]) => value)
      .map(([key, value]) => `${key}: ${value}`)
      .join("\n");
    return `mailto:${STUDIO_EMAIL}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
  }

  async function send(subject, fields) {
    const payload = {
      _subject: `MONOLITH · ${subject}`,
      _template: "table",
      _captcha: "false",
      ...fields,
    };
    if (fields.email) payload._replyto = fields.email;
    try {
      const response = await fetch(ENDPOINT, {
        method: "POST",
        headers: { "Content-Type": "application/json", Accept: "application/json" },
        body: JSON.stringify(payload),
      });
      if (!response.ok) return false;
      const data = await response.json().catch(() => ({}));
      return data.success !== false && data.success !== "false";
    } catch {
      return false;
    }
  }

  window.monolith = { send, mailto, email: STUDIO_EMAIL };
})();
