package pt.cx5.manutencao;

import android.app.AlarmManager;
import android.app.Notification;
import android.app.NotificationChannel;
import android.app.NotificationManager;
import android.app.PendingIntent;
import android.content.Context;
import android.content.Intent;
import android.content.SharedPreferences;
import android.os.Build;

import org.json.JSONArray;
import org.json.JSONObject;

import java.util.Calendar;

public class Reminders {
    static final String PREFS = "cx5";
    static final String CHANNEL = "manutencao";
    static final long DAY = 86400000L;

    static void createChannel(Context c) {
        if (Build.VERSION.SDK_INT >= 26) {
            NotificationChannel ch = new NotificationChannel(CHANNEL, "Manutenção do CX-5", NotificationManager.IMPORTANCE_HIGH);
            ch.setDescription("Avisos de manutenção, inspeção, seguro e lembretes");
            c.getSystemService(NotificationManager.class).createNotificationChannel(ch);
        }
    }

    static void schedule(Context c) {
        int hour = c.getSharedPreferences(PREFS, Context.MODE_PRIVATE).getInt("hour", 9);
        AlarmManager am = (AlarmManager) c.getSystemService(Context.ALARM_SERVICE);
        PendingIntent pi = PendingIntent.getBroadcast(c, 0, new Intent(c, ReminderReceiver.class),
                PendingIntent.FLAG_UPDATE_CURRENT | PendingIntent.FLAG_IMMUTABLE);
        Calendar cal = Calendar.getInstance();
        cal.set(Calendar.HOUR_OF_DAY, hour);
        cal.set(Calendar.MINUTE, 0);
        cal.set(Calendar.SECOND, 0);
        if (cal.getTimeInMillis() <= System.currentTimeMillis()) cal.add(Calendar.DAY_OF_MONTH, 1);
        am.cancel(pi);
        am.setInexactRepeating(AlarmManager.RTC_WAKEUP, cal.getTimeInMillis(), AlarmManager.INTERVAL_DAY, pi);
    }

    /** Verifica os lembretes guardados pela interface e publica notificações. Devolve o nº de avisos. */
    static int check(Context c) {
        createChannel(c);
        SharedPreferences p = c.getSharedPreferences(PREFS, Context.MODE_PRIVATE);
        String raw = p.getString("data", null);
        if (raw == null) return 0;
        int count = 0;
        try {
            JSONObject d = new JSONObject(raw);
            if (!d.optBoolean("enabled", true)) return 0;
            long now = System.currentTimeMillis();
            double kmPerDay = d.optDouble("kmPerDay", 0);
            double lastKm = d.optDouble("lastKm", 0);
            long lastKmDate = d.optLong("lastKmDate", now);
            int warnDays = d.optInt("warnDays", 30);
            int warnKm = d.optInt("warnKm", 1000);
            double estKm = lastKm + Math.max(0, kmPerDay) * Math.max(0, (now - lastKmDate) / (double) DAY);
            JSONArray items = d.optJSONArray("items");
            StringBuilder summary = new StringBuilder();
            if (items != null) {
                for (int i = 0; i < items.length(); i++) {
                    JSONObject it = items.getJSONObject(i);
                    long dueDate = it.optLong("dueDate", 0);
                    double dueKm = it.optDouble("dueKm", 0);
                    String reason = null;
                    boolean overdue = false;
                    if (dueDate > 0) {
                        long days = (long) Math.floor((dueDate - now) / (double) DAY);
                        if (days < 0) { reason = "Em atraso há " + (-days) + " dias"; overdue = true; }
                        else if (days <= it.optInt("warnDays", warnDays)) reason = days == 0 ? "Vence hoje" : "Faltam " + days + " dias";
                    }
                    if (dueKm > 0) {
                        long left = Math.round(dueKm - estKm);
                        String r2 = null;
                        if (left < 0) { r2 = "Ultrapassado em " + (-left) + " km"; overdue = true; }
                        else if (left <= it.optInt("warnKm", warnKm)) r2 = "Faltam ~" + left + " km";
                        if (r2 != null) reason = reason == null ? r2 : reason + " · " + r2;
                    }
                    if (reason != null) {
                        count++;
                        String title = (overdue ? "⚠️ " : "🔧 ") + it.optString("title");
                        if (count <= 6) post(c, 100 + Math.abs(it.optString("id").hashCode() % 100000), title, reason);
                        summary.append(it.optString("title")).append(": ").append(reason).append("\n");
                    }
                }
            }
            int kmRemind = d.optInt("kmRemindDays", 14);
            if (kmRemind > 0 && (now - lastKmDate) > kmRemind * DAY) {
                post(c, 50, "📟 Atualize a quilometragem", "Última leitura há " + ((now - lastKmDate) / DAY) + " dias. Estimativa atual: " + Math.round(estKm) + " km");
            }
            if (count > 6) post(c, 51, "CX-5: " + count + " manutenções pendentes", summary.toString());
        } catch (Exception ignored) {
        }
        return count;
    }

    static void post(Context c, int id, String title, String body) {
        createChannel(c);
        Intent open = new Intent(c, MainActivity.class);
        open.setFlags(Intent.FLAG_ACTIVITY_NEW_TASK | Intent.FLAG_ACTIVITY_CLEAR_TOP);
        PendingIntent pi = PendingIntent.getActivity(c, id, open, PendingIntent.FLAG_UPDATE_CURRENT | PendingIntent.FLAG_IMMUTABLE);
        Notification.Builder b = Build.VERSION.SDK_INT >= 26 ? new Notification.Builder(c, CHANNEL) : new Notification.Builder(c);
        b.setSmallIcon(R.drawable.ic_notif)
                .setContentTitle(title)
                .setContentText(body)
                .setStyle(new Notification.BigTextStyle().bigText(body))
                .setColor(0xFF9E1B32)
                .setAutoCancel(true)
                .setContentIntent(pi);
        try {
            ((NotificationManager) c.getSystemService(Context.NOTIFICATION_SERVICE)).notify(id, b.build());
        } catch (SecurityException ignored) {
        }
    }
}
