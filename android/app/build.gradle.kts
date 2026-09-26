plugins {
    id("com.android.application")
}

// A app web (pasta docs/) é copiada para os assets em cada build.
val copyWebApp by tasks.registering(Sync::class) {
    from(rootProject.file("../docs")) { exclude("sw.js") }
    into(layout.buildDirectory.dir("generated/webassets/www"))
}

android {
    namespace = "pt.receitas.app"
    compileSdk = 35

    defaultConfig {
        applicationId = "pt.receitas.app"
        minSdk = 26
        targetSdk = 34
        versionCode = (System.getenv("GITHUB_RUN_NUMBER") ?: "1").toInt()
        versionName = "1.0.${System.getenv("GITHUB_RUN_NUMBER") ?: "0"}"
    }

    signingConfigs {
        create("release") {
            storeFile = file("receitas.jks")
            storePassword = "receitas-app"
            keyAlias = "receitas"
            keyPassword = "receitas-app"
        }
    }

    buildTypes {
        release {
            isMinifyEnabled = false
            signingConfig = signingConfigs.getByName("release")
        }
    }

    sourceSets["main"].assets.srcDir(layout.buildDirectory.dir("generated/webassets"))

    compileOptions {
        sourceCompatibility = JavaVersion.VERSION_17
        targetCompatibility = JavaVersion.VERSION_17
    }
}

tasks.named("preBuild") { dependsOn(copyWebApp) }

dependencies {
    implementation("androidx.webkit:webkit:1.12.1")
}
