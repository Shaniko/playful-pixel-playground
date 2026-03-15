

# תיקון ושיפור כל המשחקים

## באגים שנמצאו

### 1. Dino Runner — דליפת event listener
ב-`stop()` (שורה 347-350) חסר ניקוי של `clickHandler` מהקנבס. כל פעם שפותחים וסוגרים את המשחק, ה-click handler נשאר.

### 2. Dino Runner — אין התכופפות (duck)
אין מצב duck עם חץ למטה, כמו במשחק המקורי של גוגל. צריך להוסיף:
- לחיצה על חץ למטה → החתול מתכופף (גובה hitbox קטן יותר, אנימציה שטוחה)
- שחרור → חוזר למצב רגיל
- מאפשר להתחמק מציפורים גבוהות

### 3. Dino Runner — restart מיידי מדי
אפשר ללחוץ SPACE ומיד לעשות restart בלי לראות את מסך ה-Game Over

## שינויים מתוכננים

### `src/games/dino-runner.ts`
- **Duck**: משתנה `isDucking`, מופעל ב-ArrowDown (keydown), מכובה ב-keyup. בזמן duck הגוף שטוח יותר (ellipse רחב ונמוך), hitbox radius קטן יותר
- **תיקון stop()**: הוספת `canvas.removeEventListener('click', clickHandler)` — צריך לשמור ref לקנבס
- **השהיית restart**: משתנה `gameOverTime`, delay של 1 שנייה לפני שאפשר restart

### כל שאר המשחקים — השהיית restart
הוספת `gameOverTime` + בדיקת `Date.now() - gameOverTime > 1000` לפני restart ב:
- `tetris.ts`
- `snake.ts`
- `pong.ts`
- `breakout.ts`
- `space-invaders.ts`

