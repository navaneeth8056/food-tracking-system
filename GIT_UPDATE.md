# Git Update Instructions

## Quick Update Commands

Open PowerShell/Terminal in your project folder and run these commands:

### Step 1: Check Current Status
```powershell
cd "c:\Users\ADMIN\Documents\Food tracking"
git status
```

This shows which files have been modified.

### Step 2: Add All Changes
```powershell
git add .
```

This stages all your changes (except files in `.gitignore` like `.env`).

### Step 3: Commit Changes
```powershell
git commit -m "Fix mobile calendar bug and add Google Maps location feature"
```

Or use a more descriptive message:
```powershell
git commit -m "Fix mobile calendar responsiveness and add Google Maps integration for delivery directions"
```

### Step 4: Push to GitHub
```powershell
git push origin main
```

If you get an error about upstream, use:
```powershell
git push -u origin main
```

## Complete Command Sequence

Copy and paste this entire block:

```powershell
cd "c:\Users\ADMIN\Documents\Food tracking"
git add .
git commit -m "Fix mobile calendar bug and add Google Maps location feature"
git push origin main
```

## If You Get Authentication Errors

If GitHub asks for username/password:

1. **Username**: Your GitHub username
2. **Password**: Use a **Personal Access Token** (not your GitHub password)

### Create Personal Access Token:
1. Go to GitHub.com → Your Profile → Settings
2. Developer settings → Personal access tokens → Tokens (classic)
3. Generate new token (classic)
4. Give it a name: "Food Tracking App"
5. Select scopes: Check `repo` (full control of private repositories)
6. Generate token
7. **Copy the token immediately** (you won't see it again!)
8. Use this token as your password when pushing

## Verify Your Push

1. Go to your GitHub repository page
2. Refresh the page
3. You should see your latest commit with the message you wrote
4. Check that all files are updated

## Common Issues & Solutions

### Issue: "fatal: not a git repository"
**Solution**: Run `git init` first, then add remote:
```powershell
git init
git remote add origin https://github.com/YOUR_USERNAME/food-tracking-system.git
```

### Issue: "Updates were rejected"
**Solution**: Pull first, then push:
```powershell
git pull origin main --rebase
git push origin main
```

### Issue: "Permission denied"
**Solution**: Check your GitHub credentials or use Personal Access Token

### Issue: "Nothing to commit"
**Solution**: All changes are already committed. Check with `git status`

## Future Updates

For future changes, just repeat:
```powershell
git add .
git commit -m "Your update description"
git push origin main
```

## Check What Changed

To see what files were modified:
```powershell
git status
```

To see detailed changes:
```powershell
git diff
```

## Undo Last Commit (if needed)

If you made a mistake:
```powershell
git reset --soft HEAD~1
```
This undoes the commit but keeps your changes.
