package com.issiesays

import android.content.ContentResolver
import java.io.File
import android.net.Uri
import java.io.FileOutputStream
import java.io.InputStream
import java.io.OutputStream
import com.facebook.react.bridge.ReactApplicationContext
import com.facebook.react.bridge.ReactContextBaseJavaModule
import com.facebook.react.bridge.ReactMethod
import com.facebook.react.bridge.Promise
import androidx.core.net.toUri
import androidx.core.content.FileProvider

class FileCopyModule(private val reactContext: ReactApplicationContext) :
    ReactContextBaseJavaModule(reactContext) {

    override fun getName(): String {
        return "FileCopyModule"
    }

    @ReactMethod
    fun copyContentUriToTemp(contentUri: String, promise: Promise) {
        try {
            val uri = contentUri.toUri()
            val contentResolver: ContentResolver = reactContext.contentResolver
            val inputStream: InputStream? = contentResolver.openInputStream(uri)
            if (inputStream == null) {
                promise.reject("E_NO_INPUT_STREAM", "Could not open input stream from URI")
                return
            }

            val fileName = "shared_${System.currentTimeMillis()}.says"
            val tempFile = File(reactContext.cacheDir, fileName)
            val outputStream: OutputStream = FileOutputStream(tempFile)

            val buffer = ByteArray(1024)
            var length: Int
            while (inputStream.read(buffer).also { length = it } > 0) {
                outputStream.write(buffer, 0, length)
            }

            outputStream.flush()
            outputStream.close()
            inputStream.close()

            promise.resolve(tempFile.absolutePath)
        } catch (e: Exception) {
            promise.reject("E_COPY_FAILED", "Failed to copy content URI to temp file", e)
        }
    }

    @ReactMethod
    fun getUriForFile(filePath: String, promise: Promise) {
        try {
            val context = reactApplicationContext
            var cleanPath = filePath

            // Remove file:// if exists
            if (cleanPath.startsWith("file://")) {
                cleanPath = cleanPath.removePrefix("file://")
            }

            // Remove absolute prefix to get relative name
            val packageBase = "/data/user/0/${context.packageName}/"

            // Normalize different internal directories
            cleanPath = when {
                cleanPath.startsWith("${packageBase}files/") ->
                    cleanPath.removePrefix("${packageBase}files/")
                cleanPath.startsWith("${packageBase}cache/") ->
                    cleanPath.removePrefix("${packageBase}cache/")
                else ->
                    cleanPath // fallback
            }

            // Determine base directory
            val baseDir: File =
                when {
                    filePath.contains("/cache/") -> context.cacheDir
                    else -> context.filesDir
                }

            val file = File(baseDir, cleanPath)

            val uri: Uri = FileProvider.getUriForFile(
                context,
                "${context.packageName}.provider",
                file
            )

            promise.resolve(uri.toString())

        } catch (e: Exception) {
            promise.reject("ERROR", e)
        }
    }
} 
