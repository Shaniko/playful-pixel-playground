

# תוכנית: כפתור חזרה יפה + תיקון נחש + רמות קושי

## 1. נחש — תיקונים
**`src/games/snake.ts`**
- הסרת חסימת כיוון הפוך (180°) — הנחש יוכל ללכת לכל כיוון, מה שיגרום למוות מיידי אם פונים אחורה (כמו במשחק המקורי)
- הוספת SPACE לריסטרט (בנוסף ל-Enter)
- עדכון טקסט Game Over

## 2. כפתור חזרה יפה בכל משחק
**`src/components/GameOverlay.tsx`**
- הגדלת כפתור ה-✕ והזזתו לפינה שמאלית עליונה (fixed position) כדי שיהיה תמיד נגיש
- הוספת טקסט "← BACK" ליד ה-✕ לבהירות
- שיפור ה-styling — רקע שקוף עם hover effect ירוק

## 3. רמות קושי — מסך בחירה לפני המשחק
**`src/components/GameOverlay.tsx`**
- הוספת state של `difficulty` (easy/medium/hard) עם מסך בחירה יפה לפני תחילת המשחק
- המסך מציג 3 כפתורים עם תיאור (Easy: relaxed, Medium: balanced, Hard: intense)
- ה-difficulty מועבר ל-`start()` של כל משחק

**כל קובצי המשחקים** — עדכון `start()` לקבל `difficulty` parameter:
- `snake.ts`: מהירות התחלתית שונה (easy=200ms, medium=150ms, hard=100ms)
- `tetris.ts`: מהירות נפילה שונה
- `pong.ts`: מהירות AI שונה
- `breakout.ts`: מהירות כדור שונה
- `space-invaders.ts`: מהירות פולשים שונה
- `dino-runner.ts`: מהירות ריצה התחלתית שונה
- `sudoku.ts`: כמות תאים חסרים (easy=35, medium=45, hard=55)

## קבצים

| קובץ | שינוי |
|-------|-------|
| `src/games/snake.ts` | הסרת חסימת 180° + SPACE restart |
| `src/components/GameOverlay.tsx` | כפתור חזרה משופר + מסך בחירת קושי |
| `src/games/*.ts` (כל 7) | `start(canvas, difficulty)` parameter |

