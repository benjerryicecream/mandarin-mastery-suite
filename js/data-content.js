/* data-content.js — dialogues, phrasebook, tone model, stroke data */

/* ---------- tones: number + name + shape, never color alone ---------- */
window.MMS_TONES = [
  { n: 1, name: 'high level', mark: 'ˉ', shape: '─', contour: [5, 5],     hint: 'Start high and stay flat.' },
  { n: 2, name: 'rising',     mark: 'ˊ', shape: '↗', contour: [3, 5],     hint: 'Start mid and climb.' },
  { n: 3, name: 'dipping',    mark: 'ˇ', shape: '∨', contour: [2, 1, 4],  hint: 'Drop low, then rise a little.' },
  { n: 4, name: 'falling',    mark: 'ˋ', shape: '↘', contour: [5, 1],     hint: 'Start high and snap down.' },
  { n: 5, name: 'neutral',    mark: '·', shape: '•', contour: [3, 3],     hint: 'Short, flat and light.' }
];

/* ---------- five dialogues ---------- */
window.MMS_DIALOGUES = [
  {
    id: 'meet',
    title: 'Meeting a friend',
    sub: 'Casual, two friends on the street',
    lines: [
      { who: 'A', hz: '你好！', py: 'Nǐ hǎo!', en: 'Hello!' },
      { who: 'B', hz: '你好！', py: 'Nǐ hǎo!', en: 'Hello!' },
      { who: 'A', hz: '好久不见！', py: 'Hǎojiǔ bú jiàn!', en: 'Long time no see!' },
      { who: 'B', hz: '是啊，你最近怎么样？', py: 'Shì a, nǐ zuìjìn zěnmeyàng?', en: 'Yeah — how have you been lately?' },
      { who: 'A', hz: '很好，谢谢。你呢？', py: 'Hěn hǎo, xièxie. Nǐ ne?', en: 'Very well, thanks. And you?' },
      { who: 'B', hz: '我也很好。', py: 'Wǒ yě hěn hǎo.', en: "I'm good too." }
    ]
  },
  {
    id: 'food',
    title: 'Ordering food',
    sub: 'At a small noodle shop',
    lines: [
      { who: 'A', hz: '请问，有菜单吗？', py: 'Qǐngwèn, yǒu càidān ma?', en: 'Excuse me, do you have a menu?' },
      { who: 'B', hz: '有，给你。', py: 'Yǒu, gěi nǐ.', en: 'Yes, here you go.' },
      { who: 'A', hz: '我要一碗面条。', py: 'Wǒ yào yī wǎn miàntiáo.', en: "I'd like a bowl of noodles." },
      { who: 'B', hz: '好的。要喝什么？', py: 'Hǎo de. Yào hē shénme?', en: 'Okay. Anything to drink?' },
      { who: 'A', hz: '一杯茶，谢谢。', py: 'Yī bēi chá, xièxie.', en: 'A cup of tea, please.' },
      { who: 'B', hz: '好，请等一会儿。', py: 'Hǎo, qǐng děng yīhuìr.', en: 'Sure — please wait a moment.' }
    ]
  },
  {
    id: 'directions',
    title: 'Asking directions',
    sub: 'Looking for the subway',
    lines: [
      { who: 'A', hz: '请问，地铁站在哪里？', py: 'Qǐngwèn, dìtiězhàn zài nǎlǐ?', en: 'Excuse me, where is the subway station?' },
      { who: 'B', hz: '在前面，往右走。', py: 'Zài qiánmiàn, wǎng yòu zǒu.', en: 'Ahead of you, turn right and walk.' },
      { who: 'A', hz: '远吗？', py: 'Yuǎn ma?', en: 'Is it far?' },
      { who: 'B', hz: '不远，五分钟。', py: 'Bù yuǎn, wǔ fēnzhōng.', en: 'Not far — five minutes.' },
      { who: 'A', hz: '谢谢！', py: 'Xièxie!', en: 'Thank you!' },
      { who: 'B', hz: '不客气。', py: 'Bù kèqi.', en: "You're welcome." }
    ]
  },
  {
    id: 'shop',
    title: 'Shopping',
    sub: 'Haggling at a market stall',
    lines: [
      { who: 'A', hz: '这个多少钱？', py: 'Zhège duōshao qián?', en: 'How much is this one?' },
      { who: 'B', hz: '八十块。', py: 'Bāshí kuài.', en: 'Eighty yuan.' },
      { who: 'A', hz: '太贵了，便宜一点吧。', py: 'Tài guì le, piányi yīdiǎn ba.', en: "That's too expensive — a little cheaper?" },
      { who: 'B', hz: '好，七十块。', py: 'Hǎo, qīshí kuài.', en: 'Okay, seventy.' },
      { who: 'A', hz: '我要一个。', py: 'Wǒ yào yī gè.', en: "I'll take one." },
      { who: 'B', hz: '给你。', py: 'Gěi nǐ.', en: 'Here you go.' }
    ]
  },
  {
    id: 'bye',
    title: 'Saying goodbye',
    sub: 'Leaving a friend’s place',
    lines: [
      { who: 'A', hz: '我要走了，再见！', py: 'Wǒ yào zǒu le, zàijiàn!', en: "I'm heading off — goodbye!" },
      { who: 'B', hz: '再见！明天见。', py: 'Zàijiàn! Míngtiān jiàn.', en: 'Bye! See you tomorrow.' },
      { who: 'A', hz: '路上小心。', py: 'Lùshang xiǎoxīn.', en: 'Take care on the way.' },
      { who: 'B', hz: '谢谢，你也是。', py: 'Xièxie, nǐ yě shì.', en: 'Thanks — you too.' },
      { who: 'A', hz: '好，再见！', py: 'Hǎo, zàijiàn!', en: 'Okay, goodbye!' }
    ]
  }
];

/* ---------- phrasebook ---------- */
window.MMS_PHRASE_GROUPS = [
  {
    id: 'restaurant', title: 'Restaurant', sub: 'Ordering, paying, allergies',
    items: [
      { hz: '我要这个。', py: 'Wǒ yào zhège.', en: "I'd like this one." },
      { hz: '有英文菜单吗？', py: 'Yǒu Yīngwén càidān ma?', en: 'Do you have an English menu?' },
      { hz: '我不吃肉。', py: 'Wǒ bù chī ròu.', en: "I don't eat meat." },
      { hz: '不要辣。', py: 'Bù yào là.', en: 'Not spicy, please.' },
      { hz: '一杯水，谢谢。', py: 'Yī bēi shuǐ, xièxie.', en: 'A glass of water, please.' },
      { hz: '很好吃！', py: 'Hěn hǎochī!', en: 'This is delicious!' },
      { hz: '买单。', py: 'Mǎidān.', en: 'The bill, please.' }
    ]
  },
  {
    id: 'directions', title: 'Directions', sub: 'Finding your way',
    items: [
      { hz: '请问，洗手间在哪里？', py: 'Qǐngwèn, xǐshǒujiān zài nǎlǐ?', en: 'Excuse me, where is the restroom?' },
      { hz: '我迷路了。', py: 'Wǒ mílù le.', en: "I'm lost." },
      { hz: '怎么走？', py: 'Zěnme zǒu?', en: 'How do I get there?' },
      { hz: '远不远？', py: 'Yuǎn bu yuǎn?', en: 'Is it far?' },
      { hz: '请再说一次。', py: 'Qǐng zài shuō yī cì.', en: 'Please say that again.' },
      { hz: '请慢一点说。', py: 'Qǐng màn yīdiǎn shuō.', en: 'Please speak a little more slowly.' }
    ]
  },
  {
    id: 'shopping', title: 'Shopping', sub: 'Prices, sizes, payment',
    items: [
      { hz: '多少钱？', py: 'Duōshao qián?', en: 'How much is it?' },
      { hz: '太贵了。', py: 'Tài guì le.', en: "That's too expensive." },
      { hz: '可以便宜一点吗？', py: 'Kěyǐ piányi yīdiǎn ma?', en: 'Could you make it a bit cheaper?' },
      { hz: '我可以刷卡吗？', py: 'Wǒ kěyǐ shuākǎ ma?', en: 'Can I pay by card?' },
      { hz: '有别的颜色吗？', py: 'Yǒu bié de yánsè ma?', en: 'Do you have another color?' },
      { hz: '我要一个。', py: 'Wǒ yào yī gè.', en: "I'll take one." }
    ]
  },
  {
    id: 'hotel', title: 'Hotel', sub: 'Check-in, Wi-Fi, check-out',
    items: [
      { hz: '我有预订。', py: 'Wǒ yǒu yùdìng.', en: 'I have a reservation.' },
      { hz: '一晚多少钱？', py: 'Yī wǎn duōshao qián?', en: 'How much is one night?' },
      { hz: '房间有无线网吗？', py: 'Fángjiān yǒu wúxiànwǎng ma?', en: 'Is there Wi-Fi in the room?' },
      { hz: '我想退房。', py: 'Wǒ xiǎng tuìfáng.', en: "I'd like to check out." },
      { hz: '请帮我叫出租车。', py: 'Qǐng bāng wǒ jiào chūzūchē.', en: 'Please call a taxi for me.' }
    ]
  },
  {
    id: 'emergency', title: 'Emergency', sub: 'Help, police, doctor',
    items: [
      { hz: '救命！', py: 'Jiùmìng!', en: 'Help!' },
      { hz: '请叫警察。', py: 'Qǐng jiào jǐngchá.', en: 'Please call the police.' },
      { hz: '我需要医生。', py: 'Wǒ xūyào yīshēng.', en: 'I need a doctor.' },
      { hz: '我生病了。', py: 'Wǒ shēngbìng le.', en: "I'm sick." },
      { hz: '医院在哪里？', py: 'Yīyuàn zài nǎlǐ?', en: 'Where is the hospital?' },
      { hz: '我丢了护照。', py: 'Wǒ diū le hùzhào.', en: 'I lost my passport.' }
    ]
  },
  {
    id: 'basics', title: 'Basics', sub: 'Polite survival lines',
    items: [
      { hz: '谢谢你。', py: 'Xièxie nǐ.', en: 'Thank you.' },
      { hz: '不客气。', py: 'Bù kèqi.', en: "You're welcome." },
      { hz: '对不起。', py: 'Duìbuqǐ.', en: 'Sorry.' },
      { hz: '没关系。', py: 'Méi guānxi.', en: "It's okay." },
      { hz: '我不会说中文。', py: 'Wǒ bù huì shuō Zhōngwén.', en: "I don't speak Chinese." },
      { hz: '你会说英语吗？', py: 'Nǐ huì shuō Yīngyǔ ma?', en: 'Do you speak English?' }
    ]
  }
];

/* ---------- tone drill pool (single syllables) ---------- */
window.MMS_TONE_POOL = [
  { hz: '妈', py: 'mā', tone: 1, en: 'mother' },
  { hz: '麻', py: 'má', tone: 2, en: 'numb' },
  { hz: '马', py: 'mǎ', tone: 3, en: 'horse' },
  { hz: '骂', py: 'mà', tone: 4, en: 'to scold' },
  { hz: '吗', py: 'ma', tone: 5, en: 'question particle' },
  { hz: '诗', py: 'shī', tone: 1, en: 'poem' },
  { hz: '十', py: 'shí', tone: 2, en: 'ten' },
  { hz: '史', py: 'shǐ', tone: 3, en: 'history' },
  { hz: '是', py: 'shì', tone: 4, en: 'to be' },
  { hz: '一', py: 'yī', tone: 1, en: 'one' },
  { hz: '姨', py: 'yí', tone: 2, en: 'aunt' },
  { hz: '椅', py: 'yǐ', tone: 3, en: 'chair' },
  { hz: '意', py: 'yì', tone: 4, en: 'meaning' },
  { hz: '书', py: 'shū', tone: 1, en: 'book' },
  { hz: '熟', py: 'shú', tone: 2, en: 'cooked; ripe' },
  { hz: '数', py: 'shǔ', tone: 3, en: 'to count' },
  { hz: '树', py: 'shù', tone: 4, en: 'tree' },
  { hz: '包', py: 'bāo', tone: 1, en: 'bag' },
  { hz: '薄', py: 'báo', tone: 2, en: 'thin' },
  { hz: '宝', py: 'bǎo', tone: 3, en: 'treasure' },
  { hz: '报', py: 'bào', tone: 4, en: 'newspaper' },
  { hz: '天', py: 'tiān', tone: 1, en: 'sky; day' },
  { hz: '人', py: 'rén', tone: 2, en: 'person' },
  { hz: '水', py: 'shuǐ', tone: 3, en: 'water' },
  { hz: '大', py: 'dà', tone: 4, en: 'big' },
  { hz: '好', py: 'hǎo', tone: 3, en: 'good' },
  { hz: '我', py: 'wǒ', tone: 3, en: 'I; me' },
  { hz: '你', py: 'nǐ', tone: 3, en: 'you' },
  { hz: '他', py: 'tā', tone: 1, en: 'he; him' },
  { hz: '吃', py: 'chī', tone: 1, en: 'to eat' },
  { hz: '喝', py: 'hē', tone: 1, en: 'to drink' },
  { hz: '看', py: 'kàn', tone: 4, en: 'to look' },
  { hz: '听', py: 'tīng', tone: 1, en: 'to listen' },
  { hz: '说', py: 'shuō', tone: 1, en: 'to speak' },
  { hz: '走', py: 'zǒu', tone: 3, en: 'to walk' },
  { hz: '跑', py: 'pǎo', tone: 3, en: 'to run' },
  { hz: '坐', py: 'zuò', tone: 4, en: 'to sit' },
  { hz: '站', py: 'zhàn', tone: 4, en: 'to stand' },
  { hz: '山', py: 'shān', tone: 1, en: 'mountain' },
  { hz: '河', py: 'hé', tone: 2, en: 'river' },
  { hz: '海', py: 'hǎi', tone: 3, en: 'sea' },
  { hz: '花', py: 'huā', tone: 1, en: 'flower' },
  { hz: '草', py: 'cǎo', tone: 3, en: 'grass' },
  { hz: '雨', py: 'yǔ', tone: 3, en: 'rain' },
  { hz: '雪', py: 'xuě', tone: 3, en: 'snow' },
  { hz: '风', py: 'fēng', tone: 1, en: 'wind' },
  { hz: '冷', py: 'lěng', tone: 3, en: 'cold' },
  { hz: '热', py: 'rè', tone: 4, en: 'hot' },
  { hz: '忙', py: 'máng', tone: 2, en: 'busy' },
  { hz: '累', py: 'lèi', tone: 4, en: 'tired' },
  { hz: '饿', py: 'è', tone: 4, en: 'hungry' },
  { hz: '渴', py: 'kě', tone: 3, en: 'thirsty' },
  { hz: '药', py: 'yào', tone: 4, en: 'medicine' },
  { hz: '疼', py: 'téng', tone: 2, en: 'to hurt' },
  { hz: '开', py: 'kāi', tone: 1, en: 'to open; to drive' },
  { hz: '去', py: 'qù', tone: 4, en: 'to go' },
  { hz: '来', py: 'lái', tone: 2, en: 'to come' },
  { hz: '买', py: 'mǎi', tone: 3, en: 'to buy' },
  { hz: '卖', py: 'mài', tone: 4, en: 'to sell' },
  { hz: '贵', py: 'guì', tone: 4, en: 'expensive' },
  { hz: '谁', py: 'shéi', tone: 2, en: 'who' },
  { hz: '男', py: 'nán', tone: 2, en: 'male' },
  { hz: '女', py: 'nǚ', tone: 3, en: 'female' }
];

window.MMS_MINIMAL_PAIRS = [
  { syllable: 'ma', items: [
    { hz: '妈', py: 'mā', tone: 1, en: 'mother' },
    { hz: '麻', py: 'má', tone: 2, en: 'numb' },
    { hz: '马', py: 'mǎ', tone: 3, en: 'horse' },
    { hz: '骂', py: 'mà', tone: 4, en: 'to scold' },
    { hz: '吗', py: 'ma', tone: 5, en: 'question particle' }
  ]},
  { syllable: 'shi', items: [
    { hz: '诗', py: 'shī', tone: 1, en: 'poem' },
    { hz: '十', py: 'shí', tone: 2, en: 'ten' },
    { hz: '史', py: 'shǐ', tone: 3, en: 'history' },
    { hz: '是', py: 'shì', tone: 4, en: 'to be' }
  ]},
  { syllable: 'shu', items: [
    { hz: '书', py: 'shū', tone: 1, en: 'book' },
    { hz: '熟', py: 'shú', tone: 2, en: 'cooked' },
    { hz: '数', py: 'shǔ', tone: 3, en: 'to count' },
    { hz: '树', py: 'shù', tone: 4, en: 'tree' }
  ]},
  { syllable: 'yi', items: [
    { hz: '一', py: 'yī', tone: 1, en: 'one' },
    { hz: '姨', py: 'yí', tone: 2, en: 'aunt' },
    { hz: '椅', py: 'yǐ', tone: 3, en: 'chair' },
    { hz: '意', py: 'yì', tone: 4, en: 'meaning' }
  ]},
  { syllable: 'bao', items: [
    { hz: '包', py: 'bāo', tone: 1, en: 'bag' },
    { hz: '薄', py: 'báo', tone: 2, en: 'thin' },
    { hz: '宝', py: 'bǎo', tone: 3, en: 'treasure' },
    { hz: '报', py: 'bào', tone: 4, en: 'newspaper' }
  ]}
];

/* ---------- 20 characters with numbered stroke paths (0–100 box) ----------
   Paths are simplified skeletons: they teach order and direction, not brush art.
   Stroke names follow the standard 笔画 names. */
(function () {
  var T = {
    pie: 'left-falling (撇)',
    na: 'right-falling (捺)',
    heng: 'horizontal (横)',
    shu: 'vertical (竖)',
    dian: 'dot (点)',
    ti: 'rising (提)',
    hengzhe: 'horizontal-turn (横折)',
    shuzhe: 'vertical-turn (竖折)',
    hengzhegou: 'horizontal-turn-hook (横折钩)',
    shugou: 'vertical-hook (竖钩)',
    shuwangou: 'vertical-curve-hook (竖弯钩)',
    piedian: 'falling-dot (撇点)',
    hengpie: 'horizontal-falling (横撇)'
  };
  function s(type, pts) { return { t: type, pts: pts }; }

  window.MMS_CHARS = [
    { hz: '人', py: 'rén', en: 'person', strokes: [
      s(T.pie, [[52, 20], [47, 38], [38, 58], [28, 80]]),
      s(T.na, [[52, 24], [58, 46], [68, 64], [76, 82]])
    ]},
    { hz: '大', py: 'dà', en: 'big', strokes: [
      s(T.heng, [[22, 36], [78, 36]]),
      s(T.pie, [[55, 18], [50, 38], [38, 60], [26, 82]]),
      s(T.na, [[52, 40], [60, 58], [70, 70], [78, 84]])
    ]},
    { hz: '小', py: 'xiǎo', en: 'small', strokes: [
      s(T.shugou, [[50, 20], [50, 70], [55, 76], [60, 70]]),
      s(T.pie, [[32, 38], [27, 50], [22, 64]]),
      s(T.dian, [[68, 38], [73, 50], [78, 64]])
    ]},
    { hz: '山', py: 'shān', en: 'mountain', strokes: [
      s(T.shu, [[50, 22], [50, 80]]),
      s(T.shuzhe, [[24, 34], [24, 80], [76, 80]]),
      s(T.shu, [[76, 42], [76, 80]])
    ]},
    { hz: '水', py: 'shuǐ', en: 'water', strokes: [
      s(T.shugou, [[50, 16], [50, 74], [56, 80], [61, 73]]),
      s(T.hengpie, [[30, 40], [45, 43], [38, 52], [30, 62]]),
      s(T.pie, [[44, 56], [36, 68], [26, 80]]),
      s(T.na, [[56, 46], [64, 60], [72, 72], [78, 82]])
    ]},
    { hz: '日', py: 'rì', en: 'sun; day', strokes: [
      s(T.shu, [[28, 24], [28, 78]]),
      s(T.hengzhe, [[28, 24], [73, 24], [73, 78]]),
      s(T.heng, [[28, 51], [73, 51]]),
      s(T.heng, [[28, 78], [73, 78]])
    ]},
    { hz: '月', py: 'yuè', en: 'moon; month', strokes: [
      s(T.pie, [[32, 20], [28, 38], [25, 60], [22, 80]]),
      s(T.hengzhegou, [[32, 20], [74, 20], [74, 76], [70, 82], [64, 78]]),
      s(T.heng, [[32, 44], [74, 44]]),
      s(T.heng, [[32, 60], [74, 60]])
    ]},
    { hz: '木', py: 'mù', en: 'tree; wood', strokes: [
      s(T.heng, [[24, 34], [76, 34]]),
      s(T.shu, [[50, 16], [50, 86]]),
      s(T.pie, [[50, 44], [42, 58], [32, 70], [22, 80]]),
      s(T.na, [[50, 44], [58, 58], [68, 70], [78, 82]])
    ]},
    { hz: '火', py: 'huǒ', en: 'fire', strokes: [
      s(T.dian, [[32, 24], [28, 32], [24, 40]]),
      s(T.pie, [[64, 22], [68, 30], [72, 40]]),
      s(T.pie, [[54, 40], [46, 54], [34, 68], [24, 82]]),
      s(T.na, [[52, 42], [60, 56], [70, 70], [78, 82]])
    ]},
    { hz: '土', py: 'tǔ', en: 'earth; soil', strokes: [
      s(T.heng, [[24, 28], [76, 28]]),
      s(T.shu, [[50, 28], [50, 80]]),
      s(T.heng, [[20, 80], [80, 80]])
    ]},
    { hz: '王', py: 'wáng', en: 'king', strokes: [
      s(T.heng, [[26, 24], [74, 24]]),
      s(T.heng, [[30, 48], [70, 48]]),
      s(T.shu, [[50, 24], [50, 78]]),
      s(T.heng, [[22, 78], [78, 78]])
    ]},
    { hz: '天', py: 'tiān', en: 'sky; day', strokes: [
      s(T.heng, [[27, 24], [73, 24]]),
      s(T.heng, [[22, 46], [78, 46]]),
      s(T.pie, [[52, 46], [44, 60], [33, 72], [23, 82]]),
      s(T.na, [[50, 48], [59, 62], [70, 74], [79, 84]])
    ]},
    { hz: '地', py: 'dì', en: 'earth; ground', strokes: [
      s(T.heng, [[16, 36], [44, 36]]),
      s(T.shu, [[30, 24], [30, 74]]),
      s(T.ti, [[16, 74], [30, 70], [46, 64]]),
      s(T.hengzhegou, [[52, 40], [74, 40], [74, 64], [70, 70], [64, 66]]),
      s(T.shu, [[58, 26], [58, 74]]),
      s(T.shuwangou, [[66, 50], [66, 74], [78, 80], [84, 72]])
    ]},
    { hz: '上', py: 'shàng', en: 'up; above', strokes: [
      s(T.shu, [[48, 22], [48, 80]]),
      s(T.heng, [[48, 50], [74, 50]]),
      s(T.heng, [[20, 80], [80, 80]])
    ]},
    { hz: '下', py: 'xià', en: 'down; below', strokes: [
      s(T.heng, [[20, 26], [80, 26]]),
      s(T.shu, [[50, 26], [50, 84]]),
      s(T.dian, [[54, 44], [60, 52], [64, 58]])
    ]},
    { hz: '中', py: 'zhōng', en: 'middle; in', strokes: [
      s(T.shu, [[50, 14], [50, 88]]),
      s(T.shu, [[28, 30], [28, 72]]),
      s(T.hengzhe, [[28, 30], [72, 30], [72, 72]]),
      s(T.heng, [[28, 72], [72, 72]])
    ]},
    { hz: '国', py: 'guó', en: 'country', strokes: [
      s(T.shu, [[20, 16], [20, 84]]),
      s(T.hengzhe, [[20, 16], [80, 16], [80, 84]]),
      s(T.heng, [[20, 84], [80, 84]]),
      s(T.heng, [[32, 34], [68, 34]]),
      s(T.heng, [[36, 48], [64, 48]]),
      s(T.shu, [[50, 34], [50, 64]]),
      s(T.heng, [[30, 64], [70, 64]]),
      s(T.dian, [[56, 54], [62, 60], [66, 64]])
    ]},
    { hz: '好', py: 'hǎo', en: 'good', strokes: [
      s(T.piedian, [[34, 26], [26, 40], [22, 50], [38, 58]]),
      s(T.pie, [[40, 26], [34, 42], [24, 58], [18, 68]]),
      s(T.ti, [[16, 64], [30, 60], [44, 54]]),
      s(T.hengpie, [[54, 30], [78, 30], [66, 44], [56, 54]]),
      s(T.shugou, [[64, 32], [64, 80], [58, 76]]),
      s(T.heng, [[46, 62], [84, 62]])
    ]},
    { hz: '学', py: 'xué', en: 'to study; learning', strokes: [
      s(T.dian, [[40, 17], [35, 25]]),
      s(T.dian, [[57, 16], [61, 24]]),
      s(T.pie, [[59, 22], [50, 29], [41, 34]]),
      s(T.dian, [[27, 38], [29, 45]]),
      s(T.hengpie, [[27, 42], [74, 42], [66, 51]]),
      s(T.hengpie, [[43, 54], [65, 54], [53, 66]]),
      s(T.shugou, [[56, 56], [56, 84], [50, 80]]),
      s(T.heng, [[27, 72], [81, 72]])
    ]},
    { hz: '生', py: 'shēng', en: 'to be born; life', strokes: [
      s(T.pie, [[36, 18], [30, 26], [24, 34]]),
      s(T.heng, [[28, 42], [72, 42]]),
      s(T.heng, [[24, 56], [76, 56]]),
      s(T.shu, [[50, 42], [50, 84]]),
      s(T.heng, [[18, 84], [82, 84]])
    ]}
  ];
})();
