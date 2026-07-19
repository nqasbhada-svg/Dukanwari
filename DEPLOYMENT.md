# Vastraa ERP: Production Deployment & Setup Guide

This deployment guide outlines the complete setup of the **Vastraa ERP** production stack, from provisioning the Supabase cloud PostgreSQL backend to building and compiling the Flutter Android `.aab` (App Bundle).

---

## Part 1: Supabase Cloud Backend Provisioning

### Step 1.1: Create a Supabase Project
1. Go to the [Supabase Dashboard](https://supabase.com) and sign in.
2. Click **New Project** and select your organization.
3. Configure the project parameters:
   * **Name**: `Vastraa-ERP-Backend`
   * **Database Password**: *Set a secure password and save it.*
   * **Region**: Select the cloud region nearest to your cloth shop (e.g., `ap-south-1` for Mumbai).
   * **Pricing Tier**: Free/Pro depending on store inventory sizes.
4. Click **Create New Project** and wait ~2 minutes for provision to complete.

### Step 1.2: Initialize the Database Schema & Triggers
1. Inside the Supabase console, navigate to the **SQL Editor** tab from the left sidebar.
2. Click **New Query**.
3. Copy the entire SQL schema script from the **Developer Center** tab inside our app (or locate it in `/src/data/supabaseCode.ts`).
4. Paste the SQL query into the editor window and click **Run**.
5. Verify that all 8 tables, indexes, row-level policies, and stock-adjustment database triggers compile successfully with zero errors.

### Step 1.3: Enable Mobile OTP Authentication
1. Navigate to **Project Settings** -> **Authentication**.
2. Under **Auth Providers**, enable **Phone/SMS**.
3. Configure your preferred SMS provider gateway (e.g., *Twilio*, *MessageBird*, or *Supabase Built-in*).
4. Save settings. To test with demo keys, add your test phone numbers (e.g. `9876543210`) with password `123456` in the **Users** tab.

### Step 1.4: Configure Storage Buckets for DB Backups
1. Navigate to **Storage** in the left sidebar.
2. Click **New Bucket**.
3. Set bucket ID as `vastraa-backups`.
4. Set privacy to **Private** (mandatory: customer databases must never be public).
5. Click **Create Bucket**.

---

## Part 2: Flutter Client Mobile Setup

### Step 2.1: Initialize Flutter Workspace
Ensure you have the latest stable Flutter SDK installed (`>= 3.22.0`). Create a new clean project:
```bash
flutter create vastraa_erp --org com.vastraa.erp
cd vastraa_erp
```

### Step 2.2: Declare pubspec dependencies
Replace your `pubspec.yaml` dependencies block with the following packages:
```yaml
dependencies:
  flutter:
    sdk: flutter
  flutter_riverpod: ^2.5.1
  supabase_flutter: ^2.6.0
  flutter_secure_storage: ^9.2.2
  lucide_icons: ^0.320.0
  intl: ^0.19.0
  share_plus: ^10.1.0
  qr_flutter: ^4.1.0
  pdf: ^3.11.0
  path_provider: ^2.1.3
```
Run `flutter pub get` in your terminal to fetch all repositories.

### Step 2.3: Assemble modular clean architecture directories
Set up your source file architecture under `lib/` to isolate logic from UI:
```text
lib/
├── main.dart
├── core/
│   ├── theme/
│   └── localization/
├── domain/
│   ├── models/
│   └── repositories/
├── data/
│   ├── datasources/
│   └── repositories_impl/
└── presentation/
    ├── providers/
    ├── views/
    └── widgets/
```

### Step 2.4: Set up Supabase Secrets & Launch App
Copy individual Dart files from the **Developer Center** in our app into your workspace directories.
Replace the placeholder credentials inside your `lib/main.dart` file:
```dart
// lib/main.dart (Replace placeholders with values from Supabase -> Project Settings -> API)
const String SUPABASE_URL = "https://your-project-id.supabase.co";
const String SUPABASE_ANON_KEY = "your-anon-public-jwt-key";
```

Launch the emulator and run:
```bash
flutter run
```

---

## Part 3: Production Signing & Release Compile

To bundle the Android app safely for Google Play Store upload or direct install on POS tablets:

### Step 3.1: Generate a Secure Keystore
Run the keytool command to generate a local cryptographic keystore file:
```bash
keytool -genkey -v -keystore ~/vastraa-release-key.jks -keyalg RSA -keysize 2048 -validity 10000 -alias vastraa
```

### Step 3.2: Configure Gradle key properties
Create a local file `android/key.properties` to reference the keystore paths safely (never commit this file to public git):
```ini
storePassword=your-keystore-password
keyPassword=your-key-password
keyAlias=vastraa
storeFile=/Users/yourusername/vastraa-release-key.jks
```

### Step 3.3: Edit App Gradle file
Edit `android/app/build.gradle` to load the signing credentials during release compile:
```groovy
def keystoreProperties = new Properties()
def keystorePropertiesFile = rootProject.file('key.properties')
if (keystorePropertiesFile.exists()) {
    keystoreProperties.load(new FileInputStream(keystorePropertiesFile))
}

android {
    ...
    signingConfigs {
        release {
            keyAlias keystoreProperties['keyAlias']
            keyPassword keystoreProperties['keyPassword']
            storeFile keystoreProperties['storeFile'] ? file(keystoreProperties['storeFile']) : null
            storePassword keystoreProperties['storePassword']
        }
    }
    buildTypes {
        release {
            signingConfig signingConfigs.release
            minifyEnabled true
            shrinkResources true
        }
    }
}
```

### Step 3.4: Build Android Bundle File
Execute the release compile trigger in your workspace root:
```bash
flutter build appbundle --obfuscate --split-debug-info=build/app/outputs/symbols
```
The optimized, signed, and fully production-ready Android App Bundle will be created at:
`build/app/outputs/bundle/release/app-release.aab`
