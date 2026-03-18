import pool from '../db/pool.js';
import cfg from '../config.js';

// For dev: just log to console + database
// For production: use SMTP/SendGrid/SES based on config
export async function sendEmail({ to, subject, html, text, type = 'notification' }) {
  const subscriberRow = await pool.query(
    'SELECT id FROM email_subscribers WHERE email = $1 AND is_active = true',
    [to]
  );
  const subscriberId = subscriberRow.rows[0]?.id || null;

  // Log the email attempt
  const { rows } = await pool.query(
    `INSERT INTO email_log (subscriber_id, email_type, subject, status)
     VALUES ($1, $2, $3, 'queued') RETURNING id`,
    [subscriberId, type, subject]
  );
  const logId = rows[0].id;

  try {
    if (cfg.smtpHost) {
      // Production: use nodemailer with SMTP
      // await transporter.sendMail({ from: cfg.emailFrom, to, subject, html, text });
    } else {
      // Dev mode: log to console
      console.log(`[email] TO: ${to} | SUBJECT: ${subject}`);
      console.log(`[email] Body preview: ${(text || '').substring(0, 200)}...`);
    }

    await pool.query(
      'UPDATE email_log SET status = $1, sent_at = NOW() WHERE id = $2',
      ['sent', logId]
    );
    return { success: true, logId };
  } catch (err) {
    await pool.query(
      'UPDATE email_log SET status = $1, error_message = $2 WHERE id = $3',
      ['failed', err.message, logId]
    );
    return { success: false, error: err.message, logId };
  }
}

export async function sendWeeklyBrief(briefHtml, briefText) {
  const { rows: subscribers } = await pool.query(
    `SELECT email, name FROM email_subscribers
     WHERE is_active = true AND subscription_type IN ('weekly_brief', 'all')`
  );

  const results = [];
  for (const sub of subscribers) {
    const result = await sendEmail({
      to: sub.email,
      subject: `BBI Weekly Intelligence Brief — ${new Date().toLocaleDateString()}`,
      html: briefHtml,
      text: briefText,
      type: 'weekly_brief'
    });
    results.push({ email: sub.email, ...result });
  }
  return results;
}
