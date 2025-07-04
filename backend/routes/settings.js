
const express = require('express');
const db = require('../config/database');
const { authenticateToken } = require('../middleware/auth');

const router = express.Router();

// Get user settings
router.get('/', authenticateToken, async (req, res) => {
  try {
    const [settings] = await db.execute(
      'SELECT * FROM user_settings WHERE user_id = ?',
      [req.user.id]
    );

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
    console.error('Get settings error:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

// Update user settings
router.put('/', authenticateToken, async (req, res) => {
  try {
    const settingsData = req.body;
    
    // Check if settings exist
    const [existingSettings] = await db.execute(
      'SELECT id FROM user_settings WHERE user_id = ?',
      [req.user.id]
    );

    if (existingSettings.length === 0) {
      // Insert new settings
      await db.execute(`
        INSERT INTO user_settings (
          user_id, email_notifications, push_notifications, fee_reminders,
          event_notifications, homework_reminders, profile_visibility,
          show_contact_info, allow_messages, language, timezone, theme
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
      `, [
        req.user.id,
        settingsData.emailNotifications,
        settingsData.pushNotifications,
        settingsData.feeReminders,
        settingsData.eventNotifications,
        settingsData.homeworkReminders,
        settingsData.profileVisibility,
        settingsData.showContactInfo,
        settingsData.allowMessages,
        settingsData.language,
        settingsData.timezone,
        settingsData.theme
      ]);
    } else {
      // Update existing settings
      await db.execute(`
        UPDATE user_settings SET
          email_notifications = ?, push_notifications = ?, fee_reminders = ?,
          event_notifications = ?, homework_reminders = ?, profile_visibility = ?,
          show_contact_info = ?, allow_messages = ?, language = ?, timezone = ?, theme = ?
        WHERE user_id = ?
      `, [
        settingsData.emailNotifications,
        settingsData.pushNotifications,
        settingsData.feeReminders,
        settingsData.eventNotifications,
        settingsData.homeworkReminders,
        settingsData.profileVisibility,
        settingsData.showContactInfo,
        settingsData.allowMessages,
        settingsData.language,
        settingsData.timezone,
        settingsData.theme,
        req.user.id
      ]);
    }

    res.json({ message: 'Settings updated successfully' });
  } catch (error) {
    console.error('Update settings error:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

module.exports = router;
