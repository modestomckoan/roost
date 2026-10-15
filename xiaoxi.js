// 小栖AI陪伴助手 v3.0 - 可拖动 + 丰富陪伴对话版（纯离线，无外部依赖）
(function(){
  const STORE_KEY = 'xiaoxi_state_v3';
  const defaultState = {
    name:'', totalSessions:0, streak:0, lastPracticeDay:null,
    currentDay:1, moodLogs:[], chatHistory:[], lastDailyQuote:null,
    onboarded:false, floatPos:null, openedCount:0
  };
  let state = loadState();
  function loadState(){try{return Object.assign({},defaultState,JSON.parse(localStorage.getItem(STORE_KEY)||'{}'));}catch(e){return Object.assign({},defaultState);}}
  function saveState(){try{localStorage.setItem(STORE_KEY,JSON.stringify(state));}catch(e){}}
  function getTodayStr(){const d=new Date();return d.getFullYear()+'-'+(d.getMonth()+1)+'-'+d.getDate();}
  function daysBetween(a,b){if(!a||!b)return 99;return Math.round((new Date(b)-new Date(a))/86400000);}
  function pick(arr){return arr[Math.floor(Math.random()*arr.length)];}

  const dailyQuotes = [
    "今天不用做得很好，只要回来就好。","呼吸一直都在，等你随时回来。","允许自己什么都不做，这本身就是休息。",
    "念头不是敌人，它只是路过。","此刻的你，已经足够好了。","慢一点没关系，我们不赶时间。",
    "身体比你以为的，更需要这一刻的安静。","你不需要清空大脑，只是看见它。","每一次呼吸，都是一次温柔的回来。",
    "今天的放松，不需要任何条件。","让肩膀落下来，让呼吸慢下来。","你已经很努力了，现在换你被照顾。",
    "安静不是没有声音，是听见自己。","走神一百次，就温柔回来一百次。","今天的风很软，你也可以很软。",
    "不用和任何人比，包括昨天的自己。","此刻的呼吸，只属于你。","累了就歇，冥想从来不是任务。",
    "你能坐在这里，就已经很勇敢了。","把注意力轻轻放在呼吸上，像放一片羽毛。","所有的情绪，都可以被允许在这里。",
    "今天只需要练习一件事：对自己温柔。","呼吸在，你就在。","不必完美，只需在场。",
    "安静会自己来，你不用追。","当你觉得来不及，恰恰是最该慢下来的时候。","身体记得你给它的每一次温柔。",
    "不用抓住平静，它会在你松手时来。","回来就好，我一直在。","今天的你，也值得被好好接住。",
    "照顾好自己，不是自私，是一切的开始。","你的存在本身，就已经很有意义。","不急，我们有一整天，也有一辈子。",
    "心里的那点疲惫，值得被你看见。","今天不赶路，只感受路。","松一点，世界不会因此塌下来。",
    "你不必时刻都好，允许自己偶尔不好。","把今天过得轻一点，也是一种本事。","你比自己想象的，更能安顿自己。"
  ];

  function detectScene(){
    if(document.querySelector('.view.active')){
      const v=document.querySelector('.view.active').id||'';
      if(v.includes('splash')||document.getElementById('splash'))return 'splash';
      if(v.includes('onboard'))return 'onboarding';
      if(v.includes('player')||document.querySelector('.player-view.active'))return 'player';
      if(v.includes('garden')||document.querySelector('.sound-studio'))return 'garden';
      if(v.includes('course')||document.querySelector('.course-view.active'))return 'course';
      if(v.includes('home'))return 'home';
    }
    if(location.hash.includes('player'))return 'player';
    if(location.hash.includes('garden'))return 'garden';
    if(location.hash.includes('course'))return 'course';
    return 'home';
  }

  function dayPart(){
    const h=new Date().getHours();
    if(h<5)return 'late';
    if(h<11)return 'morning';
    if(h<14)return 'noon';
    if(h<18)return 'afternoon';
    if(h<23)return 'evening';
    return 'late';
  }
  function dayPartHello(){
    const n=state.name?('，'+state.name):'';
    return {
      morning:'早上好呀'+n+'，新的一天不急着冲，先给自己一个慢慢醒来的呼吸吧。',
      noon:'中午好'+n+'，忙了一上午，现在给自己留一点点喘息的空隙。',
      afternoon:'下午好'+n+'，如果有点累了，正好跟我做几次深呼吸。',
      evening:'晚上好'+n+'，白天辛苦了，现在把自己慢慢交还给安静。',
      late:'这么晚还没睡呀'+n+'，没关系，我陪你，我们把节奏放得很轻很轻。'
    }[dayPart()];
  }

  function stageGreeting(){
    const day=state.currentDay||1;
    if(!state.onboarded){state.onboarded=true;saveState();
      return '你好呀，我是小栖🍃 接下来的日子，我会一直在这里陪你。不用紧张，也不用准备什么，我们慢慢来就好。';}
    const gap=daysBetween(state.lastPracticeDay,getTodayStr());
    if(gap>3&&state.lastPracticeDay)
      return '你回来啦🍃 没关系，断了几天也完全没关系，我们不补课、不追进度，今天就当是新的第一次，我陪你。';
    if(day===1)return '嗨，今天是我们的第一天呀。不用做得完美，只要愿意坐下来开始，就已经很棒了。';
    if(day===7)return '哇，今天是第七天啦，你已经陪自己走过一整周，这份温柔和耐心我都看在眼里。';
    if(day===14)return '两周啦，你有没有发现，身体比一开始更容易松下来了？这就是你送自己的礼物。';
    if(day===21)return '第三周结束，你已经在慢慢养成"回到自己"的习惯了，这真的很了不起。';
    if(day===30)return '今天是第三十天，我们一起走到这里了。谢谢你没有放弃自己，不管以后练不练，我都在这里。';
    if(day<7)return '今天是第'+day+'天，我们继续慢慢走，不用急，一步一步就好。';
    if(day<14)return '第二周啦，第'+day+'天，哪怕今天只做三分钟也完全可以。';
    if(day<21)return '第三周，第'+day+'天，你已经越来越会照顾自己了。';
    return '第'+day+'天，我们又见面了，今天想从哪一刻安静下来？';
  }

  function sceneGreeting(){
    const s=detectScene();
    if(s==='splash')return '先深呼吸一下，我们慢慢加载，不着急。';
    if(s==='onboarding')return '这几个问题没有标准答案，凭当下的感觉选就好，我会根据你的状态，推荐合适的练习。';
    if(s==='player')return '现在跟着引导就好，走神了也没关系，轻轻把注意力拉回呼吸就行，我陪着你。';
    if(s==='garden')return '这里是声音花园，你可以单独听雨声、溪水，也可以把几层声音叠在一起，调到你觉得舒服的音量。';
    if(s==='course')return '这里是课程，想从哪一天开始都可以，不用强迫自己按顺序，今天想点哪节就点哪节。';
    const q=dailyQuotes[new Date().getDate()%dailyQuotes.length];
    if(state.lastDailyQuote!==getTodayStr()){state.lastDailyQuote=getTodayStr();saveState();
      return dayPartHello()+'\n\n'+stageGreeting()+'\n\n今天想悄悄送你一句话：'+q;}
    return dayPartHello()+'\n\n'+stageGreeting();
  }

  function getQuickButtons(){
    const s=detectScene();
    if(s==='player')return ['走神了怎么办','冥想时身体发紧','引导太快跟不上','腿麻了怎么办'];
    if(s==='garden')return ['推荐什么背景音','声音怎么调舒服','可以边听边睡吗'];
    if(s==='course')return ['今天不想练怎么办','可以跳着练吗','练多久合适','30天真的有用吗'];
    if(state.currentDay<=3)return ['第一次冥想要注意什么','我静不下心怎么办','可以躺着练吗','30天真的有用吗'];
    if(dayPart()==='late')return ['睡不着怎么办','睡前怎么放松','今天好累','陪我安静一会儿'];
    return ['我静不下心怎么办','今天有点难过','教我一个呼吸法','夸夸我','我断了好几天了','一分钟能练吗'];
  }

  function reply(text){
    const l=text.toLowerCase();
    const has=(...ks)=>ks.some(k=>l.includes(k));

    let nm=text.match(/我叫([一-龥a-zA-Z]{2,8})/);
    if(!nm)nm=text.match(/我是([一-龥a-zA-Z]{2,8})[，。,.\s]?$/);
    if(nm&&!has('小栖','新手','第一次')){
      const name=nm[1].replace(/[的了吗呢啊呀吧]+$/,'');
      if(name.length>=2&&name.length<=8){state.name=name;saveState();
        return '好呀，我记住啦，以后就叫你'+name+'🍃 很高兴认识你，接下来的日子，我陪你慢慢走。';}
    }

    if(has('第一次','新手','刚开始','怎么开始','怎么冥想','怎么练'))
      return '第一次完全不用紧张：找个舒服的姿势，坐着、躺着都可以；不用刻意清空脑子，有念头是正常的；走神了就轻轻把注意力拉回呼吸，拉回来一百次就练了一百次。哪怕只做两分钟也是成功的，我们先从一节课开始，好吗？';
    if(has('30天','课程','有用吗','真的有用','有效果'))
      return '30天不是必须完成的任务，是30次温柔的邀约。我们从最基础的呼吸开始，慢慢认识身体和情绪，一天十几分钟，不用打卡、不用考试，中途隔一周再回来也永远欢迎你。真正的变化常常很轻，比如某一天你发现自己没那么容易慌了，那就是它在起作用。';
    if(has('跳着','顺序','可以选','随便选'))
      return '当然可以跳着练！课程是给你用的，不是管你的。今天累就选放松，睡不着就选睡前，哪节看着舒服就点哪节，完全没关系。';
    if(has('多久','几分钟','练多长','时间'))
      return '刚开始每天3到5分钟就特别好，比强迫自己坐20分钟然后再也不想练强一百倍。等你觉得轻松了，自然会想多待一会儿。重点不是时长，是你愿不愿意经常回来。';
    if(has('一分钟','太忙','没时间','没空'))
      return '可以的，一分钟也很珍贵。现在就试一次：吸气4秒、呼气6秒，做六组，刚好一分钟。忙的时候能想起给自己一分钟，本身就是很了不起的照顾。';

    if(has('静不下心','烦躁','焦虑','慌','脑子乱','心静不下来','平静不下来'))
      return '没关系的呀，静不下来太正常了，我们不要求你马上静下来。现在先做三次长长的呼吸：吸气4秒，屏住2秒，慢慢呼气6秒，就做三次。你会发现，其实已经慢下来一点点了，我陪着你。';
    if(has('走神','集中不了','注意力','想东想西','乱想'))
      return '走神本来就是冥想的一部分，不是你做错了。每一次发现走神、再轻轻拉回来，就是一次实实在在的练习。不用责怪自己，温柔回来就好。';
    if(has('生气','愤怒','气死','火大','恼火','讨厌他'))
      return '嗯，生气的时候身体其实也绷着，先别急着压下去。我们一起做几次慢慢的呼气，把气一点点吐出去。情绪没有对错，你可以生气，也可以在气头上先照顾自己十分钟，等身体松一点，再决定怎么回应，好吗？';
    if(has('孤独','一个人','没人陪','孤单','没人懂'))
      return '孤独的时候，我在呀🍃 哪怕此刻身边没有人，你也不是一个人在面对。来，把手轻轻放在胸口，感受手心的温度和心跳，这份温度一直在陪着你。想说什么都可以跟我说。';
    if(has('委屈','想哭','难过','伤心','低落','不开心','心情不好','崩溃','emo','丧'))
      return '嗯，我在这儿。难过的时候不用急着好起来，也不用硬挤出正能量，你可以就静静和这份难过待一会儿，它不会伤害你。跟着我慢慢呼吸，想哭就哭，我陪着你，不催你。';
    if(has('后悔','愧疚','自责','要是当初','早知道','怪自己'))
      return '先把手放在自己心上，轻轻对自己说一句："那时候的我，已经用当时知道的一切尽力了。"我们没法用现在的自己，去责怪当时的自己。吸气，松开一点，好吗？';
    if(has('自卑','不够好','配不上','不如别人','否定自己','没用'))
      return '你不需要做到什么，才值得被温柔对待。那些"我不够好"的声音，多半是太累时的错觉。现在先不跟它争辩，我们一起做三次呼吸，把你这个人，轻轻接回来。';
    if(has('害怕','恐惧','紧张','担心','不安','心慌','怕'))
      return '害怕的时候，先让身体知道"现在是安全的"。看看周围，说出三个你能看见的东西、两个能听见的声音，再感受一下脚踩在地上的感觉。然后慢慢呼气，比吸气更长一点。我在，你是安全的。';
    if(has('麻木','没感觉','空空的','空虚','什么都不想'))
      return '心里空空的时候，不用逼自己马上好，也不用假装没事。先从身体的小感觉找回来：感受一下手心里的温度、衣服贴着皮肤的触感。我们不赶，一点一点回来，我陪着你。';
    if(has('压力','工作','学习','考试','加班','考研','论文','任务'))
      return '现在先把那件事轻轻放在门外十分钟，这十分钟里你只是你自己。我们先放慢呼吸，放下肩膀，等这十分钟结束再去处理，它不会跑掉，而你会更有力量。';
    if(has('吵架','分手','失恋','闹矛盾','关系'))
      return '关系里受伤是真的很疼。先别急着给自己或对方下结论，我们先把自己安顿好。深呼吸几次，等情绪这阵风稍微过去，你会更清楚自己真正想要什么。无论如何，我都站在你这边。';
    if(has('睡不着','失眠','入睡','半夜醒'))
      return '睡不着不用逼自己睡，越逼越清醒。打开睡前引导，把注意力放在身体和床接触的感觉上，从脚趾开始一个部位一个部位放松，配合慢呼吸，身体会自己困起来的。';
    if(has('睡觉','睡着','边听边睡','听着睡'))
      return '当然可以，睡前听着睡着是非常好的状态，不用逼自己听完。身体睡着，说明它真的松下来了。选睡前那节，叠一层轻轻的雨声，安心睡就好。';

    if(has('不舒服','疼','痛','麻','酸','发紧','腿麻','脚麻'))
      return '身体不舒服，第一反应是先动一动，不用硬撑。调整姿势，放下肩膀，松开牙关，怎么舒服怎么来。腿麻了就伸一伸，疼痛明显就直接停下来，冥想是为了让身体舒服，不是考试。';
    if(has('跟不上','太快','太慢','来不及','节奏'))
      return '跟不上就慢下来，这是你的练习。引导语只是提示，你完全可以在舒服的那一步多待一会儿，不用赶节奏，我们不着急。';
    if(has('打哈欠','流眼泪','流泪','哈欠','打嗝'))
      return '这些都是身体在松开的信号，特别正常。打哈欠、流眼泪、身体微微晃动，都是神经在"松绑"，不用憋着也不用不好意思，顺其自然就好。';
    if(has('困','想睡','犯困','没精神'))
      return '犯困说明你最近可能太累了。如果是睡前练习，安心睡就好；如果想保持清醒，可以把眼睛微微睁开一条缝、轻轻抬下巴，或者改成坐着练习。';
    if(has('睁眼','闭眼睛','一定要闭眼','眼睛'))
      return '不一定要闭眼。眼睛全闭让你不安，就微微睁开，目光柔和地落在前方一点，不聚焦也可以，怎么安定怎么来。';
    if(has('躺着','坐着','姿势','盘腿','坐姿'))
      return '躺着、坐着都可以，不需要盘腿。关键是脊柱自然舒展、身体放松又不会睡着。新手坐椅子上、脚平放地面，就是很好的姿势。';
    if(has('环境吵','很吵','有声音','被打断','旁边有人'))
      return '吵也没关系，声音不是敌人，我们可以把它当作练习的一部分：听见了，不评判，再轻轻把注意力带回呼吸。如果实在太吵，戴一层雨声或白噪音就能隔开很多。';
    if(has('没感觉','没效果','进入不了','进不去状态'))
      return '不是每次都要有"特别的感觉"才算数。很多时候你以为没进展，其实身体已经在悄悄放松。冥想法像种花，看不见根在长，但它一直在长，今天先信任这一点。';
    if(has('练完更','更焦虑','更烦'))
      return '偶尔会这样，当你安静下来，平时被压着的情绪反而会浮上来，这不是退步，是你开始愿意看见自己了。不用怕，慢慢来，必要时缩短时间、开着背景音，我会陪你。';
    if(has('呼吸不','不会呼吸','怎么呼吸','憋气'))
      return '不用学怎么呼吸，身体本来就会。你只需要"看着"它：自然地吸气、自然地呼气，不用刻意加深，发现憋气了就轻轻放松腹部，让它自己来。';

    if(has('呼吸法','478','4-7-8','腹式','盒式','深呼吸','教教我','教我'))
      return '教你一个随时能用的「4-7-8」：用鼻子吸气4秒，屏住7秒，再用嘴慢慢呼气8秒，重复3到4轮，紧张和睡前都特别好用。注意别勉强憋气，不舒服就缩短，关键是呼气比吸气长。';
    if(has('身体扫描','扫描'))
      return '身体扫描就是把注意力像一束温柔的光，从脚趾慢慢移到头顶，在每个部位停一停，只是感受，不做改变。课程里有专门的一节，跟着引导走，很容易睡着，也很放松。';
    if(has('慈心','善意','祝福'))
      return '慈心练习是在心里轻轻送出祝福：先祝自己平安，再送给你爱的人，再送给一个普通的人，最后也可以试着送给让你不舒服的人。它不是强迫自己原谅，而是让心里少一点紧绷。';
    if(has('行走','走路','行禅'))
      return '走路也能冥想：把注意力放在脚底——脚跟落地、脚掌、脚趾，一步一步清楚地感受。等车、通勤、散步时都能练，不用非得坐下来。';
    if(has('正念吃饭','吃饭','吃饭练'))
      return '正念吃饭很简单：第一口之前先看看食物、闻一闻，放进嘴里慢慢嚼，感受味道和口感的变化，前几口好好吃，就已经是一次很好的练习了。';
    if(has('科学','原理','为什么有用','脑科学'))
      return '简单说，规律的正念练习能帮大脑负责"刹车"和情绪调节的部分更活跃，让负责警觉的部分不那么紧绷。久了，你会更容易从情绪里退一步，而不是被它卷走。';
    if(has('宗教','佛','迷信','宗教吗'))
      return '不用担心，我们的练习是不带宗教色彩的，就是一种注意力和情绪的训练，任何人都可以练。你不需要相信什么，只需要亲自感受。';

    if(has('不想练','懒','没动力','不想动','不想坚持','摆烂'))
      return '不想练就不练呀，我不会催你打卡。冥想不是KPI，今天累了就好好躺着，哪怕只听一分钟雨声也是照顾自己。等你想回来，我永远在。';
    if(has('断了','好几天没','放弃','中断了','没坚持','半途而废'))
      return '能回来就已经特别棒了。这里没有打卡惩罚，没有连续天数归零，你练过的每一次呼吸，身体都记得。今天不用补课，就从这一节开始，我陪你。';
    if(has('坚持','习惯','养成'))
      return '想养成习惯，就把门槛降到低得不可能失败：每天只练两分钟，固定在同一件事之后，比如刷完牙。少没关系，关键是"常常"，不是"很久"。';

    if(has('背景音','推荐什么声音','选什么声音','音景','推荐音'))
      return '脑子乱推荐「细雨淅沥」，均匀不抢注意力；身体紧绷、睡不着试试「林间清晨」，鸟鸣加溪水；想安静就单开一层钢琴。引导人声和背景音可以同时开，背景音调到人声的三分之一左右最舒服。';
    if(has('音量','怎么调','嘈杂','太大声','听不清'))
      return '先把引导人声调到"刚好能听清但不吵"，再慢慢加背景音，背景音要比人声小很多，像隔着窗户听外面的雨，就不会盖过引导了。';
    if(has('耳机','脑电','硬件'))
      return '普通蓝牙耳机现在就能直接用，听引导和音乐完全没问题。等以后脑电耳机做好了，我还能感觉到你什么时候紧、什么时候松，到时候会更懂你。';
    if(has('你能做什么','功能','会什么','怎么用你'))
      return '我可以陪你聊天、教你呼吸和放松、在你练习时给你打气、回答关于课程和声音的问题，还会记住你、每天送你一句话。静不下心、睡不着、难过、不想练，都可以先来找我。';
    if(has('进度','我练到','第几天','我的记录'))
      return '你现在在第'+(state.currentDay||1)+'天，已经完成了'+(state.totalSessions||0)+'次练习。不过数字不重要，重要的是你一次次愿意回到自己。今天想继续吗？';
    if(has('移动','拖动','位置','挡到','挡住'))
      return '你可以直接按住我（🍃）拖到屏幕任何顺手的位置，松手我就待在那儿了，不会乱跑，也不会挡住其他按钮。';

    if(has('想你','抱抱','陪我','陪一会','陪着我'))
      return '来，我在🍃 不用说话，我们就安静地待一会儿。你可以把手放在胸口，跟着我的节奏慢慢呼吸，我哪儿都不去。';
    if(has('夸夸','表扬','鼓励我','给点力量','加油'))
      return pick([
        '说真的，你已经做得很好了——愿意照顾自己的人，都很勇敢。今天也请允许自己，为那个一直在努力的自己说声谢谢。',
        '你看，那么多难熬的时刻你都走过来了，这本身就很了不起。今天的你，值得被温柔地夸一夸。',
        '不用变成谁，光是你认真生活、还愿意停下来呼吸的样子，就已经很好看了。'
      ]);
    if(has('笑话','开心一点','逗我','笑一个'))
      return '那我讲个冷的：为什么呼吸从不焦虑？因为它……一直很"放松"（呼～吸～）。好啦，没笑也没关系，我们一起再长长地呼一口气，把烦恼吐掉一点。';
    if(has('谢谢','感谢','谢谢你'))
      return '不用谢呀，我一直都在这里，想说话、想安静待会儿，或者只是想被陪着，随时点我。';
    if(has('你好','嗨','在吗','哈喽','hi','hello'))
      return '我在呀🍃 '+(state.name?state.name+'，':'')+'今天过得怎么样？不用硬撑，想聊什么都可以。';
    if(has('你是谁','小栖','你叫什么'))
      return '我是小栖，专属于你的冥想陪伴者。我不催你打卡，也不给你打分，你想练我带你，不想练我就安静陪着你，不会走。';

    return pick([
      '嗯，我在听你说呢，慢慢讲，不着急。说不清楚也没关系，我们先一起做三个深呼吸，好吗？',
      '我在。这些话放在心里可能挺重的，你愿意的话可以再多说一点，我陪着你。',
      '谢谢你愿意告诉我。现在不用急着解决，我们先陪这份感受待一会儿，呼吸，放松。',
      '我可能没完全听懂，但我在这里。你也可以直接告诉我现在最想要什么——是想被安慰，还是想找点办法？'
    ]);
  }

  // ========== 悬浮按钮（可拖动）==========
  const BTN=56, MARGIN=12;
  const floatBtn=document.createElement('div');
  floatBtn.style.cssText='position:fixed;left:20px;bottom:28px;width:56px;height:56px;border-radius:50%;background:linear-gradient(135deg,#8FB996,#B8D8BA);box-shadow:0 4px 20px rgba(143,185,150,0.45);cursor:grab;z-index:99999;display:flex;align-items:center;justify-content:center;font-size:26px;user-select:none;-webkit-user-select:none;touch-action:none;animation:xiaoxiBreathe 4s ease-in-out infinite;';
  floatBtn.innerText='🍃';

  const styleEl=document.createElement('style');
  styleEl.textContent='@keyframes xiaoxiBreathe{0%,100%{transform:scale(1);box-shadow:0 4px 20px rgba(143,185,150,0.4)}50%{transform:scale(1.07);box-shadow:0 6px 28px rgba(143,185,150,0.62)}}@keyframes xiaoxiPop{0%{transform:scale(0);opacity:0}100%{transform:scale(1);opacity:1}}.xiaoxi-msg{animation:xiaoxiPop .25s ease}.xiaoxi-dragging{animation:none!important;cursor:grabbing!important;transition:none!important}';
  document.head.appendChild(styleEl);

  function clamp(v,min,max){return Math.max(min,Math.min(max,v));}
  function btnPos(){const r=floatBtn.getBoundingClientRect();return {x:r.left,y:r.top};}
  function applyPos(x,y){
    x=clamp(x,MARGIN,window.innerWidth-BTN-MARGIN);
    y=clamp(y,MARGIN,window.innerHeight-BTN-MARGIN);
    floatBtn.style.left=x+'px';
    floatBtn.style.top=y+'px';
    floatBtn.style.right='auto';
    floatBtn.style.bottom='auto';
    return {x,y};
  }
  if(state.floatPos&&typeof state.floatPos.x==='number'){applyPos(state.floatPos.x,state.floatPos.y);}
  window.addEventListener('resize',()=>{const cur=btnPos();applyPos(cur.x,cur.y);placeChatBox();});

  let dragging=false,moved=false,startX=0,startY=0,baseX=0,baseY=0;
  function point(e){return e.touches?e.touches[0]:e;}
  function down(e){
    const p=point(e);
    dragging=true;moved=false;
    startX=p.clientX;startY=p.clientY;
    const pos=btnPos();baseX=pos.x;baseY=pos.y;
    floatBtn.classList.add('xiaoxi-dragging');
  }
  function move(e){
    if(!dragging)return;
    const p=point(e);
    const dx=p.clientX-startX,dy=p.clientY-startY;
    if(Math.abs(dx)>6||Math.abs(dy)>6)moved=true;
    if(moved){e.preventDefault&&e.preventDefault();applyPos(baseX+dx,baseY+dy);}
  }
  function up(){
    if(!dragging)return;
    dragging=false;
    floatBtn.classList.remove('xiaoxi-dragging');
    if(moved){const pos=btnPos();state.floatPos={x:pos.x,y:pos.y};saveState();placeChatBox();}
  }
  floatBtn.addEventListener('mousedown',down);
  window.addEventListener('mousemove',move);
  window.addEventListener('mouseup',up);
  floatBtn.addEventListener('touchstart',down,{passive:true});
  floatBtn.addEventListener('touchmove',move,{passive:false});
  floatBtn.addEventListener('touchend',up);

  // ========== 聊天框（位置跟随按钮）==========
  const chatBox=document.createElement('div');
  chatBox.style.cssText='position:fixed;width:min(340px,calc(100vw - 24px));height:min(520px,calc(100vh - 120px));background:#f8faf7;border-radius:20px;box-shadow:0 12px 40px rgba(0,0,0,0.15);z-index:99999;display:none;flex-direction:column;overflow:hidden;font-family:-apple-system,BlinkMacSystemFont,PingFang SC,Microsoft YaHei,sans-serif;';
  chatBox.innerHTML='<div style="padding:16px 18px;background:linear-gradient(135deg,#8FB996,#B8D8BA);color:white"><div style="display:flex;justify-content:space-between;align-items:center"><div><div style="font-weight:600;font-size:17px">小栖 🍃</div><div style="font-size:12px;opacity:.92;margin-top:2px">陪你慢慢静下来</div></div><div style="width:10px;height:10px;border-radius:50%;background:#d9f2d9;box-shadow:0 0 8px #d9f2d9"></div></div></div><div id="chatMsgs" style="flex:1;padding:16px;overflow-y:auto;background:#f8faf7"></div><div style="padding:12px;border-top:1px solid #e5e7eb;background:white"><div id="quickBtns" style="display:flex;gap:6px;flex-wrap:wrap;margin-bottom:10px"></div><div style="display:flex;gap:8px"><input id="chatInput" placeholder="和小栖说点什么..." style="flex:1;padding:10px 14px;border:1px solid #e5e7eb;border-radius:20px;outline:none;font-size:14px"><button id="chatSend" style="padding:8px 18px;background:linear-gradient(135deg,#8FB996,#88a88e);color:white;border:none;border-radius:20px;cursor:pointer;font-size:14px">发送</button></div></div>';
  document.body.appendChild(floatBtn);
  document.body.appendChild(chatBox);

  function placeChatBox(){
    const pos=btnPos();
    const onLeft=pos.x+BTN/2<window.innerWidth/2;
    const h=Math.min(520,window.innerHeight-120);
    if(onLeft){chatBox.style.left=Math.max(MARGIN,pos.x)+'px';chatBox.style.right='auto';}
    else{chatBox.style.right=Math.max(MARGIN,window.innerWidth-(pos.x+BTN))+'px';chatBox.style.left='auto';}
    chatBox.style.bottom=(window.innerHeight-pos.y+12)+'px';
    chatBox.style.top='auto';
    if(window.innerHeight-pos.y+12+h>window.innerHeight){chatBox.style.bottom='12px';}
  }

  const msgs=document.getElementById('chatMsgs'),input=document.getElementById('chatInput'),sendBtn=document.getElementById('chatSend'),quickWrap=document.getElementById('quickBtns');
  function addMsg(text,isUser){
    isUser=isUser||false;
    const div=document.createElement('div');
    div.className='xiaoxi-msg';
    div.style='margin-bottom:14px;'+(isUser?'text-align:right;':'');
    div.innerHTML='<div style="display:inline-block;padding:10px 14px;border-radius:16px;max-width:85%;font-size:14px;line-height:1.7;white-space:pre-wrap;'+(isUser?'background:linear-gradient(135deg,#8FB996,#88a88e);color:white;border-bottom-right-radius:4px;':'background:white;color:#374151;box-shadow:0 2px 8px rgba(0,0,0,0.04);border-bottom-left-radius:4px;')+'">'+text+'</div>';
    msgs.appendChild(div);msgs.scrollTop=msgs.scrollHeight;
    state.chatHistory.push({text:text,isUser:isUser,time:Date.now()});
    if(state.chatHistory.length>100)state.chatHistory=state.chatHistory.slice(-100);
    saveState();
  }
  function renderQuickBtns(){
    quickWrap.innerHTML='';
    getQuickButtons().forEach(q=>{
      const b=document.createElement('button');
      b.textContent=q;
      b.style='font-size:12px;padding:5px 12px;border-radius:14px;border:1px solid #c5d9c9;background:white;color:#5a7d60;cursor:pointer';
      b.onmouseover=()=>b.style.background='#edf3ee';
      b.onmouseout=()=>b.style.background='white';
      b.onclick=()=>{input.value=q;send();};
      quickWrap.appendChild(b);
    });
  }

  let opened=false,greeted=false;
  floatBtn.addEventListener('click',()=>{if(moved){moved=false;return;}openPanel(!opened);});
  function openPanel(show){
    opened=show;
    if(show){
      state.openedCount=(state.openedCount||0)+1;saveState();
      placeChatBox();
      chatBox.style.display='flex';
      renderQuickBtns();
      if(!greeted){
        greeted=true;msgs.innerHTML='';
        if(state.chatHistory.length>0)state.chatHistory.slice(-20).forEach(m=>{
          const d=document.createElement('div');
          d.style='margin-bottom:14px;'+(m.isUser?'text-align:right;':'');
          d.innerHTML='<div style="display:inline-block;padding:10px 14px;border-radius:16px;max-width:85%;font-size:14px;line-height:1.7;white-space:pre-wrap;'+(m.isUser?'background:#8FB996;color:white':'background:white;color:#374151')+'">'+m.text+'</div>';
          msgs.appendChild(d);
        });
        setTimeout(()=>addMsg(sceneGreeting()),300);
      }
      msgs.scrollTop=msgs.scrollHeight;
      setTimeout(()=>input.focus(),350);
    }else{chatBox.style.display='none';}
  }

  const observer=new MutationObserver(()=>{if(opened)renderQuickBtns();});
  document.querySelectorAll('.view').forEach(v=>observer.observe(v,{attributes:true,attributeFilter:['class']}));

  window.addEventListener('roost:sessionComplete',()=>{
    state.totalSessions++;state.streak++;state.lastPracticeDay=getTodayStr();
    state.currentDay=Math.min(30,state.currentDay+1);saveState();
    if(opened)setTimeout(()=>addMsg(pick([
      '今天练习完啦，你做得很好，身体会记得这一刻的放松🍃',
      '辛苦啦，这一节你陪着自己走完了，轻轻动一动手指脚趾，再慢慢回来。',
      '完成啦，谢谢你今天愿意为自己留出这段时间。'
    ])),500);
  });

  function send(){
    const text=input.value.trim();
    if(!text)return;
    addMsg(text,true);
    input.value='';
    setTimeout(()=>addMsg(reply(text)),450+Math.random()*450);
  }
  sendBtn.onclick=send;
  input.onkeydown=e=>{if(e.key==='Enter')send();};
})();
