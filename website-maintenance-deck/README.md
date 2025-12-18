# The Website Maintenance Deck

A web app for tracking 24 website maintenance tasks to keep your site fresh and working hard for your business.

## Features

- ✅ 24 maintenance tasks organized into 4 categories
- 📊 Progress tracking with visual progress bar
- 🎲 Random card selector for variety
- 💾 Saves progress in browser (localStorage)
- 📧 Email opt-in to access full deck
- 💬 Rotating encouragement messages
- 📱 Fully responsive design

## Setup Instructions

### 1. Get Your Formspree Form ID

1. Go to [formspree.io](https://formspree.io)
2. Sign up/login
3. Create a new form
4. Copy your form ID
5. Update line 66 in `index.html`:
   ```html
   <form id="opt-in-form" action="https://formspree.io/f/YOUR_FORM_ID" method="POST">
   ```
   Replace `YOUR_FORM_ID` with your actual Formspree form ID

### 2. Deploy to Your Website

The folder is already part of your website. After making changes, push to GitHub to update the live site at: `webspirationconsulting.com/website-maintenance-deck`

### 3. Test Everything

- Test the email opt-in form
- Test marking cards complete/incomplete
- Test the random card button
- Test on mobile devices
- Verify progress saves when you refresh the page

## File Structure

```
/website-maintenance-deck/
  ├── index.html       # Main HTML structure
  ├── style.css        # All styling
  ├── app.js          # All functionality
  ├── cards.json      # Card content data
  ├── edit.html       # Card editor interface
  ├── edit.js         # Editor functionality
  └── README.md       # This file
```

## Editing Cards

### Using the Card Editor

1. Go to `webspirationconsulting.com/website-maintenance-deck/edit.html`
2. Login with password: `glowup2025` (CHANGE THIS in edit.js line 2!)
3. Click any card to edit it
4. Update the content in the form
5. See live preview as you type
6. Click "Save Changes"
7. When done, click "Download Updated JSON"
8. Replace `cards.json` with the downloaded file
9. Push changes to update live site

### Changing the Editor Password

Open `edit.js` and change line 2:
```javascript
const EDITOR_PASSWORD = 'your-new-password-here';
```

### Editor Features

✅ Browse cards by category
✅ Edit all card fields in a simple form
✅ Live preview as you type
✅ Download updated JSON file
✅ Password protected

## How It Works

### User Flow

1. **Landing Page**: User sees intro, demo card, and email opt-in
2. **Email Submission**: User enters email to unlock full deck
3. **Main App**: User can browse categories, view cards, mark tasks complete
4. **Progress Tracking**: Completion status saved in browser

### Technical Details

- **No backend required**: Everything runs client-side
- **Data storage**: Uses browser localStorage
- **Email collection**: Via Formspree (free tier: 50 submissions/month)
- **Hosting**: Static files hosted with your website

## Customization

### Update Card Content

Edit `cards.json` to modify task descriptions, add new cards, or change categories.

### Change Colors

Main brand colors are in `style.css`:
- Primary purple: `#667eea`
- Secondary purple: `#764ba2`

### Add More Encouragement Messages

Edit the `encouragement` array in `cards.json`

## Future Enhancements

Ideas for v2:
- Email reminders for quarterly checkups
- Export completed tasks as PDF checklist
- Share progress on social media
- Print-friendly card view
- "Expansion packs" with additional tasks

## Support

Stuck? Book a [DIY Support Session](../contact.html) and we'll help you troubleshoot!

---

Built with ❤️ by Webspiration Consulting
