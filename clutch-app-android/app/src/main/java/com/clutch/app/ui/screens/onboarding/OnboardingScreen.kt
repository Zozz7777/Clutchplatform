package com.clutch.app.ui.screens.onboarding

import androidx.compose.foundation.Image
import androidx.compose.foundation.background
import androidx.compose.foundation.layout.*
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.filled.*
import androidx.compose.material3.*
import androidx.compose.runtime.*
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.res.painterResource
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.text.style.TextAlign
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import com.clutch.app.R
import com.clutch.app.ui.theme.*

@Composable
fun OnboardingScreen(
    onGetStarted: () -> Unit,
    onSkip: () -> Unit
) {
    var currentPage by remember { mutableStateOf(0) }
    var currentLanguage by remember { mutableStateOf("en") }
    
      val pages = if (currentLanguage == "ar") {
          listOf(
              OnboardingPage(
                  title = "وفر المال",
                  description = "تتبع صحة سيارتك، تجنب الأعطال المكلفة، واحصل على أفضل الأسعار لقطع الغيار والخدمات—فقط مع كلتش.",
                  illustrationRes = R.drawable.onboarding_save_money
              ),
              OnboardingPage(
                  title = "مدد عمر سيارتك",
                  description = "ابق على اطلاع بالصيانة واستبدل القطع في الوقت المناسب للحفاظ على سيارتك تعمل بسلاسة لسنوات قادمة.",
                  illustrationRes = R.drawable.onboarding_extend_life
              ),
              OnboardingPage(
                  title = "راحة البال",
                  description = "من الميكانيكيين الموثوقين إلى المدفوعات الشفافة، كلتش يضمن أن كل رحلة تكون أكثر أماناً وذكاءً وخالية من التوتر.",
                  illustrationRes = R.drawable.onboarding_peace_of_mind
              )
          )
      } else {
          listOf(
              OnboardingPage(
                  title = "Save Money",
                  description = "Track your car's health, avoid costly breakdowns, and get the best prices on parts and services—only with Clutch.",
                  illustrationRes = R.drawable.onboarding_save_money
              ),
              OnboardingPage(
                  title = "Extend the life of your car",
                  description = "Stay on top of maintenance and replace parts at the right time to keep your car running smoothly for years to come.",
                  illustrationRes = R.drawable.onboarding_extend_life
              ),
              OnboardingPage(
                  title = "Peace of mind",
                  description = "From trusted mechanics to transparent payments, Clutch ensures every ride is safer, smarter, and stress-free.",
                  illustrationRes = R.drawable.onboarding_peace_of_mind
              )
          )
      }

    Box(
        modifier = Modifier
            .fillMaxSize()
            .background(Color.White)
    ) {
        Column(
            modifier = Modifier.fillMaxSize(),
            horizontalAlignment = Alignment.CenterHorizontally
        ) {
            // Header with Clutch logo and language switch
            Row(
                modifier = Modifier
                    .fillMaxWidth()
                    .padding(top = 48.dp, start = 16.dp, end = 16.dp, bottom = 16.dp), // Add top padding to avoid status bar
                horizontalArrangement = Arrangement.SpaceBetween,
                verticalAlignment = Alignment.CenterVertically
            ) {
                // Clutch Logo
                Image(
                    painter = painterResource(id = R.drawable.clutch_logo_red),
                    contentDescription = "Clutch Logo",
                    modifier = Modifier.size(40.dp)
                )
                
                // Language Switch
                IconButton(
                    onClick = { 
                        currentLanguage = if (currentLanguage == "en") "ar" else "en"
                    }
                ) {
                    Icon(
                        imageVector = Icons.Default.Language,
                        contentDescription = "Switch Language",
                        tint = ClutchRed,
                        modifier = Modifier.size(24.dp)
                    )
                }
            }

            // Page content
            Box(
                modifier = Modifier.weight(1f),
                contentAlignment = Alignment.Center
            ) {
                Column(
                    horizontalAlignment = Alignment.CenterHorizontally,
                    verticalArrangement = Arrangement.Center
                ) {
                    // Illustration
                    Image(
                        painter = painterResource(id = pages[currentPage].illustrationRes),
                        contentDescription = "Onboarding Illustration",
                        modifier = Modifier
                            .size(300.dp)
                            .padding(16.dp)
                    )

                    Spacer(modifier = Modifier.height(32.dp))

                    // Title
                    Text(
                        text = pages[currentPage].title,
                        fontSize = 24.sp,
                        fontWeight = FontWeight.Bold,
                        color = Color.Black,
                        textAlign = TextAlign.Center,
                        modifier = Modifier.padding(horizontal = 32.dp)
                    )

                    Spacer(modifier = Modifier.height(16.dp))

                    // Description
                    Text(
                        text = pages[currentPage].description,
                        fontSize = 14.sp,
                        color = Color.Black, // All text in black, not mixed colors
                        textAlign = TextAlign.Center,
                        lineHeight = 20.sp,
                        modifier = Modifier.padding(horizontal = 32.dp)
                    )
                }
            }

            // Page indicators
            Row(
                horizontalArrangement = Arrangement.Center,
                verticalAlignment = Alignment.CenterVertically,
                modifier = Modifier.padding(bottom = 32.dp)
            ) {
                pages.forEachIndexed { index, _ ->
                    Box(
                        modifier = Modifier
                            .size(if (index == currentPage) 12.dp else 8.dp)
                            .background(
                                color = if (index == currentPage) ClutchRed else Color.Gray.copy(alpha = 0.3f),
                                shape = RoundedCornerShape(50)
                            )
                    )
                    if (index < pages.size - 1) {
                        Spacer(modifier = Modifier.width(8.dp))
                    }
                }
            }

            // Action buttons
            Row(
                modifier = Modifier
                    .fillMaxWidth()
                    .padding(horizontal = 32.dp),
                horizontalArrangement = Arrangement.SpaceBetween,
                verticalAlignment = Alignment.CenterVertically
            ) {
                // Skip button (only show on first page)
                if (currentPage == 0) {
                    TextButton(onClick = onSkip) {
                        Text(
                            text = "Skip",
                            color = ClutchRed,
                            fontSize = 16.sp
                        )
                    }
                } else {
                    Spacer(modifier = Modifier.width(1.dp))
                }

                // Next/Get Started button
                Button(
                    onClick = {
                        if (currentPage < pages.size - 1) {
                            currentPage++
                        } else {
                            onGetStarted()
                        }
                    },
                    modifier = Modifier
                        .width(120.dp)
                        .height(48.dp),
                    colors = ButtonDefaults.buttonColors(containerColor = ClutchRed),
                    shape = RoundedCornerShape(12.dp)
                ) {
                    Text(
                        text = if (currentPage < pages.size - 1) "Next" else "Get Started",
                        fontSize = 16.sp,
                        fontWeight = FontWeight.SemiBold,
                        color = Color.White
                    )
                }
            }

            Spacer(modifier = Modifier.height(32.dp))
        }
    }
}

data class OnboardingPage(
    val title: String,
    val description: String,
    val illustrationRes: Int
)