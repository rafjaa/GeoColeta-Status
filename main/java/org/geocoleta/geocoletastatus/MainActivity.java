package org.geocoleta.geocoletastatus;

import android.content.Intent;
import android.net.Uri;
import android.support.v7.app.ActionBarActivity;
import android.os.Bundle;
import android.view.View;
import android.webkit.JavascriptInterface;
import android.webkit.WebChromeClient;
import android.webkit.WebSettings;
import android.webkit.WebView;
import android.webkit.WebViewClient;
import android.widget.ImageView;

import org.apache.http.HttpEntity;
import org.apache.http.HttpResponse;
import org.apache.http.client.methods.HttpGet;
import org.apache.http.impl.client.DefaultHttpClient;
import org.apache.http.params.BasicHttpParams;
import org.apache.http.params.HttpConnectionParams;
import org.apache.http.params.HttpParams;
import org.apache.http.util.EntityUtils;


public class MainActivity extends ActionBarActivity {

    public WebView webView;

    @Override
    protected void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);
        setContentView(R.layout.activity_main);

        webView = (WebView) findViewById(R.id.webView);
        webView.setVisibility(View.INVISIBLE);
        webView.setWebChromeClient(new WebChromeClient());

        // Habilita o JS
        WebSettings webSettings = webView.getSettings();
        webSettings.setJavaScriptEnabled(true);
        webSettings.setDomStorageEnabled(true);

        // Garante que usará o WebView e não o navegador padrão
        webView.setWebViewClient(new WebViewClient(){

            // Callback que determina quando o front-end terminou de ser carregado
            @Override
            public void onPageFinished(WebView view, String url) {
                super.onPageFinished(view, url);

                ImageView imageView = (ImageView) findViewById(R.id.imageView);
                imageView.setVisibility(View.INVISIBLE);
                webView.setVisibility(View.VISIBLE);
            }

            // Faz com que links externos sejam abertos no app default do sistema
            public boolean shouldOverrideUrlLoading(WebView view, String url) {
                if (url != null && (url.startsWith("http://") || url.startsWith("https://"))) {
                    view.getContext().startActivity(
                            new Intent(Intent.ACTION_VIEW, Uri.parse(url)));
                    return true;
                } else {
                    return false;
                }
            }
        });

        webView.addJavascriptInterface(new WebAppInterface(this), "Android");
        webView.loadUrl("file:///android_asset/www/index.html");
    }

    // Possibilita o uso do botão voltar
    @Override
    public void onBackPressed() {
        if(webView.canGoBack()) {
            webView.goBack();
        } else {
            super.onBackPressed();
        }
    }

    public void runJavaScript(final String jsCode){
        this.runOnUiThread(new Runnable() {
            @Override
            public void run() {
                webView.loadUrl("javascript:" + jsCode);
            }
        });
    }

    // Interface para binding Javascript -> Java
    public class WebAppInterface {
        MainActivity mainActivity;

        public WebAppInterface(MainActivity activity) {
            this.mainActivity = activity;
        }

        @JavascriptInterface
        public void update() {
            String content;
            final int TIMEOUT = 5000;


            HttpParams httpParameters = new BasicHttpParams();
            HttpConnectionParams.setConnectionTimeout(httpParameters, TIMEOUT);
            HttpConnectionParams.setSoTimeout(httpParameters, TIMEOUT);

            DefaultHttpClient httpClient = new DefaultHttpClient(httpParameters);

            HttpGet request = new HttpGet("http://geocoleta.org/api/app");

            try{
                HttpResponse response = httpClient.execute(request);
                HttpEntity httpEntity = response.getEntity();
                content = EntityUtils.toString(httpEntity);

            } catch (Exception e){
                content = "";
            }

            runJavaScript(String.format("update_callback(%s);", content));

        }
    }
}