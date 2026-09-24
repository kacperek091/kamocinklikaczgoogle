package com.example.kamocinclicker

import android.os.Bundle
import androidx.activity.ComponentActivity
import androidx.activity.compose.setContent
import androidx.compose.animation.AnimatedVisibility
import androidx.compose.animation.core.*
import androidx.compose.foundation.background
import androidx.compose.foundation.clickable
import androidx.compose.foundation.interaction.MutableInteractionSource
import androidx.compose.foundation.layout.*
import androidx.compose.foundation.lazy.LazyColumn
import androidx.compose.foundation.lazy.items
import androidx.compose.foundation.shape.CircleShape
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.material3.*
import androidx.compose.runtime.*
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.draw.clip
import androidx.compose.ui.draw.scale
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.text.font.FontFamily
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.text.style.TextAlign
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import androidx.compose.ui.window.Dialog
import kotlinx.coroutines.delay
import kotlin.math.max
import kotlin.math.min
import kotlin.math.pow
import kotlin.math.roundToLong
import kotlin.random.Random

// ==========================================
// PALETA KOLORÓW WIEJSKICH ZIEMI KAMOCINA
// ==========================================
val DarkWoodBackground = Color(0xFF18120C)
val SurfaceDarkWood = Color(0xFF221A12)
val ForestGreenCard = Color(0xFF1E2820)
val ForestGreenLight = Color(0xFF2E3D31)
val GoldAmberAccent = Color(0xFFE5A93C)
val ButterWhiteText = Color(0xFFFFF8E7)
val MutedRusticText = Color(0xFFA68A68)
val SuccessGreen = Color(0xFF86EFAC)
val DangerRed = Color(0xFFEF4444)

// ==========================================
// MODELE DANYCH GRY 'KAMOCIN CLICKER'
// ==========================================
data class UpgradeItem(
    val id: String,
    val name: String,
    val emoji: String,
    val baseCost: Long,
    val costMultiplier: Double,
    var level: Int,
    val milkPerSec: Double,
    val milkPerClick: Long,
    val desc: String,
    val lore: String
)

data class CowBreed(
    val id: String,
    val name: String,
    val nickname: String,
    val emoji: String,
    val baseCost: Long,
    val multiplier: Double,
    val clickBonus: Double,
    var unlocked: Boolean = false,
    val quote: String
)

data class AchievementItem(
    val id: String,
    val title: String,
    val desc: String,
    val emoji: String,
    val target: Long,
    val rewardCash: Long,
    var progress: Long = 0,
    var completed: Boolean = false,
    var claimed: Boolean = false
)

data class FloatingText(
    val id: Long,
    val text: String,
    val offsetY: Float
)

// ==========================================
// GŁÓWNA AKTYWNOŚĆ ANDROID
// ==========================================
class MainActivity : ComponentActivity() {
    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        setContent {
            KamocinClickerTheme {
                Surface(
                    modifier = Modifier.fillMaxSize(),
                    color = DarkWoodBackground
                ) {
                    KamocinClickerGame()
                }
            }
        }
    }
}

@Composable
fun KamocinClickerTheme(content: @Composable () -> Unit) {
    MaterialTheme(
        colorScheme = darkColorScheme(
            background = DarkWoodBackground,
            surface = ForestGreenCard,
            primary = GoldAmberAccent,
            onBackground = ButterWhiteText,
            onSurface = ButterWhiteText
        ),
        content = content
    )
}

// ==========================================
// GŁÓWNY KOMPONENT GRY I STAN
// ==========================================
@Composable
fun KamocinClickerGame() {
    // Stan Surowców
    var milk by remember { mutableStateOf(0.0) }
    var cash by remember { mutableStateOf(50L) }
    var cowSatisfaction by remember { mutableStateOf(100) } // 0 do 100%
    var activeTab by remember { mutableStateOf(0) } // 0: Główna, 1: Sklep, 2: Rasy, 3: Mini-gry, 4: Osiągnięcia

    // Statystyki Całkowite
    var totalMilkProduced by remember { mutableStateOf(0.0) }
    var totalClicks by remember { mutableStateOf(0L) }
    var totalCashEarned by remember { mutableStateOf(0L) }
    var minigamesWon by remember { mutableStateOf(0) }

    // Aktywne Okna Dialogowe Mini-Gier
    var activeMinigame by remember { mutableStateOf<String?>(null) } // "CATCHER", "MILKING", "RACER"

    // Rasy Krówek z Kamocina
    val breeds = remember {
        mutableStateListOf(
            CowBreed("mucka", "Mućka z Kamocina", "Wierna Krasula", "🐄", 0L, 1.0, 1.0, true, "Muuu! Sianka bym zjadła..."),
            CowBreed("laciata", "Łaciata Rajdówka", "Gazela z Łąk", "🏃‍♀️🐄", 1500L, 1.35, 1.5, false, "Muuu-chura! Złap mnie!"),
            CowBreed("soltys", "Krasula Sołtysa", "Pani Sołtysowa", "👑🐄", 8000L, 1.8, 1.8, false, "Muuu! Z drogi, gęsi!"),
            CowBreed("piorun", "Turbo-Cielak Piorun", "Iskra Kamocina", "⚡🐄", 25000L, 2.5, 3.0, false, "Bzzzt... Muuu! Czysta moc!"),
            CowBreed("ursus_cow", "Cyber-Ursus 3000", "Żelazna Krasula", "🚜🐄", 100000L, 3.8, 2.5, false, "Pyr-pyr-pyr... MUUU!"),
            CowBreed("golden", "Złota Krówka Święta", "Legenda Kamocina", "✨🐄", 500000L, 6.0, 5.0, false, "✨ Złote mleko dla Kamocina! ✨")
        )
    }
    var activeCowIndex by remember { mutableStateOf(0) }
    val activeCow = breeds[activeCowIndex]

    // Lista Ulepszeń Gospodarstwa
    val upgrades = remember {
        mutableStateListOf(
            UpgradeItem("grass", "Lepsza Trawa z Kamocina", "🌱", 15L, 1.15, 0, 0.0, 1L, "+1 L do każdego kliknięcia", "Siana na żyznych łąkach nad kamocińskim strumykiem."),
            UpgradeItem("bucket", "Wiadro Ocynkowane", "🪣", 45L, 1.15, 0, 0.5, 2L, "+0.5 L/s oraz +2 L/klik", "Tradycyjne wiejskie wiaderko z atestem."),
            UpgradeItem("hay", "Pachnące Siano", "🌾", 80L, 1.16, 0, 2.0, 0L, "+2 L/s stałej produkcji", "Suszone na słońcu według receptury pana Zdzicha."),
            UpgradeItem("milker_auto", "Automatyczny Dojak", "⚙️", 200L, 1.16, 0, 6.0, 0L, "+6 L/s automatycznego udoju", "Zbudowany z części od pralki Frania przez miejscowego majstra."),
            UpgradeItem("balm", "Maść od Babci Halinki", "🧴", 800L, 1.17, 0, 10.0, 5L, "+10 L/s oraz +5 L/klik", "Wyciąg z kamocińskich ziół, krówka mruczy ze szczęścia."),
            UpgradeItem("barn", "Nowoczesna Obora", "🏠", 2500L, 1.18, 0, 25.0, 0L, "+25 L/s produkcji mleka", "Ciepła, murowana obora z widokiem na las."),
            UpgradeItem("tanker", "Chłodnia do Mleka", "❄️", 7000L, 1.19, 0, 60.0, 0L, "+60 L/s stałego napływu", "Utrzymuje świeżość i gęstość kamocińskiego mleka."),
            UpgradeItem("ursus", "Traktor Ursus C-330", "🚜", 15000L, 1.20, 0, 120.0, 20L, "+120 L/s oraz +20 L/klik", "Duma całej wsi Kamocin! Pali na dotyk bez tłumika."),
            UpgradeItem("dairy", "Mleczarnia Kamocinianka", "🏰", 80000L, 1.22, 0, 500.0, 50L, "+500 L/s przemysłowego udoju", "Eksportuje sery z Kamocina do największych miast.")
        )
    }

    // Osiągnięcia z Kamocina
    val achievements = remember {
        mutableStateListOf(
            AchievementItem("first_100", "Pierwsza Stówka", "Wyprodukuj łącznie 100 L mleka", "🥛", 100L, 100L),
            AchievementItem("clicks_500", "Mistrz Dojenia", "Wykonaj 500 kliknięć w krówkę", "💪", 500L, 500L),
            AchievementItem("ursus_owner", "Władca Obory", "Kup legendarnego Ursusa C-330", "🚜", 1L, 2000L),
            AchievementItem("cash_10k", "Bogaty Gospodarz", "Zarób łącznie 10,000 zł", "💰", 10000L, 2500L),
            AchievementItem("minigame_pro", "Wiejski Czempion", "Wygraj 5 mini-gier w Kamocinie", "🏆", 5L, 1500L)
        )
    }

    // Pływające teksty przy kliknięciu
    val floatingTexts = remember { mutableStateListOf<FloatingText>() }
    var textCounter by remember { mutableStateOf(0L) }

    // Obliczanie Przyrostu na Sekundę i na Klik
    val satisfactionFactor = if (cowSatisfaction < 30) 0.5 else if (cowSatisfaction >= 85) 1.2 else 1.0
    val rawMilkPerSec = upgrades.sumOf { it.milkPerSec * it.level }
    val milkPerSec = rawMilkPerSec * activeCow.multiplier * satisfactionFactor

    val rawMilkPerClick = 1L + upgrades.sumOf { it.milkPerClick * it.level }
    val milkPerClick = max(1L, (rawMilkPerClick * activeCow.clickBonus * satisfactionFactor).roundToLong())

    // 1. PĘTLA GRY: Produkcja mleka w czasie rzeczywistym (co 100 ms)
    LaunchedEffect(Unit) {
        while (true) {
            delay(100L)
            val currentRate = upgrades.sumOf { it.milkPerSec * it.level } * activeCow.multiplier * (if (cowSatisfaction < 30) 0.5 else if (cowSatisfaction >= 85) 1.2 else 1.0)
            val delta = currentRate * 0.1
            if (delta > 0) {
                milk += delta
                totalMilkProduced += delta
            }
        }
    }

    // 2. SPADEK ZADOWOLENIA KRÓWKI: -1% co 2 sekundy w tle
    LaunchedEffect(Unit) {
        while (true) {
            delay(2000L)
            if (cowSatisfaction > 0) {
                cowSatisfaction -= 1
            }
        }
    }

    // 3. WERYFIKACJA OSIĄGNIĘĆ
    LaunchedEffect(totalMilkProduced, totalClicks, totalCashEarned, minigamesWon, upgrades) {
        achievements.forEach { ach ->
            if (!ach.completed) {
                val currentProgress = when (ach.id) {
                    "first_100" -> totalMilkProduced.toLong()
                    "clicks_500" -> totalClicks
                    "ursus_owner" -> upgrades.find { it.id == "ursus" }?.level?.toLong() ?: 0L
                    "cash_10k" -> totalCashEarned
                    "minigame_pro" -> minigamesWon.toLong()
                    else -> 0L
                }
                ach.progress = currentProgress
                if (currentProgress >= ach.target) {
                    ach.completed = true
                }
            }
        }
    }

    // Kliknięcie w Krówkę
    fun onCowClicked() {
        milk += milkPerClick
        totalMilkProduced += milkPerClick
        totalClicks += 1L
        if (cowSatisfaction < 100) {
            cowSatisfaction = min(100, cowSatisfaction + 4)
        }

        val newId = textCounter++
        floatingTexts.add(FloatingText(newId, "+$milkPerClick L", 0f))
    }

    // Pływający tekst animacja
    LaunchedEffect(floatingTexts.size) {
        if (floatingTexts.isNotEmpty()) {
            delay(800L)
            if (floatingTexts.isNotEmpty()) {
                floatingTexts.removeAt(0)
            }
        }
    }

    // Sprzedaż Mleka na Gotówkę (kurs: 2.50 zł / L)
    fun sellMilk() {
        val liters = milk.toLong()
        if (liters > 0) {
            val earned = (liters * 2.5).toLong()
            milk -= liters
            cash += earned
            totalCashEarned += earned
        }
    }

    Scaffold(
        bottomBar = {
            NavigationBar(
                containerColor = SurfaceDarkWood,
                contentColor = ButterWhiteText
            ) {
                val navItems = listOf(
                    Triple(0, "Główna", "🐄"),
                    Triple(1, "Sklep", "🚜"),
                    Triple(2, "Rasy", "👑"),
                    Triple(3, "Mini-gry", "🎮"),
                    Triple(4, "Zadania", "🏆")
                )
                navItems.forEach { (index, label, emoji) ->
                    NavigationBarItem(
                        selected = activeTab == index,
                        onClick = { activeTab = index },
                        icon = { Text(emoji, fontSize = 20.sp) },
                        label = {
                            Text(
                                label,
                                fontSize = 11.sp,
                                fontWeight = if (activeTab == index) FontWeight.Bold else FontWeight.Normal,
                                color = if (activeTab == index) GoldAmberAccent else MutedRusticText
                            )
                        },
                        colors = NavigationBarItemDefaults.colors(
                            selectedIconColor = GoldAmberAccent,
                            indicatorColor = ForestGreenCard
                        )
                    )
                }
            }
        }
    ) { paddingValues ->
        Column(
            modifier = Modifier
                .fillMaxSize()
                .padding(paddingValues)
                .background(DarkWoodBackground)
        ) {
            // GÓRNY PANEL STATUSU (Mleko & Gotówka)
            HeaderStatusBar(
                milk = milk,
                milkPerSec = milkPerSec,
                cash = cash
            )

            // ZAWARTOŚĆ ZALEŻNA OD ZAKŁADKI
            Box(modifier = Modifier.fillMaxSize()) {
                when (activeTab) {
                    0 -> MainCowScreen(
                        activeCow = activeCow,
                        cowSatisfaction = cowSatisfaction,
                        milk = milk,
                        milkPerClick = milkPerClick,
                        milkPerSec = milkPerSec,
                        floatingTexts = floatingTexts,
                        onCowClick = { onCowClicked() },
                        onSellMilk = { sellMilk() }
                    )
                    1 -> ShopScreen(
                        upgrades = upgrades,
                        cash = cash,
                        onBuyUpgrade = { item ->
                            val cost = (item.baseCost * item.costMultiplier.pow(item.level.toDouble())).roundToLong()
                            if (cash >= cost) {
                                cash -= cost
                                item.level += 1
                            }
                        }
                    )
                    2 -> CowBreedsScreen(
                        breeds = breeds,
                        activeBreedIndex = activeCowIndex,
                        cash = cash,
                        onSelectOrBuyBreed = { index ->
                            val b = breeds[index]
                            if (b.unlocked) {
                                activeCowIndex = index
                            } else if (cash >= b.baseCost) {
                                cash -= b.baseCost
                                b.unlocked = true
                                activeCowIndex = index
                            }
                        }
                    )
                    3 -> MinigamesHubScreen(
                        onOpenGame = { gameType -> activeMinigame = gameType }
                    )
                    4 -> AchievementsScreen(
                        achievements = achievements,
                        totalMilk = totalMilkProduced,
                        totalClicks = totalClicks,
                        totalCash = totalCashEarned,
                        onClaimReward = { ach ->
                            if (ach.completed && !ach.claimed) {
                                ach.claimed = true
                                cash += ach.rewardCash
                            }
                        }
                    )
                }
            }
        }

        // ==========================================
        // DIALOGI DLA MINI-GIER
        // ==========================================
        activeMinigame?.let { game ->
            Dialog(onDismissRequest = { activeMinigame = null }) {
                Surface(
                    shape = RoundedCornerShape(24.dp),
                    color = DarkWoodBackground,
                    border = androidx.compose.foundation.BorderStroke(2.dp, GoldAmberAccent),
                    modifier = Modifier
                        .fillMaxWidth()
                        .height(480.dp)
                ) {
                    when (game) {
                        "CATCHER" -> MilkCatcherMinigame(
                            onFinish = { rewardCash, rewardMilk, won ->
                                cash += rewardCash
                                milk += rewardMilk
                                totalCashEarned += rewardCash
                                if (won) minigamesWon += 1
                                activeMinigame = null
                            },
                            onClose = { activeMinigame = null }
                        )
                        "MILKING" -> SpeedMilkingMinigame(
                            onFinish = { rewardCash, rewardMilk, won ->
                                cash += rewardCash
                                milk += rewardMilk
                                totalCashEarned += rewardCash
                                if (won) minigamesWon += 1
                                activeMinigame = null
                            },
                            onClose = { activeMinigame = null }
                        )
                        "RACER" -> CowRacerMinigame(
                            onFinish = { rewardCash, rewardMilk, won ->
                                cash += rewardCash
                                milk += rewardMilk
                                totalCashEarned += rewardCash
                                if (won) minigamesWon += 1
                                activeMinigame = null
                            },
                            onClose = { activeMinigame = null }
                        )
                    }
                }
            }
        }
    }
}

// ==========================================
// GÓRNY PASEK STATUSU
// ==========================================
@Composable
fun HeaderStatusBar(milk: Double, milkPerSec: Double, cash: Long) {
    Card(
        modifier = Modifier
            .fillMaxWidth()
            .padding(12.dp),
        colors = CardDefaults.cardColors(containerColor = SurfaceDarkWood),
        shape = RoundedCornerShape(16.dp),
        border = androidx.compose.foundation.BorderStroke(1.dp, ForestGreenLight)
    ) {
        Row(
            modifier = Modifier
                .fillMaxWidth()
                .padding(horizontal = 16.dp, vertical = 10.dp),
            horizontalArrangement = Arrangement.SpaceBetween,
            verticalAlignment = Alignment.CenterVertically
        ) {
            // Mleko
            Row(verticalAlignment = Alignment.CenterVertically) {
                Text("🥛", fontSize = 24.sp)
                Spacer(modifier = Modifier.width(8.dp))
                Column {
                    Text(
                        text = "\${milk.toInt()} L",
                        fontWeight = FontWeight.Black,
                        fontSize = 17.sp,
                        color = ButterWhiteText
                    )
                    Text(
                        text = "+\${String.format("%.1f", milkPerSec)} L/s",
                        fontSize = 11.sp,
                        fontWeight = FontWeight.Bold,
                        color = SuccessGreen
                    )
                }
            }

            // Gotówka
            Row(verticalAlignment = Alignment.CenterVertically) {
                Text("💰", fontSize = 24.sp)
                Spacer(modifier = Modifier.width(8.dp))
                Column {
                    Text(
                        text = "$cash zł",
                        fontWeight = FontWeight.Black,
                        fontSize = 17.sp,
                        color = GoldAmberAccent
                    )
                    Text(
                        text = "Gotówka",
                        fontSize = 11.sp,
                        color = MutedRusticText
                    )
                }
            }
        }
    }
}

// ==========================================
// EKRAN 1: GŁÓWNA KRÓWKA I INTERAKCJA
// ==========================================
@Composable
fun MainCowScreen(
    activeCow: CowBreed,
    cowSatisfaction: Int,
    milk: Double,
    milkPerClick: Long,
    milkPerSec: Double,
    floatingTexts: List<FloatingText>,
    onCowClick: () -> Unit,
    onSellMilk: () -> Unit
) {
    var isPressed by remember { mutableStateOf(false) }
    val scale by animateFloatAsState(
        targetValue = if (isPressed) 0.82f else 1.0f,
        animationSpec = spring(dampingRatio = Spring.DampingRatioMediumBouncy, stiffness = Spring.StiffnessLow),
        label = "cowScale"
    )

    Column(
        modifier = Modifier
            .fillMaxSize()
            .padding(16.dp),
        horizontalAlignment = Alignment.CenterHorizontally,
        verticalArrangement = Arrangement.SpaceBetween
    ) {
        // Tytuł i Chmurka Dialogowa
        Column(horizontalAlignment = Alignment.CenterHorizontally) {
            Card(
                colors = CardDefaults.cardColors(containerColor = ForestGreenCard),
                shape = RoundedCornerShape(16.dp),
                border = androidx.compose.foundation.BorderStroke(1.dp, GoldAmberAccent.copy(alpha = 0.5f)),
                modifier = Modifier.padding(bottom = 8.dp)
            ) {
                Text(
                    text = "\\"\${activeCow.quote}\\"",
                    fontSize = 13.sp,
                    color = ButterWhiteText,
                    fontWeight = FontWeight.SemiBold,
                    modifier = Modifier.padding(horizontal = 14.dp, vertical = 6.dp)
                )
            }

            Text(
                text = activeCow.name,
                fontSize = 22.sp,
                fontWeight = FontWeight.Black,
                color = GoldAmberAccent
            )
            Text(
                text = activeCow.nickname,
                fontSize = 12.sp,
                color = MutedRusticText
            )
        }

        // ŚRODEK: INTERAKTYWNA KRÓWKA Z PŁYWAJĄCYM TEKSTEM
        Box(
            contentAlignment = Alignment.Center,
            modifier = Modifier.size(230.dp)
        ) {
            // Główna Krówka
            Box(
                modifier = Modifier
                    .size(190.dp)
                    .scale(scale)
                    .clip(CircleShape)
                    .background(SurfaceDarkWood)
                    .clickable(
                        interactionSource = remember { MutableInteractionSource() },
                        indication = null
                    ) {
                        isPressed = true
                        onCowClick()
                    },
                contentAlignment = Alignment.Center
            ) {
                Text(
                    text = activeCow.emoji,
                    fontSize = 85.sp
                )
            }

            LaunchedEffect(isPressed) {
                if (isPressed) {
                    delay(100L)
                    isPressed = false
                }
            }

            // Pływające teksty "+X L"
            floatingTexts.forEach { ft ->
                val floatAnim = remember { Animatable(0f) }
                LaunchedEffect(ft.id) {
                    floatAnim.animateTo(
                        targetValue = -90f,
                        animationSpec = tween(durationMillis = 750, easing = FastOutSlowInEasing)
                    )
                }
                Text(
                    text = ft.text,
                    fontSize = 20.sp,
                    fontWeight = FontWeight.Black,
                    color = GoldAmberAccent,
                    modifier = Modifier.offset(y = floatAnim.value.dp)
                )
            }
        }

        // PASEK ZADOWOLENIA KRÓWKI (0-100%)
        Card(
            modifier = Modifier.fillMaxWidth(),
            colors = CardDefaults.cardColors(containerColor = ForestGreenCard),
            shape = RoundedCornerShape(16.dp)
        ) {
            Column(modifier = Modifier.padding(14.dp)) {
                Row(
                    modifier = Modifier.fillMaxWidth(),
                    horizontalArrangement = Arrangement.SpaceBetween,
                    verticalAlignment = Alignment.CenterVertically
                ) {
                    Text(
                        text = "❤️ Zadowolenie Krówki:",
                        fontSize = 12.sp,
                        fontWeight = FontWeight.Bold,
                        color = ButterWhiteText
                    )
                    Text(
                        text = "$cowSatisfaction%",
                        fontSize = 13.sp,
                        fontWeight = FontWeight.Black,
                        color = if (cowSatisfaction < 30) DangerRed else SuccessGreen
                    )
                }

                Spacer(modifier = Modifier.height(6.dp))

                LinearProgressIndicator(
                    progress = { cowSatisfaction / 100f },
                    modifier = Modifier
                        .fillMaxWidth()
                        .height(10.dp)
                        .clip(RoundedCornerShape(5.dp)),
                    color = if (cowSatisfaction < 30) DangerRed else GoldAmberAccent,
                    trackColor = DarkWoodBackground
                )

                if (cowSatisfaction < 30) {
                    Spacer(modifier = Modifier.height(4.dp))
                    Text(
                        text = "⚠️ Krówka smutna! Produkcja obniżona o 50%! Klikaj aby ją pocieszyć!",
                        fontSize = 10.sp,
                        color = DangerRed,
                        fontWeight = FontWeight.Bold
                    )
                }
            }
        }

        // DOLNY PRZYCISK: SPRZEDAJ MLEKO
        Card(
            modifier = Modifier.fillMaxWidth(),
            colors = CardDefaults.cardColors(containerColor = SurfaceDarkWood),
            shape = RoundedCornerShape(16.dp),
            border = androidx.compose.foundation.BorderStroke(1.dp, ForestGreenLight)
        ) {
            Row(
                modifier = Modifier
                    .fillMaxWidth()
                    .padding(14.dp),
                horizontalArrangement = Arrangement.SpaceBetween,
                verticalAlignment = Alignment.CenterVertically
            ) {
                Column {
                    Text("Gotowe do skupu:", fontSize = 11.sp, color = MutedRusticText)
                    Text(
                        text = "\${milk.toInt()} L (~${(milk.toInt() * 2.5).toInt()} zł)",
                        fontSize = 15.sp,
                        fontWeight = FontWeight.Bold,
                        color = ButterWhiteText
                    )
                }

                Button(
                    onClick = onSellMilk,
                    enabled = milk >= 1.0,
                    colors = ButtonDefaults.buttonColors(
                        containerColor = GoldAmberAccent,
                        contentColor = DarkWoodBackground,
                        disabledContainerColor = Color.DarkGray
                    ),
                    shape = RoundedCornerShape(12.dp)
                ) {
                    Text("Sprzedaj mleko 💰", fontWeight = FontWeight.Bold)
                }
            }
        }
    }
}

// ==========================================
// EKRAN 2: SKLEP ULEPSZEŃ GOSPODARSTWA
// ==========================================
@Composable
fun ShopScreen(
    upgrades: List<UpgradeItem>,
    cash: Long,
    onBuyUpgrade: (UpgradeItem) -> Unit
) {
    LazyColumn(
        modifier = Modifier
            .fillMaxSize()
            .padding(12.dp),
        verticalArrangement = Arrangement.spacedBy(8.dp)
    ) {
        item {
            Text(
                text = "🚜 Sklep Gospodarza z Kamocina",
                fontSize = 18.sp,
                fontWeight = FontWeight.Black,
                color = GoldAmberAccent,
                modifier = Modifier.padding(bottom = 6.dp)
            )
        }

        items(upgrades) { item ->
            val cost = (item.baseCost * item.costMultiplier.pow(item.level.toDouble())).roundToLong()
            val canAfford = cash >= cost

            Card(
                colors = CardDefaults.cardColors(containerColor = ForestGreenCard),
                shape = RoundedCornerShape(14.dp),
                border = androidx.compose.foundation.BorderStroke(
                    1.dp,
                    if (canAfford) GoldAmberAccent.copy(alpha = 0.4f) else Color.Transparent
                )
            ) {
                Row(
                    modifier = Modifier
                        .fillMaxWidth()
                        .padding(12.dp),
                    verticalAlignment = Alignment.CenterVertically,
                    horizontalArrangement = Arrangement.SpaceBetween
                ) {
                    Row(
                        verticalAlignment = Alignment.CenterVertically,
                        modifier = Modifier.weight(1f)
                    ) {
                        Text(item.emoji, fontSize = 28.sp)
                        Spacer(modifier = Modifier.width(10.dp))
                        Column {
                            Text(
                                text = item.name,
                                fontWeight = FontWeight.Bold,
                                fontSize = 14.sp,
                                color = ButterWhiteText
                            )
                            Text(
                                text = item.desc,
                                fontSize = 11.sp,
                                color = SuccessGreen
                            )
                            Text(
                                text = "Poziom: \${item.level}",
                                fontSize = 10.sp,
                                color = GoldAmberAccent
                            )
                        }
                    }

                    Button(
                        onClick = { onBuyUpgrade(item) },
                        enabled = canAfford,
                        colors = ButtonDefaults.buttonColors(
                            containerColor = GoldAmberAccent,
                            contentColor = DarkWoodBackground,
                            disabledContainerColor = Color.DarkGray
                        ),
                        shape = RoundedCornerShape(10.dp),
                        modifier = Modifier.padding(start = 8.dp)
                    ) {
                        Text("$cost zł", fontSize = 12.sp, fontWeight = FontWeight.Black)
                    }
                }
            }
        }
    }
}

// ==========================================
// EKRAN 3: RASY KRÓWEK Z KAMOCINA
// ==========================================
@Composable
fun CowBreedsScreen(
    breeds: List<CowBreed>,
    activeBreedIndex: Int,
    cash: Long,
    onSelectOrBuyBreed: (Int) -> Unit
) {
    LazyColumn(
        modifier = Modifier
            .fillMaxSize()
            .padding(12.dp),
        verticalArrangement = Arrangement.spacedBy(10.dp)
    ) {
        item {
            Text(
                text = "👑 Święta Zagroda: Rasy Krówek",
                fontSize = 18.sp,
                fontWeight = FontWeight.Black,
                color = GoldAmberAccent,
                modifier = Modifier.padding(bottom = 6.dp)
            )
        }

        items(breeds.size) { index ->
            val b = breeds[index]
            val isActive = activeBreedIndex == index
            val canAfford = cash >= b.baseCost

            Card(
                colors = CardDefaults.cardColors(
                    containerColor = if (isActive) ForestGreenLight else ForestGreenCard
                ),
                shape = RoundedCornerShape(14.dp),
                border = androidx.compose.foundation.BorderStroke(
                    1.dp,
                    if (isActive) GoldAmberAccent else ForestGreenLight
                )
            ) {
                Row(
                    modifier = Modifier
                        .fillMaxWidth()
                        .padding(12.dp),
                    verticalAlignment = Alignment.CenterVertically,
                    horizontalArrangement = Arrangement.SpaceBetween
                ) {
                    Row(
                        verticalAlignment = Alignment.CenterVertically,
                        modifier = Modifier.weight(1f)
                    ) {
                        Text(b.emoji, fontSize = 34.sp)
                        Spacer(modifier = Modifier.width(10.dp))
                        Column {
                            Text(
                                text = b.name,
                                fontWeight = FontWeight.Bold,
                                fontSize = 15.sp,
                                color = ButterWhiteText
                            )
                            Text(
                                text = "Mnożnik produkcji: x\${b.multiplier}",
                                fontSize = 11.sp,
                                color = SuccessGreen
                            )
                            Text(
                                text = "\\"\${b.quote}\\"",
                                fontSize = 10.sp,
                                color = MutedRusticText
                            )
                        }
                    }

                    if (b.unlocked) {
                        Button(
                            onClick = { onSelectOrBuyBreed(index) },
                            enabled = !isActive,
                            colors = ButtonDefaults.buttonColors(
                                containerColor = if (isActive) Color.DarkGray else GoldAmberAccent,
                                contentColor = DarkWoodBackground
                            ),
                            shape = RoundedCornerShape(10.dp)
                        ) {
                            Text(if (isActive) "Aktywna" else "Wybierz", fontSize = 11.sp, fontWeight = FontWeight.Bold)
                        }
                    } else {
                        Button(
                            onClick = { onSelectOrBuyBreed(index) },
                            enabled = canAfford,
                            colors = ButtonDefaults.buttonColors(
                                containerColor = GoldAmberAccent,
                                contentColor = DarkWoodBackground,
                                disabledContainerColor = Color.DarkGray
                            ),
                            shape = RoundedCornerShape(10.dp)
                        ) {
                            Text("\${b.baseCost} zł", fontSize = 11.sp, fontWeight = FontWeight.Bold)
                        }
                    }
                }
            }
        }
    }
}

// ==========================================
// EKRAN 4: MINI-GRY WIEJSKIE
// ==========================================
@Composable
fun MinigamesHubScreen(onOpenGame: (String) -> Unit) {
    Column(
        modifier = Modifier
            .fillMaxSize()
            .padding(16.dp),
        verticalArrangement = Arrangement.spacedBy(14.dp)
    ) {
        Text(
            text = "🎮 Rozrywki Wiejskie w Kamocinie",
            fontSize = 20.sp,
            fontWeight = FontWeight.Black,
            color = GoldAmberAccent
        )

        Card(
            colors = CardDefaults.cardColors(containerColor = ForestGreenCard),
            shape = RoundedCornerShape(16.dp),
            modifier = Modifier.fillMaxWidth()
        ) {
            Column(modifier = Modifier.padding(16.dp)) {
                Text("🪣 1. Łapanie Mleka (Milk Catcher)", fontWeight = FontWeight.Bold, fontSize = 16.sp, color = ButterWhiteText)
                Text("Łap spadające butelki mleka 🥛 do wiaderka i omijaj kamienie 🪨!", fontSize = 12.sp, color = MutedRusticText)
                Spacer(modifier = Modifier.height(10.dp))
                Button(
                    onClick = { onOpenGame("CATCHER") },
                    colors = ButtonDefaults.buttonColors(containerColor = GoldAmberAccent, contentColor = DarkWoodBackground),
                    shape = RoundedCornerShape(10.dp)
                ) {
                    Text("Zagraj teraz", fontWeight = FontWeight.Bold)
                }
            }
        }

        Card(
            colors = CardDefaults.cardColors(containerColor = ForestGreenCard),
            shape = RoundedCornerShape(16.dp),
            modifier = Modifier.fillMaxWidth()
        ) {
            Column(modifier = Modifier.padding(16.dp)) {
                Text("⚡ 2. Szybkie Dojenie (QTE)", fontWeight = FontWeight.Bold, fontSize = 16.sp, color = ButterWhiteText)
                Text("15-sekundowe wyzwanie zręcznościowe: stukaj podświetlone przyciski!", fontSize = 12.sp, color = MutedRusticText)
                Spacer(modifier = Modifier.height(10.dp))
                Button(
                    onClick = { onOpenGame("MILKING") },
                    colors = ButtonDefaults.buttonColors(containerColor = GoldAmberAccent, contentColor = DarkWoodBackground),
                    shape = RoundedCornerShape(10.dp)
                ) {
                    Text("Zagraj teraz", fontWeight = FontWeight.Bold)
                }
            }
        }

        Card(
            colors = CardDefaults.cardColors(containerColor = ForestGreenCard),
            shape = RoundedCornerShape(16.dp),
            modifier = Modifier.fillMaxWidth()
        ) {
            Column(modifier = Modifier.padding(16.dp)) {
                Text("🏁 3. Wyścig Krów (Tap-Tap Racer)", fontWeight = FontWeight.Bold, fontSize = 16.sp, color = ButterWhiteText)
                Text("Stukaj szybko w ekran i wygraj wyścig z Ursusem i innymi krowami!", fontSize = 12.sp, color = MutedRusticText)
                Spacer(modifier = Modifier.height(10.dp))
                Button(
                    onClick = { onOpenGame("RACER") },
                    colors = ButtonDefaults.buttonColors(containerColor = GoldAmberAccent, contentColor = DarkWoodBackground),
                    shape = RoundedCornerShape(10.dp)
                ) {
                    Text("Zagraj teraz", fontWeight = FontWeight.Bold)
                }
            }
        }
    }
}

// ==========================================
// EKRAN 5: OSIĄGNIĘCIA I STATYSTYKI
// ==========================================
@Composable
fun AchievementsScreen(
    achievements: List<AchievementItem>,
    totalMilk: Double,
    totalClicks: Long,
    totalCash: Long,
    onClaimReward: (AchievementItem) -> Unit
) {
    LazyColumn(
        modifier = Modifier
            .fillMaxSize()
            .padding(12.dp),
        verticalArrangement = Arrangement.spacedBy(8.dp)
    ) {
        item {
            Card(
                colors = CardDefaults.cardColors(containerColor = SurfaceDarkWood),
                shape = RoundedCornerShape(14.dp),
                modifier = Modifier.fillMaxWidth()
            ) {
                Column(modifier = Modifier.padding(14.dp)) {
                    Text("📊 Kronika Gospodarza z Kamocina", fontWeight = FontWeight.Black, fontSize = 16.sp, color = GoldAmberAccent)
                    Spacer(modifier = Modifier.height(6.dp))
                    Text("Łącznie wyprodukowane mleko: \${totalMilk.toInt()} L", fontSize = 12.sp, color = ButterWhiteText)
                    Text("Łącznie zarobiona gotówka: $totalCash zł", fontSize = 12.sp, color = ButterWhiteText)
                    Text("Suma kliknięć w krówki: $totalClicks", fontSize = 12.sp, color = ButterWhiteText)
                }
            }
        }

        item {
            Text(
                text = "🏆 Medale Sołtysa & Zadania",
                fontSize = 18.sp,
                fontWeight = FontWeight.Black,
                color = GoldAmberAccent,
                modifier = Modifier.padding(top = 8.dp, bottom = 4.dp)
            )
        }

        items(achievements) { ach ->
            Card(
                colors = CardDefaults.cardColors(
                    containerColor = if (ach.completed) ForestGreenLight else ForestGreenCard
                ),
                shape = RoundedCornerShape(14.dp)
            ) {
                Row(
                    modifier = Modifier
                        .fillMaxWidth()
                        .padding(12.dp),
                    verticalAlignment = Alignment.CenterVertically,
                    horizontalArrangement = Arrangement.SpaceBetween
                ) {
                    Row(
                        verticalAlignment = Alignment.CenterVertically,
                        modifier = Modifier.weight(1f)
                    ) {
                        Text(ach.emoji, fontSize = 28.sp)
                        Spacer(modifier = Modifier.width(10.dp))
                        Column {
                            Text(ach.title, fontWeight = FontWeight.Bold, fontSize = 14.sp, color = ButterWhiteText)
                            Text(ach.desc, fontSize = 11.sp, color = MutedRusticText)
                            Text("Postęp: \${ach.progress} / \${ach.target}", fontSize = 10.sp, color = SuccessGreen)
                        }
                    }

                    if (ach.claimed) {
                        Text("Odebrano ✓", fontSize = 11.sp, color = SuccessGreen, fontWeight = FontWeight.Bold)
                    } else {
                        Button(
                            onClick = { onClaimReward(ach) },
                            enabled = ach.completed,
                            colors = ButtonDefaults.buttonColors(
                                containerColor = GoldAmberAccent,
                                contentColor = DarkWoodBackground,
                                disabledContainerColor = Color.DarkGray
                            ),
                            shape = RoundedCornerShape(10.dp)
                        ) {
                            Text("+\${ach.rewardCash} zł", fontSize = 11.sp, fontWeight = FontWeight.Bold)
                        }
                    }
                }
            }
        }
    }
}

// ==========================================
// MINI-GRA 1: ŁAPANIE MLEKA (MILK CATCHER)
// ==========================================
@Composable
fun MilkCatcherMinigame(
    onFinish: (rewardCash: Long, rewardMilk: Double, won: Boolean) -> Unit,
    onClose: () -> Unit
) {
    var basketPos by remember { mutableStateOf(1) } // 0: Lewo, 1: Środek, 2: Prawo
    var itemPos by remember { mutableStateOf(1) }
    var itemType by remember { mutableStateOf("MILK") } // "MILK" lub "ROCK"
    var itemY by remember { mutableStateOf(0f) }
    var score by remember { mutableStateOf(0) }
    var lives by remember { mutableStateOf(3) }
    var isOver by remember { mutableStateOf(false) }

    LaunchedEffect(isOver) {
        while (!isOver) {
            delay(50L)
            itemY += 0.08f
            if (itemY >= 1.0f) {
                // Kolizja
                if (basketPos == itemPos) {
                    if (itemType == "MILK") {
                        score += 1
                    } else {
                        lives -= 1
                        if (lives <= 0) isOver = true
                    }
                }
                // Nowy element
                itemY = 0f
                itemPos = Random.nextInt(3)
                itemType = if (Random.nextFloat() < 0.3f) "ROCK" else "MILK"
            }
        }
    }

    Column(
        modifier = Modifier
            .fillMaxSize()
            .padding(16.dp),
        horizontalAlignment = Alignment.CenterHorizontally,
        verticalArrangement = Arrangement.SpaceBetween
    ) {
        Row(
            modifier = Modifier.fillMaxWidth(),
            horizontalArrangement = Arrangement.SpaceBetween
        ) {
            Text("Wynik: $score", fontWeight = FontWeight.Bold, color = GoldAmberAccent)
            Text("Życia: \${"❤️".repeat(max(0, lives))}", color = DangerRed)
        }

        // Plansza gry 3 kolumny
        Box(
            modifier = Modifier
                .fillMaxWidth()
                .height(250.dp)
                .background(ForestGreenCard, RoundedCornerShape(12.dp))
        ) {
            // Spadający przedmiot
            val xOffsetFraction = when (itemPos) {
                0 -> 0.15f
                1 -> 0.5f
                else -> 0.85f
            }
            Box(
                modifier = Modifier
                    .fillMaxSize()
                    .padding(8.dp)
            ) {
                Text(
                    text = if (itemType == "MILK") "🥛" else "🪨",
                    fontSize = 28.sp,
                    modifier = Modifier.align(
                        Alignment.TopStart
                    ).offset(
                        x = (xOffsetFraction * 240).dp,
                        y = (itemY * 200).dp
                    )
                )

                // Wiaderko
                val basketXFraction = when (basketPos) {
                    0 -> 0.15f
                    1 -> 0.5f
                    else -> 0.85f
                }
                Text(
                    text = "🪣",
                    fontSize = 32.sp,
                    modifier = Modifier.align(Alignment.BottomStart).offset(x = (basketXFraction * 240).dp)
                )
            }
        }

        // Przyciski sterowania
        if (!isOver) {
            Row(
                modifier = Modifier.fillMaxWidth(),
                horizontalArrangement = Arrangement.SpaceEvenly
            ) {
                Button(
                    onClick = { if (basketPos > 0) basketPos -= 1 },
                    colors = ButtonDefaults.buttonColors(containerColor = GoldAmberAccent)
                ) {
                    Text("⬅️ Lewo", color = DarkWoodBackground, fontWeight = FontWeight.Bold)
                }
                Button(
                    onClick = { if (basketPos < 2) basketPos += 1 },
                    colors = ButtonDefaults.buttonColors(containerColor = GoldAmberAccent)
                ) {
                    Text("Prawo ➡️", color = DarkWoodBackground, fontWeight = FontWeight.Bold)
                }
            }
        } else {
            Column(horizontalAlignment = Alignment.CenterHorizontally) {
                Text("Koniec gry! Złapano: $score szt.", fontWeight = FontWeight.Bold, color = ButterWhiteText)
                Spacer(modifier = Modifier.height(8.dp))
                Button(
                    onClick = { onFinish(score * 20L, score * 50.0, score >= 5) },
                    colors = ButtonDefaults.buttonColors(containerColor = GoldAmberAccent)
                ) {
                    Text("Odbierz nagrodę", color = DarkWoodBackground, fontWeight = FontWeight.Bold)
                }
            }
        }
    }
}

// ==========================================
// MINI-GRA 2: SZYBKIE DOJENIE QTE (15 SEKUND)
// ==========================================
@Composable
fun SpeedMilkingMinigame(
    onFinish: (rewardCash: Long, rewardMilk: Double, won: Boolean) -> Unit,
    onClose: () -> Unit
) {
    var activeTarget by remember { mutableStateOf(Random.nextInt(4)) }
    var score by remember { mutableStateOf(0) }
    var timeLeft by remember { mutableStateOf(15) }
    var isFinished by remember { mutableStateOf(false) }

    LaunchedEffect(Unit) {
        while (timeLeft > 0) {
            delay(1000L)
            timeLeft -= 1
        }
        isFinished = true
    }

    Column(
        modifier = Modifier
            .fillMaxSize()
            .padding(16.dp),
        horizontalAlignment = Alignment.CenterHorizontally,
        verticalArrangement = Arrangement.SpaceBetween
    ) {
        Text("⚡ Szybkie Dojenie (15s)", fontWeight = FontWeight.Black, fontSize = 18.sp, color = GoldAmberAccent)
        Text("Czas: \${timeLeft}s | Wynik: $score L", fontWeight = FontWeight.Bold, color = ButterWhiteText)

        // 4 Wymiona
        Column(
            verticalArrangement = Arrangement.spacedBy(12.dp),
            modifier = Modifier.fillMaxWidth()
        ) {
            Row(modifier = Modifier.fillMaxWidth(), horizontalArrangement = Arrangement.SpaceEvenly) {
                UdderButton(id = 0, isActive = activeTarget == 0) {
                    if (activeTarget == 0 && !isFinished) {
                        score += 1
                        activeTarget = Random.nextInt(4)
                    }
                }
                UdderButton(id = 1, isActive = activeTarget == 1) {
                    if (activeTarget == 1 && !isFinished) {
                        score += 1
                        activeTarget = Random.nextInt(4)
                    }
                }
            }
            Row(modifier = Modifier.fillMaxWidth(), horizontalArrangement = Arrangement.SpaceEvenly) {
                UdderButton(id = 2, isActive = activeTarget == 2) {
                    if (activeTarget == 2 && !isFinished) {
                        score += 1
                        activeTarget = Random.nextInt(4)
                    }
                }
                UdderButton(id = 3, isActive = activeTarget == 3) {
                    if (activeTarget == 3 && !isFinished) {
                        score += 1
                        activeTarget = Random.nextInt(4)
                    }
                }
            }
        }

        if (isFinished) {
            Button(
                onClick = { onFinish(score * 25L, score * 80.0, score >= 15) },
                colors = ButtonDefaults.buttonColors(containerColor = GoldAmberAccent),
                shape = RoundedCornerShape(12.dp)
            ) {
                Text("Koniec! Odbierz nagrodę", color = DarkWoodBackground, fontWeight = FontWeight.Bold)
            }
        } else {
            Text("Stukaj podświetlony na żółto przycisk!", fontSize = 12.sp, color = MutedRusticText)
        }
    }
}

@Composable
fun UdderButton(id: Int, isActive: Boolean, onClick: () -> Unit) {
    Button(
        onClick = onClick,
        colors = ButtonDefaults.buttonColors(
            containerColor = if (isActive) GoldAmberAccent else ForestGreenCard
        ),
        shape = RoundedCornerShape(16.dp),
        modifier = Modifier.size(110.dp)
    ) {
        Column(horizontalAlignment = Alignment.CenterHorizontally) {
            Text("🥛", fontSize = 28.sp)
            Text(if (isActive) "DOÓJ!" else "Czekaj", fontSize = 11.sp, color = if (isActive) DarkWoodBackground else ButterWhiteText, fontWeight = FontWeight.Bold)
        }
    }
}

// ==========================================
// MINI-GRA 3: WYŚCIG KRÓW (TAP-TAP RACER)
// ==========================================
@Composable
fun CowRacerMinigame(
    onFinish: (rewardCash: Long, rewardMilk: Double, won: Boolean) -> Unit,
    onClose: () -> Unit
) {
    var playerProgress by remember { mutableStateOf(0f) }
    var rivalUrsusProgress by remember { mutableStateOf(0f) }
    var isFinished by remember { mutableStateOf(false) }
    var won by remember { mutableStateOf(false) }

    LaunchedEffect(isFinished) {
        while (!isFinished) {
            delay(100L)
            rivalUrsusProgress += 0.015f + Random.nextFloat() * 0.01f
            if (rivalUrsusProgress >= 1.0f) {
                isFinished = true
                won = false
            }
        }
    }

    Column(
        modifier = Modifier
            .fillMaxSize()
            .padding(16.dp),
        horizontalAlignment = Alignment.CenterHorizontally,
        verticalArrangement = Arrangement.SpaceBetween
    ) {
        Text("🏁 Derby Szosy Kamocina", fontWeight = FontWeight.Black, fontSize = 18.sp, color = GoldAmberAccent)

        // Tory Wyścigowe
        Column(
            modifier = Modifier
                .fillMaxWidth()
                .padding(vertical = 12.dp),
            verticalArrangement = Arrangement.spacedBy(16.dp)
        ) {
            // Tor Gracza
            Column {
                Text("Twoja Krasula: ${(playerProgress * 100).toInt()}%", fontSize = 12.sp, color = GoldAmberAccent, fontWeight = FontWeight.Bold)
                LinearProgressIndicator(
                    progress = { playerProgress },
                    modifier = Modifier
                        .fillMaxWidth()
                        .height(14.dp)
                        .clip(RoundedCornerShape(7.dp)),
                    color = GoldAmberAccent,
                    trackColor = ForestGreenCard
                )
            }

            // Tor Rywala (Ursus)
            Column {
                Text("Rywal Ursus C-330: ${(rivalUrsusProgress * 100).toInt()}%", fontSize = 12.sp, color = MutedRusticText)
                LinearProgressIndicator(
                    progress = { rivalUrsusProgress },
                    modifier = Modifier
                        .fillMaxWidth()
                        .height(14.dp)
                        .clip(RoundedCornerShape(7.dp)),
                    color = DangerRed,
                    trackColor = ForestGreenCard
                )
            }
        }

        if (!isFinished) {
            Button(
                onClick = {
                    playerProgress += 0.05f
                    if (playerProgress >= 1.0f) {
                        isFinished = true
                        won = true
                    }
                },
                modifier = Modifier
                    .fillMaxWidth()
                    .height(60.dp),
                colors = ButtonDefaults.buttonColors(containerColor = GoldAmberAccent),
                shape = RoundedCornerShape(16.dp)
            ) {
                Text("🏃‍♀️ STUKAJ SZYBKO! BIEC! 💨", fontSize = 16.sp, fontWeight = FontWeight.Black, color = DarkWoodBackground)
            }
        } else {
            Column(horizontalAlignment = Alignment.CenterHorizontally) {
                Text(
                    text = if (won) "🏆 WYGRAŁEŚ DERBY KAMOCINA!" else "Ursus był szybszy!",
                    fontWeight = FontWeight.Black,
                    fontSize = 16.sp,
                    color = if (won) SuccessGreen else DangerRed
                )
                Spacer(modifier = Modifier.height(10.dp))
                Button(
                    onClick = { onFinish(if (won) 1000L else 200L, if (won) 2500.0 else 500.0, won) },
                    colors = ButtonDefaults.buttonColors(containerColor = GoldAmberAccent)
                ) {
                    Text("Odbierz nagrodę", color = DarkWoodBackground, fontWeight = FontWeight.Bold)
                }
            }
        }
    }
}
