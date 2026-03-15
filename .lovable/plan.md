

# תוכנית: סודוקו + אנימציות אייקונים + כפתור חזרה + השהיית Game Over

## 1. משחק סודוקו — `src/games/sudoku.ts`
- קנבס 450x520, גריד 9x9 עם קווי בלוקים 3x3 עבים
- **יצירת לוח**: backtracking generator שיוצר פתרון תקין, ואז מסתיר ~45 תאים
- **אינטראקציה**: click על הקנבס לבחירת תא, מקלדת 1-9 להכנסה, Delete/Backspace למחיקה
- **תצוגה**: הדגשת שורה/עמודה/בלוק של התא הנבחר, מספרים קבועים בלבן, שהשחקן הכניס בירוק, שגיאות באדום
- **ניצחון**: בדיקה אוטומטית כשכל התאים מלאים ותקינים — הודעת "YOU WIN"
- **כפתור New Game** על הקנבס + restart עם Enter

## 2. אנימציות אייקונים — `tailwind.config.ts` + `Index.tsx`
- הוספת keyframe `wiggle` (סיבוב קל ±12°) ל-tailwind config
- האימוג'י בכרטיס יקבל `group-hover:animate-wiggle transition-transform duration-200` — הנעה חמודה ב-hover

## 3. כפתור חזרה ברור — `GameOverlay.tsx`
- כפתור ✕ גדול בפינה שמאלית עליונה (נגיש למובייל), בנוסף ל-ESC
- עדכון הוראות לסודוקו: "Click cell + type 1-9  DELETE to clear"
- הוספת case `sudoku` ל-switch של dynamic imports

## 4. השהיית Game Over
כבר בוצע בהודעה הקודמת לכל 6 המשחקים. סודוקו לא צריך כי אין בו "הפסד מהיר".

## קבצים לשינוי

| קובץ | שינוי |
|-------|-------|
| `src/games/sudoku.ts` | חדש — משחק מלא |
| `src/pages/Index.tsx` | כרטיס סודוקו + אנימציית wiggle על אימוג'י |
| `src/components/GameOverlay.tsx` | case סודוקו + כפתור ✕ + הוראות |
| `tailwind.config.ts` | keyframe wiggle + animation |

