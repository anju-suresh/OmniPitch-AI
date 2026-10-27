import { callGemini } from "../config/gemini.js";

export const SUPPORTED_LANGUAGES = [
  {
    code: "en",
    name: "English (UK)",
    flag: "🇬🇧",
    style: "Analytical, dry wit, traditional terminology",
  },
  {
    code: "es",
    name: "Español (Latinoamérica)",
    flag: "🇲🇽",
    style: "High passion, emotional cadence, ¡Golazo!",
  },
  {
    code: "pt",
    name: "Português (Brasil)",
    flag: "🇧🇷",
    style: "Joga bonito flair, rhythm, technical celebration",
  },
  {
    code: "fr",
    name: "Français",
    flag: "🇫🇷",
    style: "Artful, tactical cadence, chauvinistic charm",
  },
  {
    code: "de",
    name: "Deutsch",
    flag: "🇩🇪",
    style: "Precision, Gegenpressing terminology, tactical structure",
  },
  {
    code: "ja",
    name: "日本語 (Japanese)",
    flag: "🇯🇵",
    style: "Respectful, strategic, team harmony analysis",
  },
  {
    code: "ar",
    name: "العربية (Arabic)",
    flag: "🇸🇦",
    style: "Poetic, roaring broadcast excitement, high drama",
  },
  {
    code: "hi",
    name: "हिन्दी (Hindi)",
    flag: "🇮🇳",
    style: "Vibrant, festive, high-energy storytelling",
  },
  {
    code: "zh",
    name: "中文 (Mandarin)",
    flag: "🇨🇳",
    style: "Methodical, balanced tactical observation",
  },
];

/**
 * Multilingual Cultural Localizer Agent (Gemini Flash)
 * Translates match summaries and commentary into culturally localized dialects, fan complexity tiers, and club loyalty perspectives.
 */
export const localizeContent = async ({
  text,
  targetLanguageCode = "en",
  fanMode = "casual", // 'casual' | 'tactics' | 'fantasy'
  clubLoyalty = "FC Barcelona", // 'FC Barcelona' | 'Deportivo Alavés' | 'Neutral'
}) => {
  const targetLang =
    SUPPORTED_LANGUAGES.find((l) => l.code === targetLanguageCode) ||
    SUPPORTED_LANGUAGES[0]; // Default to English (UK)

  const prompt = `
You are the Multilingual Cultural Sports Broadcaster for OmniPitch AI.
Translate and culturally adapt the following football match story for fans:

Original Content:
"${text}"

Target Language: ${targetLang.name} (${targetLang.code})
Cultural Style Guide: ${targetLang.style}
Club Loyalty Perspective: ${
    clubLoyalty === "Deportivo Alavés"
      ? "Deportivo Alavés (Glorioso) Fan Perspective. Highlight Alavés grit, Kike García's goal, Antonio Sivera's heroics, and Basque fighting spirit against the giant at Montjuïc."
      : clubLoyalty === "FC Barcelona"
        ? "FC Barcelona (Culé) Fan Perspective. Celebrate Barça supremacy, Lewandowski's finishing masterclass, Yamal's flair, and Flick's pressing dominance."
        : "Neutral / Both Clubs Perspective. Balanced, objective tactical sports journalism covering both sides equally."
  }
Fan Complexity Tier: ${fanMode.toUpperCase()}
- CASUAL: Accessible storytelling, relatable analogies, high emotion and drama.
- TACTICS: Technical managerial vocabulary (half-spaces, pressing triggers, rest-defense 3-1, Zone 14 infiltration, xG overperformance).
- FANTASY: Focus on fantasy football points, goal bonus (+8 pts), assists (+3 pts), shot volume, xG threat, clean-sheet wipeout.

Return strict JSON with this structure:
{
  "languageCode": "${targetLang.code}",
  "languageName": "${targetLang.name}",
  "flag": "${targetLang.flag}",
  "translatedHeadline": "Headline strictly in ${targetLang.name} customized for ${clubLoyalty} loyalty and ${fanMode} tier",
  "translatedContent": "2-3 paragraphs strictly in ${targetLang.name} with natural football slang matching ${clubLoyalty} loyalty and ${fanMode} tier",
  "commentaryAudioSnippet": "1-2 sentence high-energy audio commentary call phrase strictly in ${targetLang.name}"
}
`;

  const fallback = () => {
    const isAlaves = clubLoyalty === "Deportivo Alavés";
    const isBarca = clubLoyalty === "FC Barcelona";
    const isTactics = fanMode === "tactics";
    const isFantasy = fanMode === "fantasy";

    const fallbacks = {
      en: {
        translatedHeadline: isAlaves
          ? (isTactics ? "Tactical Defiance: Alavés Compact Low-Block & Vertical Threat at Montjuïc" : isFantasy ? "Fantasy Debrief: Kike García Delivers Goal Value (+6 Pts) as Sivera Racks Up Saves" : "Basque Pride: Resilient Alavés Battle Fearlessly at Montjuïc")
          : isBarca
            ? (isTactics ? "Tactical Supremacy: Flick's High-Line Squeeze & Half-Space Overloads Overwhelm Alavés" : isFantasy ? "Fantasy Goldmine: Lewandowski Scores Monster 13 Pts as Yamal Dominates Creative Matrix" : "Blaugrana Masterclass: Lewandowski Brace & Yamal Magic Seal 3-1 Triumph Over Alavés!")
            : (isTactics ? "Positional Play vs Direct Transition: In-Depth Breakdown of Barcelona 3-1 Alavés" : isFantasy ? "Matchday 23 Fantasy Review: Lewandowski & Kike García Lead Scoring in 4-Goal Clash" : "High-Stakes La Liga Duel: Barcelona Edge Past Resilient Alavés in 3-1 Thriller"),
        translatedContent: isAlaves
          ? (isTactics
              ? "Luis García Plaza deployed a disciplined 4-4-2 mid-block to restrict central penetration, springing Carlos Vicente and Kike García on rapid vertical breaks into vacated full-back channels. Sedlar's second-half dismissal forced an emergency 4-4-1 low block, but the Basque side still generated 0.38 xG on transitional counters."
              : isFantasy
                ? "Budget forward Kike García rewarded differential fantasy managers with an opportunistic goal return (+6 pts), while Antonio Sivera earned vital save points (+3 pts) under heavy Barcelona siege. Carlos Vicente created 2 key chances, offering continued creative value for upcoming gameweeks."
                : "A fierce display of Basque heart under the floodlights at Estadi Olímpic! Despite facing Barcelona's relentless firepower, Kike García delivered a thunderous counter-attacking strike that stunned the home crowd. Antonio Sivera pulled off heroic reflex saves to keep the Babazorros fighting with immense pride until the final whistle.")
          : isBarca
            ? (isTactics
                ? "Hansi Flick's aggressive 3-1 rest-defense allowed Pedri and Casadó to dictate proceedings from the half-spaces. By systematically pulling Alavés' double pivot outward, Barcelona created isolated 1v1 corridors for Yamal to penetrate Zone 14, generating 2.45 team xG."
                : isFantasy
                  ? "Captaincy delight! Robert Lewandowski rewarded fantasy managers with a 13-point haul through his clinical brace and maximum bonus points. Lamine Yamal picked up an assist (+3 pts) alongside 5 key passes, while Barcelona's relentless attacking tempo provided huge fantasy dividends."
                  : "A magical night under the Montjuïc lights! FC Barcelona dispatched Deportivo Alavés 3-1 with Robert Lewandowski putting on a masterclass in predatory finishing. Teen sensation Lamine Yamal dismantled the Basque defense with breathtaking flair, sending the Culé faithful into pure euphoria!")
            : (isTactics
                ? "A fascinating clash of footballing philosophies: Hansi Flick's vertical high-press against Luis García Plaza's structured 4-4-2 block. While Alavés found joy targeting Barcelona's high defensive line, the territorial tilt (71%) and central overloads ultimately tilted the match in Barça's favor."
                : isFantasy
                  ? "A high-octane 4-goal encounter producing attacking returns on both sides. Lewandowski led all players with 13 fantasy points, while Kike García provided differential value for forward lines."
                  : "A captivating Spanish football spectacle at Estadi Olímpic Lluís Companys. Barcelona exerted territorial control through Lewandowski and Yamal, but a spirited Deportivo Alavés kept the contest on a knife's edge through Kike García's sharp equalizer before the hosts pulled clear."),
        commentaryAudioSnippet: isAlaves
          ? "Defiant Basque pride! Kike García's clinical counter-strike silenced Montjuïc!"
          : isBarca
            ? "Absolute predatory brilliance from Robert Lewandowski! Barcelona put on an attacking clinic under the lights!"
            : "An enthralling four-goal spectacle in Barcelona! High-tempo drama from the first whistle to the last!"
      },
      es: {
        translatedHeadline: isAlaves
          ? (isTactics ? "Resistencia Táctica: Bloque bajo y transiciones verticales del Glorioso Alavés" : isFantasy ? "Puntos Fantasy: Kike García premia a sus managers (+6 Pts) y Sivera salva bajo palos" : "¡Orgullo Glorioso! El Alavés lucha con garra vasca y el golazo de Kike García en Montjuïc")
          : isBarca
            ? (isTactics ? "Supremacía Táctica: La presión alta y sobrecargas en pasillos interiores desarman al Alavés" : isFantasy ? "Festín Fantasy: Lewandowski suma 13 puntos y Lamine Yamal domina la creación" : "¡Festival goleador del Barça con doblete estelar de Robert Lewandowski y magia de Lamine Yamal!")
            : (isTactics ? "Juego de Posición vs Transición Directa: Análisis táctico del Barça 3-1 Alavés" : isFantasy ? "Resumen Fantasy Jornada 23: Lewandowski y Kike García lideran el ataque" : "¡Duelo de alta tensión en La Liga! El Barcelona se impone 3-1 ante un aguerrido Alavés"),
        translatedContent: isAlaves
          ? (isTactics
              ? "Luis García Plaza planteó un bloque medio 4-4-2 compacto para neutralizar la zona de creación culé, lanzando a Carlos Vicente y Kike García al espacio exterior. La expulsión de Sedlar forzó un 4-4-1 de emergencia, pero el Glorioso generó 0.38 xG al contragolpe."
              : isFantasy
                ? "Kike García respondió como delantero diferencial sumando 6 puntos más bonus con un remate letal. Antonio Sivera fue clave con 5 paradas de mérito sumando puntos de guardameta en una jornada de enorme asedio rival."
                : "¡Auténtica noche de coraje albiazul en el Estadi Olímpic! A pesar del poderío blaugrana, Kike García enmudeció a la grada local con un contraataque de manual. Antonio Sivera se vistió de héroe bajo los palos para demostrar que el Glorioso jamás se rinde sin luchar con el alma.")
          : isBarca
            ? (isTactics
                ? "El 3-1 en rest-defense de Hansi Flick permitió a Casadó y Pedri adueñarse de los pasillos interiores. Al desordenar el doble pivote de Alavés, Yamal encontró situaciones de 1 contra 1 para desequilibrar en Zona 14 con un xG total de 2.45."
                : isFantasy
                  ? "¡Jornada soñada para los managers que capitanearon a Lewandowski! Doblete letal y 3 puntos bonus para alcanzar los 13 puntos fantasy. Lamine Yamal sumó asistencia (+3 pts) y 5 pases clave para sellar una jornada redonda."
                  : "¡Noche mágica en Montjuïc! El FC Barcelona se impuso 3-1 al Deportivo Alavés con una exhibición de Lamine Yamal y el instinto letal de Lewandowski. La presión asfixiante de Hansi Flick dominó el juego en la segunda mitad con un fútbol vertiginoso.")
            : "Intenso duelo en el Estadi Olímpic Lluís Companys. El Barcelona llevó el peso del juego con Lewandowski y Yamal, mientras que el Deportivo Alavés vendió cara su piel gracias a la igualada momentánea de Kike García antes de que el Barça sellara el 3-1 definitivo.",
        commentaryAudioSnippet: isAlaves
          ? "¡Qué golazo de Kike García! ¡Puro orgullo y bravura del Glorioso Alavés!"
          : isBarca
            ? "¡Qué golazo descomunal de Robert Lewandowski! ¡Definición clínica al fondo de las mallas!"
            : "¡Partidazo vibrante de cuatro goles bajo los focos de Montjuïc!"
      },
      fr: {
        translatedHeadline: isAlaves
          ? "Fierté Basque : Alavés héroïque à Montjuïc avec le bijou de Kike García"
          : isBarca
            ? "Récital Catalan : Le Barça triomphe 3-1 grâce au doublé de Lewandowski et au génie de Yamal !"
            : "Le Barça s'impose 3-1 face à un valeureux Alavés à Montjuïc",
        translatedContent: isAlaves
          ? "Quelle débauche d'énergie des hommes de Luis García Plaza ! Alavés a fait trembler le leader grâce à un contre fulgurant conclu par Kike García et un Sivera impérial dans les cages."
          : isBarca
            ? "Au stade olympique de Montjuïc, les Blaugrana de Hansi Flick ont offert un récital offensif avec un doublé chirurgical de Robert Lewandowski et les accélérations magiques de Lamine Yamal."
            : "Une rencontre spectaculaire de Liga où le pressing haut du Barça a fini par faire la différence face à un bloc bas basque très combatif.",
        commentaryAudioSnippet: isAlaves
          ? "Contre-attaque éclair d'Alavés ! Kike García fait taire Montjuïc !"
          : isBarca
            ? "Quel bijou de Robert Lewandowski ! Une frappe limpide et chirurgicale !"
            : "Superbe spectacle à Barcelone avec quatre buts de grande classe !"
      },
      de: {
        translatedHeadline: isAlaves
          ? "Baskischer Kampfgeist: Alavés stemmt sich mutig gegen Barcelonas Offensivwelle"
          : isBarca
            ? "Gala in Montjuïc: Lewandowski-Doppelpack und Yamal-Zauber führen Barça zum 3:1!"
            : "La Liga Top-Duell: Barcelona siegt 3:1 gegen kämpferisches Alavés",
        translatedContent: isAlaves
          ? "Mit eiserner Disziplin im 4-4-2 hielt Deportivo Alavés lange dagegen. Kike Garcías blitzsauberer Kontertreffer und Siveras Glanzparaden zeigten die unverwüstliche Moral des Glorioso."
          : isBarca
            ? "Hansi Flicks Gegenpressing-Maschine lief auf Hochtouren! Robert Lewandowski brillierte mit eiskaltem Torinstinkt, während Lamine Yamal die gegnerischen Linien mit brillanten Pässen auflöste."
            : "Ein faszinierender taktischer Schlagabtausch zwischen Flicks vertikalem Pressing und Plazas kompakter Abwehrstruktur endete mit einem verdienten 3:1 für Barcelona.",
        commentaryAudioSnippet: isAlaves
          ? "Brillanter Konter von Alavés! Kike García schockt Barcelona!"
          : isBarca
            ? "Eiskalt verwandelt von Robert Lewandowski! Pure Klasse im Strafraum!"
            : "Tempo, Taktik und vier Tore: Ein echtes Fußballfest in Montjuïc!"
      },
      ja: {
        translatedHeadline: isAlaves
          ? "バスクの誇り！アラベスがモンジュイックでバルサを脅かす激闘"
          : isBarca
            ? "レヴァンドフスキ圧巻のドッピエッタ！ヤマルが輝きバルサが3-1快勝！"
            : "ラ・リーガ第23節：バルセロナがアラベスを3-1で下す白熱の戦い",
        translatedContent: isAlaves
          ? "オリンピック・スタジアムでアラベスが見せた気迫の守備と鋭いカウンター。キケ・ガルシアの鮮やかな同点弾とシベラのビッグセーブ連発がバスクの意地を証明しました。"
          : isBarca
            ? "フリック監督率いるバルセロナがハイプレスで圧倒！レヴァンドフスキが決定力を爆発させ、17歳ラミン・ヤマルの異次元のアシストでモンジュイックを歓喜の渦に巻き込みました。"
            : "激しい攻防が繰り広げられた90分間。バルセロナの華麗なパスワークとアラベスの粘り強い守備が激突した見応えある一戦となりました。",
        commentaryAudioSnippet: isAlaves
          ? "アラベスの電光石火のカウンター！キケ・ガルシアが豪快に沈めました！"
          : isBarca
            ? "まさに世界屈指のストライカー！ロベルト・レヴァンドフスキの完璧なフィニッシュ！"
            : "モンジュイックで生まれた4ゴール！ハイレベルな攻防戦です！"
      },
      hi: {
        translatedHeadline: isAlaves
          ? "अलावेस का साहसी मुकाबला! कीके गार्सिया के गोल ने बार्सिलोना को चौंकाया"
          : isBarca
            ? "ला लीगा में बार्सिलोना का जलवा! लेवांडोव्स्की के दो गोल से अलावेस को 3-1 से हराया!"
            : "मोंटजुइक में रोमांचक मुकाबला: बार्सिलोना ने अलावेस को 3-1 से दी मात",
        translatedContent: isAlaves
          ? "मोंटजुइक में अलावेस की जुझारू टीम ने बहादुरी का प्रदर्शन किया। कीके गार्सिया के काउंटर-अटैक गोल और गोलकीपर सिवेरा के शानदार बचावों ने साबित किया कि बास्क टीम कभी हार नहीं मानती।"
          : isBarca
            ? "मोंटजुइक स्टेडियम में खेले गए मुकाबले में एफसी बार्सिलोना ने अलावेस को 3-1 से मात दी। लामिन यामाल के जादुई पास और लेवांडोव्स्की के दो घातक गोलों ने पूरे स्टेडियम को जश्न में डुबो दिया।"
            : "ला लीगा का बेहद रोमांचक मुकाबला! बार्सिलोना के तेज आक्रमण और अलावेस के मजबूत डिफेंस के बीच शानदार फुटबॉल देखने को मिला।",
        commentaryAudioSnippet: isAlaves
          ? "अलावेस का जबरदस्त पलटवार! कीके गार्सिया ने शानदार गोल दागा!"
          : isBarca
            ? "कमाल का गोल! रॉबर्ट लेवांडोव्स्की ने गेंद को सीधे नेट में पहुंचा दिया!"
            : "मोंटजुइक में चार गोलों का रोमांचक मुकाबला!"
      },
      pt: {
        translatedHeadline: isAlaves
          ? "Orgulho Basco: Alavés luta com bravura e marca golaço contra o Barcelona"
          : isBarca
            ? "Show no Montjuïc! Dois gols de Lewandowski e magia de Yamal garantem 3-1 ao Barça"
            : "Barcelona vence o Alavés por 3-1 em duelo movimentado por La Liga",
        translatedContent: isAlaves
          ? "O Alavés mostrou garra sob os holofotes do Estádio Olímpico. O gol de contra-ataque de Kike García e as defesas heroicas de Sivera deixaram a torcida basca orgulhosa."
          : isBarca
            ? "Noite mágica para os Culés! O FC Barcelona de Hansi Flick dominou com pressão alta e oportunismo fatal de Robert Lewandowski, embalado pelo talento deslumbrante de Lamine Yamal."
            : "Grande partida de La Liga com quatro gols e forte intensidade tática do início ao fim em Barcelona.",
        commentaryAudioSnippet: isAlaves
          ? "Contra-ataque mortal do Alavés! Kike García cala o Montjuïc!"
          : isBarca
            ? "Golaço espetacular de Robert Lewandowski! Finalização de pura categoria!"
            : "Partidaça de alto nível com quatro gols na Catalunha!"
      },
      ar: {
        translatedHeadline: isAlaves
          ? "كبرياء الباسك: ألافيس يقاتل ببسالة ويسجل هدفا مباغتا أمام برشلونة"
          : isBarca
            ? "إعصار كتالوني! ثنائية ليفاندوفسكي وسحر يامال يقودان برشلونة للفوز 3-1"
            : "برشلونة يحسم مواجهة ألافيس المثيرة بثلاثية لهدف في مونتجويك",
        translatedContent: isAlaves
          ? "أظهر ديبورتيفو ألافيس روحا قتالية عالية في مونتجويك. هدف كيكي غارسيا الخاطف وتصديات سيفيرا البطولية جسدت عزم الفريق الباسكي حتى اللحظة الأخيرة."
          : isBarca
            ? "أمسية كروية ساحرة في برشلونة! أمتع البلاوغرانا جماهيرهم بضغط هانسي فليك العالي وثنائية الهداف ليفاندوفسكي بمساعدة العبقري الصاعد لامين يامال."
            : "مباراة مليئة بالإثارة والندية التكتيكية بين الاستحواذ الكتالوني والمرتدات الباسكية السريعة.",
        commentaryAudioSnippet: isAlaves
          ? "مرتدة خاطفة من ألافيس وهدف رائع من كيكي غارسيا!"
          : isBarca
            ? "يا له من هدف عالمي لروبرت ليفاندوفسكي! لمسة قناص لا ترحم!"
            : "قمة كروية مثيرة بأربعة أهداف في معقل برشلونة!"
      },
      zh: {
        translatedHeadline: isAlaves
          ? "巴斯克铁血之魂：阿拉维斯无惧强敌客场虽败犹荣"
          : isBarca
            ? "红蓝军团掌控全场！莱万梅开二度携手亚马尔3-1力克阿拉维斯！"
            : "西甲焦点战：巴塞罗那3-1战胜韧劲十足的阿拉维斯",
        translatedContent: isAlaves
          ? "在蒙特惠奇球场的聚光灯下，阿拉维斯展现出坚韧防守与高效反击。加西亚的犀利进球和门将西维拉的多次神扑赢得了全场掌声。"
          : isBarca
            ? "弗里克的高位逼抢战术完美奏效！莱万多夫斯基展现顶级射手本色独中两元，亚马尔的梦幻盘带撕裂对手防线，巴萨全取三分。"
            : "一场精彩纷呈的战术博弈，巴萨的阵地控球与阿拉维斯的高速反击交相辉映，联袂奉献四粒精彩进球。",
        commentaryAudioSnippet: isAlaves
          ? "反击闪电战！基克·加西亚冷静推射破门！"
          : isBarca
            ? "莱万多夫斯基致命一击！教科书般的门前终结！"
            : "精彩绝伦的四球大战，双方展现极高水准！"
      }
    };

    const fb = fallbacks[targetLanguageCode] || fallbacks.en;
    return JSON.stringify({
      languageCode: targetLang.code,
      languageName: targetLang.name,
      flag: targetLang.flag,
      ...fb,
    });
  };

  const response = await callGemini({
    modelName: "gemini-3.5-flash",
    prompt,
    temperature: 0.5,
    fallbackGenerator: fallback,
  });

  try {
    const jsonMatch = response.text.match(/\{[\s\S]*\}/);
    if (jsonMatch) {
      const parsed = JSON.parse(jsonMatch[0]);
      return {
        ...parsed,
        source: response.source || "simulation",
        model: response.model || "gemini-3.5-flash",
      };
    }
  } catch (e) {
    // Return fallback
  }

  const fbObj = JSON.parse(fallback());
  return {
    ...fbObj,
    source: response?.source || "simulation",
    model: response?.model || "gemini-3.5-flash",
  };
};
