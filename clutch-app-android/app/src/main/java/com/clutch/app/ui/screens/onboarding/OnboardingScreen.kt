package com.clutch.app.ui.screens.onboarding

import androidx.compose.foundation.Image
import androidx.compose.foundation.background
import androidx.compose.foundation.layout.*
import androidx.compose.foundation.pager.HorizontalPager
import androidx.compose.foundation.pager.rememberPagerState
import androidx.compose.foundation.ExperimentalFoundationApi
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.filled.*
import androidx.compose.material3.*
import androidx.compose.runtime.*
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.platform.LocalLayoutDirection
import androidx.compose.ui.res.painterResource
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.text.style.TextAlign
import androidx.compose.ui.text.buildAnnotatedString
import androidx.compose.ui.text.withStyle
import androidx.compose.ui.text.SpanStyle
import androidx.compose.ui.unit.LayoutDirection
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import kotlinx.coroutines.launch
import com.clutch.app.R
import com.clutch.app.ui.theme.*
import androidx.compose.ui.platform.LocalContext
import androidx.compose.ui.res.stringResource
import com.clutch.app.utils.TranslationManager

@OptIn(ExperimentalFoundationApi::class)
@Composable
fun OnboardingScreen(
    onGetStarted: () -> Unit,
    onSkip: () -> Unit
) {
    val context = LocalContext.current
    var currentLanguage by remember { mutableStateOf(TranslationManager.getCurrentLanguage()) }
    val layoutDirection = if (currentLanguage == "ar") LayoutDirection.Rtl else LayoutDirection.Ltr
    
    val pagerState = rememberPagerState(pageCount = { 3 })
    val coroutineScope = rememberCoroutineScope()
    
        val pages = if (currentLanguage == "ar") {
            listOf(
                OnboardingPage(
                    title = stringResource(R.string.save_money),
                    description = stringResource(R.string.onboarding_save_money_desc),
                    illustrationRes = R.drawable.onboarding_save_money
                ),
                OnboardingPage(
                    title = stringResource(R.string.extend_car_life),
                    description = stringResource(R.string.onboarding_extend_life_desc),
                    illustrationRes = R.drawable.onboarding_extend_life
                ),
                OnboardingPage(
                    title = stringResource(R.string.peace_of_mind),
                    description = stringResource(R.string.onboarding_peace_mind_desc),
                    illustrationRes = R.drawable.onboarding_peace_of_mind
                )
            )
        } else {
            listOf(
              OnboardingPage(
                  title = stringResource(R.string.save_money),
                  description = stringResource(R.string.onboarding_save_money_desc),
                  illustrationRes = R.drawable.onboarding_save_money
              ),
              OnboardingPage(
                  title = stringResource(R.string.extend_car_life),
                  description = stringResource(R.string.onboarding_extend_life_desc),
                  illustrationRes = R.drawable.onboarding_extend_life
              ),
              OnboardingPage(
                  title = stringResource(R.string.peace_of_mind),
                  description = stringResource(R.string.onboarding_peace_mind_desc),
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
                        TranslationManager.toggleLanguage(context)
                        currentLanguage = TranslationManager.getCurrentLanguage()
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

            // Page content with HorizontalPager
            Box(
                modifier = Modifier.weight(1f),
                contentAlignment = Alignment.Center
            ) {
                CompositionLocalProvider(LocalLayoutDirection provides layoutDirection) {
                    HorizontalPager(
                        state = pagerState,
                        modifier = Modifier.fillMaxSize()
                    ) { page ->
                        Column(
                            horizontalAlignment = Alignment.CenterHorizontally,
                            verticalArrangement = Arrangement.Center,
                            modifier = Modifier.fillMaxSize()
                        ) {
                            // Illustration
                            Image(
                                painter = painterResource(id = pages[page].illustrationRes),
                                contentDescription = "Onboarding Illustration",
                                modifier = Modifier
                                    .size(300.dp)
                                    .padding(16.dp)
                            )

                            Spacer(modifier = Modifier.height(32.dp))

                            // Title
                            Text(
                                text = pages[page].title,
                                fontSize = 24.sp,
                                fontWeight = FontWeight.Bold,
                                color = Color.DarkGray,
                                textAlign = TextAlign.Center,
                                modifier = Modifier.padding(horizontal = 32.dp)
                            )

                            Spacer(modifier = Modifier.height(16.dp))

                            // Description
                            Text(
                                text = buildAnnotatedString {
                                    val fullText = pages[page].description
                                    val redParts = when (page) {
                                        0 -> listOf("only with Clutch")
                                        1 -> listOf("keep your car running smoothly for years to come")
                                        2 -> listOf("safer, smarter, and stress-free")
                                        else -> emptyList()
                                    }
                                    
                                    // Set default color to dark grey for all text
                                    withStyle(style = SpanStyle(color = Color.DarkGray)) {
                                        var currentIndex = 0
                                        for (redPart in redParts) {
                                            val startIndex = fullText.indexOf(redPart, currentIndex)
                                            if (startIndex != -1) {
                                                // Add normal text before red part
                                                if (startIndex > currentIndex) {
                                                    append(fullText.substring(currentIndex, startIndex))
                                                }
                                                // Add red part
                                                withStyle(style = SpanStyle(color = ClutchRed, fontWeight = FontWeight.Bold)) {
                                                    append(redPart)
                                                }
                                                currentIndex = startIndex + redPart.length
                                            }
                                        }
                                        // Add remaining text
                                        if (currentIndex < fullText.length) {
                                            append(fullText.substring(currentIndex))
                                        }
                                    }
                                },
                                fontSize = 14.sp,
                                textAlign = TextAlign.Center,
                                lineHeight = 20.sp,
                                modifier = Modifier.padding(horizontal = 32.dp)
                            )
                        }
                    }
                }
            }

            // Page indicators
            CompositionLocalProvider(LocalLayoutDirection provides layoutDirection) {
                Row(
                    horizontalArrangement = Arrangement.Center,
                    verticalAlignment = Alignment.CenterVertically,
                    modifier = Modifier.padding(bottom = 32.dp)
                ) {
                    pages.forEachIndexed { index, _ ->
                        Box(
                            modifier = Modifier
                                .size(if (index == pagerState.currentPage) 12.dp else 8.dp)
                                .background(
                                    color = if (index == pagerState.currentPage) ClutchRed else Color.Gray.copy(alpha = 0.3f),
                                    shape = RoundedCornerShape(50)
                                )
                        )
                        if (index < pages.size - 1) {
                            Spacer(modifier = Modifier.width(8.dp))
                        }
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
                if (pagerState.currentPage == 0) {
                    TextButton(onClick = onSkip) {
                        Text(
                            text = stringResource(R.string.skip),
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
                        if (pagerState.currentPage < pages.size - 1) {
                            coroutineScope.launch {
                                pagerState.animateScrollToPage(pagerState.currentPage + 1)
                            }
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
                        text = if (pagerState.currentPage < pages.size - 1) stringResource(R.string.next) else stringResource(R.string.get_started),
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