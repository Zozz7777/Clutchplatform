package com.clutch.partners.ui.theme

import androidx.compose.ui.graphics.Color
import kotlin.math.*

/**
 * Utility class to convert OKLCH colors from design.json to Android Color objects
 * Using manual OKLCH to RGB conversion
 */
object ColorConverter {
    
    /**
     * Convert OKLCH color to Android Color
     * @param l Lightness (0.0 to 1.0)
     * @param c Chroma (0.0 to 0.4+)
     * @param h Hue (0.0 to 360.0)
     * @return Android Color object
     */
    fun oklchToColor(l: Double, c: Double, h: Double): Color {
        // Convert OKLCH to RGB using manual conversion
        val hRad = h * PI / 180.0
        
        // Convert OKLCH to OKLab
        val a = c * cos(hRad)
        val bLab = c * sin(hRad)
        
        // Convert OKLab to Linear RGB
        val l_ = l + 0.3963377774 * a + 0.2158037573 * bLab
        val m_ = l - 0.1055613458 * a - 0.0638541728 * bLab
        val s_ = l - 0.0894841775 * a - 1.2914855480 * bLab
        
        val l3 = l_ * l_ * l_
        val m3 = m_ * m_ * m_
        val s3 = s_ * s_ * s_
        
        val r = +4.0767416621 * l3 - 3.3077115913 * m3 + 0.2309699292 * s3
        val g = -1.2684380046 * l3 + 2.6097574011 * m3 - 0.3413193965 * s3
        val b = -0.0041960863 * l3 - 0.7034186147 * m3 + 1.7076147010 * s3
        
        // Convert Linear RGB to sRGB
        val rGamma = if (r <= 0.0031308) 12.92 * r else 1.055 * r.pow(1.0/2.4) - 0.055
        val gGamma = if (g <= 0.0031308) 12.92 * g else 1.055 * g.pow(1.0/2.4) - 0.055
        val bGamma = if (b <= 0.0031308) 12.92 * b else 1.055 * b.pow(1.0/2.4) - 0.055
        
        // Clamp values and convert to 0-255 range
        val red = (rGamma.coerceIn(0.0, 1.0) * 255).toInt()
        val green = (gGamma.coerceIn(0.0, 1.0) * 255).toInt()
        val blue = (bGamma.coerceIn(0.0, 1.0) * 255).toInt()
        
        return Color(red, green, blue)
    }
    
    /**
     * Convert OKLCH color string to Android Color
     * @param oklchString Format: "oklch(l c h)" or "oklch(l c h / a)"
     * @return Android Color object
     */
    fun oklchStringToColor(oklchString: String): Color {
        // Parse oklch string like "oklch(0.5770 0.2450 27.3250)"
        val cleanString = oklchString
            .replace("oklch(", "")
            .replace(")", "")
            .trim()
        
        val values = cleanString.split("\\s+".toRegex())
        if (values.size >= 3) {
            val l = values[0].toDouble()
            val c = values[1].toDouble()
            val h = values[2].toDouble()
            return oklchToColor(l, c, h)
        }
        
        // Fallback to white if parsing fails
        return Color.White
    }
}
