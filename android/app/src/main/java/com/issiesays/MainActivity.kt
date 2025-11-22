package com.IssieSays

import com.facebook.react.ReactActivity
import com.facebook.react.ReactActivityDelegate
import com.facebook.react.defaults.DefaultNewArchitectureEntryPoint.fabricEnabled
import com.facebook.react.defaults.DefaultReactActivityDelegate
import android.content.Intent
import android.net.Uri
import com.facebook.react.ReactApplication
import com.facebook.react.bridge.ReactContext
import com.facebook.react.modules.core.DeviceEventManagerModule
import com.facebook.react.ReactInstanceManager
import com.facebook.react.ReactNativeHost
import android.os.Bundle

class MainActivity : ReactActivity() {

  /**
   * Returns the name of the main component registered from JavaScript. This is used to schedule
   * rendering of the component.
   */
  override fun getMainComponentName(): String = "IssieSays"

  /**
   * Returns the instance of the [ReactActivityDelegate]. We use [DefaultReactActivityDelegate]
   * which allows you to enable New Architecture with a single boolean flags [fabricEnabled]
   */
  override fun createReactActivityDelegate(): ReactActivityDelegate =
      DefaultReactActivityDelegate(this, mainComponentName, fabricEnabled)


    /**
     * Handle the Intent when the app starts from scratch (COLD START)
     */

    override fun onCreate(savedInstanceState: Bundle?):Unit {

        // Set the Intent property with the modified Intent data before super.onCreate runs.
        // This ensures React Native's built-in deep link handling reads the correct data.
        intent = modifyIntentForSharing(intent)

        // IMPORTANT: Must call super.onCreate after the intent is modified.
        super.onCreate(savedInstanceState)
    }

    /**
     * Handle the Intent when the app is resumed from background (WARM START)
     */
    override fun onNewIntent(intent: Intent?) {
        val modifiedIntent = modifyIntentForSharing(intent)

        // IMPORTANT: Must call super.onNewIntent with the potentially modified Intent.
        super.onNewIntent(modifiedIntent)
    }

    /**
     * Utility function to apply the common logic for modifying the Intent.
     * This function extracts ACTION_SEND data and remaps it to an ACTION_VIEW deep link format.
     */
    private fun modifyIntentForSharing(intent: Intent?): Intent? {
        intent ?: return null

        // 1. Determine the relevant URI based on the Intent Action
        val sharedUri: Uri? =
            if (Intent.ACTION_SEND == intent.action) {
                // Get URI from EXTRA_STREAM for ACTION_SEND
                @Suppress("DEPRECATION")
                intent.getParcelableExtra<Uri>(Intent.EXTRA_STREAM)
            } else {
                // Get URI from intent.data for deep links (e.g., ACTION_VIEW)
                intent.data
            }

        // 2. Process the extracted URI if it exists
        sharedUri?.let { uri ->
            // Convert the URI to a string.
            val uriString = uri.toString()

            // Modify the existing intent object to be read as a deep link (ACTION_VIEW).
            intent.data = Uri.parse(uriString)
            intent.action = Intent.ACTION_VIEW
        }

        // Return the (potentially) modified intent
        return intent
    }
}
