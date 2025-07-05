const express = require('express');
const { sql, poolPromise } = require('../config/database');
const { authenticateToken } = require('../middleware/auth');

const router = express.Router();

// Get user settings
router.get('/', authenticateToken, async (req, res) => {
  try {
    const pool = await poolPromise;
    const result = await pool.request()
      .input('userId', sql.VarChar, req.user.id)
      .query('SELECT * FROM user_settings WHERE user_id = @userId');

    const settings = result.recordset;

    if (settings.length === 0) {
      // Return default settings
      res.json({
        emailNotifications: true,
        pushNotifications: true,
        feeReminders: true,
        eventNotifications: true,
        homeworkReminders: true,
        profileVisibility: 'school',
        showContactInfo: true,
        allowMessages: true,
        language: 'en',
        timezone: 'Asia/Kolkata',
        theme: 'light'
      });
    } else {
      res.json(settings[0]);
    }
  } catch (error) {
    console.error('❌ Get settings error:', error.message);
    console.error(error.stack);
    res.status(500).json({ error: 'Server error' });
  }
});

// Update user settings
router.put('/', authenticateToken, async (req, res) => {
  try {
    const pool = await poolPromise;
    const s = req.body;

    const exists = await pool.request()
      .input('userId', sql.VarChar, req.user.id)
      .query('SELECT id FROM user_settings WHERE user_id = @userId');

    if (exists.recordset.length === 0) {
      // Insert new settings
      await pool.request()
        .input('userId', sql.VarChar, req.user.id)
        .input('email', sql.Bit, s.emailNotifications)
        .input('push', sql.Bit, s.pushNotifications)
        .input('fee', sql.Bit, s.feeReminders)
        .input('event', sql.Bit, s.eventNotifications)
        .input('homework', sql.Bit, s.homeworkReminders)
        .input('profile', sql.VarChar, s.profileVisibility)
        .input('contact', sql.Bit, s.showContactInfo)
        .input('messages', sql.Bit, s.allowMessages)
        .input('language', sql.VarChar, s.language)
        .input('timezone', sql.VarChar, s.timezone)
        .input('theme', sql.VarChar, s.theme)
        .query(`
          INSERT INTO user_settings (
            user_id, email_notifications, push_notifications, fee_reminders,
            event_notifications, homework_reminders, profile_visibility,
            show_contact_info, allow_messages, language, timezone, theme
          )
          VALUES (
            @userId, @email, @push, @fee, @event, @homework,
            @profile, @contact, @messages, @language, @timezone, @theme
          )
        `);
    } else {
      // Update existing settings
      await pool.request()
        .input('userId', sql.VarChar, req.user.id)
        .input('email', sql.Bit, s.emailNotifications)
        .input('push', sql.Bit, s.pushNotifications)
        .input('fee', sql.Bit, s.feeReminders)
        .input('event', sql.Bit, s.eventNotifications)
        .input('homework', sql.Bit, s.homeworkReminders)
        .input('profile', sql.VarChar, s.profileVisibility)
        .input('contact', sql.Bit, s.showContactInfo)
        .input('messages', sql.Bit, s.allowMessages)
        .input('language', sql.VarChar, s.language)
        .input('timezone', sql.VarChar, s.timezone)
        .input('theme', sql.VarChar, s.theme)
        .query(`
          UPDATE user_settings SET
            email_notifications = @email,
            push_notifications = @push,
            fee_reminders = @fee,
            event_notifications = @event,
            homework_reminders = @homework,
            profile_visibility = @profile,
            show_contact_info = @contact,
            allow_messages = @messages,
            language = @language,
            timezone = @timezone,
            theme = @theme
          WHERE user_id = @userId
        `);
    }

    res.json({ message: 'Settings updated successfully' });
  } catch (error) {
    console.error('❌ Update settings error:', error.message);
    console.error(error.stack);
    res.status(500).json({ error: 'Server error' });
  }
});

module.exports = router;
