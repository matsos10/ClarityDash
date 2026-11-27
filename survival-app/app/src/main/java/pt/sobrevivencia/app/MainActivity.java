package pt.sobrevivencia.app;

import android.Manifest;
import android.annotation.SuppressLint;
import android.app.Activity;
import android.content.Context;
import android.content.Intent;
import android.content.pm.PackageManager;
import android.hardware.Sensor;
import android.hardware.SensorEvent;
import android.hardware.SensorEventListener;
import android.hardware.SensorManager;
import android.hardware.camera2.CameraCharacteristics;
import android.hardware.camera2.CameraManager;
import android.location.Location;
import android.location.LocationListener;
import android.location.LocationManager;
import android.net.Uri;
import android.os.Bundle;
import android.os.Handler;
import android.os.Looper;
import android.os.VibrationEffect;
import android.os.Vibrator;
import android.view.WindowManager;
import android.webkit.JavascriptInterface;
import android.webkit.WebChromeClient;
import android.webkit.WebResourceRequest;
import android.webkit.WebSettings;
import android.webkit.WebView;
import android.webkit.WebViewClient;

import java.util.Locale;

public class MainActivity extends Activity implements SensorEventListener, LocationListener {

    private WebView web;
    private final Handler ui = new Handler(Looper.getMainLooper());
    private SensorManager sm;
    private LocationManager lm;
    private CameraManager cam;
    private String torchId;
    private boolean torchOn = false;
    private boolean sensorsOn = false, gpsWanted = false;
    private long lastSensorPush = 0;
    private final float[] rot = new float[9], ori = new float[3];
    private float[] grav, mag;
    private float pressure = -1f;
    private static final int REQ_LOC = 42;

    @SuppressLint({"SetJavaScriptEnabled", "AddJavascriptInterface"})
    @Override
    protected void onCreate(Bundle b) {
        super.onCreate(b);
        sm = (SensorManager) getSystemService(Context.SENSOR_SERVICE);
        lm = (LocationManager) getSystemService(Context.LOCATION_SERVICE);
        cam = (CameraManager) getSystemService(Context.CAMERA_SERVICE);
        try {
            for (String id : cam.getCameraIdList()) {
                Boolean f = cam.getCameraCharacteristics(id).get(CameraCharacteristics.FLASH_INFO_AVAILABLE);
                if (f != null && f) { torchId = id; break; }
            }
        } catch (Exception ignored) { }

        web = new WebView(this);
        WebSettings s = web.getSettings();
        s.setJavaScriptEnabled(true);
        s.setDomStorageEnabled(true);
        s.setDatabaseEnabled(true);
        s.setAllowFileAccess(true);
        s.setMediaPlaybackRequiresUserGesture(false);
        s.setTextZoom(100);
        web.setBackgroundColor(0xFF11150F);
        web.addJavascriptInterface(new Bridge(), "Android");
        web.setWebChromeClient(new WebChromeClient());
        web.setWebViewClient(new WebViewClient() {
            @Override
            public boolean shouldOverrideUrlLoading(WebView v, WebResourceRequest r) {
                Uri u = r.getUrl();
                String sc = u.getScheme();
                if ("tel".equals(sc) || "sms".equals(sc) || "geo".equals(sc) || "mailto".equals(sc)) {
                    try { startActivity(new Intent(Intent.ACTION_VIEW, u)); } catch (Exception ignored) { }
                    return true;
                }
                return !"file".equals(sc);
            }
        });
        setContentView(web);
        web.loadUrl("file:///android_asset/index.html");
    }

    private void js(final String code) {
        ui.post(() -> { if (web != null) web.evaluateJavascript(code, null); });
    }

    // ---------- Sensors ----------
    private void startSensors() {
        if (sensorsOn) return;
        sensorsOn = true;
        Sensor rv = sm.getDefaultSensor(Sensor.TYPE_ROTATION_VECTOR);
        if (rv != null) sm.registerListener(this, rv, SensorManager.SENSOR_DELAY_UI);
        else {
            Sensor a = sm.getDefaultSensor(Sensor.TYPE_ACCELEROMETER);
            Sensor m = sm.getDefaultSensor(Sensor.TYPE_MAGNETIC_FIELD);
            if (a != null) sm.registerListener(this, a, SensorManager.SENSOR_DELAY_UI);
            if (m != null) sm.registerListener(this, m, SensorManager.SENSOR_DELAY_UI);
        }
        Sensor p = sm.getDefaultSensor(Sensor.TYPE_PRESSURE);
        if (p != null) sm.registerListener(this, p, SensorManager.SENSOR_DELAY_NORMAL);
    }

    private void stopSensors() { sensorsOn = false; sm.unregisterListener(this); }

    @Override
    public void onSensorChanged(SensorEvent e) {
        int t = e.sensor.getType();
        boolean have = false;
        if (t == Sensor.TYPE_PRESSURE) { pressure = e.values[0]; }
        else if (t == Sensor.TYPE_ROTATION_VECTOR) { SensorManager.getRotationMatrixFromVector(rot, e.values); have = true; }
        else if (t == Sensor.TYPE_ACCELEROMETER) { grav = e.values.clone(); }
        else if (t == Sensor.TYPE_MAGNETIC_FIELD) { mag = e.values.clone(); }
        if (!have && grav != null && mag != null && (t == Sensor.TYPE_ACCELEROMETER || t == Sensor.TYPE_MAGNETIC_FIELD))
            have = SensorManager.getRotationMatrix(rot, null, grav, mag);
        long now = System.currentTimeMillis();
        if (now - lastSensorPush < 60) return;
        if (!have && t != Sensor.TYPE_PRESSURE) return;
        lastSensorPush = now;
        SensorManager.getOrientation(rot, ori);
        double az = (Math.toDegrees(ori[0]) + 360) % 360;
        double pitch = Math.toDegrees(ori[1]);
        double roll = Math.toDegrees(ori[2]);
        js(String.format(Locale.US, "window.onSensor&&window.onSensor(%.1f,%.1f,%.1f,%.2f)", az, pitch, roll, pressure));
    }

    @Override public void onAccuracyChanged(Sensor s, int a) { }

    // ---------- GPS ----------
    @SuppressLint("MissingPermission")
    private void startGps() {
        gpsWanted = true;
        if (checkSelfPermission(Manifest.permission.ACCESS_FINE_LOCATION) != PackageManager.PERMISSION_GRANTED) {
            requestPermissions(new String[]{Manifest.permission.ACCESS_FINE_LOCATION, Manifest.permission.ACCESS_COARSE_LOCATION}, REQ_LOC);
            return;
        }
        try {
            if (lm.isProviderEnabled(LocationManager.GPS_PROVIDER))
                lm.requestLocationUpdates(LocationManager.GPS_PROVIDER, 1000, 0, this);
            if (lm.isProviderEnabled(LocationManager.NETWORK_PROVIDER))
                lm.requestLocationUpdates(LocationManager.NETWORK_PROVIDER, 2000, 0, this);
            Location last = lm.getLastKnownLocation(LocationManager.GPS_PROVIDER);
            if (last == null) last = lm.getLastKnownLocation(LocationManager.NETWORK_PROVIDER);
            if (last != null) onLocationChanged(last);
            if (!lm.isProviderEnabled(LocationManager.GPS_PROVIDER) && !lm.isProviderEnabled(LocationManager.NETWORK_PROVIDER))
                js("window.onGpsError&&window.onGpsError('Localização desativada no telefone. Ative o GPS.')");
        } catch (Exception ex) {
            js("window.onGpsError&&window.onGpsError('Erro GPS')");
        }
    }

    private void stopGps() { gpsWanted = false; try { lm.removeUpdates(this); } catch (Exception ignored) { } }

    @Override
    public void onLocationChanged(Location l) {
        js(String.format(Locale.US, "window.onGps&&window.onGps(%.7f,%.7f,%.1f,%.1f,%.2f,%d)",
                l.getLatitude(), l.getLongitude(), l.hasAltitude() ? l.getAltitude() : -9999.0,
                l.getAccuracy(), l.hasSpeed() ? l.getSpeed() : 0f, l.getTime()));
    }

    @Override public void onProviderEnabled(String p) { }
    @Override public void onProviderDisabled(String p) { }
    @Override public void onStatusChanged(String p, int s, Bundle e) { }

    @Override
    public void onRequestPermissionsResult(int code, String[] perms, int[] res) {
        if (code == REQ_LOC) {
            if (res.length > 0 && res[0] == PackageManager.PERMISSION_GRANTED) { if (gpsWanted) startGps(); }
            else js("window.onGpsError&&window.onGpsError('Permissão de localização recusada.')");
        }
    }

    // ---------- Torch ----------
    private void setTorch(boolean on) {
        if (torchId == null) return;
        try { cam.setTorchMode(torchId, on); torchOn = on; } catch (Exception ignored) { }
    }

    private class Bridge {
        @JavascriptInterface public boolean hasTorch() { return torchId != null; }
        @JavascriptInterface public void torch(boolean on) { ui.post(() -> setTorch(on)); }
        @JavascriptInterface public void startSensors() { ui.post(MainActivity.this::startSensors); }
        @JavascriptInterface public void stopSensors() { ui.post(MainActivity.this::stopSensors); }
        @JavascriptInterface public void startGps() { ui.post(MainActivity.this::startGps); }
        @JavascriptInterface public void stopGps() { ui.post(MainActivity.this::stopGps); }
        @JavascriptInterface public void vibrate(long ms) {
            Vibrator v = (Vibrator) getSystemService(Context.VIBRATOR_SERVICE);
            if (v != null) v.vibrate(VibrationEffect.createOneShot(Math.max(1, ms), VibrationEffect.DEFAULT_AMPLITUDE));
        }
        @JavascriptInterface public void keepScreenOn(boolean on) {
            ui.post(() -> {
                if (on) getWindow().addFlags(WindowManager.LayoutParams.FLAG_KEEP_SCREEN_ON);
                else getWindow().clearFlags(WindowManager.LayoutParams.FLAG_KEEP_SCREEN_ON);
            });
        }
        @JavascriptInterface public void brightness(float v) {
            ui.post(() -> {
                WindowManager.LayoutParams lp = getWindow().getAttributes();
                lp.screenBrightness = v; // -1 = sistema, 1 = máximo
                getWindow().setAttributes(lp);
            });
        }
        @JavascriptInterface public void exit() { ui.post(MainActivity.this::finish); }
    }

    @Override
    public void onBackPressed() {
        web.evaluateJavascript("window.goBack?window.goBack():false", r -> {
            if (!"true".equals(r)) MainActivity.super.onBackPressed();
        });
    }

    @Override protected void onPause() {
        super.onPause();
        if (sensorsOn) sm.unregisterListener(this);
        if (gpsWanted) try { lm.removeUpdates(this); } catch (Exception ignored) { }
    }

    @Override protected void onResume() {
        super.onResume();
        if (sensorsOn) { sensorsOn = false; startSensors(); }
        if (gpsWanted) startGps();
    }

    @Override protected void onDestroy() {
        if (torchOn) setTorch(false);
        stopSensors(); stopGps();
        super.onDestroy();
    }
}
